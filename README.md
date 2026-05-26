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

El flujo crítico de RapidGo fue implementado y probado de extremo a extremo utilizando Azure Functions como backend serverless, Cosmos DB como base de datos, Notification Hubs para las notificaciones push y Postman como cliente HTTP para simular la aplicación móvil. Las peticiones fueron enrutadas a través de API Management como puerta de entrada única.

### Stack de pruebas

| Herramienta | Uso |
|---|---|
| Postman | Cliente HTTP para simular las peticiones de la app móvil |
| API Management | Puerta de entrada única que enruta las peticiones a las Functions |
| Azure Functions | Procesamiento de la lógica de negocio |
| Cosmos DB | Persistencia de los pedidos |
| Notification Hubs | Envío de notificaciones push |
| Firebase (FCM v1) | Proveedor de notificaciones Android |

### Paso 1 — Registrar pedido

**Endpoint:** `POST /rapidgo/pedidos`  
**Función:** `registrarPedido`  
**Descripción:** Recibe los datos del pedido, los valida y los persiste en Cosmos DB con estado `confirmado`.

**Body de la petición:**
```json
{
  "usuarioId": "usuario-002",
  "restauranteId": "restaurante-001",
  "productos": ["pizza", "gaseosa"],
  "direccionEntrega": "Carrera 80 #45-10, Medellín"
}
```

### Paso 2 — Actualizar estado

**Endpoint:** `PUT /rapidgo/pedidos/{id}`  
**Función:** `actualizarEstado`  
**Descripción:** Actualiza el estado del pedido a `en camino` en Cosmos DB y registra la fecha de actualización.

**Body de la petición:**
```json
{
  "estado": "en camino",
  "usuarioId": "usuario-002"
}
```

### Paso 3 — Enviar notificación push

**Endpoint:** `POST /rapidgo/notificaciones`  
**Función:** `notificarCliente`  
**Descripción:** Envía una notificación push al cliente informando el nuevo estado del pedido a través de Notification Hubs con FCM v1.

**Body de la petición:**
```json
{
  "usuarioId": "usuario-002",
  "pedidoId": "b4d76733-208d-47cd-956c-74e219dadae4",
  "estado": "en camino"
}
```

### Paso 4 — Consultar historial

**Endpoint:** `GET /rapidgo/pedidos/{id}?usuarioId={usuarioId}`  
**Función:** `consultarHistorial`  
**Descripción:** Consulta el estado actual y el historial del pedido desde Cosmos DB.



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

#### Paso 3 — POST /notificaciones
![Notificar Cliente](assets/NotificarCliente%20-%20POST.png)

![Logs notificarCliente](assets/Logs%20-%20NotificarCliente.png)

#### Paso 4 — GET /pedidos/{id}
![Consultar Historial](assets/ConsultarHistorial%20-%20GET.png)

![Logs consultarHistorial](assets/Logs%20-%20ConsultarHistorial.png)


## Conclusiones

La migración del backend monolítico de RapidGo hacia una arquitectura serverless en Microsoft Azure demostró ser una solución viable y efectiva para resolver los problemas críticos de escalabilidad, disponibilidad y costos que enfrentaba la empresa.

### Logros obtenidos

| Requerimiento | Métrica objetivo | Resultado |
|---|---|---|
| Disponibilidad | 99.9% mensual | Azure Functions con plan de consumo garantiza alta disponibilidad nativa sin administración de servidores. |
| Escalabilidad | 500 req/seg sin intervención | Escalabilidad elástica y automática de 0 a N instancias en respuesta inmediata a la demanda de pedidos. |
| Modelo de costos | Pago por uso real | Se eliminó el costo fijo de $4.2M COP mensuales del servidor dedicado, pagando solo por milisegundo de ejecución. |
| Despliegue | Zero-downtime | El esquema de despliegue de las Functions permite actualizar la lógica de negocio sin interrumpir los flujos en curso. |
| Notificaciones push | Tasa de entrega > 95% | Azure Notification Hubs integrado con FCM v1 garantiza un canal de alertas eficiente y directo hacia los clientes. |
| Tolerancia a fallos | Sin punto único de fallo | Diseño basado en una arquitectura distribuida y desacoplada utilizando los servicios administrados de Azure. |

### Aprendizajes del equipo

- La arquitectura serverless exige un cambio de paradigma frente al desarrollo tradicional, requiriendo que cada componente sea completamente desacoplado, orientado a eventos y stateless (sin estado).
- Azure Functions bajo el plan de consumo demostró ser la alternativa más costo-eficiente para manejar la predictibilidad y los picos de demanda característicos del sector de domicilios en el Valle de Aburrá.
- Cosmos DB como base de datos NoSQL validó la decisión de migrar desde un modelo relacional rígido como MySQL, ofreciendo la flexibilidad necesaria para iterar sobre los esquemas de pedidos y comercios sin fricción.
- La combinación de Notification Hubs y FCM v1 dotó al sistema de una infraestructura robusta de mensajería, logrando revertir y superar con creces la deficiente tasa de entrega del 67% que registraba la plataforma anterior.
- API Management consolidó la seguridad y el orden del ecosistema al actuar como una fachada única de entrada, simplificando tareas complejas de control de acceso, enrutamiento y futuro versionado de los contratos de la API.
- El aprovechamiento del crédito de Azure for Students demostró que es viable diseñar, desplegar y validar arquitecturas de software de nivel empresarial manteniéndose estrictamente dentro de los límites del presupuesto asignado para soluciones piloto.





## ADR-01: Azure Functions vs App Service para la lógica de negocio

### Título
Uso de Azure Functions con Consumption Plan sobre Azure App Service para la lógica de negocio de RapidGo.

### Contexto
RapidGo opera con un patrón de tráfico altamente variable: en horas de baja demanda (2am–8am) el uso de CPU no supera el 4%, mientras que en horas pico (12m–2pm y 6pm–9pm) y días festivos se alcanzan hasta 4.500 pedidos diarios. El servidor dedicado actual cuesta $4.200.000 COP mensuales con costo fijo independiente del tráfico real, y cualquier actualización requiere entre 20 y 30 minutos de inactividad. El equipo de infraestructura es de una sola persona, por lo que se debe minimizar la carga operativa. El presupuesto en Azure no debe superar los $50 USD mensuales durante la fase piloto.

### Alternativas evaluadas

**Azure App Service (Plan B1)**
Servicio de hospedaje que mantiene una instancia activa de forma permanente. No tiene cold start, pero su costo mínimo es ~$13 USD/mes incluso en horas de madrugada con tráfico casi nulo. Escalar ante picos requiere configurar reglas de autoescalado manualmente. Los despliegues sin downtime requieren deployment slots, no disponibles en tiers económicos.

**Azure Functions (Consumption Plan)**
Modelo serverless donde cada función se factura únicamente por ejecuciones realizadas, con el primer millón gratuitas por mes. La escalabilidad es completamente automática hasta los 500 req/seg requeridos. El equipo tiene experiencia en Node.js y Python, ambos soportados oficialmente. La única desventaja es el cold start: primera ejecución puede tardar entre 300 y 800ms adicionales.

### Decisión
Se elige **Azure Functions con Consumption Plan**. El modelo de pago por uso elimina el costo fijo ineficiente del servidor actual. La escalabilidad automática cubre el requerimiento de 500 req/seg sin intervención del equipo. Los despliegues zero-downtime son nativos. El cold start es aceptable dado que API Management puede configurarse con warm-up policies para rutas críticas.

### Consecuencias

**Lo que ganamos**
- Costo mensual alineado con el tráfico real, dentro del límite de $50 USD del piloto.
- Escalabilidad automática en picos sin intervención del equipo.
- Despliegues zero-downtime como comportamiento por defecto.

**Lo que perdemos o asumimos como trade-off**
- Cold starts de 300–800ms en funciones poco frecuentes, potencialmente cercanos al límite del SLA de 800ms.
- Límite de 10 minutos por ejecución en el Consumption Plan; tareas pesadas futuras deberán rediseñarse.

---

## ADR-02: Cosmos DB vs Azure SQL Database para la persistencia de pedidos

### Título
Uso de Azure Cosmos DB (API NoSQL) sobre Azure SQL Database para la persistencia de pedidos y usuarios de RapidGo.

### Contexto
La base de datos actual es MySQL relacional con 3 años de datos históricos. Se requiere evaluar si mantener el paradigma relacional o migrar a NoSQL. El sistema debe soportar 500 req/seg sin intervención manual y latencia de API menor a 800ms en P95. Los pedidos tienen atributos variables según el tipo de negocio (restaurantes vs. tiendas), lo que genera múltiples columnas nullable y tablas de extensión difíciles de mantener. Por restricción de soberanía de datos, toda la información de usuarios colombianos debe almacenarse en Brazil South o East US. El free tier de Cosmos DB ofrece 1.000 RU/s y 25 GB incluidos.

### Alternativas evaluadas

**Azure SQL Database (free tier)**
Compatible con el esquema MySQL actual, simplifica la migración de datos históricos. Sin embargo, bajo cargas sostenidas de 500 req/seg el tiempo de respuesta puede degradarse por encima del SLA de 800ms. Escalar implica un costo fijo que compromete el presupuesto. La estructura rígida dificulta incorporar atributos variables por tipo de negocio.

**Azure Cosmos DB (API NoSQL)**
Base de datos distribuida con modelo de documento JSON, escalabilidad horizontal automática y latencia garantizada menor a 10ms en P99. El modelo de documentos se adapta naturalmente a pedidos con estructuras variables. Disponible en East US, cumpliendo la restricción de soberanía. La desventaja principal es migrar el esquema MySQL a documentos JSON y la curva de aprendizaje del modelo de particionamiento.

### Decisión
Se elige **Azure Cosmos DB con API NoSQL**, desplegado en **East US** (menor latencia hacia Medellín, Manizales y Pereira que Brazil South, con disponibilidad confirmada del free tier). La estructura de documentos JSON resuelve el problema de atributos variables, la escalabilidad automática satisface los 500 req/seg sin carga operativa, y la latencia garantizada cumple holgadamente el SLA. La migración de datos históricos se realizará mediante un script documentado en `/src/migration/`.

### Consecuencias

**Lo que ganamos**
- Datos de usuarios colombianos en East US, cumpliendo la restricción de soberanía.
- Escalabilidad horizontal automática en picos sin intervención manual.
- Latencia muy por debajo del SLA de 800ms.
- Esquema flexible para nuevos tipos de negocios sin migraciones de base de datos.

**Lo que perdemos o asumimos como trade-off**
- Abandono del paradigma relacional; requiere aprendizaje de particionamiento y consistencia eventual.
- Migración del esquema MySQL a documentos JSON recae sobre el único miembro del equipo.
- Consultas analíticas complejas con JOINs son más costosas en RU/s; se mitigarán exportando datos periódicamente a Blob Storage.
- El free tier de Cosmos DB es único por suscripción; si ya está en uso, se deberá evaluar Azure SQL Database como alternativa.

