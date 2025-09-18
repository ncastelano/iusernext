// app/fotografar/page.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaCamera,
  FaRedo,
  FaDownload,
  FaTrash,
  FaSyncAlt,
  FaArrowLeft,
} from "react-icons/fa";

/**
 * Página Fotografar — captura de foto usando a câmera do dispositivo.
 * - Inline CSS
 * - Lista de câmeras disponíveis (front/back) quando suportado
 * - Tirar foto -> mostra preview -> permitir re-take / download / aceitar
 * - Compatível com mobile (uses playsInline, facingMode ideal)
 *
 * Observações:
 * - Para acesso à câmera é necessário HTTPS (ou localhost)
 * - Nem todos os navegadores permitem controle de torch/flash via Web API
 */

export default function FotografarPage() {
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [loadingCamera, setLoadingCamera] = useState(false);

  // busca devices de vídeo disponíveis
  const enumerateVideoDevices = useCallback(async () => {
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = all.filter((d) => d.kind === "videoinput");
      setDevices(videoInputs);
    } catch (err) {
      console.error("Erro enumerando dispositivos:", err);
      setDevices([]);
    }
  }, []);

  // inicia stream da câmera, preferindo deviceId se definido
  const startCamera = useCallback(
    async (deviceId?: string | null) => {
      setError(null);
      setLoadingCamera(true);
      try {
        // se já houver stream, para antes de abrir nova (evita duplicar)
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }

        const constraints: MediaStreamConstraints = {
          video: deviceId
            ? { deviceId: { exact: deviceId } }
            : { facingMode: { ideal: "environment" } },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {
            /* ignorar autoplay bloqueado; usuário interage */
          });
        }
        setIsCameraOn(true);
        setLoadingCamera(false);
        // atualizar lista de devices (alguns browsers mostram devices só após getUserMedia)
        await enumerateVideoDevices();
      } catch (err) {
        console.error("Erro ao iniciar câmera:", err);
        setLoadingCamera(false);
        setError(
          (err as Error)?.message ||
            "Não foi possível acessar a câmera. Verifique permissões."
        );
      }
    },
    [enumerateVideoDevices]
  );

  // para a câmera (stop tracks)
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraOn(false);
  }, []);

  // captura a imagem do vídeo para canvas e gera dataURL
  const takePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // desenha espelhamento se câmera frontal estiver em uso?
    // (deixar como o stream apresenta — não modificamos por padrão)
    ctx.drawImage(video, 0, 0, w, h);

    // compressão leve
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setPreviewDataUrl(dataUrl);

    // pare a câmera para economizar bateria (opcional)
    stopCamera();
  }, [stopCamera]);

  // re-take: limpa preview e reinicia câmera
  const retake = useCallback(async () => {
    setPreviewDataUrl(null);
    setError(null);
    await startCamera(selectedDeviceId ?? null);
  }, [startCamera, selectedDeviceId]);

  // baixar foto atual
  const downloadPhoto = useCallback(async () => {
    if (!previewDataUrl) return;
    try {
      const res = await fetch(previewDataUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `photo_${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao baixar imagem:", err);
      setError("Falha ao baixar a imagem.");
    }
  }, [previewDataUrl]);

  // alterna entre dispositivos disponíveis (útil para front/back)
  const cycleCamera = useCallback(async () => {
    if (devices.length <= 1) return;
    const currentIndex = devices.findIndex(
      (d) => d.deviceId === selectedDeviceId
    );
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDeviceId = devices[nextIndex].deviceId;
    setSelectedDeviceId(nextDeviceId);
    await startCamera(nextDeviceId);
  }, [devices, selectedDeviceId, startCamera]);

  // init: listar dispositivos e tentar iniciar câmera automaticamente
  useEffect(() => {
    enumerateVideoDevices();
    // não iniciar automaticamente em alguns contextos — vamos iniciar só quando o usuário abrir a página
    // mas aqui podemos tentar iniciar para melhorar UX:
    startCamera(selectedDeviceId ?? null);

    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // se user trocar selectedDeviceId manualmente
  useEffect(() => {
    if (selectedDeviceId) {
      startCamera(selectedDeviceId);
    }
  }, [selectedDeviceId, startCamera]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        background: "#000",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* AppBar */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          gap: 12,
          background: "rgba(0,0,0,0.7)",
        }}
      >
        <button
          onClick={() => {
            stopCamera();
            router.back();
          }}
          aria-label="Voltar"
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: 18,
            cursor: "pointer",
          }}
        >
          <FaArrowLeft />
        </button>

        <div style={{ fontWeight: 700, fontSize: 18 }}>Fotografar</div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button
            onClick={cycleCamera}
            title={
              devices.length > 1 ? "Trocar câmera" : "Nenhuma outra câmera"
            }
            disabled={devices.length <= 1}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "none",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              cursor: devices.length > 1 ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <FaSyncAlt />
            <span style={{ fontSize: 12 }}>
              {devices.length > 1 ? "Trocar" : "1"}
            </span>
          </button>
        </div>
      </div>

      {/* Main area */}
      <div
        style={{
          flex: 1,
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Video / Preview container */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#111",
            position: "relative",
          }}
        >
          {/* Live video */}
          {!previewDataUrl && (
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                background: "#000",
              }}
            />
          )}

          {/* Preview imagem capturada */}
          {previewDataUrl && (
            <img
              src={previewDataUrl}
              alt="Preview da foto"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          )}

          {/* Indicador de erro */}
          {error && (
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                background: "#ff4d4f",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: 8,
                fontSize: 13,
                zIndex: 50,
              }}
            >
              {error}
            </div>
          )}

          {/* Camera loading overlay */}
          {loadingCamera && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                zIndex: 40,
                background: "rgba(0,0,0,0.6)",
                padding: 12,
                borderRadius: 8,
              }}
            >
              <div style={{ color: "#fff" }}>Carregando câmera...</div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div
          style={{
            height: 110,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "12px",
            boxSizing: "border-box",
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.0), rgba(0,0,0,0.6))",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {/* Lista de devices (se houver) */}
            {devices.length > 0 && (
              <select
                value={selectedDeviceId ?? ""}
                onChange={(e) => setSelectedDeviceId(e.target.value || null)}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  color: "#fff",
                  padding: "8px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <option value="">Padrão (rear/front)</option>
                {devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Câmera ${d.deviceId}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {/* Se tiver preview: mostrar ações sobre a foto */}
            {previewDataUrl ? (
              <>
                <button
                  onClick={retake}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "none",
                    background: "rgba(255,255,255,0.06)",
                    color: "#fff",
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <FaRedo /> Refazer
                </button>

                <button
                  onClick={downloadPhoto}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "none",
                    background: "#22c55e",
                    color: "#000",
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  <FaDownload /> Baixar
                </button>

                <button
                  onClick={() => {
                    // ação "aceitar": aqui você pode navegar para upload ou salvar no estado global
                    alert(
                      "Foto aceita — implementar upload conforme necessário."
                    );
                  }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "none",
                    background: "#2563eb",
                    color: "#fff",
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  <FaCamera /> Aceitar
                </button>

                <button
                  onClick={() => {
                    setPreviewDataUrl(null);
                  }}
                  title="Excluir preview"
                  style={{
                    padding: "8px",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.06)",
                    background: "transparent",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <FaTrash />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={takePhoto}
                  aria-label="Tirar foto"
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: "50%",
                    background: "linear-gradient(180deg,#22c55e,#16a34a)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "none",
                    boxShadow: "0 6px 20px rgba(34,197,94,0.25)",
                    cursor: "pointer",
                    fontSize: 22,
                    color: "#000",
                  }}
                >
                  <FaCamera />
                </button>

                <button
                  onClick={() => {
                    // ligar/desligar câmera
                    if (isCameraOn) stopCamera();
                    else startCamera(selectedDeviceId ?? null);
                  }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "none",
                    background: "rgba(255,255,255,0.06)",
                    color: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {isCameraOn ? "Desligar" : "Ligar câmera"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* canvas offscreen para captura */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
