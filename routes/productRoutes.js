const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const {
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getAllProducts,
  getProductById,
} = require("../controllers/productController");

// Create product (2–4 main images + variant images)
router.post(
  "/create",
  upload.fields([
    { name: "images", maxCount: 4 },
    { name: "variantImages", maxCount: 10 },
  ]),
  createProduct
);

// Update product (with optional new images)
router.put(
  "/update/:id",
  upload.fields([
    { name: "images", maxCount: 4 },
    { name: "variantImages", maxCount: 10 },
  ]),
  updateProduct
);

// Delete product
router.delete("/delete/:id", deleteProduct);

// Toggle product active/inactive
router.patch("/toggle/:id", toggleProductStatus);

// Optional: Get all products
router.get("/", getAllProducts);

// Optional: Get single product
router.get("/:id", getProductById);

module.exports = router;
