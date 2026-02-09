import { NextRequest, NextResponse } from "next/server";

// Uploadthing direct upload API
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("file") as File[];
    const endpoint = formData.get("endpoint") as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (!endpoint) {
      return NextResponse.json({ error: "No endpoint provided" }, { status: 400 });
    }

    // Get UPLOADTHING_TOKEN from environment
    let uploadThingToken = process.env.UPLOADTHING_TOKEN;
    const uploadthingUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
    console.log("Token first 20 chars:", uploadThingToken?.substring(0, 20));
    console.log("Token length:", uploadThingToken?.length);
    
    // Decode base64 JWT token if needed
    if (uploadThingToken && /^[A-Za-z0-9+/=]+$/.test(uploadThingToken)) {
      try {
        const decoded = Buffer.from(uploadThingToken, 'base64').toString('utf8');
        const json = JSON.parse(decoded);
        if (json.apiKey) {
          uploadThingToken = json.apiKey;
          console.log("Decoded API key:", uploadThingToken?.substring(0, 20));
        }
      } catch (e) {
        console.error("Failed to decode token:", e);
      }
    }

    if (!uploadThingToken) {
      return NextResponse.json(
        { error: "UPLOADTHING_TOKEN not configured" },
        { status: 500 }
      );
    }

    const urls: string[] = [];

    // Upload each file
    for (const file of files) {
      // Get upload URL from Uploadthing with all required fields
      const uploadUrlResponse = await fetch(
        `https://uploadthing.com/api/prepareUpload?fileCount=1`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: uploadThingToken,
            "x-uploadthing-api-key": uploadThingToken,
          },
          body: JSON.stringify({
            files: [
              {
                name: file.name,
                type: file.type,
                size: file.size,
              },
            ],
            callbackUrl: `${uploadthingUrl}/api/uploadthing`,
            callbackSlug: endpoint,
            routeConfig: {
              image: {
                maxFileSize: "4MB",
                maxFileCount: 1,
                accept: ["image/*"],
              },
            },
          }),
        }
      );

      if (!uploadUrlResponse.ok) {
        const error = await uploadUrlResponse.text();
        console.error("Failed to get upload URL:", error);
        throw new Error(`Failed to prepare upload: ${error}`);
      }

      const uploadData = await uploadUrlResponse.json();
      const { url, fields } = uploadData[0];

      // Upload file to the presigned URL
      const uploadFormData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        uploadFormData.append(key, value as string);
      });
      uploadFormData.append("file", file);

      const uploadResponse = await fetch(url, {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.text();
        console.error("Upload failed:", error);
        throw new Error("Failed to upload file");
      }

      // Extract the file URL from the response
      const fileUrl = `https://${new URL(url).hostname}/${fields.key}`;
      urls.push(fileUrl);
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
