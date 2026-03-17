# DigiLetras - Especificação Completa do Projeto

## Visão Geral

DigiLetras é uma aplicação web educacional para crianças de 5-8 anos que estão aprendendo a ler em português brasileiro. O app combina alfabetização com introdução à digitação através de 8 modos de jogo interativos e lúdicos.

**Stack:** React + Vite (ou Next.js)
**Linguagem:** JavaScript/TypeScript
**Estilo:** Tailwind CSS ou CSS-in-JS
**Áudio:** Web Speech API (síntese de voz gratuita do navegador) + Web Audio API (beeps de feedback)
**Backend futuro:** Supabase / Firebase / Prisma + PostgreSQL
**Estado:** React state (useState/useReducer). Sem localStorage no MVP.

---

## Princípios de Design

1. **Máxima simplicidade de navegação** - Tela inicial → Toque no jogo → Jogue → Voltar. Sem login, sem seleção de perfil, sem menus complexos. Crianças que mal leem precisam conseguir usar sozinhas.
2. **Visual lúdico e colorido** - Gradientes vibrantes, emojis grandes, animações suaves (bounce, pop-in, shake em erro). Bolhas flutuantes no background. Cada jogo com cor temática distinta.
3. **Feedback imediato e gentil** - Sons diferentes para acerto (agudo, suave) e erro (grave, curto). Nunca punitivo. Cores verde para acerto, amarelo para posição atual, vermelho suave para erro. Frases de incentivo aleatórias ao completar.
4. **Progressão natural** - Palavras classificadas por dificuldade (1=dissílabos simples, 2=trissílabos, 3=polissílabos). Jogos que aumentam dificuldade conforme a criança avança.

---

## Arquitetura de Dados

### Banco de Palavras (`words`)

Cada palavra contém:

```typescript
interface Word {
  id: string;
  word: string;           // ex: "gato"
  syllables: string[];    // ex: ["ga", "to"]
  difficulty: 1 | 2 | 3;  // 1=fácil, 2=médio, 3=difícil
  category: string;        // "animal" | "objeto" | "lugar" | "natureza" | "pessoa" | "comida"
  emoji: string;           // "🐱"
}
```

**Banco inicial com 78+ palavras organizadas:**

Nível 1 (dissílabos simples CV): bola, gato, casa, pato, lua, sol, pipa, sapo, fada, mesa, dado, vaca, mala, rato, bolo, rio, uva, ovo, pão, mão, pé, asa, sino, lobo, bode, fogo, gelo, cama, tatu, café, pena, roda, nave, lata, doce, bota, nuvem, flor, trem, leão, mapa, foca, lixo, milho, queijo, pizza

Nível 2 (trissílabos): boneca, cavalo, estrela, floresta, coelho, jardim, galinha, macaco, banana, girafa, castelo, piranha, tomate, panela, janela, sapato, foguete, sorvete, tartaruga, cachorro, passaro, abacaxi, morango, aranha, escola

Nível 3 (polissílabos): princesa, borboleta, chocolate, elefante, dinossauro, helicopter

### Histórias (`stories`)

```typescript
interface Story {
  id: string;
  title: string;         // "O gato e a bola"
  emoji: string;         // "🐱"
  sentences: string[];   // ["O gato viu a bola.", "A bola é do gato.", ...]
  difficulty: 1 | 2 | 3;
  theme?: string;        // "animal" | "fantasia" | "natureza"
}
```

**12 histórias iniciais:**

1. "O gato e a bola" 🐱 - O gato viu a bola. / A bola é do gato. / O gato e a bola no sol.
2. "A lua e o sapo" 🌙 - O sapo viu a lua. / A lua é tão bela. / O sapo pula no rio.
3. "A pipa da fada" 🪁 - A fada tem uma pipa. / A pipa voa no sol. / A fada ri da pipa.
4. "O cavalo e o coelho" 🐴 - O cavalo vive no jardim. / O coelho come no jardim. / Eles são amigos.
5. "A estrela" ⭐ - A estrela brilha. / A boneca olha a estrela. / A floresta é bonita.
6. "A borboleta" 🦋 - A princesa viu uma borboleta. / A borboleta voou ao jardim. / Ela deu chocolate ao coelho.
7. "O bolo do rato" 🐭 - O rato viu o bolo. / O bolo é de uva. / O rato come o bolo.
8. "A vaca e o café" 🐄 - A vaca viu o café. / O café é da mesa. / A vaca bebe o café.
9. "O lobo e a nave" 🐺 - O lobo tem uma nave. / A nave voa no sol. / O lobo vai para a lua.
10. "O trem da escola" 🚂 - O trem vai para a escola. / A escola tem uma janela. / O macaco olha a janela.
11. "A girafa e o sorvete" 🦒 - A girafa come sorvete. / O sorvete é de morango. / A girafa é feliz.
12. "O cachorro e o sapato" 🐶 - O cachorro achou um sapato. / O sapato é da boneca. / O cachorro corre no jardim.

### Frases para Montar (modo BuildSentence)

12 frases simples: "O gato bebe água.", "A fada voa no sol.", "O sapo pula no rio.", "A bola é do rato.", "O bolo é de uva.", "A vaca come capim.", "O pato nada no rio.", "A lua brilha no céu.", "O lobo corre na mata.", "A foca nada no mar.", "O trem vai rápido.", "A flor é bonita."

---

## Os 8 Modos de Jogo

### 1. 🧩 Sílabas (Montar Palavra)

**Objetivo:** Criança monta palavras organizando sílabas na ordem correta.
**Mecânica:**
- Mostra emoji grande da palavra-alvo
- Sílabas aparecem embaralhadas como botões
- Criança toca na sílaba correta na sequência
- Acerto: sílaba vai para o slot, som agudo, cor verde
- Erro: som grave, sílaba não move
- 5 rodadas por sessão, palavras aleatórias do banco
**Visual:** Slots com "?" que preenchem com verde. Botões de sílabas em roxo/lilás.

### 2. 🖼️ Quiz Visual (Associação Imagem-Palavra)

**Objetivo:** Criança associa emoji/imagem à palavra escrita correta.
**Mecânica:**
- Mostra emoji gigante (80px)
- 4 opções de palavras escritas em grid 2x2
- 1 correta + 3 aleatórias do banco
- Acerto: botão fica verde, som de celebração
- Erro: botão fica vermelho, botão correto fica verde
- 6 rodadas por sessão
- Auto-avança após 1.2s
**Visual:** Botões brancos com borda, transição de cor no feedback.

### 3. ✏️ Completar (Lacunas)

**Objetivo:** Criança preenche letras faltantes de uma palavra.
**Mecânica:**
- Mostra emoji + palavra com ~40% das letras substituídas por "_"
- Letras existentes aparecem em verde
- Lacuna atual pulsa em amarelo com scale(1.15)
- Criança digita via teclado (input invisível captura keydown)
- Acerto: letra preenche, avança para próxima lacuna
- Erro: som grave, shake na UI
- 5 rodadas por sessão
**Visual:** Slots de letra estilo monospace, lacunas tracejadas.

### 4. 🧠 Memória (Jogo da Memória Clássico)

**Objetivo:** Encontrar pares de cartas idênticas (mesmo emoji + palavra).
**Mecânica:**
- Cada palavra gera 2 cartas IDÊNTICAS (mesmo emoji e palavra)
- Cards começam virados (fundo roxo com "?")
- Toque vira o card (mostra emoji + palavra, fundo amarelo)
- Se 2 cards virados são iguais: ficam virados permanentemente com fundo VERDE CLARO e opacity 0.7
- Se diferentes: viram de volta após 0.9s
- **Progressão de dificuldade:**
  - Nível 1: 4 pares (8 cards) em grid 4 colunas
  - Nível 2: 5 pares (10 cards)
  - Nível 3: 6 pares (12 cards)
  - ... até 8 pares máximo
- Ao completar nível: tela de vitória com opção "Próximo Nível" ou "Voltar"
- Contador de tentativas visível
**Visual:** Grid 4 colunas. Cards roxos (fechados), amarelos (abertos), verde claro (matched).

### 5. ✍️ Escrever (Digitar Palavra do Zero)

**Objetivo:** Criança vê apenas o emoji e precisa digitar a palavra inteira sem nenhuma dica visual das letras.
**Mecânica:**
- Mostra emoji gigante (80px) + texto "O que é isso? Digite!"
- Slots mostram apenas "_" (sem revelar letras)
- Slot atual pulsa em amarelo
- Criança digita via teclado
- Acerto: letra preenche em verde, avança
- Erro: shake, som grave, não avança
- Ao completar: mostra "✅ PALAVRA + emoji"
- 6 rodadas por sessão
- Contabiliza rodadas com zero erros
**Visual:** Slots minimalistas, foco total no emoji como dica.

### 6. 🔤 Letra Inicial (Com Qual Letra Começa?)

**Objetivo:** Identificar a primeira letra de uma palavra.
**Mecânica:**
- Mostra emoji + palavra escrita por extenso
- 4 opções de letras maiúsculas em grid 2x2
- 1 correta (primeira letra da palavra) + 3 aleatórias
- Acerto: botão verde, som de celebração
- Erro: botão vermelho, correto fica verde
- 8 rodadas por sessão (mais rápido, então mais rodadas)
- Auto-avança após 1.2s
**Visual:** Botões grandes com letras (fontSize 28), fácil de tocar.

### 7. 📝 Montar Frase (Ordenar Palavras)

**Objetivo:** Criança monta uma frase colocando palavras na ordem correta.
**Mecânica:**
- Frase do banco é dividida em palavras e embaralhada
- Slots no topo mostram "___" para cada palavra
- Palavras disponíveis aparecem como botões abaixo
- Criança toca na próxima palavra correta da sequência
- Acerto: palavra vai para o slot, som agudo
- Erro: som grave (palavra não move, pode tentar outra)
- Ao completar: mostra frase completa em verde
- 5 rodadas por sessão, frases aleatórias do banco
**Visual:** Slots com fundo cinza claro/tracejado. Botões de palavras em azul. Preenchidos em verde.

### 8. 📖 Histórias (Karaokê Digitado + Ditado)

**Objetivo:** Criança lê e digita histórias completas, frase por frase.

**Sub-modo Karaokê (⌨️ Digitar):**
- Frase aparece completa em slots de letras
- Cada letra é um slot: cinza (futuro), amarelo pulsante (atual), verde (acerto), vermelho (erro)
- Barra de progresso no topo
- Ao completar frase: mensagem de incentivo, auto-avança para próxima após 1.5s
- Ao completar história: tela com estatísticas (acertos/erros)

**Sub-modo Ditado (🎧 Ouvir):**
- Frase NÃO aparece visualmente (slots mostram "?")
- Botão "🔊 Ouvir" usa Web Speech API para ler a frase em pt-BR (rate=0.75, pitch=1.1)
- Botão "👀 Espiar" revela a frase temporariamente
- Criança digita de ouvido
- Mesmo sistema de feedback do karaokê

---

## Sistema de Áudio

### Web Audio API (sons de feedback)
```javascript
function beep(type) {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.value = 0.07; // volume baixo
  
  if (type === "ok")  { osc.frequency.value = 660; osc.type = "sine"; }    // acerto
  if (type === "no")  { osc.frequency.value = 220; osc.type = "triangle"; } // erro
  if (type === "yay") { osc.frequency.value = 880; osc.type = "sine"; }    // completou
  
  osc.start();
  osc.stop(ctx.currentTime + 0.12);
}
```

### Web Speech API (ditado)
```javascript
function speak(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "pt-BR";
  u.rate = 0.75;   // mais lento para crianças
  u.pitch = 1.1;   // tom levemente agudo
  speechSynthesis.speak(u);
}
```

Gratuito, funciona offline, sem API key. Qualidade depende do dispositivo.

---

## Navegação (Fluxo)

```
Tela Inicial (grid 2x2 com 8 jogos)
├── 🧩 Sílabas → Jogo → DoneCard → Voltar
├── 🖼️ Quiz → Jogo → DoneCard → Voltar
├── ✏️ Completar → Jogo → DoneCard → Voltar
├── 🧠 Memória → Jogo → DoneCard → Próximo Nível / Voltar
├── ✍️ Escrever → Jogo → DoneCard → Voltar
├── 🔤 Letra Inicial → Jogo → DoneCard → Voltar
├── 📝 Montar Frase → Jogo → DoneCard → Voltar
├── 📖 Histórias → Lista de Histórias
│   └── Escolhe história → Digitar ou Ditado → Jogo → DoneCard → Voltar
└── ⚙️ Admin (botão discreto)
    ├── Dashboard (métricas)
    ├── Histórias (CRUD)
    ├── Palavras (visualizar banco)
    ├── Usuários (perfis + stats)
    └── Gerador IA (Claude API gera histórias)
```

---

## Visual / UI

### Cores temáticas por jogo
- Sílabas: roxo (#7B1FA2) com fundo lilás
- Quiz: rosa (#E91E63) com fundo rosa claro
- Completar: laranja (#FF6F00) com fundo creme
- Memória: teal (#00897B) com fundo verde-água
- Escrever: roxo escuro (#4527A0) com fundo lavanda
- Letra Inicial: rosa escuro (#AD1457) com fundo rosa
- Montar Frase: teal escuro (#00695C) com fundo verde-água
- Histórias: azul (#667eea) com fundo azul claro

### Animações CSS
```css
@keyframes pop    { from { opacity:0; transform:scale(0.9) } to { opacity:1; transform:scale(1) } }
@keyframes bounce { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-6px) } }
@keyframes shake  { 0%,100% { transform:translateX(0) } 25% { transform:translateX(-5px) } 75% { transform:translateX(5px) } }
@keyframes float  { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-30px) scale(1.1) } }
```

### Background
Bolhas coloridas semi-transparentes flutuando com animação `float`. Cores: amarelo, verde, azul, rosa, roxo com opacidade 0.2.

### Mensagens de incentivo (aleatórias)
"Muito bem! 🎉", "Incrível! ⭐", "Arrasou! 🚀", "Que demais! 🌟", "Perfeito! ✨", "Uhuul! 💫"

---

## Painel Admin

### Dashboard
- Total de usuários, sessões, precisão média, total de histórias
- Atividade recente (últimos acessos)
- Palavras mais erradas

### Gerenciamento de Histórias
- Listar, criar, editar, deletar histórias
- Validador linguístico: ao salvar, verifica se palavras estão dentro da dificuldade da fase
- Formulário: título, emoji, frases (adicionar/remover dinamicamente)

### Banco de Palavras
- Visualizar todas as palavras com emoji, sílabas, nível
- Filtrar por nível de dificuldade
- (Futuro: CRUD de palavras)

### Gerador de Histórias com IA
- Input: tema (ex: "animais do mar")
- Chama Claude API (claude-sonnet-4-20250514) com prompt:
  - "Gere mini-história infantil pt-BR. Palavras simples, max 2 sílabas. 3 frases curtas max 6 palavras. Tema: {tema}. SOMENTE JSON: {title, emoji, sentences[]}"
- Resultado aparece para preview
- Botão "Aprovar" adiciona ao banco de histórias

### Gerenciamento de Usuários
- Perfil: nome, idade, XP, sessões, precisão
- Barra de progresso visual por precisão
- (Futuro: vincular a responsável, relatórios exportáveis)

---

## Estrutura de Pastas Sugerida

```
digiletras/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/              # Botões, cards, inputs reutilizáveis
│   │   ├── Bubbles.tsx      # Background animado
│   │   ├── DoneCard.tsx     # Tela de conclusão de jogo
│   │   └── ProgressBar.tsx  # Barra de progresso
│   ├── games/
│   │   ├── Typing.tsx       # Karaokê digitado
│   │   ├── Dictation.tsx    # Modo ditado
│   │   ├── Syllable.tsx     # Montar sílabas
│   │   ├── Quiz.tsx         # Quiz visual
│   │   ├── Fill.tsx         # Completar lacunas
│   │   ├── Memory.tsx       # Jogo da memória
│   │   ├── Write.tsx        # Escrever do zero
│   │   ├── FirstLetter.tsx  # Letra inicial
│   │   └── BuildSentence.tsx # Montar frase
│   ├── stories/
│   │   ├── StoryPlayer.tsx  # Player de histórias
│   │   └── StoryPicker.tsx  # Seletor de histórias
│   ├── admin/
│   │   ├── Dashboard.tsx
│   │   ├── StoryManager.tsx
│   │   ├── WordBank.tsx
│   │   ├── UserManager.tsx
│   │   └── AIGenerator.tsx
│   ├── data/
│   │   ├── words.ts         # Banco de palavras
│   │   ├── stories.ts       # Histórias
│   │   └── sentences.ts     # Frases para montar
│   ├── utils/
│   │   ├── audio.ts         # beep() e speak()
│   │   └── helpers.ts       # shuffle, random, etc
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── CLAUDE.md               # Este arquivo
```

---

## Roadmap Futuro

### Onda 2 - Escalar Conteúdo
- [ ] Expandir banco para 200+ palavras com famílias silábicas (BA-BE-BI-BO-BU)
- [ ] Geração em lote no admin (10 histórias por vez)
- [ ] Categorias temáticas selecionáveis pela criança
- [ ] Importar/exportar banco de palavras via CSV

### Onda 3 - Inteligência e Personalização
- [ ] Quiz de Compreensão (perguntas após histórias)
- [ ] Sistema adaptativo (detecta letras/sílabas difíceis e foca nelas)
- [ ] Sistema de conquistas e medalhas
- [ ] Perfis de criança com login simplificado (avatar + PIN)
- [ ] Relatórios exportáveis para pais/professores (PDF)
- [ ] Modo multiplayer (memória competitiva)

### Onda 4 - Produção
- [ ] Backend com Supabase/Firebase
- [ ] Autenticação (responsável + crianças vinculadas)
- [ ] PWA com suporte offline
- [ ] App mobile (React Native ou Capacitor)
- [ ] Vozes premium (Google Cloud TTS / ElevenLabs)
- [ ] Analytics detalhado (Mixpanel/Amplitude)

---

## Comandos para Claude Code

Para iniciar o projeto:
```bash
# Criar projeto
npm create vite@latest digiletras -- --template react-ts
cd digiletras
npm install
npm install tailwindcss @tailwindcss/vite

# Estrutura
mkdir -p src/{components/ui,games,stories,admin,data,utils}

# Rodar
npm run dev
```

### Instrução para Claude Code:
"Implemente o projeto DigiLetras seguindo a especificação do CLAUDE.md. Comece criando a estrutura de pastas, depois implemente os dados (words.ts, stories.ts), os utilitários (audio.ts), e em seguida os 8 jogos um por um. Cada jogo deve ser um componente independente. A tela inicial deve mostrar os 8 jogos em grid. Use Tailwind para estilização. Mantenha o visual lúdico e colorido conforme descrito."
