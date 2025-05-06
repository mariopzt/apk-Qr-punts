import React, { useState, useEffect } from 'react';
import { getHistorial } from './api';
import '../estilos/historial.css';

function Historial({ usuario, onBack }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        setLoading(true);
        const response = await getHistorial();
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
  }, []);

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
        <div className="historial-title">Historial de Escaneos</div>
        <div className="historial-filters">
          <button className="historial-filter">Todos</button>
        </div>
      </div>

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
              <tr key={index}>
                <td>{log.username}</td>
                <td>{formatearHora(log.timestamp)}</td>
                <td>{formatearFecha(log.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button className="historial-back" onClick={onBack}>
        Volver
      </button>
    </div>
  );
}

export default Historial;
