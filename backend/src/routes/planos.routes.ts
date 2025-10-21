import express from "express";
import { criarPlano, listarPlanos } from "../controllers/planosController";

const router = express.Router();

router.post("/", criarPlano);
router.get("/", listarPlanos);

export default router;