import {
  Card,
  CardBody,
  Image,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";

interface IProps {
  id: string;
  type: string;
  status?: string;
  image: string | File;
  tag: string;
  name?: string;
}

const ProductCard = ({ id, type, status, image, tag, name }: IProps) => {
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
        src={typeof image === "string" ? image : URL.createObjectURL(image)}
        alt={tag}
        w="100%"
        maxH={{ base: "180px", md: "200px", lg: "220px" }} // ✅ تحديد أقصى ارتفاع
        objectFit="contain"
        borderTopRadius="md"
        bg="white"
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
            الحالة: {status}
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
