import React, { useState, useEffect, useRef } from "react";
import QrCodeBox from "./QrCodeBox";
import "../estilos/cuerpoNuevo.css";
import { getUsuarioByQrCode } from "./api";

export default function CuerpoNuevoDebug({ usuario, setUsuario }) {
  const [showQr, setShowQr] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [debug, setDebug] = useState("");
  const lastPoints = useRef(usuario.points ?? 0);

  // Refrescar usuario cada 5s
  useEffect(() => {
    if (!usuario?.qrCode) return;
    const interval = setInterval(async () => {
      try {
        const res = await getUsuarioByQrCode(usuario.qrCode);
        setDebug(d => d + `\n[Auto] points: ${res?.user?.points}`);
        if (res && res.user) {
          setUsuario({ ...usuario, ...res.user });
        }
      } catch (e) {
        setDebug(d => d + `\n[Auto] error: ${e}`);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [usuario?.qrCode, setUsuario]);

  // Evento global QR punto sumado
  useEffect(() => {
    const handler = async (e) => {
      if (e.detail && e.detail.qrCode === usuario.qrCode) {
        setDebug(d => d + `\n[EVENT] Recibido punto para QR: ${usuario.qrCode}`);
        try {
          const res = await getUsuarioByQrCode(usuario.qrCode);
          setDebug(d => d + `\n[EVENT] Nuevo points: ${res?.user?.points}`);
          if (res && res.user && (res.user.points ?? 0) > (usuario.points ?? 0)) {
            setUsuario({ ...usuario, ...res.user });
            setMensaje("¡Punto sumado!");
            setShowQr(false);
            setTimeout(() => setMensaje(""), 2000);
          }
        } catch (e) {
          setDebug(d => d + `\n[EVENT] error: ${e}`);
        }
      }
    };
    window.addEventListener('qr-punto-sumado', handler);
    return () => window.removeEventListener('qr-punto-sumado', handler);
  }, [usuario, setUsuario]);

  return (
    <div className="cuerpo-nuevo-bg">
      <div className="cuerpo-nuevo-container">
        <div className="cuerpo-nuevo-inner">
          <div className="balance-section">
            <div className="balance-label">Tu balance</div>
            <div className="balance-amount">
              <span className="coin">🪙</span> {usuario.points ?? 0}
            </div>
          </div>

          {/* Sección boosters-list: Historial y Nivel de usuario */}
          <div className="section-title">Tu Espacio</div>
          <div className="boosters-list">
            <div className="booster-item ">
              <div className="booster-icon">🤖</div>
              <div>
                <div className="booster-title">Historial</div>
                <div className="booster-sub silver">Pedidos y descuentos</div>
              </div>
            </div>
            <div className="booster-item">
              <div className="booster-icon">🖐️</div>
              <div>
                <div className="booster-title">Nivel de usuario</div>
                <div className="booster-sub"> <span className="coin">🪙</span> • 0 lvl</div>
              </div>
            </div>
          </div>
          <div className="boosters-list">
            <div className="booster-item qr-booster" onClick={() => setShowQr(true)} style={{ cursor: 'pointer' }}>
              <div className="booster-icon">📱</div>
              <div>
                <div className="booster-title">Mostrar tu QR</div>
                <div className="booster-sub">Toca para ver tu código QR</div>
              </div>
            </div>
          </div>
          {mensaje && (
            <div style={{ textAlign: 'center', marginTop: 16, color: '#4caf50', fontWeight: 600, fontSize: 18 }}>{mensaje}</div>
          )}
          {showQr && (
            <div className="qr-modal-bg" onClick={e => { if (e.target.className.includes('qr-modal-bg')) setShowQr(false); }}>
              <div className="qr-modal">
                <button className="qr-modal-close" onClick={() => setShowQr(false)}>✕</button>
                <QrCodeBox value={usuario.qrCode} size={220} />
              </div>
            </div>
          )}
          <pre style={{background:'#222',color:'#fff',padding:8,marginTop:16,fontSize:12,maxHeight:120,overflow:'auto'}}>{debug}</pre>
        </div>
      </div>
    </div>
  );
}
