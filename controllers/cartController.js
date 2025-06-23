const Cart = require("../models/Cart");
const Product = require("../models/productModel");

// Add or update item in cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, variant, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: "Product ID and quantity are required." });
    }

    // Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Check if item with same product & variant exists
    const existingItem = await Cart.findOne({
      user: userId,
      product: productId,
      "variant.color": variant?.color || null,
      "variant.size": variant?.size || null,
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
    } else {

      await Cart.create({
        user: userId,
        product: productId,
        variant,
        quantity,
      });
    }

    res.json({ success: true, message: "Cart updated successfully." });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Get all cart items for user
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cartItems = await Cart.find({ user: userId }).populate("product");

    res.json({ success: true, cart: cartItems });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Remove single cart item by cart item ID
exports.removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItemId = req.params.id;

    const deletedItem = await Cart.findOneAndDelete({
      _id: cartItemId,
      user: userId,
    });

    if (!deletedItem) {
      return res.status(404).json({ success: false, message: "Cart item not found." });
    }

    res.json({ success: true, message: "Cart item removed successfully." });
  } catch (error) {
    console.error("Remove cart item error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Clear entire cart for user
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await Cart.deleteMany({ user: userId });

    res.json({ success: true, message: "All cart items cleared." });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
