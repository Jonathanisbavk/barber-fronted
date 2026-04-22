const form = document.getElementById('barberoForm');
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

// Lista en memoria de especialidades del barbero actual
let especialidades = [];

// ── Helpers de validación inline ──────────────────────────────────────────────
function marcarInvalido(inputEl, feedbackId) {
    inputEl.classList.add('is-invalid');
    if (feedbackId) {
        const fb = document.getElementById(feedbackId);
        if (fb) fb.style.display = 'block';
    }
}

function limpiarValidaciones() {
    document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    document.querySelectorAll('.invalid-feedback').forEach(el => el.style.display = 'none');
}

// ── Tags de especialidades ─────────────────────────────────────────────────────
function renderTags() {
    const container = document.getElementById('especialidades-tags');
    if (especialidades.length === 0) {
        container.innerHTML = '<span class="text-muted fst-italic small">Ninguna especialidad agregada aún.</span>';
        return;
    }
    container.innerHTML = especialidades.map((nombre, i) => `
        <span class="badge d-inline-flex align-items-center gap-1 py-2 px-3"
              style="background:#3a3a3a; border:1px solid var(--color-gold); color:var(--color-text); font-size:.85rem;">
            ${nombre}
            <button type="button"
                    onclick="eliminarEspecialidad(${i})"
                    style="background:none;border:none;cursor:pointer;padding:0;line-height:1;color:var(--color-text-muted);"
                    aria-label="Quitar ${nombre}">
                <i class="bi bi-x-lg" style="font-size:.7rem;"></i>
            </button>
        </span>
    `).join('');
}

function eliminarEspecialidad(index) {
    especialidades.splice(index, 1);
    renderTags();
}

function agregarEspecialidad() {
    const input = document.getElementById('especialidad-input');
    const valor = input.value.trim();
    if (!valor) return;

    // Evitar duplicados (sin distinción de mayúsculas)
    const yaExiste = especialidades.some(e => e.toLowerCase() === valor.toLowerCase());
    if (yaExiste) {
        input.value = '';
        return;
    }

    especialidades.push(valor);
    renderTags();
    input.value = '';
    input.focus();
}

// ── Validación principal ───────────────────────────────────────────────────────
function validarFormulario() {
    limpiarValidaciones();

    const nombre     = document.getElementById('nombre');
    const telefono   = document.getElementById('telefono');
    const disponible = document.getElementById('disponible');

    const camposVacios = [];

    if (!nombre.value.trim())  { marcarInvalido(nombre);    camposVacios.push('Nombre'); }
    if (!disponible.value)     { marcarInvalido(disponible); camposVacios.push('Estado'); }

    // Validar que haya al menos una especialidad
    if (especialidades.length === 0) {
        document.getElementById('especialidades-feedback').style.display = 'block';
        camposVacios.push('Especialidades');
    }

    // Validar teléfono: exactamente 9 dígitos numéricos
    const telVal = telefono.value.trim();
    if (!telVal) {
        marcarInvalido(telefono, 'telefono-feedback');
        camposVacios.push('Teléfono');
    } else if (!/^[0-9]{9}$/.test(telVal)) {
        marcarInvalido(telefono, 'telefono-feedback');
        Swal.fire({
            title: 'Teléfono inválido',
            text: 'El número debe tener exactamente 9 dígitos.',
            icon: 'warning',
            confirmButtonColor: '#D4A017',
            background: '#2c2c2c',
            color: '#f0f0f0'
        });
        return false;
    }

    if (camposVacios.length > 0) {
        Swal.fire({
            title: 'Campos obligatorios',
            html: `Completa los siguientes campos:<br><strong>${camposVacios.join(', ')}</strong>`,
            icon: 'warning',
            confirmButtonColor: '#D4A017',
            background: '#2c2c2c',
            color: '#f0f0f0'
        });
        return false;
    }

    return true;
}

// ── Carga de datos en modo edición ────────────────────────────────────────────
function cargarBarbero() {
    if (!id) {
        document.getElementById('form-titulo').textContent = 'Nuevo Barbero';
        renderTags(); // muestra placeholder vacío
        return;
    }

    document.getElementById('form-titulo').textContent = 'Editar Barbero';

    axios.get(`${API_URL}/barberos/${id}`)
        .then(response => {
            const b = response.data;
            document.getElementById('barberoId').value   = b.id;
            document.getElementById('nombre').value      = b.nombre;
            document.getElementById('telefono').value    = b.telefono
                ? b.telefono.replace(/^\+51/, '').trim()
                : '';
            document.getElementById('disponible').value  = String(b.disponible);

            // Poblar la lista de especialidades desde los datos del barbero
            especialidades = (b.especialidades || []).map(e => e.nombre);
            renderTags();
        })
        .catch(() => {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo cargar el barbero.',
                icon: 'error',
                background: '#2c2c2c',
                color: '#f0f0f0'
            }).then(() => { window.location.href = 'barberos.html'; });
        });
}

// ── Eventos ───────────────────────────────────────────────────────────────────
if (form) {
    // Solo dígitos en el campo teléfono
    document.getElementById('telefono').addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, '').slice(0, 9);
    });

    // Agregar especialidad con el botón "+"
    document.getElementById('btn-agregar-esp').addEventListener('click', agregarEspecialidad);

    // Agregar especialidad presionando Enter en el input
    document.getElementById('especialidad-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // evita que el Enter envíe el formulario
            agregarEspecialidad();
        }
    });

    // ── Envío del formulario ───────────────────────────────────────────────
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!validarFormulario()) return;

        // Construir el body con especialidades como array de objetos {nombre}
        // El backend espera: "especialidades": [{"nombre":"Corte"}, {"nombre":"Afeitado"}]
        const body = {
            nombre:         document.getElementById('nombre').value.trim(),
            telefono:       '+51' + document.getElementById('telefono').value.trim(),
            disponible:     document.getElementById('disponible').value === 'true',
            especialidades: especialidades.map(nombre => ({ nombre }))
        };

        const request = id
            ? axios.put(`${API_URL}/barberos/${id}`, body)
            : axios.post(`${API_URL}/barberos`, body);

        request
            .then(() => {
                Swal.fire({
                    title: id ? 'Barbero actualizado' : 'Barbero creado',
                    text: 'Operación realizada exitosamente.',
                    icon: 'success',
                    confirmButtonColor: '#D4A017',
                    background: '#2c2c2c',
                    color: '#f0f0f0'
                }).then(() => { window.location.href = 'barberos.html'; });
            })
            .catch(() => {
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo guardar el barbero.',
                    icon: 'error',
                    background: '#2c2c2c',
                    color: '#f0f0f0'
                });
            });
    });
}

window.addEventListener('DOMContentLoaded', cargarBarbero);
