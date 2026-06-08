# Central do Doce - Gestão de Confeitaria

## 📋 Descrição do Projeto

**Central do Doce** é um sistema web completo desenvolvido em HTML5, CSS3 e JavaScript puro para auxiliar doceiras e confeiteiros no controle de:

- **Ingredientes**: Cadastro e gerenciamento de ingredientes com preços
- **Receitas**: Criação e organização de receitas com cálculo automático de custos
- **Custos Fixos**: Controle de despesas fixas do negócio
- **Precificação**: Cálculo automático de preços sugeridos com margem de lucro

## 🎯 Objetivo

Facilitar o gerenciamento financeiro de negócios de confeitaria, permitindo cálculos precisos de custos de produção e sugestão de preços de venda competitivos.

## 👥 Público-Alvo

- Doceiras autônomas
- Confeiteiros profissionais
- Pequenas confeitarias
- Produtores de doces caseiros

## ✨ Funcionalidades Principais

### 1. **Autenticação**
- Login seguro com validação de credenciais
- Visualização/ocultação de senha
- Sessão persistente

### 2. **Dashboard**
- Visão geral com cards informativos
- Total de ingredientes cadastrados
- Total de receitas criadas
- Total de custos fixos
- Estatísticas de custos médios

### 3. **Gerenciamento de Ingredientes**
- Cadastro com nome, marca, unidade, preço e fornecedor
- Integração simulada com API Ninjas Product API
- Edição e exclusão com confirmação
- Tabela responsiva com busca

### 4. **Gerenciamento de Receitas**
- Criação com nome e rendimento
- Adição de múltiplos ingredientes
- Cálculo automático de custos
- Detalhes com custo total, por unidade e preço sugerido
- Margem de lucro de 150%

### 5. **Custos Fixos**
- Cadastro de despesas recorrentes
- Edição e exclusão
- Contribuição para análise de viabilidade

### 6. **Configurações**
- Perfil do usuário (nome e email)
- Busca de endereço via ViaCEP (simulada)
- Alternância entre Dark Mode e Light Mode
- Persistência de preferências

### 7. **Interface Responsiva**
- Totalmente responsiva para desktop, tablet e mobile
- Menu lateral colapsável em dispositivos pequenos
- Navegação intuitiva

### 8. **Notificações**
- Toast messages para feedback de ações
- Modais de confirmação para exclusões
- Validação de formulários

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Flexbox, Grid Layout, Animações
- **JavaScript Vanilla**: Lógica completa sem frameworks
- **LocalStorage**: Persistência de dados
- **Font Awesome**: Ícones profissionais

## 📁 Estrutura de Arquivos

```
central-do-doce/
├── index.html          # Arquivo principal com todas as telas
├── style.css           # Estilos completos e responsivos
├── script.js           # Lógica do sistema
├── README.md           # Este arquivo
└── assets/
    ├── images/         # Pasta para imagens
    └── icons/          # Pasta para ícones customizados
```

## 🚀 Como Usar Localmente

1. **Clone ou baixe o projeto**
   ```bash
   git clone https://github.com/seu-usuario/central-do-doce.git
   cd central-do-doce
   ```

2. **Abra o arquivo index.html no navegador**
   - Clique duplo em `index.html`
   - Ou arraste para o navegador
   - Ou use um servidor local (recomendado)

3. **Credenciais de Teste**
   - Usuário: `admin`
   - Senha: `123456`

## 📱 Responsividade

O sistema foi desenvolvido com abordagem mobile-first e é totalmente responsivo:

- **Desktop**: Layout completo com menu lateral
- **Tablet**: Menu adaptado, grid responsivo
- **Mobile**: Menu colapsável, layout em coluna única

## 💾 Armazenamento de Dados

Todos os dados são armazenados localmente usando **LocalStorage** do navegador:
- Ingredientes
- Receitas
- Custos Fixos
- Preferências de tema

**Nota**: Os dados são específicos do navegador e do dispositivo.

## 🌙 Tema Escuro

O sistema oferece dois temas:
- **Modo Claro**: Paleta rosa e branco
- **Modo Escuro**: Paleta escura com contraste adequado

A preferência é salva automaticamente em LocalStorage.

## 📊 Cálculos Implementados

### Custo Total da Receita
```
Custo Total = Σ(Preço do Ingrediente × Quantidade)
```

### Custo por Unidade
```
Custo por Unidade = Custo Total / Rendimento
```

### Preço Sugerido
```
Preço Sugerido = Custo por Unidade × 2.5 (margem de 150%)
```

## 🔌 Integrações Simuladas

### API Ninjas Product API
- Busca simulada de produtos
- Preenchimento automático de dados

### ViaCEP
- Busca simulada de endereços por CEP
- Retorno de rua, bairro, cidade e estado

## 📝 Validações

- Campos obrigatórios marcados com *
- Validação de entrada em formulários
- Confirmação antes de exclusões
- Mensagens de erro e sucesso

## 🎨 Paleta de Cores

| Cor | Código | Uso |
|-----|--------|-----|
| Rosa Claro | #e8a8d8 | Cor primária |
| Rosa Pastel | #f5d5e8 | Cor secundária |
| Marrom Suave | #a67c52 | Cor terciária |
| Rosa Forte | #ff69b4 | Destaque |
| Verde | #4caf50 | Sucesso |
| Vermelho | #f44336 | Erro/Perigo |

## 🌐 Publicação no GitHub Pages

### Passo 1: Criar repositório no GitHub
1. Acesse [github.com](https://github.com)
2. Clique em "New repository"
3. Nomeie como `central-do-doce`
4. Clique em "Create repository"

### Passo 2: Fazer upload dos arquivos
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/central-do-doce.git
git push -u origin main
```

### Passo 3: Ativar GitHub Pages
1. Vá para "Settings" do repositório
2. Clique em "Pages"
3. Em "Source", selecione "main"
4. Clique em "Save"

### Passo 4: Acessar o site
Seu site estará disponível em:
```
https://seu-usuario.github.io/central-do-doce/
```

## ✅ Checklist de Funcionalidades

- [x] 10 telas conforme especificação
- [x] Login com validação
- [x] Dashboard com cards informativos
- [x] CRUD de ingredientes
- [x] CRUD de custos fixos
- [x] CRUD de receitas
- [x] Cálculo automático de custos
- [x] Detalhes de receita com preço sugerido
- [x] Configurações com Dark Mode
- [x] Busca de endereço (ViaCEP simulada)
- [x] Busca de produtos (API Ninjas simulada)
- [x] Interface responsiva
- [x] Notificações (Toast)
- [x] Modais de confirmação
- [x] Persistência de dados (LocalStorage)
- [x] Menu lateral navegável
- [x] Paleta de cores profissional
- [x] Animações suaves
- [x] Ícones Font Awesome

## 🐛 Troubleshooting

### Dados não aparecem após recarregar
- Verifique se o LocalStorage está habilitado no navegador
- Limpe o cache do navegador

### Estilos não carregam
- Certifique-se de que `style.css` está no mesmo diretório que `index.html`
- Recarregue a página (Ctrl+F5)

### Ícones não aparecem
- Verifique a conexão com a internet (Font Awesome é carregado via CDN)
- Tente em outro navegador

## 📞 Suporte

Para dúvidas ou sugestões sobre o projeto, entre em contato ou abra uma issue no repositório GitHub.

## 📄 Licença

Este projeto é fornecido como trabalho acadêmico para fins educacionais.

---

**Desenvolvido com ❤️ para o curso de CST em Análise e Desenvolvimento de Sistemas**

Versão: 1.0.0  
Data: 2024
