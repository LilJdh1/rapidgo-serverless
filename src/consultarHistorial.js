const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");

const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY,
});

const container = client
  .database(process.env.COSMOS_DATABASE)
  .container(process.env.COSMOS_CONTAINER_PEDIDOS);

app.http("consultarHistorial", {
  methods: ["GET"],
  authLevel: "function",
  route: "pedidos/{id}",
  handler: async (request, context) => {
    const pedidoId = request.params.id;
    const usuarioId = request.query.get("usuarioId");

    if (!pedidoId || !usuarioId) {
      return {
        status: 400,
        jsonBody: { error: "Faltan parámetros obligatorios" },
      };
    }

    const { resource: pedido } = await container
      .item(pedidoId, usuarioId)
      .read();

    if (!pedido) {
      return { status: 404, jsonBody: { error: "Pedido no encontrado" } };
    }

    return {
      status: 200,
      jsonBody: pedido,
    };
  },
});