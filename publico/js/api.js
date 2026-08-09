/**
 * Cliente HTTP para consumir Cambio API (GET, POST, QUERY).
 */

/**
 * @typedef {"GET" | "POST" | "QUERY"} MetodoHttp
 */

/**
 * Ejecuta una consulta al endpoint de tipo de cambio.
 * @param {MetodoHttp} metodo
 * @param {number | null} valorDolares
 * @returns {Promise<{ ok: boolean, estado: number, datos: object | string, texto: string }>}
 */
async function consultarTipoCambio(metodo, valorDolares = null) {
  const url = obtenerEndpoint();
  /** @type {RequestInit} */
  const opciones = {
    method: metodo,
    headers: {
      Accept: "application/json",
    },
  };

  if (metodo === "POST" || metodo === "QUERY") {
    opciones.headers = {
      ...opciones.headers,
      "Content-Type": "application/json",
    };
    opciones.body = JSON.stringify({
      valor_dolares: Number(valorDolares ?? 1),
    });
  }

  const respuesta = await fetch(url, opciones);
  const texto = await respuesta.text();
  let datos;

  try {
    datos = JSON.parse(texto);
  } catch {
    datos = texto;
  }

  return {
    ok: respuesta.ok,
    estado: respuesta.status,
    datos,
    texto: typeof datos === "string" ? datos : JSON.stringify(datos, null, 2),
  };
}

/**
 * Obtiene el tipo de cambio actual (GET) para la tarjeta del hero.
 * @returns {Promise<object | null>}
 */
async function obtenerTipoCambioActual() {
  try {
    const resultado = await consultarTipoCambio("GET");
    if (!resultado.ok || typeof resultado.datos !== "object") {
      return null;
    }
    return resultado.datos;
  } catch {
    return null;
  }
}
