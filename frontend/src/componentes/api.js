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

export async function sumarPuntoUsuario(qrCode, adminQrCode = null) {
  const res = await fetch(`${API_URL}/api/puntos/sumar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qrCode, adminQrCode })
  });
  let data = {};
  try {
    data = await res.clone().json();
  } catch (e) {
    data = {};
  }
  if (!res.ok) {
    console.error("Respuesta error sumar punto:", res.status, data);
    throw new Error(data.message || `Error HTTP ${res.status}`);
  }
  return data;
}

// Obtener historial de escaneos
export async function getHistorial() {
  try {
    const res = await fetch(`${API_URL}/api/historial`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || `Error HTTP ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error al obtener historial:", error);
    throw error;
  }
}

// Obtener historial de un usuario específico
export async function getHistorialUsuario(qrCode) {
  try {
    const res = await fetch(`${API_URL}/api/historial/${encodeURIComponent(qrCode)}`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || `Error HTTP ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error al obtener historial de usuario:", error);
    throw error;
  }
}

