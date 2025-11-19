import express from "express";
import { criarPlano } from "../controllers/planosController";

const router = express.Router();

router.post("/", criarPlano);
// router.get("/", listarPlanos);

export default router;