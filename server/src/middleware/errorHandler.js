export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, _next) {
  console.error(error);

  if (error.name === 'ZodError') {
    const errors = error.errors.map((item) => ({
      field: item.path.join('.'),
      message: item.message
    }));

    return res.status(400).json({
      message: errors[0]?.message || 'Check the information you entered and try again.',
      errors
    });
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || error.keyValue || {})[0];
    const labels = { email: 'email address', username: 'username' };
    const label = labels[field] || field;
    const message = label
      ? `An account with that ${label} already exists.`
      : 'That value is already in use.';

    return res.status(409).json({ message, field });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'The requested item ID is invalid.' });
  }

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ message: 'The request body contains invalid JSON.' });
  }

  const status = error.status || error.statusCode || 500;
  const isServerError = status >= 500;

  return res.status(status).json({
    message: isServerError && !error.expose
      ? 'Something went wrong on our end. Please try again.'
      : error.message || 'The request could not be completed.'
  });
}
