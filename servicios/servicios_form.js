const API_URL = 'http://localhost:8080/api';
const form = document.getElementById('servicioForm');
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

function cargarServicio() {
    if (!id) {
        document.getElementById('form-titulo').textContent = 'Nuevo Servicio';
        return;
    }
    
    document.getElementById('form-titulo').textContent = 'Editar Servicio';
    
    axios.get(`${API_URL}/servicios/${id}`)
        .then(response => {
            const servicio = response.data;
            document.getElementById('servicioId').value = servicio.id;
            document.getElementById('nombre').value = servicio.nombre;
            document.getElementById('descripcion').value = servicio.descripcion;
            document.getElementById('precio').value = servicio.precio;
            document.getElementById('duracionMinutos').value = servicio.duracionMinutos;
        })
        .catch(() => {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo cargar el servicio.',
                icon: 'error',
                background: '#2c2c2c',
                color: '#f0f0f0'
            }).then(() => {
                window.location.href = 'servicios.html';
            });
        });
}

if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const body = {
            nombre: document.getElementById('nombre').value,
            descripcion: document.getElementById('descripcion').value,
            precio: parseFloat(document.getElementById('precio').value),
            duracionMinutos: parseInt(document.getElementById('duracionMinutos').value)
        };
        
        const request = id
            ? axios.put(`${API_URL}/servicios/${id}`, body)
            : axios.post(`${API_URL}/servicios`, body);
        
        request
            .then(() => {
                Swal.fire({
                    title: id ? 'Servicio actualizado' : 'Servicio creado',
                    text: 'Operación realizada exitosamente.',
                    icon: 'success',
                    background: '#2c2c2c',
                    color: '#f0f0f0'
                }).then(() => {
                    window.location.href = 'servicios.html';
                });
            })
            .catch((error) => {
                console.error('Error:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo guardar el servicio.',
                    icon: 'error',
                    background: '#2c2c2c',
                    color: '#f0f0f0'
                });
            });
    });
}

window.addEventListener('DOMContentLoaded', cargarServicio);
