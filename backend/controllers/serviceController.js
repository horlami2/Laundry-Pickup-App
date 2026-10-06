import LaundryService from "../models/laundryService.js";
import AppError from "../utils/AppError.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { deleteFromCloudinary } from "../utils/deleteFromCloudinary.js";

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
        console.error("New Cloudinary image could not be deleted:", cleanupError);
      }
    }
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
        console.error("New Cloudinary image could not be deleted:", cleanupError);
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
