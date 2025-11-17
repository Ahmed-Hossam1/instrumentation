"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import {
  Box,
  Heading,
  Input,
  VStack,
  Badge,
  Text,
  HStack,
  useColorModeValue,
  Button,
  Select, // ✅ مهم جداً: نسيته
} from "@chakra-ui/react";
import toast from "react-hot-toast";

import { formConfig, MalfunctionData } from "../../interface/interface";
import Loader from "../../UI/Loader";
import MyModal from "../../UI/MyModal";
import { supabase } from "../../lib/Supabase";
import DeviceForm from "../../UI/DeviceForm";

// 👇 خيارات التصنيف
const SeverityOptions = [
  { id: 1, value: "خطير", label: "خطير" },
  { id: 2, value: "متكرر", label: "متكرر" },
  { id: 3, value: "تحت المراجعة", label: "تحت المراجعة" },
];

export default function Malfunctions() {
  /* ===================== STATES ===================== */
  const [malfunctions, setMalfunctions] = useState<MalfunctionData[]>([]);
  const [newMalfunctions, setNewMalfunctions] = useState<MalfunctionData>(
    {} as MalfunctionData
  );
  const [deletedMalfunction, setDeletedMalfunction] = useState<MalfunctionData>(
    {} as MalfunctionData
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  /* ===================== VARIABLES ===================== */
  const FieldsType = formConfig["malfunctions"];

  /* ===================== FILTERS ===================== */
  const filteredMalfunctions = malfunctions.filter((mal) => {
    const matchesSearch =
      mal.title.includes(search) || mal.description.includes(search);
    const matchesFilter = filter ? mal.severity === filter : true;
    return matchesSearch && matchesFilter;
  });

  /* ===================== DARK MODE ===================== */
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const boxBg = useColorModeValue("white", "gray.800");
  const inputBg = useColorModeValue("gray.100", "gray.700");
  const cardText = useColorModeValue("gray.700", "gray.200");
  const cardBg = useColorModeValue("gray.100", "gray.700");

  /* ===================== GET MALFUNCTIONS ===================== */
  const getMalfunctions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from("malfunctions").select("*");
    if (error) {
      toast.error(error.message);
    } else {
      setMalfunctions(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getMalfunctions();
  }, []);

  /* ===================== UTILITIES ===================== */
  const getBadgeColor = (severity: string) => {
    switch (severity) {
      case "خطير":
        return "red";
      case "متكرر":
        return "yellow";
      case "تحت المراجعة":
        return "blue";
      default:
        return "gray";
    }
  };

  /* ===================== HANDLERS ===================== */
  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setNewMalfunctions({} as MalfunctionData);
  };

  const handleOpenDeleteModal = (mal: MalfunctionData) => {
    setDeletedMalfunction(mal);
    setIsDeleteModalOpen(true);
  };
  const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewMalfunctions((prev) => ({ ...prev, [name]: value }));
  };

  console.log(newMalfunctions);
  const handleAddMalfunction = async () => {
    if (
      !newMalfunctions.title ||
      !newMalfunctions.description ||
      !newMalfunctions.severity ||
      !newMalfunctions.importance
    ) {
      return toast.error("الرجاء ملئ جميع الحقول");
    }

    setIsLoading(true);
    const { error } = await supabase
      .from("malfunctions")
      .insert(newMalfunctions);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("تم اضافة المشكلة بنجاح");
      handleCloseAddModal();
      getMalfunctions();
    }
    setIsLoading(false);
  };

  const handleDeleteMalfunction = async () => {
    setIsLoading(true);
    const { id } = deletedMalfunction;
    const { error } = await supabase.from("malfunctions").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("تم حذف المشكلة بنجاح");
      handleCloseDeleteModal();
      getMalfunctions();
    }
    setIsLoading(false);
  };

  if (isLoading) return <Loader loading={isLoading} />;

  return (
    <Box p={8} maxW="6xl" mx="auto" bg={boxBg} borderRadius="md">
      <Heading size="lg" mb={6} textAlign="center" color={textColor}>
        🛠️ الأعطال المسجلة
      </Heading>

      {/* Add Modal */}
      <MyModal
        ModalTitle="اضافة عطل جديد"
        isOpen={isAddModalOpen}
        closeModal={handleCloseAddModal}
        handleSave={handleAddMalfunction}
      >
        <DeviceForm fields={FieldsType} onChange={handleChange} />
      </MyModal>

      {/* Delete Modal */}
      <MyModal
        closeModal={handleCloseDeleteModal}
        ModalTitle={`حذف العطل`}
        isOpen={isDeleteModalOpen}
        handleSave={handleDeleteMalfunction} // ✅ call not function reference
        saveBtnName="حذف"
        saveBtnColor="red"
      >
        <Text>هل انت متأكد من حذف العطل: {deletedMalfunction.title}؟</Text>
      </MyModal>

      {/* Filters */}
      <HStack spacing={4} mb={4} flexWrap="wrap">
        <Input
          placeholder="ابحث عن عطل..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          bg={inputBg}
          color={textColor}
        />
        <Select
          placeholder="تصفية حسب التصنيف"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          maxW="200px"
          bg={inputBg}
          color={textColor}
        >
          {SeverityOptions.map((opt) => (
            <option key={opt.id} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        <Button colorScheme="blue" onClick={handleOpenAddModal}>
          اضافة عطل جديد
        </Button>
      </HStack>

      {/* Stats */}
      <HStack mb={6} spacing={6} flexWrap="wrap">
        <Badge colorScheme="red">
          خطير: {malfunctions.filter((m) => m.severity === "خطير").length}
        </Badge>
        <Badge colorScheme="yellow">
          متكرر: {malfunctions.filter((m) => m.severity === "متكرر").length}
        </Badge>
        <Badge colorScheme="blue">
          تحت المراجعة:{" "}
          {malfunctions.filter((m) => m.severity === "تحت المراجعة").length}
        </Badge>
      </HStack>

      {/* List */}
      <VStack spacing={5} align="stretch">
        {filteredMalfunctions.map((mal) => (
          <Box
            key={mal.id}
            p={5}
            borderRadius="md"
            shadow="md"
            bg={cardBg}
            color={cardText}
          >
            <HStack justify="space-between">
              <Heading size="md">🔧 {mal.title}</Heading>
              <Badge colorScheme={getBadgeColor(mal.severity)}>
                {mal.severity}
              </Badge>
            </HStack>
            <Text mt={2} noOfLines={2}>
              {mal.description}
            </Text>
            <HStack mt={2} justifyContent="space-between">
              <Badge colorScheme="purple">الأهمية: {mal.importance}</Badge>
            </HStack>
            <HStack mt={4} spacing={2}>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={() => toast.error("هذه الخاصيه غير متاحه الان")}
              >
                تعديل
              </Button>
              <Button
                size="sm"
                colorScheme="red"
                onClick={() => handleOpenDeleteModal(mal)}
              >
                حذف
              </Button>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
