/**
 * AvisoDocumentos — Componente reutilizable para adjuntar y mostrar documentos en avisos.
 *
 * Modo edición (editable=true): muestra lista de docs adjuntos con opción de eliminar
 *   y un botón para subir nuevos archivos.
 * Modo lectura (editable=false): muestra links de descarga.
 */
import { useRef, useState } from 'react';
import { uploadAvisoDoc, getAvisoDocUrl } from '../../api/avisos.api';
import { showToast } from '../ui/Toast';

function fileIcon(mimetype = '') {
  if (mimetype.includes('pdf'))   return '📄';
  if (mimetype.includes('image')) return '🖼️';
  if (mimetype.includes('word') || mimetype.includes('document')) return '📝';
  if (mimetype.includes('sheet') || mimetype.includes('excel'))   return '📊';
  return '📎';
}

function fmtSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AvisoDocumentos({ documentos = [], onChange, editable = true }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const resultados = await Promise.all(
        files.map(f => uploadAvisoDoc(f).then(r => r.data))
      );
      onChange([...documentos, ...resultados]);
      showToast(`${resultados.length} documento${resultados.length > 1 ? 's' : ''} adjunto${resultados.length > 1 ? 's' : ''}`);
    } catch {
      showToast('Error al subir el archivo', 'error');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const eliminar = (idx) => {
    onChange(documentos.filter((_, i) => i !== idx));
  };

  if (!editable) {
    // Vista de solo lectura — links de descarga
    if (!documentos.length) return null;
    return (
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
          📎 Documentos adjuntos
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {documentos.map((doc, i) => (
            <a
              key={i}
              href={getAvisoDocUrl(doc.ruta)}
              target="_blank"
              rel="noreferrer"
              download={doc.nombre}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--blue-600)', textDecoration: 'none' }}
            >
              <span>{fileIcon(doc.mimetype)}</span>
              <span style={{ textDecoration: 'underline' }}>{doc.nombre}</span>
              {doc.tamanio && <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>({fmtSize(doc.tamanio)})</span>}
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>⬇</span>
            </a>
          ))}
        </div>
      </div>
    );
  }

  // Vista de edición
  return (
    <div>
      {/* Lista de docs adjuntos */}
      {documentos.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
          {documentos.map((doc, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '6px 10px' }}>
              <span style={{ fontSize: 16 }}>{fileIcon(doc.mimetype)}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.nombre}</div>
                {doc.tamanio && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtSize(doc.tamanio)}</div>}
              </div>
              <button onClick={() => eliminar(i)} type="button" title="Quitar"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red-500)', fontSize: 14, padding: '2px 4px', flexShrink: 0 }}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Botón subir */}
      <input ref={inputRef} type="file" multiple onChange={handleFile} style={{ display: 'none' }} />
      <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
          border: '1.5px dashed var(--border)', borderRadius: 'var(--radius)',
          background: '#fafafa', cursor: uploading ? 'not-allowed' : 'pointer',
          fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'inherit',
          width: '100%', justifyContent: 'center',
        }}>
        <span style={{ fontSize: 16 }}>📎</span>
        {uploading ? 'Subiendo...' : 'Adjuntar documentos (PDF, imágenes, Word, Excel)'}
      </button>
    </div>
  );
}
