/**
 * Normalizes text for tolerant comparisons: lower-cases, trims, collapses
 * whitespace, and strips accents (so "Boa Viagem", "boa viagem", "BOA  VIAGEM"
 * and "Boa Viágem" are all treated as equal).
 */
function normalizeText(value) {
  if (value === null || value === undefined) return '';
  return value
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function slugify(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

module.exports = { normalizeText, slugify };
