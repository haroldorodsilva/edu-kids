/**
 * Retorna true se o dispositivo é touch (tablet/smartphone).
 * Usado para decidir entre mostrar OnScreenKeyboard vs. usar teclado físico.
 */
export function isTouchDevice(): boolean {
  return (
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(hover: none)').matches
  );
}
