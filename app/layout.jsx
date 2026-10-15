import "./globals.css";
import { Outfit, Inter } from "next/font/google";
import { WalletProvider } from "../lib/walletContext";
import WalletModal from "../components/WalletModal";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "Snowdrop — Send AVAX to Anyone with a Link",
  description:
    "Send AVAX to anyone, anywhere — no wallet address needed. Just create a link, share it, and let them claim. Built on Avalanche Fuji.",
  icons: {
    icon: "/snowflake.png",
    shortcut: "/snowflake.png",
    apple: "/snowflake.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="/snowflake.png" type="image/png" />
      </head>
      <body className="bg-[#F8FAF8] text-[#132238] font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
        <WalletProvider>
          {children}
          <WalletModal />
        </WalletProvider>
      </body>
    </html>
  );
}
