import React, { useState } from "react";
import Login from "./componentes/Login";
import Register from "./componentes/Register";
import CuerpoNuevo from "./componentes/CuerpoNuevo";
import CuerpoAdminNuevo from "./componentes/CuerpoAdminNuevo";
import ConfirmacionRegistro from "./componentes/ConfirmacionRegistro";

function App() {
  const [vista, setVista] = useState("login");
  const [usuario, setUsuario] = useState(null);

  // Mostrar confirmación de registro si la URL contiene ?token=...
  if (typeof window !== "undefined" && window.location.search.includes("token=")) {
    return <ConfirmacionRegistro />;
  }

  if (vista === "login") {
    return <Login onCrearUsuario={() => setVista("registro")} onLogin={u => { setUsuario(u); setVista("cuerpo"); }} />;
  }
  if (vista === "registro") {
    return <Register onGoToLogin={() => setVista("login")} />;
  }
  if (vista === "cuerpo" && usuario) {
    if (usuario.tipo === "root") {
      return <CuerpoAdminNuevo usuario={usuario} setUsuario={setUsuario} />;
    }
    return <CuerpoNuevo usuario={usuario} setUsuario={setUsuario} />;
  }
  return null;
}

export default App;
