export const login = (token, admin) => {
  localStorage.setItem("token", token);
  localStorage.setItem("admin", JSON.stringify(admin));
};

export const logout = () => {
  localStorage.clear();
  window.location.href = "/login";
};

export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Date.now() / 1000;
    return payload.exp && payload.exp > now;
  } catch {
    return false;
  }
};

export const getAdmin = () => {
  const admin = localStorage.getItem("admin");
  return admin ? JSON.parse(admin) : null;
};

export const clearIfTokenInvalid = () => {
  if (!isAuthenticated()) {
    localStorage.clear();
  }
};
