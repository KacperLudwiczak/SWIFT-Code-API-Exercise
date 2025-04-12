import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import swiftCodesRouter from './routes/swiftCodes';
import { parseSwiftFile } from './utils/parser';
import { SwiftCode } from './models/swiftCode';

const app = express();
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '..', 'public')));

const dataFilePath = path.join(__dirname, '..', 'data', 'SWIFT_CODES.xlsx');
let swiftCodesData: SwiftCode[] = [];
try {
swiftCodesData = parseSwiftFile(dataFilePath);
console.log(`Loaded ${swiftCodesData.length} SWIFT code entries from ${dataFilePath}`);
} catch (error) {
console.error("Error loading data at startup:", error);
}

const router = swiftCodesRouter(swiftCodesData);
app.use(router);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
