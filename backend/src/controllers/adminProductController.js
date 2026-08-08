const { Op } = require('sequelize');
const { Product, Category, ProductImage, sequelize } = require('../models');
const { asyncHandler } = require('../middlewares/errorHandler');
const { slugify } = require('../utils/normalizeText');

const ADMIN_INCLUDE = [
  { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
  { model: ProductImage, as: 'images', attributes: ['id', 'url', 'position'] },
];

const SORT_OPTIONS = {
  recentes: [['createdAt', 'DESC']],
  'preco-asc': [['price', 'ASC']],
  'preco-desc': [['price', 'DESC']],
  'nome-asc': [['name', 'ASC']],
  estoque: [['stock', 'ASC']],
};

async function uniqueSlug(name, excludeId = null) {
  const base = slugify(name);
  let candidate = base;
  let suffix = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const where = { slug: candidate };
    if (excludeId) where.id = { [Op.ne]: excludeId };
    const existing = await Product.findOne({ where });
    if (!existing) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

// GET /api/admin/products - list ALL products (active + inactive) with search/sort/filter
const list = asyncHandler(async (req, res) => {
  const { search, status, category, sort } = req.query;
  const where = {};

  if (search) where.name = { [Op.iLike]: `%${search}%` };
  if (status && status !== 'todos') where.status = status;
  if (category) where.category_id = category;

  const products = await Product.findAll({
    where,
    include: ADMIN_INCLUDE,
    order: SORT_OPTIONS[sort] || SORT_OPTIONS.recentes,
  });

  res.json({ products });
});

const getById = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id, { include: ADMIN_INCLUDE });
  if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });
  res.json({ product });
});

// POST /api/admin/products
const create = asyncHandler(async (req, res) => {
  const {
    name,
    variant_description,
    color,
    available_sizes,
    description,
    category_id,
    price,
    stock,
    sku,
    status,
  } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Nome e preço são obrigatórios.' });
  }

  const result = await sequelize.transaction(async (t) => {
    const slug = await uniqueSlug(name);

    const product = await Product.create(
      {
        name,
        slug,
        variant_description,
        color,
        available_sizes: Array.isArray(available_sizes)
          ? available_sizes
          : typeof available_sizes === 'string' && available_sizes.length
          ? available_sizes.split(',').map((s) => s.trim())
          : [],
        description,
        category_id: category_id || null,
        price,
        stock: stock ?? 0,
        sku: sku || null,
        status: status || 'active',
      },
      { transaction: t }
    );

    const files = req.files || [];
    if (files.length) {
      await ProductImage.bulkCreate(
        files.map((file, index) => ({
          product_id: product.id,
          url: `/uploads/products/${file.filename}`,
          position: index,
        })),
        { transaction: t }
      );
      product.cover_image_url = `/uploads/products/${files[0].filename}`;
      await product.save({ transaction: t });
    }

    return product;
  });

  const full = await Product.findByPk(result.id, { include: ADMIN_INCLUDE });
  res.status(201).json({ product: full });
});

// PUT /api/admin/products/:id
const update = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });

  const {
    name,
    variant_description,
    color,
    available_sizes,
    description,
    category_id,
    price,
    stock,
    sku,
    status,
  } = req.body;

  if (name && name !== product.name) {
    product.slug = await uniqueSlug(name, product.id);
    product.name = name;
  }
  if (variant_description !== undefined) product.variant_description = variant_description;
  if (color !== undefined) product.color = color;
  if (available_sizes !== undefined) {
    product.available_sizes = Array.isArray(available_sizes)
      ? available_sizes
      : available_sizes.split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (description !== undefined) product.description = description;
  if (category_id !== undefined) product.category_id = category_id || null;
  if (price !== undefined) product.price = price;
  if (stock !== undefined) product.stock = stock;
  if (sku !== undefined) product.sku = sku;
  if (status !== undefined) product.status = status;

  await product.save();

  const files = req.files || [];
  if (files.length) {
    const existingCount = await ProductImage.count({ where: { product_id: product.id } });
    await ProductImage.bulkCreate(
      files.map((file, index) => ({
        product_id: product.id,
        url: `/uploads/products/${file.filename}`,
        position: existingCount + index,
      }))
    );
    if (!product.cover_image_url) {
      product.cover_image_url = `/uploads/products/${files[0].filename}`;
      await product.save();
    }
  }

  const full = await Product.findByPk(product.id, { include: ADMIN_INCLUDE });
  res.json({ product: full });
});

// PATCH /api/admin/products/:id/status - quick toggle ATIVO/INATIVO
const updateStatus = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });

  const { status } = req.body;
  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ error: 'Status inválido.' });
  }

  product.status = status;
  await product.save();
  res.json({ product });
});

// DELETE /api/admin/products/:id
const remove = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });

  await product.destroy();
  res.json({ message: 'Produto removido com sucesso.' });
});

const removeImage = asyncHandler(async (req, res) => {
  const image = await ProductImage.findOne({
    where: { id: req.params.imageId, product_id: req.params.id },
  });
  if (!image) return res.status(404).json({ error: 'Imagem não encontrada.' });
  await image.destroy();
  res.json({ message: 'Imagem removida.' });
});

module.exports = { list, getById, create, update, updateStatus, remove, removeImage };
