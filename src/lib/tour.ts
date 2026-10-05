import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

/* ─── Mascota — imagen real del logo ────────────────────────────── */

const MERKI_HTML = `<img src="/mascot.png" alt="" aria-hidden="true" style="width:100%;height:100%;object-fit:contain;"/>`

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
      const img = document.createElement('img')
      img.src = '/mascot.png'
      img.alt = ''
      img.setAttribute('aria-hidden', 'true')
      img.className = 'tour-mascot-inline'
      popover.title.style.display = 'flex'
      popover.title.style.alignItems = 'center'
      popover.title.style.gap = '10px'
      popover.title.insertBefore(img, popover.title.firstChild)
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
