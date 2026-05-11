export function calculatePrice(baseCost: number) {
  const fuel = baseCost * 0.15;
  const costWithFuel = baseCost + fuel;

  const handling = 25;

  const subtotal = costWithFuel + handling;

  const profit = subtotal * 0.25;

  let priceBeforeStripe = subtotal + profit;

  // Add Stripe fee buffer
  const stripeFee = priceBeforeStripe * 0.029 + 1;

  let finalPrice = priceBeforeStripe + stripeFee;

  // Round to nearest 5
  finalPrice = Math.ceil(finalPrice / 5) * 5;

  return {
    baseCost,
    fuel,
    handling,
    profit,
    stripeFee,
    finalPrice
  };
}