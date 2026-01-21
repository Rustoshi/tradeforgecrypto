import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

export async function uploadImage(
  file: File,
  folder: string = "kyc"
): Promise<UploadResult> {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.warn("Cloudinary not configured");
    return { success: false, error: "Upload service not configured" };
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: `hyi-broker/${folder}`,
      resource_type: "image",
      transformation: [
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ],
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return { success: false, error: "Failed to upload image" };
  }
}

export async function deleteImage(publicId: string): Promise<boolean> {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return false;
  }

  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return false;
  }
}

export function getOptimizedUrl(url: string, width?: number): string {
  if (!url.includes("cloudinary.com")) {
    return url;
  }

  // Add transformation for optimization
  const transformations = ["f_auto", "q_auto"];
  if (width) {
    transformations.push(`w_${width}`);
  }

  return url.replace("/upload/", `/upload/${transformations.join(",")}/`);
}
