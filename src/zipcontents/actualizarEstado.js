const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");

const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY,
});

const container = client
  .database(process.env.COSMOS_DATABASE)
  .container(process.env.COSMOS_CONTAINER_PEDIDOS);

app.http("actualizarEstado", {
  methods: ["PUT"],
  authLevel: "function",
  route: "pedidos/{id}",
  handler: async (request, context) => {
    const pedidoId = request.params.id;
    const body = await request.json();
    const { estado, usuarioId } = body;

    if (!estado || !usuarioId) {
      return {
        status: 400,
        jsonBody: { error: "Faltan campos obligatorios" },
      };
    }

    const estadosValidos = ["confirmado", "en camino", "entregado", "cancelado"];
    if (!estadosValidos.includes(estado)) {
      return {
        status: 400,
        jsonBody: { error: "Estado no válido" },
      };
    }

    const { resource: pedido } = await container
      .item(pedidoId, usuarioId)
      .read();

    if (!pedido) {
      return { status: 404, jsonBody: { error: "Pedido no encontrado" } };
    }

    pedido.estado = estado;
    pedido.fechaActualizacion = new Date().toISOString();

    const { resource: updated } = await container
      .item(pedidoId, usuarioId)
      .replace(pedido);

    return {
      status: 200,
      jsonBody: updated,
    };
  },
});