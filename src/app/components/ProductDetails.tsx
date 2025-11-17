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
  IconButton,
} from "@chakra-ui/react";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
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
  MdDelete,
} from "react-icons/md";
import { v4 as uuidv4 } from "uuid";
import { TbTools } from "react-icons/tb";

type FileWithPreview = {
  file: File;
  preview: string;
};

export default function ProductDetails() {
  const [product, setProduct] = useState<DeviceUnion>({} as DeviceUnion);
  const [productToEdit, setProductToEdit] = useState<DeviceUnion>(
    {} as DeviceUnion
  );
  const [images, setImages] = useState<Images[]>([]);
  const [imagesToUpload, setImagesToUpload] = useState<FileWithPreview[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [equipmentsCodes, setEquipmentsCodes] = useState<{ code: string }[]>(
    []
  );
  const [linkedDeviceCode, setLinkedDeviceCode] = useState<string>("");
  const params = useParams() as { deviceType?: string; id?: string };
  const deviceType = params.deviceType || "";
  const id = params.id || "";
  const router = useRouter();
  const Fields = formConfig;
  const FieldsType = Fields[deviceType as keyof typeof Fields] || [];
  const cardBg = useColorModeValue("white", "gray.800");

  /* ======== Fetchers ======== */
  const getDeviceImages = useCallback(async () => {
    if (!deviceType || !id) return;
    const { data, error } = await supabase
      .from(`${deviceType}_images`)
      .select("*")
      .eq("device_id", id);

    if (error) {
      console.error("failed to load image :" + error.message);
      toast.error("فشل في جلب صور الجهاز");
    } else {
      setImages(data ?? []);
    }
  }, [deviceType, id]);

  const getProduct = useCallback(async () => {
    if (!deviceType || !id) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from(`${deviceType}`)
      .select("*")
      .eq("id", id);

    if (error) {
      toast.error(error.message);
    } else {
      if (data && data.length > 0) {
        setProduct(data[0]);
        setProductToEdit(data[0]); // prefill edit form
      } else {
        toast.error("لم يتم العثور على المنتج");
      }
    }
    setIsLoading(false);
  }, [deviceType, id]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await Promise.all([getProduct(), getDeviceImages()]);
      setIsLoading(false);
    })();
    // cleanup previews on unmount
    return () => {
      imagesToUpload.forEach((p) => URL.revokeObjectURL(p.preview));
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getProduct, getDeviceImages]);

  const MainImage = images[0]?.url || null;

  /* ======== Handlers ======== */

  const handleOpenEditModal = () => {
    // reset upload/delete states and prefill productToEdit
    setProductToEdit(product);
    setImagesToUpload([]);
    setImagesToDelete([]);
    setVideo(null);
    setVideoPreview(null);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    // revoke previews
    imagesToUpload.forEach((p) => URL.revokeObjectURL(p.preview));
    if (videoPreview) URL.revokeObjectURL(videoPreview);

    setImagesToUpload([]);
    setImagesToDelete([]);
    setVideo(null);
    setVideoPreview(null);
    setIsEditModalOpen(false);
  };

  const handleOpenDeleteModal = () => setIsDeleteModalOpen(true);
  const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);

  const handleOpenLinkModal = () => setIsLinkModalOpen(true);
  const handleCloseLinkModal = () => setIsLinkModalOpen(false);

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

  // Add new image files and create previews
  const handleAddImages = (files: FileList | null) => {
    if (!files) return;
    const newPreviews: FileWithPreview[] = Array.from(files).map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
    }));
    setImagesToUpload((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveNewImage = (index: number) => {
    const removed = imagesToUpload[index];
    if (removed) URL.revokeObjectURL(removed.preview);
    setImagesToUpload((prev) => prev.filter((_, i) => i !== index));
  };

  // toggle mark image for deletion (by url)
  const handleToggleDeleteImage = (url: string) => {
    setImagesToDelete((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  const handleSelectVideo = (file: File | null) => {
    if (!file) return;
    // revoke old preview
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    const preview = URL.createObjectURL(file);
    setVideo(file);
    setVideoPreview(preview);
  };

  /* ======== Save (edit) ======== */
  const handelSaveProductToEdit = async () => {
    // basic validation
    if (!productToEdit.tag)
      return toast.error("علي الاقل يجب تحديد التاج للجهاز");

    setIsLoading(true);

    try {
      // 1) upload new video if present
      let videoUrl = product.video ?? null;
      if (video) {
        const vidId = uuidv4();
        const ext =
          video.type === "video/mp4"
            ? "mp4"
            : video.name.split(".").pop() || "mp4";
        const path = `videos/${vidId}.${ext}`;
        const { error: vidErr } = await supabase.storage
          .from("media")
          .upload(path, video, { contentType: video.type, upsert: true });

        if (vidErr)
          throw new Error("حدث خطأ أثناء رفع الفيديو: " + vidErr.message);

        videoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;
      }

      // 2) update main product row (with new video url if changed)
      const { error: updateError } = await supabase
        .from(`${deviceType}`)
        .update({ ...productToEdit, video: videoUrl })
        .eq("id", id);

      if (updateError) throw new Error(updateError.message);

      // 3) delete marked images from images table
      if (imagesToDelete.length > 0) {
        const { error: delErr } = await supabase
          .from(`${deviceType}_images`)
          .delete()
          .in("url", imagesToDelete);
        if (delErr)
          throw new Error("فشل في حذف روابط الصور: " + delErr.message);
      }

      // 4) upload new images (if any) and insert records
      if (imagesToUpload.length > 0) {
        await Promise.all(
          imagesToUpload.map(async (p) => {
            const imgId = uuidv4();
            const ext = p.file.name.split(".").pop() || "jpg";
            const path = `images/${imgId}.${ext}`;

            const { error: uploadError } = await supabase.storage
              .from("media")
              .upload(path, p.file, { contentType: p.file.type });

            if (uploadError)
              throw new Error("فشل في رفع صورة: " + uploadError.message);

            const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;

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
      }

      toast.success("تم التعديل بنجاح");
      // refresh product and images
      await Promise.all([getProduct(), getDeviceImages()]);
      handleCloseEditModal();
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  /* ======== Delete product ======== */
  const handleSaveProductToDelete = async () => {
    if (!id) return;
    setIsLoading(true);
    const { error } = await supabase
      .from(`${deviceType}`)
      .delete()
      .eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("تم الحذف بنجاح");
      router.push(`/${deviceType}`);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const getEquipmentsCodes = async () => {
      const { error, data } = await supabase.from("equipments").select("code");
      if (error) {
        toast.error("فشل اكواد المعدات");
      } else {
        setEquipmentsCodes(data);
      }
    };

    getEquipmentsCodes();
  }, []);

  const handleChangeLinkedDeviceCode = (e: ChangeEvent<HTMLSelectElement>) => {
    setLinkedDeviceCode(e.target.value);
  };
  const handleSaveLinkProduct = async () => {
    if (!linkedDeviceCode) return toast.error("اختر اسم المعدة");
    setIsLoading(true);
    const { error } = await supabase
      .from(`${deviceType}`)
      .update({
        equipment_code: linkedDeviceCode,
      })
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    } else {
      toast.success("تم الربط بنجاح");
      getProduct();
      handleCloseLinkModal();
      setIsLoading(false);
    }
  };

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
                  type="text"
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

              {/* صور موجودة + صور جديدة */}
              {f.type === "file" && f.name === "image" && (
                <>
                  <Text mb={2}>
                    الصور الحالية (اضغط على زر الحذف لو عايز تمسحها قبل الحفظ)
                  </Text>
                  <HStack spacing={3} wrap="wrap" mb={3}>
                    {images.length > 0 ? (
                      images.map((img) => {
                        const marked = imagesToDelete.includes(img.url);
                        return (
                          <Box key={img.id ?? img.url} position="relative">
                            <Image
                              src={img.url}
                              alt="current"
                              boxSize="80px"
                              borderRadius="md"
                              objectFit="cover"
                              opacity={marked ? 0.4 : 1}
                            />
                            <IconButton
                              aria-label={marked ? "الغاء حذف" : "حذف"}
                              icon={<MdDelete />}
                              size="xs"
                              colorScheme={marked ? "green" : "red"}
                              position="absolute"
                              top={1}
                              right={1}
                              onClick={() => handleToggleDeleteImage(img.url)}
                            />
                            {marked && (
                              <Box
                                position="absolute"
                                bottom={1}
                                left={1}
                                bg="red.500"
                                px={2}
                                py={0.5}
                                color="white"
                                borderRadius="md"
                                fontSize="xs"
                              >
                                سيتم الحذف
                              </Box>
                            )}
                          </Box>
                        );
                      })
                    ) : (
                      <Text>لا توجد صور حالياً</Text>
                    )}
                  </HStack>

                  <Text mb={2}>صور جديدة (معاينة)</Text>
                  <HStack spacing={3} wrap="wrap" mb={2}>
                    {imagesToUpload.map((p, idx) => (
                      <Box key={p.preview} position="relative">
                        <Image
                          src={p.preview}
                          alt={`new ${idx}`}
                          boxSize="80px"
                          borderRadius="md"
                          objectFit="cover"
                        />
                        <IconButton
                          aria-label="remove"
                          icon={<MdDelete />}
                          size="xs"
                          colorScheme="red"
                          position="absolute"
                          top={1}
                          right={1}
                          onClick={() => handleRemoveNewImage(idx)}
                        />
                      </Box>
                    ))}
                  </HStack>

                  <Input
                    name={f.name}
                    multiple
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleAddImages(e.target.files)}
                  />
                </>
              )}

              {/* فيديو */}
              {f.type === "file" && f.name === "video" && (
                <>
                  <Text mb={2}>فيديو توضيحي (يمكن استبداله)</Text>
                  <Box mb={2}>
                    {videoPreview ? (
                      <video
                        src={videoPreview}
                        controls
                        style={{ width: "100%", maxHeight: 200 }}
                      />
                    ) : product.video ? (
                      <video
                        src={product.video}
                        controls
                        style={{ width: "100%", maxHeight: 200 }}
                      />
                    ) : (
                      <Text color="gray.500">لا يوجد فيديو حالياً</Text>
                    )}
                  </Box>
                  <Input
                    name={f.name}
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const v = e.target.files?.[0] || null;
                      if (v) handleSelectVideo(v);
                    }}
                  />
                </>
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

      {/* Link Modal */}
      <MyModal
        ModalTitle="ربط الجهاز بالمعده"
        isOpen={isLinkModalOpen}
        closeModal={handleCloseLinkModal}
        handleSave={handleSaveLinkProduct}
      >
        <Select defaultValue={""} onChange={handleChangeLinkedDeviceCode}>
          <option value={""} disabled hidden>
            {" "}
            اختر اسم المعده
          </option>
          {equipmentsCodes.map((equipment, index) => {
            return (
              <option key={index} value={equipment.code}>
                {equipment.code.toUpperCase()}
              </option>
            );
          })}
        </Select>
      </MyModal>

      {/* Main display */}
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={10}
        align="flex-start"
      >
        {/* صورة الجهاز */}
        <Box w="100%" maxW="600px">
          <Image
            src={(MainImage as string) || undefined}
            alt="device image"
            w="100%"
            h="auto"
            mb={3}
            objectFit="cover"
            borderRadius="lg"
            shadow="md"
            fallbackSrc="https://tse1.mm.bing.net/th/id/OIP.XXWKhZZeWjrUPx-ZSfP0GAHaDt"
          />
          {/* الصور المصغرة */}
          <HStack spacing={3} overflowX="auto" justifyContent="center">
            {images.map((img, index) => (
              <Image
                key={img.id ?? img.url}
                src={img.url}
                alt={`thumbnail ${index + 1}`}
                boxSize="80px"
                borderRadius="md"
                objectFit="cover"
                border={
                  MainImage === img.url
                    ? "3px solid #3182ce"
                    : "2px solid transparent"
                }
                cursor="pointer"
                _hover={{ border: "2px solid #63b3ed" }}
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

        {/* تفاصيل الجهاز */}
        <VStack
          align={"flex-start"}
          spacing={4}
          flex="1"
          textAlign="right"
          dir="rtl"
          w="100%"
        >
          <HStack>
            <MdInfo color="#3182ce" size={22} />
            <Text fontWeight="bold" fontSize="xl">
              النوع:
            </Text>
            <Text fontSize="lg">{product.type || "غير محدد"}</Text>
          </HStack>

          {deviceType !== "valves" && "range" in product && (
            <HStack>
              <MdInfo color="#805ad5" size={22} />
              <Text fontWeight="bold" fontSize="xl">
                الرينج:
              </Text>
              <Text fontSize="lg">{product.range || "غير محدد"}</Text>
            </HStack>
          )}

          <HStack>
            <TbTools color="#3182ce" size={22} />
            <Text fontWeight="bold" fontSize="xl">
              الفيتينج:
            </Text>
            <Text fontSize="lg">غير محدد</Text>
          </HStack>

          {deviceType === "switches" && "set_point" in product && (
            <HStack>
              <MdBuild color="#4fd1c5" size={22} />
              <Text fontWeight="bold" fontSize="xl">
                نقطه التلقيط:
              </Text>
              <Text fontSize="lg">{product?.set_point || "غير محدد"}</Text>
            </HStack>
          )}

          <HStack>
            <MdLocationOn color="#3182ce" size={22} />
            <Text fontWeight="bold" fontSize="xl">
              الموقع:
            </Text>
            <Text fontSize="lg">{product.location || "غير محدد"}</Text>
          </HStack>

          <HStack align="start">
            <MdDescription color="#805ad5" size={22} />
            <Text fontWeight="bold" fontSize="xl">
              الوصف:
            </Text>
            <Text fontSize="lg">{product.description || "لا يوجد وصف"}</Text>
          </HStack>

          <HStack>
            <MdDateRange color="#4fd1c5" size={22} />
            <Text fontWeight="bold" fontSize="xl">
              تاريخ الاضافه:
            </Text>
            <Text fontSize="lg">{product.created_at}</Text>
          </HStack>
          <Divider />

          <HStack spacing={4}>
            <Badge
              fontSize="md"
              px={3}
              py={1}
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
              fontSize="md"
              px={3}
              py={1}
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
            <Button
              onClick={handleOpenEditModal}
              bg="green.400"
              _hover={{ bg: "green.500" }}
            >
              تعديل بيانات الجهاز
            </Button>
            {product.equipment_code == null ? (
              <Button
                onClick={handleOpenLinkModal}
                bg="orange.300"
                _hover={{ bg: "orange.400" }}
              >
                ربط الجهاز بمعده
              </Button>
            ) : (
              ""
            )}
          </HStack>

            <Button
              onClick={handleOpenDeleteModal}
              bg="red.400"
              _hover={{ bg: "red.500" }}
            >
              حذف الجهاز
            </Button>
        </VStack>
      </Flex>

      {product.equipment_code != null && (
        <HStack dir="rtl" mt={5}>
          <MdInfo color="#d69e2e" size={22} />
          <Text fontWeight="bold" fontSize="xl">
            تم الربط بمعده
          </Text>
          <Badge
            fontSize="md"
            px={3}
            py={1}
            borderRadius="md"
            colorScheme={getStatusColor(product.status)}
          >
            {product.equipment_code || "غير محدد"}
          </Badge>
        </HStack>
      )}

      <Box mt={10} dir="rtl">
        <Heading size="md" mb={3}>
          🎥 فيديو توضيحي
        </Heading>
        <Box borderRadius="md" overflow="hidden">
          {product.video ? (
            <video
              controls
              src={product.video}
              style={{ width: "100%", maxHeight: "500px", borderRadius: 8 }}
            />
          ) : (
            <Text color="gray.500">لا يوجد فيديو توضيحي.</Text>
          )}
        </Box>
      </Box>
    </Box>
  );
}
