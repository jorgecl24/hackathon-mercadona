/** Vibracion muy corta para interacciones clave (ignorada si el dispositivo
 *  no la soporta o si el usuario la ha desactivado). */
export const haptic = (ms = 8) => {
  if (typeof navigator === "undefined") return;
  navigator.vibrate?.(ms);
};
