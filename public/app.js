const state = {
  token: localStorage.getItem('projectToken') || '',
  user: null,
  projects: [],
  selectedProjectId: null,
};

const elements = {
  bootScreen: document.querySelector('#bootScreen'),
  toast: document.querySelector('#toast'),
  authView: document.querySelector('#authView'),
  appView: document.querySelector('#appView'),
  loginTab: document.querySelector('#loginTab'),
  registerTab: document.querySelector('#registerTab'),
  loginPanel: document.querySelector('#loginPanel'),
  registerPanel: document.querySelector('#registerPanel'),
  loginForm: document.querySelector('#loginForm'),
  registerForm: document.querySelector('#registerForm'),
  userName: document.querySelector('#userName'),
  userEmail: document.querySelector('#userEmail'),
  projectCount: document.querySelector('#projectCount'),
  progressCount: document.querySelector('#progressCount'),
  completedCount: document.querySelector('#completedCount'),
  projectsList: document.querySelector('#projectsList'),
  projectDetails: document.querySelector('#projectDetails'),
  logoutButton: document.querySelector('#logoutButton'),
  newProjectButton: document.querySelector('#newProjectButton'),
  projectModal: document.querySelector('#projectModal'),
  projectModalTitle: document.querySelector('#projectModalTitle'),
  closeProjectModal: document.querySelector('#closeProjectModal'),
  cancelProjectButton: document.querySelector('#cancelProjectButton'),
  projectForm: document.querySelector('#projectForm'),
  projectId: document.querySelector('#projectId'),
  projectName: document.querySelector('#projectName'),
  projectDescription: document.querySelector('#projectDescription'),
};

let toastTimer;

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function showToast(message, type = 'success') {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.className = `toast show${type === 'error' ? ' error' : ''}`;

  toastTimer = setTimeout(() => {
    elements.toast.className = 'toast';
  }, 3500);
}

async function request(url, options = {}) {
  const headers = { ...(options.headers || {}) };

  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  if (state.token && options.useToken !== false) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const error = new Error(data?.error || 'Não foi possível concluir a operação.');
    error.status = response.status;
    throw error;
  }

  return data;
}

function setButtonLoading(button, loading, loadingText = 'Aguarde...') {
  if (loading) {
    button.dataset.originalText = button.textContent;
    button.textContent = loadingText;
    button.disabled = true;
    return;
  }

  button.textContent = button.dataset.originalText || button.textContent;
  button.disabled = false;
}

function saveSession(result) {
  state.token = result.token;
  state.user = result.user;
  localStorage.setItem('projectToken', result.token);
}

function clearSession() {
  state.token = '';
  state.user = null;
  state.projects = [];
  state.selectedProjectId = null;
  localStorage.removeItem('projectToken');
}

function showAuth() {
  elements.appView.hidden = true;
  elements.authView.hidden = false;
}

function showApp() {
  elements.authView.hidden = true;
  elements.appView.hidden = false;
}

function selectAuthTab(tab) {
  const isLogin = tab === 'login';
  elements.loginTab.classList.toggle('active', isLogin);
  elements.registerTab.classList.toggle('active', !isLogin);
  elements.loginPanel.hidden = !isLogin;
  elements.registerPanel.hidden = isLogin;
}

function handleRequestError(error) {
  if (error.status === 401) {
    clearSession();
    showAuth();
    showToast('Sua sessão expirou. Faça login novamente.', 'error');
    return;
  }

  showToast(error.message, 'error');
}

async function loadDashboard() {
  const result = await request('/graphql', {
    method: 'POST',
    body: {
      query: `
        query Dashboard {
          me {
            id
            name
            email
          }
          projects {
            id
            name
            description
            tasks {
              id
              title
              description
              status
            }
          }
        }
      `,
    },
  });

  if (result.errors?.length) {
    const error = new Error(result.errors[0].message);
    if (result.errors[0].extensions?.code === 'UNAUTHENTICATED') {
      error.status = 401;
    }
    throw error;
  }

  state.user = result.data.me;
  state.projects = result.data.projects;

  const selectedStillExists = state.projects.some(
    (project) => project.id === state.selectedProjectId,
  );

  if (!selectedStillExists) {
    state.selectedProjectId = state.projects[0]?.id || null;
  }

  renderDashboard();
}

function projectProgress(project) {
  if (!project.tasks.length) return 0;
  const completed = project.tasks.filter((task) => task.status === 'COMPLETED').length;
  return Math.round((completed / project.tasks.length) * 100);
}

function renderStats() {
  const tasks = state.projects.flatMap((project) => project.tasks);

  elements.projectCount.textContent = state.projects.length;
  elements.progressCount.textContent = tasks.filter(
    (task) => task.status === 'IN_PROGRESS',
  ).length;
  elements.completedCount.textContent = tasks.filter(
    (task) => task.status === 'COMPLETED',
  ).length;
}

function renderProjects() {
  if (!state.projects.length) {
    elements.projectsList.innerHTML = `
      <div class="empty-state empty-state-small">
        <div>
          <span class="empty-icon">P</span>
          <h3>Nenhum projeto criado</h3>
          <p>Use o botão “Novo projeto” para começar.</p>
        </div>
      </div>
    `;
    return;
  }

  elements.projectsList.innerHTML = state.projects
    .map((project) => {
      const progress = projectProgress(project);
      const active = project.id === state.selectedProjectId ? ' active' : '';
      const taskText = project.tasks.length === 1 ? '1 tarefa' : `${project.tasks.length} tarefas`;

      return `
        <button class="project-card${active}" data-project-id="${project.id}" type="button">
          <strong>${escapeHtml(project.name)}</strong>
          <p>${escapeHtml(project.description || 'Projeto sem descrição.')}</p>
          <div class="progress-track"><span style="width: ${progress}%"></span></div>
          <div class="project-meta">
            <span>${taskText}</span>
            <span>${progress}% concluído</span>
          </div>
        </button>
      `;
    })
    .join('');
}

function statusClass(status) {
  if (status === 'COMPLETED') return 'status-completed';
  if (status === 'IN_PROGRESS') return 'status-progress';
  return 'status-pending';
}

function statusOptions(currentStatus) {
  const statuses = [
    ['PENDING', 'Pendente'],
    ['IN_PROGRESS', 'Em andamento'],
    ['COMPLETED', 'Concluída'],
  ];

  return statuses
    .map(
      ([value, label]) =>
        `<option value="${value}"${value === currentStatus ? ' selected' : ''}>${label}</option>`,
    )
    .join('');
}

function renderProjectDetails() {
  const project = state.projects.find((item) => item.id === state.selectedProjectId);

  if (!project) {
    elements.projectDetails.innerHTML = `
      <div class="empty-state">
        <div>
          <span class="empty-icon">✓</span>
          <h3>Selecione ou crie um projeto</h3>
          <p>As tarefas do projeto escolhido aparecerão neste espaço.</p>
        </div>
      </div>
    `;
    return;
  }

  const tasks = project.tasks
    .map(
      (task) => `
        <div class="task-item">
          <div class="task-info">
            <strong>${escapeHtml(task.title)}</strong>
            <p>${escapeHtml(task.description || 'Sem descrição.')}</p>
          </div>
          <select
            class="status-select ${statusClass(task.status)}"
            data-action="change-status"
            data-task-id="${task.id}"
            aria-label="Status da tarefa ${escapeHtml(task.title)}"
          >
            ${statusOptions(task.status)}
          </select>
          <button
            class="icon-button"
            data-action="delete-task"
            data-task-id="${task.id}"
            type="button"
            aria-label="Excluir tarefa"
          >
            ×
          </button>
        </div>
      `,
    )
    .join('');

  elements.projectDetails.innerHTML = `
    <div class="project-header">
      <div>
        <h2>${escapeHtml(project.name)}</h2>
        <p>${escapeHtml(project.description || 'Projeto sem descrição.')}</p>
      </div>
      <div class="project-actions">
        <button class="button button-secondary button-small" data-action="edit-project" type="button">
          Editar
        </button>
        <button class="button button-danger button-small" data-action="delete-project" type="button">
          Excluir
        </button>
      </div>
    </div>

    <div class="task-form-wrap">
      <h3>Adicionar tarefa</h3>
      <form id="taskForm" class="task-form">
        <label>
          Título
          <input id="taskTitle" type="text" placeholder="Nova tarefa" minlength="2" maxlength="150" required />
        </label>
        <label>
          Descrição
          <input id="taskDescription" type="text" placeholder="Descrição opcional" maxlength="500" />
        </label>
        <label>
          Status
          <select id="taskStatus">
            <option value="PENDING">Pendente</option>
            <option value="IN_PROGRESS">Em andamento</option>
            <option value="COMPLETED">Concluída</option>
          </select>
        </label>
        <button class="button button-primary" type="submit">Adicionar</button>
      </form>
    </div>

    <div class="tasks-content">
      <div class="section-title">
        <h3>Tarefas do projeto</h3>
        <span>${project.tasks.length} no total</span>
      </div>
      <div class="tasks-list">
        ${
          tasks ||
          `
            <div class="empty-state empty-state-small">
              <div>
                <span class="empty-icon">T</span>
                <h3>Nenhuma tarefa cadastrada</h3>
                <p>Adicione a primeira tarefa usando o formulário acima.</p>
              </div>
            </div>
          `
        }
      </div>
    </div>
  `;
}

function renderDashboard() {
  elements.userName.textContent = state.user.name;
  elements.userEmail.textContent = state.user.email;
  renderStats();
  renderProjects();
  renderProjectDetails();
}

function openProjectModal(project = null) {
  elements.projectModalTitle.textContent = project ? 'Editar projeto' : 'Novo projeto';
  elements.projectId.value = project?.id || '';
  elements.projectName.value = project?.name || '';
  elements.projectDescription.value = project?.description || '';
  elements.projectModal.hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(() => elements.projectName.focus(), 50);
}

function closeProjectModal() {
  elements.projectModal.hidden = true;
  elements.projectForm.reset();
  elements.projectId.value = '';
  document.body.style.overflow = '';
}

elements.loginTab.addEventListener('click', () => selectAuthTab('login'));
elements.registerTab.addEventListener('click', () => selectAuthTab('register'));

elements.loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button[type="submit"]');
  setButtonLoading(button, true, 'Entrando...');

  try {
    const result = await request('/api/auth/login', {
      method: 'POST',
      useToken: false,
      body: {
        email: document.querySelector('#loginEmail').value,
        password: document.querySelector('#loginPassword').value,
      },
    });

    saveSession(result);
    await loadDashboard();
    showApp();
    elements.loginForm.reset();
    showToast('Login realizado com sucesso.');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setButtonLoading(button, false);
  }
});

elements.registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button[type="submit"]');
  setButtonLoading(button, true, 'Criando conta...');

  try {
    const result = await request('/api/auth/register', {
      method: 'POST',
      useToken: false,
      body: {
        name: document.querySelector('#registerName').value,
        email: document.querySelector('#registerEmail').value,
        password: document.querySelector('#registerPassword').value,
      },
    });

    saveSession(result);
    await loadDashboard();
    showApp();
    elements.registerForm.reset();
    showToast('Conta criada com sucesso.');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setButtonLoading(button, false);
  }
});

elements.logoutButton.addEventListener('click', () => {
  clearSession();
  showAuth();
  selectAuthTab('login');
  showToast('Você saiu do sistema.');
});

elements.newProjectButton.addEventListener('click', () => openProjectModal());
elements.closeProjectModal.addEventListener('click', closeProjectModal);
elements.cancelProjectButton.addEventListener('click', closeProjectModal);

elements.projectModal.addEventListener('click', (event) => {
  if (event.target === elements.projectModal) closeProjectModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !elements.projectModal.hidden) closeProjectModal();
});

elements.projectForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button[type="submit"]');
  const id = elements.projectId.value;
  setButtonLoading(button, true, 'Salvando...');

  try {
    const project = await request(id ? `/api/projects/${id}` : '/api/projects', {
      method: id ? 'PATCH' : 'POST',
      body: {
        name: elements.projectName.value,
        description: elements.projectDescription.value,
      },
    });

    state.selectedProjectId = project._id;
    closeProjectModal();
    await loadDashboard();
    showToast(id ? 'Projeto atualizado.' : 'Projeto criado.');
  } catch (error) {
    handleRequestError(error);
  } finally {
    setButtonLoading(button, false);
  }
});

elements.projectsList.addEventListener('click', (event) => {
  const card = event.target.closest('[data-project-id]');
  if (!card) return;

  state.selectedProjectId = card.dataset.projectId;
  renderProjects();
  renderProjectDetails();
});

elements.projectDetails.addEventListener('submit', async (event) => {
  if (event.target.id !== 'taskForm') return;
  event.preventDefault();

  const button = event.target.querySelector('button[type="submit"]');
  setButtonLoading(button, true, 'Adicionando...');

  try {
    await request(`/api/projects/${state.selectedProjectId}/tasks`, {
      method: 'POST',
      body: {
        title: document.querySelector('#taskTitle').value,
        description: document.querySelector('#taskDescription').value,
        status: document.querySelector('#taskStatus').value,
      },
    });

    await loadDashboard();
    showToast('Tarefa adicionada.');
  } catch (error) {
    handleRequestError(error);
  } finally {
    setButtonLoading(button, false);
  }
});

elements.projectDetails.addEventListener('change', async (event) => {
  if (event.target.dataset.action !== 'change-status') return;

  event.target.disabled = true;

  try {
    await request(`/api/tasks/${event.target.dataset.taskId}`, {
      method: 'PATCH',
      body: { status: event.target.value },
    });

    await loadDashboard();
    showToast('Status atualizado.');
  } catch (error) {
    handleRequestError(error);
    await loadDashboard().catch(() => {});
  }
});

elements.projectDetails.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const project = state.projects.find((item) => item.id === state.selectedProjectId);

  if (button.dataset.action === 'edit-project') {
    openProjectModal(project);
    return;
  }

  if (button.dataset.action === 'delete-project') {
    const confirmed = window.confirm(`Deseja excluir o projeto “${project.name}” e suas tarefas?`);
    if (!confirmed) return;

    try {
      await request(`/api/projects/${project.id}`, { method: 'DELETE' });
      state.selectedProjectId = null;
      await loadDashboard();
      showToast('Projeto excluído.');
    } catch (error) {
      handleRequestError(error);
    }
    return;
  }

  if (button.dataset.action === 'delete-task') {
    const confirmed = window.confirm('Deseja excluir esta tarefa?');
    if (!confirmed) return;

    try {
      await request(`/api/tasks/${button.dataset.taskId}`, { method: 'DELETE' });
      await loadDashboard();
      showToast('Tarefa excluída.');
    } catch (error) {
      handleRequestError(error);
    }
  }
});

async function start() {
  try {
    if (state.token) {
      await loadDashboard();
      showApp();
    } else {
      showAuth();
    }
  } catch (error) {
    clearSession();
    showAuth();
    showToast('Entre novamente para acessar o sistema.', 'error');
  } finally {
    elements.bootScreen.hidden = true;
  }
}

start();
