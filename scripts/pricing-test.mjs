const cost = 10, shipping = 3, fees = 1, risk = 8, margin = 55;
const base = (cost + shipping + fees) * (1 + risk / 100);
const sale = base * (1 + margin / 100);
console.log(JSON.stringify({ cost, shipping, fees, risk, margin, suggestedSalePrice: Math.round(sale * 100) / 100 }, null, 2));
