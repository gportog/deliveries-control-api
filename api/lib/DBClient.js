const Cloudant = require('@cloudant/cloudant');

const user = process.env.CLOUDANT_USER;
const pw = process.env.CLOUDANT_PW;

const errorMessages = require('./ErrorMessages');

function DBClient(db) {
    if (db && typeof db !== 'string')
        throw new Error("DBClient db parameter must be of type string, " +
            `${typeof db} received.`);
    this._db = db || null;
    this._client = Cloudant({
        account: user, password: pw,
        maxAttempt: 20, plugins:
            { retry: { retryErrors: true, retryStatusCodes: [429] } }
    });
}

DBClient.prototype.getById = function (id, options) {
    if (typeof id !== 'string')
        throw new Error(errorMessages.TYPE_MISMATCH_ERROR('id', 'string', typeof id));
    validateDB(this, options)
    const db = this._db || options.db;
    return new Promise((res, rej) => {
        const database = this._client.db.use(db);
        database.get(id, function (err, body) {
            if (err) return rej(err);
            return res(body);
        });
    });
}

DBClient.prototype.search = function (obj, options) {
    if (!obj || typeof obj !== 'object')
        throw new Error("Search function parameter must be a valid object, " +
            `${typeof obj} received.`);
    if (typeof obj.selector !== 'object')
        throw new Error("selector_param must be a valid object, " +
            `${typeof obj.selector} received.`);
    if (!obj.fields || obj.fields && !Array.isArray(obj.fields))
        obj.fields = [];
    validateDB(this, options)
    const db = this._db || options.db;
    return new Promise((res, rej) => {
        let database = this._client.db.use(db);
        let bookmarkVal = obj.bookmark || null;
        let limitVal = 100;
        database.find({
            selector:
                obj.selector,
            fields:
                obj.fields,
            limit: limitVal, // max limit is 200,
            execution_stats: true,
            bookmark: bookmarkVal
        }, (err, result) => {
            if (err) return rej(err);
            if (result.docs.length <= 0) return res({ docs: [], bookmark: null });
            if (result.execution_stats.results_returned === limitVal) return res({ docs: result.docs, bookmark: result.bookmark });
            return res({ docs: result.docs, bookmark: null })
        })
    })
}

DBClient.prototype.insert = function (doc, options) {
    if (!doc || typeof doc !== 'object')
        throw new Error(`'doc' parameter must be a valid object, ` +
            `${typeof doc} received.`);
    validateDB(this, options)
    const db = this._db || options.db;
    return new Promise((res, rej) => {
        const database = this._client.db.use(db);
        database.insert(doc, (err, body, header) => {
            if (err) return rej(err);
            if (body.ok) {
                doc._id = body.id;
                doc._rev = body.rev;
                return res(doc);
            } else return rej(body);
        });
    });
}

DBClient.prototype.update = function (doc, options) {
    return this.insert(doc, options);
}

module.exports = DBClient;

function validateDB(instance, options) {
    if (!instance._db) {
        if (!(options && options.db))
            throw new Error('This client has no default databaset set, and one was not provided.');
        if (typeof options.db !== 'string')
            throw new Error(`Wrong type for parameter 'db'. Received ` + typeof options.db
                + `, expected 'string'`);
    }
}
