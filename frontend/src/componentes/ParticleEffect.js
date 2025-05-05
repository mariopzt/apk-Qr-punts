import React, { useEffect, useRef, useState } from 'react';

const ParticleEffect = ({ oldValue, newValue, onComplete }) => {
  const containerRef = useRef(null);
  const [particles, setParticles] = useState([]);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [showNewValue, setShowNewValue] = useState(false);
  
  // Mostrar inmediatamente el valor nuevo
  useEffect(() => {
    // Mostrar el nuevo valor casi inmediatamente
    setTimeout(() => {
      setShowNewValue(true);
    }, 50);
  }, []);
  
  // Crear partículas al iniciar
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const particleCount = 30; // Número de partículas
    
    // Crear partículas basadas en la posición del número
    const newParticles = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: rect.width / 2 + (Math.random() - 0.5) * 20,
        y: rect.height / 2 + (Math.random() - 0.5) * 20,
        size: 3 + Math.random() * 10,
        speedX: (Math.random() - 0.5) * 15,
        speedY: (Math.random() - 0.5) * 15,
        opacity: 1,
        color: Math.random() > 0.5 ? '#FFD700' : '#FFFFFF', // Oro o blanco
      });
    }
    
    setParticles(newParticles);
    
    // Iniciar animación - mostrar el nuevo valor casi inmediatamente
    setTimeout(() => {
      setShowNewValue(true);
      
      // Notificar cuando la animación termine
      setTimeout(() => {
        setAnimationComplete(true);
        if (onComplete) onComplete();
      }, 1000); // Reducido de 1500ms a 1000ms
    }, 300); // Reducido de 1000ms a 300ms para que aparezca más rápido
  }, [onComplete]);
  
  // Animar partículas
  useEffect(() => {
    if (particles.length === 0) return;
    
    let animationFrame;
    let lastTime = Date.now();
    
    const animate = () => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      
      setParticles(prevParticles => 
        prevParticles.map(particle => {
          // Actualizar posición
          const x = particle.x + particle.speedX * deltaTime * 2;
          const y = particle.y + particle.speedY * deltaTime * 2;
          
          // Reducir opacidad gradualmente
          const opacity = Math.max(0, particle.opacity - deltaTime * 0.8);
          
          return {
            ...particle,
            x,
            y,
            opacity
          };
        }).filter(p => p.opacity > 0.01) // Eliminar partículas invisibles
      );
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [particles]);
  
  if (animationComplete) return null;
  
  return (
    <div 
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {/* No mostramos el número antiguo, solo las partículas */}
      
      {/* Partículas */}
      {particles.map(particle => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            borderRadius: '50%',
            backgroundColor: particle.color,
            opacity: particle.opacity,
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`
          }}
        />
      ))}
      
      {/* Nuevo valor que aparece */}
      {showNewValue && (
        <div className="balance-amount particle-new-value" style={{
          position: 'absolute',
          animation: 'popIn 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
        }}>
          <span className="coin">🪙</span> {newValue}
        </div>
      )}
    </div>
  );
};

export default ParticleEffect;
