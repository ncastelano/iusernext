'use client'

import { useEffect, useRef, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  GoogleMap,
  InfoWindow,
  OverlayView,
  useJsApiLoader,
} from '@react-google-maps/api'
import Image from 'next/image'

type Video = {
  id: string
  videoUrl?: string
  thumbnailUrl?: string
  artistSongName: string
  userName: string
  latitude?: number
  longitude?: number
}

const CustomInfoWindow = ({
  video,
  onClose,
}: {
  video: Video
  onClose: () => void
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        transform: 'translate(-50%, -100%)',
        backgroundColor: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: '10px',
        padding: '8px',
        width: '220px',
        maxWidth: '90vw',
        zIndex: 100,
        display: 'flex',
        gap: '12px',
        color: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ width: '100px', height: '100px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden' }}>
        {video.videoUrl && (
          <video
            src={video.videoUrl}
            width="100%"
            height="100%"
            controls
            style={{ objectFit: 'cover' }}
            muted
            playsInline
          />
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h4
          style={{
            margin: '0 0 4px 0',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '1.2',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {video.artistSongName}
        </h4>
        <p
          style={{
            margin: 0,
            fontSize: '12px',
            color: '#aaa',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          @{video.userName}
        </p>
      </div>

      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          background: 'transparent',
          border: 'none',
          color: '#ccc',
          fontSize: '18px',
          cursor: 'pointer',
          lineHeight: 1,
        }}
        aria-label="Fechar"
      >
        ×
      </button>
    </div>
  )
}


const containerStyle = {
  width: '100%',
  height: '100vh',
}

const darkThemeStyleArray = [
  {
    featureType: "all",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "all",
    elementType: "labels.text.stroke",
    stylers: [
      { color: "#000000" },
      { lightness: 13 }
    ]
  },
  {
    featureType: "administrative",
    elementType: "geometry.fill",
    stylers: [{ color: "#000000" }]
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [
      { color: "#144b53" },
      { lightness: 14 },
      { weight: 1.4 }
    ]
  },
  {
    featureType: "landscape",
    elementType: "all",
    stylers: [{ color: "#08304b" }]
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [
      { color: "#0c4152" },
      { lightness: 5 }
    ]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.fill",
    stylers: [{ color: "#000000" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [
      { color: "#0b434f" },
      { lightness: 25 }
    ]
  },
  {
    featureType: "road.arterial",
    elementType: "geometry.fill",
    stylers: [{ color: "#000000" }]
  },
  {
    featureType: "road.arterial",
    elementType: "geometry.stroke",
    stylers: [
      { color: "#0b3d51" },
      { lightness: 16 }
    ]
  },
  {
    featureType: "road.local",
    elementType: "geometry",
    stylers: [{ color: "#000000" }]
  },
  {
    featureType: "transit",
    elementType: "all",
    stylers: [{ color: "#146474" }]
  },
  {
    featureType: "water",
    elementType: "all",
    stylers: [{ color: "#021019" }]
  }
]


export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [showUserInfo, setShowUserInfo] = useState(false)
  const [trackingActive, setTrackingActive] = useState(false)
  const mapRef = useRef<google.maps.Map | null>(null)
  const watchIdRef = useRef<number | null>(null)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey ?? '', // sempre string
    libraries: ['places'],
  })

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map
  }

  const goToLocationWithZoom = (lat: number, lng: number, zoom = 20) => {
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng })
      mapRef.current.setZoom(zoom)
    }
  }

  

 


  useEffect(() => {
    async function fetchVideos() {
      try {
        const querySnapshot = await getDocs(collection(db, 'videos'))
        const data: Video[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Video[]
        setVideos(data)
        goToMyLocation()
        
      } catch (error) {
        console.error('Erro ao buscar vídeos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  
const goToMyLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const location = { lat: latitude, lng: longitude }
        setUserLocation(location)
        goToLocationWithZoom(latitude, longitude)
      },
      (error) => {
        console.error('Erro ao obter localização atual:', error)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }
}


  if (!apiKey) return <p>Chave da API do Google Maps não definida.</p>
  if (!isLoaded) return <p>Carregando mapa...</p>

  const videosWithLocation = videos.filter(
    (video) => typeof video.latitude === 'number' && typeof video.longitude === 'number'
  )

  return (
    <main style={{ padding: 0, fontFamily: 'Arial, sans-serif', position: 'relative' }}>
   
  <button onClick={goToMyLocation}
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
  mapTypeId="hybrid" // Aqui é o modo híbrido já pronto
  options={{
    tilt: 45,
    heading: 45,
    styles: darkThemeStyleArray, // Aqui você aplica um tema escuro customizado
    backgroundColor: '#000000',
    mapTypeControl: false, 
    keyboardShortcuts: false,
    fullscreenControl: true,
    disableDefaultUI: true,
  }}
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
                    position: 'relative',
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
                  <Image
                    src={video.thumbnailUrl || '/fallback.jpg'}
                    alt="thumbnail"
                    fill
                    sizes="50px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>

             {selectedVideoId === video.id && (
  <OverlayView
    position={{ lat: video.latitude!, lng: video.longitude! }}
    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
  >
    <CustomInfoWindow 
      video={video} 
      onClose={() => setSelectedVideoId(null)} 
    />
  </OverlayView>
)}
              </div>
            </OverlayView>
          ))}

          {userLocation && (
            <>
              <OverlayView
                position={userLocation}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div
                  onClick={() => setShowUserInfo(true)}
                  style={{
                    width: 20,
                    height: 20,
                    backgroundColor: 'red',
                    borderRadius: '50%',
                    border: '2px solid white',
                    cursor: 'pointer',
                    boxShadow: '0 0 6px rgba(0,0,0,0.4)',
                  }}
                  title="Você está aqui"
                />
              </OverlayView>

              {showUserInfo && (
                <InfoWindow
                  position={userLocation}
                  onCloseClick={() => setShowUserInfo(false)}
                >
                  <div><strong>Estou aqui!</strong></div>
                </InfoWindow>
              )}
            </>
          )}
        </GoogleMap>
      )}
    </main>
  )
}
