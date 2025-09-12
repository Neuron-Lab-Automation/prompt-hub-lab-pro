# PromptHub v2

PromptHub v2 es una plataforma avanzada para la gestión, optimización y testing de prompts de IA con soporte multi-modelo, billing basado en tokens y un potente sistema de evaluación.

## 🚀 Características Principales

### Core del Producto
- **Generación Asistida**: Creación de prompts con sugerencias contextuales y plantillas
- **Análisis Avanzado**: Evaluación de robustez, seguridad, exactitud y creatividad
- **Testing Multi-Modelo**: Soporte para ChatGPT, Claude, Gemini, DeepSeek, Azure OpenAI, Replicate y Ollama
- **Biblioteca Inteligente**: Búsqueda, etiquetas, favoritos e histórico de ejecuciones
- **Exportación/Importación**: Con validación y versionado completo

### Funcionalidades Avanzadas
- **Motor de Mejora**: Sistema configurable para optimizar prompts existentes
- **Traducción Automática**: Soporte simultáneo ES/EN con sincronización de metadatos
- **Evaluación Sistemática**: Suites de testing con criterios personalizables
- **Métricas Detalladas**: Tracking de tokens, visitas, copias, CTR y más

### UI/UX Moderna
- **Design System**: Componentes consistentes con tema oscuro y accesibilidad AA
- **Playground Avanzado**: Editor profesional con comparativa multi-modelo
- **Dashboard Analytics**: Estadísticas en tiempo real y series temporales
- **Responsive**: Optimizado para mobile, tablet y desktop

## 🏗️ Arquitectura

### Frontend
- **React 18** con TypeScript
- **Tailwind CSS** para styling
- **Lucide React** para iconografía
- **Vite** como build tool

### Backend (Futuro)
- **Supabase** como BaaS (Base de datos + Auth + Storage + Edge Functions)
- **PostgreSQL** con Row Level Security (RLS)
- **Edge Functions (Deno)** para lógica de negocio
- **Clerk** para autenticación avanzada

### Integraciones Planificadas
- **Stripe** para billing y suscripciones
- **OpenAI API** para modelos GPT
- **Anthropic API** para Claude
- **Replicate API** para modelos open-source

## 🎯 Estado Actual

Este es el **sistema base** con:
- ✅ Interfaz completa y funcional
- ✅ Componentes UI modernos
- ✅ Sistema de prompts con modal ES/EN
- ✅ Playground con simulación de ejecución
- ✅ Filtros, búsqueda y paginación
- ✅ Métricas y estadísticas mockadas
- ✅ Estructura de datos completa

### Por Implementar (Próximas Fases)
- 🔄 Integración con Supabase
- 🔄 Autenticación con Clerk
- 🔄 Billing con Stripe
- 🔄 APIs reales de IA
- 🔄 Sistema de mejora automática
- 🔄 Traducción automática
- 🔄 Evaluación con IA

## 🚀 Instalación y Uso

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
```

## 📊 Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes base reutilizables
│   ├── PromptCard.tsx  # Tarjeta de prompt
│   ├── PromptModal.tsx # Modal con tabs ES/EN
│   ├── Playground.tsx  # Editor y testing
│   └── ...
├── types/              # Definiciones TypeScript
├── data/               # Datos mock y configuración
├── lib/                # Utilities y helpers
└── App.tsx             # Componente principal
```

## 🎨 Design System

### Colores
- **Primary**: Azul (#3B82F6) para acciones principales
- **Secondary**: Gris para elementos secundarios
- **Success**: Verde para estados positivos
- **Warning**: Amarillo para advertencias
- **Error**: Rojo para errores

### Tipografía
- **Headings**: Inter con line-height 120%
- **Body**: Inter con line-height 150%
- **Code**: Mono para prompts

### Spacing
- **Sistema 8px**: Espaciado consistente basado en múltiplos de 8px

## 📈 Próximos Pasos

1. **Configurar Supabase**: Base de datos y autenticación
2. **Integrar Clerk**: Sistema de roles y permisos
3. **Implementar Stripe**: Billing y gestión de tokens
4. **Conectar APIs de IA**: OpenAI, Anthropic, etc.
5. **Sistema de mejora**: Motor inteligente de optimización
6. **Testing avanzado**: Evaluación automática multi-criterio

## 🔐 Seguridad

- **RLS**: Row Level Security en todas las tablas
- **ABAC**: Control de acceso basado en atributos
- **Secrets**: Gestión segura de API keys
- **CORS**: Configuración restrictiva
- **Rate Limiting**: Protección contra abuso

## 📝 Licencia

Propietario - PromptHub v2

---

Para más información técnica, consulta la documentación en `/docs/`.