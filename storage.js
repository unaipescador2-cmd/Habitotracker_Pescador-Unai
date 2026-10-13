(function (global) {
  const COOKIE_DAYS = 365;
  const HABITS_COOKIE = 'habitotracker_habitos';
  const RECORDS_COOKIE = 'habitotracker_registros';

  function guardarCookie(nombre, valor, dias = COOKIE_DAYS) {
    const expires = new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${encodeURIComponent(nombre)}=${encodeURIComponent(valor)}; expires=${expires}; path=/; SameSite=Lax`;
  }

  function leerCookie(nombre) {
    const encodedName = `${encodeURIComponent(nombre)}=`;
    const cookie = document.cookie.split('; ').find((item) => item.startsWith(encodedName));
    return cookie ? decodeURIComponent(cookie.slice(encodedName.length)) : null;
  }

  function borrarCookie(nombre) {
    document.cookie = `${encodeURIComponent(nombre)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  }

  function guardarDatos(habitos, registros) {
    if (!Array.isArray(habitos) || !Array.isArray(registros)) {
      throw new TypeError('Los hábitos y registros deben ser arrays.');
    }

    guardarCookie(HABITS_COOKIE, JSON.stringify(habitos));
    guardarCookie(RECORDS_COOKIE, JSON.stringify(registros));
  }

  function agregarHabito(habito) {
    if (!habito || typeof habito !== 'object') {
      throw new TypeError('El hábito debe ser un objeto.');
    }

    const nombre = String(habito.nombre ?? '').trim();
    if (!nombre) {
      throw new TypeError('El nombre del hábito no puede estar vacío.');
    }

    const { habitos, registros } = cargarDatos();
    const nuevoHabito = {
      id: habito.id || `habito-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      nombre,
      descripcion: String(habito.descripcion ?? '').trim(),
      categoria: String(habito.categoria ?? '').trim() || 'General',
    };

    habitos.push(nuevoHabito);
    guardarDatos(habitos, registros);
    return nuevoHabito;
  }

  function registrarDia(habitoId, fecha, cumplido = false, observaciones = '') {
    if (!habitoId || !String(habitoId).trim()) {
      throw new TypeError('Debes seleccionar un hábito.');
    }

    if (!fecha || !String(fecha).trim()) {
      throw new TypeError('La fecha es obligatoria.');
    }

    const { habitos, registros } = cargarDatos();
    const habitoExiste = habitos.some((habito) => habito.id === habitoId);
    if (!habitoExiste) {
      throw new TypeError('El hábito seleccionado no existe.');
    }

    const nuevoRegistro = {
      id: `registro-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      habitoId,
      fecha,
      cumplido: Boolean(cumplido),
      observaciones: String(observaciones ?? '').trim(),
    };

    const index = registros.findIndex((registro) => registro.habitoId === habitoId && registro.fecha === fecha);
    if (index >= 0) {
      registros[index] = { ...registros[index], ...nuevoRegistro, id: registros[index].id };
    } else {
      registros.push(nuevoRegistro);
    }

    guardarDatos(habitos, registros);
    return index >= 0 ? registros[index] : nuevoRegistro;
  }

  function leerArrayCookie(nombre) {
    const value = leerCookie(nombre);
    if (value === null) return [];

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function cargarDatos() {
    return {
      habitos: leerArrayCookie(HABITS_COOKIE),
      registros: leerArrayCookie(RECORDS_COOKIE),
    };
  }

  function borrarDatos() {
    borrarCookie(HABITS_COOKIE);
    borrarCookie(RECORDS_COOKIE);
  }

  function obtenerEstadisticas() {
    const { habitos, registros } = cargarDatos();
    const hoy = new Date().toISOString().split('T')[0];
    const registrosHoy = registros.filter((registro) => registro.fecha === hoy);
    const hoyCumplidos = registrosHoy.filter((registro) => registro.cumplido).length;
    const hoyPendientes = registrosHoy.filter((registro) => !registro.cumplido).length;

    return {
      totalHabitos: habitos.length,
      totalRegistros: registros.length,
      hoyCumplidos,
      hoyPendientes,
      registrosHoy,
    };
  }

  global.HabitotrackerStorage = Object.freeze({
    guardarCookie,
    leerCookie,
    borrarCookie,
    guardarDatos,
    agregarHabito,
    registrarDia,
    obtenerEstadisticas,
    cargarDatos,
    borrarDatos,
  });
})(globalThis);