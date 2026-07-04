# Pista web del idle/tycoon — stack técnico y distribución

> Pista EXPLORATORIA en paralelo a `games/primer-idle/` (Unity, sigue su curso sin tocarse). Mismo concepto de
> juego (idle/clicker/tycoon con lore ligero de personajes/temática — ver `games/primer-idle/referencias-mercado.md`,
> incluida la misma referencia a Idle Miner Tycoon), pero explorando construirlo con un **stack web nativo**
> (JS/React/Node, sin aprender Unity/C#) y sin decidir aún entre autohospedar en dominio propio o apoyarse en
> tráfico de portales/tiendas.
>
> **Nota de origen (2026-07-04):** esta pista nació de una idea inicial del usuario de usar Three.js para un
> juego *narrativo* — ver [`../../../docs/juego-narrativo-webgl.md`](../../../docs/juego-narrativo-webgl.md). Tras
> aclarar que (a) Three.js era solo un ejemplo, no un requisito, y (b) el juego real es idle/tycoon con lore
> ligero (no narrativo pesado), esa investigación quedó en gran parte obsoleta para este caso (era sobre
> renderizado 3D; un idle/tycoon es 2D/UI). Esta es la investigación de seguimiento correcta para el concepto real.
>
> **Aviso técnico:** la síntesis automática de la segunda tirada de `deep-research` falló (bug: devolvió un
> placeholder en vez de los resultados). Este documento reconstruye a mano las 16 claims que sí se verificaron
> correctamente (16 confirmadas / 9 refutadas de 25 verificadas), extraídas de los registros crudos del workflow.

## 1. Stack técnico 2D: Phaser vs PixiJS vs React/DOM puro

**No hay un ganador claro por rendimiento** — las claims que comparaban FPS entre PixiJS y Phaser (un benchmark
citaba 47 vs 43 FPS con 10.000 sprites) fueron **refutadas**: en el mismo benchmark, un tercer motor (Babylon.js)
superaba a ambos con 56 FPS, lo que hace la comparación PixiJS-vs-Phaser específicamente engañosa/descontextualizada.
No os fiéis de esa cifra si la véis citada suelta.

**Lo que sí está confirmado con fuentes primarias:**
- **React/DOM puro es un enfoque real y empaquetado para este género exacto:** el **"Idle Template Bundle"**
  (itch.io) ofrece tres plantillas de idle game listas (Idle Clicker, Idle Forge, **Idle Tycoon**) construidas
  **enteramente con React y TypeScript, sin motor de juego ninguno** (ni Phaser, ni PixiJS, ni canvas).
- **El caso histórico más fuerte a favor de "sin motor" es *Universal Paperclips*** — uno de los idle games más
  exitosos y conocidos jamás hechos (acabó publicado en Steam y móvil) — construido en **JavaScript plano sobre
  el DOM**, sin canvas ni motor de juego alguno.
- **PixiJS tiene un ejemplo oficial real:** el propio equipo de PixiJS publica **"Bubbo Bubbo"**
  (github.com/pixijs/open-games), un juego completo de ejemplo creado explícitamente para enseñar a construir
  juegos "como un profesional" con PixiJS — confirma que PixiJS es una vía seria, aunque no es un ejemplo
  específico de idle/tycoon.
- **Phaser tiene catálogo real pero de nicho en este género concreto:** itch.io solo tiene 8 juegos etiquetados
  simultáneamente como "Tycoon" y "hecho con Phaser" — existe el patrón, pero no es un catálogo grande de éxitos.

**Lectura honesta:** los tres caminos tienen precedente real. Como el género (idle/tycoon) es fundamentalmente
UI + temporizadores + estado, no acción rápida ni físicas, **React/DOM puro —vuestro stack de cada día, sin
nada nuevo que aprender— tiene el respaldo más fuerte y específico** (plantilla lista del género exacto +
el idle game más exitoso de la historia). Phaser/PixiJS solo aportarían valor si más adelante queréis efectos
visuales/animaciones más ricas que lo que da CSS/DOM cómodamente.

Fuentes: [Idle Template Bundle (itch.io)](https://d0mega.itch.io/idle-template-bundle) · [Universal Paperclips (Wikipedia)](https://en.wikipedia.org/wiki/Universal_Paperclips) · [Bubbo Bubbo — PixiJS Open Games (GitHub oficial)](https://github.com/pixijs/open-games/tree/main/bubbo-bubbo)

## 2. Portabilidad a app nativa sin reescribir (por si algún día interesa Google Play)

**Confirmado con fuente oficial:** si elegís **Phaser**, existe un tutorial **oficial del propio equipo de
Phaser** para envolver un juego Phaser ya hecho con **Capacitor** y publicarlo en iOS/Android **sin reescribir
la lógica del juego**. La propia documentación de Capacitor recomienda construir con un motor de juego (como
Phaser) precisamente porque facilita este camino después.

**Matiz importante:** esta ruta de "exportar a app nativa sin reescribir" está verificada **para Phaser
específicamente**, no para el enfoque React/DOM puro — no hay un tutorial oficial equivalente para llevar una
app React/DOM idle a Capacitor con la misma facilidad (aunque técnicamente Capacitor puede envolver cualquier
web app; solo que no hay el mismo respaldo "oficial de juegos" documentado). Si mantener la puerta abierta a
Google Play sin reescribir es importante, es un punto a favor de Phaser frente a React/DOM puro.

Fuentes: [Phaser — Bring your game to iOS/Android with Capacitor (oficial)](https://phaser.io/tutorials/bring-your-phaser-game-to-ios-and-android-with-capacitor) · [Capacitor Docs — Games](https://capacitorjs.com/docs/guides/games)

## 3. Dominio propio vs. portales: NO es la misma respuesta para todos los portales

Esta era la pregunta más importante y la respuesta real es **"depende del portal"**, con datos verificados
contra las fuentes primarias oficiales de cada uno:

### CrazyGames — compatible con dominio propio
Verificado contra el **PDF oficial de términos del desarrollador** (actualizado 18.08.2025) y su FAQ oficial:
- El acuerdo estándar es **no exclusivo por defecto**.
- Existe una **cláusula opcional** de "exclusividad temporal" (sección 5.5) que da un **+50% de compensación**
  si el desarrollador decide acogerse a ella voluntariamente — pero es opcional, no obligatoria.
- Su FAQ confirma explícitamente que **pueden aceptar un juego autohosteado externamente como "envío normal"**
  ("we'll consider it a regular submission"), aunque recomiendan alojarlo en su infraestructura para
  aprovechar sus optimizaciones.
- **Conclusión: con CrazyGames podéis tener dominio propio Y listar ahí a la vez**, sin tener que elegir.

### Poki — SÍ es exclusivo con su acuerdo estándar (matiz importante)
Verificado contra la **página oficial de deals de Poki** (sdk.poki.com/deals):
- El acuerdo **preferido/por defecto de Poki es "Web Exclusive" durante 5 años**: mientras dure, vuestro juego
  se publica **solo en Poki** dentro de "la web abierta".
- Esa exclusividad **explícitamente NO cubre Steam, tiendas de apps móviles ni consolas** — pero **sí cubre
  cualquier otro sitio de la web abierta**, lo que en la práctica incluiría vuestro propio dominio.
- **Conclusión: con el acuerdo estándar de Poki, NO podéis tener a la vez vuestro propio dominio activo** (al
  menos durante los 5 años del acuerdo preferido) — es una decisión real de o-lo-uno-o-lo-otro con este portal en concreto.

**Para vosotros:** si queréis mantener dominio propio con seguridad, **CrazyGames es compatible; Poki con su
oferta estándar no lo es**. No hay una respuesta única para "portales" en general — hay que mirar el contrato
de cada uno.

Fuentes: [CrazyGames Developer Portal Terms and Conditions (PDF oficial, 18.08.2025)](https://files.crazygames.com/documents/developer_terms_20250818.pdf) · [CrazyGames FAQ oficial](https://docs.crazygames.com/faq/) · [Poki SDK — Deals (oficial)](https://sdk.poki.com/deals)

## 4. Laguna honesta: tráfico orgánico sin portal ni presupuesto

Esta investigación encontró fuentes relevantes (un caso real de un idle game de texto autohosteado que llegó a
jugadores en 33 países sin presupuesto, benchmarks de tráfico de itch.io, un postmortem con cifras de un juego
concreto) pero **ninguna de sus claims llegó a pasar por la verificación adversarial en esta tirada** (se quedaron
fuera del cupo de 25 claims verificadas de las 98 extraídas). **No puedo daros cifras verificadas de cuánto
tráfico realista cabe esperar autohospedando sin portal ni presupuesto** — es la pregunta que sigue más abierta
de las dos investigaciones que llevamos hasta ahora. Candidata a una tercera tirada específica si os importa
antes de decidir.

Fuentes encontradas pero sin verificar todavía: [dev.to — idle game de texto, tráfico orgánico en 33 países](https://dev.to/marcosme/i-built-a-text-first-browser-idle-game-and-it-unexpectedly-found-players-in-33-countries-1bnb) · [howtomarketagame.com — benchmark de tráfico en itch.io](https://howtomarketagame.com/2025/05/12/benchmark-itch-io-traffic/) · [Game Developer — postmortem "Flufftopia" con cifras reales de itch.io](https://www.gamedeveloper.com/business/flufftopia-postmortem-an-itch-io-game-by-the-numbers)

## Resumen para decidir

| Pregunta | Respuesta |
|---|---|
| ¿Motor 2D o React/DOM puro? | Sin ganador por rendimiento (esa comparación se refutó); React/DOM puro tiene el precedente más fuerte y específico para idle/tycoon, y es vuestro stack ya dominado |
| ¿Puerta abierta a Google Play sin reescribir? | Solo verificado para Phaser (tutorial oficial con Capacitor); no hay el mismo respaldo para React/DOM puro |
| ¿Dominio propio + CrazyGames a la vez? | **Sí**, compatible (confirmado, fuente oficial) |
| ¿Dominio propio + Poki a la vez? | **No**, con su acuerdo estándar de 5 años (confirmado, fuente oficial) |
| ¿Tráfico realista solo con dominio propio, sin portal? | **Sin verificar** — laguna abierta, candidata a investigación de seguimiento |
