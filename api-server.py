from http.server import BaseHTTPRequestHandler, HTTPServer
import json
from urllib.parse import urlparse, parse_qs

BARBEROS = [
    {"id": 1, "nombre": "Juan", "especialidad": "Cortes modernos", "telefono": "555-1111"},
    {"id": 2, "nombre": "Luis", "especialidad": "Afeitado clásico", "telefono": "555-2222"}
]
SERVICIOS = [
    {"id": 1, "nombre": "Corte", "precio": 12},
    {"id": 2, "nombre": "Afeitado", "precio": 8}
]
CLIENTES = [
    {"id": 1, "nombre": "Carlos"},
    {"id": 2, "nombre": "María"}
]
CITAS = [
    {"id": 1, "clienteId": 1, "barberoId": 1, "fecha": "2026-05-06", "hora": "10:00", "estado": "PENDIENTE"},
    {"id": 2, "clienteId": 2, "barberoId": 2, "fecha": "2026-05-06", "hora": "11:00", "estado": "CONFIRMADA"}
]

class Handler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200, content_type='application/json'):
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        qs = parse_qs(parsed.query)

        if path == '/api/barberos':
            self._set_headers(); self.wfile.write(json.dumps(BARBEROS).encode())
            return
        if path == '/api/servicios':
            self._set_headers(); self.wfile.write(json.dumps(SERVICIOS).encode()); return
        if path == '/api/clientes':
            self._set_headers(); self.wfile.write(json.dumps(CLIENTES).encode()); return
        if path == '/api/citas':
            self._set_headers(); self.wfile.write(json.dumps(CITAS).encode()); return
        if path == '/api/saludo/inicio':
            nombre = qs.get('nombre', ['Admin'])[0]
            self._set_headers(content_type='text/plain'); self.wfile.write(f"¡Hola {nombre}! Bienvenido al panel.".encode()); return

        # Fallback
        self._set_headers(404)
        self.wfile.write(json.dumps({"error": "Not found"}).encode())

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path
        # Very small mock: accept delete for /api/barberos/<id>, /api/servicios/<id>, /api/clientes/<id>
        parts = [p for p in path.split('/') if p]
        if len(parts) == 3 and parts[0] == 'api':
            resource, id_str = parts[1], parts[2]
            try:
                _id = int(id_str)
            except:
                self._set_headers(400); self.wfile.write(json.dumps({"error":"invalid id"}).encode()); return
            if resource == 'barberos':
                global BARBEROS; BARBEROS = [b for b in BARBEROS if b['id'] != _id]
            if resource == 'servicios':
                global SERVICIOS; SERVICIOS = [s for s in SERVICIOS if s['id'] != _id]
            if resource == 'clientes':
                global CLIENTES; CLIENTES = [c for c in CLIENTES if c['id'] != _id]
            self._set_headers(204, content_type='text/plain'); return

        self._set_headers(404); self.wfile.write(json.dumps({"error":"Not found"}).encode())

if __name__ == '__main__':
    server_address = ('', 5000)
    httpd = HTTPServer(server_address, Handler)
    print('Mock API server running at http://localhost:5000/api')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nStopping server')
        httpd.server_close()
