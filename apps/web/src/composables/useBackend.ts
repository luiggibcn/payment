import axios from "axios";

export const useBack = () => {
  const getHealth = async () => {
    try {
      const { data } = await axios.get<{ status: string; timestamp: string }>(
        "/api/health",
        {
          headers: { "X-PAYMENT": "id", "X-DATA": new Date().toDateString() },
        },
      );
      return data;
    } catch {
    } finally {
    }
  };

  return {
    getHealth,
  };
};
