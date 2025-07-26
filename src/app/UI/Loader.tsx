// components/PageLoader.tsx
"use client";

import { Box, Text, useColorModeValue } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

const fadeInOut = keyframes`
  0% { opacity: 0; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 0; transform: scale(0.95); }
`;

export default function PageLoader({ loading }: { loading?: boolean }) {
  const bg = useColorModeValue("white", "gray.800");

  if (!loading) return null;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg={bg}
      zIndex={9999}
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Text
        fontSize="5xl"
        fontWeight="bold"
        fontFamily="Dancing Script, cursive"
        animation={`${fadeInOut} 2s infinite`}
        color="blue.400"
      >
        Instrumentation
      </Text>
    </Box>
  );
}
