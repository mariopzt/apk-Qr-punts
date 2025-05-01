# Despliegue del Frontend en Vercel/Netlify

## 🚀 Desplegar solo el frontend

1. **Sube solo la carpeta `frontend/`**
   - Puedes arrastrar solo la carpeta `frontend` al dashboard de Vercel o Netlify.
   - O crea un nuevo repositorio con solo el contenido de `frontend`.

2. **En Vercel:**
   - Si subes todo el repo, en "Root Directory" pon: `frontend`
   - Vercel detectará automáticamente React y hará el build.

3. **En Netlify:**
   - "Publish directory": pon `build` (Netlify detecta React y hace build automáticamente).

4. **Variables de entorno:**
   - Si necesitas variables de entorno para el frontend (por ejemplo, endpoints de API), créalas en la sección de "Environment Variables" de Vercel/Netlify.

5. **URL de despliegue:**
   - Cuando termine el deploy, tendrás una URL HTTPS tipo `https://tu-app.vercel.app`.
   - ¡Desde ahí funcionará el lector QR con cámara en el móvil!

---

## 🎯 Recomendaciones
- El backend (API/Express) **no se despliega aquí**. Puedes dejarlo local, o subirlo a Render, Railway, etc.
- Si tu frontend necesita conectarse al backend, asegúrate de que la URL de la API sea pública y esté configurada en las variables de entorno del frontend.

---

¿Dudas? ¿Quieres guía para desplegar el backend? ¡Avísame!
