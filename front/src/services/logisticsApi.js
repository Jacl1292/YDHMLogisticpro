const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("ydhm_api_token");
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `API request failed: ${response.status}`);
  }

  return response.json();
}

export const logisticsApi = {
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: ({ name, email, password, role, company }) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role, company }),
    }),
  me: () => request("/auth/me"),
  getBootstrap: () => request("/bootstrap"),
  createUser: ({ name, email, password, role, company }) =>
    request("/users", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role, company }),
    }),
  updateUser: (userId, payload) =>
    request(`/users/${encodeURIComponent(userId)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteUser: (userId) =>
    request(`/users/${encodeURIComponent(userId)}`, {
      method: "DELETE",
    }),
  createLoad: (payload) =>
    request("/loads", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateLoad: (loadId, changes) =>
    request(`/loads/${encodeURIComponent(loadId)}`, {
      method: "PATCH",
      body: JSON.stringify(changes),
    }),
  assignLoad: (loadId, driver) =>
    request(`/loads/${encodeURIComponent(loadId)}/assign`, {
      method: "POST",
      body: JSON.stringify({ driver }),
    }),
  changeLoadStatus: (loadId, status, progress, eta) =>
    request(`/loads/${encodeURIComponent(loadId)}/status`, {
      method: "POST",
      body: JSON.stringify({ status, progress, eta }),
    }),
  getLiveTracking: (loadId) =>
    request(`/tracking/${encodeURIComponent(loadId)}/live`),
  recordTrackingLocation: (loadId, payload) =>
    request(`/tracking/${encodeURIComponent(loadId)}/location`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  approveDocument: (documentId, approvedBy) =>
    request(`/documents/${encodeURIComponent(documentId)}/approve`, {
      method: "POST",
      body: JSON.stringify({ approved_by: approvedBy }),
    }),
  createDocument: (payload) =>
    {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      return request("/documents", {
        method: "POST",
        body: formData,
      });
    },
  deleteDocument: (documentId) =>
    request(`/documents/${encodeURIComponent(documentId)}`, {
      method: "DELETE",
    }),
  createInvoice: (payload) =>
    request("/invoices", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  issueInvoice: (invoiceId) =>
    request(`/invoices/${encodeURIComponent(invoiceId)}/issue`, {
      method: "POST",
    }),
  createIncident: (payload) =>
    request("/incidents", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  resolveIncident: (incidentId) =>
    request(`/incidents/${encodeURIComponent(incidentId)}/resolve`, {
      method: "POST",
    }),
};
