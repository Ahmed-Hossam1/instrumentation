"use client";

import MySkeleton from "@/app/components/MySkeleton";
import { supabase } from "@/app/lib/Supabase";
import PageLoader from "@/app/UI/Loader";
import {
  Badge,
  Box,
  Card,
  CardBody,
  HStack,
  Icon,
  Image,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BsImages } from "react-icons/bs";

const FALLBACK_IMG =
  "https://tse1.mm.bing.net/th/id/OIP.XXWKhZZeWjrUPx-ZSfP0GAHaDt?r=0&rs=1&pid=ImgDetMain&o=7&rm=3";

type GroupedDevice = {
  equipment_code: string;
  tag: string;
  device_type: string;
  images: string[];
};

const DeviceDetails = () => {
  const { code } = useParams();
  const [devices, setDevices] = useState<GroupedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const getDevices = async () => {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("devices_view")
        .select("*")
        .eq("equipment_code", code);

      if (error) {
        setErrorMsg(error.message);
        setDevices([]);
      } else {
        // Group directly here
        const grouped: Record<string, GroupedDevice> = {};
        data?.forEach((row) => {
          const key = `${row.device_type}-${row.tag}`;
          if (!grouped[key]) {
            grouped[key] = {
              equipment_code: row.equipment_code ?? "",
              tag: row.tag ?? "unknown",
              device_type: row.device_type ?? "Unknown",
              images: row.image_url ? [row.image_url] : [],
            };
          } else if (
            row.image_url &&
            !grouped[key].images.includes(row.image_url)
          ) {
            grouped[key].images.push(row.image_url);
          }
        });
        setDevices(Object.values(grouped));
      }
      setLoading(false);
    };

    getDevices();
  }, [code]);

  if (loading) return <PageLoader loading={loading} />;

  return (
    <Box px={{ base: 4, md: 8 }} py={6}>
      {/* Heading */}
      <Text fontSize="3xl" fontWeight="bold" mb="6" textAlign="center">
        {code?.toString().toUpperCase()}
      </Text>

      {errorMsg && (
        <Text color="red.500" textAlign="center" mb={4}>
          {errorMsg}
        </Text>
      )}

      {devices.length === 0 ? (
        <Text textAlign="center" fontWeight="bold" fontSize="2xl" m={4}>
          لا توجد أجهزة
        </Text>
      ) : (
        <SimpleGrid columns={{ base: 2, lg: 3 }} spacing={6}>
          {devices.map((device) => {
            const thumb = device.images[0] ?? FALLBACK_IMG;
            const href = `/dashboard/details/${encodeURIComponent(
              device.device_type.toLowerCase()
            )}/${encodeURIComponent(device.tag)}`;

            return (
              <Link href={href} key={`${device.device_type}-${device.tag}`}>
                <Card
                  _hover={{ shadow: "lg", transform: "scale(1.02)" }}
                  transition="all 0.18s ease"
                  cursor="pointer"
                  borderRadius="lg"
                  overflow="hidden"
                >
                  <Box w="100%" borderRadius="lg" overflow="hidden">
                    <Image
                      src={thumb}
                      alt={`${device.device_type} ${device.tag}`}
                      w="100%"
                      h="auto"
                      maxH={{ base: "220px", md: "280px", lg: "340px" }}
                      objectFit="contain"
                      bg="gray.50"
                      fallback={<MySkeleton />}
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMG;
                      }}
                    />
                  </Box>

                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between">
                        <Text fontSize="lg" fontWeight="semibold">
                          {device.tag}
                        </Text>
                        <Badge colorScheme="blue" fontSize="0.8rem">
                          {device.device_type}
                        </Badge>
                      </HStack>

                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">
                          {device.equipment_code}
                        </Text>
                        <HStack spacing={1}>
                          <Icon as={BsImages} />
                          <Text fontSize="sm" color="gray.600">
                            {device.images.length}
                          </Text>
                        </HStack>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default DeviceDetails;
