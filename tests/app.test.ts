import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import swiftCodesRouterFactory from '../src/routes/swiftCodes';
import { parseSwiftFile } from '../src/utils/parser';
import { SwiftCode } from '../src/models/swiftCode';

let app: express.Express;
let testData: SwiftCode[] = [];

beforeAll(() => {
    const dataFilePath = path.join(__dirname, '..', 'data', 'SWIFT_CODES.xlsx');
    try {
        testData = parseSwiftFile(dataFilePath);
    } catch (error) {
        console.error("Error loading test data:", error);
    }
    
    app = express();
    app.use(bodyParser.json());
    
    app.use(swiftCodesRouterFactory(testData));
});

describe('GET /v1/swift-codes/:swiftCode', () => {
    it('should return a SWIFT code entry if found', async () => {
        const res = await request(app).get('/v1/swift-codes/AVJCBGS1XXX');
        expect(res.status).toBe(200);
        expect(res.body.swiftCode).toBeDefined();
    });

    it('should return 404 if the SWIFT code is not found', async () => {
        const res = await request(app).get('/v1/swift-codes/NONEXISTENTCODE');
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('SWIFT code not found.');
    });
});

describe('GET /v1/swift-codes/country/:countryISO2', () => {
    it('should return SWIFT codes for a valid country', async () => {
        const res = await request(app).get('/v1/swift-codes/country/BG');
        expect(res.status).toBe(200);
        expect(res.body.swiftCodes).toBeInstanceOf(Array);
        expect(res.body.swiftCodes.length).toBeGreaterThan(0);
    });

    it('should return 404 for a country with no SWIFT codes', async () => {
        const res = await request(app).get('/v1/swift-codes/country/ZZ');
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('No SWIFT codes found for the country.');
    });


});

describe('POST /v1/swift-codes', () => {
    const newSwiftCode = {
        swiftCode: "TESTCODE123",
        bankName: "TEST BANK",
        address: "123 Test Street",
        countryISO2: "TS",
        countryName: "TESTLAND",
        isHeadquarter: true
    };

    it('should add a new SWIFT code entry', async () => {
        const res = await request(app)
            .post('/v1/swift-codes')
            .send(newSwiftCode)
            .set('Content-Type', 'application/json');

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('SWIFT code added successfully.');
    });

    it('should not add a duplicate SWIFT code entry', async () => {
        const res = await request(app)
            .post('/v1/swift-codes')
            .send(newSwiftCode)
            .set('Content-Type', 'application/json');
        expect(res.status).toBe(409);
        expect(res.body.message).toBe('SWIFT code already exists.');
    });

    it('should retrieve the added SWIFT code entry', async () => {
        const res = await request(app).get('/v1/swift-codes/TESTCODE123');
        expect(res.status).toBe(200);
        expect(res.body.swiftCode).toBe("TESTCODE123");
        expect(res.body.bankName).toBe("TEST BANK");
    });
});

describe('DELETE /v1/swift-codes/:swiftCode', () => {
    it('should delete an existing SWIFT code entry', async () => {
        const newCode = {
            swiftCode: "DELETETEST",
            bankName: "Delete Bank",
            address: "456 Delete Road",
            countryISO2: "DT",
            countryName: "DELETETOWN",
            isHeadquarter: false
        };

        await request(app)
            .post('/v1/swift-codes')
            .send(newCode)
            .set('Content-Type', 'application/json');

        const deleteRes = await request(app).delete('/v1/swift-codes/DELETETEST');
        expect(deleteRes.status).toBe(200);
        expect(deleteRes.body.message).toBe('SWIFT code deleted successfully.');

        const getRes = await request(app).get('/v1/swift-codes/DELETETEST');
        expect(getRes.status).toBe(404);
    });
});

describe('POST /v1/swift-codes/load', () => {
    it('should reload SWIFT codes from a file', async () => {
        const res = await request(app).post('/v1/swift-codes/load?file=data/SWIFT_CODES.xlsx');
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('File parsed and data loaded successfully.');
        expect(res.body.count).toBeGreaterThan(0);
    });

    it('should return error for missing file path', async () => {
        const res = await request(app).post('/v1/swift-codes/load');
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('File path is required.');
    });
});