import { Router, Request, Response, NextFunction } from 'express';
import { SwiftCode } from '../models/swiftCode';

export default function(swiftCodes: SwiftCode[]) {
const router = Router();

router.get('/v1/swift-codes/:swiftCode', (req: Request, res: Response, _next: NextFunction): void => {
    const code = req.params.swiftCode.trim();
    const swiftEntry = swiftCodes.find(sc => sc.swiftCode.toUpperCase() === code.toUpperCase());
    
    if (!swiftEntry) {
    res.status(404).json({ message: 'SWIFT code not found.' });
    return;
    }
    
    const sanitizeBranch = ({ swiftCode, bankName, address, countryISO2, isHeadquarter }: SwiftCode) => ({
        address,
        bankName,
        countryISO2,
        isHeadquarter,
        swiftCode,
    });

    if (swiftEntry.isHeadquarter) {

    const branches = swiftCodes
        .filter(sc =>
        !sc.isHeadquarter &&
        sc.swiftCode.substring(0, 8) === swiftEntry.swiftCode.substring(0, 8)
        )
        .map(sanitizeBranch);
    
    res.json({
        ...swiftEntry,
        branches
    });
    return;
    }
    
    res.json(swiftEntry);
});



router.get('/v1/swift-codes/country/:countryISO2', (req: Request, res: Response, _next: NextFunction): void => {
    const countryISO2 = req.params.countryISO2.toUpperCase();
    const filteredCodes = swiftCodes.filter(sc => sc.countryISO2 === countryISO2);
    
    if (filteredCodes.length === 0) {
    res.status(404).json({ message: 'No SWIFT codes found for the country.' });
    return;
    }

    const countryName = filteredCodes[0].countryName;
    const cleanedCodes = filteredCodes.map(({ swiftCode, bankName, address, countryISO2, isHeadquarter }) => ({
    address,
    bankName,
    countryISO2,
    isHeadquarter,
    swiftCode
    }));

    res.json({
    countryISO2,
    countryName,
    swiftCodes: cleanedCodes
    });
});

router.post('/v1/swift-codes', (req: Request, res: Response, _next: NextFunction): void => {
    const { swiftCode, bankName, address, countryISO2, countryName, isHeadquarter } = req.body;

    if (!swiftCode || !bankName || !address || !countryISO2 || !countryName) {
        res.status(400).json({ message: 'Missing required fields.' });
        return;
    }

    const entry: SwiftCode = {
        swiftCode: swiftCode.trim(),
        bankName: bankName.trim(),
        address: address.trim(),
        countryISO2: countryISO2.toUpperCase().trim(),
        countryName: countryName.toUpperCase().trim(),
        isHeadquarter: isHeadquarter === true
    };

    if (swiftCodes.find(sc => sc.swiftCode.toUpperCase() === entry.swiftCode.toUpperCase())) {
        res.status(409).json({ message: 'SWIFT code already exists.' });
        return;
    }

    swiftCodes.push(entry);
    res.json({ message: 'SWIFT code added successfully.' });
});

router.delete('/v1/swift-codes/:swiftCode', (req: Request, res: Response, _next: NextFunction): void => {
    const code = req.params.swiftCode.trim();
    const initialLength = swiftCodes.length;
    swiftCodes = swiftCodes.filter(sc => sc.swiftCode.toUpperCase() !== code.toUpperCase());

    if (swiftCodes.length === initialLength) {
        res.status(404).json({ message: 'SWIFT code not found.' });
        return;
    }

    res.json({ message: 'SWIFT code deleted successfully.' });
});

return router;
}
