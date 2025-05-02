import React, { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import "../estilos/cuerpoNuevo.css";
import "../estilos/qrscan.css";
import "../estilos/cuerpoAdminNuevo.css";

import { sumarPuntoUsuario } from "./api";

function CuerpoAdminNuevo({ usuario, setUsuario }) {
  const [showQr, setShowQr] = useState(false);
  const [qrResult, setQrResult] = useState("");
  const [error, setError] = useState("");
  const qrRef = useRef(null);
  const scannerRef = useRef(null);

  // Limpiar resultado y error al abrir/cerrar modal
  useEffect(() => {
    if (showQr) {
      setQrResult("");
      setError("");
    }
  }, [showQr]);


  // Nuevo useEffect: inicializa el scanner solo cuando showQr y qrRef.current están listos
  useEffect(() => {
    if (!showQr) return;
    // Espera un tick para asegurar que el div está en el DOM
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
            setError('No se ha encontrado cámara trasera. Si usas iPhone o Android, permite el acceso a la cámara en los permisos del navegador y prueba de nuevo.');
            setShowQr(false);
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
                  // Sumar punto vía API
                  try {
                    // Sumar punto vía API y obtener usuario actualizado
                    const res = await sumarPuntoUsuario(decodedText);
                    // Si la API responde con el usuario actualizado, refrescar
                    if (res && res.user) {
                      setUsuario(res.user);
                    }
                    // Feedback visual
                    const frame = document.querySelector('.qrscan-frame');
                    if (frame) {
                      frame.style.boxShadow = '0 0 0 4px #4caf50, 0 2px 16px rgba(0,0,0,0.13)';
                      setTimeout(() => {
                        frame.style.boxShadow = '';
                      }, 800);
                    }
                    // Si el usuario escaneado es el mismo, ocultar QR
                    if (usuario.qrCode === decodedText) {
                      setQrResult(''); // Limpia el resultado
                      setShowQr(false); // Cierra el modal
                    }
                  } catch (err) {
                    setError("Error al sumar punto: " + (err.message || err));
                    console.error("Error al sumar punto:", err);
                  }
                }
              },
              (err) => {}
            ).catch((err) => {
              setError("Error al iniciar cámara: " + err);
              console.error('[QR] Error al iniciar cámara:', err);
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
          <div className="admin-card" onClick={async () => {
            // Buscar cámaras antes de abrir el lector
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
          }}>
            <div className="admin-card-icon">📷</div>
            <div className="admin-card-title">Lector QR</div>
            <div className="admin-card-desc">Escanea códigos</div>
          </div>
          <div className="admin-card disabled">
            <div className="admin-card-icon">💸</div>
            <div className="admin-card-title">Cobrar</div>
            <div className="admin-card-desc">Próximamente</div>
          </div>
          <div className="admin-card disabled">
            <div className="admin-card-icon">📝</div>
            <div className="admin-card-title">Historial</div>
            <div className="admin-card-desc">Próximamente</div>
          </div>
          <div className="admin-card disabled">
            <div className="admin-card-icon">⚙️</div>
            <div className="admin-card-title">Ajustes</div>
            <div className="admin-card-desc">Próximamente</div>
          </div>
        </div>
        {/* MODAL QR */}
        {showQr && (
          <div className="qrscan-bg" style={{ zIndex: 12000 }}>
            <div className="qrscan-overlay">
              <button className="qrscan-close" onClick={() => setShowQr(false)}>✕</button>
              <div className="qrscan-title">Lector QR</div>
              <div className="qrscan-frame">
                <div id="qr-reader" ref={qrRef} className="qrscan-reader" />
              </div>
              <div style={{ color: error ? '#ff5252' : (qrResult ? '#4caf50' : '#fff'), fontSize: 18, marginTop: 18, textAlign: 'center', fontWeight: error ? 700 : 400 }}>
                {error ? <>Error: {error}</> : (qrResult ? <>QR leído: <b>{qrResult}</b></> : "Escanea un código QR")}
              </div>
              <div className="qrscan-actions-bar">
                <button className="qrscan-bar-btn qrscan-bar-btn-main" onClick={() => setShowQr(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CuerpoAdminNuevo;
