const { asyncHandler } = require('../middlewares/errorHandler');
const { getStoreSettings, invalidateCache } = require('../services/deliveryZoneService');

// GET /api/settings - public info the storefront needs (delivery zone message,
// contact info, delivery fee) - no sensitive data.
const getPublic = asyncHandler(async (req, res) => {
  const s = await getStoreSettings();
  res.json({
    settings: {
      store_name: s.store_name,
      store_phone: s.store_phone,
      store_whatsapp: s.store_whatsapp,
      store_address: s.store_address,
      municipality_city: s.municipality_city,
      municipality_state: s.municipality_state,
      delivery_fee: s.delivery_fee,
      is_store_locked: s.is_store_locked || false,
    },
  });
});

// GET /api/admin/settings
const getAdmin = asyncHandler(async (req, res) => {
  const settings = await getStoreSettings({ fresh: true });
  res.json({ settings });
});

// PUT /api/admin/settings
const update = asyncHandler(async (req, res) => {
  const settings = await getStoreSettings({ fresh: true });
  const {
    store_name,
    store_phone,
    store_whatsapp,
    store_address,
    municipality_city,
    municipality_state,
    delivery_fee,
  } = req.body;

  if (store_name !== undefined) settings.store_name = store_name;
  if (store_phone !== undefined) settings.store_phone = store_phone;
  if (store_whatsapp !== undefined) settings.store_whatsapp = store_whatsapp;
  if (store_address !== undefined) settings.store_address = store_address;
  if (municipality_city !== undefined) settings.municipality_city = municipality_city;
  if (municipality_state !== undefined) settings.municipality_state = municipality_state;
  if (delivery_fee !== undefined) settings.delivery_fee = delivery_fee;

  await settings.save();
  invalidateCache();
  res.json({ settings });
});

module.exports = { getPublic, getAdmin, update };
