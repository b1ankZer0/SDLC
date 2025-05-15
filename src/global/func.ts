import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000/api";
if (!BASE_URL) {
  throw new Error("BASE_URL is not defined in environment variables");
}

type ApiResponse = {
  error: boolean;
  message: string;
  data: any;
};

export async function callApi(
  url: string,
  method: string,
  body?: any
): Promise<ApiResponse> {
  try {
    const mainUrl = BASE_URL + url;

    // Determine headers
    const headers: Record<string, string> = {
      Accept: "application/json",
      ["Content-Type"]: "application/json",
    };

    const res = await axios({
      url: mainUrl,
      method,
      data: body,
      headers,
      withCredentials: true, // in case you're using cookies
    });

    if (res.status === 200 || !res.data.error) {
      return res.data;
    } else {
      throw new Error(`API call failed with status ${res.status}`);
    }
  } catch (error: any) {
    console.error("API call error:", error);
    return {
      error: true,
      message: error?.response?.data?.message || "Failed to call API",
      data: null,
    };
  }
}

export async function callApiForm(
  url: string,
  method: string,
  body?: any
): Promise<ApiResponse> {
  try {
    const mainUrl = BASE_URL + url;

    // Determine headers
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    // Only set Content-Type for non-FormData payloads
    if (!(body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const res = await axios({
      url: mainUrl,
      method,
      data: body instanceof FormData ? body : JSON.stringify(body),
      headers,
      withCredentials: true, // in case you're using cookies
    });

    if (res.status === 200 || !res.data.error) {
      return res.data;
    } else {
      throw new Error(`API call failed with status ${res.status}`);
    }
  } catch (error: any) {
    console.error("API call error:", error);
    return {
      error: true,
      message: error?.response?.data?.message || "Failed to call API",
      data: null,
    };
  }
}
