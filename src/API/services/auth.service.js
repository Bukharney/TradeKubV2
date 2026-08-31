import axiosClient, { setStoredToken } from "../axiosClient";

export const handleLogin = async (data) => {
  try {
    const response = await axiosClient.post("/login", data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    if (response.data && response.data.access_token) {
      setStoredToken(response.data.access_token);
      return { success: true, data: response.data };
    }
    return { success: false, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

export const registerUser = async (data) => {
  try {
    const response = await axiosClient.post("/users/", data);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

export const getLoginInfoAll = async () => {
  try {
    const response = await axiosClient.get("/users/login_info/all");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

const authService = {
  handleLogin,
  registerUser,
  getLoginInfoAll,
};

export default authService;
