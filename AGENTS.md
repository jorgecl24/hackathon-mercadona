# MercaPredict · Reglas del proyecto

Lema: «Nunca falta, nunca sobra». Prototipo de hackathon inspirado en el estilo visual de Mercadona.

## Alcance de esta rama (`feat/prediccion-stock`)

Solo la interfaz del **gestor de stock** de una tienda: previsión de demanda y propuesta de pedido.

Pantallas, por orden de prioridad:

1. **Propuesta de pedido (Auto-Order)**: pantalla principal.
2. **Previsión de producto** con panel de «Señales de futuro».
3. **Resumen de tienda**: 4 indicadores, mapa de calor por sección y lista «Requiere tu atención».
4. **Merma y caducidad**: alertas de fresco con riesgo de sobrar.

Fuera de alcance: mapa de tiendas para el cliente, login, backend real, móvil.

## Stack

- React 19 + TypeScript + Vite.
- Tailwind CSS + shadcn/ui + iconos de Lucide.
- Gráficos con Recharts (el de shadcn/ui).
- Datos simulados en `src/mocks/` con la forma de estos endpoints, para cambiarlos luego por el backend FastAPI:
  - `GET /api/alerts`
  - `GET /api/forecast?temp=`
  - `PATCH /api/tasks/{id}` (aceptar o ajustar una propuesta)
- Textos de la interfaz en español, con tuteo. Código e identificadores en inglés.

## Diseño

### Colores (variables CSS en `globals.css`)

```css
:root {
  --background: #FFFFFF;
  --foreground: #2B2B2B;
  --muted: #F5F5F2;
  --muted-foreground: #6B6B66;
  --border: #E3E3DE;
  --primary: #3F7D2B;          /* botón principal, texto blanco encima */
  --primary-foreground: #FFFFFF;
  --brand: #609E42;            /* cabecera, acentos, solo con texto grande */
  --warning: #FFA102;          /* exceso, merma, caducidad; texto oscuro */
  --warning-soft: #FFF1D6;
  --destructive: #D32F2F;      /* falta de stock */
  --destructive-soft: #FDE7E7;
  --success-soft: #E8F3E1;
  --radius: 0.75rem;
}
```

Gráficos: histórico gris `#6B6B66`, previsión verde `#3F7D2B`, banda de confianza `#CFE5C3`, eventos naranja `#FFA102`.
Mapa de calor (riesgo): bajo `#CFE5C3`, medio `#FFD966`, alto `#FFA102`, crítico `#D32F2F`.

Reparto de color: 70 % blanco y grises, 20 % verde, 10 % naranja y rojo.

### Estilo

- Fondo blanco, tarjetas con radio 12 px, borde 1 px `--border` y sombra muy suave. Sin degradados.
- Botones en forma de píldora (`rounded-full`), altura mínima 44 px, relleno verde y texto blanco. Secundario: borde verde sobre blanco.
- Tipografía Inter (respaldo `system-ui`). Pantalla 28 px bold, bloque 20 px semibold, texto 16 px, metadatos 14 px en gris.
- Cifras clave de 24–32 px bold con `tabular-nums`.
- Filas de tabla de 56 px con miniatura de producto (o icono de categoría).
- Espaciado en múltiplos de 8 px. Una sola acción principal por pantalla.
- Gráficos sobrios: líneas finas, sin 3D, etiquetas directas.
- No usar el logotipo de Mercadona. Usar el nombre «MercaPredict».

### Estados

| Estado | Color | Icono | Texto |
|---|---|---|---|
| Riesgo de rotura | Rojo | ▼ | «Falta» |
| Riesgo de exceso | Naranja | ▲ | «Sobra» |
| En línea | Verde | ✓ | «OK» |

El color nunca va solo: siempre icono y texto.

## Pantallas: detalle

### Propuesta de pedido

Tabla con columnas: Producto, Stock actual, Pedido habitual, **Sugerido** (negrita verde), Diferencia (↑ ↓), Motivo (chips), Confianza (Alta, Media, Baja), Acciones (Aceptar, Ajustar).

- Orden: mayor desviación primero.
- «Ajustar» edita la cantidad en la propia celda y pide un motivo opcional («Promoción local», «Obras», «Otro»).
- Botón verde arriba a la derecha: «Aceptar propuestas de confianza alta».
- Pie fijo con unidades, bultos y hora de corte del bloque logístico.

### Previsión de producto

- Gráfico de líneas: histórico (gris), previsión (verde) con banda de confianza y marcas de eventos (naranja).
- Selector de horizonte: 3, 7 o 14 días. Confianza visible («Confianza alta · 87 %»).
- Chips de factores: «Clima +34 ºC · +18 %», «Festivo · +25 %».
- Panel «Señales de futuro»: Clima, Calendario, Eventos locales, Tendencias e Histórico. Cada una muestra su efecto estimado y un interruptor para incluirla o excluirla, y la cifra sugerida se recalcula al cambiarlo.
- Chip «Histórico corto» y confianza más baja en productos nuevos o tiendas recientes.
- Control de temperatura y control de tendencia para la demo en directo.

### Resumen de tienda

- 4 tarjetas: Riesgo de rotura, Riesgo de merma, Pedidos por revisar, Precisión de la previsión (7 días).
- Mapa de calor por sección (fruta y verdura, lácteos, bebidas, carne…) con número y icono ▼ ▲ en cada celda.
- Lista «Requiere tu atención» con las 5 mayores desviaciones.

### Merma y caducidad

Tarjetas con fondo `--warning-soft`. Ejemplo: «Yogures Hacendado: stock 90, venta prevista 40, caducan en 3 días». Acciones: «Reducir próximo pedido» y «Avisar a tienda».

### Estructura

- Menú lateral colapsable: Resumen, Previsión, Pedido, Merma.
- Cabecera fija con tienda, fecha, hora de corte, temperatura prevista y selector de horizonte.
- Pantalla objetivo: ordenador y tablet apaisada (1024–1440 px).

## Microcopy

Frases cortas, verbo de acción al inicio y cifras visibles.

- «Te faltarán unos 120 L de leche el sábado» (no «Riesgo de stockout detectado»).
- «Pedido guardado» · «No hemos podido guardar. Inténtalo de nuevo».
- Sin propuestas: «Todo en orden. No hay desviaciones que revisar».

## Accesibilidad

- Contraste mínimo 4,5:1 en texto normal y 3:1 en texto grande. El verde `--brand` no cumple con texto blanco pequeño: usar `--primary`.
- Navegable con teclado. Respetar `prefers-reduced-motion`.
- Estados de carga con esqueletos, no solo spinner.

## Datos de ejemplo

Usar productos reales de supermercado (leche entera Hacendado, yogures, agua, helados, fruta) y 20–30 filas con valores coherentes entre sí: el sugerido debe tener sentido respecto al histórico y a los factores.

## Comandos

- `npm run dev` · `npm run build` · `npm run lint`
- Antes de dar una tarea por terminada: que `npm run build` y `npm run lint` pasen sin errores.

## Seguridad

Nunca escribir tokens, claves ni contraseñas en el código, en este archivo ni en commits. Usar `.env` (ignorado por git).
