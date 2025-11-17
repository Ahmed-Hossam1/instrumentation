"use client";

// ========== Imports ==========
import { useEffect, useState, type ChangeEvent } from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import Link from "next/link";
import toast from "react-hot-toast";
import Pagination from "@/app/UI/Pagination";
import ProductCard from "@/app/components/ProductCard";
import MyModal from "@/app/UI/MyModal";
import { formConfig, type Transmitter } from "../../interface/interface";
import { supabase } from "@/app/lib/Supabase";
import DeviceForm from "@/app/UI/DeviceForm";
import { v4 as uuidv4 } from "uuid";
import PageLoader from "@/app/UI/Loader";
import MyHeading from "@/app/components/MyHeading";

// ========== Component ==========
const TransmittersPage = () => {
  // ========== State ==========
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [products, setProducts] = useState<Transmitter[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File>({} as File);
  const [productToEdit, setProductToEdit] = useState({
    deviceType: "transmitters",
  } as Transmitter);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // ========== VARIABLES ==========
  const uniqueFileName = uuidv4();
  const FieldsType = formConfig["transmitters"];

  // ========== Constants & Helpers ==========
  const statusMap: Record<string, Transmitter["status"] | "all"> = {
    all: "all",
    Active: "يعمل",
    "Needs Calibration": "يحتاج إلى معايرة",
    Faulty: "تالف",
    Inactive: "لا يعمل",
  };

  const itemsPerPage = 6;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const filtered = products.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.tag.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || t.status === statusMap[statusFilter];
    return matchesSearch && matchesStatus;
  });

  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const bg = useColorModeValue("white", "gray.800");

  // ========== Pagination ==========
  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 1200, behavior: "smooth" });
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    window.scrollTo({ top: 1200, behavior: "smooth" });
  };

  // ========== Modal Handlers ==========
  const handleOpenAddModal = () => setIsAddModalOpen(true);

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setProductToEdit({ deviceType: "transmitters" } as Transmitter);
  };

  // ========== get Transmitters Data ==========
  const getTransmitters = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from("transmitters").select("*");
    if (error) toast.error(error.message);
    else setProducts(data);
    setIsLoading(false);
  };

  // get transmitters Images ==========

  useEffect(() => {
    getTransmitters();
  }, []);

  // ========== Input Handlers ==========
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setProductToEdit((prev) => ({ ...prev, [name]: checked }));
    } else {
      const value = e.target.value;
      setProductToEdit((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ========== Save Handler ==========
  const handleSave = async () => {
    const idTagRegex = /^[a-zA-Z]{2,5}-\d{3,5}[a-zA-Z]?$/;

    // === Validations ===
    if (!productToEdit.id || !idTagRegex.test(productToEdit.id))
      return toast.error("رقم الجهاز غير صالح [مثال: PT-1022 أو PT-3020]");

    if (!productToEdit.tag || !idTagRegex.test(productToEdit.tag))
      return toast.error("التاج غير صالح [مثال: PT-1002A أو PT-3020]");

    if (productToEdit.id !== productToEdit.tag)
      return toast.error("يجب أن يكون رقم الجهاز مساوٍ للتاج");

    if (!productToEdit.type) return toast.error("اختر نوع الجهاز");
    if (!productToEdit.range) return toast.error("حدد نطاق اختبار الجهاز");
    if (!productToEdit.created_at) return toast.error("اختر تاريخ الإنشاء");
    if (images.length === 0) return toast.error("اختر صورة واحدة على الأقل");
    if (!video) return toast.error("اختر فيديو للجهاز");

    setIsLoading(true);

    try {
      // === Upload Video ===
      const videoPath = `videos/${uniqueFileName}.mp4`;
      const { error: videoError } = await supabase.storage
        .from("media")
        .upload(videoPath, video, {
          contentType: "video/mp4",
          upsert: true,
        });

      if (videoError) throw new Error("فشل رفع الفيديو: " + videoError.message);

      const videoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${videoPath}`;

      // === Insert Transmitter Record ===
      const { error: insertError } = await supabase
        .from("transmitters")
        .insert({
          ...productToEdit,
          video: videoUrl,
        });

      if (insertError) throw new Error("هذا الجهاز موجود بالفعل");

      // === Upload Images in Parallel ===
      await Promise.all(
        images.map(async (file) => {
          const imageId = uuidv4();
          const imagePath = `images/${imageId}.jpg`;

          const { error: imgUploadError } = await supabase.storage
            .from("media")
            .upload(imagePath, file, {
              contentType: "image/jpeg",
              upsert: true,
            });

          if (imgUploadError)
            throw new Error("خطأ أثناء رفع صورة: " + imgUploadError.message);

          const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${imagePath}`;

          const { error: dbInsertError } = await supabase
            .from("transmitters_images")
            .insert({
              device_id: productToEdit.id,
              url: imageUrl,
            });

          if (dbInsertError)
            throw new Error(
              "خطأ أثناء حفظ الصورة في قاعدة البيانات: " + dbInsertError.message
            );
        })
      );

      toast.success("تمت الإضافة بنجاح");
      handleCloseAddModal();
      getTransmitters();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  //========== FILTER Handlers ==========
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleStatusFilter = (e: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  // ========== Loader ==========
  if (isLoading) return <PageLoader loading={isLoading} />;

  // ========== JSX ==========
  return (
    <Box p={6} bg={bg} borderRadius="md" shadow="md">
      <Heading size="lg" mb={4}>
        🛰️ Transmitters
      </Heading>

      {/* Filter & Add */}

      <MyHeading
        handleOpenAddModal={handleOpenAddModal}
        handleSearch={handleSearch}
        search={search}
        handleStatusFilter={handleStatusFilter}
        statusFilter={statusFilter}
        deviceName="Transmitter"
      />

      {/* Add Modal */}
      <MyModal
        ModalTitle="اضافة Transmitter"
        handleSave={handleSave}
        isOpen={isAddModalOpen}
        closeModal={handleCloseAddModal}
      >
        <DeviceForm
          fields={FieldsType}
          onChange={handleChange}
          setImages={setImages}
          setVideo={setVideo}
        />
      </MyModal>

      {/* Product Cards */}
      <SimpleGrid columns={{ base: 1, sm: 1, md: 2, lg: 3 }} spacing={6}>
        {currentItems.map((device) => (
          <Link
            key={device.id}
            href={`/dashboard/details/${device.deviceType}/${device.id}`}
          >
            <ProductCard {...device} />
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
    </Box>
  );
};

export default TransmittersPage;
