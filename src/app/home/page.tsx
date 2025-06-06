'use client'

import { useEffect, useRef, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { GoogleMap, InfoWindow, useJsApiLoader, OverlayView } from '@react-google-maps/api'

type Video = {
  id: string
  videoUrl?: string
  thumbnailUrl?: string
  artistSongName: string
  userName: string
  latitude?: number
  longitude?: number
}

const containerStyle = {
  width: '100%',
  height: '80vh',
}

const centerDefault = {
  lat: 0,
  lng: 0,
}

export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [userLocated, setUserLocated] = useState(false)

  const mapRef = useRef<google.maps.Map | null>(null)

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map
  }

  const goToLocationWithZoom = (lat: number, lng: number, zoom = 20) => {
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng })
      mapRef.current.setZoom(zoom)
    }
  }

  const detectAndZoomToUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          goToLocationWithZoom(latitude, longitude)
          setUserLocated(true)
        },
        (error) => {
          console.error('Erro ao obter localização:', error)
        }
      )
    }
  }

  const handleMyLocation = () => {
    detectAndZoomToUser()
  }

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  })

  useEffect(() => {
    async function fetchVideos() {
      try {
        const querySnapshot = await getDocs(collection(db, 'videos'))
        const data: Video[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Video[]
        setVideos(data)
      } catch (error) {
        console.error('Erro ao buscar vídeos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  useEffect(() => {
    if (isLoaded && !userLocated) {
      detectAndZoomToUser()
    }
  }, [isLoaded, userLocated])

  if (!isLoaded) return <p>Carregando mapa...</p>

  const videosWithLocation = videos.filter(
    (video) => typeof video.latitude === 'number' && typeof video.longitude === 'number'
  )

  return (
    <main style={{ padding: 0, fontFamily: 'Arial, sans-serif', position: 'relative' }}>
      <button
        onClick={handleMyLocation}
        style={{
          position: 'absolute',
          top: 100,
          right: 20,
          zIndex: 1000,
          padding: '10px 16px',
          backgroundColor: '#fff',
          border: '2px solid #00aa00',
          borderRadius: 8,
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        }}
      >
        📍 Minha Localização
      </button>

      {loading ? (
        <p style={{ textAlign: 'center' }}>Carregando vídeos...</p>
      ) : (
        <GoogleMap
          mapContainerStyle={containerStyle}
         
          zoom={2}
          onLoad={onLoad}
        >
          {videosWithLocation.map((video) => (
        <OverlayView
  key={video.id}
  position={{ lat: video.latitude!, lng: video.longitude! }}
  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
>
  <div>
    <div
      onClick={() => setSelectedVideoId(video.id)}
      style={{
        width: 50,
        height: 50,
        borderRadius: '50%',
        overflow: 'hidden',
        border: '3px solid #00ff00',
        boxShadow: '0 0 5px rgba(0,0,0,0.3)',
        cursor: 'pointer',
        backgroundColor: '#fff',
      }}
    >
      <img
        src={video.thumbnailUrl || '/fallback.jpg'}
        alt="thumbnail"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </div>

    {selectedVideoId === video.id && (
      <InfoWindow
        position={{ lat: video.latitude!, lng: video.longitude! }}
        onCloseClick={() => setSelectedVideoId(null)}
      >
        <div style={{ width: 200 }}>
          <strong>{video.artistSongName}</strong>
          <br />
          <small>{video.userName}</small>
          {video.videoUrl && (
            <video
              src={video.videoUrl}
              width="100%"
              controls
              style={{ marginTop: 8, borderRadius: 4 }}
              muted
              playsInline
            />
          )}
        </div>
      </InfoWindow>
    )}
  </div>
</OverlayView>

          ))}
        </GoogleMap>
      )}
    </main>
  )
}
