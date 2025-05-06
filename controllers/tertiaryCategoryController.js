const TertiaryCategory = require("../models/tertiaryCategoryModel");

exports.createTertiaryCategory = async (req, res) => {
  try {
    const { name, description, isActive, secondaryCategory } = req.body;

    const category = await TertiaryCategory.create({ name, description, isActive, secondaryCategory });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTertiaryCategories = async (req, res) => {
  try {
    const categories = await TertiaryCategory.find().populate("secondaryCategory");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTertiaryCategory = async (req, res) => {
  try {
    const { name, description, isActive, secondaryCategory } = req.body;
    const updated = await TertiaryCategory.findByIdAndUpdate(
      req.params.id,
      { name, description, isActive, secondaryCategory },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTertiaryCategory = async (req, res) => {
  try {
    await TertiaryCategory.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
