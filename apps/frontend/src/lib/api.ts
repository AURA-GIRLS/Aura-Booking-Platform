import { api } from "../config/api";

export async function getMyFeedback(bookingId: string) {
  try {
    const res = await api.get(`/feedback/mine`, { params: { bookingId } });
    return res.data;
  } catch (err: any) {
    throw err?.response?.data ?? { code: "network_error", message: "Network error" };
  }
}

export async function createFeedback(payload: { bookingId: string; rating: number; comment?: string }) {
  try {
    const res = await api.post(`/feedback`, payload);
    return res.data;
  } catch (err: any) {
    throw err?.response?.data ?? { code: "network_error", message: "Network error" };
  }
}

export async function updateFeedback(id: string, patch: { rating?: number; comment?: string }) {
  try {
    const res = await api.patch(`/feedback/${id}`, patch);
    return res.data;
  } catch (err: any) {
    throw err?.response?.data ?? { code: "network_error", message: "Network error" };
  }
}

export async function deleteFeedback(id: string) {
  try {
    const res = await api.delete(`/feedback/${id}`);
    return res.data;
  } catch (err: any) {
    throw err?.response?.data ?? { code: "network_error", message: "Network error" };
  }
}
