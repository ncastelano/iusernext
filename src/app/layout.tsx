// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "./home/responsive.css";
import { UserProvider } from "./components/UserContext";
import NavbarTrainingWrapper from "./components/NavbarTrainingWrapper";
import BottomBarWrapper from "./components/BottomBarWrapper";

export const metadata: Metadata = {
  title: "iUser",
  description: "plataforma de serviços",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon/icon_blackbg_512x512.png",
    apple: "/icon/icon_blackbg_512x512.png",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
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
          <div className="min-h-screen flex flex-col">
            {/* Navbar de treino aparece só nas rotas configuradas */}
            <NavbarTrainingWrapper />

            {/* Conteúdo principal */}
            <main className="flex-1">{children}</main>

            {/* BottomBar aparece só nas rotas configuradas */}
            <BottomBarWrapper />
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
