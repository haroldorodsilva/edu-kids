# Documento de Requisitos — Padronização do App DigiLetras

## Introdução

O DigiLetras é um aplicativo educacional de alfabetização para crianças de 3 a 8 anos em português brasileiro. O app cresceu organicamente e acumulou inconsistências de estilo, duplicação de padrões entre componentes de jogos, estruturas de dados heterogêneas e ausência de um design system efetivamente aplicado. Este documento define os requisitos para padronizar e organizar o código, melhorando a manutenibilidade, consistência visual e experiência do desenvolvedor.

## Glossário

- **Design_System**: Conjunto de tokens CSS (variáveis), classes utilitárias e componentes compartilhados que definem a identidade visual do DigiLetras
- **Token**: Variável CSS definida em `:root` no `index.css` que representa uma decisão de design (cor, espaçamento, raio de borda, tipografia)
- **Game_Component**: Componente React que implementa um jogo educativo (Quiz, Memory, Syllable, Fill, Write, FirstLetter, BuildSentence, MatchGame, Coloring)
- **Game_Layout**: Componente wrapper compartilhado que fornece a estrutura visual padrão de um jogo (header com botão voltar, barra de progresso, área de conteúdo, tela de conclusão)
- **Route_Wrapper**: Componente funcional em `App.tsx` que conecta o React Router a um componente de jogo ou tela, passando props de navegação
- **Data_Module**: Arquivo TypeScript em `shared/data/` que exporta dados estáticos (words, stories, sentences, matchGames, coloringSheets, gameThemes)
- **Inline_Style**: Objeto de estilo CSS passado diretamente via prop `style` em JSX, em vez de usar classes CSS ou tokens do Design_System
- **Shared_Component**: Componente React reutilizável localizado em `shared/components/`

## Requisitos

### Requisito 1: Design System — Tokens e Variáveis CSS

**User Story:** Como desenvolvedor, eu quero que todos os valores visuais (cores, espaçamentos, raios, sombras, tipografia) sejam definidos como tokens CSS centralizados, para que mudanças de tema sejam feitas em um único lugar.

#### Critérios de Aceitação

1. THE Design_System SHALL definir todos os tokens de cor, espaçamento, raio de borda, sombra e tipografia como variáveis CSS em `:root` no arquivo `index.css`
2. WHEN um Game_Component ou Shared_Component renderizar elementos visuais, THE Game_Component SHALL utilizar exclusivamente tokens do Design_System para valores de cor, raio de borda e sombra
3. THE Design_System SHALL definir tokens de espaçamento padronizados (`--spacing-xs`, `--spacing-sm`, `--spacing-md`, `--spacing-lg`, `--spacing-xl`) para uso consistente em padding e margin
4. THE Design_System SHALL definir tokens de transição e animação (`--transition-fast`, `--transition-normal`) para uso consistente em efeitos visuais
5. IF um componente utilizar um valor de cor hexadecimal literal em vez de um token do Design_System, THEN o linter SHALL reportar um aviso


### Requisito 2: Componente de Layout Compartilhado para Jogos

**User Story:** Como desenvolvedor, eu quero um componente de layout padrão para jogos, para que todos os jogos tenham a mesma estrutura visual (header, progresso, conteúdo, tela de conclusão) sem duplicação de código.

#### Critérios de Aceitação

1. THE Game_Layout SHALL renderizar um header com botão de voltar, título do jogo (emoji + nome) e barra de progresso
2. THE Game_Layout SHALL aceitar props para `title`, `emoji`, `themeColor`, `onBack`, `currentRound`, `totalRounds` e `children`
3. WHEN todas as rodadas de um jogo forem completadas, THE Game_Layout SHALL exibir o Shared_Component DoneCard com a pontuação do jogador
4. THE Game_Layout SHALL aplicar o gradiente de fundo correspondente ao tema do jogo usando tokens do Design_System
5. WHEN o Game_Layout renderizar o botão de voltar, THE Game_Layout SHALL utilizar a classe `ds-btn-icon` do Design_System em vez de estilos inline

### Requisito 3: Eliminação de Estilos Inline nos Componentes de Jogo

**User Story:** Como desenvolvedor, eu quero que os componentes de jogo usem classes CSS do design system em vez de estilos inline, para que a manutenção visual seja centralizada e consistente.

#### Critérios de Aceitação

1. WHEN um Game_Component renderizar botões de ação, THE Game_Component SHALL utilizar classes do Design_System (`ds-btn`, `ds-btn-primary`, `ds-btn-accent`, `ds-btn-ghost`, `ds-btn-icon`) em vez de objetos de estilo inline
2. WHEN um Game_Component renderizar cards ou containers, THE Game_Component SHALL utilizar classes do Design_System (`ds-card`, `ds-card-elevated`) em vez de definir `background`, `borderRadius`, `boxShadow` e `border` inline
3. WHEN um Game_Component renderizar a tela principal, THE Game_Component SHALL utilizar a classe `ds-screen` do Design_System para o wrapper de tela
4. THE Design_System SHALL fornecer classes utilitárias para feedback visual de acerto (`ds-feedback-correct`) e erro (`ds-feedback-wrong`) com cores e animações padronizadas
5. WHEN um Game_Component exibir feedback de resposta correta ou incorreta, THE Game_Component SHALL utilizar as classes `ds-feedback-correct` ou `ds-feedback-wrong` do Design_System


### Requisito 4: Refatoração dos Route Wrappers

**User Story:** Como desenvolvedor, eu quero eliminar a repetição dos route wrappers em `App.tsx`, para que adicionar um novo jogo ao app exija mudanças mínimas no roteamento.

#### Critérios de Aceitação

1. THE App SHALL utilizar um componente genérico `GameRoute` que conecte automaticamente o React Router a qualquer Game_Component, passando `onBack`, `wordPool` e `onComplete` como props
2. WHEN um novo jogo for adicionado ao app, THE App SHALL requerer apenas a adição de uma entrada na configuração de rotas, sem a criação de um novo Route_Wrapper dedicado
3. THE App SHALL manter a tipagem TypeScript correta para todas as props passadas aos Game_Components através do componente genérico `GameRoute`
4. WHEN o usuário navegar para uma rota de jogo no modo freeplay, THE GameRoute SHALL extrair o `wordPool` do estado de navegação e passá-lo ao Game_Component correspondente

### Requisito 5: Padronização das Estruturas de Dados

**User Story:** Como desenvolvedor, eu quero que todos os módulos de dados sigam uma estrutura consistente, para que seja fácil entender, validar e estender os dados do app.

#### Critérios de Aceitação

1. THE Data_Module de words SHALL exportar uma interface `Word` com campos obrigatórios `id`, `word`, `syllables`, `difficulty`, `category` e `emoji`, todos com tipos explícitos
2. THE Data_Module de stories SHALL exportar uma interface `Story` com campos obrigatórios `id`, `title`, `emoji`, `sentences`, `difficulty` e `theme`, todos com tipos explícitos
3. THE Data_Module de sentences SHALL exportar uma interface `Sentence` com campos obrigatórios `id`, `text`, `words` e um campo `difficulty` com tipo `1 | 2 | 3`
4. THE Data_Module de matchGames SHALL exportar uma interface `MatchGame` com campos obrigatórios `id`, `title`, `mode`, `pairs` e `difficulty`, todos com tipos explícitos
5. WHEN um Data_Module exportar dados estáticos, THE Data_Module SHALL utilizar o tipo `as const satisfies readonly T[]` para garantir inferência de tipo literal e validação em tempo de compilação
6. THE Data_Module SHALL utilizar IDs com prefixo consistente por tipo de dado (`w-` para words, `s-` para stories, `f-` para sentences, `mg-` para matchGames)


### Requisito 6: Componentes Compartilhados de Header e Navegação

**User Story:** Como desenvolvedor, eu quero componentes de header e navegação reutilizáveis, para que todas as telas do app tenham uma aparência e comportamento consistentes.

#### Critérios de Aceitação

1. THE Shared_Component `ScreenHeader` SHALL renderizar um header sticky com gradiente, botão de voltar, título (emoji + texto) e área de ações opcionais à direita
2. THE Shared_Component `ScreenHeader` SHALL aceitar props para `title`, `emoji`, `onBack`, `gradientColors` e `actions` (ReactNode opcional)
3. WHEN o Shared_Component `ScreenHeader` for utilizado em qualquer tela, THE ScreenHeader SHALL aplicar os mesmos tokens de padding, sombra e tipografia do Design_System
4. WHEN o Shared_Component `ScreenHeader` renderizar o botão de voltar, THE ScreenHeader SHALL utilizar o padrão de acessibilidade com `aria-label="Voltar"` e tamanho mínimo de toque de 40x40 pixels

### Requisito 7: Sistema de Temas por Jogo

**User Story:** Como desenvolvedor, eu quero que cada jogo tenha um tema visual definido centralmente em `gameThemes.ts`, para que as cores e gradientes de cada jogo sejam consistentes em todas as telas onde aparecem.

#### Critérios de Aceitação

1. THE Data_Module gameThemes SHALL exportar para cada jogo os campos `id`, `icon`, `label`, `color`, `bg`, `gradient` e `textColor`
2. WHEN um Game_Component renderizar sua tela, THE Game_Component SHALL obter suas cores do tema correspondente em `gameThemes.ts` usando a função `getTheme(id)`
3. WHEN a FreePlayScreen renderizar os cards de seleção de jogo, THE FreePlayScreen SHALL utilizar exclusivamente os dados de `gameThemes.ts` para cores e ícones
4. THE Data_Module gameThemes SHALL incluir o campo `gradient` como string CSS completa (ex: `linear-gradient(135deg, #color1, #color2)`) para uso direto nos Game_Components

### Requisito 8: Padronização de Animações e Transições

**User Story:** Como desenvolvedor, eu quero que todas as animações e transições do app usem classes CSS padronizadas, para que o comportamento visual seja consistente e fácil de ajustar.

#### Critérios de Aceitação

1. THE Design_System SHALL definir classes de animação para todos os padrões recorrentes: entrada (`animate-pop`, `animate-pop-up`, `animate-slide-up`, `animate-fade-in`), feedback (`animate-shake`, `animate-bounce-custom`), decoração (`animate-float`, `animate-pulse-scale`, `animate-spin-slow`)
2. WHEN um Game_Component exibir feedback de erro, THE Game_Component SHALL utilizar a classe `animate-shake` do Design_System
3. WHEN um Game_Component exibir feedback de acerto, THE Game_Component SHALL utilizar a classe `animate-pop` do Design_System
4. WHEN um componente aplicar uma transição de hover ou active, THE componente SHALL utilizar os tokens de transição do Design_System (`--transition-fast`, `--transition-normal`) em vez de valores literais


### Requisito 9: Padronização de Tipagem TypeScript

**User Story:** Como desenvolvedor, eu quero que o projeto use tipagem TypeScript estrita e consistente, para que erros sejam detectados em tempo de compilação e o código seja mais seguro.

#### Critérios de Aceitação

1. THE App SHALL habilitar `strict: true` no `tsconfig.app.json` para ativar todas as verificações estritas do TypeScript
2. THE App SHALL definir interfaces explícitas para as props de todos os Game_Components, incluindo `onBack`, `wordPool`, `rounds` e `onComplete`
3. WHEN um Game_Component aceitar props opcionais, THE Game_Component SHALL definir valores padrão explícitos para cada prop opcional
4. THE App SHALL exportar um tipo union `GameId` derivado dos IDs em `gameThemes.ts` para uso em rotas e referências a jogos
5. IF um componente utilizar type assertion (`as`) para contornar erros de tipo, THEN o componente SHALL incluir um comentário explicando a razão da assertion

### Requisito 10: Organização de Arquivos e Estrutura de Pastas

**User Story:** Como desenvolvedor, eu quero que a estrutura de pastas do projeto siga convenções claras, para que seja fácil encontrar e organizar código.

#### Critérios de Aceitação

1. THE App SHALL organizar componentes compartilhados em subpastas por categoria dentro de `shared/components/`: `layout/` (ScreenHeader, GameLayout), `feedback/` (DoneCard, ProgressBar), `ui/` (Bubbles, OnScreenKeyboard)
2. THE App SHALL manter um arquivo `index.ts` em cada subpasta de `shared/components/` que re-exporte todos os componentes da subpasta
3. WHEN um novo Shared_Component for criado, THE desenvolvedor SHALL colocá-lo na subpasta correspondente à sua categoria
4. THE App SHALL manter todos os tipos compartilhados (interfaces, types, enums) em um arquivo `shared/types.ts` ou em arquivos de tipo co-localizados com seus módulos

### Requisito 11: Padronização do Painel Admin

**User Story:** Como desenvolvedor, eu quero que as telas do painel admin sigam o mesmo design system do app principal, para que a experiência visual seja consistente entre o modo jogador e o modo admin.

#### Critérios de Aceitação

1. WHEN o AdminPanel renderizar formulários, THE AdminPanel SHALL utilizar a classe `ds-input` do Design_System para todos os campos de entrada
2. WHEN o AdminPanel renderizar botões de ação, THE AdminPanel SHALL utilizar as classes `ds-btn` do Design_System em vez de estilos inline
3. WHEN o AdminPanel renderizar cards de listagem, THE AdminPanel SHALL utilizar as classes `ds-card` do Design_System
4. THE AdminPanel SHALL utilizar o Shared_Component `ScreenHeader` para o header de todas as telas admin
5. WHEN o TrackEditor renderizar estilos de layout, THE TrackEditor SHALL utilizar tokens do Design_System para cores, raios e sombras em vez de valores literais inline


### Requisito 12: Padronização de Hooks Compartilhados

**User Story:** Como desenvolvedor, eu quero que os hooks compartilhados sigam padrões consistentes de nomenclatura e interface, para que sejam fáceis de descobrir e usar.

#### Critérios de Aceitação

1. THE App SHALL extrair a lógica comum de gerenciamento de rodadas dos Game_Components em um hook compartilhado `useGameRounds` que gerencie `round`, `correct`, `errors`, `done` e `advance`
2. THE hook `useGameRounds` SHALL aceitar parâmetros para `totalRounds`, `onComplete` e `pool`, retornando o estado atual da rodada e funções de controle
3. WHEN um Game_Component utilizar o hook `useGameRounds`, THE Game_Component SHALL delegar toda a lógica de progressão de rodadas ao hook em vez de implementá-la localmente
4. THE App SHALL documentar cada hook compartilhado com um comentário JSDoc descrevendo seu propósito, parâmetros e valor de retorno

### Requisito 13: Acessibilidade Básica

**User Story:** Como desenvolvedor, eu quero que todos os elementos interativos do app tenham atributos de acessibilidade adequados, para que o app seja utilizável com tecnologias assistivas.

#### Critérios de Aceitação

1. WHEN um Game_Component renderizar um botão interativo, THE Game_Component SHALL incluir um atributo `aria-label` descritivo quando o botão contiver apenas emoji ou ícone
2. THE App SHALL garantir que todos os botões interativos tenham tamanho mínimo de toque de 44x44 pixels conforme diretrizes de acessibilidade móvel
3. WHEN um Game_Component exibir feedback visual de acerto ou erro, THE Game_Component SHALL incluir um atributo `role="status"` e `aria-live="polite"` no container de feedback para anunciar mudanças a leitores de tela
4. THE App SHALL garantir contraste mínimo de 4.5:1 entre texto e fundo em todos os elementos de texto dos Game_Components
