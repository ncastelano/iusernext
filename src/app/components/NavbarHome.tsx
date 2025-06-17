'use client'
import { useState } from 'react'

export default function Navbar() {
  const options = ['Conectados', 'Até 5 km', 'Cidade', 'Estado', 'País']
  const [selected, setSelected] = useState(options[0])

  return (
    <nav className="flex justify-around px-4 py-3 bg-black select-none">
      {options.map((label) => (
        <span
          key={label}
          className={`px-4 py-2 rounded-full font-medium whitespace-nowrap cursor-pointer outline-none transition-colors ${
            selected === label
              ? 'bg-white text-black'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => setSelected(label)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setSelected(label)
          }}
        >
          {label}
        </span>
      ))}
    </nav>
  )
}
