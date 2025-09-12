# Proveedores de IA - PromptHub v2

## OpenAI

### Modelos Soportados

#### GPT-5
- **ID**: `gpt-5`
- **Descripción**: Modelo más avanzado de OpenAI
- **Costo**: $1.25/M input, $10/M output tokens
- **Max Tokens**: 128,000
- **Características**: Soporte completo para temperatura y top-p

#### GPT-5 Mini
- **ID**: `gpt-5-mini-2025-08-07`
- **Descripción**: Versión optimizada y económica de GPT-5
- **Costo**: $0.15/M input, $0.60/M output tokens
- **Max Tokens**: 128,000
- **Características especiales**: 
  - **NO** soporta controles de temperatura/top-p
  - Resultados deterministas
  - Ideal para tareas que requieren consistencia

### Configuración

Para configurar OpenAI, necesitarás:

1. **API Key**: Obtenible desde [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Base URL**: `https://api.openai.com/v1`
3. **Documentación**: [Revisar y seguir la guía oficial](https://platform.openai.com/docs/guides/latest-model)

### Particularidades de GPT-5 Mini

GPT-5 Mini tiene características especiales:
- Los controles de temperatura, top-p y otros parámetros de sampling **NO** se muestran en la UI
- Produce resultados deterministas por defecto
- Optimizado para velocidad y costo-eficiencia
- Ideal para casos de uso donde la consistencia es más importante que la creatividad

## Anthropic Claude

### Modelos Soportados

#### Claude 3.5 Sonnet
- **ID**: `claude-3-5-sonnet`
- **Descripción**: Modelo balanceado de Anthropic
- **Costo**: $3.00/M input, $15/M output tokens
- **Max Tokens**: 200,000
- **Características**: Soporte completo para parámetros

### Configuración

1. **API Key**: Desde [Anthropic Console](https://console.anthropic.com/)
2. **Base URL**: `https://api.anthropic.com`

## Replicate

### Configuración Dinámica

Replicate permite usar cualquier modelo con el formato `owner/model:version`:
- **Ejemplo**: `meta/llama-2-70b-chat`
- **Schema Dinámico**: La UI lee automáticamente los parámetros disponibles
- **Flexibilidad**: Soporte para modelos personalizados y de la comunidad

### Configuración

1. **API Token**: Desde [Replicate](https://replicate.com/account/api-tokens)
2. **Base URL**: `https://api.replicate.com/v1`

## Integración Futura

### Google Gemini
- Integración planificada
- Soporte para Gemini Pro y Ultra

### DeepSeek
- API en evaluación
- Modelos de código abierto

### Azure OpenAI
- Para clientes empresariales
- Compliance y privacidad adicional

### Ollama (Local)
- Para modelos locales
- Configuración opcional para entornos on-premise

## Configuración de Costos

### Estructura de Precios

Cada modelo tiene:
- **Costo Base**: Precio del proveedor por millón de tokens
- **Margen**: Porcentaje configurable por modelo y tipo (input/output)
- **FX Rate**: Conversión de divisa si es necesario

### Fórmula de Cálculo

```
precio_venta = costo_base × (1 + margen%) × fx_rate
```

Ejemplo con GPT-5 y margen del 50%:
- Input: $1.25/M × 1.5 = $1.88/M
- Output: $10/M × 1.5 = $15/M

### Configuración por Administrador

Los superadministradores pueden:
- Ajustar márgenes por modelo
- Configurar tipos de cambio
- Habilitar/deshabilitar modelos
- Establecer límites por plan

## Health Checks

El sistema verifica automáticamente:
- **Conectividad**: Estado de las APIs
- **Autenticación**: Validez de las claves
- **Cuotas**: Límites y uso actual
- **Latencia**: Tiempo de respuesta promedio

## Mapeo de Parámetros

### Estándar
- `temperature`: Control de creatividad (0-1)
- `top_p`: Nucleus sampling (0-1)
- `max_tokens`: Tokens máximos de output
- `frequency_penalty`: Penalización por repetición
- `presence_penalty`: Penalización por presencia

### Por Proveedor
Cada proveedor puede tener parámetros específicos que se mapean automáticamente en la configuración.

## Mejores Prácticas

1. **Selección de Modelo**: Elegir según caso de uso (creatividad vs consistencia)
2. **Gestión de Costos**: Monitorear uso y ajustar márgenes
3. **Rate Limiting**: Configurar límites apropiados por modelo
4. **Fallbacks**: Configurar modelos alternativos para alta disponibilidad
5. **Monitoring**: Alertas para fallos y latencia alta

## Troubleshooting

### Errores Comunes

- **401 Unauthorized**: Verificar API keys
- **429 Rate Limited**: Revisar límites del proveedor
- **500 Server Error**: Verificar estado del proveedor
- **Timeout**: Ajustar timeouts según el modelo

### Logs y Debugging

Todos los errores se registran con:
- Timestamp
- Proveedor y modelo
- Usuario afectado
- Detalles del error
- Contexto de la solicitud