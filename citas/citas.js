const tableBody = document.getElementById('citas-table-body');
let citas = [];
let clientes = [];
let barberos = [];
let servicios = [];

function cargarDatos() {
    // Cargar citas y datos relacionados
    Promise.all([
        axios.get(`${API_URL}/citas`),
        axios.get(`${API_URL}/clientes`),
        axios.get(`${API_URL}/barberos`),
        axios.get(`${API_URL}/servicios`)
    ]).then(responses => {
        citas = responses[0].data;
        clientes = responses[1].data;
        barberos = responses[2].data;
        servicios = responses[3].data;
        renderizarCitas(citas);
    }).catch(error => {
        console.error('Error al cargar datos:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar las citas.',
            icon: 'error',
            background: '#2c2c2c',
            color: '#f0f0f0'
        });
    });
}

function obtenerNombreCliente(id) {
    const cliente = clientes.find(c => c.id === id);
    return cliente ? cliente.nombre : 'N/A';
}

function obtenerNombreBarbero(id) {
    const barbero = barberos.find(b => b.id === id);
    return barbero ? barbero.nombre : 'N/A';
}

function obtenerNombreServicio(id) {
    const servicio = servicios.find(s => s.id === id);
    return servicio ? servicio.nombre : 'N/A';
}

function obtenerBadgeEstado(estado) {
    switch(estado) {
        case 'PENDIENTE':
            return '<span class="badge bg-warning text-dark">Pendiente</span>';
        case 'CONFIRMADA':
            return '<span class="badge bg-primary">Confirmada</span>';
        case 'COMPLETADA':
            return '<span class="badge bg-success">Completada</span>';
        case 'CANCELADA':
            return '<span class="badge bg-secondary">Cancelada</span>';
        default:
            return '<span class="badge bg-secondary">Desconocido</span>';
    }
}

function renderizarCitas(lista) {
    tableBody.innerHTML = '';
    if (lista.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No hay citas registradas</td></tr>';
        return;
    }
    
    lista.forEach(cita => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${cita.id}</td>
            <td>${obtenerNombreCliente(cita.clienteId)}</td>
            <td>${obtenerNombreBarbero(cita.barberoId)}</td>
            <td>${obtenerNombreServicio(cita.servicioId)}</td>
            <td>${cita.fecha}</td>
            <td>${cita.hora}</td>
            <td>${obtenerBadgeEstado(cita.estado)}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editarCita(${cita.id})">
                    <i class="bi bi-pencil-square"></i> Editar
                </button>
                <button class="btn btn-danger btn-sm" onclick="eliminarCita(${cita.id})">
                    <i class="bi bi-trash"></i> Eliminar
                </button>
            </td>
        `;
        tableBody.appendChild(fila);
    });
}

// Búsqueda en tiempo real
document.getElementById('search-input').addEventListener('input', (e) => {
    const termino = e.target.value.toLowerCase();
    const filtrados = citas.filter(cita => 
        obtenerNombreCliente(cita.clienteId).toLowerCase().includes(termino) ||
        obtenerNombreBarbero(cita.barberoId).toLowerCase().includes(termino)
    );
    renderizarCitas(filtrados);
});

function editarCita(id) {
    window.location.href = `citas_form.html?id=${id}`;
}

function eliminarCita(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#D4A017',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        background: '#2c2c2c',
        color: '#f0f0f0'
    }).then((result) => {
        if (result.isConfirmed) {
            axios.delete(`${API_URL}/citas/${id}`)
                .then(() => {
                    Swal.fire({
                        title: 'Eliminado',
                        text: 'Cita eliminada correctamente.',
                        icon: 'success',
                        background: '#2c2c2c',
                        color: '#f0f0f0'
                    });
                    cargarDatos();
                })
                .catch(() => {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo eliminar la cita.',
                        icon: 'error',
                        background: '#2c2c2c',
                        color: '#f0f0f0'
                    });
                });
        }
    });
}

window.addEventListener('DOMContentLoaded', cargarDatos);
