import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import "../estilos/cuerpoNuevo.css";



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
        setCameraId(devices[0].id);
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
    <div className="cuerpo-nuevo-bg">
      <div className="cuerpo-nuevo-container">
        <h2>Panel de Admin</h2>
        {cameras.length > 1 && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#fff' }}>Selecciona cámara: </label>
            <select value={cameraId || ""} onChange={e => { setQrResult(""); setError(""); setCameraId(e.target.value); }}>
              {cameras.map(cam => (
                <option key={cam.id} value={cam.id}>{cam.label || cam.id}</option>
              ))}
            </select>
          </div>
        )}
        <div style={{ margin: '24px 0' }}>
          <div id="qr-reader" ref={qrRef} style={{ width: 300, margin: '0 auto' }} />
        </div>
        <div style={{ color: '#fff', fontSize: 18, marginTop: 18 }}>
          {error ? error : (qrResult ? <>QR leído: <b>{qrResult}</b></> : "Escanea un código QR")}
        </div>
      </div>
    </div>
  );
}

export default CuerpoAdmin;
