# Central do Doce - Gestão de Confeitaria

## Visão geral

O **Central do Doce** é uma interface web de gestão para confeitaria, criada como MVP acadêmico em HTML, CSS e JavaScript puro. O sistema simula o fluxo de uma plataforma real para controle de ingredientes, custos fixos, receitas, cálculo de custo por unidade, precificação sugerida, busca de endereço por CEP e alternância persistente entre modo claro e modo escuro.

O projeto possui login funcional de demonstração, navegação por menu lateral, telas de cadastro/listagem/detalhes, mensagens de feedback e persistência local dos dados usando `localStorage`.

## Tecnologias utilizadas

- **HTML5** para estrutura das telas e formulários.
- **CSS3** para identidade visual, layout, responsividade e dark mode.
- **JavaScript Vanilla** para navegação, CRUD simulado, cálculos, tema e integrações.
- **Flexbox** para alinhamentos, barras, menus, formulários e componentes internos.
- **Grid Layout** para cards, formulários em colunas, painéis e áreas responsivas.
- **Font Awesome** para ícones.
- **LocalStorage** para persistência dos dados do MVP.
- **ViaCEP** como API aberta/grátis para busca de endereço.
- **API Ninjas** representada no fluxo de pesquisa de produto, com resultados simulados para uso acadêmico sem exposição de chave de API.

> O projeto não utiliza Bootstrap. A responsividade foi implementada com CSS próprio usando Flexbox, Grid Layout e media queries.

## Estrutura dos arquivos

```text
central-do-doce/
├── index.html    # Estrutura das telas do sistema
├── style.css     # Estilos, layout, dark mode e responsividade
├── script.js     # Regras de navegação, CRUD, cálculos e persistência
└── README.md     # Documentação técnica do projeto
```

## Funcionalidades principais

- Tela de login com usuário e senha de teste.
- Recurso de ocultar/exibir senha.
- Dashboard com resumo de ingredientes, receitas e custos fixos.
- Cadastro, edição, listagem e exclusão de ingredientes.
- Cálculo automático de custo por unidade.
- Cadastro, edição, listagem, exclusão e detalhamento de receitas.
- Cálculo de custo total, custo por unidade e preço sugerido.
- Cadastro, edição, listagem e exclusão de custos fixos.
- Busca de CEP usando ViaCEP.
- Pesquisa simulada de produto com indicação de API Ninjas.
- Dark mode persistente via `localStorage`.
- Toasts de sucesso, erro e aviso.
- Modal de confirmação de exclusão.
- Tabelas de dados responsivas.

## Onde Flexbox é utilizado

O Flexbox é usado para controlar alinhamento e distribuição de elementos em várias áreas:

- `.login-container`: centralização vertical e horizontal do card de login.
- `.login-form`: organização vertical dos campos.
- `.input-wrapper`: alinhamento de ícone, input e botão de senha.
- `.sidebar`: estrutura vertical do menu lateral.
- `.sidebar-header`, `.sidebar-nav` e `.nav-item`: alinhamento dos ícones e textos do menu.
- `.main-content`: organização entre barra superior e conteúdo.
- `.top-bar` e `.top-bar-right`: alinhamento da barra superior.
- `.page-header`: alinhamento entre título e botões de ação.
- `.card`: alinhamento de ícone e conteúdo nos cards do dashboard.
- `.form-actions`, `.search-wrapper` e `.cep-wrapper`: organização de botões e campos.
- `.ingredient-detail`: distribuição de nome, quantidade e custo.
- `.theme-toggle` e `.theme-btn`: botões de alternância de tema.
- `.modal`, `.modal-header` e `.modal-footer`: centralização e alinhamento do modal.
- `.toast-container` e `.toast`: empilhamento e alinhamento das mensagens.

## Onde Grid Layout é utilizado

O Grid Layout é usado nas áreas com colunas adaptáveis:

- `.dashboard-cards`: cards principais do dashboard.
- `.dashboard-stats`: indicadores financeiros do dashboard.
- `.form-row`: campos de formulário em colunas responsivas.
- `.ingredient-row`: linhas de ingredientes na composição da receita.
- `.recipe-cost-preview`: prévia dos custos calculados.
- `.recipe-details-grid`: detalhes da receita com coluna de informações e coluna de custos.
- `.settings-container`: blocos da tela de configurações.
- Tabelas no mobile: as células passam a se organizar em grade com rótulo e valor.

## Responsividade

A responsividade foi revisada para Desktop, Tablet e Mobile.

No desktop, o sistema mantém menu lateral fixo, área principal ampla, cards em colunas e tabelas completas.

No tablet, grids passam a reduzir a quantidade de colunas, a tela de detalhes da receita vira uma coluna única e o espaçamento é reduzido.

No mobile, o menu lateral passa a ser recolhível, os formulários ficam em uma coluna, botões ocupam largura total quando necessário e as tabelas deixam de depender apenas de rolagem horizontal, passando a se comportar como cartões com rótulos por célula.

Também foram adicionados ajustes para evitar overflow horizontal, melhorar alinhamentos e preservar leitura em telas pequenas.

## Dark Mode

O dark mode é ativado na tela de configurações e salvo em `localStorage` pela chave `centralDoDoce_theme`.

Foram revisadas as variáveis de cor para garantir contraste adequado entre texto, cards, tabelas, botões e áreas de conteúdo. No modo escuro, o rosa claro deixou de ser usado como fundo principal de elementos com texto claro, evitando baixa legibilidade.

## Alterações realizadas nesta revisão

- Corrigida a tela de login para ocupar toda a largura e altura da viewport.
- Centralizado o card de login verticalmente e horizontalmente em qualquer resolução.
- Ajustadas as cores principais para melhor contraste em botões e elementos interativos.
- Revisado o dark mode para remover texto claro sobre fundo rosa claro.
- Adicionados limites de largura e `min-width: 0` em áreas críticas para evitar overflow.
- Melhorada a responsividade de cards, formulários, tabelas, modal, toast e menu.
- Tabelas passam a receber rótulos por célula no mobile.
- Botões apenas com ícone receberam `title` e `aria-label`.
- Botão do menu lateral recebeu controle de `aria-expanded`.
- Campo de login recebeu `autocomplete`.
- Toasts receberam região `aria-live`.
- README atualizado com visão geral, tecnologias, estrutura, Flexbox, Grid Layout, responsividade, dark mode e mudanças da revisão.

## Como usar

1. Abra o arquivo `index.html` em um navegador.
2. Use as credenciais de teste:
   - Usuário: `admin`
   - Senha: `123456`
3. Cadastre ou edite ingredientes, custos fixos e receitas.
4. Acesse Configurações para alternar entre modo claro e modo escuro.

## Compatibilidade com o enunciado

O projeto continua implementado apenas com HTML, CSS e JavaScript, utiliza Flexbox e Grid Layout, possui login com exibir/ocultar senha, navegação funcional, mensagens de feedback, persistência local, dark mode persistente, tabelas de dados, integração com API aberta/grátis via ViaCEP e fluxo de pesquisa relacionado à API Ninjas.
