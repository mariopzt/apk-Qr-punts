import React, { useState, useEffect } from 'react';
import { getHistorial, getHistorialUsuario } from './api';
import '../estilos/historial.css';

function Historial({ usuario, onBack }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('todos'); // 'todos' o 'usuario'

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        setLoading(true);
        let response;
        
        // Si es un usuario normal, solo muestra su historial
        if (usuario.tipo !== 'admin' && usuario.tipo !== 'root') {
          response = await getHistorialUsuario(usuario.qrCode);
        } else {
          // Si es admin, puede ver todo o filtrar
          if (filtro === 'usuario') {
            response = await getHistorialUsuario(usuario.qrCode);
          } else {
            response = await getHistorial();
          }
        }
        
        if (response && response.logs) {
          setLogs(response.logs);
        }
      } catch (err) {
        console.error("Error cargando historial:", err);
        setError("Error al cargar el historial. Intenta de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    cargarHistorial();
  }, [usuario, filtro]);

  // Función para formatear la fecha
  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Función para formatear la hora
  const formatearHora = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="historial-container">
      <div className="historial-header">
        <div className="historial-title">Historial</div>
        {usuario.tipo === 'admin' || usuario.tipo === 'root' ? (
          <div className="historial-filters">
            <button 
              className={`historial-filter ${filtro === 'todos' ? 'active' : ''}`}
              onClick={() => setFiltro('todos')}
            >
              Todos
            </button>
          </div>
        ) : null}
      </div>

      <div className="historial-content">
        {loading ? (
          <div className="historial-empty">Cargando historial...</div>
        ) : error ? (
          <div className="historial-empty">{error}</div>
        ) : logs.length === 0 ? (
          <div className="historial-empty">No hay registros de escaneos</div>
        ) : (
          <table className="historial-table">
            <thead>
              <tr>
                <th>USUARIO</th>
                <th>HORA</th>
                <th>DÍA</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr style={{ cursor: 'pointer' }} key={index}>
                  <td>
                    {log.username}
                    {log.adminUsername && (
                      <div style={{ fontSize: '0.8rem', color: '#bcbcbc' }}>
                        Escaneado por: {log.adminUsername}
                      </div>
                    )}
                  </td>
                  <td>{formatearHora(log.timestamp)}</td>
                  <td>{formatearFecha(log.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="historial-footer">
        <button className="historial-back" onClick={onBack}>
          Volver
        </button>
      </div>
    </div>
  );
}

export default Historial;
