// src/context/TutorContext.jsx
// Gestiona el hijo seleccionado y lo persiste en localStorage.
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMisHijos } from '../api/tutores.api';

const TutorContext = createContext(null);
const LS_KEY = 'pacayat_tutor_hijo_id';

export function TutorProvider({ children }) {
  const [hijos,        setHijos]        = useState([]);
  const [hijoActual,   setHijoActual]   = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  useEffect(() => {
    getMisHijos()
      .then(({ data }) => {
        setHijos(data);
        if (data.length === 0) { setHijoActual(null); return; }
        const savedId = localStorage.getItem(LS_KEY);
        const saved   = data.find(h => String(h.id) === savedId);
        setHijoActual(saved || data[0]);
      })
      .catch(err => setError(err?.response?.data?.message || 'Error al cargar datos'))
      .finally(() => setLoading(false));
  }, []);

  const seleccionarHijo = useCallback((hijo) => {
    setHijoActual(hijo);
    if (hijo) localStorage.setItem(LS_KEY, String(hijo.id));
    else      localStorage.removeItem(LS_KEY);
  }, []);

  return (
    <TutorContext.Provider value={{ hijos, hijoActual, loading, error, seleccionarHijo }}>
      {children}
    </TutorContext.Provider>
  );
}

export function useTutor() {
  const ctx = useContext(TutorContext);
  if (!ctx) throw new Error('useTutor debe usarse dentro de TutorProvider');
  return ctx;
}
