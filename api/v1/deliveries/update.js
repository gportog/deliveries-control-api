const DBClient = require('../../lib/DBClient');
const HTTPstatusCodes = require('../../lib/HTTPstatusCodes');
const ErrorMessages = require('../../lib/ErrorMessages');

const dbInstance = new DBClient('deliveries');

module.exports = (req, res, next) => {

    if (!Number.isInteger(req.body.total) || req.body.total < 0) {
        let err = new Error(ErrorMessages.TYPE_MISMATCH_ERROR('total', 'positive integer', typeof req.body.total));
        err.status = HTTPstatusCodes.BAD_REQUEST;
        return next(err);
    }

    let deliveryEntry = {
        _id: req.params._id,
        total: req.body.total
    }

    dbInstance.getById(req.params._id)
        .then((resp) => {
            deliveryEntry._rev = resp._rev;
            deliveryEntry.deliveryman = resp.deliveryman;
            deliveryEntry.date = resp.date;
            return dbInstance.update(deliveryEntry)
        })
        .then((resp) => {
            return res.status(HTTPstatusCodes.OK).json({
                success: true,
                message: "The delivery was successfuly edited into the system.",
                data: resp
            })
        })
        .catch((err) => {
            if (err.message === 'missing') {
                err = new Error(ErrorMessages.DB_DOC_NOT_FOUND(req.params._id));
                err.status = HTTPstatusCodes.NOT_FOUND;
            }
            else {
                err = new Error(ErrorMessages.INTERNAL_SERVER_ERROR());
            }
            return next(err)
        })
};