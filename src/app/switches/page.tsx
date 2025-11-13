"use client";

import { useEffect, useState, type ChangeEvent } from "react";
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
import Link from "next/link";
import MyModal from "../UI/MyModal";
import {
  formConfig,
  type DeviceBase,
  type SwitchDevice,
} from "../interface/interface";
import toast from "react-hot-toast";
import Loader from "../UI/Loader";
import { supabase } from "../lib/Supabase";
import DeviceForm from "../UI/DeviceForm";
import { v4 as uuidv4 } from "uuid";
import MyHeading from "../components/MyHeading";

const SwitchesPage = () => {
  /*===================== STATES ======================*/
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [products, setProducts] = useState<SwitchDevice[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File>({} as File);
  const [newSwitch, setNewSwitch] = useState<SwitchDevice>({
    deviceType: "switches",
  } as SwitchDevice);
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const Fields = formConfig;
  const FieldsType = Fields["switches" as keyof typeof formConfig];
  const uniqueName = uuidv4();

  /*===================== FILTERS  ======================*/
  const statusMap: Record<string, DeviceBase["status"] | "all"> = {
    all: "all",
    Active: "يعمل",
    "Needs Calibration": "يحتاج إلى معايرة",
    Faulty: "تالف",
    Inactive: "لا يعمل",
  };

  const filtered = products.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.tag.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || t.status === statusMap[statusFilter];
    return matchesSearch && matchesStatus;
  });

  const itemsPerPage = 6;
  const indexOfLastItem = currentPage * itemsPerPage;
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

  /*===================== Dark Mode ======================*/
  const bg = useColorModeValue("white", "gray.800");

  /*===================== Functions ======================*/
  const handleOpenModal = () => setIsOpen(true);

  const handleCloseModal = () => {
    setIsOpen(false);
    setNewSwitch({ deviceType: "switches" } as SwitchDevice);
  };

  async function getSwitches() {
    setIsLoading(true);
    const { data, error } = await supabase.from("switches").select("*");
    if (error) {
      toast.error(error.message);
    } else {
      setProducts(data);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getSwitches();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type, value } = e.target;
    if (type === "file") {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setNewSwitch((prev) => ({ ...prev, [name]: file }));
    } else if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setNewSwitch((prev) => ({ ...prev, [name]: checked }));
    } else {
      setNewSwitch((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    const idTagRegex = /^[a-zA-Z]{3,6}-\d{3,6}[a-zA-Z]?$/;

    if (!newSwitch.id) return toast.error("رقم الجهاز مطلوب");
    if (!idTagRegex.test(newSwitch.id))
      return toast.error(
        "صيغة رقم الجهاز غير صحيحة، مثل: PSL-1002A أو PSHH-3020"
      );

    if (!newSwitch.tag) return toast.error("التاج مطلوب");
    if (!idTagRegex.test(newSwitch.tag))
      return toast.error("صيغة التاج غير صحيحة، مثل: PSL-1002A أو PSHH-3020");

    if (newSwitch.id !== newSwitch.tag)
      return toast.error("يجب أن يكون رقم الجهاز مطابق للتاج");

    if (!newSwitch.type) return toast.error("نوع الجهاز مطلوب");
    if (!newSwitch.set_point)
      return toast.error("نقطة الضبط (Set Point) مطلوبة");
    if (images.length === 0) return toast.error("يجب اختيار صورة الجهاز");
    if (!video) return toast.error("يجب اختيار فيديو الجهاز");
    if (!newSwitch.created_at) return toast.error("تاريخ الإنشاء مطلوب");

    setIsLoading(true);

    // رفع الفيديو
    const videoPath = `videos/${uniqueName}.mp4`;
    const { error: vidErr } = await supabase.storage
      .from("media")
      .upload(videoPath, video, {
        contentType: "video/mp4",
        upsert: true,
      });

    if (vidErr) {
      toast.error("هذه الفيديو موجود بالفعل");
      setIsLoading(false);
      return;
    }

    const videoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${videoPath}`;

    // إدخال بيانات الجهاز
    const { error: insertError } = await supabase.from("switches").insert({
      ...newSwitch,
      video: videoUrl,
    });

    if (insertError) {
      toast.error("هذا الجهاز موجود بالفعل");
      setIsLoading(false);
      return handleCloseModal();
    }

    // رفع الصور وإدخالها
    const imageUploadPromises = images.map(async (file) => {
      const imageId = uuidv4();
      const imagePath = `images/${imageId}.jpg`;

      const { error: imgErr } = await supabase.storage
        .from("media")
        .upload(imagePath, file, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (imgErr) {
        toast.error("الصورة موجودة بالفعل أو فيها مشكلة");
        return;
      }

      const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${imagePath}`;

      const { error: imgInsertErr } = await supabase
        .from("switches_images")
        .insert({
          device_id: newSwitch.id,
          url: imageUrl,
        });

      if (imgInsertErr) {
        toast.error("خطأ أثناء حفظ رابط الصورة في قاعدة البيانات");
      }
    });

    await Promise.all(imageUploadPromises);

    toast.success("تم إضافة الجهاز والصور بنجاح");
    setIsLoading(false);
    handleCloseModal();
    getSwitches();
  };

  //========== FILTER Handlers ==========
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
        🛰️ Switches
      </Heading>

      <MyHeading
        deviceName="Switch"
        handleSearch={handleSearch}
        handleStatusFilter={handleStatusFilter}
        search={search}
        statusFilter={statusFilter}
        handleOpenAddModal={handleOpenModal}
      />

      <MyModal
        ModalTitle="اضافة Switch"
        isOpen={isOpen}
        closeModal={handleCloseModal}
        handleSave={handleSave}
      >
        <DeviceForm
          fields={FieldsType}
          onChange={handleChange}
          setImages={setImages}
          setVideo={setVideo}
        />
      </MyModal>

      <SimpleGrid columns={{ base: 1, sm: 1, md: 2, lg: 3 }} spacing={6}>
        {currentItems.map((device) => (
          <Link
            href={`/details/${device.deviceType}/${device.id}`}
            key={device.id}
          >
            <ProductCard {...device} />
          </Link>
        ))}
      </SimpleGrid>

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

export default SwitchesPage;
