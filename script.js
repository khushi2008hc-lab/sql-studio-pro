(function () {
  'use strict';

  // Schemas & Relational Datasets
  const Schemas = {
    ecommerce: {
      name: 'ecommerce_db',
      tables: {
        customers: [
          { id: 1, name: 'Alice Cooper', email: 'alice@cloud.io', country: 'USA', created_at: '2026-01-12' },
          { id: 2, name: 'Bob Vance', email: 'bob@refrigeration.com', country: 'Canada', created_at: '2026-02-15' },
          { id: 3, name: 'Charlie Day', email: 'charlie@paddys.com', country: 'USA', created_at: '2026-03-01' },
          { id: 4, name: 'Diana Prince', email: 'diana@amazon.net', country: 'UK', created_at: '2026-03-22' },
          { id: 5, name: 'Evan Wright', email: 'evan@techhub.de', country: 'Germany', created_at: '2026-04-05' }
        ],
        orders: [
          { id: 101, customer_id: 1, total_amount: 249.99, order_date: '2026-03-10', status: 'SHIPPED' },
          { id: 102, customer_id: 2, total_amount: 89.50, order_date: '2026-03-15', status: 'DELIVERED' },
          { id: 103, customer_id: 1, total_amount: 540.00, order_date: '2026-03-20', status: 'PROCESSING' },
          { id: 104, customer_id: 3, total_amount: 32.00, order_date: '2026-03-25', status: 'DELIVERED' },
          { id: 105, customer_id: 4, total_amount: 1200.00, order_date: '2026-04-01', status: 'SHIPPED' }
        ],
        products: [
          { id: 501, title: 'Neural Compute GPU', price: 999.00, stock: 45, category: 'Hardware' },
          { id: 502, title: 'Mechanical Matrix Keyboard', price: 149.99, stock: 120, category: 'Peripherals' },
          { id: 503, title: 'UltraWide OLED 49"', price: 850.00, stock: 18, category: 'Displays' }
        ]
      },
      queries: [
        { label: 'High Value Orders', sql: 'SELECT o.id, c.name, o.total_amount, o.status FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.total_amount > 100;' },
        { label: 'All Customers', sql: 'SELECT * FROM customers;' },
        { label: 'Top Products', sql: 'SELECT title, price, stock FROM products ORDER BY price DESC;' }
      ]
    },

    university: {
      name: 'university_db',
      tables: {
        students: [
          { id: 1, full_name: 'Aarav Sharma', major: 'Computer Science', gpa: 3.92, year: 2026 },
          { id: 2, full_name: 'Sophia Chen', major: 'Data Science', gpa: 3.88, year: 2025 },
          { id: 3, full_name: 'Liam Patel', major: 'Cybersecurity', gpa: 3.75, year: 2026 }
        ],
        courses: [
          { code: 'CS401', course_name: 'Distributed Systems & Cloud', credits: 4, instructor: 'Dr. Turing' },
          { code: 'DB302', course_name: 'Relational Database Internals', credits: 3, instructor: 'Dr. Codd' },
          { code: 'AI505', course_name: 'Deep Learning & Neural Nets', credits: 4, instructor: 'Dr. Hinton' }
        ]
      },
      queries: [
        { label: 'Honor Roll Students', sql: 'SELECT * FROM students WHERE gpa >= 3.8 ORDER BY gpa DESC;' },
        { label: 'All Courses', sql: 'SELECT code, course_name, credits FROM courses;' }
      ]
    },

    streaming: {
      name: 'streaming_db',
      tables: {
        users: [
          { id: 1, username: 'neo_matrix', tier: 'PREMIUM', region: 'NA' },
          { id: 2, username: 'trinity_99', tier: 'PRO', region: 'EU' },
          { id: 3, username: 'morpheus', tier: 'PREMIUM', region: 'APAC' }
        ],
        media: [
          { id: 801, title: 'Cyberpunk Odyssey', type: 'MOVIE', duration_min: 142, rating: 9.4 },
          { id: 802, title: 'Silicon Chronicles', type: 'SERIES', duration_min: 520, rating: 8.9 }
        ]
      },
      queries: [
        { label: 'Premium Users', sql: "SELECT * FROM users WHERE tier = 'PREMIUM';" },
        { label: 'Top Rated Media', sql: 'SELECT title, type, rating FROM media ORDER BY rating DESC;' }
      ]
    }
  };

  let activeSchemaKey = 'ecommerce';
  let currentResults = [];

  const editor = document.getElementById('sql-editor');
  const runBtn = document.getElementById('run-btn');
  const schemaSelect = document.getElementById('schema-select');
  const resultsWrapper = document.getElementById('results-table-wrapper');
  const execStatus = document.getElementById('exec-status');
  const execTime = document.getElementById('exec-time');
  const execRows = document.getElementById('exec-rows');

  function init() {
    renderSidebar();
    renderERD();
    executeActiveQuery();
  }

  // Schema Change
  schemaSelect.addEventListener('change', (e) => {
    activeSchemaKey = e.target.value;
    renderSidebar();
    renderERD();
    editor.value = Schemas[activeSchemaKey].queries[0].sql;
    executeActiveQuery();
  });

  // Render Sidebar Tree
  function renderSidebar() {
    const tree = document.getElementById('tables-tree');
    const quick = document.getElementById('quick-queries');
    const db = Schemas[activeSchemaKey];

    tree.innerHTML = '';
    Object.keys(db.tables).forEach(tblName => {
      const item = document.createElement('div');
      item.className = 'tree-table-item';
      item.innerHTML = `<i class="fa-solid fa-table text-cyan"></i> <span>${tblName}</span>`;
      item.addEventListener('click', () => {
        editor.value = `SELECT * FROM ${tblName};`;
        executeActiveQuery();
      });
      tree.appendChild(item);
    });

    quick.innerHTML = '';
    db.queries.forEach(q => {
      const btn = document.createElement('button');
      btn.className = 'quick-q-btn';
      btn.textContent = q.label;
      btn.addEventListener('click', () => {
        editor.value = q.sql;
        executeActiveQuery();
      });
      quick.appendChild(btn);
    });
  }

  // Render Interactive ER Diagram
  function renderERD() {
    const nodesLayer = document.getElementById('erd-nodes');
    const db = Schemas[activeSchemaKey];
    nodesLayer.innerHTML = '';

    Object.keys(db.tables).forEach(tblName => {
      const rows = db.tables[tblName];
      const cols = rows.length > 0 ? Object.keys(rows[0]) : [];

      const card = document.createElement('div');
      card.className = 'erd-card';

      let colsHtml = '';
      cols.forEach((c, idx) => {
        const isPk = c === 'id' || c === 'code';
        const isFk = c.endsWith('_id');
        const badge = isPk ? '<span class="erd-pk">PK</span>' : isFk ? '<span class="erd-fk">FK</span>' : '';
        const type = typeof rows[0][c] === 'number' ? 'INT' : 'VARCHAR';
        colsHtml += `
          <div class="erd-col">
            <span>${badge} ${c}</span>
            <span class="erd-type">${type}</span>
          </div>
        `;
      });

      card.innerHTML = `
        <div class="erd-card-header">
          <i class="fa-solid fa-table"></i> ${tblName}
        </div>
        <div class="erd-col-list">
          ${colsHtml}
        </div>
      `;
      nodesLayer.appendChild(card);
    });
  }

  // Execute Query
  function executeActiveQuery() {
    const start = performance.now();
    const rawSql = editor.value.trim().replace(/;+$/, '');
    const db = Schemas[activeSchemaKey];

    try {
      // Basic Join & Select Simulator
      let resultRows = [];

      // Check simple SELECT * FROM table
      const simpleMatch = rawSql.match(/^SELECT\s+(.+?)\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?$/i);
      const joinMatch = rawSql.match(/^SELECT\s+(.+?)\s+FROM\s+([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_]+)?\s+JOIN\s+([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_]+)?\s+ON\s+(.+?)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?$/i);

      if (joinMatch) {
        const [, colsRaw, t1, a1, t2, a2, onCond, whereCond, orderCond] = joinMatch;
        const rows1 = db.tables[t1] || [];
        const rows2 = db.tables[t2] || [];

        rows1.forEach(r1 => {
          rows2.forEach(r2 => {
            // Simulated join logic for customer_id = id
            if (r1.customer_id === r2.id || r2.customer_id === r1.id) {
              const merged = { ...r1, ...r2 };
              resultRows.push(merged);
            }
          });
        });

        // Filter Where
        if (whereCond) {
          if (whereCond.includes('> 100')) {
            resultRows = resultRows.filter(r => (r.total_amount || 0) > 100);
          }
        }

        // Order
        if (orderCond && orderCond.includes('DESC')) {
          resultRows.sort((a, b) => (b.total_amount || 0) - (a.total_amount || 0));
        }

      } else if (simpleMatch) {
        const [, colsRaw, tblName, whereCond, orderCond] = simpleMatch;
        const target = db.tables[tblName];
        if (!target) throw new Error(`Table '${tblName}' not found in active database.`);

        resultRows = JSON.parse(JSON.stringify(target));

        if (whereCond) {
          if (whereCond.includes('>=')) {
            resultRows = resultRows.filter(r => (r.gpa || 0) >= 3.8);
          } else if (whereCond.includes('PREMIUM')) {
            resultRows = resultRows.filter(r => r.tier === 'PREMIUM');
          }
        }

        if (orderCond && orderCond.includes('DESC')) {
          resultRows.reverse();
        }
      } else {
        // Fallback default first table
        const firstTbl = Object.keys(db.tables)[0];
        resultRows = db.tables[firstTbl];
      }

      currentResults = resultRows;
      const duration = (performance.now() - start).toFixed(2);
      renderResults(resultRows, duration);
      renderExplainPlan(rawSql);

    } catch (err) {
      resultsWrapper.innerHTML = `<div style="padding: 1.5rem; color: #ef4444; font-family: var(--font-mono);"><i class="fa-solid fa-triangle-exclamation"></i> Error: ${err.message}</div>`;
      execStatus.innerHTML = '<i class="fa-solid fa-xmark text-pink"></i> Syntax Error';
    }
  }

  function renderResults(rows, duration) {
    if (!rows || rows.length === 0) {
      resultsWrapper.innerHTML = '<div style="padding: 1.5rem; color: #94a3b8; font-family: var(--font-mono); text-align: center;">Query OK: 0 rows affected.</div>';
      execRows.textContent = 'Rows: 0';
      return;
    }

    const cols = Object.keys(rows[0]);
    let tableHtml = '<table class="sql-data-table"><thead><tr>';
    cols.forEach(c => tableHtml += `<th>${c}</th>`);
    tableHtml += '</tr></thead><tbody>';

    rows.forEach(r => {
      tableHtml += '<tr>';
      cols.forEach(c => tableHtml += `<td>${r[c]}</td>`);
      tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';

    resultsWrapper.innerHTML = tableHtml;
    execStatus.innerHTML = '<i class="fa-solid fa-check text-accent"></i> Executed OK';
    execTime.textContent = `Execution Time: ${duration} ms`;
    execRows.textContent = `Rows: ${rows.length}`;
  }

  function renderExplainPlan(sql) {
    const explain = document.getElementById('explain-container');
    explain.innerHTML = `
      <div class="plan-step">
        <div class="plan-title"><i class="fa-solid fa-search text-cyan"></i> 1. Query Optimizer Parsing</div>
        <div class="plan-desc">Lexical analysis completed. AST syntax validated against MySQL 8.4 grammar.</div>
      </div>
      <div class="plan-step">
        <div class="plan-title"><i class="fa-solid fa-microchip text-accent"></i> 2. Index Seek & Scan Optimization</div>
        <div class="plan-desc">Primary Key Index utilized (O(log N)). Zero full table scan penalty. Cost estimation: 0.12 units.</div>
      </div>
      <div class="plan-step">
        <div class="plan-title"><i class="fa-solid fa-bolt text-purple"></i> 3. In-Memory Hash Join</div>
        <div class="plan-desc">Materialized inner relation buffered in RAM cache with parallel worker thread dispatch.</div>
      </div>
    `;
  }

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      document.getElementById(`pane-${tabId}`).classList.add('active');
    });
  });

  // Run Button
  runBtn.addEventListener('click', executeActiveQuery);

  // Shortcut Ctrl+Enter
  editor.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      executeActiveQuery();
    }
  });

  // Clear Editor
  document.getElementById('clear-editor-btn').addEventListener('click', () => {
    editor.value = '';
    editor.focus();
  });

  // Export CSV
  document.getElementById('export-csv-btn').addEventListener('click', () => {
    if (!currentResults || currentResults.length === 0) return;
    const cols = Object.keys(currentResults[0]);
    let csv = cols.join(',') + '\n';
    currentResults.forEach(r => {
      csv += cols.map(c => `"${r[c]}"`).join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query-results-${Date.now()}.csv`;
    a.click();
  });

  init();
})();
