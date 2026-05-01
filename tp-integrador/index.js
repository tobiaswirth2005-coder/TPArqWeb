const express = require('express');
const app = express();
const PORT = 3000;

// Middleware 
app.use(express.json());

// 1. PERSISTENCIA EN MEMORIA Y SEED DE DATOS
let espectaculos = [
    {
        id: 1,
        nombre: "Concierto de Rock",
        fecha: "2026-10-15",
        estadioId: 1,
        precioBase: 5000,
        capacidadTotal: 1000,
        entradasVendidas: 150
    },
    {
        id: 2,
        nombre: "Obra de Teatro Clásica",
        fecha: "2026-11-02",
        estadioId: 2,
        precioBase: 3000,
        capacidadTotal: 500,
        entradasVendidas: 500 // Agotado
    }
];

let ventas = []; // aca se guardan las ventas (Arranca vacio)

// 2. ENDPOINTS DE LA API REST (Nivel 2)

// Endpoint: Obtener todos los espectáculos
app.get('/api/espectaculos', (req, res) => {
    // Respondemos con código 200 (OK) y la lista de datos en formato JSON
    res.status(200).json(espectaculos);
});

// Endpoint de prueba para verficiar q el servidor este online 
app.get('/', (req, res) => {
    res.send('¡API del Sistema de Entradas funcionando correctamente!');
});


// Endpoint: Crear un nuevo espectáculo (POST)
app.post('/api/espectaculos', (req, res) => {
    // 1. Recibimos los datos del nuevo espectáculo que vienen en el "body" de la petición
    const nuevoEspectaculo = req.body;

    // 2. Le asignamos un ID automático (buscamos el ID del último elemento y le sumamos 1)
    const nuevoId = espectaculos.length > 0 ? espectaculos[espectaculos.length - 1].id + 1 : 1;
    nuevoEspectaculo.id = nuevoId;

    // 3.  un espectáculo nuevo arranca con 0 entradas vendidas
    nuevoEspectaculo.entradasVendidas = 0;

    // 4. Lo agregamos a nuestro array 
    espectaculos.push(nuevoEspectaculo);

    // 5. Respondemos con el código 201 (Created) y el objeto recién creado
    res.status(201).json(nuevoEspectaculo);
});

// Endpoint: Obtener un espectáculo específico por ID (GET)
app.get('/api/espectaculos/:id', (req, res) => {
    // req.params.id captura el numero de la URL. Lo pasamos a entero.
    const idParam = parseInt(req.params.id);
    const espectaculo = espectaculos.find(e => e.id === idParam);

    if (espectaculo) {
        res.status(200).json(espectaculo);
    } else {
        // Si no lo encuentra devuelve 404
        res.status(404).json({ error: "Espectáculo no encontrado" });
    }
});


// Endpoint: Actualizar un espectáculo (PUT)
app.put('/api/espectaculos/:id', (req, res) => {
    const idParam = parseInt(req.params.id);
    const index = espectaculos.findIndex(e => e.id === idParam);

    if (index !== -1) {
        // Reemplaza los datos viejos con los que vienen en el body (req.body)
        // Pero forzamos a que el ID y las entradas vendidas no se puedan alterar acá
        const datosNuevos = req.body;
        espectaculos[index] = {
            ...espectaculos[index], // datos originales
            ...datosNuevos,         // datos pisados
            id: idParam,
            entradasVendidas: espectaculos[index].entradasVendidas
        };
        
        res.status(200).json(espectaculos[index]);
    } else {
        res.status(404).json({ error: "Espectáculo no encontrado para modificar" });
    }
});


// Endpoint: Eliminar un espectáculo (DELETE)
app.delete('/api/espectaculos/:id', (req, res) => {
    const idParam = parseInt(req.params.id);
    const index = espectaculos.findIndex(e => e.id === idParam);

    if (index !== -1) {
        // splice borra el elemento del array en esa posición
        espectaculos.splice(index, 1); 
        res.status(200).json({ mensaje: "Espectáculo eliminado correctamente" });
    } else {
        res.status(404).json({ error: "Espectáculo no encontrado para eliminar" });
    }
});



// 3. MÓDULO DE VENTAS Y TRANSACCIONES

// Endpoint: Registrar una venta (POST)
app.post('/api/ventas', (req, res) => {
    const { espectaculoId, usuarioId, cantidadEntradas } = req.body;

    // 1. Buscamos el espectáculo que el usuario quiere comprar
    const espectaculo = espectaculos.find(e => e.id === espectaculoId);

    // 2. Validaciones comerciales (Las reglas del negocio)
    if (!espectaculo) {
        return res.status(404).json({ error: "El espectáculo seleccionado no existe." });
    }

    if (cantidadEntradas <= 0) {
        return res.status(400).json({ error: "Debe comprar al menos una entrada." });
    }

    const entradasDisponibles = espectaculo.capacidadTotal - espectaculo.entradasVendidas;

    if (entradasDisponibles < cantidadEntradas) {
        return res.status(400).json({ 
            error: "No hay stock suficiente.",
            disponibles: entradasDisponibles 
        });
    }

    // 3. Procesamos la venta
    const precioTotal = espectaculo.precioBase * cantidadEntradas;
    
    // Generamos un "Ticket"
    const nuevaVenta = {
        id: ventas.length > 0 ? ventas[ventas.length - 1].id + 1 : 1,
        espectaculoId,
        usuarioId,
        cantidadEntradas,
        precioTotal,
        fechaCompra: new Date().toISOString()
    };

    ventas.push(nuevaVenta);

    // 4. Actualizamos el stock del espectáculo !!
    espectaculo.entradasVendidas += cantidadEntradas;

    // 5. Respondemos con el ticket generado
    res.status(201).json({
        mensaje: "Venta procesada con éxito",
        ticket: nuevaVenta,
        estadoEspectaculo: {
            vendidas: espectaculo.entradasVendidas,
            restantes: espectaculo.capacidadTotal - espectaculo.entradasVendidas
        }
    });
});


//parte reportes

// 4. MÓDULO DE REPORTES Y ESTADÍSTICAS

// Endpoint: Obtener reporte de recaudación (GET)
app.get('/api/reportes/recaudacion', (req, res) => {
    // Usamos .map para recorrer los espectáculos y armar un nuevo arreglo con los cálculos
    const reporte = espectaculos.map(e => {
        const recaudacionTotal = e.entradasVendidas * e.precioBase;
        return {
            espectaculoId: e.id,
            nombre: e.nombre,
            entradasVendidas: e.entradasVendidas,
            recaudacionTotal: recaudacionTotal
        };
    });

    // Calculamos la suma total de todo el sistema usando .reduce
    const totalGeneral = reporte.reduce((acumulador, actual) => acumulador + actual.recaudacionTotal, 0);

    // Devolvemos el reporte armado
    res.status(200).json({
        fechaReporte: new Date().toISOString(),
        recaudacionTotalSistema: totalGeneral,
        detallePorEspectaculo: reporte
    });
});





// INICIAR EL SERVIDOR
app.listen(PORT, () => {
    console.log(`Servidor levantado y escuchando en http://localhost:${PORT}`);
    console.log(`Seed de datos cargado: ${espectaculos.length} espectáculos iniciales.`);
});