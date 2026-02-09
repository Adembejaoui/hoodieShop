import { createClient } from "@supabase/supabase-js";

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase admin client with service role (bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Constants
export const STORAGE_BUCKET = "images";

interface UploadOptions {
  bucket?: string;
  folder?: string;
  maxSize?: number;
  allowedTypes?: string[];
}

interface UploadResult {
  url: string;
  error?: {
    message: string;
  };
}

// Upload a single file
export async function uploadFile(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const {
    bucket = STORAGE_BUCKET,
    folder = "uploads",
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
  } = options;

  // Validate file
  if (file.size > maxSize) {
    return {
      url: "",
      error: {
        message: `File too large. Max size: ${formatFileSize(maxSize)}`,
      },
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      url: "",
      error: {
        message: `Invalid file type. Allowed: ${allowedTypes.join(", ")}`,
      },
    };
  }

  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${folder}/${timestamp}-${randomStr}.${ext}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload with service role (bypasses RLS)
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return {
        url: "",
        error: {
          message: error.message,
        },
      };
    }

    // Get public URL - construct manually to ensure correct format
    // Supabase storage public URL format: https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[path]
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${data.path}`;

    return {
      url: publicUrl,
    };
  } catch (err) {
    console.error("Upload exception:", err);
    return {
      url: "",
      error: {
        message: err instanceof Error ? err.message : "Upload failed",
      },
    };
  }
}

// Upload multiple files
export async function uploadFiles(
  files: File[],
  options: UploadOptions = {}
): Promise<UploadResult[]> {
  const results = await Promise.all(
    files.map((file) => uploadFile(file, options))
  );
  return results;
}

// Delete a file
export async function deleteFile(
  filePath: string,
  bucket: string = STORAGE_BUCKET
): Promise<{ error?: { message: string } }> {
  try {
    const { error } = await supabaseAdmin.storage.from(bucket).remove([filePath]);

    if (error) {
      return { error: { message: error.message } };
    }

    return {};
  } catch (err) {
    return {
      error: {
        message: err instanceof Error ? err.message : "Delete failed",
      },
    };
  }
}

// Get public URL for a file
export function getPublicUrl(
  filePath: string,
  bucket: string = STORAGE_BUCKET
): string {
  // Construct URL manually: https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[path]
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`;
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
