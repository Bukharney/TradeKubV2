import axiosClient from "./axiosClient";

export const login = async (username, password) => {
  try {
    const response = await axiosClient.post(
      "/login",
      {
        username: username,
        password: password,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const get_news = async () => {
  try {
    const response = await axiosClient.get("/news");
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
