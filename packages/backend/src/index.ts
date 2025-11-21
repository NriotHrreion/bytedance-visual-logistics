import { styleText } from "node:util";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { OrdersController } from "./controllers/orders";
import { PathsController } from "./controllers/paths";

dotenv.config({ quiet: true });

const PORT = process.env["BACKEND_PORT"];
const app = express();

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  console.log(`Backend ${req.method} ${req.path}`);
  next();
});

app.use("/v1/orders", new OrdersController().router);
app.use("/v1/paths", new PathsController().router);

app.listen(PORT, () => {
  console.log(styleText("green", `Backend Server is ready on port ${PORT}.`))
});
