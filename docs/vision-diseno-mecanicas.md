# Visión de diseño — negocios/misiones/agentes por era (CERRADO 2026-07-05 → ver `gdd.md`)

> **Este documento ya cumplió su función y queda como registro histórico.** El 2026-07-05 se
> recuperaron las dos investigaciones pendientes (habían terminado en disco; síntesis manual en
> [`investigaciones-recuperadas-2026-07-04.md`](investigaciones-recuperadas-2026-07-04.md)) y la
> conversación de diseño se aterrizó en el **[`gdd.md`](gdd.md)** — esa es ahora la fuente de verdad
> de mecánicas, progresión, renaceres y roadmap (fases R0-R9). No diseñes ni implementes desde este
> documento.

## Por qué existe este documento

Tras completar MVP-0 a MVP-4.5 (scaffold técnico con mecánicas de relleno: un solo recurso, una
sola mejora, prestigio plano — ver [`plan-maestro.md`](plan-maestro.md)), el usuario planteó que
quiere un juego bastante más ambicioso de verdad (misiones, negocios por era, agentes
coleccionables) y preguntó si había que esperar a terminar todos los MVP-N originales antes de
diseñar eso en serio.

**Respuesta acordada: no.** Se para el roadmap genérico placeholder aquí (no se sigue con MVP-6 tal
como estaba escrito) y se diseña la mecánica real primero, porque:
- La base de ingeniería ya construida (motor de tick, capas `core/persistence/ui`, autosave con
  versión de esquema, CI/CD, despliegue) es reutilizable pase lo que pase — se diseñó justo para
  poder sustituir la lógica de juego sin reescribir los cimientos.
- Seguir implementando MVP-6..11 tal como estaban planteados (mejora única, prestigio plano, stubs
  de monetización genéricos) sería trabajo tirado en cuanto se diseñe el catálogo real de
  negocios/misiones/agentes — mejor diseñar antes de seguir picando código de relleno.

## Idea de diseño del usuario (aportada 2026-07-04, sin aterrizar del todo — no es diseño cerrado)

- **Negocios/artefactos por era:** cada era histórica tiene su propio "negocio" central que genera
  el recurso principal de esa era. Ejemplo dado por el usuario: en la Prehistoria, el negocio es
  descubrir y explotar **el fuego**.
- **Mecánica de arranque de cada negocio:** al principio, click manual periódico (ejemplo dado:
  cada 5 segundos), en la línea de *AdVenture Ages*. El propio usuario ya avisa que esto habrá que
  revisarlo/ajustarlo junto con la economía real — no es una decisión cerrada, es una referencia de
  partida.
- **Sistema de misiones → nivel de usuario:** completar misiones sube un "nivel de usuario"
  transversal, **distinto** del progreso económico de cada era/negocio individual. Aún sin definir:
  qué desbloquea ese nivel, cómo se generan las misiones, con qué frecuencia.
- **Agentes/personajes coleccionables por era:** ejemplo dado — en la Prehistoria, coleccionar los
  distintos homínidos conocidos de la evolución. Probablemente automatizan o potencian el negocio de
  esa era, pero el mecanismo exacto todavía no está decidido.
- **Ambición declarada explícitamente por el usuario:** diseño a gran escala, una UI que "llame la
  atención", buena UX, una economía "súper optimizada" a la experiencia de usuario — quiere un buen
  producto de verdad, no solo un ejercicio técnico de aprendizaje.
- **Quiere eventualmente empaquetarlo como app y subirlo a la App Store** de Apple (ver aviso técnico
  más abajo, es una tensión real con el stack ya elegido).

## Referencias de diseño del usuario (opiniones de jugador experimentado, pendientes de verificar)

El usuario fue explícito en que quiere **aplicar estrategias de estas referencias con novedad y
reinvención, no clonar** — y mejorar los puntos flacos reales que se encuentren, no solo copiar lo
que funciona.

- **AdVenture Ages** — buen ejemplo (de ahí el guiño del click periódico al principio), pero según
  el usuario **la progresión se vuelve muy difícil muy rápido**.
- **AdVenture Communist** (Hyper Hippo, mismo publisher que Ages) — para el usuario, **el mejor
  ritmo de evolución de gestión que ha visto en el género**: muchas buenas ofertas/deals, muchos
  personajes.

Estas son percepciones de jugador, no datos verificados todavía — de ahí la primera investigación
lanzada (ver abajo): entender **por qué** una tiene mejor ritmo que la otra con fuentes reales, no
solo confirmar la intuición.

## Aviso técnico que planteé yo: tensión App Store vs. stack React/DOM puro

La investigación ya existente del proyecto ([`stack-y-distribucion.md`](stack-y-distribucion.md))
encontró que la ruta oficial verificada de "envolver con Capacitor sin reescribir" está confirmada
**para Phaser** (tutorial oficial del propio equipo de Phaser), pero **no** para el enfoque
React/DOM puro que elegimos para este proyecto (aunque Capacitor puede técnicamente envolver
cualquier web app en general). Si publicar en la App Store es un objetivo real, esto hay que
resolverlo con datos, no dar por hecho que "ya se verá" — de ahí la segunda investigación lanzada.

## Investigaciones lanzadas (en curso al cerrar esta sesión, 2026-07-04)

Sesión con id `3a7da1bd-fbff-459d-9e24-271e0d537ab3`. Si esta sesión se corta (límite semanal) antes
de que terminen, **no hace falta relanzarlas a ciegas** — comprobar primero si ya terminaron y
quedaron guardadas en disco, igual que se recuperó la investigación de la sesión cortada por el
BSOD el mismo día (2026-07-04, ver memoria `[[proyecto-idle-legacy-tycoon]]`).

1. **Economía de AdVenture Communist vs. AdVenture Ages** — run id `wf_ab406461-dd7`.
   Resultado final esperado en:
   `C:\Users\Bigbae\.claude\projects\D--Proyectos-Shein\3a7da1bd-fbff-459d-9e24-271e0d537ab3\workflows\wf_ab406461-dd7.json`
   (campo `result` con `summary`/`findings`/`sources`, formato ya usado en investigaciones previas
   del hub). Si ese fichero no existe todavía o no tiene `result`, los logs crudos por agente están
   en
   `C:\Users\Bigbae\.claude\projects\D--Proyectos-Shein\3a7da1bd-fbff-459d-9e24-271e0d537ab3\subagents\workflows\wf_ab406461-dd7\`
   (se puede reconstruir a mano desde ahí si hiciera falta, como ya se hizo una vez este mismo día).
   Cubre: curva de coste y sistema de ofertas/personajes de Communist, causa de diseño real de la
   dificultad de Ages, patrones de "misiones suben nivel de usuario" y "agentes coleccionables
   automatizan producción" en el género, y puntos flacos documentados de ambos juegos.

2. **Viabilidad real de React/DOM puro en la App Store** — run id `wf_cd331914-18a`.
   Resultado final esperado en:
   `C:\Users\Bigbae\.claude\projects\D--Proyectos-Shein\3a7da1bd-fbff-459d-9e24-271e0d537ab3\workflows\wf_cd331914-18a.json`
   (o los logs crudos en
   `C:\Users\Bigbae\.claude\projects\D--Proyectos-Shein\3a7da1bd-fbff-459d-9e24-271e0d537ab3\subagents\workflows\wf_cd331914-18a\`
   si no llegó a sintetizar).
   Cubre: casos reales de apps React/DOM en la App Store vía Capacitor, riesgo de rechazo por la
   guideline 4.2 (minimum functionality), alternativas a Capacitor (Tauri móvil, etc.), coste/proceso
   real de publicar.

## Próximo paso al retomar

1. Comprobar si las dos investigaciones de arriba terminaron (mirar los ficheros indicados antes de
   relanzar nada — cuestan tiempo y presupuesto real).
2. Con esos resultados + esta conversación, diseñar de verdad: catálogo de negocios/artefactos por
   era, sistema de misiones y nivel de usuario, sistema de agentes/coleccionables, y una decisión
   informada sobre el camino a la App Store.
3. Replantear las subfases MVP-6 en adelante alrededor de ese diseño real — no seguir el roadmap
   genérico placeholder de `plan-maestro.md` tal cual estaba escrito.
