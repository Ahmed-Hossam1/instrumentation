// app/src/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Chakra } from "./lib/chakra-provider";
import { Toaster } from "react-hot-toast";
import PageLoader from "./UI/Loader";

export const metadata: Metadata = {
  title: "Instrumentation",
  description: "Instrumentation dashboard app for technicians and engineers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Chakra>
          <Toaster />
          <PageLoader />
          {children}
        </Chakra>
      </body>
    </html>
  );
}
