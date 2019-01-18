const routes = require('express').Router();
const deliveries = require('./deliveries');

routes.use('/deliveries', deliveries);

module.exports = routes;