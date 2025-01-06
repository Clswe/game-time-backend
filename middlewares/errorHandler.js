function errorHandler(err, req, res, next) {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Erro de validação!', 
      errors: err.errors 
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      message: 'Não autorizado!' 
    });
  }

  res.status(500).json({ 
    message: 'Ocorreu um erro inesperado!', 
    error: err.message 
  });
}

module.exports = errorHandler;
