import LaundryService from "../models/laundryService.js";
import AppError from "../utils/AppError.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { deleteFromCloudinary } from "../utils/deleteFromCloudinary.js";

const STARTER_SERVICES = [
  {
    name: "Duvet",
    description: "Fresh, careful cleaning for duvets and comforters.",
    category: "Bedding",
    pricingType: "per_item",
    unit: "item",
    price: 5000,
    image: {
      url: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=900&q=85",
      publicId: "external:duvet",
    },
  },
  {
    name: "Shirt",
    description: "Everyday shirts, washed and neatly finished.",
    category: "Wash & Fold",
    pricingType: "per_item",
    unit: "item",
    price: 2000,
    image: {
      url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85",
      publicId: "external:shirt",
    },
  },
  {
    name: "Wedding Gown",
    description: "Delicate cleaning for wedding gowns and formal dresses.",
    category: "Dry Clean",
    pricingType: "per_item",
    unit: "item",
    price: 10000,
    image: {
      url: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=85",
      publicId: "external:wedding-gown",
    },
  },
  {
    name: "Suit",
    description: "Professional cleaning and pressing for suits.",
    category: "Dry Clean",
    pricingType: "per_item",
    unit: "item",
    price: 15000,
    image: {
      url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=85",
      publicId: "external:suit",
    },
  },
  {
    name: "Complete Agbada",
    description: "Careful cleaning and pressing for a complete Agbada set.",
    category: "Traditional Wear",
    pricingType: "per_item",
    unit: "item",
    price: 20000,
    image: {
      url: "https://images.unsplash.com/photo-1598032895397-b9472444bf93?auto=format&fit=crop&w=900&q=85",
      publicId: "external:complete-agbada",
    },
  },
  {
    name: "Jeans",
    description: "Denim jeans washed and finished with care.",
    category: "Wash & Fold",
    pricingType: "per_item",
    unit: "item",
    price: 5000,
    image: {
      url: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=85",
      publicId: "external:jeans",
    },
  },
  {
    name: "Bedsheet",
    description: "Fresh washing and folding for bedsheets.",
    category: "Bedding",
    pricingType: "per_item",
    unit: "item",
    price: 5000,
    image: {
      url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=85",
      publicId: "external:bedsheet",
    },
  },
  {
    name: "School Bag",
    description: "Cleaning for everyday school and travel bags.",
    category: "Bags",
    pricingType: "per_item",
    unit: "item",
    price: 5000,
    image: {
      url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85",
      publicId: "external:school-bag",
    },
  },
  {
    name: "Blanket",
    description: "Deep cleaning for blankets and throws.",
    category: "Bedding",
    pricingType: "per_item",
    unit: "item",
    price: 5000,
    image: {
      url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85",
      publicId: "external:blanket",
    },
  },
  {
    name: "Towel",
    description: "Fresh washing for bath and hand towels.",
    category: "Wash & Fold",
    pricingType: "per_item",
    unit: "item",
    price: 2000,
    image: {
      url: "https://images.unsplash.com/photo-1600369671236-e74521d4b6ad?auto=format&fit=crop&w=900&q=85",
      publicId: "external:towel",
    },
  },
  {
    name: "Curtains",
    description: "Cleaning for one curtain panel.",
    category: "Household",
    pricingType: "per_item",
    unit: "item",
    price: 3000,
    image: {
      url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85",
      publicId: "external:curtains",
    },
  },
].map((service) => ({ ...service, isActive: true }));

export const createService = async (req, res, next) => {
  let uploadedImage;
  try {
    const { name, description, category, pricingType, unit, price } = req.body;

    if (!name || !category || !pricingType || !unit || price === undefined) {
      return next(
        new AppError(
          "Name, category, pricing type, unit and price are required",
          400,
        ),
      );
    }
    if (!req.file) {
      return next(new AppError("Service image is required", 400));
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return next(new AppError("Price must be a valid positive number", 400));
    }

    if (pricingType === "per_item" && unit !== "item") {
      return next(
        new AppError("Per-item services must use item as their unit", 400),
      );
    }

    if (pricingType === "per_kg" && unit !== "kg") {
      return next(
        new AppError("Per-kg services must use kg as their unit", 400),
      );
    }
    uploadedImage = await uploadToCloudinary(req.file.buffer);

    const service = await LaundryService.create({
      name,
      description,
      category,
      pricingType,
      unit,
      price: numericPrice,
      image: {
        url: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
      },
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Laundry service created successfully",
      service,
    });
  } catch (error) {
    if (uploadedImage?.public_id) {
      try {
        await deleteFromCloudinary(uploadedImage.public_id);
      } catch (cleanupError) {
        console.error(
          "New Cloudinary image could not be deleted:",
          cleanupError,
        );
      }
    }
    next(error);
  }
};

export const addStarterServices = async (req, res, next) => {
  try {
    const result = await LaundryService.bulkWrite(
      STARTER_SERVICES.map((service) => ({
        updateOne: {
          filter: { name: service.name },
          update: { $setOnInsert: service },
          upsert: true,
        },
      })),
    );
    const names = STARTER_SERVICES.map((service) => service.name);
    const services = await LaundryService.find({ name: { $in: names } }).sort({
      category: 1,
      name: 1,
    });

    res.status(200).json({
      success: true,
      count: result.upsertedCount,
      message:
        result.upsertedCount > 0
          ? `${result.upsertedCount} starter services added`
          : "Starter services already exist",
      services,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllServices = async (req, res, next) => {
  try {
    const services = await LaundryService.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    next(error);
  }
};

export const getActiveServices = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    const services = await LaundryService.find(filter).sort({
      category: 1,
      name: 1,
    });

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    next(error);
  }
};

export const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await LaundryService.findOne({
      _id: id,
      isActive: true,
    });

    if (!service) {
      return next(new AppError("Service not found", 404));
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req, res, next) => {
  let uploadedImage;
  let oldPublicId;
  try {
    const { id } = req.params;
    const service = await LaundryService.findById(id);

    if (!service) {
      return next(new AppError("Service not found", 404));
    }

    const { name, description, category, pricingType, unit, price, isActive } =
      req.body;

    if (price !== undefined) {
      const numericPrice = Number(price);

      if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        return next(new AppError("Price must be a valid positive number", 400));
      }

      service.price = numericPrice;
    }

    if (name !== undefined) service.name = name;
    if (description !== undefined) service.description = description;
    if (category !== undefined) service.category = category;
    if (pricingType !== undefined) service.pricingType = pricingType;
    if (unit !== undefined) service.unit = unit;
    if (isActive !== undefined) {
      if (typeof isActive === "boolean") {
        service.isActive = isActive;
      } else if (isActive === "true" || isActive === "false") {
        service.isActive = isActive === "true";
      } else {
        return next(new AppError("isActive must be true or false", 400));
      }
    }

    if (service.pricingType === "per_item" && service.unit !== "item") {
      return next(
        new AppError("Per-item services must use item as their unit", 400),
      );
    }

    if (service.pricingType === "per_kg" && service.unit !== "kg") {
      return next(
        new AppError("Per-kg services must use kg as their unit", 400),
      );
    }
    if (req.file) {
      oldPublicId = service.image?.publicId;
      uploadedImage = await uploadToCloudinary(req.file.buffer);

      service.image = {
        url: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
      };
    }

    await service.save();

    res.status(200).json({
      success: true,
      message: "Laundry service updated successfully",
      service,
    });
  } catch (error) {
    if (uploadedImage?.public_id) {
      try {
        await deleteFromCloudinary(uploadedImage.public_id);
      } catch (cleanupError) {
        console.error(
          "New Cloudinary image could not be deleted:",
          cleanupError,
        );
      }
    }
    next(error);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const service = await LaundryService.findById(req.params.id);

    if (!service) {
      return next(new AppError("Laundry service not found", 404));
    }
    const publicId = service.image?.publicId;
    await service.deleteOne();

    if (publicId) {
      try {
        await deleteFromCloudinary(publicId);
      } catch (deleteError) {
        console.error("Cloudinary image could not be deleted:", deleteError);
      }
    }

    res.status(200).json({
      success: true,
      message: "Laundry service deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const toggleServiceStatus = async (req, res, next) => {
  try {
    const service = await LaundryService.findById(req.params.id);

    if (!service) {
      return next(new AppError("Service not found", 404));
    }

    service.isActive = !service.isActive;
    await service.save();

    res.status(200).json({
      success: true,
      message: service.isActive ? "Service activated" : "Service deactivated",
      service,
    });
  } catch (error) {
    next(error);
  }
};
