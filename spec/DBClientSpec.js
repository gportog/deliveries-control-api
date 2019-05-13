require('dotenv').config();

const Cloudant = require('@cloudant/cloudant');
const jasmine = require('jasmine');

const DBClient = require('../api/lib/DBClient');
const errorMessages = require('../api/lib/ErrorMessages');

const jasmineTimeout = 20000;

describe('DBClient tests setup', () => {

    /**
     * Setup:
     */

    beforeAll(() => {
        const user = process.env.CLOUDANT_USER;
        const pw = process.env.CLOUDANT_PW;
        this.date = new Date();
        this._client = Cloudant({ account: user, password: pw, plugins: 'promises' });
        this.dbInstance = new DBClient('deliveries-test');
        this.deliveryEntry = {
            _id: 'test',
            deliveryman: 'test@email.com',
            date: `${this.date.getFullYear()}-${this.date.getMonth() + 1}-${this.date.getDate()}`,
            total: 10
        }
    });

    beforeEach(async () => {
        await this._client.db.create('deliveries-test');
        let listDbs = await this._client.db.list();
        expect(listDbs.includes('deliveries-test')).toBe(true);
        let database = this._client.db.use('deliveries-test');
        let delivery = await database.insert(this.deliveryEntry);
        expect(delivery.ok).toBe(true);
        let checkMenu = await database.get(delivery.id);
        delete checkMenu._rev;
        delete checkMenu.statusCode;
        expect(checkMenu).toEqual(this.deliveryEntry);
    }, jasmineTimeout)

    afterEach(async () => {
        await this._client.db.destroy('deliveries-test');
        let listDbs = await this._client.db.list();
        expect(listDbs.includes('deliveries-test')).toBe(false);
    }, jasmineTimeout);

    /**
     * Specs:
     */

    describe('DBClient constructor', () => {
        it('should throw an error when db param is different than undefined/string', () => {
            expect(function () { new DBClient(1); })
                .toThrowError('DBClient db parameter must be of type string, number received.');
        });
        it('should have a null value for _db when db param is empty', () => {
            let dbInstance = new DBClient();
            expect(dbInstance._db).toBeNull();
            expect(typeof dbInstance._client).toBe('object');
        });
        it('should have a string value for _db when db param is string', () => {
            expect(typeof this.dbInstance._db).toBe('string');
            expect(typeof this.dbInstance._client).toBe('object');
        });
    })

    describe('DBClient.getById', () => {
        it('should throw a NO_DB_ERROR when not initiating the constructor db param and trying to get the database without using the options.db param', () => {
            let dbInstance = new DBClient();
            let _id = 'test';
            expect(function () { dbInstance.getById(_id); })
                .toThrowError('This client has no default databaset set, and one was not provided.');
        });
        it('should throw a TYPE_MISMATCH_ERROR error when id param is different than string', async () => {
            let errMessage;
            try {
                deliveryEntry = await this.dbInstance.getById(1);
            } catch (err) {
                errMessage = err.message;
            }
            expect(errMessage).toBe(errorMessages.TYPE_MISMATCH_ERROR('id', 'string', typeof 1));
        });
        it('should have a valid deliveryEntry object when passed a valid id and a valid db', async () => {
            let _id = 'test';
            let delivery = await this.dbInstance.getById(_id);
            delete delivery._rev;
            expect(delivery).toEqual(this.deliveryEntry);
        }, jasmineTimeout);
        it('should have a valid deliveryEntry object when passed a valid id and a valid db, using db opt', async () => {
            let _id = 'test';
            let dbInstance = new DBClient();
            let delivery = await dbInstance.getById(_id, { db: 'deliveries-test' });
            delete delivery._rev;
            expect(delivery).toEqual(this.deliveryEntry);
        }, jasmineTimeout);
        it('should throw a TYPE_MISMATCH_ERROR error when passed a valid id and a valid db, using wrong type for db opt', async () => {
            let _id = 'test';
            let dbInstance = new DBClient();
            try {
                await dbInstance.getById(_id, { db: 1 });
            } catch (err) {
                errMessage = err.message;
            }
            expect(errMessage).toBe(`Wrong type for parameter 'db'. Received number, expected 'string'`);
        }, jasmineTimeout);
        it('should throw an error when a non existing ID is passed', async () => {
            let errMessage;
            let _id = 'non-existing-id';
            try {
                await this.dbInstance.getById(_id);
            } catch (err) {
                errMessage = err.message;
            }
            expect(errMessage).toBe('missing');
        }, jasmineTimeout);
    })

    describe('DBClient.search', () => {
        it('should throw a error when obj param is different than object', async () => {
            let errMessage;
            try {
                await this.dbInstance.search(1);
            } catch (err) {
                errMessage = err.message
            }
            expect(errMessage).toBe('Search function parameter must be a valid object, number received.')
        })
        it('should throw a error when obj.selector param is different than object', async () => {
            let errMessage;
            try {
                await this.dbInstance.search({ selector: 1 });
            } catch (err) {
                errMessage = err.message
            }
            expect(errMessage).toBe('selector_param must be a valid object, number received.')
        })
        it('should have a deliveryEntries object-array when passed a correct date range and a valid db', async () => {
            let date = new Date();
            date.setDate(date.getDate() + 90);
            let deliveryEntries = await this.dbInstance.search({
                selector: {
                    deliveryman: 'test@email.com',
                    date: {
                        $gte: `${this.date.getFullYear()}-${this.date.getMonth() + 1}-${this.date.getDate()}`,
                        $lte: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
                    }
                }
            })
            expect(deliveryEntries.docs.length).toBeGreaterThanOrEqual(1);
        }, jasmineTimeout)
        it('should have a deliveryEntries object-array when passed a correct date range and a valid opt.db', async () => {
            let date = new Date();
            let dbInstance = new DBClient();
            date.setDate(date.getDate() + 90);
            let deliveryEntries = await dbInstance.search({
                selector: {
                    deliveryman: 'test@email.com',
                    date: {
                        $gte: `${this.date.getFullYear()}-${this.date.getMonth() + 1}-${this.date.getDate()}`,
                        $lte: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
                    }
                }
            }, { db: 'deliveries-test' })
            expect(deliveryEntries.docs.length).toBeGreaterThanOrEqual(1);
        }, jasmineTimeout)
        it('should have a deliveryEntries object-array when passed a correct date range and a valid db, fixing the incorrect fields parameter', async () => {
            let date = new Date();
            date.setDate(date.getDate() + 90);
            let deliveryEntries = await this.dbInstance.search({
                selector: {
                    deliveryman: 'test@email.com',
                    date: {
                        $gte: `${this.date.getFullYear()}-${this.date.getMonth() + 1}-${this.date.getDate()}`,
                        $lte: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
                    }
                },
                fields: 'test'
            })
            expect(deliveryEntries.docs.length).toBeGreaterThanOrEqual(1);
        }, jasmineTimeout)
        it('should have a string deliveryEntry bookmark when passed an object and a valid db', async () => {
            let date = new Date();
            let deliveryEntry = {
                deliveryman: 'test@email.com',
                total: 20
            }
            for (let i = 1; i <= 150; i++) {
                date.setDate(date.getDate() + 1);
                deliveryEntry.date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                let delivery = await this.dbInstance.insert(deliveryEntry);
                delete delivery._id;
                delete delivery._rev;
                expect(delivery).toEqual(deliveryEntry);
            }
            let deliveryEntries = await this.dbInstance.search({
                selector: {
                    deliveryman: 'test@email.com'
                }
            })
            expect(deliveryEntries.docs.length).toBeGreaterThanOrEqual(100);
            expect(typeof deliveryEntries.bookmark).toBe('string');
        }, jasmineTimeout * 5);
        it('should have an empty deliveryEntries object-array when passed an incorrect date range and a valid db', async () => {
            let date = new Date();
            date.setDate(date.getDate() - 90);
            let deliveryEntries = await this.dbInstance.search({
                selector: {
                    deliveryman: 'test@email.com',
                    date: {
                        $gte: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
                        $lte: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
                    }
                }
            })
            expect(deliveryEntries.docs.length).toEqual(0);
        })
        it('should throw an error when searching a deliveryEntry on a non existing db', async () => {
            let errMessage;
            let date = new Date();
            date.setDate(date.getDate() + 90);
            let dbInstance = new DBClient('non-existing-db');
            try {
                await dbInstance.search({
                    selector: {
                        deliveryman: 'test@email.com',
                        date: {
                            $gte: `${this.date.getFullYear()}-${this.date.getMonth() + 1}-${this.date.getDate()}`,
                            $lte: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
                        }
                    }
                });
            } catch (err) {
                errMessage = err.message;
            }
            expect(errMessage).toEqual('Database does not exist.');
        }, jasmineTimeout)
    })

    describe('DBClient.insert', () => {
        it('should throw a error when obj param is different than object', async () => {
            let errMessage;
            try {
                await this.dbInstance.insert(1);
            } catch (err) {
                errMessage = err.message
            }
            expect(errMessage).toBe(`'doc' parameter must be a valid object, number received.`)
        })
        it('should have a valid deliveryEntry object when passed an object and a valid db', async () => {
            let date = new Date();
            date.setDate(date.getDate() + 1);
            let deliveryEntry = {
                deliveryman: 'test@email.com',
                date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
                total: 20
            }
            let delivery = await this.dbInstance.insert(deliveryEntry);
            delete delivery._id;
            delete delivery._rev;
            expect(delivery).toEqual(deliveryEntry);
        }, jasmineTimeout);
        it('should have a valid deliveryEntry object when passed an object and a valid db passed in the db opt', async () => {
            let date = new Date();
            date.setDate(date.getDate() + 1);
            let dbInstance = new DBClient();
            let deliveryEntry = {
                deliveryman: 'test@email.com',
                date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
                total: 20
            }
            let delivery = await dbInstance.insert(deliveryEntry, { db: 'deliveries-test' });
            delete delivery._id;
            delete delivery._rev;
            expect(delivery).toEqual(deliveryEntry);
        }, jasmineTimeout);
        it('should throw an error when registering a deliveryEntry on a non existing db', async () => {
            let errMessage;
            let date = new Date();
            date.setDate(date.getDate() + 1);
            let dbInstance = new DBClient('non-existing-db');
            let deliveryEntry = {
                deliveryman: 'test@email.com',
                date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
                total: 20
            }
            try {
                await dbInstance.insert(deliveryEntry, { db: 'deliveries-test' });
            } catch (err) {
                errMessage = err.message;
            }
            expect(errMessage).toEqual('Database does not exist.');
        }, jasmineTimeout)
    })

    describe('DBClient.update', () => {
        it('should throw a error when obj param is different than object', async () => {
            let errMessage;
            try {
                await this.dbInstance.update(1);
            } catch (err) {
                errMessage = err.message
            }
            expect(errMessage).toBe(`'doc' parameter must be a valid object, number received.`)
        })
        it('should update a deliveryEntry object when passed an object and a valid db', async () => {
            let _id = 'test';
            let deliveryEntry = await this.dbInstance.getById(_id);
            deliveryEntry.total = 100;
            let delivery = await this.dbInstance.update(deliveryEntry);
            expect(delivery).toEqual(deliveryEntry);
        }, jasmineTimeout);
        it('should update a deliveryEntry object when passed an object and a valid db passed in the db opt', async () => {
            let dbInstance = new DBClient();
            let _id = 'test';
            let deliveryEntry = await this.dbInstance.getById(_id);
            deliveryEntry.total = 100;
            let delivery = await dbInstance.update(deliveryEntry, { db: 'deliveries-test' });
            expect(delivery).toEqual(deliveryEntry);
        }, jasmineTimeout);
    })

})
