# CLAUDE.md — Subproyecto **Legado** (`games/legado/`)

> Subproyecto del hub `Shein` (ver `../../CLAUDE.md`). Lee `docs/plan-maestro.md` al retomar —
> es la fuente de verdad del roadmap, la temática y las decisiones de arquitectura.

## Qué es este proyecto

Idle/tycoon web: gestionas una civilización que evoluciona por eras históricas, con una capa de
colección tipo gacha ligero (figuras/artefactos históricos). Pista web nativa (React/TypeScript, sin
motor de juego) en paralelo al idle/tycoon en Unity de [`../primer-idle/`](../primer-idle/), sin
prisa ni sustituirlo. Repositorio propio en GitHub (`idle-legacy-tycoon`), separado del resto del hub
`Shein` porque ese hub contiene datos financieros personales (`trading/`) que no deben compartir
blast radius con este repo (colaboradores, visibilidad pública futura, logs de CI).

## Cómo debes comportarte aquí

- **Claude lleva TDD, arquitectura, implementación de código y CI/CD.** El usuario discute
  tecnologías y decide junto contigo, pero espera que la estructura de carpetas y la implementación
  las decidas y ejecutes tú. Arte y música los aporta la pareja (perfil creativo) — ningún commit de
  lógica de juego debe bloquearse esperando assets reales; usa placeholders.
- **TDD real:** cada subfase del `docs/plan-maestro.md` se implementa test-primero (rojo → código →
  refactor), no tests añadidos después para cubrir código ya escrito.
- **Regla de capas, sin excepciones:** `src/core/` no importa de `src/ui/` ni `src/persistence/`;
  `src/persistence/` puede importar tipos de `src/core/` pero no al revés. Si una función de
  `core/` necesita algo de React o de `localStorage`, es una señal de que está mal ubicada.
- **Sin backend en el MVP.** Ver la justificación completa (con fuentes) en
  `docs/plan-maestro.md#backend-y-anti-trampa`. No añadas servidor/base de datos "por si acaso";
  espera a que el plan maestro indique que toca (componente social/ranking).
- **Sin números grandes (`break_eternity.js`/`decimal.js`) en el MVP** — ver justificación en
  `docs/plan-maestro.md`. Toda la aritmética de recursos pasa por `core/numbers.ts` para que el
  cambio, si hace falta más adelante, quede localizado ahí.
- **Ganancias offline siempre por timestamp absoluto**, nunca por contador de ticks acumulados.
- **Guardado versionado desde el primer save** (`schemaVersion`), con migraciones puras y testeables
  en `persistence/migrations/`.
- Cada fase MVP-N de `docs/plan-maestro.md` es una sesión de implementación enfocada — no adelantes
  fases ni mezcles varias en un mismo commit sin que el usuario lo pida explícitamente.

## Stack y comandos

- **Vite + React 18 + TypeScript (strict) + Vitest + Testing Library + jsdom + ESLint/Prettier.**
- **Gestor de paquetes: pnpm** (no `npm` ni `yarn` — migrado explícitamente por seguridad de cadena
  de suministro: pnpm aísla scripts de instalación no aprobados y verifica el lockfile).
  - `pnpm install`, `pnpm dev`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
- **CI:** `.github/workflows/ci.yml` en cada push/PR a `main` (lint → typecheck → test → build).
- **Despliegue:** Cloudflare Pages conectado al repo de GitHub, build automático en cada push.

## Documentación

- `docs/plan-maestro.md` — **empieza por aquí**: temática, nombre, decisión de backend/anti-trampa,
  arquitectura completa, hoja de ruta del MVP por subfases.
- `docs/stack-y-distribucion.md` — investigación de stack técnico 2D y distribución (portales vs.
  dominio propio).
- `../primer-idle/README.md` y `../primer-idle/referencias-mercado.md` — el concepto de juego
  hermano en Unity (mismo espíritu de diseño, distinto stack); consulta ahí antes de reinvestigar
  monetización o mecánicas ya cubiertas allí.
