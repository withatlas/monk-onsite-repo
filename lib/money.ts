const amountPattern = /^-?\d+(\.\d{1,2})?$/;

export function dollarsToCents(value: string | number): number {
  const normalized =
    typeof value === "number"
      ? value.toFixed(2)
      : value.trim().replaceAll(",", "").replace("$", "");

  if (!amountPattern.test(normalized)) {
    throw new Error(`Invalid amount: ${value}`);
  }

  const sign = normalized.startsWith("-") ? -1 : 1;
  const unsigned = normalized.replace("-", "");
  const [dollars, cents = ""] = unsigned.split(".");

  return sign * (Number(dollars) * 100 + Number(cents.padEnd(2, "0")));
}

export function centsToDollars(value: number): string {
  const sign = value < 0 ? "-" : "";
  const absolute = Math.abs(value);
  const dollars = Math.floor(absolute / 100);
  const cents = String(absolute % 100).padStart(2, "0");

  return `${sign}$${dollars.toLocaleString("en-US")}.${cents}`;
}

export function numberToDateString(value: Date): string {
  return value.toISOString().slice(0, 10);
}
