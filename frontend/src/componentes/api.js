// API helpers para login y registro
// Cambia la IP por la de tu PC en la red local
const API_URL = process.env.REACT_APP_API_URL;

export async function loginUsuario(username, password) {
  const res = await fetch(`${API_URL}/api/auth/login-local`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Error al iniciar sesión");
  }
  return await res.json();
}

export async function registrarUsuario(username, password, email) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, email })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Error al registrar");
  }
  return await res.json();
}

// Suma un punto al usuario identificado por el QR escaneado
export async function getUsuarioByQrCode(qrCode) {
  const res = await fetch(`${API_URL}/api/usuario/qr/${encodeURIComponent(qrCode)}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Error al obtener usuario");
  }
  return await res.json();
}

export async function sumarPuntoUsuario(qrCode) {
  const res = await fetch(`${API_URL}/api/puntos/sumar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qrCode })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Error al sumar punto");
  }
  return await res.json();
}

