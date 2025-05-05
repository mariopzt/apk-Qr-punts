import React, { useState } from "react";
import "../estilos/login.css";
import "../estilos/login-extra.css";
import { registrarUsuario } from "./api";

function Register({ onLogin, onGoToLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await registrarUsuario(username, password, email);
      setSuccess("¡Registro exitoso! Ya puedes iniciar sesión.");
      if (onLogin && res.user) onLogin(res.user);
    } catch (err) {
      setError(err.message || "Error al registrar usuario");
    }
  };

  return (
    <div className="login-bg">
      <div className="circle circle1"></div>
      <div className="circle circle2"></div>
      <form className="login-container dark" onSubmit={handleRegister}>
        <h2 className="login-title">Crear Cuenta</h2>
        <button type="button" className="social-btn google">
          <span className="icon-g">G</span> Continua con Google
        </button>
        <button type="button" className="social-btn facebook">
          <span className="icon-f">f</span> Continua con Facebook
        </button>
        <div className="divider">o con</div>
        <input
          type="text"
          className="login-input"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Usuario"
        />
        <input
          type="email"
          className="login-input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Correo electrónico"
        />
        <input
          type="password"
          className="login-input"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Contraseña"
        />
        {error && <div className="login-error">{error}</div>}
        {success && <div className="login-success">{success}</div>}
        <button className="login-btn" type="submit">Registrarse</button>
        <div className="login-links">
          <span>¿Ya tienes cuenta? <a href="#" onClick={e => { e.preventDefault(); if (onGoToLogin) onGoToLogin(); }}>Iniciar sesión</a></span>
        </div>
      </form>
    </div>
  );
}

export default Register;
