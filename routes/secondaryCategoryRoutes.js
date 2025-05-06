const express = require("express");
const router = express.Router();
const {
  createSecondaryCategory,
  getSecondaryCategories,
  updateSecondaryCategory,
  deleteSecondaryCategory,
} = require("../controllers/secondaryCategoryController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, adminOnly, createSecondaryCategory);
router.get("/", getSecondaryCategories);
router.put("/:id", protect, adminOnly, updateSecondaryCategory);
router.delete("/:id", protect, adminOnly, deleteSecondaryCategory);

module.exports = router;
