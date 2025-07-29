"use client";

import {
  Input,
  Select,
  FormControl,
  FormLabel,
  SimpleGrid,
  Checkbox,
} from "@chakra-ui/react";
import { ChangeEvent } from "react";
import type { Field } from "../interface/interface";

type Props = {
  fields: Field[];
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  setImages: (files: File[]) => void;
  setVideo: ({}: File) => void;
};

export default function DeviceForm({
  fields,
  onChange,
  setImages,
  setVideo,
}: Props) {
  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
      {fields.map((f) => (
        <FormControl key={f.name} mb={4} display="flex" flexDirection="column">
          {f.type !== "checkbox" && <FormLabel>{f.label}</FormLabel>}

          {f.type === "text" && (
            <Input
              name={f.name}
              type={f.type}
              placeholder={f.placeholder}
              onChange={onChange}
            />
          )}

          {f.type === "select" && (
            <Select name={f.name} onChange={onChange} defaultValue="">
              <option value="" disabled hidden>
                {f.placeholder}
              </option>
              {f.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          )}

          {/* =======image================= */}
          {f.type === "file" && f.name === "image" && (
            <Input
              name={f.name}
              multiple
              type="file"
              accept="image/*"
              onChange={(e) => {
                const images = e.target.files;
                if (images) {
                  setImages(Array.from(images));
                }
              }}
              placeholder={f.placeholder}
            />
          )}

          {/* =======video================= */}
          {f.type === "file" && f.name === "video" && (
            <Input
              name={f.name}
              accept="video/*"
              type="file"
              onChange={(e) => {
                const video = e.target.files?.[0] || null;
                if (video) {
                  setVideo(video);
                }
              }}
              placeholder={f.placeholder}
            />
          )}

          {f.type === "checkbox" && (
            <Checkbox name={f.name} onChange={onChange}>
              {f.label}
            </Checkbox>
          )}

          {f.type === "date" && (
            <Input
              name={f.name}
              type="date"
              onChange={onChange}
              placeholder={f.placeholder}
            />
          )}
        </FormControl>
      ))}
    </SimpleGrid>
  );
}
