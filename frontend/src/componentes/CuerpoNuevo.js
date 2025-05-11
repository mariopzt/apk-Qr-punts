import React, { useState, useEffect, useRef } from "react";
import QrCodeBox from "./QrCodeBox";
import ParticleEffect from "./ParticleEffect";
import LevelUpEffect from './LevelUpEffect';
import "../estilos/cuerpoNuevo.css";
import "../estilos/info-modal.css";
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
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showCafeModal, setShowCafeModal] = useState(false);
  const [showBurgerModal, setShowBurgerModal] = useState(false);
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
          setOldPoints(usuario.points ?? 0);
          setNewPoints(res.user.points ?? 0);
          
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
                    <span className="coin">💰</span> {usuario.points ?? 0}
                  </div>
                )}
              </div>
              <a className="boost-link" href="#" onClick={(e) => { e.preventDefault(); setShowInfoModal(true); }}>Como funciona?</a>
            </div>
           
          </div>
          <div className="section-title"></div>
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
              <div >
                <div className="booster-title">Nivel de usuario</div>
                <div className="booster-sub"> <span className="coin">🏆</span> • {nivel} lvl</div>
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


          <div className="section-title">Descubre ofertas!</div>
          <div className="boosters-row">
            <div className="booster-card" onClick={() => setShowBurgerModal(true)} style={{ cursor: 'pointer' }}>
              <div className="booster-title">Hamburguesas</div>
              <div className="booster-sub">15% descuento</div>
              <span className="booster-icon">🍔</span>
            </div>
            <div className="booster-card" onClick={() => setShowCafeModal(true)} style={{ cursor: 'pointer' }}>
              <div className="booster-title">Cafés y Postres</div>
              <div className="booster-sub">2x1 en bebidas</div>
              <span className="booster-icon">☕</span>
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
          
          {showCafeModal && (
            <div className="qr-modal-bg" onClick={e => { if (e.target.className.includes('qr-modal-bg')) setShowCafeModal(false); }}>
              <div className="qr-modal cafe-modal">
                <button className="qr-modal-close" onClick={() => setShowCafeModal(false)}>✕</button>
                <div className="cafe-modal-content">
                  <h2 className="cafe-modal-title">Cafés y Postres</h2>
                  <p className="cafe-modal-subtitle">Disfruta de nuestras especialidades con 2x1 en bebidas</p>
                  
                  <div className="cafe-item">
                    <div className="cafe-image" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1572442388796-11668a67e53d?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80")' }}></div>
                    <div className="cafe-details">
                      <h3>CAFÉ MOCHA ESPECIAL</h3>
                      <p>Espresso, chocolate, leche vaporizada, crema batida y canela</p>
                      <div className="cafe-price">€4.95</div>
                    </div>
                  </div>
                  
                  <div className="cafe-item">
                    <div className="cafe-image" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1571506297088-0d912f1497a4?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80")' }}></div>
                    <div className="cafe-details">
                      <h3>TARTA DE ZANAHORIA</h3>
                      <p>Bizcocho casero con nueces, canela y frosting de queso crema</p>
                      <div className="cafe-price">€5.50</div>
                    </div>
                  </div>
                  
                  <div className="cafe-item">
                    <div className="cafe-image" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80")' }}></div>
                    <div className="cafe-details">
                      <h3>FRAPPUCCINO CARAMELO</h3>
                      <p>Café, leche, hielo, caramelo, nata montada y topping de caramelo</p>
                      <div className="cafe-price">€6.25</div>
                    </div>
                  </div>
                  
                  <div className="cafe-item">
                    <div className="cafe-image" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80")' }}></div>
                    <div className="cafe-details">
                      <h3>CHEESECAKE DE FRUTOS ROJOS</h3>
                      <p>Base de galleta, queso crema, nata y cobertura de frutos rojos</p>
                      <div className="cafe-price">€5.95</div>
                    </div>
                  </div>
                  
                  <button className="cafe-modal-button" onClick={() => setShowCafeModal(false)}>Cerrar</button>
                </div>
              </div>
            </div>
          )}
          
          {showBurgerModal && (
            <div className="qr-modal-bg" onClick={e => { if (e.target.className.includes('qr-modal-bg')) setShowBurgerModal(false); }}>
              <div className="qr-modal cafe-modal burger-modal">
                <button className="qr-modal-close" onClick={() => setShowBurgerModal(false)}>✕</button>
                <div className="cafe-modal-content">
                  <h2 className="cafe-modal-title">Hamburguesas</h2>
                  <p className="cafe-modal-subtitle">Disfruta de un 15% de descuento en todas nuestras hamburguesas</p>
                  
                  <div className="cafe-item">
                    <div className="cafe-image" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80")' }}></div>
                    <div className="cafe-details">
                      <h3>BURGER DELUXE</h3>
                      <p>200g de ternera, queso cheddar, bacon, lechuga, tomate y salsa especial</p>
                      <div className="cafe-price">€9.95</div>
                    </div>
                  </div>
                  
                  <div className="cafe-item">
                    <div className="cafe-image" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1586190848861-99aa4a171e90?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80")' }}></div>
                    <div className="cafe-details">
                      <h3>BURGER VEGGIE</h3>
                      <p>Hamburguesa de legumbres, aguacate, rúcula, tomate y mayonesa vegana</p>
                      <div className="cafe-price">€8.50</div>
                    </div>
                  </div>
                  
                  <div className="cafe-item">
                    <div className="cafe-image" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1551782450-17144efb9c50?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80")' }}></div>
                    <div className="cafe-details">
                      <h3>BURGER BBQ</h3>
                      <p>Carne de ternera, queso ahumado, cebolla caramelizada y salsa barbacoa</p>
                      <div className="cafe-price">€10.25</div>
                    </div>
                  </div>
                  
                  <div className="cafe-item">
                    <div className="cafe-image" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80")' }}></div>
                    <div className="cafe-details">
                      <h3>BURGER DOBLE QUESO</h3>
                      <p>Doble carne, doble queso, pepinillos, cebolla y salsa secreta</p>
                      <div className="cafe-price">€11.95</div>
                    </div>
                  </div>
                  
                  <button className="cafe-modal-button" onClick={() => setShowBurgerModal(false)}>Cerrar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
