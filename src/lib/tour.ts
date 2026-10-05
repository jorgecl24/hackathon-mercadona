import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

/* ─── Mascota — cesta de Mercadona con ojos y patas ─────────────── */

const MERKI_SVG = `
<svg viewBox="0 0 100 128" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <!-- Patas (detrás del círculo) -->
  <rect x="29" y="84" width="15" height="30" rx="7.5" fill="#F5A623"/>
  <rect x="56" y="84" width="15" height="30" rx="7.5" fill="#F5A623"/>
  <!-- Pies (apuntando hacia fuera) -->
  <rect x="18" y="107" width="28" height="11" rx="5.5" fill="#DC8B16"/>
  <rect x="54" y="107" width="28" height="11" rx="5.5" fill="#DC8B16"/>

  <!-- Círculo blanco de fondo -->
  <circle cx="50" cy="50" r="40" fill="white"/>
  <!-- Borde verde del logo -->
  <circle cx="50" cy="50" r="40" fill="none" stroke="#3C7A28" stroke-width="4.5"/>

  <!-- Cuerpo de la cesta -->
  <rect x="19" y="58" width="62" height="26" rx="4" fill="#F5A623"/>
  <!-- Textura de mimbre -->
  <line x1="32" y1="58" x2="32" y2="84" stroke="#DC8B16" stroke-width="1.1" opacity="0.45"/>
  <line x1="45" y1="58" x2="45" y2="84" stroke="#DC8B16" stroke-width="1.1" opacity="0.45"/>
  <line x1="58" y1="58" x2="58" y2="84" stroke="#DC8B16" stroke-width="1.1" opacity="0.45"/>
  <line x1="71" y1="58" x2="71" y2="84" stroke="#DC8B16" stroke-width="1.1" opacity="0.45"/>
  <line x1="19" y1="67" x2="81" y2="67" stroke="#DC8B16" stroke-width="1.1" opacity="0.45"/>
  <line x1="19" y1="76" x2="81" y2="76" stroke="#DC8B16" stroke-width="1.1" opacity="0.45"/>
  <!-- Remate superior de la cesta -->
  <rect x="16" y="55" width="68" height="7" rx="3.5" fill="#DC8B16"/>
  <!-- Asa -->
  <path d="M32 59 Q50 33 68 59" stroke="#DC8B16" stroke-width="5.5" fill="none" stroke-linecap="round"/>

  <!-- Contenido: verduras y productos (fiel al logo) -->
  <!-- Hojas verdes izquierda -->
  <path d="M22 55 C15 41 23 28 30 37 C30 37 26 46 22 55Z" fill="#43A047"/>
  <path d="M26 54 C20 41 30 30 34 40 C34 40 30 47 26 54Z" fill="#66BB6A"/>
  <!-- Fruta naranja -->
  <circle cx="41" cy="41" r="9" fill="#FF8C00"/>
  <path d="M41 32 Q43.5 29 46 31" stroke="#43A047" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- Botella verde oscuro (centro) -->
  <rect x="49" y="27" width="8" height="27" rx="3.5" fill="#2E7D32"/>
  <rect x="50.5" y="21" width="5" height="10" rx="2.5" fill="#388E3C"/>
  <!-- Tomate / pimiento rojo derecha -->
  <circle cx="66" cy="42" r="9" fill="#C62828"/>
  <path d="M63 33 Q66 30 69 33" stroke="#43A047" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- Hojas verdes derecha -->
  <path d="M78 55 C85 41 77 28 70 37 C70 37 74 46 78 55Z" fill="#43A047"/>

  <!-- OJOS sobre la cesta (estilo flat, limpio) -->
  <circle cx="36" cy="70" r="7.5" fill="white"/>
  <circle cx="64" cy="70" r="7.5" fill="white"/>
  <!-- Pupilas -->
  <circle cx="37" cy="71" r="4.8" fill="#111111"/>
  <circle cx="65" cy="71" r="4.8" fill="#111111"/>
  <!-- Brillo sutil -->
  <circle cx="38.8" cy="69.2" r="1.6" fill="white"/>
  <circle cx="66.8" cy="69.2" r="1.6" fill="white"/>
  <!-- Boca: curva discreta, no infantil -->
  <path d="M41 80 Q50 85 59 80" stroke="#DC8B16" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`

/* ─── Tour ───────────────────────────────────────────────────────── */

export function startTour() {
  const d = driver({
    showProgress: true,
    nextBtnText: 'Siguiente →',
    prevBtnText: '← Atrás',
    doneBtnText: '¡Entendido! 🌿',
    progressText: '{{current}} de {{total}}',
    overlayOpacity: 0.55,
    popoverClass: 'mercapredict-tour',
    onPopoverRender: (popover) => {
      const container = document.createElement('div')
      container.className = 'tour-mascot-container'
      container.innerHTML = MERKI_SVG
      popover.wrapper.appendChild(container)
    },
    steps: [
      {
        popover: {
          title: '👋 Hola, soy Merki',
          description:
            'Soy tu asistente de stock en MercaPredict. En menos de un minuto te enseño todo lo que necesitas para que en tu tienda <strong>nunca falte ni sobre</strong>.',
        },
      },
      {
        element: '[data-tour="nav"]',
        popover: {
          title: '🗺️ Cuatro vistas',
          description:
            '<b>Resumen</b> — foto global de la tienda<br><b>Previsión</b> — demanda esperada por producto<br><b>Pedido</b> — propuestas de la IA para hoy<br><b>Merma</b> — alertas de caducidad próxima',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '[data-tour="horizon"]',
        popover: {
          title: '📅 Horizonte de previsión',
          description:
            'Elige entre <b>3, 7 o 14 días</b>. La IA recalcula todas las propuestas al instante adaptándose a tu bloque logístico.',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '[data-tour="filters"]',
        popover: {
          title: '🔍 Filtros rápidos',
          description:
            'Filtra por sección, nivel de confianza o estado del pedido. Cuando hay filtros activos aparece el contador <em>"X de 27"</em> y el botón limpiar.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tour="order-table"]',
        popover: {
          title: '📦 Propuestas de pedido',
          description:
            'Cada fila muestra el stock actual, el pedido habitual y lo que sugiere la IA. Los chips explican qué señal ha movido la previsión: clima, festivos o tendencias.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '[data-tour="bulk-accept"]',
        popover: {
          title: '✅ Aceptar en bloque',
          description:
            'Acepta todas las propuestas de <b>confianza alta</b> con un clic. Siempre pedirá una confirmación para evitar cambios accidentales.',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '[data-tour="progress"]',
        popover: {
          title: '📊 Progreso del pedido',
          description:
            'Sigue en tiempo real cuántas propuestas has confirmado. La barra se completa a medida que aceptas o ajustas antes de que cierre el bloque a las <b>13:00</b>.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tour="export"]',
        popover: {
          title: '📥 Exportar pedido',
          description:
            'Descarga el pedido completo en <b>CSV</b> con un clic. Compatible con Excel, con nombre automático tipo <em>pedido-7d-2026-10-05.csv</em>.',
          side: 'bottom',
          align: 'end',
        },
      },
    ],
  })

  d.drive()
}
