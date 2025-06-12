// components/TrackingContext.tsx

'use client'

import React, { createContext, useContext, useRef, useState } from 'react'

type Location = { lat: number; lng: number } | null

type TrackingContextType = {
  trackingActive: boolean
  userLocation: Location
  startTracking: () => void
  stopTracking: () => void
  toggleTracking: () => void
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined)

export const TrackingProvider = ({ children }: { children: React.ReactNode }) => {
  const watchIdRef = useRef<number | null>(null)
  const [userLocation, setUserLocation] = useState<Location>(null)
  const [trackingActive, setTrackingActive] = useState(false)

  const startTracking = () => {
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })
        },
        (error) => {
          console.error('Erro ao rastrear localização:', error)
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      )
      setTrackingActive(true)
    }
  }

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
      setTrackingActive(false)
    }
  }

  // ✅ Correção: função única, sem redefinir
  const toggleTracking = () => {
    if (trackingActive) {
      stopTracking()
    } else {
      startTracking()
    }
  }

  return (
    <TrackingContext.Provider
      value={{
        trackingActive,
        userLocation,
        startTracking,
        stopTracking,
        toggleTracking,
      }}
    >
      {children}
    </TrackingContext.Provider>
  )
}

export const useTracking = () => {
  const context = useContext(TrackingContext)
  if (!context) {
    throw new Error('useTracking deve ser usado dentro de um TrackingProvider')
  }
  return context
}
