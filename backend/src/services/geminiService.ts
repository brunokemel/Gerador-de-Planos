import fetch from "node-fetch";
import dotenv from "dotenv";
import { GeminiResponse } from "./type/geminyTypes"; // 👈 ajuste o caminho conforme sua pasta

dotenv.config();

export async function gerarPlanoAula(
  tema: string,
  faixaEtaria: string,
  duracao: string
) {
  const prompt = `
  Gere um plano de aula completo e bem estruturado em formato JSON com as seguintes chaves:
  {
    "introducao_ludica": "",
    "objetivo_bncc": "",
    "passo_a_passo": "",
    "rubrica_avaliacao": ""
  }

  Tema: ${tema}
  Faixa etária: ${faixaEtaria}
  Duração: ${duracao}
  O texto deve ser em português e adequado para professores do ensino básico.
  `;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  // 👇 aqui entra a tipagem
  const data = (await response.json()) as GeminiResponse;

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Erro ao processar JSON retornado pela IA");
  }
}
