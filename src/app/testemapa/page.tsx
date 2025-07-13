//teste/page.tsx

"use client";

import React from "react";
import { GoogleMap, Polygon, useLoadScript } from "@react-google-maps/api";

interface Props {
  apiKey: string;
}

const libraries = ["places"];
const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};
const center = { lat: -23.5505, lng: -46.6333 };

// Conversão de metros para graus aproximado
const meterToLat = 1 / 111320;
const meterToLng = (lat: number) =>
  1 / ((40075000 * Math.cos((lat * Math.PI) / 180)) / 360);

// Lista das empresas com dimensões
const empresas = [
  { nome: "Empresa A", largura: 3, altura: 3, cor: "#FF0000" },
  { nome: "Empresa B", largura: 10, altura: 10, cor: "#00FF00" },
  { nome: "Empresa C", largura: 10, altura: 20, cor: "#0000FF" },
];

export default function HomeMap({ apiKey }: Props) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: libraries as any,
  });

  if (!isLoaded) return <div>Carregando mapa...</div>;

  const baseLat = center.lat;
  let baseLng = center.lng;

  const polygons = empresas.map((empresa) => {
    const latOffset = meterToLat * empresa.altura;
    const lngOffset = meterToLng(baseLat) * empresa.largura;

    const paths = [
      { lat: baseLat, lng: baseLng },
      { lat: baseLat, lng: baseLng + lngOffset },
      { lat: baseLat + latOffset, lng: baseLng + lngOffset },
      { lat: baseLat + latOffset, lng: baseLng },
    ];

    baseLng += lngOffset + meterToLng(baseLat); // espaço de 1 metro

    return {
      nome: empresa.nome,
      paths,
      cor: empresa.cor,
    };
  });

  return (
    <div className="w-full h-screen flex">
      <div className="w-64 bg-white p-4 border-r overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Empresas</h2>
        <ul>
          {empresas.map((empresa, i) => (
            <li key={i} className="mb-2">
              <div className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: empresa.cor }}
                ></div>
                <div>
                  {empresa.nome} — {empresa.largura}m x {empresa.altura}m
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={20}
          mapTypeId="satellite"
        >
          {polygons.map((item, i) => (
            <Polygon
              key={i}
              paths={item.paths}
              options={{
                strokeColor: item.cor,
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: item.cor,
                fillOpacity: 0.35,
              }}
            />
          ))}
        </GoogleMap>
      </div>
    </div>
  );
}
