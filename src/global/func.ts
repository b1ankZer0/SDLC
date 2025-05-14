import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000/api";
if (!BASE_URL) {
  throw new Error("BASE_URL is not defined in environment variables");
}

export async function callApi(url: string, method: string, body?: any) {
  try {
    const mainUrl = BASE_URL + url;
    console.log(import.meta.url + " : ", mainUrl);
    const res = await axios({
      url: mainUrl,
      method,
      data: body,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    if (res.status === 200 || !res.data.error) {
      return res.data;
    } else {
      throw new Error(`API call failed with status ${res.status}`);
    }
  } catch (error) {
    console.error("API call error:", error);
    throw new Error("Failed to call API");
  }
}
