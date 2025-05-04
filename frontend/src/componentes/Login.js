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
        <h2 className="login-title">Iniciar.</h2>
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
          type="password"
          className="login-input"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Contraseña"
        />
        {error && <div className="login-error">Error al iniciar sesión</div>}
        {success && <div className="login-success">{success}</div>}
        <button className="login-btn" type="submit">Iniciar</button>
        <div className="login-links">
          <span>¿No tienes cuenta? <a href="#" onClick={e => { e.preventDefault(); onCrearUsuario(); }}>Crear Cuenta</a></span>
          <a href="#" className="forgot" onClick={e => { e.preventDefault(); if (onForgotPassword) onForgotPassword(); }}>¿Olvidaste tu contraseña?</a>
        </div>
      </form>
    </div>
  );
}

export default Login;
