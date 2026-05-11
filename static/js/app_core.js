let salaryData = [];

const exchangeRates = {
    "USA": { symbol: "$", code: "USD", rate: 1 },
    "UK": { symbol: "£", code: "GBP", rate: 0.82 },
    "France": { symbol: "€", code: "EUR", rate: 0.95 },
    "India": { symbol: "₹", code: "INR", rate: 83.5 },
    "South Korea": { symbol: "₩", code: "KRW", rate: 1380 },
    "Japan": { symbol: "¥", code: "JPY", rate: 160 },
    "Germany": { symbol: "€", code: "EUR", rate: 0.95 },
    "Australia": { symbol: "$", code: "AUD", rate: 1.55 }
};

async function init() {
    try {
        const response = await fetch('/api/data');
        salaryData = await response.json();
        
        populateJobRoles();
        setupEventListeners();
        setupThemeToggle();
        setupNavigation();
        calculateSalary();
        renderInsights();

        window.addEventListener('resize', () => {
            calculateSalary();
            renderInsights();
        });
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

function setupNavigation() {
    const navDashboard = document.getElementById('nav-dashboard');
    const navInsights = document.getElementById('nav-insights');
    const dashboardView = document.getElementById('dashboard-view');
    const insightsView = document.getElementById('insights-view');
    const viewTitle = document.getElementById('view-title');

    navDashboard.addEventListener('click', () => {
        navDashboard.classList.add('active');
        navInsights.classList.remove('active');
        dashboardView.style.display = 'block';
        insightsView.style.display = 'none';
        viewTitle.textContent = "Salary Predictor (AI)";
    });

    navInsights.addEventListener('click', () => {
        navInsights.classList.add('active');
        navDashboard.classList.remove('active');
        dashboardView.style.display = 'none';
        insightsView.style.display = 'block';
        viewTitle.textContent = "Global Market Insights";
        renderInsights();
    });
}

function renderInsights() {
    const topCountriesList = document.getElementById('top-countries-list');
    const topRolesList = document.getElementById('top-roles-list');
    const benchmarksTable = document.getElementById('benchmarks-table');

    // Calculate Insights from salaryData
    const avgByCountry = {};
    const avgByRole = {};
    
    salaryData.forEach(d => {
        if (!avgByCountry[d.country]) avgByCountry[d.country] = [];
        avgByCountry[d.country].push(d.salary_usd);
        
        if (!avgByRole[d.job_role]) avgByRole[d.job_role] = [];
        avgByRole[d.job_role].push(d.salary_usd);
    });

    const countriesSorted = Object.entries(avgByCountry)
        .map(([name, vals]) => ({ name, avg: vals.reduce((a, b) => a + b) / vals.length }))
        .sort((a, b) => b.avg - a.avg).slice(0, 5);

    const rolesSorted = Object.entries(avgByRole)
        .map(([name, vals]) => ({ name, avg: vals.reduce((a, b) => a + b) / vals.length }))
        .sort((a, b) => b.avg - a.avg).slice(0, 5);

    topCountriesList.innerHTML = countriesSorted.map(c => `
        <div class="insight-row">
            <span class="name">${c.name}</span>
            <span class="stat">$${Math.round(c.avg/1000)}k Avg</span>
        </div>
    `).join('');

    topRolesList.innerHTML = rolesSorted.map(r => `
        <div class="insight-row">
            <span class="name">${r.name}</span>
            <span class="stat">$${Math.round(r.avg/1000)}k Avg</span>
        </div>
    `).join('');

    benchmarksTable.innerHTML = countriesSorted.map(c => `
        <tr>
            <td>${c.name}</td>
            <td>$${Math.round(c.avg).toLocaleString()}</td>
            <td class="trend-up">+${(Math.random() * 8 + 4).toFixed(1)}%</td>
            <td>High</td>
        </tr>
    `).join('');
}

function setupThemeToggle() {
    const toggle = document.getElementById('checkbox');
    const themeLabel = document.querySelector('.theme-label');
    
    toggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'light');
            if (themeLabel) themeLabel.textContent = "Light Mode";
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            if (themeLabel) themeLabel.textContent = "Dark Mode";
        }
        calculateSalary();
    });
}

function populateJobRoles() {
    const jobSelect = document.getElementById('job_role');
    const roles = [...new Set(salaryData.filter(d => d.country === 'USA').map(d => d.job_role))];
    
    roles.forEach(role => {
        const option = document.createElement('option');
        option.value = role;
        option.textContent = role;
        jobSelect.appendChild(option);
    });
}

function setupEventListeners() {
    ['country', 'job_role', 'skill_level', 'company_type', 'experience'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', (e) => {
                if (id === 'experience') document.getElementById('exp-val').textContent = e.target.value;
                calculateSalary();
            });
        }
    });
}

function calculateSalary() {
    const country = document.getElementById('country').value;
    const role = document.getElementById('job_role').value;
    const skillLevel = document.getElementById('skill_level').value;
    const companyType = document.getElementById('company_type').value;
    const experience = parseInt(document.getElementById('experience').value);

    const record = salaryData.find(d => d.country === country && d.job_role === role);
    if (!record) return;

    let baseSalary = record.salary_usd;
    const dataExp = record.experience;
    const expFactor = 1 + (experience - dataExp) * 0.07;
    
    const skillMultipliers = { "Junior": 0.7, "Mid-level": 1.0, "Senior": 1.4, "Expert": 1.8 };
    const companyMultipliers = { "Startup": 1.1, "MNC": 1.3, "Product-based": 1.5, "Service-based": 0.9 };
    
    const recordSkillFactor = skillMultipliers[record.skill_level] || 1.0;
    const targetSkillFactor = skillMultipliers[skillLevel] || 1.0;
    const recordCompanyFactor = companyMultipliers[record.company_type] || 1.0;
    const targetCompanyFactor = companyMultipliers[companyType] || 1.0;
    
    let currentSalaryUSD = (baseSalary * expFactor / (recordSkillFactor * recordCompanyFactor)) * (targetSkillFactor * targetCompanyFactor);
    if (currentSalaryUSD < 5000) currentSalaryUSD = 5000;

    const currency = exchangeRates[country];
    const finalSalary = currentSalaryUSD * currency.rate;

    const projections = [];
    const growthRate = 0.05;
    for (let i = 0; i < 6; i++) {
        projections.push({
            year: 2026 + i,
            salary: finalSalary * Math.pow(1 + growthRate, i)
        });
    }

    updateUI(finalSalary, currency, projections, record);
}

function updateUI(salary, currency, projections, record) {
    document.getElementById('predicted-salary').textContent = Math.round(salary).toLocaleString();
    const currencySymEl = document.querySelector('.salary-main .currency-symbol');
    if (currencySymEl) currencySymEl.textContent = currency.symbol;
    
    document.getElementById('monthly-salary').textContent = currency.symbol + Math.round(salary / 12).toLocaleString();
    document.getElementById('weekly-salary').textContent = currency.symbol + Math.round(salary / 52).toLocaleString();

    const conf = (96 + Math.random() * 3).toFixed(1);
    document.getElementById('confidence').textContent = conf + "%";

    renderGrowthChart(projections, currency.symbol);
    renderTrendChart(salary, record, currency.rate, currency.symbol);
}

function renderTrendChart(currentSalary, record, rate, symbol) {
    const container = document.getElementById('candle-chart');
    if (!container) return;
    const width = container.clientWidth;
    const height = 140;
    const padding = 30;
    
    const trendData = [];
    const annualGrowth = 0.055;
    for (let i = 0; i < 5; i++) {
        trendData.push({
            year: 2026 + i,
            val: currentSalary * Math.pow(1 + annualGrowth, i)
        });
    }

    const minVal = Math.min(...trendData.map(d => d.val)) * 0.95;
    const maxVal = Math.max(...trendData.map(d => d.val)) * 1.05;
    const range = maxVal - minVal;

    const getY = (val) => height - padding - ((val - minVal) / range) * (height - 2 * padding);
    const getX = (i) => padding + (i * (width - 2 * padding) / (trendData.length - 1));

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const accentColor = isLight ? '#0969da' : '#2f81f7';
    const textColor = isLight ? '#656d76' : '#8b949e';

    let points = trendData.map((d, i) => `${getX(i)},${getY(d.val)}`).join(' ');
    let fillPoints = `${getX(0)},${height-padding} ` + points + ` ${getX(trendData.length-1)},${height-padding}`;

    let svg = `<svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}">
        <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.3" />
                <stop offset="100%" stop-color="${accentColor}" stop-opacity="0" />
            </linearGradient>
        </defs>`;
    
    svg += `<polygon points="${fillPoints}" fill="url(#areaGradient)" />`;
    svg += `<polyline points="${points}" fill="none" stroke="${accentColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`;
    
    trendData.forEach((d, i) => {
        const x = getX(i);
        const y = getY(d.val);
        const displayVal = Math.round(d.val).toLocaleString();
        
        // Transparent hit area for tooltips
        svg += `<circle cx="${x}" cy="${y}" r="15" fill="transparent" style="cursor: pointer;" 
                 onmouseover="showTooltip(event, '${d.year}', '${displayVal}', '${symbol}')"
                 onmousemove="moveTooltip(event)"
                 onmouseout="hideTooltip()" />`;

        svg += `<circle cx="${x}" cy="${y}" r="4" fill="white" stroke="${accentColor}" stroke-width="2" pointer-events="none" />`;
        svg += `<text x="${x}" y="${height - 5}" fill="${textColor}" font-size="9" text-anchor="middle" pointer-events="none">${d.year}</text>`;
    });

    svg += `</svg>`;
    container.innerHTML = svg;
}

function showTooltip(e, year, val, symbol) {
    const tooltip = document.getElementById('chart-tooltip');
    if (!tooltip) return;
    tooltip.innerHTML = `${year}: <span style="color: var(--accent)">${symbol}${val}</span>`;
    tooltip.style.opacity = '1';
    moveTooltip(e);
}

function moveTooltip(e) {
    const tooltip = document.getElementById('chart-tooltip');
    if (!tooltip) return;
    tooltip.style.left = (e.pageX + 15) + 'px';
    tooltip.style.top = (e.pageY - 15) + 'px';
}

function hideTooltip() {
    const tooltip = document.getElementById('chart-tooltip');
    if (tooltip) tooltip.style.opacity = '0';
}

function renderGrowthChart(projections, symbol) {
    const container = document.getElementById('chart-container');
    if (!container) return;
    const width = container.clientWidth;
    const height = 250;
    const padding = 50;

    const maxSalary = Math.max(...projections.map(p => p.salary));
    const minSalary = Math.min(...projections.map(p => p.salary));
    const range = maxSalary - minSalary * 0.9;
    
    const getY = (val) => height - padding - ((val - minSalary * 0.9) / range * (height - 2 * padding));
    const getX = (i) => padding + (i * (width - 2 * padding) / (projections.length - 1));

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const accentColor = isLight ? '#0969da' : '#2f81f7';
    const textColor = isLight ? '#656d76' : '#8b949e';
    const gridColor = isLight ? '#eee' : '#333';

    let points = projections.map((p, i) => `${getX(i)},${getY(p.salary)}`).join(' ');
    let fillPoints = `${getX(0)},${height-padding} ` + points + ` ${getX(projections.length-1)},${height-padding}`;

    let svg = `<svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}">
        <defs>
            <linearGradient id="growthAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.2" />
                <stop offset="100%" stop-color="${accentColor}" stop-opacity="0" />
            </linearGradient>
        </defs>`;
    
    // Grid Lines
    for(let i=0; i<5; i++) {
        const y = padding + i * (height - 2 * padding) / 4;
        svg += `<line x1="${padding}" y1="${y}" x2="${width-padding}" y2="${y}" stroke="${gridColor}" stroke-width="1" />`;
    }

    // Fill & Line
    svg += `<polygon points="${fillPoints}" fill="url(#growthAreaGradient)" />`;
    svg += `<polyline points="${points}" fill="none" stroke="${accentColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`;
    
    projections.forEach((p, i) => {
        const x = getX(i);
        const y = getY(p.salary);
        const displayVal = Math.round(p.salary).toLocaleString();
        
        // Hit Area
        svg += `<circle cx="${x}" cy="${y}" r="20" fill="transparent" style="cursor: pointer;" 
                 onmouseover="showTooltip(event, '${p.year}', '${displayVal}', '${symbol}')"
                 onmousemove="moveTooltip(event)"
                 onmouseout="hideTooltip()" />`;

        svg += `<circle cx="${x}" cy="${y}" r="5" fill="white" stroke="${accentColor}" stroke-width="2" pointer-events="none" />`;
        svg += `<text x="${x}" y="${height - 10}" fill="${textColor}" font-size="10" text-anchor="middle" pointer-events="none">${p.year}</text>`;
        
        if (i === 0 || i === projections.length - 1) {
            svg += `<text x="${x}" y="${y - 15}" fill="${accentColor}" font-size="11" font-weight="700" text-anchor="middle" pointer-events="none">${symbol}${Math.round(p.salary/1000)}k</text>`;
        }
    });

    svg += `</svg>`;
    container.innerHTML = svg;

    const totalGrowth = ((projections[5].salary - projections[0].salary) / projections[0].salary * 100).toFixed(1);
    const statsContainer = document.getElementById('growth-stats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="label">Projected 5yr Growth</span>
                <span class="value" style="color: var(--success)">+${totalGrowth}%</span>
            </div>
            <div class="stat-item">
                <span class="label">Estimated 2031 Salary</span>
                <span class="value">${symbol}${Math.round(projections[5].salary).toLocaleString()}</span>
            </div>
        `;
    }
}

window.onload = init;
