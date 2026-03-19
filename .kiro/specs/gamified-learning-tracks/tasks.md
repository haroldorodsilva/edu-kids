# Plano de Implementação: Trilhas de Aprendizado Gamificadas por Faixa Etária

## Visão Geral

Implementação incremental do sistema de trilhas gamificadas para o DigiLetras. A ordem segue: tipos/modelos → camada de dados → algoritmo de rotação → componentes UI → admin → dados de exemplo → integração e testes. Cada tarefa referencia requisitos e propriedades do design.

## Tarefas

- [x] 1. Definir tipos e interfaces do sistema de trilhas
  - [x] 1.1 Criar `digiletras/src/shared/tracks/types.ts` com todas as interfaces: `AgeGroup`, `TrackGameType`, `TrackActivity`, `TrackLesson`, `TrackUnit`, `Track`, `TrackLessonResult`, `TrackProgress`, `RotationHistory`
    - Incluir campos `id`, `version`, timestamps (`createdAt`, `updatedAt`) conforme design
    - Usar IDs string únicos em todas as entidades
    - _Requisitos: 5.1, 5.2, 5.5_

  - [x] 1.2 Escrever teste de propriedade para round-trip de serialização dos tipos
    - **Propriedade 2: Consistência round-trip de serialização**
    - **Valida: Requisitos 5.6, 9.4**

- [x] 2. Implementar camada de dados (trackStore)
  - [x] 2.1 Criar `digiletras/src/shared/tracks/trackStore.ts` com funções CRUD para trilhas
    - Implementar `getAllTracks()`, `getTracksByAge()`, `getTrackById()`, `saveTrack()`, `deleteTrack()`
    - Usar chaves localStorage com prefixo `digiletras_tracks_` conforme design
    - Combinar trilhas builtin + custom em `getAllTracks()`
    - Tratar dados corrompidos retornando dados padrão e logando aviso no console
    - _Requisitos: 5.3, 5.4, 9.1, 9.5, 9.6_

  - [x] 2.2 Implementar funções de progresso no `trackStore.ts`
    - Implementar `getTrackProgress()`, `saveTrackLessonResult()` com chaves separadas por faixa etária (`digiletras_tracks_progress_3-4`, etc.)
    - Implementar `getSelectedAge()`, `setSelectedAge()`
    - _Requisitos: 1.2, 1.5, 5.3_

  - [x] 2.3 Implementar funções de rotação no `trackStore.ts`
    - Implementar `getRotationHistory()`, `recordRotation()`
    - Usar chave `digiletras_tracks_rotation`
    - _Requisitos: 3.2_

  - [x] 2.4 Implementar funções de exportação/importação no `trackStore.ts`
    - Implementar `exportAllData()` e `importData()` com validação
    - _Requisitos: 9.2, 9.3_

  - [x] 2.5 Escrever teste de propriedade para idempotência de save/load
    - **Propriedade 1: Idempotência de save/load**
    - **Valida: Requisitos 5.3, 5.4**

  - [x] 2.6 Escrever teste de propriedade para isolamento de progresso por faixa etária
    - **Propriedade 4: Isolamento de progresso por faixa etária**
    - **Valida: Requisitos 1.5**

- [x] 3. Checkpoint — Verificar camada de dados
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

- [x] 4. Implementar motor de rotação de jogos
  - [x] 4.1 Criar `digiletras/src/shared/tracks/rotation.ts` com a função pura `selectNextGame()`
    - Receber `availableTypes`, `recentGames`, `maxHistory` (default 5)
    - Priorizar tipos ainda não jogados recentemente
    - Quando todos os tipos foram jogados, reiniciar ciclo com ordem embaralhada
    - Se não conseguir determinar jogo diferente, selecionar aleatoriamente
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 4.2 Escrever teste de propriedade para não-repetição consecutiva
    - **Propriedade 5: Não-repetição consecutiva**
    - **Valida: Requisitos 3.1, 3.5**

  - [x] 4.3 Escrever teste de propriedade para cobertura completa de tipos
    - **Propriedade 6: Cobertura completa de tipos**
    - **Valida: Requisitos 3.3**

  - [x] 4.4 Escrever teste de propriedade para retorno sempre válido
    - **Propriedade 7: Retorno sempre válido**
    - **Valida: Requisitos 3.5**

- [x] 5. Implementar tela de seleção de faixa etária (AgeSelectorScreen)
  - [x] 5.1 Criar `digiletras/src/features/tracks/AgeSelectorScreen.tsx`
    - Exibir 3 cards grandes com ícones/emojis para faixas 3–4 (🧒 verde), 5–6 (👦 azul), 7–8 (👧 roxo)
    - Navegação exclusivamente por ícones e emojis, sem depender de texto
    - Ao selecionar, salvar em localStorage via `setSelectedAge()` e navegar para `/tracks/:ageGroup`
    - Se já houver faixa salva, redirecionar automaticamente
    - Incluir botão discreto para trocar faixa etária
    - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.6_

  - [x] 5.2 Escrever teste de propriedade para persistência de seleção de idade
    - **Propriedade 3: Persistência de seleção de idade**
    - **Valida: Requisitos 1.2, 1.3**

- [x] 6. Implementar tela de mapa de trilha (TrackPathScreen)
  - [x] 6.1 Criar `digiletras/src/features/tracks/TrackPathScreen.tsx`
    - Seguir estilo visual do `PathScreen` existente (zigzag SVG, nós de lição, banners de unidade)
    - Adaptar cores e emojis conforme faixa etária selecionada
    - Exibir nome da trilha e faixa no cabeçalho com ícone correspondente
    - Exibir estrelas (1–3) nas lições completadas
    - Desbloquear próxima lição ao completar a anterior com animação visual
    - Incluir botão "Jogar Livre" que navega para FreePlayScreen
    - Ler dados de trilhas e progresso via `trackStore`
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 6.2 Escrever teste de propriedade para desbloqueio sequencial de lições
    - **Propriedade 8: Desbloqueio sequencial de lições**
    - **Valida: Requisitos 6.3**

  - [x] 6.3 Escrever teste de propriedade para cálculo de estrelas
    - **Propriedade 9: Cálculo de estrelas**
    - **Valida: Requisitos 6.4**

- [x] 7. Implementar executor de lições da trilha (TrackLessonRunner)
  - [x] 7.1 Criar `digiletras/src/features/tracks/TrackLessonRunner.tsx`
    - Seguir padrão do `LessonRunner` existente, delegando para componentes de jogo via props
    - Ler atividades da estrutura de trilhas (não do `curriculum.ts`)
    - Suportar todos os `TrackGameType`: syllable, quiz, fill, memory, write, firstletter, buildsentence, story, matchgame
    - Exibir barra de progresso de atividades (ActivityProgress)
    - Calcular estrelas (1–3) e XP ao completar
    - Salvar resultado via `saveTrackLessonResult()`
    - Integrar motor de rotação para variar tipo de jogo
    - _Requisitos: 2.1, 3.1, 3.4, 6.3, 6.4_

  - [x] 7.2 Escrever teste de propriedade para XP monotonicamente crescente
    - **Propriedade 10: XP monotonicamente crescente**
    - **Valida: Requisitos 6.4**

- [x] 8. Checkpoint — Verificar componentes de UI
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

- [x] 9. Implementar editor de trilhas no painel admin (TrackEditor)
  - [x] 9.1 Criar `digiletras/src/features/admin/TrackEditor.tsx`
    - Listagem de trilhas organizadas por faixa etária
    - Formulário com campos: nome, faixa etária, emoji, cor temática
    - Editor de unidades com possibilidade de adicionar, remover e reordenar lições
    - Editor de lições: seleção de tipo de jogo, pool de palavras (filtro por dificuldade/categoria), número de rodadas
    - Validar que cada lição tenha pelo menos 1 atividade antes de salvar
    - Permitir duplicar trilhas existentes
    - Aviso de confirmação ao excluir trilha com progresso associado
    - Salvar via `saveTrack()` do trackStore
    - _Requisitos: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [x] 9.2 Escrever teste de propriedade para validação de lição mínima
    - **Propriedade 11: Validação de lição mínima**
    - **Valida: Requisitos 7.5**

  - [x] 9.3 Adicionar aba "Trilhas" no `AdminPanel.tsx`
    - Adicionar entrada `tracks` no array `TABS` e tipo `Tab`
    - Renderizar `TrackEditor` quando aba selecionada
    - _Requisitos: 7.1_

- [x] 10. Criar trilhas de exemplo pré-configuradas
  - [x] 10.1 Criar `digiletras/src/shared/tracks/builtinTracks.ts` com trilhas de exemplo
    - Trilha 3–4 anos: 3 unidades — "Primeiras Letras" (quiz, memória com A–E), "Cores e Formas" (matchgame connect), "Contar até 5" (matchgame count)
    - Trilha 5–6 anos: 3 unidades — "Sílabas Simples" (sílabas, completar com BA-CA-DA), "Ler e Escrever" (escrever, quiz nível 1), "Números até 10" (contagem)
    - Trilha 7–8 anos: 3 unidades — "Leitura Fluente" (escrever, completar nível 2–3), "Montar Frases" (buildsentence, histórias), "Matemática" (matchgame type adição/subtração)
    - Marcar como `builtin: true` para diferenciar de trilhas do admin
    - Cada unidade com 3–5 lições, usando IDs de palavras/frases/histórias existentes
    - Incluir pelo menos 5 conjuntos de pares para atividades de contagem por faixa
    - _Requisitos: 2.2, 2.3, 2.4, 2.5, 2.6, 4.1, 4.2, 4.3, 4.4, 4.5, 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 10.2 Escrever teste de propriedade para integridade das trilhas builtin
    - **Propriedade 12: Integridade das trilhas builtin**
    - **Valida: Requisitos 8.1, 8.2, 8.3, 8.4**

- [x] 11. Integrar rotas e navegação no App.tsx
  - [x] 11.1 Atualizar `digiletras/src/App.tsx` com novas rotas
    - Adicionar rota `/` → `AgeSelectorScreen` (substituir PathRoute como rota raiz)
    - Adicionar rota `/tracks/:ageGroup` → `TrackPathScreen`
    - Adicionar rota `/tracks/:ageGroup/lesson/:trackId/:unitIdx/:lessonIdx` → `TrackLessonRunner`
    - Manter rota `/path` para PathScreen legado
    - Manter todas as rotas existentes de freeplay e admin
    - _Requisitos: 1.2, 1.3, 6.5_

- [x] 12. Checkpoint final — Verificar integração completa
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

## Notas

- Tarefas marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Cada tarefa referencia requisitos específicos para rastreabilidade
- Checkpoints garantem validação incremental
- Testes de propriedade validam propriedades universais de corretude usando fast-check
- Testes unitários validam exemplos específicos e casos de borda
