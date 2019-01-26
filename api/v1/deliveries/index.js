const create = require('./create');
const getByDate = require('./getByDate');
const getById = require('./getById');
const update = require('./update');

const deliveries = require('express').Router();

deliveries.get('/:id', getById);
deliveries.get('/:date_from/:date_to', getByDate);
deliveries.post('/', create);
deliveries.put('/:_id/', update);

module.exports = deliveries;

