const jasmine = require('jasmine');

const ErrorMessages = require('../api/lib/ErrorMessages');

describe('ErrorMessages tests', () => {
    it(
        'TYPE_MISMATCH_ERROR should be equal' +
        'Wrong type for parameter test. Received number, expected string',
        () => {
            expect(ErrorMessages.TYPE_MISMATCH_ERROR('test', 'string', typeof 0))
                .toEqual('Wrong type for parameter test. Received number, expected string');
        })
    it(
        'VALUE_MISMATCH_ERROR should be equal' +
        'Wrong value for parameter date_from. Received more than date_to, expected less than date_to',
        () => {
            expect(ErrorMessages.VALUE_MISMATCH_ERROR('date_from', 'less than date_to', 'more than date_to'))
                .toEqual('Wrong value for parameter date_from. Received more than date_to, expected less than date_to');
        })
    it(
        'MISSING_FIELD_ERROR should be equal Missing field "test"',
        () => {
            expect(ErrorMessages.MISSING_FIELD_ERROR('test')).toEqual('Missing field "test"');
        })
    it(
        'DB_CONNECT_ERROR should be equal Error connecting to the database, check logs for details.',
        () => {
            expect(ErrorMessages.DB_CONNECT_ERROR())
                .toEqual('Error connecting to the database, check logs for details.');
        })
    it(
        'NO_DB_ERROR should be equal This client has no default databaset set, and one was not provided.',
        () => {
            expect(ErrorMessages.NO_DB_ERROR())
                .toEqual('This client has no default databaset set, and one was not provided.');
        })
    it(
        `DB_DOC_NOT_FOUND should be equal The requested document 'test' does not exist in the database`,
        () => {
            expect(ErrorMessages.DB_DOC_NOT_FOUND('test'))
                .toEqual(`The requested document 'test' does not exist in the database`);
        })
    it(
        'DB_DOC_DATA_CONFLICT should be equal Data already on the database.',
        () => {
            expect(ErrorMessages.DB_DOC_DATA_CONFLICT())
                .toEqual('Data already on the database.');
        })
    it(
        `DB_DOC_INVALID_REV should be equal Wrong 'rev' parameter for 'test'.`,
        () => {
            expect(ErrorMessages.DB_DOC_INVALID_REV('test'))
                .toEqual(`Wrong 'rev' parameter for 'test'.`);
        })
    it(
        'DATA_NOT_FOUND should be equal Data not found.',
        () => {
            expect(ErrorMessages.DATA_NOT_FOUND())
                .toEqual('Data not found.');
        })
    it(
        'INTERNAL_SERVER_ERROR should be equal' +
        'The server encountered an error and could not complete your request. Please try again later.',
        () => {
            expect(ErrorMessages.INTERNAL_SERVER_ERROR())
                .toEqual('The server encountered an error and could not complete your request. Please try again later.');
        })
})
