// utils/api.js
export const fetchWithAuth = async (url, options = {}, getToken) => {
  const token = await getToken();

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
};
