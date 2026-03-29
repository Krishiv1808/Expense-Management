const axios = require('axios');

const currencyService = {
  getCurrencyByCountry: async (countryName) => {
    try {
      const response = await axios.get(`https://restcountries.com/v3.1/name/${countryName}?fields=currencies`);
      if (response.data && response.data.length > 0) {
        const currencies = response.data[0].currencies;
        if (currencies) {
          return Object.keys(currencies)[0]; // Return the first currency code
        }
      }
      throw new Error(`No currency found for country: ${countryName}`);
    } catch (err) {
      console.error('Error fetching currency:', err.message);
      throw new Error(`Failed to determine default currency for ${countryName}. Please check the country name.`);
    }
  },

  getAllCountries: async () => {
    try {
      const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,cca2');
      return response.data.map(c => ({
        name: c.name.common,
        code: c.cca2
      })).sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      console.error('Error fetching countries:', err.message);
      return [];
    }
  }
};

module.exports = currencyService;
