"use client";

import { useState, useCallback } from "react";
import { Upload, X } from "lucide-react";

interface DelayedUploadButtonProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  onUploadComplete: (urls: string[]) => void;
  className?: string;
  maxFiles?: number;
  maxSize?: number;
}

export function DelayedUploadButton({
  files,
  onFilesChange,
  onUploadComplete,
  className = "",
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024, // 5MB default
}: DelayedUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      setError(null);

      // Validate file count
      if (files.length + selectedFiles.length > maxFiles) {
        setError(`Maximum ${maxFiles} file(s) allowed`);
        return;
      }

      // Validate file size
      const oversizedFiles = selectedFiles.filter((f) => f.size > maxSize);
      if (oversizedFiles.length > 0) {
        setError(
          `Files too large: ${oversizedFiles.map((f) => f.name).join(", ")}`
        );
        return;
      }

      // Validate file type
      const invalidTypeFiles = selectedFiles.filter(
        (f) => !["image/jpeg", "image/png", "image/gif", "image/webp"].includes(f.type)
      );
      if (invalidTypeFiles.length > 0) {
        setError(
          `Invalid file type: ${invalidTypeFiles
            .map((f) => f.name)
            .join(", ")}. Allowed: JPG, PNG, GIF, WebP`
        );
        return;
      }

      onFilesChange([...files, ...selectedFiles]);
      // Clear input
      e.target.value = "";
    },
    [files, maxFiles, maxSize, onFilesChange]
  );

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("file", file);
      });
      formData.append("folder", "products");

      const response = await fetch("/api/supabase/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      setUploadProgress(100);

      onUploadComplete(data.urls);
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={className}>
      {/* File input */}
      <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors relative">
        <input
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          disabled={isUploading || files.length >= maxFiles}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Click to select image(s) - will upload on submit
          </p>
          <p className="text-xs text-muted-foreground">
            Max {maxFiles} file(s), {formatFileSize(maxSize)} each. JPG, PNG, GIF, WebP
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 text-red-500 text-sm rounded">
          {error}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-muted rounded-lg"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-10 h-10 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              {!isUploading && (
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 text-muted-foreground hover:text-red-500"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={isUploading || files.length === 0}
            className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading... {uploadProgress}%
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload {files.length} file(s) now
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// Convenience component for single image with preview
interface DelayedImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

export function DelayedImageUpload({
  value,
  onChange,
  className = "",
}: DelayedImageUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadComplete = (urls: string[]) => {
    if (urls.length > 0) {
      onChange(urls[0]);
    }
    setFiles([]);
  };

  const handleRemove = () => {
    onChange("");
    setFiles([]);
  };

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
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={handleRemove}
          className="mt-2 text-sm text-red-500 hover:text-red-600"
          type="button"
        >
          Remove image
        </button>
      </div>
    );
  }

  return (
    <DelayedUploadButton
      files={files}
      onFilesChange={setFiles}
      onUploadComplete={handleUploadComplete}
      className={className}
    />
  );
}
