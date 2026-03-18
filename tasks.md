# DigiLetras — Backlog de Tasks

> Versão 1.0 | 2026-03-17 | Processo: análise → requirements → design → **tasks** → implementar

---

## Legenda

- Estimativa: `XS` <1h | `S` 1–2h | `M` 2–4h | `L` 4–8h | `XL` 8h+
- Status: `[ ]` pendente | `[x]` concluído | `[~]` em progresso
- IDs: `TASK-S0-XX` (Sprint 0), `TASK-S1-XX` (Sprint 1), etc.

---

## Sprint 0 — Correções Críticas

> **Objetivo:** Corrigir os 3 riscos críticos identificados na análise antes de qualquer nova feature. Sem esse sprint, o app não funciona corretamente em tablets.

---

- [x] **TASK-S0-01: Fix AudioContext Singleton**
  - **O quê:** Refatorar `src/utils/audio.ts` para usar um único `AudioContext` compartilhado (module-level singleton) em vez de criar um novo contexto a cada chamada de `beep()`
  - **Por quê:** Bug crítico — browsers limitam ~6 AudioContexts simultâneos. Crianças que erram rápido ficam sem feedback de áudio após poucos cliques, quebrando a experiência de aprendizado
  - **Critério de aceite:** 50+ cliques rápidos em erro no jogo Escrever sem perda de som; AudioContext criado uma vez e reutilizado; `ctx.resume()` chamado se estado for 'suspended'
  - **Estimativa:** XS
  - **Dependências:** nenhuma

---

- [x] **TASK-S0-02: Criar componente OnScreenKeyboard**
  - **O quê:** Criar `src/components/OnScreenKeyboard.tsx` conforme especificado em `design.md` seção 8. Incluir todas as letras do alfabeto português (A–Z + Ç + Á À Â Ã É Ê Í Ó Ô Õ Ú), botão de espaço e botão apagar
  - **Por quê:** Os jogos Fill, Escrever, Histórias (Karaokê e Ditado) são totalmente não-funcionais em tablets iOS/Android pois dependem de `keydown` de teclado físico. Isso representa 4 dos 8 jogos + ambos os modos de história
  - **Critério de aceite:** Componente renderiza sem erros; cada tecla tem área de toque ≥ 44px; prop `onKey(letter)` é chamada ao tocar; prop `disabledKeys` desabilita teclas visualmente; funciona em iPhone Safari e Android Chrome
  - **Estimativa:** M
  - **Dependências:** nenhuma

---

- [x] **TASK-S0-03: Utilitário de detecção de dispositivo touch**
  - **O quê:** Criar `src/utils/device.ts` com função `isTouchDevice(): boolean` usando `navigator.maxTouchPoints > 0 || window.matchMedia('(hover: none)').matches`
  - **Por quê:** Necessário para decidir entre mostrar OnScreenKeyboard vs. usar teclado físico
  - **Critério de aceite:** Retorna `true` em tablet/phone, `false` em desktop com mouse
  - **Estimativa:** XS
  - **Dependências:** nenhuma

---

- [x] **TASK-S0-04: Integrar OnScreenKeyboard no jogo Fill**
  - **O quê:** Modificar `src/games/Fill.tsx` para usar `OnScreenKeyboard` quando `isTouchDevice()` retorna `true`, mantendo o listener de `keydown` para desktop. Ocultar botões de espaço e apagar (não necessários neste jogo)
  - **Por quê:** Fill é o jogo com a mecânica de digitação mais usada por iniciantes; deve funcionar em tablet
  - **Critério de aceite:** Jogo funciona completo em tablet touch e em desktop; ambos os modos não interferem entre si
  - **Estimativa:** S
  - **Dependências:** TASK-S0-02, TASK-S0-03

---

- [x] **TASK-S0-05: Integrar OnScreenKeyboard no jogo Escrever**
  - **O quê:** Modificar `src/games/Write.tsx` com a mesma abordagem de TASK-S0-04
  - **Por quê:** Escrever é o jogo mais desafiador (sem dicas de letras); funcionar em tablet é essencial
  - **Critério de aceite:** Mesmo critério de TASK-S0-04
  - **Estimativa:** S
  - **Dependências:** TASK-S0-02, TASK-S0-03

---

- [x] **TASK-S0-06: Integrar OnScreenKeyboard no StoryPlayer**
  - **O quê:** Modificar `src/stories/StoryPlayer.tsx` para usar `OnScreenKeyboard` em touch. Aqui espaço deve funcionar (frases têm palavras separadas por espaço). Apagar pode ser ignorado (jogo não permite retroceder)
  - **Por quê:** Histórias são o conteúdo mais rico do app; ambos os modos (Karaokê e Ditado) ficam inacessíveis em tablet sem esse fix
  - **Critério de aceite:** Histórias completas podem ser digitadas em tablet; espaço entre palavras funciona; feedback visual de erro/acerto por tecla pressionada no keyboard
  - **Estimativa:** M
  - **Dependências:** TASK-S0-02, TASK-S0-03

---

- [x] **TASK-S0-07: Adicionar verificação de voz pt-BR disponível**
  - **O quê:** Criar hook `src/utils/useSpeechAvailable.ts` que verifica via `speechSynthesis.getVoices()` (aguardando evento `voiceschanged` no Chrome) se há voz pt-BR disponível. Exibir aviso suave ao responsável se não houver
  - **Por quê:** Em tablets Android baratos, a voz pt-BR pode estar ausente. O modo Ditado é completamente inviável sem voz funcional. O responsável precisa saber
  - **Critério de aceite:** Banner discreto aparece na home se nenhuma voz pt-BR for encontrada após 2s; não bloqueia o uso do app; não aparece em dispositivos com voz correta
  - **Estimativa:** S
  - **Dependências:** TASK-S0-01

---

## Sprint 1 — Fundação Sólida

> **Objetivo:** Refatorações de arquitetura que reduzem duplicação de código e tornam o projeto escalável antes de adicionar mais jogos e features.

---

- [x] **TASK-S1-01: Extrair hook useGameSession**
  - **O quê:** Criar `src/hooks/useGameSession.ts` encapsulando o padrão repetido em 6 jogos: `pool` (useState com shuffle), `round`, `correct`, `done`, função `advance(isCorrect)` que incrementa round/score e seta done ao fim
  - **Por quê:** O padrão `useState(pool) + useState(round) + useState(correct) + useState(done) + if (round+1 >= ROUNDS)...` está duplicado em Syllable, Quiz, Fill, Write, FirstLetter e BuildSentence — 6 implementações idênticas do mesmo lógica
  - **Critério de aceite:** Hook exportado e testável isoladamente; os 6 jogos refatorados para usá-lo sem mudança de comportamento visível; código de cada jogo reduz ~15 linhas
  - **Estimativa:** M
  - **Dependências:** nenhuma

---

- [x] **TASK-S1-02: Extrair hook useShake**
  - **O quê:** Criar `src/hooks/useShake.ts` com `{ shake, triggerShake }` — encapsula `useState(false)` + `setTimeout(() => setShake(false), 350)`
  - **Por quê:** Padrão repetido em Syllable, Fill, Write, BuildSentence, StoryPlayer
  - **Critério de aceite:** Hook funcional; 5 componentes refatorados; comportamento idêntico
  - **Estimativa:** XS
  - **Dependências:** nenhuma

---

- [x] **TASK-S1-03: Extrair hook useKeyboardInput**
  - **O quê:** Criar `src/hooks/useKeyboardInput.ts` com assinatura `useKeyboardInput(target: string, position: number, onCorrect: (char: string) => void, onError: () => void)` que gerencia o `window.addEventListener('keydown', ...)` com `useCallback` correto
  - **Por quê:** Três implementações independentes do mesmo padrão frágil (Fill, Write, StoryPlayer) com risco de stale closures e múltiplos listeners simultâneos se não gerenciados corretamente
  - **Critério de aceite:** Hook funciona para Fill, Write e StoryPlayer; todos os 3 refatorados; sem regressão em comportamento; apenas 1 listener ativo por vez por componente
  - **Estimativa:** S
  - **Dependências:** TASK-S0-04, TASK-S0-05, TASK-S0-06

---

- [x] **TASK-S1-04: Centralizar GAME_THEMES constant**
  - **O quê:** Extrair o array `games` de `App.tsx` para `src/data/gameThemes.ts` com tipo `GameTheme { id, icon, label, color, bg, path }`. Cada jogo importa sua própria cor do tema em vez de hardcodar hex values
  - **Por quê:** As cores dos jogos estão duplicadas: definidas em `App.tsx` (para os cards) e hardcodadas em cada componente de jogo (para o background). Single source of truth
  - **Critério de aceite:** Todos os hex values de cor de jogo vêm de `gameThemes.ts`; nenhum hex hardcodado em componentes de jogo; adicionar um novo jogo requer apenas 1 entrada no array
  - **Estimativa:** S
  - **Dependências:** nenhuma

---

- [ ] **TASK-S1-05: Migrar navegação para react-router-dom v7**
  - **O quê:** Instalar `react-router-dom` v7. Substituir o `useState<Screen>` em `App.tsx` por `createHashRouter` com rotas para cada jogo. Usar `useNavigate` nos jogos para navegar
  - **Por quê:** O `useState<Screen>` atual não suporta: botão back do browser, compartilhamento de URL, deep linking, mais de 1 nível de aninhamento (StoryPicker → StoryPlayer já requer estado paralelo)
  - **Critério de aceite:** Botão back do browser funciona em todos os jogos; URL muda ao navegar; `storyState` (id + mode) passado via URL params `/stories/:id/:mode`; comportamento de navegação idêntico ao atual
  - **Estimativa:** M
  - **Dependências:** TASK-S1-04

---

- [x] **TASK-S1-06: Adicionar vite-plugin-pwa**
  - **O quê:** Instalar `vite-plugin-pwa`, configurar `workbox` com estratégia `CacheFirst` para assets estáticos, `manifest.json` com nome "DigiLetras", ícones 192px e 512px, `theme_color: #764ba2`
  - **Por quê:** App deve funcionar offline após primeira carga (RNF-OFFLINE-01). Crianças em escolas com conexão instável não podem perder o progresso da sessão
  - **Critério de aceite:** Lighthouse PWA score ≥ 80; app funciona após desconectar da rede (testado via Chrome DevTools → offline); manifest válido
  - **Estimativa:** S
  - **Dependências:** nenhuma

---

## Sprint 2 — Qualidade dos Jogos

> **Objetivo:** Melhorar a experiência em cada jogo com base nos requisitos funcionais e feedback UX da faixa etária.

---

- [x] **TASK-S2-01: Syllable — pronunciar cada sílaba ao tocar**
  - **O quê:** Chamar `speak(syllable)` com cada sílaba ao ser tocada corretamente. Ao completar a palavra, `speak(word)` completo
  - **Por quê:** Reforço de associação sonoro-visual por sílaba é pedagogicamente importante para alfabetização silábica
  - **Critério de aceite:** Som de cada sílaba ao tocar; palavra completa falada ao terminar; sem sobreposição de falas (cancelar anterior)
  - **Estimativa:** XS
  - **Dependências:** TASK-S0-01

---

- [x] **TASK-S2-02: Memory — adicionar contador de tentativas e highscore local**
  - **O quê:** Exibir tentativas por nível durante o jogo. Na tela de vitória de nível, mostrar "Seu recorde: X tentativas". Salvar highscore por nível em `sessionStorage`
  - **Por quê:** Motivação adicional para crianças mais velhas (7–8 anos) que já dominam o jogo básico; encoraja repetição e melhoria
  - **Critério de aceite:** Contador visível durante jogo; tela de vitória mostra tentativas e recorde; recorde persiste durante a sessão (não precisa persistir entre sessões no MVP)
  - **Estimativa:** S
  - **Dependências:** nenhuma

---

- [x] **TASK-S2-03: Quiz — adicionar animação de celebração maior no acerto**
  - **O quê:** No acerto, além do botão verde, mostrar o emoji da palavra em tamanho maior com `animate-bounce` por 1s antes de avançar
  - **Por quê:** Feedback visual mais expressivo no acerto aumenta retenção e satisfação na faixa etária
  - **Critério de aceite:** Emoji "explode" visualmente no acerto; animação completa antes de auto-avançar
  - **Estimativa:** S
  - **Dependências:** nenhuma

---

- [x] **TASK-S2-04: Fill — adicionar indicador de quantas lacunas faltam**
  - **O quê:** Abaixo dos slots, mostrar "Faltam X letras" em texto pequeno, atualizado a cada acerto
  - **Por quê:** Crianças que estão tendo dificuldade precisam de âncora para saber quanto falta; reduz abandono por frustração
  - **Critério de aceite:** Contador atualiza a cada letra preenchida; desaparece quando todas as lacunas são preenchidas
  - **Estimativa:** XS
  - **Dependências:** nenhuma

---

- [x] **TASK-S2-05: Escrever — adicionar botão de dica (fala a palavra novamente)**
  - **O quê:** Botão "🔊 Ouvir" que chama `speak(word)` novamente. Disponível a qualquer momento durante a rodada
  - **Por quê:** A criança pode ter perdido a pronúncia inicial; sem esse botão, fica sem referência sonora se não se lembrar da palavra
  - **Critério de aceite:** Botão visível mas não proeminente (não distrai do jogo); `speak()` chamado ao tocar; não interfere com input de letras
  - **Estimativa:** XS
  - **Dependências:** TASK-S0-01

---

- [x] **TASK-S2-06: BuildSentence — falar a frase completa ao completar**
  - **O quê:** Ao completar a frase, mostrar a frase em verde e chamar `speak(sentence.text)` automaticamente
  - **Por quê:** Reforço de leitura e associação: a criança ouve a frase que acabou de montar, fechando o ciclo de aprendizado
  - **Critério de aceite:** Frase falada apenas uma vez ao completar; frase visível em verde durante a fala
  - **Estimativa:** XS
  - **Dependências:** TASK-S0-01

---

- [x] **TASK-S2-07: FirstLetter — melhorar animação de celebração**
  - **O quê:** No acerto, destacar a letra inicial na palavra escrita com cor e tamanho maior por 800ms antes de avançar
  - **Por quê:** Reforço visual direto na letra que a criança acabou de identificar; aprendizado por feedback específico
  - **Critério de aceite:** Primeira letra da palavra pisca em verde e escala 1.5x no acerto; então normaliza e avança
  - **Estimativa:** S
  - **Dependências:** nenhuma

---

- [x] **TASK-S2-08: StoryPlayer — highlight da palavra atual**
  - **O quê:** Durante digitação, além de colorir letra a letra, destacar a palavra completa sendo digitada com fundo levemente colorido
  - **Por quê:** Ajuda a criança a manter o contexto de qual palavra está sendo digitada dentro da frase
  - **Critério de aceite:** Palavra atual tem fundo âmbar claro; vizinhas ficam cinza claro; já digitadas ficam verde
  - **Estimativa:** M
  - **Dependências:** TASK-S0-06

---

## Sprint 3 — Admin Funcional

> **Objetivo:** Tornar o painel admin real e utilizável pelo professor/responsável.

---

- [x] **TASK-S3-01: Dashboard com stats reais de sessionStorage**
  - **O quê:** Registrar em `sessionStorage` durante os jogos: palavras praticadas, erros por palavra, jogos jogados. Dashboard lê e exibe esses dados
  - **Por quê:** Dashboard com dados hardcodados não tem utilidade real; responsável precisa de informação real para acompanhar progresso
  - **Critério de aceite:** Dashboard mostra: jogos jogados na sessão, top 5 palavras com mais erros, precisão média global da sessão; dados resetam ao fechar o browser (sessionStorage)
  - **Estimativa:** M
  - **Dependências:** TASK-S1-01

---

- [x] **TASK-S3-02: StoryManager — adicionar histórias dinamicamente**
  - **O quê:** Formulário no admin para criar nova história: título, emoji, array de frases (add/remove dinamicamente), nível de dificuldade, tema. Histórias criadas armazenadas em `sessionStorage` e mergeadas com o banco estático
  - **Por quê:** Professor precisa adicionar histórias sobre o conteúdo da sua turma sem deploy de código
  - **Critério de aceite:** Nova história criada aparece no StoryPicker imediatamente; formulário valida campos obrigatórios; histórias persistem durante a sessão
  - **Estimativa:** L
  - **Dependências:** nenhuma

---

- [x] **TASK-S3-03: WordBank — filtros e visualização por categoria**
  - **O quê:** Adicionar filtro por categoria (`animal`, `comida`, `objeto`, etc.) além do filtro por nível existente. Mostrar distribuição de palavras por nível em mini gráfico de barras
  - **Por quê:** Professor pode querer ver quais palavras estão disponíveis por tema para planejar aula
  - **Critério de aceite:** Filtro de categoria funciona; gráfico simples de distribuição por nível visível; busca por texto no banco
  - **Estimativa:** M
  - **Dependências:** nenhuma

---

- [x] **TASK-S3-04: AIGenerator — integração real com Claude API (via backend proxy)**
  - **O quê:** Criar endpoint backend simples (Cloudflare Worker ou Vercel Edge Function) que recebe `{ theme }` e chama `claude-sonnet-4-6` com o prompt especificado na spec. Retornar JSON com `{ title, emoji, sentences[] }`. Frontend chama esse endpoint
  - **Por quê:** O gerador atual é um `setTimeout` stub sem valor real. Professor precisa gerar histórias contextualizadas para a turma rapidamente
  - **Critério de aceite:** Gerador produz histórias reais em pt-BR sobre o tema inserido; resultado mostra preview; botão "Aprovar" adiciona à sessão; tratamento de erro se API falhar
  - **Estimativa:** L
  - **Dependências:** TASK-S3-02

---

## Sprint 1 — Pendente

---

- [x] **TASK-S1-05: Migrar navegação para react-router-dom v7**
  - **O quê:** Instalar `react-router-dom` v7. Substituir o `useState<Screen>` em `App.tsx` por `createHashRouter` com rotas para cada jogo. Usar `useNavigate` nos jogos para navegar
  - **Por quê:** O `useState<Screen>` atual não suporta: botão back do browser, compartilhamento de URL, deep linking, mais de 1 nível de aninhamento (StoryPicker → StoryPlayer já requer estado paralelo)
  - **Critério de aceite:** Botão back do browser funciona em todos os jogos; URL muda ao navegar; `storyState` (id + mode) passado via URL params `/stories/:id/:mode`; comportamento de navegação idêntico ao atual
  - **Estimativa:** M
  - **Dependências:** TASK-S1-04

---

## Wave 2 — Expandir Conteúdo

> **Objetivo:** Escalar o banco de dados para cobrir todo o currículo de alfabetização brasileiro (famílias silábicas BA-BE-BI-BO-BU).

---

- [x] **TASK-W2-01: Expandir banco para 200+ palavras por família silábica**
  - **O quê:** Adicionar palavras organizadas por família silábica (BA/BE/BI/BO/BU, CA/CE/CI/CO/CU, etc.) com campo `silabicFamily` na interface `Word`
  - **Por quê:** Currículo de alfabetização brasileiro é estruturado por famílias silábicas; app deve cobrir todas para ser adotado em escolas
  - **Critério de aceite:** 200+ palavras no banco; cada palavra com campo `silabicFamily`; banco organizado e sem duplicatas
  - **Estimativa:** L
  - **Dependências:** nenhuma

---

- [x] **TASK-W2-02: Categorias selecionáveis pela criança na home**
  - **O quê:** Adicionar seletor de categoria temática na home (emojis de cada categoria: 🐾 Animais, 🍎 Comida, etc.) que filtra as palavras usadas em todos os jogos
  - **Por quê:** Personalização aumenta engajamento; criança que ama animais pode focar em palavras de animais
  - **Critério de aceite:** Seletor visível mas simples (linha de ícones); seleção persiste durante a sessão; "Todos" é opção padrão
  - **Estimativa:** M
  - **Dependências:** TASK-W2-01

---

- [x] **TASK-W2-03: Import/export banco de palavras via CSV**
  - **O quê:** No admin, botão "Exportar CSV" baixa todas as palavras; botão "Importar CSV" aceita arquivo com colunas word, syllables, difficulty, category, emoji
  - **Por quê:** Professores podem contribuir com bancos de palavras sem precisar editar código
  - **Critério de aceite:** Export gera CSV válido; import valida formato antes de aceitar; palavras importadas aparecem nos jogos imediatamente
  - **Estimativa:** M
  - **Dependências:** TASK-W2-01

---

## Wave 2B — Novos Jogos

---

- [x] **TASK-W2B-01: Jogo Ligar Pontos (ConnectDots)**
  - Implementado com editor visual no admin, 3 sets padrão (estrela, coração, casa), SVG interativo

- [x] **TASK-W2B-02: Jogo Pintar (Coloring)**
  - SVGs auto-descobertos de `src/assets/paint/`, upload pelo admin, paleta de 12 cores

- [ ] **TASK-W2B-03: Jogo Ligar (Coluna A ↔ Coluna B)**
  - **O quê:** Criar `src/games/Match.tsx`. Duas colunas: esquerda com palavras/letras, direita com emojis/figuras embaralhados. Criança toca em um item de cada coluna; se formarem par correto, uma linha os conecta e ficam verdes. Par errado: shake + som grave. Completar todos os pares = vitória
  - **Por quê:** Jogo de ligar é uma atividade clássica de fixação: reforça associação palavra-figura de forma visual e interativa, diferente dos jogos de digitação ou quiz de múltipla escolha
  - **Critério de aceite:** 5 pares por rodada; coluna esquerda pode conter palavra ou letra inicial; coluna direita tem emoji; linha SVG animada conectando pares corretos; 5 rodadas por sessão; funciona em touch e mouse
  - **Estimativa:** M
  - **Dependências:** TASK-S1-01 (useGameSession)

---

## Wave 3 — Inteligência e Personalização

---

- [ ] **TASK-W3-01: Sistema adaptativo de dificuldade**
  - **O quê:** Rastrear erros por letra/sílaba ao longo das sessões. Quando uma letra tem taxa de erro > 40%, priorizá-la nos jogos de digitação. Adicionar store Zustand `useAdaptiveStore`
  - **Por quê:** Criança que erra "nh" repetidamente precisa de mais prática com esse som; o app deve detectar e focar automaticamente
  - **Critério de aceite:** Letras com mais erros aparecem mais frequentemente; a seleção é ponderada, não exclusiva; dados persistem em localStorage
  - **Estimativa:** XL
  - **Dependências:** TASK-S3-01

---

- [ ] **TASK-W3-02: Sistema de XP e conquistas**
  - **O quê:** Cada rodada completada ganha XP. Conquistas por marcos (primeira história, 10 rodadas sem erro, nível 5 de memória). Exibir XP e conquistas em perfil simples
  - **Por quê:** Gamificação aumenta retenção e motivação intrínseca na faixa etária
  - **Critério de aceite:** XP exibido na home; conquistas desbloqueiam com animação especial; dados em localStorage
  - **Estimativa:** L
  - **Dependências:** TASK-S1-01

---

- [ ] **TASK-W3-03: Perfis com PIN simplificado**
  - **O quê:** Até 4 perfis por dispositivo, cada um identificado por avatar emoji + nome. Login via PIN de 4 emojis (sem texto)
  - **Por quê:** Múltiplas crianças compartilham o mesmo tablet em muitas famílias e escolas brasileiras
  - **Critério de aceite:** Seleção de perfil na entrada; PIN de emojis funciona; progresso é separado por perfil; sem necessidade de email/senha
  - **Estimativa:** XL
  - **Dependências:** TASK-W3-02

---

## Wave 4 — Produção

---

- [ ] **TASK-W4-01: Backend Supabase (região São Paulo)**
  - **O quê:** Configurar projeto Supabase em `sa-east-1`, schema com tabelas `profiles`, `sessions`, `word_attempts`. Row-Level Security para isolamento de dados por usuário
  - **Por quê:** Dados de crianças precisam de residência no Brasil (LGPD) e isolamento por família/escola
  - **Critério de aceite:** Dados persistem entre dispositivos; RLS impede acesso cruzado; queries < 200ms para banco de dados < 10k registros
  - **Estimativa:** XL
  - **Dependências:** TASK-W3-03

---

- [ ] **TASK-W4-02: LGPD/COPPA Compliance**
  - **O quê:** Implementar: tela de consentimento parental antes de criar perfil de criança; política de privacidade; fluxo de exclusão de dados; não coletar nome real (somente apelido/avatar)
  - **Por quê:** Lei Geral de Proteção de Dados (LGPD) e COPPA exigem consentimento explícito dos responsáveis para dados de menores de 13 anos
  - **Critério de aceite:** Consentimento documentado antes de salvar dados remotos; dados exportáveis e deletáveis pelo responsável; DPA com Supabase assinado
  - **Estimativa:** L
  - **Dependências:** TASK-W4-01

---

- [ ] **TASK-W4-03: Google Cloud TTS para vozes premium pt-BR**
  - **O quê:** Substituir Web Speech API por Google Cloud TTS (vozes Neural2 pt-BR) para as palavras do banco e frases das histórias. Cache de áudio gerado em Supabase Storage para evitar re-chamadas de API
  - **Por quê:** Qualidade de voz é crítica para o modo Ditado e para crianças aprenderem pronúncia correta; TTS do browser é inconsistente em dispositivos baratos
  - **Critério de aceite:** Voz neural pt-BR usada em todos os jogos; custo < $2/mês para 1000 usuários ativos; funciona offline via cache após geração inicial
  - **Estimativa:** XL
  - **Dependências:** TASK-W4-01

---

- [ ] **TASK-W4-04: PWA completo com suporte offline total**
  - **O quê:** Expandir o service worker do `vite-plugin-pwa` para cachear áudio gerado pelo TTS; sincronização de progresso quando reconectar; installable como app no homescreen
  - **Por quê:** Muitas escolas brasileiras têm conexão instável; o app precisa funcionar 100% offline após instalação
  - **Critério de aceite:** Score PWA Lighthouse ≥ 90; funciona completamente offline incluindo áudio; badge de instalação aparece no browser
  - **Estimativa:** L
  - **Dependências:** TASK-W4-03

---

## Ordem de Implementação Recomendada

```
Sprint 0 (semana 1): S0-01 → S0-02 → S0-03 → S0-04 → S0-05 → S0-06 → S0-07
Sprint 1 (semana 2): S1-01 → S1-02 → S1-03 → S1-04 → S1-05 → S1-06
Sprint 2 (semana 3): S2-01, S2-04, S2-05, S2-06 (XS tasks em paralelo) → S2-02 → S2-03 → S2-07 → S2-08
Sprint 3 (semana 4): S3-01 → S3-02 → S3-03 → S3-04
Wave 2+: conforme roadmap
```

**MVP está pronto ao final do Sprint 2** — todos os critérios de aceite de `requirements.md` seção 6 satisfeitos.
