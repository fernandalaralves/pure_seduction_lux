const { ValidationError } = require('sequelize');
const upload = require('./upload');

// Central error handler - keeps controllers free of repetitive try/catch
// boilerplate for known error shapes, and never leaks stack traces to clients.
function errorHandler(err, req, res, _next) {
  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: 'Dados inválidos.',
      details: err.errors.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ error: 'Já existe um registro com esses dados.' });
  }

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: `Imagem muito grande. O tamanho máximo por foto é ${upload.MAX_FILE_SIZE_MB}MB.`,
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Você pode enviar no máximo 6 fotos por produto.' });
    }
    return res.status(400).json({ error: `Erro no upload de imagem: ${err.message}` });
  }
  if (/Formato de imagem inválido/.test(err.message || '')) {
    return res.status(400).json({ error: `Erro no upload de imagem: ${err.message}` });
  }

  const status = err.status || 500;
  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({
    error: status >= 500 ? 'Erro interno do servidor.' : err.message || 'Erro na requisição.',
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Rota não encontrada.' });
}

/** Wraps an async route handler so rejected promises reach errorHandler. */
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { errorHandler, notFoundHandler, asyncHandler };
