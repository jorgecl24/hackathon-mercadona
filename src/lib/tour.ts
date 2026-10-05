import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export function startTour() {
  const d = driver({
    showProgress: true,
    nextBtnText: 'Siguiente →',
    prevBtnText: '← Anterior',
    doneBtnText: '¡Entendido!',
    progressText: '{{current}} de {{total}}',
    overlayOpacity: 0.55,
    popoverClass: 'mercapredict-tour',
    steps: [
      {
        popover: {
          title: '👋 Bienvenido a MercaPredict',
          description:
            'Gestión inteligente de stock para que nunca falte ni sobre. Este tour te guiará por las funciones principales en menos de un minuto.',
        },
      },
      {
        element: '[data-tour="nav"]',
        popover: {
          title: 'Cuatro vistas',
          description:
            '<b>Resumen</b> da la foto global de la tienda, <b>Previsión</b> muestra la demanda esperada por producto, <b>Pedido</b> propone qué pedir y <b>Merma</b> alerta de caducidades próximas.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '[data-tour="horizon"]',
        popover: {
          title: 'Horizonte de previsión',
          description:
            'Elige entre 3, 7 o 14 días. El modelo recalcula las propuestas al instante adaptándose al horizonte logístico de tu tienda.',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '[data-tour="filters"]',
        popover: {
          title: 'Filtros rápidos',
          description:
            'Filtra por sección, nivel de confianza o estado del pedido para centrarte en los productos que necesitan tu atención.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tour="order-table"]',
        popover: {
          title: 'Propuestas de pedido',
          description:
            'Cada fila muestra el stock actual, el pedido habitual y lo que sugiere la IA. Los chips de motivo explican qué señal ha movido la previsión: clima, festivos o tendencias.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '[data-tour="bulk-accept"]',
        popover: {
          title: 'Aceptar en bloque',
          description:
            'Acepta todas las propuestas de confianza alta con un clic. Siempre pedirá confirmación para evitar errores accidentales.',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '[data-tour="progress"]',
        popover: {
          title: 'Progreso del pedido',
          description:
            'Sigue en tiempo real cuántas propuestas has confirmado antes de que cierre el bloque logístico a las 13:00.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tour="export"]',
        popover: {
          title: 'Exportar pedido',
          description:
            'Descarga el pedido completo en CSV con un clic para enviarlo, archivarlo o importarlo a otros sistemas.',
          side: 'bottom',
          align: 'end',
        },
      },
    ],
  })

  d.drive()
}
