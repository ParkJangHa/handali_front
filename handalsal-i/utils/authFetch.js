import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";

export async function authFetch(url, options = {}, navigation) {
  const token = await AsyncStorage.getItem("authToken");

  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status !== 401) return res;

  const refreshToken = await AsyncStorage.getItem("refreshToken");
  if (!refreshToken) {
    await clearTokens(navigation);
    return res;
  }

  try {
    const refreshRes = await fetch(`${API_BASE_URL}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!refreshRes.ok) {
      await clearTokens(navigation);
      return res;
    }

    const { accessToken, refreshToken: newRefreshToken } = await refreshRes.json();
    await AsyncStorage.setItem("authToken", accessToken);
    await AsyncStorage.setItem("refreshToken", newRefreshToken);

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch {
    await clearTokens(navigation);
    return res;
  }
}

export async function clearTokens(navigation) {
  await AsyncStorage.multiRemove(["authToken", "refreshToken"]);
  if (navigation) navigation.navigate("Login");
}
