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
          // Ordenar logs por fecha, del más reciente al más antiguo
          const logsOrdenados = [...response.logs].sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
          });
          setLogs(logsOrdenados);
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

  // Función para obtener solo la fecha (sin hora) para agrupar
  const obtenerSoloFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toISOString().split('T')[0];
  };

  // Función para formatear el día para el separador
  const formatearDiaSeparador = (fechaStr) => {
    // Crear un objeto de fecha a partir del string
    const fecha = new Date(fechaStr);
    
    // Obtener la fecha actual
    const hoy = new Date();
    
    // Convertir ambas fechas a formato YYYY-MM-DD para comparar solo las fechas
    const fechaHoy = hoy.toISOString().split('T')[0];
    const fechaLog = fecha.toISOString().split('T')[0];
    
    // Crear fecha de ayer
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);
    const fechaAyer = ayer.toISOString().split('T')[0];
    
    // Comparar fechas sin componente de hora
    if (fechaLog === fechaHoy) {
      return 'Hoy';
    } else if (fechaLog === fechaAyer) {
      return 'Ayer';
    } else {
      // Para días anteriores, no mostrar separador
      return null;
    }
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
              {(() => {
                // Agrupar logs por fecha
                const logsPorFecha = {};
                logs.forEach(log => {
                  const fecha = obtenerSoloFecha(log.timestamp);
                  if (!logsPorFecha[fecha]) {
                    logsPorFecha[fecha] = [];
                  }
                  logsPorFecha[fecha].push(log);
                });

                // Convertir el objeto agrupado en un array para renderizar
                const fechasOrdenadas = Object.keys(logsPorFecha).sort().reverse();
                
                // Renderizar los logs agrupados por fecha
                return fechasOrdenadas.map((fecha, fechaIndex) => {
                  const logsDelDia = logsPorFecha[fecha];
                  const separadorFecha = formatearDiaSeparador(fecha);
                  
                  return (
                    <React.Fragment key={fecha}>
                      {separadorFecha && (
                        <tr className="historial-date-separator">
                          <td colSpan="3" className="fecha-separador">{separadorFecha}</td>
                        </tr>
                      )}
                      {logsDelDia.map((log, logIndex) => (
                        <tr style={{ cursor: 'pointer' }} key={`${fecha}-${logIndex}`}>
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
                    </React.Fragment>
                  );
                });
              })()}
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
