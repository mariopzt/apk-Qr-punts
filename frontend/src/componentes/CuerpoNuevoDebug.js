import React, { useState, useEffect, useRef } from "react";
import QrCodeBox from "./QrCodeBox";
import "../estilos/cuerpoNuevo.css";
import "../estilos/info-modal.css";
import { socket } from "../socket";
import { getUsuarioByQrCode } from "./api";

export default function CuerpoNuevoDebug({ usuario, setUsuario }) {
  const [showQr, setShowQr] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const lastPoints = useRef(usuario.points ?? 0);

  

useEffect(() => {
    if (!usuario?.qrCode) return;
    if (!socket.connected) socket.connect();
    socket.emit('join', usuario.qrCode);
    const handler = async () => {
      console.log('[SOCKET] Recibido punto-sumado, cerrando modal QR');
      setShowQr(false);
      setMensaje("¡Punto sumado!");
      setTimeout(() => setMensaje(""), 2000);
      try {
        const res = await getUsuarioByQrCode(usuario.qrCode);
        if (res && res.user) setUsuario({ ...usuario, ...res.user });
      } catch (e) {
        console.error("Error actualizando usuario:", e);
      }
    };
    socket.on('punto-sumado', handler);
    return () => {
      socket.off('punto-sumado', handler);
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
            <a className="boost-link" href="#" onClick={(e) => { e.preventDefault(); setShowInfoModal(true); }}>Como funciona?</a>
          </div>

          <div className="section-title">Descubre ofertas!</div>
          <div className="boosters-row">
            <div className="booster-card">
              <div className="booster-title">Hamburguesas</div>
              <div className="booster-sub">15% descuento</div>
              <span className="booster-icon">🍔</span>
            </div>
            <div className="booster-card">
              <div className="booster-title">Cafés y Postres</div>
              <div className="booster-sub">2x1 en bebidas</div>
              <span className="booster-icon">☕</span>
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
                <div className="booster-sub"> <span className="coin">🏆</span> • 0 lvl</div>
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

          {showInfoModal && (
            <div className="qr-modal-bg" onClick={e => { if (e.target.className.includes('qr-modal-bg')) setShowInfoModal(false); }}>
              <div className="qr-modal info-modal">
                <button className="qr-modal-close" onClick={() => setShowInfoModal(false)}>✕</button>
                <div className="info-modal-content">
                  <h2 className="info-modal-title">¿Cómo funciona la app?</h2>
                  
                  <div className="info-item">
                    <div className="info-icon">📱</div>
                    <div className="info-text">
                      <h3>Escanea códigos QR</h3>
                      <p>Busca códigos QR en establecimientos asociados y escanéalos para acumular puntos en tu cuenta.</p>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-icon">🏆</div>
                    <div className="info-text">
                      <h3>Sube de nivel</h3>
                      <p>Por cada 15 puntos acumulados, subirás un nivel. ¡Cuanto más alto sea tu nivel, mejores recompensas podrás obtener!</p>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-icon">💰</div>
                    <div className="info-text">
                      <h3>Canjea tus puntos</h3>
                      <p>Utiliza tus puntos acumulados para obtener descuentos exclusivos y promociones especiales en tus tiendas favoritas.</p>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-icon">🔔</div>
                    <div className="info-text">
                      <h3>Recibe notificaciones</h3>
                      <p>Mantente informado sobre nuevas promociones, ofertas especiales y eventos exclusivos para usuarios de la app.</p>
                    </div>
                  </div>
                  
                  <button className="info-modal-button" onClick={() => setShowInfoModal(false)}>¡Entendido!</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}