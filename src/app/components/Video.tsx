import { Box, CloseButton, useColorModeValue } from "@chakra-ui/react";

interface VideoProps {
  videoUrl: string;
  isOpen: boolean;
  setIsOpen: () => void;
}

const Video = ({ videoUrl, isOpen, setIsOpen }: VideoProps) => {
  const overlayBg = useColorModeValue(
    "rgba(0, 0, 0, 0.5)",
    "rgba(255, 255, 255, 0.1)"
  );

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      w="100vw"
      h="100vh"
      zIndex={999}
      bg={overlayBg}
      backdropFilter="blur(8px)"
      display={isOpen ? "flex" : "none"}
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        position="relative"
        w={{ base: "100%", md: "90%", lg: "70%" }}
        h={{ base: "60%", md: "70%", lg: "80%" }}
        bg={"gray.800"}
        borderRadius="md"
        overflow="hidden"
      >
        <CloseButton
          position="absolute"
          top={2}
          right={2}
          zIndex={10}
          bg="red.600"
          color="white"
          _hover={{ bg: "red.700" }}
          onClick={setIsOpen}
        />

        {isOpen && (
          <video controls autoPlay style={{ width: "100%", height: "100%" }}>
            <source src={videoUrl} type="video/mp4" />
          </video>
        )}
      </Box>
    </Box>
  );
};

export default Video;
