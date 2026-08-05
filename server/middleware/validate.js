/**
 * middleware/validate.js - Input validation for animal query parameters
 * Runs before route handlers to reject malformed requests at the API boundary.
 * Prevents invalid values from reaching the database layer.
 */

const validateQuery = (req, res, next) => {
  const { rescueType, page, pageSize } = req.query;

  const allowed = ['water', 'mountain', 'disaster', 'reset'];

  if (rescueType && !allowed.includes(rescueType)) {
    return res.status(400).json({ error: 'Invalid rescue type' });
  }

  if (page !== undefined && (isNaN(page) || parseInt(page) < 0)) {
    return res.status(400).json({ error: 'Invalid page number' });
  }

  if (pageSize !== undefined) {
    const ps = parseInt(pageSize);
    if (isNaN(ps) || ps < 1 || ps > 100) {
      return res.status(400).json({ error: 'pageSize must be between 1 and 100' });
    }
  }

  next();
};

module.exports = { validateQuery };