# Ángeles Sin Alas - Plataforma de Encuestas

Plataforma web interactiva para recopilar datos mediante encuestas incentivadas, diseñada para la asociación Ángeles Sin Alas que apoya a niños en cuidados paliativos y sus familias en las Islas Baleares.

## Características Principales

### Sistema de Encuestas
- Encuesta principal de 10 preguntas (5 EUR de recompensa)
- 5 encuestas adicionales especializadas (1 EUR cada una)
- Interfaz responsive con modo oscuro/claro
- Validación de respuestas en tiempo real

### Sistema de Recompensas
- Pagos automáticos por completar encuestas
- Integración con PayPal para retiros
- Mínimo de retiro: 5 EUR
- Historial de transacciones

### Sistema de Referidos
- Códigos únicos de referido por usuario
- Bonus de 10 EUR al alcanzar 10 referidos
- Seguimiento visual del progreso
- Enlaces compartibles

### Panel de Usuario
- Balance actualizado en tiempo real
- Progreso de referidos con indicador circular
- Estado de encuestas completadas
- Carrusel informativo sobre la asociación

## Tecnologías Utilizadas

### Frontend
- HTML5 con estructura semántica
- Tailwind CSS para estilos responsivos
- JavaScript vanilla para interactividad
- SVG para iconos y elementos gráficos

### Backend
- Node.js con Express
- PostgreSQL como base de datos
- bcrypt para seguridad de contraseñas
- JWT para autenticación

### Hosting
- Railway para despliegue automático
- GitHub para control de versiones

## Estructura del Proyecto

```
angeles-sin-alas/
├── public/
│   ├── index.html          # Página principal
│   ├── carrousel1.png      # Imagen del carrusel 1
│   ├── carrousel2.png      # Imagen del carrusel 2
│   ├── carrousel3.png      # Imagen del carrusel 3
│   └── logo.png           # Logo de la asociación
├── server.js              # Servidor Express
├── schema.sql             # Esquema de base de datos PostgreSQL
├── package.json           # Dependencias y scripts
└── README.md             # Este archivo
```

## Instalación y Configuración

### Configuración Local
```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/angeles-sin-alas.git
cd angeles-sin-alas

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Configurar base de datos
psql -U postgres -d tu_base_de_datos -f schema.sql

# 5. Iniciar servidor de desarrollo
npm run dev
```

### Variables de Entorno
```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/angeles_sin_alas
NODE_ENV=development
JWT_SECRET=tu_jwt_secret_muy_seguro
PAYPAL_CLIENT_ID=tu_paypal_client_id
PAYPAL_CLIENT_SECRET=tu_paypal_client_secret
```

## Despliegue en Railway

### Pasos
1. Conectar repositorio: Vincular GitHub con Railway
2. Agregar PostgreSQL: Crear servicio de base de datos
3. Ejecutar schema: Importar estructura de tablas
4. Configurar variables: Establecer DATABASE_URL
5. Desplegar: Railway detecta cambios automáticamente

### URL de Producción
```
https://tu-proyecto.railway.app
```

## APIs Disponibles

### Encuestas
```http
GET /api/surveys              # Obtener todas las encuestas
GET /api/surveys/:id/questions # Obtener preguntas de encuesta
POST /api/surveys/:id/submit   # Enviar respuestas
```

### Usuario
```http
GET /api/user/dashboard       # Panel de usuario
POST /api/user/withdraw       # Solicitar retiro
GET /api/user/transactions    # Historial de transacciones
```

### Sistema
```http
GET /api/health              # Estado del sistema
GET /api/stats               # Estadísticas generales
```

## Características de Diseño

- Responsive design con móvil first
- Modo oscuro/claro con persistencia
- Animaciones suaves y transiciones
- Grid CSS para layout adaptativo
- Carrusel automático con indicadores

## Base de Datos

### Tablas Principales
- **users**: Datos de usuarios y balance
- **surveys**: Catálogo de encuestas disponibles
- **survey_questions**: Preguntas de cada encuesta
- **user_survey_responses**: Respuestas de usuarios
- **transactions**: Historial de pagos y retiros
- **referrals**: Sistema de referidos

### Funciones Destacadas
- `get_user_balance()`: Calcula balance actual
- `process_survey_reward()`: Procesa recompensas
- `check_referral_bonus()`: Verifica bonus de referidos

---

**Desarrollado para ayudar a niños en cuidados paliativos**