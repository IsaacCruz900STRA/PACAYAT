// src/context/TutorContext.jsx
// Gestiona el hijo seleccionado y lo persiste en localStorage.
// Usa datos mock mientras el backend no esté implementado.
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const TutorContext = createContext(null);
const LS_KEY = 'pacayat_tutor_hijo_id';

// ── Mock de hijos ──────────────────────────────────────────────
// TODO: reemplazar con llamada real: getMisHijos()
const HIJOS_MOCK = [
  { id: 1, nombre: 'Diego Díaz Morales',  grupo: '2° A', matricula: '177010', puntosConducta: 92, faltas: 2,  promedio: 8.5 },
  { id: 2, nombre: 'Sofía Díaz Morales',  grupo: '1° B', matricula: '177011', puntosConducta: 58, faltas: 7,  promedio: 7.1 },
];

export function TutorProvider({ children }) {
  const [hijos,        setHijos]        = useState([]);
  const [hijoActual,   setHijoActual]   = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  // Carga inicial — solo una vez al montar
  useEffect(() => {
    // Simula carga asíncrona (reemplazar con API real)
    const timer = setTimeout(() => {
      const data = HIJOS_MOCK; // TODO: await getMisHijos()
      setHijos(data);

      if (data.length === 0) {
        setHijoActual(null);
        setLoading(false);
        return;
      }

      // Restaurar selección persistida
      const savedId = localStorage.getItem(LS_KEY);
      const saved   = data.find(h => String(h.id) === savedId);
      setHijoActual(saved || data[0]);
      setLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, []); // ← vacío, solo corre UNA vez

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
