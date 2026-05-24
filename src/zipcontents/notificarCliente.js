const { app } = require("@azure/functions");
const {
  NotificationHubsClient,
  createFcmV1Notification,
} = require("@azure/notification-hubs");

const client = new NotificationHubsClient(
  process.env.NOTIFICATION_HUB_CONNECTION_STRING,
  process.env.NOTIFICATION_HUB_NAME
);

app.http("notificarCliente", {
  methods: ["POST"],
  authLevel: "function",
  route: "notificaciones",
  handler: async (request, context) => {
    const body = await request.json();
    const { usuarioId, pedidoId, estado } = body;

    if (!usuarioId || !pedidoId || !estado) {
      return {
        status: 400,
        jsonBody: { error: "Faltan campos obligatorios" },
      };
    }

    const notification = createFcmV1Notification({
      message: {
        notification: {
          title: "RapidGo — Actualización de pedido",
          body: `Tu pedido ${pedidoId} ahora está: ${estado}`,
        },
        data: {
          pedidoId,
          estado,
          usuarioId,
        },
      },
    });

    const result = await client.sendNotification(notification, {
      tagExpression: `usuarioId:${usuarioId}`,
    });

    return {
      status: 200,
      jsonBody: {
        mensaje: "Notificación enviada",
        resultado: result,
      },
    };
  },
});