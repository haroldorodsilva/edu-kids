# DigiLetras — Documento de Requisitos

> Versão 1.0 | 2026-03-17 | Status: MVP em desenvolvimento

---

## 1. Visão do Produto

**DigiLetras** é uma aplicação web educacional gamificada para crianças brasileiras de 5–8 anos em processo de alfabetização. Combina aprendizado de leitura em português brasileiro com introdução à digitação por meio de 8 modos de jogo interativos.

**Problema que resolve:**
- Crianças em alfabetização carecem de ferramentas digitais acessíveis sem tutoria constante
- Apps existentes exigem cadastro, menus complexos ou conexão com backend
- Digitação em português (com acentos) raramente é ensinada de forma lúdica

**Proposta de valor:**
- Zero atrito: abre o browser, toca no jogo, joga. Sem login, sem instalação
- Funciona offline como PWA
- Feedback gentil e imediato — a criança nunca é punida, sempre incentivada
- Visual e áudio adequados à faixa etária: emojis, cores vibrantes, sons suaves

---

## 2. Stakeholders

### 2.1 Criança (5–8 anos) — Usuário Primário
- Não sabe ler com fluência no início do uso
- Navega principalmente por toque (tablet) ou mouse (computador escolar)
- Atenção curta: sessões de 5–10 minutos
- Motivada por feedback positivo, emojis, sons e animações
- Necessidades: interface sem texto complexo, ícones grandes, toque responsivo

### 2.2 Responsável / Professor — Usuário Secundário
- Configura o dispositivo e escolhe o app para a criança
- Quer acompanhar progresso sem complexidade técnica
- Pode usar o painel admin para adicionar histórias e ver estatísticas

### 2.3 Desenvolvedor / Mantenedor
- Time pequeno (1–2 pessoas) no MVP
- Necessita de código modular e fácil de estender
- Precisa adicionar novos jogos e palavras sem refatorar o core

---

## 3. Requisitos Funcionais

### RF-HOME — Tela Inicial

| ID | Requisito | Critério de Aceite |
|---|---|---|
| RF-HOME-01 | Exibir 8 jogos em grid 2×4 | Todos os 8 cards visíveis sem scroll em tela 360px+ |
| RF-HOME-02 | Cada card mostra ícone + nome do jogo | Nome legível, fonte mínima 14px bold |
| RF-HOME-03 | Toque no card navega diretamente para o jogo | Transição em < 200ms |
| RF-HOME-04 | Botão Admin discreto no rodapé | Visível mas não proeminente |
| RF-HOME-05 | Background animado com bolhas | Bolhas flutuando sem impactar performance (60fps) |

### RF-SIL — Jogo: Sílabas

| ID | Requisito | Critério de Aceite |
|---|---|---|
| RF-SIL-01 | Mostrar emoji grande da palavra-alvo | Emoji ≥ 64px |
| RF-SIL-02 | Exibir sílabas embaralhadas como botões tocáveis | Botões ≥ 44×44px |
| RF-SIL-03 | Aceitar apenas a sílaba correta na sequência | Sílaba errada: som de erro + shake; não avança |
| RF-SIL-04 | Sílaba correta preenche o slot com cor verde | Animação de preenchimento visível |
| RF-SIL-05 | 5 rodadas por sessão com palavras aleatórias | Palavras com ≥ 2 sílabas do banco |
| RF-SIL-06 | Pronúncia da palavra ao iniciar cada rodada | Web Speech API, pt-BR, rate 0.75 |

### RF-QUI — Jogo: Quiz Visual

| ID | Requisito | Critério de Aceite |
|---|---|---|
| RF-QUI-01 | Mostrar emoji gigante (≥ 80px) como estímulo | Centralizado, impacto visual claro |
| RF-QUI-02 | Exibir 4 opções de palavras em grid 2×2 | 1 correta + 3 distractores aleatórios |
| RF-QUI-03 | Acerto: botão fica verde, avança após 1.2s | Feedback visual imediato (< 100ms) |
| RF-QUI-04 | Erro: botão fica vermelho, correto fica verde | Criança vê qual era a resposta certa |
| RF-QUI-05 | 6 rodadas por sessão | Palavras não se repetem na sessão |
| RF-QUI-06 | Falar a palavra ao iniciar cada rodada | Web Speech API, pt-BR |

### RF-FIL — Jogo: Completar Lacunas

| ID | Requisito | Critério de Aceite |
|---|---|---|
| RF-FIL-01 | Mostrar emoji + palavra com ~40% de letras como lacunas | Lacunas tracejadas, letras reveladas em verde |
| RF-FIL-02 | Lacuna atual pulsa em amarelo com scale 1.15 | Animação contínua enquanto aguarda input |
| RF-FIL-03 | Capturar input por teclado físico OU teclado on-screen | Funcionar em desktop e tablet |
| RF-FIL-04 | Letra correta preenche e avança para próxima lacuna | Transição suave, som agudo |
| RF-FIL-05 | Letra errada: som grave + shake; não avança | Feedback negativo gentil |
| RF-FIL-06 | 5 rodadas por sessão | Palavras aleatórias do banco |

### RF-MEM — Jogo: Memória

| ID | Requisito | Critério de Aceite |
|---|---|---|
| RF-MEM-01 | Cartas começam viradas (fundo roxo com "?") | Grid 4 colunas |
| RF-MEM-02 | Toque vira a carta mostrando emoji + palavra | Animação de virada |
| RF-MEM-03 | Par correto: cartas ficam verdes com opacity 0.7 | Confirmação visual permanente |
| RF-MEM-04 | Par errado: viram de volta após 0.9s | Intervalo de memorização adequado |
| RF-MEM-05 | Progressão de dificuldade por nível (4→5→6→...8 pares) | Botão "Próximo Nível" ao completar |
| RF-MEM-06 | Contador de tentativas visível | Atualizado a cada par tentado |

### RF-ESC — Jogo: Escrever

| ID | Requisito | Critério de Aceite |
|---|---|---|
| RF-ESC-01 | Mostrar apenas emoji como dica (sem letras reveladas) | Emoji ≥ 80px |
| RF-ESC-02 | Slots mostram "_" até serem preenchidos | Slot atual pulsa em amarelo |
| RF-ESC-03 | Capturar input por teclado físico OU teclado on-screen | Funcionar em desktop e tablet |
| RF-ESC-04 | Letra correta preenche em verde, avança | Som agudo |
| RF-ESC-05 | Letra errada: shake + som grave; não avança | Não revela a letra |
| RF-ESC-06 | 6 rodadas por sessão | Palavras aleatórias |

### RF-LET — Jogo: Letra Inicial

| ID | Requisito | Critério de Aceite |
|---|---|---|
| RF-LET-01 | Mostrar emoji + palavra escrita por extenso | Palavra em destaque, fonte ≥ 24px |
| RF-LET-02 | 4 opções de letras maiúsculas em grid 2×2 | Botões com letra ≥ 28px |
| RF-LET-03 | Acerto: verde + som; erro: vermelho + correto em verde | Auto-avança após 1.2s |
| RF-LET-04 | 8 rodadas por sessão | Palavras aleatórias do banco |
| RF-LET-05 | Falar a palavra ao iniciar cada rodada | Web Speech API, pt-BR |

### RF-FRA — Jogo: Montar Frase

| ID | Requisito | Critério de Aceite |
|---|---|---|
| RF-FRA-01 | Exibir slots para cada palavra da frase no topo | Slots tracejados com contagem de palavras |
| RF-FRA-02 | Palavras embaralhadas como botões tocáveis abaixo | Cada palavra como botão independente |
| RF-FRA-03 | Aceitar apenas a próxima palavra correta da sequência | Palavra errada: som grave; não move |
| RF-FRA-04 | Palavra correta vai para o slot com animação | Som agudo, slot fica verde |
| RF-FRA-05 | Ao completar: mostrar frase completa em verde | Feedback de conclusão de frase |
| RF-FRA-06 | 5 rodadas por sessão | Frases aleatórias do banco de frases |

### RF-HIS — Histórias

| ID | Requisito | Critério de Aceite |
|---|---|---|
| RF-HIS-01 | Tela de seleção lista todas as 12 histórias | Título, emoji, nível de dificuldade e prévia |
| RF-HIS-02 | Dois modos: Digitar (karaokê) e Ditado | Botões distintos por modo |
| RF-HIS-03 | Modo Digitar: cada letra é um slot colorido | Cinza=futuro, amarelo=atual, verde=acerto, vermelho=erro |
| RF-HIS-04 | Modo Ditado: frases não aparecem visualmente | Botões "🔊 Ouvir" e "👀 Espiar" disponíveis |
| RF-HIS-05 | Barra de progresso por frase e por história | Atualizada a cada frase completada |
| RF-HIS-06 | Capturar input por teclado físico OU teclado on-screen | Funcionar em desktop e tablet |
| RF-HIS-07 | Tela de conclusão com estatísticas (acertos/erros) | DoneCard com score |

### RF-ADM — Painel Admin

| ID | Requisito | Critério de Aceite |
|---|---|---|
| RF-ADM-01 | Dashboard com métricas reais da sessão | Contadores de palavras, histórias, jogos |
| RF-ADM-02 | Visualizar banco de palavras filtrado por nível | Filtro por 1, 2, 3 ou todos |
| RF-ADM-03 | Visualizar e ler histórias completas | Navegação por história, exibir todas as frases |
| RF-ADM-04 | Gerador de histórias com IA (stub no MVP) | Input de tema, botão gerar, preview |

---

## 4. Requisitos Não-Funcionais

### RNF-PERF — Performance

| ID | Requisito | Critério de Aceite |
|---|---|---|
| RNF-PERF-01 | Feedback ao toque em < 100ms | Animação/som inicia imediatamente |
| RNF-PERF-02 | Animações a 60fps | Sem jank perceptível em dispositivos mid-range |
| RNF-PERF-03 | Build total < 300 KB gzipped | Verificado no `dist/` após `npm run build` |
| RNF-PERF-04 | First Contentful Paint < 2s em 3G | Testado via Lighthouse |

### RNF-COMPAT — Compatibilidade

| ID | Requisito | Critério de Aceite |
|---|---|---|
| RNF-COMPAT-01 | Funcionar em Chrome 90+, Firefox 90+, Safari 14+ | Testado nos 3 browsers |
| RNF-COMPAT-02 | Funcionar em tablet Android 720×1280px | Layout não quebra |
| RNF-COMPAT-03 | Funcionar em iPad (768×1024px) | Layout não quebra |
| RNF-COMPAT-04 | Funcionar em desktop 1280px+ | Layout não quebra |

### RNF-ACCESS — Acessibilidade

| ID | Requisito | Critério de Aceite |
|---|---|---|
| RNF-ACCESS-01 | Área de toque mínima de 44×44px em todos os botões interativos | Verificado via DevTools |
| RNF-ACCESS-02 | Contraste mínimo 4.5:1 (WCAG AA) em texto sobre fundo | Verificado via contrast checker |
| RNF-ACCESS-03 | ARIA labels em botões sem texto descritivo | Botões com só emoji têm aria-label |

### RNF-AUDIO — Áudio

| ID | Requisito | Critério de Aceite |
|---|---|---|
| RNF-AUDIO-01 | Som de feedback em < 50ms após ação | AudioContext singleton pré-criado |
| RNF-AUDIO-02 | Áudio nunca quebra por uso intenso | AudioContext reutilizado, não criado por chamada |
| RNF-AUDIO-03 | App funciona sem áudio (fallback silencioso) | try/catch em todas as chamadas de áudio |

### RNF-OFFLINE — Offline / PWA

| ID | Requisito | Critério de Aceite |
|---|---|---|
| RNF-OFFLINE-01 | App funciona sem conexão após primeira carga | vite-plugin-pwa com strategy "injectManifest" |
| RNF-OFFLINE-02 | Dados do banco (palavras, histórias) disponíveis offline | Compilados no bundle, não em API |

---

## 5. Requisitos de UX Infantil

| ID | Requisito | Justificativa |
|---|---|---|
| RUX-01 | Navegação principal por ícones/emojis, não texto | Criança de 5 anos ainda não lê fluentemente |
| RUX-02 | Nunca mostrar tela de erro punitiva | Evitar frustração; erros são oportunidades de aprender |
| RUX-03 | Feedback positivo sempre presente ao completar | Frases de incentivo aleatórias + animação |
| RUX-04 | Máximo 2 toques para chegar em qualquer jogo | Home → Jogo (1 toque) |
| RUX-05 | Botão "voltar" sempre visível durante o jogo | Criança ou responsável pode sair a qualquer momento |
| RUX-06 | Fontes grandes em todo o app | Mínimo 16px para texto de jogo, 24px+ para letras de treino |
| RUX-07 | Cores vibrantes e emojis em todos os elementos | Engajamento visual da faixa etária |
| RUX-08 | Sons diferentes e distintos para acerto vs. erro | Aprendizado por associação sonora |

---

## 6. Critérios de Aceite do MVP

O MVP está completo quando:

- [ ] Todos os 8 jogos funcionam end-to-end (início → DoneCard → voltar)
- [ ] Todos os jogos funcionam em tablet touch (teclado on-screen implementado)
- [ ] Bug de AudioContext corrigido (100+ cliques rápidos sem quebrar o áudio)
- [ ] Web Speech API com fallback gracioso se voz pt-BR não disponível
- [ ] PWA configurado (funciona offline após primeira carga)
- [ ] Build sem erros TypeScript
- [ ] Todas as 71 palavras, 12 histórias e 12 frases no banco
- [ ] Painel admin acessível e não quebrado
- [ ] Layout funciona em 360px, 768px e 1280px de largura

---

## 7. Fora do Escopo — MVP

- Login / autenticação de qualquer tipo
- Backend ou banco de dados remoto
- Perfis de usuário persistidos
- Relatórios para pais/professores
- Multiplayer
- Vozes premium (Google TTS, ElevenLabs)
- App nativo (React Native / Capacitor)
- Sistema de XP e conquistas
- Adaptação automática de dificuldade
- CRUD completo de palavras no admin
- Gerador IA funcional (fica como stub)

---

## 8. Restrições Técnicas

- Sem API keys expostas no client (gerador IA requer proxy backend)
- Web Speech API: qualidade depende do dispositivo/browser — documentar limitação
- AudioContext: requer interação do usuário antes de criar (política de autoplay do browser)
- Web Speech API: `speechSynthesis.getVoices()` é assíncrono no Chrome (evento `voiceschanged`)
- CSS animations: preferir `transform` e `opacity` para performance de compositing
- Teclado virtual: detectar touch via `navigator.maxTouchPoints > 0` ou media query `(hover: none)`
