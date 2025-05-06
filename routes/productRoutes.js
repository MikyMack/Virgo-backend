// backend/routes/productRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const { createProduct } = require("../controllers/productController");

// Upload 2-4 images + variant images
router.post(
  "/create",
  upload.fields([
    { name: "images", maxCount: 4 },
    { name: "variantImages", maxCount: 10 },
  ]),
  createProduct
);

module.exports = router;
