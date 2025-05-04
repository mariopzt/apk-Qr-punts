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
        <h2 className="login-title">Sign in.</h2>
        <button type="button" className="social-btn google">
          <span className="icon-g">G</span> Continue with Google
        </button>
        <button type="button" className="social-btn facebook">
          <span className="icon-f">f</span> Continue with Facebook
        </button>
        <div className="divider">or</div>
        <input
          type="text"
          className="login-input"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          className="login-input"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
        />
        {error && <div className="login-error">{error}</div>}
        {success && <div className="login-success">{success}</div>}
        <button className="login-btn" type="submit">Sign in</button>
        <div className="login-links">
          <span>Dont have an account? <a href="#" onClick={e => { e.preventDefault(); onCrearUsuario(); }}>Create Account</a></span>
          <a href="#" className="forgot" onClick={e => { e.preventDefault(); if (onForgotPassword) onForgotPassword(); }}>Forgot Password?</a>
        </div>
      </form>
    </div>
  );
}

export default Login;
