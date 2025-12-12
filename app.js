'use strict';

/* =========================
   1) المتغيرات والبيانات العامة
   ========================= */

let user = null;          // بيانات المستخدم
let transactions = [];    // المعاملات (دخل/مصروف)
let budgets = [];         // الميزانيات لكل فئة

// فئات المصروف
const expenseCategories = [
  'إيجار',
  'طعام',
  'كهرباء',
  'ماء',
  'غاز',
  'نقل',
  'تسوق',
  'صحة',
  'تعليم',
  'ترفيه'
];

// فئات الدخل
const incomeCategories = [
  'راتب',
  'هدية',
  'استثمار',
  'عمل حر',
  'أخرى'
];

/* =========================
   2) تحميل البيانات من localStorage
   ========================= */

function loadData() {
  const savedUser = localStorage.getItem('finsmart_user');
  const savedTransactions = localStorage.getItem('finsmart_transactions');
  const savedBudgets = localStorage.getItem('finsmart_budgets');

  if (savedUser) {
    user = JSON.parse(savedUser);
  }

  // إذا فيه بيانات محفوظة نستخدمها، غير كذا بيانات تجريبية
  transactions = savedTransactions
    ? JSON.parse(savedTransactions)
    : getSampleTransactions();

  budgets = savedBudgets
    ? JSON.parse(savedBudgets)
    : getSampleBudgets();
}

// بيانات معاملات تجريبية
function getSampleTransactions() {
  return [
    {
      id: '1',
      type: 'expense',
      category: 'إيجار',
      amount: 500,
      description: 'دفع إيجار',
      date: '2025-11-20'
    },
    {
      id: '2',
      type: 'expense',
      category: 'طعام',
      amount: 200,
      description: 'شراء طعام',
      date: '2025-11-21'
    },
    {
      id: '3',
      type: 'income',
      category: 'راتب',
      amount: 10000,
      description: 'راتب شهري',
      date: '2025-11-01'
    }
  ];
}

// بيانات ميزانيات تجريبية
function getSampleBudgets() {
  return [
    { id: '1', category: 'إيجار', limit: 2000, spent: 500 },
    { id: '2', category: 'طعام', limit: 1000, spent: 200 },
    { id: '3', category: 'راتب', limit: 800, spent: 0 }
  ];
}

/* =========================
   3) حفظ البيانات في localStorage
   ========================= */

function saveData() {
  localStorage.setItem('finsmart_transactions', JSON.stringify(transactions));
  localStorage.setItem('finsmart_budgets', JSON.stringify(budgets));
}

/* =========================
   4) تسجيل الدخول والخروج
   ========================= */

// معالجة نموذج تسجيل الدخول
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();

    if (!name || !email) {
      alert('يرجى إدخال الاسم والبريد الإلكتروني');
      return;
    }

    user = { name, email };
    localStorage.setItem('finsmart_user', JSON.stringify(user));

    showMainApp();
  });
}

// عرض واجهة التطبيق بعد تسجيل الدخول
function showMainApp() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('mainApp').classList.remove('hidden');

  document.getElementById('welcomeText').textContent = مرحباً ${user.name};

  // تحديث كل الواجهة
  refreshUI();
}

// تسجيل الخروج
function logout() {
  localStorage.removeItem('finsmart_user');
  location.reload();
}

/* =========================
   5) التبويبات (Tabs)
   ========================= */

function showTab(tabName, event) {
  // إخفاء كل التبويبات
  document.querySelectorAll('.tab-content').forEach((tab) => {
    tab.classList.add('hidden');
  });

  // إزالة active من كل الأزرار
  document.querySelectorAll('.tab').forEach((btn) => {
    btn.classList.remove('active');
  });

  // عرض التبويب المطلوب
  const tabElement = document.getElementById(${tabName}Tab);
  if (tabElement) {
    tabElement.classList.remove('hidden');
  }

  // تفعيل الزر الذي تم الضغط عليه
  if (event && event.target) {
    event.target.classList.add('active');
  }
}

/* =========================
   6) تحديث الواجهة كاملة
   ========================= */

function refreshUI() {
  updateDashboard();
  updateTransactionsList();
  updateBudgetsList();
  updateReports();
  updateCategories();
}

/* =========================
   7) لوحة التحكم (Dashboard)
   ========================= */

function updateDashboard() {
  // إجمالي الدخل
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // إجمالي المصروف
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // الرصيد
  const netBalance = totalIncome - totalExpenses;

  // إجمالي الميزانية
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);

  // المتبقي من الميزانية
  const budgetRemaining = totalBudget - totalExpenses;

  // عرض الأرقام في الواجهة
  document.getElementById('totalIncome').textContent = totalIncome.toFixed(2);
  document.getElementById('totalExpenses').textContent = totalExpenses.toFixed(2);
  document.getElementById('netBalance').textContent = netBalance.toFixed(2);
  document.getElementById('budgetRemaining').textContent =
    budgetRemaining.toFixed(2);

  // عرض آخر المعاملات
  updateRecentTransactions();
}

// عرض آخر 5 معاملات
function updateRecentTransactions() {
  const recentDiv = document.getElementById('recentTransactions');
  if (!recentDiv) return;

  const recent = transactions.slice(-5).reverse();

  if (recent.length === 0) {
    recentDiv.innerHTML =
      '<p class="text-gray-500 text-center py-4">لا توجد معاملات بعد</p>';
    return;
  }

  recentDiv.innerHTML = recent
    .map(
      (t) => `
      <div class="flex items-center justify-between p-4 bg-green-50 rounded-xl">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 grid place-items-center rounded-full text-white font-bold
            ${t.type === 'income' ? 'bg-green-500' : 'bg-red-500'}">
            ${t.category.charAt(0)}
          </div>
          <div>
            <h4 class="font-bold text-gray-800">${t.description}</h4>
            <p class="text-sm text-gray-600">
              ${new Date(t.date).toLocaleDateString('ar-SA')}
            </p>
          </div>
        </div>
        <p class="font-bold text-gray-800">${t.amount.toFixed(2)} ر.س</p>
      </div>
    `
    )
    .join('');
}

/* =========================
   8) قائمة المعاملات
   ========================= */

function updateTransactionsList() {
  const filterSelect = document.getElementById('filterCategory');
  const filterValue = filterSelect ? filterSelect.value : '';
  const listDiv = document.getElementById('transactionsList');
  if (!listDiv) return;

  // فلترة حسب الفئة (إن وُجدت)
  const filtered = filterValue
    ? transactions.filter((t) => t.category === filterValue)
    : transactions;

  if (filtered.length === 0) {
    listDiv.innerHTML =
      '<p class="text-gray-500 text-center py-6">لا توجد معاملات</p>';
    return;
  }

  // ترتيب حسب التاريخ (الأحدث أولاً)
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // عرض المعاملات
  listDiv.innerHTML = sorted
    .map(
      (t) => `
      <div class="flex justify-between p-4 bg-green-50 rounded-xl group">
        <div class="flex items-center gap-3 flex-1">
          <div class="w-12 h-12 grid place-items-center rounded-full text-white font-bold
            ${t.type === 'income' ? 'bg-green-500' : 'bg-red-500'}">
            ${t.category.charAt(0)}
          </div>

          <div class="flex-1">
            <h4 class="font-bold text-gray-800">${t.description}</h4>
            <div class="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <span class="${t.type === 'income' ? 'badge-income' : 'badge-expense'}">
                ${t.type === 'income' ? 'دخل' : 'مصروف'}
              </span>
              <span>${t.category}</span>
              <span>${new Date(t.date).toLocaleDateString('ar-SA')}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <p class="font-bold text-gray-800">${t.amount.toFixed(2)} ر.س</p>

          <button
            onclick="deleteTransaction('${t.id}')"
            class="btn btn-secondary opacity-0 group-hover:opacity-100 transition-opacity"
          >
            حذف
          </button>
        </div>
      </div>
    `
    )
    .join('');
}

// حذف معاملة
function deleteTransaction(id) {
  const transaction = transactions.find((t) => t.id === id);

  if (!transaction) {
    console.error('المعاملة غير موجودة');
    return;
  }

  // تعديل الميزانية لو كانت المعاملة مصروف
  if (transaction.type === 'expense') {
    const budget = budgets.find((b) => b.category === transaction.category);

    if (budget) {
      budget.spent -= transaction.amount;
      if (budget.spent < 0) budget.spent = 0;
    }
  }

  // حذف المعاملة
  transactions = transactions.filter((t) => t.id !== id);

  // حفظ وتحديث
  saveData();
  refreshUI();
}

/* =========================
   9) قائمة الميزانيات
   ========================= */

function updateBudgetsList() {
  const listDiv = document.getElementById('budgetsList');
  if (!listDiv) return;

  if (budgets.length === 0) {
    listDiv.innerHTML = `
      <div class="col-span-2 text-center py-12">
        <p class="text-gray-500">لم يتم إضافة ميزانية بعد</p>
      </div>
    `;
    return;
  }

  listDiv.innerHTML = budgets
    .map((b) => {
      const percentage = (b.spent / b.limit) * 100;

      let color = 'green';
      if (percentage >= 100) color = 'red';
      else if (percentage >= 80) color = 'orange';

      const statusText =
        percentage >= 100
          ? '● تم تجاوز الميزانية'
          : percentage >= 80
          ? '● اقتربت من الحد'
          : '● ضمن الميزانية';

      return `
        <div class="card p-4 rounded-xl bg-white shadow">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h4 class="font-bold text-gray-800">${b.category}</h4>
              <p class="text-sm text-gray-600">الحد: ${b.limit.toFixed(2)} ر.س</p>
              <p class="text-sm text-gray-600">المصروف: ${b.spent.toFixed(2)} ر.س</p>
            </div>

            <button onclick="deleteBudget('${b.id}')"
              class="text-red-600 hover:bg-red-50 p-2 rounded">
              حذف
            </button>
          </div>

          <div class="progress-bar w-full h-3 bg-gray-200 rounded mb-3">
            <div class="progress-fill h-full rounded"
              style="
                width: ${Math.min(percentage, 100)}%;
                background: ${
                  color === 'red'
                    ? 'linear-gradient(to right, #ef4444, #dc2626)'
                    : color === 'orange'
                    ? 'linear-gradient(to right, #f59e0b, #d97706)'
                    : 'linear-gradient(to right, #10b981, #14b8a6)'
                };
              ">
            </div>
          </div>

          <div class="flex justify-between text-sm text-gray-600">
            <span>${percentage.toFixed(1)}%</span>
            <span>${(b.limit - b.spent).toFixed(2)} ر.س متبقي</span>
          </div>

          <div class="mt-3 p-2 rounded text-sm ${
            color === 'red'
              ? 'bg-red-50 border border-red-200 text-red-700'
              : color === 'orange'
              ? 'bg-orange-50 border border-orange-200 text-orange-700'
              : 'bg-green-50 border border-green-200 text-green-700'
          }">
            ${statusText}
          </div>
        </div>
      `;
    })
    .join('');
}

// حذف ميزانية
function deleteBudget(id) {
  budgets = budgets.filter((b) => b.id !== id);
  saveData();
  refreshUI();
}

/* =========================
   10) إضافة ميزانية جديدة
   ========================= */

const addBudgetForm = document.getElementById('addBudgetForm');
if (addBudgetForm) {
  addBudgetForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const category = document.getElementById('budgetCategory').value;
    const limit = parseFloat(document.getElementById('budgetLimit').value);

    if (!category || !limit || limit <= 0) {
      alert('يرجى إدخال فئة وحد مناسب للميزانية');
      return;
    }

    // حساب المصروف الحالي لهذه الفئة
    const spent = transactions
      .filter((t) => t.type === 'expense' && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);

    const budget = {
      id: Date.now().toString(),
      category,
      limit,
      spent
    };

    budgets.push(budget);
    saveData();
    hideBudgetForm();
    refreshUI();
  });
}

// إخفاء نموذج إضافة الميزانية (تقدرين تعدلين حسب HTML عندك)
function hideBudgetForm() {
  const formContainer = document.getElementById('addBudgetContainer');
  if (formContainer) {
    formContainer.classList.add('hidden');
  }
}

/* =========================
   11) التقارير (Reports)
   ========================= */

function updateReports() {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const reportTransactions = document.getElementById('reportTransactions');
  const reportBudgets = document.getElementById('reportBudgets');
  const reportSavings = document.getElementById('reportSavings');

  if (reportTransactions) reportTransactions.textContent = transactions.length;
  if (reportBudgets) reportBudgets.textContent = budgets.length;
  if (reportSavings)
    reportSavings.textContent = savingsRate.toFixed(1) + '%';

  const statsTransactions = document.getElementById('statsTransactions');
  const statsBudgets = document.getElementById('statsBudgets');
  const statsIncome = document.getElementById('statsIncome');
  const statsExpenses = document.getElementById('statsExpenses');

  if (statsTransactions) statsTransactions.textContent = transactions.length;
  if (statsBudgets) statsBudgets.textContent = budgets.length;
  if (statsIncome)
    statsIncome.textContent = transactions.filter((t) => t.type === 'income').length;
  if (statsExpenses)
    statsExpenses.textContent = transactions.filter((t) => t.type === 'expense').length;
}

/* =========================
   12) تصدير البيانات (CSV و JSON)
   ========================= */

function exportCSV() {
  if (transactions.length === 0) {
    alert('لا توجد معاملات للتصدير');
    return;
  }

  const headers = ['التاريخ', 'النوع', 'الفئة', 'الوصف', 'المبلغ'];

  const rows = transactions.map((t) => [
    t.date,
    t.type === 'income' ? 'دخل' : 'مصروف',
    t.category,
    t.description,
    t.amount.toFixed(2)
  ]);

  let csvContent = headers.join(',') + '\n';
  csvContent += rows
    .map((row) => row.map((cell) => "${cell}").join(','))
    .join('\n');

  const blob = new Blob(['\ufeff' + csvContent], {
    type: 'text/csv;charset=utf-8;'
  });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `finsmart-report-${new Date()
    .toISOString()
    .split('T')[0]}.csv`;
  link.click();
}

function exportJSON() {
  const data = {
    exportDate: new Date().toISOString(),
    user,
    transactions,
    budgets
  };

  const jsonString = JSON.stringify(data, null, 2);

  const blob = new Blob([jsonString], {
    type: 'application/json'
  });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `finsmart-data-${new Date()
    .toISOString()
    .split('T')[0]}.json`;
  link.click();
}

/* =========================
   13) النسخ الاحتياطية
   ========================= */

function createBackup() {
  const backup = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    data: {
      user,
      transactions,
      budgets
    }
  };

  const jsonString = JSON.stringify(backup, null, 2);

  const blob = new Blob([jsonString], {
    type: 'application/json'
  });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `finsmart-backup-${new Date()
    .toISOString()
    .split('T')[0]}.json`;
  link.click();

  localStorage.setItem('finsmart_last_backup', new Date().toISOString());
  alert('تم إنشاء النسخة الاحتياطية بنجاح!');
}

/* =========================
   14) تحديث الفئات في القوائم (حسب HTML عندك)
   ========================= */

function updateCategories() {
  // هنا تضيفين تعبئة select للفئات إذا عندك نماذج دخل/مصروف
  // مثال بسيط (عدلي حسب الـ id في HTML):
  const expenseSelect = document.getElementById('expenseCategory');
  const incomeSelect = document.getElementById('incomeCategory');

  if (expenseSelect) {
    expenseSelect.innerHTML = expenseCategories
      .map((c) => <option value="${c}">${c}</option>)
      .join('');
  }

  if (incomeSelect) {
    incomeSelect.innerHTML = incomeCategories
      .map((c) => <option value="${c}">${c}</option>)
      .join('');
  }
}

/* =========================
   15) تهيئة التطبيق عند تحميل الصفحة
   ========================= */

window.addEventListener('DOMContentLoaded', () => {
  loadData();

  if (user) {
    showMainApp();
  }
});
