import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout, getMe } from '../api/auth.api';
import ForcedChangePassword from '../components/auth/ForcedChangePassword';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica la sesión con el servidor — no confiamos solo en localStorage.
    // Si el JWT de la cookie es válido, el servidor devuelve el usuario real.
    getMe()
      .then(({ data }) => {
        const u = { ...data.usuario, changePassword: Boolean(data.usuario.changePassword) };
        localStorage.setItem('pacayat_user', JSON.stringify(u));
        setUser(u);
      })
      .catch(() => {
        // Cookie ausente, expirada o inválida — limpiar estado
        localStorage.removeItem('pacayat_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password, rol) => {
    const { data } = await apiLogin(username, password, rol);
    const { usuario } = data;
    const u = { ...usuario, changePassword: Boolean(usuario.changePassword) };
    localStorage.setItem('pacayat_user', JSON.stringify(u));
    setUser(u);
    return usuario;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch { /* continuar aunque falle */ }
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
            const u = { ...usuarioActualizado, changePassword: Boolean(usuarioActualizado.changePassword) };
            localStorage.setItem('pacayat_user', JSON.stringify(u));
            setUser(u);
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
