import React, { useState } from "react";
import Login from "./componentes/Login";
import Registro from "./componentes/Registro";

function App() {
  const [vista, setVista] = useState("login");

  return vista === "login"
    ? <Login onCrearUsuario={() => setVista("registro")} />
    : <Registro onVolver={() => setVista("login")} />;
}

export default App;
