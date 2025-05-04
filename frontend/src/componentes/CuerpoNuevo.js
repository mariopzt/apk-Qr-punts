import React, { useState, useEffect, useRef } from "react";
import QrCodeBox from "./QrCodeBox";
import "../estilos/cuerpoNuevo.css";
import { socket } from "../socket";
import { getUsuarioByQrCode } from "./api";

export default function CuerpoNuevo({ usuario, setUsuario }) {
  console.log('[RENDER] usuario recibido por props:', usuario);
  const [showQr, setShowQr] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const lastPoints = useRef(usuario.points ?? 0);

  useEffect(() => {
    if (!usuario?.qrCode) return;
    let joined = false;
    const doJoin = () => {
      if (!joined) {
        console.log('[SOCKET] Emitiendo join a sala:', usuario.qrCode);
        socket.emit('join', usuario.qrCode);
        joined = true;
      }
    };
    if (!socket.connected) {
      console.log('[SOCKET] Intentando conectar...');
      socket.connect();
      socket.once('connect', () => {
        console.log('[SOCKET] Conectado con id:', socket.id);
        doJoin();
      });
    } else {
      console.log('[SOCKET] Ya conectado con id:', socket.id);
      doJoin();
    }
    const handler = async () => {
      console.log('[SOCKET] Recibido evento punto-sumado');
      console.log('[SOCKET] Puntos ANTES de actualizar:', usuario.points);
      setShowQr(false);
      setMensaje("¡Punto sumado!");
      setTimeout(() => setMensaje(""), 2000);
      try {
        console.log('[SOCKET] Llamando a getUsuarioByQrCode:', usuario.qrCode);
        const res = await getUsuarioByQrCode(usuario.qrCode);
        console.log('[SOCKET] Respuesta getUsuarioByQrCode:', res);
        if (res && res.user) {
          setUsuario({ ...usuario, ...res.user });
          console.log('[SOCKET] Puntos DESPUÉS de actualizar:', res.user.points);
        }
      } catch (e) {
        console.error("Error actualizando usuario:", e);
      }
    };
    socket.on('punto-sumado', handler);
    return () => {
      socket.off('punto-sumado', handler);
      socket.off('connect');
    };
  }, [usuario.qrCode, setUsuario]);

  return (
    <div className="cuerpo-nuevo-bg">
      <div className="cuerpo-nuevo-container">
        <div className="cuerpo-nuevo-inner">
          <div className="balance-section">
            <div className="balance-label">Tu balance</div>
            <div className="balance-amount">
              <span className="coin">🪙</span> {usuario.points ?? 0}
            </div>
            <a className="boost-link" href="#">Como funciona?</a>
          </div>

          <div className="section-title">Descubre fertas!</div>
          <div className="boosters-row">
            <div className="booster-card">
              <div className="booster-title">Descuentos</div>
              <div className="booster-sub">0/3 disponibles</div>
              <span className="booster-icon">🚀</span>
            </div>
            <div className="booster-card">
              <div className="booster-title">Comida Rapida</div>
              <div className="booster-sub">0/3 available</div>
              <span className="booster-icon">⚡</span>
            </div>
          </div>

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
            {/* Mostrar SIEMPRE el botón para ver el QR, aunque el usuario tenga puntos */}
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
        </div>
      </div>
    </div>
  );
}
