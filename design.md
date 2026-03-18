# DigiLetras — Documento de Design

> Versão 1.0 | 2026-03-17 | Status: MVP em desenvolvimento

---

## 1. Princípios de Design

### P1 — Máxima Simplicidade de Navegação
Home → Toque no jogo → Jogue → Voltar. Sem login, sem seleção de perfil, sem menus secundários. Crianças de 5 anos que mal leem devem conseguir usar sozinhas.

### P2 — Visual Lúdico e Colorido
Gradientes vibrantes, emojis grandes, animações suaves. Bolhas flutuantes no background. Cada jogo com cor temática distinta para criar associação visual e reconhecimento.

### P3 — Feedback Imediato e Gentil
Sons diferentes para acerto (agudo, suave) e erro (grave, curto). Nunca punitivo. Verde para acerto, amarelo para posição atual, vermelho suave para erro. Frases de incentivo aleatórias ao completar.

### P4 — Progressão Natural
Palavras classificadas por dificuldade (1=dissílabos, 2=trissílabos, 3=polissílabos). Jogos que aumentam dificuldade conforme a criança avança (Memória tem níveis progressivos).

### P5 — Touch-First
Todos os elementos interativos têm área de toque mínima de 44×44px. Interface pensada primariamente para tablet, com suporte a desktop. Teclado on-screen customizado para jogos de digitação.

### P6 — Consistência de Padrões
Mesma linguagem visual em todos os jogos: slots de letra idênticos, mesma DoneCard, mesma ProgressBar, mesmos sons de feedback. A criança aprende o padrão uma vez e aplica em todos os jogos.

---

## 2. Sistema de Cores

### Cores Temáticas por Jogo

| Jogo | Cor Primária | Hex | Fundo | Hex fundo |
|---|---|---|---|---|
| 🧩 Sílabas | Roxo | `#7B1FA2` | Lilás claro | `#E1BEE7` |
| 🖼️ Quiz Visual | Rosa | `#E91E63` | Rosa claro | `#FCE4EC` |
| ✏️ Completar | Laranja | `#FF6F00` | Creme | `#FFF8E1` |
| 🧠 Memória | Teal | `#00897B` | Verde-água | `#E0F2F1` |
| ✍️ Escrever | Roxo escuro | `#4527A0` | Lavanda | `#EDE7F6` |
| 🔤 Letra Inicial | Rosa escuro | `#AD1457` | Rosa | `#FCE4EC` |
| 📝 Montar Frase | Teal escuro | `#00695C` | Verde-água | `#E0F2F1` |
| 📖 Histórias | Azul | `#1565C0` | Azul claro | `#E3F2FD` |

### Cores de Feedback (globais)

| Estado | Cor | Hex | Uso |
|---|---|---|---|
| Acerto / Preenchido | Verde | `#4CAF50` | Border + background |
| Fundo acerto | Verde claro | `#C8E6C9` | Background de slot preenchido |
| Posição atual | Âmbar | `#FF9800` | Border pulsante |
| Fundo atual | Âmbar claro | `#FFF3E0` | Background do slot atual |
| Erro | Vermelho | `#F44336` | Border + flash |
| Fundo erro | Vermelho claro | `#FFCDD2` | Background temporário de erro |
| Par encontrado (Memória) | Verde claro | `#C8E6C9` | Background + opacity 0.7 |

### Cores Globais

| Elemento | Cor | Hex |
|---|---|---|
| Background home | Gradiente | `135deg, #667eea → #764ba2` |
| Background DoneCard | Gradiente | `135deg, #667eea → #764ba2` |
| Texto sobre fundo escuro | Branco | `#FFFFFF` |
| Texto corpo | Cinza escuro | `#333333` |
| Texto secundário | Cinza médio | `#666666` |
| Desabilitado | Cinza claro | `#BDBDBD` |

### Cores das Bolhas (background animado)

Amarelo `#FFD700`, Verde `#90EE90`, Azul `#87CEEB`, Rosa `#FFB6C1`, Roxo `#DDA0DD` — todas com `opacity: 0.15`.

---

## 3. Tipografia

| Uso | Família | Tamanho | Peso |
|---|---|---|---|
| Título do app (home) | System UI / Segoe UI | 48px (3rem) | 700 bold |
| Título de jogo | System UI | 24px (1.5rem) | 700 bold |
| Subtítulo / instrução | System UI | 18px (1.125rem) | 400 normal |
| Slots de letra (Fill/Write) | System UI monospace-like | 20px | 700 bold |
| Botão de sílaba/palavra | System UI | 20px | 700 bold |
| Opção de quiz | System UI | 20px | 700 bold |
| Letra (FirstLetter) | System UI | 28px | 700 bold |
| Emoji como estímulo | Nativo | 80–96px | — |
| Texto do admin | System UI | 14–16px | 400/600 |

---

## 4. Grid e Layout

### Breakpoints

| Nome | Min-width | Uso |
|---|---|---|
| Mobile | 360px | Base — tablet pequeno / smartphone |
| Tablet | 768px | iPad, tablets Android comuns |
| Desktop | 1280px | Computadores escolares |

### Layouts por tela

**Home screen:**
- Grid 2 colunas × 4 linhas para os 8 game cards
- `max-width: 400px`, centralizado
- Gap entre cards: 16px
- Card: `border-radius: 24px`, padding 20px, min-height 110px

**Jogos de digitação (Fill, Write, StoryPlayer):**
- Layout flex coluna, centralizado
- Área de slots: flex-wrap, gap 8px, `max-width: 480px`
- On-screen keyboard: posição fixa no bottom ou inline após slots
- Scroll vertical se conteúdo ultrapassar viewport

**Memória:**
- Grid 4 colunas fixas
- `max-width: 480px`
- Cada card: aspect-ratio 1/1 (quadrado)
- Gap: 8px

**StoryPlayer:**
- Texto em flex-wrap com cada letra como elemento
- Spacing entre letras: natural (elemento de espaço com width 12px)

---

## 5. Componentes de UI

### GameCard (home screen)

```
Props: { icon: string, label: string, color: string, bg: string, onClick: () => void }

Visual:
- Background: bg
- Border: 3px solid color
- Border-radius: 24px
- Padding: 20px
- Icon: 48px emoji
- Label: 14px bold, color

States:
- Default: sombra suave (shadow-lg)
- Active/pressed: scale(0.95) — active:scale-95
- Animation: animate-pop ao montar
```

### LetterSlot

```
Props: { letter: string, state: 'blank' | 'current' | 'correct' | 'hint' }

Visual por estado:
- blank:   border dashed #ddd, bg white, letra "_"
- current: border #FF9800, bg #FFF3E0, scale(1.15), animate-pulse-scale
- correct: border #4CAF50, bg #C8E6C9, letra preenchida em verde
- hint:    border #90CAF9, bg #E3F2FD (letras já reveladas)

Tamanho: 48×48px
Border: 4px
Border-radius: 12px
Font: 20px bold
```

### SyllableButton

```
Props: { syllable: string, disabled: boolean, onClick: () => void }

Visual:
- Background: #7B1FA2 (roxo)
- Color: white
- Padding: 16px 24px
- Border-radius: 16px
- Font: 20px bold
- Shadow: shadow-lg

States:
- Default: fundo roxo
- Disabled: opacity 0.4
- Active: scale(0.95)
```

### OptionButton (Quiz e FirstLetter)

```
Props: { label: string, feedback: 'none' | 'correct' | 'wrong', onClick: () => void }

Visual por feedback:
- none:    bg white, border cor-do-jogo, color escuro
- correct: bg #C8E6C9, border #4CAF50, color #2E7D32
- wrong:   bg #FFCDD2, border #F44336, color #C62828

Tamanho: min 80px height, full column width
Border: 4px
Border-radius: 16px
Font: 20–28px bold (FirstLetter usa 28px)
Transition: all 0.3s
```

### OnScreenKeyboard ⭐ Componente Crítico

```
Props:
  onKey: (key: string) => void
  highlightKey?: string        // tecla atual esperada (opcional, para gamificação futura)
  disabledKeys?: string[]      // teclas que não podem ser usadas

Layout:
  Linha 1: A B C D E F G H I J
  Linha 2: K L M N O P Q R S T
  Linha 3: U V X Z Ç
  Linha 4: Á À Â Ã É Ê Í Ó Ô Õ Ú  (teclas de acentos, menores)
  Linha 5: [ESPAÇO] [⌫ APAGAR]

Tamanho das teclas:
  - Letras normais: min 40×44px (touch target 44px garantido com padding)
  - Teclas de acento: min 36×40px
  - Espaço: 120px de largura
  - Apagar: 60px de largura

Visual:
  - Tecla normal: bg white, border 2px #ddd, border-radius 8px, font 18px bold, shadow-sm
  - Tecla pressionada: scale(0.9), bg #E0E0E0
  - Tecla correta (feedback ok): bg #C8E6C9, border #4CAF50
  - Tecla errada (feedback no): bg #FFCDD2, border #F44336, animate-shake

Quando mostrar:
  - Detectar: navigator.maxTouchPoints > 0 OU CSS media (hover: none)
  - Mostrar teclado on-screen se dispositivo touch
  - Mostrar input nativo se desktop com teclado físico
  - Permitir ambos simultaneamente (usuário com tablet + teclado bluetooth)

Posicionamento:
  - Em jogos de digitação: abaixo dos slots, inline no fluxo
  - Em StoryPlayer com frase longa: fixed bottom com padding-bottom nos slots
```

### ProgressBar

```
Props: { current: number, total: number, color?: string }

Visual:
  - Track: bg white/30, height 12px, border-radius full
  - Fill: bg color, transition width 500ms ease
  - Width calculada: (current/total) * 100%
```

### DoneCard

```
Props: { score?: { correct: number, total: number }, onBack: () => void, onNext?: () => void, nextLabel?: string }

Visual:
  - Fullscreen com background gradiente roxo
  - Card branco centralizado, border-radius 24px, shadow-2xl
  - Trofeu emoji 🏆 (64px)
  - Mensagem de incentivo aleatória (24px bold, roxo)
  - Score: "Acertos: X / Y" (18px)
  - Botões: Voltar (cinza) + Próximo (roxo, se onNext presente)
  - Animação: animate-pop ao montar
  - Som: beep('yay') ao montar
```

### Bubbles (background animado)

```
Props: nenhum

7 círculos semi-transparentes com tamanhos 50–100px
Posições fixas (left: 5%, 15%, 30%, 50%, 65%, 80%, 92%)
Cada um com animação float de duração e delay distintos (6s–11s, 0–4s delay)
pointer-events: none para não interferir com toque
z-index: 0 (atrás de todo conteúdo)
```

---

## 6. Animações

| Nome | Keyframes | Duração | Easing | Quando usar |
|---|---|---|---|---|
| `pop` | scale(0.9)+opacity(0) → scale(1)+opacity(1) | 300ms | ease-out | Montagem de cards, DoneCard |
| `bounce` | translateY(0) → translateY(-6px) → translateY(0) | 1s | ease-in-out, infinite | Emojis principais durante jogo |
| `shake` | translateX(0→-5px→+5px→0) | 300ms | ease-in-out | Feedback de erro |
| `float` | translateY(0) → translateY(-30px) scale(1.1) | 4–11s | ease-in-out, infinite | Bolhas do background |
| `pulse-scale` | scale(1) → scale(1.15) → scale(1) | 800ms | ease-in-out, infinite | Slot de letra atual |

**Regras:**
- Usar `transform` e `opacity` — nunca animar `width`, `height`, `top`, `left`
- Duração máxima de animação de feedback: 350ms (shake)
- Animações de loop (bounce, float): `infinite` apenas em elementos de decoração
- `will-change: transform` nos elementos com animação contínua

---

## 7. Fluxo de Navegação

```
App
├── Home (/)
│   ├── [card] Sílabas → /syllable
│   │   └── [jogo] → DoneCard → Home
│   ├── [card] Quiz Visual → /quiz
│   │   └── [jogo] → DoneCard → Home
│   ├── [card] Completar → /fill
│   │   └── [jogo] → DoneCard → Home
│   ├── [card] Memória → /memory
│   │   └── [jogo] → DoneCard(por nível) → [Próximo Nível | Home]
│   ├── [card] Escrever → /write
│   │   └── [jogo] → DoneCard → Home
│   ├── [card] Letra Inicial → /first-letter
│   │   └── [jogo] → DoneCard → Home
│   ├── [card] Montar Frase → /build-sentence
│   │   └── [jogo] → DoneCard → Home
│   ├── [card] Histórias → /stories
│   │   └── [lista] StoryPicker
│   │       └── [história + modo] → /stories/:id/:mode
│   │           └── StoryPlayer → DoneCard → StoryPicker
│   └── [botão discreto] Admin → /admin
│       ├── Dashboard
│       ├── Histórias (StoryManager)
│       ├── Palavras (WordBank)
│       └── IA (AIGenerator)
```

**Estados de cada tela:**

| Tela | Estados possíveis |
|---|---|
| Home | idle |
| Jogo (genérico) | loading → playing → round_feedback → round_advance → done |
| Memória | playing → level_feedback → next_level / done |
| StoryPlayer | loading → typing → sentence_done → story_done |
| DoneCard | shown (único estado, ação é navegar) |

---

## 8. On-Screen Keyboard — Especificação Detalhada

### Problema
Os jogos Fill, Escrever, StoryPlayer (Karaokê e Ditado) capturam `keydown` do teclado físico. Em iOS Safari e Android Chrome com teclado virtual, eventos `keydown` não são disparados de forma confiável por um `<input readOnly>`. Isso torna 4 dos 8 jogos + ambos os modos de história **não-funcionais em tablets** — o principal dispositivo da faixa etária alvo.

### Solução
Componente `OnScreenKeyboard` com botões para todas as letras do alfabeto português (incluindo acentos). O componente dispara `onKey(letter)` quando uma tecla é pressionada, substituindo completamente a necessidade de `keydown`.

### Detecção de dispositivo

```typescript
// utils/device.ts
export function isTouchDevice(): boolean {
  return navigator.maxTouchPoints > 0 ||
         window.matchMedia('(hover: none)').matches;
}
```

### Layout do Teclado

```
┌─────────────────────────────────────────────┐
│  A  B  C  D  E  F  G  H  I  J              │
│  K  L  M  N  O  P  Q  R  S  T              │
│  U  V  X  Z  Ç                              │
│  Á  À  Â  Ã  É  Ê  Í  Ó  Ô  Õ  Ú          │
│  [    ESPAÇO    ]      [ ⌫ ]                │
└─────────────────────────────────────────────┘
```

### Especificação de teclas

```
Tecla de letra normal:
  - Width: calc(10% - 4px) em linhas de 10 teclas
  - Height: 44px
  - Background: white
  - Border: 1.5px solid #E0E0E0
  - Border-radius: 8px
  - Font-size: 16px
  - Font-weight: 700
  - Sombra: 0 2px 4px rgba(0,0,0,0.1)
  - Active: background #E0E0E0, transform scale(0.9)

Tecla de acento (linha 4):
  - Width: calc(9.09% - 4px)
  - Height: 40px
  - Font-size: 14px
  - Mesmas bordas e sombras

Tecla Espaço:
  - Width: 50% do total
  - Height: 44px
  - Label: "espaço" em lowercase
  - Background: #F5F5F5

Tecla Apagar (⌫):
  - Width: 20%
  - Height: 44px
  - Background: #FFCDD2
  - Color: #C62828
  - Font-size: 20px
```

### Comportamento nos jogos

| Jogo | Espaço? | Apagar? | Observação |
|---|---|---|---|
| Fill | Não | Não | Apenas letras; espaços e apagar ocultos |
| Escrever | Não | Não | Apenas letras |
| StoryPlayer (Karaokê) | Sim | Não | Frases têm espaços |
| StoryPlayer (Ditado) | Sim | Não | Frases têm espaços |

---

## 9. Feedback Visual e Audio

| Ação | Visual | Som | Duração |
|---|---|---|---|
| Letra/sílaba correta | Slot fica verde (C8E6C9) | beep('ok') — 660Hz sine | Permanente |
| Letra/sílaba errada | Shake + slot pisca vermelho | beep('no') — 220Hz triangle | 350ms |
| Opção correta (Quiz/FirstLetter) | Botão fica verde | beep('ok') | 1200ms, auto-avança |
| Opção errada (Quiz/FirstLetter) | Vermelho + correto fica verde | beep('no') | 1200ms, auto-avança |
| Par encontrado (Memória) | Cards ficam verdes, opacity 0.7 | beep('ok') | Permanente |
| Par errado (Memória) | Cards viram de volta após 0.9s | beep('no') | 900ms |
| Completar rodada/jogo | DoneCard com trofeu + incentivo | beep('yay') — 880Hz sine | Até voltar |
| Completar nível (Memória) | Tela de vitória de nível | beep('yay') | Até próxima ação |
| Início de rodada (palavras) | Emoji aparece com animate-pop | speak(word) — pt-BR 0.75x | Uma vez |
| Botão "Ouvir" (Ditado) | Animação de onda sonora (futuro) | speak(sentence) | Duração da fala |

---

## 10. Acessibilidade

| Elemento | Implementação |
|---|---|
| Botões com só emoji | `aria-label="Nome do jogo"` |
| Botões de sílaba/letra | `aria-label="Sílaba: {syl}"` |
| Slots de letra | `aria-label="Letra {i+1} de {total}: {estado}"` |
| Teclado on-screen | `role="toolbar"`, `aria-label="Teclado"` |
| ProgressBar | `role="progressbar"`, `aria-valuenow`, `aria-valuemax` |
| Feedback de erro | `aria-live="polite"` na zona de feedback |
| Cards de jogo | `role="button"`, focus visível com outline |
| Contraste mínimo | 4.5:1 para texto, 3:1 para UI components (WCAG AA) |
