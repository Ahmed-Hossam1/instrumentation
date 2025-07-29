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
import { DeviceUnion, formConfig, Images } from "@/app/interface/interface";
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
import { TbTools } from "react-icons/tb";

export default function ProductDetails() {
  const [product, setProduct] = useState<DeviceUnion>({} as DeviceUnion);
  const [productToEdit, setProductToEdit] = useState<DeviceUnion>(
    {} as DeviceUnion
  );
  const [images, setImages] = useState<Images[]>([]);
  const [imagesToUpload, setImagesToUpload] = useState<File[]>([]);
  const [video, setVideo] = useState<File>({} as File);
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

  const getDeviceImages = useCallback(async () => {
    const { data, error } = await supabase
      .from(`${deviceType}_images`)
      .select("*")
      .eq("device_id", id);

    if (error) {
      console.log("failed to load image :" + error.message);
    } else {
      setImages(data);
    }
  }, [deviceType, id]);

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
  }, [deviceType, id]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await Promise.all([getProduct(), getDeviceImages()]);
      setIsLoading(false);
    })();
  }, [getProduct, getDeviceImages]);

  const MainImage = images[0]?.url || null;
  const handelChangeProductToEdit = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setProductToEdit((prev) => ({ ...prev, [name]: checked }));
    } else {
      setProductToEdit((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handelSaveProductToEdit = async () => {
    if (!productToEdit.tag )
      return toast.error("علي الاقل يجب تحديد التاج  الجهاز");

    if (imagesToUpload.length === 0)
      return toast.error("علي الاقل يجب تحديد صورة واحدة على الأقل");

    if (!video) return toast.error("علي الاقل يجب تحديد فيديو");

    setIsLoading(true);

    try {
      // رفع الفيديو
      const { error: vidErr } = await supabase.storage
        .from("media")
        .update(`videos/${uniqueName}.mp4`, video, {
          contentType: "video/mp4",
          upsert: true,
        });

      if (vidErr)
        throw new Error("حدث خطأ أثناء رفع الفيديو أو أنه موجود بالفعل");

      const videoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/videos/${uniqueName}.mp4`;

      // تحديث بيانات الجهاز
      const { error: updateError } = await supabase
        .from(`${deviceType}`)
        .update({ ...productToEdit, video: videoUrl })
        .eq("id", id);

      if (updateError) throw new Error(updateError.message);

      // رفع الصور
      await Promise.all(
        imagesToUpload.map(async (img) => {
          const imgId = uuidv4();

          const { error: uploadError } = await supabase.storage
            .from("media")
            .upload(`images/${imgId}`, img, {
              contentType: img.type,
            });

          if (uploadError)
            throw new Error("فشل في رفع صورة: " + uploadError.message);

          const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/images/${imgId}`;

          const { error: insertError } = await supabase
            .from(`${deviceType}_images`)
            .insert({
              device_id: id,
              url: imageUrl,
            });

          if (insertError)
            throw new Error("فشل في حفظ رابط الصورة: " + insertError.message);
        })
      );

      toast.success("تم التعديل بنجاح");
      getProduct();
      getDeviceImages();
      handleCloseEditModal();
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  console.log(productToEdit, imagesToUpload, video);
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

              {f.type === "file" && f.name === "image" && (
                <Input
                  name={f.name}
                  multiple
                  type="file"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) {
                      setImagesToUpload(Array.from(files));
                    }
                  }}
                />
              )}
              {/*  */}
              {f.type === "file" && f.name === "video" && (
                <Input
                  name={f.name}
                  type="file"
                  onChange={(e) => {
                    const video = e.target.files?.[0] || null;
                    if (video) {
                      setVideo(video);
                    }
                  }}
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
            src={MainImage as string}
            alt="device image"
            width="100%"
            height={"auto"}
            mb={4}
            objectFit="cover"
            borderRadius="md"
            fallbackSrc="https://tse1.mm.bing.net/th/id/OIP.XXWKhZZeWjrUPx-ZSfP0GAHaDt"
          />
          {/* Thumbnails */}
          <HStack spacing={3} overflowX="auto" justifyContent={"center"}>
            {images.map((img, index) => (
              <Image
                key={img.url}
                src={img.url}
                alt={`thumbnail ${index + 1}`}
                boxSize="70px"
                borderRadius="md"
                objectFit="cover"
                border={
                  MainImage === img.url
                    ? "2px solid #3182ce"
                    : "2px solid transparent"
                }
                cursor="pointer"
                onClick={() => {
                  const selected = images.find((i) => i.url === img.url);
                  if (selected) {
                    const reordered = [
                      selected,
                      ...images.filter((i) => i.url !== selected.url),
                    ];
                    setImages(reordered);
                  }
                }}
              />
            ))}
          </HStack>
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
          <HStack>
            <TbTools color="#3182ce" size={20} />
            <Text fontWeight="bold" fontSize="lg">
              الفيتينج:
            </Text>
            <Text fontSize="lg">غير محدد</Text>
          </HStack>

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
              تاريخ الاضافه:
            </Text>
            <Text fontSize="lg">{product.created_at}</Text>
          </HStack>

          <HStack>
            <MdBuild color="#48bb78" size={20} />
            <Text fontWeight="bold" fontSize="lg">
              قطع الغيار:
            </Text>
            <Badge fontSize="lg" colorScheme={"green"}>
              {product.howManySpares > 0
                ? `✅ ${product.howManySpares}`
                : "يوجد قطع غيار بالمخزن"}
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
