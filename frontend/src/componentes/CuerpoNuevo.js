import React, { useState } from "react";
import QrCodeBox from "./QrCodeBox";
import "../estilos/cuerpoNuevo.css";

function CuerpoNuevo({ usuario }) {
  const [showQr, setShowQr] = useState(false);
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
          <div className="booster-item qr-booster" onClick={() => setShowQr(true)} style={{ cursor: 'pointer' }}>
            <div className="booster-icon">📱</div>
            <div>
              <div className="booster-title">Mostrar tu QR</div>
              <div className="booster-sub">Toca para ver tu código QR</div>
            </div>
          </div>
        </div>

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

export default CuerpoNuevo;
