const API_URL = 'http://localhost:8080/api';
const tableBody = document.getElementById('servicios-table-body');
let servicios = [];

function cargarServicios() {
    axios.get(`${API_URL}/servicios`)
        .then(response => {
            servicios = response.data;
            renderizarServicios(servicios);
        })
        .catch(error => {
            console.error('Error al cargar servicios:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los servicios.',
                icon: 'error',
                background: '#2c2c2c',
                color: '#f0f0f0'
            });
        });
}

function renderizarServicios(lista) {
    tableBody.innerHTML = '';
    if (lista.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay servicios registrados</td></tr>';
        return;
    }
    
    lista.forEach(servicio => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${servicio.id}</td>
            <td>${servicio.nombre}</td>
            <td>${servicio.descripcion}</td>
            <td>S/ ${servicio.precio.toFixed(2)}</td>
            <td>${servicio.duracionMinutos}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editarServicio(${servicio.id})">
                    <i class="bi bi-pencil-square"></i> Editar
                </button>
                <button class="btn btn-danger btn-sm" onclick="eliminarServicio(${servicio.id})">
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
    const filtrados = servicios.filter(servicio => 
        servicio.nombre.toLowerCase().includes(termino)
    );
    renderizarServicios(filtrados);
});

function editarServicio(id) {
    window.location.href = `servicios_form.html?id=${id}`;
}

function eliminarServicio(id) {
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
            axios.delete(`${API_URL}/servicios/${id}`)
                .then(() => {
                    Swal.fire({
                        title: 'Eliminado',
                        text: 'Servicio eliminado correctamente.',
                        icon: 'success',
                        background: '#2c2c2c',
                        color: '#f0f0f0'
                    });
                    cargarServicios();
                })
                .catch(() => {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo eliminar el servicio.',
                        icon: 'error',
                        background: '#2c2c2c',
                        color: '#f0f0f0'
                    });
                });
        }
    });
}

window.addEventListener('DOMContentLoaded', cargarServicios);
