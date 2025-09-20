"use client";

import {
  Avatar,
  Box,
  Button,
  CloseButton,
  Drawer,
  DrawerContent,
  Flex,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  VStack,
  BoxProps,
  FlexProps,
} from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

import { FiHome, FiMenu, FiChevronDown } from "react-icons/fi";
import { MdReportProblem, MdSpeed, MdWifiTethering } from "react-icons/md";
import { BiChip, BiDevices } from "react-icons/bi";
import { GiValve } from "react-icons/gi";
import { TbSettingsCog } from "react-icons/tb";
import { ImFire } from "react-icons/im";
import { BsMoon, BsSun } from "react-icons/bs";
import { IconType } from "react-icons";

interface LinkItemProps {
  name: string;
  icon: IconType;
  href: string;
}

interface NavItemProps extends FlexProps {
  icon: IconType;
  children: React.ReactNode;
  href: string;
}

interface MobileProps extends FlexProps {
  onOpen: () => void;
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

const LinkItems: Array<LinkItemProps> = [
  { name: "Home", icon: FiHome, href: "/" },
  { name: "Equipments", icon: BiDevices, href: "/equipments" },
  { name: "Transmitters", icon: MdWifiTethering, href: "/transmitters" },
  { name: "Indicators", icon: MdSpeed, href: "/indicators" },
  { name: "Switches", icon: BiChip, href: "/switches" },
  { name: "Valves", icon: GiValve, href: "/valves" },
  { name: "Calibration", icon: TbSettingsCog, href: "/calibration" },
  { name: "Malfunctions", icon: MdReportProblem, href: "/malfunctions" },
  { name: "FireFighting", icon: ImFire, href: "/firefighting" },
];

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  return (
    <Box
      transition="0.3s ease"
      bg={useColorModeValue("white", "gray.900")}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text
          fontSize="2xl"
          fontFamily="Dancing Script, cursive"
          fontWeight="bold"
          position="relative"
          overflow="hidden"
          _before={{
            content: `""`,
            position: "absolute",
            top: 0,
            left: "-75%",
            width: "50%",
            height: "100%",
            background:
              "linear-gradient(120deg, transparent, rgba(255,255,255,0.5), transparent)",
            transform: "skewX(-20deg)",
            animation: "shine 2s infinite",
          }}
          sx={{
            "@keyframes shine": {
              "0%": { left: "-75%" },
              "100%": { left: "125%" },
            },
          }}
        >
          Instrumentation
        </Text>
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        <Box key={link.name} onClick={onClose}>
          <NavItem icon={link.icon} href={link.href}>
            {link.name}
          </NavItem>
        </Box>
      ))}
    </Box>
  );
};

const NavItem = ({ icon, children, href, ...rest }: NavItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  const testColor = useColorModeValue("gray.700", "gray.200");
  return (
    <Link href={href}>
      <Box as="div" _focus={{ boxShadow: "none" }}>
        <Flex
          align="center"
          p="4"
          mx="4"
          borderRadius="lg"
          cursor="pointer"
          bg={isActive ? "blue.500" : "transparent"}
          color={isActive ? "white" : testColor}
          _hover={{
            bg: "cyan.400",
            color: "white",
          }}
          {...rest}
        >
          {icon && (
            <Icon
              mr="4"
              fontSize="16"
              _groupHover={{ color: "white" }}
              as={icon}
            />
          )}
          {children}
        </Flex>
      </Box>
    </Link>
  );
};

const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={4}
      height="20"
      alignItems="center"
      bg={useColorModeValue("white", "gray.900")}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue("gray.200", "gray.700")}
      justifyContent={{ base: "space-between", md: "flex-end" }}
      {...rest}
    >
      <IconButton
        display={{ base: "flex", md: "none" }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Text
        fontSize="3xl"
        fontFamily="dancing script"
        fontWeight="bold"
        display={{ base: "flex", md: "none" }}
      >
        instrumentation
      </Text>

      <HStack spacing={{ base: "0", md: "6" }}>
        <Button onClick={toggleColorMode}>
          {colorMode === "light" ? <BsMoon /> : <BsSun />}
        </Button>

        <Flex alignItems={"center"}>
          <Menu>
            <MenuButton py={2} transition="all 0.3s">
              <HStack>
                <Avatar size="sm" />
                <VStack
                  display={{ base: "none", md: "flex" }}
                  alignItems="flex-start"
                  spacing="1px"
                  ml="2"
                >
                  <Text fontSize="sm">Admin</Text>
                  <Text fontSize="xs" color="gray.500">
                    Admin
                  </Text>
                </VStack>
                <Box display={{ base: "none", md: "flex" }}>
                  <FiChevronDown />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList
              bg={useColorModeValue("white", "gray.900")}
              borderColor={useColorModeValue("gray.200", "gray.700")}
            >
              <MenuItem>Profile</MenuItem>
              <MenuItem>Settings</MenuItem>
              <MenuItem>Billing</MenuItem>
              <MenuDivider />
              <MenuItem>Sign out</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
    </Flex>
  );
};

interface SidebarWithHeaderProps {
  children: ReactNode;
}

const SidebarWithHeader = ({ children }: SidebarWithHeaderProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box minH="100vh" bg={useColorModeValue("gray.100", "gray.900")}>
      <SidebarContent
        onClose={onClose}
        display={{ base: "none", md: "block" }}
      />
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>

      <MobileNav onOpen={onOpen} />

      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
  );
};

export default SidebarWithHeader;
