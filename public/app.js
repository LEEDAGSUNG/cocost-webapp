// 로그인 처리
const loginBtn = document.getElementById('login-btn');
loginBtn.addEventListener('click', () => {
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('error-msg');

  if (password === '0302') {
    document.querySelector('.auth-mode').style.display = 'none';
    document.querySelector('.main-wrapper').style.display = 'flex';
  } else {
    errorMsg.textContent = '비밀번호가 틀렸습니다.';
  }
});

// 사이드바 인터랙션
const sidebarItems = document.querySelectorAll('.sidebar-item');
const contentArea = document.getElementById('content');

// 페이지 템플릿에서 콘텐츠 불러오기
const loadTemplate = (pageId) => {
  if (pageId === 'recipes') {
    initRecipes();
    return;
  }
  if (pageId === 'history') {
    initHistory();
    return;
  }

  const template = document.getElementById(pageId);
  if (template) {
    contentArea.innerHTML = template.innerHTML;
    if (pageId === 'fridge') initFridge();
    if (pageId === 'cost') initCost && initCost();
    if (pageId === 'dashboard') initDashboard && initDashboard();
    if (pageId === 'coffee') initCoffee && initCoffee();
  } else {
    contentArea.innerHTML = `<h2>${pageId}</h2><p>이 페이지는 아직 준비 중입니다.</p>`;
  }
};

sidebarItems.forEach(item => {
  item.addEventListener('click', () => {
    sidebarItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    const page = item.getAttribute('data-page');
    loadTemplate(page);
  });
});

// 기본 페이지 로드
function initDashboard() {
  const dashboard = document.getElementById('content');
  const fridgeData = JSON.parse(localStorage.getItem('fridgeItems') || '[]');
  const costData = JSON.parse(localStorage.getItem('costItems') || '[]');

  const statFridge = document.getElementById('stat-fridge');
  const statCost = document.getElementById('stat-cost');
  if (statFridge) statFridge.textContent = `${fridgeData.length}개`;
  if (statCost) statCost.textContent = `${costData.length}개`;

  // 🔄 보관 위치 차트 그리기
  const fridgeChart = document.getElementById('fridge-chart');
  if (fridgeChart) {
    const ctx = fridgeChart.getContext('2d');
    const counts = { 냉장: 0, 냉동: 0, 실온: 0 };
    fridgeData.forEach(item => {
      const loc = item.location;
      if (counts[loc] !== undefined) counts[loc]++;
    });
    const total = counts.냉장 + counts.냉동 + counts.실온;
    const data = [counts.냉장, counts.냉동, counts.실온];
    const colors = ['#4fc3f7', '#81c784', '#ffd54f'];
    const labels = ['냉장', '냉동', '실온'];

    let startAngle = -0.5 * Math.PI;
    data.forEach((value, i) => {
      const angle = (value / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(100, 100);
      ctx.arc(100, 100, 80, startAngle, startAngle + angle);
      ctx.closePath();
      ctx.fillStyle = colors[i];
      ctx.fill();
      startAngle += angle;
    });
    ctx.beginPath();
    ctx.arc(100, 100, 40, 0, 2 * Math.PI);
    ctx.fillStyle = '#fafafa';
    ctx.fill();
  }
}

function initFridge() {
  const form = document.getElementById('fridge-form');
  const list = document.getElementById('fridge-list');

  const saveToLocalStorage = () => {
    const data = [];
    list.querySelectorAll('tr').forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 4) {
        data.push({
          name: cells[0].textContent,
          qty: cells[1].textContent,
          location: cells[2].textContent,
          exp: cells[3].textContent
        });
      }
    });
    localStorage.setItem('fridgeItems', JSON.stringify(data));
    addToHistory('식자재 항목 저장됨');
  };

  const loadFromLocalStorage = () => {
    const saved = JSON.parse(localStorage.getItem('fridgeItems') || '[]');
    saved.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.qty}</td>
        <td>${item.location}</td>
        <td>${item.exp}</td>
        <td><button class="delete-btn">삭제</button></td>
      `;
      row.querySelector('.delete-btn').addEventListener('click', () => {
        row.remove();
        saveToLocalStorage();
      });
      list.appendChild(row);
    });
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('item-name').value;
    const qty = parseFloat(document.getElementById('item-qty').value);
    const unit = document.getElementById('item-unit').value;
    const location = document.getElementById('item-location').value;
    const exp = document.getElementById('item-exp').value;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${name}</td>
      <td>${qty}${unit}</td>
      <td>${location}</td>
      <td>${exp}</td>
      <td><button class="delete-btn">삭제</button></td>
    `;
    row.querySelector('.delete-btn').addEventListener('click', () => {
      row.remove();
      saveToLocalStorage();
    });

    list.appendChild(row);
    form.reset();
    saveToLocalStorage();
  });

  loadFromLocalStorage();
}

function initCost() {
  const form = document.getElementById('cost-form');
  const list = document.getElementById('cost-list');

  const saveCostToLocalStorage = () => {
    const data = [];
    list.querySelectorAll('tr').forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length === 5 || cells.length === 6) {
        data.push({
          name: cells[0].textContent,
          price: cells[1].textContent,
          qty: cells[2].textContent,
          unit: cells[3].textContent,
          unitCost: cells[4].textContent
        });
      }
    });
    localStorage.setItem('costItems', JSON.stringify(data));
    addToHistory('코스트 항목 저장됨');
  };

  const loadCostFromLocalStorage = () => {
    const saved = JSON.parse(localStorage.getItem('costItems') || '[]');
    saved.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.price}</td>
        <td>${item.qty}</td>
        <td>${item.unit}</td>
        <td>${item.unitCost}</td>
        <td><button class="delete-btn">삭제</button></td>
      `;
      row.querySelector('.delete-btn').addEventListener('click', () => {
        row.remove();
        saveCostToLocalStorage();
      });
      list.appendChild(row);
    });
  };

  loadCostFromLocalStorage();

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('cost-name').value;
    const price = parseFloat(document.getElementById('cost-price').value);
    const qty = parseFloat(document.getElementById('cost-qty').value);
    const unit = document.getElementById('cost-unit').value;

    if (!name || isNaN(price) || isNaN(qty) || qty <= 0) return;

    const unitCost = (price / qty).toFixed(1);

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${name}</td>
      <td>${price.toLocaleString()}원</td>
      <td>${qty}</td>
      <td>${unit}</td>
      <td>${unitCost}원</td>
      <td><button class="delete-btn">삭제</button></td>
    `;

    row.querySelector('.delete-btn').addEventListener('click', () => {
      row.remove();
      saveCostToLocalStorage();
    });

    list.appendChild(row);
    form.reset();
    saveCostToLocalStorage();
  });
}

function initCoffee() {
  const form = document.getElementById('coffee-form');
  const list = document.getElementById('coffee-list');

  const saveCoffeeToLocalStorage = (data) => {
    localStorage.setItem('coffeeMachine', JSON.stringify(data));
    addToHistory('커피 항목 저장됨');
  };

  const loadCoffeeFromLocalStorage = () => {
    const saved = JSON.parse(localStorage.getItem('coffeeMachine') || '{}');
    if (!saved || !saved.beans) return { machineName: '', settings: {}, beans: [] };
    return saved;
  };

  const renderBeans = (data) => {
    list.innerHTML = '';
    data.beans.forEach((bean, index) => {
      const row = document.createElement('tr');
      const unitCost = (bean.price / bean.weight).toFixed(1);
      row.innerHTML = `
        <td>${bean.name}</td>
        <td>${bean.weight}g</td>
        <td>${bean.price.toLocaleString()}원</td>
        <td>${unitCost}원</td>
        <td>${bean.roasted}</td>
        <td><button class="delete-btn">삭제</button></td>
      `;
      row.querySelector('.delete-btn').addEventListener('click', () => {
        data.beans.splice(index, 1);
        saveCoffeeToLocalStorage(data);
        renderBeans(data);
      });
      list.appendChild(row);
    });
  };

  const data = loadCoffeeFromLocalStorage();
  renderBeans(data);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    data.machineName = document.getElementById('machine-name').value;
    data.settings = {
      steamPosition: document.getElementById('steam-position').value,
      espressoPosition: document.getElementById('espresso-position').value
    };
    data.beans.push({
      name: document.getElementById('bean-name').value,
      weight: parseFloat(document.getElementById('bean-weight').value),
      price: parseFloat(document.getElementById('bean-price').value),
      roasted: document.getElementById('bean-roastdate').value
    });
    saveCoffeeToLocalStorage(data);
    renderBeans(data);
    form.reset();
  });
}

function initHistory() {
  const template = document.getElementById("history");
  contentArea.innerHTML = template.innerHTML; // 템플릿 먼저 렌더링

  const list = document.getElementById("usage-history");
  list.innerHTML = "";

  const history = JSON.parse(localStorage.getItem("usageHistory") || "[]");
  if (history.length === 0) {
    list.innerHTML = "<li>기록된 내역이 없습니다.</li>";
    return;
  }

  history.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
}


function addToHistory(message) {
  const history = JSON.parse(localStorage.getItem('usageHistory') || '[]');
  const now = new Date().toLocaleString('ko-KR');
  history.unshift(`[${now}] ${message}`);
  localStorage.setItem('usageHistory', JSON.stringify(history.slice(0, 30)));
}

async function fetchRecipesFromSpoonacular(ingredients) {
  const apiKey = '0839e07f40c74dc5b389405120271ad0';
  const query = ingredients.join(',');
  const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${query}&number=6&ranking=1&ignorePantry=true&apiKey=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('레시피 불러오기 실패:', err);
    return [];
  }
}

async function initRecipes() {
  const savedItems = JSON.parse(localStorage.getItem('fridgeItems') || '[]');
  const ingredientNames = savedItems.map(i => i.name);
  const content = document.getElementById('content');

  if (ingredientNames.length === 0) {
    content.innerHTML = `<h2>🥘 AI 레시피 추천</h2><p>냉장고에 등록된 재료가 없어요.</p>`;
    return;
  }

  const recipes = await fetchRecipesFromSpoonacular(ingredientNames);
  const section = document.createElement('div');
  section.className = 'recipe-section';

  if (recipes.length === 0) {
    section.innerHTML = '<p>추천할 수 있는 레시피가 없습니다.</p>';
    addToHistory('레시피 추천 결과 없음');
  } else {
    addToHistory(`레시피 ${recipes.length}개 추천받음`);
    recipes.forEach(recipe => {
      const card = document.createElement('div');
      card.className = 'recipe-card';
      card.style.cursor = 'pointer';
      card.onclick = () => {
        const url = `https://spoonacular.com/recipes/${encodeURIComponent(recipe.title)}-${recipe.id}`;
        window.open(url, '_blank');
      };
      card.innerHTML = `
        <img src="${recipe.image}" style="width:100%; border-radius:8px; margin-bottom:10px;" />
        <h3>${recipe.title}</h3>
        <p>✔ 보유 재료: ${recipe.usedIngredientCount}개</p>
        <p>✖ 부족한 재료: ${recipe.missedIngredientCount}개</p>
      `;
      section.appendChild(card);
    });
  }

  content.innerHTML = `<h2>🥘 AI 레시피 추천</h2>`;
  content.appendChild(section);
}

window.addEventListener('DOMContentLoaded', () => {
  const defaultItem = document.querySelector('.sidebar-item[data-page="dashboard"]');
  if (defaultItem) defaultItem.click();
});
