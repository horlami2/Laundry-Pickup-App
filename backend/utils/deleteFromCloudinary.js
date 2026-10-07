import cloudinary from "../config/cloudinary.js";

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId || publicId.startsWith("external:")) return;

  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
};
