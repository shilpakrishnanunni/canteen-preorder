import api from "./client";

export const getCategories = async () => {
  const response = await api.get("/menu/categories");
  return response.data;
};

export const getMenuItems = async (categorySlug) => {
  const params = categorySlug
    ? { categorySlug }
    : {};

  const response = await api.get("/menu", { params });
  return response.data;
};