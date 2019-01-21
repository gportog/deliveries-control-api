module.exports.TYPE_MISMATCH_ERROR = function(parameter, expected, received) {
    return `Wrong type for parameter ${parameter}. Received ${received}, expected ${expected}`;
}

module.exports.MISSING_FIELD_ERROR = function(field) {
    return `Missing field "${field}"`;
}

module.exports.DB_CONNECT_ERROR = () => 'Error connecting to the database, check logs for details.';

module.exports.NO_DB_ERROR = () => 'This client has no default databaset set, and one was not provided.';

module.exports.DB_DOC_NOT_FOUND = function(id) {
    return `The requested document '${id}' does not exist in the database`;
}

module.exports.DB_DOC_DATA_CONFLICT = () => 'Data already on the database.';

module.exports.DB_DOC_INVALID_REV = function(id) {
    return `Wrong 'rev' parameter for '${id}'.`;
}

module.exports.DATA_NOT_FOUND = () => 'Data not found.';

module.exports.INTERNAL_SERVER_ERROR = () => 'The server encountered an error and could not complete ' +
                                              'your request. Please try again later.';