# Central do Doce — Gestão de Confeitaria

## Descrição

**Central do Doce** é um sistema web completo desenvolvido em HTML5, CSS3 e JavaScript puro para auxiliar doceiras e confeiteiros no controle de ingredientes, receitas, custos fixos e precificação de produtos.

## Tecnologias

- HTML5 semântico
- CSS3 (Flexbox + Grid Layout, sem frameworks)
- JavaScript Vanilla (sem frameworks)
- LocalStorage para persistência de dados
- Font Awesome para ícones
- ViaCEP (API real) para busca de endereço

## Estrutura de Arquivos

```
central-do-doce/
├── index.html      # Todas as 10 telas do sistema
├── style.css       # Estilos completos e responsivos
├── script.js       # Lógica completa do sistema
└── README.md       # Este arquivo
```

## Como Usar

1. Abra `index.html` no navegador
2. Login: **admin** / **123456**
3. Comece cadastrando seus ingredientes

## Lógica de Custo por Unidade

### Cadastro de Ingrediente

Ao cadastrar um ingrediente, informe:

| Campo | Exemplo |
|---|---|
| Nome | Farinha de Trigo |
| Marca | Dona Benta |
| Quantidade na Embalagem | 1000 |
| Unidade de Medida | g (gramas) |
| Preço da Embalagem | R$ 8,50 |

O sistema calcula automaticamente:

```
Custo por Unidade = Preço da Embalagem ÷ Quantidade na Embalagem
Custo por Unidade = R$ 8,50 ÷ 1000 g = R$ 0,0085 / g
```

### Cadastro de Receita

Ao adicionar um ingrediente à receita, informe a quantidade usada **na mesma unidade**:

| Ingrediente | Quantidade Usada | Custo |
|---|---|---|
| Farinha de Trigo | 300 g | R$ 0,0085 × 300 = R$ 2,55 |
| Açúcar Cristal | 150 g | R$ 0,0042 × 150 = R$ 0,63 |
| Ovos | 3 un | R$ 1,00 × 3 = R$ 3,00 |

O sistema calcula em tempo real:

```
Custo Total       = soma dos custos de cada ingrediente
Custo por Unidade = Custo Total ÷ Rendimento
Preço Sugerido    = Custo por Unidade × 2,5  (margem de 150%)
```

## Publicação no GitHub Pages

1. Crie um repositório chamado `central-do-doce` no GitHub
2. Faça upload dos 4 arquivos
3. Vá em **Settings → Pages → Source: main**
4. Acesse: `https://seu-usuario.github.io/central-do-doce/`

## Credenciais de Teste

- Usuário: `admin`
- Senha: `123456`
