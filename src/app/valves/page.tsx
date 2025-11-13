"use client";

import { useEffect, useState, ChangeEvent } from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import Pagination from "../UI/Pagination";
import ProductCard from "../components/ProductCard";
import MyModal from "../UI/MyModal";
import toast from "react-hot-toast";
import Loader from "../UI/Loader";
import { formConfig, ValveDevice } from "../interface/interface";
import Link from "next/link";
import { supabase } from "../lib/Supabase";
import DeviceForm from "../UI/DeviceForm";
import { v4 as uuidv4 } from "uuid";
import MyHeading from "../components/MyHeading";

const ValvesPage = () => {
  /*===================== STATE ======================*/
  const [valve, setValve] = useState<ValveDevice[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File>({} as File);

  const [newValve, setNewValve] = useState<ValveDevice>({
    deviceType: "valves",
  } as ValveDevice);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const Fields = formConfig;
  const FieldsType = Fields["valves" as keyof typeof formConfig];
  const uniqueName = uuidv4();

  /*===================== FILTERS ======================*/
  const filtered = valve.filter((v) => {
    const searchMatch =
      v.id?.toLowerCase().includes(search.toLowerCase()) ||
      v.tag?.toLowerCase().includes(search.toLowerCase());
    const statusMatch = statusFilter === "all" || v.status === statusFilter;
    return searchMatch && statusMatch;
  });

  const itemsPerPage = 6;
  const currentItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  /*===================== DARK MODE ======================*/
  const bg = useColorModeValue("white", "gray.800");

  /*===================== FUNCTIONS ======================*/
  const getValves = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from("valves").select("*");
    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    } else {
      setValve(data);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getValves();
  }, []);

  const handleOpenModal = () => setIsOpen(true);
  const handleCloseModal = () => {
    setIsOpen(false);
    setNewValve({ deviceType: "valves" } as ValveDevice);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setNewValve((prev) => ({ ...prev, [name]: checked }));
    } else {
      const value = e.target.value;
      setNewValve((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    const idTagRegex = /^[a-zA-Z]{2,6}-\d{2,6}[a-zA-Z]?$/;

    // === Validations ===
    if (!newValve.id) return toast.error("[VL-1001] يجب إدخال رقم البلف");

    if (!newValve.tag)
      return toast.error("[VL-1002] يجب إدخال التاج الخاص بالبلف");

    if (!idTagRegex.test(newValve.id))
      return toast.error("[VL-1022] صيغة رقم البلف غير صحيحة، مثال: VL-1001");

    if (!idTagRegex.test(newValve.tag))
      return toast.error("[VL-1023] صيغة التاج غير صحيحة، مثال: VL-1001");

    if (newValve.id !== newValve.tag)
      return toast.error("[VL-1030] رقم البلف يجب أن يكون مطابق للتاج");

    if(!newValve.type) return toast.error("[VL-1040] يجب إدخال نوع البلف");
   
    if (!newValve.location)
      return toast.error("[VL-1060] يجب اختيار موقع البلف");

    if (images.length === 0) return toast.error("صورة البلف مطلوبة");

    if (!video) return toast.error("فيديو البلف مطلوب");

    if (!newValve.created_at)
      return toast.error("[VL-1090] يجب إدخال تاريخ إنشاء البلف");

    setIsLoading(true);

    try {
      // === Upload Video ===
      const videoPath = `videos/${uniqueName}.mp4`;
      const { error: videoError } = await supabase.storage
        .from("media")
        .upload(videoPath, video, {
          contentType: "video/mp4",
          upsert: true,
        });

      if (videoError) throw new Error("فشل رفع الفيديو: " + videoError.message);

      const videoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${videoPath}`;

      // === Insert Valve Record ===
      const { error: insertError } = await supabase.from("valves").insert({
        ...newValve,
        video: videoUrl,
      });

      if (insertError) throw new Error("هذا البلف موجود بالفعل");

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
            .from("valves_images")
            .insert({
              device_id: newValve.id,
              url: imageUrl,
            });

          if (dbInsertError)
            throw new Error(
              "خطأ أثناء حفظ الصورة في قاعدة البيانات: " + dbInsertError.message
            );
        })
      );

      toast.success("تمت إضافة البلف بنجاح");
      handleCloseModal();
      getValves();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
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
      <Heading mb={4}>🛠️ Valves</Heading>

      <MyHeading
        handleOpenAddModal={handleOpenModal}
        handleSearch={handleSearch}
        search={search}
        handleStatusFilter={handleStatusFilter}
        statusFilter={statusFilter}
        deviceName="Valve"
      />

      <MyModal
        ModalTitle="🛠️ إضافة Valve"
        handleSave={handleSave}
        isOpen={isOpen}
        closeModal={handleCloseModal}
      >
        <DeviceForm
          fields={FieldsType}
          onChange={handleChange}
          setImages={setImages}
          setVideo={setVideo}
        />
      </MyModal>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
        {currentItems.map((v) => (
          <Link key={v.id} href={`/details/${v.deviceType}/${v.id}`}>
            <ProductCard {...v} />
          </Link>
        ))}
      </SimpleGrid>

      <HStack spacing={4} mt={6} justify="center">
        <Pagination
          ToWhere={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          isDisabled={currentPage === 1}
          title="السابق"
        />
        <Text>
          الصفحة {currentPage} من {totalPages}
        </Text>
        <Pagination
          ToWhere={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          isDisabled={currentPage === totalPages}
          title="التالي"
        />
      </HStack>

      {filtered.length === 0 && !isLoading && (
        <Text mt={4} color="gray.500">
          لا توجد نتائج مطابقة.
        </Text>
      )}
    </Box>
  );
};

export default ValvesPage;
