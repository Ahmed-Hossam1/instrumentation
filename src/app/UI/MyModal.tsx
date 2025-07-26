import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { useRef } from "react";
interface MyModalProps {
  ModalTitle: string;
  children: React.ReactNode;
  handleSave?: () => void;
  isOpen: boolean;
  closeModal: () => void;
  saveBtnName?: string;
  saveBtnColor?: string;
}
const MyModal = ({
  ModalTitle,
  children,
  handleSave,
  isOpen,
  closeModal,
  saveBtnName,
  saveBtnColor,
}: MyModalProps) => {
  const initialRef = useRef(null);
  const finalRef = useRef(null);

  
  return (
    <>
      <Modal
        initialFocusRef={initialRef}
        finalFocusRef={finalRef}
        isOpen={isOpen}
        onClose={closeModal}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader> {ModalTitle} </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>{children}</ModalBody>

          <ModalFooter>
            <Button
              colorScheme={saveBtnColor || "blue"}
              mr={3}
              onClick={handleSave}
            >
              {saveBtnName || "Save"}
            </Button>
            <Button onClick={closeModal}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MyModal;
