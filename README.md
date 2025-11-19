# README — Gerador de Planos (teste técnico)
Repositório: https://github.com/brunokemel/teste2
## Visão geral
-Aplicação backend em TypeScript que gera planos de aula usando a API Generative AI (Gemini) e persiste os planos no Supabase. Este -README cobre configuração, execução, decisões de arquitetura, documentação do modelo, scripts SQL e instruções de acesso.

 ###### (Recomendamos Gemini pela facilidade e e praticidade que ela traz e bastante completa mesmo gratuita)

1. Instruções de instalação e setup
Pré-requisitos
- Node.js 18+ instalado
- npm ou pnpm
- Conta e projeto no Supabase com tabelas criadas
- Conta no Google Cloud com chave de API para Generative Language API (Generative AI)
Clonar e instalar

1. **Clonar e instalar:**
   ```bash
    git clone https://github.com/brunokemel/teste2.git
    cd teste2/backend
    npm install
   ```

## Variáveis de ambiente
Crie um arquivo .env na pasta backend com as variáveis abaixo (substitua os valores reais):

```bash
    # Google Generative AI
    GOOGLE_API_KEY=SEU_GOOGLE_API_KEY_AQUI

    # Supabase
    SUPABASE_URL=https://seu-projeto.supabase.co
    SUPABASE_ANON_KEY=SEU_SUPABASE_ANON_KEY_AQUI
  ```
# Observações práticas:
- Não utilize aspas em torno dos valores.
- Garanta que o .env esteja no diretório onde você executa npx ts-node index.ts.
- Para evitar que o arquivo .env seja carregado depois dos imports, carregar dotenv antes de qualquer módulo que dependa das variáveis. As instruções abaixo mostram duas opções de execução.

## Formas de executar (dev)
Opção A — editar index.ts para pré-carregar dotenv (recomendado)
- No topo de index.ts adicione:
```bash
TS

    import 'dotenv/config';
  ```
- Então rode:
```bash
TS

    npx ts-node index.ts
  ```
Opção B — pré-carregar via CLI (sem editar código)

```bash
Bash

    npx ts-node -r dotenv/config index.ts

  ```
  Comandos úteis de debug

  ```bash
Bash

    npx ts-node -e "console.log(process.env.GOOGLE_API_KEY ? 'SET' : 'undefined')"
  ```

  2. Como executar o projeto
- Certifique-se de ter preenchido .env.
- Na pasta backend rode:

  ```bash
  Bash

    npx ts-node -r dotenv/config index.ts
  ```

 3. A aplicação iniciará em: http://localhost:3000

 4. Endpoints:
- POST /planos — cria um plano (body JSON com tema, faixaEtaria, duracao, autorId opcional)
- GET /planos — lista planos salvos

    Exemplo de request POST /planos
    ```json
    {
    "tema": "Animais",
    "faixaEtaria": "4-5 anos",
    "duracao": "40 minutos",
    "autorId": null
    }
    ```

    ## 3. Documentação da escolha do modelo e integração com Generative AI
 - Decisão técnica:- A integração utiliza a biblioteca oficial @google/generative-ai para acessar os modelos Generative Language do Google (Gemini).
- Razoabilidade: optar por um modelo de texto da Google por qualidade e facilidade de uso via SDK oficial.
- Observação operacional: alguns identificadores de modelo variam por versão da API. É recomendado usar o método listModels() para descobrir o id correto e o método suportado (generateContent, chat, etc).
Boas práticas implementadas:- Inicializar o cliente sob demanda (ou garantir que dotenv seja carregado antes dos imports) para evitar undefined em process.env.
- Registrar (temporariamente) a resposta bruta do modelo para ajustar parsing do JSON gerado.
- Validar e parsear apenas o JSON retornado pelo modelo.
Recomendação prática para obter o id do modelo:- Rodar um script de debug com client.listModels() para obter os ids disponíveis e escolher um que suporte geração de conteúdo.

## 4. Scripts SQL 
#### ( O suapabse foi retirado e está rodando sem banco de dados, caso queira usar eles, apenas descomente os pedaços de códigos que indica e continue os paços normalemnte)
 Criação da tabela principal (executar no SQL editor do Supabase):

 ```bash
  Sql

    create extension if not exists "uuid-ossp";

    create table planos_aula (
    id uuid primary key default uuid_generate_v4(),
    tema text not null,
    faixa_etaria text not null,
    duracao text not null,
    conteudo jsonb not null,
    autor_id uuid references auth.users(id),
    created_at timestamp default now()
    );

  ```

  Observações:- A linha create extension é útil em Postgres locais; no Supabase a extensão pgcrypto ou função gen_random_uuid() pode ser preferida dependendo da configuração do projeto.
- A coluna autor_id referencia auth.users(id) do Supabase Auth; se não usar Auth, pode permitir null ou manter como uuid simples.


## 5. Acessos ao projeto
URL da aplicação (local)
- http://localhost:3000
Credenciais de teste
- A API foi projetada para receber autorId como UUID opcional no corpo da requisição. Não existem credenciais fixas no repositório; use a dashboard do Supabase para criar usuários de teste se necessário.
Supabase

##  projeto Supabase (https://rxsbbfjpkzzdfokqqbfi.supabase.co)


- Export das tabelas: no painel do Supabase você pode usar "SQL Editor" > "New query" e executar SELECT * FROM planos_aula; ou usar o export de dados do painel.

Se desejar, gere e inclua um arquivo SQL exportado a partir do painel do Supabase com esquema e dados de exemplo.

## 6. Decisões técnicas tomadas
- TypeScript + ts-node: desenvolvimento rápido sem build em ambiente de teste.
- dotenv para gerenciar variáveis de ambiente.
- Supabase (Postgres + Auth) para persistência e autenticação futura.
- Uso de JSONB para conteudo para permitir flexibilidade no formato do plano gerado.
- Inicialização do cliente da API de forma a evitar dependência de ordem de imports (carregamento sob demanda ou pré-carregamento de dotenv).
- Tratamento robusto do output do modelo (extrair JSON via regex, validar chaves e normalizar valores vazios).


## 7. Desafios encontrados e soluções
- Variáveis de ambiente undefined na inicialização
- Causa: imports que instanciam clientes são avaliados antes de dotenv.config().
- Solução: carregar dotenv no topo do entrypoint (import 'dotenv/config') ou inicializar clientes sob demanda.
- Modelo do Google inválido / erro 404
- Causa: id do modelo incorreto ou modelo não suportado para o método usado.
- Solução: executar listModels() via SDK para descobrir ids válidos e adaptar a chamada (generateContent vs chat).
- Resposta do modelo com texto extra (não apenas JSON)
- Causa: modelo pode responder com instruções ou texto adicional.
- Solução: usar regex para extrair o JSON, validar e lançar erro claro caso não exista JSON válido.
- Persistência de tipos complexos
- Causa: campos do plano são objetos/arrays.
- Solução: armazenar em jsonb e normalizar campos antes da inserção.

## 8. Testes e exemplos
Exemplo de teste manual com curl:

 ```bash
  Bash

    curl -X POST http://localhost:3000/planos \
        -H "Content-Type: application/json" \
        -d '{
            "tema": "Plantas",
            "faixaEtaria": "6-7 anos",
            "duracao": "50 minutos",
            "autorId": null
    }'
  ```

  Retorno esperado:- Status 201 com o JSON normalizado contendo as chaves:
- introducao_ludica
- objetivo_bncc
- passo_a_passo
- rubrica_avaliacao

## 9. Boas práticas e próximos passos sugeridos

- Remover logs sensíveis (API key) do console e do repositório.
- Migrar para um processo de build (tsc) e scripts npm: start, dev, build.
- Implementar testes unitários para parsing do JSON retornado.
- Implementar rate limiting e tratamento de erros mais robusto para chamadas à API externa.
- Adicionar um endpoint de health-check e documentação OpenAPI/Swagger para facilitar integração.



