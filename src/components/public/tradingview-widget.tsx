"use client";

import { useEffect, useRef, memo } from "react";

interface TradingViewWidgetProps {
  symbol?: string;
  theme?: "light" | "dark";
  height?: number;
  width?: string;
}

function TradingViewWidgetComponent({
  symbol = "NASDAQ:AAPL",
  theme = "dark",
  height = 400,
  width = "100%",
}: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Clear any existing content
    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: "D",
      timezone: "Etc/UTC",
      theme: theme,
      style: "1",
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      support_host: "https://www.tradingview.com",
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = "";
      }
    };
  }, [symbol, theme]);

  return (
    <div
      className="tradingview-widget-container"
      ref={container}
      style={{ height, width }}
    >
      <div
        className="tradingview-widget-container__widget"
        style={{ height: "calc(100% - 32px)", width: "100%" }}
      />
    </div>
  );
}

export const TradingViewWidget = memo(TradingViewWidgetComponent);

// Mini Chart Widget
interface MiniChartProps {
  symbol?: string;
  theme?: "light" | "dark";
  height?: number;
}

function MiniChartComponent({
  symbol = "FX:EURUSD",
  theme = "dark",
  height = 220,
}: MiniChartProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: symbol,
      width: "100%",
      height: height,
      locale: "en",
      dateRange: "12M",
      colorTheme: theme,
      isTransparent: false,
      autosize: false,
      largeChartUrl: "",
      noTimeScale: false,
      chartOnly: false,
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = "";
      }
    };
  }, [symbol, theme, height]);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget" />
    </div>
  );
}

export const MiniChart = memo(MiniChartComponent);

// Ticker Tape Widget
function TickerTapeComponent({ theme = "dark" }: { theme?: "light" | "dark" }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
        { proName: "FOREXCOM:NSXUSD", title: "US 100" },
        { proName: "FX_IDC:EURUSD", title: "EUR/USD" },
        { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
        { proName: "BITSTAMP:ETHUSD", title: "Ethereum" },
        { proName: "COMEX:GC1!", title: "Gold" },
        { proName: "NYMEX:CL1!", title: "Crude Oil" },
      ],
      showSymbolLogo: true,
      isTransparent: false,
      displayMode: "adaptive",
      colorTheme: theme,
      locale: "en",
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = "";
      }
    };
  }, [theme]);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget" />
    </div>
  );
}

export const TickerTape = memo(TickerTapeComponent);

// Market Overview Widget
function MarketOverviewComponent({ theme = "dark" }: { theme?: "light" | "dark" }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: theme,
      dateRange: "12M",
      showChart: true,
      locale: "en",
      largeChartUrl: "",
      isTransparent: false,
      showSymbolLogo: true,
      showFloatingTooltip: true,
      width: "100%",
      height: "600",
      plotLineColorGrowing: "rgba(34, 197, 94, 1)",
      plotLineColorFalling: "rgba(239, 68, 68, 1)",
      gridLineColor: "rgba(0, 0, 0, 0.05)",
      scaleFontColor: "rgba(0, 0, 0, 0.9)",
      belowLineFillColorGrowing: "rgba(34, 197, 94, 0.12)",
      belowLineFillColorFalling: "rgba(239, 68, 68, 0.12)",
      belowLineFillColorGrowingBottom: "rgba(34, 197, 94, 0)",
      belowLineFillColorFallingBottom: "rgba(239, 68, 68, 0)",
      symbolActiveColor: "rgba(59, 130, 246, 0.12)",
      tabs: [
        {
          title: "Indices",
          symbols: [
            { s: "FOREXCOM:SPXUSD", d: "S&P 500" },
            { s: "FOREXCOM:NSXUSD", d: "US 100" },
            { s: "FOREXCOM:DJI", d: "Dow 30" },
            { s: "INDEX:NKY", d: "Nikkei 225" },
            { s: "INDEX:DEU40", d: "DAX" },
            { s: "FOREXCOM:UKXGBP", d: "FTSE 100" },
          ],
        },
        {
          title: "Forex",
          symbols: [
            { s: "FX:EURUSD", d: "EUR/USD" },
            { s: "FX:GBPUSD", d: "GBP/USD" },
            { s: "FX:USDJPY", d: "USD/JPY" },
            { s: "FX:USDCHF", d: "USD/CHF" },
            { s: "FX:AUDUSD", d: "AUD/USD" },
            { s: "FX:USDCAD", d: "USD/CAD" },
          ],
        },
        {
          title: "Crypto",
          symbols: [
            { s: "BITSTAMP:BTCUSD", d: "Bitcoin" },
            { s: "BITSTAMP:ETHUSD", d: "Ethereum" },
            { s: "BINANCE:BNBUSDT", d: "BNB" },
            { s: "BINANCE:SOLUSDT", d: "Solana" },
            { s: "BINANCE:XRPUSDT", d: "XRP" },
            { s: "BINANCE:ADAUSDT", d: "Cardano" },
          ],
        },
      ],
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = "";
      }
    };
  }, [theme]);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget" />
    </div>
  );
}

export const MarketOverview = memo(MarketOverviewComponent);
