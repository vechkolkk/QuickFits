export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

export function errorHandler(error, req, res, _next) {
  console.error(error);

  if (error.name === 'ZodError') {
    return res.status(400).json({
      message: 'Validation failed',
      errors: error.errors.map((item) => item.message)
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: 'Duplicate value already exists' });
  }

  res.status(error.status || 500).json({
    message: error.message || 'Server error'
  });
}
