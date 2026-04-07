const API_URL = 'http://localhost:8080/api';
const form = document.getElementById('clienteForm');
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

function cargarCliente() {
    if (!id) {
        document.getElementById('form-titulo').textContent = 'Nuevo Cliente';
        return;
    }
    
    document.getElementById('form-titulo').textContent = 'Editar Cliente';
    
    axios.get(`${API_URL}/clientes/${id}`)
        .then(response => {
            const cliente = response.data;
            document.getElementById('clienteId').value = cliente.id;
            document.getElementById('nombre').value = cliente.nombre;
            document.getElementById('telefono').value = cliente.telefono;
            document.getElementById('email').value = cliente.email;
        })
        .catch(() => {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo cargar el cliente.',
                icon: 'error',
                background: '#2c2c2c',
                color: '#f0f0f0'
            }).then(() => {
                window.location.href = 'clientes.html';
            });
        });
}

if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const body = {
            nombre: document.getElementById('nombre').value,
            telefono: document.getElementById('telefono').value,
            email: document.getElementById('email').value
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
                    background: '#2c2c2c',
                    color: '#f0f0f0'
                }).then(() => {
                    window.location.href = 'clientes.html';
                });
            })
            .catch((error) => {
                console.error('Error:', error);
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
