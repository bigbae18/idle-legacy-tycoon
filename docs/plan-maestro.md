# Idle Legacy Tycoon — plan maestro

> Fuente de verdad del roadmap de este subproyecto (equivalente a `trading/docs/14-plan-maestro.md`
> para el hub). Empieza por aquí al retomar el proyecto.

## Origen y contexto

Pista **web nativa** del idle/tycoon del hub, explorada en paralelo y sin urgencia al idle/tycoon ya
en marcha en Unity ([`../../primer-idle/`](../../primer-idle/README.md), que sigue su curso sin
tocarse). Nace de una idea inicial del usuario de un juego narrativo en Three.js — ver
[`../../../docs/juego-narrativo-webgl.md`](../../../docs/juego-narrativo-webgl.md) — que tras
aclarar que el concepto real es idle/tycoon (no narrativo pesado) derivó en esta pista, con
arquitectura, TDD, CI/CD e implementación de código llevados por Claude; arte y música los aporta la
pareja (perfil creativo).

## Temática y nombre

- **Temática:** gestionas una civilización que evoluciona por eras históricas (Antiguo Egipto → Roma
  → Edad Media → …). Capa de colección tipo gacha ligero de **figuras históricas reales o
  inventos/artefactos de cada era** como coleccionables con lore propio.
- **Cómo se eligió:** una investigación dedicada (deep-research) buscando un nicho temático con hueco
  de mercado real **no encontró ninguno verificado** — candidatas "poco explotadas" (mafia/crimen,
  prehistórico/dinosaurios, sanidad, prisiones, residuos, brainrot, cripto-zoología) resultaron, tras
  verificación adversarial, ya cubiertas comercialmente o sin respaldo suficiente. Sí quedó
  confirmado con solidez: usar IP de terceros no licenciada (tipo Pokémon/creature-collecting) tiene
  riesgo legal real y cuantificable (caso real: ~15M$ en sentencia); temáticas genéricas de dominio
  público (folclore, mitología, historia, ciencia) son legalmente seguras ("scenes a faire", no
  monopolizables). Ante la falta de hueco claro, se optó por una temática seria y con encanto propio
  en vez de perseguir más originalidad.
- **Aviso honesto:** una comprobación rápida encontró que "civilización por eras" en formato idle
  **ya tiene competencia real** (*CivIdle* en Steam, *Idle Civilizations - Evolution*, *Civilization
  Tycoon Idle Merge*, *My Civilization: Idle Game*, *Pop Epoch: Civilization Tycoon*, *Time Tycoon:
  Idle Civilization*) — no es un hueco vacío. Decisión consciente: diferenciarse por **arte, tono y
  la capa de colección propia**, no por ser los primeros — coherente con la filosofía ya escrita en
  [`../../primer-idle/README.md`](../../primer-idle/README.md) ("la temática/encanto diferencia").
- **Nombre:** durante el scaffolding se usó "Legado" como nombre de trabajo (evitando a propósito el
  patrón genérico "Idle [Tema] Tycoon" para el que la investigación encontró un caso real de Kolibri
  Games enviando un aviso de infracción de marca a un indie por usarlo). **El usuario decidió el
  nombre definitivo: "Idle Legacy Tycoon"** (repo GitHub `idle-legacy-tycoon`, cuenta `bigbae18`) —
  se renombró todo el proyecto (carpeta, `package.json`, título, docs) a este nombre.

## Backend y anti-trampa

Motivado por un precedente propio (`Pokelike`: userscript de ventajas por lógica 100% en cliente), se
investigó si el MVP necesita backend/servidor autoritativo desde ya. Hallazgo con fuentes reales:
**ningún idle game de referencia sin ranking (Cookie Clicker, NGU Idle) protege el guardado con
criptografía real** — solo Base64/checksum trivialmente reversible, bajo la filosofía "el jugador
solo se hace trampa a sí mismo". El único exploit documentado en la categoría (Melvor Idle, issue
#470) no fue manipulación de guardado local sino abuso de una función *online* legítima (cloud save)
para reintentar RNG — y ni así se movió la autoridad al servidor. El principio de "servidor
autoritativo" es el estándar para multijugador/competitivo, pero las propias fuentes que lo definen
dicen que no aplica con la misma fuerza a un single-player sin elemento competitivo que proteger.

**Decisión: el MVP no lleva backend ni base de datos.** Guardado en `localStorage`, sin
sobre-invertir en ofuscación. Lo que sí se construye desde ya es la costura arquitectónica (capas de
abajo): separar limpiamente `core/` (motor de juego) de `persistence/` (estado/guardado) y `ui/`,
para poder mover esa lógica a un servidor autoritativo sin reescribir el frontend cuando llegue el
componente social (equivalente a la v2 de `primer-idle`: ranking/cloud save). Para ese momento
futuro, **PocketBase** (binario único en Go, autohospedado, gratis/open source, ~5$/mes de VPS) es la
opción de menor fricción frente a Supabase (Postgres completo, más potente pero más complejo) o un
backend Node propio con Prisma/Drizzle (más control, más mantenimiento) — queda anotado como
referencia, no se construye en el MVP.

## Arquitectura

**Stack:** Vite + React 18 + TypeScript (strict) + Vitest + Testing Library + jsdom + ESLint/Prettier.
**Gestor de paquetes: pnpm** (migrado desde npm por seguridad de cadena de suministro — pnpm verifica
el lockfile contra políticas de supply-chain y aísla scripts de instalación no aprobados por
defecto). Sin motor de juego (React/DOM puro — ver
[`stack-y-distribucion.md`](stack-y-distribucion.md)). Sin backend en el MVP (ver arriba).

**Regla de capas** (fuerza que la lógica del juego sea TDD-able sin overhead de renderizado):
`src/core/` no importa nada de `src/ui/` ni `src/persistence/`; `src/persistence/` puede importar
tipos de `src/core/` pero no al revés. `src/ui/` es la única capa que importa React.

```
games/idle-legacy-tycoon/
  package.json, tsconfig*.json, vite.config.ts, eslint.config.js, .prettierrc, .gitignore
  index.html, README.md, CLAUDE.md, wrangler.toml
  .github/workflows/ci.yml
  docs/
    plan-maestro.md          ← este documento
    stack-y-distribucion.md  ← investigación de stack 2D y distribución
  src/
    core/          ← lógica pura del motor (tick, recursos, upgrades, prestigio, offline, numbers)
    persistence/   ← guardado/carga localStorage + migraciones de esquema
    ui/            ← componentes React + hooks
    test/setup.ts  ← configuración de Vitest (jest-dom)
    App.tsx, App.test.tsx, main.tsx, vite-env.d.ts, index.css
```

`index.css`: CSS plano global (sin CSS modules ni librerías) — layout, tipografía, color de acento y
estados de botón, sin ningún asset. Es un placeholder visual, no la marca/arte final de la pareja.

**Decisiones de diseño específicas del género (idle game):**
- **Números grandes: NO en el MVP.** `Number.MAX_SAFE_INTEGER` sobra para el alcance del MVP. Toda
  la aritmética pasará por `core/numbers.ts`, así que si en v2/v3 hace falta big-number, el cambio
  queda localizado ahí — reducers, componentes y el motor de guardado no tocan `+`/`*` directamente.
- **Ganancias offline por timestamp absoluto**, nunca por contador de ticks (los tabs en segundo
  plano frenan `setInterval`/rAF). Casos a cubrir con tests: delta negativo (reloj retrocede) → 0;
  delta absurdamente grande (cambio de fecha) → cap configurable; la misma función pura sirve tanto
  para el tick "online" como para el resumen "offline".
- **Versionado de guardado desde el primer save**, no cuando duela: `schemaVersion` en la raíz del
  objeto guardado; migraciones testeables con un fixture de "save antiguo" sin tocar `localStorage`
  real.

## CI/CD

`.github/workflows/ci.yml`, en push/PR a `main`: checkout → `pnpm/action-setup` → `setup-node@22`
(cache pnpm) → `pnpm install --frozen-lockfile` → `pnpm lint` → `pnpm typecheck` → `pnpm test` →
`pnpm build`. Sin secretos en el MVP (no hay backend que exponer). **Nota:** `pnpm@11.9.0` requiere
Node ≥22.13 (usa el módulo interno `node:sqlite`) — Node 20 revienta el CI con
`ERR_UNKNOWN_BUILTIN_MODULE`; `.nvmrc` y `engines.node` en `package.json` están alineados a esto.

**Despliegue:** repo de GitHub conectado a **Cloudflare Workers** (flujo unificado de Workers/Pages,
sirve `dist/` como assets estáticos vía `wrangler.toml` con `deploy command: npx wrangler deploy`,
fallback SPA activado) — build automático en cada push a `main`. Preview en producción:
https://idle-legacy-tycoon.adrianpelayo-a.workers.dev (verificado, HTTP 200). Alternativas válidas
sin bloqueo de arquitectura: Netlify, GitHub Pages.

## Hoja de ruta del MVP (subfases)

| Fase | Estado | Entregable | Tests clave |
|---|---|---|---|
| MVP-0 | ✅ Hecho | Scaffold: Vite+React+TS+pnpm, lint/format, Vitest+RTL, CI en verde, repo en GitHub, desplegado en Cloudflare Workers | Test dummy pasa en CI; build funciona; preview público responde 200 |
| MVP-1 | ✅ Hecho | Motor de tick puro (`core/types.ts`, `core/tick.ts`) | delta=0 no-op; delta=N produce N×rate; rate=0 no produce nada |
| MVP-2 | ✅ Hecho | Bucle de juego en vivo (UI mínima): `useGameLoop`, `GameProvider`, `ResourceDisplay` | Con fake timers, el estado avanza; el componente renderiza el número |
| MVP-3 | ✅ Hecho | Upgrades (`core/upgrades.ts`, `UpgradeList`) | Sin fondos → no-op; con fondos → descuenta y sube de nivel; el coste escala bien |
| MVP-4 | ✅ Hecho | Guardado local + versión de esquema (autosave por intervalo + `visibilitychange`) | Guardar/recargar reproduce el estado; JSON corrupto/vacío cae a un estado seguro; versión correcta |
| MVP-4.5 | ✅ Hecho | Reescala de economía + `core/numbers.ts` (formato K/M/B, adelantado desde MVP-10) + CSS base sin assets | `perSecondToPerMs`/`formatNumber` con TDD; verificado a ojo en servidor de preview aislado que el ritmo se siente jugable (~10-15s la primera mejora) |
| MVP-5 | Pendiente | Ganancias offline por reloj real (`core/offline.ts`, `OfflineEarningsModal`) | Delta negativo → 0; delta enorme → cap; delta normal → delta×rate |
| MVP-6 | Pendiente | Prestigio (`core/prestige.ts`, `PrestigePanel` con confirmación) | Por debajo del umbral no disponible; el reset limpia recursos/upgrades pero preserva/aumenta el multiplicador |
| MVP-7 | Pendiente | Primera migración real de guardado (cuando MVP-3/6 cambien la forma del save) | Save fixture antiguo migra correctamente; un save ya migrado no se remigra |
| MVP-8 | Pendiente | Monetización: anuncios opt-in (stub) (`AdRewardButton` tras interfaz `AdProvider` mockable) | Deshabilitado tras reclamar la recompensa del periodo |
| MVP-9 | Pendiente | Monetización: moneda premium + IAP quitar anuncios (interfaz `PaymentProvider` stub) | Comprar "quitar anuncios" persiste el flag y oculta la UI de anuncios tras recargar |
| MVP-10 | Pendiente | Pulido agnóstico de tema (animaciones/transiciones; el formato K/M/B ya se hizo en MVP-4.5) | — |
| MVP-11 | Pendiente | Despliegue final del MVP + checklist manual de humo | Checklist manual; Playwright opcional |

Cada subfase es una sesión de implementación TDD independiente (test en rojo → código → refactor).
Ninguna fase depende del tema/arte del juego — la UI se construye contra datos genéricos, así que los
assets reales de la pareja son un reemplazo, no una reescritura.

## Nota de diseño: ritmo de la economía (detectada en MVP-3, resuelta parcialmente en MVP-4.5)

Tras jugar un poco con el MVP-3, se detectó que el `rate` inicial (1/ms = 1000/seg) era tan alto
respecto al coste de la primera mejora (10) que (a) se alcanzaba casi al instante, sin sensación de
progreso, y (b) gastar el coste al comprar era imperceptible porque el `amount` se "recuperaba" en
milisegundos — ambas son la misma causa de fondo (desequilibrio coste/rate), no dos problemas
distintos. En MVP-4.5 se reescaló a magnitudes por segundo (vía `core/numbers.ts:perSecondToPerMs`):
ahora la primera mejora tarda ~10-15s, un ritmo que sí se siente como un juego real. **Sigue siendo
economía de relleno**, no balance final — no hay todavía catálogo real de mejoras (solo hay una, de
prueba). El balance final (número de mejoras, curva de coste definitiva, sensación de progresión a
largo plazo) queda aplazado a propósito hasta que exista un catálogo real, probablemente junto con la
capa de colección/gacha (ver más abajo).

## Fases posteriores (fuera de alcance del MVP, no diseñadas todavía)

En paralelo con el roadmap de [`../../primer-idle/README.md`](../../primer-idle/README.md): capa de
colección/gacha (figuras históricas de cada era), ranking/social (dispara la necesidad de backend —
ver PocketBase arriba), pase de batalla, multijugador asíncrono. No se diseña nada de esto hasta
cerrar el MVP.

## Visión a largo plazo del usuario — ideas sin aterrizar (anotadas 2026-07-04)

Al cerrar esta sesión, el usuario adelantó que tiene en mente un juego bastante más ambicioso que el
MVP actual, con **checkpoints/regiones** y **varios rebirths** (plural — más de una capa de
prestigio/renacimiento, no solo el prestigio único y plano de MVP-6), además de querer **una buena
historia**. En sus propias palabras: "tengo mucho pensado pero hay que aterrizar muchas cosas" — es
decir, son ideas de dirección, no decisiones tomadas ni diseño a implementar todavía.

**Matiz importante a resolver en una futura sesión, no a asumir:** en la sesión recuperada tras el
BSOD (ver `../../../docs/juego-narrativo-webgl.md` y la memoria `[[proyecto-idle-legacy-tycoon]]`),
el propio usuario ya corrigió explícitamente que este juego **NO** es narrativo pesado — al mencionar
"historia" se refería a lore ligero por desbloqueo (estilo *Idle Miner Tycoon*), no a una trama tipo
*Night in the Woods*, y por eso se descartó la vía Three.js/narrativa completa. La nueva mención de
"una buena historia" puede ser compatible con eso (lore rico y currado por región/era, no una trama
jugable) o puede ser una ampliación real de ambición hacia algo más narrativo — **no dar nada por
sentado; preguntar y aclarar esto explícitamente antes de diseñar checkpoints/regiones/rebirths**.

Conexión natural a explorar (sin decidir): la temática ya elegida (civilización que evoluciona por
eras históricas) encaja de forma bastante directa con la idea de "regiones" — cada era podría ser una
región/checkpoint desbloqueable — pero esto es una hipótesis a validar con el usuario, no un diseño
cerrado.

## Dónde lo dejamos (2026-07-04)

**MVP-0 a MVP-4.5 completos, verificados y desplegados** (ver tabla de arriba) — bucle de tick,
upgrades, guardado local con autosave, economía a un ritmo jugable, y una capa visual básica sin
assets. CI en verde en cada paso, preview público funcionando en
https://idle-legacy-tycoon.adrianpelayo-a.workers.dev. **Siguiente paso técnico:** MVP-5 (ganancias
offline por reloj real). **Antes de seguir escalando mecánicas**, conviene una conversación dedicada
sobre la visión a largo plazo de arriba (checkpoints/regiones/rebirths/historia) para que el roadmap
MVP-6 en adelante se diseñe con esa dirección en mente, en vez de a ciegas.
