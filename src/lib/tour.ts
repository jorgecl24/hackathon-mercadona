import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import type { PageId } from '@/components/layout/nav'

export function startTour(navigate: (page: PageId) => void) {
  // Siempre empieza en Pedido para que los primeros pasos encuentren sus elementos
  navigate('order')

  let d: ReturnType<typeof driver>

  /** Navega a otra página y, tras cargar los datos (≈600 ms mock), avanza al paso siguiente. */
  function goTo(page: PageId, delay = 900) {
    navigate(page)
    setTimeout(() => d.moveNext(), delay)
  }

  d = driver({
    showProgress: true,
    nextBtnText: 'Siguiente →',
    prevBtnText: '← Atrás',
    doneBtnText: '¡Listo! 🌿',
    progressText: '{{current}} de {{total}}',
    overlayOpacity: 0.55,
    popoverClass: 'mercapredict-tour',
    onDestroyed: () => navigate('order'),
    onPopoverRender: (popover) => {
      const img = document.createElement('img')
      img.src = '/mascot.png'
      img.alt = ''
      img.setAttribute('aria-hidden', 'true')
      img.className = 'tour-mascot-corner'
      popover.wrapper.appendChild(img)
    },
    steps: [

      /* ── Bienvenida ───────────────────────────────────────────── */
      {
        popover: {
          title: '👋 Bienvenido a MercaPredict',
          description:
            'Tu copiloto de stock para que en tu tienda <b>nunca falte ni sobre</b>. En este tour recorreremos las cuatro pantallas principales.',
        },
      },

      /* ── Elementos siempre visibles ───────────────────────────── */
      {
        element: '[data-tour="nav"]',
        popover: {
          title: '🗺️ Cuatro pantallas',
          description:
            '<b>Resumen</b> — foto global de la tienda<br><b>Previsión</b> — demanda esperada por producto<br><b>Pedido</b> — propuestas de la IA para hoy<br><b>Merma</b> — alertas de caducidad próxima',
          side: 'right',
          align: 'start',
        },
      },

      /* ── Pantalla Pedido ──────────────────────────────────────── */
      {
        element: '[data-tour="filters"]',
        popover: {
          title: '🔍 Filtros rápidos',
          description:
            'Filtra por sección, nivel de confianza o estado. Cuando hay filtros activos aparece el contador <em>"X de 27"</em> y el botón limpiar.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tour="order-table"]',
        popover: {
          title: '📦 Propuestas de pedido',
          description:
            'Cada fila muestra el stock actual, el pedido habitual y lo que sugiere la IA. Los chips explican la señal que ha movido la previsión: clima, festivos, tendencias…',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '[data-tour="bulk-accept"]',
        popover: {
          title: '✅ Aceptar en bloque',
          description:
            'Acepta todas las propuestas de <b>confianza alta</b> con un clic. Siempre pedirá confirmación antes de ejecutar.',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '[data-tour="progress"]',
        popover: {
          title: '📊 Progreso y exportación',
          description:
            'La barra muestra cuántas propuestas has confirmado antes del corte de las 13:00. El botón de la derecha exporta el pedido completo en <b>CSV</b>.',
          side: 'bottom',
          align: 'start',
        },
      },

      /* ── Transición → Resumen ─────────────────────────────────── */
      {
        popover: {
          title: '➡️ Vamos al Resumen',
          description:
            'Ahora te mostraré la vista de <b>Resumen</b>, donde tienes la foto global de la tienda de un vistazo.',
          onNextClick: () => goTo('summary'),
        },
      },

      /* ── Pantalla Resumen ─────────────────────────────────────── */
      {
        element: '[data-tour="summary-kpis"]',
        popover: {
          title: '📈 Indicadores clave',
          description:
            'Cuatro tarjetas en rojo, naranja o verde según el estado: <b>rotura de stock</b>, <b>riesgo de merma</b>, propuestas pendientes y precisión media de la IA.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tour="summary-heatmap"]',
        popover: {
          title: '🗓️ Mapa de calor por sección',
          description:
            'Cada celda muestra el estado de una sección (Lácteos, Bebidas, Carne…): verde si todo va bien, naranja o rojo si hay productos en riesgo.',
          side: 'top',
          align: 'start',
        },
      },

      /* ── Transición → Previsión ───────────────────────────────── */
      {
        popover: {
          title: '➡️ Vamos a Previsión',
          description:
            'A continuación veremos la pantalla de <b>Previsión</b>, donde puedes explorar la demanda esperada para cada producto.',
          onNextClick: () => goTo('forecast'),
        },
      },

      /* ── Pantalla Previsión ───────────────────────────────────── */
      {
        element: '[data-tour="forecast-chart"]',
        popover: {
          title: '📉 Gráfico de previsión',
          description:
            'La línea gris muestra el histórico real, la verde la previsión y la banda clara el margen de confianza. Las marcas naranjas señalan eventos (festivos, partidos…).',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '[data-tour="forecast-signals"]',
        popover: {
          title: '🔌 Señales de futuro',
          description:
            'Activa o desactiva cada señal (clima, calendario, tendencia…) y ve cómo cambia la cantidad sugerida al instante. Ideal para la demo en directo.',
          side: 'top',
          align: 'start',
        },
      },

      /* ── Transición → Merma ───────────────────────────────────── */
      {
        popover: {
          title: '➡️ Vamos a Merma',
          description:
            'Por último, la pantalla de <b>Merma y caducidad</b>, donde se alertan los productos perecederos con exceso de stock.',
          onNextClick: () => goTo('waste'),
        },
      },

      /* ── Pantalla Merma ───────────────────────────────────────── */
      {
        element: '[data-tour="waste-cards"]',
        popover: {
          title: '⚠️ Alertas de merma',
          description:
            'Cada tarjeta muestra el stock actual, la venta prevista antes de caducar y las unidades en riesgo. Desde aquí puedes reducir el próximo pedido o avisar a tienda con un clic.',
          side: 'top',
          align: 'start',
        },
      },
    ],
  })

  d.drive()
}
