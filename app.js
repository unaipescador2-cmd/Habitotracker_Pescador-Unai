const { habitos, registros } = window.HabitotrackerStorage.cargarDatos();

document.querySelector('#habit-count').textContent = habitos.length;
document.querySelector('#record-count').textContent = registros.length;