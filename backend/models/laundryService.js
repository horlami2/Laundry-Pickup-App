import mongoose from "mongoose";

const laundryServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
      unique: true,
      maxlength: [100, "Service name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    category: {
      type: String,
      required: [true, "Service category is required"],
      trim: true,
    },

    pricingType: {
      type: String,
      enum: ["per_item", "per_kg"],
      required: true,
    },

    unit: {
      type: String,
      enum: ["item", "kg"],
      required: true,
    },

    price: {
      type: Number,
      required: [true, "Service price is required"],
      min: [0, "Price cannot be negative"],
    },
    
    image: {
      url: {
        type: String,
        required: true,
      },

      publicId: {
        type: String,
        required: true,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

laundryServiceSchema.index({ isActive: 1, category: 1 });

const LaundryService = mongoose.model("LaundryService", laundryServiceSchema);

export default LaundryService;
