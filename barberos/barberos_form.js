const API_URL = 'http://localhost:8080/api';
const form = document.getElementById('barberoForm');
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

function cargarBarbero() {
    if (!id) {
        document.getElementById('form-titulo').textContent = 'Nuevo Barbero';
        return;
    }
    
    document.getElementById('form-titulo').textContent = 'Editar Barbero';
    
    axios.get(`${API_URL}/barberos/${id}`)
        .then(response => {
            const barbero = response.data;
            document.getElementById('barberoId').value = barbero.id;
            document.getElementById('nombre').value = barbero.nombre;
            document.getElementById('especialidad').value = barbero.especialidad;
            document.getElementById('telefono').value = barbero.telefono;
            document.getElementById('disponible').value = barbero.disponible.toString();
        })
        .catch(() => {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo cargar el barbero.',
                icon: 'error',
                background: '#2c2c2c',
                color: '#f0f0f0'
            }).then(() => {
                window.location.href = 'barberos.html';
            });
        });
}

if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const body = {
            nombre: document.getElementById('nombre').value,
            especialidad: document.getElementById('especialidad').value,
            telefono: document.getElementById('telefono').value,
            disponible: document.getElementById('disponible').value === 'true'
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
                    background: '#2c2c2c',
                    color: '#f0f0f0'
                }).then(() => {
                    window.location.href = 'barberos.html';
                });
            })
            .catch((error) => {
                console.error('Error:', error);
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
