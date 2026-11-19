const { Category } = require('../models');
const { asyncHandler } = require('../middlewares/errorHandler');
const { slugify } = require('../utils/normalizeText');

const list = asyncHandler(async (req, res) => {
  const categories = await Category.findAll({ order: [['name', 'ASC']] });
  res.json({ categories });
});

const create = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome da categoria é obrigatório.' });

  // A imagem chega em req.file (por causa do .single('image'))
  // O Cloudinary retorna a URL completa em file.path
  const imageUrl = req.file ? req.file.path : null;

  const category = await Category.create({ 
    name, 
    slug: slugify(name),
    image_url: imageUrl // Salvando a URL da imagem
  });
  
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

  // Se uma nova imagem foi enviada, atualiza a URL
  if (req.file) {
    category.image_url = req.file.path;
  }

  await category.save();
  res.json({ category });
});

const remove = asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ error: 'Categoria não encontrada.' });
  await category.destroy();
  res.json({ message: 'Categoria removida.' });
});

module.exports = { list, create, update, remove };