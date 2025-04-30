import React, { useState } from "react";
import Login from "./componentes/Login";
import Registro from "./componentes/Registro";
import Cuerpo from "./componentes/Cuerpo";

function App() {
  const [vista, setVista] = useState("login");
  const [usuario, setUsuario] = useState(null);

  if (vista === "login") {
    return <Login onCrearUsuario={() => setVista("registro")} onLogin={u => { setUsuario(u); setVista("cuerpo"); }} />;
  }
  if (vista === "registro") {
    return <Registro onVolver={() => setVista("login")} />;
  }
  if (vista === "cuerpo" && usuario) {
    return <Cuerpo usuario={usuario} />;
  }
  return null;
}

export default App;
