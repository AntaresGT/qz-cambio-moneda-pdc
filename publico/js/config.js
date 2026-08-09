/**
 * Configuración de Cambio API
 */
const ConfigAPI = Object.freeze({
  /** URL pública documentada en los ejemplos */
  basePublica: "http://tipo-cambio.lenguaje-quetzal.com",
  /** Ruta del endpoint */
  ruta: "/api/tipo-cambio",
  /** Repositorio del proyecto */
  github: "https://github.com/AntaresGT/qz-cambio-moneda-pdc",
  /** Fuente de datos */
  fuente: "Banguat",
  /** Zona horaria de referencia */
  zonaHoraria: "America/Guatemala",
});

/**
 * Resuelve la base URL para llamadas desde el navegador.
 * Si el sitio se sirve desde el mismo origen que la API, usa rutas relativas.
 */
function obtenerBaseUrl() {
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1" || host === "") {
    return "";
  }
  if (host.includes("lenguaje-quetzal.com") || host.includes("tipo-cambio")) {
    return "";
  }
  return ConfigAPI.basePublica;
}

function obtenerEndpoint() {
  return `${obtenerBaseUrl()}${ConfigAPI.ruta}`;
}
