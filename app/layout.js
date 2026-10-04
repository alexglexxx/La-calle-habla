import "./globals.css";
import "./map.css";
import "maplibre-gl/dist/maplibre-gl.css";

export const metadata = {
  title: "La Calle Habla | Puerto Vallarta",
  description: "Mapa ciudadano de problemas urbanos de Puerto Vallarta."
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
