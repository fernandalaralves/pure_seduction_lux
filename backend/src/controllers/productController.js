const { Op } = require('sequelize');
const { Product, Category, ProductImage } = require('../models');
const { asyncHandler } = require('../middlewares/errorHandler');

const PUBLIC_INCLUDE = [
  { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
  { model: ProductImage, as: 'images', attributes: ['id', 'url', 'position'] },
];

const SORT_OPTIONS = {
  recentes: [['createdAt', 'DESC']],
  'preco-asc': [['price', 'ASC']],
  'preco-desc': [['price', 'DESC']],
  'nome-asc': [['name', 'ASC']],
};

// GET /api/products - public storefront catalog, only shows active products
const list = asyncHandler(async (req, res) => {
  const { search, category, sort } = req.query;
  const where = { status: 'active' };

  if (search) {
    where.name = { [Op.iLike]: `%${search}%` };
  }
  if (category) {
    const cat = await Category.findOne({ where: { slug: category } });
    where.category_id = cat ? cat.id : null;
  }

  const products = await Product.findAll({
    where,
    include: PUBLIC_INCLUDE,
    order: SORT_OPTIONS[sort] || SORT_OPTIONS.recentes,
  });

  res.json({ products });
});

// GET /api/products/:slug
const getBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    where: { slug: req.params.slug, status: 'active' },
    include: PUBLIC_INCLUDE,
  });
  if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });
  res.json({ product });
});

// GET /api/products/featured - used for the "Destaques" carousel on the homepage
const featured = asyncHandler(async (req, res) => {
  const products = await Product.findAll({
    where: { status: 'active' },
    include: PUBLIC_INCLUDE,
    order: [['createdAt', 'DESC']],
    limit: 8,
  });
  res.json({ products });
});

module.exports = { list, getBySlug, featured };
