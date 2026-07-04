# core/

Lógica pura del motor de juego (tick, recursos, upgrades, prestigio, ganancias offline, aritmética).

Regla: **no importa nada de `../ui/` ni de `../persistence/`**. Todo aquí es testeable con Vitest
en modo node puro, sin jsdom, sin React. Se implementa a partir de MVP-1 (ver `docs/plan-maestro.md`).
