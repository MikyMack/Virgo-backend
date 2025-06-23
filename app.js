
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const app = express();

// Middleware
const allowedOrigins = ['http://localhost:5173', 'https://trivshopy.shop'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());

// Routes
const authRoutes = require('./routes/authRoutes');
const primaryCategoryRoutes = require("./routes/primaryCategoryRoutes");
const secondaryCategoryRoutes = require("./routes/secondaryCategoryRoutes");
const tertiaryCategoryRoutes = require("./routes/tertiaryCategoryRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");


app.use('/api/auth', authRoutes);
app.use("/api/primary-categories", primaryCategoryRoutes);
app.use("/api/secondary-categories", secondaryCategoryRoutes);
app.use("/api/tertiary-categories", tertiaryCategoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);




// Test Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

module.exports = app;