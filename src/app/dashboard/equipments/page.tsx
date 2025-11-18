"use client";

import { useEffect, useState, ChangeEvent } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  HStack,
  Image,
  Input,
  SimpleGrid,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import toast from "react-hot-toast";
import Link from "next/link";

import { supabase } from "@/app/lib/Supabase";
import { equipments, formConfig } from "../../interface/interface";

import MySkeleton from "../../components/MySkeleton";
import Pagination from "../../UI/Pagination";
import PageLoader from "../../UI/Loader";
import MyModal from "../../UI/MyModal";
import DeviceForm from "../../UI/DeviceForm";
import { v4 as uuidv4 } from "uuid";

// =============================
// Equipments Page Component
// =============================
const EquipmentsPage = () => {
  // -----------------------------
  // State
  // -----------------------------
  const [equipments, setEquipments] = useState<equipments[]>([]);
  const [addEquipment, setAddEquipment] = useState<equipments>(
    {} as equipments
  );
  const [images, setImages] = useState<File[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const FieldsType = formConfig["equipments"];

  // =============================
  // 🎨 Dark Mode Colors
  // =============================
  const pageBg = useColorModeValue("gray.50", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const inputBg = useColorModeValue("white", "gray.600");
  const inputBorder = useColorModeValue("gray.300", "gray.500");
  const textColor = useColorModeValue("gray.800", "gray.100");

  // =============================
  // 🔍 Filtering
  // =============================
  const handleFilter = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const filtered = equipments.filter((d) =>
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  // =============================
  // 🔢 Pagination
  // =============================
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  // =============================
  // 📦 Fetch Equipments
  // =============================
  const getEquipments = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("equipments").select("*");

    if (error) toast.error(error.message);
    else setEquipments(data || []);

    setLoading(false);
  };

  useEffect(() => {
    getEquipments();
  }, []);

  // =============================
  // ✏️ Modal Handlers
  // =============================
  const handleChangeModal = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setAddEquipment((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  // =============================
  // ➕ Add New Equipment
  // =============================
  const handleAddDevice = async () => {
    if (!addEquipment.code || images.length === 0)
      return toast.error("من فضلك ادخل اسم المعدة وصورة الجهاز");

    setLoading(true);

    let uploadedImageUrl = "";

    await Promise.all(
      images.map(async (file) => {
        const imageId = uuidv4();
        const path = `images/${imageId}`;

        const { error } = await supabase.storage
          .from("media")
          .upload(path, file, { contentType: "image/jpeg", upsert: true });

        if (error) return toast.error("حدث خطأ في تحميل الصورة");

        uploadedImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;
      })
    );

    const { error } = await supabase.from("equipments").insert({
      ...addEquipment,
      image_url: uploadedImageUrl,
    });

    if (error) toast.error(error.message);
    else {
      toast.success("تم اضافة المعدة بنجاح");
      getEquipments();
      handleCloseAddModal();
    }

    setLoading(false);
  };

  // -----------------------------
  if (loading) return <PageLoader loading={loading} />;

  // =============================
  // 🎨 Render UI
  // =============================
  return (
    <Box p={6} borderRadius="md" bg={pageBg} minH="100vh">
      <Heading size="lg" mb={6} textAlign="center" color={textColor}>
        📋 قايمة المعدات
      </Heading>

      {/* Search Bar */}
      <HStack spacing={4} mb={8} justify="center">
        <Input
          placeholder="🔎 ابحث برقم أو اسم المعدة..."
          value={search}
          onChange={handleFilter}
          bg={inputBg}
          borderColor={inputBorder}
          color={textColor}
          shadow="sm"
          borderRadius="md"
        />
      </HStack>

      <Button colorScheme="blue" w="100%" mb={8} onClick={handleOpenAddModal}>
        اضافه معدة
      </Button>

      {/* Add Modal */}
      <MyModal
        ModalTitle="اضافة معدة"
        isOpen={isAddModalOpen}
        closeModal={handleCloseAddModal}
        handleSave={handleAddDevice}
      >
        <DeviceForm
          fields={FieldsType}
          onChange={handleChangeModal}
          setImages={setImages}
        />
      </MyModal>

      {/* Equipments List */}
      {currentItems.length > 0 ? (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6}>
          {currentItems.map((equipment) => (
            <Link
              href={`/dashboard/equipments/${equipment.code}`}
              key={equipment.code}
            >
              <Card
                bg={cardBg}
                shadow="md"
                borderRadius="lg"
                _hover={{
                  shadow: "xl",
                  transform: "scale(1.03)",
                  transition: "all 0.2s",
                }}
                cursor="pointer"
              >
                <Image
                  src={equipment.image_url as string || ""}
                  alt={equipment.code}
                  w="100%"
                  h={{ base: "180px", md: "220px", lg: "300px" }}
                  objectFit="contain"
                  bg={cardBg}
                  borderTopRadius="lg"
                  fallback={<MySkeleton />}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://tse1.mm.bing.net/th/id/OIP.XXWKhZZeWjrUPx-ZSfP0GAHaDt?r=0&rs=1&pid=ImgDetMain&o=7&rm=3";
                  }}
                />

                <CardBody>
                  <Text
                    fontSize="lg"
                    fontWeight="semibold"
                    textAlign="center"
                    letterSpacing="wide"
                    textTransform="uppercase"
                    color={textColor}
                  >
                    {equipment.code}
                  </Text>
                </CardBody>
              </Card>
            </Link>
          ))}
        </SimpleGrid>
      ) : (
        <Text textAlign="center" mt={10} fontSize="lg" color="gray.400">
          ❌ لا توجد نتائج مطابقة
        </Text>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <HStack spacing={6} mt={10} justify="center">
          <Pagination
            ToWhere={goToPreviousPage}
            isDisabled={currentPage === 1}
            title=" السابق"
          />
          <Text color={textColor}>
            الصفحة {currentPage} من {totalPages}
          </Text>
          <Pagination
            ToWhere={goToNextPage}
            isDisabled={currentPage === totalPages}
            title="التالي "
          />
        </HStack>
      )}
    </Box>
  );
};

export default EquipmentsPage;
