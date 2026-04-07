const API_URL = 'http://localhost:8080/api';
const tableBody = document.getElementById('barberos-table-body');
let barberos = [];

function cargarBarberos() {
    axios.get(`${API_URL}/barberos`)
        .then(response => {
            barberos = response.data;
            renderizarBarberos(barberos);
        })
        .catch(error => {
            console.error('Error al cargar barberos:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los barberos.',
                icon: 'error',
                background: '#2c2c2c',
                color: '#f0f0f0'
            });
        });
}

function renderizarBarberos(lista) {
    tableBody.innerHTML = '';
    if (lista.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay barberos registrados</td></tr>';
        return;
    }
    
    lista.forEach(barbero => {
        const fila = document.createElement('tr');
        const estadoBadge = barbero.disponible 
            ? '<span class="badge bg-success">Disponible</span>'
            : '<span class="badge bg-danger">No disponible</span>';
        
        fila.innerHTML = `
            <td>${barbero.id}</td>
            <td>${barbero.nombre}</td>
            <td>${barbero.especialidad}</td>
            <td>${barbero.telefono}</td>
            <td>${estadoBadge}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editarBarbero(${barbero.id})">
                    <i class="bi bi-pencil-square"></i> Editar
                </button>
                <button class="btn btn-danger btn-sm" onclick="eliminarBarbero(${barbero.id})">
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
    const filtrados = barberos.filter(barbero => 
        barbero.nombre.toLowerCase().includes(termino) ||
        barbero.especialidad.toLowerCase().includes(termino) ||
        barbero.telefono.toLowerCase().includes(termino)
    );
    renderizarBarberos(filtrados);
});

function editarBarbero(id) {
    window.location.href = `barberos_form.html?id=${id}`;
}

function eliminarBarbero(id) {
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
            axios.delete(`${API_URL}/barberos/${id}`)
                .then(() => {
                    Swal.fire({
                        title: 'Eliminado',
                        text: 'Barbero eliminado correctamente.',
                        icon: 'success',
                        background: '#2c2c2c',
                        color: '#f0f0f0'
                    });
                    cargarBarberos();
                })
                .catch(() => {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo eliminar el barbero.',
                        icon: 'error',
                        background: '#2c2c2c',
                        color: '#f0f0f0'
                    });
                });
        }
    });
}

window.addEventListener('DOMContentLoaded', cargarBarberos);
