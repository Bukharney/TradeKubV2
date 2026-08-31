import axiosClient from "../axiosClient";

export const placeOrder = async (data) => {
  try {
    const response = await axiosClient.post("/order", data);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

export const cancelOrder = async (id, pin) => {
  try {
    const payload = { id, pin: Number(pin) };
    const response = await axiosClient.post("/order/cancel", payload);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

export const searchStock = async (symbol) => {
  try {
    const response = await axiosClient.get(`/stock/search/${symbol}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

export const getOrdersByAccount = async (accountId) => {
  try {
    const response = await axiosClient.get(`/order/${accountId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

export const getAllOrders = async () => {
  try {
    const response = await axiosClient.get("/order/all");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

export const getStockTransactionsAll = async () => {
  try {
    const response = await axiosClient.get("/stock/transactions/all");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

export const getCompanyInfoAll = async () => {
  try {
    const response = await axiosClient.get("/stock/company_info/all");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

export const getTurnoverAll = async () => {
  try {
    const response = await axiosClient.get("/turnover/all");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

export const getDividendAll = async () => {
  try {
    const response = await axiosClient.get("/dividend/");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

const stockService = {
  placeOrder,
  cancelOrder,
  searchStock,
  getOrdersByAccount,
  getAllOrders,
  getStockTransactionsAll,
  getCompanyInfoAll,
  getTurnoverAll,
  getDividendAll,
};

export default stockService;

