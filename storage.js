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

  global.HabitotrackerStorage = Object.freeze({
    guardarCookie,
    leerCookie,
    borrarCookie,
    guardarDatos,
    cargarDatos,
    borrarDatos,
  });
})(globalThis);