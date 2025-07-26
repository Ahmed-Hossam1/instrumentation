import { Button } from "@chakra-ui/react";

interface PaginationProps {
  ToWhere: () => void;
  title: string;
  isDisabled?: boolean;
}

const Pagination = ({ ToWhere, title, isDisabled }: PaginationProps) => {
  return (
    <Button onClick={ToWhere} isDisabled={isDisabled}>
      {title}
    </Button>
  );
};

export default Pagination;
