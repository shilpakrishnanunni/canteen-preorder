import api from "./client.js";

// Orders
export const getStaffOrders = async ({ startDate, endDate } = {}) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await api.get("/staff/orders", { params });
  return response.data;
};

export const updateOrderStatus = async ({ orderToken, status }) => {
  const response = await api.patch("/staff/orderStatus", { orderToken, status });
  return response.data;
};

// Menu management. These calls all use the shared client, so the Bearer token
// is attached automatically to every /staff/** request.
export const getStaffMenuItems = async () => {
  const response = await api.get("/staff/menu");
  return response.data;
};

export const addMenuItem = async ({ categoryId, name, description, price, imageUrl = null }) => {
  const response = await api.post("/staff/addMenuItem", {
    categoryId,
    name,
    description,
    price,
    imageUrl,
  });
  return response.data;
};

export const deleteMenuItem = async (menuItemId) => {
  const response = await api.delete(`/staff/deleteMenuItem/${encodeURIComponent(menuItemId)}`);
  return response.data;
};

export const updateMenuItem = async ({ menuItemId, name, description, price, imageUrl = null, available }) => {
  const response = await api.put("/staff/updateMenuItem", {
    menuItemId,
    name,
    description,
    price,
    imageUrl,
    available,
  });
  return response.data;
};
