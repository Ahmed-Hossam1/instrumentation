"use client";

import { Box, Heading, Text, Button } from "@chakra-ui/react";
import Link from "next/link";

const ErrorPage = () => {
  return (
    <Box textAlign="center" py={20} px={4}>
      <Heading as="h1" size="2xl" mb={4}>
        404 - الصفحة غير موجودة
      </Heading>
      <Text fontSize="lg" mb={6}>
        عذرًا، الصفحة اللي بتدور عليها مش موجودة أو تم نقلها.
      </Text>
      <Link href="/">
        <Button colorScheme="teal">العودة للرئيسية</Button>
      </Link>
    </Box>
  );
};

export default ErrorPage;
