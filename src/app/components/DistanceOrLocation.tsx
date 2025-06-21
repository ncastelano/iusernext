'use client'

import React, { useEffect, useState } from 'react'
import { MapPin, ArrowRight } from 'lucide-react'

type DistanceOrLocationProps = {
  latitude?: number
  longitude?: number
  distance?: number | null
}

type Address = {
  city?: string
  state?: string
  country?: string
}

const loadingChars = ['|', '/', '-', '\\']

function getRandomString(length: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export default function DistanceOrLocation({ latitude, longitude, distance }: DistanceOrLocationProps) {
  const [address, setAddress] = useState<Address | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingCharIndex, setLoadingCharIndex] = useState(0)
  const [notLocated, setNotLocated] = useState(false)

  // Estados para animação dos placeholders enquanto carrega
  const [cityAnim, setCityAnim] = useState('')
  const [stateAnim, setStateAnim] = useState('')
  const [countryAnim, setCountryAnim] = useState('')

  // Estado para controle de piscar "não localizado"
  const [blink, setBlink] = useState(true)

  useEffect(() => {
    if (latitude === undefined || longitude === undefined) return

    setLoading(true)
    setError(null)
    setAddress(null)
    setNotLocated(false)
    setLoadingCharIndex(0)

    // Intervalo para o loading spinner (carregando localização)
    const loadingInterval = setInterval(() => {
      setLoadingCharIndex(prev => (prev + 1) % loadingChars.length)
    }, 150)

    // Intervalo para atualizar os placeholders de city, state e country
    const placeholderInterval = setInterval(() => {
      setCityAnim(getRandomString(6))
      setStateAnim(getRandomString(6))
      setCountryAnim(getRandomString(6))
    }, 150)

    // Timeout para mostrar "não localizado" após 3 segundos
    const timeoutNotLocated = setTimeout(() => {
      setNotLocated(true)
      setLoading(false)
      clearInterval(loadingInterval)
      clearInterval(placeholderInterval)
    }, 3000)

    const fetchAddress = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
        )
        if (!response.ok) throw new Error('Erro na requisição')
        const data = await response.json()

        const { address: addr } = data
        setAddress({
          city: addr.city || addr.town || addr.village || addr.hamlet,
          state: addr.state,
          country: addr.country,
        })
        setLoading(false)
        setNotLocated(false)
        clearTimeout(timeoutNotLocated)
        clearInterval(loadingInterval)
        clearInterval(placeholderInterval)
      } catch (err) {
        setError('Não foi possível obter o endereço')
        setLoading(false)
        clearTimeout(timeoutNotLocated)
        clearInterval(loadingInterval)
        clearInterval(placeholderInterval)
      }
    }

    fetchAddress()

    return () => {
      clearInterval(loadingInterval)
      clearInterval(placeholderInterval)
      clearTimeout(timeoutNotLocated)
    }
  }, [latitude, longitude])

  // Efeito para piscar "não localizado" quando estiver nessa condição
  useEffect(() => {
    if (!notLocated) return

    const blinkInterval = setInterval(() => {
      setBlink(prev => !prev)
    }, 600)

    return () => clearInterval(blinkInterval)
  }, [notLocated])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, color: '#fff', textShadow: '0 0 6px black' }}>
      {latitude !== undefined && longitude !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <MapPin size={16} color="red" />
        {loading && !notLocated && (
  <div>
    <div>Procurando localização {loadingChars[loadingCharIndex]}</div>
    <div style={{ fontFamily: 'monospace', display: 'flex', gap: 8 }}>
      <span>{cityAnim}</span>
      <span>{stateAnim}</span>
      <span>{countryAnim}</span>
    </div>
  </div>
)}

          {notLocated && (
            <span style={{ opacity: blink ? 1 : 0, transition: 'opacity 0.3s' }}>
              não localizado
            </span>
          )}
          {error && <span>{error}</span>}
          {!loading && !error && address && (
            <>
              <span>
                {address.city ? `${address.city}, ` : ''}
                {address.state ? `${address.state}, ` : ''}
                {address.country || ''}
              </span>
              {distance !== null && distance !== undefined && (
                <span style={{ marginLeft: 8, whiteSpace: 'nowrap' }}> - {distance.toFixed(1)} km</span>
              )}
              <ArrowRight size={16} style={{ marginLeft: 8 }} />
            </>
          )}
        </div>
      )}
    </div>
  )
}
