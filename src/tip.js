// Returns the tip for a bill, rounded to 2 decimals (cents).
export function calcTip(bill, percent) {
  const tip = bill * percent / 100;
  return Math.round(tip * 100) / 100;
}
