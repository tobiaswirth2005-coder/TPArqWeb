# Sistema de Gestión de Venta de Entradas - Backend API

## Descripción del Backend Elegido

**Dominio:** Sistema de Gestión de Venta de Entradas para Espectáculos.

El backend a desarrollar proporcionará los servicios necesarios para administrar la cartelera de eventos y la venta de tickets de una plataforma online. La lógica de negocio principal se encargará de gestionar el catálogo de Espectáculos (junto con sus respectivos Estadios y Ubicaciones disponibles) y de procesar las transacciones de las Ventas. Además, el sistema incluirá un módulo de estadísticas capaz de procesar los datos transaccionales para emitir reportes de recaudación y rendimiento por evento, centralizando toda la persistencia y la lógica comercial mediante una API RESTful desarrollada en Node.js y Express.

---

## Instalación y Ejecución (Requisitos del TP)

1. Asegurarse de tener instalado **Node.js** en el equipo.
2. Descomprimir el archivo `.zip` del proyecto.
3. Abrir una terminal o consola de comandos en la carpeta raíz del proyecto (`tp-integrador`).
4. Instalar las dependencias ejecutando: `npm install`
5. Levantar el servidor utilizando el script automatizado: `npm start`
6. Abrir un navegador web e ingresar a `http://localhost:3000` para ver la interfaz (Frontend).

---

## Documentación de la API (Endpoints)

A continuación se detalla el diseño de la API RESTful (Nivel 2) expuesta por el backend.

### 1. Módulo: Espectáculos (CRUD)

* **`GET /api/espectaculos`**
  * **Descripción:** Recupera la lista completa de todos los espectáculos registrados en el sistema, incluyendo información básica como nombre, fecha y estadio asignado.
  * **Códigos de estado:** `200 OK`.

* **`GET /api/espectaculos/:id`**
  * **Descripción:** Recupera los detalles completos de un espectáculo específico a través de su parámetro de ruta (ID), incluyendo las ubicaciones y precios disponibles.
  * **Códigos de estado:** `200 OK` (Encontrado), `404 Not Found` (No existe).

* **`POST /api/espectaculos`**
  * **Descripción:** Crea un nuevo espectáculo en el sistema a partir de la información enviada en el cuerpo (body) de la petición.
  * **Códigos de estado:** `201 Created` (Éxito), `400 Bad Request` (Faltan datos).

* **`PUT /api/espectaculos/:id`**
  * **Descripción:** Actualiza la información de un espectáculo existente (por ejemplo, cambio de fecha o modificación de precios).
  * **Códigos de estado:** `200 OK` (Actualizado), `400 Bad Request` (Datos inválidos), `404 Not Found` (No existe).

* **`DELETE /api/espectaculos/:id`**
  * **Descripción:** Elimina (o da de baja lógica) un espectáculo del sistema.
  * **Códigos de estado:** `200 OK` (Eliminado), `404 Not Found` (No existe).

### 2. Módulo: Transacciones (Ventas)

* **`POST /api/ventas`**
  * **Descripción:** Registra una nueva venta de entradas. Recibe el ID del usuario, el ID del espectáculo y la cantidad seleccionada, calculando el total y descontando el stock disponible.
  * **Códigos de estado:** `201 Created` (Venta registrada), `400 Bad Request` (Sin stock o error de validación), `404 Not Found` (No existe).

### 3. Módulo: Reportes

* **`GET /api/reportes/recaudacion`**
  * **Descripción:** Genera y devuelve un reporte agregado con el volumen de ventas y la recaudación total agrupada por cada espectáculo.
  * **Códigos de estado:** `200 OK`.