const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");
const { v4: uuidv4 } = require("uuid");

const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY,
});

const container = client
  .database(process.env.COSMOS_DATABASE)
  .container(process.env.COSMOS_CONTAINER_PEDIDOS);

app.http("registrarPedido", {
  methods: ["POST"],
  authLevel: "function",
  route: "pedidos",
  handler: async (request, context) => {
    const body = await request.json();
    const { usuarioId, restauranteId, productos, direccionEntrega } = body;

    if (!usuarioId || !restauranteId || !productos || !direccionEntrega) {
      return {
        status: 400,
        jsonBody: { error: "Faltan campos obligatorios" },
      };
    }

    const pedido = {
      id: uuidv4(),
      usuarioId,
      restauranteId,
      productos,
      direccionEntrega,
      estado: "confirmado",
      fechaCreacion: new Date().toISOString(),
    };

    const { resource } = await container.items.create(pedido);

    return {
      status: 201,
      jsonBody: resource,
    };
  },
});