// backend/controllers/productController.js
const Product = require("../models/productModel");
const cloudinary = require("../utils/cloudinary");
const { promisify } = require('util');

// Upload to Cloudinary helper function
const cloudinaryUpload = async (file, options = {}) => {
  try {
    const b64 = Buffer.from(file.buffer).toString("base64");
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, options);
    return result;
  } catch (error) {
    throw new Error("Cloudinary upload failed: " + error.message);
  }
};


// Create Product Controller
exports.createProduct = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.name || !req.body.basePrice || !req.body.primaryCategory) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Parse incoming data
    const {
      name,
      description,
      brand,
      basePrice,
      baseStock,
      isActive = true,
      primaryCategory,
      secondaryCategory,
      tertiaryCategory,
      fragrance,
      specifications,
      careAndMaintenance,
      warranty,
      qna = '[]',
      variants = '[]',
    } = req.body;

    // Parse JSON strings safely
    let parsedVariants, parsedQna;
    try {
      parsedVariants = JSON.parse(variants);
      parsedQna = JSON.parse(qna);
    } catch (parseError) {
      return res.status(400).json({ message: "Invalid JSON in variants or Q&A" });
    }

    // Upload main images
    const images = [];
    if (req.files?.images) {
      for (const file of req.files.images) {
        try {
          // Upload from buffer since we're using memoryStorage
          const result = await cloudinaryUpload(file, { folder: 'products' });

          images.push(result.secure_url);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          return res.status(500).json({ message: "Failed to upload product images" });
        }
      }
    }

    // Upload variant images
    const variantImages = [];
    if (req.files?.variantImages) {
      for (const file of req.files.variantImages) {
        try {
          // Upload from buffer
          const result = await cloudinaryUpload(file, { folder: 'products/variants' });

          variantImages.push(result.secure_url);
        } catch (uploadError) {
          console.error('Variant image upload failed:', uploadError);
          return res.status(500).json({ message: "Failed to upload variant images" });
        }
      }
    }

    // Validate variant images match variants
    if (parsedVariants.length > 0 && parsedVariants.length !== variantImages.length) {
      return res.status(400).json({ 
        message: "Variant images count doesn't match variants count",
        variantsCount: parsedVariants.length,
        imagesCount: variantImages.length
      });
    }

    // Prepare final variants
    const finalVariants = parsedVariants.map((variant, idx) => ({
      ...variant,
      image: variantImages[idx] || null,
      price: variant.price || basePrice,
      stock: variant.stock || baseStock,
    }));

    // Create product
    const product = await Product.create({
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

    res.status(201).json({ 
      success: true,
      message: "Product created successfully",
      product 
    });

  } catch (error) {
    console.error("Product creation error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// Get all products Controller
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("primaryCategory secondaryCategory tertiaryCategory") 
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
    const product = await Product.findById(req.params.id)
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
    if (!req.params.id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

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
      variants,
    } = req.body;

    if (!name || !basePrice || !primaryCategory) {
      return res.status(400).json({
        success: false,
        message: "Name, base price and primary category are required",
      });
    }

    let parsedVariants = [];
    let parsedQna = [];
    try {
      parsedVariants = variants ? JSON.parse(variants) : [];
      parsedQna = qna ? JSON.parse(qna) : [];
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format for variants or qna",
      });
    }

    // Fetch existing product
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // === Upload images ===
    let images = existingProduct.images || [];
    let variantImages = [];

    try {
      if (req.files?.images?.length > 0) {
        images = await Promise.all(
          req.files.images.map((file) => cloudinaryUpload(file, { folder: 'products' }))
        ).then((results) => results.map((r) => r.secure_url));
      }

      if (req.files?.variantImages?.length > 0) {
        variantImages = await Promise.all(
          req.files.variantImages.map((file) =>
            cloudinaryUpload(file, { folder: 'products/variants' })
          )
        ).then((results) => results.map((r) => r.secure_url));
      }
    } catch (uploadError) {
      console.error("Image upload failed:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Error uploading images",
        error: process.env.NODE_ENV === "development" ? uploadError.message : undefined,
      });
    }

    // === Robust variant matching ===
    // Build existing variant map by "color-size"
    const existingVariantMap = {};
    (existingProduct.variants || []).forEach((v) => {
      const key = `${v.color || ''}-${v.size || ''}`;
      existingVariantMap[key] = v;
    });

    // Build final variants with fallback
    const finalVariants = parsedVariants.map((variant, idx) => {
      const key = `${variant.color || ''}-${variant.size || ''}`;
      const existing = existingVariantMap[key];

      let image = null;

      // Priority: uploaded new image
      if (variantImages[idx]) {
        image = variantImages[idx];
      }
      // Next: image sent directly in request variant
      else if (variant.image) {
        image = variant.image;
      }
      // Next: fallback to existing stored variant
      else if (existing) {
        image = existing.image;
      }

      if (!image) {
        throw new Error(`Image is required for variant with key: ${key}`);
      }

      return {
        ...variant,
        price: variant.price || basePrice,
        stock: variant.stock || baseStock,
        image,
      };
    });

    // === Prepare product data ===
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

    if (secondaryCategory) productData.secondaryCategory = secondaryCategory;
    if (tertiaryCategory) productData.tertiaryCategory = tertiaryCategory;

    // === Update the product ===
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    ).populate("primaryCategory secondaryCategory tertiaryCategory");

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });

  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


// Delete Product Controller
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

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
    const product = await Product.findById(req.params.id);

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
