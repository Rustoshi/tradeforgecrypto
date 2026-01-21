// CoinGecko API for cryptocurrency price data
// Free tier: 10-30 calls/minute

const COINGECKO_API = "https://api.coingecko.com/api/v3";

// Map network identifiers to CoinGecko coin IDs
const NETWORK_TO_COINGECKO_ID: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  "USDT-TRC20": "tether",
  "USDT-ERC20": "tether",
  USDT: "tether",
  USDC: "usd-coin",
  BNB: "binancecoin",
  LTC: "litecoin",
  XRP: "ripple",
  SOL: "solana",
  DOGE: "dogecoin",
  MATIC: "matic-network",
  ADA: "cardano",
  DOT: "polkadot",
  AVAX: "avalanche-2",
  TRX: "tron",
};

// Map currency codes to CoinGecko supported currencies
const SUPPORTED_FIAT_CURRENCIES = [
  "usd", "eur", "gbp", "jpy", "aud", "cad", "chf", "cny", "inr", "krw",
  "ngn", "zar", "brl", "mxn", "sgd", "hkd", "nzd", "sek", "nok", "dkk",
  "pln", "thb", "idr", "myr", "php", "vnd", "aed", "sar", "try", "rub"
];

export interface CryptoPrice {
  id: string;
  symbol: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
}

export interface ExchangeRates {
  [network: string]: number;
}

// Cache for exchange rates (5 minutes TTL)
let ratesCache: { rates: ExchangeRates; timestamp: number; currency: string } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get exchange rates for cryptocurrencies in a specific fiat currency
 */
export async function getExchangeRates(fiatCurrency: string = "USD"): Promise<ExchangeRates> {
  const currency = fiatCurrency.toLowerCase();
  
  // Check cache
  if (ratesCache && 
      ratesCache.currency === currency && 
      Date.now() - ratesCache.timestamp < CACHE_TTL) {
    return ratesCache.rates;
  }

  // Get unique CoinGecko IDs
  const coinIds = Array.from(new Set(Object.values(NETWORK_TO_COINGECKO_ID)));
  
  // Use a supported currency or fallback to USD
  const vsCurrency = SUPPORTED_FIAT_CURRENCIES.includes(currency) ? currency : "usd";

  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${coinIds.join(",")}&vs_currencies=${vsCurrency}`,
      {
        headers: {
          "Accept": "application/json",
        },
        cache: "no-store", // Always fetch fresh data
      }
    );

    if (!response.ok) {
      console.error("CoinGecko API error:", response.status);
      return getFallbackRates();
    }

    const data = await response.json();
    
    // Build rates object mapping network to price
    const rates: ExchangeRates = {};
    
    for (const [network, coinId] of Object.entries(NETWORK_TO_COINGECKO_ID)) {
      const price = data[coinId]?.[vsCurrency];
      if (price) {
        rates[network] = price;
      }
    }

    // Update cache
    ratesCache = {
      rates,
      timestamp: Date.now(),
      currency,
    };

    return rates;
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error);
    return getFallbackRates();
  }
}

/**
 * Convert fiat amount to crypto amount
 */
export async function convertFiatToCrypto(
  fiatAmount: number,
  network: string,
  fiatCurrency: string = "USD"
): Promise<{ cryptoAmount: number; rate: number } | null> {
  const rates = await getExchangeRates(fiatCurrency);
  const rate = rates[network];
  
  if (!rate || rate === 0) {
    return null;
  }

  return {
    cryptoAmount: fiatAmount / rate,
    rate,
  };
}

/**
 * Convert crypto amount to fiat amount
 */
export async function convertCryptoToFiat(
  cryptoAmount: number,
  network: string,
  fiatCurrency: string = "USD"
): Promise<{ fiatAmount: number; rate: number } | null> {
  const rates = await getExchangeRates(fiatCurrency);
  const rate = rates[network];
  
  if (!rate) {
    return null;
  }

  return {
    fiatAmount: cryptoAmount * rate,
    rate,
  };
}

/**
 * Get detailed price info for multiple cryptocurrencies
 */
export async function getCryptoPrices(
  networks: string[],
  fiatCurrency: string = "USD"
): Promise<Record<string, CryptoPrice>> {
  const currency = fiatCurrency.toLowerCase();
  const vsCurrency = SUPPORTED_FIAT_CURRENCIES.includes(currency) ? currency : "usd";
  
  // Get unique CoinGecko IDs for requested networks
  const coinIds = networks
    .map(n => NETWORK_TO_COINGECKO_ID[n])
    .filter(Boolean);
  
  if (coinIds.length === 0) {
    return {};
  }

  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=${vsCurrency}&ids=${coinIds.join(",")}&order=market_cap_desc&sparkline=false`,
      {
        headers: {
          "Accept": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return {};
    }

    const data: CryptoPrice[] = await response.json();
    
    // Map back to network identifiers
    const result: Record<string, CryptoPrice> = {};
    
    for (const [network, coinId] of Object.entries(NETWORK_TO_COINGECKO_ID)) {
      if (networks.includes(network)) {
        const coin = data.find(c => c.id === coinId);
        if (coin) {
          result[network] = coin;
        }
      }
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch crypto prices:", error);
    return {};
  }
}

/**
 * Fallback rates in case API fails (approximate USD values)
 */
function getFallbackRates(): ExchangeRates {
  return {
    BTC: 43000,
    ETH: 2600,
    "USDT-TRC20": 1,
    "USDT-ERC20": 1,
    USDT: 1,
    USDC: 1,
    BNB: 310,
    LTC: 70,
    XRP: 0.60,
    SOL: 95,
    DOGE: 0.08,
    MATIC: 0.85,
    ADA: 0.55,
    DOT: 7.5,
    AVAX: 35,
    TRX: 0.11,
  };
}

/**
 * Get the CoinGecko ID for a network
 */
export function getCoinGeckoId(network: string): string | undefined {
  return NETWORK_TO_COINGECKO_ID[network];
}

/**
 * Check if a network is supported
 */
export function isSupportedNetwork(network: string): boolean {
  return network in NETWORK_TO_COINGECKO_ID;
}
