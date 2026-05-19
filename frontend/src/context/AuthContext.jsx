import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin } from '../api/auth.api';
import ForcedChangePassword from '../components/auth/ForcedChangePassword';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('pacayat_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password, rol) => {
    const { data } = await apiLogin(username, password, rol);
    const { token: jwt, usuario } = data;
    localStorage.setItem('pacayat_token', jwt);
    // almacenar indicador de cambio de contraseña si viene desde el backend
    const userToStore = { ...usuario, changePassword: Boolean(usuario.changePassword) };
    localStorage.setItem('pacayat_user', JSON.stringify(userToStore));
    setUser(userToStore);
    return usuario;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pacayat_token');
    localStorage.removeItem('pacayat_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
      <ForcedChangePassword
        open={!!user?.changePassword}
        onDone={(usuarioActualizado) => {
          if (usuarioActualizado) {
            const userToStore = { ...usuarioActualizado, changePassword: Boolean(usuarioActualizado.changePassword) };
            localStorage.setItem('pacayat_user', JSON.stringify(userToStore));
            setUser(userToStore);
          } else {
            const updated = { ...user, changePassword: false };
            setUser(updated);
            localStorage.setItem('pacayat_user', JSON.stringify(updated));
          }
        }}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}

export default AuthContext;
