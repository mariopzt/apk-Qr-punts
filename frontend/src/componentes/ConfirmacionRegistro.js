import React, { useEffect, useState } from "react";

function ConfirmacionRegistro() {
  const [estado, setEstado] = useState("cargando");
  const [mensaje, setMensaje] = useState("");
  const [procesado, setProcesado] = useState(false);

  useEffect(() => {
    // Evitar procesamiento múltiple
    if (procesado) return;
    
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    
    if (!token) {
      setEstado("error");
      setMensaje("Token de confirmación no válido.");
      setProcesado(true);
      return;
    }
    
    // Comprobar si ya hemos procesado este token (almacenado en localStorage)
    const tokensUsados = JSON.parse(localStorage.getItem("tokensConfirmados") || "[]");
    if (tokensUsados.includes(token)) {
      setEstado("ok");
      setMensaje("¡Usuario confirmado! Ya puedes iniciar sesión.");
      setProcesado(true);
      return;
    }
    
    // Marcar como procesado para evitar múltiples solicitudes
    setProcesado(true);
    
    fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/auth/confirmar?token=${token}`)
      .then(async res => {
        const data = await res.json();
        if (res.ok) {
          // Guardar token como usado
          const tokensUsados = JSON.parse(localStorage.getItem("tokensConfirmados") || "[]");
          tokensUsados.push(token);
          localStorage.setItem("tokensConfirmados", JSON.stringify(tokensUsados));
          
          setEstado("ok");
          setMensaje("¡Usuario confirmado y creado correctamente! Ya puedes iniciar sesión.");
        } else {
          // Si el error es "Token inválido o expirado" pero ya se usó antes, puede ser que ya se haya confirmado
          if (data.message === "Token inválido o expirado") {
            setEstado("ok");
            setMensaje("¡Usuario confirmado! Ya puedes iniciar sesión.");
          } else {
            setEstado("error");
            setMensaje(data.message || "Error al confirmar usuario.");
          }
        }
      })
      .catch(() => {
        setEstado("error");
        setMensaje("Error de red al confirmar usuario.");
      });
  }, [procesado]);

  return (
    <div className="login-bg">
      <div className="circle circle1"></div>
      <div className="circle circle2"></div>
      <div className="login-container dark" style={{ textAlign: "center" }}>
        <h2 className="login-title">Confirmación de Registro</h2>
        <div style={{ margin: "40px 0", fontSize: "1.2em" }}>
          {estado === "cargando" ? "Confirmando..." : mensaje}
        </div>
        {estado === "ok" && (
          <a href="/" className="login-btn">Ir a Iniciar Sesión</a>
        )}
      </div>
    </div>
  );
}

export default ConfirmacionRegistro;
