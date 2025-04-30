import React, { useState } from "react";
import "../estilos/login.css";
import { loginUsuario } from "./api";

function Login({ onCrearUsuario, onLogin }) {
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
    <form className="login-container" onSubmit={handleLogin}>
      <h2>Login</h2>
      <div>
        <label>
          Usuario
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ width: "100%", margin: "8px 0", padding: 6 }}
            placeholder="Usuario"
          />
        </label>
      </div>
      <div>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: "100%", margin: "8px 0", padding: 6 }}
            placeholder="Contraseña"
          />
        </label>
      </div>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}
      <button style={{ width: "100%", padding: 8, marginTop: 12 }}>Entrar</button>
      <div style={{ textAlign: 'center', marginTop: 18 }}>
        <a href="#" style={{ color: '#1e90ff', textDecoration: 'underline', fontSize: '1rem' }} onClick={e => { e.preventDefault(); onCrearUsuario(); }}>
          Crear usuario
        </a>
      </div>
    </form>
  );
}

export default Login;
