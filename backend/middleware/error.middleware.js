import {handleCastErrorDB,handleDuplicateFieldsDB,handleValidationErrorDB} from './../utils/dbErrorHandler.js'
import env from "../config/config.js"

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message
    res.status(err.statusCode).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

const ErrorMiddleware = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (env.NODE_ENV === 'production') {
    let error = { ...err };

    if (error.name === 'CastError')
      error = handleCastErrorDB(error);
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
  }
};

export default ErrorMiddleware
