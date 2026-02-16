import cloudinary from "../config/cloudinary.js";

export const uploadPdf = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw", // Use 'raw' for PDFs to get proper /raw/upload/ URL
        folder: "test-series-hub/pdfs",
      },
      (error, result) => {
        if (error) return next(error);

        return res.status(201).json({
          url: result.secure_url, // Will be a /raw/upload/ URL that browsers can display
          public_id: result.public_id,
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    next(error);
  }
};
