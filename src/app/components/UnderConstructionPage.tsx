"use client";

import { Box, Spinner, Text, VStack } from "@chakra-ui/react";

const ComingSoonPage = () => {
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.900"
      color="white"
    >
      <VStack spacing={4}>
        <Spinner size="xl" thickness="4px" color="teal.300" />
        <Text fontSize="2xl" fontWeight="bold">
          Coming Soon 🚧
        </Text>
        <Text fontSize="md" color="gray.400">
          ... الصفحة تحت التطوير
        </Text>
      </VStack>
    </Box>
  );
};

export default ComingSoonPage;
