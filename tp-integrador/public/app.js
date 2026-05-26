const API_URL = '/api/espectaculos';

// Elementos del DOM
const form = document.getElementById('espectaculo-form');
const tableBody = document.getElementById('table-body');
const btnCancel = document.getElementById('btn-cancel');
const formTitle = document.getElementById('form-title');

const ventaForm = document.getElementById('venta-form');

const btnGenerarReporte = document.getElementById('btn-generar-reporte');
const reporteResultados = document.getElementById('reporte-resultados');
const repFecha = document.getElementById('rep-fecha');
const repTotal = document.getElementById('rep-total');
const reporteTableBody = document.getElementById('reporte-table-body');

// ==========================================
// 1. READ ALL (Listar espectáculos)
// ==========================================
async function cargarEspectaculos() {
    try {
        const respuesta = await fetch(API_URL);
        const datos = await respuesta.json();
        renderizarTabla(datos);
    } catch (error) {
        console.error('Error al realizar el GET de espectáculos:', error);
    }
}

function renderizarTabla(lista) {
    tableBody.innerHTML = '';
    lista.forEach(item => {
        const disponibles = item.capacidadTotal - item.entradasVendidas;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.id}</td>
            <td>${item.nombre}</td>
            <td>${item.fecha}</td>
            <td>${item.estadioId}</td>
            <td>$${item.precioBase}</td>
            <td>${item.capacidadTotal}</td>
            <td>${item.entradasVendidas}</td>
            <td>${disponibles <= 0 ? '<span style="color:red;font-weight:bold;">AGOTADO</span>' : disponibles}</td>
            <td>
                <button class="btn-edit" onclick="prepararEdicion(${item.id})">Editar</button>
                <button class="btn-danger" onclick="eliminarEspectaculo(${item.id})">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// ==========================================
// 2. CREATE & UPDATE (Formulario)
// ==========================================
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const idVal = document.getElementById('espectaculo-id').value;
    const bodyPayload = {
        nombre: document.getElementById('nombre').value,
        fecha: document.getElementById('fecha').value,
        estadioId: parseInt(document.getElementById('estadioId').value),
        precioBase: parseFloat(document.getElementById('precioBase').value),
        capacidadTotal: parseInt(document.getElementById('capacidadTotal').value)
    };

    try {
        let url = API_URL;
        let metodo = 'POST';

        if (idVal) {
            url = `${API_URL}/${idVal}`;
            metodo = 'PUT';
        }

        const res = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyPayload)
        });

        if (res.ok) {
            limpiarFormulario();
            cargarEspectaculos();
        } else {
            const errData = await res.json();
            alert(`Error: ${errData.error || 'No se pudo procesar la solicitud'}`);
        }
    } catch (error) {
        console.error('Error en la transacción del formulario:', error);
    }
});

// Llenar datos para modificación (PUT)
async function prepararEdicion(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error('No se encontró el recurso');
        
        const item = await res.json();
        
        document.getElementById('espectaculo-id').value = item.id;
        document.getElementById('nombre').value = item.nombre;
        document.getElementById('fecha').value = item.fecha;
        document.getElementById('estadioId').value = item.estadioId;
        document.getElementById('precioBase').value = item.precioBase;
        document.getElementById('capacidadTotal').value = item.capacidadTotal;

        formTitle.textContent = `Modificar Espectáculo #${item.id}`;
        btnCancel.style.display = 'inline-block';
    } catch (error) {
        alert('Error al recuperar los datos del servidor.');
    }
}

// ==========================================
// 3. DELETE (Baja)
// ==========================================
async function eliminarEspectaculo(id) {
    if (confirm(`¿Confirmas la eliminación del espectáculo #${id}?`)) {
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                cargarEspectaculos();
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } catch (error) {
            console.error('Error al borrar el nodo:', error);
        }
    }
}

// ==========================================
// 4. TRANSACCIÓN: PROCESAR VENTA
// ==========================================
ventaForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const ventaData = {
        espectaculoId: parseInt(document.getElementById('venta-espectaculo-id').value),
        usuarioId: parseInt(document.getElementById('venta-usuario-id').value),
        cantidadEntradas: parseInt(document.getElementById('venta-cantidad').value)
    };

    try {
        const res = await fetch('/api/ventas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ventaData)
        });

        const data = await res.json();

        if (res.ok) {
            alert(`¡Compra Exitosa!\nTotal: $${data.ticket.precioTotal}`);
            ventaForm.reset();
            document.getElementById('venta-usuario-id').value = "1";
            cargarEspectaculos(); // Sincroniza stock en la interfaz
        } else {
            alert(`Fallo comercial: ${data.error}`);
        }
    } catch (error) {
        console.error('Error en transaccion de venta:', error);
    }
});

// ==========================================
// 5. OBTENER REPORTE DE RECAUDACIÓN
// ==========================================
btnGenerarReporte.addEventListener('click', async () => {
    try {
        const res = await fetch('/api/reportes/recaudacion');
        const data = await res.json();

        repFecha.textContent = new Date(data.fechaReporte).toLocaleString();
        repTotal.textContent = data.recaudacionTotalSistema.toLocaleString();

        reporteTableBody.innerHTML = '';
        data.detallePorEspectaculo.forEach(det => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${det.espectaculoId}</td>
                <td>${det.nombre}</td>
                <td>${det.entradasVendidas}</td>
                <td>$${det.recaudacionTotal.toLocaleString()}</td>
            `;
            reporteTableBody.appendChild(tr);
        });

        reporteResultados.style.display = 'block';
    } catch (error) {
        console.error('Error al parsear el reporte:', error);
    }
});

btnCancel.addEventListener('click', limpiarFormulario);

function limpiarFormulario() {
    form.reset();
    document.getElementById('espectaculo-id').value = '';
    formTitle.textContent = 'Registrar Nuevo Espectáculo';
    btnCancel.style.display = 'none';
}

// Carga de inicialización
cargarEspectaculos();