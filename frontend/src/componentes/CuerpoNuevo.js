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
          <div className="balance-label">Your balance</div>
          <div className="balance-amount">
            <span className="coin">🪙</span> {usuario.points ?? 0}
          </div>
          <a className="boost-link" href="#">How boost works</a>
        </div>

        <div className="section-title">Descubre fertas!</div>
        <div className="boosters-row">
          <div className="booster-card">
            <div className="booster-title">Turbo</div>
            <div className="booster-sub">3/3 available</div>
            <span className="booster-icon">🚀</span>
          </div>
          <div className="booster-card">
            <div className="booster-title">Full Energy</div>
            <div className="booster-sub">3/3 available</div>
            <span className="booster-icon">⚡</span>
          </div>
        </div>

        <div className="section-title">Boosters</div>
        <div className="boosters-list">
          <div className="booster-item locked">
            <div className="booster-icon">🤖</div>
            <div>
              <div className="booster-title">Tap bot</div>
              <div className="booster-sub silver">Silver league</div>
            </div>
          </div>
          <div className="booster-item">
            <div className="booster-icon">🖐️</div>
            <div>
              <div className="booster-title">Multitap</div>
              <div className="booster-sub">100 <span className="coin">🪙</span> • 0 lvl</div>
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
              <div style={{ marginTop: 12, color: '#fff', fontSize: 15 }}>{usuario.qrCode}</div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

export default CuerpoNuevo;
