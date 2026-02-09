"use client";

import { UploadButton } from "@uploadthing/react";
import { X } from "lucide-react";
import { type OurFileRouter } from "@/lib/utils/uploadthing";

interface UploadThingButtonProps {
  endpoint: keyof OurFileRouter;
  value: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  className?: string;
}

export function UploadThingButton({
  endpoint,
  value,
  onChange,
  onRemove,
  className = "",
}: UploadThingButtonProps) {
  if (value) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden border">
          <img
            src={value}
            alt="Uploaded image"
            className="w-full h-full object-cover"
          />
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={onRemove}
          className="mt-2 text-sm text-red-500 hover:text-red-600"
          type="button"
        >
          Remove image
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <UploadButton<OurFileRouter, typeof endpoint>
        endpoint={endpoint}
        onClientUploadComplete={files => {
          console.log("Upload complete:", files);
          if (files && files[0]) {
            onChange(files[0].url);
          }
        }}
        onUploadError={error => {
          console.error("Upload error:", error);
          alert(`Upload failed: ${error.message}`);
        }}
        appearance={{
          button: {
            backgroundColor: "#6366f1",
            color: "white",
            borderRadius: "0.5rem",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            fontWeight: "500",
            cursor: "pointer",
          },
        }}
      />
    </div>
  );
}

// Simpler button version for inline use
interface SimpleUploadButtonProps {
  endpoint: keyof OurFileRouter;
  onUploadComplete: (url: string) => void;
  className?: string;
}

export function SimpleUploadButton({
  endpoint,
  onUploadComplete,
  className = "",
}: SimpleUploadButtonProps) {
  return (
    <UploadButton<OurFileRouter, typeof endpoint>
      endpoint={endpoint}
      onClientUploadComplete={files => {
        console.log("Upload complete:", files);
        if (files && files[0]) {
          onUploadComplete(files[0].url);
        }
      }}
      onUploadError={error => {
        console.error("Upload error:", error);
        alert(`Upload failed: ${error.message}`);
      }}
      appearance={{
        button: {
          backgroundColor: "#6366f1",
          color: "white",
          borderRadius: "0.375rem",
          padding: "0.5rem 1rem",
          fontSize: "0.875rem",
          fontWeight: "500",
          cursor: "pointer",
        },
      }}
    />
  );
}
