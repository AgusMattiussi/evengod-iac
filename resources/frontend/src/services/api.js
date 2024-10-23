import axios from "axios";

// Create the Axios instance with a base URL and timeout
const api = axios.create({
  baseURL: "https://nkjxiwcntf.execute-api.us-east-1.amazonaws.com/prod",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const getAuthHeaders = () => {
  const token = localStorage.getItem("idToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiGet = (endpoint, params = {}) => {
  const headers = getAuthHeaders();
  return api.get(endpoint, { params, headers });
};

export const apiPost = (endpoint, data = {}, config = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...config.headers,
  };
  return api.post(endpoint, data, { ...config, headers });
};

export const apiPut = (endpoint, data = {}, config = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...config.headers,
  };
  return api.put(endpoint, data, { ...config, headers });
};

export const apiDelete = (endpoint, config = {}) => {
  return api.delete(endpoint, config);
};

export const apiPatch = (endpoint, data = {}, config = {}) => {
  return api.patch(endpoint, data, config);
};

export const apiUpload = (endpoint, file, additionalData = {}) => {
  const formData = new FormData();
  formData.append("file", file);
  // Attach any additional data (e.g., userId, etc.)
  Object.keys(additionalData).forEach((key) => {
    formData.append(key, additionalData[key]);
  });

  return api.post(endpoint, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...getAuthHeaders(),
    },
  });
};

// Simplified error handling for the API requests
export const handleError = (error) => {
  if (error.response) {
    console.error("API Error:", error.response.data);
    alert(`Error: ${error.response.data.message || "Something went wrong!"}`);
  } else if (error.request) {
    console.error("No response from server:", error.request);
    alert("Error: No response from server. Please check your connection.");
  } else {
    console.error("Error:", error.message);
    alert(`Error: ${error.message}`);
  }
  return Promise.reject(error);
};
