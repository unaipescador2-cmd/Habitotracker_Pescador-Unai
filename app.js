const storage = window.HabitotrackerStorage;

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
      recordForm.reset();
      recordForm.querySelector('#record-date').valueAsDate = new Date();
    } catch (error) {
      window.alert(error.message);
    }
  });
}

renderCounts();
renderHabits();
renderHabitOptions();