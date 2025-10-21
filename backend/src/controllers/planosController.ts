import { Request, Response } from "express";
import { gerarPlanoAula } from "../services/geminiService";
import { supabase } from "../services/supabaseService";

export const criarPlano = async (req: Request, res: Response) => {
  try {
    const { tema, faixaEtaria, duracao, autorId } = req.body;

    if (!tema || !faixaEtaria || !duracao) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes" });
    }

    // 1. Gera o plano com Gemini
    let plano = await gerarPlanoAula(tema, faixaEtaria, duracao);

    // 2. Normaliza para garantir que todas as chaves existam
    plano = {
      introducao_ludica: plano.introducao_ludica || "",
      objetivo_bncc: plano.objetivo_bncc || "",
      passo_a_passo: plano.passo_a_passo || "",
      rubrica_avaliacao: plano.rubrica_avaliacao || ""
    };

    // 3. Insere no Supabase (convertendo para snake_case)
    const { error } = await supabase.from("planos_aula").insert({
      tema,
      faixa_etaria: faixaEtaria,
      duracao,
      conteudo: plano,
      autor_id: autorId || null // opcional por enquanto
    });

    if (error) throw error;

    // 4. Retorna o plano normalizado para o front
    res.status(201).json(plano);

  } catch (err: any) {
    console.error("Erro ao criar plano:", err);
    res.status(500).json({ message: err.message });
  }
};

export const listarPlanos = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("planos_aula")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err: any) {
    console.error("Erro ao listar planos:", err);
    res.status(500).json({ message: err.message });
  }
};