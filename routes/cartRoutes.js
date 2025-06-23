const express = require("express");
const router = express.Router();
const { addToCart, getCart, removeCartItem, clearCart } = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

// Add or update item
router.post("/add", protect, addToCart);

// Get all items for logged-in user
router.get("/", protect, getCart);

// Remove one item by cart item ID
router.delete("/:id", protect, removeCartItem);

// Clear entire cart for user
router.delete("/", protect, clearCart);

module.exports = router;
