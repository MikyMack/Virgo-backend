const mongoose = require("mongoose");

const tertiaryCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  secondaryCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SecondaryCategory",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("TertiaryCategory", tertiaryCategorySchema);
