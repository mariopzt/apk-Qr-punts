import React from "react";
import QrCodeBox from "./QrCodeBox";

function Cuerpo({ usuario }) {
  return (
    <div style={{ padding: 32 }}>
      <h2>Bienvenido, {usuario.username}!</h2>
      <p>Email: {usuario.email || "No especificado"}</p>
      <QrCodeBox value={usuario.qrCode} />
      <p>Puntos: {usuario.points}</p>
      {/* Aquí puedes mostrar más info o funcionalidades */}
    </div>
  );
}

export default Cuerpo;
