import { styleText } from "node:util";
import http from "http";
import express from "express";
import cors from "cors";
import ws from "ws";
import { OrdersController } from "./controllers/orders";
import { PathsController } from "./controllers/paths";
import { PointsEndpoint } from "./endpoints/points";
import "./env-config";

const PORT = process.env["BACKEND_PORT"];
const app = express();
const server = http.createServer(app);
const wss = new ws.Server({ server });

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  console.log(`Backend ${req.method} ${req.path}`);
  next();
});

// Controllers
app.use("/v1/orders", new OrdersController().router);
app.use("/v1/paths", new PathsController().router);

// Endpoints
new PointsEndpoint(wss);

server.listen(PORT, async () => {
  console.log(styleText("green", `Backend Server is ready on port ${PORT}.`));
});
