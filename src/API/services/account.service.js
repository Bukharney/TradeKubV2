import axiosClient from "../axiosClient";

export const getAllUsers = async () => {
  try {
    const response = await axiosClient.get("/users/");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

export const getAllAccounts = async () => {
  try {
    const response = await axiosClient.get("/account/all");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

export const getAccountById = async (id) => {
  try {
    const response = await axiosClient.get(`/account/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

export const getAllBrokers = async () => {
  try {
    const response = await axiosClient.get("/broker/");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

export const getBankTransactions = async () => {
  try {
    const response = await axiosClient.get("/bank_tsc/");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

const accountService = {
  getAllUsers,
  getAllAccounts,
  getAccountById,
  getAllBrokers,
  getBankTransactions,
};

export default accountService;
