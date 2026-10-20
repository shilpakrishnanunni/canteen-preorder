import api from "./client.js";

export const createOrder = async (items) => {
  const { data } = await api.post("/orders", {
    items: items.map((item) => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
    })),
  });
  return data;
};

export const getOrder = async (orderToken) => {
  const { data } = await api.get(`/orders/${encodeURIComponent(orderToken)}`);
  return data;
};
