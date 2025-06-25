'use client'

import React, { useEffect, useState } from 'react'
import { MapPin, ArrowRight } from 'lucide-react'
import AnimatedText from 'src/app/components/AnimatedTextProps'

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

function getRandomString(length: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function getRandomDistance() {
  return (Math.random() * 999).toFixed(1) // Exemplo: "452.3"
}

export default function DistanceOrLocation({ latitude, longitude, distance }: DistanceOrLocationProps) {
  const [address, setAddress] = useState<Address | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notLocated, setNotLocated] = useState(false)

  // Animações para placeholders enquanto carrega
  const [cityAnim, setCityAnim] = useState('')
  const [stateAnim, setStateAnim] = useState('')
  const [countryAnim, setCountryAnim] = useState('')
  const [distanceAnim, setDistanceAnim] = useState('0.0')

  const [blink, setBlink] = useState(true)

  useEffect(() => {
    if (latitude === undefined || longitude === undefined) return

    setLoading(true)
    setError(null)
    setAddress(null)
    setNotLocated(false)

    const placeholderInterval = setInterval(() => {
      setCityAnim(getRandomString(6))
      setStateAnim(getRandomString(6))
      setCountryAnim(getRandomString(6))
      setDistanceAnim(getRandomDistance())
    }, 150)

    const timeoutNotLocated = setTimeout(() => {
      setNotLocated(true)
      setLoading(false)
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
        clearInterval(placeholderInterval)
      } catch {
        setError('Não foi possível obter o endereço')
        setLoading(false)
        clearTimeout(timeoutNotLocated)
        clearInterval(placeholderInterval)
      }
    }

    fetchAddress()

    return () => {
      clearInterval(placeholderInterval)
      clearTimeout(timeoutNotLocated)
    }
  }, [latitude, longitude])

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
              <div style={{ fontFamily: 'monospace', display: 'flex', gap: 8 }}>
                <AnimatedText text={cityAnim} isLoading />
                <AnimatedText text={stateAnim} isLoading />
                <AnimatedText text={countryAnim} isLoading />
                <AnimatedText text={`${distanceAnim} km`} isLoading isNumberAnimation />
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
                {address.city ? <><AnimatedText text={address.city} isLoading={false} />, </> : null}
                {address.state ? <><AnimatedText text={address.state} isLoading={false} />, </> : null}
                <AnimatedText text={address.country || ''} isLoading={false} />
              </span>
              {distance !== null && distance !== undefined && (
                <AnimatedText
                  text={` - ${distance.toFixed(1)} km`}
                  isLoading={false}
                  isNumberAnimation
                />
              )}
              <ArrowRight size={16} style={{ marginLeft: 8 }} />
            </>
          )}
        </div>
      )}
    </div>
  )
}
