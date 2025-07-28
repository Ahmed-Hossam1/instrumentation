"use client";
import { useState } from "react";
import { supabase } from "../lib/Supabase";

import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { Button } from "@chakra-ui/react";
const testPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const unique = uuidv4();

  const handleUpload = async () => {
    if (!files) return;

    const result = files.map(async (file) => {
      const { error: imgERR } = await supabase.storage
        .from("media")
        .upload(`images/${unique}`, file, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (imgERR) return toast.error("هذه الصورة موجودة بالفعل");
      toast("تم تحميل الصور بنجاح" + file.name);
    });

  };

  console.log(files);
  return (
    <div>
      <input
        type="file"
        multiple
        onChange={(e) => {
          const selectedFiles = e.target.files;
          if (selectedFiles) {
            setFiles(Array.from(selectedFiles));
          }
        }}
      />
      <ul>
        {files.map((file, index) => (
          <li key={index}>{file.name}</li>
        ))}
      </ul>

      <Button onClick={handleUpload}>Upload</Button>
    </div>
  );
};

export default testPage;
