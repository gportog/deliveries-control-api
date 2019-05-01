const jasmine = require('jasmine');

const HTTPstatusCodes = require('../api/lib/HTTPstatusCodes');

describe('HTTPstatusCodes tests', () => {
    it('OK should be equal 200', () => {
        expect(HTTPstatusCodes.OK).toEqual(200);
    })
    it('OK_CREATED should be equal 201', () => {
        expect(HTTPstatusCodes.OK_CREATED).toEqual(201);
    })
    it('OK_NO_CONTENT should be equal 204', () => {
        expect(HTTPstatusCodes.OK_NO_CONTENT).toEqual(204);
    })
    it('BAD_REQUEST should be equal 400', () => {
        expect(HTTPstatusCodes.BAD_REQUEST).toEqual(400);
    })
    it('UNAUTHORIZED should be equal 401', () => {
        expect(HTTPstatusCodes.UNAUTHORIZED).toEqual(401);
    })
    it('FORBIDDEN should be equal 403', () => {
        expect(HTTPstatusCodes.FORBIDDEN).toEqual(403);
    })
    it('NOT_FOUND should be equal 404', () => {
        expect(HTTPstatusCodes.NOT_FOUND).toEqual(404);
    })
    it('CONFLICT should be equal 409', () => {
        expect(HTTPstatusCodes.CONFLICT).toEqual(409);
    })
    it('INTERNAL_SERVER_ERROR should be equal 500', () => {
        expect(HTTPstatusCodes.INTERNAL_SERVER_ERROR).toEqual(500);
    })
})