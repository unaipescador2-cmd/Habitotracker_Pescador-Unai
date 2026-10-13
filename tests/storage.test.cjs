const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function createStorage() {
  const cookies = new Map();
  const document = {};

  Object.defineProperty(document, 'cookie', {
    get() {
      return [...cookies].map(([name, value]) => `${name}=${value}`).join('; ');
    },
    set(cookie) {
      const [pair, ...attributes] = cookie.split(';');
      const separator = pair.indexOf('=');
      const name = pair.slice(0, separator);
      const value = pair.slice(separator + 1);
      const expires = attributes.find((attribute) => attribute.trim().startsWith('expires='));

      if (expires && new Date(expires.trim().slice(8)) < new Date()) {
        cookies.delete(name);
      } else {
        cookies.set(name, value);
      }
    },
  });

  const context = vm.createContext({ document });
  const source = fs.readFileSync(path.join(__dirname, '..', 'storage.js'), 'utf8');
  vm.runInContext(source, context);
  return context.HabitotrackerStorage;
}

test('guarda y recupera los dos arrays completos como JSON', () => {
  const storage = createStorage();
  const habitos = [{ id: 'h1', nombre: 'Leer', categoria: 'Estudio' }];
  const registros = [{ id: 'r1', habitoId: 'h1', fecha: '2026-10-13', cumplido: true }];

  storage.guardarDatos(habitos, registros);

  assert.deepEqual(JSON.parse(storage.leerCookie('habitotracker_habitos')), habitos);
  assert.deepEqual(JSON.parse(storage.leerCookie('habitotracker_registros')), registros);
  assert.deepEqual(JSON.stringify(storage.cargarDatos()), JSON.stringify({ habitos, registros }));
});

test('devuelve arrays vacíos si faltan cookies o el JSON está dañado', () => {
  const storage = createStorage();
  assert.deepEqual(JSON.stringify(storage.cargarDatos()), JSON.stringify({ habitos: [], registros: [] }));

  storage.guardarCookie('habitotracker_habitos', '{json roto');
  storage.guardarCookie('habitotracker_registros', '{"dato":true}');

  assert.deepEqual(JSON.stringify(storage.cargarDatos()), JSON.stringify({ habitos: [], registros: [] }));
});

test('borra ambas cookies de datos', () => {
  const storage = createStorage();
  storage.guardarDatos([{ id: 'h1' }], [{ id: 'r1' }]);

  storage.borrarDatos();

  assert.equal(storage.leerCookie('habitotracker_habitos'), null);
  assert.equal(storage.leerCookie('habitotracker_registros'), null);
});

test('rechaza valores que no sean arrays', () => {
  const storage = createStorage();
  assert.throws(() => storage.guardarDatos({}, []), { name: 'TypeError' });
});

test('agrega un hábito válido y evita nombres vacíos', () => {
  const storage = createStorage();

  storage.guardarDatos([], []);
  storage.agregarHabito({ nombre: 'Leer 20 minutos', descripcion: 'Antes de dormir', categoria: 'Estudio' });

  const { habitos } = storage.cargarDatos();
  assert.equal(habitos.length, 1);
  assert.equal(habitos[0].nombre, 'Leer 20 minutos');
  assert.equal(habitos[0].categoria, 'Estudio');
  assert.throws(
    () => storage.agregarHabito({ nombre: '   ', descripcion: 'vacio', categoria: 'Salud' }),
    { name: 'TypeError' },
  );
});

test('guarda un registro diario asociado a un hábito y por defecto inicia no cumplido', () => {
  const storage = createStorage();

  storage.guardarDatos([], []);
  const habito = storage.agregarHabito({ nombre: 'Caminar', categoria: 'Salud' });
  const registro = storage.registrarDia(habito.id, '2026-10-13', false);

  const { registros } = storage.cargarDatos();
  assert.equal(registro.cumplido, false);
  assert.equal(registros.length, 1);
  assert.equal(registros[0].habitoId, habito.id);
  assert.equal(registros[0].fecha, '2026-10-13');
  assert.equal(registros[0].cumplido, false);
});