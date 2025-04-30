import React, { useState } from "react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div style={{ maxWidth: 350, margin: "auto", marginTop: 80, padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
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
      <button style={{ width: "100%", padding: 8, marginTop: 12 }}>Entrar</button>
    </div>
  );
}

export default Login;
