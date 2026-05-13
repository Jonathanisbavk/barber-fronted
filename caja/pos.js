// Punto de Venta — lógica de carrito, cálculos y emisión de comprobante.
// El cálculo financiero "fuente de verdad" lo hace el backend; aquí solo
// previsualizamos los montos para el usuario antes de emitir.

const SERVICIOS_API = `${API_URL}/servicios`;
const CITAS_API = `${API_URL}/citas`;
const COMPROBANTES_API = `${API_URL}/comprobantes`;
const IGV_DIVISOR = 1.18;

let serviciosDisponibles = [];
let carrito = []; // [{ servicioId, nombre, precio, cantidad }]

document.addEventListener('DOMContentLoaded', () => {
    cargarServicios();
    cargarCitasPendientes();

    document.querySelectorAll('input[name="tipoDoc"]').forEach(r => {
        r.addEventListener('change', actualizarLabelsTipoDoc);
    });
    document.getElementById('buscarServicio').addEventListener('input', renderizarServicios);
    document.getElementById('btnEmitirBoleta').addEventListener('click', () => emitir('BOLETA'));
    document.getElementById('btnEmitirFactura').addEventListener('click', () => emitir('FACTURA'));
});

// ---------- Carga inicial ----------

function cargarServicios() {
    axios.get(SERVICIOS_API)
        .then(res => {
            serviciosDisponibles = res.data;
            renderizarServicios();
        })
        .catch(() => mostrarError('No se pudo cargar la lista de servicios.'));
}

function cargarCitasPendientes() {
    axios.get(CITAS_API)
        .then(res => {
            const select = document.getElementById('citaSelect');
            res.data
                .filter(c => c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA')
                .forEach(c => {
                    const opt = document.createElement('option');
                    opt.value = c.id;
                    opt.textContent = `Cita #${c.id} — ${c.fecha} ${c.hora} (${c.estado})`;
                    select.appendChild(opt);
                });
        })
        .catch(() => console.warn('No se pudieron cargar las citas.'));
}

// ---------- UI de servicios ----------

function renderizarServicios() {
    const filtro = document.getElementById('buscarServicio').value.toLowerCase();
    const cont = document.getElementById('serviciosList');
    cont.innerHTML = '';
    serviciosDisponibles
        .filter(s => s.nombre.toLowerCase().includes(filtro))
        .forEach(s => {
            const row = document.createElement('div');
            row.className = 'servicio-row';
            row.innerHTML = `
                <div class="flex-grow-1">
                    <strong>${s.nombre}</strong>
                    <div class="text-muted small">${s.duracionMinutos || '-'} min</div>
                </div>
                <div class="me-3">S/. ${Number(s.precio).toFixed(2)}</div>
                <button class="btn btn-sm btn-outline-primary"><i class="bi bi-plus"></i></button>
            `;
            row.addEventListener('click', () => agregarAlCarrito(s));
            cont.appendChild(row);
        });
}

// ---------- Carrito ----------

function agregarAlCarrito(servicio) {
    const existente = carrito.find(i => i.servicioId === servicio.id);
    if (existente) {
        existente.cantidad += 1;
    } else {
        carrito.push({
            servicioId: servicio.id,
            nombre: servicio.nombre,
            precio: Number(servicio.precio),
            cantidad: 1
        });
    }
    renderizarCarrito();
}

function quitarDelCarrito(servicioId) {
    carrito = carrito.filter(i => i.servicioId !== servicioId);
    renderizarCarrito();
}

function cambiarCantidad(servicioId, delta) {
    const item = carrito.find(i => i.servicioId === servicioId);
    if (!item) return;
    item.cantidad = Math.max(1, item.cantidad + delta);
    renderizarCarrito();
}

function renderizarCarrito() {
    const tbody = document.querySelector('#carritoTable tbody');
    const vacio = document.getElementById('carritoVacio');
    tbody.innerHTML = '';

    if (carrito.length === 0) {
        vacio.style.display = 'block';
    } else {
        vacio.style.display = 'none';
        carrito.forEach(item => {
            const subtotal = item.precio * item.cantidad;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.nombre}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-secondary" onclick="cambiarCantidad(${item.servicioId}, -1)">-</button>
                    <span class="mx-2">${item.cantidad}</span>
                    <button class="btn btn-sm btn-outline-secondary" onclick="cambiarCantidad(${item.servicioId}, 1)">+</button>
                </td>
                <td class="text-end">S/. ${item.precio.toFixed(2)}</td>
                <td class="text-end">S/. ${subtotal.toFixed(2)}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-danger" onclick="quitarDelCarrito(${item.servicioId})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
    actualizarTotales();
}

function actualizarTotales() {
    const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
    const subtotal = total / IGV_DIVISOR;
    const igv = total - subtotal;
    document.getElementById('lblSubtotal').textContent = `S/. ${subtotal.toFixed(2)}`;
    document.getElementById('lblIgv').textContent = `S/. ${igv.toFixed(2)}`;
    document.getElementById('lblTotal').textContent = `S/. ${total.toFixed(2)}`;
}

// ---------- Tipo de documento ----------

function actualizarLabelsTipoDoc() {
    const tipo = document.querySelector('input[name="tipoDoc"]:checked').value;
    const isFactura = tipo === 'FACTURA';
    document.getElementById('lblNumero').textContent = isFactura ? 'RUC' : 'DNI';
    document.getElementById('lblNombre').textContent = isFactura ? 'Razón social' : 'Nombre del cliente';
    document.getElementById('numeroDocumento').placeholder = isFactura ? '11 dígitos' : '8 dígitos';
    document.getElementById('numeroDocumento').maxLength = isFactura ? 11 : 8;
}

// ---------- Emisión ----------

function emitir(tipoForzado) {
    if (carrito.length === 0) {
        mostrarError('Agrega al menos un servicio al carrito.');
        return;
    }

    // Forzar el radio según el botón presionado, para que el usuario no se equivoque.
    document.querySelector(`input[value="${tipoForzado}"]`).checked = true;
    actualizarLabelsTipoDoc();

    const numero = document.getElementById('numeroDocumento').value.trim();
    const nombre = document.getElementById('nombreCliente').value.trim();

    if (!nombre) {
        mostrarError(tipoForzado === 'FACTURA' ? 'Ingresa la razón social.' : 'Ingresa el nombre del cliente.');
        return;
    }
    const requeridoLen = tipoForzado === 'FACTURA' ? 11 : 8;
    if (!/^\d+$/.test(numero) || numero.length !== requeridoLen) {
        mostrarError(`${tipoForzado === 'FACTURA' ? 'RUC' : 'DNI'} inválido (debe tener ${requeridoLen} dígitos).`);
        return;
    }

    const citaId = document.getElementById('citaSelect').value;
    const payload = {
        tipoDocumento: tipoForzado,
        numeroDocumento: numero,
        nombreCliente: nombre,
        citaId: citaId ? parseInt(citaId) : null,
        servicios: carrito.map(i => ({ servicioId: i.servicioId, cantidad: i.cantidad }))
    };

    axios.post(COMPROBANTES_API, payload)
        .then(res => mostrarComprobante(res.data))
        .catch(err => {
            const msg = err.response?.data?.error || 'No se pudo emitir el comprobante.';
            mostrarError(msg);
        });
}

function mostrarComprobante(c) {
    const detalles = c.detalles.map(d =>
        `<tr><td>${d.nombreServicio}</td><td class="text-center">${d.cantidad}</td><td class="text-end">S/. ${Number(d.precioUnitario).toFixed(2)}</td><td class="text-end">S/. ${Number(d.subtotalLinea).toFixed(2)}</td></tr>`
    ).join('');

    Swal.fire({
        title: `${c.tipoDocumento} ${c.serie}-${c.correlativo}`,
        html: `
            <div class="text-start">
                <p class="mb-1"><strong>${c.numeroDocumento}</strong> — ${c.nombreCliente}</p>
                <p class="text-muted small mb-2">${new Date(c.fechaEmision).toLocaleString()}</p>
                <table class="table table-sm">
                    <thead><tr><th>Servicio</th><th class="text-center">Cant.</th><th class="text-end">P.U.</th><th class="text-end">Subtotal</th></tr></thead>
                    <tbody>${detalles}</tbody>
                </table>
                <div class="d-flex justify-content-between"><span>Subtotal:</span><strong>S/. ${Number(c.subtotal).toFixed(2)}</strong></div>
                <div class="d-flex justify-content-between"><span>IGV (18%):</span><strong>S/. ${Number(c.igv).toFixed(2)}</strong></div>
                <div class="d-flex justify-content-between fs-5 border-top pt-2 mt-2"><span>TOTAL:</span><strong>S/. ${Number(c.total).toFixed(2)}</strong></div>
            </div>
        `,
        icon: 'success',
        confirmButtonText: 'Aceptar'
    }).then(() => resetearFormulario());
}

function resetearFormulario() {
    carrito = [];
    document.getElementById('numeroDocumento').value = '';
    document.getElementById('nombreCliente').value = '';
    document.getElementById('citaSelect').value = '';
    renderizarCarrito();
}

function mostrarError(mensaje) {
    Swal.fire({ title: 'Error', text: mensaje, icon: 'error', confirmButtonText: 'Aceptar' });
}
