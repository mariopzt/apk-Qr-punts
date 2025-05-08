import React, { useState } from "react";
import "../estilos/login.css";
import "../estilos/login-extra.css";
import { loginUsuario } from "./api";

function Login({ onCrearUsuario, onLogin, onForgotPassword }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await loginUsuario(username, password);
      setSuccess("¡Login correcto!");
      if (onLogin && res.user) onLogin(res.user);
    } catch (err) {
      if (err.message === "Usuario o contraseña incorrectos") {
        setError("No se encuentra ese usuario");
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="login-bg">
      <div className="circle circle1"></div>
      <div className="circle circle2"></div>
      <form className="login-container dark" onSubmit={handleLogin}>
        <h2 className="login-title">Iniciar Sesión</h2>
        <div style={{ width: '100%', margin: '5px 0 20px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', transition: 'all 0.3s ease', cursor: 'pointer', background: 'linear-gradient(to right, #2a2235, #2a2a40)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', borderLeft: '3px solid #ffb6fc' }}>
            <span style={{ fontSize: '1.6rem', marginRight: '14px', background: 'linear-gradient(#ffb6fc, #7b2ff2)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>📱</span>
            <span style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 500 }}>Escanea códigos QR para acumular puntos</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', transition: 'all 0.3s ease', cursor: 'pointer', background: 'linear-gradient(to right, #222245, #2a2a50)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', borderLeft: '3px solid #7b2ff2' }}>
            <span style={{ fontSize: '1.6rem', marginRight: '14px', background: 'linear-gradient(#ffb6fc, #7b2ff2)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>🏆</span>
            <span style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 500 }}>Canjea tus puntos por premios exclusivos</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', transition: 'all 0.3s ease', cursor: 'pointer', background: 'linear-gradient(to right, #252235, #2f2a45)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', borderLeft: '3px solid #b983ff' }}>
            <span style={{ fontSize: '1.6rem', marginRight: '14px', background: 'linear-gradient(#ffb6fc, #7b2ff2)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>🔔</span>
            <span style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 500 }}>Recibe notificaciones de nuevas promociones</span>
          </div>
        </div>
        <div style={{ 
          color: '#bbb', 
          fontSize: '0.96rem', 
          textAlign: 'center', 
          margin: '20px 0 16px 0', 
          position: 'relative', 
          fontWeight: 500, 
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%'
        }}>
          <div style={{ 
            height: '1px', 
            width: '30%', 
            background: 'linear-gradient(to right, transparent, #7b2ff2)',
            marginRight: '10px' 
          }}></div>
          <span>Iniciar sesión</span>
          <div style={{ 
            height: '1px', 
            width: '30%', 
            background: 'linear-gradient(to left, transparent, #7b2ff2)',
            marginLeft: '10px' 
          }}></div>
        </div>
        <input
          type="text"
          className="login-input"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Usuario"
        />
        <input
          type="password"
          className="login-input"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Contraseña"
        />
        {error && <div className="login-error">Error al iniciar sesión</div>}
        {success && <div className="login-success">{success}</div>}
        <button className="login-btn" type="submit">Iniciar</button>
        <div style={{ 
          color: '#bbb', 
          fontSize: '0.96rem', 
          textAlign: 'center', 
          margin: '20px 0 16px 0', 
          position: 'relative', 
          fontWeight: 500, 
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%'
        }}>
          <div style={{ 
            height: '1px', 
            width: '30%', 
            background: 'linear-gradient(to right, transparent, #b983ff)',
            marginRight: '10px' 
          }}></div>
          <span>Opciones</span>
          <div style={{ 
            height: '1px', 
            width: '30%', 
            background: 'linear-gradient(to left, transparent, #b983ff)',
            marginLeft: '10px' 
          }}></div>
        </div>
        <div className="login-links" style={{ marginTop: '10px' }}>
          <span>¿No tienes cuenta? <a href="#" onClick={e => { e.preventDefault(); onCrearUsuario(); }}>Crear Cuenta</a></span>
          <a href="#" className="forgot" onClick={e => { e.preventDefault(); if (onForgotPassword) onForgotPassword(); }}>¿Olvidaste tu contraseña?</a>
        </div>
      </form>
    </div>
  );
}

export default Login;
