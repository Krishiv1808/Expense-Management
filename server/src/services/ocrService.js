const Tesseract = require('tesseract.js');
const path = require('path');

const ocrService = {
  /**
   * Performs OCR on an image and extracts relevant financial data
   * @param {string} imagePath Absolute path to the receipt image
   * @returns {Promise<{amount: number, merchant: string, date: string, rawText: string}>}
   */
  processReceipt: async (imagePath) => {
    try {
      console.log('🚀 Starting OCR processing for:', imagePath);
      
      const { data: { text } } = await Tesseract.recognize(
        imagePath,
        'eng',
        { logger: m => console.log(`[OCR Progress]: ${m.status} - ${Math.round(m.progress * 100)}%`) }
      );

      console.log('✅ OCR Text Extraction Complete');

      // 1. Extract Amount (Regex for typical Total patterns)
      const amount = ocrService.extractAmount(text);
      
      // 2. Extract Date (Basic YYYY-MM-DD or MM/DD/YYYY)
      const date = ocrService.extractDate(text);

      // 3. Extract Merchant (Very basic: often first line or known keywords)
      const merchant = ocrService.extractMerchant(text);

      return {
        amount,
        merchant,
        date,
        rawText: text
      };
    } catch (err) {
      console.error('❌ OCR Processing Error:', err);
      throw new Error('Failed to process receipt with OCR');
    }
  },

  /**
   * Extracts the Total amount from OCR text using regex patterns
   */
  extractAmount: (text) => {
    // Regex for common "Total" labels followed by currency symbols and numbers
    const totalPatterns = [
      /total[:\s]*[\$]?(\d+[\.,]\d{2})/i,
      /amount[:\s]*[\$]?(\d+[\.,]\d{2})/i,
      /balance[:\s]*[\$]?(\d+[\.,]\d{2})/i,
      /grand total[:\s]*[\$]?(\d+[\.,]\d{2})/i,
      /total payable[:\s]*[\$]?(\d+[\.,]\d{2})/i
    ];

    for (const pattern of totalPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        // Handle dots/commas (e.g., 1,234.56 or 1234.56)
        return parseFloat(match[1].replace(',', ''));
      }
    }

    // Fallback: look for generic numbers that look like currency (e.g. 12.34 at end of lines)
    const genericAmountPattern = /[\$]?(\d+[\.,]\d{2})/g;
    const matches = text.match(genericAmountPattern);
    if (matches && matches.length > 0) {
      // Return the largest number found, as it's often the total
      const amounts = matches.map(m => parseFloat(m.replace(/[\$,]/g, '')));
      return Math.max(...amounts);
    }

    return null;
  },

  /**
   * Extracts the Date from OCR text
   */
  extractDate: (text) => {
    const datePatterns = [
      /(\d{2}[\/\-]\d{2}[\/\-]\d{4})/, // MM/DD/YYYY
      /(\d{4}[\/\-]\d{2}[\/\-]\d{2})/, // YYYY-MM-DD
      /(\d{2}\s[A-Z]{3}\s\d{4})/i     // 29 MAR 2026
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  },

  /**
   * Extracts the Merchant (very basic lookup)
   */
  extractMerchant: (text) => {
    // Usually the first few lines of a receipt
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
    if (lines.length > 0) return lines[0]; // First significant line is often the store name
    return 'Unknown Merchant';
  }
};

module.exports = ocrService;
