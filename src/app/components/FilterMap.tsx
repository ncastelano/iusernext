'use client'

import React from 'react'

type FilterOption = 'users' | 'flash' | 'store' | 'place' | 'product'

type FilterMapProps = {
  selected: FilterOption
  onChange: (selected: FilterOption) => void
}

const options: { key: FilterOption; label: string; color: string; textColor: string }[] = [
  { key: 'users', label: 'Usuários', color: '#2ecc71', textColor: '#000' },       // Verde
  { key: 'flash', label: 'Flashs', color: '#ffffff', textColor: '#000' },        // Branco
  { key: 'store', label: 'Lojas', color: 'red', textColor: '#000' },         // Roxo
  { key: 'place', label: 'Lugares', color: '#add8e6', textColor: '#000' },       // Azul bebê
  { key: 'product', label: 'Produtos', color: 'yellow', textColor: '#000' },    // Laranja
]

export function FilterMap({ selected, onChange }: FilterMapProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        left: 20,
        zIndex: 1000,
        backgroundColor: '#1a1a1a',
        padding: '12px',
        borderRadius: '16px',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        border: '1px solid #333',
      }}
    >
      {options.map((option) => {
        const isSelected = selected === option.key
        const bgColor = isSelected ? option.color : '#000'
        const color = isSelected ? option.textColor : '#fff'

        return (
          <button
            key={option.key}
            onClick={() => onChange(option.key)}
            style={{
              padding: '8px 14px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: bgColor,
              color,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              fontSize: '14px',
              whiteSpace: 'nowrap',
            }}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
