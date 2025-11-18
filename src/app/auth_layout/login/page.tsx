"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { keyframes } from "@emotion/react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import toast from "react-hot-toast";
import { updateUserLogin } from "@/app/lib/updateUser";
import { supabase } from "@/app/lib/Supabase";

// Animations
const fadeSlide = keyframes`
  from { opacity: 0; transform: translateY(25px); }
  to { opacity: 1; transform: translateY(0); }
`;

const movingGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export default function LoginPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Dark Mode Support
  const cardBg = useColorModeValue("white", "gray.800");
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const headingColor = useColorModeValue("gray.800", "white");

  const handleLogin = async () => {
    if (!userId || !password) {
      return toast.error("Please enter your user ID and password.");
    }

    setLoading(true);

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .eq("password", password)
      .single();

    setLoading(false);

    if (error || !user) {
      return toast.error("Invalid user ID or password.");
    }

    // Create cookie valid for 24 hours
    document.cookie = `user_id=${user.id}; path=/; max-age=${60 * 60 * 24}`;

    updateUserLogin(user.id, true);

    toast.success("Login successful!");
    router.replace("/dashboard");
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      px={4}
      bgGradient="linear(to-r, #0a1224, #152a4f, #1e3a8a, #0f1c3f)"
      sx={{
        backgroundSize: "300% 300%",
        animation: `${movingGradient} 12s ease infinite`,
      }}
    >
      <Box
        bg={cardBg}
        p={8}
        rounded="lg"
        shadow="lg"
        width="100%"
        maxW="420px"
        sx={{ animation: `${fadeSlide} 0.9s ease` }}
      >
        <VStack spacing={6}>
          <Heading size="lg" color={headingColor}>
            Login
          </Heading>

          <VStack spacing={4} width="100%">
            <Input
              size="lg"
              placeholder="User ID"
              value={userId}
              bg={inputBg}
              onChange={(e) => setUserId(e.target.value)}
            />

            <Input
              size="lg"
              type="password"
              placeholder="Password"
              value={password}
              bg={inputBg}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              width="100%"
              size="lg"
              colorScheme="blue"
              onClick={handleLogin}
              isLoading={loading}
            >
              Login
            </Button>
          </VStack>
        </VStack>
      </Box>
    </Flex>
  );
}
