const form = document.getElementById('clienteForm');
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

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

// ── Validación principal ───────────────────────────────────────────────────────
function validarFormulario() {
    limpiarValidaciones();

    const nombre   = document.getElementById('nombre');
    const telefono = document.getElementById('telefono');
    const email    = document.getElementById('email');

    const camposVacios = [];

    if (!nombre.value.trim()) { marcarInvalido(nombre); camposVacios.push('Nombre'); }
    if (!email.value.trim())  { marcarInvalido(email);  camposVacios.push('Email'); }

    // Validar email básico
    if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        marcarInvalido(email);
        Swal.fire({
            title: 'Email inválido',
            text: 'Ingresa un correo electrónico con formato válido.',
            icon: 'warning',
            confirmButtonColor: '#D4A017',
            background: '#2c2c2c',
            color: '#f0f0f0'
        });
        return false;
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
            text: 'El número debe tener exactamente 9 dígitos (sin espacios ni letras).',
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
function cargarCliente() {
    if (!id) {
        document.getElementById('form-titulo').textContent = 'Nuevo Cliente';
        return;
    }

    document.getElementById('form-titulo').textContent = 'Editar Cliente';

    axios.get(`${API_URL}/clientes/${id}`)
        .then(response => {
            const c = response.data;
            document.getElementById('clienteId').value = c.id;
            document.getElementById('nombre').value    = c.nombre;
            document.getElementById('telefono').value  = c.telefono
                ? c.telefono.replace(/^\+51/, '').trim()
                : '';
            document.getElementById('email').value     = c.email;
        })
        .catch(() => {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo cargar el cliente.',
                icon: 'error',
                background: '#2c2c2c',
                color: '#f0f0f0'
            }).then(() => { window.location.href = 'clientes.html'; });
        });
}

// ── Envío del formulario ───────────────────────────────────────────────────────
if (form) {
    // Solo dígitos en el campo teléfono
    document.getElementById('telefono').addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, '').slice(0, 9);
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!validarFormulario()) return;

        const body = {
            nombre:   document.getElementById('nombre').value.trim(),
            telefono: '+51' + document.getElementById('telefono').value.trim(),
            email:    document.getElementById('email').value.trim()
        };

        const request = id
            ? axios.put(`${API_URL}/clientes/${id}`, body)
            : axios.post(`${API_URL}/clientes`, body);

        request
            .then(() => {
                Swal.fire({
                    title: id ? 'Cliente actualizado' : 'Cliente creado',
                    text: 'Operación realizada exitosamente.',
                    icon: 'success',
                    confirmButtonColor: '#D4A017',
                    background: '#2c2c2c',
                    color: '#f0f0f0'
                }).then(() => { window.location.href = 'clientes.html'; });
            })
            .catch(() => {
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo guardar el cliente.',
                    icon: 'error',
                    background: '#2c2c2c',
                    color: '#f0f0f0'
                });
            });
    });
}

window.addEventListener('DOMContentLoaded', cargarCliente);
