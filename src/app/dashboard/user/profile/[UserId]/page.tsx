"use client";

import { Iuser } from "@/app/interface/interface";
import { supabase } from "@/app/lib/Supabase";
import { updateUserLogin } from "@/app/lib/updateUser";
import PageLoader from "@/app/UI/Loader";
import {
  Flex,
  Avatar,
  Text,
  Heading,
  Button,
  VStack,
  HStack,
  Divider,
  Box,
  Tag,
  SimpleGrid,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import { redirect, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const activity = [
    "Logged in yesterday",
    "Updated profile last week",
    "Changed password 2 weeks ago",
  ];

  const [userData, setUserData] = useState<Iuser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const params = useParams();
  const { UserId } = params;

  const bgColor = useColorModeValue("gray.50", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subTextColor = useColorModeValue("gray.500", "gray.300");

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", UserId)
        .single();

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      setUserData(data);
      setIsLoading(false);
    };

    fetchUserData();
  }, [UserId]);

  function deleteCookies() {
    if (!UserId) return;
    updateUserLogin(UserId as string, false);
    document.cookie = "user_id=; path=/; max-age=0";
    toast.success("Logout successful!");
    redirect("/auth_layout/login");
  }

  if (isLoading) return <PageLoader loading={isLoading} />;

  return (
    <Flex direction="column" p={8} gap={10} bg={bgColor} minH="100vh">
      {/* HEADER */}
      <HStack spacing={6} align="center">
        <Avatar name={userData?.full_name as string} size="xl" />

        <VStack align="flex-start" spacing={2}>
          <Heading size="lg" color={textColor}>
            {userData?.full_name}
          </Heading>

          <HStack spacing={2}>
            <Tag size="md" colorScheme="blue">
              {userData?.role}
            </Tag>

            <Badge
              colorScheme={userData?.online ? "green" : "red"}
              variant="subtle"
            >
              {userData?.online ? "Online" : "Offline"}
            </Badge>
          </HStack>
        </VStack>
      </HStack>

      <Divider borderColor={subTextColor} />

      {/* STATS CARD */}
      <Box bg={cardBg} p={6} shadow="md" rounded="lg">
        <Heading size="md" mb={4} color={textColor}>
          User Statistics
        </Heading>

        <SimpleGrid columns={[1, 2, 3]} spacing={6}>
          <VStack align="flex-start">
            <Text fontSize="sm" color={subTextColor}>
              User ID
            </Text>
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              {userData?.id}
            </Text>
          </VStack>

          <VStack align="flex-start">
            <Text fontSize="sm" color={subTextColor}>
              Account Created
            </Text>
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              {userData?.created_at?.slice(0, 10)}
            </Text>
          </VStack>

          <VStack align="flex-start">
            <Text fontSize="sm" color={subTextColor}>
              Last Login
            </Text>
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              {userData?.last_login?.slice(0, 10) || "-"}
            </Text>
          </VStack>
        </SimpleGrid>
      </Box>

      {/* ACTIVITY LOG CARD */}
      <Box bg={cardBg} p={6} shadow="md" rounded="lg">
        <Heading size="md" mb={4} color={textColor}>
          Recent Activity
        </Heading>

        <VStack align="flex-start" spacing={2}>
          {activity.map((a, i) => (
            <Text key={i} fontSize="md" color={textColor}>
              • {a}
            </Text>
          ))}
        </VStack>
      </Box>

      {/* ACTION BUTTONS */}
      <HStack spacing={4}>
        <Button colorScheme="blue" size="lg">
          Edit Profile
        </Button>

        <Button colorScheme="red" size="lg" onClick={deleteCookies}>
          Logout
        </Button>
      </HStack>
    </Flex>
  );
}
