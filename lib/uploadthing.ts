import { createUploadthing, type FileRouter } from "uploadthing/server";

const f = createUploadthing();

// Fake auth function - replace with your actual auth
const handleAuth = () => {
  // You can add actual auth check here
  return { userId: "admin" };
};

export const ourFileRouter = {
  // For category images
  categoryImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Category image uploaded:", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // For product print images (front and back)
  productImage: f({ image: { maxFileSize: "4MB", maxFileCount: 2 } })
    .middleware(() => handleAuth())
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Product image uploaded:", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // For product variant images (color swatches, etc.)
  variantImage: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Variant image uploaded:", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
