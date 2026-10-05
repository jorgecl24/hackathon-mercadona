# Guía de diseño · MercaPredict

**«Nunca falta, nunca sobra»** · Herramienta de previsión de stock para el gestor de stock de cada tienda y mapa de disponibilidad para el cliente, inspirada en el estilo visual de Mercadona.

## 1. Principios de diseño

El usuario es el gestor de stock de la tienda: decide cuánto pedir, con qué antelación y qué hacer con el fresco en riesgo. La interfaz le ayuda a decidir mejor con datos históricos, clima, festivos y eventos, no a ejecutar tareas en el lineal. Una segunda vista, para el cliente, muestra dónde hay stock cerca (sección 10).

- **Decidir, no reaccionar.** El gestor trabaja con un horizonte de 3 a 14 días. Cada pantalla propone una cantidad y le deja decidir.
- **Mirar al futuro, no solo al pasado.** Cada propuesta combina el histórico con señales de lo que viene: clima, festivos, eventos locales y tendencias. Esas señales se ven y se pueden activar o desactivar para simular su efecto.
- **Explicar la predicción.** Toda cifra sugerida muestra por qué (clima, festivo, evento, tendencia, histórico) y su nivel de confianza. Sin eso, el gestor no se fía.
- **La excepción primero.** Lo normal se aprueba en bloque; lo atípico (riesgo de rotura o de merma) sube arriba.
- **Aceptar o ajustar en un clic.** Cada propuesta se acepta, se corrige o se rechaza sin salir de la tabla. Lo que el gestor corrige realimenta el modelo.
- **Denso pero limpio.** Tablas y gráficos con muchos datos, pero con fondo blanco, jerarquía clara y color solo cuando significa algo.
- **El color nunca va solo.** Cada estado lleva también icono y texto.

## 2. Paleta de colores

Base tomada del logotipo de Mercadona (verde manzana + naranja, con rojo como color histórico y de alerta). Los hex son aproximaciones de fuentes públicas, no del manual de marca oficial; los marcados como *derivado* son ajustes nuestros para garantizar contraste.

| Rol | Nombre | Hex | Uso |
|---|---|---|---|
| Marca | Verde manzana | `#609E42` | Cabecera, iconos activos, fondos de acento, barras de progreso |
| Acción (derivado) | Verde botón | `#3F7D2B` | Botón principal («Aceptar»), enlaces. Texto blanco encima: contraste 5:1 |
| Acento | Naranja | `#FFA102` | Avisos, riesgo de exceso y merma, caducidad próxima. Usar con texto oscuro |
| Urgente (derivado) | Rojo | `#D32F2F` | Riesgo alto de rotura y desviaciones críticas. Texto blanco: contraste 5:1 |
| Fondo | Blanco | `#FFFFFF` | Fondo general y tarjetas |
| Fondo suave | Gris cálido | `#F5F5F2` | Fondo de página detrás de las tarjetas |
| Borde | Gris claro | `#E3E3DE` | Bordes de tarjetas y separadores |
| Texto | Casi negro | `#2B2B2B` | Texto principal |
| Texto secundario | Gris medio | `#6B6B66` | Metadatos, ayudas |
| Éxito suave | Verde claro | `#E8F3E1` | Fondo de tarea completada |
| Aviso suave | Naranja claro | `#FFF1D6` | Fondo de tarjeta en aviso |
| Urgente suave | Rojo claro | `#FDE7E7` | Fondo de tarjeta crítica |

**Regla de uso:** 70 % blanco/grises, 20 % verde, 10 % naranja y rojo juntos. Si la pantalla se ve muy roja o naranja, hay demasiadas alertas: el sistema debe priorizar.

**Contraste:** el verde `#609E42` con texto blanco solo da ~3:1, así que se reserva para fondos grandes con texto de 18 px en negrita o más, o para elementos decorativos. Para botones y texto pequeño sobre verde, usar `#3F7D2B`.

**Gráficos:** histórico en gris `#6B6B66`, previsión en verde `#3F7D2B`, banda de confianza en verde claro `#CFE5C3` y eventos o festivos en naranja `#FFA102`. Falta de stock en rojo, exceso en naranja.

### Escala del mapa de calor (riesgo de rotura o exceso a 3 días)

| Riesgo | Color | Hex |
|---|---|---|
| Bajo | Verde claro | `#CFE5C3` |
| Medio | Amarillo | `#FFD966` |
| Alto | Naranja | `#FFA102` |
| Crítico | Rojo | `#D32F2F` |

Cada celda muestra además el nombre de la sección y un número (% de riesgo o unidades). Un icono indica el sentido: ▼ falta stock, ▲ sobra stock.

## 3. Tipografía

Mercadona no publica su tipografía, así que usamos una sans-serif humanista, redondeada y muy legible.

- **Familia:** Inter (por defecto en Shadcn) o Nunito Sans como alternativa más amable.
- **Respaldo:** `system-ui, sans-serif`.
- **Título de pantalla:** 28 px, bold.
- **Título de bloque o gráfico:** 20 px, semibold.
- **Texto base y tablas:** 16 px en tablet, 14–16 px en ordenador.
- **Metadatos** (fecha, origen del dato, unidades): 14 px, color texto secundario.
- **Botones:** 16–18 px, semibold.
- **Cifras clave** (stock actual, cantidad sugerida, desviación): 24–32 px, bold, con cifras tabulares (`tabular-nums`) para que las columnas se alineen.

## 4. Estilo de interfaz (el «look Mercadona»)

- **Fondo blanco y verde como firma:** cabecera blanca o verde con el logo MercaPredict a la izquierda; el resto de la pantalla, blanca.
- **Tarjetas redondeadas:** radio de 12 px, borde de 1 px `#E3E3DE`, sombra muy suave. Sin degradados ni efectos.
- **Botones tipo píldora:** radio completo, relleno verde, texto blanco, altura mínima 44 px. Secundario: borde verde, fondo blanco.
- **Producto reconocible:** foto o miniatura del artículo sobre fondo blanco en cada fila de la tabla, como en un catálogo de supermercado. Sin foto, icono de categoría.
- **Etiquetas (chips)** pequeñas para categoría, estado y factores de la previsión: «Lácteos», «Falta», «Clima +34 ºC».
- **Iconografía:** trazo simple, 2 px, esquinas redondeadas (Lucide, ya incluido con Shadcn).
- **Gráficos sobrios:** líneas finas, sin 3D, sin cuadrículas pesadas y con etiquetas directas en lugar de leyendas cuando sea posible.
- **Sin ruido:** una sola acción principal por pantalla, sin pop-ups ni animaciones decorativas.
- **Espaciado generoso:** múltiplos de 8 px; separación mínima de 16 px entre tarjetas.

## 5. Componentes clave

### Resumen de tienda

Es la pantalla de inicio del gestor. Arriba, cuatro indicadores en tarjetas:

- **Riesgo de rotura:** productos en riesgo en los próximos 3 días.
- **Riesgo de merma:** frescos con exceso de stock.
- **Pedidos por revisar:** propuestas pendientes antes de la hora de corte.
- **Precisión de la previsión:** últimos 7 días.

Debajo, el mapa de calor por sección (fruta y verdura, lácteos, bebidas, carne…) con la escala de la sección 2. A la derecha, la lista «Requiere tu atención» con las cinco mayores desviaciones.

### Previsión de producto

Gráfico de líneas con tres capas: ventas históricas (gris), previsión (verde) con su banda de confianza (verde claro) y marcas de eventos (naranja): festivos, partidos, fiestas locales, ola de calor.

Debajo, chips con los factores que mueven la cifra: «Clima +34 ºC · +18 %», «Festivo · +25 %», «Fiestas del barrio · +12 %». Selector de horizonte (3, 7 o 14 días) y nivel de confianza visible: «Confianza alta · 87 %».

### Señales de futuro

Panel lateral junto al gráfico de previsión. Cada señal muestra su efecto estimado en unidades o en porcentaje y un interruptor para incluirla o excluirla, de modo que el gestor ve qué cambia la cifra sugerida cuando se quita o se añade.

| Señal | Ejemplos | Cómo se muestra |
|---|---|---|
| Clima | Temperatura y lluvia previstas a 7 días | Icono del tiempo y efecto: «+34 ºC · +18 % bebida fría» |
| Calendario | Festivos, puentes, vacaciones escolares, fin de mes | Marca en el eje del gráfico y chip «Puente · +25 %» |
| Eventos locales | Fiestas del barrio, partidos, conciertos | Marca naranja en el gráfico y chip con el nombre del evento |
| Tendencias | Producto en alza en búsquedas o redes, receta viral | Flecha ↑ y chip «Tendencia al alza · +12 %» |
| Histórico | Misma semana de años anteriores | Línea gris de fondo en el gráfico |

**Poco histórico.** En productos nuevos o tiendas recientes, la previsión se apoya en productos y tiendas similares. Se muestra un chip «Histórico corto» y la confianza baja a «Media» o «Baja» para que el gestor lo tenga en cuenta.

### Propuesta de pedido (Auto-Order)

Pantalla principal del MVP. Una tabla con estas columnas:

| Columna | Contenido |
|---|---|
| Producto | Miniatura, nombre y sección |
| Stock actual | Unidades en tienda y almacén |
| Pedido habitual | Lo que se pediría sin la previsión |
| Sugerido | Cantidad propuesta, en negrita verde |
| Diferencia | Flecha ↑ ↓ y unidades respecto al habitual |
| Motivo | Chips de factores: clima, festivo, evento, histórico |
| Confianza | Alta, media o baja |
| Acciones | Aceptar y Ajustar |

Las filas van ordenadas por mayor desviación primero. «Ajustar» edita la cantidad en la propia celda y pide un motivo opcional («Promoción local», «Obras», «Otro»); ese dato realimenta el modelo. Arriba a la derecha, un botón verde: «Aceptar propuestas de confianza alta». Un pie fijo resume unidades, bultos y hora de corte del bloque logístico.

### Alertas de caducidad y merma

Tarjeta con fondo naranja claro e icono de hoja o reloj. Ejemplo: «Yogures Hacendado: stock 90, venta prevista 40, caducan en 3 días». Acciones: «Reducir próximo pedido» y «Avisar a tienda para moverlos a zona visible».

### Seguimiento: previsión frente a realidad

Gráfico semanal que compara la previsión con la venta real y muestra la desviación por sección. Sirve para detectar sesgos (por ejemplo, que siempre sobre en frescos) y para que el gestor gane confianza en el modelo.

### Etiquetas de estado

| Estado | Color | Icono | Texto |
|---|---|---|---|
| Riesgo de rotura | Rojo | ▼ | «Falta» |
| Riesgo de exceso | Naranja | ▲ | «Sobra» |
| En línea | Verde | ✓ | «OK» |

### Estados vacíos y de carga

- **Sin propuestas:** ilustración sencilla y «Todo en orden. No hay desviaciones que revisar».
- **Cargando:** esqueletos grises con las formas de las tablas y gráficos, nunca solo un spinner.
- **Sin conexión:** banda naranja superior «Mostrando la última previsión · hace 12 min».

## 6. Estructura y navegación

- **Dispositivo:** ordenador de la oficina de tienda y tablet apaisada (1024–1440 px). El móvil queda fuera del MVP.
- **Menú lateral izquierdo,** colapsable, con icono y texto: Resumen · Previsión · Pedido · Merma · Eventos.
- **Cabecera fija** con tienda, fecha, hora de corte del próximo pedido, temperatura prevista y selector de horizonte (3, 7 o 14 días). La temperatura recuerda por qué la IA propone lo que propone.
- **Orden de las listas:** siempre de mayor a menor desviación, para empezar por lo que más importa.
- **Objetivos clicables:** mínimo 44 × 44 px, con 8 px de separación.
- **Filas de tabla:** 56 px de alto, con miniatura de producto, para escanear rápido sin que se vea apretado.

## 7. Tono y microcopy

Tuteo, verbos de acción al inicio y cifras siempre visibles.

| En lugar de… | Escribir… |
|---|---|
| «Riesgo de stockout detectado» | «Te faltarán unos 120 L de leche el sábado» |
| «Task completed successfully» | «Pedido guardado» |
| «Error 500» | «No hemos podido guardar. Inténtalo de nuevo» |
| «Merma proyectada» | «Sobrarán 50 yogures: caducan antes de venderse» |

## 8. Accesibilidad

- Contraste mínimo 4,5:1 en texto normal y 3:1 en texto grande.
- Estado siempre con color **y** icono **y** texto.
- Navegable con teclado (tabulador e intro) para trabajar rápido en tablas largas, y con objetivos táctiles amplios en tablet.
- Respetar la preferencia del sistema de movimiento reducido.

## 9. Tokens para Tailwind / Shadcn

Variables CSS para `globals.css` (formato Shadcn):

```css
:root {
  --background: #FFFFFF;
  --foreground: #2B2B2B;
  --muted: #F5F5F2;
  --muted-foreground: #6B6B66;
  --border: #E3E3DE;
  --primary: #3F7D2B;            /* botón principal */
  --primary-foreground: #FFFFFF;
  --brand: #609E42;              /* cabecera, acentos */
  --warning: #FFA102;
  --warning-soft: #FFF1D6;
  --destructive: #D32F2F;        /* falta de stock */
  --destructive-soft: #FDE7E7;
  --success-soft: #E8F3E1;
  --radius: 0.75rem;             /* 12 px */
}
```

**Extensión de Tailwind:** añadir `brand`, `warning` y `success-soft` en `theme.extend.colors`, apuntando a estas variables. Para el botón principal («Aceptar»), usar el componente `Button` de Shadcn con `rounded-full h-12 px-6 text-lg`.

## 10. App del cliente: mapa de tiendas con stock

El cliente abre el mapa, busca un producto y ve de un vistazo qué Mercadona cercano lo tiene. Es una vista distinta a la del gestor: móvil primero, más simple y con la misma paleta y el mismo estilo de tarjetas.

### Principios para el cliente

- **Una sola pregunta:** «¿Dónde lo encuentro cerca?». El buscador es lo primero que se ve y ocupa la parte superior de la pantalla.
- **Disponibilidad en lenguaje sencillo, no cifras exactas.** «Hay stock», «Quedan pocas unidades» o «Sin stock». El dato puede cambiar en minutos, por eso se muestra siempre «Actualizado hace X min».
- **Sin registro para consultar.** La ubicación se pide en el momento, con un motivo claro, y hay alternativa por código postal.
- **Móvil primero** (360–430 px), con adaptación a escritorio.

### Pantalla principal: mapa y buscador

- Buscador arriba, a todo el ancho, con autocompletado («leche entera Hacendado») y sugerencias por categoría.
- Mapa de fondo con estilo claro (grises y blancos) para que los marcadores destaquen, centrado en la ubicación del cliente.
- Marcadores circulares con el color y el icono de disponibilidad. La tienda recomendada (la más cercana con stock) es algo mayor.
- Hoja inferior deslizante con la lista de tiendas, ordenada con la tienda con stock más cercana primero.
- Chips de filtro: «Abierto ahora», «Menos de 2 km», «Tiene todo mi lista».

### Estados de disponibilidad

| Estado | Color | Icono | Texto | Cuándo |
|---|---|---|---|---|
| Hay stock | Verde `#3F7D2B` | ✓ | «Hay stock» | Stock suficiente para lo que queda de día |
| Pocas unidades | Naranja `#FFA102` | ! | «Quedan pocas unidades» | La previsión indica riesgo de rotura en las próximas horas |
| Sin stock | Rojo `#D32F2F` | ✕ | «Sin stock» | Agotado ahora mismo |
| Sin datos | Gris `#6B6B66` | – | «Sin datos» | La tienda no ha actualizado el inventario |

El estado «Pocas unidades» sale de la misma previsión que usa el gestor, así que la predicción también mejora lo que ve el cliente.

### Tarjeta de tienda

De arriba abajo: nombre y dirección, distancia y tiempo de trayecto, horario («Abierto hasta las 21:30»), chip de disponibilidad del producto buscado, texto «Actualizado hace 4 min» y dos botones: **Cómo llegar** (verde, principal) y **Ver detalle** (secundario). El detalle añade el pasillo del producto, por ejemplo «Pasillo 4».

### Búsqueda de varios productos («Mi lista»)

El cliente añade productos a una lista y el mapa marca las tiendas que lo tienen todo. Si ninguna lo tiene, muestra la mejor opción y qué falta: «Tiene 4 de 5 · sin stock: tofu». Así evita ir de tienda en tienda pinchando y buscando.

### Estados vacíos y mensajes

- **Sin resultados:** «No hemos encontrado ese producto. Prueba con otro nombre».
- **Sin stock cerca:** «Ahora mismo no hay stock cerca. Amplía la búsqueda a 10 km».
- **Sin ubicación:** «Escribe tu código postal para ver las tiendas cercanas».
- **Sin conexión:** banda naranja «Mostrando los últimos datos · hace 12 min».

### Datos y privacidad

- Al cliente solo se le muestra el estado de disponibilidad, nunca el stock exacto, los pedidos ni la merma de la tienda.
- La ubicación se usa para ordenar las tiendas y no se guarda.
- **Decisión abierta:** conviene decidir si el estado se publica en tiempo real o con un retraso de 15–30 minutos.

### Sugerencia técnica

- Endpoint nuevo: `GET /api/stores?lat=&lng=&q=`, que devuelve las tiendas cercanas con el estado de stock del producto buscado.
- Mapa con Leaflet y teselas claras (por ejemplo CARTO Positron, citando su atribución).
- Base de datos: añadir una tabla `Stock` por tienda y producto a la de SQLite del MVP.
- Para la demo bastan 5–8 tiendas de ejemplo con datos ficticios.

## 11. Qué priorizar en el MVP

1. Paleta y tokens (sección 9).
2. Pantalla «Propuesta de pedido»: tabla con cantidad sugerida, motivo y botones Aceptar y Ajustar. Aceptar guarda con `PATCH /api/tasks/{id}`; sustituye a las «tareas de reposición urgente» del planteamiento inicial.
3. Gráfico de previsión con factores (`GET /api/forecast?temp=`), con controles de temperatura y de tendencia para demostrar en vivo cómo cambia la previsión.
4. Cabecera con temperatura y resumen de tienda con mapa de calor simple por sección (`GET /api/alerts`).

Si queda tiempo, la segunda pantalla a demostrar es el mapa para el cliente (sección 10): mapa con unas pocas tiendas de ejemplo y buscador.

## Nota sobre la marca

Esta guía se inspira en el estilo de Mercadona para un prototipo de concurso. Si MercaPredict pasase a producción, conviene usar la identidad oficial con su permiso, o una paleta propia, y no reproducir su logotipo.
