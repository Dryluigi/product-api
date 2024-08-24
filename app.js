var path = require('path')

require('dotenv').config({ path: path.join(__dirname, ".env") })
require('./database/connection')

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var productsRouter = require('./routes/products');
const { logErrorMiddleware, validationErrorHandler, defaultErrorHandler } = require('./error/handlers');

var app = express();

if (process.env.ENVIRONMENT === 'dev') {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Products API',
        version: '1.0.0',
        description: 'A simple Express Products API',
      },
    },
    apis: ['./routes/*.js'],
  };
  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', productsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(logErrorMiddleware)
app.use(validationErrorHandler)
app.use(defaultErrorHandler);

module.exports = app;
