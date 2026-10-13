const storage = window.HabitotrackerStorage;

function renderCounts() {
  const { habitos, registros } = storage.cargarDatos();
  document.querySelector('#habit-count').textContent = habitos.length;
  document.querySelector('#record-count').textContent = registros.length;
}

function renderHabits() {
  const { habitos } = storage.cargarDatos();
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
    item.innerHTML = `
      <strong>${habito.nombre}</strong>
      <div>${habito.descripcion || 'Sin descripción'}</div>
      <small>${habito.categoria || 'General'}</small>
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
    } catch (error) {
      window.alert(error.message);
    }
  });
}

renderCounts();
renderHabits();