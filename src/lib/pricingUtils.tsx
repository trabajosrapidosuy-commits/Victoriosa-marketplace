'use client'

import { useState } from 'react'

// Price calculation utilities
export const MARGIN_PRESETS = [
  { label: 'Budget (50%)', value: 50 },
  { label: 'Standard (75%)', value: 75 },
  { label: 'Premium (100%)', value: 100 },
  { label: 'Luxury (150%)', value: 150 },
]

export function calculateRetailPrice(supplierCost: number, marginPct: number): number {
  return supplierCost + (supplierCost * marginPct / 100)
}

export function calculateProfit(supplierCost: number, retailPrice: number): number {
  return retailPrice - supplierCost
}

export function calculateMarginPercentage(supplierCost: number, retailPrice: number): number {
  if (supplierCost === 0) return 0
  return ((retailPrice - supplierCost) / supplierCost) * 100
}

// React component for price calculator
export function PriceCalculator() {
  const [supplierCost, setSupplierCost] = useState(500)
  const [marginPct, setMarginPct] = useState(75)

  const retailPrice = calculateRetailPrice(supplierCost, marginPct)
  const profit = calculateProfit(supplierCost, retailPrice)

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-4">
      <h2 className="text-xl font-bold">💰 Price Calculator</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold mb-2">Supplier Cost (UYU)</label>
          <input
            type="number"
            value={supplierCost}
            onChange={(e) => setSupplierCost(parseFloat(e.target.value) || 0)}
            step="0.01"
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Margin %</label>
          <input
            type="number"
            value={marginPct}
            onChange={(e) => setMarginPct(parseFloat(e.target.value) || 0)}
            step="0.01"
            className="w-full border rounded p-2"
          />
        </div>
      </div>

      {/* Quick Presets */}
      <div>
        <label className="block font-semibold mb-2">Margin Presets</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {MARGIN_PRESETS.map(preset => (
            <button
              key={preset.value}
              onClick={() => setMarginPct(preset.value)}
              className={`p-2 rounded text-sm font-semibold transition ${
                marginPct === preset.value
                  ? 'bg-victoriosa-primary text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="bg-gradient-to-r from-victoriosa-primary to-victoriosa-secondary text-white p-4 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm opacity-90">Retail Price</p>
            <p className="text-2xl font-bold">${retailPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm opacity-90">Profit per Unit</p>
            <p className="text-2xl font-bold">${profit.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm opacity-90">Return on Cost</p>
            <p className="text-2xl font-bold">{marginPct.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-2">Profit Comparison</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Margin</th>
              <th className="p-2 text-right">Retail Price</th>
              <th className="p-2 text-right">Profit/Unit</th>
              <th className="p-2 text-right">% Return</th>
            </tr>
          </thead>
          <tbody>
            {[50, 75, 100, 125, 150].map(margin => {
              const price = calculateRetailPrice(supplierCost, margin)
              const prof = calculateProfit(supplierCost, price)
              return (
                <tr key={margin} className="border-t hover:bg-gray-50">
                  <td className="p-2">{margin}%</td>
                  <td className="p-2 text-right">${price.toFixed(2)}</td>
                  <td className="p-2 text-right font-semibold text-green-600">${prof.toFixed(2)}</td>
                  <td className="p-2 text-right">{margin}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
