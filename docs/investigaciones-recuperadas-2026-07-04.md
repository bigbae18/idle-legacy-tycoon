# Investigaciones recuperadas (lanzadas 2026-07-04, sintetizadas a mano 2026-07-05)

> Las dos deep-research lanzadas en la sesión `3a7da1bd` (ver
> [`vision-diseno-mecanicas.md`](vision-diseno-mecanicas.md)) **sí terminaron** (workflows
> completados en disco a las 00:00 del 2026-07-05). La síntesis automática **falló en ambas por
> tercera vez en el proyecto** (devolvió los claims verificados sin fusionar) — este documento es la
> reconstrucción manual desde los registros de verificación, el mismo procedimiento que ya se usó
> para [`stack-y-distribucion.md`](stack-y-distribucion.md). Solo se listan como hechos los claims
> **confirmados por verificación adversarial**; lo refutado y lo no verificado se marca como tal.

## A. Economía del género idle (run `wf_ab406461-dd7`)

**Pregunta:** fundamentar la economía real (negocios por era, misiones→nivel de usuario, agentes
coleccionables) entendiendo por qué AdVenture Communist "se siente bien" y AdVenture Ages "se vuelve
difícil muy rápido" (percepciones del usuario). **Stats:** 51 claims → 25 verificados → **6
confirmados / 11 refutados / 8 sin verificar** (errores de agente).

### Confirmado (base de diseño utilizable)

1. **Regla de prestigio del género, con fuente primaria** (charla GDC "The Math of Idle Games",
   Anthony Pecorella — productor de AdVenture Capitalist mobile, 7 años dirigiendo F2P en
   Kongregate): los jugadores deberían renacer cuando ganarían **entre +50% y +200% de moneda de
   prestigio**, y la fórmula de esa moneda debe llevar **amortiguación** (logaritmo o exponente
   fraccional tipo raíz cuadrada) para frenar el crecimiento desbocado y que el jugador alcance un
   punto de prestigio valioso con regularidad.
2. **El patrón "misiones/acciones suben un nivel de cuenta transversal" está verificado en el género**:
   Idle Bank Tycoon (Kolibri Games) usa puntos de reputación (ganados al mejorar departamentos) que
   suben el **nivel global de la cuenta**, y ese nivel **desbloquea sistemas** (managers, Business
   Mode, actividades nuevas). Es exactamente la mecánica "nivel de usuario" que queremos.
3. **El buen ritmo de AdVenture Capitalist no sale de una fórmula aplicada una vez**: es producto de
   **balanceo manual e iterativo** de la curva intervalo/recompensa, afinado como ritmo narrativo
   (acelerar y frenar a propósito) para que cada tramo de juego se sienta recompensante.
   Consecuencia de arquitectura: los números del juego deben vivir en catálogos de datos fáciles de
   retocar, no incrustados en la lógica.
4. **Error de diseño documentado y con nombre en el género: capar las ganancias offline.** Egg Inc.
   limitaba las ganancias offline a 2 horas y el propio Pecorella lo señala como error que le hizo
   abandonar el juego ("I churned out myself largely because of this"). → Offline **generoso**.
5. **El extremo contrario de la colección también está documentado**: el sistema de fusión de Idle
   Heroes (llegar a 10★ puede requerir 400-500 personajes de 4★) es profundísimo pero brutalmente
   grindy y orientado a presionar el gasto. Para nuestro alcance (dúo, sin equipo live-ops), es el
   modelo a **no** copiar.

### Refutado o sin respaldo (NO usar como hecho)

- La estructura interna exacta de generadores de AdVenture Communist (los "35 generadores por
  tiers") — **refutada** tal como se formuló.
- "El coste de los generadores crece un orden de magnitud más rápido que la producción como
  propiedad definitoria del género" — **refutado** tal cual (la relación coste/producción real es
  cuestión de tuning, no una constante del género).
- La crítica de dificultad de AdVenture Ages **no llegó a verificarse con causa de diseño concreta**
  (las claims sobre sus curvas se refutaron o quedaron sin verificar).

### Laguna honesta

Los bloques 1-2 de la pregunta (curvas exactas de coste/ofertas/personajes de Communist y Ages) **no
quedaron cubiertos con fuentes verificadas** — las wikis de fans resultaron no fiables y varios
agentes de verificación fallaron. La percepción de jugador del usuario sigue siendo la referencia
ahí, y se compensa con las reglas generales sí confirmadas (prestigio +50–200% con amortiguación,
offline generoso, balanceo iterativo) más tuning propio (fase de balance del GDD).

## B. App Store con React/DOM sin motor (run `wf_cd331914-18a`)

**Pregunta:** ¿el stack React/DOM puro (sin canvas) compromete la vía App Store vía
Capacitor/similar? **Stats:** 65 claims → 25 verificados → **12 confirmados / 10 refutados / 3 sin
verificar**.

### Confirmado

- **Guideline 4.2 (texto oficial de Apple):** la app debe incluir "features, content, and UI that
  elevate it beyond a repackaged website"; si no es "particularly useful, unique, or app-like", no
  pertenece a la App Store. La 4.2.2 prohíbe expresamente apps que sean principalmente web clippings
  / agregadores / colecciones de enlaces.
- **No hay prohibición técnica nombrada** de WebView/Capacitor/Cordova/"wrapped app" en las
  guidelines — el riesgo real viene del criterio general 4.2/4.2.2, no de la tecnología.
- **El riesgo es real y está documentado**: caso de una app WebView (luego híbrida con pantallas
  nativas) **rechazada más de 10 veces** por 4.2; y mensaje de rechazo oficial de Apple confirmando
  que añadir push/Core Location/sharing **no basta** si la app sigue siendo esencialmente una web
  envuelta.
- **Tauri 2.0 es alternativa real a Capacitor**: soporte iOS oficial (`tauri ios dev`) y
  **documentación oficial dedicada de distribución en App Store** (macOS + iOS, firma,
  aprovisionamiento, subida). Matiz de su propio equipo: la DX móvil aún es incompleta y no todos los
  plugins oficiales funcionan en móvil.
- **Coste:** Apple Developer Program = **99 USD/año** (imprescindible para publicar, envuelta o no).

### Refutado (NO usar)

- La regla "Apple exige al menos 3 features nativas" — **inventada por un blog**, refutada.
- El tutorial genérico de Medium "React → iOS con Capacitor" como caso real confirmado — refutado
  como evidencia.

### Laguna honesta y lectura práctica

**No se verificó ningún caso real de juego React/DOM (sin canvas) aceptado en la App Store** — la
pregunta central sigue sin precedente confirmado. Mi lectura (síntesis, no hecho verificado): un
idle game con bucle de juego, guardado, ganancias offline y UI propia es funcionalmente "app-like"
(no es una web reempaquetada, que es lo que la 4.2.2 persigue), así que el riesgo es menor que el de
los wrappers de webs de contenido; pero al no haber precedente verificado, la App Store se trata
como **apuesta posterior, no como restricción de diseño del MVP web**. La regla de capas del
proyecto (core sin DOM) ya garantiza que no nos cerramos la puerta; se revisita cuando el juego
demuestre retención en web.
