# 🔤 DigiLetras

Aplicativo educacional para crianças brasileiras de 3 a 8 anos que estão aprendendo a ler e escrever em português. Funciona 100% no navegador como PWA (Progressive Web App).

## ✨ Funcionalidades

### 🎮 10 Modos de Jogo
| Jogo | Descrição |
|------|-----------|
| Sílabas | Dividir palavras em sílabas |
| Quiz | Escolher a palavra correta para o emoji |
| Completar | Preencher a letra que falta |
| Memória | Jogo da memória com pares palavra/emoji |
| Escrever | Digitar a palavra usando teclado na tela |
| Primeira Letra | Identificar a letra inicial |
| Montar Frase | Ordenar palavras para formar frases |
| Associação | Conectar palavras a imagens |
| Colorir | Pintar desenhos SVG com paleta de cores |
| Histórias | Ler e digitar histórias interativas |

### 🛤️ Trilhas de Aprendizado Gamificadas
- Trilhas organizadas por faixa etária: **3-4**, **5-6** e **7-8 anos**
- Cada trilha tem unidades temáticas com lições progressivas
- Sistema de XP, estrelas e progresso persistente (localStorage)
- Dificuldade crescente dentro de cada trilha

### 🎯 Modo Livre (Free Play)
- Acesso direto a qualquer jogo sem seguir trilha
- Seleção de dificuldade (Fácil / Médio / Difícil)
- Filtro de palavras por tema

### 🤖 Gerador de Histórias com IA
- Painel admin para gerar histórias infantis via IA
- Suporta 5 provedores: Groq (gratuito), Anthropic, OpenAI, DeepSeek, Gemini
- Histórias com 3 níveis de dificuldade

### 🛠️ Painel Administrativo
- Editor de trilhas com drag-and-drop
- Banco de palavras com 200+ palavras e emojis
- Gerenciador de histórias e atividades customizadas
- Editor de jogos de associação e colorir

## 🏗️ Stack Técnica

| Tecnologia | Versão |
|-----------|--------|
| React | 19 |
| Vite | 8 |
| TypeScript | 5.9 (strict) |
| Tailwind CSS | 4 |
| react-router-dom | 7 (HashRouter) |
| vite-plugin-pwa | 1.2 |
| fast-check + vitest | Testes property-based |

Também usa: Web Audio API (efeitos sonoros), Web Speech API (TTS nativo), lucide-react (ícones).

## 🚀 Como Rodar

```bash
# Clonar e instalar
git clone https://github.com/haroldorodsilva/digiletras.git
cd digiletras/digiletras
yarn install

# Rodar em desenvolvimento
yarn dev
```

Acesse `http://localhost:5173` no navegador.

### Gerador de Histórias (opcional)

O gerador de histórias precisa de uma API key de IA. O Groq é gratuito e funciona bem.

```bash
# 1. Copie o arquivo de exemplo
cp .env.example .env

# 2. Edite .env e configure o provedor + chave
AI_PROVIDER=groq
GROQ_API_KEY=sua_chave_aqui

# 3. Rode o servidor de API local (na raiz do repo)
cd ..
node dev-server.mjs
```

O servidor local roda na porta 3001 e o Vite já tem proxy configurado.

## 🌐 Deploy (Vercel)

O projeto já vem configurado para deploy na Vercel:

1. Importe o repositório na [Vercel](https://vercel.com)
2. Configure as variáveis de ambiente (`AI_PROVIDER`, chave da API escolhida)
3. Deploy automático — `vercel.json` já define build command e output directory

A edge function `api/generate-story.ts` roda automaticamente na Vercel.

## 🧪 Testes

```bash
cd digiletras
yarn test         # 112 testes property-based com fast-check
npx tsc --noEmit  # Verificação de tipos
yarn build        # Build de produção
```

## 📁 Estrutura do Projeto

```
edu-kids/
├── api/
│   └── generate-story.ts    # Edge function (Vercel)
├── dev-server.mjs            # Servidor local para API de IA
├── vercel.json                # Config de deploy
└── digiletras/                # App React
    └── src/
        ├── features/
        │   ├── admin/         # Painel administrativo
        │   ├── freeplay/      # Tela de modo livre
        │   ├── games/         # 9 componentes de jogo
        │   ├── lesson/        # Runner de lições (modo path)
        │   ├── path/          # Tela de caminho (modo legado)
        │   ├── stories/       # Player e picker de histórias
        │   └── tracks/        # Trilhas gamificadas por idade
        └── shared/
            ├── components/    # Componentes reutilizáveis (layout, feedback, ui)
            ├── config/        # Faixas etárias, níveis de dificuldade
            ├── data/          # Palavras, frases, histórias, temas
            ├── hooks/         # useGameRounds, useGameSession, etc.
            ├── tracks/        # Trilhas builtin, store, XP, validação
            ├── types.ts       # Tipos compartilhados
            └── utils/         # Helpers (shuffle, pickRandom, etc.)
```

## 🎨 Design System

O app usa CSS custom properties como design system:

- Cores: `--color-primary`, `--color-success`, `--color-danger`, `--color-warning`
- Superfícies: `--color-bg`, `--color-surface`, `--color-surface-alt`
- Tipografia: `--font-display`, `--font-body`
- Espaçamento: `--space-xs` até `--space-2xl`
- Bordas: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full`
- Temas por jogo definidos em `gameThemes.ts`

## 🗺️ Roadmap

- [ ] Sistema de dificuldade adaptativa (ajuste automático baseado no desempenho)
- [ ] Perfis de usuário com PIN (múltiplas crianças no mesmo dispositivo)
- [ ] Backend com Supabase (sincronização de progresso entre dispositivos)
- [ ] Conformidade LGPD/COPPA para dados de menores
- [ ] Vozes TTS premium (substituir Web Speech API nativa)
- [ ] PWA offline completo com cache de áudio
- [ ] Modo multiplayer (competição entre crianças)
- [ ] Dashboard de analytics para pais/professores
- [ ] Mais trilhas e conteúdo para cada faixa etária
- [ ] Internacionalização (outros idiomas além de pt-BR)

## 📄 Licença

MIT — use, modifique e distribua livremente.

---

Feito com ❤️ para as crianças brasileiras aprenderem a ler.
