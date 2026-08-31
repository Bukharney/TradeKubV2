import axiosClient from "../axiosClient";

export const getNews = async () => {
  try {
    const response = await axiosClient.get("/news/");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

const newsService = {
  getNews,
};

export default newsService;

