import type { PropsWithChildren } from "react";

/**
 * Contenedor "estilo app movil". Dentro de un ancho fisico de smartphone
 * (<= 430 px) ocupa la pantalla entera; en escritorio recorta la UI a un
 * marco de telefono centrado sobre fondo gris, util para presentar la demo
 * sin que la vista movil se estire a 1920 px.
 */
export function MobileFrame({ children }: PropsWithChildren) {
  return (
    <div className="grid min-h-dvh place-items-center bg-neutral-200">
      <div
        className="relative h-dvh w-full max-w-[430px] overflow-hidden bg-background sm:h-[min(920px,calc(100dvh-2rem))] sm:rounded-[2.5rem] sm:shadow-2xl sm:ring-1 sm:ring-black/10"
      >
        {children}
      </div>
    </div>
  );
}
