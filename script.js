
/* ==========================================
   AQUAREGIO - SISTEMA PRINCIPAL
========================================== */

/*
   Los primeros registros son simulados.
   Los registros ciudadanos se guardan en el navegador.
*/

const REGISTROS_INICIALES = [
    {
        id: "AR-001",
        zona: "Colonia Centro",
        fecha: "2026-04-12",
        ph: 7.2,
        origen: "Institucional",
        observaciones: "",
        tipo: "demo"
    },
    {
        id: "AR-002",
        zona: "Colonia Centro",
        fecha: "2026-04-12",
        ph: 6.8,
        origen: "Ciudadano",
        observaciones: "",
        tipo: "demo"
    },
    {
        id: "AR-003",
        zona: "Colonia Centro",
        fecha: "2026-04-13",
        ph: 7.5,
        origen: "Institucional",
        observaciones: "",
        tipo: "demo"
    },
    {
        id: "AR-004",
        zona: "Sector Poniente",
        fecha: "2026-04-13",
        ph: 6.2,
        origen: "Ciudadano",
        observaciones: "",
        tipo: "demo"
    },
    {
        id: "AR-005",
        zona: "Sector Sur",
        fecha: "2026-04-14",
        ph: 8.7,
        origen: "Institucional",
        observaciones: "",
        tipo: "demo"
    }
];

const STORAGE_KEY = "aquaregio_registros_ciudadanos";


/* ==========================================
   ELEMENTOS HTML
========================================== */

const totalRecords = document.getElementById("total-records");
const totalZones = document.getElementById("total-zones");
const lastPh = document.getElementById("last-ph");

const recordsTable = document.getElementById("records-table");

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("zone-search");
const searchResult = document.getElementById("search-result");

const recordForm = document.getElementById("record-form");
const recordZone = document.getElementById("record-zone");
const recordDate = document.getElementById("record-date");
const recordPh = document.getElementById("record-ph");
const recordObservations = document.getElementById("record-observations");
const formMessage = document.getElementById("form-message");

const navItems = document.querySelectorAll(".nav-item");


/* ==========================================
   CARGA DE REGISTROS
========================================== */

function cargarRegistrosCiudadanos() {
    try {
        const guardados = localStorage.getItem(STORAGE_KEY);

        if (!guardados) {
            return [];
        }

        const datos = JSON.parse(guardados);

        if (!Array.isArray(datos)) {
            return [];
        }

        return datos.filter(registro =>
            registro &&
            typeof registro.id === "string" &&
            typeof registro.zona === "string" &&
            typeof registro.fecha === "string" &&
            typeof registro.ph === "number" &&
            Number.isFinite(registro.ph) &&
            registro.ph >= 0 &&
            registro.ph <= 14 &&
            registro.origen === "Ciudadano"
        );

    } catch (error) {
        console.error("No se pudieron cargar los registros:", error);
        return [];
    }
}

let registrosCiudadanos = cargarRegistrosCiudadanos();

function obtenerTodosLosRegistros() {
    return [
        ...registrosCiudadanos,
        ...REGISTROS_INICIALES
    ];
}


/* ==========================================
   GUARDADO LOCAL
========================================== */

function guardarRegistrosCiudadanos() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(registrosCiudadanos)
        );

        return true;

    } catch (error) {
        console.error("No se pudieron guardar los registros:", error);
        return false;
    }
}


/* ==========================================
   FECHAS
========================================== */

function obtenerFechaActual() {
    const ahora = new Date();
    const zonaHoraria = ahora.getTimezoneOffset() * 60000;

    return new Date(ahora.getTime() - zonaHoraria)
        .toISOString()
        .split("T")[0];
}

function formatearFecha(fecha) {
    if (!fecha) return "Sin fecha";

    const partes = fecha.split("-");

    if (partes.length !== 3) return fecha;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


/* ==========================================
   IDENTIFICADORES
========================================== */

function generarIdentificador() {
    const todos = obtenerTodosLosRegistros();

    const numeros = todos.map(registro => {
        const coincidencia = registro.id.match(/AR-(\d+)/);
        return coincidencia ? Number(coincidencia[1]) : 0;
    });

    const siguiente = Math.max(0, ...numeros) + 1;

    return `AR-${String(siguiente).padStart(3, "0")}`;
}


/* ==========================================
   ESTADÍSTICAS
========================================== */

function actualizarEstadisticas() {
    const registros = obtenerTodosLosRegistros();

    const zonas = [
        ...new Set(
            registros.map(registro =>
                registro.zona.trim().toLowerCase()
            )
        )
    ];

    totalRecords.textContent = registros.length;
    totalZones.textContent = zonas.length;

    if (registros.length > 0) {
        const ultimo = registros.reduce((actual, registro) => {
            return registro.fecha > actual.fecha ? registro : actual;
        });

        lastPh.textContent = ultimo.ph.toFixed(1);
    } else {
        lastPh.textContent = "--";
    }
}


/* ==========================================
   INTERPRETACIÓN DEL PH
========================================== */

function interpretarPH(ph) {
    if (ph < 6.5) {
        return "Por debajo del intervalo de referencia de pH.";
    }

    if (ph > 8.5) {
        return "Por encima del intervalo de referencia de pH.";
    }

    return "Dentro del intervalo de referencia de pH.";
}


/* ==========================================
   TABLA DE REGISTROS
========================================== */

function mostrarRegistros() {
    const registros = obtenerTodosLosRegistros();

    recordsTable.innerHTML = "";

    if (registros.length === 0) {
        recordsTable.innerHTML = `
            <tr>
                <td colspan="5">No hay registros disponibles.</td>
            </tr>
        `;
        return;
    }

    registros.forEach(registro => {
        const fila = document.createElement("tr");

        const valores = [
            registro.id,
            registro.zona,
            formatearFecha(registro.fecha),
            registro.ph.toFixed(1)
        ];

        valores.forEach(valor => {
            const celda = document.createElement("td");
            celda.textContent = valor;
            fila.appendChild(celda);
        });

        const celdaOrigen = document.createElement("td");
        const etiqueta = document.createElement("span");

        etiqueta.className = registro.tipo === "ciudadano"
            ? "origin-label citizen"
            : "origin-label";

        etiqueta.textContent = registro.origen;

        celdaOrigen.appendChild(etiqueta);
        fila.appendChild(celdaOrigen);

        recordsTable.appendChild(fila);
    });
}


/* ==========================================
   BÚSQUEDA DE ZONAS
========================================== */

function buscarZona() {
    const busqueda = searchInput.value.trim().toLowerCase();

    if (!busqueda) {
        mostrarMensajeBusqueda(
            "Escribe una colonia o sector para realizar la búsqueda."
        );
        return;
    }

    const encontrados = obtenerTodosLosRegistros().filter(registro =>
        registro.zona.toLowerCase().includes(busqueda)
    );

    if (encontrados.length === 0) {
        mostrarMensajeBusqueda(
            "No hay registros disponibles para esta zona."
        );
        return;
    }

    searchResult.innerHTML = "";

    encontrados.forEach(registro => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "result-record";

        const titulo = document.createElement("strong");
        titulo.textContent = `${registro.zona} · ${registro.id}`;

        const valor = document.createElement("div");
        valor.className = "result-ph";
        valor.textContent = `pH ${registro.ph.toFixed(1)}`;

        const detalle = document.createElement("p");
        detalle.textContent =
            `${formatearFecha(registro.fecha)} · ${registro.origen}`;

        const interpretacion = document.createElement("p");
        interpretacion.textContent = interpretarPH(registro.ph);

        tarjeta.append(
            titulo,
            valor,
            detalle,
            interpretacion
        );

        if (registro.observaciones) {
            const observaciones = document.createElement("p");
            observaciones.className = "result-observations";
            observaciones.textContent =
                `Observaciones: ${registro.observaciones}`;

            tarjeta.appendChild(observaciones);
        }

        searchResult.appendChild(tarjeta);
    });

    const aviso = document.createElement("div");
    aviso.className = "demo-notice";
    aviso.textContent =
        "Los datos institucionales de ejemplo son simulados. " +
        "Los registros ciudadanos son aportados por los usuarios " +
        "y no están verificados.";

    searchResult.appendChild(aviso);
}

function mostrarMensajeBusqueda(mensaje) {
    searchResult.innerHTML = "";

    const estado = document.createElement("div");
    estado.className = "empty-state";

    const texto = document.createElement("p");
    texto.textContent = mensaje;

    estado.appendChild(texto);
    searchResult.appendChild(estado);
}


/* ==========================================
   REGISTRO CIUDADANO
========================================== */

function mostrarMensajeFormulario(mensaje, tipo) {
    formMessage.textContent = mensaje;
    formMessage.className = `form-message ${tipo}`;
}

function registrarMedicion(event) {
    event.preventDefault();

    const zona = recordZone.value.trim();
    const fecha = recordDate.value;
    const ph = Number(recordPh.value);
    const observaciones = recordObservations.value.trim();

    if (!zona || !fecha || recordPh.value.trim() === "") {
        mostrarMensajeFormulario(
            "Completa los campos obligatorios.",
            "error"
        );
        return;
    }

    if (fecha > obtenerFechaActual()) {
        mostrarMensajeFormulario(
            "La fecha no puede ser posterior al día de hoy.",
            "error"
        );
        return;
    }

    if (!Number.isFinite(ph) || ph < 0 || ph > 14) {
        mostrarMensajeFormulario(
            "Introduce un valor de pH entre 0 y 14.",
            "error"
        );
        return;
    }

    const nuevoRegistro = {
        id: generarIdentificador(),
        zona: zona,
        fecha: fecha,
        ph: ph,
        origen: "Ciudadano",
        observaciones: observaciones,
        tipo: "ciudadano"
    };

    registrosCiudadanos.unshift(nuevoRegistro);

    if (!guardarRegistrosCiudadanos()) {
        registrosCiudadanos.shift();

        mostrarMensajeFormulario(
            "No se pudo guardar el registro en este navegador.",
            "error"
        );
        return;
    }

    actualizarInterfaz();

    recordForm.reset();
    recordDate.value = obtenerFechaActual();

    mostrarMensajeFormulario(
        `Registro ${nuevoRegistro.id} guardado correctamente. ` +
        "Se identificó como medición ciudadana.",
        "success"
    );
}


/* ==========================================
   NAVEGACIÓN
========================================== */

function actualizarNavegacion() {
    const secciones = document.querySelectorAll(
        ".main-content > section[id], .main-content > header[id]"
    );

    let seccionActual = "inicio";
    const posicion = window.scrollY + 150;

    secciones.forEach(seccion => {
        if (posicion >= seccion.offsetTop) {
            seccionActual = seccion.id;
        }
    });

    navItems.forEach(enlace => {
        const destino = enlace.getAttribute("href");

        enlace.classList.toggle(
            "active",
            destino === `#${seccionActual}`
        );
    });
}

navItems.forEach(enlace => {
    enlace.addEventListener("click", event => {
        const destino = enlace.getAttribute("href");

        if (!destino || !destino.startsWith("#")) return;

        const seccion = document.querySelector(destino);

        if (!seccion) return;

        event.preventDefault();

        seccion.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        history.replaceState(null, "", destino);

        navItems.forEach(item => {
            item.classList.remove("active");
        });

        enlace.classList.add("active");
    });
});

window.addEventListener("scroll", actualizarNavegacion);


/* ==========================================
   ACTUALIZACIÓN GENERAL
========================================== */

function actualizarInterfaz() {
    actualizarEstadisticas();
    mostrarRegistros();
}


/* ==========================================
   EVENTOS
========================================== */

searchForm.addEventListener("submit", event => {
    event.preventDefault();
    buscarZona();
});

recordForm.addEventListener("submit", registrarMedicion);

recordForm.addEventListener("reset", () => {
    setTimeout(() => {
        formMessage.textContent = "";
        formMessage.className = "form-message";
        recordDate.value = obtenerFechaActual();
    }, 0);
});


/* ==========================================
   INICIALIZACIÓN
========================================== */

recordDate.max = obtenerFechaActual();
recordDate.value = obtenerFechaActual();

actualizarInterfaz();
actualizarNavegacion();
