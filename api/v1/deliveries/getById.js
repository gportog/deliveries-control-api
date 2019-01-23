const DBClient = require('../../lib/DBClient');
const HTTPstatusCodes = require('../../lib/HTTPstatusCodes');
const ErrorMessages = require('../../lib/ErrorMessages');

const dbInstance = new DBClient('deliveries');

module.exports = (req, res, next) => {
    dbInstance.getById(req.params.id)
        .then((resp) => {
            res.status(HTTPstatusCodes.OK).json({
                    success: true,
                    message: "The delivery was successfuly retrieved.",
                    data: resp
                })
        })
        .catch((err) => {
            console.log(err.message);
            if (err.message === 'missing') {
                err = new Error(ErrorMessages.DB_DOC_NOT_FOUND(req.params.id));
                err.status = HTTPstatusCodes.NOT_FOUND;
            } else {
                err = new Error(ErrorMessages.INTERNAL_SERVER_ERROR());
            }
            return next(err)
        })
};