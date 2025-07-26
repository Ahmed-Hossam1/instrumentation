"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { formConfig, Indicators } from "../interface/interface";
import {
  Box,
  Button,
  Heading,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { supabase } from "../lib/Supabase";
import toast from "react-hot-toast";
import Pagination from "../UI/Pagination";
import Link from "next/link";
import ProductCard from "../components/ProductCard";
import Loader from "../UI/Loader";
import MyModal from "../UI/MyModal";
import DeviceForm from "../UI/DeviceForm";
import { v4 as uuidv4 } from "uuid";

const IndicatorsPage = () => {
  /*===================== STATES ======================*/
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [products, setProducts] = useState<Indicators[]>([]);
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

    if (!productToEdit.id || !idTagRegex.test(productToEdit.id))
      return toast.error("رقم الجهاز غير صحيح أو مفقود");

    if (!productToEdit.tag || !idTagRegex.test(productToEdit.tag))
      return toast.error("صيغة التاج غير صحيحة");

    if (productToEdit.id !== productToEdit.tag)
      return toast.error("يجب أن يتطابق رقم الجهاز مع التاج");

    if (!productToEdit.type) return toast.error("نوع الجهاز مطلوب");

    if (!productToEdit.location) return toast.error("الموقع مطلوب");

    if (!productToEdit.status) return toast.error("الحالة مطلوبة");

    if (!productToEdit.image) return toast.error("الصورة مطلوبة");

    if (!productToEdit.last_calibration)
      return toast.error("تاريخ المعايرة مطلوب");

    if (!productToEdit.created_at) return toast.error("تاريخ الإضافة مطلوب");

    setIsLoading(true);

    let image = "";
    if (productToEdit.image) {
      const { error: imgErr } = await supabase.storage
        .from("media")
        .upload(`images/${uniqueName}.jpg`, productToEdit.image, {
          contentType: "image/jpeg",
          upsert: true,
        });
      if (imgErr) return toast.error("فشل رفع الصورة");
      image = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/images/${uniqueName}.jpg`;
    }

    let video = "";
    if (productToEdit.video) {
      const { error: vidErr } = await supabase.storage
        .from("media")
        .upload(`videos/${uniqueName}.mp4`, productToEdit.video, {
          contentType: "video/mp4",
          upsert: true,
        });
      if (vidErr) toast.error("فشل رفع الفيديو");
      video = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/videos/${uniqueName}.mp4`;
    }

    const { error } = await supabase.from("indicators").insert({
      ...productToEdit,
      image,
      video,
    });

    if (error) toast.error(error.message);
    else toast.success("تمت الإضافة بنجاح");

    handleCloseAddModal();
    getIndicators();
    setIsLoading(false);
  };

  if (isLoading) return <Loader loading = {isLoading} />;

  return (
    <Box p={6} bg={bg} borderRadius="md" shadow="md">
      <Heading size="lg" mb={4}>
        🛰️ Indicators
      </Heading>

      {/* Filter & Add */}
      <HStack spacing={4} mb={6}>
        <Input
          placeholder="ابحث برقم الجهاز أو التاج"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          maxW="200px"
        >
          <option value="all">كل الحالات</option>
          <option value="Active">يعمل</option>
          <option value="Needs Calibration">يحتاج إلى معايرة</option>
          <option value="Faulty">تالف</option>
          <option value="Inactive">لا يعمل</option>
        </Select>
        <Button colorScheme="blue" onClick={handleOpenAddModal}>
          إضافة جهاز
        </Button>
        <MyModal
          ModalTitle="اضافة indicator"
          handleSave={handleSave}
          isOpen={isAddModalOpen}
          closeModal={handleCloseAddModal}
        >
          <DeviceForm fields={FieldsType} onChange={handleChange} />
        </MyModal>
      </HStack>

      {/* Cards */}
      <SimpleGrid columns={{ base: 1, sm: 1, md: 2, lg: 3 }} spacing={6}>
        {currentItems.map((device) => (
          <Link
            key={device.id}
            href={`/details/${device.deviceType}/${device.id}`}
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
