
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://trivshopy.shop', 
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

app.use('/api/auth', authRoutes);
app.use("/api/primary-categories", primaryCategoryRoutes);
app.use("/api/secondary-categories", secondaryCategoryRoutes);
app.use("/api/tertiary-categories", tertiaryCategoryRoutes);
app.use("/api/products", productRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

module.exports = app;