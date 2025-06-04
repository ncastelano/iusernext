'use client'
import { useState } from 'react'

export default function Navbar() {
  const options = ['Conectados','Até 5 km', 'Cidade', 'Estado', 'País']
  const [selected, setSelected] = useState(options[0])

  return (
    <>
      <nav className="nav">
        {options.map((label) => (
          <span
            key={label}
            className={`nav-item ${selected === label ? 'selected' : ''}`}
            onClick={() => setSelected(label)}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelected(label)}}
          >
            {label}
          </span>
        ))}
      </nav>

      <style jsx>{`
        .nav {
          display: flex;
          justify-content: space-around;
          padding: 16px;
          background-color: #000; /* Navbar preta */
          user-select: none; /* Evita seleção do texto */
        }
        .nav-item {
          background-color: #444; /* Cinza para não selecionado */
          color: #aaa; /* Texto cinza claro */
          border-radius: 9999px; /* Borda redonda tipo pílula */
          padding: 8px 16px;
          cursor: pointer;
          font-weight: 500;
          white-space: nowrap;
          user-select: none;
          outline: none;
          transition: background-color 0.3s ease, color 0.3s ease;
          display: inline-block;
        }
        .nav-item.selected {
          background-color: #fff; /* Branco para selecionado */
          color: #000; /* Texto preto */
        }
        .nav-item:focus {
          box-shadow: 0 0 0 3pxrgba(255, 255, 255, 0); /* transparente */
        }
      `}</style>
    </>
  )
}
