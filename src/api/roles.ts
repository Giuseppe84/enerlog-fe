import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export interface UserRole {
  id: string;
  name: string;
  email: string;
  roles: ('admin' | 'moderator' | 'user')[];
}

export const fetchUserRoles = async (): Promise<UserRole[]> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token non trovato');
  }
  
  const response = await axios.get(`${backendUrl}/roles/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const assignRole = async (
  userId: string,
  role: 'admin' | 'moderator' | 'user'
): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token non trovato');
  }
  
  await axios.post(
    `${backendUrl}/roles/assign`,
    { userId, role },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const removeRole = async (
  userId: string,
  role: 'admin' | 'moderator' | 'user'
): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token non trovato');
  }
  
  await axios.delete(`${backendUrl}/roles/remove`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { userId, role },
  });
};
