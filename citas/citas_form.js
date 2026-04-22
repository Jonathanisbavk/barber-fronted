const form = document.getElementById('citaForm');
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

function cargarSelects() {
    // Cargar opciones de los selects
    Promise.all([
        axios.get(`${API_URL}/clientes`),
        axios.get(`${API_URL}/barberos`),
        axios.get(`${API_URL}/servicios`)
    ]).then(responses => {
        // Poblar select de clientes
        const selectCliente = document.getElementById('clienteId');
        responses[0].data.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id;
            option.textContent = cliente.nombre;
            selectCliente.appendChild(option);
        });
        
        // Poblar select de barberos
        const selectBarbero = document.getElementById('barberoId');
        responses[1].data.forEach(barbero => {
            const option = document.createElement('option');
            option.value = barbero.id;
            const esps = (barbero.especialidades || []).map(e => e.nombre).join(', ');
            option.textContent = barbero.nombre + (esps ? ` - ${esps}` : '');
            selectBarbero.appendChild(option);
        });
        
        // Poblar select de servicios
        const selectServicio = document.getElementById('servicioId');
        responses[2].data.forEach(servicio => {
            const option = document.createElement('option');
            option.value = servicio.id;
            option.textContent = `${servicio.nombre} - S/ ${servicio.precio.toFixed(2)}`;
            selectServicio.appendChild(option);
        });
        
        // Después de cargar los selects, si hay id, cargar la cita para editar
        if (id) cargarCita();
    }).catch(err => {
        console.error('Error al cargar selects:', err);
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar los datos necesarios.',
            icon: 'error',
            background: '#2c2c2c',
            color: '#f0f0f0'
        });
    });
}

function cargarCita() {
    if (!id) {
        document.getElementById('form-titulo').textContent = 'Nueva Cita';
        return;
    }
    
    document.getElementById('form-titulo').textContent = 'Editar Cita';
    
    axios.get(`${API_URL}/citas/${id}`)
        .then(response => {
            const cita = response.data;
            document.getElementById('citaId').value = cita.id;
            document.getElementById('clienteId').value = cita.clienteId;
            document.getElementById('barberoId').value = cita.barberoId;
            document.getElementById('servicioId').value = cita.servicioId;
            document.getElementById('fecha').value = cita.fecha;
            document.getElementById('hora').value = cita.hora;
            document.getElementById('estado').value = cita.estado;
        })
        .catch(() => {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo cargar la cita.',
                icon: 'error',
                background: '#2c2c2c',
                color: '#f0f0f0'
            }).then(() => {
                window.location.href = 'citas.html';
            });
        });
}

if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const body = {
            clienteId: parseInt(document.getElementById('clienteId').value),
            barberoId: parseInt(document.getElementById('barberoId').value),
            servicioId: parseInt(document.getElementById('servicioId').value),
            fecha: document.getElementById('fecha').value,
            hora: document.getElementById('hora').value,
            estado: document.getElementById('estado').value
        };
        
        const request = id
            ? axios.put(`${API_URL}/citas/${id}`, body)
            : axios.post(`${API_URL}/citas`, body);
        
        request
            .then(() => {
                Swal.fire({
                    title: id ? 'Cita actualizada' : 'Cita creada',
                    text: 'Operación realizada exitosamente.',
                    icon: 'success',
                    background: '#2c2c2c',
                    color: '#f0f0f0'
                }).then(() => {
                    window.location.href = 'citas.html';
                });
            })
            .catch((error) => {
                console.error('Error:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo guardar la cita.',
                    icon: 'error',
                    background: '#2c2c2c',
                    color: '#f0f0f0'
                });
            });
    });
}

window.addEventListener('DOMContentLoaded', cargarSelects);
