import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import planosRoutes from "./src/routes/planos.routes";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/planos", planosRoutes);

app.listen(3000, () => {
  console.log("🚀 Servidor rodando em http://localhost:3000");
});