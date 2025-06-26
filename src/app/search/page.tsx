'use client'

import { useState } from 'react'
import AllProfiles from '@/app/components/AllProfiles'
import Flashs from '@/app/components/Flashs' 

export default function AllPage() {
  const [search, setSearch] = useState('')

  return (
    <div style={{ backgroundColor: 'black', color: 'white', minHeight: '100vh', paddingBottom: 64 }}>
      
      {/* Campo de Pesquisa */}
      <div style={{ padding: 16, display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#1e1e1e',
            borderRadius: 999,
            padding: '8px 16px',
            width: '100%',
            maxWidth: 500,
            boxShadow: '0 0 10px rgba(0,255,0,0.2)',
          }}
        >
          <span style={{ color: '#8f8f8f', marginRight: 8 }}>🔍</span>
          <input
            type="text"
            placeholder="Procurar"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'white',
              width: '100%',
            }}
          />
        </div>
      </div>

      <Flashs />
      <AllProfiles />
    
      {renderSection('Items', renderItems(10))}
      {renderSection('Lojas', renderShops(5))}
      {renderSection('Locais', renderPlaces(8))}
    </div>
  )
}

function renderSection(title: string, content: React.ReactNode) {
  return (
    <section style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ fontSize: 18 }}>{title}</h2>
        <button style={{ background: '#00c853', color: 'white', padding: '6px 12px', borderRadius: 8, border: 'none' }}>Ver todos</button>
      </div>
      {content}
    </section>
  )
}


function renderItems(count: number) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ backgroundColor: '#1e1e1e', borderRadius: 12, padding: 12 }}>
          <div style={{ width: '100%', height: 100, backgroundColor: 'green', borderRadius: 8, marginBottom: 8 }}></div>
          <p style={{ fontWeight: 500 }}>Produto {i + 1}</p>
          <p style={{ color: '#00c853', fontWeight: 'bold' }}>R$ {(Math.random() * 100).toFixed(2)}</p>
          <p style={{ fontSize: 12 }}>2.1 km • ⭐ 4.5 (20) • 300 vendas</p>
        </div>
      ))}
    </div>
  )
}

function renderShops(count: number) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ backgroundColor: '#1e1e1e', borderRadius: 12, padding: 16 }}>
          <h3 style={{ marginBottom: 4 }}>Loja {i + 1}</h3>
          <p style={{ fontSize: 13, marginBottom: 8 }}>Descrição breve da loja.</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            {[1, 2, 3].map(item => (
              <div key={item} style={{ width: 40, height: 40, backgroundColor: 'green', borderRadius: 4 }}></div>
            ))}
          </div>
          <p style={{ fontSize: 12 }}>Distância: 1.2 km • Preços: R$10-R$90 • ⭐ 4.7 (80) • Aberto</p>
        </div>
      ))}
    </div>
  )
}

function renderPlaces(count: number) {
  return (
    <div style={{ display: 'flex', overflowX: 'auto', gap: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ width: 120, height: 120, borderRadius: 12, backgroundColor: 'green', position: 'relative', flexShrink: 0 }}>
          <div style={{ position: 'absolute', top: 4, left: 4, fontSize: 12 }}>2.3 km</div>
          <div style={{ position: 'absolute', top: 4, right: 4, fontSize: 12 }}>💬 10 • 👣 230</div>
          <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center' }}>Local {i + 1}</div>
        </div>
      ))}
    </div>
  )
}