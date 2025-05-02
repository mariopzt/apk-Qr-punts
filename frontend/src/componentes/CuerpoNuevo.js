import React, { useState } from "react";
import QrCodeBox from "./QrCodeBox";
import "../estilos/cuerpoNuevo.css";

import { useEffect } from "react";
import { getUsuarioByQrCode } from "./api";

import { useRef } from "react";

function CuerpoNuevo({ usuario, setUsuario }) {
  const [showQr, setShowQr] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const lastPoints = useRef(usuario.points ?? 0);

  // Solo abrir QR modal desde el botón, y cerrar al recibir el evento

  React.useEffect(() => {
    const handler = (e) => {
      console.log('[DEBUG] Evento qr-punto-sumado recibido:', e.detail, 'QR usuario:', usuario.qrCode, 'showQr:', showQr);
      if (e.detail && e.detail.qrCode === usuario.qrCode) {
        setShowQr(false);
        setMensaje("¡Punto sumado!");
        setTimeout(() => setMensaje(""), 2000);
      }
    };
    window.addEventListener('qr-punto-sumado', handler);
    return () => window.removeEventListener('qr-punto-sumado', handler);
  }, [usuario.qrCode]);

  // Elimina cualquier otra llamada a setShowQr(true) fuera del botón


  console.log('[DEBUG] Render principal CuerpoNuevo, showQr:', showQr);
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
          <div className="booster-item qr-booster" onClick={() => { console.log('[DEBUG] Botón QR pulsado'); setShowQr(true); }} style={{ cursor: 'pointer' }}>
            <div className="booster-icon">📱</div>
            <div>
              <div className="booster-title">Mostrar tu QR</div>
              <div className="booster-sub">Toca para ver tu código QR</div>
            </div>
          </div>
        </div>

        {(() => { console.log('[DEBUG] Render modal QR, showQr:', showQr); return showQr ? (
          <div className="qr-modal-bg" onClick={e => { if (e.target.className.includes('qr-modal-bg')) setShowQr(false); }}>
            <div className="qr-modal">
              <button className="qr-modal-close" onClick={() => setShowQr(false)}>✕</button>
              <QrCodeBox value={usuario.qrCode} size={220} />
            </div>
          </div>
        ) : null })()}
      </div>
      </div>
    </div>
  );
}

export default CuerpoNuevo;
