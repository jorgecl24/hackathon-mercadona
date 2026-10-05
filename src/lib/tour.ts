import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

/* ─── Merki — mascota de MercaPredict ───────────────────────────── */

const MERKI_SVG = `
<svg viewBox="0 0 80 92" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <!-- Uniforme verde -->
  <rect x="16" y="67" width="48" height="25" rx="12" fill="#3F7D2B"/>
  <!-- Cuello en V con ribete -->
  <path d="M27 67 L40 77 L53 67" fill="#CFE5C3"/>
  <path d="M31 67 L40 74 L49 67" fill="#E8F3E1"/>
  <!-- Cuello -->
  <rect x="33" y="60" width="14" height="13" rx="5" fill="#FFD8A8"/>
  <!-- Cabeza -->
  <circle cx="40" cy="39" r="27" fill="#FFD8A8"/>
  <!-- Hoja izquierda -->
  <ellipse cx="24" cy="16" rx="9" ry="14" fill="#3F7D2B" transform="rotate(-22 24 16)"/>
  <ellipse cx="24" cy="16" rx="6" ry="10" fill="#4E9636" transform="rotate(-22 24 16)"/>
  <!-- Hoja derecha -->
  <ellipse cx="56" cy="16" rx="9" ry="14" fill="#609E42" transform="rotate(22 56 16)"/>
  <ellipse cx="56" cy="16" rx="6" ry="10" fill="#7AB850" transform="rotate(22 56 16)"/>
  <!-- Hoja central -->
  <ellipse cx="40" cy="14" rx="8" ry="13" fill="#3F7D2B"/>
  <ellipse cx="40" cy="14" rx="5" ry="9" fill="#4E9636"/>
  <!-- Nervio hojas -->
  <line x1="40" y1="8" x2="40" y2="28" stroke="#2d6620" stroke-width="1.2" stroke-linecap="round"/>
  <line x1="24" y1="10" x2="28" y2="24" stroke="#2d6620" stroke-width="1" stroke-linecap="round" transform="rotate(-22 24 16)"/>
  <line x1="56" y1="10" x2="52" y2="24" stroke="#4a7a30" stroke-width="1" stroke-linecap="round" transform="rotate(22 56 16)"/>
  <!-- Ojos blancos -->
  <circle cx="30" cy="37" r="7.5" fill="white"/>
  <circle cx="50" cy="37" r="7.5" fill="white"/>
  <!-- Pupilas -->
  <circle cx="31" cy="38" r="5" fill="#1E1E1E"/>
  <circle cx="51" cy="38" r="5" fill="#1E1E1E"/>
  <!-- Brillos ojos -->
  <circle cx="33" cy="36" r="1.8" fill="white"/>
  <circle cx="53" cy="36" r="1.8" fill="white"/>
  <circle cx="29.5" cy="39.5" r="0.8" fill="rgba(255,255,255,0.5)"/>
  <circle cx="49.5" cy="39.5" r="0.8" fill="rgba(255,255,255,0.5)"/>
  <!-- Coloretes -->
  <circle cx="20" cy="46" r="6.5" fill="#FF9055" opacity="0.28"/>
  <circle cx="60" cy="46" r="6.5" fill="#FF9055" opacity="0.28"/>
  <!-- Nariz -->
  <ellipse cx="40" cy="43" rx="3.5" ry="2.5" fill="#F4A870"/>
  <!-- Boca / sonrisa -->
  <path d="M30 51 Q40 60 50 51" stroke="#C4783A" stroke-width="2.8" fill="none" stroke-linecap="round"/>
  <!-- Hoyuelos -->
  <circle cx="27" cy="51" r="1.5" fill="#F4A870" opacity="0.7"/>
  <circle cx="53" cy="51" r="1.5" fill="#F4A870" opacity="0.7"/>
  <!-- Manitas asomando -->
  <circle cx="11" cy="76" r="7" fill="#FFD8A8"/>
  <circle cx="69" cy="76" r="7" fill="#FFD8A8"/>
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
