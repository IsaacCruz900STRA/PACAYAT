import api from './client';

export const getGrupos     = ()        => api.get('/grupos');
export const createGrupo   = (data)    => api.post('/grupos', data);
export const deleteGrupo   = (id)      => api.delete(`/grupos/${id}`);
