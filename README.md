# Legado

Idle/tycoon web: gestionas una civilización que evoluciona por eras históricas (Antiguo Egipto →
Roma → Edad Media → …). Capa de colección tipo gacha ligero: figuras históricas reales e
inventos/artefactos de cada era como coleccionables con lore propio.

Pista **web nativa** (React/TypeScript, sin motor de juego), explorada en paralelo y sin urgencia al
idle/tycoon ya en marcha en Unity ([`../primer-idle/`](../primer-idle/)) — mismo espíritu de "esencia
propia" del hub, distinto stack. El nicho (civilizaciones por eras) tiene competencia real (*CivIdle*,
*Idle Civilizations*, entre otros); la apuesta es diferenciarse por arte/tono/colección propios, no
por ser los primeros. Detalle de la decisión de temática y nombre en
[`docs/plan-maestro.md`](docs/plan-maestro.md).

Arte y música los aporta la pareja (perfil creativo). Arquitectura, TDD, CI/CD e implementación de
código los lleva Claude.

## Stack

Vite + React 18 + TypeScript (strict) + Vitest + Testing Library. Gestor de paquetes: **pnpm**. Sin
backend en el MVP (guardado local en `localStorage`) — ver justificación en
[`docs/plan-maestro.md`](docs/plan-maestro.md).

## Comandos

```
pnpm install     # instalar dependencias
pnpm dev         # servidor de desarrollo
pnpm lint        # ESLint
pnpm typecheck   # tsc --noEmit
pnpm test        # Vitest
pnpm build       # build de producción
```

## Documentación

- [`docs/plan-maestro.md`](docs/plan-maestro.md) — decisión de temática/nombre, arquitectura, y hoja
  de ruta del MVP por subfases (fuente de verdad del roadmap).
- [`docs/stack-y-distribucion.md`](docs/stack-y-distribucion.md) — investigación de stack técnico 2D
  (React/DOM vs Phaser vs PixiJS) y distribución (dominio propio vs. portales CrazyGames/Poki).
- [`CLAUDE.md`](CLAUDE.md) — convenciones del subproyecto para trabajar aquí con Claude Code.
