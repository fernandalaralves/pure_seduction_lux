const { normalizeText } = require('../utils/normalizeText');
const { StoreSettings } = require('../models');
const defaultConfig = require('../config/env').store;

let cachedSettings = null;

/**
 * Loads the (singleton) store settings row, creating it with sensible
 * defaults from the environment on first run.
 */
async function getStoreSettings({ fresh = false } = {}) {
  if (cachedSettings && !fresh) return cachedSettings;

  const [settings] = await StoreSettings.findOrCreate({
    where: { id: 1 },
    defaults: {
      id: 1,
      store_name: defaultConfig.name,
      store_phone: defaultConfig.phone,
      store_whatsapp: defaultConfig.whatsapp,
      municipality_city: defaultConfig.municipalityCity,
      municipality_state: defaultConfig.municipalityState,
      delivery_fee: defaultConfig.deliveryFee,
    },
  });

  cachedSettings = settings;
  return settings;
}

function invalidateCache() {
  cachedSettings = null;
}

/**
 * Delivery is only allowed when the address city AND state match the
 * store's configured municipality. Comparison is accent/case-insensitive.
 */
async function isAddressInDeliveryZone(address) {
  const settings = await getStoreSettings();
  const cityMatches = normalizeText(address.city) === normalizeText(settings.municipality_city);
  const stateMatches = normalizeText(address.state) === normalizeText(settings.municipality_state);
  return cityMatches && stateMatches;
}

module.exports = { getStoreSettings, invalidateCache, isAddressInDeliveryZone };
