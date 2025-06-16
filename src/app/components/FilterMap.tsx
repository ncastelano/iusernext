'use client'

import React, { useState, useEffect } from 'react'

type FilterOption = 'users' | 'flash' | 'store' | 'place' | 'product'

type FilterMapProps = {
  selected: FilterOption
  onChange: (selected: FilterOption) => void
  onSearchChange?: (term: string) => void
}

const initialOptions: { key: FilterOption; label: string; color: string; textColor: string }[] = [
  { key: 'users', label: 'Usuários', color: '#2ecc71', textColor: '#000' },
  { key: 'flash', label: 'Flashs', color: '#ffffff', textColor: '#000' },
  { key: 'store', label: 'Lojas', color: 'orange', textColor: '#000' },
  { key: 'place', label: 'Lugares', color: '#add8e6', textColor: '#000' },
  { key: 'product', label: 'Produtos', color: 'yellow', textColor: '#000' },
]

const CLICK_STORAGE_KEY = 'filter_click_counts'

export function FilterMap({ selected, onChange, onSearchChange }: FilterMapProps) {
  const [search, setSearch] = useState('')
  const [clickCounts, setClickCounts] = useState<Record<FilterOption, number>>({
    users: 0,
    flash: 0,
    store: 0,
    place: 0,
    product: 0,
  })

  const [initialOrder, setInitialOrder] = useState<typeof initialOptions>(initialOptions)

  // Carrega cliques e ordena apenas uma vez no carregamento
  useEffect(() => {
    const saved = localStorage.getItem(CLICK_STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setClickCounts((prev) => ({ ...prev, ...parsed }))

        const ordered = [...initialOptions].sort(
          (a, b) => (parsed[b.key] || 0) - (parsed[a.key] || 0)
        )
        setInitialOrder(ordered)
      } catch (e) {
        console.error('Erro ao carregar clickCounts:', e)
      }
    }
  }, [])

  // Salva cliques no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem(CLICK_STORAGE_KEY, JSON.stringify(clickCounts))
  }, [clickCounts])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)
    onSearchChange?.(value)
  }

  const handleFilterClick = (key: FilterOption) => {
    setClickCounts((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + 1,
    }))
    onChange(key)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        backgroundColor: 'transparent',
        padding: '5px',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      {/* Campo de busca */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: 10,
            color: '#888',
            fontSize: '16px',
          }}
        >
          🔍
        </span>
        <input
          type="text"
          value={search}
          onChange={handleInputChange}
          placeholder="Procurar"
          style={{
            padding: '6px 12px 6px 32px',
            borderRadius: '10px',
            border: '1px solid #ccc',
            fontSize: '14px',
            outline: 'none',
            width: '180px',
            color: '#000',
            backgroundColor: '#fff',
          }}
        />
      </div>

      {/* Botões ordenados pela ordem salva no carregamento */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {initialOrder.map((option) => {
          const isSelected = selected === option.key
          const bgColor = isSelected ? option.color : '#000'
          const color = isSelected ? option.textColor : '#fff'

          return (
            <button
              key={option.key}
              onClick={() => handleFilterClick(option.key)}
              style={{
                padding: '8px 14px',
                borderRadius: '12px',
                border: `1px solid ${isSelected ? option.color : 'rgb(252, 252, 252)'}`,
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
    </div>
  )
}
