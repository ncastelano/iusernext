import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "./home/responsive.css";
import { UserProvider } from "./components/UserContext";
import NavbarTrainingWrapper from "./components/NavbarTrainingWrapper";

export const metadata: Metadata = {
  title: "iUser",
  description: "a melhor rede social",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon/icon_blackbg_512x512.png",
    apple: "/icon/icon_blackbg_512x512.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body>
        <UserProvider>
          {/* NavbarTraining agora é client component e decide internamente se mostra ou não */}
          <NavbarTrainingWrapper />
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
