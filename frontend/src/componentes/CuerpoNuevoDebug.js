import React, { useState, useEffect, useRef } from "react";
import QrCodeBox from "./QrCodeBox";
import { socket } from "../socket";
import "../estilos/cuerpoNuevo.css";
import { getUsuarioByQrCode } from "./api";

export default function CuerpoNuevoDebug({ usuario, setUsuario }) {
  console.log('[DEBUG usuario]', usuario);
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

  // Conexión socket: unirse a la sala del usuario y escuchar 'punto-sumado'
  useEffect(() => {
    if (!usuario?.qrCode) return;
    if (!socket.connected) socket.connect();
    socket.emit("join", usuario.qrCode);
    const handler = async () => {
      setDebug(d => d + `\n[SOCKET] Recibido punto-sumado para QR: ${usuario.qrCode}`);
      try {
        const res = await getUsuarioByQrCode(usuario.qrCode);
        setDebug(d => d + `\n[SOCKET] Nuevo points: ${res?.user?.points}`);
        if (res && res.user) {
          setUsuario({ ...usuario, ...res.user });
          setMensaje("¡Punto sumado!");
        }
        setShowQr(false);
        setTimeout(() => setMensaje(""), 2000);
      } catch (e) {
        setDebug(d => d + `\n[SOCKET] error: ${e}`);
      }
    };
    socket.on("punto-sumado", handler);
    return () => {
      socket.off("punto-sumado", handler);
    };
  }, [usuario, setUsuario]);

  // Efecto: si el mensaje es '¡Punto sumado!', fuerza showQr a false
  useEffect(() => {
    if (mensaje === "¡Punto sumado!") {
      // Forzar cierre del modal QR simulando click en el botón de cerrar
      setTimeout(() => {
        const btn = document.querySelector('.qr-modal-close');
        if (btn) {
          console.log('[FORCE CLOSE] Botón encontrado, haciendo click');
          btn.click();
        } else {
          console.log('[FORCE CLOSE] Botón NO encontrado');
        }
        setShowQr(false);
      }, 300);
    }
  }, [mensaje]);

  return (
    <div className="cuerpo-nuevo-bg">
      <div style={{background:'#ff5252',color:'#fff',fontSize:32,fontWeight:'bold',padding:24,textAlign:'center',zIndex:9999,position:'fixed',top:0,left:0,width:'100vw'}}>ESTÁS VIENDO CuerpoNuevoDebug.js</div>
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
          <div className="boosters-row">
            <div className="booster-card">
              <div className="booster-icon">🤖</div>
              <div>
                <div className="booster-title">Historial</div>
                <div className="booster-sub silver">Pedidos y descuentos</div>
              </div>
            </div>
            <div className="booster-card">
              <div className="booster-icon">🖐️</div>
              <div>
                <div className="booster-title">Nivel de usuario</div>
                <div className="booster-sub"> <span className="coin">🪙</span> • {Math.floor((usuario.points ?? 0) / 10)} lvl</div>
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

          {/* Efecto para cerrar el modal QR cuando el mensaje es '¡Punto sumado!' */}
          {/* Esto fuerza el cierre aunque el render esté retrasado */}
          
        </div>
      </div>
    </div>
  );
}
