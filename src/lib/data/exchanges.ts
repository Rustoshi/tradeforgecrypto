// Exchange data for the Buy Crypto guide
// Provides curated exchange recommendations by country with tiered fallback

export interface Exchange {
    id: string;
    name: string;
    url: string;
    logo?: string; // Optional - will use initials if not provided
    paymentMethods: string[];
    fees: string; // e.g., "0.5% - 2%"
    speed: "instant" | "fast" | "moderate"; // Processing speed
    description?: string;
    referralCode?: string; // Optional affiliate code
}

export interface CountryInfo {
    name: string;
    region: Region;
}

export type Region =
    | "north_america"
    | "europe"
    | "africa"
    | "asia_pacific"
    | "middle_east"
    | "latin_america"
    | "oceania";

// Map of ISO country codes to country info
export const countryData: Record<string, CountryInfo> = {
    // North America
    US: { name: "United States", region: "north_america" },
    CA: { name: "Canada", region: "north_america" },
    MX: { name: "Mexico", region: "north_america" },

    // Europe
    GB: { name: "United Kingdom", region: "europe" },
    DE: { name: "Germany", region: "europe" },
    FR: { name: "France", region: "europe" },
    ES: { name: "Spain", region: "europe" },
    IT: { name: "Italy", region: "europe" },
    NL: { name: "Netherlands", region: "europe" },
    BE: { name: "Belgium", region: "europe" },
    AT: { name: "Austria", region: "europe" },
    CH: { name: "Switzerland", region: "europe" },
    PL: { name: "Poland", region: "europe" },
    SE: { name: "Sweden", region: "europe" },
    NO: { name: "Norway", region: "europe" },
    DK: { name: "Denmark", region: "europe" },
    FI: { name: "Finland", region: "europe" },
    IE: { name: "Ireland", region: "europe" },
    PT: { name: "Portugal", region: "europe" },
    GR: { name: "Greece", region: "europe" },
    CZ: { name: "Czech Republic", region: "europe" },
    RO: { name: "Romania", region: "europe" },
    HU: { name: "Hungary", region: "europe" },
    UA: { name: "Ukraine", region: "europe" },
    BG: { name: "Bulgaria", region: "europe" },
    HR: { name: "Croatia", region: "europe" },
    SK: { name: "Slovakia", region: "europe" },
    SI: { name: "Slovenia", region: "europe" },
    LT: { name: "Lithuania", region: "europe" },
    LV: { name: "Latvia", region: "europe" },
    EE: { name: "Estonia", region: "europe" },
    LU: { name: "Luxembourg", region: "europe" },
    MT: { name: "Malta", region: "europe" },
    CY: { name: "Cyprus", region: "europe" },
    RS: { name: "Serbia", region: "europe" },
    AL: { name: "Albania", region: "europe" },
    MK: { name: "North Macedonia", region: "europe" },
    BA: { name: "Bosnia and Herzegovina", region: "europe" },
    ME: { name: "Montenegro", region: "europe" },

    // Africa
    NG: { name: "Nigeria", region: "africa" },
    GH: { name: "Ghana", region: "africa" },
    KE: { name: "Kenya", region: "africa" },
    ZA: { name: "South Africa", region: "africa" },
    EG: { name: "Egypt", region: "africa" },
    TZ: { name: "Tanzania", region: "africa" },
    UG: { name: "Uganda", region: "africa" },
    RW: { name: "Rwanda", region: "africa" },
    CM: { name: "Cameroon", region: "africa" },
    SN: { name: "Senegal", region: "africa" },
    CI: { name: "Côte d'Ivoire", region: "africa" },
    MA: { name: "Morocco", region: "africa" },
    DZ: { name: "Algeria", region: "africa" },
    TN: { name: "Tunisia", region: "africa" },
    ET: { name: "Ethiopia", region: "africa" },
    ZM: { name: "Zambia", region: "africa" },
    ZW: { name: "Zimbabwe", region: "africa" },
    BW: { name: "Botswana", region: "africa" },
    MU: { name: "Mauritius", region: "africa" },
    NA: { name: "Namibia", region: "africa" },
    AO: { name: "Angola", region: "africa" },
    MZ: { name: "Mozambique", region: "africa" },

    // Asia Pacific
    IN: { name: "India", region: "asia_pacific" },
    PH: { name: "Philippines", region: "asia_pacific" },
    ID: { name: "Indonesia", region: "asia_pacific" },
    VN: { name: "Vietnam", region: "asia_pacific" },
    TH: { name: "Thailand", region: "asia_pacific" },
    MY: { name: "Malaysia", region: "asia_pacific" },
    SG: { name: "Singapore", region: "asia_pacific" },
    JP: { name: "Japan", region: "asia_pacific" },
    KR: { name: "South Korea", region: "asia_pacific" },
    PK: { name: "Pakistan", region: "asia_pacific" },
    BD: { name: "Bangladesh", region: "asia_pacific" },
    HK: { name: "Hong Kong", region: "asia_pacific" },
    TW: { name: "Taiwan", region: "asia_pacific" },
    LK: { name: "Sri Lanka", region: "asia_pacific" },
    NP: { name: "Nepal", region: "asia_pacific" },
    MM: { name: "Myanmar", region: "asia_pacific" },
    KH: { name: "Cambodia", region: "asia_pacific" },
    LA: { name: "Laos", region: "asia_pacific" },
    CN: { name: "China", region: "asia_pacific" },
    MN: { name: "Mongolia", region: "asia_pacific" },

    // Middle East
    AE: { name: "United Arab Emirates", region: "middle_east" },
    SA: { name: "Saudi Arabia", region: "middle_east" },
    TR: { name: "Turkey", region: "middle_east" },
    IL: { name: "Israel", region: "middle_east" },
    QA: { name: "Qatar", region: "middle_east" },
    KW: { name: "Kuwait", region: "middle_east" },
    BH: { name: "Bahrain", region: "middle_east" },
    OM: { name: "Oman", region: "middle_east" },
    JO: { name: "Jordan", region: "middle_east" },
    LB: { name: "Lebanon", region: "middle_east" },
    IQ: { name: "Iraq", region: "middle_east" },
    IR: { name: "Iran", region: "middle_east" },

    // Latin America
    BR: { name: "Brazil", region: "latin_america" },
    AR: { name: "Argentina", region: "latin_america" },
    CL: { name: "Chile", region: "latin_america" },
    CO: { name: "Colombia", region: "latin_america" },
    PE: { name: "Peru", region: "latin_america" },
    VE: { name: "Venezuela", region: "latin_america" },
    EC: { name: "Ecuador", region: "latin_america" },
    UY: { name: "Uruguay", region: "latin_america" },
    PY: { name: "Paraguay", region: "latin_america" },
    BO: { name: "Bolivia", region: "latin_america" },
    CR: { name: "Costa Rica", region: "latin_america" },
    PA: { name: "Panama", region: "latin_america" },
    GT: { name: "Guatemala", region: "latin_america" },
    HN: { name: "Honduras", region: "latin_america" },
    SV: { name: "El Salvador", region: "latin_america" },
    NI: { name: "Nicaragua", region: "latin_america" },
    DO: { name: "Dominican Republic", region: "latin_america" },
    CU: { name: "Cuba", region: "latin_america" },
    PR: { name: "Puerto Rico", region: "latin_america" },
    JM: { name: "Jamaica", region: "latin_america" },
    TT: { name: "Trinidad and Tobago", region: "latin_america" },

    // Oceania
    AU: { name: "Australia", region: "oceania" },
    NZ: { name: "New Zealand", region: "oceania" },
    FJ: { name: "Fiji", region: "oceania" },
    PG: { name: "Papua New Guinea", region: "oceania" },
};

// Country-specific exchanges (priority exchanges for specific countries)
export const countryExchanges: Record<string, Exchange[]> = {
    // United States
    US: [
        {
            id: "coinbase",
            name: "Coinbase",
            url: "https://www.coinbase.com/signup",
            paymentMethods: ["Bank Transfer", "Debit Card", "Wire Transfer"],
            fees: "0.5% - 2%",
            speed: "fast",
            description: "Largest US exchange, beginner-friendly",
        },
        {
            id: "kraken",
            name: "Kraken",
            url: "https://www.kraken.com/sign-up",
            paymentMethods: ["Bank Transfer", "Wire Transfer"],
            fees: "0.16% - 0.26%",
            speed: "moderate",
            description: "Low fees, advanced trading features",
        },
        {
            id: "cashapp",
            name: "Cash App",
            url: "https://cash.app",
            paymentMethods: ["Debit Card", "Bank Transfer"],
            fees: "1.5% - 2%",
            speed: "instant",
            description: "Simple Bitcoin buying via mobile app",
        },
        {
            id: "gemini",
            name: "Gemini",
            url: "https://www.gemini.com/share",
            paymentMethods: ["Bank Transfer", "Debit Card", "Wire Transfer"],
            fees: "0.5% - 1.49%",
            speed: "fast",
            description: "Regulated US exchange, strong security",
        },
        {
            id: "binance_us",
            name: "Binance.US",
            url: "https://www.binance.us",
            paymentMethods: ["Bank Transfer", "Debit Card"],
            fees: "0.1% - 0.5%",
            speed: "fast",
            description: "Low fees (Unavailable in TX, NY, V'T, HI)",
        },
        {
            id: "crypto_com_us",
            name: "Crypto.com App",
            url: "https://crypto.com/app",
            paymentMethods: ["Bank Transfer", "Card"],
            fees: "0% - 2.99%",
            speed: "instant",
            description: "Top rated mobile app (Available in 49 states)",
        },
    ],

    // Canada
    CA: [
        {
            id: "shakepay",
            name: "Shakepay",
            url: "https://shakepay.com",
            paymentMethods: ["E-Transfer", "Bank Transfer"],
            fees: "1.5% - 2%",
            speed: "instant",
            description: "Canadian-focused, no trading fees",
        },
        {
            id: "newton",
            name: "Newton",
            url: "https://www.newton.co",
            paymentMethods: ["E-Transfer", "Bank Transfer"],
            fees: "0.5% - 1%",
            speed: "fast",
            description: "Low fees, no deposit fees",
        },
        {
            id: "kraken_ca",
            name: "Kraken",
            url: "https://www.kraken.com/sign-up",
            paymentMethods: ["Bank Transfer", "Wire Transfer"],
            fees: "0.16% - 0.26%",
            speed: "moderate",
            description: "Low trading fees, CAD pairs",
        },
        {
            id: "coinbase_ca",
            name: "Coinbase",
            url: "https://www.coinbase.com/signup",
            paymentMethods: ["Bank Transfer", "Debit Card"],
            fees: "0.5% - 2%",
            speed: "fast",
            description: "Beginner-friendly, trusted platform",
        },
        {
            id: "crypto_com_ca",
            name: "Crypto.com",
            url: "https://crypto.com/app",
            paymentMethods: ["E-Transfer", "Card"],
            fees: "0% - 2.99%",
            speed: "instant",
            description: "Supports CAD E-Transfers",
        },
        {
            id: "bitcoin_com_ca",
            name: "Bitcoin.com",
            url: "https://www.bitcoin.com",
            paymentMethods: ["Card", "Apple Pay"],
            fees: "Varies",
            speed: "fast",
            description: "Buy Bitcoin instantly",
        },
    ],

    // United Kingdom
    GB: [
        {
            id: "coinbase_uk",
            name: "Coinbase",
            url: "https://www.coinbase.com/signup",
            paymentMethods: ["Bank Transfer", "Debit Card", "Faster Payments"],
            fees: "0.5% - 2%",
            speed: "instant",
            description: "Easy GBP deposits, beginner-friendly",
        },
        {
            id: "kraken_uk",
            name: "Kraken",
            url: "https://www.kraken.com/sign-up",
            paymentMethods: ["Bank Transfer", "Faster Payments"],
            fees: "0.16% - 0.26%",
            speed: "fast",
            description: "Low fees, advanced features",
        },
        {
            id: "revolut",
            name: "Revolut",
            url: "https://www.revolut.com",
            paymentMethods: ["Bank Transfer", "Card"],
            fees: "1% - 2.5%",
            speed: "instant",
            description: "All-in-one banking app with crypto",
        },
        {
            id: "binance_uk",
            name: "Binance",
            url: "https://www.binance.com/en/register",
            paymentMethods: ["Bank Transfer", "Debit Card"],
            fees: "0.1%",
            speed: "fast",
            description: "Lowest fees, most cryptocurrencies",
        },
        {
            id: "crypto_com_uk",
            name: "Crypto.com",
            url: "https://crypto.com/app",
            paymentMethods: ["Faster Payments", "Card"],
            fees: "0% - 2.99%",
            speed: "instant",
            description: "Great mobile app with GBP wallets",
        },
        {
            id: "bitcoin_com_uk",
            name: "Bitcoin.com",
            url: "https://www.bitcoin.com",
            paymentMethods: ["Card", "Apple Pay"],
            fees: "Varies",
            speed: "fast",
            description: "Buy crypto instantly",
        },
    ],

    // Germany
    DE: [
        {
            id: "bitpanda",
            name: "Bitpanda",
            url: "https://www.bitpanda.com",
            paymentMethods: ["SEPA", "Credit Card", "Sofort"],
            fees: "1% - 1.5%",
            speed: "fast",
            description: "Austrian exchange, EUR deposits",
        },
        {
            id: "kraken_de",
            name: "Kraken",
            url: "https://www.kraken.com/sign-up",
            paymentMethods: ["SEPA", "Bank Transfer"],
            fees: "0.16% - 0.26%",
            speed: "moderate",
            description: "Low fees, EUR trading pairs",
        },
        {
            id: "bitvavo",
            name: "Bitvavo",
            url: "https://bitvavo.com/invite",
            paymentMethods: ["SEPA", "iDEAL", "Bank Transfer"],
            fees: "0.03% - 0.25%",
            speed: "fast",
            description: "Very low fees, Dutch platform",
        },
        {
            id: "coinbase_de",
            name: "Coinbase",
            url: "https://www.coinbase.com/signup",
            paymentMethods: ["SEPA", "Credit Card"],
            fees: "0.5% - 2%",
            speed: "fast",
            description: "Beginner-friendly, regulated",
        },
    ],

    // Nigeria
    NG: [
        {
            id: "luno_ng",
            name: "Luno",
            url: "https://www.luno.com/signup",
            paymentMethods: ["Bank Transfer", "Card"],
            fees: "0% - 1%",
            speed: "fast",
            description: "Local NGN deposits, trusted in Nigeria",
        },
        {
            id: "quidax",
            name: "Quidax",
            url: "https://www.quidax.com",
            paymentMethods: ["Bank Transfer", "Card"],
            fees: "0.5% - 1%",
            speed: "fast",
            description: "Nigerian exchange, instant NGN deposits",
        },
        {
            id: "binance_p2p_ng",
            name: "Binance P2P",
            url: "https://p2p.binance.com",
            paymentMethods: ["Bank Transfer", "Mobile Money"],
            fees: "0%",
            speed: "moderate",
            description: "Trade directly with sellers, zero fees",
        },
        {
            id: "paxful",
            name: "Paxful",
            url: "https://paxful.com",
            paymentMethods: ["Bank Transfer", "Gift Cards", "Mobile Money"],
            fees: "0% - 1%",
            speed: "moderate",
            description: "Peer-to-peer, many payment options",
        },
    ],

    // Ghana
    GH: [
        {
            id: "binance_p2p_gh",
            name: "Binance P2P",
            url: "https://p2p.binance.com",
            paymentMethods: ["Bank Transfer", "Mobile Money", "MTN MoMo"],
            fees: "0%",
            speed: "moderate",
            description: "Trade with local sellers, supports GHS",
        },
        {
            id: "paxful_gh",
            name: "Paxful",
            url: "https://paxful.com",
            paymentMethods: ["Bank Transfer", "Mobile Money", "Gift Cards"],
            fees: "0% - 1%",
            speed: "moderate",
            description: "Multiple payment methods available",
        },
        {
            id: "luno_gh",
            name: "Luno",
            url: "https://www.luno.com/signup",
            paymentMethods: ["Bank Transfer"],
            fees: "0% - 1%",
            speed: "fast",
            description: "Trusted African exchange",
        },
    ],

    // Kenya
    KE: [
        {
            id: "binance_p2p_ke",
            name: "Binance P2P",
            url: "https://p2p.binance.com",
            paymentMethods: ["M-Pesa", "Bank Transfer"],
            fees: "0%",
            speed: "fast",
            description: "M-Pesa support, trade with locals",
        },
        {
            id: "paxful_ke",
            name: "Paxful",
            url: "https://paxful.com",
            paymentMethods: ["M-Pesa", "Bank Transfer", "Airtel Money"],
            fees: "0% - 1%",
            speed: "moderate",
            description: "Popular in Kenya, M-Pesa accepted",
        },
        {
            id: "yellowcard",
            name: "Yellow Card",
            url: "https://yellowcard.io",
            paymentMethods: ["M-Pesa", "Bank Transfer"],
            fees: "1% - 2%",
            speed: "fast",
            description: "African-focused, easy mobile money",
        },
    ],

    // South Africa
    ZA: [
        {
            id: "luno_za",
            name: "Luno",
            url: "https://www.luno.com/signup",
            paymentMethods: ["EFT", "Bank Transfer"],
            fees: "0% - 1%",
            speed: "fast",
            description: "South African exchange, ZAR deposits",
        },
        {
            id: "valr",
            name: "VALR",
            url: "https://www.valr.com",
            paymentMethods: ["EFT", "Bank Transfer"],
            fees: "0.1% - 0.75%",
            speed: "fast",
            description: "Low fees, SA-based exchange",
        },
        {
            id: "binance_za",
            name: "Binance",
            url: "https://www.binance.com/en/register",
            paymentMethods: ["Card", "Bank Transfer"],
            fees: "0.1%",
            speed: "fast",
            description: "Most cryptocurrencies available",
        },
    ],

    // India
    IN: [
        {
            id: "wazirx",
            name: "WazirX",
            url: "https://wazirx.com/invite",
            paymentMethods: ["UPI", "Bank Transfer", "NEFT"],
            fees: "0.2%",
            speed: "fast",
            description: "India's largest exchange, INR deposits",
        },
        {
            id: "coindcx",
            name: "CoinDCX",
            url: "https://coindcx.com",
            paymentMethods: ["UPI", "Bank Transfer"],
            fees: "0.1% - 0.5%",
            speed: "fast",
            description: "Easy INR deposits, many coins",
        },
        {
            id: "zebpay",
            name: "ZebPay",
            url: "https://zebpay.com",
            paymentMethods: ["UPI", "Bank Transfer"],
            fees: "0.15% - 0.25%",
            speed: "fast",
            description: "Trusted Indian exchange since 2014",
        },
        {
            id: "binance_in",
            name: "Binance",
            url: "https://www.binance.com/en/register",
            paymentMethods: ["P2P", "Bank Transfer"],
            fees: "0.1%",
            speed: "moderate",
            description: "Use P2P for INR trading",
        },
    ],

    // Philippines
    PH: [
        {
            id: "coins_ph",
            name: "Coins.ph",
            url: "https://coins.ph",
            paymentMethods: ["GCash", "Bank Transfer", "7-Eleven"],
            fees: "1% - 2%",
            speed: "instant",
            description: "Most popular in PH, GCash integration",
        },
        {
            id: "binance_p2p_ph",
            name: "Binance P2P",
            url: "https://p2p.binance.com",
            paymentMethods: ["GCash", "Bank Transfer", "PayMaya"],
            fees: "0%",
            speed: "fast",
            description: "Trade with local sellers",
        },
        {
            id: "pdax",
            name: "PDAX",
            url: "https://pdax.ph",
            paymentMethods: ["Bank Transfer", "GCash"],
            fees: "0.5% - 1%",
            speed: "fast",
            description: "Philippine-based regulated exchange",
        },
    ],

    // Indonesia
    ID: [
        {
            id: "indodax",
            name: "Indodax",
            url: "https://indodax.com",
            paymentMethods: ["Bank Transfer", "OVO", "GoPay"],
            fees: "0.3%",
            speed: "fast",
            description: "Largest Indonesian exchange",
        },
        {
            id: "tokocrypto",
            name: "Tokocrypto",
            url: "https://www.tokocrypto.com",
            paymentMethods: ["Bank Transfer", "OVO", "QRIS"],
            fees: "0.1% - 0.5%",
            speed: "fast",
            description: "Binance partner in Indonesia",
        },
        {
            id: "binance_p2p_id",
            name: "Binance P2P",
            url: "https://p2p.binance.com",
            paymentMethods: ["Bank Transfer", "OVO", "Dana"],
            fees: "0%",
            speed: "moderate",
            description: "Zero-fee P2P trading",
        },
    ],

    // Singapore
    SG: [
        {
            id: "coinhako",
            name: "Coinhako",
            url: "https://www.coinhako.com",
            paymentMethods: ["Bank Transfer", "PayNow", "Xfers"],
            fees: "0.6% - 0.8%",
            speed: "instant",
            description: "Singapore-licensed, SGD deposits",
        },
        {
            id: "gemini_sg",
            name: "Gemini",
            url: "https://www.gemini.com/share",
            paymentMethods: ["Bank Transfer", "Xfers"],
            fees: "0.5% - 1.49%",
            speed: "fast",
            description: "MAS registered, secure platform",
        },
        {
            id: "kraken_sg",
            name: "Kraken",
            url: "https://www.kraken.com/sign-up",
            paymentMethods: ["Bank Transfer"],
            fees: "0.16% - 0.26%",
            speed: "moderate",
            description: "Low fees, many trading pairs",
        },
    ],

    // Australia
    AU: [
        {
            id: "swyftx",
            name: "Swyftx",
            url: "https://swyftx.com",
            paymentMethods: ["PayID", "Bank Transfer", "POLi"],
            fees: "0.6%",
            speed: "instant",
            description: "Australian exchange, AUD deposits",
        },
        {
            id: "coinspot",
            name: "CoinSpot",
            url: "https://www.coinspot.com.au",
            paymentMethods: ["PayID", "POLi", "BPAY", "Cash"],
            fees: "0.1% - 1%",
            speed: "instant",
            description: "Most coins in Australia, easy to use",
        },
        {
            id: "independentreserve",
            name: "Independent Reserve",
            url: "https://www.independentreserve.com",
            paymentMethods: ["Bank Transfer", "POLi"],
            fees: "0.1% - 0.5%",
            speed: "fast",
            description: "Low fees, tax reports included",
        },
        {
            id: "kraken_au",
            name: "Kraken",
            url: "https://www.kraken.com/sign-up",
            paymentMethods: ["Bank Transfer"],
            fees: "0.16% - 0.26%",
            speed: "moderate",
            description: "Low trading fees, advanced features",
        },
        {
            id: "crypto_com_au",
            name: "Crypto.com",
            url: "https://crypto.com/app",
            paymentMethods: ["PayID", "Card", "BPAY"],
            fees: "0% - 2.99%",
            speed: "instant",
            description: "PayID support, metal cards",
        },
        {
            id: "bitcoin_com_au",
            name: "Bitcoin.com",
            url: "https://www.bitcoin.com",
            paymentMethods: ["Card", "Apple Pay"],
            fees: "Varies",
            speed: "fast",
            description: "Buy crypto instantly",
        },
    ],

    // Brazil
    BR: [
        {
            id: "mercadobitcoin",
            name: "Mercado Bitcoin",
            url: "https://www.mercadobitcoin.com.br",
            paymentMethods: ["PIX", "Bank Transfer", "TED"],
            fees: "0.3% - 0.7%",
            speed: "instant",
            description: "Largest Brazilian exchange, PIX support",
        },
        {
            id: "binance_br",
            name: "Binance",
            url: "https://www.binance.com/en/register",
            paymentMethods: ["PIX", "Bank Transfer"],
            fees: "0.1%",
            speed: "instant",
            description: "Low fees, BRL deposits via PIX",
        },
        {
            id: "foxbit",
            name: "Foxbit",
            url: "https://foxbit.com.br",
            paymentMethods: ["PIX", "Bank Transfer"],
            fees: "0.25% - 0.5%",
            speed: "instant",
            description: "Brazilian exchange, instant PIX",
        },
    ],

    // UAE
    AE: [
        {
            id: "binance_ae",
            name: "Binance",
            url: "https://www.binance.com/en/register",
            paymentMethods: ["Bank Transfer", "Card"],
            fees: "0.1%",
            speed: "fast",
            description: "Licensed in UAE, AED deposits",
        },
        {
            id: "rain",
            name: "Rain",
            url: "https://www.rain.com",
            paymentMethods: ["Bank Transfer", "Card"],
            fees: "0% - 2%",
            speed: "fast",
            description: "MENA-focused, regulated exchange",
        },
        {
            id: "bitoasis",
            name: "BitOasis",
            url: "https://bitoasis.net",
            paymentMethods: ["Bank Transfer", "Card"],
            fees: "0.3% - 1%",
            speed: "fast",
            description: "Dubai-based, AED and SAR support",
        },
    ],

    // Turkey
    TR: [
        {
            id: "btcturk",
            name: "BtcTurk",
            url: "https://www.btcturk.com",
            paymentMethods: ["Bank Transfer", "Card"],
            fees: "0.1% - 0.2%",
            speed: "fast",
            description: "Turkey's first exchange, TRY deposits",
        },
        {
            id: "paribu",
            name: "Paribu",
            url: "https://www.paribu.com",
            paymentMethods: ["Bank Transfer"],
            fees: "0.1% - 0.35%",
            speed: "fast",
            description: "Large Turkish exchange",
        },
        {
            id: "binance_tr",
            name: "Binance",
            url: "https://www.binance.com/en/register",
            paymentMethods: ["Bank Transfer", "Card"],
            fees: "0.1%",
            speed: "fast",
            description: "Direct TRY deposits",
        },
    ],

    // Japan
    JP: [
        {
            id: "bitflyer",
            name: "bitFlyer",
            url: "https://bitflyer.com/en-jp",
            paymentMethods: ["Bank Transfer"],
            fees: "0.01% - 0.15%",
            speed: "fast",
            description: "Japan's largest exchange, low fees",
        },
        {
            id: "coincheck",
            name: "Coincheck",
            url: "https://coincheck.com",
            paymentMethods: ["Bank Transfer", "Convenience Store"],
            fees: "0%",
            speed: "fast",
            description: "Zero trading fees, easy to use",
        },
        {
            id: "gmo_coin",
            name: "GMO Coin",
            url: "https://coin.z.com/jp",
            paymentMethods: ["Bank Transfer"],
            fees: "0%",
            speed: "fast",
            description: "Free trading, backed by GMO Internet",
        },
    ],

    // South Korea
    KR: [
        {
            id: "upbit",
            name: "Upbit",
            url: "https://upbit.com",
            paymentMethods: ["Bank Transfer"],
            fees: "0.05%",
            speed: "instant",
            description: "Korea's largest exchange",
        },
        {
            id: "bithumb",
            name: "Bithumb",
            url: "https://www.bithumb.com",
            paymentMethods: ["Bank Transfer"],
            fees: "0.04% - 0.15%",
            speed: "instant",
            description: "Major Korean exchange",
        },
        {
            id: "coinone",
            name: "Coinone",
            url: "https://coinone.co.kr",
            paymentMethods: ["Bank Transfer"],
            fees: "0.1% - 0.2%",
            speed: "fast",
            description: "Trusted Korean platform",
        },
    ],
};

// Regional exchange fallbacks
export const regionExchanges: Record<Region, Exchange[]> = {
    north_america: [
        {
            id: "coinbase_na",
            name: "Coinbase",
            url: "https://www.coinbase.com/signup",
            paymentMethods: ["Bank Transfer", "Card"],
            fees: "0.5% - 2%",
            speed: "fast",
            description: "Beginner-friendly, regulated in US/CA",
        },
        {
            id: "kraken_na",
            name: "Kraken",
            url: "https://www.kraken.com/sign-up",
            paymentMethods: ["Bank Transfer", "Wire"],
            fees: "0.16% - 0.26%",
            speed: "moderate",
            description: "Low fees, trusted exchange",
        },
        {
            id: "gemini_na",
            name: "Gemini",
            url: "https://www.gemini.com/share",
            paymentMethods: ["Bank Transfer", "Wire"],
            fees: "0.5% - 1.49%",
            speed: "fast",
            description: "Highly regulated, safe for NA users",
        },
    ],

    europe: [
        {
            id: "kraken_eu",
            name: "Kraken",
            url: "https://www.kraken.com/sign-up",
            paymentMethods: ["SEPA", "Bank Transfer"],
            fees: "0.16% - 0.26%",
            speed: "moderate",
            description: "Low fees, EUR trading pairs",
        },
        {
            id: "bitvavo_eu",
            name: "Bitvavo",
            url: "https://bitvavo.com/invite",
            paymentMethods: ["SEPA", "iDEAL", "Bank Transfer"],
            fees: "0.03% - 0.25%",
            speed: "fast",
            description: "Very low fees, European platform",
        },
        {
            id: "coinbase_eu",
            name: "Coinbase",
            url: "https://www.coinbase.com/signup",
            paymentMethods: ["SEPA", "Card"],
            fees: "0.5% - 2%",
            speed: "fast",
            description: "Easy EUR deposits, regulated",
        },
        {
            id: "binance_eu",
            name: "Binance",
            url: "https://www.binance.com/en/register",
            paymentMethods: ["SEPA", "Card"],
            fees: "0.1%",
            speed: "fast",
            description: "Lowest fees, most options",
        },
        {
            id: "bybit_eu",
            name: "Bybit",
            url: "https://www.bybit.com/register",
            paymentMethods: ["SEPA", "Card"],
            fees: "0.1%",
            speed: "fast",
            description: "Popular for trading, easy EUR on-ramp",
        },
        {
            id: "crypto_com_eu",
            name: "Crypto.com",
            url: "https://crypto.com/app",
            paymentMethods: ["SEPA", "Card"],
            fees: "0% - 2.99%",
            speed: "instant",
            description: "Easy EUR deposits via SEPA",
        },
        {
            id: "bitcoin_com_eu",
            name: "Bitcoin.com",
            url: "https://www.bitcoin.com",
            paymentMethods: ["Card", "Apple Pay", "Google Pay"],
            fees: "Varies",
            speed: "fast",
            description: "Fastest way to buy Bitcoin",
        },
    ],

    africa: [
        {
            id: "binance_p2p_africa",
            name: "Binance P2P",
            url: "https://p2p.binance.com",
            paymentMethods: ["Bank Transfer", "Mobile Money"],
            fees: "0%",
            speed: "moderate",
            description: "Trade with local sellers, zero fees",
        },
        {
            id: "luno_africa",
            name: "Luno",
            url: "https://www.luno.com/signup",
            paymentMethods: ["Bank Transfer", "Card"],
            fees: "0% - 1%",
            speed: "fast",
            description: "African-focused, local currencies",
        },
        {
            id: "yellowcard_africa",
            name: "Yellow Card",
            url: "https://yellowcard.io",
            paymentMethods: ["Bank Transfer", "Mobile Money"],
            fees: "1% - 2%",
            speed: "fast",
            description: "Supports many African countries",
        },
        {
            id: "paxful_africa",
            name: "Paxful",
            url: "https://paxful.com",
            paymentMethods: ["Bank Transfer", "Mobile Money", "Gift Cards"],
            fees: "0% - 1%",
            speed: "moderate",
            description: "P2P with many payment options",
        },
    ],

    asia_pacific: [
        {
            id: "binance_asia",
            name: "Binance",
            url: "https://www.binance.com/en/register",
            paymentMethods: ["Bank Transfer", "Card", "P2P"],
            fees: "0.1%",
            speed: "fast",
            description: "Largest global exchange",
        },
        {
            id: "binance_p2p_asia",
            name: "Binance P2P",
            url: "https://p2p.binance.com",
            paymentMethods: ["Bank Transfer", "Mobile Wallets"],
            fees: "0%",
            speed: "moderate",
            description: "Local currency P2P trading",
        },
        {
            id: "kucoin_asia",
            name: "KuCoin",
            url: "https://www.kucoin.com/r",
            paymentMethods: ["Card", "P2P"],
            fees: "0.1%",
            speed: "fast",
            description: "Many altcoins, P2P available",
        },
        {
            id: "okx_asia",
            name: "OKX",
            url: "https://www.okx.com",
            paymentMethods: ["Card", "P2P", "Bank Transfer"],
            fees: "0.08% - 0.1%",
            speed: "fast",
            description: "Major Asian exchange",
        },
        {
            id: "bybit_asia",
            name: "Bybit",
            url: "https://www.bybit.com/register",
            paymentMethods: ["Card", "P2P", "Bank Transfer"],
            fees: "0.1%",
            speed: "fast",
            description: "Top tier exchange, P2P available",
        },
    ],

    middle_east: [
        {
            id: "binance_me",
            name: "Binance",
            url: "https://www.binance.com/en/register",
            paymentMethods: ["Bank Transfer", "Card"],
            fees: "0.1%",
            speed: "fast",
            description: "Licensed in UAE, accepts AED/SAR",
        },
        {
            id: "rain_me",
            name: "Rain",
            url: "https://www.rain.com",
            paymentMethods: ["Bank Transfer", "Card"],
            fees: "0% - 2%",
            speed: "fast",
            description: "Built for MENA region",
        },
        {
            id: "bitoasis_me",
            name: "BitOasis",
            url: "https://bitoasis.net",
            paymentMethods: ["Bank Transfer", "Card"],
            fees: "0.3% - 1%",
            speed: "fast",
            description: "Dubai-based, trusted in region",
        },
        {
            id: "okx_me",
            name: "OKX",
            url: "https://www.okx.com",
            paymentMethods: ["Card", "P2P"],
            fees: "0.08% - 0.1%",
            speed: "fast",
            description: "Low fees, many options",
        },
    ],

    latin_america: [
        {
            id: "binance_latam",
            name: "Binance",
            url: "https://www.binance.com/en/register",
            paymentMethods: ["Bank Transfer", "Card", "P2P"],
            fees: "0.1%",
            speed: "fast",
            description: "Supports most LATAM currencies",
        },
        {
            id: "binance_p2p_latam",
            name: "Binance P2P",
            url: "https://p2p.binance.com",
            paymentMethods: ["Bank Transfer", "Mobile Wallets"],
            fees: "0%",
            speed: "moderate",
            description: "Trade with local sellers",
        },
        {
            id: "bitso",
            name: "Bitso",
            url: "https://bitso.com",
            paymentMethods: ["Bank Transfer", "SPEI", "OXXO"],
            fees: "0.1% - 1%",
            speed: "fast",
            description: "Popular in Mexico, Argentina, Brazil",
        },
        {
            id: "ripio",
            name: "Ripio",
            url: "https://www.ripio.com",
            paymentMethods: ["Bank Transfer", "Card"],
            fees: "0.5% - 2%",
            speed: "fast",
            description: "Serves Argentina, Brazil, and more",
        },
    ],

    oceania: [
        {
            id: "swyftx_oceania",
            name: "Swyftx",
            url: "https://swyftx.com",
            paymentMethods: ["PayID", "Bank Transfer", "POLi"],
            fees: "0.6%",
            speed: "instant",
            description: "Australian & NZ focused",
        },
        {
            id: "coinspot_oceania",
            name: "CoinSpot",
            url: "https://www.coinspot.com.au",
            paymentMethods: ["PayID", "POLi", "BPAY"],
            fees: "0.1% - 1%",
            speed: "instant",
            description: "Most coins, easy to use",
        },
        {
            id: "independentreserve_oceania",
            name: "Independent Reserve",
            url: "https://www.independentreserve.com",
            paymentMethods: ["Bank Transfer"],
            fees: "0.1% - 0.5%",
            speed: "fast",
            description: "AU & NZ licensed",
        },
        {
            id: "kraken_oceania",
            name: "Kraken",
            url: "https://www.kraken.com/sign-up",
            paymentMethods: ["Bank Transfer"],
            fees: "0.16% - 0.26%",
            speed: "moderate",
            description: "Low fees, trusted globally",
        },
    ],
};

// Global exchanges (fallback for any country)
export const globalExchanges: Exchange[] = [
    {
        id: "binance_global",
        name: "Binance",
        url: "https://www.binance.com/en/register",
        paymentMethods: ["Card", "P2P", "Bank Transfer"],
        fees: "0.1%",
        speed: "fast",
        description: "World's largest exchange, 350+ cryptocurrencies",
    },
    {
        id: "bybit_global",
        name: "Bybit",
        url: "https://www.bybit.com/register",
        paymentMethods: ["Card", "P2P", "Bank Transfer"],
        fees: "0.1%",
        speed: "fast",
        description: "Top 3 exchange, easy onboarding",
    },
    {
        id: "kucoin_global",
        name: "KuCoin",
        url: "https://www.kucoin.com/r",
        paymentMethods: ["Card", "P2P"],
        fees: "0.1%",
        speed: "fast",
        description: "700+ cryptocurrencies, P2P available",
    },
    {
        id: "okx_global",
        name: "OKX",
        url: "https://www.okx.com",
        paymentMethods: ["Card", "P2P", "Bank Transfer"],
        fees: "0.08% - 0.1%",
        speed: "fast",
        description: "Low fees, global coverage",
    },
    {
        id: "mexc_global",
        name: "MEXC",
        url: "https://www.mexc.com/register",
        paymentMethods: ["Card", "P2P"],
        fees: "0%",
        speed: "fast",
        description: "Zero trading fees, 2000+ coins",
    },
    {
        id: "gate_global",
        name: "Gate.io",
        url: "https://www.gate.io/signup",
        paymentMethods: ["Card", "P2P", "Bank Transfer"],
        fees: "0.2%",
        speed: "fast",
        description: "1400+ cryptocurrencies",
    },
    {
        id: "crypto_com_global",
        name: "Crypto.com",
        url: "https://crypto.com/app",
        paymentMethods: ["Card", "Bank Transfer"],
        fees: "0% - 2.99%",
        speed: "instant",
        description: "Popular mobile app, metal Visa cards",
    },
    {
        id: "bitcoin_com_global",
        name: "Bitcoin.com",
        url: "https://www.bitcoin.com",
        paymentMethods: ["Card", "Apple Pay", "Google Pay"],
        fees: "Varies",
        speed: "fast",
        description: "Easiest way to buy Bitcoin and BCH",
    },
];

// Helper to get region for a country
export function getRegionForCountry(countryCode: string): Region | null {
    const country = countryData[countryCode.toUpperCase()];
    return country?.region || null;
}

// Helper to get country name
export function getCountryName(countryCode: string): string {
    const country = countryData[countryCode.toUpperCase()];
    return country?.name || countryCode;
}

// Main function to get exchanges for a country with tiered fallback
export function getExchangesForCountry(countryCode: string | undefined | null): {
    exchanges: Exchange[];
    source: "country" | "region" | "global";
    countryName: string;
    region: Region | null;
} {
    const code = countryCode?.toUpperCase() || "";

    // Tier 1: Country-specific exchanges
    if (code && countryExchanges[code]) {
        return {
            exchanges: countryExchanges[code],
            source: "country",
            countryName: getCountryName(code),
            region: getRegionForCountry(code),
        };
    }

    // Tier 2: Regional fallback
    const region = getRegionForCountry(code);
    if (region && regionExchanges[region]) {
        return {
            exchanges: regionExchanges[region],
            source: "region",
            countryName: getCountryName(code),
            region,
        };
    }

    // Tier 3: Global fallback
    // Filter out restricted exchanges for US users if falling back to global
    let fallbackExchanges = globalExchanges;
    if (code === 'US') {
        fallbackExchanges = globalExchanges.filter(ex =>
            !["binance_global", "bybit_global", "kucoin_global", "okx_global", "mexc_global", "gate_global", "bitcoin_com_global"].includes(ex.id)
        );
    }

    return {
        exchanges: fallbackExchanges,
        source: "global",
        countryName: code ? getCountryName(code) : "Unknown",
        region: null,
    };
}

// Get all available regions for manual selection
export function getAllRegions(): { id: Region; name: string }[] {
    return [
        { id: "north_america", name: "North America" },
        { id: "europe", name: "Europe" },
        { id: "africa", name: "Africa" },
        { id: "asia_pacific", name: "Asia Pacific" },
        { id: "middle_east", name: "Middle East" },
        { id: "latin_america", name: "Latin America" },
        { id: "oceania", name: "Oceania" },
    ];
}

// Get exchanges for a specific region
export function getExchangesForRegion(region: Region): Exchange[] {
    return regionExchanges[region] || globalExchanges;
}
