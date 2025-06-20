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
  getProductsByType,
  getShopProducts
} = require("../controllers/productController");

router.post(
  "/create",
  upload.fields([
    { name: "images", maxCount: 4 },
    { name: "variantImages", maxCount: 10 },
  ]),
  createProduct
);

router.put(
  "/update/:id",
  upload.fields([
    { name: "images", maxCount: 4 },
    { name: "variantImages", maxCount: 10 },
  ]),
  updateProduct
);

router.delete("/delete/:id", deleteProduct);

router.patch("/toggle/:id", toggleProductStatus);

router.get("/", getAllProducts);

router.get("/shopProducts", getShopProducts);

router.get('/AllProducts', getProductsByType);

router.get("/:id", getProductById);

module.exports = router;
