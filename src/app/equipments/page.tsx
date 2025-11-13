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
} from "@chakra-ui/react";
import toast from "react-hot-toast";
import Link from "next/link";

import { supabase } from "../lib/Supabase";
import { equipments, formConfig } from "../interface/interface";

import MySkeleton from "../components/MySkeleton";
import Pagination from "../UI/Pagination";
import PageLoader from "../UI/Loader";
import MyModal from "../UI/MyModal";
import DeviceForm from "../UI/DeviceForm";
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

  // -----------------------------
  // Filtering
  // -----------------------------
  const handleFilter = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); // reset to first page when searching
  };

  const filtered = equipments.filter((d) =>
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  // -----------------------------
  // Pagination
  // -----------------------------
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

  // -----------------------------
  // Fetch Data
  // -----------------------------
  const getEquipments = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("equipments").select("*");

    if (error) {
      toast.error(error.message);
    } else {
      setEquipments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    getEquipments();
  }, []);

  const handleChangeModal = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAddEquipment((prev) => ({ ...prev, [name]: value }));
  };
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleAddDevice = async () => {
    setLoading(true);

    let uploadedImageUrl = "";

    await Promise.all(
      images.map(async (file) => {
        const imageId = uuidv4();
        const imagePath = `images/${imageId}`;

        const { error: imgUploadError } = await supabase.storage
          .from("media")
          .upload(imagePath, file, {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (imgUploadError) {
          toast.error("حدث خطأ في تحميل الصورة");
        } else {
          uploadedImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${imagePath}`;
        }
      })
    );

    const { error } = await supabase.from("equipments").insert({
      ...addEquipment,
      image_url: uploadedImageUrl,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("تم اضافة المعدة بنجاح");
      getEquipments();
      handleCloseAddModal();
    }

    setLoading(false);
  };

  // -----------------------------
  // Loader
  // -----------------------------
  if (loading) return <PageLoader loading={loading} />;

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <Box p={6} borderRadius="md" shadow="md">
      <Heading size="lg" mb={6} textAlign="center">
        📋 قايمة المعدات
      </Heading>

      {/* Search Bar */}
      <HStack spacing={4} mb={8} justify="center">
        <Input
          placeholder="🔎 ابحث برقم أو اسم المعدة..."
          value={search}
          onChange={handleFilter}
          shadow="sm"
          borderRadius="md"
        />
      </HStack>

      <Button colorScheme="blue" w={"100%"} mb={8} onClick={handleOpenAddModal}>
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
            <Link href={`/equipments/${equipment.code}`} key={equipment.code}>
              <Card
                _hover={{ shadow: "xl", transform: "scale(1.03)" }}
                transition="all 0.2s"
                cursor="pointer"
                bg="white"
                shadow="md"
                borderRadius="lg"
              >
                <Image
                  src={equipment.image_url as string}
                  alt={equipment.code}
                  w="100%"
                  h={{ base: "180px", md: "220px", lg: "300px" }}
                  objectFit="contain"
                  borderTopRadius="lg"
                  bg="gray.100"
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
                  >
                    {equipment.code}
                  </Text>
                </CardBody>
              </Card>
            </Link>
          ))}
        </SimpleGrid>
      ) : (
        <Text textAlign="center" mt={10} fontSize="lg" color="gray.500">
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
          <Text>
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
