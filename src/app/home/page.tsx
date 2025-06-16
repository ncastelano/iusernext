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
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)

  const [selectedFilter, setSelectedFilter] = useState<'users' | 'flash' | 'store' | 'place' | 'product'>('users')

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey ?? '',
    libraries: ['places'],
  })

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map
  }

  const goToLocationWithZoom = ({ lat, lng }: { lat: number; lng: number }, zoom = 20) => {
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng })
      mapRef.current.setZoom(zoom)
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

  useEffect(() => {
    async function fetchData() {
      try {
        const videoSnapshot = await getDocs(collection(db, 'videos'))
        const videoData: Video[] = videoSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Video[]
        setVideos(videoData)

        const userSnapshot = await getDocs(collection(db, 'users'))
        const userData: User[] = userSnapshot.docs
          .map((doc) => {
            const data = doc.data()
            if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
              return {
                id: doc.id,
                name: data.name || '',
                email: data.email || '',
                image: data.image || '',
                latitude: data.latitude,
                longitude: data.longitude,
              }
            }
            return null
          })
          .filter(Boolean) as User[]
        setUsers(userData)

        goToMyLocation()
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

  const filteredVideos = videosWithLocation.filter((video) => {
    return (
      (selectedFilter === 'flash' && video.isFlash) ||
      (selectedFilter === 'store' && video.isStore) ||
      (selectedFilter === 'place' && video.isPlace) ||
      (selectedFilter === 'product' && video.isProduct)
    )
  })

  const filteredUsers = selectedFilter === 'users' ? users : []

  return (
    <main style={{ padding: 0, fontFamily: 'Arial, sans-serif', position: 'relative' }}>
      <FilterMap selected={selectedFilter} onChange={setSelectedFilter} />
       <FilteredList
  filter={selectedFilter}
  videos={videosWithLocation}
  users={users}
  onSelectVideo={setSelectedVideoId}
  onSelectUser={setSelectedUserId}
/>
      

      <button
        onClick={goToMyLocation}
        style={{
          position: 'fixed',
          bottom: 20,
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
        📍 Ir para minha localização
      </button>

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
            fullscreenControl: true,
            disableDefaultUI: true,
          }}
          onLoad={onLoad}
        >
          {filteredVideos.map((video) => (
            <OverlayView
              key={video.id}
              position={{ lat: video.latitude!, lng: video.longitude! }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div>
                <VideoMarker video={video} onClick={() => setSelectedVideoId(video.id)} />
                {selectedVideoId === video.id && (
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
                    borderRadius: '12px',
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
