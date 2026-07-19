/** Shared number formatting. All display formatting lives here, never in the engine. */

export const fmtMillions = (n) => `${(n / 1e6).toFixed(2)}M`;
export const fmtBillions = (n) => `$${(n / 1e9).toFixed(1)}B`;
export const fmtCount = (n) => n.toLocaleString("en-US");
export const fmtPct = (n, digits = 1) => `${(100 * n).toFixed(digits)}%`;
export const fmtRate = (n) => `${n.toFixed(2)}%`;
export const fmtUSD = (n) => `$${Math.round(n).toLocaleString("en-US")}`;
