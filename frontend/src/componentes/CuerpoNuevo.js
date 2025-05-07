import React, { useState, useEffect, useRef } from "react";
import QrCodeBox from "./QrCodeBox";
import ParticleEffect from "./ParticleEffect";
import LevelUpEffect from './LevelUpEffect';
import "../estilos/cuerpoNuevo.css";
import { socket } from "../socket";
import { getUsuarioByQrCode } from "./api";
import Historial from "./Historial";

export default function CuerpoNuevo({ usuario, setUsuario }) {
  console.log('[RENDER] usuario recibido por props:', usuario);
  const [showQr, setShowQr] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [nivel, setNivel] = useState(0);
  const [showParticleEffect, setShowParticleEffect] = useState(false);
  const [showLevelUpEffect, setShowLevelUpEffect] = useState(false);
  const [oldPoints, setOldPoints] = useState(usuario.totalPoints ?? 0);
  const [newPoints, setNewPoints] = useState(usuario.totalPoints ?? 0);
  const [showHistorial, setShowHistorial] = useState(false);
  const lastPoints = useRef(usuario.points ?? 0);
  const lastLevel = useRef(0);

  // Cada vez que los puntos suban y superen el múltiplo de 15 anterior, aumenta el nivel
  useEffect(() => {
    const puntos = usuario.totalPoints ?? 0;  
    const nextLevel = Math.floor(puntos / 15);
    const lastShownLevel = localStorage.getItem(`levelUpShown_${usuario.qrCode}`) || 0;
    
    setNivel(nextLevel);
    lastLevel.current = nextLevel;
    
    // Solo mostrar el efecto si el nivel actual es mayor que el último nivel en el que se mostró la animación
    if (nextLevel > parseInt(lastShownLevel) && nextLevel > 0) {
      // Guardar en localStorage que ya se mostró la animación para este nivel
      localStorage.setItem(`levelUpShown_${usuario.qrCode}`, nextLevel);
      // Mostrar efecto de subida de nivel
      setShowLevelUpEffect(true);
    }
  }, [usuario.totalPoints, usuario.qrCode]);

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
          // Guardar puntos antiguos antes de actualizar
          setOldPoints(usuario.totalPoints ?? 0);
          setNewPoints(res.user.totalPoints ?? 0);
          
          // Mostrar efecto de partículas
          setShowParticleEffect(true);
          
          // Actualizar usuario después de un pequeño retraso para que la animación sea visible
          setTimeout(() => {
            setUsuario({ ...usuario, ...res.user });
            console.log('[SOCKET] Puntos DESPUÉS de actualizar:', res.user.points);
          }, 100);
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

  // Si se está mostrando el historial, renderizar el componente Historial
  if (showHistorial) {
    return <Historial usuario={usuario} onBack={() => setShowHistorial(false)} />;
  }
  
  // Renderizar el efecto de subida de nivel si es necesario
  const levelUpEffectComponent = showLevelUpEffect ? (
    <LevelUpEffect 
      level={nivel} 
      onComplete={() => setShowLevelUpEffect(false)} 
    />
  ) : null;
  
  return (
    <div className="cuerpo-nuevo-bg">
      {levelUpEffectComponent}
      <div className="cuerpo-nuevo-container">
        <div className="cuerpo-nuevo-inner">
          <div className="row-balance-historial">
            <div className="balance-section">
              <div className="balance-label">Tu balance</div>
              <div className="balance-amount-container">
                {showParticleEffect ? (
                  <ParticleEffect 
                    oldValue={oldPoints} 
                    newValue={newPoints} 
                    onComplete={() => setShowParticleEffect(false)} 
                  />
                ) : (
                  <div className="balance-amount">
                    <span className="coin">💰</span> {usuario.totalPoints ?? 0}
                  </div>
                )}
              </div>
              <a className="boost-link" href="#">Como funciona?</a>
            </div>
           
          </div>
          <div className="section-title">Tu Espacio</div>
          <div className="boosters-list-row">
            <div className="booster-item" onClick={() => setShowHistorial(true)} style={{flex: 1, marginRight: 4, cursor: 'pointer'}}>
              <div className="booster-icon">📝</div>
              <div>
                <div className="booster-title">Historial</div>
                <div className="booster-sub silver">Ver tus escaneos</div>
              </div>
            </div>
            <div className="booster-item" style={{flex: 1, marginLeft: 4}}>
              <div className="booster-icon">🖐️</div>
              <div>
                <div className="booster-title">Nivel de usuario</div>
                <div className="booster-sub"> <span className="coin">💰</span> • {nivel} lvl</div>
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
