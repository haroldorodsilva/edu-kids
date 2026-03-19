# Documento de Requisitos — Trilhas de Aprendizado Gamificadas por Faixa Etária

## Introdução

Este documento especifica o sistema de trilhas de aprendizado gamificadas para o DigiLetras, organizando jogos e atividades por faixa etária (3–4, 5–6, 7–8 anos). O sistema inclui rotação automática de jogos para evitar repetição, progressão adaptada ao nível da criança, modelos de dados preparados para integração futura com backend, e um painel administrativo completo para criação e gerenciamento de atividades. A arquitetura é inspirada em plataformas de referência como Khan Academy Kids, Duolingo ABC, Lingokids e Teach Your Monster to Read.

## Glossário

- **Sistema_Trilhas**: Módulo responsável por organizar e exibir as trilhas de aprendizado por faixa etária
- **Seletor_Idade**: Componente de interface que permite selecionar a faixa etária da criança
- **Motor_Rotação**: Algoritmo que seleciona e alterna jogos dentro de uma trilha para evitar repetição
- **Trilha**: Sequência ordenada de unidades temáticas contendo lições e atividades, associada a uma faixa etária
- **Faixa_Etária**: Agrupamento de idade (3–4 anos, 5–6 anos, 7–8 anos) que determina o conteúdo e dificuldade
- **Unidade**: Grupo temático dentro de uma trilha (ex: "Animais", "Cores") contendo lições
- **Lição**: Conjunto de atividades sequenciais dentro de uma unidade
- **Atividade**: Instância de um jogo configurada com conteúdo específico (palavras, frases, etc.)
- **Sessão**: Período contínuo de uso do app por uma criança
- **Admin_Trilhas**: Módulo do painel administrativo para criação e edição de trilhas e atividades
- **Modelo_Dados**: Estrutura TypeScript que define tipos e interfaces para trilhas, preparada para serialização JSON
- **Camada_Dados**: Módulo de acesso a dados que abstrai localStorage/sessionStorage, preparado para substituição por API REST
- **PathScreen_Idade**: Tela de mapa de progresso adaptada à faixa etária selecionada
- **Tela_Seleção**: Tela inicial onde a criança ou responsável escolhe a faixa etária

## Requisitos

### Requisito 1: Seleção de Faixa Etária

**User Story:** Como responsável, eu quero selecionar a faixa etária da criança, para que o conteúdo seja adequado ao nível de desenvolvimento dela.

#### Critérios de Aceitação

1. WHEN o app é aberto pela primeira vez, THE Tela_Seleção SHALL exibir 3 opções de faixa etária representadas por ícones grandes e cores distintas: 3–4 anos (🧒 verde), 5–6 anos (👦 azul), 7–8 anos (👧 roxo)
2. WHEN o responsável seleciona uma faixa etária, THE Sistema_Trilhas SHALL armazenar a seleção em localStorage e navegar para a PathScreen_Idade correspondente
3. WHEN o app é aberto com uma faixa etária já selecionada, THE Sistema_Trilhas SHALL carregar diretamente a PathScreen_Idade da faixa salva
4. THE Tela_Seleção SHALL exibir um botão discreto para trocar a faixa etária acessível a partir de qualquer tela principal
5. WHEN a faixa etária é alterada, THE Sistema_Trilhas SHALL manter o progresso de todas as faixas separadamente
6. THE Tela_Seleção SHALL utilizar navegação exclusivamente por ícones e emojis, sem depender de texto para crianças que ainda não leem

### Requisito 2: Estrutura de Trilhas por Faixa Etária

**User Story:** Como criança, eu quero ver uma trilha de aprendizado adequada à minha idade, para que eu aprenda no ritmo certo.

#### Critérios de Aceitação

1. THE Sistema_Trilhas SHALL organizar o conteúdo em 3 trilhas distintas, uma para cada faixa etária
2. WHEN a faixa 3–4 anos é selecionada, THE Sistema_Trilhas SHALL exibir trilha focada em reconhecimento de letras, cores, formas, contagem de 1 a 10, e associação imagem-palavra com palavras de nível 1 (dissílabos simples)
3. WHEN a faixa 5–6 anos é selecionada, THE Sistema_Trilhas SHALL exibir trilha focada em sílabas, leitura de palavras simples, escrita guiada, contagem de 1 a 20, e histórias de nível 1 e 2
4. WHEN a faixa 7–8 anos é selecionada, THE Sistema_Trilhas SHALL exibir trilha focada em leitura fluente, escrita autônoma, montagem de frases, histórias de nível 2 e 3, e operações matemáticas básicas (adição e subtração até 20)
5. THE Sistema_Trilhas SHALL organizar cada trilha em unidades temáticas contendo entre 3 e 5 lições cada
6. THE Sistema_Trilhas SHALL incluir pelo menos 3 unidades de exemplo pré-configuradas para cada faixa etária

### Requisito 3: Rotação Automática de Jogos

**User Story:** Como criança, eu quero que os jogos variem a cada vez que eu entro, para que a experiência não fique repetitiva.

#### Critérios de Aceitação

1. WHEN uma lição é iniciada, THE Motor_Rotação SHALL selecionar atividades variando o tipo de jogo em relação à sessão anterior da mesma lição
2. THE Motor_Rotação SHALL registrar em localStorage os últimos 5 jogos realizados por lição e priorizar tipos de jogo ainda não jogados recentemente
3. WHEN todos os tipos de jogo disponíveis para uma lição já foram jogados, THE Motor_Rotação SHALL reiniciar o ciclo de rotação com ordem embaralhada
4. THE Motor_Rotação SHALL manter o pool de palavras/frases consistente com a lição, variando apenas o tipo de jogo (quiz, sílabas, completar, memória, escrever, letra inicial, montar frase)
5. IF o Motor_Rotação não conseguir determinar um jogo diferente do anterior, THEN THE Motor_Rotação SHALL selecionar aleatoriamente entre todos os tipos disponíveis para a lição

### Requisito 4: Conteúdo de Contagem e Matemática Básica

**User Story:** Como criança, eu quero aprender a contar e fazer contas simples de forma lúdica, para que eu desenvolva habilidades numéricas junto com a leitura.

#### Critérios de Aceitação

1. WHEN a faixa 3–4 anos é selecionada, THE Sistema_Trilhas SHALL incluir atividades de contagem de 1 a 10 usando o jogo MatchGame no modo "count" com emojis de objetos
2. WHEN a faixa 5–6 anos é selecionada, THE Sistema_Trilhas SHALL incluir atividades de contagem de 1 a 20 e reconhecimento de números escritos por extenso
3. WHEN a faixa 7–8 anos é selecionada, THE Sistema_Trilhas SHALL incluir atividades de adição e subtração simples (resultados até 20) usando o jogo MatchGame no modo "type"
4. THE Sistema_Trilhas SHALL incluir pelo menos 5 conjuntos de pares pré-configurados para atividades de contagem em cada faixa etária
5. THE Sistema_Trilhas SHALL reutilizar o componente MatchGame existente para atividades numéricas, configurando-o com pares apropriados à faixa etária

### Requisito 5: Modelo de Dados Preparado para Backend

**User Story:** Como desenvolvedor, eu quero que a estrutura de dados seja organizada e tipada, para que a integração futura com backend seja simples e direta.

#### Critérios de Aceitação

1. THE Modelo_Dados SHALL definir interfaces TypeScript para AgeGroup, Track, TrackUnit, TrackLesson, TrackActivity, e TrackProgress com campos id, timestamps, e referências por ID
2. THE Modelo_Dados SHALL utilizar IDs string únicos em todas as entidades para compatibilidade com UUIDs de banco de dados
3. THE Camada_Dados SHALL implementar funções CRUD (getTracks, getTrackById, saveTrackProgress, getTrackProgress) que operam sobre localStorage
4. THE Camada_Dados SHALL encapsular todo acesso a localStorage em um módulo único (trackStore.ts), permitindo substituição futura por chamadas HTTP sem alterar componentes
5. THE Modelo_Dados SHALL incluir campo "version" nas estruturas persistidas para permitir migrações de schema futuras
6. FOR ALL objetos Track salvos em localStorage, serializar para JSON e deserializar de volta SHALL produzir um objeto equivalente ao original (propriedade round-trip)

### Requisito 6: Layout de Navegação por Paths

**User Story:** Como criança, eu quero navegar facilmente entre as telas usando caminhos visuais simples, para que eu consiga usar o app sozinha.

#### Critérios de Aceitação

1. THE PathScreen_Idade SHALL exibir o mapa de progresso no estilo do PathScreen existente, adaptado com cores e emojis da faixa etária selecionada
2. THE PathScreen_Idade SHALL exibir o nome da trilha e faixa etária no cabeçalho com ícone correspondente
3. WHEN uma lição é completada, THE PathScreen_Idade SHALL desbloquear a próxima lição com animação visual de desbloqueio
4. THE PathScreen_Idade SHALL exibir estrelas (1–3) nas lições completadas, visíveis no mapa
5. THE Sistema_Trilhas SHALL manter a navegação em no máximo 3 toques para chegar a qualquer atividade: Seleção de Idade → Mapa da Trilha → Lição
6. THE PathScreen_Idade SHALL incluir botão "Jogar Livre" que navega para a FreePlayScreen existente, mantendo o filtro de palavras adequado à faixa etária

### Requisito 7: Painel Admin para Gerenciamento de Trilhas

**User Story:** Como administrador, eu quero criar e editar trilhas e atividades pelo painel, para que eu possa personalizar o conteúdo sem alterar código.

#### Critérios de Aceitação

1. THE Admin_Trilhas SHALL exibir uma nova aba "Trilhas" no AdminPanel com listagem de todas as trilhas organizadas por faixa etária
2. WHEN o administrador cria uma nova trilha, THE Admin_Trilhas SHALL exibir formulário com campos: nome, faixa etária, emoji, cor temática, e lista de unidades
3. WHEN o administrador edita uma unidade, THE Admin_Trilhas SHALL permitir adicionar, remover e reordenar lições dentro da unidade
4. WHEN o administrador edita uma lição, THE Admin_Trilhas SHALL permitir configurar atividades selecionando tipo de jogo, pool de palavras (por filtro de dificuldade e categoria), e número de rodadas
5. THE Admin_Trilhas SHALL validar que cada lição contenha pelo menos 1 atividade antes de salvar
6. THE Admin_Trilhas SHALL permitir duplicar trilhas existentes como base para novas trilhas
7. IF o administrador tenta excluir uma trilha com progresso de alunos associado, THEN THE Admin_Trilhas SHALL exibir aviso de confirmação informando que o progresso será mantido mas a trilha ficará inacessível

### Requisito 8: Trilhas de Exemplo Pré-configuradas

**User Story:** Como usuário, eu quero que o app já venha com trilhas prontas para usar, para que eu possa começar imediatamente sem configuração.

#### Critérios de Aceitação

1. THE Sistema_Trilhas SHALL incluir trilha de exemplo para faixa 3–4 anos com 3 unidades: "Primeiras Letras" (reconhecimento A–E com quiz e memória), "Cores e Formas" (associação cor-nome com matchgame), "Contar até 5" (contagem com matchgame count)
2. THE Sistema_Trilhas SHALL incluir trilha de exemplo para faixa 5–6 anos com 3 unidades: "Sílabas Simples" (famílias BA-CA-DA com sílabas e completar), "Ler e Escrever" (palavras nível 1 com escrever e quiz), "Números até 10" (contagem e escrita de números)
3. THE Sistema_Trilhas SHALL incluir trilha de exemplo para faixa 7–8 anos com 3 unidades: "Leitura Fluente" (palavras nível 2–3 com escrever e completar), "Montar Frases" (frases com buildsentence e histórias), "Matemática" (adição e subtração com matchgame type)
4. THE Sistema_Trilhas SHALL marcar trilhas de exemplo como "padrão" para diferenciá-las de trilhas criadas pelo administrador
5. WHEN o app é iniciado pela primeira vez, THE Sistema_Trilhas SHALL carregar as trilhas de exemplo automaticamente sem necessidade de ação do usuário

### Requisito 9: Persistência e Serialização de Dados

**User Story:** Como desenvolvedor, eu quero que os dados de trilhas e progresso sejam serializados de forma consistente, para que a migração para backend seja confiável.

#### Critérios de Aceitação

1. THE Camada_Dados SHALL serializar todas as trilhas e progresso em formato JSON para localStorage
2. THE Camada_Dados SHALL implementar função de exportação que gera JSON completo de todas as trilhas e progresso
3. THE Camada_Dados SHALL implementar função de importação que valida e carrega JSON de trilhas
4. FOR ALL objetos TrackProgress salvos, serializar para JSON e deserializar de volta SHALL produzir um objeto equivalente ao original (propriedade round-trip)
5. IF dados corrompidos são encontrados no localStorage, THEN THE Camada_Dados SHALL retornar os dados padrão (trilhas de exemplo) e registrar aviso no console
6. THE Camada_Dados SHALL utilizar chaves de localStorage com prefixo "digiletras_tracks_" para evitar conflitos com dados existentes do app
