const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  color: { type: String },
  size: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  image: { type: String, required: false },
}, { _id: false });

const qnaSchema = new mongoose.Schema({
  question: String,
  answer: String,
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  brand: String,
  basePrice: { type: Number, required: true },
  baseStock: { type: Number },

  isActive: { type: Boolean, default: true },

  primaryCategory: { type: mongoose.Schema.Types.ObjectId, ref: "PrimaryCategory", required: true },
  secondaryCategory: { type: mongoose.Schema.Types.ObjectId, ref: "SecondaryCategory", required: false },
  tertiaryCategory: { type: mongoose.Schema.Types.ObjectId, ref: "TertiaryCategory", required: false },

  fragrance: String,
  specifications: String,
  careAndMaintenance: String,
  warranty: String,
  qna: [qnaSchema],

  images: [String],
  variants: [variantSchema],
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
