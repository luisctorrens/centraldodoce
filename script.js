// ===========================
// GERENCIAMENTO DE DADOS
// ===========================

let appData = {
    user: null,
    ingredients: [],
    recipes: [],
    fixedCosts: [],
    currentRecipeId: null,
    currentIngredientId: null,
    currentFixedCostId: null,
    editingRecipeId: null,
    editingIngredientId: null,
    editingFixedCostId: null,
};

// Carregar dados do localStorage
function loadData() {
    const saved = localStorage.getItem('centralDoDoceData');
    if (saved) {
        appData = JSON.parse(saved);
    }
}

// Salvar dados no localStorage
function saveData() {
    localStorage.setItem('centralDoDoceData', JSON.stringify(appData));
}

// Carregar tema
function loadTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

// ===========================
// NAVEGAÇÃO DE TELAS
// ===========================

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function showContent(contentId) {
    document.querySelectorAll('.content-section, .dashboard-content').forEach(c => {
        c.style.display = 'none';
    });
    document.getElementById(contentId).style.display = 'block';
}

// ===========================
// LOGIN
// ===========================

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'admin' && password === '123456') {
        appData.user = {
            name: 'Admin',
            email: 'admin@centraldodoce.com'
        };
        saveData();
        showScreen('dashboard-screen');
        updateDashboard();
        showToast('Login realizado com sucesso!', 'success');
    } else {
        showToast('Usuário ou senha incorretos!', 'error');
    }
});

// Toggle mostrar/ocultar senha
document.getElementById('toggle-password').addEventListener('click', (e) => {
    e.preventDefault();
    const passwordInput = document.getElementById('password');
    const icon = e.target.closest('button').querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    appData.user = null;
    saveData();
    showScreen('login-screen');
    document.getElementById('login-form').reset();
    showToast('Desconectado com sucesso!', 'success');
});

// ===========================
// NAVEGAÇÃO DO MENU
// ===========================

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        if (item.id === 'logout-btn') return;
        
        e.preventDefault();
        
        const screenId = item.getAttribute('data-screen');
        
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        if (screenId === 'dashboard') {
            showContent('dashboard-content');
            updateDashboard();
        } else if (screenId === 'ingredients') {
            showContent('ingredients-content');
            renderIngredientsList();
        } else if (screenId === 'fixed-costs') {
            showContent('fixed-costs-content');
            renderFixedCostsList();
        } else if (screenId === 'recipes') {
            showContent('recipes-content');
            renderRecipesList();
        } else if (screenId === 'settings') {
            showContent('settings-content');
            updateSettings();
        }
        
        closeSidebar();
    });
});

// Menu toggle mobile
document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('active');
});

function closeSidebar() {
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('active');
    }
}

// ===========================
// DASHBOARD
// ===========================

function updateDashboard() {
    document.getElementById('total-ingredients').textContent = appData.ingredients.length;
    document.getElementById('total-recipes').textContent = appData.recipes.length;
    document.getElementById('total-fixed-costs').textContent = appData.fixedCosts.length;
    
    // Custo médio por receita
    let totalCost = 0;
    appData.recipes.forEach(recipe => {
        totalCost += calculateRecipeCost(recipe);
    });
    const avgCost = appData.recipes.length > 0 ? totalCost / appData.recipes.length : 0;
    document.getElementById('avg-recipe-cost').textContent = `R$ ${avgCost.toFixed(2)}`;
    
    // Total de custos fixos
    const totalFixedCosts = appData.fixedCosts.reduce((sum, cost) => sum + parseFloat(cost.value), 0);
    document.getElementById('total-fixed-costs-value').textContent = `R$ ${totalFixedCosts.toFixed(2)}`;
}

// ===========================
// INGREDIENTES
// ===========================

document.getElementById('new-ingredient-btn').addEventListener('click', () => {
    appData.editingIngredientId = null;
    document.getElementById('ingredient-form-title').textContent = 'Novo Ingrediente';
    document.getElementById('ingredient-form').reset();
    showContent('ingredient-form-content');
});

document.getElementById('cancel-ingredient-btn').addEventListener('click', () => {
    showContent('ingredients-content');
});

document.getElementById('ingredient-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const ingredient = {
        id: appData.editingIngredientId || Date.now(),
        name: document.getElementById('ingredient-name').value,
        brand: document.getElementById('ingredient-brand').value,
        unit: document.getElementById('ingredient-unit').value,
        price: parseFloat(document.getElementById('ingredient-price').value),
        supplier: document.getElementById('ingredient-supplier').value
    };
    
    if (appData.editingIngredientId) {
        const index = appData.ingredients.findIndex(i => i.id === appData.editingIngredientId);
        appData.ingredients[index] = ingredient;
        showToast('Ingrediente atualizado com sucesso!', 'success');
    } else {
        appData.ingredients.push(ingredient);
        showToast('Ingrediente adicionado com sucesso!', 'success');
    }
    
    saveData();
    updateDashboard();
    showContent('ingredients-content');
    renderIngredientsList();
});

function renderIngredientsList() {
    const tbody = document.getElementById('ingredients-tbody');
    tbody.innerHTML = '';
    
    appData.ingredients.forEach(ingredient => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${ingredient.name}</td>
            <td>${ingredient.brand || '-'}</td>
            <td>R$ ${ingredient.price.toFixed(2)}</td>
            <td>${ingredient.supplier || '-'}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editIngredient(${ingredient.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteIngredient(${ingredient.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editIngredient(id) {
    const ingredient = appData.ingredients.find(i => i.id === id);
    if (!ingredient) return;
    
    appData.editingIngredientId = id;
    document.getElementById('ingredient-form-title').textContent = 'Editar Ingrediente';
    document.getElementById('ingredient-name').value = ingredient.name;
    document.getElementById('ingredient-brand').value = ingredient.brand;
    document.getElementById('ingredient-unit').value = ingredient.unit;
    document.getElementById('ingredient-price').value = ingredient.price;
    document.getElementById('ingredient-supplier').value = ingredient.supplier;
    
    showContent('ingredient-form-content');
}

function deleteIngredient(id) {
    showDeleteModal(`Tem certeza que deseja excluir este ingrediente?`, () => {
        appData.ingredients = appData.ingredients.filter(i => i.id !== id);
        saveData();
        updateDashboard();
        renderIngredientsList();
        showToast('Ingrediente excluído com sucesso!', 'success');
    });
}

// Pesquisa de produtos (API Ninjas - simulada)
document.getElementById('search-product-btn').addEventListener('click', () => {
    const searchTerm = document.getElementById('product-search').value;
    if (!searchTerm) {
        showToast('Digite um nome de produto!', 'warning');
        return;
    }
    
    // Simulação de busca
    const results = [
        { name: `${searchTerm} Premium`, price: 25.90 },
        { name: `${searchTerm} Econômico`, price: 15.50 },
        { name: `${searchTerm} Importado`, price: 45.00 }
    ];
    
    const resultsDiv = document.getElementById('search-results');
    resultsDiv.innerHTML = '';
    
    results.forEach(result => {
        const div = document.createElement('div');
        div.className = 'search-result-item';
        div.innerHTML = `
            <strong>${result.name}</strong> - R$ ${result.price.toFixed(2)}
        `;
        div.addEventListener('click', () => {
            document.getElementById('ingredient-name').value = result.name;
            document.getElementById('ingredient-price').value = result.price;
            resultsDiv.innerHTML = '';
        });
        resultsDiv.appendChild(div);
    });
    
    showToast('Produtos encontrados!', 'success');
});

// ===========================
// CUSTOS FIXOS
// ===========================

document.getElementById('new-fixed-cost-btn').addEventListener('click', () => {
    appData.editingFixedCostId = null;
    document.getElementById('fixed-cost-form-title').textContent = 'Novo Custo Fixo';
    document.getElementById('fixed-cost-form').reset();
    showContent('fixed-cost-form-content');
});

document.getElementById('cancel-fixed-cost-btn').addEventListener('click', () => {
    showContent('fixed-costs-content');
});

document.getElementById('fixed-cost-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const fixedCost = {
        id: appData.editingFixedCostId || Date.now(),
        name: document.getElementById('fixed-cost-name').value,
        value: parseFloat(document.getElementById('fixed-cost-value').value)
    };
    
    if (appData.editingFixedCostId) {
        const index = appData.fixedCosts.findIndex(c => c.id === appData.editingFixedCostId);
        appData.fixedCosts[index] = fixedCost;
        showToast('Custo fixo atualizado com sucesso!', 'success');
    } else {
        appData.fixedCosts.push(fixedCost);
        showToast('Custo fixo adicionado com sucesso!', 'success');
    }
    
    saveData();
    updateDashboard();
    showContent('fixed-costs-content');
    renderFixedCostsList();
});

function renderFixedCostsList() {
    const tbody = document.getElementById('fixed-costs-tbody');
    tbody.innerHTML = '';
    
    appData.fixedCosts.forEach(cost => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cost.name}</td>
            <td>R$ ${cost.value.toFixed(2)}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editFixedCost(${cost.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteFixedCost(${cost.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editFixedCost(id) {
    const cost = appData.fixedCosts.find(c => c.id === id);
    if (!cost) return;
    
    appData.editingFixedCostId = id;
    document.getElementById('fixed-cost-form-title').textContent = 'Editar Custo Fixo';
    document.getElementById('fixed-cost-name').value = cost.name;
    document.getElementById('fixed-cost-value').value = cost.value;
    
    showContent('fixed-cost-form-content');
}

function deleteFixedCost(id) {
    showDeleteModal(`Tem certeza que deseja excluir este custo fixo?`, () => {
        appData.fixedCosts = appData.fixedCosts.filter(c => c.id !== id);
        saveData();
        updateDashboard();
        renderFixedCostsList();
        showToast('Custo fixo excluído com sucesso!', 'success');
    });
}

// ===========================
// RECEITAS
// ===========================

document.getElementById('new-recipe-btn').addEventListener('click', () => {
    appData.editingRecipeId = null;
    document.getElementById('recipe-form-title').textContent = 'Nova Receita';
    document.getElementById('recipe-form').reset();
    document.getElementById('recipe-ingredients-list').innerHTML = '';
    addRecipeIngredientField();
    showContent('recipe-form-content');
});

document.getElementById('cancel-recipe-btn').addEventListener('click', () => {
    showContent('recipes-content');
});

function addRecipeIngredientField() {
    const list = document.getElementById('recipe-ingredients-list');
    const div = document.createElement('div');
    div.className = 'ingredient-item';
    div.innerHTML = `
        <select class="ingredient-select" required>
            <option value="">Selecione um ingrediente...</option>
            ${appData.ingredients.map(ing => `<option value="${ing.id}">${ing.name}</option>`).join('')}
        </select>
        <input type="number" class="ingredient-quantity" placeholder="Quantidade" step="0.01" required>
        <button type="button" class="remove-ingredient-btn">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    div.querySelector('.remove-ingredient-btn').addEventListener('click', () => {
        div.remove();
    });
    
    list.appendChild(div);
}

document.getElementById('add-ingredient-btn').addEventListener('click', (e) => {
    e.preventDefault();
    addRecipeIngredientField();
});

document.getElementById('recipe-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const ingredientItems = document.querySelectorAll('.ingredient-item');
    const ingredients = [];
    
    ingredientItems.forEach(item => {
        const ingredientId = parseInt(item.querySelector('.ingredient-select').value);
        const quantity = parseFloat(item.querySelector('.ingredient-quantity').value);
        
        if (ingredientId && quantity) {
            ingredients.push({ ingredientId, quantity });
        }
    });
    
    if (ingredients.length === 0) {
        showToast('Adicione pelo menos um ingrediente!', 'warning');
        return;
    }
    
    const recipe = {
        id: appData.editingRecipeId || Date.now(),
        name: document.getElementById('recipe-name').value,
        yield: parseInt(document.getElementById('recipe-yield').value),
        ingredients: ingredients
    };
    
    if (appData.editingRecipeId) {
        const index = appData.recipes.findIndex(r => r.id === appData.editingRecipeId);
        appData.recipes[index] = recipe;
        showToast('Receita atualizada com sucesso!', 'success');
    } else {
        appData.recipes.push(recipe);
        showToast('Receita adicionada com sucesso!', 'success');
    }
    
    saveData();
    updateDashboard();
    showContent('recipes-content');
    renderRecipesList();
});

function renderRecipesList() {
    const tbody = document.getElementById('recipes-tbody');
    tbody.innerHTML = '';
    
    appData.recipes.forEach(recipe => {
        const cost = calculateRecipeCost(recipe);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${recipe.name}</td>
            <td>${recipe.yield} unidades</td>
            <td>R$ ${cost.toFixed(2)}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="viewRecipeDetails(${recipe.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteRecipe(${recipe.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function calculateRecipeCost(recipe) {
    let totalCost = 0;
    recipe.ingredients.forEach(item => {
        const ingredient = appData.ingredients.find(i => i.id === item.ingredientId);
        if (ingredient) {
            totalCost += ingredient.price * item.quantity;
        }
    });
    return totalCost;
}

function viewRecipeDetails(id) {
    const recipe = appData.recipes.find(r => r.id === id);
    if (!recipe) return;
    
    appData.currentRecipeId = id;
    
    document.getElementById('recipe-details-title').textContent = recipe.name;
    
    // Ingredientes
    const ingredientsDiv = document.getElementById('recipe-ingredients-details');
    ingredientsDiv.innerHTML = '';
    
    recipe.ingredients.forEach(item => {
        const ingredient = appData.ingredients.find(i => i.id === item.ingredientId);
        if (ingredient) {
            const cost = ingredient.price * item.quantity;
            const div = document.createElement('div');
            div.className = 'ingredient-detail';
            div.innerHTML = `
                <strong>${ingredient.name}</strong>
                <span>${item.quantity} ${ingredient.unit} - R$ ${cost.toFixed(2)}</span>
            `;
            ingredientsDiv.appendChild(div);
        }
    });
    
    // Custos
    const totalCost = calculateRecipeCost(recipe);
    const unitCost = totalCost / recipe.yield;
    const suggestedPrice = unitCost * 2.5; // Margem de 150%
    
    document.getElementById('recipe-total-cost').textContent = `R$ ${totalCost.toFixed(2)}`;
    document.getElementById('recipe-unit-cost').textContent = `R$ ${unitCost.toFixed(2)}`;
    document.getElementById('recipe-suggested-price').textContent = `R$ ${suggestedPrice.toFixed(2)}`;
    
    showContent('recipe-details-content');
}

document.getElementById('edit-recipe-btn').addEventListener('click', () => {
    const recipe = appData.recipes.find(r => r.id === appData.currentRecipeId);
    if (!recipe) return;
    
    appData.editingRecipeId = recipe.id;
    document.getElementById('recipe-form-title').textContent = 'Editar Receita';
    document.getElementById('recipe-name').value = recipe.name;
    document.getElementById('recipe-yield').value = recipe.yield;
    
    const list = document.getElementById('recipe-ingredients-list');
    list.innerHTML = '';
    
    recipe.ingredients.forEach(item => {
        const div = document.createElement('div');
        div.className = 'ingredient-item';
        div.innerHTML = `
            <select class="ingredient-select" required>
                <option value="">Selecione um ingrediente...</option>
                ${appData.ingredients.map(ing => `<option value="${ing.id}" ${ing.id === item.ingredientId ? 'selected' : ''}>${ing.name}</option>`).join('')}
            </select>
            <input type="number" class="ingredient-quantity" value="${item.quantity}" step="0.01" required>
            <button type="button" class="remove-ingredient-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        div.querySelector('.remove-ingredient-btn').addEventListener('click', () => {
            div.remove();
        });
        
        list.appendChild(div);
    });
    
    showContent('recipe-form-content');
});

document.getElementById('delete-recipe-btn').addEventListener('click', () => {
    showDeleteModal(`Tem certeza que deseja excluir esta receita?`, () => {
        appData.recipes = appData.recipes.filter(r => r.id !== appData.currentRecipeId);
        saveData();
        updateDashboard();
        showContent('recipes-content');
        renderRecipesList();
        showToast('Receita excluída com sucesso!', 'success');
    });
});

document.getElementById('back-to-recipes-btn').addEventListener('click', () => {
    showContent('recipes-content');
});

function deleteRecipe(id) {
    showDeleteModal(`Tem certeza que deseja excluir esta receita?`, () => {
        appData.recipes = appData.recipes.filter(r => r.id !== id);
        saveData();
        updateDashboard();
        renderRecipesList();
        showToast('Receita excluída com sucesso!', 'success');
    });
}

// ===========================
// CONFIGURAÇÕES
// ===========================

function updateSettings() {
    document.getElementById('settings-username').textContent = appData.user.name;
    document.getElementById('settings-email').textContent = appData.user.email;
}

// Dark Mode / Light Mode
document.getElementById('light-mode-btn').addEventListener('click', () => {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
    updateThemeButtons();
    showToast('Tema claro ativado!', 'success');
});

document.getElementById('dark-mode-btn').addEventListener('click', () => {
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
    updateThemeButtons();
    showToast('Tema escuro ativado!', 'success');
});

function updateThemeButtons() {
    const isDark = document.body.classList.contains('dark-mode');
    document.getElementById('light-mode-btn').classList.toggle('active', !isDark);
    document.getElementById('dark-mode-btn').classList.toggle('active', isDark);
}

// ViaCEP
document.getElementById('search-cep-btn').addEventListener('click', () => {
    const cep = document.getElementById('cep-input').value.replace(/\D/g, '');
    
    if (cep.length !== 8) {
        showToast('CEP inválido!', 'warning');
        return;
    }
    
    // Simulação de busca ViaCEP
    const mockAddresses = {
        '01310100': { rua: 'Avenida Paulista', bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP' },
        '20040020': { rua: 'Avenida Rio Branco', bairro: 'Centro', cidade: 'Rio de Janeiro', estado: 'RJ' },
        '30130100': { rua: 'Avenida Getúlio Vargas', bairro: 'Funcionários', cidade: 'Belo Horizonte', estado: 'MG' }
    };
    
    const address = mockAddresses[cep] || {
        rua: 'Rua Exemplo',
        bairro: 'Bairro Exemplo',
        cidade: 'Cidade Exemplo',
        estado: 'EX'
    };
    
    const addressDiv = document.getElementById('address-info');
    addressDiv.innerHTML = `
        <p><strong>Rua:</strong> ${address.rua}</p>
        <p><strong>Bairro:</strong> ${address.bairro}</p>
        <p><strong>Cidade:</strong> ${address.cidade}</p>
        <p><strong>Estado:</strong> ${address.estado}</p>
    `;
    addressDiv.classList.add('show');
    
    showToast('Endereço encontrado!', 'success');
});

// ===========================
// MODAIS E NOTIFICAÇÕES
// ===========================

function showDeleteModal(message, onConfirm) {
    document.getElementById('delete-message').textContent = message;
    document.getElementById('delete-modal').classList.add('active');
    
    document.getElementById('confirm-delete-btn').onclick = () => {
        onConfirm();
        document.getElementById('delete-modal').classList.remove('active');
    };
}

document.getElementById('cancel-delete-btn').addEventListener('click', () => {
    document.getElementById('delete-modal').classList.remove('active');
});

document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('delete-modal').classList.remove('active');
    });
});

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===========================
// INICIALIZAÇÃO
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    loadTheme();
    updateThemeButtons();
    
    // Adicionar alguns dados de exemplo
    if (appData.ingredients.length === 0) {
        appData.ingredients = [
            { id: 1, name: 'Farinha de Trigo', brand: 'Integral', unit: 'kg', price: 8.50, supplier: 'Fornecedor A' },
            { id: 2, name: 'Açúcar Cristal', brand: 'União', unit: 'kg', price: 4.20, supplier: 'Fornecedor B' },
            { id: 3, name: 'Ovos', brand: 'Granja X', unit: 'dúzia', price: 12.00, supplier: 'Fornecedor C' },
            { id: 4, name: 'Manteiga', brand: 'Aviação', unit: 'kg', price: 35.00, supplier: 'Fornecedor A' }
        ];
        saveData();
    }
});
