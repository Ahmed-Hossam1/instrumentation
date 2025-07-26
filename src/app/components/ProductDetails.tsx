"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Text,
  Image,
  Heading,
  VStack,
  HStack,
  Badge,
  Flex,
  Divider,
  useColorModeValue,
  FormControl,
  FormLabel,
  Select,
  Input,
  Button,
  Checkbox,
  SimpleGrid,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { DeviceUnion, formConfig } from "@/app/interface/interface";
import MyModal from "@/app/UI/MyModal";
import { supabase } from "../lib/Supabase";
import toast from "react-hot-toast";
import Loader from "../UI/Loader";
import {
  MdBuild,
  MdConstruction,
  MdDateRange,
  MdDescription,
  MdInfo,
  MdLocationOn,
  MdSecurity,
} from "react-icons/md";
import { v4 as uuidv4 } from "uuid";

export default function ProductDetails() {
  const [product, setProduct] = useState<DeviceUnion>({} as DeviceUnion);
  const [productToEdit, setProductToEdit] = useState<DeviceUnion>(
    {} as DeviceUnion
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { deviceType, id } = useParams();
  const router = useRouter();
  const Fields = formConfig;

  /* We're using `as keyof typeof Fields` to explicitly tell TypeScript that `deviceType` is one of the valid keys of the `Fields` object.
  Without this assertion, TypeScript may throw an error because it can't be sure that `deviceType` matches a key in `Fields`.
 This cast ensures we can safely access Fields[deviceType] without a compile-time error.
 */
  const FieldsType = Fields[deviceType as keyof typeof Fields];
  const uniqueName = uuidv4();

  /*============= Functions ==============*/
  const handleOpeEditModal = () => {
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };
  const handleOpeDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const getProduct = useCallback(async () => {
    setIsLoading(true);
    if (!id) return;
    const { data, error } = await supabase
      .from(`${deviceType}`)
      .select("*")
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    } else {
      if (data && data.length > 0) {
        setProduct(data[0]);
        setProductToEdit(data[0]);
      } else {
        toast.error("لم يتم العثور على المنتج");
      }
      setIsLoading(false);
    }
  }, [id, deviceType]);

  useEffect(() => {
    getProduct();
  }, [getProduct]);

  const handelChangeProductToEdit = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
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

  const handelSaveProductToEdit = async () => {
    if (!productToEdit.tag || !productToEdit.image) {
      return toast.error("علي الاقل يجب تحديد التاج و صورة الجهاز");
    }

    if (!id) return;

    setIsLoading(true);

    // 1. رفع الصورة إلى Supabase Storage
    let imageUrl = "";
    if (productToEdit.image instanceof File) {
      const { error: imgErr } = await supabase.storage
        .from("media")
        .upload(`images/${uniqueName}.jpg`, productToEdit.image, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (imgErr) {
        setIsLoading(false);
        return toast.error("حدث خطأ أثناء رفع الصورة أو أنها موجودة بالفعل");
      }

      // توليد رابط الصورة
      imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/images/${uniqueName}.jpg`;
    } else {
      // لو مش ملف (يعني هو رابط قديم)، احتفظ بيه زي ما هو
      imageUrl = productToEdit.image;
    }

    // 2. رفع الفيديو إلى Supabase Storage
    let videoUrl = "";
    if (productToEdit.video instanceof File) {
      const { error: vidErr } = await supabase.storage
        .from("media")
        .update(`videos/${uniqueName}.mp4`, productToEdit.video, {
          contentType: "video/mp4",
          upsert: true,
        });

      if (vidErr) {
        setIsLoading(false);
        return toast.error("حدث خطأ أثناء رفع الفيديو أو أنه موجود بالفعل");
      }

      // توليد رابط الفيديو
      videoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/videos/${uniqueName}.mp4`;
    } else {
      // لو مش ملف (يعني هو رابط قديم)، احتفظ بيه زي ما هو
      videoUrl = productToEdit.video;
    }

    // 3. تحديث بيانات الجهاز في قاعدة البيانات
    const { error } = await supabase
      .from(`${deviceType}`)
      .update({
        ...productToEdit,
        image: imageUrl,
        video: videoUrl,
      })
      .eq("id", id);

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    } else {
      toast.success("تم التعديل بنجاح");
      getProduct();
      handleCloseEditModal();
      setIsLoading(false);
    }
  };

  const handleSaveProductToDelete = async () => {
    if (!id) return;
    setIsLoading(true);
    const { error } = await supabase
      .from(`${deviceType}`)
      .delete()
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    } else {
      toast.success("تم الحذف بنجاح");
      router.push(`/${deviceType}`);
    }
  };

  const cardBg = useColorModeValue("white", "gray.800");
  const getStatusColor = (s: string) =>
    s === "يعمل"
      ? "green"
      : s === "لا يعمل"
      ? "gray"
      : s === "تالف"
      ? "red"
      : "orange";

  if (isLoading) return <Loader loading={isLoading} />;

  return (
    <Box
      p={{ base: 4, md: 8 }}
      bg={cardBg}
      borderRadius="md"
      shadow="md"
      w="100%"
    >
      <Heading size="lg" mb={6} textAlign="center">
        🛰️ {product.type} - {product.tag}
      </Heading>

      {/* Edit Modal */}
      <MyModal
        ModalTitle={` ${product.tag}  تعديل `}
        isOpen={isEditModalOpen}
        closeModal={handleCloseEditModal}
        handleSave={handelSaveProductToEdit}
      >
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {FieldsType.map((f) => (
            <FormControl
              key={f.name}
              mb={4}
              display="flex"
              flexDirection="column"
            >
              {f.type !== "checkbox" && <FormLabel>{f.label}</FormLabel>}

              {f.type === "text" && (
                <Input
                  name={f.name}
                  type={f.type}
                  isDisabled={f.name === "id"}
                  value={String(
                    productToEdit[f.name as keyof DeviceUnion] ?? ""
                  )}
                  onChange={handelChangeProductToEdit}
                />
              )}

              {f.type === "select" && (
                <Select
                  name={f.name}
                  value={String(
                    productToEdit[f.name as keyof DeviceUnion] ?? ""
                  )}
                  onChange={handelChangeProductToEdit}
                >
                  {f.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              )}

              {f.type === "file" && (
                <Input
                  name={f.name}
                  type="file"
                  onChange={handelChangeProductToEdit}
                />
              )}

              {f.type === "checkbox" && (
                <Checkbox
                  name={f.name}
                  isChecked={Boolean(
                    productToEdit[f.name as keyof DeviceUnion]
                  )}
                  onChange={handelChangeProductToEdit}
                >
                  {f.label}
                </Checkbox>
              )}

              {f.type === "date" && (
                <Input
                  name={f.name}
                  type="date"
                  value={String(
                    productToEdit[f.name as keyof DeviceUnion] ?? ""
                  )}
                  onChange={handelChangeProductToEdit}
                />
              )}
            </FormControl>
          ))}
        </SimpleGrid>
      </MyModal>

      {/* Delete Modal */}
      <MyModal
        closeModal={handleCloseDeleteModal}
        ModalTitle={`حذف ${product.tag}`}
        isOpen={isDeleteModalOpen}
        handleSave={handleSaveProductToDelete}
        saveBtnName="حذف"
        saveBtnColor="red"
      >
        <Text> {product.tag} هل أنت متأكد من حذف هذا المنتج </Text>
      </MyModal>

      <Flex
        direction={{ base: "column", md: "row" }}
        gap={8}
        align="flex-start"
      >
        <Box w="100%" maxW="650px">
          <Image
            src={product.image as string}
            alt="device image"
            width="100%"
            height={"auto"}
            objectFit="cover"
            borderRadius="md"
            fallbackSrc="https://tse1.mm.bing.net/th/id/OIP.XXWKhZZeWjrUPx-ZSfP0GAHaDt"
          />
        </Box>

        <VStack align="start" spacing={4} flex="1" textAlign="right" dir="rtl">
          {/* النوع */}
          <HStack>
            <MdInfo color="#3182ce" size={20} />
            <Text fontWeight="bold" fontSize="lg">
              النوع:
            </Text>
            <Text fontSize="lg">{product.type || "غير محدد"}</Text>
          </HStack>

          {/* الرينج */}
          {deviceType != "valves" && "range" in product && (
            <HStack>
              <MdInfo color="#805ad5" size={20} />
              <Text fontWeight="bold" fontSize="lg">
                الرينج:
              </Text>
              <Text fontSize="lg">{product.range || "غير محدد"}</Text>
            </HStack>
          )}

          {/* Set Point */}
          {deviceType === "switches" && "set_point" in product && (
            <HStack>
              <MdBuild color="#4fd1c5" size={20} />
              <Text fontWeight="bold" fontSize="lg">
                نقطه التلقيط:
              </Text>
              <Text fontSize="lg">{product?.set_point || "غير محدد"}</Text>
            </HStack>
          )}

          <HStack>
            <MdInfo color="#d69e2e" size={20} />
            <Text fontWeight="bold" fontSize="lg">
              الحالة:
            </Text>
            <Badge fontSize="lg" colorScheme={getStatusColor(product.status)}>
              {product.status}
            </Badge>
          </HStack>

          <HStack>
            <MdLocationOn color="#3182ce" size={20} />
            <Text fontWeight="bold" fontSize="lg">
              الموقع:
            </Text>
            <Text fontSize="lg">{product.location}</Text>
          </HStack>

          <HStack align="start">
            <MdDescription color="#805ad5" size={20} />
            <Text fontWeight="bold" fontSize="lg">
              الوصف:
            </Text>
            <Text fontSize="lg">{product.description || "لا يوجد وصف"}</Text>
          </HStack>

          <HStack>
            <MdDateRange color="#4fd1c5" size={20} />
            <Text fontWeight="bold" fontSize="lg">
              تاريخ الإنشاء:
            </Text>
            <Text fontSize="lg">{product.created_at}</Text>
          </HStack>

          <HStack>
            <MdBuild color="#48bb78" size={20} />
            <Text fontWeight="bold" fontSize="lg">
              قطع الغيار:
            </Text>
            <Badge
              fontSize="lg"
              colorScheme={product.howManySpares > 0 ? "green" : "red"}
            >
              {product.howManySpares > 0
                ? `✅ ${product.howManySpares}`
                : "❌ لا يوجد"}
            </Badge>
          </HStack>

          <Divider />

          <HStack spacing={4}>
            <Badge
              fontSize="lg"
              colorScheme={product.needs_scaffold ? "red" : "green"}
            >
              <HStack>
                <MdConstruction />
                <Text>
                  {product.needs_scaffold ? "يحتاج سقالة" : "لا يحتاج سقالة"}
                </Text>
              </HStack>
            </Badge>

            <Badge
              fontSize="lg"
              colorScheme={product.needs_isolation ? "red" : "green"}
            >
              <HStack>
                <MdSecurity />
                <Text>
                  {product.needs_isolation ? "يحتاج عزل" : "لا يحتاج عزل"}
                </Text>
              </HStack>
            </Badge>
          </HStack>
          <HStack>
            <Button onClick={handleOpeEditModal} bg={"blue.400"} _hover="none">
              {" "}
              تعديل بيانت الجهاز
            </Button>
            <Button
              onClick={handleOpeDeleteModal}
              bg={"red.400"}
              _hover=" none"
            >
              {" "}
              حذف الجهاز
            </Button>
          </HStack>
        </VStack>
      </Flex>

      <Box mt={10} dir="rtl">
        <Heading size="md" mb={3}>
          🎥 فيديو توضيحي
        </Heading>
        <Box borderRadius="md" overflow="hidden">
          <video
            controls
            src={product.video}
            style={{ width: "100%", maxHeight: "500px", borderRadius: "8px" }}
          />
        </Box>
      </Box>
    </Box>
  );
}
