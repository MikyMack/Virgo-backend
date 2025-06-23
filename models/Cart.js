const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variant: {
    color: String,
    size: String,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartItemSchema);
