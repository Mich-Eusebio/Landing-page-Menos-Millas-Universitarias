'use client'
import React, { useState } from 'react'
import CheckoutFlow from '@/lib/apis/CheckoutFlow'

const mockDays = (n) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date(2027, 5, i + 1)
    return d.toISOString().split('T')[0]
  })

const presets = [
  { label: '1 día', n: 1 },
  { label: '4 días', n: 4 },
  { label: '5 días (msg 30 chars)', n: 5 },
  { label: '8 días (msg 60 chars)', n: 8 },
  { label: '15 días (msg 120 chars)', n: 15 },
]

export default function CheckoutFlowPreview() {
  const [count, setCount] = useState(3)
  const [open, setOpen] = useState(true)
  const selectedDays = mockDays(count)

  return (
    <div className="min-h-screen bg-[#000000] text-white p-8">
      <div className="max-w-xl mx-auto mb-8 space-y-4">
        <h1 className="text-3xl font-black">Preview: CheckoutFlow</h1>
        <p className="text-white/60">Días seleccionados: {count}</p>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.n}
              onClick={() => setCount(p.n)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                count === p.n
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={31}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm font-mono text-white/40">{count}</span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 text-white"
        >
          {open ? 'Cerrar' : 'Abrir'} CheckoutFlow
        </button>
      </div>

      <CheckoutFlow selectedDays={selectedDays} isOpen={open} onClose={() => setOpen(false)} />
    </div>
  )
}
