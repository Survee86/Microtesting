import jwtDecode from 'jwt-decode';

export const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp > Date.now() / 1000;
  } catch {
    return false;
  }
};

export const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  if (!isTokenValid(token)) return null;
  return jwtDecode(token).userId; // Или другие данные из токена
};