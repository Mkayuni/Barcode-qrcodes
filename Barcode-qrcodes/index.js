const JsBarcode = require('jsbarcode');
const { createCanvas } = require('canvas');
const fs = require('fs');
const crypto = require('crypto');

// Your custom prefix (40121)
const prefix = '40121';

// Arrays of product attributes
const weights = ['80g', '250g', '140g', '100g', '200g'];
const flavors = ['Vanilla', 'Strawberry', 'spicy', 'cinnamon'];

let barcodeCounter = 1;

weights.forEach(weight => {
    flavors.forEach(flavor => {
        // Generate a numeric code with random elements
        let productCode = generateComplexNumericCode(barcodeCounter);
        let barcodeNumber = prefix + productCode;

        // Calculate a check digit
        const checkDigit = calculateCheckDigit(barcodeNumber);
        const fullBarcodeNumber = barcodeNumber + checkDigit;

        const canvas = createCanvas();

        JsBarcode(canvas, fullBarcodeNumber, {
            format: "UPC", // Use UPC-A format to ensure compatibility
            displayValue: true,
            text: fullBarcodeNumber, // Display the barcode number below the barcode lines
            fontSize: 20,
        });

        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(`./barcodes/${weight}_${flavor}.png`, buffer);

        console.log(`Generated barcode for ${weight} ${flavor}: ${fullBarcodeNumber}`);

        barcodeCounter++;
    });
});

console.log("Custom local barcodes generated successfully!");

// Function to generate a complex numeric code
function generateComplexNumericCode(counter) {
    // Create a random number and combine it with the counter, ensuring it stays numeric
    const randomComponent = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const complexCode = (parseInt(randomComponent) + counter * 7).toString().padStart(6, '0');
    
    return complexCode;
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
