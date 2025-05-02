import React, { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import "../estilos/cuerpoNuevo.css";
import "../estilos/qrscan.css";
import "../estilos/cuerpoAdminNuevo.css";

function CuerpoAdminNuevo({ usuario }) {
  const [showQr, setShowQr] = useState(false);
  const [qrResult, setQrResult] = useState("");
  const [cameras, setCameras] = useState([]);
  const [cameraId, setCameraId] = useState(null);
  const [error, setError] = useState("");
  const qrRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!showQr) return;
    Html5Qrcode.getCameras().then(devices => {
      setCameras(devices);
      if (devices.length > 0) {
        const backCam = devices.find(cam => cam.label && cam.label.toLowerCase().includes('back'));
        setCameraId(backCam ? backCam.id : devices[0].id);
      } else {
        setError("No se encontraron cámaras");
      }
    }).catch(err => setError("Error buscando cámaras: " + err));
  }, [showQr]);

  useEffect(() => {
    if (!showQr || !qrRef.current || !cameraId) return;
    scannerRef.current = new Html5Qrcode(qrRef.current.id);
    scannerRef.current.start(
      cameraId,
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        setQrResult(decodedText);
        scannerRef.current.stop();
      },
      (err) => {}
    ).catch((err) => setError("Error al iniciar cámara: " + err));
    return () => {
      if (scannerRef.current && scannerRef.current.getState() === 2) {
        scannerRef.current.stop().catch(() => {});
      }
    };
    // eslint-disable-next-line
  }, [showQr, cameraId]);

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
          <div className="admin-card" onClick={() => setShowQr(true)}>
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
              <div style={{ color: '#fff', fontSize: 18, marginTop: 18, textAlign: 'center' }}>
                {error ? error : (qrResult ? <>QR leído: <b>{qrResult}</b></> : "Escanea un código QR")}
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
