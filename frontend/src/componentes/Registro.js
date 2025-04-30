import React, { useState } from "react";
import "../estilos/login.css";

function Registro({ onVolver }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la llamada a la API de registro
    setMensaje("Usuario registrado (simulado)");
  };

  return (
    <form className="login-container" onSubmit={handleSubmit}>
      <h2>Crear usuario</h2>
      <div>
        <label>
          Usuario
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
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
            required
            placeholder="Contraseña"
          />
        </label>
      </div>
      <div>
        <label>
          Gmail
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="correo@gmail.com"
          />
        </label>
      </div>
      {mensaje && <div style={{ color: 'green', marginBottom: 8 }}>{mensaje}</div>}
      <button style={{ width: "100%", padding: 8, marginTop: 12 }}>Registrar</button>
      <div style={{ textAlign: 'center', marginTop: 18 }}>
        <a href="#" style={{ color: '#1e90ff', textDecoration: 'underline', fontSize: '1rem' }} onClick={onVolver}>
          Volver a login
        </a>
      </div>
    </form>
  );
}

export default Registro;
