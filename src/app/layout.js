import { Inter, Merriweather } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

// ─── Font Configuration ───────────────────────────────────────────────────────

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap', // ← prevents invisible text during font load
});

const merriweather = Merriweather({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-merriweather',
  display: 'swap', // ← prevents invisible text during font load
});

// ─── Site Metadata ────────────────────────────────────────────────────────────

export const metadata = {
  title: {
    default: 'Afro Asian News',
    template: '%s — Afro Asian News', // ← individual pages set their own title
  },
  description: 'Connecting Policy, Diplomacy, and Economy across the globe.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  ),
  openGraph: {
    siteName: 'Afro Asian News',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${merriweather.variable}`}
    >
      {/*
        Do NOT add a background color here inline — it is handled
        entirely by globals.css so it applies consistently everywhere.
      */}
      <body>
        <div className="aan-app">
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
