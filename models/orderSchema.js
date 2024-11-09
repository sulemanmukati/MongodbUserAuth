import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a positive number'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    noodleType: {
      type: String,
      required: [true, 'Noodle Type is required'],
      enum: ['Ramen', 'Udon', 'Soba', 'Rice Noodles', 'Egg Noodles'], // Example noodle types
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create a model from the schema
const Order = mongoose.model('Order', orderSchema);

export default Order;
