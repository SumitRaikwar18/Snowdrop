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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Catch window errors from browser extensions (MetaMask, Core, etc.)
                function shouldSuppress(err, msg, file) {
                  var str = (msg || '') + ' ' + (file || '') + ' ' + (err && err.stack ? err.stack : '');
                  return (
                    str.indexOf('chrome-extension://') !== -1 ||
                    str.indexOf('MetaMask') !== -1 ||
                    str.indexOf('Failed to connect to MetaMask') !== -1 ||
                    str.indexOf('extension not found') !== -1 ||
                    str.indexOf('inpage.js') !== -1
                  );
                }

                window.addEventListener('error', function(e) {
                  if (shouldSuppress(e.error, e.message, e.filename)) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    return true;
                  }
                }, true);

                window.addEventListener('unhandledrejection', function(e) {
                  var reason = e.reason || {};
                  if (shouldSuppress(reason, reason.message, reason.stack)) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    return true;
                  }
                }, true);

                var prevOnError = window.onerror;
                window.onerror = function(msg, url, lineNo, colNo, error) {
                  if (shouldSuppress(error, msg, url)) {
                    return true;
                  }
                  if (typeof prevOnError === 'function') {
                    return prevOnError.apply(this, arguments);
                  }
                };
              })();
            `,
          }}
        />
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
