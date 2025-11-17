"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { keyframes } from "@emotion/react";
import { Box, Button, Flex, Heading, Input, VStack } from "@chakra-ui/react";
import toast from "react-hot-toast";
import { updateUserLogin } from "@/app/lib/updateUser";

// Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Fade + slide animation for card
const fadeSlide = keyframes`
  from {
    opacity: 0;
    transform: translateY(25px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Animated Gradient Background
const movingGradient = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

export default function LoginPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!userId || !password) {
      toast.error("Please enter your user ID and password.");
      return;
    }

    setLoading(true);

    // تحقق من وجود المستخدم في جدول users
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .eq("password", password)
      .single();

    setLoading(false);
    if (error || !user) {
      toast.error("Invalid user ID or password.");
      return;
    }

    // إنشاء الكوكي لتخزين session
    document.cookie = `user_id=${user.id}; path=/; max-age=${60 * 60 * 24}`; // صالح 24 ساعة
    updateUserLogin(user.id);

    toast.success("Login successful!");
    router.push("/dashboard");
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      px={4}
      bgGradient="linear(to-r, #0f172a, #1e3a8a, #3b82f6, #2563eb)"
      sx={{
        backgroundSize: "300% 300%",
        animation: `${movingGradient} 12s ease infinite`,
      }}
    >
      <Box
        bg="white"
        p={8}
        rounded="lg"
        shadow="lg"
        width="100%"
        maxW="420px"
        sx={{ animation: `${fadeSlide} 0.9s ease` }}
      >
        <VStack spacing={6}>
          <Heading size="lg">Login</Heading>

          <VStack spacing={4} width="100%">
            <Input
              size="lg"
              placeholder="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />

            <Input
              size="lg"
              type="password"
              placeholder="Password"
              value={password}
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
