const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true, trim: true, index: true },
    model: { type: String, required: true, trim: true },
    year:  { type: Number, required: true, min: 1900, max: 2100, index: true },
    price: { type: Number, required: true, min: 0 },
    vin:   { type: String, unique: true, sparse: true, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Car', carSchema);
