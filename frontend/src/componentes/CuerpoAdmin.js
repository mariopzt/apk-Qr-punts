import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import "../estilos/cuerpoNuevo.css";
import "../estilos/qrscan.css";

function CuerpoAdmin({ usuario }) {
  const [qrResult, setQrResult] = useState("");
  const [cameras, setCameras] = useState([]);
  const [cameraId, setCameraId] = useState(null);
  const [error, setError] = useState("");
  const qrRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    Html5Qrcode.getCameras().then(devices => {
      setCameras(devices);
      if (devices.length > 0) {
        // Buscar cámara trasera por label
        const backCam = devices.find(cam =>
          cam.label && cam.label.toLowerCase().includes('back')
        );
        if (backCam) {
          setCameraId(backCam.id);
        } else {
          setCameraId(devices[0].id);
        }
      } else {
        setError("No se encontraron cámaras");
      }
    }).catch(err => setError("Error buscando cámaras: " + err));
  }, []);

  useEffect(() => {
    if (!qrRef.current || !cameraId) return;
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
  }, [cameraId]);

  return (
    <div className="qrscan-bg">
      <div className="qrscan-overlay">
        <button className="qrscan-close" onClick={() => window.history.back()}>✕</button>
        <div className="qrscan-title">Scan QR Code</div>
        <div className="qrscan-subtitle">Scan the booking QR code from your confirmation email</div>
        <div className="qrscan-frame">
          <div id="qr-reader" ref={qrRef} className="qrscan-reader" />
        </div>
        <div style={{ color: '#fff', fontSize: 18, marginTop: 18, textAlign: 'center' }}>
          {error ? error : (qrResult ? <>QR leído: <b>{qrResult}</b></> : "Escanea un código QR")}
        </div>
        <div className="qrscan-actions">
          <button className="qrscan-btn qrscan-btn-main">Scan code</button>
          <button className="qrscan-btn qrscan-btn-alt">Enter code</button>
        </div>
      </div>
    </div>
  );
}

export default CuerpoAdmin;
