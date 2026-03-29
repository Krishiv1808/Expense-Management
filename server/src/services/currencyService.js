const axios = require('axios');

const currencyService = {
  getCurrencyByCountry: async (countryName) => {
    try {
      const response = await axios.get(`https://restcountries.com/v3.1/name/${countryName}?fields=currencies`);
      if (response.data && response.data.length > 0) {
        const currencies = response.data[0].currencies;
        return Object.keys(currencies)[0]; // Return the first currency code (e.g., 'USD')
      }
      return 'USD'; // Default placeholder
    } catch (err) {
      console.error('Error fetching currency:', err.message);
      return 'USD'; // Fallback
    }
  }
};

module.exports = currencyService;
