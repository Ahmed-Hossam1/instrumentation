"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { formConfig, Indicators } from "../../interface/interface";
import {
  Box,
  Heading,
  HStack,
  SimpleGrid,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { supabase } from "../../lib/Supabase";
import toast from "react-hot-toast";
import Pagination from "../../UI/Pagination";
import Link from "next/link";
import ProductCard from "../../components/ProductCard";
import Loader from "../../UI/Loader";
import MyModal from "../../UI/MyModal";
import DeviceForm from "../../UI/DeviceForm";
import { v4 as uuidv4 } from "uuid";
import MyHeading from "../../components/MyHeading";

const IndicatorsPage = () => {
  /*===================== STATES ======================*/
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [products, setProducts] = useState<Indicators[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File>({} as File);
  const [productToEdit, setProductToEdit] = useState({
    deviceType: "indicators",
  } as Indicators);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const Fields = formConfig;
  const FieldsType = Fields["indicators"];
  const uniqueName = uuidv4();

  /*===================== FILTERS ======================*/
  const statusMap: Record<string, Indicators["status"] | "all"> = {
    all: "all",
    Active: "يعمل",
    "Needs Calibration": "يحتاج إلى معايرة",
    Faulty: "تالف",
    Inactive: "لا يعمل",
  };
  const itemsPerPage = 15;
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

  /*===================== DARK MODE ======================*/
  const bg = useColorModeValue("white", "gray.800");

  /*===================== FUNCTIONS ======================*/
  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 1200, behavior: "smooth" });
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    window.scrollTo({ top: 1200, behavior: "smooth" });
  };

  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setProductToEdit({ deviceType: "indicators" } as Indicators);
  };

  const getIndicators = async () => {
    const { data, error } = await supabase.from("indicators").select("*");
    if (error) toast.error(error.message);
    else setProducts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    getIndicators();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type, value } = e.target;
    if (type === "file") {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setProductToEdit((prev) => ({ ...prev, [name]: file }));
    } else if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setProductToEdit((prev) => ({ ...prev, [name]: checked }));
    } else {
      setProductToEdit((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    const idTagRegex = /^[a-zA-Z]{2,5}-\d{3,5}[a-zA-Z]?$/;

    // ✅ التحقق من المدخلات
    if (!productToEdit.id || !idTagRegex.test(productToEdit.id)) {
      return toast.error("رقم الجهاز غير صحيح أو مفقود");
    }
    if (!productToEdit.tag || !idTagRegex.test(productToEdit.tag)) {
      return toast.error("صيغة التاج غير صحيحة");
    }
    if (productToEdit.id !== productToEdit.tag) {
      return toast.error("يجب أن يتطابق رقم الجهاز مع التاج");
    }
    if (!productToEdit.type) return toast.error("نوع الجهاز مطلوب");
    if (!productToEdit.created_at) return toast.error("تاريخ الإضافة مطلوب");
    if (images.length === 0) return toast.error("الصورة مطلوبة");
    if (!video) return toast.error("الفيديو مطلوب");

    setIsLoading(true);
    try {
      // ✅ رفع الفيديو
      const { error: vidErr } = await supabase.storage
        .from("media")
        .upload(`videos/${uniqueName}.mp4`, video, {
          contentType: "video/mp4",
          upsert: true,
        });

      if (vidErr) throw new Error("فشل رفع الفيديو");

      const videoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/videos/${uniqueName}.mp4`;

      // ✅ حفظ بيانات الجهاز
      const { error: insertErr } = await supabase.from("indicators").insert({
        ...productToEdit,
        video: videoUrl,
      });

      if (insertErr) throw new Error(insertErr.message);

      // ✅ رفع الصور بالتوازي
      const uploadPromises = images.map(async (file) => {
        const imageId = uuidv4();
        const path = `images/${imageId}.jpg`;

        const { error: imgErr } = await supabase.storage
          .from("media")
          .upload(path, file, {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (imgErr) throw new Error("فشل رفع إحدى الصور");

        const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;

        const { error: insertImgErr } = await supabase
          .from("indicators_images")
          .insert({
            device_id: productToEdit.id,
            url: imageUrl,
          });

        if (insertImgErr) throw new Error(insertImgErr.message);
      });

      await Promise.all(uploadPromises);

      toast.success("تمت الإضافة بنجاح");
      handleCloseAddModal();
      getIndicators();
    } catch (err) {
      toast.error((err as Error).message || "حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleStatusFilter = (e: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  if (isLoading) return <Loader loading={isLoading} />;

  return (
    <Box p={6} bg={bg} borderRadius="md" shadow="md">
      <Heading size="lg" mb={4}>
        🛰️ Indicators
      </Heading>

      {/* Filter & Add */}
      <MyHeading
        deviceName="indicator"
        handleSearch={handleSearch}
        handleStatusFilter={handleStatusFilter}
        search={search}
        statusFilter={statusFilter}
        handleOpenAddModal={handleOpenAddModal}
      />

      <MyModal
        ModalTitle="اضافة indicator"
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

      {/* Cards */}
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

      {filtered.length === 0 && (
        <Text mt={4} color="gray.500">
          لا توجد نتائج مطابقة.
        </Text>
      )}
    </Box>
  );
};

export default IndicatorsPage;
