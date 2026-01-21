// Comprehensive list of world currencies
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  country: string;
}

export const currencies: Currency[] = [
  // Major Currencies
  { code: "USD", name: "US Dollar", symbol: "$", country: "United States" },
  { code: "EUR", name: "Euro", symbol: "€", country: "European Union" },
  { code: "GBP", name: "British Pound", symbol: "£", country: "United Kingdom" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", country: "Japan" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr", country: "Switzerland" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", country: "Canada" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", country: "Australia" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", country: "New Zealand" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", country: "China" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", country: "Hong Kong" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", country: "Singapore" },
  
  // European Currencies
  { code: "SEK", name: "Swedish Krona", symbol: "kr", country: "Sweden" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", country: "Norway" },
  { code: "DKK", name: "Danish Krone", symbol: "kr", country: "Denmark" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł", country: "Poland" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč", country: "Czech Republic" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft", country: "Hungary" },
  { code: "RON", name: "Romanian Leu", symbol: "lei", country: "Romania" },
  { code: "BGN", name: "Bulgarian Lev", symbol: "лв", country: "Bulgaria" },
  { code: "HRK", name: "Croatian Kuna", symbol: "kn", country: "Croatia" },
  { code: "RSD", name: "Serbian Dinar", symbol: "дин", country: "Serbia" },
  { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴", country: "Ukraine" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽", country: "Russia" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", country: "Turkey" },
  { code: "ISK", name: "Icelandic Krona", symbol: "kr", country: "Iceland" },
  
  // Asian Currencies
  { code: "INR", name: "Indian Rupee", symbol: "₹", country: "India" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨", country: "Pakistan" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", country: "Bangladesh" },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs", country: "Sri Lanka" },
  { code: "NPR", name: "Nepalese Rupee", symbol: "Rs", country: "Nepal" },
  { code: "KRW", name: "South Korean Won", symbol: "₩", country: "South Korea" },
  { code: "TWD", name: "Taiwan Dollar", symbol: "NT$", country: "Taiwan" },
  { code: "THB", name: "Thai Baht", symbol: "฿", country: "Thailand" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", country: "Malaysia" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", country: "Indonesia" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱", country: "Philippines" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫", country: "Vietnam" },
  { code: "MMK", name: "Myanmar Kyat", symbol: "K", country: "Myanmar" },
  { code: "KHR", name: "Cambodian Riel", symbol: "៛", country: "Cambodia" },
  { code: "LAK", name: "Lao Kip", symbol: "₭", country: "Laos" },
  { code: "BND", name: "Brunei Dollar", symbol: "B$", country: "Brunei" },
  { code: "MNT", name: "Mongolian Tugrik", symbol: "₮", country: "Mongolia" },
  { code: "KZT", name: "Kazakhstani Tenge", symbol: "₸", country: "Kazakhstan" },
  { code: "UZS", name: "Uzbekistani Som", symbol: "so'm", country: "Uzbekistan" },
  
  // Middle East Currencies
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", country: "United Arab Emirates" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", country: "Saudi Arabia" },
  { code: "QAR", name: "Qatari Riyal", symbol: "﷼", country: "Qatar" },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك", country: "Kuwait" },
  { code: "BHD", name: "Bahraini Dinar", symbol: "BD", country: "Bahrain" },
  { code: "OMR", name: "Omani Rial", symbol: "﷼", country: "Oman" },
  { code: "JOD", name: "Jordanian Dinar", symbol: "JD", country: "Jordan" },
  { code: "LBP", name: "Lebanese Pound", symbol: "ل.ل", country: "Lebanon" },
  { code: "ILS", name: "Israeli Shekel", symbol: "₪", country: "Israel" },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£", country: "Egypt" },
  { code: "IQD", name: "Iraqi Dinar", symbol: "ع.د", country: "Iraq" },
  { code: "IRR", name: "Iranian Rial", symbol: "﷼", country: "Iran" },
  
  // African Currencies
  { code: "ZAR", name: "South African Rand", symbol: "R", country: "South Africa" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", country: "Nigeria" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", country: "Kenya" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", country: "Ghana" },
  { code: "UGX", name: "Ugandan Shilling", symbol: "USh", country: "Uganda" },
  { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh", country: "Tanzania" },
  { code: "ETB", name: "Ethiopian Birr", symbol: "Br", country: "Ethiopia" },
  { code: "MAD", name: "Moroccan Dirham", symbol: "د.م.", country: "Morocco" },
  { code: "DZD", name: "Algerian Dinar", symbol: "د.ج", country: "Algeria" },
  { code: "TND", name: "Tunisian Dinar", symbol: "د.ت", country: "Tunisia" },
  { code: "XOF", name: "West African CFA Franc", symbol: "CFA", country: "West Africa" },
  { code: "XAF", name: "Central African CFA Franc", symbol: "FCFA", country: "Central Africa" },
  { code: "RWF", name: "Rwandan Franc", symbol: "FRw", country: "Rwanda" },
  { code: "BWP", name: "Botswana Pula", symbol: "P", country: "Botswana" },
  { code: "MUR", name: "Mauritian Rupee", symbol: "₨", country: "Mauritius" },
  { code: "ZMW", name: "Zambian Kwacha", symbol: "ZK", country: "Zambia" },
  { code: "MWK", name: "Malawian Kwacha", symbol: "MK", country: "Malawi" },
  { code: "AOA", name: "Angolan Kwanza", symbol: "Kz", country: "Angola" },
  { code: "MZN", name: "Mozambican Metical", symbol: "MT", country: "Mozambique" },
  { code: "NAD", name: "Namibian Dollar", symbol: "N$", country: "Namibia" },
  { code: "SZL", name: "Swazi Lilangeni", symbol: "L", country: "Eswatini" },
  { code: "LSL", name: "Lesotho Loti", symbol: "L", country: "Lesotho" },
  
  // Americas Currencies
  { code: "MXN", name: "Mexican Peso", symbol: "$", country: "Mexico" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", country: "Brazil" },
  { code: "ARS", name: "Argentine Peso", symbol: "$", country: "Argentina" },
  { code: "CLP", name: "Chilean Peso", symbol: "$", country: "Chile" },
  { code: "COP", name: "Colombian Peso", symbol: "$", country: "Colombia" },
  { code: "PEN", name: "Peruvian Sol", symbol: "S/", country: "Peru" },
  { code: "UYU", name: "Uruguayan Peso", symbol: "$U", country: "Uruguay" },
  { code: "PYG", name: "Paraguayan Guarani", symbol: "₲", country: "Paraguay" },
  { code: "BOB", name: "Bolivian Boliviano", symbol: "Bs", country: "Bolivia" },
  { code: "VES", name: "Venezuelan Bolivar", symbol: "Bs.S", country: "Venezuela" },
  { code: "GTQ", name: "Guatemalan Quetzal", symbol: "Q", country: "Guatemala" },
  { code: "HNL", name: "Honduran Lempira", symbol: "L", country: "Honduras" },
  { code: "NIO", name: "Nicaraguan Cordoba", symbol: "C$", country: "Nicaragua" },
  { code: "CRC", name: "Costa Rican Colon", symbol: "₡", country: "Costa Rica" },
  { code: "PAB", name: "Panamanian Balboa", symbol: "B/.", country: "Panama" },
  { code: "DOP", name: "Dominican Peso", symbol: "RD$", country: "Dominican Republic" },
  { code: "JMD", name: "Jamaican Dollar", symbol: "J$", country: "Jamaica" },
  { code: "TTD", name: "Trinidad Dollar", symbol: "TT$", country: "Trinidad and Tobago" },
  { code: "BBD", name: "Barbadian Dollar", symbol: "Bds$", country: "Barbados" },
  { code: "BSD", name: "Bahamian Dollar", symbol: "B$", country: "Bahamas" },
  { code: "HTG", name: "Haitian Gourde", symbol: "G", country: "Haiti" },
  { code: "CUP", name: "Cuban Peso", symbol: "₱", country: "Cuba" },
  
  // Oceania Currencies
  { code: "FJD", name: "Fijian Dollar", symbol: "FJ$", country: "Fiji" },
  { code: "PGK", name: "Papua New Guinean Kina", symbol: "K", country: "Papua New Guinea" },
  { code: "WST", name: "Samoan Tala", symbol: "WS$", country: "Samoa" },
  { code: "TOP", name: "Tongan Pa'anga", symbol: "T$", country: "Tonga" },
  { code: "VUV", name: "Vanuatu Vatu", symbol: "VT", country: "Vanuatu" },
  { code: "SBD", name: "Solomon Islands Dollar", symbol: "SI$", country: "Solomon Islands" },
];

// Get currency by code
export function getCurrencyByCode(code: string): Currency | undefined {
  return currencies.find(c => c.code === code);
}

// Search currencies by name, code, or country
export function searchCurrencies(query: string): Currency[] {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return currencies;
  
  return currencies.filter(c => 
    c.code.toLowerCase().includes(searchTerm) ||
    c.name.toLowerCase().includes(searchTerm) ||
    c.country.toLowerCase().includes(searchTerm)
  );
}

// Get currency codes only
export const currencyCodes = currencies.map(c => c.code);
