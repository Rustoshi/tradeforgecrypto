"use server";

interface CoinGeckoPrice {
  bitcoin: {
    [key: string]: number;
  };
}

export interface BtcPriceData {
  price: number;
  change24h: number;
  changePercent24h: number;
}

// Cache the price for 60 seconds to avoid rate limiting
let cachedData: { data: BtcPriceData; currency: string; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 1000; // 60 seconds

export async function getBtcPriceData(currency: string = "usd"): Promise<BtcPriceData> {
  const normalizedCurrency = currency.toLowerCase();
  
  // Check cache
  if (
    cachedData &&
    cachedData.currency === normalizedCurrency &&
    Date.now() - cachedData.timestamp < CACHE_DURATION
  ) {
    return cachedData.data;
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${normalizedCurrency}&include_24hr_change=true`,
      {
        next: { revalidate: 60 },
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("CoinGecko API error:", response.status);
      return { price: 0, change24h: 0, changePercent24h: 0 };
    }

    const data: CoinGeckoPrice = await response.json();
    const price = data.bitcoin?.[normalizedCurrency] || 0;
    const changePercent24h = data.bitcoin?.[`${normalizedCurrency}_24h_change`] || 0;
    const change24h = price * (changePercent24h / 100);

    const result: BtcPriceData = {
      price,
      change24h,
      changePercent24h,
    };

    // Update cache
    cachedData = {
      data: result,
      currency: normalizedCurrency,
      timestamp: Date.now(),
    };

    return result;
  } catch (error) {
    console.error("Error fetching BTC price:", error);
    return { price: 0, change24h: 0, changePercent24h: 0 };
  }
}

// Legacy function for backward compatibility
export async function getBtcPrice(currency: string = "usd"): Promise<number> {
  const data = await getBtcPriceData(currency);
  return data.price;
}

export async function convertBtcToFiat(
  btcAmount: number,
  currency: string = "usd"
): Promise<number> {
  const btcPrice = await getBtcPrice(currency);
  return btcAmount * btcPrice;
}
