"use client";

import { useEffect, useState, ChangeEvent } from "react";
import {
  Box,
  Heading,
  Input,
  Select,
  Text,
  SimpleGrid,
  HStack,
  useColorModeValue,
  Button,
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

const ValvesPage = () => {
  /*===================== STATE ======================*/
  const [valve, setValve] = useState<ValveDevice[]>([]);
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

    if (type === "file") {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setNewValve((prev) => ({ ...prev, [name]: file }));
    } else if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setNewValve((prev) => ({ ...prev, [name]: checked }));
    } else {
      const value = e.target.value;
      setNewValve((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    const idTagRegex = /^[a-zA-Z]{2,5}-\d{3,5}[a-zA-Z]?$/;

    // ✅ التحقق من ID و TAG
    if (!newValve.id) return toast.error("[VL-1001] يجب إدخال رقم الصمام");

    if (!newValve.tag)
      return toast.error("[VL-1002] يجب إدخال التاج الخاص بالصمام");

    if (!idTagRegex.test(newValve.id))
      return toast.error("[VL-1022] صيغة رقم الصمام غير صحيحة، مثال: VL-1001");

    if (!idTagRegex.test(newValve.tag))
      return toast.error("[VL-1023] صيغة التاج غير صحيحة، مثال: VL-1001");

    if (newValve.id !== newValve.tag)
      return toast.error("[VL-1030] رقم الصمام يجب أن يكون مطابق للتاج");

    if (!newValve.valve_type)
      return toast.error("[VL-1040] يجب اختيار نوع الصمام");

    if (!newValve.action_type)
      return toast.error("[VL-1041] يجب اختيار نوع الحركة (Action Type)");

    if (!newValve.status)
      return toast.error("[VL-1050] يجب اختيار حالة الصمام");

    if (!newValve.location)
      return toast.error("[VL-1060] يجب اختيار موقع الصمام");

    if (!newValve.image) return toast.error("[VL-1070] صورة الصمام مطلوبة");

    if (!newValve.created_at)
      return toast.error("[VL-1090] يجب إدخال تاريخ إنشاء الصمام");

    setIsLoading(true);

    //  Upload image  To Storage First in Supabase
    let image = "";
    if (newValve.image) {
      const { error: imgErr } = await supabase.storage
        .from("media")
        .upload(`images/${uniqueName}.jpg`, newValve.image, {
          contentType: "image/jpeg",
          upsert: true,
        });
      if (imgErr) {
        if (imgErr) return toast.error("هذه الصورة موجودة بالفعل");
        setIsLoading(false);
      }
      image = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/images/${uniqueName}.jpg`;
    }

    //  Upload video To Storage First in Supabase
    let video = "";
    if (newValve.video) {
      const { error: vidErr } = await supabase.storage
        .from("media")
        .upload(`videos/${uniqueName}.mp4`, newValve.video, {
          contentType: "video/mp4",
          upsert: true,
        });
      if (vidErr) {
        toast.error("هذه االفديو  موجودة بالفعل");
        setIsLoading(false);
      }
      video = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/videos/${uniqueName}.mp4`;
    }

    const { error } = await supabase.from("valves").insert({
      ...newValve,
      image,
      video,
    });

    if (error) {
      toast.error("هذا الجهاز موجود بالفعل");
      setIsLoading(false);
      handleCloseModal();
    } else {
      toast.success("تم حفظ الصمام");
      handleCloseModal();
      getValves();
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loader loading = {isLoading} />;

  return (
    <Box p={6} bg={bg} borderRadius="md" shadow="md">
      <Heading mb={4}>🛠️ Valves</Heading>

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
          <option value="يعمل">يعمل</option>
          <option value="لا يعمل">لا يعمل</option>
          <option value="تالف">تالف</option>
          <option value="يحتاج إلى معايرة">يحتاج إلى معايرة</option>
        </Select>
        <Button colorScheme="blue" onClick={handleOpenModal}>
          + إضافة Valve
        </Button>

        <MyModal
          ModalTitle="🛠️ إضافة Valve"
          handleSave={handleSave}
          isOpen={isOpen}
          closeModal={handleCloseModal}
        >
          <DeviceForm fields={FieldsType} onChange={handleChange} />
        </MyModal>
      </HStack>

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
