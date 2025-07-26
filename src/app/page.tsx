"use client";

import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
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
import { motion } from "framer-motion";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const MotionBox = motion(Box);
const MotionStat = motion(Stat);
const MotionImage = motion(Image);
const MotionHeading = motion(Heading);
const MotionTr = motion(Tr);

export default function HomePage() {
  const boxBg = useColorModeValue("white", "gray.800");
  const statBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bg = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.800", "gray.100");

  const stats = [
    { label: "Transmitters", value: 14 },
    { label: "Sensors", value: 8 },
    { label: "Needs Calibration", value: 5 },
    { label: "Devices with Issues", value: 3 },
  ];

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

  const recentDevices = [
    {
      id: "PT-104",
      type: "Transmitter",
      status: "Active",
      updated: "2025/6/20",
    },
    {
      id: "PS-445",
      type: "Sensor",
      status: "Needs Calibration",
      updated: "2025/6/19",
    },
    { id: "FCV-202", type: "Valve", status: "Active", updated: "2025/6/18" },
  ];

  const images = [
    "https://www.gasco.com.eg/wp-content/uploads/2020/12/Portal-Light-277-600x391.jpg",
    "https://www.gasco.com.eg/wp-content/uploads/2020/12/Portal-Light-80-1-600x222.jpg",
    "https://www.gasco.com.eg/wp-content/uploads/2020/12/Portal-Light-34-768x510.jpg",
  ];

  return (
    <MotionBox
      p={6}
      bg={boxBg}
      borderRadius="md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <MotionHeading
        size="lg"
        mb={4}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        📊 Dashboard - أجهزة المصنع
      </MotionHeading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
        {stats.map((stat, index) => (
          <MotionStat
            key={stat.label}
            p={4}
            shadow="md"
            borderWidth="1px"
            borderRadius="md"
            bg={statBg}
            borderColor={borderColor}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <StatLabel>{stat.label}</StatLabel>
            <StatNumber>{stat.value}</StatNumber>
            <StatHelpText>تم التحديث مؤخرًا</StatHelpText>
          </MotionStat>
        ))}
      </SimpleGrid>

      <Box bg={bg} minH="100vh" p={{ base: 4, md: 8 }}>
        <MotionHeading
          textAlign="center"
          mb={8}
          fontSize={{ base: "2xl", md: "4xl" }}
          color="blue.700"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          AMERYA LPG RECOVERY PLANT
        </MotionHeading>

        <motion.video
          src="https://www.gasco.com.eg/wp-content/uploads/2021/03/Gasco-Hero2.mp4"
          autoPlay
          muted
          loop
          playsInline
          width="100%"
          style={{ borderRadius: "1rem", marginBottom: "1rem" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          <VStack spacing={6}>
            {images.map((src, index) => (
              <MotionImage
                key={index}
                src={src}
                alt={`Plant ${index + 1}`}
                borderRadius="md"
                boxShadow="md"
                w="100%"
                objectFit="cover"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.3 }}
              />
            ))}
          </VStack>

          <MotionBox
            bg={boxBg}
            p={6}
            borderRadius="md"
            boxShadow="sm"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
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
                <strong>Ethane / propane mixture</strong>: is the raw material
                for petrochemical industry and delivered to SIDPC and ETHDCO
                Companies to secure their feedstock of raw material.
              </ListItem>
              <ListItem>
                <strong>Commercial Propane</strong>: is exported to the global
                market and acts as a source of foreign currency.
              </ListItem>
              <ListItem>
                <strong>LPG</strong>: to support the local market of this
                strategic product and reduce the imported quantities.
              </ListItem>
              <ListItem>
                <strong>Condensate</strong>: is supplied to refineries plants to
                raise the quality of crude oil and produce petroleum products of
                high economic value.
              </ListItem>
            </UnorderedList>
            <Text fontSize="lg" mb={4}>
              <strong>Western Desert Gas Complex (WDGC)</strong>
            </Text>
            <Text fontSize="md" mb={2}>
              Within the framework of GASCO Company role in supporting the
              national economy and providing strategic products to the local
              market, the company established the Western Desert Gas Complex in
              1997 and the operation began in May 2000 to maximize the benefit
              from gases produced in the Western desert area.
            </Text>
            <Text fontSize="md" mb={2}>
              Feed gases reach the plant from the following gas fields:
            </Text>
            <UnorderedList spacing={2} mb={4} pl={5}>
              <ListItem>Al-Obaiyed (Badr Al-Din Petroleum Company)</ListItem>
              <ListItem>
                Salam, Tarek and El-qasr (Khalda Petroleum Company)
              </ListItem>
              <ListItem>El-Yasmin (Agiba Petroleum Company)</ListItem>
            </UnorderedList>
            <Text fontSize="md" mb={2}>
              The produced gases in fields are transported to the complex
              through a pipeline of 34 inches in diameter and 230 km in length.
            </Text>
            <Text fontSize="md" mb={2}>
              In 2010, Train-C at WDGC was started up to increase WDGC capacity
              from 600 to 900 MMSCFD.
            </Text>
            <Text fontSize="md" mb={2}>
              WDGC produces:
            </Text>
            <UnorderedList spacing={2} pl={5}>
              <ListItem>
                <strong>Ethane / propane mixture</strong>: is the raw material
                for petrochemical industry and delivered to SIDPC and ETHDCO
                Companies to secure their feedstock of raw material.
              </ListItem>
              <ListItem>
                <strong>Commercial Propane</strong>: is exported to the global
                market and acts as a source of foreign currency.
              </ListItem>
              <ListItem>
                <strong>LPG</strong>: to support the local market of this
                strategic product and reduce the imported quantities.
              </ListItem>
              <ListItem>
                <strong>Condensate</strong>: is supplied to refineries plants to
                raise the quality of crude oil and produce petroleum products of
                high economic value.
              </ListItem>
            </UnorderedList>
          </MotionBox>
        </SimpleGrid>
      </Box>

      <Box mb={20}>
        <MotionHeading
          size="md"
          mb={2}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          📈 توزيع الأجهزة
        </MotionHeading>
        <Bar data={deviceData} />
      </Box>

      <Box mb={6}>
        <HStack justify="space-between" mb={2}>
          <MotionHeading
            size="md"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            🕓 آخر الأجهزة المضافة
          </MotionHeading>
        </HStack>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>رقم الجهاز</Th>
              <Th>النوع</Th>
              <Th>الحالة</Th>
              <Th>آخر تعديل</Th>
            </Tr>
          </Thead>
          <Tbody>
            {recentDevices.map((device, index) => (
              <MotionTr
                key={device.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.2 }}
              >
                <Td>{device.id}</Td>
                <Td>{device.type}</Td>
                <Td>{device.status}</Td>
                <Td>{device.updated}</Td>
              </MotionTr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </MotionBox>
  );
}
