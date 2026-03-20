# Contribuindo com o DigiLetras

Obrigado pelo interesse em contribuir! 🎉 Este guia vai te ajudar a começar.

## Primeiros Passos

1. Faça um fork do repositório
2. Clone seu fork:
   ```bash
   git clone https://github.com/haroldorodsilva/digiletras.git
   cd digiletras/digiletras
   npm install
   ```
3. Crie uma branch para sua feature/fix:
   ```bash
   git checkout -b minha-feature
   ```

## Desenvolvimento

```bash
# Rodar em modo dev
npm run dev

# Rodar testes
npm test

# Verificar tipos
npx tsc --noEmit

# Build de produção
npm run build

# Lint
npm run lint
```

## Estrutura do Código

```
digiletras/src/
├── features/          # Funcionalidades organizadas por domínio
│   ├── admin/         # Painel administrativo
│   ├── freeplay/      # Modo livre
│   ├── games/         # Componentes de jogo (9 tipos)
│   ├── stories/       # Histórias interativas
│   └── tracks/        # Trilhas gamificadas
└── shared/            # Código compartilhado
    ├── components/    # layout/, feedback/, ui/
    ├── config/        # Configurações (idades, dificuldade)
    ├── data/          # Dados estáticos (palavras, frases)
    ├── hooks/         # React hooks customizados
    ├── tracks/        # Lógica de trilhas e XP
    ├── types.ts       # Tipos TypeScript
    └── utils/         # Funções utilitárias
```

## Convenções

### Código
- TypeScript strict mode — sem `any`
- Componentes de jogo implementam `GameComponentProps`
- CSS usa custom properties do design system (`--color-primary`, `--space-md`, etc.)
- Imports de componentes compartilhados usam subpastas: `shared/components/layout/`, `shared/components/feedback/`, `shared/components/ui/`

### Commits
Usamos mensagens descritivas em português ou inglês:
```
feat: adiciona jogo de rimas
fix: corrige progressão de atividades no TrackLessonRunner
refactor: extrai GameLayout para componente compartilhado
```

### Testes
- Usamos property-based testing com `fast-check` + `vitest`
- Testes ficam em pastas `__tests__/` próximas ao código testado
- Nomeie arquivos de teste como `*.property.test.ts(x)`

## O que Contribuir

### Bom para iniciantes 🟢
- Adicionar novas palavras ao banco (`shared/data/words.ts`)
- Melhorar emojis existentes
- Criar novas histórias (`shared/data/stories.ts`)
- Traduzir textos da interface
- Melhorar acessibilidade

### Intermediário 🟡
- Criar novos temas de jogo (`shared/data/gameThemes.ts`)
- Adicionar novas trilhas por faixa etária
- Melhorar animações e feedback visual
- Adicionar mais testes property-based

### Avançado 🔴
- Implementar novos modos de jogo
- Sistema de dificuldade adaptativa
- PWA offline com cache de áudio
- Backend com Supabase

## Pull Requests

1. Certifique-se que os testes passam: `npm test`
2. Certifique-se que o build funciona: `npm run build`
3. Descreva o que mudou e por quê
4. Inclua screenshots se houver mudanças visuais
5. Referencie issues relacionadas

## Reportando Bugs

Abra uma issue com:
- Descrição do problema
- Passos para reproduzir
- Comportamento esperado vs. atual
- Screenshots (se aplicável)
- Navegador e dispositivo

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a licença MIT do projeto.
