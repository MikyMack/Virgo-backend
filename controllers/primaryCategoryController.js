const PrimaryCategory = require("../models/primaryCategoryModel");

exports.createPrimaryCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const exists = await PrimaryCategory.findOne({ name });
    if (exists) return res.status(400).json({ message: "Already exists" });

    const category = await PrimaryCategory.create({ name, description, isActive });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPrimaryCategories = async (req, res) => {
  try {
    const categories = await PrimaryCategory.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePrimaryCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const updated = await PrimaryCategory.findByIdAndUpdate(
      req.params.id,
      { name, description, isActive },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePrimaryCategory = async (req, res) => {
  try {
    await PrimaryCategory.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
