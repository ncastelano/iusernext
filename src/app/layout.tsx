// layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css"; // Importa o CSS do Leaflet globalmente
import "leaflet-draw/dist/leaflet.draw.css"; // Importa o CSS do leaflet-draw globalmente
import { UserProvider } from "./components/UserContext";
// import Navbar from './components/Navbar'
import NavigationBar from "./components/NavigationBar";
// import ConditionalUI from './components/ConditionalUI'

export const metadata: Metadata = {
  title: "iUser",
  description: "a melhor plataforma",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon/icon-192x192.png",
    apple: "/icon/icon-512x512.png",
  },
};

export const viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <UserProvider>
          {/* <ConditionalUI /> */}
          {/* <Navbar /> */}
          <NavigationBar />
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
