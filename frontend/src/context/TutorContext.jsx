// src/context/TutorContext.jsx
//
// Gestiona el alumno (hijo) actualmente seleccionado.
// Persiste en localStorage para sobrevivir recargas.

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMisHijos } from '../api/tutor.api';

const TutorContext = createContext(null);

// Clave de persistencia
const LS_KEY = 'pacayat_tutor_hijo';

export function TutorProvider({ children }) {
  const [hijos,        setHijos]        = useState([]);
  const [hijoActual,   setHijoActual]   = useState(null);
  const [loadingHijos, setLoadingHijos] = useState(true);

  // Carga inicial de hijos
  useEffect(() => {
    let cancelled = false;
    setLoadingHijos(true);
    getMisHijos()
      .then(({ data }) => {
        if (cancelled) return;
        setHijos(data.hijos || []);

        // Restaurar selección persistida
        const savedId = localStorage.getItem(LS_KEY);
        const saved   = (data.hijos || []).find(h => String(h.id) === savedId);
        setHijoActual(saved || data.hijos?.[0] || null);
      })
      .catch(() => {
        if (!cancelled) setHijos([]);
      })
      .finally(() => { if (!cancelled) setLoadingHijos(false); });

    return () => { cancelled = true; };
  }, []);

  // Al cambiar hijo → persistir
  const seleccionarHijo = useCallback((hijo) => {
    setHijoActual(hijo);
    if (hijo) localStorage.setItem(LS_KEY, String(hijo.id));
    else      localStorage.removeItem(LS_KEY);
  }, []);

  return (
    <TutorContext.Provider value={{ hijos, hijoActual, loadingHijos, seleccionarHijo }}>
      {children}
    </TutorContext.Provider>
  );
}

export function useTutor() {
  const ctx = useContext(TutorContext);
  if (!ctx) throw new Error('useTutor debe usarse dentro de TutorProvider');
  return ctx;
}
