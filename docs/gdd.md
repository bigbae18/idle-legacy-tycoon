# GDD — Idle Legacy Tycoon (diseño v1, 2026-07-05)

> **Fuente de verdad del diseño de juego.** Sustituye las fases placeholder MVP-5..11 de
> [`plan-maestro.md`](plan-maestro.md) por el roadmap real (§11). Se apoya en la visión del usuario
> ([`vision-diseno-mecanicas.md`](vision-diseno-mecanicas.md)) y en los hallazgos verificados de
> [`investigaciones-recuperadas-2026-07-04.md`](investigaciones-recuperadas-2026-07-04.md).
> Los números concretos son **valores de arranque para tunear**, no balance final (§11, fase R8) —
> lección verificada: el buen ritmo es balanceo iterativo, no una fórmula aplicada una vez.

## 1. Pilares de diseño

1. **Progresión siempre visible.** El jugador nunca está a más de ~5 minutos de la siguiente
   recompensa perceptible (compra, hito, misión, desbloqueo). Es la regla anti-"AdVenture Ages"
   (la queja del usuario con esa referencia: se vuelve difícil muy rápido).
2. **El renacer propulsa, no castiga.** Cada reset te deja objetivamente mejor y el juego te dice
   cuándo conviene (indicador de ganancia pendiente, banda verificada +50–200%). Renacer es el
   clímax del bucle, no una derrota.
3. **Encanto propio.** Historia real de la humanidad con tono cálido y humor ligero; todos los
   assets son propios (SVG/CSS hechos en el repo), sin terceros. El arte final lo aporta la pareja;
   los placeholders ya deben tener dirección de arte, no ser grises.
4. **Números en datos, no en código.** Todo el balance vive en catálogos (`src/core/data/`)
   tuneables sin tocar lógica, porque el balance se itera muchas veces.

## 2. Las cuatro capas de progresión (mapa del juego)

| Capa | Horizonte | Qué hace el jugador | Qué siente |
|---|---|---|---|
| **Negocios** | minutos | Lanza ciclos, compra niveles, alcanza hitos ×2 | "Los números crecen ya" |
| **Misiones → Renombre** | horas | Completa misiones, sube nivel de cuenta, desbloquea sistemas | "El juego se va abriendo" |
| **Eras** | días | Completa una era y avanza a la siguiente (checkpoint/región) | "He cambiado de mundo" |
| **Renacer → Legado** | semanas | Resetea todo a cambio de Legado y su árbol permanente | "Empiezo de nuevo pero soy más fuerte" |

Transversal a todo: la **colección** (agentes + reliquias), que persiste siempre.

## 3. Negocios (economía dentro de una era)

Cada era tiene **una moneda propia** y **5 negocios** que la producen.

- **Ciclo de producción:** cada negocio produce por ciclos con duración fija (barra de progreso).
  Al principio el ciclo se lanza **manualmente** (tap) — referencia AdVenture Ages que pidió el
  usuario; cuando su **agente** se consigue (§5), el negocio queda **automatizado** (el ciclo se
  reinicia solo). El tap manual sigue disponible como impulso (ver árbol del Legado).
- **Niveles:** comprar niveles sube la producción por ciclo de forma lineal.
  `coste(n) = base × crecimiento^n` (n = nivel actual). Compra ×1 / ×10 / ×máx.
- **Hitos:** a nivel **10 / 25 / 50 / 100 / 200**, la producción del negocio se **×2**. Son los
  picos de dopamina de la capa corta; se marcan visualmente en la card ("próximo hito: 25").

Catálogo de la **Era 1 — Prehistoria** (moneda: **Sustento**):

| Negocio | Coste base | Crecimiento | Ciclo | Producción base/ciclo | Agente que lo automatiza |
|---|---|---|---|---|---|
| Recolección de bayas | 4 *(nivel 1 gratis al empezar)* | 1,09 | 2 s | 1 | Australopithecus |
| Hoguera | 60 | 1,12 | 6 s | 6 | Homo erectus *(dominó el fuego)* |
| Caza mayor | 900 | 1,14 | 15 s | 50 | Neandertal |
| Taller de sílex | 14.000 | 1,17 | 40 s | 550 | Homo habilis *(el de las herramientas)* |
| Pinturas rupestres | 220.000 | 1,20 | 100 s | 7.500 | Homo sapiens *(el arte simbólico)* |

Regla anti-muro que debe sobrevivir a cualquier rebalanceo: entre negocios consecutivos el coste
escala ~×15 y la producción ~×8-12 → **siempre hay una compra "grande" alcanzable en el horizonte**
y ningún negocio deja de ser relevante de golpe.

**Refinamiento del usuario (2026-07-05, a aplicar desde R1):** todos los negocios de la era generan
la **misma moneda contextual de la era** (confirmado); la escala entre negocios es "más cantidad por
ciclo a costa de más tiempo de ciclo". Subir de nivel debe poder mejorar **tanto la cantidad como el
tiempo de recolecta** (los hitos no son solo ×2 de producción: algunos reducen ciclo). Objetivo de
balance explícito: **a largo plazo debe compensar invertir en los negocios lentos y caros**, porque
dan más beneficio "al momento" — la estrategia óptima madura hacia los negocios grandes, no se queda
en spamear el primero. *(Concretado en R1: hitos 10/50/200 = producción ×2; hitos 25/100 = ciclo a
la mitad — catálogo en `core/data/milestones.ts`, ver decisiones R1 en §11.)*

Objetivos de ritmo (a validar en R8): primera compra <15 s · primer agente ≈ 5 min · Prehistoria
completa en el primer run ≈ 60-90 min de juego activo.

## 4. Misiones y Renombre (nivel de usuario)

Patrón verificado en el género (Idle Bank Tycoon: reputación → nivel de cuenta → desbloqueos).

- **3 slots de misiones activas** (4º slot vía Legado). Se generan de **plantillas parametrizadas
  por el estado actual** para que siempre sean alcanzables: "Alcanza X Sustento", "Compra N niveles
  de Caza mayor", "Completa N ciclos manuales", "Automatiza N negocios", "Gana X en total".
- **Recompensas:** moneda de la era **escalada a la producción actual** (misma filosofía que el
  usuario exige a los rewarded ads: recompensa acorde al nivel, nunca ridícula) y, en misiones
  señaladas, **agentes/vestigios** (§5).
- **XP → Renombre**, el nivel de cuenta transversal. **El Renombre no se resetea nunca** (ni al
  renacer). Desbloquea sistemas, no potencia bruta:

| Renombre | Desbloqueo |
|---|---|
| 2 | Automatización (aparece el primer agente en la cadena de misiones) |
| 3 | Compra ×10 / ×máx |
| 4 | Ganancias offline (§7) |
| 5 | Pestaña Colección |
| 6 | Requisito parcial para el avance de era |
| 8 | **Renacer** (§6) |
| 10+ | Reservado: gacha v2, eventos, cosméticos |

Regla: el Renombre **abre puertas**; nunca es un muro que pare la economía (los muros son la queja
del usuario con Ages).

## 5. Colección: agentes y reliquias (persiste siempre)

- **Agentes** (5 por era; en Prehistoria, los homínidos de la tabla §3): cada uno **automatiza su
  negocio** y da un **bono pasivo** a ese negocio de +25% por rango. **Rangos I-V**: los duplicados
  /"vestigios" ganados en misiones suben el rango (modelo de datos ya preparado para que el gacha
  ligero de la v2 encaje sin rediseñar — pero lejos del extremo grindy documentado de Idle Heroes).
- **Obtención en el MVP: determinista** (cadenas de misiones y objetivos de era), nada de azar
  todavía. El gacha es capa v2 sobre el mismo modelo.
- **Reliquias** (1 por era, al completarla): artefacto coleccionable con lore (Prehistoria: *el
  fuego domado*; Egipto: *el papiro*; Roma: *el acueducto*) que da **+10% de producción global
  permanente** cada una.
- Agentes y reliquias **sobreviven al renacer** — son la mitad del "empiezo mejor que antes".

## 6. Eras (checkpoints/regiones) y Renacer (Legado)

### Avance de era (dentro de un run)

- Una era se completa con: **los 5 negocios comprados** + **acumulado total de la era** (Prehistoria:
  2M de Sustento) + **cadena de misiones de era** completada ("El gran salto").
- Al avanzar: era nueva desde cero (moneda y negocios propios) con un pequeño capital inicial, se
  otorga la **reliquia** de la era completada, y la era anterior queda **consolidada** (no sigue
  produciendo; su total ganado cuenta para el Legado). Cambio visual completo de paleta y motivo (§8).
- **Lanzamiento con 3 eras:** Prehistoria → Antiguo Egipto → Roma. Escala de moneda ~×1.000 entre
  eras. (Edad Media en adelante = contenido post-lanzamiento.)

### Renacer (prestigio) — la mecánica que pidió el usuario

- **Disponible** desde Renombre 8 y habiendo alcanzado la Era 2 — el primer renacer llega pronto a
  propósito, para enseñar que renacer es bueno.
- **Fórmula** (amortiguación por raíz cuadrada, regla verificada con fuente primaria GDC):
  `legadoTotal(vidaAcumulada) = floor(1,5 × √(gananciasDeTodaLaVida / 1e6))`
  `gananciaPendiente = legadoTotal − legadoYaObtenido`
  (`gananciasDeTodaLaVida` = suma de todas las monedas de era ganadas, normalizadas a escala de
  Era 1, en todos los runs.)
- **UI:** el botón de renacer siempre muestra "**Renacer: +X Legado (+Y%)**". Cuando la ganancia
  pendiente supera **+100%** del Legado actual, el botón pasa a estado "recomendado" (brillo). Banda
  de referencia verificada: +50% a +200%.
- **Cada punto de Legado da +2% de producción global permanente** (por Legado *ganado
  históricamente*, así que gastarlo en el árbol no te debilita) **y además es la moneda del Árbol
  del Legado**:

**Árbol del Legado** (~12-16 nodos en 3 ramas; coste 1-10 puntos por nodo):
- *Rama Impulso:* +50% recompensas de misión · tap manual ×2 · −10% coste de niveles · arranque con
  capital inicial tras renacer.
- *Rama Automatización:* automatización activa desde el minuto 0 tras renacer · ciclos −20% de
  duración · 4º slot de misiones.
- *Rama Memoria:* empezar el run con la Hoguera desbloqueada · +8h de tope offline · conservar el
  10% del Sustento al renacer · desbloqueo directo de la Era 2 (nodo caro, final de rama).

- **Alcance del reset — refinado por el usuario (2026-07-05):** el renacer **resetea todas las eras
  y los beneficios que aportaban** (incluidas las **reliquias de era**, que dejan de ser permanentes
  y se reconsiguen en cada run). La única mejora permanente es el **Legado**: una moneda de renacer
  **ajena a las eras**, cuyo efecto debe sentirse **potente** (multiplicador global + árbol).
- **Qué resetea el renacer:** eras, negocios, niveles, monedas de era, reliquias, misiones en curso.
  **Qué persiste:** Legado y su árbol, Renombre, ajustes.
- **Pendiente de cerrar en R6 — los agentes:** la frase del usuario ("se resetean las eras y sus
  beneficios") apunta a que su *efecto económico* (automatización/bonos) también se pierde al
  renacer. Recomendación a validar con él: la **colección como álbum persiste** (fichas, lore,
  rangos conseguidos) pero los agentes **hay que reobtenerlos en cada run** para que automaticen —
  el renacer conserva el coleccionismo sin regalar la economía.

## 7. Ganancias offline

- Calculadas por **timestamp absoluto** (regla ya escrita en el plan maestro): delta negativo → 0;
  tope configurable.
- **Generosas:** 100% de la producción automatizada, tope base **8 h** ampliable a 24 h (árbol del
  Legado). Evidencia verificada: el cap de 2 h de Egg Inc. está documentado como error que provoca
  abandono.
- **Modal de retorno** con desglose ("Mientras no estabas: +X Sustento en Yh Zm") — es además el
  hueco natural del futuro rewarded ad "×2" (stub en fase de monetización).
- El bucle online capa el delta de un tick a **60 s**: todo lo que pase de ahí se trata por el flujo
  offline (evita el doble sistema de cobro — bug 3 de §10).

## 8. Dirección visual (assets propios, cero terceros)

- **Sistema de tokens CSS por era** (variables sobre el `index.css` actual): la era activa define
  paleta y motivo. Prehistoria: ocres/ámbar/carbón sobre fondo noche. Egipto: arena/oro/lapislázuli.
  Roma: mármol/rojo/bronce.
- **Iconografía SVG propia** hecha en el repo (`src/ui/assets/`): estilo flat geométrico, 2-3
  colores de la paleta de la era, rejilla 24/48 px. Un emblema por negocio, agente y reliquia.
  Son placeholders **con dirección de arte** — la pareja los sustituye 1:1 sin tocar lógica.
- **Layout mobile-first** de una columna (máx. ~480 px centrado en escritorio): barra superior fija
  (Sustento con count-up, Renombre, Legado) · lista de negocios como cards (emblema, nivel, barra de
  ciclo, botón de compra, marcador de hito) · navegación inferior por pestañas: **Negocios ·
  Misiones · Colección · Legado**.
- **Juice** (CSS, respetando `prefers-reduced-motion`): count-up del contador, "+N" flotante al
  cobrar ciclo, flash al alcanzar hito, pulso en botón comprable, transición de paleta al cambiar de
  era, confeti sobrio al renacer.
- Sonido: fuera del MVP (lo aporta la pareja con el arte final).

## 9. Historia y tono

Lore ligero, no narrativa pesada: cada era abre con 2-3 frases con humor cálido ("Alguien ha
descubierto que la carne sabe mejor caliente. Eres oficialmente la persona más lista del valle.").
**Decisión del usuario (2026-07-05): el tono acompaña a la evolución** — la voz de los textos
evoluciona con las eras (más primitiva y tosca al principio, más elaborada según la civilización
avanza), manteniendo el humor ligero como constante.
Cada agente y reliquia lleva 1-2 líneas de ficha en la Colección — dato histórico real + chiste
suave. Textos en español primero (mercado de validación), arquitectura de strings preparada para
i18n (catálogo de textos separado, sin literales en componentes).

## 10. Bugs y deudas del código actual (detectados 2026-07-05)

> **Estado (R2, 2026-07-06): los 5 bugs corregidos del todo.** R0: validación estricta con
> migración v2, `rate` eliminado del save, tope de 60s por tick y `pagehide` en el autosave.
> R1: `formatNumber` ampliado (escala corta hasta <1e33 + notación exponencial). R2: el tramo
> >60s del tick se liquida por el flujo offline con su tope — bug 3 cerrado por completo.

1. **`persistence/load.ts` — validación rota por `typeof null === 'object'`:** un save con
   `state: null` pasa el guard `isSaveFileShape` y revienta en runtime. Además no valida los campos
   internos (`amount`/`rate`/`upgradeLevel` pueden faltar o no ser números) → `NaN` se propaga por
   el tick **y el autosave lo persiste** → save envenenado permanente. *(Se corrige en R0.)*
2. **`rate` (estado derivado) persistido en el save:** `rate` se deriva de `upgradeLevel`, pero se
   guarda; cualquier rebalanceo dejará los saves viejos con un `rate` obsoleto para siempre. El save
   debe guardar solo estado fuente (niveles) y derivar la producción al cargar → **migración a
   `schemaVersion: 2`** (primera migración real, era el MVP-7). *(R0.)*
3. **`tick` sin tope de delta:** con la pestaña suspendida horas, al volver se cobra todo de golpe
   sin límite — duplica (y contradice) el sistema offline con tope planificado. Cap de 60 s por tick
   online; el resto va por el flujo offline. *(R0 el cap, R2 el flujo offline.)*
4. **`formatNumber` no tiene sufijo por encima de B:** 1e12 se muestra como "1000.0B". Ampliar
   escala (T, Qa, …) — con 3 eras y ×1.000 entre eras se alcanza. *(R1.)*
5. **Autosave sin `pagehide`:** `visibilitychange→hidden` cubre la mayoría de cierres modernos, pero
   `pagehide` es el cinturón de seguridad estándar. Menor. *(R0.)*

## 11. Roadmap real (sustituye MVP-5..11 del plan maestro)

Cada fase = una sesión TDD independiente (rojo → verde → refactor), cerrada con
`pnpm lint && pnpm typecheck && pnpm test && pnpm build` + verificación en preview.

| Fase | Estado | Entregable | Notas |
|---|---|---|---|
| **R0** | ✅ Hecho (2026-07-05) | Fundaciones: tipos nuevos (`GameState` multi-negocio), catálogo `core/data/prehistoria.ts`, migración save v2, fixes bugs 1/2/3(cap)/5 | La base de todo; el save viejo migra o cae a estado inicial limpio |
| **R1** | ✅ Hecho (2026-07-05) | Negocios completos: ciclos activados por tap, niveles, hitos (producción y ciclo), compra ×1/×10/×máx, cards con barra de ciclo, `formatNumber` ampliado, **botón "reiniciar partida" con confirmación** | Primera versión que ya "se siente juego"; el reinicio lo pidió el usuario tras R0 |
| **R2** | ✅ Hecho (2026-07-06) | Ganancias offline generosas + modal de retorno | Cierra del todo el bug 3 |
| **R3** | Pendiente | Misiones (plantillas + 3 slots) y Renombre con desbloqueos | |
| **R4** | Pendiente | Agentes: obtención por misiones, automatización, rangos, pestaña Colección | |
| **R5** | Pendiente | Avance de eras: Egipto y Roma (catálogos), reliquias, consolidación de era | |
| **R6** | Pendiente | **Renacer**: fórmula de Legado, botón con ganancia pendiente y estado recomendado, Árbol del Legado | El corazón de la petición del usuario |
| **R7** | Pendiente | Dirección visual completa: tokens por era, set SVG propio, juice, transiciones | Hasta aquí el juego usa placeholders sobrios |
| **R8** | Pendiente | Pase de balance: telemetría local de tiempos (primera compra, primer agente, primera era, primer renacer) + ajuste de catálogos + QA manual | El tuning iterativo verificado como clave del género |
| **R9** | Pendiente | Los antiguos MVP-8/9/11: stubs de monetización (rewarded en el modal offline, quitar-anuncios) + checklist de humo + deploy | |

### Decisiones de implementación anotadas durante R0 (2026-07-05)

- **Producción continua provisional en R0:** hasta que R1 implemente los ciclos reales con barra de
  progreso, cada negocio produce de forma continua su media derivada (`nivel × producción/ciclo ÷
  duración`, en `core/businesses.ts:productionPerMs`). Es el puente para que el juego siga vivo entre
  fases; R1 lo sustituye.
- **El save v2 incluye `savedAt`** (timestamp del guardado): lo consumirá el flujo offline de R2 sin
  necesitar una migración v3.
- **Migración v1→v2:** `amount`→`currency`; `upgradeLevel` (la mejora única de relleno) se mapea a
  niveles extra de Recolección de bayas sobre su nivel 1 gratis; `rate` se descarta (era estado
  derivado, bug 2). Un save irrecuperable (envenenado/versión desconocida) cae al estado inicial limpio.
- **Ids del estado que ya no existen en el catálogo** se conservan en el save pero se ignoran en la
  producción — retirar un negocio en un rebalanceo no envenena saves.

### Decisiones de implementación anotadas durante R1 (2026-07-05)

- **Save v3:** el progreso del ciclo es estado fuente → `businesses` pasa de niveles planos a
  `{ level, cycleElapsedMs | null }` (`schemaVersion: 3`; migración v2→v3 y cadena v1→v2→v3,
  ambas verificadas en vivo con saves reales de desarrollo). El ciclo en curso se conserva al
  recargar, pero no avanza con la pestaña cerrada — sin automatización no hay cobro offline
  (R2 revisará ese flujo).
- **Cobro automático al completar:** el tap solo lanza el ciclo; al llenarse la barra se cobra
  automáticamente y el negocio vuelve a reposo (modelo AdVenture Capitalist). Nada se relanza
  solo hasta los agentes (R4) — la producción continua provisional de R0 queda eliminada
  (`productionPerMs` ya no existe).
- **Hitos concretos** (en datos, `core/data/milestones.ts`): 10 producción ×2 · 25 ciclo ÷2 ·
  50 producción ×2 · 100 ciclo ÷2 · 200 producción ×2. Compartidos por todos los negocios;
  tuneables en R8.
- **Compra:** ×10 es todo-o-nada (sin fondos para el lote completo, botón deshabilitado);
  ×máx compra el máximo asequible (si es 0, muestra el coste de 1 nivel deshabilitado). El
  selector es preferencia de sesión (no se persiste) y va **sin gating** en R1 — el desbloqueo
  de ×10/×máx por Renombre 3 (§4) se aplicará cuando exista el Renombre (R3).
- **`formatNumber`:** escala corta K/M/B/T/Qa/Qi/Sx/Sp/Oc/No (hasta <1e33) y por encima
  notación exponencial — nunca más "1000.0B" ni su equivalente futuro.
- **Reiniciar partida:** confirmación inline en dos pasos (sin `window.confirm`, testeable);
  borra el save (`clearSave`) y vuelve al estado inicial.
- **Card a nivel 0:** muestra la vista previa del nivel 1 (producción/ciclo) con la acción
  "Desbloquear"; el botón de tap no aparece hasta desbloquear.
- **Deuda observada (fuera de alcance de R1):** varias pestañas abiertas a la vez compiten por
  el mismo save (autosave last-writer-wins) — visto durante la verificación con pestañas viejas
  del preview en el mismo origen. Es la norma del género (single-player, single-tab); si algún
  día molesta, se detecta con eventos `storage` o un lock de pestaña. Anotado, no planificado.

### Decisiones de implementación anotadas durante R2 (2026-07-06)

- **Qué produce offline (decisión pedida en el arranque de R2):** sin automatización hasta R4,
  lo único que produce con el juego cerrado son los **ciclos ya lanzados**, que avanzan con el
  tiempo real fuera y completan **una sola vez** (no se relanzan). Esto revisa la decisión R1
  ("el ciclo en curso no avanza con la pestaña cerrada"): ahora sí avanza. El motor compartido
  `core/tick.ts:advanceCycles` lo usan el tick online y `core/offline.ts:settleOffline` — R4
  enchufará ahí la producción automatizada y ambos flujos la heredarán sin duplicar lógica.
- **El hueco >60 s del tick online** (pestaña suspendida) se liquida con el mismo
  `settleOffline` (con su mismo tope) y dispara el mismo modal — cierre definitivo del bug 3:
  un único sistema de cobro para todo tiempo no tickeado.
- **El modal solo aparece si hubo cobro (>0):** sin automatización, "+0 en 3h" sería ruido.
  El cobro se **acredita al liquidar**, no al pulsar "Recoger" (cerrar sin pulsar no pierde
  nada); el rewarded ×2 de R9 añadirá su extra encima usando el `earned` del resumen.
- **Tope en datos:** `core/data/offline.ts:OFFLINE_CAP_MS` (8 h), parámetro de `settleOffline`
  para que el árbol del Legado (R6) lo amplíe a 24 h sin tocar lógica.
- **`loadSave` sustituye a `load`** en persistencia: devuelve el save completo (estado +
  `savedAt`, que es lo que consume el flujo offline) o `null`; el fallback al estado inicial
  pasa a ser decisión del `GameProvider`.
- **`formatDuration`** en `core/numbers.ts` ("3h 24m" / "12m" / "45s") para el desglose del modal.
- **Truco de QA (documentado para futuros pases):** el autosave en `pagehide` pisa cualquier
  save sembrado a mano al recargar el preview — para simular tiempo fuera hay que neutralizar
  `localStorage.setItem` de la página viva antes de escribir la semilla y recargar.

## 12. Decisiones abiertas y decididas (revisión 2026-07-05 con el usuario)

**Decididas por el usuario:**

- **Tono de textos:** humor ligero cuya voz **evoluciona con las eras** (§9).
- **Tap manual:** es la **activación del ciclo** de cada negocio hasta conseguir el agente que lo
  automatiza; con el agente, el ciclo se reinicia solo. (Si tras automatizar queda algún uso opcional
  del tap, se decide en el pase de balance — por defecto, no.)
- **3 eras al lanzamiento: sí**, con su aviso explícito: *se quedaría corto hasta el renacer si cada
  era no consume tiempo suficiente* → objetivo de balance para R8: la duración de cada era debe dar
  recorrido real al primer renacer (no llegar a él en una tarde vaciando las 3 eras).
- **Moneda contextual por era** (todos los negocios de la era producen la misma) y **niveles que
  mejoran cantidad y tiempo** — detalle en §3.
- **Renacer = reset total de eras y sus beneficios; el Legado es la única mejora permanente y debe
  ser potente** — detalle en §6.

**Siguen abiertas:**

1. Nombres finales de monedas/sistemas. El usuario apuntó "**piedras**" como ejemplo de recurso de la
   era 1 — candidata "Piedra" frente al "Sustento" propuesto aquí. Decidir antes de R3 (los textos de
   misiones ya la usan).
2. Qué pasa con los **agentes al renacer** (ver recomendación "álbum persiste, efecto se reobtiene"
   en §6) — cerrar en el diseño fino de R6.
3. **Economía en cascada tipo AdVenture Communist (en evaluación, 2026-07-06):** el usuario propone
   que solo el primer negocio de la era produzca el recurso/moneda y cada negocio superior produzca
   **unidades del anterior** (verificado con fuentes: en Communist el tier 1 produce el recurso y
   "communes produce farmers"). Interactúa con la decisión abierta nº 1 (el nombre de la moneda) y
   con las plantillas de misiones de R3 — **decidir antes de empezar R3**; si se adopta, entra como
   fase "R2.5" con reescritura de §3.

## 13. Visión ampliada post-R1 (2026-07-05) — anotada, NO priorizada

> Entradas de diseño del usuario tras cerrar R1. Instrucción explícita: **no se implementan ahora ni
> alteran el orden R2-R9** — se anotan para que las fases ya planificadas se construyan sabiendo qué
> viene después ("pensar desde el principio qué construimos, por qué y con qué escalabilidad"). Los
> puntos marcados 🧠 requieren un **brainstorming dedicado** antes de diseñarse en serio.

### 13.1 Idle visual: escena por era en vez de cards

- **Qué pidió:** que el juego sea visual desde el principio — un **fondo ambientado en la era
  activa** y los negocios **representados visualmente dentro de la escena** (no como cajas), con
  scroll vertical dentro del viewport del juego.
- **Dónde encaja:** es la evolución natural de R7 (dirección visual), que sube de listón: de "cards
  con emblema SVG" a **"escena de era v1"** (fondo por era + cada negocio como elemento de escena
  con su barra de ciclo y su tap). Las cards actuales pasan a ser el placeholder funcional hasta R7.
- **Por qué merece la pena:** la tesis de diferenciación de este juego es "arte, tono y colección"
  (plan maestro) — la escena sirve directamente a esa tesis.
- **Coste real:** arte por era (fondos + representación de 5 negocios × era, trabajo de la pareja).
  Técnicamente no cambia la arquitectura: el mismo `GameState` + catálogo alimenta cualquier
  representación; la escena es una *skin* sobre los mismos componentes presentacionales. DOM/SVG
  por capas sobra a esta escala — sin canvas ni motor.
- **Regla desde ya (gratis):** los componentes de UI siguen siendo presentacionales y tontos
  (reciben datos derivados, emiten eventos) — así el cambio card→escena en R7 no toca ni core ni
  handlers.

### 13.2 Más eras: la historia como pipeline de contenido

- **Qué pidió:** aprovechar que la historia real da contenido casi infinito y **nutrir el juego con
  más épocas** desde el diseño.
- **Dónde encaja:** el lanzamiento sigue siendo con 3 eras (decisión del §6, con su aviso de ritmo
  para R8). Lo que cambia es el **criterio de aceptación de R5**: el sistema de eras se construye
  contra un *catálogo de eras*, no contra 3 hardcodeadas — **añadir una era = 1 archivo de datos
  (negocios/agentes/reliquia/textos) + 1 set de tokens/arte + 0 cambios de lógica**. Es el pilar 4
  (números en datos) elevado a sistema completo.
- **Cadencia post-lanzamiento (borrador):** Edad Media → Renacimiento → Era Industrial → Era
  Moderna (→ ¿Futuro/espacio como broche?). Cada era nueva es contenido, no mecánica.
- **Lore:** la ficha de cada agente/reliquia (dato histórico real + chiste suave, §9) es el hueco
  natural donde "la información de la que disponemos" nutre el juego — se puede mantener un doc de
  investigación/lore por era que la pareja y Claude alimentan sin tocar código.

### 13.3 🧠 Header multi-moneda y navegación inferior ampliada

- **Qué pidió:** header con **las monedas del usuario representadas visualmente** lo mejor posible,
  y **menú inferior** con las secciones del juego: Tiradas (gacha) · juego principal · Tienda ·
  **Aventura** (side-game dentro del juego para conseguir más recursos).
- **Dónde encaja cada pieza:**
  - *Header multi-moneda:* extensión directa del §8 (barra superior ya planificada con moneda de
    era + Renombre + Legado). Con iconos SVG propios por moneda desde R7; la moneda premium se
    suma en R9/v2. Nota: dentro de un run solo hay UNA moneda de era activa (las eras anteriores
    consolidan, §6) — el header no acumula N monedas de era.
  - *Tiradas:* es la pestaña del **gacha v2** (§5: obtención determinista en el MVP, gacha como
    capa v2 sobre el mismo modelo de datos). Se le reserva el hueco en la nav; no existe en el MVP.
  - *Tienda:* aparece con la monetización (R9: rewarded + quitar-anuncios; IAP/premium en v2).
  - *Aventura:* **mecánica genuinamente nueva**, sin diseño — candidata a expediciones/timers/
    mini-retos que dan recursos o vestigios. Va a "fases posteriores" (junto a ranking/social) y
    necesita su propio pase de diseño. No condiciona R2-R9.
- **Restricción de escalabilidad (para el brainstorming):** en móvil la nav inferior aguanta 4-5
  slots máximo. La pregunta de diseño no es "qué pestañas añadimos" sino **qué es pestaña y qué
  vive dentro de otra** (p. ej. Tiradas dentro de Colección; Tienda como overlay). El MVP mantiene
  las 4 del §8 (Negocios · Misiones · Colección · Legado).

### 13.4 Marco de escalabilidad (qué estamos construyendo y hasta dónde)

- **Qué es este juego:** idle/tycoon web mobile-first de sesiones cortas (5-15 min activos +
  retornos offline), con horizonte de contenido de semanas→meses vía renaceres y eras.
- **Tres ejes de crecimiento, cada uno con su mecanismo:**
  1. **Contenido** (eras, negocios, agentes, lore) → crece como **datos** (§13.2), coste marginal
     bajo, es el eje principal post-lanzamiento.
  2. **Sistemas** (misiones, gacha, aventura, eventos) → crecen como **módulos/pestañas nuevos
     gateados por Renombre** (§4: el Renombre abre puertas) — cada sistema nuevo es una fase de
     diseño + implementación propia, no un dato.
  3. **Monetización/social** (tienda, ranking, cloud save) → el social es el único que exige
     backend (PocketBase anotado en el plan maestro); todo lo demás sigue client-only.
- **Anti-objetivo explícito:** no convertir el MVP en plataforma. Las costuras (capas core/
  persistence/ui, catálogos en datos, Renombre como gate) ya están puestas precisamente para poder
  crecer sin rediseñar; construir hoy más que esas costuras sería especular.

### 13.5 Agenda del brainstorming pendiente (cuando el usuario quiera)

1. Estructura de navegación: qué es pestaña vs. qué anida dónde (con las 7 secciones candidatas:
   Negocios, Misiones, Colección, Legado, Tiradas, Tienda, Aventura).
2. Diseño de la **Aventura** (side-game): bucle, recompensas, cadencia, cómo evita canibalizar el
   bucle principal.
3. La escena visual por era: qué se anima, qué es estático, presupuesto de arte por era realista
   para la pareja.
4. Cadencia de eras post-lanzamiento y hasta dónde llega la línea temporal.
