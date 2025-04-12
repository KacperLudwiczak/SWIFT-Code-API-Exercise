import * as XLSX from 'xlsx';
import { SwiftCode } from '../models/swiftCode';

interface RawRow {
    "COUNTRY ISO2 CODE": string;
    "SWIFT CODE": string;
    "CODE TYPE": string;
    "NAME": string;
    "ADDRESS": string;
    "TOWN NAME": string;
    "COUNTRY NAME": string;
}

export function parseSwiftFile(filePath: string): SwiftCode[] {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: "" });
    const swiftCodes: SwiftCode[] = [];

    rawData.forEach((row) => {
        const swiftCodeStr = row["SWIFT CODE"]?.toString().trim();
        if (!swiftCodeStr) return;

        const isHeadquarter = swiftCodeStr.endsWith("XXX");
        const countryISO2 = row["COUNTRY ISO2 CODE"]?.toUpperCase() || "";
        const countryName = row["COUNTRY NAME"]?.toUpperCase() || "";

    swiftCodes.push({
        swiftCode: swiftCodeStr,
        bankName: row["NAME"]?.trim() || "",
        address: row["ADDRESS"]?.trim() || "",
        countryISO2,
        countryName,
        isHeadquarter
    });
    });

    return swiftCodes;
}
