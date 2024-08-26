import { Inter } from "next/font/google";
import "./globals.css";
import 'semantic-ui-css/semantic.min.css'

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TacitCaptions",
  description: "A CHI2025 Project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
