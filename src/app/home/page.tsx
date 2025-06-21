'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  GoogleMap,
  OverlayView,
  useJsApiLoader,
} from '@react-google-maps/api'
import Image from 'next/image'
import { CustomInfoWindowVideo } from 'src/app/components/CustomInfoWindow'
import { darkThemeStyleArray } from '@/lib/darkThemeStyleArray'
import { Video } from 'types/video'
import { User } from 'types/user'
import { FilterMap } from 'src/app/components/FilterMap'
import { VideoMarker } from '../components/VideoMaker'
import { CustomInfoWindowUser } from 'src/app/components/CustomInfoWindowUser'
import { FilteredList } from 'src/app/components/FilteredList'

const containerStyle = {
  width: '100%',
  height: '100vh',
}

export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>([])
 const [users] = useState<User[]>([])

  const [loading, setLoading] = useState(true)
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  const [selectedFilter, setSelectedFilter] = useState<'users' | 'flash' | 'store' | 'place' | 'product'>('users')
  const [searchTerm, setSearchTerm] = useState('')
  const mapRef = useRef<google.maps.Map | null>(null)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey ?? '',
    libraries: ['places'],
  })

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map
  }

  const goToLocationWithZoom = ({ lat, lng }: { lat: number; lng: number }) => {
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng })
      mapRef.current.setZoom(17)
    }
  }

  const goToMyLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const location = { lat: latitude, lng: longitude }
          goToLocationWithZoom(location)
        },
        (error) => {
          console.error('Erro ao obter localização atual:', error)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    }
  }, [])

  // Detectar evento de instalação PWA
  useEffect(() => {
  const handler = (e: Event) => {
    e.preventDefault()
    setDeferredPrompt(e as BeforeInstallPromptEvent)
  }

  window.addEventListener('beforeinstallprompt', handler)

  return () => {
    window.removeEventListener('beforeinstallprompt', handler)
  }
}, [])

  useEffect(() => {
  async function fetchData() {
    try {
      const videoSnapshot = await getDocs(collection(db, 'videos'))

      const videoData: Video[] = videoSnapshot.docs
  .map((doc) => {
    const data = doc.data()
    if (
      typeof data.videoID === 'string' &&
      typeof data.userProfileImage === 'string' &&
      typeof data.userName === 'string' &&
      typeof data.userID === 'string' &&
      typeof data.latitude === 'number' &&
      typeof data.longitude === 'number' &&
      typeof data.artistSongName === 'string' &&
      typeof data.thumbnailUrl === 'string' && // 👈 novo campo
      data.publishedDateTime &&                 // 👈 novo campo
      data.createdAt
    ) {
      return {
        id: doc.id,
        videoID: data.videoID,
        userProfileImage: data.userProfileImage,
        userName: data.userName,
        userID: data.userID,
        latitude: data.latitude,
        longitude: data.longitude,
        artistSongName: data.artistSongName,
        isFlash: data.isFlash,
        isStore: data.isStore,
        isPlace: data.isPlace,
        isProduct: data.isProduct,
        createdAt: data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt,
        thumbnailUrl: data.thumbnailUrl,
        publishedDateTime: data.publishedDateTime.toDate ? data.publishedDateTime.toDate() : data.publishedDateTime,
      } as Video
    }
    return null
  })
  .filter(Boolean) as Video[]


      setVideos(videoData)

      // ... user fetch igual como já está no seu código ...

    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  fetchData()
}, [goToMyLocation])


  if (!apiKey) return <p>Chave da API do Google Maps não definida.</p>
  if (!isLoaded) return <p>Carregando mapa...</p>

  const videosWithLocation = videos.filter(
    (video) => typeof video.latitude === 'number' && typeof video.longitude === 'number'
  )

  const normalizedSearch = searchTerm.trim().toLowerCase()

  const filteredVideos = videosWithLocation.filter((video) => {
    const matchesFilter =
      (selectedFilter === 'flash' && video.isFlash) ||
      (selectedFilter === 'store' && video.isStore) ||
      (selectedFilter === 'place' && video.isPlace) ||
      (selectedFilter === 'product' && video.isProduct)

    const matchesSearch = video.artistSongName?.toLowerCase().includes(normalizedSearch)

    return matchesFilter && matchesSearch
  })

  const filteredUsers =
    selectedFilter === 'users'
      ? users.filter((user) => user.name.toLowerCase().includes(normalizedSearch))
      : []

  return (
    <main style={{ padding: 0, fontFamily: 'Arial, sans-serif', position: 'relative' }}>
      <FilterMap
        selected={selectedFilter}
        onChange={setSelectedFilter}
        onSearchChange={(term) => setSearchTerm(term.toLowerCase())}
      />

      <FilteredList
        filter={selectedFilter}
        users={users}
        videos={videosWithLocation}
        onSelectUser={setSelectedUserId}
        onSelectVideo={setSelectedVideoId}
        goToLocation={goToLocationWithZoom}
        searchTerm={searchTerm}
      />

      {/* Botão: Ir para minha localização */}
      <button
        onClick={goToMyLocation}
        style={{
          position: 'fixed',
          bottom: 90,
          left: 20,
          zIndex: 1000,
          padding: '10px 16px',
          backgroundColor: '#1a1a1a',
          color: '#ccc',
          border: '1px solid #444',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 500,
          fontSize: '14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          transition: 'all 0.2s ease-in-out',
        }}
      >
        📍 Minha localização
      </button>

      {/* Botão: Instalar iUser */}
      {deferredPrompt && (
        <button
          onClick={async () => {
            deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice
            if (outcome === 'accepted') {
              console.log('Usuário aceitou instalar o PWA')
            } else {
              console.log('Usuário recusou instalar o PWA')
            }
            setDeferredPrompt(null)
          }}
          style={{
            position: 'fixed',
            bottom: 80,
            right: 20,
            zIndex: 1000,
            backgroundColor: '#1a1a1a',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
          }}
        >
          📲 Instalar iUser
        </button>
      )}

      {/* Mapa e Marcadores */}
      {loading ? (
        <p style={{ textAlign: 'center' }}>Carregando vídeos...</p>
      ) : (
        <GoogleMap
          mapContainerStyle={containerStyle}
          mapTypeId="hybrid"
          options={{
            tilt: 45,
            heading: 45,
            styles: darkThemeStyleArray,
            backgroundColor: '#000000',
            mapTypeControl: false,
            keyboardShortcuts: false,
            fullscreenControl: false,
            disableDefaultUI: true,
            clickableIcons: false,
          }}
          onLoad={onLoad}
        >
          {filteredVideos.map((video) => (
            <OverlayView
              key={video.videoID}
              position={{ lat: video.latitude!, lng: video.longitude! }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div>
                <VideoMarker video={video} onClick={() => setSelectedVideoId(video.videoID)} />
                {selectedVideoId === video.videoID && (
                  <OverlayView
                    position={{ lat: video.latitude!, lng: video.longitude! }}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  >
                    <CustomInfoWindowVideo video={video} onClose={() => setSelectedVideoId(null)} />
                  </OverlayView>
                )}
              </div>
            </OverlayView>
          ))}

          {filteredUsers.map((user) => (
            <OverlayView
              key={user.id}
              position={{ lat: user.latitude, lng: user.longitude }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div>
                <div
                  onClick={() => setSelectedUserId(user.id)}
                  title={user.name}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '3px solid #2ecc71',
                    boxShadow: '0 0 5px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    backgroundColor: '#fff',
                  }}
                >
                  <Image src={user.image} alt={user.name} width={60} height={60} style={{ objectFit: 'cover' }} />
                </div>

                {selectedUserId === user.id && (
                  <OverlayView
                    position={{ lat: user.latitude, lng: user.longitude }}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  >
                    <CustomInfoWindowUser user={user} onClose={() => setSelectedUserId(null)} />
                  </OverlayView>
                )}
              </div>
            </OverlayView>
          ))}
        </GoogleMap>
      )}
    </main>
  )
}
