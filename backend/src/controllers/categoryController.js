const fs = require('fs');
const path = require('path');
const { Category, Product } = require('../models');
const { asyncHandler } = require('../middlewares/errorHandler');
const { slugify } = require('../utils/normalizeText');

function deleteImageFile(imageUrl) {
  if (!imageUrl) return;
  const filePath = path.join(__dirname, '..', '..', imageUrl.replace(/^\//, ''));
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      // eslint-disable-next-line no-console
      console.error('Falha ao remover imagem de categoria:', err.message);
    }
  });
}

const list = asyncHandler(async (req, res) => {
  const categories = await Category.findAll({ order: [['name', 'ASC']] });
  res.json({ categories });
});


const create = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome da categoria é obrigatório.' });

  const image_url = req.file ? `/uploads/categories/${req.file.filename}` : null;
  const category = await Category.create({ name, slug: slugify(name), image_url });
  res.status(201).json({ category });
});

const update = asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ error: 'Categoria não encontrada.' });

  const { name } = req.body;
  if (name) {
    category.name = name;
    category.slug = slugify(name);
  }

  if (req.file) {
    const oldImageUrl = category.image_url;
    category.image_url = `/uploads/categories/${req.file.filename}`;
    if (oldImageUrl) deleteImageFile(oldImageUrl);
  }

  await category.save();
  res.json({ category });
});


const remove = asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ error: 'Categoria não encontrada.' });

  await Product.update({ category_id: null }, { where: { category_id: category.id } });
  deleteImageFile(category.image_url);
  await category.destroy();

  res.json({ message: 'Categoria removida.' });
});

module.exports = { list, create, update, remove };
