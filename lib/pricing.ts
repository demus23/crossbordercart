export function calculateShippingPrice({
  weightKg,
  pricePerKg,
  fuelPercent = 10,
  profitPercent = 20,
  stripePercent = 3,
}: {
  weightKg: number;
  pricePerKg: number;
  fuelPercent?: number;
  profitPercent?: number;
  stripePercent?: number;
}) {
  const base = weightKg * pricePerKg;
  const fuel = base * (fuelPercent / 100);
  const profit = base * (profitPercent / 100);
  const beforeStripe = base + fuel + profit;
  const stripeFee = beforeStripe * (stripePercent / 100);
  const total = beforeStripe + stripeFee;

  return {
    base: Number(base.toFixed(2)),
    fuel: Number(fuel.toFixed(2)),
    profit: Number(profit.toFixed(2)),
    stripeFee: Number(stripeFee.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}