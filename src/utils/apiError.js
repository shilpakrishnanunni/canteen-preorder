export const getApiErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object") {
    const message = data.message || data.error || data.detail || data.title;
    if (typeof message === "string" && message.trim()) return message;
  }

  if (error?.code === "ECONNABORTED") {
    return "The request took too long. Check your connection and try again.";
  }
  if (error?.response?.status === 401) return "Your session may have expired. Please sign in again.";
  if (error?.response?.status === 403) return "You don't have permission to perform this action.";
  if (error?.response?.status >= 500) return "The canteen service is temporarily unavailable. Please try again shortly.";
  if (error?.request && !error?.response) {
    return "We couldn't reach the canteen service. Check your connection and try again.";
  }
  return fallback;
};
