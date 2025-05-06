const express = require("express");
const router = express.Router();
const {
  createTertiaryCategory,
  getTertiaryCategories,
  updateTertiaryCategory,
  deleteTertiaryCategory,
} = require("../controllers/tertiaryCategoryController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, adminOnly, createTertiaryCategory);
router.get("/", getTertiaryCategories);
router.put("/:id", protect, adminOnly, updateTertiaryCategory);
router.delete("/:id", protect, adminOnly, deleteTertiaryCategory);

module.exports = router;
