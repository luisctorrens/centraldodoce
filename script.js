// ============================================================
// CENTRAL DO DOCE — script.js
// ============================================================
// MODELO DE INGREDIENTE:
//   id, name, brand, pkgQty (qtd na embalagem), unit (g/kg/ml/l/un/dz),
//   pkgPrice (preço da embalagem), unitCost (pkgPrice / pkgQty),
//   supplier
//
// MODELO DE ITEM DE RECEITA:
//   ingredientId, qty (quantidade usada, na mesma unidade do ingrediente)
//   custo do item = ingredient.unitCost × qty
// ============================================================

// ============================================================
// ESTADO GLOBAL
// ============================================================
let db = {
    user:         null,
    ingredients:  [],
    recipes:      [],
    fixedCosts:   [],
};

let editingIngredientId = null;
let editingFixedCostId  = null;
let editingRecipeId     = null;
let currentRecipeId     = null;
let pendingDeleteFn     = null;

// ============================================================
// PERSISTÊNCIA
// ============================================================
function loadDB() {
    const raw = localStorage.getItem('centralDoDoce_v2');
    if (raw) {
        try { db = JSON.parse(raw); } catch(e) { /* ignora */ }
    }
}

function saveDB() {
    localStorage.setItem('centralDoDoce_v2', JSON.stringify(db));
}

function loadTheme() {
    const t = localStorage.getItem('centralDoDoce_theme') || 'light';
    if (t === 'dark') document.body.classList.add('dark-mode');
    updateThemeButtons();
}

// ============================================================
// NAVEGAÇÃO
// ============================================================
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function showContent(id) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active-content'));
    document.getElementById(id).classList.add('active-content');
}

function setActiveNav(screen) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const el = document.querySelector(`.nav-item[data-screen="${screen}"]`);
    if (el) el.classList.add('active');
}

// ============================================================
// UTILITÁRIOS
// ============================================================
function fmtBRL(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function unitLabel(unit) {
    const map = { g: 'g', kg: 'kg', ml: 'ml', l: 'l', un: 'un', dz: 'dz' };
    return map[unit] || unit;
}

function showToast(msg, type = 'success') {
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${icons[type] || icons.success}"></i><span>${msg}</span>`;
    document.getElementById('toast-container').appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideInRight .3s ease reverse';
        setTimeout(() => toast.remove(), 280);
    }, 3200);
}

function showDeleteModal(msg, onConfirm) {
    document.getElementById('delete-message').textContent = msg;
    pendingDeleteFn = onConfirm;
    document.getElementById('delete-modal').classList.add('active');
}

function applyTableCellLabels(tableSelector) {
    const table = document.querySelector(tableSelector);
    if (!table) return;

    const labels = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
    table.querySelectorAll('tbody tr').forEach(row => {
        if (row.classList.contains('empty-row')) return;
        row.querySelectorAll('td').forEach((td, index) => {
            td.setAttribute('data-label', labels[index] || '');
        });
    });
}

// ============================================================
// LOGIN
// ============================================================
document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value;
    if (u === 'admin' && p === '123456') {
        db.user = { name: 'Admin', email: 'admin@centraldodoce.com' };
        saveDB();
        showScreen('dashboard-screen');
        goToDashboard();
        showToast('Login realizado com sucesso!');
    } else {
        showToast('Usuário ou senha incorretos!', 'error');
    }
});

document.getElementById('toggle-password').addEventListener('click', () => {
    const inp  = document.getElementById('password');
    const icon = document.getElementById('toggle-icon');
    const btn  = document.getElementById('toggle-password');
    if (inp.type === 'password') {
        inp.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
        btn.setAttribute('aria-label', 'Ocultar senha');
    } else {
        inp.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
        btn.setAttribute('aria-label', 'Mostrar senha');
    }
});

document.getElementById('logout-btn').addEventListener('click', e => {
    e.preventDefault();
    db.user = null;
    saveDB();
    showScreen('login-screen');
    document.getElementById('login-form').reset();
    showToast('Sessão encerrada.', 'warning');
});

// ============================================================
// MENU LATERAL
// ============================================================
document.querySelectorAll('.nav-item[data-screen]').forEach(item => {
    item.addEventListener('click', e => {
        e.preventDefault();
        const screen = item.getAttribute('data-screen');
        setActiveNav(screen);
        closeSidebar();
        switch (screen) {
            case 'dashboard':   goToDashboard();   break;
            case 'ingredients': goToIngredients(); break;
            case 'fixed-costs': goToFixedCosts();  break;
            case 'recipes':     goToRecipes();     break;
            case 'settings':    goToSettings();    break;
        }
    });
});

const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');

menuToggle.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
});

function closeSidebar() {
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Abrir menu');
    }
}

window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        sidebar.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Abrir menu');
    }
});

document.addEventListener('click', e => {
    if (window.innerWidth > 768 || !sidebar.classList.contains('active')) return;
    if (sidebar.contains(e.target) || menuToggle.contains(e.target)) return;
    closeSidebar();
});

// ============================================================
// DASHBOARD
// ============================================================
function goToDashboard() {
    showContent('dashboard-content');
    setActiveNav('dashboard');

    document.getElementById('total-ingredients').textContent = db.ingredients.length;
    document.getElementById('total-recipes').textContent     = db.recipes.length;
    document.getElementById('total-fixed-costs').textContent = db.fixedCosts.length;

    const totalFC = db.fixedCosts.reduce((s, c) => s + c.value, 0);
    document.getElementById('total-fixed-costs-value').textContent = fmtBRL(totalFC);

    const costs = db.recipes.map(r => calcRecipeCost(r));
    const avg   = costs.length ? costs.reduce((a, b) => a + b, 0) / costs.length : 0;
    document.getElementById('avg-recipe-cost').textContent = fmtBRL(avg);
}

// ============================================================
// INGREDIENTES — LISTA (Tela 3)
// ============================================================
function goToIngredients() {
    showContent('ingredients-content');
    renderIngredients();
}

function renderIngredients() {
    const tbody = document.getElementById('ingredients-tbody');
    tbody.innerHTML = '';

    if (!db.ingredients.length) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="7"><i class="fas fa-flask"></i>Nenhum ingrediente cadastrado ainda.</td></tr>`;
        return;
    }

    db.ingredients.forEach(ing => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${ing.name}</strong></td>
            <td>${ing.brand || '—'}</td>
            <td>${ing.pkgQty} ${unitLabel(ing.unit)}</td>
            <td>${fmtBRL(ing.pkgPrice)}</td>
            <td><strong style="color:var(--primary-dark)">${fmtBRL(ing.unitCost)} / ${unitLabel(ing.unit)}</strong></td>
            <td>${ing.supplier || '—'}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editIngredient(${ing.id})" title="Editar ingrediente" aria-label="Editar ingrediente"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm"    onclick="confirmDeleteIngredient(${ing.id})" title="Excluir ingrediente" aria-label="Excluir ingrediente"><i class="fas fa-trash"></i></button>
            </td>`;
        tbody.appendChild(tr);
    });
    applyTableCellLabels('#ingredients-content .data-table');
}

// ============================================================
// INGREDIENTES — CADASTRO (Tela 4)
// ============================================================
document.getElementById('new-ingredient-btn').addEventListener('click', () => {
    editingIngredientId = null;
    document.getElementById('ingredient-form-title').textContent = 'Novo Ingrediente';
    document.getElementById('ingredient-form').reset();
    document.getElementById('unit-cost-preview-value').textContent = '—';
    document.getElementById('search-results').innerHTML = '';
    showContent('ingredient-form-content');
});

document.getElementById('cancel-ingredient-btn').addEventListener('click', () => goToIngredients());

// Cálculo em tempo real do custo por unidade
['ingredient-pkg-qty', 'ingredient-price'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateUnitCostPreview);
});
document.getElementById('ingredient-unit').addEventListener('change', updateUnitCostPreview);

function updateUnitCostPreview() {
    const qty   = parseFloat(document.getElementById('ingredient-pkg-qty').value);
    const price = parseFloat(document.getElementById('ingredient-price').value);
    const unit  = document.getElementById('ingredient-unit').value;
    const el    = document.getElementById('unit-cost-preview-value');

    if (qty > 0 && price > 0 && unit) {
        const uc = price / qty;
        el.textContent = `${fmtBRL(uc)} / ${unitLabel(unit)}`;
    } else {
        el.textContent = '—';
    }
}

document.getElementById('ingredient-form').addEventListener('submit', e => {
    e.preventDefault();

    const pkgQty   = parseFloat(document.getElementById('ingredient-pkg-qty').value);
    const pkgPrice = parseFloat(document.getElementById('ingredient-price').value);
    const unit     = document.getElementById('ingredient-unit').value;

    if (pkgQty <= 0 || pkgPrice <= 0) {
        showToast('Informe quantidade e preço válidos!', 'warning');
        return;
    }

    const ing = {
        id:        editingIngredientId || Date.now(),
        name:      document.getElementById('ingredient-name').value.trim(),
        brand:     document.getElementById('ingredient-brand').value.trim(),
        pkgQty,
        unit,
        pkgPrice,
        unitCost:  pkgPrice / pkgQty,
        supplier:  document.getElementById('ingredient-supplier').value.trim(),
    };

    if (editingIngredientId) {
        const idx = db.ingredients.findIndex(i => i.id === editingIngredientId);
        db.ingredients[idx] = ing;
        showToast('Ingrediente atualizado!');
    } else {
        db.ingredients.push(ing);
        showToast('Ingrediente salvo!');
    }

    saveDB();
    goToIngredients();
});

function editIngredient(id) {
    const ing = db.ingredients.find(i => i.id === id);
    if (!ing) return;
    editingIngredientId = id;
    document.getElementById('ingredient-form-title').textContent = 'Editar Ingrediente';
    document.getElementById('ingredient-name').value     = ing.name;
    document.getElementById('ingredient-brand').value    = ing.brand;
    document.getElementById('ingredient-pkg-qty').value  = ing.pkgQty;
    document.getElementById('ingredient-unit').value     = ing.unit;
    document.getElementById('ingredient-price').value    = ing.pkgPrice;
    document.getElementById('ingredient-supplier').value = ing.supplier;
    document.getElementById('search-results').innerHTML  = '';
    updateUnitCostPreview();
    showContent('ingredient-form-content');
}

function confirmDeleteIngredient(id) {
    showDeleteModal('Tem certeza que deseja excluir este ingrediente?', () => {
        db.ingredients = db.ingredients.filter(i => i.id !== id);
        saveDB();
        renderIngredients();
        goToDashboard();
        goToIngredients();
        showToast('Ingrediente excluído.', 'warning');
    });
}

// Pesquisa de produto (API Ninjas simulada)
document.getElementById('search-product-btn').addEventListener('click', () => {
    const term = document.getElementById('product-search').value.trim();
    if (!term) { showToast('Digite um nome de produto!', 'warning'); return; }

    const mock = [
        { name: `${term} Premium 1kg`,   pkgQty: 1000, unit: 'g',  price: 18.90 },
        { name: `${term} Tradicional 500g`, pkgQty: 500, unit: 'g', price: 9.50 },
        { name: `${term} Importado 250g`,  pkgQty: 250, unit: 'g',  price: 14.00 },
    ];

    const div = document.getElementById('search-results');
    div.innerHTML = '';
    mock.forEach(item => {
        const el = document.createElement('div');
        el.className = 'search-result-item';
        el.innerHTML = `<span>${item.name}</span><span>${fmtBRL(item.price)}</span>`;
        el.addEventListener('click', () => {
            document.getElementById('ingredient-name').value    = item.name;
            document.getElementById('ingredient-pkg-qty').value = item.pkgQty;
            document.getElementById('ingredient-unit').value    = item.unit;
            document.getElementById('ingredient-price').value   = item.price;
            updateUnitCostPreview();
            div.innerHTML = '';
            showToast('Produto preenchido!');
        });
        div.appendChild(el);
    });
    showToast('Resultados simulados carregados!');
});

// ============================================================
// CUSTOS FIXOS — LISTA (Tela 5)
// ============================================================
function goToFixedCosts() {
    showContent('fixed-costs-content');
    renderFixedCosts();
}

function renderFixedCosts() {
    const tbody = document.getElementById('fixed-costs-tbody');
    tbody.innerHTML = '';

    if (!db.fixedCosts.length) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="3"><i class="fas fa-coins"></i>Nenhum custo fixo cadastrado ainda.</td></tr>`;
        return;
    }

    db.fixedCosts.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.name}</td>
            <td>${fmtBRL(c.value)}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editFixedCost(${c.id})" title="Editar custo fixo" aria-label="Editar custo fixo"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm"    onclick="confirmDeleteFixedCost(${c.id})" title="Excluir custo fixo" aria-label="Excluir custo fixo"><i class="fas fa-trash"></i></button>
            </td>`;
        tbody.appendChild(tr);
    });
    applyTableCellLabels('#fixed-costs-content .data-table');
}

// ============================================================
// CUSTOS FIXOS — CADASTRO (Tela 6)
// ============================================================
document.getElementById('new-fixed-cost-btn').addEventListener('click', () => {
    editingFixedCostId = null;
    document.getElementById('fixed-cost-form-title').textContent = 'Novo Custo Fixo';
    document.getElementById('fixed-cost-form').reset();
    showContent('fixed-cost-form-content');
});

document.getElementById('cancel-fixed-cost-btn').addEventListener('click', () => goToFixedCosts());

document.getElementById('fixed-cost-form').addEventListener('submit', e => {
    e.preventDefault();
    const cost = {
        id:    editingFixedCostId || Date.now(),
        name:  document.getElementById('fixed-cost-name').value.trim(),
        value: parseFloat(document.getElementById('fixed-cost-value').value),
    };
    if (editingFixedCostId) {
        const idx = db.fixedCosts.findIndex(c => c.id === editingFixedCostId);
        db.fixedCosts[idx] = cost;
        showToast('Custo fixo atualizado!');
    } else {
        db.fixedCosts.push(cost);
        showToast('Custo fixo salvo!');
    }
    saveDB();
    goToFixedCosts();
});

function editFixedCost(id) {
    const c = db.fixedCosts.find(x => x.id === id);
    if (!c) return;
    editingFixedCostId = id;
    document.getElementById('fixed-cost-form-title').textContent = 'Editar Custo Fixo';
    document.getElementById('fixed-cost-name').value  = c.name;
    document.getElementById('fixed-cost-value').value = c.value;
    showContent('fixed-cost-form-content');
}

function confirmDeleteFixedCost(id) {
    showDeleteModal('Tem certeza que deseja excluir este custo fixo?', () => {
        db.fixedCosts = db.fixedCosts.filter(c => c.id !== id);
        saveDB();
        renderFixedCosts();
        showToast('Custo fixo excluído.', 'warning');
    });
}

// ============================================================
// RECEITAS — LISTA (Tela 7)
// ============================================================
function goToRecipes() {
    showContent('recipes-content');
    renderRecipes();
}

function renderRecipes() {
    const tbody = document.getElementById('recipes-tbody');
    tbody.innerHTML = '';

    if (!db.recipes.length) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="5"><i class="fas fa-book"></i>Nenhuma receita cadastrada ainda.</td></tr>`;
        return;
    }

    db.recipes.forEach(r => {
        const total = calcRecipeCost(r);
        const unit  = r.yield > 0 ? total / r.yield : 0;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${r.name}</strong></td>
            <td>${r.yield} un</td>
            <td>${fmtBRL(total)}</td>
            <td>${fmtBRL(unit)}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="viewRecipe(${r.id})" title="Ver receita" aria-label="Ver receita"><i class="fas fa-eye"></i></button>
                <button class="btn btn-danger btn-sm"    onclick="confirmDeleteRecipe(${r.id})" title="Excluir receita" aria-label="Excluir receita"><i class="fas fa-trash"></i></button>
            </td>`;
        tbody.appendChild(tr);
    });
    applyTableCellLabels('#recipes-content .data-table');
}

// ============================================================
// RECEITAS — CADASTRO (Tela 8)
// ============================================================
document.getElementById('new-recipe-btn').addEventListener('click', () => {
    editingRecipeId = null;
    document.getElementById('recipe-form-title').textContent = 'Nova Receita';
    document.getElementById('recipe-form').reset();
    document.getElementById('recipe-ingredients-list').innerHTML = '';
    addIngredientRow();
    updateRecipePreview();
    showContent('recipe-form-content');
});

document.getElementById('cancel-recipe-btn').addEventListener('click', () => goToRecipes());

document.getElementById('add-ingredient-btn').addEventListener('click', e => {
    e.preventDefault();
    addIngredientRow();
});

function addIngredientRow(selectedId = '', qty = '') {
    const list = document.getElementById('recipe-ingredients-list');
    const row  = document.createElement('div');
    row.className = 'ingredient-row';

    const options = db.ingredients.map(ing =>
        `<option value="${ing.id}" ${ing.id == selectedId ? 'selected' : ''}>
            ${ing.name} (${fmtBRL(ing.unitCost)}/${unitLabel(ing.unit)})
         </option>`
    ).join('');

    row.innerHTML = `
        <div class="form-group" style="margin:0">
            <label>Ingrediente</label>
            <select class="ing-select" required>
                <option value="">Selecione...</option>
                ${options}
            </select>
        </div>
        <div class="form-group" style="margin:0">
            <label class="qty-label">Quantidade</label>
            <input type="number" class="ing-qty" placeholder="Ex: 200" step="0.001" min="0.001" value="${qty}" required>
        </div>
        <div class="row-cost">R$ 0,00</div>
        <button type="button" class="btn btn-danger btn-sm remove-row-btn"><i class="fas fa-trash"></i></button>
    `;

    // Atualizar label da unidade ao selecionar ingrediente
    const sel = row.querySelector('.ing-select');
    const lbl = row.querySelector('.qty-label');
    const costEl = row.querySelector('.row-cost');

    function refreshRow() {
        const ing = db.ingredients.find(i => i.id == sel.value);
        if (ing) lbl.textContent = `Quantidade (${unitLabel(ing.unit)})`;
        else     lbl.textContent = 'Quantidade';
        updateRowCost(row);
        updateRecipePreview();
    }

    sel.addEventListener('change', refreshRow);
    row.querySelector('.ing-qty').addEventListener('input', () => {
        updateRowCost(row);
        updateRecipePreview();
    });
    row.querySelector('.remove-row-btn').addEventListener('click', () => {
        row.remove();
        updateRecipePreview();
    });

    list.appendChild(row);

    // Se já veio com ingrediente selecionado, atualiza label imediatamente
    if (selectedId) refreshRow();
}

function updateRowCost(row) {
    const sel  = row.querySelector('.ing-select');
    const qty  = parseFloat(row.querySelector('.ing-qty').value) || 0;
    const ing  = db.ingredients.find(i => i.id == sel.value);
    const cost = (ing && qty > 0) ? ing.unitCost * qty : 0;
    row.querySelector('.row-cost').textContent = fmtBRL(cost);
}

function getRecipeRowsData() {
    const rows = document.querySelectorAll('#recipe-ingredients-list .ingredient-row');
    const items = [];
    rows.forEach(row => {
        const ingId = parseInt(row.querySelector('.ing-select').value);
        const qty   = parseFloat(row.querySelector('.ing-qty').value);
        if (ingId && qty > 0) items.push({ ingredientId: ingId, qty });
    });
    return items;
}

function updateRecipePreview() {
    const items = getRecipeRowsData();
    const yieldVal = parseInt(document.getElementById('recipe-yield').value) || 0;
    let total = 0;
    items.forEach(item => {
        const ing = db.ingredients.find(i => i.id === item.ingredientId);
        if (ing) total += ing.unitCost * item.qty;
    });
    const unitC = yieldVal > 0 ? total / yieldVal : 0;
    const sugg  = unitC * 2.5;
    document.getElementById('preview-total-cost').textContent     = fmtBRL(total);
    document.getElementById('preview-unit-cost').textContent      = fmtBRL(unitC);
    document.getElementById('preview-suggested-price').textContent = fmtBRL(sugg);
}

document.getElementById('recipe-yield').addEventListener('input', updateRecipePreview);

document.getElementById('recipe-form').addEventListener('submit', e => {
    e.preventDefault();
    const items = getRecipeRowsData();
    if (!items.length) { showToast('Adicione pelo menos um ingrediente!', 'warning'); return; }

    const recipe = {
        id:          editingRecipeId || Date.now(),
        name:        document.getElementById('recipe-name').value.trim(),
        yield:       parseInt(document.getElementById('recipe-yield').value),
        ingredients: items,
    };

    if (editingRecipeId) {
        const idx = db.recipes.findIndex(r => r.id === editingRecipeId);
        db.recipes[idx] = recipe;
        showToast('Receita atualizada!');
    } else {
        db.recipes.push(recipe);
        showToast('Receita salva!');
    }

    saveDB();
    goToRecipes();
});

// ============================================================
// RECEITAS — CÁLCULO DE CUSTO
// ============================================================
function calcRecipeCost(recipe) {
    return recipe.ingredients.reduce((sum, item) => {
        const ing = db.ingredients.find(i => i.id === item.ingredientId);
        return sum + (ing ? ing.unitCost * item.qty : 0);
    }, 0);
}

// ============================================================
// RECEITAS — DETALHES (Tela 9)
// ============================================================
function viewRecipe(id) {
    const recipe = db.recipes.find(r => r.id === id);
    if (!recipe) return;
    currentRecipeId = id;

    document.getElementById('recipe-details-title').textContent = recipe.name;

    // Lista de ingredientes
    const detDiv = document.getElementById('recipe-ingredients-details');
    detDiv.innerHTML = '';
    recipe.ingredients.forEach(item => {
        const ing  = db.ingredients.find(i => i.id === item.ingredientId);
        if (!ing) return;
        const cost = ing.unitCost * item.qty;
        const div  = document.createElement('div');
        div.className = 'ingredient-detail';
        div.innerHTML = `
            <span class="det-name">${ing.name}</span>
            <span class="det-qty">${item.qty} ${unitLabel(ing.unit)}</span>
            <span class="det-cost">${fmtBRL(cost)}</span>`;
        detDiv.appendChild(div);
    });

    // Totais
    const total = calcRecipeCost(recipe);
    const unit  = recipe.yield > 0 ? total / recipe.yield : 0;
    const sugg  = unit * 2.5;

    document.getElementById('recipe-total-cost').textContent      = fmtBRL(total);
    document.getElementById('recipe-unit-cost').textContent       = fmtBRL(unit);
    document.getElementById('recipe-suggested-price').textContent = fmtBRL(sugg);

    showContent('recipe-details-content');
}

document.getElementById('back-to-recipes-btn').addEventListener('click', () => goToRecipes());

document.getElementById('edit-recipe-btn').addEventListener('click', () => {
    const recipe = db.recipes.find(r => r.id === currentRecipeId);
    if (!recipe) return;
    editingRecipeId = recipe.id;
    document.getElementById('recipe-form-title').textContent = 'Editar Receita';
    document.getElementById('recipe-name').value  = recipe.name;
    document.getElementById('recipe-yield').value = recipe.yield;
    document.getElementById('recipe-ingredients-list').innerHTML = '';
    recipe.ingredients.forEach(item => addIngredientRow(item.ingredientId, item.qty));
    updateRecipePreview();
    showContent('recipe-form-content');
});

document.getElementById('delete-recipe-btn').addEventListener('click', () => {
    confirmDeleteRecipe(currentRecipeId);
});

function confirmDeleteRecipe(id) {
    showDeleteModal('Tem certeza que deseja excluir esta receita?', () => {
        db.recipes = db.recipes.filter(r => r.id !== id);
        saveDB();
        goToRecipes();
        showToast('Receita excluída.', 'warning');
    });
}

// ============================================================
// CONFIGURAÇÕES (Tela 10)
// ============================================================
function goToSettings() {
    showContent('settings-content');
    document.getElementById('settings-username').textContent = db.user?.name  || 'Admin';
    document.getElementById('settings-email').textContent    = db.user?.email || 'admin@centraldodoce.com';
    updateThemeButtons();
}

document.getElementById('light-mode-btn').addEventListener('click', () => {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('centralDoDoce_theme', 'light');
    updateThemeButtons();
    showToast('Tema claro ativado!');
});

document.getElementById('dark-mode-btn').addEventListener('click', () => {
    document.body.classList.add('dark-mode');
    localStorage.setItem('centralDoDoce_theme', 'dark');
    updateThemeButtons();
    showToast('Tema escuro ativado!');
});

function updateThemeButtons() {
    const dark = document.body.classList.contains('dark-mode');
    document.getElementById('light-mode-btn').classList.toggle('active', !dark);
    document.getElementById('dark-mode-btn').classList.toggle('active',  dark);
}

// ViaCEP
document.getElementById('cep-input').addEventListener('input', function() {
    let v = this.value.replace(/\D/g, '');
    if (v.length > 5) v = v.slice(0,5) + '-' + v.slice(5,8);
    this.value = v;
});

document.getElementById('search-cep-btn').addEventListener('click', () => {
    const cep = document.getElementById('cep-input').value.replace(/\D/g, '');
    if (cep.length !== 8) { showToast('CEP inválido!', 'warning'); return; }

    const addrDiv = document.getElementById('address-info');
    addrDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';
    addrDiv.classList.add('show');

    fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(r => r.json())
        .then(data => {
            if (data.erro) {
                addrDiv.innerHTML = '<strong>CEP não encontrado.</strong>';
                showToast('CEP não encontrado!', 'error');
            } else {
                addrDiv.innerHTML = `
                    <p><strong>Rua:</strong> ${data.logradouro || '—'}</p>
                    <p><strong>Bairro:</strong> ${data.bairro || '—'}</p>
                    <p><strong>Cidade:</strong> ${data.localidade || '—'}</p>
                    <p><strong>Estado:</strong> ${data.uf || '—'}</p>`;
                showToast('Endereço encontrado!');
            }
        })
        .catch(() => {
            // Fallback simulado
            addrDiv.innerHTML = `
                <p><strong>Rua:</strong> Rua Exemplo</p>
                <p><strong>Bairro:</strong> Centro</p>
                <p><strong>Cidade:</strong> Cidade Exemplo</p>
                <p><strong>Estado:</strong> SP</p>`;
            showToast('Endereço carregado (simulado).', 'warning');
        });
});

// ============================================================
// MODAL DE EXCLUSÃO
// ============================================================
document.getElementById('confirm-delete-btn').addEventListener('click', () => {
    if (pendingDeleteFn) { pendingDeleteFn(); pendingDeleteFn = null; }
    document.getElementById('delete-modal').classList.remove('active');
});

document.getElementById('cancel-delete-btn').addEventListener('click', () => {
    pendingDeleteFn = null;
    document.getElementById('delete-modal').classList.remove('active');
});

document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
        pendingDeleteFn = null;
        document.getElementById('delete-modal').classList.remove('active');
    });
});

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    loadDB();
    loadTheme();

    // Dados de exemplo (apenas na primeira vez)
    if (!db.ingredients.length) {
        db.ingredients = [
            { id: 1, name: 'Farinha de Trigo',  brand: 'Dona Benta', pkgQty: 1000, unit: 'g',  pkgPrice: 8.50,  unitCost: 0.0085,  supplier: 'Mercado Central' },
            { id: 2, name: 'Açúcar Cristal',    brand: 'União',      pkgQty: 1000, unit: 'g',  pkgPrice: 4.20,  unitCost: 0.0042,  supplier: 'Atacadão' },
            { id: 3, name: 'Ovos',              brand: 'Granja Sol', pkgQty: 12,   unit: 'un', pkgPrice: 12.00, unitCost: 1.0,     supplier: 'Feira Livre' },
            { id: 4, name: 'Manteiga',          brand: 'Aviação',    pkgQty: 200,  unit: 'g',  pkgPrice: 9.50,  unitCost: 0.0475,  supplier: 'Mercado Central' },
            { id: 5, name: 'Leite Integral',    brand: 'Italac',     pkgQty: 1000, unit: 'ml', pkgPrice: 5.80,  unitCost: 0.0058,  supplier: 'Mercado Central' },
            { id: 6, name: 'Chocolate em Pó',   brand: 'Nestlé',     pkgQty: 200,  unit: 'g',  pkgPrice: 7.90,  unitCost: 0.0395,  supplier: 'Atacadão' },
        ];
        saveDB();
    }
});
