// Configuration
const GVIZ_URL = "https://docs.google.com/spreadsheets/d/13qFdAZsaw8KE4sDDK9aFpeWHOleCw6JHg4F_7cyQmDQ/gviz/tq";

// State
let projectsData = [];
let filteredData = [];
let budgetChart = null;
let statusChart = null;

// DOM Elements
const syncTimeEl = document.getElementById('sync-time');
const refreshBtn = document.getElementById('refresh-btn');
const refreshIcon = document.getElementById('refresh-icon');
const themeToggleBtn = document.getElementById('theme-toggle');

// KPI elements
const kpiTotalBudget = document.getElementById('kpi-total-budget');
const kpiTotalProjects = document.getElementById('kpi-total-projects');
const kpiSpentBudget = document.getElementById('kpi-spent-budget');
const kpiSpentPercent = document.getElementById('kpi-spent-percent');
const kpiSpentPercentBar = document.getElementById('kpi-spent-percent-bar');
const kpiRemainingBudget = document.getElementById('kpi-remaining-budget');
const kpiRemainingPercent = document.getElementById('kpi-remaining-percent');
const kpiRemainingPercentBar = document.getElementById('kpi-remaining-percent-bar');
const kpiOverallProgress = document.getElementById('kpi-overall-progress');
const kpiCompletedProjects = document.getElementById('kpi-completed-projects');

// Table and loader containers
const loaderContainer = document.getElementById('dashboard-loader');
const dataContainer = document.getElementById('dashboard-data-container');
const projectTableBody = document.getElementById('project-table-body');
const tableEmptyState = document.getElementById('table-empty-state');

// Filter elements
const searchInput = document.getElementById('search-input');
const searchClearBtn = document.getElementById('search-clear-btn');
const filterDept = document.getElementById('filter-dept');
const filterStatus = document.getElementById('filter-status');

// Modal elements
const detailModal = document.getElementById('detail-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalCloseAction = document.getElementById('modal-close-action');
const modalProjectId = document.getElementById('modal-project-id');
const modalTitle = document.getElementById('modal-title');
const modalDept = document.getElementById('modal-dept');
const modalAvatar = document.getElementById('modal-avatar');
const modalOwner = document.getElementById('modal-owner');
const modalStatus = document.getElementById('modal-status');
const modalProgressBar = document.getElementById('modal-progress-bar');
const modalProgressText = document.getElementById('modal-progress-text');
const modalBudgetTotal = document.getElementById('modal-budget-total');
const modalBudgetSpent = document.getElementById('modal-budget-spent');
const modalBudgetRemaining = document.getElementById('modal-budget-remaining');
const modalSpentBar = document.getElementById('modal-spent-bar');
const modalRemainingBar = document.getElementById('modal-remaining-bar');

// Initialize Application
function init() {
    initTheme();
    loadDashboardData();
    setupEventListeners();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Setup Theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
    }
    lucide.createIcons();
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark-theme');
    if (isDark) {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        localStorage.setItem('theme', 'dark');
    }
    
    // Redraw charts to update colors for the active theme
    if (projectsData.length > 0) {
        renderCharts();
    }
}

// Fetch & Load Data using JSONP to bypass CORS on file:// protocol
function loadDashboardData() {
    // Show loaders
    loaderContainer.classList.remove('hidden');
    dataContainer.classList.add('hidden');
    
    // Rotate sync icon
    refreshIcon.classList.add('rotate-anim');
    syncTimeEl.textContent = "อัปเดตล่าสุด: กำลังโหลดข้อมูล...";
    
    // Define global callback handler
    window.handleGoogleSheetResponse = function(response) {
        if (!response || response.status !== 'ok') {
            showErrorMessage("ไม่สามารถดึงข้อมูลจาก Google Sheets ได้ (รูปแบบข้อมูลไม่ถูกต้อง)");
            refreshIcon.classList.remove('rotate-anim');
            cleanupJsonpScript();
            return;
        }
        
        try {
            const rawRows = response.table.rows;
            processAndRenderData(rawRows);
        } catch (error) {
            console.error("Data Processing Error:", error);
            showErrorMessage("เกิดข้อผิดพลาดในการประมวลผลข้อมูลโครงสร้าง");
        } finally {
            refreshIcon.classList.remove('rotate-anim');
            cleanupJsonpScript();
        }
    };
    
    // Dynamic Script Creation
    const scriptId = 'gviz-jsonp-script';
    
    // Cleanup any existing script
    cleanupJsonpScript();
    
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `${GVIZ_URL}?tqx=responseHandler:handleGoogleSheetResponse&t=${new Date().getTime()}`;
    
    // Handle loading errors
    script.onerror = function() {
        showErrorMessage("ไม่สามารถเชื่อมต่อข้อมูล Google Sheets ได้ (ตรวจสอบอินเทอร์เน็ต)");
        refreshIcon.classList.remove('rotate-anim');
        cleanupJsonpScript();
    };
    
    document.body.appendChild(script);
}

function cleanupJsonpScript() {
    const existing = document.getElementById('gviz-jsonp-script');
    if (existing) {
        existing.remove();
    }
}

// Process data from Google Sheets JSON response
function processAndRenderData(rawRows) {
    projectsData = rawRows.map(row => {
        const cells = row.c || [];
        
        const idVal = cells[0] ? cells[0].v : '';
        const id = idVal !== null ? String(idVal) : '';
        
        const name = cells[1] ? (cells[1].v || '') : '';
        const owner = cells[2] ? (cells[2].v || '') : '';
        const dept = cells[3] ? (cells[3].v || '') : '';
        
        const budget = cells[4] ? (parseFloat(cells[4].v) || 0) : 0;
        const spent = cells[5] ? (parseFloat(cells[5].v) || 0) : 0;
        const remaining = cells[6] ? (parseFloat(cells[6].v) || 0) : 0;
        const progress = cells[7] ? (parseFloat(cells[7].v) || 0) : 0;
        
        const statusVal = cells[8] ? (cells[8].v || 'ยังไม่ดำเนินการ') : 'ยังไม่ดำเนินการ';
        
        return {
            id: id,
            name: name || 'ไม่มีชื่อโครงการ',
            owner: owner || 'ไม่ระบุ',
            dept: dept || 'ทั่วไป',
            budget: budget,
            spent: spent,
            remaining: remaining || (budget - spent),
            progress: progress,
            status: String(statusVal).trim()
        };
    }).filter(p => p.id !== ''); // Filter out empty rows
    
    // Last update timestamp
    const now = new Date();
    syncTimeEl.textContent = `อัปเดตล่าสุด: ${now.toLocaleDateString('th-TH')} ${now.toLocaleTimeString('th-TH')} น.`;
    
    // Hide loaders
    loaderContainer.classList.add('hidden');
    dataContainer.classList.remove('hidden');
    
    // Populate Department Filter Options dynamically
    populateDeptFilter();
    
    // Reset filters
    searchInput.value = '';
    searchClearBtn.classList.add('hidden');
    filterDept.value = 'all';
    filterStatus.value = 'all';
    
    // Initial data filter
    filterProjects();
}

function populateDeptFilter() {
    const depts = [...new Set(projectsData.map(p => p.dept))];
    
    // Save current selection
    const currentVal = filterDept.value;
    
    // Keep first option "ทุกกลุ่มงาน"
    filterDept.innerHTML = '<option value="all">ทุกกลุ่มงาน</option>';
    
    depts.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        filterDept.appendChild(option);
    });
    
    // Restore selection if it exists in new data
    if (depts.includes(currentVal)) {
        filterDept.value = currentVal;
    }
}

// Calculate Metrics & Render
function updateDashboardUI() {
    // 1. Calculate KPIs
    const totalBudget = projectsData.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = projectsData.reduce((sum, p) => sum + p.spent, 0);
    const totalRemaining = projectsData.reduce((sum, p) => sum + p.remaining, 0);
    const totalProjects = projectsData.length;
    
    // Completed projects status calculation
    const completedProjects = projectsData.filter(p => p.status === 'ดำเนินการแล้ว' || p.progress === 100).length;
    
    // Weighted overall progress
    let overallProgress = 0;
    if (totalBudget > 0) {
        const weightedSum = projectsData.reduce((sum, p) => sum + (p.progress * p.budget), 0);
        overallProgress = weightedSum / totalBudget;
    } else {
        // Fallback to simple average if total budget is zero
        const sumProgress = projectsData.reduce((sum, p) => sum + p.progress, 0);
        overallProgress = totalProjects > 0 ? (sumProgress / totalProjects) : 0;
    }
    
    // Spent/Remaining Percentages
    const spentPercent = totalBudget > 0 ? (totalSpent / totalBudget * 100) : 0;
    const remainingPercent = totalBudget > 0 ? (totalRemaining / totalBudget * 100) : 0;
    
    // 2. Set UI Text Values
    kpiTotalBudget.textContent = formatNumber(totalBudget);
    kpiTotalProjects.textContent = `${totalProjects} โครงการ`;
    kpiSpentBudget.textContent = formatNumber(totalSpent);
    kpiSpentPercent.textContent = `${spentPercent.toFixed(1)}%`;
    kpiSpentPercentBar.style.width = `${spentPercent}%`;
    
    kpiRemainingBudget.textContent = formatNumber(totalRemaining);
    kpiRemainingPercent.textContent = `${remainingPercent.toFixed(1)}%`;
    kpiRemainingPercentBar.style.width = `${remainingPercent}%`;
    
    kpiOverallProgress.textContent = overallProgress.toFixed(2);
    kpiCompletedProjects.textContent = `เสร็จสิ้น ${completedProjects}/${totalProjects} โครงการ`;
    
    // 3. Render Table
    renderTable();
    
    // 4. Render Charts
    renderCharts();
}

// Render Table List
function renderTable() {
    projectTableBody.innerHTML = '';
    
    if (filteredData.length === 0) {
        tableEmptyState.classList.remove('hidden');
        return;
    }
    
    tableEmptyState.classList.add('hidden');
    
    filteredData.forEach(p => {
        const tr = document.createElement('tr');
        tr.addEventListener('click', () => openDetailModal(p));
        
        // Status class mappings
        let statusClass = 'pending';
        if (p.status === 'ดำเนินการแล้ว') {
            statusClass = 'completed';
        } else if (p.status === 'อยู่ระหว่างดำเนินการ') {
            statusClass = 'in-progress';
        }
        
        tr.innerHTML = `
            <td><span class="project-id-badge">${p.id}</span></td>
            <td>
                <div class="project-name-cell" title="${p.name}">${p.name}</div>
            </td>
            <td>${p.owner}</td>
            <td>${p.dept}</td>
            <td style="text-align: right; font-family: var(--font-heading); font-weight: 600;">${formatNumber(p.budget)}</td>
            <td>
                <div class="table-progress-container">
                    <div class="table-progress-bg">
                        <div class="table-progress-bar" style="width: ${p.progress}%"></div>
                    </div>
                    <span class="table-progress-text">${p.progress}%</span>
                </div>
            </td>
            <td style="text-align: center;">
                <span class="status-badge ${statusClass}">${p.status}</span>
            </td>
        `;
        projectTableBody.appendChild(tr);
    });
}

// Render Charts with ApexCharts
function renderCharts() {
    const isDark = document.body.classList.contains('dark-theme');
    const labelColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    
    // Chart 1: Budget by Department (Grouped)
    const deptMap = {};
    projectsData.forEach(p => {
        if (!deptMap[p.dept]) {
            deptMap[p.dept] = { budget: 0, spent: 0 };
        }
        deptMap[p.dept].budget += p.budget;
        deptMap[p.dept].spent += p.spent;
    });
    
    const depts = Object.keys(deptMap);
    const budgets = depts.map(d => deptMap[d].budget);
    const spents = depts.map(d => deptMap[d].spent);
    
    const budgetChartOptions = {
        series: [
            { name: 'งบประมาณจัดสรร', data: budgets },
            { name: 'งบประมาณใช้ไป', data: spents }
        ],
        chart: {
            type: 'bar',
            height: 320,
            background: 'transparent',
            toolbar: { show: false },
            fontFamily: 'Sarabun, sans-serif'
        },
        colors: ['#6366f1', '#f87171'], // Indigo and light red
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                borderRadius: 4,
                endingShape: 'rounded'
            },
        },
        dataLabels: { enabled: false },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent']
        },
        xaxis: {
            categories: depts,
            labels: {
                style: {
                    colors: labelColor,
                    fontSize: '12px'
                }
            }
        },
        yaxis: {
            title: {
                text: 'จำนวนเงิน (บาท)',
                style: { color: labelColor }
            },
            labels: {
                formatter: function (val) {
                    return val >= 1000 ? (val/1000) + 'K' : val;
                },
                style: { colors: labelColor }
            }
        },
        grid: {
            borderColor: gridColor,
            strokeDashArray: 4
        },
        fill: { opacity: 1 },
        tooltip: {
            theme: isDark ? 'dark' : 'light',
            y: {
                formatter: function (val) {
                    return formatNumber(val) + " บาท";
                }
            }
        },
        legend: {
            labels: { colors: labelColor },
            position: 'top'
        }
    };

    if (budgetChart) {
        budgetChart.destroy();
    }
    budgetChart = new ApexCharts(document.querySelector("#budget-dept-chart"), budgetChartOptions);
    budgetChart.render();
    
    // Chart 2: Project Status Summary (Pie/Donut)
    const statusCounts = {
        'ยังไม่ดำเนินการ': 0,
        'อยู่ระหว่างดำเนินการ': 0,
        'ดำเนินการแล้ว': 0
    };
    
    projectsData.forEach(p => {
        if (statusCounts[p.status] !== undefined) {
            statusCounts[p.status]++;
        } else {
            statusCounts[p.status] = 1;
        }
    });
    
    const statusLabels = Object.keys(statusCounts);
    const statusValues = Object.values(statusCounts);
    
    const statusChartOptions = {
        series: statusValues,
        chart: {
            type: 'donut',
            height: 320,
            background: 'transparent',
            fontFamily: 'Sarabun, sans-serif'
        },
        labels: statusLabels,
        colors: ['#fbbf24', '#60a5fa', '#34d399'], // Amber, blue, green
        stroke: { show: false },
        dataLabels: { enabled: true },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            color: labelColor,
                            fontSize: '14px',
                            offsetY: -10
                        },
                        value: {
                            show: true,
                            color: isDark ? '#fff' : '#000',
                            fontSize: '22px',
                            fontWeight: 'bold',
                            fontFamily: 'Outfit, sans-serif',
                            offsetY: 10,
                            formatter: function (val) {
                                return val;
                            }
                        },
                        total: {
                            show: true,
                            label: 'โครงการทั้งหมด',
                            color: labelColor,
                            formatter: function (w) {
                                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                            }
                        }
                    }
                }
            }
        },
        legend: {
            position: 'bottom',
            labels: { colors: labelColor }
        },
        tooltip: {
            theme: isDark ? 'dark' : 'light'
        }
    };
    
    if (statusChart) {
        statusChart.destroy();
    }
    statusChart = new ApexCharts(document.querySelector("#status-chart"), statusChartOptions);
    statusChart.render();
}

// Project Details Modal
function openDetailModal(project) {
    modalProjectId.textContent = `รหัสโครงการ: ${project.id}`;
    modalTitle.textContent = project.name;
    modalDept.textContent = project.dept;
    modalOwner.textContent = project.owner;
    
    // Set avatar initials
    const initials = project.owner ? project.owner.replace(/นาย|นางสาว|นาง|ดร\./g, '').substring(0, 2) : 'ครู';
    modalAvatar.textContent = initials;
    
    // Status style in modal
    modalStatus.textContent = project.status;
    modalStatus.className = 'status-badge'; // reset
    if (project.status === 'ดำเนินการแล้ว') {
        modalStatus.classList.add('completed');
    } else if (project.status === 'อยู่ระหว่างดำเนินการ') {
        modalStatus.classList.add('in-progress');
    } else {
        modalStatus.classList.add('pending');
    }
    
    // Progress
    modalProgressBar.style.width = `${project.progress}%`;
    modalProgressText.textContent = `${project.progress}%`;
    
    // Budgets
    modalBudgetTotal.textContent = `${formatNumber(project.budget)} บาท`;
    modalBudgetSpent.textContent = `${formatNumber(project.spent)} บาท`;
    modalBudgetRemaining.textContent = `${formatNumber(project.remaining)} บาท`;
    
    // Budget comparison percentages
    const spentPercent = project.budget > 0 ? (project.spent / project.budget * 100) : 0;
    const remainingPercent = project.budget > 0 ? (project.remaining / project.budget * 100) : 0;
    
    modalSpentBar.style.width = `${spentPercent}%`;
    modalRemainingBar.style.width = `${remainingPercent}%`;
    
    detailModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Lock background scroll
}

function closeDetailModal() {
    detailModal.classList.add('hidden');
    document.body.style.overflow = 'auto'; // Unlock scroll
}

// Filtering Logic
function filterProjects() {
    const searchVal = searchInput.value.toLowerCase().trim();
    const deptVal = filterDept.value;
    const statusVal = filterStatus.value;
    
    // Show/hide clear button
    if (searchVal.length > 0) {
        searchClearBtn.classList.remove('hidden');
    } else {
        searchClearBtn.classList.add('hidden');
    }
    
    filteredData = projectsData.filter(p => {
        // Search condition
        const matchSearch = p.name.toLowerCase().includes(searchVal) || 
                            p.owner.toLowerCase().includes(searchVal) || 
                            p.id.toLowerCase().includes(searchVal);
        
        // Department condition
        const matchDept = deptVal === 'all' || p.dept === deptVal;
        
        // Status condition
        const matchStatus = statusVal === 'all' || p.status === statusVal;
        
        return matchSearch && matchDept && matchStatus;
    });
    
    updateDashboardUI();
}

// Event Listeners
function setupEventListeners() {
    refreshBtn.addEventListener('click', loadDashboardData);
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Search input events
    searchInput.addEventListener('input', filterProjects);
    searchClearBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterProjects();
    });
    
    // Dropdown filter events
    filterDept.addEventListener('change', filterProjects);
    filterStatus.addEventListener('change', filterProjects);
    
    // Modal closing events
    modalCloseBtn.addEventListener('click', closeDetailModal);
    modalCloseAction.addEventListener('click', closeDetailModal);
    
    // Click outside modal card to close
    detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) {
            closeDetailModal();
        }
    });
    
    // Escape key press to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !detailModal.classList.contains('hidden')) {
            closeDetailModal();
        }
    });
}

// Helper: Format number with commas
function formatNumber(num) {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return Number(num).toLocaleString('th-TH');
}

// Helper: Show error overlay message
function showErrorMessage(message) {
    loaderContainer.classList.add('hidden');
    dataContainer.classList.remove('hidden');
    
    // Empty body list and show error inside
    projectTableBody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align: center; color: var(--status-danger-text); padding: 40px;">
                <i data-lucide="alert-triangle" style="width: 40px; height: 40px; margin-bottom: 10px; display: inline-block;"></i>
                <p style="font-weight: 600; font-size: 1.1rem;">${message}</p>
                <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 5px;">โปรดลองตรวจสอบอินเทอร์เน็ตหรือลิงก์ข้อมูลโครงการของคุณอีกครั้ง</p>
            </td>
        </tr>
    `;
    lucide.createIcons();
    
    syncTimeEl.textContent = "อัปเดตข้อมูลล้มเหลว";
}
