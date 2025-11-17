"use client";

import {
  Box,
  SimpleGrid,
  Heading,
  useColorModeValue,
  UnorderedList,
  Text,
  ListItem,
  VStack,
  Image,
} from "@chakra-ui/react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function HomePageUI() {
  const boxBg = useColorModeValue("white", "gray.800");
  const bg = useColorModeValue("gray.50", "gray.900");


  const deviceData = {
    labels: ["Transmitters", "Sensors", "Controllers", "Valves"],
    datasets: [
      {
        label: "عدد الأجهزة",
        data: [90, 120, 60, 90],
        backgroundColor: "#3182ce",
      },
    ],
  };

  const images = [
    "https://www.gasco.com.eg/wp-content/uploads/2020/12/Portal-Light-277-600x391.jpg",
    "https://www.gasco.com.eg/wp-content/uploads/2020/12/Portal-Light-80-1-600x222.jpg",
    "https://www.gasco.com.eg/wp-content/uploads/2020/12/Portal-Light-34-768x510.jpg",
  ];

  return (
    <Box p={6} bg={boxBg} borderRadius="md">
      <Heading size="lg" mb={4}>
        📊 Dashboard - أجهزة المصنع
      </Heading>

      <Box bg={bg} minH="100vh" p={{ base: 4, md: 8 }}>
        <Heading
          textAlign="center"
          mb={8}
          fontSize={{ base: "2xl", md: "4xl" }}
          color="blue.700"
        >
          AMERYA LPG RECOVERY PLANT
        </Heading>

        <video
          src="https://www.gasco.com.eg/wp-content/uploads/2021/03/Gasco-Hero2.mp4"
          autoPlay
          muted
          loop
          playsInline
          width="100%"
          style={{ borderRadius: "1rem", marginBottom: "1rem" }}
        />

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          <VStack spacing={6}>
            {images.map((src, index) => (
              <Image
                key={index}
                src={src}
                alt={`Plant ${index + 1}`}
                borderRadius="md"
                boxShadow="md"
                w="100%"
                objectFit="cover"
              />
            ))}
          </VStack>

          <Box bg={boxBg} p={6} borderRadius="md" boxShadow="sm">
            <Heading size="lg" mb={4}>
              Western Desert Gas Complex (WDGC)
            </Heading>
            <Text fontSize="md" color="gray.600" mb={3}>
              Within the framework of GASCO Company role in supporting the
              national economy and providing strategic products to the local
              market, the company established the Western Desert Gas Complex in
              1997 and the operation began in May 2000 to maximize the benefit
              from gases produced in the Western desert area.
            </Text>

            <Text fontSize="md" color="gray.600" mb={3}>
              Feed gases reach the plant from the following gas fields:
            </Text>
            <UnorderedList spacing={2} color="gray.600" mb={3}>
              <ListItem>Al-Obaiyed (Badr Al-Din Petroleum Company)</ListItem>
              <ListItem>
                Salam, Tarek and El-qasr (Khlada Petroleum Company)
              </ListItem>
              <ListItem>El-Yasmin (Agiba Petroleum Company)</ListItem>
            </UnorderedList>

            <Text fontSize="md" color="gray.600" mb={3}>
              The produced gases in fields are transported to the complex
              through a pipeline of 34 inches in diameter and 230 km in length.
            </Text>

            <Text fontSize="md" color="gray.600" mb={3}>
              In 2010, Train-C at WDGC was started up to increase WDGC capacity
              from 600 to 900 MMSCFD.
            </Text>

            <Text fontSize="md" color="gray.600" mb={3}>
              WDGC produces:
            </Text>
            <UnorderedList spacing={2} color="gray.600">
              <ListItem>
                <strong>Ethane / propane mixture</strong>: raw material for the
                petrochemical industry.
              </ListItem>
              <ListItem>
                <strong>Commercial Propane</strong>: exported to global markets.
              </ListItem>
              <ListItem>
                <strong>LPG</strong>: supports the local strategic needs.
              </ListItem>
              <ListItem>
                <strong>Condensate</strong>: supplied to refineries for
                high-value products.
              </ListItem>
            </UnorderedList>
          </Box>
        </SimpleGrid>
      </Box>

      <Box mb={20}>
        <Heading size="md" mb={2}>
          📈 توزيع الأجهزة
        </Heading>
        <Bar data={deviceData} />
      </Box>
    </Box>
  );
}
