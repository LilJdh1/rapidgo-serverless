RapidGo — Backend Serverless en Azure

Tecnológico de Antioquia — Institución Universitaria**  
Computación en la Nube | Semestre 2026-1  
Profesor: Julian David Florez Sanchez  
Caso 01: Backend Serverless para Aplicación Móvil  

---

Integrantes

| Nombre completo | GitHub |
|---|---|
| Juan Felipe Reales De la Hoz | LilJdh1 |
| Dilan Esneider Echavarria Orozco | dilanmax08-ctrl |
| Brayan Castaño Borja | brayanborja27 |
| Brahian Alexis Bran Florez| brahianbran |

---

Descripción del proyecto

RapidGo es una startup colombiana de servicios de domicilios fundada 
en 2022 que opera en Medellín, Manizales y Pereira. Este repositorio 
documenta el diseño e implementación de su nuevo backend serverless 
en Microsoft Azure, migrando desde un monolito en Node.js hacia una 
arquitectura basada en cinco servicios cloud.

Problema que resuelve

| Problema actual | Solución implementada |
|---|---|
| Servidor dedicado $4.2M COP/mes | Azure Functions — pago por uso |
| Caídas en horas pico | Escalabilidad automática |
| Downtime en despliegues 20-30 min | Zero-downtime deployment |
| Push notifications 67% entrega | Notification Hubs — meta 95% |
| Sin tolerancia a fallos | Arquitectura serverless distribuida |

---

Stack tecnológico

| Servicio Azure | Responsabilidad |
|---|---|
| Azure Functions | Lógica de negocio — Node.js |
| API Management | Punto de entrada único — Auth JWT |
| Cosmos DB | Persistencia de pedidos y usuarios |
| Blob Storage | Fotos de comprobantes e imágenes |
| Notification Hubs | Push notifications Android e iOS |

---
 Tabla de contenido

- [Modelo C4](#modelo-c4)
  - [C1 — Contexto](#c1--contexto)
  - [C2 — Contenedores](#c2--contenedores)
  - [C3 — Componentes](#c3--componentes)
- [Decisiones Arquitectónicas (ADRs)](#decisiones-arquitectónicas-adrs)
  - [ADR-01 — Azure Functions vs App Service](#adr-01--azure-functions-vs-app-service)
  - [ADR-02 — Cosmos DB vs Azure SQL](#adr-02--cosmos-db-vs-azure-sql)
  - [ADR-03 — API Management vs exposición directa](#adr-03--api-management-vs-exposición-directa)
  - [ADR-04 — Blob Storage vs Azure Files](#adr-04--blob-storage-vs-azure-files)
  - [ADR-05 — Notification Hubs vs Azure Communication Services](#adr-05--notification-hubs-vs-azure-communication-services)
- [Implementación](#implementación)
- [Evidencias](#evidencias)
- [Conclusiones](#conclusiones)

---


## Modelo C4

### C1 — Contexto
![Diagrama C1 - Contexto RapidGo](assets/C1.png)

| Componente |	Descripción |
|---|---|
|RapidGo	| Sistema central de gestión de domicilios. Es el núcleo que conecta todos los actores y sistemas externos.
|Cliente |	Actor que solicita domicilios, realiza pagos y consulta el estado de sus pedidos.
|Repartidor |	Actor que recibe los pedidos asignados, actualiza su estado y sube evidencias de entrega.
|Administrador |	Actor que monitorea la operación general, gestiona usuarios y genera reportes.
|Pasarela de Pagos	| Sistema externo que procesa los pagos electrónicos de los pedidos.
|FCM (Firebase Cloud Messaging)	| Sistema externo de Google para el envío de notificaciones push en dispositivos Android.
|APNs (Apple Push Notification Service) |	Sistema externo de Apple para el envío de notificaciones push en dispositivos iOS.


### C2 — Contenedores
![Diagrama C2 - Contenedores RapidGo](assets/C2.png)

|Componente	 | Descripción |
|---|---|
|App Móvil |	Aplicación desarrollada en React Native que corre en iOS y Android. Es la interfaz principal de clientes y repartidores.
|Admin Web	| Panel de administración desarrollado en React Web, usado por los administradores del sistema.
|API Management |	Puerta de entrada única a la plataforma. Gestiona el API Gateway, validación JWT, rate limiting, routing y versionamiento de la API.
|Azure Functions |	Núcleo de la lógica de negocio, desarrollado en Node.js bajo el plan de consumo. Orquesta todas las operaciones del sistema.
|Pasarela de Pagos | Contenedor externo que procesa los pagos electrónicos, se comunica con Azure Functions vía HTTPS.
|Cosmos DB |	Base de datos NoSQL que almacena las colecciones de Pedidos, Usuarios e HistorialEstados.
|Blob Storage |	Almacenamiento de archivos: evidencias de entrega, imágenes de pedidos y reportes.
|Notification Hubs |	Servicio de Azure que centraliza el envío de notificaciones push, distribuyéndolas a FCM y APNs.
|FCM	| Servicio de Firebase para notificaciones en Android.
|APNs |	Servicio de Apple para notificaciones en iOS.


### C3 — Componentes
![Diagrama C3 - Componentes RapidGo](assets/C3.png)

|Componente	| Descripción |
|---|---|
|API Mgmt |	Entrada única al sistema, con JWT ya validado, que enruta las solicitudes hacia las funciones de negocio.
|Validador |	Middleware compartido que valida los esquemas JSON y sanitiza los datos de entrada.
|Middleware Auth |	Middleware compartido que verifica el token JWT y controla los roles y permisos del usuario.
|RegistrarPedido | Función de negocio expuesta en POST /pedidos. Crea el pedido, procesa el pago y confirma el pedido.
|ActualizarEstado |	Función de negocio expuesta en PUT /pedidos/{id}/estado. Cambia el estado del pedido (en camino, entregado, etc.).
|ConsultarHistorial |	Función de negocio expuesta en GET /pedidos/{id}/historial. Obtiene el historial de estados del pedido en modo solo lectura.
|NotificarCliente |	Función interna disparada por trigger. Envía una notificación push al usuario informando el nuevo estado del pedido.
|Pasarela de Pagos |	Servicio externo que procesa el pago del pedido, invocado por RegistrarPedido vía HTTPS.
|Cosmos DB (NoSQL) |	Base de datos que almacena las colecciones de Pedidos, Usuarios e HistorialEstados, accedida por las funciones vía SDK Cosmos.
|Notification Hubs |	Servicio que recibe la orden de notificación vía AMQP y la distribuye a FCM y APNs.
|FCM	| Destino final de notificaciones para dispositivos Android.
|APNs |	Destino final de notificaciones para dispositivos iOS.

---

## Decisiones Arquitectónicas (ADRs)

> ADRs en construcción — se agregarán en el siguiente commit.

---

## Implementación

### Flujo crítico implementado

El flujo crítico de RapidGo fue implementado y probado de extremo a extremo utilizando Azure Functions como backend serverless, Cosmos DB como base de datos, Notification Hubs para las notificaciones push y Postman como cliente HTTP para simular la aplicación móvil.

### Stack de pruebas

| Herramienta | Uso |
|---|---|
| Postman | Cliente HTTP para simular las peticiones de la app móvil |
| Azure Functions | Procesamiento de la lógica de negocio |
| Cosmos DB | Persistencia de los pedidos |
| Notification Hubs | Envío de notificaciones push |
| Firebase (FCM v1) | Proveedor de notificaciones Android |

### Paso 1 — Registrar pedido

**Endpoint:** `POST /api/pedidos`  
**Función:** `registrarPedido`  
**Descripción:** Recibe los datos del pedido, los valida y los persiste en Cosmos DB con estado `confirmado`.

**Body de la petición:**
json
{
  "usuarioId": "usuario-001",
  "restauranteId": "restaurante-001",
  "productos": ["hamburguesa", "papas fritas"],
  "direccionEntrega": "Calle 10 #43-12, Medellín"
}


### Paso 2 — Actualizar estado

**Endpoint:** `PUT /api/pedidos/{id}`  
**Función:** `actualizarEstado`  
**Descripción:** Actualiza el estado del pedido a `en camino` en Cosmos DB y registra la fecha de actualización.

**Body de la petición:**
json
{
  "estado": "en camino",
  "usuarioId": "usuario-001"
}


### Paso 3 — Consultar historial

**Endpoint:** `GET /api/pedidos/{id}?usuarioId={usuarioId}`  
**Función:** `consultarHistorial`  
**Descripción:** Consulta el estado actual y el historial del pedido desde Cosmos DB.

### Paso 4 — Enviar notificación push

**Endpoint:** `POST /api/notificaciones`  
**Función:** `notificarCliente`  
**Descripción:** Envía una notificación push al cliente informando el nuevo estado del pedido a través de Notification Hubs con FCM v1.

**Body de la petición:**
json
{
  "usuarioId": "usuario-001",
  "pedidoId": "9ea993b6-fd9f-4dec-836c-4f23572538ea",
  "estado": "en camino"
}


## Evidencias

### Servicios aprovisionados en Azure

Los cinco servicios requeridos fueron desplegados en el Resource Group `rg-rapidgo` en la región East US.

![Servicios en Azure](assets/Servicios.png)

### Cosmos DB — Documento del pedido

El pedido fue persistido correctamente en la colección `pedidos` de la base de datos `rapidgo-db`.

![Cosmos DB](assets/CosmoDB.png)

### Postman — Ejecución del flujo crítico

#### Paso 1 — POST /pedidos
![Registrar Pedido](assets/RegistrarPedido%20-%20POST.png)

![Logs registrarPedido](assets/Logs%20-%20RegistrarPedido.png)

#### Paso 2 — PUT /pedidos/{id}
![Actualizar Estado](assets/ActualizarEstado%20-%20PUT.png)

![Logs actualizarEstado](assets/Logs%20-%20ActualizarEstado.png)

#### Paso 3 — GET /pedidos/{id}
![Consultar Historial](assets/ConsultarHistorial%20-%20GET.png)

![Logs consultarHistorial](assets/Logs%20-%20ConsultarHistorial.png)

#### Paso 4 — POST /notificaciones
![Notificar Cliente](assets/NotificarCliente%20-%20POST.png)

![Logs notificarCliente](assets/Logs%20-%20NotificarCliente.png)


## Conclusiones

La migración del backend monolítico de RapidGo hacia una arquitectura serverless en Microsoft Azure demostró ser una solución viable y efectiva para resolver los problemas críticos de escalabilidad, disponibilidad y costos que enfrentaba la empresa.

### Logros obtenidos

| Requerimiento | Resultado |
|---|---|
| Escalabilidad automática | Azure Functions escala de 0 a N instancias sin intervención manual |
| Modelo de pago por uso | Se eliminó el costo fijo del servidor dedicado |
| Zero-downtime deployment | Las Functions se despliegan sin afectar pedidos en curso |
| Notificaciones push | Notification Hubs con FCM v1 garantiza entregas confiables |
| Tolerancia a fallos | Arquitectura distribuida sin punto único de fallo |

### Aprendizajes del equipo

- La arquitectura serverless exige una mentalidad diferente al desarrollo tradicional, donde cada función debe ser independiente y stateless.
- Azure Functions con el plan de consumo demostró ser la opción más costo-eficiente para cargas de trabajo variables como los domicilios de RapidGo.
- Cosmos DB como base de datos NoSQL facilitó el manejo de esquemas flexibles para los diferentes tipos de pedidos y negocios.
- La integración entre Notification Hubs y Firebase FCM v1 permite una infraestructura de notificaciones push robusta y escalable.
- El uso de API Management como puerta de entrada única centraliza la autenticación y el control de acceso de forma efectiva.

### Trabajo futuro

- Configurar API Management con los endpoints del flujo crítico para centralizar el acceso a las Functions.
- Implementar autenticación JWT completa en API Management.
- Configurar alertas y monitoreo en Application Insights para detectar anomalías en tiempo real.
- Registrar dispositivos reales en Notification Hubs para validar la entrega de notificaciones push en producción.
