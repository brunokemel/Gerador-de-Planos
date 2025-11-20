/**
 * /src/utils/promptGenerator.ts
 *
 * Utilitário para construir prompts base para o Gerador-de-Planos.
 * Exporta tipos e funções para gerar prompts (texto plano e JSON) de forma
 * reutilizável e configurável.
 *
 * Uso:
 *   import { generatePrompt, generateJSONPrompt, PromptOptions } from './promptGenerator'
 *   const p = generatePrompt({ planType: 'Plano de aula', objective: 'Ensinar TS', audience: 'professores' })
 */

export type Language = 'pt' | 'en' | string;

export type Tone = 'formal' | 'informal' | 'neutral' | string;

export interface PromptOptions {
    language?: Language; // idioma do prompt/resultados
    planType?: string; // ex: "Plano de aula", "Plano de projeto", "Plano de marketing"
    objective?: string; // objetivo do plano
    audience?: string; // público-alvo
    constraints?: string[]; // restrições ou requisitos (ex: tempo, orçamento)
    tone?: Tone; // tom da escrita
    length?: 'short' | 'medium' | 'long' | number; // expectativa de tamanho
    sections?: string[]; // se quiser seções específicas (ex: "Resumo", "Passos", "Recursos")
    includeExamples?: boolean; // pedir exemplos práticos
    outputFormat?: 'text' | 'markdown' | 'json' | string; // formato desejado
    strictJsonSchema?: Record<string, unknown> | null; // se quiser saída JSON com esquema
}

/**
 * Valores padrão
 */
const DEFAULTS: Required<Pick<PromptOptions, 'language' | 'tone' | 'length' | 'outputFormat' | 'includeExamples'>> = {
    language: 'pt',
    tone: 'neutral',
    length: 'medium',
    outputFormat: 'markdown',
    includeExamples: true,
};

/**
 * Normaliza e junta arrays de restrições/seções em texto.
 */
function joinList(items?: string[], joinWith = ', '): string {
    if (!items || items.length === 0) return '';
    if (items.length === 1) return items[0];
    return items.join(joinWith);
}

/**
 * Gera um prompt textual baseado nas opções.
 * O prompt busca ser claro, orientado a instruções e fácil de ajustar.
 */
export function generatePrompt(opts: PromptOptions = {}): string {
    const {
        language,
        planType,
        objective,
        audience,
        constraints,
        tone,
        length,
        sections,
        includeExamples,
        outputFormat,
    } = { ...DEFAULTS, ...opts };

    // Instrução inicial variável por idioma
    const instructHeader = language === 'en'
        ? 'You are a professional planner and writing assistant.'
        : 'Você é um assistente profissional para geração de planos.';

    const goalLine = objective ? (language === 'en' ? `Main objective: ${objective}.` : `Objetivo principal: ${objective}.`) : '';
    const planLine = planType ? (language === 'en' ? `Plan type: ${planType}.` : `Tipo de plano: ${planType}.`) : '';
    const audienceLine = audience ? (language === 'en' ? `Target audience: ${audience}.` : `Público-alvo: ${audience}.`) : '';
    const constraintsLine = constraints && constraints.length
        ? (language === 'en' ? `Constraints: ${joinList(constraints)}.` : `Restrições: ${joinList(constraints)}.`)
        : '';
    const toneLine = tone ? (language === 'en' ? `Tone: ${tone}.` : `Tom: ${tone}.`) : '';
    const lengthLine = length ? (language === 'en' ? `Expected length: ${length}.` : `Tamanho esperado: ${length}.`) : '';
    const sectionsLine = sections && sections.length
        ? (language === 'en' ? `Sections to include: ${joinList(sections, '; ')}.` : `Seções a incluir: ${joinList(sections, '; ')}.`)
        : '';
    const examplesLine = includeExamples
        ? (language === 'en' ? 'Include practical examples where useful.' : 'Inclua exemplos práticos quando for útil.')
        : (language === 'en' ? 'Do not include examples.' : 'Não inclua exemplos.');
    const formatLine = outputFormat ? (language === 'en' ? `Return format: ${outputFormat}.` : `Formato de saída: ${outputFormat}.`) : '';

    const clarityLine = language === 'en'
        ? 'Be concise, well-structured and use bullet lists for steps when appropriate.'
        : 'Seja conciso, bem estruturado e utilize listas quando apropriado.';

    // Monta prompt final
    const parts = [
        instructHeader,
        planLine,
        goalLine,
        audienceLine,
        constraintsLine,
        toneLine,
        lengthLine,
        sectionsLine,
        examplesLine,
        formatLine,
        clarityLine,
    ].filter(Boolean);

    return parts.join(' ');
}

/**
 * Gera um prompt que exige saída JSON estrita conforme um esquema fornecido.
 * O esquema deve ser um objeto JSON Schema (parcial) que descreve a estrutura de saída desejada.
 */
export function generateJSONPrompt(schema: Record<string, unknown>, opts: PromptOptions = {}): string {
    const base = generatePrompt({ ...opts, outputFormat: 'json' });
    const schemaText = JSON.stringify(schema, null, 2);

    const jsonDirectivePt = [
        'Retorne SOMENTE um objeto JSON que siga estritamente o esquema abaixo.',
        'Não inclua explicações ou texto adicional fora do JSON.',
        'Se algum campo não puder ser preenchido, retorne null para esse campo.',
        '',
        'Esquema JSON:',
    ].join(' ');

    const jsonDirectiveEn = [
        'Return ONLY a JSON object that strictly follows the schema below.',
        'Do not include explanations or any text outside the JSON.',
        'If a field cannot be fulfilled, return null for that field.',
        '',
        'JSON Schema:',
    ].join(' ');

    const lang = opts.language || DEFAULTS.language;
    const directive = lang === 'en' ? jsonDirectiveEn : jsonDirectivePt;

    return [base, directive, schemaText].join('\n\n');
}

/**
 * Pequena utilidade para criar um esquema JSON simples para planos.
 * Retorna um esquema com título, resumo, passos, recursos e métricas.
 */
export function defaultPlanJsonSchema(titleRequired = true): Record<string, unknown> {
    return {
        type: 'object',
        properties: {
            title: { type: titleRequired ? 'string' : ['string', 'null'] },
            summary: { type: ['string', 'null'] },
            steps: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        order: { type: 'integer' },
                        description: { type: 'string' },
                        duration: { type: ['string', 'null'] },
                    },
                    required: ['order', 'description'],
                },
            },
            resources: {
                type: 'array',
                items: { type: 'string' },
            },
            metrics: {
                type: 'array',
                items: { type: 'string' },
            },
        },
        required: titleRequired ? ['title', 'steps'] : ['steps'],
        additionalProperties: false,
    };
}