import "./globals.css";
import type { Metadata } from "next";
import { Chakra } from "./lib/chakra-provider";
import SidebarWithHeader from "./components/SidebarWithHeader";
import { Toaster } from "react-hot-toast";
import PageLoader from "./UI/Loader";
export const metadata: Metadata = {
  title: "instrumentation",
  description: "instrumentation dashboard app for technicians and engineers",
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
          <SidebarWithHeader>
            <PageLoader />
            {children}
          </SidebarWithHeader>
        </Chakra>
      </body>
    </html>
  );
}
