import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import RootClientLayout from './RootClientLayout'; // Import the client wrapper

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'ProtectedPay | Secure Crypto Transfers on Taiko',
  description: 'Secure crypto transfers, group payments, and smart savings on the Taiko blockchain',
  keywords: 'crypto, payments, blockchain, Taiko, DeFi, secure transfers, group payments',
  authors: [{ name: 'ProtectedPay' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${inter.className} overflow-x-hidden`}>
        <RootClientLayout>
          {/* Main Content */}
          <div className="relative min-h-screen flex flex-col">
            <div className="sticky top-0 z-50 backdrop-blur-xl border-b border-green-500/10 bg-black/20">
              <Navbar />
            </div>
            <main className="flex-grow relative z-10">
              {children}
            </main>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />
          </div>
        </RootClientLayout>
      </body>
    </html>
  );
}
