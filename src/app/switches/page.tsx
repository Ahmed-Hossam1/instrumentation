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

    if (!newSwitch.range) return toast.error("المدى (Range) مطلوب");

    if (!newSwitch.set_point)
      return toast.error("نقطة الضبط (Set Point) مطلوبة");

    if (!newSwitch.location) return toast.error("الموقع مطلوب");

    if (!newSwitch.status) return toast.error("حالة الجهاز مطلوبة");

    if (!newSwitch.image) return toast.error("صورة الجهاز مطلوبة");

    if (!newSwitch.video) return toast.error("فيديو الجهاز مطلوب");

    if (!newSwitch.created_at) return toast.error("تاريخ الإنشاء مطلوب");

    // Upload Image To Storage
    setIsLoading(true);
    let image = "";
    if (newSwitch.image) {
      const { error: imgERR } = await supabase.storage
        .from("media")
        .upload(`images/${uniqueName}`, newSwitch.image, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (imgERR) {
        toast.error(imgERR.message);
        setIsLoading(false);
      }

      image = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/images/${uniqueName}`;
    }
    // Upload Video To Storage
    let video = "";
    if (newSwitch.video) {
      const { error: vidERR } = await supabase.storage
        .from("media")
        .upload(`videos/${uniqueName}`, newSwitch.video, {
          contentType: "video/jpeg",
          upsert: true,
        });

      if (vidERR) {
        toast.error(vidERR.message);
        setIsLoading(false);
      }

      video = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/videos/${uniqueName}`;
    }

    const { error } = await supabase.from("switches").insert({
      ...newSwitch,
      image,
      video,
    });

    if (error) {
      toast.error("هذا الجهاز موجود بالفعل");
      setIsLoading(false);
      handleCloseModal();
    } else {
      toast.success("تم اضافه الجهاز بنجاح");
      handleCloseModal();
      getSwitches();
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
        <DeviceForm fields={FieldsType} onChange={handleChange} />
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
