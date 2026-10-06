import Notification from "../models/notification.js";
import AppError from "../utils/AppError.js";

export const getMyNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;

    const filter = {
      user: req.user._id,
    };

    if (unreadOnly === "true") {
      filter.isRead = false;
    }

    const pageNumber = Math.max(Number(page), 1);

    const limitNumber = Math.min(Math.max(Number(limit), 1), 100);

    const skip = (pageNumber - 1) * limitNumber;

    const [notifications, totalNotifications, unreadCount] = await Promise.all([
      Notification.find(filter)
        .populate("order", "status totalAmount paymentStatus")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),

      Notification.countDocuments(filter),

      Notification.countDocuments({
        user: req.user._id,
        isRead: false,
      }),
    ]);

    res.status(200).json({
      success: true,

      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalNotifications,
        totalPages: Math.ceil(totalNotifications / limitNumber),
      },

      unreadCount,

      notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadNotificationCount = async (req, res, next) => {
  try {
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};
export const markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!notification) {
      return next(new AppError("Notification not found", 404));
    }

    notification.isRead = true;

    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      {
        user: req.user._id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      },
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};
