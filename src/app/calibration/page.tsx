"use client";

import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Image,
  SimpleGrid,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { TbSettingsCog } from "react-icons/tb";
import { useEffect, useState, type ChangeEvent } from "react";
import toast from "react-hot-toast";
import { formConfig, type calibration } from "@/app/interface/interface";
import MyModal from "../UI/MyModal";
import Loader from "../UI/Loader";
import Video from "../components/Video";
import { supabase } from "../lib/Supabase";
import DeviceForm from "../UI/DeviceForm";
import { v4 as uuidv4 } from "uuid";

const CalibrationPage = () => {
  /* ============ states ==================== */
  const [isOpen, setIsOpen] = useState(false);
  const [calibration, setCalibration] = useState<calibration[]>([]);
  const [newCalibration, setNewCalibration] = useState<calibration>(
    {} as calibration
  );
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File>({} as File);
  const [selectedVideo, setSelectedVideo] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /* ============ Dark Mode ==================== */
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const subTextColor = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  /* ============ variables ==================== */

  const Fields = formConfig;
  /* We're using `as keyof typeof Fields` to explicitly tell TypeScript that `deviceType` is one of the valid keys of the `Fields` object.
  Without this assertion, TypeScript may throw an error because it can't be sure that `deviceType` matches a key in `Fields`.
 This cast ensures we can safely access Fields[deviceType] without a compile-time error.
 */

  const FieldsType = Fields["calibration" as keyof typeof Fields];
  const uniqueName = uuidv4(); // مثل: 'f60b2e87-...'

  /* ============ Functions ==================== */
  const getCalibration = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from("calibration").select("*");
    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    } else {
      setCalibration(data);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCalibration();
  }, []);

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleAddModalChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setNewCalibration((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (
      !newCalibration.name ||
      !newCalibration.type ||
      images.length == 0 ||
      !video
    ) {
      return toast.error("من فضلك ادخل جميع الحقول");
    }

    setIsLoading(true);

    //  Upload video To Storage First in Supabase
    const videoPath = `/videos/${uniqueName}`;
    const { error: videoErr } = await supabase.storage
      .from("media")
      .upload(videoPath, video, {
        contentType: "video/mp4",
        upsert: true,
      });
    if (videoErr) {
      toast.error("فشل في رفع الفيديو");
    }

    const videoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media${videoPath}`;
    let imageUrl = "";
    await Promise.all(
      images.map(async (file) => {
        const imagePath = `images/${uniqueName}`;
        const { error: imgErr } = await supabase.storage
          .from("media")
          .upload(imagePath, file, {
            contentType: "image/jpeg",
            upsert: true,
          });
        if (imgErr) {
          toast.error("فشل في رفع الصورة");
        } else {
          imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${imagePath}`;
        }
      })
    );

    const { error } = await supabase.from("calibration").insert({
      ...newCalibration,
      image: imageUrl,
      video: videoUrl,
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    } else {
      toast.success("تم الحفظ بنجاح");
      handleCloseAddModal();
      getCalibration();
      setIsLoading(false);
    }
  };

  const handleOpenVideo = (url: string) => {
    setSelectedVideo(url);
    setIsOpen(true);
  };

  console.log(newCalibration, images, video);

  if (isLoading) return <Loader loading={isLoading} />;

  return (
    <Box p={{ base: 4, md: 6 }}>
      <Heading
        fontSize="2xl"
        fontWeight="semibold"
        mb={6}
        color={textColor}
        textAlign="start"
      >
        <HStack justifyContent="space-between">
          <Flex align="center" gap={2}>
            <TbSettingsCog />
            <Text color={textColor}>طرق المعايرة</Text>
          </Flex>
          <Button colorScheme="blue" onClick={handleOpenAddModal}>
            اضافة طريقة معايرة
          </Button>
        </HStack>
      </Heading>

      <MyModal
        ModalTitle="اضافة طريقة معايرة"
        closeModal={handleCloseAddModal}
        isOpen={isAddModalOpen}
        handleSave={handleSave}
      >
        <DeviceForm
          fields={FieldsType}
          onChange={handleAddModalChange}
          setVideo={setVideo}
          setImages={setImages}
        />
      </MyModal>

      <SimpleGrid columns={{ base: 1, sm: 1, md: 2, lg: 3 }} spacing={6}>
        {calibration.map((item, idx) => (
          <Box
            key={idx}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            boxShadow="md"
            w="100%"
            bg={cardBg}
            borderColor={borderColor}
          >
            <Image
              src={`${item.image}`}
              alt={item.name || item.type}
              objectFit="contain"
              w="100%"
              h="160px"
            />

            <VStack spacing={1} p={3} align="start">
              <Text fontWeight="bold" fontSize="lg" color={textColor}>
                {item.name}
              </Text>
              <Text
                fontSize="sm"
                color={subTextColor}
                textTransform="capitalize"
              >
                {item.type}
              </Text>

              <Button
                w="100%"
                bg="blue.400"
                color="white"
                _hover={{ bg: "blue.500" }}
                onClick={() => handleOpenVideo(item.video)}
              >
                مشاهدة
              </Button>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>

      <Video
        isOpen={isOpen}
        setIsOpen={() => setIsOpen(false)}
        videoUrl={`${selectedVideo}`}
      />
    </Box>
  );
};

export default CalibrationPage;
