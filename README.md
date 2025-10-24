# Cat Breeds Frontend App

Aplicación Angular para explorar razas de gatos, construida con Angular 18, TypeScript y diseño responsive.

## Tecnologías

- **Angular** 18.2.18
- **TypeScript** 5.x
- **RxJS** - Programación reactiva
- **SCSS** - Estilos
- **Standalone Components** - Arquitectura moderna de Angular

## Estructura del Proyecto

```
src/app/
├── components/         # Componentes de la aplicación
│   ├── breeds-list/   # Lista y detalle de razas
│   ├── breed-search/  # Búsqueda de razas
│   ├── login/         # Autenticación
│   ├── register/      # Registro de usuarios
│   └── profile/       # Perfil de usuario
├── services/          # Servicios (Breed, Auth)
├── guards/            # Guards de autenticación
├── interceptors/      # HTTP Interceptors
├── models/            # Interfaces TypeScript
└── environments/      # Configuración de entornos
```

## Instalación

```bash
npm install
```

## Configuración

Edita `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

## Ejecución

```bash
# Desarrollo
ng serve
# Abre http://localhost:4200

# Producción
ng build
```

## Funcionalidades

### Vista de Razas (Breeds List)
- Dropdown para seleccionar razas
- Carrusel de imágenes con navegación
- Información detallada de cada raza
- Características visuales con barras de progreso
- Tabla completa de todas las razas

### Búsqueda (Search)
- Input de búsqueda con filtro en tiempo real
- Tabla de resultados filtrados
- Contador de resultados
- Botón para limpiar búsqueda

### Autenticación
- **Login**: Formulario reactivo con validaciones
- **Registro**: Crear nueva cuenta
- **Perfil**: Vista protegida con guard
- **JWT**: Tokens almacenados y enviados automáticamente

### Diseño
- **Responsive**: Optimizado para móvil, tablet y desktop
- **Navbar**: Navegación dinámica según estado de autenticación
- **Gradientes**: Diseño moderno con colores vibrantes

## Arquitectura

### Componentes Standalone
Todos los componentes usan la nueva arquitectura standalone de Angular

### Servicios
- **BreedService**: Comunicación con API de razas
- **AuthService**: Gestión de autenticación con BehaviorSubject

### Guards
- **authGuard**: Protege rutas privadas (ej. /profile)

### Interceptors
- **authInterceptor**: Agrega JWT token a todas las peticiones HTTP

## Testing

```bash
ng test
```

## Docker

```bash
docker build -t cat-frontend .
docker run -p 80:80 cat-frontend
```

##  Rutas

| Ruta | Descripción | Protegida |
|------|-------------|-----------|
| `/breeds` | Lista y detalle de razas | No |
| `/search` | Búsqueda de razas | No |
| `/login` | Iniciar sesión | No |
| `/register` | Registro | No |
| `/profile` | Perfil de usuario | Sí |

---

Desarrollado con Angular CLI 18.2.18
