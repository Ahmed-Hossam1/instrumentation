"use client";

import { useEffect, useState, ChangeEvent } from "react";
import {
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  HStack,
  Image,
  Input,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import toast from "react-hot-toast";

import { supabase } from "../lib/Supabase";
import { Devices } from "../interface/interface";

import MySkeleton from "../components/MySkeleton";
import MyModal from "../UI/MyModal";
import Pagination from "../UI/Pagination";
import PageLoader from "../UI/Loader";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";

// =============================
// Devices Page Component
// =============================
const DevicesPage = () => {
  // -----------------------------
  // State Management
  // -----------------------------
  const [devices, setDevices] = useState<Devices[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deviceToAdd, setDeviceToAdd] = useState<Devices>({} as Devices);

  // -----------------------------
  // Filtering & Pagination
  // -----------------------------
  const handleFilter = (e: ChangeEvent<HTMLInputElement>) =>
    setSearch(e.target.value);

  const filtered = devices.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  const itemsPerPage = 6;
  const indexOfLastItem = itemsPerPage * currentPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 1200, behavior: "smooth" });
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    window.scrollTo({ top: 1200, behavior: "smooth" });
  };

  // -----------------------------
  // Modal Handlers
  // -----------------------------
  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenModal = () => setIsModalOpen(true);

  // -----------------------------
  // Form Handlers
  // -----------------------------
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type, value } = e.target;

    if (type === "file") {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setDeviceToAdd((prev) => ({ ...prev, [name]: file }));
    } else {
      setDeviceToAdd((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (!deviceToAdd.title || deviceToAdd.title.trim() === "")
      return toast.error("اسم المعده مطلوب");

    if (!deviceToAdd.image_url || deviceToAdd.image_url === "")
      return toast.error("رابط صورة المعده مطلوب");

    const id = uuidv4();
    setLoading(true);

    // upload Image To Storage First
    const imagePath = `images/${id}.jpg`;
    const { error: imgUploadError } = await supabase.storage
      .from("media")
      .upload(imagePath, deviceToAdd.image_url, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (imgUploadError) return toast.error("حدث خطأ في رقع الصورة");

    // After upload the image Now Get It From Storage To include it in Supabase
    const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${imagePath}`;

    try {
      const { error } = await supabase.from("devices").insert({
        ...deviceToAdd,
        image_url: imageUrl,
      });
      if (error) {
        toast.error(error.message);
        setLoading(false);
      } else {
        toast.success("تم اضافه المعده بنجاح");
        getDevices();
        handleCloseModal();
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // -----------------------------
  // Fetch Data from Supabase
  // -----------------------------
  const getDevices = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("devices").select("*");

    if (error) {
      toast.error(error.message);
    } else {
      setDevices(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    getDevices();
  }, []);

  // -----------------------------
  // Loader
  // -----------------------------
  if (loading) return <PageLoader loading={loading} />;

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <>
      {/* Search Bar */}
      <HStack spacing={4} mb={6}>
        <Input
          placeholder="ابحث باسم أو رقم المعده "
          value={search}
          onChange={handleFilter}
        />
      </HStack>

      {/* Add Device Button */}
      <Button colorScheme="blue" w="100%" mb={8} onClick={handleOpenModal}>
        إضافة جهاز
      </Button>

      {/* Add Device Modal */}
      <MyModal
        ModalTitle="إضافة معده جديده"
        closeModal={handleCloseModal}
        isOpen={isModalOpen}
        handleSave={handleSave}
      >
        <FormControl mb={4}>
          <FormLabel>اسم المعده</FormLabel>
          <Input name="title" type="text" onChange={handleChange} />
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>رابط صورة المعده</FormLabel>
          <Input
            name="image_url"
            type="file"
            accept="image/*"
            onChange={handleChange}
          />
        </FormControl>
      </MyModal>

      {/* Devices List */}
      <SimpleGrid columns={{ base: 2, lg: 2, xl: 3 }} spacing={6}>
        {currentItems.map((device) => (
          <Link href={`/Devices/${device.id}`} key={device.id} >
            <Card
              _hover={{ shadow: "lg", transform: "scale(1.02)" }}
              transition="all 0.2s"
              cursor="pointer"
              w="100%"
              h="100%"
              bg="imageBg"
            >
              <Image
                src={device.image_url as string}
                alt={device.title}
                w="100%"
                maxH={{ base: "180px", md: "200px", lg: "250px" }}
                objectFit="cover"
                borderTopRadius="md"
                bg="white"
                fallback={<MySkeleton />}
                onError={(e) => {
                  e.currentTarget.src =
                    "https://tse1.mm.bing.net/th/id/OIP.XXWKhZZeWjrUPx-ZSfP0GAHaDt?r=0&rs=1&pid=ImgDetMain&o=7&rm=3";
                }}
              />
              <CardBody>
                <Text
                  fontSize="md"
                  fontWeight={"medium"}
                  textTransform={"capitalize"}
                  letterSpacing={"wide"}
                >
                  {" "}
                  {device.title}
                </Text>
              </CardBody>
            </Card>
          </Link>
        ))}
      </SimpleGrid>

      {/* Pagination */}
      <HStack spacing={4} mt={6} justify="center">
        <Pagination
          ToWhere={goToPreviousPage}
          isDisabled={currentPage === 1}
          title="السابق"
        />
        <Text>
          الصفحة {currentPage} من {totalPages}
        </Text>
        <Pagination
          ToWhere={goToNextPage}
          isDisabled={currentPage === totalPages}
          title="التالي"
        />
      </HStack>

      {/* No Results */}
      {filtered.length === 0 && (
        <Text mt={4} color="gray.500">
          لا توجد نتائج مطابقة.
        </Text>
      )}
    </>
  );
};

export default DevicesPage;
