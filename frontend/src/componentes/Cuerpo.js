import React from "react";

function Cuerpo({ usuario }) {
  return (
    <div style={{ padding: 32 }}>
      <h2>Bienvenido, {usuario.username}!</h2>
      <p>Email: {usuario.email || "No especificado"}</p>
      <p>QR: {usuario.qrCode}</p>
      <p>Puntos: {usuario.points}</p>
      {/* Aquí puedes mostrar más info o funcionalidades */}
    </div>
  );
}

export default Cuerpo;
