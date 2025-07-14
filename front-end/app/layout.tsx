import './globals.css';
import Footer from './components/Footer/Footer';
import dynamic from "next/dynamic";

const Navbar = dynamic(() => import('./components/Navbar/index'), {
  ssr: false,
});

export const metadata = {
  title: 'OceanEyes',
  description: 'Ocean Protection',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  )
}
