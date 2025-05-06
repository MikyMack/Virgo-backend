// backend/controllers/productController.js
const Product = require("../models/productModel");
const cloudinary = require("../utils/cloudinary");

const uploadToCloudinary = async (fileBuffer) => {
  return await cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
    if (error) throw error;
    return result;
  });
};

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      brand,
      basePrice,
      baseStock,
      isActive,
      primaryCategory,
      secondaryCategory,
      tertiaryCategory,
      fragrance,
      specifications,
      careAndMaintenance,
      warranty,
      qna,
      variants, // JSON string from client
    } = req.body;

    // Parse variant array and Q&A
    const parsedVariants = variants ? JSON.parse(variants) : [];
    const parsedQna = qna ? JSON.parse(qna) : [];

    const images = [];
    const variantImages = [];

    // 1. Upload main product images
    if (req.files?.images) {
      for (const file of req.files.images) {
        const result = await cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (err, result) => {
            if (err) throw err;
            images.push(result.secure_url);
          }
        ).end(file.buffer);
      }
    }

    // 2. Upload variant images
    if (req.files?.variantImages) {
      for (const file of req.files.variantImages) {
        const result = await cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (err, result) => {
            if (err) throw err;
            variantImages.push(result.secure_url);
          }
        ).end(file.buffer);
      }
    }

    // 3. Map variants with their image
    const finalVariants = parsedVariants.map((variant, idx) => ({
      ...variant,
      image: variantImages[idx],
    }));

    const product = new Product({
      name,
      description,
      brand,
      basePrice,
      baseStock,
      isActive,
      primaryCategory,
      secondaryCategory,
      tertiaryCategory,
      fragrance,
      specifications,
      careAndMaintenance,
      warranty,
      qna: parsedQna,
      variants: finalVariants,
      images,
    });

    await product.save();

    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    console.error("Product Create Error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};
