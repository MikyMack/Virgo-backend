const { protect, adminOnly } = require("../middleware/authMiddleware");
// const { getUser } = require('../controllers/authController');

router.get("/profile", protect, async (req, res) => {
  res.json(req.user);
});

router.get("/admin-data", protect, adminOnly, async (req, res) => {
  res.json({ message: "Admin-only content" });
});

// router.get('/user-profile', protect , getUser);
