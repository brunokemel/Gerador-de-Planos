import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

console.log("GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY);

// Inicializa o cliente com a chave da API (passando direto a string)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Cria a instância do modelo com o modelo atualizado
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

export async function gerarPlanoAula(tema: string, faixaEtaria: string, duracao: string) {
    const prompt = `
Responda SOMENTE com um JSON válido no formato:
{
  "introducao_ludica": "",
  "objetivo_bncc": "",
  "passo_a_passo": "",
  "rubrica_avaliacao": ""
}

Tema: ${tema}
Faixa etária: ${faixaEtaria}
Duração: ${duracao}
`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Extrai apenas o JSON da resposta
        const match = text.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("Resposta não contém JSON válido");

        const plano = JSON.parse(match[0]);

        // Garante que todas as chaves existam
        return {
            introducao_ludica: plano.introducao_ludica || "",
            objetivo_bncc: plano.objetivo_bncc || "",
            passo_a_passo: plano.passo_a_passo || "",
            rubrica_avaliacao: plano.rubrica_avaliacao || ""
        };

    } catch (error: any) {
        console.error("Erro ao criar plano:", error.message || error);
        throw error;
    }
}