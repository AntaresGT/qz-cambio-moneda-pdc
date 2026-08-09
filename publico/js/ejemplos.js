/**
 * Ejemplos de código para consumir Cambio API.
 */

const EjemplosCodigo = {
  quetzal: `importar {
    ClienteHttp,
    RespuestaHttp
} desde "quetzal/red"

asincrono vacio obtener_tipo_cambio() {
    ClienteHttp cliente = nuevo ClienteHttp({
        base_url: "https://tipo-cambio.lenguaje-quetzal.com"
    })
    intentar {
        RespuestaHttp respuesta = esperar cliente.obtener_asincrono("/api/tipo-cambio")
        consola.mostrar(respuesta.datos())
    }
    capturar (excepcion e) {
        consola.mostrar(e.mensaje)
    }
}

// Acá se ejecuta la función y espera que termine la consulta antes de terminar el programa
esperar obtener_tipo_cambio()`,

  javascript: `// GET — tipo de cambio del día
const respuesta = await fetch("https://tipo-cambio.lenguaje-quetzal.com/api/tipo-cambio");
const datos = await respuesta.json();
console.log(datos);

// POST — convertir un monto en USD
const conversion = await fetch("https://tipo-cambio.lenguaje-quetzal.com/api/tipo-cambio", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ valor_dolares: 100 })
});
console.log(await conversion.json());

// QUERY — método HTTP experimental
const experimental = await fetch("https://tipo-cambio.lenguaje-quetzal.com/api/tipo-cambio", {
  method: "QUERY",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ valor_dolares: 100 })
});
console.log(await experimental.json());`,

  curl: `# GET
curl -X GET "https://tipo-cambio.lenguaje-quetzal.com/api/tipo-cambio" \\
  -H "Accept: application/json"

# POST
curl -X POST "https://tipo-cambio.lenguaje-quetzal.com/api/tipo-cambio" \\
  -H "Content-Type: application/json" \\
  -d '{"valor_dolares": 100}'

# QUERY (método HTTP experimental)
curl -X QUERY "https://tipo-cambio.lenguaje-quetzal.com/api/tipo-cambio" \\
  -H "Content-Type: application/json" \\
  -d '{"valor_dolares": 100}'`,
};

const RespuestaEjemplo = `{
  "estado": "exito",
  "fuente": "banguat",
  "fecha_consulta": "2026-08-09T11:41:00-06:00",
  "tipo_cambio": 7.65,
  "moneda_origen": "USD",
  "moneda_destino": "GTQ"
}`;

/**
 * Escapa HTML y aplica resaltado sin romper URLs ni atributos.
 * Las cadenas se protegen primero para que el // de https:// no se tome como comentario.
 * @param {string} codigo
 * @param {string} lenguaje
 * @returns {string}
 */
function resaltarCodigo(codigo, lenguaje) {
  let texto = codigo
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

  /** @type {string[]} */
  const fragmentos = [];

  /**
   * @param {RegExp} regex
   * @param {string} clase
   */
  function proteger(regex, clase) {
    texto = texto.replace(regex, (match) => {
      const indice = fragmentos.length;
      fragmentos.push(`<span class="${clase}">${match}</span>`);
      return `@@FRAG${indice}@@`;
    });
  }

  // 1) Cadenas primero (protege https:// y rutas)
  proteger(/"(?:\\.|[^"\\])*"/g, "syntax-cadena");

  // 2) Comentarios (ya no chocan con URLs dentro de strings)
  if (lenguaje === "curl") {
    proteger(/(#[^\n]*)/g, "syntax-comentario");
  } else {
    proteger(/(\/\/[^\n]*)/g, "syntax-comentario");
  }

  // 3) Palabras clave sobre el texto restante
  if (lenguaje === "curl") {
    texto = texto.replace(/\b(curl|GET|POST|QUERY)\b/g, '<span class="syntax-palabra">$1</span>');
  } else if (lenguaje === "javascript") {
    texto = texto
      .replace(/\b(const|await|fetch|method|headers|body|console)\b/g, '<span class="syntax-palabra">$1</span>')
      .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="syntax-numero">$1</span>');
  } else {
    texto = texto
      .replace(
        /\b(importar|desde|asincrono|vacio|nuevo|intentar|capturar|esperar|excepcion|consola)\b/g,
        '<span class="syntax-palabra">$1</span>'
      )
      .replace(/\b(ClienteHttp|RespuestaHttp)\b/g, '<span class="syntax-funcion">$1</span>')
      .replace(/\b(obtener_asincrono|mostrar|datos|mensaje)\b/g, '<span class="syntax-clave">$1</span>');
  }

  // 4) Restaurar fragmentos protegidos
  return texto.replace(/@@FRAG(\d+)@@/g, (_, indice) => fragmentos[Number(indice)]);
}

/**
 * Resalta JSON para el panel de respuesta.
 * @param {string} json
 * @returns {string}
 */
function resaltarJson(json) {
  let texto = json
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

  /** @type {string[]} */
  const fragmentos = [];

  texto = texto.replace(/"(?:\\.|[^"\\])*"(?=\s*:)/g, (match) => {
    const indice = fragmentos.length;
    fragmentos.push(`<span class="syntax-clave">${match}</span>`);
    return `@@FRAG${indice}@@`;
  });

  texto = texto.replace(/"(?:\\.|[^"\\])*"/g, (match) => {
    const indice = fragmentos.length;
    fragmentos.push(`<span class="syntax-cadena">${match}</span>`);
    return `@@FRAG${indice}@@`;
  });

  texto = texto.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="syntax-numero">$1</span>');

  return texto.replace(/@@FRAG(\d+)@@/g, (_, indice) => fragmentos[Number(indice)]);
}
