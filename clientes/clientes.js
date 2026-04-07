const API_URL = 'http://localhost:8080/api';
const tableBody = document.getElementById('clientes-table-body');
let clientes = [];

function cargarClientes() {
    axios.get(`${API_URL}/clientes`)
        .then(response => {
            clientes = response.data;
            renderizarClientes(clientes);
        })
        .catch(error => {
            console.error('Error al cargar clientes:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los clientes.',
                icon: 'error',
                background: '#2c2c2c',
                color: '#f0f0f0'
            });
        });
}

function renderizarClientes(lista) {
    tableBody.innerHTML = '';
    if (lista.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay clientes registrados</td></tr>';
        return;
    }
    
    lista.forEach(cliente => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${cliente.id}</td>
            <td>${cliente.nombre}</td>
            <td>${cliente.telefono}</td>
            <td>${cliente.email}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editarCliente(${cliente.id})">
                    <i class="bi bi-pencil-square"></i> Editar
                </button>
                <button class="btn btn-danger btn-sm" onclick="eliminarCliente(${cliente.id})">
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
    const filtrados = clientes.filter(cliente => 
        cliente.nombre.toLowerCase().includes(termino) ||
        cliente.telefono.toLowerCase().includes(termino) ||
        cliente.email.toLowerCase().includes(termino)
    );
    renderizarClientes(filtrados);
});

function editarCliente(id) {
    window.location.href = `clientes_form.html?id=${id}`;
}

function eliminarCliente(id) {
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
            axios.delete(`${API_URL}/clientes/${id}`)
                .then(() => {
                    Swal.fire({
                        title: 'Eliminado',
                        text: 'Cliente eliminado correctamente.',
                        icon: 'success',
                        background: '#2c2c2c',
                        color: '#f0f0f0'
                    });
                    cargarClientes();
                })
                .catch(() => {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo eliminar el cliente.',
                        icon: 'error',
                        background: '#2c2c2c',
                        color: '#f0f0f0'
                    });
                });
        }
    });
}

window.addEventListener('DOMContentLoaded', cargarClientes);
