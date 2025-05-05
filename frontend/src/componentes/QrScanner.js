import React, { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';

const QrScanner = ({ onScan, onError }) => {
  const [startScan, setStartScan] = useState(false);
  const [invalidQrMessage, setInvalidQrMessage] = useState(false);

  // Limpiar el mensaje de error después de 2 segundos
  useEffect(() => {
    let timer;
    if (invalidQrMessage) {
      timer = setTimeout(() => {
        setInvalidQrMessage(false);
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [invalidQrMessage]);

  const handleScan = (result) => {
    if (result) {
      const qrText = result?.text || result;
      // Solo QR válidos si contienen el dominio de tu app
      if (qrText && qrText.includes("apk-qr-punts-43y9.vercel.app")) {
        onScan(qrText);
        setStartScan(false);
      } else {
        setInvalidQrMessage(true);
        // El escáner sigue activo para nuevos intentos
      }
    }
  };


  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', position: 'relative' }}>
      {invalidQrMessage && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '18px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          textAlign: 'center'
        }}>
          QR no válido
        </div>
      )}
      <div style={{ 
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ 
          textAlign: 'center',
          marginBottom: '15px',
          color: '#333',
          fontSize: '24px'
        }}>
          Scan QR Code
        </h2>
        <p style={{ 
          textAlign: 'center',
          color: '#666',
          marginBottom: '20px'
        }}>
          Scan the booking QR code from your confirmation email
        </p>
        
        {startScan ? (
          <div style={{ width: '100%', height: '300px' }}>
            <QrReader
              onResult={handleScan}
              onError={onError}
              constraints={{ facingMode: 'environment' }}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        ) : (
          <div style={{ 
            display: 'flex',
            gap: '10px',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => setStartScan(true)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f0f0f0',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Scan code
            </button>
            <button
              onClick={() => {/* Handle manual code entry */}}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f0f0f0',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Enter code
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QrScanner;
