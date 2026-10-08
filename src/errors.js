function createError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function errorHandler(error, _request, response, _next) {
  if (error.name === 'ZodError') {
    return response.status(400).json({ error: 'Dados inválidos.' });
  }

  if (error.code === 11000) {
    return response.status(409).json({ error: 'Este e-mail já está cadastrado.' });
  }

  const status = error.status || 500;
  const message = status === 500 ? 'Erro interno do servidor.' : error.message;
  return response.status(status).json({ error: message });
}

module.exports = { createError, errorHandler };
