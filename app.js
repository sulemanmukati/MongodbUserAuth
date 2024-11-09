import 'dotenv/config';
import express from 'express';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import userModel from './models/UserSchema.js'
import mongoose from 'mongoose';
import multer from 'multer';
import cloudinary from 'cloudinary';
import Order from './models/orderSchema.js';
// import fs from 'fs';

const app = express();
const port = process.env.PORT || 5678;
const DBURI = process.env.MONGODB_URI;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
// const cors = require('cors');ra

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// MongoDB Connection
mongoose.connect(DBURI);

mongoose.connection.on("connected", () => {
  console.log("MongoDB Connected");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB Connection Error:", err);
});

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to the Dashboard');
});

// Set up storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Image upload route
// app.post('/upload-image', upload.single('image'), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: 'No file uploaded' });
//   }

//   try {
//     // Upload the image to Cloudinary
//     const result = await cloudinary.v2.uploader.upload(req.file.path);

//     // Create a new image record in the database with Cloudinary URL
//     // Here we can save the URL as a new record in the Image collection if you wish, or just return it
//     // For now, just sending the URL back as a response
//     res.json({
//       message: 'Image uploaded and saved successfully',
//       status: true,
//       imageUrl: result.secure_url,
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: 'Error uploading image',
//       status: false,
//       error: error.message
//     });
//   }
// });
// Order Api

app.post('/orders', async (req, res) => {
  const { title, price, quantity, noodleType } = req.body;

  // Validate required fields
  if (!title || !price || !quantity || !noodleType) {
    return res.status(400).json({ message: 'All fields are required.', status: false });
  }

  try {
    // Create and save new order
    const newOrder = new Order({ title, price, quantity, noodleType });
    const savedOrder = await newOrder.save();

    // Send successful response
    res.status(201).json({
      message: 'Order placed successfully!',
      status: true,
      data: savedOrder
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error placing order.',
      status: false,
      error: error.message
    });
  }
});


// 

// Create (Sign Up)
app.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Basic validation
  if (!firstName || !lastName || !email || !password) {
    return res.json({
      message: "Please fill all the fields",
      status: false
    });
  }

  // Email format validation
  const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  if (!emailRegex.test(email)) {
    return res.json({
      message: "Please provide a valid email address",
      status: false
    });
  }

  // Check if email already exists
  const EmailExist = await userModel.findOne({ email });
  if (EmailExist) {
    return res.json({
      message: "Email already exists",
      status: false
    });
  }

  try {
    // Hash password with bcrypt
    const hashPassword = await bcrypt.hash(password, 12);  // Reduced salt rounds for balance

    const userObj = { firstName, lastName, email, password: hashPassword };
    const userResponse = await userModel.create(userObj);

    return res.json({
      message: "User account created",
      status: true,
      data: userResponse
    });
  } catch (error) {
    return res.json({
      message: "Error creating user account",
      status: false,
      error: error.message
    });
  }
});

// Read (Get all users)
app.get('/users', async (req, res) => {
  try {
    const users = await userModel.find();
    res.json({
      message: "Users fetched successfully",
      status: true,
      data: users
    });
  } catch (error) {
    res.json({
      message: "Error fetching users",
      status: false,
      error
    });
  }
});

// Update (Update user by ID)
app.put('/user/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email } = req.body;

  if (!firstName || !lastName || !email) {
    res.json({
      message: "All fields are required",
      status: false
    });
    return;
  }

  try {
    const user = await userModel.findByIdAndUpdate(id, { firstName, lastName, email }, { new: true });
    if (!user) {
      res.json({
        message: "User not found",
        status: false
      });
      return;
    }

    res.json({
      message: "User updated successfully",
      status: true,
      data: user
    });
  } catch (error) {
    res.json({
      message: "Error updating user",
      status: false,
      error
    });
  }
});

// Delete (Remove user by ID)
app.delete('/user/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await userModel.findByIdAndDelete(id);
    if (!user) {
      res.json({
        message: "User not found",
        status: false
      });
      return;
    }

    res.json({
      message: "User deleted successfully",
      status: true
    });
  } catch (error) {
    res.json({
      message: "Error deleting user",
      status: false,
      error
    });
  }
});

// User Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.json({
      message: "Email and password are required",
      status: false
    });
    return;
  }

  const loginEmailExist = await userModel.findOne({ email });

  if (!loginEmailExist) {
    res.json({
      message: "Invalid credentials",  // Generic message for security
      status: false
    });
    return;
  }

  const comparePassword = await bcrypt.compare(password, loginEmailExist.password);

  if (!comparePassword) {
    res.json({
      message: "Invalid credentials",  // Same message as above for security
      status: false
    });
    return;
  }

  res.json({
    message: "Login successful",
    status: true
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});