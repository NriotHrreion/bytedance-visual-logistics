import { styleText } from "node:util";
import express from "express";

const PORT = 3010;
const app = express();

app.use((req, res, next) => {
  console.log(`Backend ${req.method} ${req.path}`);
  next();
});

app.get("/", (req, res) => {
  res.json({ msg: "Hello World" });
});

app.listen(PORT, () => {
  console.log(styleText("green", `Backend Server is ready on port ${PORT}.`))
});
