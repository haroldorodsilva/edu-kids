# Plano de Implementação: Padronização do App DigiLetras

## Visão Geral

Migração incremental em 5 fases: tokens CSS → componentes compartilhados → migração de jogos → padronização de dados/rotas → reorganização de pastas. Cada fase é independente e verificável. Todos os 95 testes existentes devem continuar passando após cada fase.

## Tarefas

- [x] 1. Fase 1 — Tokens CSS e classes utilitárias
  - [x] 1.1 Adicionar tokens de espaçamento e transição ao `index.css`
    - Adicionar variáveis `--spacing-xs` (4px), `--spacing-sm` (8px), `--spacing-md` (16px), `--spacing-lg` (24px), `--spacing-xl` (32px), `--spacing-2xl` (48px) em `:root`
    - Adicionar variáveis `--transition-fast` (0.15s ease), `--transition-normal` (0.3s ease) em `:root`
    - _Requisitos: 1.1, 1.3, 1.4_

  - [x] 1.2 Criar classes de feedback visual no `index.css`
    - Adicionar classe `.ds-feedback-correct` com `background-color: #C8E6C9`, `border-color: var(--color-success)`, `color: #2E7D32`
    - Adicionar classe `.ds-feedback-wrong` com `background-color: #FFCDD2`, `border-color: var(--color-danger)`, `color: #C62828`
    - Adicionar atributos de acessibilidade padrão via CSS (min touch target 44x44 em `.ds-btn`)
    - _Requisitos: 3.4, 8.1, 13.2_

- [x] 2. Fase 2 — Componentes compartilhados e hooks
  - [x] 2.1 Criar componente `ScreenHeader` em `shared/components/ScreenHeader.tsx`
    - Implementar interface `ScreenHeaderProps` com `title`, `emoji`, `onBack`, `gradient?`, `subtitle?`, `actions?`
    - Header sticky com gradiente, botão voltar usando `ds-btn-icon` com `aria-label="Voltar"` e min 44x44px
    - Usar tokens do DS para padding, sombra e tipografia
    - _Requisitos: 6.1, 6.2, 6.3, 6.4_

  - [x] 2.2 Escrever teste de propriedade para ScreenHeader
    - **Propriedade 3: ScreenHeader renderiza com estrutura e acessibilidade corretas**
    - **Valida: Requisitos 6.1, 6.4**

  - [x] 2.3 Expandir `gameThemes.ts` com campos `gradient` e `textColor`, e tipo `GameId`
    - Adicionar campos `gradient` (string CSS completa) e `textColor` a cada tema em `GAME_THEMES`
    - Atualizar interface `GameTheme` com os novos campos
    - Exportar tipo `GameId` derivado via `as const`: `type GameId = (typeof GAME_THEMES)[number]['id']`
    - Atualizar `getTheme` para aceitar `GameId` como parâmetro
    - _Requisitos: 7.1, 7.4, 9.4_

  - [x] 2.4 Escrever testes de propriedade para gameThemes
    - **Propriedade 6: GameThemes possuem todos os campos obrigatórios incluindo gradiente válido**
    - **Valida: Requisitos 7.1, 7.4**
    - **Propriedade 9: Combinações de cores dos temas atendem requisitos de contraste**
    - **Valida: Requisito 13.4**
    - **Propriedade 10: getTheme retorna tema válido para qualquer GameId**
    - **Valida: Requisito 9.4**

  - [x] 2.5 Criar hook `useGameRounds` em `shared/hooks/useGameRounds.ts`
    - Implementar interface genérica `UseGameRoundsOptions<T>` com `pool`, `totalRounds`, `onComplete?`
    - Retornar `current`, `round`, `correct`, `errors`, `done`, `advance(isCorrect)`, `addError()`
    - Documentar com JSDoc descrevendo propósito, parâmetros e retorno
    - Marcar `useGameSession` como `@deprecated` com comentário apontando para `useGameRounds`
    - _Requisitos: 12.1, 12.2, 12.4_

  - [x] 2.6 Escrever teste de propriedade para useGameRounds
    - **Propriedade 7: useGameRounds gerencia progressão de rodadas corretamente**
    - **Valida: Requisito 12.1**

  - [x] 2.7 Criar componente `GameLayout` em `shared/components/GameLayout.tsx`
    - Implementar interface `GameLayoutProps` com `gameId`, `onBack`, `currentRound`, `totalRounds`, `done`, `score?`, `onNext?`, `children`
    - Usar `getTheme(gameId)` para obter cores do tema
    - Renderizar `ScreenHeader` com emoji, label e gradient do tema
    - Renderizar `ProgressBar` com cor do tema
    - Quando `done=true`, renderizar `DoneCard` com score em vez de children
    - Wrapper com classe `ds-screen`
    - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 2.8 Escrever testes de propriedade para GameLayout
    - **Propriedade 1: GameLayout renderiza todos os elementos obrigatórios para qualquer tema**
    - **Valida: Requisitos 2.1, 2.4**
    - **Propriedade 2: GameLayout exibe DoneCard quando concluído**
    - **Valida: Requisito 2.3**

- [x] 3. Checkpoint — Verificar que todos os 95 testes existentes continuam passando
  - Executar `npx vitest run` no diretório `digiletras` e garantir que todos os testes passam
  - Perguntar ao usuário se há dúvidas antes de prosseguir

- [x] 4. Fase 3 — Migração dos jogos para GameLayout e useGameRounds
  - [x] 4.1 Migrar `Syllable.tsx` para usar `GameLayout` e `useGameRounds`
    - Substituir header inline, ProgressBar e DoneCard pelo `GameLayout`
    - Substituir lógica local de rodadas pelo hook `useGameRounds`
    - Substituir estilos inline de feedback por classes `ds-feedback-correct` / `ds-feedback-wrong`
    - Usar `getTheme('syllable')` para cores em vez de valores literais
    - Adicionar `aria-label` em botões que contêm apenas texto curto/emoji
    - _Requisitos: 2.1, 3.1, 3.2, 3.3, 3.5, 7.2, 8.2, 8.3, 12.3, 13.1_

  - [x] 4.2 Migrar `Quiz.tsx` para usar `GameLayout` e `useGameRounds`
    - Mesma abordagem de 4.1: substituir header, progresso, DoneCard e lógica de rodadas
    - Substituir cores literais `#E91E63`, `#C8E6C9`, `#FFCDD2` por tokens/classes do DS
    - Adicionar `role="status"` e `aria-live="polite"` no container de feedback
    - _Requisitos: 2.1, 3.1, 3.2, 3.3, 3.5, 7.2, 8.2, 8.3, 12.3, 13.1, 13.3_

  - [x] 4.3 Migrar `Fill.tsx` para usar `GameLayout` e `useGameRounds`
    - Substituir header, progresso, DoneCard e lógica de rodadas
    - Substituir estilos inline por classes do DS
    - _Requisitos: 2.1, 3.1, 3.2, 3.3, 7.2, 12.3_

  - [x] 4.4 Migrar `Write.tsx` para usar `GameLayout` e `useGameRounds`
    - Substituir header, progresso, DoneCard e lógica de rodadas
    - Substituir estilos inline por classes do DS
    - _Requisitos: 2.1, 3.1, 3.2, 3.3, 7.2, 12.3_

  - [x] 4.5 Migrar `FirstLetter.tsx` para usar `GameLayout` e `useGameRounds`
    - Substituir header, progresso, DoneCard e lógica de rodadas
    - Substituir estilos inline por classes do DS
    - _Requisitos: 2.1, 3.1, 3.2, 3.3, 7.2, 12.3_

  - [x] 4.6 Migrar `Memory.tsx` para usar `GameLayout`
    - Memory não usa rodadas lineares — usar apenas `GameLayout` para header e DoneCard
    - Substituir estilos inline por classes do DS
    - _Requisitos: 2.1, 3.1, 3.2, 3.3, 7.2_

  - [x] 4.7 Migrar `BuildSentence.tsx` para usar `GameLayout`
    - Substituir header, progresso e DoneCard pelo `GameLayout`
    - Substituir estilos inline por classes do DS
    - _Requisitos: 2.1, 3.1, 3.2, 3.3, 7.2_

  - [x] 4.8 Migrar `MatchGame.tsx` para usar `GameLayout`
    - Substituir header e DoneCard pelo `GameLayout`
    - Substituir estilos inline por classes do DS
    - _Requisitos: 2.1, 3.1, 3.2, 3.3, 7.2_

  - [x] 4.9 Migrar `Coloring.tsx` para usar `GameLayout`
    - Substituir header pelo `GameLayout` (Coloring pode não ter rodadas)
    - Substituir estilos inline por classes do DS
    - _Requisitos: 2.1, 3.1, 3.2, 3.3, 7.2_

  - [x] 4.10 Escrever testes de propriedade para acessibilidade dos jogos migrados
    - **Propriedade 8: Elementos interativos possuem atributos de acessibilidade**
    - **Valida: Requisitos 13.1, 13.3**

- [x] 5. Checkpoint — Verificar que todos os testes passam após migração dos jogos
  - Executar `npx vitest run` no diretório `digiletras` e garantir que todos os testes passam
  - Perguntar ao usuário se há dúvidas antes de prosseguir

- [x] 6. Fase 4 — Padronização de dados e refatoração de rotas
  - [x] 6.1 Padronizar interfaces e dados em `words.ts`, `stories.ts`, `sentences.ts`, `matchGames.ts`
    - Atualizar interface `Story` para tornar `theme` obrigatório
    - Adicionar campo `difficulty: 1 | 2 | 3` à interface `Sentence`
    - Renomear `name` → `title` e `type` → `mode` na interface `MatchGame`, adicionar `difficulty`
    - Aplicar `as const satisfies readonly T[]` nos arrays de dados estáticos
    - Migrar IDs para prefixos consistentes (`w-`, `s-`, `f-`, `mg-`) onde necessário
    - Atualizar todas as referências aos campos renomeados no restante do código
    - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 6.2 Escrever testes de propriedade para módulos de dados
    - **Propriedade 5: Módulos de dados possuem todos os campos obrigatórios e IDs com prefixo correto**
    - **Valida: Requisitos 5.1, 5.2, 5.3, 5.4, 5.6**

  - [x] 6.3 Criar componente genérico `GameRoute` e refatorar `App.tsx`
    - Criar interface `GameRouteConfig` com `id`, `component`, `noWordPool?`
    - Criar array `GAME_ROUTES` com configuração de todos os 9 jogos
    - Criar componente `GameRoute` que conecta Router → Game Component via config
    - Substituir os 9 route wrappers individuais pelo mapeamento de `GAME_ROUTES`
    - Manter tipagem TypeScript correta para todas as props
    - _Requisitos: 4.1, 4.2, 4.3, 4.4_

  - [x] 6.4 Escrever testes de propriedade para GameRoute
    - **Propriedade 4: GameRoute renderiza o componente correto com props corretas**
    - **Valida: Requisitos 4.1, 4.4**

  - [x] 6.5 Criar tipo compartilhado `GameComponentProps` em `shared/types.ts`
    - Definir interface `GameComponentProps` com `onBack`, `wordPool?`, `rounds?`, `onComplete?`
    - Exportar tipo `GameId` (re-export de gameThemes)
    - Atualizar todos os Game Components para usar `GameComponentProps` como base de suas props
    - _Requisitos: 9.2, 9.3, 9.4_

  - [x] 6.6 Migrar `FreePlayScreen.tsx` para usar `ScreenHeader` e tokens do DS
    - Substituir header inline pelo componente `ScreenHeader`
    - Substituir estilos inline dos category pills e game cards por classes do DS
    - Usar dados de `gameThemes.ts` exclusivamente para cores e ícones dos cards
    - _Requisitos: 3.1, 3.2, 6.1, 7.3_

  - [x] 6.7 Migrar `DoneCard.tsx` para usar classes do DS
    - Substituir estilos inline e classes Tailwind por classes do DS (`ds-card`, `ds-btn-primary`, `ds-btn-ghost`)
    - Usar tokens de cor e gradiente do DS
    - _Requisitos: 3.1, 3.2_

- [x] 7. Checkpoint — Verificar que todos os testes passam após padronização de dados e rotas
  - Executar `npx vitest run` no diretório `digiletras` e garantir que todos os testes passam
  - Perguntar ao usuário se há dúvidas antes de prosseguir

- [x] 8. Fase 5 — Migração do Admin e organização de arquivos
  - [x] 8.1 Migrar telas do Admin para usar `ScreenHeader` e classes do DS
    - Substituir header inline do `AdminPanel.tsx` pelo `ScreenHeader`
    - Substituir estilos inline do `TrackEditor.tsx` (header em `App.tsx`) pelo `ScreenHeader`
    - Usar classes `ds-input`, `ds-btn`, `ds-card` nos formulários e listagens do admin
    - _Requisitos: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [x] 8.2 Habilitar `strict: true` no `tsconfig.app.json`
    - Ativar `strict: true` e corrigir erros de tipo resultantes
    - Adicionar comentários explicativos em type assertions (`as`) necessárias
    - _Requisitos: 9.1, 9.5_

  - [x] 8.3 Reorganizar `shared/components/` em subpastas por categoria
    - Criar subpastas `layout/` (ScreenHeader, GameLayout), `feedback/` (DoneCard, ProgressBar), `ui/` (Bubbles, OnScreenKeyboard)
    - Mover componentes para as subpastas correspondentes
    - Criar arquivo `index.ts` em cada subpasta re-exportando os componentes
    - Atualizar todos os imports no projeto
    - _Requisitos: 10.1, 10.2, 10.3_

  - [x] 8.4 Criar arquivo `shared/types.ts` consolidado
    - Mover tipos compartilhados (`GameId`, `GameComponentProps`) para `shared/types.ts`
    - Manter tipos co-localizados onde fizer sentido (ex: `tracks/types.ts` permanece)
    - Atualizar imports
    - _Requisito: 10.4_

- [x] 9. Checkpoint final — Verificar que todos os testes passam e a aplicação compila sem erros
  - Executar `npx vitest run` no diretório `digiletras` e garantir que todos os testes passam
  - Verificar compilação com `npx tsc --noEmit`
  - Perguntar ao usuário se há dúvidas

## Notas

- Tarefas marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Cada tarefa referencia requisitos específicos para rastreabilidade
- Checkpoints garantem validação incremental
- Testes de propriedade validam propriedades universais de corretude
- A migração de cada jogo (tarefas 4.1–4.9) é independente — podem ser feitas em qualquer ordem
