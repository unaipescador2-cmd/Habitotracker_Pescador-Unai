const storage = window.HabitotrackerStorage;

function renderStatusTable() {
  const table = document.querySelector('#status-table');
  if (!table) {
    return;
  }

  const tbody = table.querySelector('tbody');
  const { habitos, registros } = storage.cargarDatos();
  const hoy = new Date().toISOString().split('T')[0];

  if (!habitos.length) {
    tbody.innerHTML = '<tr><td colspan="3">No hay hábitos para mostrar.</td></tr>';
    return;
  }

  tbody.innerHTML = habitos.map((habito) => {
    const registro = registros.find((item) => item.habitoId === habito.id && item.fecha === hoy);
    const checked = registro ? registro.cumplido : false;

    return `
      <tr>
        <td>${habito.nombre}</td>
        <td>${habito.categoria || 'General'}</td>
        <td>
          <input
            type="checkbox"
            data-habito-id="${habito.id}"
            data-fecha="${hoy}"
            ${checked ? 'checked' : ''}
          />
        </td>
      </tr>
    `;
  }).join('');
}

function setupMenu() {
  const openButton = document.querySelector('#open-menu');
  const closeButton = document.querySelector('#close-menu');
  const modal = document.querySelector('#menu-modal');

  if (!openButton || !closeButton || !modal) {
    return;
  }

  openButton.addEventListener('click', () => {
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  });

  closeButton.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }
  });
}

function renderCounts() {
  const { habitos, registros } = storage.cargarDatos();
  document.querySelector('#habit-count').textContent = habitos.length;
  document.querySelector('#record-count').textContent = registros.length;
}

function renderHabitOptions() {
  const select = document.querySelector('#record-habit');
  if (!select) {
    return;
  }

  const { habitos } = storage.cargarDatos();
  select.innerHTML = '';

  if (!habitos.length) {
    const option = document.createElement('option');
    option.textContent = 'Crea primero un hábito';
    option.value = '';
    select.appendChild(option);
    return;
  }

  habitos.forEach((habito) => {
    const option = document.createElement('option');
    option.value = habito.id;
    option.textContent = habito.nombre;
    select.appendChild(option);
  });
}

function renderHabits() {
  const { habitos, registros } = storage.cargarDatos();
  const list = document.querySelector('#habit-list');

  if (!list) {
    return;
  }

  list.innerHTML = '';

  if (!habitos.length) {
    const item = document.createElement('li');
    item.className = 'habit-item';
    item.textContent = 'Todavía no has añadido ningún hábito.';
    list.appendChild(item);
    return;
  }

  habitos.forEach((habito) => {
    const item = document.createElement('li');
    item.className = 'habit-item';
    const record = registros.find((registro) => registro.habitoId === habito.id);
    const state = record ? (record.cumplido ? 'Cumplido' : 'No cumplido') : 'Sin registro';

    item.innerHTML = `
      <strong>${habito.nombre}</strong>
      <div>${habito.descripcion || 'Sin descripción'}</div>
      <small>${habito.categoria || 'General'}</small>
      <div class="habit-state">Estado: ${state}</div>
    `;
    list.appendChild(item);
  });
}

const form = document.querySelector('#habit-form');
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const habit = {
      nombre: formData.get('nombre'),
      descripcion: formData.get('descripcion'),
      categoria: formData.get('categoria'),
    };

    try {
      storage.agregarHabito(habit);
      form.reset();
      renderCounts();
      renderHabits();
      renderHabitOptions();
    } catch (error) {
      window.alert(error.message);
    }
  });
}

const recordForm = document.querySelector('#record-form');
if (recordForm) {
  recordForm.querySelector('#record-date').valueAsDate = new Date();

  recordForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(recordForm);
    const habitoId = String(formData.get('habitoId') ?? '').trim();
    const fecha = String(formData.get('fecha') ?? '').trim();
    const cumplido = formData.get('cumplido') === 'on';
    const observaciones = String(formData.get('observaciones') ?? '').trim();

    try {
      storage.registrarDia(habitoId, fecha, cumplido, observaciones);
      renderCounts();
      renderHabits();
      renderStatusTable();
      recordForm.reset();
      recordForm.querySelector('#record-date').valueAsDate = new Date();
    } catch (error) {
      window.alert(error.message);
    }
  });
}

const statusTable = document.querySelector('#status-table');
if (statusTable) {
  statusTable.addEventListener('change', (event) => {
    const checkbox = event.target;
    if (!(checkbox instanceof HTMLInputElement) || checkbox.type !== 'checkbox') {
      return;
    }

    const habitoId = checkbox.dataset.habitoId;
    const fecha = checkbox.dataset.fecha;

    try {
      storage.registrarDia(habitoId, fecha, checkbox.checked);
      renderCounts();
      renderHabits();
      renderStatusTable();
    } catch (error) {
      window.alert(error.message);
    }
  });
}

renderCounts();
renderHabits();
renderHabitOptions();
renderStatusTable();
setupMenu();