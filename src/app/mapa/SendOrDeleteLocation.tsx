"use client";

import { useEffect, useState } from "react";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "../components/UserContext";
import { FaLocationArrow, FaEdit, FaEyeSlash } from "react-icons/fa";

interface SendOrDeleteLocationProps {
  onUpdate?: () => void;
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
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
  const [editingManual, setEditingManual] = useState(false);
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairroInput, setBairroInput] = useState("");
  const [cidade, setCidade] = useState("");

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
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&language=pt-BR`
          );
          const data = await res.json();
          const addressComponents: AddressComponent[] =
            data.results[0]?.address_components || [];

          const getComponent = (types: string[]) =>
            addressComponents.find((c) =>
              types.every((t) => c.types.includes(t))
            )?.long_name || "";

          const bairro = getComponent(["sublocality", "sublocality_level_1"]);
          const cidade = getComponent(["administrative_area_level_2"]);
          const estado = getComponent(["administrative_area_level_1"]);

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

  const saveManualAddress = async () => {
    if (!user) return;
    const query = `${rua}, ${numero}, ${bairroInput}, ${cidade}`;
    if (!query.trim()) return alert("Preencha todos os campos.");

    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          query
        )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&language=pt-BR`
      );
      const data = await res.json();
      const result = data.results[0];
      if (!result) throw new Error("Endereço não encontrado");
      const { lat, lng } = result.geometry.location;

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        latitude: lat,
        longitude: lng,
        visible: true,
      });

      setEditingManual(false);
      setRua("");
      setNumero("");
      setBairroInput("");
      setCidade("");
      alert("Endereço salvo com sucesso!");
      onUpdate?.();
    } catch (err) {
      console.error("Erro ao salvar endereço manual:", err);
      alert("Erro ao salvar endereço. Verifique os dados informados.");
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
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "15px",
            alignItems: "center",
          }}
        >
          <button
            onClick={sendLocation}
            disabled={sendingLocation}
            title={sendingLocation ? "Enviando..." : "Enviar Localização Atual"}
            style={{
              padding: "10px",
              backgroundColor: sendingLocation ? "#4e944f" : "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              cursor: sendingLocation ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "45px",
              height: "45px",
            }}
          >
            <FaLocationArrow />
          </button>

          <button
            onClick={() => setEditingManual(true)}
            title="Editar Endereço"
            style={{
              padding: "10px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "45px",
              height: "45px",
            }}
          >
            <FaEdit />
          </button>

          <button
            onClick={deleteLocation}
            title="Ocultar"
            style={{
              padding: "10px",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "45px",
              height: "45px",
            }}
          >
            <FaEyeSlash />
          </button>
        </div>
      </div>

      {editingManual && (
        <div
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
          }}
          onClick={() => setEditingManual(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: "30px",
              borderRadius: "20px",
              width: "90%",
              maxWidth: "400px",
              color: "#000",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                marginBottom: "10px",
                fontSize: "20px",
                fontWeight: "600",
              }}
            >
              Editar Endereço
            </h2>
            <input
              type="text"
              placeholder="Rua"
              value={rua}
              onChange={(e) => setRua(e.target.value)}
              style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
            />
            <input
              type="text"
              placeholder="Número"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
            />
            <input
              type="text"
              placeholder="Bairro"
              value={bairroInput}
              onChange={(e) => setBairroInput(e.target.value)}
              style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
            />
            <input
              type="text"
              placeholder="Cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={saveManualAddress}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#28a745",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Salvar
              </button>
              <button
                onClick={() => setEditingManual(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#6c757d",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showPermissionModal && (
        <div
          role="dialog"
          aria-modal="true"
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
          }}
          onClick={() => setShowPermissionModal(false)}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(12px)",
              borderRadius: "20px",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              padding: "30px",
              maxWidth: "400px",
              width: "100%",
              color: "#fff",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
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
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                borderRadius: "12px",
                padding: "10px 20px",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: "pointer",
                border: "none",
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
