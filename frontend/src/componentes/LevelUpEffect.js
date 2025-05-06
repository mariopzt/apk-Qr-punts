import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import '../estilos/levelUpEffect.css';

const LevelUpEffect = ({ level, onComplete }) => {
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [showEffect, setShowEffect] = useState(true);
  
  useEffect(() => {
    // Actualizar dimensiones si cambia el tamaño de la ventana
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    // Mostrar el efecto por 5 segundos
    const timer = setTimeout(() => {
      setShowEffect(false);
      if (onComplete) onComplete();
    }, 5000);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [onComplete]);
  
  return (
    <div className="level-up-effect-container">
      {showEffect && (
        <>
          <Confetti
            width={dimensions.width}
            height={dimensions.height}
            recycle={true}
            numberOfPieces={150}
            gravity={0.2}
            colors={['#FFD700', '#FFFF00', '#FFFFFF', '#32CD32', '#00FFFF']}
          />
          <div className="level-up-message">
            <div className="level-up-title">¡NIVEL SUBIDO!</div>
            <div className="level-up-level">Nivel {level}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default LevelUpEffect;
