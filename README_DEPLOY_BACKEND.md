# Despliegue Backend Railway — Estructura y Pasos Correctos

## 1. Estructura recomendada del repo

```
/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── .env.example
│   └── ...
├── frontend/
├── nixpacks.toml
```

- **NO pongas package.json ni server.js en la raíz.**
- El archivo `nixpacks.toml` debe estar en la raíz del repo.

---

## 2. Contenido correcto de nixpacks.toml

```toml
[phases.setup]
working_directory = "backend"
```

---

## 3. package.json en backend/

Debe contener:
```json
{
  "name": "qr-punts-backend",
  "version": "1.0.0",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "axios": "^1.6.7",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "mongoose": "^8.14.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.3"
  }
}
```

---

## 4. Variables de entorno en Railway

- Ve a "Variables" en Railway y añade:
  - `MONGODB_URI` (tu cadena de conexión de MongoDB)
  - `PORT` (puedes dejarlo vacío o poner `5000`)

---

## 5. Pasos para el deploy

1. Sube el repo completo con la estructura anterior.
2. Verifica que el archivo `nixpacks.toml` esté en la raíz.
3. Haz deploy en Railway.
4. Si tienes errores, elimina el servicio y créalo de nuevo para que lea bien la estructura.

---

¿Dudas? ¿Errores? Copia aquí el mensaje exacto y te lo soluciono.
