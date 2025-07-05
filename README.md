# FinSmart Frontend

Este es el frontend de la aplicación FinSmart, desarrollado en Angular 17.

## 🚀 Características

- **Feed de Posts**: Visualización dinámica de posts desde el backend
- **Creación de Posts**: Formulario para crear nuevos posts
- **Reacciones**: Sistema de likes, loves y laughs
- **Comentarios**: Sistema de comentarios en posts
- **Tipos de Posts**: Soporte para posts de texto, facturas y experiencias
- **Diseño Responsivo**: Interfaz moderna y adaptable

## 📋 Prerrequisitos

- Node.js (versión 18 o superior)
- npm o yarn
- Backend de FinSmart ejecutándose en `http://localhost:3000`

## 🛠️ Instalación

1. **Clonar el repositorio** (si no lo has hecho ya):
```bash
git clone <url-del-repositorio>
cd front-end
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Verificar configuración del backend**:
Asegúrate de que el backend esté ejecutándose en `http://localhost:3000` y que el endpoint `/api/posts` esté disponible.

## 🏃‍♂️ Ejecución

### Desarrollo
```bash
npm start
```
La aplicación se abrirá en `http://localhost:4200`

### Producción
```bash
npm run build
```

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── config/
│   │   └── api.config.ts          # Configuración de la API
│   ├── models/
│   │   └── post.model.ts          # Interfaces de datos
│   ├── services/
│   │   └── post.service.ts        # Servicio para posts
│   ├── interceptors/
│   │   └── http-error.interceptor.ts # Interceptor de errores HTTP
│   └── feed/
│       ├── components/
│       │   ├── create-post/       # Componente para crear posts
│       │   ├── post-factura/      # Componente de posts de facturas
│       │   ├── post-experiencia/  # Componente de posts de experiencias
│       │   └── sidebar/           # Barra lateral
│       ├── feed-list/             # Lista de posts
│       └── feed.ts                # Componente principal del feed
```

## 🔧 Configuración

### API Configuration
El archivo `src/app/config/api.config.ts` contiene la configuración de la API:

```typescript
export const API_CONFIG = {
  baseUrl: 'http://localhost:3000/api',
  endpoints: {
    posts: '/posts',
    users: '/users',
    invoices: '/invoices',
    contacts: '/contacts',
    friendRequests: '/friend-requests'
  }
};
```

### Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto si necesitas configuraciones específicas:

```env
API_BASE_URL=http://localhost:3000/api
```

## 📊 Funcionalidades

### Posts
- **Visualización**: Los posts se cargan dinámicamente desde el backend
- **Creación**: Formulario para crear nuevos posts con título, contenido y tipo
- **Reacciones**: Sistema de likes, loves y laughs
- **Comentarios**: Sistema de comentarios en posts

### Tipos de Posts
1. **Texto**: Posts simples de texto
2. **Factura**: Posts relacionados con facturas (con barra de progreso de inversiones)
3. **Experiencia**: Posts de experiencias compartidas

### Estados de la Aplicación
- **Loading**: Indicador de carga mientras se obtienen los posts
- **Error**: Manejo de errores con opción de reintentar
- **Empty**: Estado cuando no hay posts disponibles

## 🔌 Integración con Backend

El frontend se conecta con los siguientes endpoints del backend:

- `GET /api/posts` - Obtener todos los posts
- `POST /api/posts` - Crear nuevo post
- `POST /api/posts/:id/reactions` - Agregar reacción
- `POST /api/posts/:id/comments` - Agregar comentario

## 🎨 Estilos

El proyecto utiliza SCSS para los estilos con una estructura modular:

- **Variables**: Colores, tipografías y espaciados consistentes
- **Componentes**: Estilos específicos para cada componente
- **Responsive**: Diseño adaptable a diferentes tamaños de pantalla

## 🐛 Troubleshooting

### Error de CORS
Si encuentras errores de CORS, verifica que:
1. El backend esté ejecutándose en el puerto correcto
2. El backend tenga CORS configurado correctamente
3. La URL en `api.config.ts` sea la correcta

### Posts no se cargan
1. Verifica que el backend esté ejecutándose
2. Revisa la consola del navegador para errores
3. Verifica que el endpoint `/api/posts` esté disponible

### Errores de compilación
1. Ejecuta `npm install` para asegurar que todas las dependencias estén instaladas
2. Verifica que estés usando la versión correcta de Node.js
3. Limpia la caché: `npm run clean`

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

Para soporte técnico o preguntas, contacta al equipo de desarrollo o crea un issue en el repositorio.
