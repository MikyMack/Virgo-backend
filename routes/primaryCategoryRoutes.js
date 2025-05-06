const express = require("express");
const router = express.Router();
const {
  createPrimaryCategory,
  getPrimaryCategories,
  updatePrimaryCategory,
  deletePrimaryCategory,
} = require("../controllers/primaryCategoryController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, adminOnly, createPrimaryCategory);
router.get("/", getPrimaryCategories);
router.put("/:id", protect, adminOnly, updatePrimaryCategory);
router.delete("/:id", protect, adminOnly, deletePrimaryCategory);

module.exports = router;
