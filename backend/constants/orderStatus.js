export const ORDER_STATUS = {
  PENDING: "pending",
  PICKUP_ASSIGNED: "pickup_assigned",
  PICKED_UP: "picked_up",
  PROCESSING: "processing",
  READY_FOR_DELIVERY: "ready_for_delivery",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const ORDER_STATUSES = Object.values(ORDER_STATUS);
