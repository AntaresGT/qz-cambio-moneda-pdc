/**
 * Inicialización de la interfaz de Cambio API.
 */

/** @type {"GET" | "POST" | "QUERY"} */
let metodoActivo = "GET";
/** @type {keyof typeof EjemplosCodigo} */
let lenguajeActivo = "quetzal";
/** @type {ReturnType<typeof setTimeout> | null} */
let temporizadorToast = null;

/**
 * Muestra una notificación breve de éxito o error.
 * @param {string} mensaje
 * @param {"ok" | "error"} [tipo="ok"]
 */
function mostrarToast(mensaje, tipo = "ok") {
  let toast = document.getElementById("toast-notificacion");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-notificacion";
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }

  toast.className = `toast toast--${tipo} toast--visible`;
  toast.innerHTML = `
    <span class="toast__icono" aria-hidden="true">
      <i data-lucide="${tipo === "ok" ? "check" : "circle-alert"}" width="16" height="16"></i>
    </span>
    <span>${mensaje}</span>
  `;

  if (window.lucide) {
    window.lucide.createIcons();
  }

  if (temporizadorToast) {
    clearTimeout(temporizadorToast);
  }

  temporizadorToast = setTimeout(() => {
    toast.classList.remove("toast--visible");
  }, 2200);
}

/**
 * Copia texto al portapapeles y avisa al usuario.
 * @param {string} texto
 * @param {string} [mensajeOk="Código copiado al portapapeles"]
 */
async function copiarAlPortapapeles(texto, mensajeOk = "Código copiado al portapapeles") {
  try {
    await navigator.clipboard.writeText(texto);
    mostrarToast(mensajeOk, "ok");
    return true;
  } catch {
    mostrarToast("No se pudo copiar. Inténtalo de nuevo.", "error");
    return false;
  }
}

function formatearFecha(fechaIso) {
  try {
    const fecha = new Date(fechaIso);
    if (Number.isNaN(fecha.getTime())) {
      return fechaIso;
    }
    return new Intl.DateTimeFormat("es-GT", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: ConfigAPI.zonaHoraria,
    }).format(fecha);
  } catch {
    return fechaIso;
  }
}

function actualizarNavegacionActiva() {
  const secciones = ["inicio", "endpoints", "probar", "ejemplos", "proyecto"];
  const scrollY = window.scrollY + 120;
  let activa = "inicio";

  for (const id of secciones) {
    const el = document.getElementById(id);
    if (el && el.offsetTop <= scrollY) {
      activa = id;
    }
  }

  document.querySelectorAll("[data-nav]").forEach((enlace) => {
    enlace.classList.toggle("activo", enlace.getAttribute("data-nav") === activa);
  });
}

function inicializarMenuMovil() {
  const boton = document.getElementById("btn-menu");
  const panel = document.getElementById("nav-movil");
  if (!boton || !panel) return;

  boton.addEventListener("click", () => {
    const abierto = panel.classList.toggle("abierto");
    boton.setAttribute("aria-expanded", String(abierto));
  });

  panel.querySelectorAll("a").forEach((enlace) => {
    enlace.addEventListener("click", () => {
      panel.classList.remove("abierto");
      boton.setAttribute("aria-expanded", "false");
    });
  });
}

async function cargarTarjetaTipoCambio() {
  const cifra = document.getElementById("tipo-cambio-cifra");
  const fecha = document.getElementById("tipo-cambio-fecha");
  const tarjeta = document.getElementById("tarjeta-tipo-cambio");
  if (!cifra || !fecha || !tarjeta) return;

  tarjeta.classList.add("estado-carga");
  const datos = await obtenerTipoCambioActual();
  tarjeta.classList.remove("estado-carga");

  if (!datos || typeof datos.tipo_cambio !== "number") {
    cifra.innerHTML = `1 USD ≈ <span>Q —</span> Quetzales`;
    fecha.textContent = "No disponible ahora";
    return;
  }

  const valor = Number(datos.tipo_cambio).toFixed(2);
  cifra.innerHTML = `1 USD ≈ <span>Q ${valor}</span> Quetzales`;
  fecha.textContent = datos.fecha_consulta
    ? `Actualizado ${formatearFecha(datos.fecha_consulta)}`
    : "Actualizado hoy";
}

function inicializarPlayground() {
  const tabs = document.querySelectorAll(".tab-metodo");
  const campoMonto = document.getElementById("campo-monto");
  const inputMonto = document.getElementById("input-monto");
  const btnEjecutar = document.getElementById("btn-ejecutar");
  const salida = document.getElementById("salida-json");
  const badge = document.getElementById("badge-estado");
  const btnCopiar = document.getElementById("btn-copiar-respuesta");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("activo");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("activo");
      tab.setAttribute("aria-selected", "true");
      metodoActivo = /** @type {"GET" | "POST" | "QUERY"} */ (tab.getAttribute("data-metodo") || "GET");
      if (campoMonto) {
        campoMonto.hidden = metodoActivo === "GET";
      }
    });
  });

  btnEjecutar?.addEventListener("click", async () => {
    if (!salida || !badge || !btnEjecutar) return;

    const monto = inputMonto ? Number(inputMonto.value || 1) : 1;
    btnEjecutar.disabled = true;
    btnEjecutar.innerHTML = `<i data-lucide="loader-circle" class="spin"></i> Consultando...`;
    if (window.lucide) window.lucide.createIcons();

    try {
      const resultado = await consultarTipoCambio(metodoActivo, monto);
      salida.innerHTML = resaltarJson(resultado.texto);
      badge.textContent = `Respuesta ${resultado.estado}${resultado.ok ? " OK" : ""}`;
      badge.classList.toggle("badge-estado--ok", resultado.ok);
      badge.classList.toggle("badge-estado--error", !resultado.ok);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : "Error de red";
      salida.textContent = JSON.stringify({ error: mensaje }, null, 2);
      badge.textContent = "Error de red";
      badge.classList.remove("badge-estado--ok");
      badge.classList.add("badge-estado--error");
    } finally {
      btnEjecutar.disabled = false;
      btnEjecutar.innerHTML = `<i data-lucide="play"></i> Ejecutar consulta`;
      if (window.lucide) window.lucide.createIcons();
    }
  });

  btnCopiar?.addEventListener("click", async () => {
    const texto = salida?.textContent || "";
    await copiarAlPortapapeles(texto, "Respuesta copiada al portapapeles");
  });
}

function inicializarEjemplos() {
  const tabs = document.querySelectorAll(".tab-lenguaje");
  const bloque = document.getElementById("codigo-ejemplo");
  const titulo = document.getElementById("titulo-ejemplo");
  const btnCopiar = document.getElementById("btn-copiar-ejemplo");
  const respuesta = document.getElementById("codigo-respuesta");

  const titulos = {
    quetzal: "ejemplo.qz",
    javascript: "fetch.js",
    curl: "terminal.sh",
  };

  function pintar() {
    if (!bloque || !titulo) return;
    bloque.innerHTML = resaltarCodigo(EjemplosCodigo[lenguajeActivo], lenguajeActivo);
    titulo.textContent = titulos[lenguajeActivo];
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("activo"));
      tab.classList.add("activo");
      lenguajeActivo = /** @type {keyof typeof EjemplosCodigo} */ (
        tab.getAttribute("data-lenguaje") || "quetzal"
      );
      pintar();
    });
  });

  btnCopiar?.addEventListener("click", async () => {
    await copiarAlPortapapeles(EjemplosCodigo[lenguajeActivo], "Código copiado al portapapeles");
  });

  if (respuesta) {
    respuesta.innerHTML = resaltarJson(RespuestaEjemplo);
  }

  pintar();
}

function inicializar() {
  const anio = document.getElementById("anio-actual");
  if (anio) {
    anio.textContent = String(new Date().getFullYear());
  }

  inicializarMenuMovil();
  inicializarPlayground();
  inicializarEjemplos();
  cargarTarjetaTipoCambio();
  actualizarNavegacionActiva();
  window.addEventListener("scroll", actualizarNavegacionActiva, { passive: true });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

document.addEventListener("DOMContentLoaded", inicializar);
