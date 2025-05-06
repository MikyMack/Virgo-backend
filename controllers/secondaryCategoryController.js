const SecondaryCategory = require("../models/secondaryCategoryModel");

exports.createSecondaryCategory = async (req, res) => {
  try {
    const { name, description, isActive, primaryCategory } = req.body;

    const category = await SecondaryCategory.create({ name, description, isActive, primaryCategory });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSecondaryCategories = async (req, res) => {
  try {
    const categories = await SecondaryCategory.find().populate("primaryCategory");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSecondaryCategory = async (req, res) => {
  try {
    const { name, description, isActive, primaryCategory } = req.body;
    const updated = await SecondaryCategory.findByIdAndUpdate(
      req.params.id,
      { name, description, isActive, primaryCategory },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSecondaryCategory = async (req, res) => {
  try {
    await SecondaryCategory.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
