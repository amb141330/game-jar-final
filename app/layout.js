import './globals.css';
import AnimalParade from '@/components/AnimalParade';

export const metadata = {
  title: 'Game Night Jar 🫙💕',
  description: 'Pick a game from our jar!',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AnimalParade/>
        {children}
      </body>
    </html>
  );
}
