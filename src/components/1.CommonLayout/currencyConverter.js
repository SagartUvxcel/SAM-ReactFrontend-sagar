 
const convertCurrency = (rupeeValue, countryName, currencyType, conversionRate) => {
    const rupeesValue = Number(rupeeValue)
    if (typeof rupeesValue !== 'number' || rupeesValue < 0) {
      throw new Error('Invalid rupee value');
    }
  
    if (typeof conversionRate !== 'number' || conversionRate <= 0) {
      throw new Error('Invalid conversion rate');
    }
  
    const convertedValue = rupeesValue * conversionRate;
    return convertedValue.toFixed(0);
  };
  
  export default convertCurrency;
  