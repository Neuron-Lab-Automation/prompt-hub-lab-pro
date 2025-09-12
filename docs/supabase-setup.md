# Configuración de Supabase para PromptHub v2

## 1. Configuración Inicial

### Variables de Entorno
Asegúrate de tener estas variables en tu archivo `.env`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
OPENAI_API_KEY=tu-openai-key
OPENROUTER_API_KEY=tu-openrouter-key
```

### Migraciones de Base de Datos

1. **Ejecutar migraciones iniciales**:
   ```bash
   # En el dashboard de Supabase, ve a SQL Editor
   # Ejecuta el contenido de: supabase/migrations/create_initial_schema.sql
   ```

2. **Poblar datos iniciales**:
   ```bash
   # Ejecuta el contenido de: supabase/migrations/seed_initial_data.sql
   ```

3. **Crear funciones RPC**:
   ```bash
   # Ejecuta el contenido de: supabase/functions/_shared/rpc.sql
   ```

## 2. Edge Functions

### Desplegar Functions
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link al proyecto
supabase link --project-ref tu-project-ref

# Deploy functions
supabase functions deploy execute-prompt
supabase functions deploy improve-prompt
supabase functions deploy translate-prompt
```

### Configurar Secrets
```bash
# Configurar secrets para las functions
supabase secrets set OPENAI_API_KEY=tu-openai-key
supabase secrets set OPENROUTER_API_KEY=tu-openrouter-key
```

## 3. Configuración de Seguridad

### Row Level Security (RLS)
- ✅ Habilitado en todas las tablas
- ✅ Políticas configuradas por rol y propiedad
- ✅ System prompts protegidos

### Políticas Principales

#### Prompts
- **Lectura**: Todos los usuarios autenticados
- **Escritura**: Solo propietarios (excepto system prompts)
- **System prompts**: Solo superadmin/admin

#### Executions
- **Lectura/Escritura**: Solo propietario

#### Stats y Métricas
- **Lectura**: Todos los usuarios
- **Escritura**: Solo via RPC functions

## 4. Autenticación

### Configuración de Auth
1. En Supabase Dashboard → Authentication → Settings
2. Habilitar Email/Password
3. Configurar redirect URLs para desarrollo y producción
4. Opcional: Configurar providers sociales (Google, GitHub, etc.)

### Roles y Permisos
- `superadmin`: Acceso completo
- `admin`: Gestión de contenido y usuarios
- `editor`: Creación y edición de prompts
- `viewer`: Solo lectura
- `user`: Usuario estándar (default)

## 5. Storage (Futuro)

### Buckets Planificados
- `exports`: Para exportación de prompts
- `imports`: Para importación de prompts
- `avatars`: Para fotos de perfil

## 6. Monitoring y Logs

### Métricas Importantes
- Uso de tokens por usuario/plan
- Latencia de Edge Functions
- Errores de API
- Uso de base de datos

### Logs de Auditoría
- Todas las acciones críticas se registran en `audit_logs`
- Incluye: usuario, acción, recurso, IP, user agent
- Retención configurable

## 7. Backup y Recuperación

### Backup Automático
- Supabase maneja backups automáticos
- Point-in-time recovery disponible
- Exportación manual via Dashboard

### Disaster Recovery
- Replicación cross-region disponible en planes Pro+
- Scripts de migración versionados
- Datos de configuración en código

## 8. Performance

### Índices Optimizados
- ✅ Índices en columnas frecuentemente consultadas
- ✅ Índices compuestos para queries complejas
- ✅ Índices parciales para filtros específicos

### Caching
- Supabase maneja caching automático
- Edge Functions con cache de configuración
- Frontend con React Query (futuro)

## 9. Escalabilidad

### Límites Actuales
- **Starter**: 500MB DB, 1GB bandwidth
- **Pro**: 8GB DB, 250GB bandwidth
- **Enterprise**: Ilimitado

### Optimizaciones
- Paginación en todas las listas
- Lazy loading de datos pesados
- Compresión de respuestas

## 10. Troubleshooting

### Problemas Comunes

#### Error de Conexión
```bash
# Verificar variables de entorno
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

#### RLS Bloqueando Queries
```sql
-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'prompts';
```

#### Edge Functions Fallando
```bash
# Ver logs
supabase functions logs execute-prompt
```

### Comandos Útiles

```bash
# Ver estado del proyecto
supabase status

# Reset local DB
supabase db reset

# Generar tipos TypeScript
supabase gen types typescript --local > src/types/database.ts
```

## 11. Próximos Pasos

1. **Integrar Clerk**: Para autenticación avanzada
2. **Configurar Stripe**: Para billing y suscripciones
3. **Implementar Webhooks**: Para sincronización
4. **Añadir Monitoring**: Con Sentry o similar
5. **Configurar CI/CD**: Para deploys automáticos