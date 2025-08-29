import {
  Card,
  CardBody,
  Image,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { Images } from "../interface/interface";
import { useEffect, useState } from "react";
import { supabase } from "../lib/Supabase";
import MySkeleton from "./MySkeleton";

interface IProps {
  deviceType: string;
  id: string;
  type: string;
  status?: string;
  image: string | File;
  tag: string;
  name?: string;
}

const ProductCard = ({ id, type, status, tag, name, deviceType }: IProps) => {
  const [images, setImages] = useState<Images[]>([]);

  useEffect(() => {
    const getTransmittersImages = async () => {
      const { data, error } = await supabase
        .from(`${deviceType}_images`)
        .select("*")
        .eq("device_id", id);

      if (error) console.log("failed to load image :" + error.message);
      else setImages(data);
    };

    getTransmittersImages();
  }, [id, deviceType]);

  const MainImage = images.length > 0 ? images[0].url : null;
  const imageBg = useColorModeValue("gray.50", "gray.800");

  return (
    <Card
      id={id}
      _hover={{ shadow: "lg", transform: "scale(1.02)" }}
      transition="all 0.2s"
      cursor="pointer"
      w="100%"
      h="100%"
      bg={imageBg}
    >
      <Image
        src={MainImage as string}
        alt={tag}
        w="100%"
        maxH={{ base: "180px", md: "200px", lg: "220px" }}
        objectFit="contain"
        borderTopRadius="md"
        bg="white"
        fallback={<MySkeleton />}
        onError={(e) => {
          e.currentTarget.src =
            "https://tse1.mm.bing.net/th/id/OIP.XXWKhZZeWjrUPx-ZSfP0GAHaDt?r=0&rs=1&pid=ImgDetMain&o=7&rm=3";
        }}
      />
      <CardBody>
        <VStack align="start" spacing={1}>
          <Text fontWeight="bold" fontSize="lg">
            {tag}
          </Text>
          <Text color="gray.500" dir="rtl">
            النوع: {type}
          </Text>
          <Text color="gray.500" dir="rtl">
            الحالة: {status || "غير معروف"}
          </Text>
          {name && (
            <Text color="gray.500" dir="rtl">
              الاسم: {name}
            </Text>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default ProductCard;
