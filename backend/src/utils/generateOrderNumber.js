/**
 * Generates a human-friendly, sortable order number, e.g. "PSL-20260801-4F2A".
 * Not guaranteed unique on its own; callers should rely on the DB unique
 * constraint on orders.order_number and retry on the rare collision.
 */
function generateOrderNumber() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PSL-${datePart}-${randomPart}`;
}

module.exports = generateOrderNumber;
