'use client'

import React from 'react'
import { getAuth } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

type TrackingToggleButtonProps = {
  trackingActive: boolean
  toggleTracking: () => void
}

export const TrackingToggleButton: React.FC<TrackingToggleButtonProps> = ({
  trackingActive,
  toggleTracking,
}) => {
  const auth = getAuth()

  const updateUserLocationInFirestore = async (
    lat: number,
    lng: number,
    visible: boolean
  ) => {
    const user = auth.currentUser

    if (!user) {
      console.error('Usuário não autenticado')
      return
    }

    const userRef = doc(db, 'users', user.uid)

    try {
      await setDoc(
        userRef,
        {
          latitude: lat,
          longitude: lng,
          visible: visible,
        },
        { merge: true }
      )

      console.log(`Localização salva. Visível: ${visible}`)
    } catch (error) {
      console.error('Erro ao salvar localização:', error)
    }
  }

  const handleClick = () => {
    const isActivating = !trackingActive
    const newVisibleValue = isActivating

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          updateUserLocationInFirestore(latitude, longitude, newVisibleValue)
        },
        (error) => {
          console.error('Erro ao obter localização:', error)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    }

    toggleTracking()
  }

  return (
    <button
      onClick={handleClick}
      style={{
        backgroundColor: trackingActive ? '#00ffff' : '#333',
        color: trackingActive ? '#000' : 'white',
        fontWeight: trackingActive ? 'bold' : 'normal',
        border: 'none',
        padding: '6px 10px',
        borderRadius: '8px',
        fontSize: '13px',
        cursor: 'pointer',
      }}
    >
      {trackingActive ? 'Visível' : 'Invisível'}
    </button>
  )
}
