// البيانات
let user = null;
let transactions = [];
let budgets = [];

// الفئات
const expenseCategories = ['البقالة', 'المواصلات', 'الترفيه', 'المطاعم', 'التسوق', 'الفواتير', 'الصحة', 'أخرى'];
const incomeCategories = ['الراتب', 'عمل حر', 'استثمار', 'هدية', 'أخرى'];

// تحميل البيانات من localStorage
function loadData() {
    const savedUser = localStorage.getItem('finsmart_user');
    const savedTransactions = localStorage.getItem('finsmart_transactions');
    const savedBudgets = localStorage.getItem('finsmart_budgets');

    if (savedUser) {
        user = JSON.parse(savedUser);
        showMainApp();
    }

    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
    } else {
        // بيانات تجريبية
        transactions = [
            { id: '1', type: 'expense', category: 'البقالة', amount: 500, description: 'تسوق أسبوعي', date: '2025-11-20' },
            { id: '2', type: 'expense', category: 'المواصلات', amount: 200, description: 'بنزين', date: '2025-11-21' },
            { id: '3', type: 'income', category: 'الراتب', amount: 10000, description: 'راتب نوفمبر', date: '2025-11-01' }
        ];
    }

    if (savedBudgets) {
        budgets = JSON.parse(savedBudgets);
    } else {
        // ميزانيات تجريبية
        budgets = [
            { id: '1', category: 'البقالة', limit: 2000, spent: 500 },
            { id: '2', category: 'المواصلات', limit: 1000, spent: 200 },
            { id: '3', category: 'الترفيه', limit: 800, spent: 0 }
        ];
    }
}

// حفظ البيانات
function saveData() {
    localStorage.setItem('finsmart_transactions', JSON.stringify(transactions));
    localStorage.setItem('finsmart_budgets', JSON.stringify(budgets));
}

// تسجيل الدخول
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    
    user = { name, email };
    localStorage.setItem('finsmart_user', JSON.stringify(user));
    showMainApp();
});

// عرض التطبيق الرئيسي
function showMainApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('welcomeText').textContent = `مرحباً، ${user.name}`;
    updateDashboard();
    updateTransactionsList();
    updateBudgetsList();
    updateReports();
    updateCategories();
}

// تسجيل الخروج
function logout() {
    localStorage.removeItem('finsmart_user');
    location.reload();
}

// التبديل بين التبويبات
function showTab(tabName) {
    // إخفاء جميع التبويبات
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // إزالة active من جميع الأزرار
    document.querySelectorAll('.tab').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // عرض التبويب المطلوب
    document.getElementById(tabName + 'Tab').classList.remove('hidden');
    
    // إضافة active للزر
    event.target.classList.add('active');
}

// تحديث لوحة التحكم
function updateDashboard() {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpenses;
    const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
    const budgetRemaining = totalBudget - totalExpenses;

    document.getElementById('totalIncome').textContent = totalIncome.toFixed(2) + ' ر.س';
    document.getElementById('totalExpenses').textContent = totalExpenses.toFixed(2) + ' ر.س';
    document.getElementById('netBalance').textContent = netBalance.toFixed(2) + ' ر.س';
    document.getElementById('budgetRemaining').textContent = budgetRemaining.toFixed(2) + ' ر.س';

    // المعاملات الأخيرة
    const recentDiv = document.getElementById('recentTransactions');
    const recent = transactions.slice(-5).reverse();
    
    if (recent.length === 0) {
        recentDiv.innerHTML = '<p class="text-gray-500 text-center py-8">لا توجد معاملات بعد</p>';
    } else {
        recentDiv.innerHTML = recent.map(t => `
            <div class="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div class="flex items-center gap-3">
                    <div class="icon-box" style="background: linear-gradient(to bottom right, #10b981, #14b8a6);">
                        <span class="text-white font-bold">${t.category.charAt(0)}</span>
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-800">${t.description}</h4>
                        <div class="flex items-center gap-2 text-sm text-gray-600">
                            <span class="badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}">${t.type === 'income' ? 'دخل' : 'مصروف'}</span>
                            <span>${t.category}</span>
                        </div>
                    </div>
                </div>
                <div class="text-left">
                    <p class="font-bold text-gray-800">${t.amount.toFixed(2)} ر.س</p>
                    <p class="text-sm text-gray-600">${new Date(t.date).toLocaleDateString('ar-SA')}</p>
                </div>
            </div>
        `).join('');
    }
}

// عرض نموذج المعاملة
function showTransactionForm() {
    document.getElementById('transactionForm').classList.remove('hidden');
    document.getElementById('transactionDate').value = new Date().toISOString().split('T')[0];
}

function hideTransactionForm() {
    document.getElementById('transactionForm').classList.add('hidden');
    document.getElementById('addTransactionForm').reset();
}

// تحديث الفئات بناءً على النوع
function updateCategories() {
    const type = document.getElementById('transactionType').value;
    const categorySelect = document.getElementById('transactionCategory');
    const categories = type === 'expense' ? expenseCategories : incomeCategories;
    
    categorySelect.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    
    // تحديث فئات الميزانية
    const budgetCategorySelect = document.getElementById('budgetCategory');
    const usedCategories = budgets.map(b => b.category);
    const availableCategories = expenseCategories.filter(cat => !usedCategories.includes(cat));
    
    budgetCategorySelect.innerHTML = '<option value="">اختر فئة</option>' + 
        availableCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

// إضافة معاملة
document.getElementById('addTransactionForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const transaction = {
        id: Date.now().toString(),
        type: document.getElementById('transactionType').value,
        category: document.getElementById('transactionCategory').value,
        amount: parseFloat(document.getElementById('transactionAmount').value),
        description: document.getElementById('transactionDescription').value,
        date: document.getElementById('transactionDate').value
    };
    
    transactions.push(transaction);
    
    // تحديث الميزانية إذا كان مصروف
    if (transaction.type === 'expense') {
        const budget = budgets.find(b => b.category === transaction.category);
        if (budget) {
            budget.spent += transaction.amount;
        }
    }
    
    saveData();
    hideTransactionForm();
    updateDashboard();
    updateTransactionsList();
    updateBudgetsList();
    updateReports();
});

// تحديث قائمة المعاملات
function updateTransactionsList() {
    const listDiv = document.getElementById('transactionsList');
    
    if (transactions.length === 0) {
        listDiv.innerHTML = '<p class="text-gray-500 text-center py-8">لا توجد معاملات بعد</p>';
    } else {
        const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
        listDiv.innerHTML = sorted.map(t => `
            <div class="flex items-center justify-between p-4 bg-green-50 rounded-xl group">
                <div class="flex items-center gap-3 flex-1">
                    <div class="icon-box" style="background: linear-gradient(to bottom right, ${t.type === 'income' ? '#3b82f6, #6366f1' : '#10b981, #14b8a6'});">
                        <span class="text-white font-bold">${t.category.charAt(0)}</span>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-bold text-gray-800">${t.description}</h4>
                        <div class="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <span class="badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}">${t.type === 'income' ? 'دخل' : 'مصروف'}</span>
                            <span>${t.category}</span>
                            <span>•</span>
                            <span>${new Date(t.date).toLocaleDateString('ar-SA')}</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <p class="font-bold text-gray-800">${t.amount.toFixed(2)} ر.س</p>
                    <button onclick="deleteTransaction('${t.id}')" class="btn btn-secondary opacity-0 group-hover:opacity-100 transition-opacity" style="padding: 0.5rem;">
                        حذف
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// حذف معاملة
function deleteTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    
    // تحديث الميزانية
    if (transaction && transaction.type === 'expense') {
        const budget = budgets.find(b => b.category === transaction.category);
        if (budget) {
            budget.spent -= transaction.amount;
        }
    }
    
    transactions = transactions.filter(t => t.id !== id);
    saveData();
    updateDashboard();
    updateTransactionsList();
    updateBudgetsList();
    updateReports();
}

// عرض نموذج الميزانية
function showBudgetForm() {
    updateCategories();
    document.getElementById('budgetForm').classList.remove('hidden');
}

function hideBudgetForm() {
    document.getElementById('budgetForm').classList.add('hidden');
    document.getElementById('addBudgetForm').reset();
}

// إضافة ميزانية
document.getElementById('addBudgetForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const category = document.getElementById('budgetCategory').value;
    const limit = parseFloat(document.getElementById('budgetLimit').value);
    
    // حساب المصروفات الحالية لهذه الفئة
    const spent = transactions
        .filter(t => t.type === 'expense' && t.category === category)
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
    updateDashboard();
    updateBudgetsList();
    updateReports();
});

// تحديث قائمة الميزانيات
function updateBudgetsList() {
    let statusText = "";
if (percentage < 80) {
    statusText = "🟢 الميزانية ضمن الحد";
} else if (percentage >= 80 && percentage < 100) {
    statusText = "🟠 اقتربت من الحد!";
} else {
    statusText = "🔴 تم تجاوز الميزانية!";
}
    const listDiv = document.getElementById('budgetsList');
    
    if (budgets.length === 0) {
        listDiv.innerHTML = '<div class="col-span-2 text-center py-12"><p class="text-gray-500">لا توجد ميزانيات بعد</p></div>';
    } else {
        listDiv.innerHTML = budgets.map(b => {
            const percentage = (b.spent / b.limit) * 100;
            const color = percentage >= 100 ? 'red' : percentage >= 80 ? 'orange' : 'green';
            
            return `
                <div class="card">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h4 class="font-bold text-gray-800">${b.category}</h4>
                            <p class="text-sm text-gray-600">${b.spent.toFixed(2)} من ${b.limit.toFixed(2)} ر.س</p>
                        </div>
                        <button onclick="deleteBudget('${b.id}')" class="text-red-600 hover:bg-red-50 p-2 rounded">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="progress-bar mb-3">
                        <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%; background: ${color === 'red' ? 'linear-gradient(to right, #ef4444, #dc2626)' : color === 'orange' ? 'linear-gradient(to right, #f59e0b, #d97706)' : 'linear-gradient(to right, #10b981, #14b8a6)'}"></div>
                    </div>
                    <div class="flex justify-between text-sm text-gray-600">
                        <span>${percentage.toFixed(1)}% مستخدم</span>
                        <span>${(b.limit - b.spent).toFixed(2)} ر.س متبقي</span>
                    </div>
                    ${percentage >= 100 ? '<div class="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">تجاوزت الميزانية!</div>' : ''}
                    ${percentage >= 80 && percentage < 100 ? '<div class="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700">اقتربت من الحد!</div>' : ''}
                </div>
            `;
        }).join('');
    }
}

// حذف ميزانية
function deleteBudget(id) {
    budgets = budgets.filter(b => b.id !== id);
    saveData();
    updateDashboard();
    updateBudgetsList();
    updateReports();
    updateCategories();
}

// تحديث التقارير
function updateReports() {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;
    
    document.getElementById('reportTransactions').textContent = transactions.length;
    document.getElementById('reportBudgets').textContent = budgets.length;
    document.getElementById('reportSavings').textContent = savingsRate.toFixed(1) + '%';
    
    document.getElementById('statsTransactions').textContent = transactions.length;
    document.getElementById('statsBudgets').textContent = budgets.length;
    document.getElementById('statsIncome').textContent = transactions.filter(t => t.type === 'income').length;
    document.getElementById('statsExpenses').textContent = transactions.filter(t => t.type === 'expense').length;
}

// تصدير CSV
function exportCSV() {
    const headers = ['التاريخ', 'النوع', 'الفئة', 'الوصف', 'المبلغ'];
    const rows = transactions.map(t => [
        t.date,
        t.type === 'income' ? 'دخل' : 'مصروف',
        t.category,
        t.description,
        t.amount.toFixed(2)
    ]);
    
    let csv = headers.join(',') + '\n';
    csv += rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `finsmart-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// تصدير JSON
function exportJSON() {
    const data = {
        transactions,
        budgets,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `finsmart-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// إنشاء نسخة احتياطية
function createBackup() {
    const backup = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
            transactions,
            budgets,
            user
        }
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `finsmart-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    localStorage.setItem('finsmart_last_backup', new Date().toISOString());
    alert('تم إنشاء النسخة الاحتياطية بنجاح!');
}

// استعادة النسخة الاحتياطية
function restoreBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const backup = JSON.parse(e.target.result);
            
            if (!backup.data || !backup.data.transactions || !backup.data.budgets) {
                alert('ملف النسخة الاحتياطية غير صالح!');
                return;
            }
            
            transactions = backup.data.transactions;
            budgets = backup.data.budgets;
            if (backup.data.user) {
                user = backup.data.user;
            }
            
            saveData();
            if (user) {
                localStorage.setItem('finsmart_user', JSON.stringify(user));
            }
            
            alert('تم استعادة البيانات بنجاح! سيتم تحديث الصفحة...');
            setTimeout(() => location.reload(), 1000);
        } catch (error) {
            alert('فشل في استعادة البيانات. تأكد من صحة الملف.');
        }
    };
    
    reader.readAsText(file);
}

// تحميل البيانات عند بدء التطبيق
loadData();
