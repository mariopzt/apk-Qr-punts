// API helpers para login y registro
// Cambia la IP por la de tu PC en la red local
export async function loginUsuario(username, password) {
  const res = await fetch("http://192.168.1.144:5000/api/auth/login-local", {
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
  const res = await fetch("http://192.168.1.144:5000/api/auth/register", {
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
