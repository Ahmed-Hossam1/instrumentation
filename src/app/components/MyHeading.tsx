"use client";

import { Button, HStack, Input, Select } from "@chakra-ui/react";
import { ChangeEvent } from "react";

interface IProps {
  deviceName: string;
  search: string;
  handleStatusFilter: (e : ChangeEvent<HTMLSelectElement>) => void;
  statusFilter: string;
  handleSearch: (e : ChangeEvent<HTMLInputElement>) => void;
  handleOpenAddModal: () => void;
}

const MyHeading = ({
  deviceName,
  search,
  handleStatusFilter,
  statusFilter,
  handleSearch,
  handleOpenAddModal,
}: IProps) => {
  return (
    <>
      <HStack spacing={4} mb={6}>
        <Input
          placeholder="ابحث برقم الجهاز أو التاج"
          value={search}
          onChange={handleSearch}
        />
        <Select value={statusFilter} onChange={handleStatusFilter} maxW="200px">
          <option value="all">كل الحالات</option>
          <option value="Active">يعمل</option>
          <option value="Needs Calibration">يحتاج إلى معايرة</option>
          <option value="Faulty">تالف</option>
          <option value="Inactive">لا يعمل</option>
        </Select>
      </HStack>

      <Button colorScheme="blue" w={"100%"} mb={8} onClick={handleOpenAddModal}>
       {deviceName}  إضافة 
      </Button>
    </>
  );
};

export default MyHeading;
