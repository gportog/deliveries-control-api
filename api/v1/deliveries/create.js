const DBClient = require('../../lib/DBClient');
const HTTPstatusCodes = require('../../lib/HTTPstatusCodes');
const ErrorMessages = require('../../lib/ErrorMessages');

const dbInstance = new DBClient('deliveries');

module.exports = (req, res, next) => {
    if (typeof req.body.deliveryman !== 'string') {
        let err = new Error(ErrorMessages.TYPE_MISMATCH_ERROR('deliveryman', 'string', typeof req.body.deliveryman));
        err.status = HTTPstatusCodes.BAD_REQUEST;
        return next(err);
    }
    if (!req.body.date || new Date(req.body.date) == 'Invalid Date' || req.body.date.search('[0-9]{4}-[0-9]{2}-[0-9]{2}') !== 0) {
        let err = new Error(ErrorMessages.TYPE_MISMATCH_ERROR('date', 'date(YYYY-MM-DD)', new Date(req.body.date)));
        err.status = HTTPstatusCodes.BAD_REQUEST;
        return next(err);
    }
    if (!Number.isInteger(req.body.total) || req.body.total < 0) {
        let err = new Error(ErrorMessages.TYPE_MISMATCH_ERROR('total', 'positive integer', typeof req.body.total));
        err.status = HTTPstatusCodes.BAD_REQUEST;
        return next(err);
    }

    let deliveryEntry = {
        deliveryman: req.body.deliveryman,
        date: req.body.date,
        total: req.body.total
    }

    dbInstance.search({
        selector: {
            deliveryman: req.body.deliveryman,
            date: req.body.date
        }
    })
        .then((resp) => {
            if (resp.docs.length !== 0) throw new Error(ErrorMessages.DB_DOC_DATA_CONFLICT());
            return dbInstance.insert(deliveryEntry)
        })
        .then((resp) => {
            return res.status(HTTPstatusCodes.OK).json({
                success: true,
                message: "The delivery was successfuly uploaded into the system",
                data: resp
            })
        })
        .catch((err) => {
            if (err.message === ErrorMessages.DB_DOC_DATA_CONFLICT()) {
                err.status = HTTPstatusCodes.CONFLICT;
            } else {
                err = new Error(ErrorMessages.INTERNAL_SERVER_ERROR());
            }
            return next(err)
        })
};