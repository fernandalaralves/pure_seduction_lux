/**
 * Seeds the database with an initial admin user, categories, sample products
 * (matching the ones shown in the Figma admin mockup) and store settings.
 * Run with: npm run seed
 * Safe to run multiple times - it only creates records that don't exist yet.
 */
const { sequelize, Admin, Category, Product, StoreSettings } = require('./models');
const config = require('./config/env');
const { slugify } = require('./utils/normalizeText');
const { hashPassword } = require('./utils/password');

async function seedAdmin() {
  const existing = await Admin.findOne({ where: { email: config.seedAdmin.email } });
  if (existing) {
    console.log(`[seed] Admin já existe: ${config.seedAdmin.email}`);
    return;
  }
  const password_hash = await hashPassword(config.seedAdmin.password);
  await Admin.create({ name: config.seedAdmin.name, email: config.seedAdmin.email, password_hash });
  console.log(`[seed] Admin criado: ${config.seedAdmin.email} (troque a senha após o primeiro login!)`);
}

async function seedSettings() {
  await StoreSettings.findOrCreate({
    where: { id: 1 },
    defaults: {
      id: 1,
      store_name: config.store.name,
      store_phone: config.store.phone,
      store_whatsapp: config.store.whatsapp,
      municipality_city: config.store.municipalityCity,
      municipality_state: config.store.municipalityState,
      delivery_fee: config.store.deliveryFee,
    },
  });
  console.log('[seed] Configurações da loja prontas.');
}

async function seedCategories() {
  const names = ['Conjuntos', 'Lingeries', 'Calcinhas', 'Acessórios', 'Pijamas'];
  const categories = {};
  for (const name of names) {
    const [category] = await Category.findOrCreate({
      where: { slug: slugify(name) },
      defaults: { name, slug: slugify(name) },
    });
    categories[name] = category;
  }
  console.log('[seed] Categorias prontas.');
  return categories;
}

async function seedProducts(categories) {
  const products = [
    {
      name: 'Conjunto Paixão',
      variant_description: 'Renda Vinho',
      color: 'Vinho',
      available_sizes: ['P', 'M', 'G'],
      price: 129.9,
      stock: 15,
      category: categories['Conjuntos'],
      description: 'Conjunto de renda em tom vinho, sutiã e calcinha com acabamento delicado.',
    },
    {
      name: 'Conjunto Desejo',
      variant_description: 'Renda Preto',
      color: 'Preto',
      available_sizes: ['P', 'M', 'G'],
      price: 119.9,
      stock: 8,
      category: categories['Conjuntos'],
      description: 'Conjunto clássico em renda preta, elegante e sedutor.',
    },
    {
      name: 'Conjunto Seduction',
      variant_description: 'Renda Pink',
      color: 'Pink',
      available_sizes: ['P', 'M', 'G', 'GG'],
      price: 129.9,
      stock: 12,
      category: categories['Conjuntos'],
      description: 'Conjunto vibrante em renda pink, para quem gosta de ousar.',
    },
    {
      name: 'Conjunto Pure White',
      variant_description: 'Renda Branco',
      color: 'Branco',
      available_sizes: ['P', 'M', 'G'],
      price: 119.9,
      stock: 10,
      category: categories['Conjuntos'],
      description: 'Conjunto romântico em renda branca.',
    },
    {
      name: 'Pijama Luxury',
      variant_description: 'Short Doll Preto',
      color: 'Preto',
      available_sizes: ['P', 'M', 'G'],
      price: 159.9,
      stock: 6,
      status: 'inactive',
      category: categories['Pijamas'],
      description: 'Short doll em cetim com robe, conforto e sofisticação.',
    },
  ];

  for (const p of products) {
    const slug = slugify(p.name);
    const existing = await Product.findOne({ where: { slug } });
    if (existing) continue;
    await Product.create({
      name: p.name,
      slug,
      variant_description: p.variant_description,
      color: p.color,
      available_sizes: p.available_sizes,
      description: p.description,
      category_id: p.category ? p.category.id : null,
      price: p.price,
      stock: p.stock,
      status: p.status || 'active',
    });
  }
  console.log('[seed] Produtos de exemplo prontos.');
}

async function run() {
  await sequelize.authenticate();
  await sequelize.sync();
  await seedAdmin();
  await seedSettings();
  const categories = await seedCategories();
  await seedProducts(categories);
  console.log('[seed] Concluído.');
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed] Erro:', err);
  process.exit(1);
});
