const DBClient = require('../../lib/DBClient');
const HTTPstatusCodes = require('../../lib/HTTPstatusCodes');
const ErrorMessages = require('../../lib/ErrorMessages');

const dbInstance = new DBClient('deliveries');

module.exports = (req, res, next) => {
    if (new Date(req.params.date_from) == 'Invalid Date' || req.params.date_from.search('[0-9]{4}-[0-9]{2}-[0-9]{2}') !== 0) {
        let err = new Error(ErrorMessages.TYPE_MISMATCH_ERROR('date_from', 'date(YYYY-MM-DD)', new Date(req.params.date_from)));
        err.status = HTTPstatusCodes.BAD_REQUEST;
        return next(err);
    }
    if (new Date(req.params.date_to) == 'Invalid Date' || req.params.date_to.search('[0-9]{4}-[0-9]{2}-[0-9]{2}') !== 0) {
        let err = new Error(ErrorMessages.TYPE_MISMATCH_ERROR('date_to', 'date(YYYY-MM-DD)', new Date(req.params.date_to)));
        err.status = HTTPstatusCodes.BAD_REQUEST;
        return next(err);
    }
    if (new Date(req.params.date_from) > new Date(req.params.date_to)) {
        let err = new Error(ErrorMessages.VALUE_MISMATCH_ERROR('date_from', 'less than date_to', req.params.date_from));
        err.status = HTTPstatusCodes.BAD_REQUEST;
        return next(err);
    }

    dbInstance.search({
        selector: {
            deliveryman: req.params.deliveryman,
            date: {
                $gte: req.params.date_from,
                $lte: req.params.date_to
            }
        }
    })
        .then((resp) => {
            if (resp.docs.length === 0) throw new Error(ErrorMessages.DATA_NOT_FOUND());
            return res.status(HTTPstatusCodes.OK).json({
                success: true,
                message: "The deliveries was successfuly retrieved.",
                data: resp
            })
        })
        .catch((err) => {
            if (err.message === ErrorMessages.DATA_NOT_FOUND()) {
                err.status = HTTPstatusCodes.NOT_FOUND;
            } else {
                err = new Error(ErrorMessages.INTERNAL_SERVER_ERROR());
            }
            return next(err)
        })
};