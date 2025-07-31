export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Anthropic API errors
  if (err.response?.status) {
    status = err.response.status;
    message = err.response.data?.error?.message || message;
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation Error';
  }

  res.status(status).json({
    error: {
      message,
      status,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};