# DigiLetras — Análise do Frontend + Design System + Plano de Evolução

> Data: 2026-03-19 | Objetivo: Mapear estado atual, definir padrão de cores, propor separação por idade e níveis de dificuldade no Jogar Livre

---

## 1. Diagnóstico do Estado Atual

### 1.1 Visão Geral da Arquitetura

| Aspecto | Estado atual | Avaliação |
|---------|-------------|-----------|
| **Framework** | React 19 + Vite 8 + TypeScript 5.9 | ✅ Excelente |
| **Styling** | Tailwind 4 + CSS vars + inline styles (misturados) | ⚠️ Inconsistente |
| **Roteamento** | react-router-dom v7 (HashRouter) | ✅ Bom |
| **Estado** | useState local + localStorage/sessionStorage | ⚠️ Fragmentado |
| **PWA** | vite-plugin-pwa configurado | ✅ Bom |
| **Áudio** | Web Audio API + Web Speech API | ✅ Funcional |
| **Componentes compartilhados** | DoneCard, Bubbles, OnScreenKeyboard, ProgressBar | ⚠️ Subutilizados |
| **Progressão** | Sistema de currículo com unidades/lições/XP | ✅ Bom fundamento |

### 1.2 Problemas Identificados

#### P1 — Caos de Cores (~80+ hex hardcodados)

Existe um design system em `index.css` com CSS variables (`--color-primary`, `--color-success`, etc.) e um `gameThemes.ts` centralizado, mas **nenhum componente de jogo os usa**. Cada jogo hardcoda seus próprios hex values diretamente no JSX:

```
Syllable:   #e1bee7, #ce93d8, #7B1FA2, #4CAF50, #9C27B0, #C8E6C9, #2E7D32
Quiz:       #fce4ec, #f48fb1, #E91E63, #C8E6C9, #FFCDD2, #4CAF50, #F44336, #2E7D32, #C62828, #880E4F
Fill:       #fff8e1, #ffcc02, #FF6F00, #4CAF50, #C8E6C9, #FF9800, #FFF3E0, #ddd
Memory:     #b2dfdb, #26a69a, #80cbc4, #E91E63, #888, #C8E6C9, #FFF9C4, #7B1FA2, #4CAF50, #FFC107, #4A148C, #333
Write:      #ede7f6, #9575cd, #4527A0, #4CAF50, #C8E6C9, #FF9800, #FFF3E0, #ddd
FirstLetter:#fce4ec, #ec407a, #AD1457, #C8E6C9, #FFCDD2, #4CAF50, #F44336, #2E7D32, #C62828, #880E4F
BuildSent:  #e0f2f1, #4db6ac, #00695C, #4CAF50, #B2DFDB, #C8E6C9, #2E7D32, #90A4AE, #00897B
MatchGame:  #6C5CE722, #00B89422, #6C5CE7, #00B894, #E53935, #A29BFE12, #00B89415, #FFEBEE
Coloring:   24 cores na paleta + 10 hex auxiliares
```

**Impacto:** Manutenção impossível, inconsistência visual, qualquer mudança de tema requer edição em 15+ arquivos.

#### P2 — Código Duplicado nos Jogos

6 dos 9 jogos (Syllable, Quiz, Fill, Write, FirstLetter, BuildSentence) implementam **manualmente** a mesma lógica:
- `useState(pool)` + `useState(round)` + `useState(correct)` + `useState(errors)` + `useState(done)`
- Padrão de advance: `if (round + 1 >= rounds) { done } else { nextWord }`
- Header com botão ← + emoji + título
- Layout: gradiente fullscreen → ProgressBar → conteúdo → DoneCard

O hook `useGameSession` **já existe** mas **nenhum jogo o importa** (código morto).

#### P3 — Inconsistência de Abordagem de Styling

| Componente | Abordagem |
|-----------|-----------|
| Jogos (7) | Tailwind classes + inline `style={}` |
| MatchGame | 100% inline styles com CSS vars |
| OnScreenKeyboard | 100% inline styles |
| PathScreen | 100% inline styles |
| FreePlayScreen | 100% inline styles |
| index.css | CSS custom properties + utility classes |

**Não há convenção única.** O mesmo componente pode ter `className="min-h-screen p-4"` com `style={{ background: '#fce4ec' }}`.

#### P4 — Problemas de Acessibilidade

- `ProgressBar` sem `role="progressbar"` / `aria-value*`
- Botão ← em TODOS os jogos sem `aria-label`
- `Bubbles` sem `aria-hidden="true"` explícito
- MatchGame ConnectMode sem alternativa via teclado
- Sem `prefers-reduced-motion` para animações

#### P5 — Estatísticas Fragmentadas

- Quiz, Fill, Write, FirstLetter → usam `sessionStats.ts`
- Syllable, BuildSentence, MatchGame, Coloring → não registram nada
- Memory → usa `sessionStorage` diretamente (fora do utilitário)

#### P6 — Componentes com Problemas

| Arquivo | Problema |
|---------|---------|
| `Quiz.tsx` L80 | Bug: ternary `celebrating ? X : X` retorna mesmo valor nos dois branches |
| `Coloring.tsx` | Prop `onComplete` declarada mas nunca chamada (código morto) |
| `MatchGame.tsx` | 609 linhas, 4 sub-componentes inline, `shuffle` duplicada |
| `Memory.tsx` | DoneCard própria inline em vez da compartilhada |
| `gameThemes.ts` | Disponível mas ignorado pelos jogos (dados sem consumidores) |

---

## 2. Padrão de Cores (Design System Proposto)

### 2.1 Princípio

Todas as cores devem vir de **CSS custom properties** definidas em `index.css`. Os jogos recebem sua cor temática via `gameThemes.ts` e a aplicam usando variáveis CSS de contexto.

### 2.2 Paleta Semântica Unificada

```css
:root {
  /* ══════════════════════════════════════════════════════════
     CORES SEMÂNTICAS — Feedback (Globais)
     ══════════════════════════════════════════════════════════ */

  /* Acerto / Sucesso */
  --feedback-ok:           #4CAF50;
  --feedback-ok-light:     #C8E6C9;
  --feedback-ok-dark:      #2E7D32;

  /* Erro */
  --feedback-error:        #F44336;
  --feedback-error-light:  #FFCDD2;
  --feedback-error-dark:   #C62828;

  /* Posição atual / Atenção */
  --feedback-current:      #FF9800;
  --feedback-current-light:#FFF3E0;

  /* Celebração */
  --feedback-celebrate:    #FFC107;
  --feedback-celebrate-light:#FFF9C4;

  /* Par encontrado (Memória) */
  --feedback-matched:      #C8E6C9;

  /* ══════════════════════════════════════════════════════════
     CORES DE MARCA / BASE
     ══════════════════════════════════════════════════════════ */

  /* Primárias (roxo — identidade da marca) */
  --brand-primary:          #6C5CE7;
  --brand-primary-light:    #A29BFE;
  --brand-primary-dark:     #4834D4;

  /* Acento (amarelo/laranja — destaques e CTAs) */
  --brand-accent:           #FDCB6E;
  --brand-accent-dark:      #E17055;

  /* ══════════════════════════════════════════════════════════
     SUPERFÍCIES
     ══════════════════════════════════════════════════════════ */
  --surface-bg:             #F4F3FF;
  --surface-card:           #FFFFFF;
  --surface-card-alt:       #F8F7FF;
  --surface-border:         #E8E6FF;

  /* ══════════════════════════════════════════════════════════
     TEXTO
     ══════════════════════════════════════════════════════════ */
  --text-primary:           #2D3436;
  --text-secondary:         #636E72;
  --text-muted:             #B2BEC3;
  --text-inverse:           #FFFFFF;

  /* ══════════════════════════════════════════════════════════
     NEUTRALS
     ══════════════════════════════════════════════════════════ */
  --neutral-50:             #FAFAFA;
  --neutral-100:            #F5F5F5;
  --neutral-200:            #E0E0E0;
  --neutral-300:            #BDBDBD;
  --neutral-400:            #9E9E9E;
  --neutral-500:            #757575;
  --neutral-600:            #616161;
  --neutral-700:            #424242;
  --neutral-800:            #333333;
  --neutral-900:            #212121;

  /* ══════════════════════════════════════════════════════════
     SOMBRAS
     ══════════════════════════════════════════════════════════ */
  --shadow-sm:   0 1px 3px rgba(108,92,231,.10), 0 1px 2px rgba(0,0,0,.06);
  --shadow-md:   0 4px 12px rgba(108,92,231,.15), 0 2px 4px rgba(0,0,0,.08);
  --shadow-lg:   0 8px 24px rgba(108,92,231,.18), 0 4px 8px rgba(0,0,0,.10);
  --shadow-card: 0 2px 8px rgba(108,92,231,.12);

  /* ══════════════════════════════════════════════════════════
     RAIOS DE BORDA
     ══════════════════════════════════════════════════════════ */
  --radius-sm:   8px;
  --radius-md:   14px;
  --radius-lg:   20px;
  --radius-xl:   28px;
  --radius-full: 9999px;

  /* ══════════════════════════════════════════════════════════
     TIPOGRAFIA
     ══════════════════════════════════════════════════════════ */
  --font-sans:     'Segoe UI', system-ui, -apple-system, sans-serif;
  --font-mono:     'SF Mono', 'Cascadia Code', 'Consolas', monospace;

  --text-xs:   11px;
  --text-sm:   13px;
  --text-md:   15px;
  --text-lg:   18px;
  --text-xl:   22px;
  --text-2xl:  28px;
  --text-3xl:  36px;
  --text-4xl:  48px;

  /* ══════════════════════════════════════════════════════════
     GRADIENTES
     ══════════════════════════════════════════════════════════ */
  --gradient-brand:     linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%);
  --gradient-accent:    linear-gradient(135deg, #FDCB6E 0%, #E17055 100%);
  --gradient-success:   linear-gradient(135deg, #00B894 0%, #55EFC4 100%);
  --gradient-bg:        linear-gradient(160deg, #F4F3FF 0%, #EDE9FE 100%);
  --gradient-hero:      linear-gradient(135deg, #6C5CE7 0%, #4834D4 60%, #2d1fa3 100%);

  /* ══════════════════════════════════════════════════════════
     BOLHAS DECORATIVAS
     ══════════════════════════════════════════════════════════ */
  --bubble-yellow:  #FFD700;
  --bubble-green:   #90EE90;
  --bubble-blue:    #87CEEB;
  --bubble-pink:    #FFB6C1;
  --bubble-purple:  #DDA0DD;
}
```

### 2.3 Cores Temáticas por Jogo (via gameThemes.ts → CSS vars dinâmicas)

O componente `GameLayout` (proposto abaixo) aplicaria variáveis de contexto:

```css
/* Variáveis injetadas pelo componente wrapper de cada jogo */
[data-game] {
  --game-color:    var(--brand-primary);   /* override por jogo */
  --game-bg:       var(--surface-bg);      /* override por jogo */
  --game-color-10: color-mix(in srgb, var(--game-color) 10%, transparent);
  --game-color-20: color-mix(in srgb, var(--game-color) 20%, transparent);
  --game-color-40: color-mix(in srgb, var(--game-color) 40%, transparent);
}
```

| Jogo | `--game-color` | `--game-bg` | Emoji |
|------|---------------|-------------|-------|
| Sílabas | `#7B1FA2` | `#E1BEE7` | 🧩 |
| Quiz Visual | `#E91E63` | `#FCE4EC` | 🖼️ |
| Completar | `#FF6F00` | `#FFF8E1` | ✏️ |
| Memória | `#00897B` | `#E0F2F1` | 🧠 |
| Escrever | `#4527A0` | `#EDE7F6` | ✍️ |
| Letra Inicial | `#AD1457` | `#FCE4EC` | 🔤 |
| Montar Frase | `#00695C` | `#E0F2F1` | 📝 |
| Histórias | `#1565C0` | `#E3F2FD` | 📖 |
| Ligar/Digitar | `#6A1B9A` | `#F3E5F5` | 🔗 |
| Pintar | `#E65100` | `#FFF3E0` | 🎨 |

### 2.4 Regra de Ouro: Mapeamento Hex → Variável

Ao refatorar, substituir:

| Hex Hardcodado | Variável CSS |
|---------------|-------------|
| `#4CAF50`, `#00B894` | `var(--feedback-ok)` |
| `#C8E6C9` | `var(--feedback-ok-light)` |
| `#2E7D32` | `var(--feedback-ok-dark)` |
| `#F44336`, `#E53935` | `var(--feedback-error)` |
| `#FFCDD2` | `var(--feedback-error-light)` |
| `#C62828` | `var(--feedback-error-dark)` |
| `#FF9800` | `var(--feedback-current)` |
| `#FFF3E0` | `var(--feedback-current-light)` |
| `#FFC107` | `var(--feedback-celebrate)` |
| `#FFF9C4` | `var(--feedback-celebrate-light)` |
| `#667eea`, `#6C5CE7` | `var(--brand-primary)` |
| `#764ba2`, `#4834D4` | `var(--brand-primary-dark)` |
| `#A29BFE` | `var(--brand-primary-light)` |
| `#FDCB6E` | `var(--brand-accent)` |
| `#E17055` | `var(--brand-accent-dark)` |
| `#FFFFFF` | `var(--surface-card)` |
| `#F4F3FF` | `var(--surface-bg)` |
| `#333`, `#2D3436` | `var(--text-primary)` |
| `#666`, `#636E72` | `var(--text-secondary)` |
| `#ddd`, `#E0E0E0` | `var(--neutral-200)` |
| `#888`, `#BDBDBD` | `var(--neutral-300)` |
| `#F5F5F5` | `var(--neutral-100)` |

---

## 3. Separação por Idade / Faixa Etária

### 3.1 Pesquisa Pedagógica: Marcos da Alfabetização (Brasil / BNCC)

A Base Nacional Comum Curricular (BNCC) do Brasil estabelece marcos claros:

| Idade | Ano Escolar | Fase BNCC | Habilidades de Leitura/Escrita |
|-------|-----------|-----------|-------------------------------|
| **4-5 anos** | Pré I/II | Educação Infantil | Reconhece letras do nome, relaciona sons a símbolos, consciência fonológica |
| **6 anos** | 1° ano EF | Ciclo de Alfabetização | Reconhece sílabas CV, lê palavras simples (dissílabas), escreve nome |
| **7 anos** | 2° ano EF | Ciclo de Alfabetização | Lê frases curtas, escreve palavras trissílabas, compreensão textual elementar |
| **8 anos** | 3° ano EF | Consolidação | Lê textos curtos com fluência, escreve parágrafos, usa pontuação básica |

### 3.2 Modelo de Níveis Proposto: 4 Faixas Etárias

```typescript
export type AgeGroup = 'pre' | 'alpha1' | 'alpha2' | 'fluent';

export interface AgeGroupConfig {
  id: AgeGroup;
  label: string;
  ageRange: string;         // ex: "4-5 anos"
  emoji: string;
  color: string;
  description: string;
  wordDifficulties: (1 | 2 | 3)[];
  availableGames: GameType[];
  gameSettings: Partial<Record<GameType, GameDifficultyOverride>>;
}

export interface GameDifficultyOverride {
  rounds?: number;           // quantas rodadas
  timeLimit?: number;        // limite de tempo (ms), 0 = sem limite
  hintLevel?: 'full' | 'partial' | 'none'; // nível de dica
  revealPercentage?: number; // % de letras reveladas em Fill
  memoryPairs?: number;      // pares iniciais em Memory
  distractors?: number;      // opções erradas em Quiz/FirstLetter
  sentenceMaxWords?: number; // máx palavras por frase em BuildSentence
  speechRate?: number;       // velocidade da fala TTS
}
```

#### Faixa 1: Descoberta (4–5 anos) — `pre`

| Configuração | Valor |
|-------------|-------|
| **Emoji** | 🌱 |
| **Cor** | `#66BB6A` (verde fresco) |
| **Palavras** | Apenas `difficulty: 1` (dissílabas simples CV) |
| **Jogos disponíveis** | Quiz, Memória, Letra Inicial, Pintar |
| **Jogos bloqueados** | Completar, Escrever, Montar Frase, Histórias |
| **Quiz** | 2 opções (em vez de 4), 4 rodadas |
| **Memória** | 3 pares (6 cartas) |
| **FirstLetter** | 3 opções (em vez de 4), 4 rodadas |
| **Fala** | `rate: 0.6` (mais lenta) |
| **Foco pedagógico** | Reconhecimento visual, associação som-imagem, consciência fonológica |

#### Faixa 2: Alfabetização Inicial (6 anos) — `alpha1`

| Configuração | Valor |
|-------------|-------|
| **Emoji** | 🌿 |
| **Cor** | `#42A5F5` (azul amigável) |
| **Palavras** | `difficulty: 1` principal, `difficulty: 2` como desafio |
| **Jogos disponíveis** | Todos exceto Histórias modo Ditado |
| **Quiz** | 4 opções, 5 rodadas |
| **Fill (Completar)** | 30% de lacunas (mais letras reveladas) |
| **Escrever** | 4 rodadas, palavras de 3–5 letras apenas |
| **Sílabas** | 5 rodadas, palavras de 2 sílabas |
| **Memória** | 4 pares |
| **Montar Frase** | Frases de 3–4 palavras |
| **Fala** | `rate: 0.7` |
| **Foco pedagógico** | Sílabas CV, decodificação, escrita guiada |

#### Faixa 3: Alfabetização Plena (7 anos) — `alpha2`

| Configuração | Valor |
|-------------|-------|
| **Emoji** | 🌳 |
| **Cor** | `#FFA726` (laranja quente) |
| **Palavras** | `difficulty: 1` e `2`, introduz `3` |
| **Jogos disponíveis** | Todos |
| **Fill** | 40% de lacunas |
| **Escrever** | 5 rodadas, todas as palavras |
| **Sílabas** | 5 rodadas, inclui trissílabas |
| **Memória** | 5 pares |
| **Montar Frase** | Frases de 4–6 palavras |
| **Histórias** | Modo Karaokê + Ditado |
| **Fala** | `rate: 0.75` |
| **Foco pedagógico** | Fluência silábica, escrita autônoma, compreensão |

#### Faixa 4: Fluência (8+ anos) — `fluent`

| Configuração | Valor |
|-------------|-------|
| **Emoji** | 🌟 |
| **Cor** | `#AB47BC` (roxo vibrante) |
| **Palavras** | Todas (`difficulty: 1, 2, 3`) |
| **Jogos disponíveis** | Todos |
| **Fill** | 50% de lacunas |
| **Escrever** | 6 rodadas, polissílabas |
| **Sílabas** | 6 rodadas, inclui polissílabas |
| **Memória** | 6 pares |
| **Montar Frase** | Frases de até 8 palavras |
| **Histórias** | Ambos os modos, histórias de dificuldade 3 |
| **Fala** | `rate: 0.85` |
| **Foco pedagógico** | Velocidade, precisão, ditado, compreensão textual |

### 3.3 Implementação: Seletor de Perfil

O seletor de faixa etária seria a **primeira tela ao abrir o app** (apenas na primeira vez), com opção de mudar nas configurações. Visual:

```
┌──────────────────────────────────────┐
│        🔤 DigiLetras                 │
│     Qual a idade da criança?         │
│                                      │
│  ┌──────────┐  ┌──────────┐         │
│  │    🌱    │  │    🌿    │         │
│  │  4–5     │  │  6 anos  │         │
│  │  anos    │  │          │         │
│  └──────────┘  └──────────┘         │
│                                      │
│  ┌──────────┐  ┌──────────┐         │
│  │    🌳    │  │    🌟    │         │
│  │  7 anos  │  │  8+ anos │         │
│  └──────────┘  └──────────┘         │
│                                      │
│  (guardado no dispositivo)           │
└──────────────────────────────────────┘
```

### 3.4 Impacto no Currículo (PathScreen)

O currículo atual tem unidades fixas. Com faixas etárias, o currículo se adapta:

| Faixa | Unidades visíveis | Atividades por lição |
|-------|------------------|---------------------|
| `pre` | U1 apenas (mais lições introdutórias) | Quiz + Memória + FirstLetter |
| `alpha1` | U1–U3 | Todas menos Story Dictation |
| `alpha2` | U1–U6 | Todas |
| `fluent` | Todas + desafios extras | Todas + tempo limite opcional |

---

## 4. Níveis de Dificuldade no Jogar Livre (FreePlayScreen)

### 4.1 Design Proposto

Na tela de Jogar Livre, além do filtro de **categoria** (que já existe), adicionar um seletor de **dificuldade**:

```
┌──────────────────────────────────────────────┐
│ ← Jogar Livre                          ⚙️   │
│   Escolha qualquer jogo                      │
│                                              │
│ Categoria: [Todos] [🐾] [🍎] [🧸] [🌿]... │
│                                              │
│ Dificuldade:                                 │
│  [🌱 Fácil] [🌿 Médio] [🌳 Difícil] [⭐ ∞] │
│                                              │
│  ┌─────────┐  ┌─────────┐                   │
│  │ 🧩      │  │ 🖼️      │                   │
│  │ Sílabas │  │ Quiz    │                   │
│  └─────────┘  └─────────┘                   │
│  ┌─────────┐  ┌─────────┐                   │
│  │ ✏️      │  │ 🧠      │                   │
│  │Completar│  │Memória  │                   │
│  └─────────┘  └─────────┘                   │
│  ...                                         │
└──────────────────────────────────────────────┘
```

### 4.2 Especificação dos Níveis de Dificuldade

```typescript
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'endless';

export interface DifficultyConfig {
  id: DifficultyLevel;
  label: string;
  emoji: string;
  color: string;
  wordDifficulties: (1 | 2 | 3)[];
  overrides: Partial<Record<GameType, GameDifficultyOverride>>;
}

export const DIFFICULTY_LEVELS: DifficultyConfig[] = [
  {
    id: 'easy',
    label: 'Fácil',
    emoji: '🌱',
    color: '#66BB6A',
    wordDifficulties: [1],
    overrides: {
      syllable:      { rounds: 4 },
      quiz:          { rounds: 4, distractors: 2 },
      fill:          { rounds: 4, revealPercentage: 0.30 },
      memory:        { memoryPairs: 3 },
      write:         { rounds: 3 },
      firstletter:   { rounds: 5, distractors: 2 },
      buildsentence:  { rounds: 3, sentenceMaxWords: 4 },
    },
  },
  {
    id: 'medium',
    label: 'Médio',
    emoji: '🌿',
    color: '#42A5F5',
    wordDifficulties: [1, 2],
    overrides: {
      syllable:      { rounds: 5 },
      quiz:          { rounds: 6, distractors: 3 },
      fill:          { rounds: 5, revealPercentage: 0.40 },
      memory:        { memoryPairs: 5 },
      write:         { rounds: 5 },
      firstletter:   { rounds: 8, distractors: 3 },
      buildsentence:  { rounds: 5, sentenceMaxWords: 6 },
    },
  },
  {
    id: 'hard',
    label: 'Difícil',
    emoji: '🌳',
    color: '#FFA726',
    wordDifficulties: [1, 2, 3],
    overrides: {
      syllable:      { rounds: 6 },
      quiz:          { rounds: 8, distractors: 3 },
      fill:          { rounds: 6, revealPercentage: 0.50 },
      memory:        { memoryPairs: 7 },
      write:         { rounds: 6 },
      firstletter:   { rounds: 10, distractors: 3 },
      buildsentence:  { rounds: 6, sentenceMaxWords: 8 },
    },
  },
  {
    id: 'endless',
    label: 'Infinito',
    emoji: '⭐',
    color: '#AB47BC',
    wordDifficulties: [1, 2, 3],
    overrides: {
      syllable:      { rounds: 999 },
      quiz:          { rounds: 999, distractors: 3 },
      fill:          { rounds: 999, revealPercentage: 0.50 },
      memory:        { memoryPairs: 8 },
      write:         { rounds: 999 },
      firstletter:   { rounds: 999, distractors: 3 },
      buildsentence:  { rounds: 999, sentenceMaxWords: 8 },
    },
  },
];
```

### 4.3 Fluxo de Dados

```
FreePlayScreen
  ├── [category filter] → filteredWords = words.filter(w => w.category === cat)
  ├── [difficulty filter] → diffWords = filteredWords.filter(w => diff.wordDifficulties.includes(w.difficulty))
  │
  └── onSelect(gameId, { wordPool: diffWords, overrides: diff.overrides[gameId] })
        │
        └── GameComponent receives:
              - wordPool (already filtered by category + difficulty)
              - rounds (from overrides or default)
              - other game-specific overrides
```

### 4.4 Mudanças necessárias no FreePlayScreen

1. **Novo estado:** `const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');`
2. **Novo seletor de pills** após as categorias (mesma estrutura visual)
3. **Filtrar palavras** por dificuldade antes de enviar como `wordPool`
4. **Passar overrides** ao jogo selecionado via router state

### 4.5 Mudanças necessárias nos Jogos

Cada jogo precisaria aceitar props extras além do `wordPool` atual:

```typescript
// Antes:
interface Props {
  onBack: () => void;
  wordPool?: Word[];
  rounds?: number;
  onComplete?: (errors: number) => void;
}

// Depois:
interface Props {
  onBack: () => void;
  wordPool?: Word[];
  rounds?: number;
  distractors?: number;         // Quiz, FirstLetter
  revealPercentage?: number;    // Fill
  memoryPairs?: number;         // Memory
  sentenceMaxWords?: number;    // BuildSentence
  hintLevel?: 'full' | 'partial' | 'none';
  onComplete?: (errors: number) => void;
}
```

---

## 5. Plano de Refatoração (Priorizado)

### Fase 1 — Design System (2-3 dias)

| # | Task | Impacto | Esforço |
|---|------|---------|---------|
| 1.1 | Consolidar `index.css` com a paleta semântica completa (seção 2.2 acima) | Alto | S |
| 1.2 | Criar `GameLayout` wrapper component que aplica `--game-color` / `--game-bg` via `data-game` | Alto | M |
| 1.3 | Refatorar os 9 jogos para usar `var(--feedback-ok)`, `var(--game-color)`, etc. em vez de hex hardcodados | Alto | L |
| 1.4 | Refatorar jogos para importar cores de `gameThemes.ts` via `getTheme(id)` | Médio | S |

### Fase 2 — Eliminação de Duplicação (2 dias)

| # | Task | Impacto | Esforço |
|---|------|---------|---------|
| 2.1 | Ativar `useGameSession` hook nos 6 jogos que o duplicam | Alto | M |
| 2.2 | Criar `GameLayout` component (header + progressbar + done) compartilhado | Alto | M |
| 2.3 | Unificar `DoneCard` — remover done screens customizados de Memory e MatchGame | Médio | S |
| 2.4 | Remover `shuffle` duplicada de MatchGame | Baixo | XS |

### Fase 3 — Níveis de Dificuldade no Jogar Livre (2-3 dias)

| # | Task | Impacto | Esforço |
|---|------|---------|---------|
| 3.1 | Criar `difficultyLevels.ts` com as 4 configurações | Médio | S |
| 3.2 | Adicionar seletor de dificuldade no `FreePlayScreen` | Alto | S |
| 3.3 | Propagar overrides aos jogos via router state | Alto | M |
| 3.4 | Adaptar cada jogo para consumir overrides (distractors, revealPercentage, etc.) | Alto | L |

### Fase 4 — Separação por Idade (3-4 dias)

| # | Task | Impacto | Esforço |
|---|------|---------|---------|
| 4.1 | Criar `ageGroups.ts` com as 4 configurações de faixa etária | Médio | S |
| 4.2 | Criar tela de seleção de faixa etária (primeira abertura) | Alto | M |
| 4.3 | Armazenar faixa selecionada em `localStorage` | Baixo | XS |
| 4.4 | Filtrar currículo (`PathScreen`) por faixa etária | Alto | M |
| 4.5 | Filtrar jogos disponíveis no `FreePlayScreen` por faixa | Médio | S |
| 4.6 | Aplicar overrides de idade aos jogos automaticamente | Alto | M |

### Fase 5 — Acessibilidade e Qualidade (1-2 dias)

| # | Task | Impacto | Esforço |
|---|------|---------|---------|
| 5.1 | Adicionar `aria-label` a todos os botões ← | Alto | XS |
| 5.2 | Adicionar `role="progressbar"` + ARIA values ao ProgressBar | Alto | XS |
| 5.3 | Adicionar `aria-hidden="true"` ao Bubbles | Baixo | XS |
| 5.4 | Corrigir bug do ternary em Quiz.tsx L80 | Baixo | XS |
| 5.5 | Remover prop morta `onComplete` do Coloring | Baixo | XS |
| 5.6 | Unificar estatísticas — todos os jogos devem chamar `recordGamePlayed()` | Médio | S |
| 5.7 | Adicionar `@media (prefers-reduced-motion)` para desabilitar animações | Médio | S |

---

## 6. Resumo Visual: Antes vs. Depois

```
ANTES (estado atual):
┌─────────────────────────────────────────┐
│ 80+ hex hardcodados          ❌         │
│ 3 estilos de styling misturados ❌      │
│ useGameSession morto          ❌         │
│ gameThemes.ts ignorado        ❌         │
│ Sem separação por idade       ❌         │
│ Sem dificuldade no FreePlay   ❌         │
│ Stats fragmentadas            ❌         │
│ 0 aria-labels em botões ←     ❌         │
└─────────────────────────────────────────┘

DEPOIS (proposta):
┌─────────────────────────────────────────┐
│ ~25 CSS vars semânticas       ✅         │
│ Tailwind + CSS vars (unificado) ✅      │
│ useGameSession em todos os jogos ✅     │
│ GameLayout wrapper shared     ✅         │
│ 4 faixas etárias (BNCC)      ✅         │
│ 4 níveis no FreePlay          ✅         │
│ Stats centralizadas           ✅         │
│ Acessibilidade WCAG AA       ✅         │
└─────────────────────────────────────────┘
```

---

## 7. Tipos TypeScript Propostos (para referência)

```typescript
// shared/config/ageGroups.ts
export type AgeGroup = 'pre' | 'alpha1' | 'alpha2' | 'fluent';

export interface AgeGroupConfig {
  id: AgeGroup;
  label: string;
  ageRange: string;
  emoji: string;
  color: string;
  description: string;
  wordDifficulties: (1 | 2 | 3)[];
  availableGames: GameType[];
  defaultDifficulty: DifficultyLevel;
  curriculumUnits: string[]; // IDs das unidades visíveis
}

// shared/config/difficultyLevels.ts
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'endless';

export interface DifficultyConfig {
  id: DifficultyLevel;
  label: string;
  emoji: string;
  color: string;
  wordDifficulties: (1 | 2 | 3)[];
  overrides: Partial<Record<GameType, GameDifficultyOverride>>;
}

export interface GameDifficultyOverride {
  rounds?: number;
  distractors?: number;
  revealPercentage?: number;
  memoryPairs?: number;
  sentenceMaxWords?: number;
  speechRate?: number;
  hintLevel?: 'full' | 'partial' | 'none';
}

// shared/config/appSettings.ts
export interface AppSettings {
  ageGroup: AgeGroup;
  soundEnabled: boolean;
  speechEnabled: boolean;
  reducedMotion: boolean;
}
```
