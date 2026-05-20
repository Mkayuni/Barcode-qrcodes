const JsBarcode = require('jsbarcode');
const { createCanvas } = require('canvas');
const fs = require('fs');

// Company prefix (40121)
const prefix = '40121';

// Products and their available pack sizes
const products = [
    { name: 'RedKidneyBeans', sizes: ['500g', '1kg', '2kg'] },
    { name: 'SugarBeans',     sizes: ['500g', '1kg', '2kg'] },
    { name: 'ConcernBeans',   sizes: ['500g', '1kg', '2kg'] },
    { name: 'Kantauzeni',     sizes: ['500g', '1kg', '2kg'] },
    { name: 'SoyaBeans',      sizes: ['500g', '1kg', '2kg'] },
    { name: 'Popcorn',        sizes: ['500g', '1kg'] },
];

// Start counter at 100 so new codes don't collide with the 3 existing examples
let barcodeCounter = 100;
const usedCodes = new Set();
const csvRows = ['product,size,barcode'];

products.forEach(product => {
    product.sizes.forEach(size => {
        let fullBarcodeNumber;

        // Ensure the generated barcode is unique
        do {
            const productCode = generateComplexNumericCode(barcodeCounter);
            const barcodeNumber = prefix + productCode;
            const checkDigit = calculateCheckDigit(barcodeNumber);
            fullBarcodeNumber = barcodeNumber + checkDigit;
            barcodeCounter++;
        } while (usedCodes.has(fullBarcodeNumber));

        usedCodes.add(fullBarcodeNumber);

        const canvas = createCanvas();

        JsBarcode(canvas, fullBarcodeNumber, {
            format: "UPC",
            displayValue: true,
            text: fullBarcodeNumber,
            fontSize: 20,
        });

        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(`./barcodes/${size}_${product.name}.png`, buffer);

        console.log(`Generated barcode for ${size} ${product.name}: ${fullBarcodeNumber}`);
        csvRows.push(`${product.name},${size},${fullBarcodeNumber}`);
    });
});

fs.writeFileSync('./barcodes/barcodes.csv', csvRows.join('\n') + '\n');
console.log("Custom local barcodes generated successfully!");

// Function to generate a complex numeric code
function generateComplexNumericCode(counter) {
    const randomComponent = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const complexCode = (parseInt(randomComponent) + counter * 7).toString().padStart(6, '0');
    return complexCode.slice(-6);
}

// Function to calculate the check digit for UPC-A
function calculateCheckDigit(code) {
    let sumOdd = 0;
    let sumEven = 0;
    for (let i = 0; i < code.length; i++) {
        const digit = parseInt(code[i], 10);
        if (i % 2 === 0) {
            sumOdd += digit;
        } else {
            sumEven += digit;
        }
    }
    const totalSum = (sumOdd * 3) + sumEven;
    const mod = totalSum % 10;
    return mod === 0 ? 0 : 10 - mod;
}
