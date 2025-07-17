"use client";

import { useEffect, useState } from "react";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "../components/UserContext";

interface SendOrDeleteLocationProps {
  onUpdate?: () => void;
}

export function SendOrDeleteLocation({ onUpdate }: SendOrDeleteLocationProps) {
  const { user } = useUser();
  const [sendingLocation, setSendingLocation] = useState(false);
  const [locationData, setLocationData] = useState<{
    latitude: number | null;
    longitude: number | null;
    visible: boolean;
  }>({
    latitude: null,
    longitude: null,
    visible: false,
  });
  const [address, setAddress] = useState<{
    bairro: string;
    cidade: string;
    estado: string;
  } | null>(null);

  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Real-time stream from Firestore
  useEffect(() => {
    if (!user?.uid) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      const data = docSnap.data();
      if (data) {
        setLocationData({
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          visible: data.visible ?? false,
        });
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    const { latitude, longitude, visible } = locationData;

    if (
      typeof latitude === "number" &&
      typeof longitude === "number" &&
      visible
    ) {
      const fetchAddress = async () => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=pt-BR`,
            {
              headers: {
                "User-Agent": "iUser/1.0",
              },
            }
          );
          const data = await res.json();

          const bairro =
            data.address.suburb ||
            data.address.neighbourhood ||
            data.address.village ||
            "Bairro desconhecido";

          const cidade =
            data.address.city ||
            data.address.town ||
            data.address.county ||
            "Cidade desconhecida";

          const estado = data.address.state_code || data.address.state || "??";

          setAddress({ bairro, cidade, estado });
        } catch (err) {
          console.error("Erro ao obter endereço:", err);
          setAddress(null);
        }
      };

      fetchAddress();
    } else {
      setAddress(null);
    }
  }, [locationData]);

  const sendLocation = () => {
    if (!user) return alert("Você precisa estar logado.");

    if (navigator.geolocation) {
      setSendingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
              latitude,
              longitude,
              visible: true,
            });
            alert("Localização enviada com sucesso!");
            onUpdate?.();
          } catch (err) {
            console.error("Erro ao enviar localização:", err);
            alert("Erro ao enviar localização.");
          } finally {
            setSendingLocation(false);
          }
        },
        (error) => {
          setSendingLocation(false);
          if (error.code === error.PERMISSION_DENIED) {
            setShowPermissionModal(true);
          } else {
            alert("Erro ao obter sua localização.");
          }
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      alert("Geolocalização não é suportada neste navegador.");
    }
  };

  const deleteLocation = async () => {
    if (!user) return alert("Você precisa estar logado.");

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        visible: false,
      });
      alert("Localização oculta com sucesso.");
      onUpdate?.();
    } catch (err) {
      console.error("Erro ao ocultar localização:", err);
      alert("Erro ao ocultar localização.");
    }
  };

  const renderLocationText = () => {
    if (address && locationData.visible) {
      return `${address.bairro}, ${address.cidade} - ${address.estado}`;
    }
    return "Localização: não informada.";
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: 200,
          left: 20,
          zIndex: 1000,
          backdropFilter: "blur(10px)",
          background: "transparent",
          borderRadius: "16px",
          padding: "16px",
          border: "transparent",
          color: "#fff",
          width: "260px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            marginBottom: "12px",
            fontWeight: 500,
            zIndex: 2000,
          }}
        >
          📍 {renderLocationText()}
        </div>

        {/* Botões lado a lado */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={sendLocation}
            disabled={sendingLocation}
            style={{
              flex: 1,
              padding: "10px",
              backgroundColor: sendingLocation ? "#4e944f" : "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
              transition: "background 0.3s",
            }}
          >
            {sendingLocation ? "Enviando..." : "Enviar"}
          </button>

          <button
            onClick={deleteLocation}
            style={{
              flex: 1,
              padding: "10px",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
            }}
          >
            Ocultar
          </button>
        </div>
      </div>

      {/* Modal glassmorphism para permissão negada */}
      {showPermissionModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          tabIndex={-1}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            width: "100vw",
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
            padding: "20px",
          }}
          onClick={() => setShowPermissionModal(false)}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderRadius: "20px",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              padding: "30px",
              maxWidth: "400px",
              width: "100%",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
              color: "#fff",
              position: "relative",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="modal-title"
              style={{
                marginBottom: "15px",
                fontSize: "1.5rem",
                fontWeight: "700",
              }}
            >
              Permissão de Localização Negada
            </h2>
            <p
              style={{
                marginBottom: "20px",
                lineHeight: "1.5",
                fontWeight: 500,
              }}
            >
              Para usar essa funcionalidade, por favor habilite a permissão de
              localização nas configurações do seu navegador e recarregue a
              página.
            </p>

            <button
              onClick={() => setShowPermissionModal(false)}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                color: "#fff",
                padding: "12px 25px",
                borderRadius: "15px",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "1rem",
                transition: "background-color 0.3s, color 0.3s",
                backdropFilter: "blur(6px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(255, 255, 255, 0.6)";
                e.currentTarget.style.color = "#222";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(255, 255, 255, 0.3)";
                e.currentTarget.style.color = "#fff";
              }}
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
