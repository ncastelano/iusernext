// app/page.tsx ou app/home/page.tsx
"use client";

import React from "react";
import { GoogleMap, Polygon, useLoadScript } from "@react-google-maps/api";

const libraries = ["places"];
const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};
const center = { lat: -23.5505, lng: -46.6333 }; // São Paulo, por exemplo

// Conversão de metros para graus aproximado
const meterToLat = 1 / 111320;
const meterToLng = (lat: number) =>
  1 / ((40075000 * Math.cos((lat * Math.PI) / 180)) / 360);

// Lista das empresas com dimensões
const empresas = [
  {
    nome: "Empresa A",
    largura: 3, // metros
    altura: 3, // metros
    cor: "#FF0000",
  },
  {
    nome: "Empresa B",
    largura: 10,
    altura: 10,
    cor: "#00FF00",
  },
  {
    nome: "Empresa C",
    largura: 10,
    altura: 20,
    cor: "#0000FF",
  },
];

export default function Home() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyDnhP6Wg40KC-hOCj-Fe5ogByUJJhWzeM4",
    libraries: libraries as any,
  });

  if (!isLoaded) return <div>Carregando mapa...</div>;

  // Calcula os polígonos um ao lado do outro
  const baseLat = center.lat;
  let baseLng = center.lng;

  const polygons = empresas.map((empresa, index) => {
    const latOffset = meterToLat * empresa.altura;
    const lngOffset = meterToLng(baseLat) * empresa.largura;

    const paths = [
      { lat: baseLat, lng: baseLng },
      { lat: baseLat, lng: baseLng + lngOffset },
      { lat: baseLat + latOffset, lng: baseLng + lngOffset },
      { lat: baseLat + latOffset, lng: baseLng },
    ];

    // Atualiza o ponto base para a próxima empresa (com um pequeno espaço)
    baseLng += lngOffset + meterToLng(baseLat) * 1; // 1 metro de espaço

    return {
      nome: empresa.nome,
      paths,
      cor: empresa.cor,
    };
  });

  return (
    <div className="w-full h-screen flex">
      {/* Lista lateral */}
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

      {/* Mapa */}
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
