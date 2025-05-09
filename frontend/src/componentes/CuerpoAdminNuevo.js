import React, { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import "../estilos/cuerpoNuevo.css";
import "../estilos/qrscan.css";
import "../estilos/cuerpoAdminNuevo.css";

import { sumarPuntoUsuario, getUsuarioByQrCode, restarPuntosUsuario } from "./api";
import { socket } from "../socket";
import Historial from "./Historial";

function CuerpoAdminNuevo({ usuario, setUsuario }) {
  const [showQr, setShowQr] = useState(false);
  const [showQrCobrar, setShowQrCobrar] = useState(false);
  const [qrResult, setQrResult] = useState("");
  const [error, setError] = useState("");
  const qrRef = useRef(null);
  const qrCobrarRef = useRef(null);
  const scannerRef = useRef(null);
  const scannerCobrarRef = useRef(null);
  const [qrFeedbackMsg, setQrFeedbackMsg] = useState('');
  const [showHistorial, setShowHistorial] = useState(false);
  const [puntosACobrar, setPuntosACobrar] = useState(1);

  // Función para reproducir beep usando el archivo MP3
  const playBeep = () => {
    try {
      const audio = new Audio('/sounds/beep.mp3');
      audio.volume = 0.5; // Ajusta el volumen según necesites (0.0 a 1.0)
      audio.play().catch(err => {
        console.error('Error reproduciendo beep:', err);
      });
    } catch (err) {
      console.error('Error reproduciendo beep:', err);
    }
  };

  // Limpiar resultado y error al abrir/cerrar modal
  useEffect(() => {
    if (showQr || showQrCobrar) {
      setQrResult("");
      setError("");
    }
  }, [showQr, showQrCobrar]);

  // Conectar al socket y escuchar eventos de puntos sumados
  useEffect(() => {
    if (!usuario?.qrCode) return;
    
    // Conectar al socket si no está conectado
    if (!socket.connected) socket.connect();
    
    // Unirse a la sala con el QR del administrador
    socket.emit('join', usuario.qrCode);
    
    // Manejar evento de punto sumado
    const handlePuntoSumado = async () => {
      console.log('[SOCKET] Administrador recibió punto-sumado');
      
      try {
        // Obtener datos actualizados del usuario
        const response = await getUsuarioByQrCode(usuario.qrCode);
        if (response && response.user) {
          console.log('[SOCKET] Actualizando datos del administrador:', response.user);
          setUsuario(response.user);
        }
      } catch (error) {
        console.error('[SOCKET] Error al actualizar datos del administrador:', error);
      }
    };
    
    // Registrar el manejador de eventos
    socket.on('punto-sumado', handlePuntoSumado);
    
    // Limpiar al desmontar
    return () => {
      socket.off('punto-sumado', handlePuntoSumado);
    };
  }, [usuario?.qrCode, setUsuario]);


  // Buscar cámaras para el lector QR (sumar puntos)
  const buscarCamaras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      const backLabels = ['back', 'atrás', 'trasera', 'posterior', 'rear', 'environment'];
      
      const backCam = devices.find(cam => {
        if (!cam.label) return false;
        const label = cam.label.toLowerCase();
        return backLabels.some(word => label.includes(word));
      });
      if (backCam) {
        setShowQr(true);
      } else {
        alert('No se ha encontrado cámara trasera. Si usas iPhone o Android, permite el acceso a la cámara en los permisos del navegador y prueba de nuevo.');
      }
    } catch (e) {
      alert('Error buscando cámaras: ' + e);
    }
  };
  
  // Buscar cámaras para cobrar puntos
  const buscarCamarasCobrar = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      const backLabels = ['back', 'atrás', 'trasera', 'posterior', 'rear', 'environment'];
      
      const backCam = devices.find(cam => {
        if (!cam.label) return false;
        const label = cam.label.toLowerCase();
        return backLabels.some(word => label.includes(word));
      });
      if (backCam) {
        setShowQrCobrar(true);
      } else {
        alert('No se ha encontrado cámara trasera. Si usas iPhone o Android, permite el acceso a la cámara en los permisos del navegador y prueba de nuevo.');
      }
    } catch (e) {
      alert('Error buscando cámaras: ' + e);
    }
  };
  
  // Inicializa el scanner para añadir puntos
  useEffect(() => {
    if (!showQr) return;
    const timer = setTimeout(() => {
      if (!qrRef.current) {
        setError('No se encontró el contenedor del lector QR.');
        console.error('[QR] No se encontró el contenedor del lector QR.');
        return;
      }
      let isMounted = true;
      (async () => {
        try {
          const devices = await Html5Qrcode.getCameras();
          const backLabels = ['back', 'atrás', 'trasera', 'posterior', 'rear', 'environment'];
          let backCam = devices.find(cam => {
            if (!cam.label) return false;
            const label = cam.label.toLowerCase();
            return backLabels.some(word => label.includes(word));
          });
          if (!backCam && devices.length === 1) {
            backCam = devices[0];
          }
          if (!backCam) {
            setError('No se ha encontrado cámara trasera');
            setTimeout(() => {
              setError("");
              setShowQr(false);
            }, 2000);
            return;
          }
          if (isMounted && qrRef.current) {
            scannerRef.current = new Html5Qrcode(qrRef.current.id);
            console.log('[QR] Iniciando lector QR con cámara', backCam);
            let lastScan = '';
            let lastScanTime = 0;
            scannerRef.current.start(
              { deviceId: { exact: backCam.id } },
              { fps: 10, qrbox: 250 },
              async (decodedText) => {
                // Evita lecturas dobles rápidas
                const now = Date.now();
                if (decodedText !== lastScan || now - lastScanTime > 2000) {
                  lastScan = decodedText;
                  lastScanTime = now;
                  console.log('[QR] QR leído:', decodedText);
                  setQrResult(decodedText);
                  playBeep(); // Reproducir beep
                  setQrFeedbackMsg(`QR leído: ${decodedText}`);
                  setTimeout(() => setQrFeedbackMsg(''), 2000);
                  // Sumar punto vía API
                  try {
                    // Si el admin escanea un QR que no es el suyo, enviar también el QR del admin
                    const adminQrCode = usuario.tipo === "admin" || usuario.tipo === "root" ? usuario.qrCode : null;
                    
                    // Sumar punto vía API y obtener usuario actualizado
                    const res = await sumarPuntoUsuario(decodedText, adminQrCode);
                    
                    // Dispara evento global para que CuerpoNuevo refresque balance instantáneamente
                    if (window) {
                      window.dispatchEvent(new CustomEvent('qr-punto-sumado', { detail: { qrCode: decodedText } }));
                    }
                    
                    // Solo si el admin escanea SU PROPIO QR, actualiza su usuario y cierra el modal
                    if (usuario.qrCode === decodedText && res && res.user) {
                      setUsuario(res.user);
                      setQrResult(''); // Limpia el resultado
                      setShowQr(false); // Cierra el modal
                    }
                  } catch (err) {
                    // Mostrar solo "QR no válido" en lugar del error detallado
                    setError("QR no válido");
                    console.error("Error al sumar punto:", err);
                    
                    // Limpiar el mensaje de error después de 2 segundos
                    setTimeout(() => {
                      setError("");
                    }, 2000);
                  }
                }
              },
              (err) => {}
            ).catch((err) => {
              setError("Error al iniciar cámara");
              console.error('[QR] Error al iniciar cámara:', err);
              
              // Limpiar el mensaje de error después de 2 segundos
              setTimeout(() => {
                setError("");
              }, 2000);
            });
          }
        } catch (err) {
          setError('Error buscando cámaras: ' + err);
          setShowQr(false);
        }
      })();
      // Limpieza al cerrar
      return () => {
        isMounted = false;
        if (scannerRef.current && scannerRef.current.getState() === 2) {
          scannerRef.current.stop().catch(() => {});
        }
      };
    }, 0);
    // Limpieza del timeout
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [showQr, qrRef]);

  // Inicializa el scanner para cobrar puntos - similar al de Lector QR pero con la funcionalidad de resta
  useEffect(() => {
    if (!showQrCobrar) return;
    const timer = setTimeout(() => {
      if (!qrCobrarRef.current) {
        setError('No se encontró el contenedor del lector QR.');
        console.error('[QR] No se encontró el contenedor del lector QR.');
        return;
      }
      let isMounted = true;
      (async () => {
        try {
          const devices = await Html5Qrcode.getCameras();
          const backLabels = ['back', 'atrás', 'trasera', 'posterior', 'rear', 'environment'];
          let backCam = devices.find(cam => {
            if (!cam.label) return false;
            const label = cam.label.toLowerCase();
            return backLabels.some(word => label.includes(word));
          });
          if (!backCam && devices.length === 1) {
            backCam = devices[0];
          }
          if (!backCam) {
            setError('No se ha encontrado cámara trasera');
            setTimeout(() => {
              setError("");
              setShowQrCobrar(false);
            }, 2000);
            return;
          }
          if (isMounted && qrCobrarRef.current) {
            scannerCobrarRef.current = new Html5Qrcode(qrCobrarRef.current.id);
            console.log('[QR] Iniciando lector QR con cámara', backCam);
            let lastScan = '';
            let lastScanTime = 0;
            scannerCobrarRef.current.start(
              { deviceId: { exact: backCam.id } },
              { fps: 10, qrbox: 160 },
              async (decodedText) => {
                // Evita lecturas dobles rápidas
                const now = Date.now();
                if (decodedText === lastScan && now - lastScanTime < 5000) {
                  return;
                }
                lastScan = decodedText;
                lastScanTime = now;
                
                playBeep();
                setQrFeedbackMsg('QR detectado: ' + decodedText.substring(0, 10) + '...');
                
                try {
                  // Si el admin escanea un QR que no es el suyo, enviar también el QR del admin
                  const adminQrCode = usuario.tipo === "admin" || usuario.tipo === "root" ? usuario.qrCode : null;
                  
                  // Validamos que los puntos a cobrar sean un número válido mayor que cero
                  const puntosNum = parseInt(puntosACobrar);
                  if (isNaN(puntosNum) || puntosNum <= 0) {
                    setError('Debes ingresar una cantidad válida de puntos a cobrar');
                    setTimeout(() => setError(''), 3000);
                    return;
                  }
                  
                  console.log(`[QR] Cobrar: Intentando restar ${puntosNum} puntos al usuario con QR:`, decodedText);
                  console.log('[QR] Cobrar: Admin QR:', adminQrCode);
                  
                  const res = await restarPuntosUsuario(decodedText, adminQrCode, puntosNum);
                  console.log('[QR] Cobrar: Respuesta del servidor:', res);
                  
                  if (res.success) {
                    setQrFeedbackMsg(`✅ Se han restado ${puntosNum} ${puntosNum === 1 ? 'punto' : 'puntos'} a ${res.user.username}`);
                    // Si el usuario escaneado es el admin, actualizar su usuario
                    if (res.user.qrCode === usuario.qrCode) {
                      setUsuario(res.user);
                      setTimeout(() => {
                        setShowQrCobrar(false);
                        scannerCobrarRef.current.stop();
                      }, 2000);
                    }
                  } else {
                    setError(`❌ ${res.message || 'Error al cobrar puntos'}`);
                  }
                  
                  setTimeout(() => {
                    setQrFeedbackMsg('');
                    setError('');
                  }, 3000);
                } catch (err) {
                  console.error('[QR] Error al procesar el código:', err);
                  setError(`❌ ${err.message || 'Error desconocido'}`);
                  setTimeout(() => setError(''), 3000);
                }
              },
              (errorMessage) => {
                console.log('[QR] Error de escaneo (ignorable):', errorMessage);
              }
            ).catch(err => {
              if (isMounted) {
                console.error('[QR] Error iniciando el scanner:', err);
                setError('Error iniciando la cámara: ' + err.toString());
                setTimeout(() => {
                  setError("");
                  setShowQrCobrar(false);
                }, 2000);
              }
            });
          }
        } catch (err) {
          if (isMounted) {
            console.error('[QR] Error general:', err);
            setError('Error: ' + err.toString());
            setTimeout(() => {
              setError("");
              setShowQrCobrar(false);
            }, 2000);
          }
        }
      })();
      
      return () => {
        isMounted = false;
        if (scannerCobrarRef.current) {
          try {
            scannerCobrarRef.current.stop().catch(console.error);
          } catch (err) {
            console.error('[QR] Error al detener el scanner:', err);
          }
        }
      };
    }, 500);
    
    return () => {
      clearTimeout(timer);
      if (scannerCobrarRef.current) {
        try {
          scannerCobrarRef.current.stop().catch(console.error);
        } catch (err) {
          console.error('[QR] Error al limpiar el scanner:', err);
        }
      }
    };
  }, [showQrCobrar, usuario, setUsuario, puntosACobrar]);

  // Si se está mostrando el historial, renderizar el componente Historial
  if (showHistorial) {
    return <Historial usuario={usuario} onBack={() => setShowHistorial(false)} />;
  }
  
  return (
    <div className="admin-bg">

      <div className="admin-container">
        {/* CARD DE CREDITOS */}
        <div className="admin-credit-card">
          <div className="admin-credit-title">Créditos</div>
          <div className="admin-credit-amount">{usuario.points ?? 0}</div>
        </div>
        {/* GRID DE ACCIONES */}
        <div className="admin-grid">
          <div className="admin-card" onClick={buscarCamaras}>
            <div className="admin-card-icon">📷</div>
            <div className="admin-card-title">Lector QR</div>
            <div className="admin-card-desc">Escanea códigos</div>
          </div>
          <div className="admin-card" onClick={buscarCamarasCobrar}>
            <div className="admin-card-icon">💸</div>
            <div className="admin-card-title">Cobrar</div>
            <div className="admin-card-desc">Descontar puntos</div>
          </div>
          <div className="admin-card" onClick={() => setShowHistorial(true)}>
            <div className="admin-card-icon">📝</div>
            <div className="admin-card-title">Historial</div>
            <div className="admin-card-desc">Ver escaneos</div>
          </div>
          <div className="admin-card disabled">
            <div className="admin-card-icon">⚙️</div>
            <div className="admin-card-title">Ajustes</div>
            <div className="admin-card-desc">Próximamente</div>
          </div>
        </div>
        {/* MODAL QR PARA SUMAR PUNTOS */}
        {showQr && (
          <div className="qrscan-bg" style={{ zIndex: 12000 }}>
            {/* Fondo de cámara a pantalla completa */}
            <div className="qrscan-frame">
              <div id="qr-reader" ref={qrRef} className="qrscan-reader" />
            </div>
            
            {/* Overlay con el contenido (botones, textos) */}
            <div className="qrscan-overlay">
              {/* Botón de cerrar */}
              <button className="qrscan-close" onClick={() => {
                if (scannerRef.current) {
                  scannerRef.current.stop();
                }
                setShowQr(false);
              }}>✕</button>
              
              {/* Contenido superior e inferior */}
              <div className="qrscan-content">
                {/* Área superior */}
                <div className="qrscan-title-center">
                  <div className="qrscan-title">Escanea QR</div>
                  <div className="qrscan-subtitle">Escanea el QR código para sumar puntos</div>
                </div>
                
                {/* Área de mensaje de error o éxito */}
                {(error || qrFeedbackMsg) && (
                  <div className="qrscan-message" style={{
                    color: error ? '#ffffff' : '#4caf50',
                    backgroundColor: error ? 'rgba(0, 0, 0, 0.9)' : 'transparent',
                    padding: error ? '15px 25px' : '0',
                    borderRadius: error ? '8px' : '0',
                    fontWeight: error ? 'bold' : 'normal',
                    boxShadow: error ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
                    position: error ? 'absolute' : 'relative',
                    top: error ? '50%' : 'auto',
                    left: error ? '50%' : 'auto',
                    transform: error ? 'translate(-50%, -50%)' : 'none',
                    zIndex: error ? '20' : '1'
                  }}>
                    {error || qrFeedbackMsg}
                  </div>
                )}
                
                {/* Área inferior - botones */}
                <div className="qrscan-actions-bar">
                  <button className="qrscan-bar-btn qrscan-bar-btn-main">Scan code</button>
                  <button className="qrscan-bar-btn qrscan-bar-btn-alt">Enter code</button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* MODAL QR PARA COBRAR PUNTOS */}
        {showQrCobrar && (
          <div className="qrscan-bg" style={{ zIndex: 12000 }}>
            {/* Fondo de cámara a pantalla completa */}
            <div className="qrscan-frame">
              <div id="qr-reader-cobrar" ref={qrCobrarRef} className="qrscan-reader" />
            </div>
            
            {/* Overlay con el contenido (botones, textos) */}
            <div className="qrscan-overlay">
              {/* Botón de cerrar */}
              <button className="qrscan-close" onClick={() => {
                if (scannerCobrarRef.current) {
                  try {
                    scannerCobrarRef.current.stop().catch(e => console.error(e));
                  } catch (err) {
                    console.error('[QR] Error al detener escáner:', err);
                  }
                }
                setShowQrCobrar(false);
              }}>✕</button>
              
              {/* Contenido superior e inferior */}
              <div className="qrscan-content">
                {/* Área superior */}
                <div className="qrscan-title-center">
                  <div className="qrscan-title">Cobrar Puntos</div>
                  <div className="qrscan-subtitle">Escanea el QR del usuario para cobrar puntos</div>
                </div>
                
                {/* Campo de entrada para puntos a cobrar */}
                {/* Campo de puntos a cobrar */}
                <div 
                  onMouseDown={(e) => {
                    // Detener la propagación para evitar que cierren el modal
                    e.stopPropagation();
                    console.log("[QR] Click en contenedor de input");
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log("[QR] Click en contenedor de input");
                  }}
                  style={{
                    position: 'absolute',
                    top: '20%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80%',
                    maxWidth: '300px',
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    padding: '20px',
                    borderRadius: '10px',
                    zIndex: 9999,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                    border: '2px solid #ffb6fc'
                  }}
                >
                  <label 
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: 'block',
                      color: 'white',
                      marginBottom: '10px',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      fontSize: '18px'
                    }}
                  >
                    Puntos a cobrar:
                  </label>
                  <input 
                    type="number" 
                    value={puntosACobrar}
                    onChange={(e) => {
                      console.log('Nuevo valor input:', e.target.value);
                      setPuntosACobrar(parseInt(e.target.value) || 0);
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      console.log("[QR] MouseDown en input");
                    }}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      console.log("[QR] KeyDown en input:", e.key);
                    }}
                    onFocus={(e) => {
                      e.target.select();
                      console.log("[QR] Focus en input");
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      console.log("[QR] Click en input");
                    }}
                    min="1"
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '15px',
                      fontSize: '22px',
                      borderRadius: '6px',
                      border: '3px solid #ffb6fc',
                      outline: 'none',
                      textAlign: 'center',
                      backgroundColor: '#fff',
                      color: '#000',
                      zIndex: 10000,
                      fontWeight: 'bold',
                      boxShadow: '0 0 10px rgba(255,182,252,0.5)'
                    }}
                  />
                </div>
                
                {/* Área de mensaje de error o éxito */}
                {(error || qrFeedbackMsg) && (
                  <div className="qrscan-message" style={{
                    color: error ? '#ffffff' : '#4caf50',
                    backgroundColor: error ? 'rgba(0, 0, 0, 0.9)' : 'transparent',
                    padding: error ? '15px 25px' : '0',
                    borderRadius: error ? '8px' : '0',
                    fontWeight: error ? 'bold' : 'normal',
                    boxShadow: error ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
                    position: error ? 'absolute' : 'relative',
                    top: error ? '50%' : 'auto',
                    left: error ? '50%' : 'auto',
                    transform: error ? 'translate(-50%, -50%)' : 'none',
                    zIndex: error ? '20' : '1'
                  }}>
                    {error || qrFeedbackMsg}
                  </div>
                )}
                
                {/* Área inferior - botones */}
                <div className="qrscan-actions-bar">
                  <button className="qrscan-bar-btn qrscan-bar-btn-main">Scan code</button>
                  <button className="qrscan-bar-btn qrscan-bar-btn-alt">Enter code</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CuerpoAdminNuevo;
