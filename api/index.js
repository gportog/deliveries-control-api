const routes = require('express').Router();
const v1 = require('./v1');

const HTTPstatusCodes = require('./lib/HTTPstatusCodes');
const ErrorMessages = require('./lib/ErrorMessages');

routes.use('/v1', v1);
// Later on we may have other API versions, that will be added here.

// Error Handler for API
routes.use(function (err, req, res, next) {
    return res.status(err.status || HTTPstatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: err.message
    });
});

module.exports = routes;