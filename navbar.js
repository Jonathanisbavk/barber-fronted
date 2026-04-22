function loadNavbar() {
    const currentPath = window.location.pathname;
    const isInSubfolder = currentPath.includes('/barberos/') ||
                          currentPath.includes('/servicios/') ||
                          currentPath.includes('/clientes/') ||
                          currentPath.includes('/citas/');

    const rootPrefix = isInSubfolder ? '../' : '';

    const navbarHtml = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container-fluid">
                <a class="navbar-brand" href="${rootPrefix}index.html">
                    <i class="bi bi-scissors"></i> BarberShop
                    <span class="api-status-dot offline" id="api-dot" title="Verificando conexión..."></span>
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="${rootPrefix}index.html" id="nav-inicio">
                                <i class="bi bi-house-door"></i> Inicio
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="${rootPrefix}barberos/barberos.html" id="nav-barberos">
                                <i class="bi bi-scissors"></i> Barberos
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="${rootPrefix}servicios/servicios.html" id="nav-servicios">
                                <i class="bi bi-clipboard2-check"></i> Servicios
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="${rootPrefix}clientes/clientes.html" id="nav-clientes">
                                <i class="bi bi-people"></i> Clientes
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="${rootPrefix}citas/citas.html" id="nav-citas">
                                <i class="bi bi-calendar-check"></i> Citas
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    `;

    document.body.insertAdjacentHTML('afterbegin', navbarHtml);
    setActiveNavLink();
    checkApiStatus(rootPrefix);
}

function setActiveNavLink() {
    const currentUrl = window.location.href.toLowerCase();

    const navLinks = {
        'nav-inicio':    ['index.html'],
        'nav-barberos':  ['barberos.html'],
        'nav-servicios': ['servicios.html'],
        'nav-clientes':  ['clientes.html'],
        'nav-citas':     ['citas.html']
    };

    Object.keys(navLinks).forEach(id => {
        const link = document.getElementById(id);
        if (!link) return;
        const isActive = navLinks[id].some(route => currentUrl.includes(route));
        link.classList.toggle('active', isActive);
    });
}

function checkApiStatus(rootPrefix) {
    const dot = document.getElementById('api-dot');
    if (!dot) return;

    const apiBase = typeof API_URL !== 'undefined' ? API_URL : 'http://localhost:8080/api';

    fetch(`${apiBase}/barberos`, { method: 'GET' })
        .then(res => {
            dot.classList.remove('offline');
            dot.classList.add('online');
            dot.title = 'API conectada';
        })
        .catch(() => {
            dot.classList.remove('online');
            dot.classList.add('offline');
            dot.title = 'API sin conexión';
        });
}

window.addEventListener('DOMContentLoaded', loadNavbar);
