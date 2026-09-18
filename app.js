/**
 * MINIMA — Task Management Application
 * Pure Vanilla JavaScript Module
 */

(function () {
  'use strict';

  // --- Initial Demo Data ---
  const DEFAULT_CATEGORIES = ['Trabajo', 'Personal', 'Estudio', 'Proyectos'];

  const DEFAULT_TASKS = [
    {
      id: 'task-1',
      title: 'Diseñar arquitectura de microservicios',
      description: 'Definir especificaciones técnicas y diagrama de componentes del nuevo backend.',
      status: 'in-progress',
      priority: 'alta',
      category: 'Trabajo',
      dueDate: getRelativeDate(1), // Tomorrow
      subtasks: [
        { id: 'st-1-1', text: 'Diagrama de base de datos', completed: true },
        { id: 'st-1-2', text: 'Documentar endpoints REST', completed: false },
        { id: 'st-1-3', text: 'Revisión con el equipo de infraestructura', completed: false }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-2',
      title: 'Auditoría de seguridad y dependencias',
      description: 'Ejecutar escaneo de vulnerabilidades y actualizar paquetes críticos.',
      status: 'todo',
      priority: 'urgente',
      category: 'Proyectos',
      dueDate: getRelativeDate(0), // Today
      subtasks: [
        { id: 'st-2-1', text: 'Ejecutar npm audit y revisar CVEs', completed: false },
        { id: 'st-2-2', text: 'Actualizar certificados SSL', completed: false }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-3',
      title: 'Leer artículos sobre Diseño Minimalista UI/UX',
      description: 'Estudiar tendencias de tipografía suiza y espaciado negativo en aplicaciones modernas.',
      status: 'todo',
      priority: 'baja',
      category: 'Estudio',
      dueDate: getRelativeDate(4),
      subtasks: [
        { id: 'st-3-1', text: 'Tomar notas en Obsidian', completed: false }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-4',
      title: 'Organizar espacio de trabajo y respaldos',
      description: 'Limpiar escritorio físico y sincronizar archivos importantes en la nube.',
      status: 'completed',
      priority: 'media',
      category: 'Personal',
      dueDate: getRelativeDate(-1),
      subtasks: [
        { id: 'st-4-1', text: 'Limpiar bandeja de descargas', completed: true },
        { id: 'st-4-2', text: 'Ejecutar respaldo en disco externo', completed: true }
      ],
      createdAt: new Date().toISOString()
    }
  ];

  // Helper for dates relative to today (YYYY-MM-DD)
  function getRelativeDate(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  }

  // --- State Store ---
  const state = {
    tasks: JSON.parse(localStorage.getItem('minima_tasks')) || DEFAULT_TASKS,
    categories: JSON.parse(localStorage.getItem('minima_categories')) || DEFAULT_CATEGORIES,
    currentFilter: 'all', // 'all' | 'today' | 'upcoming' | 'completed' | or category name
    currentPriorityFilter: 'all',
    searchQuery: '',
    currentSort: 'date-asc',
    currentView: localStorage.getItem('minima_view') || 'kanban', // 'kanban' | 'list'
    theme: localStorage.getItem('minima_theme') || 'light',
    draggedTaskId: null
  };

  // --- DOM Elements Cache ---
  const dom = {
    themeMoonIcon: document.getElementById('theme-moon-icon'),
    themeSunIcon: document.getElementById('theme-sun-icon'),
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    sidebar: document.getElementById('sidebar'),
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    currentViewTitle: document.getElementById('current-view-title'),
    currentViewSubtitle: document.getElementById('current-view-subtitle'),
    searchInput: document.getElementById('search-input'),
    viewKanbanBtn: document.getElementById('view-kanban-btn'),
    viewListBtn: document.getElementById('view-list-btn'),
    kanbanView: document.getElementById('kanban-view'),
    listView: document.getElementById('list-view'),
    categoryNavList: document.getElementById('category-nav-list'),
    globalProgressText: document.getElementById('global-progress-text'),
    globalProgressBar: document.getElementById('global-progress-bar'),
    sortSelect: document.getElementById('sort-select'),
    priorityFilterPills: document.getElementById('priority-filter-pills'),
    toastContainer: document.getElementById('toast-container'),

    // Counts
    countAll: document.getElementById('count-all'),
    countToday: document.getElementById('count-today'),
    countUpcoming: document.getElementById('count-upcoming'),
    countCompleted: document.getElementById('count-completed'),
    badgeTodo: document.getElementById('badge-count-todo'),
    badgeInProgress: document.getElementById('badge-count-in-progress'),
    badgeCompleted: document.getElementById('badge-count-completed'),

    // Columns
    colTodo: document.getElementById('col-todo'),
    colInProgress: document.getElementById('col-in-progress'),
    colCompleted: document.getElementById('col-completed'),

    // Task Modal
    taskModal: document.getElementById('task-modal'),
    taskForm: document.getElementById('task-form'),
    taskModalTitle: document.getElementById('task-modal-title'),
    taskIdField: document.getElementById('task-id-field'),
    taskTitleField: document.getElementById('task-title-field'),
    taskDescField: document.getElementById('task-desc-field'),
    taskStatusField: document.getElementById('task-status-field'),
    taskPriorityField: document.getElementById('task-priority-field'),
    taskCategoryField: document.getElementById('task-category-field'),
    taskDueDateField: document.getElementById('task-due-date-field'),
    subtasksContainer: document.getElementById('subtasks-container'),
    addSubtaskRowBtn: document.getElementById('add-subtask-row-btn'),
    openNewTaskBtn: document.getElementById('open-new-task-modal-btn'),
    closeTaskModalBtn: document.getElementById('close-task-modal-btn'),
    cancelTaskBtn: document.getElementById('cancel-task-btn'),

    // Category Modal
    categoryModal: document.getElementById('category-modal'),
    categoryForm: document.getElementById('category-form'),
    categoryNameField: document.getElementById('category-name-field'),
    openNewCategoryBtn: document.getElementById('open-new-category-btn'),
    closeCategoryModalBtn: document.getElementById('close-category-modal-btn'),
    cancelCategoryBtn: document.getElementById('cancel-category-btn'),

    // Shortcuts Modal
    shortcutsModal: document.getElementById('shortcuts-modal'),
    shortcutsInfoBtn: document.getElementById('shortcuts-info-btn'),
    closeShortcutsModalBtn: document.getElementById('close-shortcuts-modal-btn'),
    dismissShortcutsBtn: document.getElementById('dismiss-shortcuts-btn'),

    // Backup Modal
    backupModal: document.getElementById('backup-modal'),
    backupDataBtn: document.getElementById('backup-data-btn'),
    closeBackupModalBtn: document.getElementById('close-backup-modal-btn'),
    dismissBackupBtn: document.getElementById('dismiss-backup-btn'),
    exportJsonBtn: document.getElementById('export-json-btn'),
    triggerImportBtn: document.getElementById('trigger-import-btn'),
    importJsonInput: document.getElementById('import-json-input'),
    resetDemoDataBtn: document.getElementById('reset-demo-data-btn')
  };

  // --- Persistence Handlers ---
  function saveState() {
    localStorage.setItem('minima_tasks', JSON.stringify(state.tasks));
    localStorage.setItem('minima_categories', JSON.stringify(state.categories));
    localStorage.setItem('minima_view', state.currentView);
    localStorage.setItem('minima_theme', state.theme);
  }

  // --- Toast Notification Helper ---
  function showToast(message, icon = '✓') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
    dom.toastContainer.appendChild(toast);

    // Trigger transition
    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // --- Theme Controller ---
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      dom.themeMoonIcon.style.display = 'none';
      dom.themeSunIcon.style.display = 'block';
    } else {
      dom.themeMoonIcon.style.display = 'block';
      dom.themeSunIcon.style.display = 'none';
    }
    saveState();
  }

  function toggleTheme() {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    showToast(newTheme === 'dark' ? 'Modo Oscuro activado' : 'Modo Claro activado', '◑');
  }

  // --- Date Formatting Helper ---
  function formatDateLabel(dateStr) {
    if (!dateStr) return null;
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = getRelativeDate(1);
    const yesterday = getRelativeDate(-1);

    if (dateStr === today) return { label: 'Hoy', isOverdue: false, isToday: true };
    if (dateStr === tomorrow) return { label: 'Mañana', isOverdue: false };
    if (dateStr === yesterday) return { label: 'Ayer (Vencida)', isOverdue: true };
    
    if (dateStr < today) {
      const parts = dateStr.split('-');
      return { label: `${parts[2]}/${parts[1]} (Vencida)`, isOverdue: true };
    }

    const parts = dateStr.split('-');
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const monthIndex = parseInt(parts[1], 10) - 1;
    return { label: `${parseInt(parts[2], 10)} ${months[monthIndex]}`, isOverdue: false };
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }

  // --- Filter & Sort Logic ---
  function getFilteredTasks() {
    const todayStr = new Date().toISOString().split('T')[0];

    return state.tasks.filter(task => {
      // Main Filter
      if (state.currentFilter === 'today') {
        if (task.dueDate !== todayStr) return false;
      } else if (state.currentFilter === 'upcoming') {
        if (!task.dueDate || task.dueDate <= todayStr) return false;
      } else if (state.currentFilter === 'completed') {
        if (task.status !== 'completed') return false;
      } else if (state.currentFilter !== 'all') {
        // Category filter
        if (task.category !== state.currentFilter) return false;
      }

      // Priority Filter
      if (state.currentPriorityFilter !== 'all') {
        if (task.priority !== state.currentPriorityFilter) return false;
      }

      // Search Query
      if (state.searchQuery.trim() !== '') {
        const q = state.searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description ? task.description.toLowerCase().includes(q) : false;
        const matchCategory = task.category.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCategory) return false;
      }

      return true;
    }).sort((a, b) => {
      const priorityWeight = { urgente: 4, alta: 3, media: 2, baja: 1 };

      switch (state.currentSort) {
        case 'date-asc':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        case 'date-desc':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return b.dueDate.localeCompare(a.dueDate);
        case 'priority-desc':
          return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        case 'priority-asc':
          return (priorityWeight[a.priority] || 0) - (priorityWeight[b.priority] || 0);
        case 'title-asc':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }

  // --- Subtask Calculation ---
  function getSubtaskProgress(subtasks) {
    if (!subtasks || subtasks.length === 0) return null;
    const completedCount = subtasks.filter(st => st.completed).length;
    const total = subtasks.length;
    const percent = Math.round((completedCount / total) * 100);
    return { completedCount, total, percent };
  }

  // --- Rendering Functions ---

  function updateSidebar() {
    const todayStr = new Date().toISOString().split('T')[0];

    // Update Counts
    dom.countAll.textContent = state.tasks.length;
    dom.countToday.textContent = state.tasks.filter(t => t.dueDate === todayStr).length;
    dom.countUpcoming.textContent = state.tasks.filter(t => t.dueDate && t.dueDate > todayStr).length;
    dom.countCompleted.textContent = state.tasks.filter(t => t.status === 'completed').length;

    // Render Categories
    dom.categoryNavList.innerHTML = '';
    state.categories.forEach(cat => {
      const count = state.tasks.filter(t => t.category === cat).length;
      const li = document.createElement('li');
      li.className = 'nav-item';
      li.innerHTML = `
        <button class="nav-btn ${state.currentFilter === cat ? 'active' : ''}" data-category="${escapeHtml(cat)}">
          <div class="nav-btn-left">
            <span class="category-dot"></span>
            <span>${escapeHtml(cat)}</span>
          </div>
          <span class="nav-count">${count}</span>
        </button>
      `;
      li.querySelector('button').addEventListener('click', () => {
        setFilter(cat);
      });
      dom.categoryNavList.appendChild(li);
    });

    // Populate Category select in modal
    dom.taskCategoryField.innerHTML = '';
    state.categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      dom.taskCategoryField.appendChild(opt);
    });

    // Overall Progress calculation
    const totalTasks = state.tasks.length;
    const completedTasks = state.tasks.filter(t => t.status === 'completed').length;
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    dom.globalProgressText.textContent = `${percentage}%`;
    dom.globalProgressBar.style.width = `${percentage}%`;
  }

  function renderView() {
    const filtered = getFilteredTasks();

    // Column-wise counts
    const todoTasks = filtered.filter(t => t.status === 'todo');
    const inProgressTasks = filtered.filter(t => t.status === 'in-progress');
    const completedTasks = filtered.filter(t => t.status === 'completed');

    dom.badgeTodo.textContent = todoTasks.length;
    dom.badgeInProgress.textContent = inProgressTasks.length;
    dom.badgeCompleted.textContent = completedTasks.length;

    if (state.currentView === 'kanban') {
      dom.kanbanView.style.display = 'grid';
      dom.listView.style.display = 'none';

      renderKanbanColumn(dom.colTodo, todoTasks, 'todo');
      renderKanbanColumn(dom.colInProgress, inProgressTasks, 'in-progress');
      renderKanbanColumn(dom.colCompleted, completedTasks, 'completed');
    } else {
      dom.kanbanView.style.display = 'none';
      dom.listView.style.display = 'flex';

      renderListView(filtered);
    }
  }

  function renderKanbanColumn(columnEl, tasks, status) {
    columnEl.innerHTML = '';

    if (tasks.length === 0) {
      const empty = document.createElement('div');
      empty.style.padding = '24px 12px';
      empty.style.textAlign = 'center';
      empty.style.color = 'var(--text-muted)';
      empty.style.fontSize = '12px';
      empty.textContent = 'Sin tareas';
      columnEl.appendChild(empty);
      return;
    }

    tasks.forEach(task => {
      const card = document.createElement('div');
      card.className = `task-card ${task.status === 'completed' ? 'completed' : ''}`;
      card.draggable = true;
      card.setAttribute('data-id', task.id);

      const dateInfo = formatDateLabel(task.dueDate);
      const subProgress = getSubtaskProgress(task.subtasks);

      card.innerHTML = `
        <div class="task-card-header">
          <div class="task-card-tags">
            <span class="task-tag">${escapeHtml(task.category)}</span>
            <span class="task-priority-badge priority-${task.priority}">${task.priority}</span>
          </div>
          <button class="task-card-menu-btn" title="Editar tarea" data-action="edit">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>

        <div class="task-card-title">${escapeHtml(task.title)}</div>
        ${task.description ? `<div class="task-card-desc">${escapeHtml(task.description)}</div>` : ''}

        ${subProgress ? `
          <div class="task-subtasks-preview">
            <span>${subProgress.completedCount}/${subProgress.total} subtareas</span>
            <div class="subtask-mini-bar">
              <div class="subtask-mini-fill" style="width: ${subProgress.percent}%"></div>
            </div>
          </div>
        ` : ''}

        <div class="task-card-footer">
          <div class="task-date ${dateInfo && dateInfo.isOverdue && task.status !== 'completed' ? 'overdue' : ''}">
            ${dateInfo ? `
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" stroke-width="2"/>
                <polyline points="12 7 12 12 15 15" stroke-width="2"/>
              </svg>
              <span>${dateInfo.label}</span>
            ` : '<span>Sin fecha</span>'}
          </div>

          <div class="task-card-actions">
            <button class="task-btn-action" title="${task.status === 'completed' ? 'Marcar incompleta' : 'Marcar completada'}" data-action="toggle-status">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button class="task-btn-action" title="Eliminar tarea" data-action="delete">
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      `;

      // Drag Events
      card.addEventListener('dragstart', handleDragStart);
      card.addEventListener('dragend', handleDragEnd);

      // Card Click Actions
      card.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) {
          openEditTaskModal(task.id);
          return;
        }
        const action = btn.getAttribute('data-action');
        if (action === 'edit') openEditTaskModal(task.id);
        if (action === 'toggle-status') toggleTaskComplete(task.id);
        if (action === 'delete') deleteTask(task.id);
      });

      columnEl.appendChild(card);
    });
  }

  function renderListView(tasks) {
    dom.listView.innerHTML = '';

    if (tasks.length === 0) {
      dom.listView.innerHTML = `
        <div class="empty-state">
          <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9"/>
            <path d="M9 12h6M12 9v6" stroke-linecap="round"/>
          </svg>
          <div class="empty-state-title">No hay tareas encontradas</div>
          <div class="empty-state-desc">Intenta ajustar los filtros de búsqueda o crea una nueva tarea para comenzar.</div>
          <button class="btn-primary" onclick="document.getElementById('open-new-task-modal-btn').click()">
            <span>Crear nueva tarea</span>
          </button>
        </div>
      `;
      return;
    }

    tasks.forEach(task => {
      const isCompleted = task.status === 'completed';
      const dateInfo = formatDateLabel(task.dueDate);
      const subProgress = getSubtaskProgress(task.subtasks);

      const item = document.createElement('div');
      item.className = `list-item ${isCompleted ? 'completed' : ''}`;
      item.setAttribute('data-id', task.id);

      item.innerHTML = `
        <div class="list-item-left">
          <div class="custom-checkbox ${isCompleted ? 'checked' : ''}" data-action="toggle-status" title="Cambiar estado">
            ${isCompleted ? `
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
              </svg>
            ` : ''}
          </div>
          <div class="list-item-info">
            <div class="list-item-title">${escapeHtml(task.title)}</div>
            ${task.description ? `<div class="list-item-desc">${escapeHtml(task.description)}</div>` : ''}
          </div>
        </div>

        <div class="list-item-right">
          <span class="task-tag">${escapeHtml(task.category)}</span>
          <span class="task-priority-badge priority-${task.priority}">${task.priority}</span>
          
          ${dateInfo ? `
            <span class="task-date ${dateInfo.isOverdue && !isCompleted ? 'overdue' : ''}" style="font-size:12px;">
              ${dateInfo.label}
            </span>
          ` : '<span style="font-size:12px; color:var(--text-muted);">Sin fecha</span>'}

          ${subProgress ? `
            <span style="font-size:11.5px; color:var(--text-muted); min-width: 60px;">
              ${subProgress.completedCount}/${subProgress.total} st
            </span>
          ` : ''}

          <div class="task-card-actions">
            <button class="task-btn-action" title="Editar" data-action="edit">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button class="task-btn-action" title="Eliminar" data-action="delete">
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      `;

      item.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('[data-action]');
        if (actionBtn) {
          const action = actionBtn.getAttribute('data-action');
          if (action === 'toggle-status') toggleTaskComplete(task.id);
          if (action === 'edit') openEditTaskModal(task.id);
          if (action === 'delete') deleteTask(task.id);
          return;
        }
        openEditTaskModal(task.id);
      });

      dom.listView.appendChild(item);
    });
  }

  // --- Drag and Drop Handlers ---
  function handleDragStart(e) {
    state.draggedTaskId = this.getAttribute('data-id');
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', state.draggedTaskId);
  }

  function handleDragEnd() {
    this.classList.remove('dragging');
    document.querySelectorAll('.column-body').forEach(col => col.classList.remove('drag-over'));
    state.draggedTaskId = null;
  }

  function setupDragAndDrop() {
    const columns = [dom.colTodo, dom.colInProgress, dom.colCompleted];

    columns.forEach(col => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        col.classList.add('drag-over');
      });

      col.addEventListener('dragleave', () => {
        col.classList.remove('drag-over');
      });

      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.classList.remove('drag-over');
        const targetStatus = col.getAttribute('data-column-status');
        const taskId = e.dataTransfer.getData('text/plain') || state.draggedTaskId;

        if (taskId && targetStatus) {
          updateTaskStatus(taskId, targetStatus);
        }
      });
    });
  }

  // --- Task Operations (CRUD) ---

  function updateTaskStatus(id, newStatus) {
    const task = state.tasks.find(t => t.id === id);
    if (task && task.status !== newStatus) {
      task.status = newStatus;
      saveState();
      updateSidebar();
      renderView();
      showToast(`Tarea movida a "${getStatusLabel(newStatus)}"`);
    }
  }

  function toggleTaskComplete(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;

    if (task.status === 'completed') {
      task.status = 'todo';
      showToast('Tarea reabierta');
    } else {
      task.status = 'completed';
      showToast('Tarea completada');
    }

    saveState();
    updateSidebar();
    renderView();
  }

  function deleteTask(id) {
    const taskIndex = state.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    const taskTitle = state.tasks[taskIndex].title;
    state.tasks.splice(taskIndex, 1);
    saveState();
    updateSidebar();
    renderView();
    showToast(`"${taskTitle}" eliminada`, '✕');
  }

  function getStatusLabel(status) {
    switch (status) {
      case 'todo': return 'Por Hacer';
      case 'in-progress': return 'En Progreso';
      case 'completed': return 'Completadas';
      default: return status;
    }
  }

  // --- Subtasks DOM Management in Form Modal ---
  function renderSubtaskRow(subtask = { id: 'st-' + Date.now() + Math.random().toString(36).substr(2, 4), text: '', completed: false }) {
    const row = document.createElement('div');
    row.className = 'subtask-builder-item';
    row.setAttribute('data-id', subtask.id);
    row.innerHTML = `
      <input type="checkbox" ${subtask.completed ? 'checked' : ''}>
      <input type="text" placeholder="Detalle de subtarea..." value="${escapeHtml(subtask.text)}">
      <button type="button" class="subtask-remove-btn" title="Eliminar subtarea">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    `;

    row.querySelector('.subtask-remove-btn').addEventListener('click', () => {
      row.remove();
    });

    dom.subtasksContainer.appendChild(row);
  }

  function collectSubtasksFromModal() {
    const rows = dom.subtasksContainer.querySelectorAll('.subtask-builder-item');
    const list = [];
    rows.forEach(row => {
      const id = row.getAttribute('data-id');
      const completed = row.querySelector('input[type="checkbox"]').checked;
      const text = row.querySelector('input[type="text"]').value.trim();
      if (text !== '') {
        list.push({ id, text, completed });
      }
    });
    return list;
  }

  // --- Modal Open/Close Controls ---

  function openNewTaskModal(defaultStatus = 'todo') {
    dom.taskForm.reset();
    dom.taskIdField.value = '';
    dom.taskModalTitle.textContent = 'Nueva Tarea';
    dom.taskStatusField.value = defaultStatus;
    dom.taskPriorityField.value = 'media';
    dom.taskCategoryField.value = state.categories[0] || 'Trabajo';
    dom.taskDueDateField.value = getRelativeDate(0);
    dom.subtasksContainer.innerHTML = '';

    dom.taskModal.classList.add('active');
    setTimeout(() => dom.taskTitleField.focus(), 50);
  }

  function openEditTaskModal(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;

    dom.taskForm.reset();
    dom.taskIdField.value = task.id;
    dom.taskModalTitle.textContent = 'Editar Tarea';
    dom.taskTitleField.value = task.title;
    dom.taskDescField.value = task.description || '';
    dom.taskStatusField.value = task.status;
    dom.taskPriorityField.value = task.priority;
    dom.taskCategoryField.value = task.category;
    dom.taskDueDateField.value = task.dueDate || '';

    dom.subtasksContainer.innerHTML = '';
    if (task.subtasks && task.subtasks.length > 0) {
      task.subtasks.forEach(st => renderSubtaskRow(st));
    }

    dom.taskModal.classList.add('active');
    setTimeout(() => dom.taskTitleField.focus(), 50);
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.classList.remove('active');
    });
  }

  // --- Save / Submit Task Form ---
  function handleTaskFormSubmit(e) {
    e.preventDefault();
    const id = dom.taskIdField.value;
    const title = dom.taskTitleField.value.trim();
    if (!title) return;

    const description = dom.taskDescField.value.trim();
    const status = dom.taskStatusField.value;
    const priority = dom.taskPriorityField.value;
    const category = dom.taskCategoryField.value;
    const dueDate = dom.taskDueDateField.value;
    const subtasks = collectSubtasksFromModal();

    if (id) {
      // Edit existing
      const task = state.tasks.find(t => t.id === id);
      if (task) {
        task.title = title;
        task.description = description;
        task.status = status;
        task.priority = priority;
        task.category = category;
        task.dueDate = dueDate;
        task.subtasks = subtasks;
        showToast('Tarea actualizada');
      }
    } else {
      // Create new
      const newTask = {
        id: 'task-' + Date.now(),
        title,
        description,
        status,
        priority,
        category,
        dueDate,
        subtasks,
        createdAt: new Date().toISOString()
      };
      state.tasks.unshift(newTask);
      showToast('Nueva tarea creada');
    }

    saveState();
    updateSidebar();
    renderView();
    closeAllModals();
  }

  // --- Filter Navigation ---
  function setFilter(filterKey) {
    state.currentFilter = filterKey;

    // Update active nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    if (['all', 'today', 'upcoming', 'completed'].includes(filterKey)) {
      const activeBtn = document.getElementById(`filter-${filterKey}-btn`);
      if (activeBtn) activeBtn.classList.add('active');

      const titles = {
        all: { title: 'Todas las tareas', sub: 'Visión general de tus actividades' },
        today: { title: 'Tareas para hoy', sub: 'Objetivos prioritarios de la jornada' },
        upcoming: { title: 'Próximas tareas', sub: 'Planificación futura y fechas límite' },
        completed: { title: 'Tareas completadas', sub: 'Historial de actividades finalizadas' }
      };

      dom.currentViewTitle.textContent = titles[filterKey].title;
      dom.currentViewSubtitle.textContent = titles[filterKey].sub;
    } else {
      // Category Filter
      dom.currentViewTitle.textContent = filterKey;
      dom.currentViewSubtitle.textContent = `Filtrado por categoría "${filterKey}"`;
    }

    // Close mobile sidebar if open
    dom.sidebar.classList.remove('open');

    renderView();
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Navigation items
    document.getElementById('filter-all-btn').addEventListener('click', () => setFilter('all'));
    document.getElementById('filter-today-btn').addEventListener('click', () => setFilter('today'));
    document.getElementById('filter-upcoming-btn').addEventListener('click', () => setFilter('upcoming'));
    document.getElementById('filter-completed-btn').addEventListener('click', () => setFilter('completed'));

    // Theme Toggle
    dom.themeToggleBtn.addEventListener('click', toggleTheme);

    // Mobile Sidebar Toggle
    dom.mobileMenuBtn.addEventListener('click', () => {
      dom.sidebar.classList.toggle('open');
    });

    // View switch buttons
    dom.viewKanbanBtn.addEventListener('click', () => {
      state.currentView = 'kanban';
      dom.viewKanbanBtn.classList.add('active');
      dom.viewListBtn.classList.remove('active');
      saveState();
      renderView();
    });

    dom.viewListBtn.addEventListener('click', () => {
      state.currentView = 'list';
      dom.viewListBtn.classList.add('active');
      dom.viewKanbanBtn.classList.remove('active');
      saveState();
      renderView();
    });

    // Search Input
    dom.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderView();
    });

    // Priority filter pills
    dom.priorityFilterPills.addEventListener('click', (e) => {
      const pill = e.target.closest('.filter-pill');
      if (!pill) return;
      dom.priorityFilterPills.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.currentPriorityFilter = pill.getAttribute('data-priority');
      renderView();
    });

    // Sort select
    dom.sortSelect.addEventListener('change', (e) => {
      state.currentSort = e.target.value;
      renderView();
    });

    // Task Modal Controls
    dom.openNewTaskBtn.addEventListener('click', () => openNewTaskModal('todo'));
    dom.closeTaskModalBtn.addEventListener('click', closeAllModals);
    dom.cancelTaskBtn.addEventListener('click', closeAllModals);
    dom.taskForm.addEventListener('submit', handleTaskFormSubmit);

    // Quick add in kanban headers
    document.querySelectorAll('[data-add-to]').forEach(btn => {
      btn.addEventListener('click', () => {
        const columnStatus = btn.getAttribute('data-add-to');
        openNewTaskModal(columnStatus);
      });
    });

    // Subtask add row button
    dom.addSubtaskRowBtn.addEventListener('click', () => renderSubtaskRow());

    // Category Modal Controls
    dom.openNewCategoryBtn.addEventListener('click', () => {
      dom.categoryForm.reset();
      dom.categoryModal.classList.add('active');
      setTimeout(() => dom.categoryNameField.focus(), 50);
    });
    dom.closeCategoryModalBtn.addEventListener('click', closeAllModals);
    dom.cancelCategoryBtn.addEventListener('click', closeAllModals);
    dom.categoryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = dom.categoryNameField.value.trim();
      if (name && !state.categories.includes(name)) {
        state.categories.push(name);
        saveState();
        updateSidebar();
        closeAllModals();
        showToast(`Categoría "${name}" creada`);
      }
    });

    // Shortcuts Modal Controls
    dom.shortcutsInfoBtn.addEventListener('click', () => dom.shortcutsModal.classList.add('active'));
    dom.closeShortcutsModalBtn.addEventListener('click', closeAllModals);
    dom.dismissShortcutsBtn.addEventListener('click', closeAllModals);

    // Backup / Export / Import Controls
    dom.backupDataBtn.addEventListener('click', () => dom.backupModal.classList.add('active'));
    dom.closeBackupModalBtn.addEventListener('click', closeAllModals);
    dom.dismissBackupBtn.addEventListener('click', closeAllModals);

    dom.exportJsonBtn.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
        tasks: state.tasks,
        categories: state.categories,
        exportedAt: new Date().toISOString()
      }, null, 2));
      const dlAnchorElem = document.createElement('a');
      dlAnchorElem.setAttribute("href", dataStr);
      dlAnchorElem.setAttribute("download", `minima_tasks_${getRelativeDate(0)}.json`);
      dlAnchorElem.click();
      showToast('Copia de seguridad descargada');
    });

    dom.triggerImportBtn.addEventListener('click', () => dom.importJsonInput.click());
    dom.importJsonInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed && Array.isArray(parsed.tasks)) {
            state.tasks = parsed.tasks;
            if (Array.isArray(parsed.categories)) {
              state.categories = parsed.categories;
            }
            saveState();
            updateSidebar();
            renderView();
            closeAllModals();
            showToast('Datos importados correctamente');
          } else {
            alert('Formato de archivo inválido.');
          }
        } catch (err) {
          alert('Error al leer el archivo JSON.');
        }
      };
      reader.readAsText(file);
    });

    dom.resetDemoDataBtn.addEventListener('click', () => {
      if (confirm('¿Deseas restaurar los datos de demostración predeterminados?')) {
        state.tasks = [...DEFAULT_TASKS];
        state.categories = [...DEFAULT_CATEGORIES];
        saveState();
        updateSidebar();
        renderView();
        closeAllModals();
        showToast('Datos de demostración restaurados');
      }
    });

    // Close Modals on Overlay Click
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeAllModals();
      });
    });

    // Global Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

      if (e.key === 'Escape') {
        closeAllModals();
        dom.sidebar.classList.remove('open');
      }

      if (!isInputFocused) {
        if (e.key.toLowerCase() === 'n') {
          e.preventDefault();
          openNewTaskModal('todo');
        } else if (e.key === '/') {
          e.preventDefault();
          dom.searchInput.focus();
        } else if (e.key.toLowerCase() === 't') {
          e.preventDefault();
          toggleTheme();
        }
      }
    });
  }

  // --- Initialization ---
  function init() {
    applyTheme(state.theme);

    if (state.currentView === 'list') {
      dom.viewListBtn.classList.add('active');
      dom.viewKanbanBtn.classList.remove('active');
    } else {
      dom.viewKanbanBtn.classList.add('active');
      dom.viewListBtn.classList.remove('active');
    }

    setupDragAndDrop();
    setupEventListeners();
    updateSidebar();
    renderView();
  }

  // Bootstrap when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
