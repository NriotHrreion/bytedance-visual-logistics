import { styleText } from "node:util";
import express from "express";
import { OrdersServlet } from "./servlets/orders";

const PORT = 3010;
const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log(`Backend ${req.method} ${req.path}`);
  next();
});

app.get("/", (req, res) => {
  res.json({ msg: "Hello World" });
});

app.use("/orders", new OrdersServlet().router);

app.listen(PORT, () => {
  console.log(styleText("green", `Backend Server is ready on port ${PORT}.`))
});
