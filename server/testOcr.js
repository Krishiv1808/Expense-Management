const ocrService = require('./src/services/ocrService');
const path = require('path');

async function testOCR() {
  // Pointing to the specific generated image
  const sampleImagePath = 'C:\\Users\\Makarand Kulkarni\\.gemini\\antigravity\\brain\\a70e310b-e1ae-4e40-80dc-e29268f174e6\\ocr_test_receipt_sample_1774772435286.png';
  
  console.log(`Testing OCR on: ${sampleImagePath}`);
  try {
    const result = await ocrService.processReceipt(sampleImagePath);
    console.log('\n--- Extraction Results ---');
    console.log('Amount:', result.amount);
    console.log('Merchant:', result.merchant);
    console.log('Date:', result.date);
    console.log('\n--- Raw Text Extracted ---');
    console.log(result.rawText);
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testOCR();
