const mongoose = require("mongoose");

const secondaryCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  primaryCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PrimaryCategory",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("SecondaryCategory", secondaryCategorySchema);
