// lib/chakra-provider.tsx
"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { ReactNode } from "react";

export function Chakra({ children }: { children: ReactNode }) {
  return <ChakraProvider>{children}</ChakraProvider>;
}
