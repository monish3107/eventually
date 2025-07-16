// uploadthing.ts
import { generateReactHelpers } from "@uploadthing/react"; // FIX: Changed import path
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();