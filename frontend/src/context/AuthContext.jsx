import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout } from '../api/auth.api';
import ForcedChangePassword from '../components/auth/ForcedChangePassword';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // El token vive en cookie httpOnly — solo guardamos info del usuario para la UI
    const savedUser = localStorage.getItem('pacayat_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password, rol) => {
    const { data } = await apiLogin(username, password, rol);
    const { usuario } = data; // el token lo maneja el backend vía cookie httpOnly
    const userToStore = { ...usuario, changePassword: Boolean(usuario.changePassword) };
    localStorage.setItem('pacayat_user', JSON.stringify(userToStore));
    setUser(userToStore);
    return usuario;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout(); // invalida el token en el servidor y limpia la cookie
    } catch {
      // continuar aunque falle la llamada al servidor
    }
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
