// backend/controllers/productController.js
const Product = require("../models/productModel");
const cloudinary = require("../utils/cloudinary");

// Upload to Cloudinary helper function
const uploadToCloudinary = async (fileBuffer) => {
  return await cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
    if (error) throw error;
    return result;
  });
};

// Create Product Controller
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

    // Prepare product data
    const productData = {
      name,
      description,
      brand,
      basePrice,
      baseStock,
      isActive,
      primaryCategory,
      fragrance,
      specifications,
      careAndMaintenance,
      warranty,
      qna: parsedQna,
      variants: finalVariants,
      images,
    };

    // Add secondary and tertiary categories if provided
    if (secondaryCategory) productData.secondaryCategory = secondaryCategory;
    if (tertiaryCategory) productData.tertiaryCategory = tertiaryCategory;

    const product = new Product(productData);
    await product.save();

    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    console.error("Product Create Error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Get all products Controller
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("primaryCategory secondaryCategory tertiaryCategory") // Populate category details
      .sort({ createdAt: -1 });
    res.status(200).json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Get a specific product Controller
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)
      .populate("primaryCategory secondaryCategory tertiaryCategory"); // Populate category details

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Update Product Controller
exports.updateProduct = async (req, res) => {
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

    // 1. Upload main product images if present
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

    // 2. Upload variant images if present
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

    // Prepare product update data
    const productData = {
      name,
      description,
      brand,
      basePrice,
      baseStock,
      isActive,
      primaryCategory,
      fragrance,
      specifications,
      careAndMaintenance,
      warranty,
      qna: parsedQna,
      variants: finalVariants,
      images,
    };

    // Add secondary and tertiary categories if provided
    if (secondaryCategory) productData.secondaryCategory = secondaryCategory;
    if (tertiaryCategory) productData.tertiaryCategory = tertiaryCategory;

    // Update the product in the database
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.productId,
      productData,
      { new: true, runValidators: true }
    ).populate("primaryCategory secondaryCategory tertiaryCategory");

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product updated", updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Delete Product Controller
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Toggle Product Active/Inactive Status Controller
exports.toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Toggle the isActive status
    product.isActive = !product.isActive;
    await product.save();

    res.status(200).json({ message: `Product is now ${product.isActive ? 'active' : 'inactive'}`, product });
  } catch (error) {
    console.error("Error toggling product status:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};
