// =========================================================
// KABOOM HORDA  -  V 1.0  (tutorial, menu nuevo, game over renovado, santuario, guardado, movil)
//
// ---------------------------------------------------------
// ARCHIVO DE GUARDADO (para GitHub)
// MakeCode no puede crear archivos desde el juego, asi que el juego genera un CODIGO:
//   MENU > GUARDAR > EXPORTAR ARCHIVO  (sale en pantalla y tambien en la consola)
// Pega ese codigo en la herramienta kaboom_guardado.html: te descarga el archivo listo
// para subir a GitHub (o te actualiza este mismo .ts con el codigo dentro de las comillas).
// Al abrir el juego se carga solo (si es mas reciente que lo que ya tiene el dispositivo),
// o a mano con: MENU > GUARDAR > CARGAR ARCHIVO.
// ---------------------------------------------------------
const CODIGO_GUARDADO_ARCHIVO: string = ""

// =========================================================

enum EstadoJuego {
    MenuPrincipal,
    SeleccionSkin,
    MisionesMenu,
    OpcionesMenu,
    CreditosMenu,
    TablaRecords,
    Jugando,
    MenuSubirNivel,
    ConfirmandoMejora,
    TiendaInteractiva,
    Inventario,
    DentroCasa,
    Crafteo,
    GameOver,
    Tutorial,
    GuardadoMenu
}

namespace SpriteKind {
    export const ProyectilJugador = SpriteKind.create()
    export const SemillaXP = SpriteKind.create()
    export const PocionVida = SpriteKind.create()
    export const MonedaOro = SpriteKind.create()
    export const TiendaMercader = SpriteKind.create()
    export const ProyectilEnemigo = SpriteKind.create()
    export const EscudoProtector = SpriteKind.create()
    export const JefeEnemigo = SpriteKind.create()
    export const Orbe = SpriteKind.create()
    export const Recurso = SpriteKind.create()
    export const Casa = SpriteKind.create()
    export const Npc = SpriteKind.create()
    export const Bomba = SpriteKind.create()
    export const Mina = SpriteKind.create()
}

interface MejoraProcedural {
    titulo: string
    descripcion: string
    tipoStat: number
    valorPotencia: number
    rarezaColor: number
}

interface TextoFlotante {
    x: number
    y: number
    txt: string
    color: number
    t0: number
    fin: number
}

interface Chunk {
    cx: number
    cy: number
    sprites: Sprite[]
}

interface Ciudad {
    cx: number
    cy: number
    x: number
    y: number
    nombre: string
    idioma: number
}

interface Meteoro {
    x: number
    y: number
    t0: number
    fin: number
    dano: number
}

// Textos del titulo (cambialos a tu gusto)
const TITULO_A: string = "KABOOM"
const TITULO_B: string = "HORDA"
const AUTOR: string = "IVAN PERALTA"

// =========================================================
// ESTADO GLOBAL
// =========================================================

let estadoActual: EstadoJuego = EstadoJuego.MenuPrincipal

// Ajustes
let volumenAudio: number = 50
let nivelDificultad: number = 1
let skinSeleccionada: number = 0
let skinCursor: number = 0
const NOMBRES_DIFICULTAD: string[] = ["PRINCIPIANTE", "SUPERVIVIENTE", "PESADILLA"]

// Personajes (NO usar 10 ni 11 como colores, son marcadores de la plantilla)
const NOMBRES_SKINS: string[] = ["RECLUTA", "MIDAS", "BRASAS", "RASTRO", "DULCE", "GELIDO", "SANGRE", "SOMBRA"]
const SKIN_PRINCIPAL: number[] = [9, 5, 4, 7, 3, 1, 2, 12]
const SKIN_OSCURO: number[] = [8, 4, 2, 6, 12, 9, 12, 8]
const PERK_TXT: string[] = [
    "SIN BONUS",
    "+50% ORO",
    "+10 DANO",
    "+20 VELOC.",
    "+40 VIDA MAX",
    "EMPIEZA CON\nNOVA",
    "+15% CRITICO",
    "EMPIEZA CON\nDASH +10%\nESQUIVA"
]

// Misiones para desbloquear personajes (indice = personaje)
const META_MISION: number[] = [0, 100, 250, 8, 1, 10, 2000, 6]
const MISION_LARGA: string[] = [
    "",
    "RECOGE 100\nMONEDAS",
    "MATA 250\nENEMIGOS",
    "LLEGA A LA\nOLEADA 8",
    "DERROTA A\nUN JEFE",
    "ALCANZA EL\nNIVEL 10",
    "2000 PTS EN\nUNA PARTIDA",
    "OLEADA 6 EN\nPESADILLA"
]
const MISION_CORTA: string[] = [
    "",
    "RECOGE 100 MONEDAS (TOTAL)",
    "MATA 250 ENEMIGOS (TOTAL)",
    "LLEGA A LA OLEADA 8",
    "DERROTA A UN JEFE",
    "ALCANZA EL NIVEL 10",
    "2000 PUNTOS EN UNA PARTIDA",
    "OLEADA 6 EN PESADILLA"
]
let desbloqueado: boolean[] = []

// Estadisticas guardadas
let statKills: number = 0
let statMonedas: number = 0
let statJefes: number = 0
let statMaxOleada: number = 0
let statMaxNivel: number = 0
let statMaxPts: number = 0
let statNoche: number = 0
let statPartidas: number = 0

// Estadisticas de la partida actual
let killsPartida: number = 0
let monedasPartida: number = 0
let jefesPartida: number = 0
let tiempoPartidaMs: number = 0
let sumarPartida: number = 0
let ultimoTickMs: number = 0
let nuevosDesbloqueos: number[] = []

// Navegacion de menu
let opcionMenuSel: number = 0
const OPCIONES_MENU: string[] = ["JUGAR", "PERSONAJES", "MISIONES", "RECORDS", "OPCIONES", "TUTORIAL", "GUARDAR", "CREDITOS"]
let opcionOpcionesSel: number = 0
const OPCIONES_SUBMENU: string[] = ["VOLUMEN", "DIFICULTAD", "CALIDAD", "DISPARO", "VOLVER"]

// V28: modo movil y guardado
// calidadModo: 0 = AUTO (se adapta sola), 1 = ALTA, 2 = MEDIA, 3 = BAJA (recomendada en movil)
// disparoAuto: dispara solo cuando hay enemigos (no hace falta mantener A)
const NOMBRES_CALIDAD: string[] = ["AUTO", "ALTA", "MEDIA", "BAJA"]
const COL_CALIDAD: number[] = [9, 7, 5, 4]
let calidadModo: number = 0
let disparoAuto: boolean = false
let guardadoHasta: number = 0
let menuT0: number = 0
const DESC_MENU: string[] = ["", "ELIGE A TU PERSONAJE", "DESBLOQUEA HEROES", "TUS MEJORES PUNTOS", "SONIDO CALIDAD DISPARO", "APRENDE A JUGAR", "EXPORTA TU PROGRESO", "QUIEN HIZO EL JUEGO"]
const COL_ACENTO: number[] = [5, 9, 7, 5, 4, 9, 7, 11]

// Stats de combate del jugador
let vidaActual: number = 100
let vidaMaxima: number = 100
let velMovimiento: number = 95
let nivelJugador: number = 1
let xpActual: number = 0
let xpSiguienteNivel: number = 100
let puntosPuntuacion: number = 0
let cantidadMonedas: number = 0
let acumMonedas: number = 0

// Invulnerabilidad corta
let invulnerableHasta: number = 0
const INVULNERABILIDAD_MS = 400

// V22: estado nuevo (biomas, mejoras de crafteo, caches de disparo y suelo)
let biomaActual: number = -1
let proxToastBioma: number = 0
let colSombra: number = 6
let mejorasCraft: number[] = [0, 0, 0, 0, 0]
let objetivoCache: Sprite = null
let proxBusqueda: number = 0
let balasVivas: number = 0
let ultimoSonidoDisparo: number = 0
let proxCheckOleada: number = 0
let cacheTx0: number = -99999
let cacheTy0: number = -99999
let cacheTiles: Image[] = []
let slashHacha: Image = null

// V25: rendimiento adaptativo (movil / PC)
// calidad 0 = alta (PC), 1 = media, 2 = baja (movil lento). Se ajusta sola segun los FPS reales.
let calidad: number = 0
let dtMedio: number = 33
let ultimoFrameMs: number = 0
let proxEvalCalidad: number = 0
let rachaBuena: number = 0
let rachaNecesaria: number = 6
let fxVivos: number = 0
let balasEnemigasVivas: number = 0
let enemigosFrame: Sprite[] = []
let jefesFrame: Sprite[] = []
let ultimoFrameAnim: number = -1
let imgRayoCache: Image = null
let anilloClaves: number[] = []
let anilloImgs: Image[] = []
// Limites por nivel de calidad [alta, media, baja]
const MAX_ENEMIGOS_Q: number[] = [60, 42, 28]
const MAX_BALAS_Q: number[] = [90, 60, 40]
const MAX_BALAS_ENEM_Q: number[] = [100, 70, 45]
const MAX_FX_Q: number[] = [24, 12, 5]
const MAX_TEXTOS_Q: number[] = [22, 12, 6]
const MAX_BOTIN_Q: number[] = [90, 60, 40]
const LIMITE_IA_Q: number[] = [30, 20, 12]
const SONIDO_DISPARO_MS_Q: number[] = [90, 140, 220]

// Arsenal y atributos
let danoAtaque: number = 25
let cadenciaDisparoMs: number = 150
let ultimoDisparoMs: number = 0
let numProyectiles: number = 1
let velProyectil: number = 240
let probabilidadCritico: number = 10
let multiplicadorCritico: number = 2.0
let radioAtraccionXP: number = 30
let multiplicadorXP: number = 1.0
let armaduraReduccion: number = 0
let multiplicadorMonedas: number = 1.0
let radioAtraccionMonedas: number = 40
let puntosEscudoActivo: number = 0

// Mejoras nuevas
let perforacion: number = 0
let vampirismo: number = 0
let regenPorSeg: number = 0
let proxRegen: number = 0
let espinas: number = 0
let dropMonedaExtra: number = 0
let nivelExplosivas: number = 0
let nivelOrbes: number = 0
let nivelRayo: number = 0
let proxRayo: number = 0
let nivelAura: number = 0
let proxAura: number = 0
let esquivaProb: number = 0
let nivelHielo: number = 0
let vidasExtra: number = 0

// Habilidades activas
let nivelHabilidadDash: number = 0
let nivelHabilidadNova: number = 0
let cooldownDashMs: number = 0
let cooldownNovaMs: number = 0

// Oleadas
let oleadaActual: number = 1
let bichosEnOleada: number = 12
let bichosRestantesPorSpawn: number = 0
let tiempoProximoSpawn: number = 0
let totalBichosOleadaInicial: number = 12
let pctOleadaMax: number = 0
// V28 rendimiento
let hayLideres: boolean = false
let hayElites: boolean = false
let gemasXPCuenta: number = 0
let monedasCuenta: number = 0
let xpPendienteDirecto: number = 0
let explosionesFrame: number = 0
let pctOleadaVis: number = 0
let tiposVistos: boolean[] = []

// Cartas de mejora
let opcionesCartasPresentadas: MejoraProcedural[] = []
let indiceCartaSeleccionada: number = 0
let cartaPendienteConfirmacion: MejoraProcedural = null

// Tienda
let opcionTiendaSel: number = 0
let tiempoInicioPermanenciaTienda: number = 0
let enZonaActivacionTienda: boolean = false
let tiendaActivaSprite: Sprite = null
let comprasTienda: number[] = [0, 0, 0, 0, 0, 0, 0, 0]
let mensajeTienda: string = ""
let mensajeTiendaColor: number = 1
let mensajeTiendaHasta: number = 0

// Game over
let tiempoMuerteMs: number = 0
let opcionGameOverSel: number = 0
// V29: animacion de la pantalla de Game Over (mascara de tarjetas ya reveladas)
let goTick: number = 0
const RANGO_LETRA: string[] = ["S", "A", "B", "C", "D"]
const RANGO_COL: number[] = [5, 7, 9, 4, 2]
const CONSEJOS: string[] = [
    "A JUNTO AL VECINO: ENTRAS",
    "COMBO ALTO = MAS XP",
    "JEFE VENCIDO = RELIQUIA",
    "EVITA LOS METEORITOS",
    "CARGA EL SANTUARIO!",
    "GUARDA EN EL MENU"
]
let nuevoRecord: boolean = false
let ultimoAtacante: string = ""

// Avisos en pantalla
let bannerL1: string = ""
let bannerL2: string = ""
let bannerCol: number = 5
let bannerHasta: number = 0
let toastL1: string = ""
let toastL2: string = ""
let toastCol: number = 9
let toastHasta: number = 0
let textosFlotantes: TextoFlotante[] = []

// Sprites y punteria
let jugadorSprite: Sprite = null
let spriteEscudo: Sprite = null
let orbes: Sprite[] = []
let particulasFondo: Sprite[] = []
let ultimaDirX: number = 1
let ultimaDirY: number = 0

// ---------------------------------------------------------
// V27: estado de las mecanicas nuevas (todo en reloj de partida)
// ---------------------------------------------------------
// 1) Combo / Frenesi
let comboCuenta: number = 0
let comboHastaMs: number = 0
let comboTier: number = 0
let comboMax: number = 0
let comboVentanaExtra: number = 0
let proxKaboomCombo: number = 0
const COMBO_UMBRAL: number[] = [8, 20, 40]
const COMBO_NOMBRE: string[] = ["", "CALIENTE!", "FRENESI!", "KABOOM!!"]
const COMBO_COL: number[] = [13, 5, 4, 2]
const COMBO_F_CAD: number[] = [1, 0.88, 0.76, 0.64]
const COMBO_F_PTS: number[] = [1, 1.5, 2, 3]
const COMBO_F_XP: number[] = [1, 1.1, 1.2, 1.35]

// 2) y 3) Explosiones en cadena y elites
let cadenaProf: number = 0
let multExplosivo: number = 1.0
let elitesMatadas: number = 0
let afijosVistos: boolean[] = [false, false, false, false, false]
const AFIJO_NOMBRE: string[] = ["", "VOLATIL", "BLINDADO", "FASEADO", "LIDER"]
const AFIJO_AVISO: string[] = ["", "EXPLOTA AL MORIR", "ESCUDO EXTRA", "SALTA DE SITIO", "ACELERA AL GRUPO"]
const AFIJO_COL: number[] = [0, 2, 9, 10, 5]

// 4) Mutaciones de oleada
const MOD_METEORITOS = 1
const MOD_ENJAMBRE = 2
const MOD_ORO = 3
const MOD_MINAS = 4
const MOD_NOMBRE: string[] = ["", "METEORITOS", "ENJAMBRE", "FIEBRE DE ORO", "CAMPO MINADO"]
const MOD_DESC: string[] = ["", "MIRA AL SUELO!", "HORDA FRAGIL", "ORO x2 Y VELOZ", "NO PISES MINAS"]
const MOD_CORTO: string[] = ["", "METEO", "ENJAM", "ORO!!", "MINAS"]
const MOD_COL: number[] = [0, 4, 3, 5, 2]
let modOleada: number = 0
let ultimoMod: number = 0
let meteoros: Meteoro[] = []

// V28: SANTUARIO (evento): aparece un circulo sagrado; quedate dentro para cargarlo.
// Mientras cargas, la horda intenta interrumpirte. Si lo completas: onda de luz, vida, oro y XP.
let santActivo: boolean = false
let santX: number = 0
let santY: number = 0
let santCarga: number = 0
let santFin: number = 0
let proxSant: number = 35000
let santUltTp: number = 0
let proxEcoSant: number = 0
let santHechos: number = 0
let proxMeteoro: number = 0

// 5) Reliquias de jefe
const REL_NOMBRE: string[] = ["PACTO", "RELOJ", "CARGA", "FUROR", "AEGIS", "TORMEN."]
const REL_DESC: string[] = [
    "+60%\nDANO\n-30%VID",
    "TIEMPO\nLENTO\n<35%VID",
    "1 BOMBA\nCADA 8\nBAJAS",
    "FURIA\nCADA\n14 SEG",
    "ESCUDO\nSE\nRECARGA",
    "RAYOS\nDOBLES\n+1 RAYO"
]
const REL_AVISO: string[] = ["MAS DANO, MENOS VIDA", "VIDA BAJA: TODO LENTO", "BOMBAS POR BAJAS", "FURIA PERIODICA", "ESCUDO REGENERABLE", "RAYOS DOBLES"]
const REL_COL: number[] = [2, 11, 4, 5, 9, 7]
let reliquias: boolean[] = [false, false, false, false, false, false]
let reliquiaPendiente: boolean = false
let modoReliquia: boolean = false
let killsBomba: number = 0
let overdriveHasta: number = 0
let proxOverdrive: number = 0
let proxAegis: number = 0
let ultimoDanoMs: number = -99999

// =========================================================
// ARTE PIXEL ART
// =========================================================

// --- JUGADOR: plantilla (a = color principal, b = color oscuro) ---
const imgJugadorBase = img`
    .....ffffff.....
    ....faaaaaaf....
    ...faaaaaaaaf...
    ...fabbbbbbaf...
    ..ffddddddddff..
    ..fddffddffddf..
    ...fddddddddf...
    ....ffddddff....
    ..faaaaaaaaaaf..
    .fdfaaabbaaafdf.
    .fdfaaabbaaafdf.
    ..ffaaaaaaaaff..
    ...fbbbffbbbf...
    ...fbbf..fbbf...
    ...ffff..ffff...
    ................
`

// --- ENEMIGO 1: Slime rosa ---
const imgSlime = img`
    ................
    ................
    ................
    .....ffffff.....
    ...ff333333ff...
    ..f3333333333f..
    .f331333333333f.
    .f331133331133f.
    .f33ff3333ff33f.
    .f333333333333f.
    .faaaaaaaaaaaaf.
    ..faaaaaaaaaaf..
    ...ffffffffff...
    ................
    ................
    ................
`

// --- ENEMIGO 2: Escarabajo naranja ---
const imgEscarabajo = img`
    ................
    .....f....f.....
    ......f..f......
    .....ffffff.....
    ....f444444f....
    ...f41144114f...
    ..f4444ff4444f..
    f.f4444ff4444f.f
    .f44244ff44244f.
    f.f4444ff4444f.f
    .ff4444ff4444ff.
    ..f4444ff4444f..
    ...f44444444f...
    ....f444444f....
    .....ffffff.....
    ................
`

// --- ENEMIGO 3: Fantasma blanco ---
const imgFantasma = img`
    ................
    ................
    ....ffffffff....
    ...f11111111f...
    ..f1111111111f..
    ..f1881111881f..
    ..f1881111881f..
    ..f1311111131f..
    ..f1111ff1111f..
    ..f1111111111f..
    ..f1111111111f..
    ..f1111111111f..
    ..f1111111111f..
    ..fff.ffff.fff..
    ................
    ................
`

// --- ENEMIGO 4: Esqueleto arquero (dispara flechas) ---
const imgArquero = img`
    ................
    .....ffffff.....
    ....f111111f....
    ...f11111111f...
    ...f1ff11ff1f...
    ...f1ff11ff1f...
    ...f11111111f...
    ....f1f11f1f....
    .....ffffff.....
    ..e.ff1111ff.e..
    .e5.f1ffff1f.5e.
    .e..f111111f..e.
    .e5.f111111f.5e.
    ..e.ff1ff1ff.e..
    ....f11ff11f....
    ....ff.ff.ff....
`

// --- ENEMIGO 5: Brujo (lanza magia) ---
const imgBrujo = img`
    .......ff.......
    ......faaf......
    .....faaaaf.....
    ....faaa5aaf....
    ...faaaaaaaaf...
    ..ffffffffffff..
    ....fddddddf....
    ....fd1dd1df....
    ....fddddddf....
    .....f1111f.....
    ...ffaaaaaaff...
    ..faaaabbaaaaf..
    ..faaaabbaaaaf..
    ..faaaaaaaaaaf..
    ..ffffffffffff..
    ................
`

// --- ENEMIGO 6: Bombita kamikaze ---
const imgBombita = img`
    .........45.....
    ........e.......
    .......e........
    .....ffffff.....
    ...ff222222ff...
    ..f2212222222f..
    .f222122222222f.
    .f225522225522f.
    .f22ff2222ff22f.
    .f222222222222f.
    .f222222222222f.
    .f222222222222f.
    ..f2222222222f..
    ...ff222222ff...
    .....ff..ff.....
    ................
`

// --- ENEMIGO 7: Gelatina (se divide al morir) ---
const imgGelatina = img`
    ................
    ................
    ....ffffffff....
    ..ff77777777ff..
    .f777777777777f.
    .f771777777777f.
    f77117777777777f
    f77ff77777ff777f
    f77777777777777f
    f77777777777777f
    f77777ffff77777f
    .f777777777777f.
    ..ff77777777ff..
    ....ffffffff....
    ................
    ................
`

// --- ENEMIGO 8: Mini gelatina (8x8) ---
const imgMiniGel = img`
    ........
    ..ffff..
    .f7777f.
    f7f77f7f
    f777777f
    f777777f
    .f7777f.
    ..ffff..
`

// --- JEFE: se dibuja a 16x16 y se duplica a 32x32 ---
const imgJefeBase = img`
    .f............f.
    .f5f........f5f.
    .f5f.ffffff.f5f.
    ..f5faaaaaaf5f..
    ...faaaaaaaaf...
    ..faa22aa22aaf..
    ..faaffaaffaaf..
    ..faaaaaaaaaaf..
    ..fa1a1aa1a1af..
    .ffaaaaaaaaaaff.
    faafaaaaaaaafaaf
    faafaaabbaaafaaf
    .ffaaaaaaaaaaff.
    ..faaaaaaaaaaf..
    ..faaf....faaf..
    ..ffff....ffff..
`

// --- Logo: bomba ---
const imgBombaLogo = img`
    ...........45...
    ..........e.....
    .........e......
    ....ffffffff....
    ..ffbbccccccff..
    .fbbccccccccccf.
    .fbcccccccccccf.
    .fccccccccccccf.
    .fccccccccccccf.
    .fccccccccccccf.
    .fccccccccccccf.
    ..fccccccccccf..
    ...ffccccccff...
    .....ffffff.....
    ................
    ................
`

// --- Mercader ---
const imgMercader = img`
    ................
    .....ffffff.....
    ....faaaaaaf....
    ...faaaaaaaaf...
    ...fafddddfaf...
    ...faf5dd5faf...
    ...fafddddfaf...
    ...faaffffaaf...
    ..faaaaaaaaaaf..
    .faaaaa44aaaaaf.
    .faaaaaaaaaaaaf.
    .faaaaaaaaaaaaf.
    ..faaaaaaaaaaf..
    ..ffffffffffff..
    ................
    ................
`

// --- Balas, gemas y monedas (8x8) ---
const imgBala = img`
    ........
    ..4554..
    .451154.
    .511115.
    .511115.
    .451154.
    ..4554..
    ........
`

const imgBalaEnemiga = img`
    ........
    ..2222..
    .255552.
    .251152.
    .251152.
    .255552.
    ..2222..
    ........
`

const imgBalaMagica = img`
    ........
    ...bb...
    ..bbab..
    .bbaabb.
    .bbaabb.
    ..bbab..
    ...bb...
    ........
`

const imgGemaXP = img`
    ...88...
    ..8998..
    .891998.
    .899998.
    .899998.
    ..8998..
    ...88...
    ........
`

const imgGemaVida = img`
    ........
    .22..22.
    21222222
    22222222
    .222222.
    ..2222..
    ...22...
    ........
`

const imgMoneda = img`
    ..4444..
    .455554.
    45511554
    45515554
    45515554
    45555554
    .455554.
    ..4444..
`

const imgMoneda2 = img`
    ...44...
    ..4554..
    ..4514..
    ..4514..
    ..4514..
    ..4514..
    ..4554..
    ...44...
`

const imgMoneda3 = img`
    ....4...
    ...45...
    ...45...
    ...45...
    ...45...
    ...45...
    ...45...
    ....4...
`

// --- Iconos de la tienda (8x8) ---
const imgIconoEscudo = img`
    .888888.
    88999988
    89999998
    89999998
    .899998.
    .899998.
    ..8998..
    ...88...
`

const imgIconoDano = img`
    ...44...
    ...44...
    .444444.
    44455444
    44455444
    .444444.
    ...44...
    ...44...
`

const imgIconoRayo = img`
    ....55..
    ...55...
    ..55....
    .55555..
    ...55...
    ..55....
    ..5.....
    ........
`

const imgIconoSalir = img`
    ........
    ...2....
    ..22....
    .2222222
    ..22....
    ...2....
    ........
    ........
`

// =========================================================
// UTILIDADES DE IMAGEN
// =========================================================

function desplazarImagen(src: Image, dy: number): Image {
    let r = image.create(src.width, src.height)
    r.drawTransparentImage(src, 0, dy)
    return r
}

function recolorSkin(base: Image, principal: number, oscuro: number): Image {
    let r = base.clone()
    r.replace(11, oscuro)
    r.replace(10, principal)
    return r
}

function reemplazarColor(src: Image, de: number, a: number): Image {
    let r = src.clone()
    r.replace(de, a)
    return r
}

function crearSilueta(src: Image): Image {
    let r = src.clone()
    for (let c = 1; c <= 14; c++) r.replace(c, 12)
    return r
}

function crearFramesJefe(variante: number): Image[] {
    let base = imgJefeBase.clone()
    let col = COLORES_JEFE[variante % COLORES_JEFE.length]
    base.replace(10, col)
    let grande = base.doubled()
    return [grande, desplazarImagen(grande, 1)]
}

const COLORES_JEFE: number[] = [10, 7, 9, 4, 3]
const NOMBRES_JEFE: string[] = ["REY BOMBA", "COLOSO", "HIDRA", "TIRANO", "DEVORADOR"]

// Frames de animacion
const FRAMES_SLIME: Image[] = [imgSlime, desplazarImagen(imgSlime, 1)]
const FRAMES_ESCARABAJO: Image[] = [imgEscarabajo, desplazarImagen(imgEscarabajo, 1)]
const FRAMES_FANTASMA: Image[] = [imgFantasma, desplazarImagen(imgFantasma, -1)]
const FRAMES_ARQUERO: Image[] = [imgArquero, desplazarImagen(imgArquero, 1)]
const FRAMES_BRUJO: Image[] = [imgBrujo, desplazarImagen(imgBrujo, -1)]
const FRAMES_BOMBITA: Image[] = [imgBombita, desplazarImagen(imgBombita, 1)]
const FRAMES_GELATINA: Image[] = [imgGelatina, desplazarImagen(imgGelatina, 1)]
const FRAMES_MINI: Image[] = [imgMiniGel, desplazarImagen(imgMiniGel, 1)]
const FRAMES_TIPO: Image[][] = [FRAMES_SLIME, FRAMES_ESCARABAJO, FRAMES_FANTASMA, FRAMES_ARQUERO, FRAMES_BRUJO, FRAMES_BOMBITA, FRAMES_GELATINA, FRAMES_MINI]
const FRAMES_MONEDA: Image[] = [imgMoneda, imgMoneda2, imgMoneda3, imgMoneda2]

// Tipos de enemigo: 0 slime, 1 escarabajo, 2 fantasma, 3 arquero, 4 brujo, 5 bombita, 6 gelatina, 7 mini
const HP_TIPO: number[] = [1.0, 1.8, 0.7, 0.8, 1.2, 0.6, 1.6, 0.4]
const DANO_TIPO: number[] = [1.0, 1.3, 1.0, 1.0, 1.2, 2.0, 1.0, 0.8]
const VEL_TIPO: number[] = [1.0, 0.8, 1.3, 0.75, 0.6, 1.5, 0.7, 1.2]
const NOMBRE_TIPO: string[] = ["SLIME", "ESCARABAJO", "FANTASMA", "ARQUERO", "BRUJO", "BOMBITA", "GELATINA", "MINI GEL"]

// Skins y vistas previas
let jugadorFrameA: Image = recolorSkin(imgJugadorBase, SKIN_PRINCIPAL[0], SKIN_OSCURO[0])
let jugadorFrameB: Image = desplazarImagen(jugadorFrameA, 1)
let previewsSkins: Image[] = []
let previewsBloqueadas: Image[] = []
for (let i = 0; i < SKIN_PRINCIPAL.length; i++) {
    let pv = recolorSkin(imgJugadorBase, SKIN_PRINCIPAL[i], SKIN_OSCURO[i]).doubled().doubled()
    previewsSkins.push(pv)
    previewsBloqueadas.push(crearSilueta(pv))
}

// Iconos de tienda
const imgGemaVidaMax: Image = reemplazarColor(imgGemaVida, 2, 7)
const imgOrbe: Image = crearImgOrbe()
let ICONOS_TIENDA: Image[] = [imgGemaVida, imgIconoEscudo, imgIconoDano, imgBala, imgMoneda, imgGemaVidaMax, imgIconoRayo, imgIconoSalir]

function crearImgOrbe(): Image {
    let o = image.create(8, 8)
    o.fillCircle(4, 4, 3, 9)
    o.drawCircle(4, 4, 3, 8)
    o.setPixel(3, 3, 1)
    o.setPixel(4, 3, 1)
    return o
}

// Efecto de explosion / puff
function crearFramesPuff(): Image[] {
    let f: Image[] = []
    let a = image.create(16, 16)
    a.fillCircle(8, 8, 3, 1)
    f.push(a)
    let b = image.create(16, 16)
    b.fillCircle(8, 8, 6, 5)
    b.fillCircle(8, 8, 4, 1)
    f.push(b)
    let c = image.create(16, 16)
    c.drawCircle(8, 8, 7, 4)
    c.fillCircle(8, 8, 3, 5)
    f.push(c)
    let d = image.create(16, 16)
    for (let k = 0; k < 8; k++) {
        let ang = k * Math.PI / 4
        d.fillRect(7 + Math.round(Math.cos(ang) * 7), 7 + Math.round(Math.sin(ang) * 7), 2, 2, 4)
    }
    f.push(d)
    return f
}
const FRAMES_PUFF: Image[] = crearFramesPuff()

// Zona de la tienda: anillo punteado + mercader
function crearZonaTienda(): Image {
    let im = image.create(48, 48)
    let contador = 0
    for (let a = 0; a < 360; a += 6) {
        let r = a * Math.PI / 180
        let col = (contador % 2 == 0) ? 5 : 4
        im.fillRect(Math.round(24 + Math.cos(r) * 22), Math.round(24 + Math.sin(r) * 22), 2, 2, col)
        contador++
    }
    im.drawCircle(24, 24, 18, 12)
    im.drawTransparentImage(imgMercader, 16, 16)
    return im
}
const imgCirculoTienda: Image = crearZonaTienda()

// Burbuja del escudo
function crearImgEscudo(): Image {
    let e = image.create(24, 24)
    e.drawCircle(12, 12, 11, 9)
    e.drawCircle(12, 12, 10, 8)
    e.fillRect(5, 5, 3, 1, 1)
    e.fillRect(4, 6, 1, 3, 1)
    return e
}
const imgEscudo: Image = crearImgEscudo()

// =========================================================
// MAPA: SUELO INFINITO CON DECORACION
// =========================================================

function crearTilesSuelo(): Image[] {
    let tiles: Image[] = []
    for (let v = 0; v < 8; v++) {
        let t = image.create(16, 16)
        t.fill(7)
        if (v == 0 || v == 1) {
            for (let k = 0; k < 7; k++) t.setPixel(Math.randomRange(0, 15), Math.randomRange(0, 15), 6)
        } else if (v == 2 || v == 3) {
            for (let k = 0; k < 3; k++) {
                let gx = Math.randomRange(2, 13)
                let gy = Math.randomRange(3, 14)
                t.setPixel(gx, gy, 6)
                t.setPixel(gx, gy - 1, 6)
                t.setPixel(gx - 1, gy - 2, 6)
                t.setPixel(gx + 1, gy - 2, 6)
            }
        } else if (v == 4 || v == 5) {
            let petalo = (v == 4) ? 1 : 3
            t.setPixel(8, 10, 6)
            t.setPixel(8, 11, 6)
            t.setPixel(8, 12, 6)
            t.setPixel(7, 11, 6)
            t.setPixel(9, 10, 6)
            t.setPixel(7, 8, petalo)
            t.setPixel(9, 8, petalo)
            t.setPixel(8, 7, petalo)
            t.setPixel(8, 9, petalo)
            t.setPixel(8, 8, 5)
        } else if (v == 6) {
            t.fillRect(4, 9, 5, 3, 13)
            t.fillRect(4, 11, 5, 1, 14)
            t.setPixel(5, 9, 1)
            t.fillRect(10, 4, 3, 2, 13)
            t.fillRect(10, 5, 3, 1, 14)
            t.setPixel(4, 9, 7)
            t.setPixel(8, 9, 7)
        } else {
            t.fillCircle(8, 9, 6, 15)
            t.fillCircle(8, 9, 5, 6)
            t.fillCircle(6, 7, 2, 7)
            t.setPixel(10, 9, 2)
            t.setPixel(5, 11, 2)
            t.setPixel(9, 7, 7)
        }
        tiles.push(t)
    }
    return tiles
}
const tilesSuelo: Image[] = crearTilesSuelo()

// ---------------------------------------------------------
// V24: BIOMAS (0 pradera, 1 bosque, 2 desierto, 3 tundra, 4 pantano,
//              5 mesa roja, 6 volcan, 7 jungla, 8 cerezos, 9 montanas)
// El mundo es infinito: el clima (temperatura, humedad y relieve) se calcula con ruido
// suave, asi que los biomas son enormes y se mezclan de forma natural.
// ---------------------------------------------------------
const NUM_BIOMAS = 10
const BIOMA_NOMBRE: string[] = ["PRADERA", "BOSQUE", "DESIERTO", "TUNDRA", "PANTANO", "MESA ROJA", "VOLCAN", "JUNGLA", "CEREZOS", "MONTANAS"]
const BIOMA_TIP: string[] = ["TIERRAS VERDES", "MADERA Y HONGOS", "CACTUS Y HIERRO", "CRISTALES DE HIELO", "ESPORAS Y HONGOS", "ARCILLA Y HIERRO", "CRISTAL Y HIERRO", "MADERA Y ESPORAS", "ARBOLES ROSAS", "ROCA Y HIERRO"]
const BIOMA_COL: number[] = [7, 6, 5, 9, 11, 4, 2, 7, 3, 13]
const SOMBRA_BIOMA: number[] = [6, 6, 14, 9, 12, 12, 15, 6, 6, 12]

//                                    pra bos des tun pan mes vol jun cer mon
const SUELO_BASE: number[] =    [7, 7, 13, 1, 6, 14, 12, 7, 7, 11]
const SUELO_PUNTO: number[] =   [6, 6, 4, 9, 7, 4, 15, 6, 3, 12]
const SUELO_ACENTO: number[] =  [1, 2, 14, 8, 2, 2, 4, 2, 3, 13]
const SUELO_ACENTO2: number[] = [3, 4, 4, 9, 11, 5, 5, 5, 1, 1]
const SUELO_PIEDRA1: number[] = [13, 14, 14, 9, 12, 2, 15, 11, 13, 12]
const SUELO_PIEDRA2: number[] = [14, 4, 4, 8, 8, 15, 14, 12, 14, 15]
const SUELO_POZO: number[] =    [6, 14, 14, 9, 8, 12, 2, 6, 9, 8]

function crearTilesBioma(b: number): Image[] {
    let base = SUELO_BASE[b]
    let punto = SUELO_PUNTO[b]
    let tiles: Image[] = []
    for (let v = 0; v < 8; v++) {
        let t = image.create(16, 16)
        t.fill(base)
        if (v == 0 || v == 1) {
            let n = (b == 1) ? 11 : 7
            for (let k = 0; k < n; k++) t.setPixel(Math.randomRange(0, 15), Math.randomRange(0, 15), punto)
            if (b == 7) {
                // Jungla: suelo cubierto de hojas oscuras
                for (let k = 0; k < 7; k++) {
                    let gx = Math.randomRange(0, 12)
                    let gy = Math.randomRange(0, 13)
                    t.fillRect(gx, gy, 3, 2, 6)
                    t.setPixel(gx + 1, gy + 1, 15)
                }
            }
        } else if (v == 2 || v == 3) {
            for (let k = 0; k < 3; k++) {
                let gx = Math.randomRange(2, 13)
                let gy = Math.randomRange(3, 14)
                t.setPixel(gx, gy, punto)
                t.setPixel(gx, gy - 1, punto)
                t.setPixel(gx - 1, gy - 2, punto)
                t.setPixel(gx + 1, gy - 2, punto)
            }
        } else if (v == 4 || v == 5) {
            let petalo = (v == 4) ? SUELO_ACENTO[b] : SUELO_ACENTO2[b]
            t.setPixel(8, 10, punto)
            t.setPixel(8, 11, punto)
            t.setPixel(8, 12, punto)
            t.setPixel(7, 11, punto)
            t.setPixel(9, 10, punto)
            t.setPixel(7, 8, petalo)
            t.setPixel(9, 8, petalo)
            t.setPixel(8, 7, petalo)
            t.setPixel(8, 9, petalo)
            t.setPixel(8, 8, (b == 3) ? 1 : 5)
        } else if (v == 6) {
            t.fillRect(4, 9, 5, 3, SUELO_PIEDRA1[b])
            t.fillRect(4, 11, 5, 1, SUELO_PIEDRA2[b])
            t.setPixel(5, 9, 1)
            t.fillRect(10, 4, 3, 2, SUELO_PIEDRA1[b])
            t.fillRect(10, 5, 3, 1, SUELO_PIEDRA2[b])
            t.setPixel(4, 9, base)
            t.setPixel(8, 9, base)
        } else {
            t.fillCircle(8, 9, 6, 15)
            t.fillCircle(8, 9, 5, SUELO_POZO[b])
            t.fillCircle(6, 7, 2, (b == 6) ? 4 : base)
            t.setPixel(10, 9, SUELO_ACENTO[b])
            t.setPixel(5, 11, SUELO_ACENTO[b])
            t.setPixel(9, 7, (b == 6) ? 5 : base)
        }
        tiles.push(t)
    }
    return tiles
}

// La pradera (0) es el suelo original, sin tocar
const TILES_BIOMA: Image[][] = [tilesSuelo, crearTilesBioma(1), crearTilesBioma(2), crearTilesBioma(3), crearTilesBioma(4),
    crearTilesBioma(5), crearTilesBioma(6), crearTilesBioma(7), crearTilesBioma(8), crearTilesBioma(9)]

// Hash para regiones grandes (biomas y celdas de ciudades). Reparte bien tambien con coordenadas
// negativas y todos los pasos intermedios caben en un entero de 32 bits.
function hashMacro(a: number, b: number, salt: number): number {
    let x = ((a % 4093) + 4093) % 4093
    let y = ((b % 4093) + 4093) % 4093
    let z = salt % 4093
    let h = (x * 1237 + y * 2341 + z * 3511 + 977) % 8191
    h = (h * h + x * 17 + y * 29 + 13) % 8191
    h = (h * 1103 + z * 77 + 5) % 8191
    return h % 4093
}

// Ruido suave 0-99: interpola (bilineal) entre valores aleatorios de una rejilla de 'cel' tiles
function ruidoSuave(tx: number, ty: number, cel: number, salt: number): number {
    let gx = Math.floor(tx / cel)
    let gy = Math.floor(ty / cel)
    let fx = (tx - gx * cel) / cel
    let fy = (ty - gy * cel) / cel
    fx = fx * fx * (3 - 2 * fx)
    fy = fy * fy * (3 - 2 * fy)
    let a = hashMacro(gx, gy, salt) % 100
    let b = hashMacro(gx + 1, gy, salt) % 100
    let c = hashMacro(gx, gy + 1, salt) % 100
    let d = hashMacro(gx + 1, gy + 1, salt) % 100
    let arriba = a + (b - a) * fx
    let abajo = c + (d - c) * fx
    return arriba + (abajo - arriba) * fy
}

// Alrededor del punto de inicio todo es pradera templada (R_PRADERA tiles) y despues
// el clima real del mundo va apareciendo poco a poco (hasta R_MEZCLA tiles)
const INICIO_TX = 5
const INICIO_TY = 4
const R_PRADERA = 55
const R_MEZCLA = 110

// Bioma segun temperatura (t), humedad (h) y relieve (a). Cada uno tiene escala distinta,
// asi que los biomas miden miles de pixeles y se mezclan de forma natural:
// caliente + alto = volcan, muy alto = montanas, y el resto por temperatura y humedad.
function biomaClima(tx: number, ty: number): number {
    let t = 50 + (ruidoSuave(tx, ty, 160, 61) - 50) * 1.4
    let h = 50 + (ruidoSuave(tx, ty, 140, 62) - 50) * 1.4
    let a = 50 + (ruidoSuave(tx, ty, 100, 63) - 50) * 1.4
    let dx = tx - INICIO_TX
    let dy = ty - INICIO_TY
    let d2 = dx * dx + dy * dy
    if (d2 < R_MEZCLA * R_MEZCLA) {
        let w = 1
        if (d2 > R_PRADERA * R_PRADERA) w = (R_MEZCLA - Math.sqrt(d2)) / (R_MEZCLA - R_PRADERA)
        t += (48 - t) * w
        h += (40 - h) * w
        a += (35 - a) * w
    }
    if (a > 80 && t > 68) return 6
    if (a > 84) return 9
    if (t < 18) return (h < 58) ? 3 : 1
    if (t < 46) {
        if (h < 48) return 0
        if (h < 70) return 8
        return 1
    }
    if (t < 68) {
        if (h < 62) return 0
        if (h < 72) return 1
        return 4
    }
    if (h < 35) return 2
    if (h < 58) return 5
    return 7
}

// Bioma de un tile. Se calcula por bloques de 2x2 tiles y el borde se "tiembla" con un hash
// para que no sea una recta. Se recuerda el ultimo bloque para no repetir calculos.
let bioCacheQx: number = -99999
let bioCacheQy: number = -99999
let bioCacheVal: number = 0

function biomaTile(tx: number, ty: number): number {
    let qx = Math.floor(tx / 2)
    let qy = Math.floor(ty / 2)
    if (qx == bioCacheQx && qy == bioCacheQy) return bioCacheVal
    bioCacheQx = qx
    bioCacheQy = qy
    bioCacheVal = biomaClima(qx * 2 + hashMacro(qx, qy, 41) % 9 - 4, qy * 2 + hashMacro(qx, qy, 42) % 9 - 4)
    return bioCacheVal
}

function biomaEn(x: number, y: number): number {
    return biomaTile(Math.floor(x / 16), Math.floor(y / 16))
}

function varianteTile(tx: number, ty: number): number {
    let h = Math.abs(((tx * 92821) ^ (ty * 68917)) % 29)
    let alt = (tx + ty) & 1
    if (h < 10) return alt
    if (h < 14) return 2 + alt
    if (h == 14) return 4
    if (h == 15) return 5
    if (h == 16) return 6
    if (h == 17) return 7
    return alt
}

function enPartida(): boolean {
    return estadoActual == EstadoJuego.Jugando || estadoActual == EstadoJuego.MenuSubirNivel ||
        estadoActual == EstadoJuego.ConfirmandoMejora || estadoActual == EstadoJuego.TiendaInteractiva ||
        estadoActual == EstadoJuego.Inventario || estadoActual == EstadoJuego.DentroCasa ||
        estadoActual == EstadoJuego.Crafteo || estadoActual == EstadoJuego.GameOver
}

// Suelo (capa mas profunda)
scene.createRenderable(-10, function (target: Image, camera: scene.Camera) {
    if (!enPartida()) return
    let ox = Math.floor(camera.drawOffsetX)
    let oy = Math.floor(camera.drawOffsetY)
    let tx0 = Math.floor(ox / 16)
    let ty0 = Math.floor(oy / 16)
    // Solo se recalculan los tiles al cruzar a otro tile (no en cada frame)
    if (tx0 != cacheTx0 || ty0 != cacheTy0) {
        cacheTx0 = tx0
        cacheTy0 = ty0
        cacheTiles = []
        for (let tx = tx0; tx <= tx0 + 10; tx++) {
            for (let ty = ty0; ty <= ty0 + 8; ty++) {
                cacheTiles.push(TILES_BIOMA[biomaTile(tx, ty)][varianteTile(tx, ty)])
            }
        }
    }
    let k = 0
    for (let tx = tx0; tx <= tx0 + 10; tx++) {
        for (let ty = ty0; ty <= ty0 + 8; ty++) {
            target.drawImage(cacheTiles[k], tx * 16 - ox, ty * 16 - oy)
            k++
        }
    }
})

// Sombras bajo los personajes
function dibujarSombra(target: Image, s: Sprite, camera: scene.Camera, mediaAncho: number, dy: number) {
    let cx = Math.floor(s.x - camera.drawOffsetX)
    let cy = Math.floor(s.y - camera.drawOffsetY) + dy
    if (cx < -mediaAncho || cx > 160 + mediaAncho || cy < -4 || cy > 124) return
    target.fillRect(cx - mediaAncho, cy, mediaAncho * 2, 2, colSombra)
    target.fillRect(cx - mediaAncho + 2, cy - 1, mediaAncho * 2 - 4, 1, colSombra)
    target.fillRect(cx - mediaAncho + 2, cy + 2, mediaAncho * 2 - 4, 1, colSombra)
}

scene.createRenderable(0.5, function (target: Image, camera: scene.Camera) {
    if (!enPartida() || !jugadorSprite) return
    // Aura de dano alrededor del jugador
    if (nivelAura > 0 && estadoActual != EstadoJuego.GameOver) {
        let ax = Math.floor(jugadorSprite.x - camera.drawOffsetX)
        let ay = Math.floor(jugadorSprite.y - camera.drawOffsetY)
        let colAura = (Math.floor(game.runtime() / 220) % 2 == 0) ? 9 : 8
        target.drawCircle(ax, ay, radioAura(), colAura)
    }
    dibujarSombra(target, jugadorSprite, camera, 5, 6)
    // En calidad baja no se dibujan las sombras de los enemigos
    if (calidad < 2) {
        let offX = camera.drawOffsetX
        let offY = camera.drawOffsetY
        for (let b of enemigosFrame) {
            // Primero el descarte barato (fuera de pantalla), despues se mira el tipo
            let sx = b.x - offX
            let sy = b.y - offY
            if (sx < -8 || sx > 168 || sy < -8 || sy > 128) continue
            if (b.data["muerto"]) continue
            let tipo = (b.data["tipo"] as number) || 0
            if (tipo != 7) dibujarSombra(target, b, camera, 5, 5)
        }
    }
    for (let j of jefesFrame) {
        if (!j.data["muerto"]) dibujarSombra(target, j, camera, 12, 13)
    }
})

// =========================================================
// EFECTOS VISUALES
// =========================================================

function crearEfectoMuerte(x: number, y: number) {
    if (fxVivos >= MAX_FX_Q[calidad]) return
    fxVivos++
    let fx = sprites.create(FRAMES_PUFF[0], SpriteKind.Food)
    fx.setPosition(x, y)
    fx.z = 3
    fx.setFlag(SpriteFlag.Ghost, true)
    fx.lifespan = 240
    animation.runImageAnimation(fx, FRAMES_PUFF, 60, false)
}

function crearAnillo(x: number, y: number, r: number, col: number, vida: number) {
    if (fxVivos >= MAX_FX_Q[calidad]) return
    fxVivos++
    // Los anillos se dibujan una sola vez por (radio, color) y se reutilizan
    let clave = r * 32 + col
    let idx = anilloClaves.indexOf(clave)
    let im: Image = null
    if (idx >= 0) {
        im = anilloImgs[idx]
    } else {
        im = image.create(r * 2 + 4, r * 2 + 4)
        im.drawCircle(r + 2, r + 2, r, col)
        im.drawCircle(r + 2, r + 2, r - 1, 1)
        im.drawCircle(r + 2, r + 2, r - 2, col)
        if (anilloClaves.length < 40) {
            anilloClaves.push(clave)
            anilloImgs.push(im)
        }
    }
    let s = sprites.create(im, SpriteKind.Food)
    s.setPosition(x, y)
    s.z = 3
    s.setFlag(SpriteFlag.Ghost, true)
    s.lifespan = vida
}

function crearRayoVisual(x: number, y: number) {
    if (fxVivos >= MAX_FX_Q[calidad]) return
    fxVivos++
    if (!imgRayoCache) {
        imgRayoCache = image.create(5, 80)
        imgRayoCache.fillRect(1, 0, 3, 80, 5)
        imgRayoCache.fillRect(2, 0, 1, 80, 1)
    }
    let im = imgRayoCache
    let s = sprites.create(im, SpriteKind.Food)
    s.setPosition(x, y - 40)
    s.z = 4
    s.setFlag(SpriteFlag.Ghost, true)
    s.lifespan = 150
}

// Contador de efectos vivos (puffs, anillos, rayos, tajos)
sprites.onDestroyed(SpriteKind.Food, function (fx) {
    fxVivos = Math.max(0, fxVivos - 1)
})

function textoFlotante(x: number, y: number, txt: string, color: number) {
    let ahora = game.runtime()
    while (textosFlotantes.length >= MAX_TEXTOS_Q[calidad]) textosFlotantes.removeAt(0)
    textosFlotantes.push({ x: x, y: y, txt: txt, color: color, t0: ahora, fin: ahora + 700 })
}

function mostrarBanner(l1: string, l2: string, col: number) {
    bannerL1 = l1
    bannerL2 = l2
    bannerCol = col
    bannerHasta = game.runtime() + 2200
}

function mostrarToast(l1: string, l2: string, col: number) {
    toastL1 = l1
    toastL2 = l2
    toastCol = col
    toastHasta = game.runtime() + 3200
}

function avisoTienda(txt: string, col: number) {
    mensajeTienda = txt
    mensajeTiendaColor = col
    mensajeTiendaHasta = game.runtime() + 1300
}

// =========================================================
// PROGRESO PERSISTENTE (Settings): records, estadisticas, personajes
// =========================================================

function leerNum(clave: string): number {
    let v = settings.readNumber(clave)
    if (v == null) return 0
    return v
}

function obtenerRecordDificultad(dif: number): number {
    return leerNum("HIGH_SCORE_DIF_" + dif)
}

function guardarRecordDificultad(dif: number, score: number) {
    if (score > obtenerRecordDificultad(dif)) {
        settings.writeNumber("HIGH_SCORE_DIF_" + dif, score)
    }
}

function cargarProgreso() {
    statKills = leerNum("ST_KILLS")
    statMonedas = leerNum("ST_MONEDAS")
    statJefes = leerNum("ST_JEFES")
    statMaxOleada = leerNum("ST_OLEADA")
    statMaxNivel = leerNum("ST_NIVEL")
    statMaxPts = leerNum("ST_PTS")
    statNoche = leerNum("ST_NOCHE")
    statPartidas = leerNum("ST_PARTIDAS")
    desbloqueado = []
    for (let i = 0; i < NOMBRES_SKINS.length; i++) {
        desbloqueado.push(i == 0 || leerNum("UNL_" + i) == 1)
    }
    let s = leerNum("SKIN_SEL")
    if (s >= 0 && s < NOMBRES_SKINS.length && desbloqueado[s]) skinSeleccionada = s
    skinCursor = skinSeleccionada
    // V28: ajustes guardados
    let sv = settings.readNumber("SET_VOL")
    if (sv != null && sv >= 0 && sv <= 100) volumenAudio = sv
    let sd = settings.readNumber("SET_DIF")
    if (sd != null && sd >= 0 && sd < NOMBRES_DIFICULTAD.length) nivelDificultad = sd
    let sc = settings.readNumber("SET_CAL")
    if (sc != null && sc >= 0 && sc < NOMBRES_CALIDAD.length) calidadModo = sc
    disparoAuto = leerNum("SET_AUTO") == 1
}

// V28: guarda solo los ajustes (volumen, dificultad, calidad, disparo)
function guardarAjustes() {
    settings.writeNumber("SET_VOL", volumenAudio)
    settings.writeNumber("SET_DIF", nivelDificultad)
    settings.writeNumber("SET_CAL", calidadModo)
    settings.writeNumber("SET_AUTO", disparoAuto ? 1 : 0)
}

// V28: boton GUARDAR del menu: estadisticas, personajes, personaje elegido y ajustes
function guardarTodo() {
    guardarProgreso()
    guardarAjustes()
    settings.writeNumber("SKIN_SEL", skinSeleccionada)
    for (let i = 1; i < NOMBRES_SKINS.length; i++) {
        if (desbloqueado[i]) settings.writeNumber("UNL_" + i, 1)
    }
    guardadoHasta = game.runtime() + 2200
    music.setVolume(Math.map(volumenAudio, 0, 100, 0, 120))
    music.playTone(784, 70)
    music.playTone(1047, 120)
}

function guardarProgreso() {
    settings.writeNumber("ST_KILLS", statKills)
    settings.writeNumber("ST_MONEDAS", statMonedas)
    settings.writeNumber("ST_JEFES", statJefes)
    settings.writeNumber("ST_OLEADA", statMaxOleada)
    settings.writeNumber("ST_NIVEL", statMaxNivel)
    settings.writeNumber("ST_PTS", statMaxPts)
    settings.writeNumber("ST_NOCHE", statNoche)
    settings.writeNumber("ST_PARTIDAS", statPartidas)
}

function personajeDesbloqueado(i: number): boolean {
    return i == 0 || desbloqueado[i]
}

function progresoMision(i: number): number {
    if (i == 1) return statMonedas + sumarPartida * monedasPartida
    if (i == 2) return statKills + sumarPartida * killsPartida
    if (i == 3) return Math.max(statMaxOleada, sumarPartida * oleadaActual)
    if (i == 4) return statJefes + sumarPartida * jefesPartida
    if (i == 5) return Math.max(statMaxNivel, sumarPartida * nivelJugador)
    if (i == 6) return Math.max(statMaxPts, sumarPartida * puntosPuntuacion)
    if (i == 7) return Math.max(statNoche, (nivelDificultad == 2) ? sumarPartida * oleadaActual : 0)
    return 0
}

function comprobarMisiones() {
    for (let i = 1; i < NOMBRES_SKINS.length; i++) {
        if (!desbloqueado[i] && progresoMision(i) >= META_MISION[i]) {
            desbloqueado[i] = true
            settings.writeNumber("UNL_" + i, 1)
            nuevosDesbloqueos.push(i)
            mostrarToast("PERSONAJE NUEVO!", NOMBRES_SKINS[i], 5)
            music.setVolume(Math.map(volumenAudio, 0, 100, 0, 150))
            music.playTone(988, 120)
        }
    }
}

// =========================================================
// AUDIO Y FONDO DE MENU
// =========================================================

function sonarNavegacion() {
    music.setVolume(Math.map(volumenAudio, 0, 100, 0, 120))
    music.playTone(523, 30)
}

function sonarConfirmar() {
    music.setVolume(Math.map(volumenAudio, 0, 100, 0, 150))
    music.playTone(659, 50)
}

function sonarCancelar() {
    music.setVolume(Math.map(volumenAudio, 0, 100, 0, 100))
    music.playTone(330, 40)
}

function inicializarFondoParticulas() {
    scene.setBackgroundColor(15)
    let paleta = [6, 8, 9, 10, 11]
    for (let i = 0; i < 20; i++) {
        let p = sprites.create(image.create(2, 2), SpriteKind.Food)
        p.image.fill(paleta[Math.randomRange(0, paleta.length - 1)])
        p.setPosition(Math.randomRange(0, 160), Math.randomRange(0, 120))
        p.vx = Math.randomRange(-20, 20)
        p.vy = Math.randomRange(-20, 20)
        p.setBounceOnWall(true)
        p.z = -20
        particulasFondo.push(p)
    }
}

function limpiarFondoParticulas() {
    for (let p of particulasFondo) p.destroy()
    particulasFondo = []
}

// =========================================================
// UTILIDADES DE TEXTO Y BARRAS
// =========================================================

function anchoTexto(t: string, f: image.Font): number {
    return t.length * f.charWidth
}

// Titulo grande con contorno y sombra
function textoGrande(texto: string, y: number, col: number, sombra: number) {
    let x = Math.floor((160 - anchoTexto(texto, image.font8)) / 2)
    screen.print(texto, x - 1, y, 15, image.font8)
    screen.print(texto, x + 1, y, 15, image.font8)
    screen.print(texto, x, y - 1, 15, image.font8)
    screen.print(texto, x, y + 3, 15, image.font8)
    screen.print(texto, x, y + 2, sombra, image.font8)
    screen.print(texto, x, y, col, image.font8)
}

function dibujarLineas(texto: string, x: number, y: number, color: number, separacion: number) {
    let lineas = texto.split("\n")
    for (let k = 0; k < lineas.length; k++) {
        screen.print(lineas[k], x, y + k * separacion, color, image.font5)
    }
}

function dibujarLineasCentradas(texto: string, y: number, color: number, separacion: number) {
    let lineas = texto.split("\n")
    for (let k = 0; k < lineas.length; k++) {
        screen.printCenter(lineas[k], y + k * separacion, color, image.font5)
    }
}

// Cache de textos del HUD (evita crear strings nuevos en cada frame)
let hudCacheN: number[] = [-987654, -987654, -987654, -987654, -987654, -987654, -987654, -987654]
let hudCacheS: string[] = ["", "", "", "", "", "", "", ""]
let hudVidaV: number = -987654
let hudVidaM: number = -987654
let hudVidaS: string = ""

function hudTxt(slot: number, pref: string, n: number): string {
    if (hudCacheN[slot] != n) {
        hudCacheN[slot] = n
        hudCacheS[slot] = pref + n
    }
    return hudCacheS[slot]
}

function hudVida(v: number, m: number): string {
    if (hudVidaV != v || hudVidaM != m) {
        hudVidaV = v
        hudVidaM = m
        hudVidaS = "" + v + "/" + m
    }
    return hudVidaS
}

function hudTiempo(ms: number): string {
    let seg = Math.floor(ms / 1000)
    if (hudCacheN[6] != seg) {
        hudCacheN[6] = seg
        hudCacheS[6] = formatoTiempo(ms)
    }
    return hudCacheS[6]
}

function formatoTiempo(ms: number): string {
    let s = Math.floor(ms / 1000)
    let m = Math.floor(s / 60)
    let r = s % 60
    return (m < 10 ? "0" : "") + m + ":" + (r < 10 ? "0" : "") + r
}

function nombreRareza(col: number): string {
    if (col == 10) return "RELIQ."
    if (col == 9) return "LEGEND."
    if (col == 2) return "EPICO"
    if (col == 5) return "RARO"
    return "COMUN"
}

// =========================================================
// KIT DE INTERFAZ V26 (paneles, botones, ayudas y efectos)
// =========================================================

let uiEstadoPrev: number = -1
let uiTransIni: number = 0
let misionSel: number = 1
let menuSkinIdx: number = -1
let menuSkinImg: Image = null
let tituloCara: Image[][] = []
let tituloNegro: Image[] = []
let tituloSombraImg: Image[] = []
const REC_ETIQ: string[] = ["BAJAS", "PARTIDAS", "OLEADA"]
const COL_DIF: number[] = [7, 5, 2]

function letraGrande(ch: string, col: number): Image {
    let im = image.create(8, 8)
    im.print(ch, 0, 0, col, image.font8)
    return im.doubled()
}

function crearImagenesTitulo() {
    for (let k = 0; k < TITULO_A.length; k++) {
        let ch = TITULO_A.charAt(k)
        tituloCara.push([letraGrande(ch, 5), letraGrande(ch, 4), letraGrande(ch, 1)])
        tituloNegro.push(letraGrande(ch, 15))
        tituloSombraImg.push(letraGrande(ch, 2))
    }
}
crearImagenesTitulo()

// Color legible para mostrar un personaje (la skin SOMBRA es del mismo color que el fondo)
function colorSkinUI(i: number): number {
    return SKIN_PRINCIPAL[i] == 12 ? 11 : SKIN_PRINCIPAL[i]
}

function contarDesbloqueados(): number {
    let n = 0
    for (let i = 0; i < NOMBRES_SKINS.length; i++) {
        if (personajeDesbloqueado(i)) n++
    }
    return n
}

// Panel con borde, brillo superior y esquinas recortadas
function uiPanel(x: number, y: number, w: number, h: number, borde: number) {
    screen.fillRect(x, y, w, h, 15)
    screen.fillRect(x + 1, y + 1, w - 2, h - 2, 12)
    screen.fillRect(x + 1, y + 1, w - 2, 1, 11)
    screen.drawRect(x, y, w, h, borde)
    screen.setPixel(x, y, 15)
    screen.setPixel(x + w - 1, y, 15)
    screen.setPixel(x, y + h - 1, 15)
    screen.setPixel(x + w - 1, y + h - 1, 15)
}

// Cabecera de pantalla con rayas diagonales y texto opcional a la derecha
function uiCabecera(titulo: string, col: number, derecha: string) {
    screen.fillRect(0, 0, 160, 15, 12)
    for (let k = 0; k < 9; k++) {
        let x0 = 96 + k * 9
        screen.drawLine(x0, 14, x0 + 8, 0, 8)
        screen.drawLine(x0 + 1, 14, x0 + 9, 0, 8)
    }
    screen.fillRect(0, 0, 160, 2, col)
    screen.fillRect(0, 14, 160, 1, col)
    screen.fillRect(0, 15, 160, 1, 15)
    screen.print(titulo, 7, 4, 15, image.font8)
    screen.print(titulo, 6, 3, col, image.font8)
    if (derecha != "") {
        let w = derecha.length * 6 + 6
        screen.fillRect(158 - w, 3, w, 10, 15)
        screen.drawRect(158 - w, 3, w, 10, col)
        screen.print(derecha, 161 - w, 6, 1, image.font5)
    }
}

// Chip con una letra (boton A / B)
function uiTecla(x: number, y: number, letra: string, col: number) {
    screen.fillRect(x, y, 7, 7, col)
    screen.setPixel(x, y, 15)
    screen.setPixel(x + 6, y, 15)
    screen.setPixel(x, y + 6, 15)
    screen.setPixel(x + 6, y + 6, 15)
    screen.print(letra, x + 1, y + 1, 15, image.font5)
}

// Icono de cruceta
function uiCruz(x: number, y: number) {
    screen.fillRect(x + 2, y, 3, 7, 13)
    screen.fillRect(x, y + 2, 7, 3, 13)
    screen.fillRect(x + 3, y + 3, 1, 1, 15)
}

// Barra inferior de ayuda: cruceta + A + B (deja "" para ocultar uno)
function uiAyuda(mover: string, a: string, b: string) {
    screen.fillRect(0, 109, 160, 11, 15)
    screen.drawLine(0, 109, 159, 109, 8)
    let w = -6
    if (mover != "") w += 15 + mover.length * 6
    if (a != "") w += 15 + a.length * 6
    if (b != "") w += 15 + b.length * 6
    let x = Math.floor((160 - w) / 2)
    let y = 112
    if (mover != "") {
        uiCruz(x, y)
        screen.print(mover, x + 9, y + 1, 13, image.font5)
        x += 15 + mover.length * 6
    }
    if (a != "") {
        uiTecla(x, y, "A", 7)
        screen.print(a, x + 9, y + 1, 13, image.font5)
        x += 15 + a.length * 6
    }
    if (b != "") {
        uiTecla(x, y, "B", 2)
        screen.print(b, x + 9, y + 1, 13, image.font5)
    }
}

// Triangulo (flecha) 4x7
function uiTri(x: number, y: number, der: boolean, col: number) {
    for (let k = 0; k < 4; k++) {
        screen.fillRect(der ? x + k : x + 3 - k, y + k, 1, 7 - 2 * k, col)
    }
}

// Boton: grande (font8) o pequeno (font5). Seleccionado = brillo + flechas animadas
function uiBoton(x: number, y: number, w: number, h: number, txt: string, sel: boolean, t: number, grande: boolean) {
    let cw = grande ? 8 : 6
    let ch = grande ? 8 : 5
    let f = grande ? image.font8 : image.font5
    let ty = y + Math.floor((h - ch) / 2)
    let hueco = w - txt.length * cw
    let ty2 = Math.floor((h - 7) / 2)
    if (sel) {
        screen.fillRect(x, y, w, h, 8)
        if (h >= 12) screen.fillRect(x + 1, y + 1, w - 2, 1, 9)
        screen.drawRect(x, y, w, h, (Math.floor(t) % 2 == 0) ? 5 : 4)
    } else {
        screen.fillRect(x, y, w, h, 12)
        screen.drawRect(x, y, w, h, 8)
    }
    if (hueco >= 24) {
        let tx = x + Math.floor(hueco / 2)
        if (sel) {
            let off = Math.floor(Math.abs(Math.sin(t * 1.3)) * 3)
            uiTri(x + 4 + off, y + ty2, true, 5)
            uiTri(x + w - 8 - off, y + ty2, false, 5)
        }
        screen.print(txt, tx + 1, ty + 1, 15, f)
        screen.print(txt, tx, ty, sel ? 5 : 1, f)
    } else {
        if (sel) uiTri(x + 3, y + ty2, true, 5)
        screen.print(txt, x + 10, ty + 1, 15, f)
        screen.print(txt, x + 9, ty, sel ? 5 : 1, f)
    }
}

// Rayos giratorios de fondo
function uiRayos(cx: number, cy: number, t: number, col: number, n: number) {
    for (let k = 0; k < n; k++) {
        let a = t / 20 + k * (6.2832 / n)
        screen.drawLine(cx, cy, Math.floor(cx + Math.cos(a) * 140), Math.floor(cy + Math.sin(a) * 140), col)
    }
}

// Destellos que parpadean en la zona alta
function uiBrillos(t: number) {
    for (let k = 0; k < 7; k++) {
        let f = (Math.floor(t * 1.2) + k * 3) % 11
        if (f < 3) {
            let x = (k * 53 + 17) % 150 + 5
            let y = (k * 37 + 9) % 30 + 2
            screen.setPixel(x, y, 1)
            if (f == 1) {
                screen.setPixel(x - 1, y, 11)
                screen.setPixel(x + 1, y, 11)
                screen.setPixel(x, y - 1, 11)
                screen.setPixel(x, y + 1, 11)
            }
        }
    }
}

// Oscurece la pantalla con lineas (para ventanas emergentes)
function uiOscurecer() {
    for (let y = 0; y < 120; y += 2) screen.drawLine(0, y, 159, y, 15)
}

// Texto centrado con sombra opcional (sombra < 0 = sin sombra)
function uiCentro(txt: string, y: number, col: number, f: image.Font, sombra: number) {
    let x = Math.floor((160 - txt.length * f.charWidth) / 2)
    if (sombra >= 0) screen.print(txt, x + 1, y + 1, sombra, f)
    screen.print(txt, x, y, col, f)
}

// Etiqueta pequena con fondo; devuelve su ancho
function uiChip(x: number, y: number, txt: string, fondo: number, colTxt: number): number {
    let w = txt.length * 6 + 4
    screen.fillRect(x, y, w, 9, fondo)
    screen.setPixel(x, y, 15)
    screen.setPixel(x + w - 1, y, 15)
    screen.setPixel(x, y + 8, 15)
    screen.setPixel(x + w - 1, y + 8, 15)
    screen.print(txt, x + 2, y + 2, colTxt, image.font5)
    return w
}

// Monedero: icono de moneda + cantidad
function uiMonedero(x: number, y: number, n: number) {
    let txt = "" + n
    let w = 14 + txt.length * 6
    screen.fillRect(x, y, w, 10, 15)
    screen.drawRect(x, y, w, 10, 5)
    screen.drawTransparentImage(imgMoneda, x + 2, y + 1)
    screen.print(txt, x + 12, y + 3, 1, image.font5)
}

// Numero que se ajusta al ancho (font8 si cabe, si no font5), centrado en [x, x+w]
function uiNumero(txt: string, x: number, y: number, w: number, col: number) {
    if (txt.length * 8 <= w - 2) {
        let tx = x + Math.floor((w - txt.length * 8) / 2)
        screen.print(txt, tx + 1, y + 1, 15, image.font8)
        screen.print(txt, tx, y, col, image.font8)
    } else {
        screen.print(txt, x + Math.floor((w - txt.length * 6) / 2), y + 2, col, image.font5)
    }
}

// Barra de desplazamiento vertical
function uiScroll(x: number, y: number, h: number, total: number, visibles: number, top: number) {
    if (total <= visibles) return
    screen.fillRect(x, y, 3, h, 15)
    let alto = Math.max(5, Math.floor(h * visibles / total))
    let pos = Math.floor((h - alto) * top / Math.max(1, total - visibles))
    screen.fillRect(x, y + pos, 3, alto, 9)
    screen.fillRect(x, y + pos, 3, 1, 1)
}

// Indicador en el borde de la pantalla que apunta a un objetivo lejano
function uiIndicador(sx: number, sy: number, t: number, icono: Image, col: number, txt: string) {
    let dxI = sx - 80
    let dyI = sy - 68
    let ang = Math.atan2(dyI, dxI)
    let escX = (Math.abs(dxI) > 0) ? 66 / Math.abs(dxI) : 9999
    let escY = (Math.abs(dyI) > 0) ? 36 / Math.abs(dyI) : 9999
    let esc = Math.min(escX, escY)
    let ix = Math.floor(80 + dxI * esc)
    let iy = Math.floor(68 + dyI * esc)
    let r = (Math.floor(t) % 2 == 0) ? 8 : 7
    screen.fillCircle(ix, iy, r, 15)
    screen.drawCircle(ix, iy, r, col)
    screen.drawTransparentImage(icono, ix - 4, iy - 4)
    screen.fillCircle(Math.floor(ix + Math.cos(ang) * 12), Math.floor(iy + Math.sin(ang) * 12), 2, col)
    screen.fillCircle(Math.floor(ix + Math.cos(ang) * 15), Math.floor(iy + Math.sin(ang) * 15), 1, col)
    if (txt != "") {
        let tx = Math.max(1, Math.min(159 - txt.length * 6, ix - Math.floor(txt.length * 3)))
        let ty = Math.min(112, iy + 10)
        screen.fillRect(tx - 1, ty - 1, txt.length * 6 + 1, 7, 15)
        screen.print(txt, tx, ty, col, image.font5)
    }
}

// Titulo del juego animado (letras grandes con onda, brillo y contorno)
function dibujarTitulo(t: number, y: number) {
    let n = TITULO_A.length
    let paso = Math.min(15, Math.floor(150 / n))
    let x0 = Math.floor((160 - (n - 1) * paso - 16) / 2)
    for (let k = 0; k < n; k++) {
        let x = x0 + k * paso
        let yy = y + Math.floor(Math.sin(t * 0.8 + k * 0.8) * 2)
        let neg = tituloNegro[k]
        screen.drawTransparentImage(neg, x - 1, yy)
        screen.drawTransparentImage(neg, x + 1, yy)
        screen.drawTransparentImage(neg, x, yy - 1)
        screen.drawTransparentImage(neg, x, yy + 3)
        screen.drawTransparentImage(tituloSombraImg[k], x, yy + 2)
        let fase = (Math.floor(t) + 800 - k) % 8
        let cara = (fase == 0) ? 2 : ((fase < 4) ? 0 : 1)
        screen.drawTransparentImage(tituloCara[k][cara], x, yy)
    }
    let m = TITULO_B.length
    let pasoB = Math.min(12, Math.floor(150 / m))
    let xb = Math.floor((160 - (m - 1) * pasoB - 8) / 2)
    for (let k = 0; k < m; k++) {
        let ch = TITULO_B.charAt(k)
        let x = xb + k * pasoB
        let yy = y + 20 + Math.floor(Math.sin(t * 0.8 + k * 0.9 + 3) * 1)
        screen.print(ch, x - 1, yy, 15, image.font8)
        screen.print(ch, x + 1, yy, 15, image.font8)
        screen.print(ch, x, yy - 1, 15, image.font8)
        screen.print(ch, x, yy + 3, 15, image.font8)
        screen.print(ch, x, yy + 2, 8, image.font8)
        screen.print(ch, x, yy, 9, image.font8)
    }
    // adorno bajo el titulo
    let yl = y + 32
    screen.drawLine(22, yl, 66, yl, 8)
    screen.drawLine(94, yl, 138, yl, 8)
    screen.fillRect(76, yl - 1, 8, 3, 5)
    screen.fillRect(78, yl - 2, 4, 5, (Math.floor(t) % 2 == 0) ? 5 : 4)
}

// =========================================================
// PANTALLAS DE MENU
// =========================================================

// Navegacion del menu principal: 0 = JUGAR, 1..6 = cuadricula 2x3
function moverMenu(dx: number, dy: number) {
    let i = opcionMenuSel
    if (dy < 0) {
        i = (i == 0) ? 7 : (i <= 2 ? 0 : (i == 7 ? 5 : i - 2))
    } else if (dy > 0) {
        i = (i == 0) ? 1 : (i == 7 ? 0 : (i >= 5 ? 7 : i + 2))
    } else if (dx != 0 && i > 0 && i < 7) {
        i = (i % 2 == 1) ? i + 1 : i - 1
    }
    if (i != opcionMenuSel) {
        opcionMenuSel = i
        sonarNavegacion()
    }
}

function dibujarMenuPrincipal(t: number) {
    uiRayos(80, 20, t, 12, 10)
    uiBrillos(t)
    let bob = Math.floor(Math.sin(t) * 2)
    screen.drawTransparentImage(imgBombaLogo, 8, 6 + bob)
    screen.drawTransparentImage(imgBombaLogo, 136, 6 - bob)
    dibujarTitulo(t, 2)

    let ahoraM = game.runtime() - menuT0

    // Boton grande JUGAR (con la dificultad a la izquierda y tu personaje a la derecha)
    let qJ = Math.max(0, Math.min(1, ahoraM / 380))
    let eJ = 1 - (1 - qJ) * (1 - qJ) * (1 - qJ)
    let jx = 6 + Math.round((1 - eJ) * 170)
    let jsel = opcionMenuSel == 0
    screen.fillRect(jx, 38, 148, 13, jsel ? 8 : 12)
    if (jsel) screen.fillRect(jx + 1, 39, 146, 2, 9)
    screen.drawRect(jx, 38, 148, 13, jsel ? ((Math.floor(t) % 2 == 0) ? 5 : 4) : 8)
    screen.fillCircle(jx + 12, 44, 5, 15)
    screen.fillCircle(jx + 12, 44, 4, COL_DIF[nivelDificultad])
    screen.print("" + (nivelDificultad + 1), jx + 10, 42, 15, image.font5)
    screen.fillRect(jx + 131, 40, 10, 10, 15)
    screen.fillRect(jx + 132, 41, 8, 8, colorSkinUI(skinSeleccionada))
    screen.fillRect(jx + 134, 43, 2, 2, 15)
    screen.fillRect(jx + 137, 43, 2, 2, 15)
    screen.print("JUGAR", jx + 55, 41, 15, image.font8)
    screen.print("JUGAR", jx + 54, 40, jsel ? 5 : 1, image.font8)
    if (jsel) {
        let off = Math.floor(Math.abs(Math.sin(t * 1.3)) * 3)
        uiTri(jx + 40 - off, 41, true, 5)
        uiTri(jx + 104 + off, 41, false, 5)
    }

    // Cuadricula: 3 filas de 2 botones + CREDITOS a todo el ancho
    for (let i = 1; i < OPCIONES_MENU.length; i++) {
        let fila = Math.floor((i - 1) / 2)
        let colu = (i - 1) % 2
        let ancho = (i == 7) ? 148 : 73
        let q = Math.max(0, Math.min(1, (ahoraM - 120 - fila * 70) / 380))
        let e = 1 - (1 - q) * (1 - q) * (1 - q)
        let bx = (colu == 0 ? 6 : 81) + Math.round((1 - e) * (colu == 0 ? -90 : 90))
        let by = 52 + fila * 11
        let sel = i == opcionMenuSel
        screen.fillRect(bx, by, ancho, 10, sel ? 8 : 12)
        if (sel) screen.fillRect(bx + 1, by + 1, ancho - 2, 1, 9)
        screen.drawRect(bx, by, ancho, 10, sel ? ((Math.floor(t) % 2 == 0) ? 5 : 4) : 8)
        screen.fillRect(bx + 1, by + 1, 2, 8, COL_ACENTO[i])
        let txt = OPCIONES_MENU[i]
        let col = sel ? 5 : 1
        if (i == 6 && game.runtime() < guardadoHasta) {
            txt = "GUARDADO!"
            col = 7
        }
        let tx = Math.max(bx + 11, bx + 4 + Math.floor((ancho - 4 - txt.length * 6) / 2))
        screen.print(txt, tx + 1, by + 3, 15, image.font5)
        screen.print(txt, tx, by + 2, col, image.font5)
        if (sel) {
            let off2 = Math.floor(Math.abs(Math.sin(t * 1.3)) * 2)
            uiTri(bx + 5 + off2, by + 1, true, 5)
        }
    }

    // Franja de informacion: descripcion de lo seleccionado (en JUGAR rota record / consejo / progreso)
    uiPanel(6, 97, 148, 11, 8)
    let ciclo = Math.floor(game.runtime() / 2600)
    let info = DESC_MENU[opcionMenuSel]
    let colInfo = 9
    if (game.runtime() < guardadoHasta) {
        info = "PROGRESO GUARDADO!"
        colInfo = 7
    } else if (opcionMenuSel == 0) {
        if (ciclo % 3 == 0) {
            info = "RECORD " + fmtNum(obtenerRecordDificultad(nivelDificultad)) + " " + NOMBRES_SKINS[skinSeleccionada]
            colInfo = 5
        } else if (ciclo % 3 == 1) {
            info = CONSEJOS[Math.floor(ciclo / 3) % CONSEJOS.length]
        } else {
            info = "HEROES " + contarDesbloqueados() + "/" + NOMBRES_SKINS.length + " PARTIDAS " + statPartidas
            colInfo = 3
        }
    }
    uiCentro(info, 100, colInfo, image.font5, -1)
    uiAyuda("ELEGIR", "OK", "")
    screen.print("V1.0", 135, 112, 11, image.font5)
}

function dibujarSkins(t: number) {
    let i = skinCursor
    let libre = personajeDesbloqueado(i)
    let cn = colorSkinUI(i)
    uiCabecera("PERSONAJES", 9, contarDesbloqueados() + "/" + NOMBRES_SKINS.length)

    // Retrato
    uiPanel(4, 18, 70, 76, libre ? 5 : 2)
    screen.fillCircle(39, 55, 28, 15)
    let aro = SKIN_OSCURO[i]
    if (!libre || aro == 12 || aro == 15) aro = 8
    screen.drawCircle(39, 55, 28, aro)
    screen.fillRect(17, 87, 44, 3, 8)
    let bob = Math.floor(Math.sin(t) * 1)
    screen.drawTransparentImage(libre ? previewsSkins[i] : previewsBloqueadas[i], 7, 22 + bob)
    if (!libre) {
        screen.drawRect(34, 43, 10, 11, 1)
        screen.fillRect(31, 51, 16, 13, 5)
        screen.drawRect(31, 51, 16, 13, 4)
        screen.fillRect(38, 55, 2, 5, 15)
    }

    // Informacion
    uiPanel(78, 18, 78, 76, 5)
    screen.print(NOMBRES_SKINS[i], 84, 23, 15, image.font8)
    screen.print(NOMBRES_SKINS[i], 83, 22, libre ? cn : 13, image.font8)
    if (!libre) {
        uiChip(83, 32, "BLOQUEADO", 2, 1)
    } else if (i == skinSeleccionada) {
        uiChip(83, 32, "EQUIPADO", 7, 15)
    } else {
        uiChip(83, 32, "LISTO", 9, 15)
    }
    screen.print("BONUS", 83, 44, 5, image.font5)
    screen.drawLine(114, 46, 151, 46, 8)
    dibujarLineas(PERK_TXT[i], 83, 51, 1, 6)

    if (!libre) {
        let prog = Math.min(progresoMision(i), META_MISION[i])
        let pct = Math.floor(prog * 100 / META_MISION[i])
        screen.print("MISION", 83, 70, 9, image.font5)
        let sp = pct + "%"
        screen.print(sp, 151 - sp.length * 6, 70, 5, image.font5)
        dibujarLineas(MISION_LARGA[i], 83, 77, 1, 6)
        dibujarBarra(84, 89, 66, 3, prog / META_MISION[i], 9)
    } else if (i != skinSeleccionada) {
        uiBoton(83, 78, 68, 12, "EQUIPAR", true, t, false)
    } else {
        screen.print("MISION CUMPLIDA", 83, 80, 7, image.font5)
    }

    // Selector inferior
    uiTri(10, 98, true, (Math.floor(t) % 2 == 0) ? 5 : 1)
    uiTri(146, 98, false, (Math.floor(t) % 2 == 0) ? 5 : 1)
    for (let k = 0; k < NOMBRES_SKINS.length; k++) {
        let x = 28 + k * 13
        let lk = personajeDesbloqueado(k)
        screen.fillRect(x, 97, 9, 9, lk ? colorSkinUI(k) : 12)
        if (!lk) screen.print("?", x + 2, 99, 13, image.font5)
        screen.drawRect(x, 97, 9, 9, k == skinCursor ? 5 : 8)
        if (k == skinCursor) screen.drawRect(x - 1, 96, 11, 11, 5)
        if (k == skinSeleccionada && lk) screen.fillRect(x + 3, 100, 3, 3, 15)
    }
    uiAyuda("ELEGIR", libre ? "USAR" : "", "ATRAS")
}

function dibujarMisiones(t: number) {
    let hechas = 0
    for (let i = 1; i < NOMBRES_SKINS.length; i++) {
        if (progresoMision(i) >= META_MISION[i]) hechas++
    }
    uiCabecera("MISIONES", 5, hechas + "/" + (NOMBRES_SKINS.length - 1))

    // Lista
    uiPanel(3, 18, 72, 88, 8)
    for (let i = 1; i < NOMBRES_SKINS.length; i++) {
        let y = 21 + (i - 1) * 12
        let meta = META_MISION[i]
        let prog = Math.min(progresoMision(i), meta)
        let hecho = prog >= meta
        let sel = i == misionSel
        if (sel) {
            screen.fillRect(5, y - 1, 68, 12, 8)
            screen.drawRect(5, y - 1, 68, 12, (Math.floor(t) % 2 == 0) ? 5 : 4)
        }
        screen.fillRect(8, y + 1, 5, 5, colorSkinUI(i))
        screen.drawRect(7, y, 7, 7, 15)
        screen.print(NOMBRES_SKINS[i], 17, y + 1, sel ? 5 : (hecho ? 7 : 1), image.font5)
        screen.fillRect(17, y + 8, 50, 1, 15)
        screen.fillRect(17, y + 8, Math.floor(50 * prog / meta), 1, hecho ? 7 : 9)
        if (hecho) {
            screen.drawLine(64, y + 3, 66, y + 5, 7)
            screen.drawLine(66, y + 5, 70, y + 0, 7)
        }
    }

    // Detalle
    let i2 = misionSel
    let meta2 = META_MISION[i2]
    let prog2 = Math.min(progresoMision(i2), meta2)
    let hecho2 = prog2 >= meta2
    uiPanel(78, 18, 79, 88, hecho2 ? 7 : 5)
    screen.print(NOMBRES_SKINS[i2], 84, 23, 15, image.font8)
    screen.print(NOMBRES_SKINS[i2], 83, 22, colorSkinUI(i2), image.font8)
    screen.print("OBJETIVO", 83, 35, 9, image.font5)
    screen.drawLine(119, 37, 152, 37, 8)
    dibujarLineas(MISION_LARGA[i2], 83, 42, 1, 7)
    dibujarBarra(84, 60, 66, 7, prog2 / meta2, hecho2 ? 7 : 9)
    if (hecho2) {
        uiCentro("COMPLETADA", 71, (Math.floor(t) % 2 == 0) ? 7 : 1, image.font5, -1)
    } else {
        let sp = prog2 + "/" + meta2
        screen.print(sp, 118 - Math.floor(sp.length * 3), 71, 13, image.font5)
    }
    screen.print("PREMIO", 83, 82, 5, image.font5)
    screen.drawLine(113, 84, 152, 84, 8)
    dibujarLineas(PERK_TXT[i2], 83, 89, 1, 6)
    uiAyuda("VER", "", "ATRAS")
}

function dibujarRecords(t: number) {
    uiCabecera("RECORDS", 5, "")
    for (let d = 0; d < NOMBRES_DIFICULTAD.length; d++) {
        let y = 19 + d * 22
        let act = d == nivelDificultad
        uiPanel(4, y, 152, 20, act ? 5 : 8)
        screen.fillCircle(17, y + 10, 7, COL_DIF[d])
        screen.drawCircle(17, y + 10, 7, 15)
        screen.print("" + (d + 1), 15, y + 8, 15, image.font5)
        screen.print(NOMBRES_DIFICULTAD[d], 29, y + 4, act ? 5 : 1, image.font5)
        for (let p = 0; p < 3; p++) {
            screen.fillRect(29 + p * 7, y + 12, 5, 4, p <= d ? COL_DIF[d] : 15)
        }
        let rec = "" + obtenerRecordDificultad(d)
        if (rec.length <= 5) {
            screen.print(rec, 151 - rec.length * 8 + 1, y + 4, 15, image.font8)
            screen.print(rec, 150 - rec.length * 8 + 1, y + 3, act ? 5 : 9, image.font8)
        } else {
            screen.print(rec, 151 - rec.length * 6, y + 4, act ? 5 : 9, image.font5)
        }
        screen.print("PTS", 133, y + 13, 13, image.font5)
    }
    for (let k = 0; k < 3; k++) {
        let x = 4 + k * 51
        uiPanel(x, 86, 50, 21, 8)
        screen.print(REC_ETIQ[k], x + 25 - Math.floor(REC_ETIQ[k].length * 3), 89, 13, image.font5)
        let v = statKills
        if (k == 1) v = statPartidas
        else if (k == 2) v = statMaxOleada
        uiNumero(fmtNum(v), x, 96, 50, k == 0 ? 2 : (k == 1 ? 9 : 5))
    }
    uiAyuda("", "VOLVER", "")
}

function dibujarOpciones(t: number) {
    uiCabecera("OPCIONES", 9, "")
    let blink = (Math.floor(t) % 2 == 0) ? 5 : 4

    // Volumen
    let s0 = opcionOpcionesSel == 0
    uiPanel(4, 18, 152, 23, s0 ? blink : 8)
    screen.print("VOLUMEN", 12, 21, s0 ? 5 : 1, image.font5)
    let sv = volumenAudio + "%"
    screen.print(sv, 148 - sv.length * 6, 21, 9, image.font5)
    let bloques = Math.floor(volumenAudio / 10)
    for (let b = 0; b < 10; b++) {
        let x = 17 + b * 13
        let col = b < 4 ? 7 : (b < 7 ? 5 : 2)
        screen.fillRect(x, 29, 12, 8, b < bloques ? col : 15)
        if (b < bloques) screen.fillRect(x, 29, 12, 1, 1)
        screen.drawRect(x, 29, 12, 8, b < bloques ? 15 : 8)
    }
    uiTri(8, 30, true, s0 ? 5 : 8)
    uiTri(148, 30, false, s0 ? 5 : 8)

    // Dificultad
    let s1 = opcionOpcionesSel == 1
    uiPanel(4, 43, 152, 22, s1 ? blink : 8)
    screen.print("DIFICULTAD", 12, 46, s1 ? 5 : 1, image.font5)
    let cd = COL_DIF[nivelDificultad]
    uiCentro(NOMBRES_DIFICULTAD[nivelDificultad], 54, cd, image.font8, 15)
    for (let p = 0; p < 3; p++) {
        screen.fillRect(121 + p * 8, 47, 6, 4, p <= nivelDificultad ? cd : 15)
        screen.drawRect(121 + p * 8, 47, 6, 4, 8)
    }
    uiTri(8, 55, true, s1 ? 5 : 8)
    uiTri(148, 55, false, s1 ? 5 : 8)

    // Calidad grafica (movil: BAJA)
    let s2 = opcionOpcionesSel == 2
    uiPanel(4, 67, 74, 22, s2 ? blink : 8)
    screen.print("CALIDAD", 12, 70, s2 ? 5 : 1, image.font5)
    let nc = NOMBRES_CALIDAD[calidadModo]
    screen.print(nc, 4 + Math.floor((74 - nc.length * 6) / 2), 79, COL_CALIDAD[calidadModo], image.font5)
    uiTri(7, 78, true, s2 ? 5 : 8)
    uiTri(67, 78, false, s2 ? 5 : 8)

    // Disparo automatico (movil: no hace falta mantener A)
    let s3 = opcionOpcionesSel == 3
    uiPanel(82, 67, 74, 22, s3 ? blink : 8)
    screen.print("DISPARO", 90, 70, s3 ? 5 : 1, image.font5)
    let nd = disparoAuto ? "AUTO" : "MANUAL"
    screen.print(nd, 82 + Math.floor((74 - nd.length * 6) / 2), 79, disparoAuto ? 7 : 1, image.font5)
    uiTri(85, 78, true, s3 ? 5 : 8)
    uiTri(145, 78, false, s3 ? 5 : 8)

    uiBoton(40, 92, 80, 13, "VOLVER", opcionOpcionesSel == 4, t, true)
    uiAyuda("CAMBIAR", "OK", "ATRAS")
}

function dibujarCreditos(t: number) {
    uiRayos(80, 60, t, 12, 12)
    uiCabecera("CREDITOS", 9, "")
    uiPanel(10, 19, 140, 86, 8)
    let bob = Math.floor(Math.sin(t) * 2)
    screen.drawTransparentImage(imgBombaLogo, 14, 24 + bob)
    screen.drawTransparentImage(imgBombaLogo, 130, 24 - bob)
    dibujarTitulo(t, 24)
    uiCentro("HECHO CON", 62, 13, image.font5, -1)
    uiCentro("MAKECODE ARCADE", 70, 9, image.font5, -1)
    let txtA = "POR " + AUTOR
    let wA = txtA.length * 6 + 8
    screen.fillRect(Math.floor((160 - wA) / 2), 82, wA, 11, 8)
    screen.drawRect(Math.floor((160 - wA) / 2), 82, wA, 11, 5)
    uiCentro(txtA, 85, 5, image.font5, -1)
    uiCentro("VERSION 1.0", 96, 11, image.font5, -1)
    uiAyuda("", "VOLVER", "")
}

// =========================================================
// PANTALLA DE JUEGO + HUD
// =========================================================

function dibujarBarra(x: number, y: number, w: number, h: number, pct: number, colRelleno: number) {
    let p = Math.max(0, Math.min(1, pct))
    let f = Math.floor(w * p)
    screen.fillRect(x, y, w, h, 15)
    if (f > 0) {
        screen.fillRect(x, y, f, h, colRelleno)
        if (h >= 4 && colRelleno != 1) screen.fillRect(x, y, f, 1, 1)
    }
    screen.drawRect(x - 1, y - 1, w + 2, h + 2, 11)
}

function dibujarBarraHabilidad(x: number, y: number, nombre: string, pct: number, listo: boolean) {
    let p = Math.max(0, Math.min(1, pct))
    screen.fillRect(x, y, 40, 9, 15)
    screen.fillRect(x, y, Math.floor(40 * p), 9, listo ? 7 : 8)
    if (listo) screen.fillRect(x, y, 40, 1, 1)
    let parpadeo = listo && (Math.floor(game.runtime() / 250) % 2 == 0)
    screen.drawRect(x - 1, y - 1, 42, 11, listo ? (parpadeo ? 1 : 5) : 11)
    screen.print(nombre, x + 4, y + 3, 15, image.font5)
    screen.print(nombre, x + 3, y + 2, 1, image.font5)
}

function dibujarJuego(t: number) {
    let ahora = game.runtime()
    let camX = scene.cameraProperty(CameraProperty.X) - 80
    let camY = scene.cameraProperty(CameraProperty.Y) - 60

    // Listas de este frame (se reutilizan en todo el HUD)
    let enemigosV = enemigosFrame
    let jefes = jefesFrame

    // Barras de vida de enemigos danados
    for (let bicho of enemigosV) {
        let scrX = bicho.x - camX - 7
        let scrY = bicho.y - camY - 12
        if (scrX < -10 || scrX > 170 || scrY < -10 || scrY > 130) continue
        let bdat = bicho.data
        if (bdat["muerto"] || bdat["elite"]) continue
        let hpCurrent = (bdat["hp"] as number) || 1
        let hpMax = (bdat["maxHp"] as number) || 1
        let pct = Math.max(0, hpCurrent / hpMax)
        if (pct < 1) {
            screen.fillRect(scrX, scrY, 14, 3, 15)
            screen.fillRect(scrX, scrY, Math.floor(14 * pct), 3, pct > 0.4 ? 2 : 4)
            screen.drawRect(scrX - 1, scrY - 1, 16, 5, 1)
        }
    }

    // V27: meteoritos, elites y efectos de reliquias
    dibujarMundoV27(t, camX, camY)

    // Flecha hacia la tienda cuando esta fuera de pantalla
    if (tiendaActivaSprite) {
        let sx = tiendaActivaSprite.x - camX
        let sy = tiendaActivaSprite.y - camY
        if (sx < 0 || sx > 160 || sy < 20 || sy > 120) {
            uiIndicador(sx, sy, t, imgMoneda, (Math.floor(t) % 2 == 0) ? 5 : 4, "")
        }
    }

    dibujarExtrasMundo(t, camX, camY)

    // Numeros flotantes de dano
    for (let tf of textosFlotantes) {
        let edad = ahora - tf.t0
        let px = Math.floor(tf.x - camX - tf.txt.length * 3)
        let py = Math.floor(tf.y - camY - edad / 45)
        if (calidad == 0) screen.print(tf.txt, px + 1, py + 1, 15, image.font5)
        screen.print(tf.txt, px, py, tf.color, image.font5)
    }

    // ---- HUD superior ----
    screen.fillRect(0, 0, 160, 14, 15)
    screen.drawLine(0, 14, 159, 14, 8)

    // Vida
    screen.drawTransparentImage(imgGemaVida, 1, 3)
    let pctVida = Math.max(0, Math.min(1, vidaActual / vidaMaxima))
    let colVida = pctVida > 0.5 ? 7 : (pctVida > 0.25 ? 5 : 2)
    if (pctVida <= 0.25 && (Math.floor(t * 2) % 2 == 0)) colVida = 4
    let fv = Math.floor(54 * pctVida)
    screen.fillRect(10, 3, 54, 8, 12)
    if (fv > 0) {
        screen.fillRect(10, 3, fv, 8, colVida)
        screen.fillRect(10, 3, fv, 1, 1)
    }
    screen.drawRect(9, 2, 56, 10, 11)
    let sVida = hudVida(Math.ceil(Math.max(0, vidaActual)), vidaMaxima)
    let xVida = 10 + Math.floor((54 - sVida.length * 6) / 2)
    screen.print(sVida, xVida + 1, 5, 15, image.font5)
    screen.print(sVida, xVida, 4, 1, image.font5)
    if (puntosEscudoActivo > 0) {
        screen.fillRect(10, 12, Math.min(54, Math.floor(puntosEscudoActivo * 54 / Math.max(1, vidaMaxima))), 2, 9)
    }

    // Nivel, oro y bajas
    let sLv = hudTxt(0, "LV", nivelJugador)
    let wLv = sLv.length * 6 + 5
    screen.fillRect(68, 2, wLv, 10, 12)
    screen.drawRect(68, 2, wLv, 10, 9)
    screen.print(sLv, 71, 4, 1, image.font5)
    screen.drawTransparentImage(imgMoneda, 98, 3)
    screen.print(hudTxt(1, "", cantidadMonedas), 108, 4, 5, image.font5)
    screen.fillRect(131, 5, 3, 3, 2)
    screen.fillRect(130, 6, 5, 1, 2)
    screen.print(hudTxt(2, "", killsPartida), 137, 4, 2, image.font5)

    // Fila de oleada
    // Solo cuenta sprites vivos (los destruidos este frame siguen en la lista cacheada)
    let vivos = sprites.allOfKind(SpriteKind.Enemy).length + sprites.allOfKind(SpriteKind.JefeEnemigo).length
    let totalEnemigosRestantes = vivos + bichosRestantesPorSpawn
    let totalInicial = Math.max(1, totalBichosOleadaInicial)
    let pctOleada = Math.min(1, Math.max(0, (totalInicial - totalEnemigosRestantes) / totalInicial))
    if (totalEnemigosRestantes <= 0) pctOleada = 1
    // Nunca retrocede dentro de la oleada (redadas, esbirros y gelatinas sumaban al total y la hacian bajar)
    if (pctOleada > pctOleadaMax) pctOleadaMax = pctOleada
    // Relleno suave en vez de saltos
    pctOleadaVis += (pctOleadaMax - pctOleadaVis) * 0.25
    if (pctOleadaMax - pctOleadaVis < 0.004) pctOleadaVis = pctOleadaMax

    let sOl = hudTxt(3, "OL", oleadaActual)
    let wOl = sOl.length * 6 + 4
    screen.fillRect(1, 16, wOl, 8, 15)
    screen.drawRect(1, 16, wOl, 8, 4)
    screen.print(sOl, 3, 18, 5, image.font5)
    let sEn = hudTxt(4, "x", totalEnemigosRestantes)
    let wEn = sEn.length * 6 + 3
    // La barra se adapta al ancho disponible para no pisar el contador
    let xBarra = wOl + 4
    let wBarra = Math.max(8, (125 - wEn - 4) - xBarra - 1)
    dibujarBarra(xBarra, 18, wBarra, 4, pctOleadaVis, 2)
    screen.fillRect(125 - wEn, 16, wEn + 2, 8, 15)
    screen.print(sEn, 126 - wEn, 18, 1, image.font5)
    screen.fillRect(127, 16, 32, 8, 15)
    screen.drawRect(127, 16, 32, 8, 8)
    screen.print(hudTiempo(tiempoPartidaMs), 129, 18, 3, image.font5)

    // Barra del jefe
    if (jefes.length > 0) {
        let jf = jefes[0]
        let hpJ = Math.max(0, ((jf.data["hp"] as number) || 1) / ((jf.data["maxHp"] as number) || 1))
        let fj = Math.floor(106 * hpJ)
        screen.fillRect(24, 26, 112, 11, 15)
        screen.drawRect(24, 26, 112, 11, 2)
        screen.fillRect(27, 28, 106, 7, 12)
        if (fj > 0) {
            screen.fillRect(27, 28, fj, 7, 2)
            screen.fillRect(27, 28, fj, 1, 3)
        }
        screen.fillRect(20, 29, 4, 5, 2)
        screen.fillRect(136, 29, 4, 5, 2)
        let nj = "" + jf.data["nombre"]
        let xj = Math.floor((160 - nj.length * 6) / 2)
        screen.print(nj, xj + 1, 30, 15, image.font5)
        screen.print(nj, xj, 29, 1, image.font5)
    }

    // Barra de XP abajo del todo
    let pctXP = Math.min(1, xpActual / xpSiguienteNivel)
    let fx = Math.floor(160 * pctXP)
    screen.fillRect(0, 116, 160, 4, 15)
    screen.drawLine(0, 116, 159, 116, 8)
    if (fx > 0) {
        screen.fillRect(0, 117, fx, 3, 9)
        screen.fillRect(0, 117, fx, 1, 1)
    }
    for (let k = 1; k < 8; k++) screen.fillRect(k * 20, 117, 1, 3, 15)

    // Habilidades
    if (nivelHabilidadDash > 0) {
        let listoD = ahora >= cooldownDashMs
        dibujarBarraHabilidad(4, 104, "B-DASH", listoD ? 1 : 1 - (cooldownDashMs - ahora) / cdDash(), listoD)
    }
    if (nivelHabilidadNova > 0) {
        let listoN = ahora >= cooldownNovaMs
        dibujarBarraHabilidad(50, 104, "NOVA", listoN ? 1 : 1 - (cooldownNovaMs - ahora) / cdNova(), listoN)
    }

    // V27: combo, mutacion y reliquias
    dibujarHudV27(t, jefes.length > 0)

    // Indicador de permanencia en tienda
    if (enZonaActivacionTienda) {
        let transcurrido = (ahora - tiempoInicioPermanenciaTienda) / 3000
        uiPanel(24, 76, 112, 26, 5)
        screen.drawTransparentImage(imgMoneda, 29, 81)
        screen.print("ABRIENDO TIENDA", 41, 82, 1, image.font5)
        dibujarBarra(32, 92, 96, 5, transcurrido, 5)
    }

    // Banner de oleada
    if (ahora < bannerHasta) {
        let ancho = Math.max(100, anchoTexto(bannerL1, image.font8) + 16)
        let bx = Math.floor((160 - ancho) / 2)
        uiPanel(bx, 38, ancho, 28, bannerCol)
        screen.drawRect(bx + 2, 40, ancho - 4, 24, 8)
        screen.fillRect(bx - 3, 49, 4, 6, bannerCol)
        screen.fillRect(bx + ancho - 1, 49, 4, 6, bannerCol)
        uiCentro(bannerL1, 44, bannerCol, image.font8, 15)
        uiCentro(bannerL2, 56, 1, image.font5, -1)
    }

    // Aviso (personaje desbloqueado, enemigo nuevo...)
    if (ahora < toastHasta) {
        let anchoT = Math.max(100, anchoTexto(toastL1, image.font5) + 14)
        let tx = Math.floor((160 - anchoT) / 2)
        uiPanel(tx, 70, anchoT, 22, toastCol)
        screen.fillRect(tx + 3, 73, 2, 16, toastCol)
        screen.fillRect(tx + anchoT - 5, 73, 2, 16, toastCol)
        uiCentro(toastL1, 73, toastCol, image.font5, -1)
        uiCentro(toastL2, 82, 1, image.font5, -1)
    }
}

// =========================================================
// CARTAS DE MEJORA
// =========================================================

function gemasRareza(col: number): number {
    if (col == 10) return 5
    if (col == 9) return 4
    if (col == 2) return 3
    if (col == 5) return 2
    return 1
}

function dibujarSubirNivel(t: number) {
    screen.fillRect(0, 0, 160, 120, 15)
    uiRayos(80, 64, t, 12, 14)
    screen.drawRect(1, 1, 158, 118, 8)
    screen.drawRect(0, 0, 160, 120, 5)

    // Cabecera
    screen.fillRect(30, 3, 100, 22, 15)
    screen.drawLine(30, 24, 129, 24, 8)
    if (modoReliquia) {
        textoGrande("RELIQUIA!", 5, 10, 2)
        uiCentro("PREMIO DE JEFE", 18, 13, image.font5, -1)
    } else {
        textoGrande("NIVEL " + nivelJugador, 5, 5, 2)
        uiCentro("ELIGE UNA MEJORA", 18, 13, image.font5, -1)
    }
    screen.drawLine(6, 21, 30, 21, 8)
    screen.drawLine(130, 21, 154, 21, 8)

    for (let i = 0; i < opcionesCartasPresentadas.length; i++) {
        let sel = i == indiceCartaSeleccionada
        let posX = 3 + (i * 52)
        let posY = sel ? 28 : 34
        let carta = opcionesCartasPresentadas[i]
        let col = carta.rarezaColor
        let alto = sel ? 70 : 62

        screen.fillRect(posX, posY, 50, alto, sel ? 8 : 12)
        screen.fillRect(posX + 1, posY + 12, 48, alto - 13, 15)
        screen.fillRect(posX, posY, 50, 12, col)
        screen.fillRect(posX, posY, 50, 1, 1)
        screen.drawRect(posX, posY, 50, alto, sel ? ((Math.floor(t) % 2 == 0) ? 1 : col) : col)
        if (sel) {
            screen.drawRect(posX - 1, posY - 1, 52, alto + 2, col)
            for (let k = 0; k < 4; k++) screen.fillRect(posX + 21 + k, posY - 5 + k, 8 - 2 * k, 1, col)
        }

        screen.print(carta.titulo, posX + 3, posY + 4, 15, image.font5)
        dibujarLineas(carta.descripcion, posX + 3, posY + 17, sel ? 1 : 11, 9)

        // Rareza: gemas + nombre
        let g = gemasRareza(col)
        for (let k = 0; k < g; k++) {
            let gx = posX + 4 + k * 7
            let gy = posY + alto - 20
            screen.fillRect(gx + 1, gy, 3, 1, col)
            screen.fillRect(gx, gy + 1, 5, 3, col)
            screen.fillRect(gx + 1, gy + 4, 3, 1, col)
            screen.setPixel(gx + 1, gy + 1, 1)
        }
        screen.print(nombreRareza(col), posX + 3, posY + alto - 10, col, image.font5)
    }

    uiAyuda("ELEGIR", "OK", "")

    if (estadoActual == EstadoJuego.ConfirmandoMejora && cartaPendienteConfirmacion) {
        uiOscurecer()
        let cc = cartaPendienteConfirmacion.rarezaColor
        uiPanel(14, 18, 132, 84, cc)
        screen.drawRect(16, 20, 128, 80, 8)
        screen.fillRect(17, 21, 126, 11, cc)
        uiCentro("CONFIRMAR", 23, 15, image.font5, -1)
        uiCentro(cartaPendienteConfirmacion.titulo, 36, cc, image.font8, 15)
        uiCentro(nombreRareza(cc), 47, cc, image.font5, -1)
        dibujarLineasCentradas(cartaPendienteConfirmacion.descripcion, 57, 1, 9)
        uiTecla(36, 88, "A", 7)
        screen.print("SI", 46, 89, 1, image.font5)
        uiTecla(78, 88, "B", 2)
        screen.print("VOLVER", 88, 89, 1, image.font5)
    }
}

// =========================================================
// TIENDA (interfaz)
// =========================================================

const TIENDA_NOMBRES: string[] = ["CURA +30", "ESCUDO +50", "VENDA", "2 BOMBAS", "POLVORA x3", "HIERRO x2", "FIBRA x3", "SALIR"]
const TIENDA_PRECIO: number[] = [15, 25, 30, 35, 25, 35, 15, 0]
const TIENDA_DESC: string[] = [
    "CURA 30 PUNTOS DE VIDA",
    "+50 PUNTOS DE ESCUDO",
    "UNA VENDA (CURA 40)",
    "2 BOMBAS PARA EL BOTON B",
    "3 POLVORA PARA CRAFTEAR",
    "2 HIERRO PARA CRAFTEAR",
    "3 FIBRA PARA CRAFTEAR",
    "VOLVER A LA ACCION"
]

function precioTienda(i: number): number {
    return TIENDA_PRECIO[i] + comprasTienda[i] * Math.ceil(TIENDA_PRECIO[i] * 0.35)
}

function textoActualTienda(i: number): string {
    if (i == 0) return "VIDA " + Math.ceil(vidaActual) + "/" + vidaMaxima
    if (i == 1) return "ESCUDO " + puntosEscudoActivo
    if (i == 2) return "VENDAS " + vendas + "/9"
    if (i == 3) return "BOMBAS " + bombas + "/30"
    if (i == 4) return "POLVORA " + mats[4]
    if (i == 5) return "HIERRO " + mats[3]
    if (i == 6) return "FIBRA " + mats[2]
    return ""
}

function articuloAgotado(i: number): boolean {
    if (i == 2) return vendas >= 9
    if (i == 3) return bombas >= 30
    if (i == 4) return mats[4] >= 99
    if (i == 5) return mats[3] >= 99
    if (i == 6) return mats[2] >= 99
    return false
}

function dibujarTienda(t: number) {
    let ahora = game.runtime()
    screen.fillRect(0, 0, 160, 120, 15)
    uiRayos(134, 42, t, 12, 8)

    uiCabecera("MERCADER", 5, "")
    uiMonedero(108, 3, cantidadMonedas)

    // Lista de articulos
    uiPanel(2, 18, 104, 85, 8)
    for (let j = 0; j < TIENDA_NOMBRES.length; j++) {
        let y = 21 + j * 10
        let sel = j == opcionTiendaSel
        let agotado = articuloAgotado(j)
        let precio = precioTienda(j)
        let puede = j == 7 || (!agotado && cantidadMonedas >= precio)
        if (sel) {
            screen.fillRect(4, y - 1, 100, 10, 8)
            screen.drawRect(4, y - 1, 100, 10, (Math.floor(t) % 2 == 0) ? 5 : 4)
        }
        screen.drawTransparentImage(ICONOS_TIENDA[j], 6, y)
        screen.print(TIENDA_NOMBRES[j], 17, y + 2, puede ? 1 : 11, image.font5)
        if (j != 7) {
            let txtPrecio = agotado ? "MAX" : "$" + precio
            screen.print(txtPrecio, 101 - txtPrecio.length * 6, y + 2, agotado ? 13 : (puede ? 7 : 2), image.font5)
        }
    }

    // Retrato del mercader
    uiPanel(110, 18, 48, 48, 5)
    screen.fillCircle(134, 43, 19, 15)
    screen.drawCircle(134, 43, 19, 8)
    screen.drawTransparentImage(imgMercader.doubled(), 118, 27 + Math.floor(Math.sin(t) * 2))
    uiTecla(111, 70, "A", 7)
    screen.print("COMPRA", 121, 71, 13, image.font5)
    uiTecla(111, 80, "B", 2)
    screen.print("SALIR", 121, 81, 13, image.font5)
    uiChip(111, 91, "LV " + nivelJugador, 12, 9)

    // Panel inferior: descripcion / mensaje
    uiPanel(0, 104, 160, 16, 5)
    if (ahora < mensajeTiendaHasta) {
        uiCentro(mensajeTienda, 108, mensajeTiendaColor, image.font8, 15)
    } else {
        screen.print(TIENDA_DESC[opcionTiendaSel], 4, 107, 1, image.font5)
        if (opcionTiendaSel != 7) screen.print("ACTUAL: " + textoActualTienda(opcionTiendaSel), 4, 113, 9, image.font5)
    }
}

// =========================================================
// PANTALLA DE GAME OVER
// =========================================================

// Numeros grandes en poco espacio: 12345 -> 12345, 123456 -> 123K, 1234567 -> 1.2M
function fmtNum(n: number): string {
    if (n < 100000) return "" + n
    if (n < 1000000) return Math.floor(n / 1000) + "K"
    return Math.floor(n / 1000000) + "." + Math.floor((n % 1000000) / 100000) + "M"
}

// Rango de la partida segun puntos (S mejor, D peor)
function rangoPartida(): number {
    let p = puntosPuntuacion
    if (p >= 4000) return 0
    if (p >= 2000) return 1
    if (p >= 1000) return 2
    if (p >= 400) return 3
    return 4
}

// Tarjeta de estadistica: etiqueta arriba, valor abajo, ambos centrados (nunca se pisan)
function tarjetaStat(i: number, etiqueta: string, valor: string, col: number, listo: boolean) {
    let cx = 7 + (i % 3) * 49
    let cy = 29 + Math.floor(i / 3) * 16
    screen.fillRect(cx, cy, 48, 15, 15)
    screen.drawRect(cx, cy, 48, 15, listo ? 8 : 12)
    screen.print(etiqueta, cx + 24 - Math.floor(etiqueta.length * 3), cy + 2, listo ? 13 : 8, image.font5)
    if (listo) screen.print(valor, cx + 24 - Math.floor(valor.length * 3), cy + 9, col, image.font5)
}

function dibujarGameOver(t: number) {
    let ahora = game.runtime()
    let transcurrido = ahora - tiempoMuerteMs

    // Fundido a negro (lineas alternas)
    if (transcurrido < 800) {
        for (let y = 0; y < 120; y += 2) screen.drawLine(0, y, 159, y, 15)
        return
    }
    screen.fillRect(0, 0, 160, 120, 15)
    uiRayos(80, 30, t, 12, 10)
    uiPanel(4, 3, 152, 105, 2)
    screen.drawRect(6, 5, 148, 101, 8)
    // gotas de sangre
    for (let k = 0; k < 7; k++) {
        screen.fillRect(14 + k * 22, 4, 3, 3 + (k * 5) % 6, 2)
    }

    let sacudida = (Math.floor(t) % 4 == 0) ? 1 : 0
    textoGrande("HAS CAIDO", 8 + sacudida, 2, 4)
    if (ultimoAtacante != "") {
        let ta = "TE ELIMINO: " + ultimoAtacante
        if (ta.length > 24) ta = ta.substr(0, 24)
        uiCentro(ta, 24, 3, image.font5, -1)
    }

    // Estadisticas: cada tarjeta se revela y cuenta hacia arriba
    let reales = [puntosPuntuacion, oleadaActual, nivelJugador, killsPartida, monedasPartida, tiempoPartidaMs, comboMax, elitesMatadas, jefesPartida]
    let etiquetas = ["PUNTOS", "OLEADA", "NIVEL", "BAJAS", "ORO", "TIEMPO", "COMBO", "ELITES", "JEFES"]
    let colores = [5, 5, 9, 2, 5, 1, 4, 10, 3]
    for (let i = 0; i < 9; i++) {
        let ini = 800 + i * 110
        let q = Math.max(0, Math.min(1, (transcurrido - ini) / 800))
        if (q > 0 && (goTick & (1 << i)) == 0) {
            goTick |= (1 << i)
            music.setVolume(Math.map(volumenAudio, 0, 100, 0, 90))
            music.playTone(440 + i * 60, 25)
        }
        let v = Math.floor(reales[i] * q)
        let txt = "" + v
        if (i == 0) txt = fmtNum(v)
        else if (i == 5) txt = formatoTiempo(reales[i] * q)
        else if (i == 6) txt = "x" + v
        tarjetaStat(i, etiquetas[i], txt, colores[i], q > 0)
    }

    // Insignias de la cabecera: dificultad (izquierda) y rango (derecha), siempre dentro del panel
    screen.fillCircle(20, 14, 8, 15)
    screen.fillCircle(20, 14, 6, COL_DIF[nivelDificultad])
    screen.drawCircle(20, 14, 8, 8)
    screen.print("" + (nivelDificultad + 1), 17, 12, 15, image.font5)
    if (transcurrido > 2600) {
        let r = rangoPartida()
        let c = RANGO_COL[r]
        let destello = transcurrido < 2900
        screen.fillCircle(140, 14, 8, 15)
        screen.drawCircle(140, 14, 8, destello ? 1 : c)
        screen.drawCircle(140, 14, 7, c)
        screen.print(RANGO_LETRA[r], 137, 11, 15, image.font8)
        screen.print(RANGO_LETRA[r], 136, 10, c, image.font8)
    }

    if (transcurrido > 2000) {
        if (nuevoRecord) {
            let c = (Math.floor(t) % 2 == 0) ? 5 : 4
            screen.fillRect(30, 77, 100, 10, 15)
            screen.drawRect(30, 77, 100, 10, c)
            uiCentro("NUEVO RECORD! " + fmtNum(puntosPuntuacion), 80, c, image.font5, -1)
            screen.fillRect(24, 80, 3, 3, c)
            screen.fillRect(133, 80, 3, 3, c)
        } else {
            uiCentro("RECORD: " + fmtNum(obtenerRecordDificultad(nivelDificultad)) + "  " + NOMBRES_DIFICULTAD[nivelDificultad], 80, 3, image.font5, -1)
        }
        if (nuevosDesbloqueos.length > 0) {
            let txt = "NUEVO: " + NOMBRES_SKINS[nuevosDesbloqueos[0]]
            if (nuevosDesbloqueos.length > 1) txt += " +" + (nuevosDesbloqueos.length - 1)
            uiCentro(txt, 88, (Math.floor(t) % 2 == 0) ? 9 : 1, image.font5, -1)
        } else if (santHechos > 0) {
            uiCentro("SANTUARIOS: " + santHechos, 88, 9, image.font5, -1)
        }
    }

    // Botones
    uiBoton(10, 95, 68, 11, "MENU", opcionGameOverSel == 0, t, false)
    uiBoton(82, 95, 68, 11, "REINTENTAR", opcionGameOverSel == 1, t, false)
    uiAyuda("ELEGIR", "OK", "")
}

// =========================================================
// GUARDADO: en el juego, o como CODIGO para un archivo (GitHub)
// =========================================================

const B36: string = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
let guardadoSel: number = 0
let guardadoVista: number = 0
let guardadoMsg: string = ""
let guardadoMsgCol: number = 7
let guardadoMsgHasta: number = 0
let codigoExportado: string = ""

function aB36(n: number): string {
    n = Math.max(0, Math.floor(n))
    if (n == 0) return "0"
    let r = ""
    while (n > 0) {
        r = B36.charAt(n % 36) + r
        n = Math.floor(n / 36)
    }
    return r
}

function deB36(t: string): number {
    if (t.length == 0) return -1
    let n = 0
    for (let i = 0; i < t.length; i++) {
        let d = B36.indexOf(t.charAt(i))
        if (d < 0) return -1
        n = n * 36 + d
    }
    return n
}

// Codigo: KH1.<17 valores en base 36>.<suma de control>
function crearCodigoGuardado(): string {
    let mask = 0
    for (let i = 1; i < NOMBRES_SKINS.length; i++) {
        if (desbloqueado[i]) mask += (1 << i)
    }
    let v = [statKills, statMonedas, statJefes, statMaxOleada, statMaxNivel, statMaxPts, statNoche, statPartidas,
        mask, skinSeleccionada, volumenAudio, nivelDificultad, calidadModo, disparoAuto ? 1 : 0,
        obtenerRecordDificultad(0), obtenerRecordDificultad(1), obtenerRecordDificultad(2)]
    let txt = "KH1"
    let suma = 0
    for (let k = 0; k < v.length; k++) {
        txt += "." + aB36(v[k])
        suma += Math.floor(v[k])
    }
    return txt + "." + aB36(suma % 46656)
}

// Devuelve: 0 = cargado, 1 = vacio, 2 = invalido, 3 = no es mas reciente (solo con soloSiMasNuevo)
function importarCodigo(cod: string, soloSiMasNuevo: boolean): number {
    if (cod == "") return 1
    let p = cod.split(".")
    if (p.length != 19 || p[0] != "KH1") return 2
    let v: number[] = []
    let suma = 0
    for (let i = 1; i < 18; i++) {
        let n = deB36(p[i])
        if (n < 0) return 2
        v.push(n)
        suma += n
    }
    if (deB36(p[18]) != suma % 46656) return 2
    if (soloSiMasNuevo && v[7] <= statPartidas) return 3
    statKills = v[0]
    statMonedas = v[1]
    statJefes = v[2]
    statMaxOleada = v[3]
    statMaxNivel = v[4]
    statMaxPts = v[5]
    statNoche = v[6]
    statPartidas = v[7]
    for (let i = 1; i < NOMBRES_SKINS.length; i++) {
        desbloqueado[i] = (v[8] & (1 << i)) != 0
        if (desbloqueado[i]) settings.writeNumber("UNL_" + i, 1)
    }
    if (v[9] >= 0 && v[9] < NOMBRES_SKINS.length && desbloqueado[v[9]]) skinSeleccionada = v[9]
    skinCursor = skinSeleccionada
    volumenAudio = Math.min(100, v[10])
    nivelDificultad = Math.min(NOMBRES_DIFICULTAD.length - 1, v[11])
    calidadModo = Math.min(NOMBRES_CALIDAD.length - 1, v[12])
    disparoAuto = v[13] == 1
    for (let d = 0; d < 3; d++) {
        if (v[14 + d] > obtenerRecordDificultad(d)) settings.writeNumber("HIGH_SCORE_DIF_" + d, v[14 + d])
    }
    guardarProgreso()
    guardarAjustes()
    settings.writeNumber("SKIN_SEL", skinSeleccionada)
    if (statPartidas > 0) settings.writeNumber("TUTO_VISTO", 1)
    return 0
}

function avisoGuardado(txt: string, col: number) {
    guardadoMsg = txt
    guardadoMsgCol = col
    guardadoMsgHasta = game.runtime() + 2600
}

function abrirGuardado() {
    guardadoSel = 0
    guardadoVista = 0
    guardadoMsgHasta = 0
    estadoActual = EstadoJuego.GuardadoMenu
}

function moverGuardado(d: number) {
    if (guardadoVista != 0) return
    guardadoSel = (guardadoSel + d + 3) % 3
    sonarNavegacion()
}

function salirGuardado() {
    if (guardadoVista != 0) {
        guardadoVista = 0
        sonarCancelar()
        return
    }
    estadoActual = EstadoJuego.MenuPrincipal
    menuT0 = game.runtime()
    sonarCancelar()
}

function accionGuardado() {
    if (guardadoVista != 0) {
        guardadoVista = 0
        sonarCancelar()
        return
    }
    sonarConfirmar()
    if (guardadoSel == 0) {
        codigoExportado = crearCodigoGuardado()
        console.log("KABOOM_HORDA_GUARDADO=" + codigoExportado)
        guardadoVista = 1
    } else if (guardadoSel == 1) {
        let r = importarCodigo(CODIGO_GUARDADO_ARCHIVO, false)
        if (r == 0) avisoGuardado("ARCHIVO CARGADO!", 7)
        else if (r == 1) avisoGuardado("EL ARCHIVO ESTA VACIO", 2)
        else avisoGuardado("CODIGO NO VALIDO", 2)
    } else {
        salirGuardado()
    }
}

function dibujarGuardado(t: number) {
    screen.fillRect(0, 0, 160, 120, 15)
    uiRayos(80, 40, t, 12, 8)
    if (guardadoVista != 0) {
        uiCabecera("ARCHIVO", 5, "")
        uiPanel(4, 18, 152, 50, 5)
        for (let k = 0; k < 5; k++) {
            let linea = codigoExportado.substr(k * 24, 24)
            if (linea.length > 0) screen.print(linea, 8, 22 + k * 9, 9, image.font5)
        }
        dibujarLineasCentradas("PEGALO EN LA HERRAMIENTA\nGUARDADO.HTML Y BAJA EL\nARCHIVO PARA GITHUB", 74, 1, 9)
        uiAyuda("", "OK", "ATRAS")
        return
    }
    uiCabecera("GUARDADO", 7, "")
    let nombres = ["EXPORTAR ARCHIVO", "CARGAR ARCHIVO", "VOLVER"]
    for (let i = 0; i < 3; i++) {
        uiBoton(10, 24 + i * 19, 140, 14, nombres[i], i == guardadoSel, t, false)
    }
    uiPanel(6, 85, 148, 22, 8)
    if (game.runtime() < guardadoMsgHasta) {
        uiCentro(guardadoMsg, 92, guardadoMsgCol, image.font5, -1)
    } else {
        let d = ["CREA UN CODIGO PARA\nTU ARCHIVO (GITHUB)", "CARGA EL CODIGO DEL\nARCHIVO DEL PROYECTO", "VOLVER AL MENU\n"]
        dibujarLineasCentradas(d[guardadoSel], 89, 9, 9)
    }
    uiAyuda("ELEGIR", "OK", "ATRAS")
}

// =========================================================
// TUTORIAL (se muestra solo la primera vez y desde el menu)
// =========================================================

let tutoPag: number = 0
let tutoPrimera: boolean = false
const TUTO_TOTAL: number = 8
const TUTO_TITULO: string[] = ["BIENVENIDO", "MOVERTE", "DISPARAR", "BOMBAS Y DASH", "SUBE DE NIVEL", "CASAS Y TIENDA", "EVENTOS", "LISTO!"]
const TUTO_TXT: string[] = [
    "SOBREVIVE A LAS\nOLEADAS DE ENEMIGOS\nY CONSIGUE PUNTOS",
    "USA LA CRUZ PARA\nMOVERTE. EN EL MOVIL\nES LA CRUZ TACTIL",
    "MANTEN A PARA DISPARAR\nO ACTIVA DISPARO AUTO\nEN OPCIONES",
    "B LANZA BOMBAS O\nHACE DASH. LAS BOMBAS\nLIMPIAN GRUPOS",
    "RECOGE GEMAS AZULES\nPARA SUBIR DE NIVEL\nY ELEGIR MEJORAS",
    "A JUNTO A UN VECINO\nENTRA EN SU CASA.\nCIRCULO DORADO: TIENDA",
    "EVITA METEORITOS Y\nMINAS. EN EL SANTUARIO\nQUEDATE DENTRO",
    "GUARDA TU PROGRESO\nEN EL MENU. LA HORDA\nTE ESPERA!"
]

function abrirTutorial(primera: boolean) {
    tutoPag = 0
    tutoPrimera = primera
    estadoActual = EstadoJuego.Tutorial
}

function cambiarPagTuto(d: number) {
    let n = tutoPag + d
    if (n < 0 || n >= TUTO_TOTAL) return
    tutoPag = n
    sonarNavegacion()
}

function salirTutorial() {
    settings.writeNumber("TUTO_VISTO", 1)
    estadoActual = EstadoJuego.MenuPrincipal
    if (tutoPrimera) opcionMenuSel = 0
    tutoPrimera = false
    menuT0 = game.runtime()
    sonarCancelar()
}

function avanzarTutorial() {
    if (tutoPag >= TUTO_TOTAL - 1) {
        salirTutorial()
    } else {
        cambiarPagTuto(1)
    }
}

function tutoPersona(x: number, y: number, col: number) {
    screen.fillRect(x - 3, y - 9, 7, 6, 13)
    screen.fillRect(x - 3, y - 10, 7, 2, col)
    screen.setPixel(x - 1, y - 7, 15)
    screen.setPixel(x + 1, y - 7, 15)
    screen.fillRect(x - 3, y - 3, 7, 6, col)
    screen.fillRect(x - 3, y + 3, 3, 3, 15)
    screen.fillRect(x + 1, y + 3, 3, 3, 15)
}

function tutoBicho(x: number, y: number) {
    screen.fillRect(x - 4, y - 4, 9, 7, 3)
    screen.fillRect(x - 4, y + 1, 9, 2, 10)
    screen.setPixel(x - 2, y - 2, 1)
    screen.setPixel(x + 2, y - 2, 1)
    screen.drawRect(x - 5, y - 5, 11, 9, 15)
}

function dibujarTutorial(t: number) {
    screen.fillRect(0, 0, 160, 120, 15)
    uiRayos(80, 40, t, 12, 8)
    uiCabecera("TUTORIAL", 9, (tutoPag + 1) + "/" + TUTO_TOTAL)
    uiPanel(4, 18, 152, 44, 8)
    let col = colorSkinUI(skinSeleccionada)
    let tt = game.runtime() / 1000
    let ph = (tt % 2) / 2
    if (tutoPag == 0) {
        for (let k = 0; k < 4; k++) {
            let ang = k * 1.57 + 0.7
            let r = 58 - 46 * ph
            let bx = Math.max(12, Math.min(148, 80 + Math.cos(ang) * r * 1.2))
            let by = 40 + Math.sin(ang) * r * 0.42
            tutoBicho(Math.round(bx), Math.round(by))
        }
        tutoPersona(80, 44, col)
        screen.print("OLEADA 1", 9, 22, 5, image.font5)
    } else if (tutoPag == 1) {
        screen.fillRect(41, 28, 8, 24, 12)
        screen.fillRect(33, 36, 24, 8, 12)
        screen.drawRect(41, 28, 8, 24, 8)
        screen.drawRect(33, 36, 24, 8, 8)
        screen.fillRect(42, 37, 6, 6, 12)
        let dir = Math.floor(tt * 1.2) % 4
        let dx = [0, 1, 0, -1][dir]
        let dy = [-1, 0, 1, 0][dir]
        screen.fillRect(dir == 0 ? 42 : (dir == 2 ? 42 : (dir == 1 ? 50 : 34)), dir == 0 ? 29 : (dir == 2 ? 45 : 37), dir % 2 == 0 ? 6 : 6, 6, 5)
        let p2 = (tt * 1.2) % 1
        tutoPersona(Math.round(110 + dx * (p2 * 22 - 11)), Math.round(44 + dy * (p2 * 10 - 5)), col)
    } else if (tutoPag == 2) {
        screen.fillCircle(34, 40, ph < 0.5 ? 12 : 11, 7)
        screen.drawCircle(34, 40, 11, 15)
        screen.print("A", 30, 36, 15, image.font8)
        tutoPersona(76, 46, col)
        for (let k = 0; k < 3; k++) {
            let bx = 84 + ((ph * 120 + k * 24) % 60)
            screen.fillRect(Math.round(bx), 41, 4, 2, 5)
        }
        if (Math.floor(tt * 3) % 4 != 0) tutoBicho(142, 42)
    } else if (tutoPag == 3) {
        screen.fillCircle(30, 40, 11, 2)
        screen.drawCircle(30, 40, 11, 15)
        screen.print("B", 26, 36, 15, image.font8)
        tutoPersona(62, 48, col)
        let q = Math.min(1, ph * 1.6)
        let bx = 64 + q * 54
        let by = 44 - Math.sin(q * 3.14) * 18
        if (ph < 0.625) {
            screen.fillCircle(Math.round(bx), Math.round(by), 3, 15)
            screen.fillCircle(Math.round(bx) - 1, Math.round(by) - 1, 1, 12)
            tutoBicho(108, 38)
            tutoBicho(128, 46)
            tutoBicho(118, 32)
        } else {
            let r = Math.floor((ph - 0.625) / 0.375 * 26)
            screen.drawCircle(118, 40, r, 5)
            screen.drawCircle(118, 40, Math.floor(r * 0.6), 4)
            screen.fillCircle(118, 40, Math.max(0, 6 - Math.floor(r / 4)), 1)
        }
    } else if (tutoPag == 4) {
        let ptx = 80
        let pty = 40
        for (let k = 0; k < 4; k++) {
            let sx = 80 + Math.cos(k * 1.57 + 0.5) * 50
            let sy = 40 + Math.sin(k * 1.57 + 0.5) * 16
            let f = Math.min(1, ph * 1.3)
            let gx = Math.round(sx + (ptx - sx) * f)
            let gy = Math.round(sy + (pty - sy) * f)
            if (f < 1) {
                screen.fillRect(gx - 1, gy - 2, 3, 5, 9)
                screen.fillRect(gx - 2, gy - 1, 5, 3, 9)
            }
        }
        tutoPersona(80, 46, col)
        dibujarBarra(28, 53, 104, 6, ph, 9)
        if (ph > 0.8 && Math.floor(tt * 6) % 2 == 0) screen.printCenter("NIVEL +1!", 22, 5, image.font5)
    } else if (tutoPag == 5) {
        screen.fillRect(26, 28, 36, 8, 2)
        screen.fillRect(28, 36, 32, 22, 1)
        screen.fillRect(40, 44, 8, 14, 14)
        screen.fillRect(31, 40, 6, 6, 9)
        screen.fillRect(51, 40, 6, 6, 9)
        screen.drawRect(26, 28, 36, 8, 15)
        let pul = Math.floor(Math.abs(Math.sin(tt * 3)) * 2)
        screen.fillRect(106, 30, 20, 20, 15)
        screen.fillRect(107, 31, 18, 18, 5)
        screen.fillRect(109, 33, 14, 14, 15)
        screen.fillCircle(116, 40, 4 + pul, 5)
        tutoPersona(Math.round(84 + Math.sin(tt * 2) * 10), 52, col)
    } else if (tutoPag == 6) {
        screen.drawCircle(45, 42, 16, ph > 0.7 ? 2 : 4)
        screen.drawCircle(45, 42, Math.max(1, Math.floor(16 * ph)), 5)
        screen.fillCircle(45, Math.round(42 - (1 - ph) * 36), 3, 4)
        screen.fillCircle(45, Math.round(42 - (1 - ph) * 36), 1, 5)
        for (let k = 0; k < 14; k++) {
            let a = k / 14 * 6.2832
            screen.fillRect(Math.round(115 + Math.cos(a) * 15) - 1, Math.round(40 + Math.sin(a) * 15) - 1, 2, 2, k / 14 < ph ? 5 : 9)
        }
        screen.drawLine(115, 33, 119, 40, 9)
        screen.drawLine(119, 40, 115, 47, 9)
        screen.drawLine(115, 47, 111, 40, 9)
        screen.drawLine(111, 40, 115, 33, 9)
    } else {
        screen.drawTransparentImage(imgBombaLogo, 72, 24)
        uiCentro("KABOOM HORDA V1.0", 48, 5, image.font5, 15)
        uiBrillos(t)
    }
    uiCentro(TUTO_TITULO[tutoPag], 65, 5, image.font8, 15)
    dibujarLineasCentradas(TUTO_TXT[tutoPag], 77, 1, 8)
    for (let i = 0; i < TUTO_TOTAL; i++) {
        screen.fillRect(48 + i * 8, 102, 5, 3, i == tutoPag ? 5 : 8)
    }
    uiAyuda("PAG", tutoPag == TUTO_TOTAL - 1 ? "LISTO" : "SIG", "SALIR")
}

// =========================================================
// RENDER GENERAL
// =========================================================

game.onShade(function () {
    let t = game.runtime() / 150

    if (estadoActual == EstadoJuego.MenuPrincipal) {
        dibujarMenuPrincipal(t)
    } else if (estadoActual == EstadoJuego.Tutorial) {
        dibujarTutorial(t)
    } else if (estadoActual == EstadoJuego.GuardadoMenu) {
        dibujarGuardado(t)
    } else if (estadoActual == EstadoJuego.TablaRecords) {
        dibujarRecords(t)
    } else if (estadoActual == EstadoJuego.SeleccionSkin) {
        dibujarSkins(t)
    } else if (estadoActual == EstadoJuego.MisionesMenu) {
        dibujarMisiones(t)
    } else if (estadoActual == EstadoJuego.OpcionesMenu) {
        dibujarOpciones(t)
    } else if (estadoActual == EstadoJuego.CreditosMenu) {
        dibujarCreditos(t)
    } else if (estadoActual == EstadoJuego.Jugando) {
        dibujarJuego(t)
    } else if (estadoActual == EstadoJuego.MenuSubirNivel || estadoActual == EstadoJuego.ConfirmandoMejora) {
        dibujarSubirNivel(t)
    } else if (estadoActual == EstadoJuego.TiendaInteractiva) {
        dibujarTienda(t)
    } else if (estadoActual == EstadoJuego.Inventario) {
        dibujarInventario(t)
    } else if (estadoActual == EstadoJuego.DentroCasa) {
        dibujarCasa(t)
    } else if (estadoActual == EstadoJuego.Crafteo) {
        dibujarCrafteo(t)
    } else if (estadoActual == EstadoJuego.GameOver) {
        dibujarJuego(t)
        dibujarGameOver(t)
    }

    // Transicion entre pantallas (persiana rapida)
    let ahoraT = game.runtime()
    if (estadoActual != uiEstadoPrev) {
        uiEstadoPrev = estadoActual
        uiTransIni = ahoraT
    }
    let eT = ahoraT - uiTransIni
    if (eT < 240) {
        let wT = Math.floor(160 * (1 - eT / 240))
        for (let yT = 0; yT < 120; yT += 2) {
            screen.drawLine(0, yT, wT, yT, 15)
            screen.drawLine(159 - wT, yT + 1, 159, yT + 1, 15)
        }
    }
})

// =========================================================
// ENTRADAS DE CONTROL
// =========================================================

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    interactuarBotonA()
})

function interactuarBotonA() {
    if (estadoActual == EstadoJuego.MenuPrincipal) {
        sonarConfirmar()
        if (opcionMenuSel == 0) {
            iniciarPartida()
        } else if (opcionMenuSel == 1) {
            skinCursor = skinSeleccionada
            estadoActual = EstadoJuego.SeleccionSkin
        } else if (opcionMenuSel == 2) {
            estadoActual = EstadoJuego.MisionesMenu
        } else if (opcionMenuSel == 3) {
            estadoActual = EstadoJuego.TablaRecords
        } else if (opcionMenuSel == 4) {
            estadoActual = EstadoJuego.OpcionesMenu
        } else if (opcionMenuSel == 5) {
            abrirTutorial(false)
        } else if (opcionMenuSel == 6) {
            abrirGuardado()
        } else if (opcionMenuSel == 7) {
            estadoActual = EstadoJuego.CreditosMenu
        }

    } else if (estadoActual == EstadoJuego.GuardadoMenu) {
        accionGuardado()

    } else if (estadoActual == EstadoJuego.Tutorial) {
        avanzarTutorial()

    } else if (estadoActual == EstadoJuego.SeleccionSkin) {
        if (personajeDesbloqueado(skinCursor)) {
            skinSeleccionada = skinCursor
            settings.writeNumber("SKIN_SEL", skinSeleccionada)
            sonarConfirmar()
            estadoActual = EstadoJuego.MenuPrincipal
        } else {
            sonarCancelar()
        }

    } else if (estadoActual == EstadoJuego.CreditosMenu || estadoActual == EstadoJuego.TablaRecords || estadoActual == EstadoJuego.MisionesMenu) {
        sonarCancelar()
        estadoActual = EstadoJuego.MenuPrincipal

    } else if (estadoActual == EstadoJuego.OpcionesMenu) {
        if (opcionOpcionesSel == 2) {
            calidadModo = (calidadModo + 1) % NOMBRES_CALIDAD.length
        } else if (opcionOpcionesSel == 3) {
            disparoAuto = !disparoAuto
        } else if (opcionOpcionesSel == 4) {
            guardarAjustes()
            sonarCancelar()
            estadoActual = EstadoJuego.MenuPrincipal
        }

    } else if (estadoActual == EstadoJuego.Jugando) {
        if (npcCerca) entrarCasa(npcCerca)
        else ejecutarDisparoManual()

    } else if (estadoActual == EstadoJuego.MenuSubirNivel) {
        cartaPendienteConfirmacion = opcionesCartasPresentadas[indiceCartaSeleccionada]
        estadoActual = EstadoJuego.ConfirmandoMejora
        sonarConfirmar()

    } else if (estadoActual == EstadoJuego.ConfirmandoMejora) {
        aplicarMejoraProcedural(cartaPendienteConfirmacion)
        reanudarJuego()
        sonarConfirmar()

    } else if (estadoActual == EstadoJuego.TiendaInteractiva) {
        comprarArticuloTienda()

    } else if (estadoActual == EstadoJuego.Inventario) {
        usarFilaInventario()

    } else if (estadoActual == EstadoJuego.DentroCasa) {
        accionCasa()

    } else if (estadoActual == EstadoJuego.Crafteo) {
        craftear(craftSel)

    } else if (estadoActual == EstadoJuego.GameOver) {
        if (game.runtime() - tiempoMuerteMs < 1000) return
        sonarConfirmar()
        if (opcionGameOverSel == 0) volverAlMenu()
        else iniciarPartida()
    }
}

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (estadoActual == EstadoJuego.Jugando) {
        accionBotonB()
    } else if (estadoActual == EstadoJuego.GuardadoMenu) {
        salirGuardado()
    } else if (estadoActual == EstadoJuego.Tutorial) {
        salirTutorial()
    } else if (estadoActual == EstadoJuego.Inventario) {
        cerrarInventario()
    } else if (estadoActual == EstadoJuego.DentroCasa) {
        salirDeCasa()
    } else if (estadoActual == EstadoJuego.Crafteo) {
        estadoActual = EstadoJuego.DentroCasa
        sonarCancelar()
    } else if (estadoActual == EstadoJuego.ConfirmandoMejora) {
        estadoActual = EstadoJuego.MenuSubirNivel
        cartaPendienteConfirmacion = null
        sonarCancelar()
    } else if (estadoActual == EstadoJuego.TiendaInteractiva) {
        cerrarTienda()
        sonarCancelar()
    } else if (estadoActual == EstadoJuego.TablaRecords || estadoActual == EstadoJuego.SeleccionSkin ||
        estadoActual == EstadoJuego.OpcionesMenu || estadoActual == EstadoJuego.CreditosMenu ||
        estadoActual == EstadoJuego.MisionesMenu) {
        if (estadoActual == EstadoJuego.OpcionesMenu) guardarAjustes()
        estadoActual = EstadoJuego.MenuPrincipal
        sonarCancelar()
    }
})

// El boton MENU abre / cierra el inventario
controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {
    if (estadoActual == EstadoJuego.Jugando) abrirInventario()
    else if (estadoActual == EstadoJuego.Inventario) cerrarInventario()
})

controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    if (estadoActual == EstadoJuego.MenuPrincipal) {
        moverMenu(0, -1)
    } else if (estadoActual == EstadoJuego.GuardadoMenu) {
        moverGuardado(-1)
    } else if (estadoActual == EstadoJuego.OpcionesMenu) {
        opcionOpcionesSel = (opcionOpcionesSel - 1 + OPCIONES_SUBMENU.length) % OPCIONES_SUBMENU.length
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.TiendaInteractiva) {
        opcionTiendaSel = (opcionTiendaSel - 1 + 8) % 8
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.Inventario) {
        invSel = (invSel - 1 + INV_FILAS) % INV_FILAS
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.DentroCasa) {
        casaSel = (casaSel - 1 + casaOpc.length) % casaOpc.length
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.Crafteo) {
        craftSel = (craftSel - 1 + REC_NOMBRE.length) % REC_NOMBRE.length
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.MisionesMenu) {
        misionSel = misionSel - 1
        if (misionSel < 1) misionSel = NOMBRES_SKINS.length - 1
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.GameOver) {
        opcionGameOverSel = (opcionGameOverSel + 1) % 2
        sonarNavegacion()
    }
})

controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    if (estadoActual == EstadoJuego.MenuPrincipal) {
        moverMenu(0, 1)
    } else if (estadoActual == EstadoJuego.GuardadoMenu) {
        moverGuardado(1)
    } else if (estadoActual == EstadoJuego.OpcionesMenu) {
        opcionOpcionesSel = (opcionOpcionesSel + 1) % OPCIONES_SUBMENU.length
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.TiendaInteractiva) {
        opcionTiendaSel = (opcionTiendaSel + 1) % 8
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.Inventario) {
        invSel = (invSel + 1) % INV_FILAS
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.DentroCasa) {
        casaSel = (casaSel + 1) % casaOpc.length
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.Crafteo) {
        craftSel = (craftSel + 1) % REC_NOMBRE.length
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.MisionesMenu) {
        misionSel = misionSel + 1
        if (misionSel > NOMBRES_SKINS.length - 1) misionSel = 1
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.GameOver) {
        opcionGameOverSel = (opcionGameOverSel + 1) % 2
        sonarNavegacion()
    }
})

controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    if (estadoActual == EstadoJuego.MenuPrincipal) {
        moverMenu(-1, 0)
    } else if (estadoActual == EstadoJuego.Tutorial) {
        cambiarPagTuto(-1)
    } else if (estadoActual == EstadoJuego.SeleccionSkin) {
        skinCursor = (skinCursor - 1 + NOMBRES_SKINS.length) % NOMBRES_SKINS.length
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.OpcionesMenu) {
        if (opcionOpcionesSel == 0) {
            volumenAudio = Math.max(0, volumenAudio - 10)
            sonarNavegacion()
        } else if (opcionOpcionesSel == 1) {
            nivelDificultad = (nivelDificultad - 1 + NOMBRES_DIFICULTAD.length) % NOMBRES_DIFICULTAD.length
            sonarNavegacion()
        } else if (opcionOpcionesSel == 2) {
            calidadModo = (calidadModo - 1 + NOMBRES_CALIDAD.length) % NOMBRES_CALIDAD.length
            sonarNavegacion()
        } else if (opcionOpcionesSel == 3) {
            disparoAuto = !disparoAuto
            sonarNavegacion()
        }
    } else if (estadoActual == EstadoJuego.MenuSubirNivel) {
        indiceCartaSeleccionada = (indiceCartaSeleccionada - 1 + opcionesCartasPresentadas.length) % opcionesCartasPresentadas.length
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.GameOver) {
        opcionGameOverSel = (opcionGameOverSel + 1) % 2
        sonarNavegacion()
    }
})

controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    if (estadoActual == EstadoJuego.MenuPrincipal) {
        moverMenu(1, 0)
    } else if (estadoActual == EstadoJuego.Tutorial) {
        cambiarPagTuto(1)
    } else if (estadoActual == EstadoJuego.SeleccionSkin) {
        skinCursor = (skinCursor + 1) % NOMBRES_SKINS.length
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.OpcionesMenu) {
        if (opcionOpcionesSel == 0) {
            volumenAudio = Math.min(100, volumenAudio + 10)
            sonarNavegacion()
        } else if (opcionOpcionesSel == 1) {
            nivelDificultad = (nivelDificultad + 1) % NOMBRES_DIFICULTAD.length
            sonarNavegacion()
        } else if (opcionOpcionesSel == 2) {
            calidadModo = (calidadModo + 1) % NOMBRES_CALIDAD.length
            sonarNavegacion()
        } else if (opcionOpcionesSel == 3) {
            disparoAuto = !disparoAuto
            sonarNavegacion()
        }
    } else if (estadoActual == EstadoJuego.MenuSubirNivel) {
        indiceCartaSeleccionada = (indiceCartaSeleccionada + 1) % opcionesCartasPresentadas.length
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.GameOver) {
        opcionGameOverSel = (opcionGameOverSel + 1) % 2
        sonarNavegacion()
    }
})

// =========================================================
// DASH
// =========================================================

function cdDash(): number {
    return Math.max(1000, 3000 - 450 * (nivelHabilidadDash - 1))
}

function usarDash() {
    if (estadoActual != EstadoJuego.Jugando || nivelHabilidadDash <= 0 || !jugadorSprite) return
    let ahora = game.runtime()
    if (ahora < cooldownDashMs) return
    cooldownDashMs = ahora + cdDash()
    invulnerableHasta = ahora + 450
    sonarConfirmar()

    let dx = jugadorSprite.vx
    let dy = jugadorSprite.vy
    if (dx == 0 && dy == 0) {
        dx = ultimaDirX
        dy = ultimaDirY
    }
    let l = Math.sqrt(dx * dx + dy * dy)
    if (l == 0) {
        dx = 1
        dy = 0
        l = 1
    }
    let dashX0 = jugadorSprite.x
    let dashY0 = jugadorSprite.y
    crearEfectoMuerte(jugadorSprite.x, jugadorSprite.y)
    jugadorSprite.x += dx / l * 48
    jugadorSprite.y += dy / l * 48
    crearEfectoMuerte(jugadorSprite.x, jugadorSprite.y)
    jugadorSprite.sayText("DASH!", 400)
    dashEmbestida(dashX0, dashY0, jugadorSprite.x, jugadorSprite.y)
}

// =========================================================
// TIENDA IN-GAME (logica)
// =========================================================

function cerrarTienda() {
    enZonaActivacionTienda = false
    if (tiendaActivaSprite) {
        tiendaActivaSprite.destroy()
        tiendaActivaSprite = null
    }
    reanudarJuego()
}

function comprarArticuloTienda() {
    let i = opcionTiendaSel
    if (i == 7) {
        cerrarTienda()
        sonarCancelar()
        return
    }
    if (articuloAgotado(i)) {
        sonarCancelar()
        avisoTienda("YA ESTA AL MAXIMO", 4)
        return
    }
    let precio = precioTienda(i)
    if (cantidadMonedas < precio) {
        sonarCancelar()
        avisoTienda("TE FALTAN $" + (precio - cantidadMonedas), 2)
        return
    }
    cantidadMonedas -= precio
    comprasTienda[i] = comprasTienda[i] + 1
    sonarConfirmar()

    if (i == 0) {
        vidaActual = Math.min(vidaMaxima, vidaActual + 30)
        avisoTienda("+30 DE VIDA", 7)
    } else if (i == 1) {
        puntosEscudoActivo += 50
        actualizarGraficoEscudo()
        avisoTienda("+50 ESCUDO", 9)
    } else if (i == 2) {
        vendas += 1
        avisoTienda("+1 VENDA", 7)
    } else if (i == 3) {
        bombas += 2
        avisoTienda("+2 BOMBAS", 7)
    } else if (i == 4) {
        mats[4] = Math.min(99, mats[4] + 3)
        avisoTienda("+3 POLVORA", 5)
    } else if (i == 5) {
        mats[3] = Math.min(99, mats[3] + 2)
        avisoTienda("+2 HIERRO", 5)
    } else if (i == 6) {
        mats[2] = Math.min(99, mats[2] + 3)
        avisoTienda("+3 FIBRA", 5)
    }
}

// =========================================================
// GENERADOR PROCEDURAL DE MEJORAS (30 tipos)
// titulos <= 7 letras y lineas <= 7 letras para que quepan
// =========================================================

function generarMejoraAleatoria(): MejoraProcedural {
    let tipoStat = Math.randomRange(1, 32)
    let rollRareza = Math.randomRange(1, 100)
    let m = 1.0
    let colorRareza = 1

    if (rollRareza > 90) {
        m = 2.5
        colorRareza = 9
    } else if (rollRareza > 70) {
        m = 1.8
        colorRareza = 2
    } else if (rollRareza > 40) {
        m = 1.3
        colorRareza = 5
    }

    let tituloGen = ""
    let descGen = ""
    let potencia = 0

    if (tipoStat == 1) {
        potencia = Math.floor(Math.randomRange(10, 30) * m)
        tituloGen = "DANO"
        descGen = "+" + potencia + "\nDANO\nDE BALA"
    } else if (tipoStat == 2) {
        potencia = Math.floor(Math.randomRange(15, 45) * m)
        tituloGen = "CADENC."
        descGen = "-" + potencia + "MS\nENTRE\nTIROS"
    } else if (tipoStat == 3) {
        potencia = Math.floor(Math.randomRange(25, 75) * m)
        tituloGen = "VIDA"
        descGen = "+" + potencia + "\nVIDA\nMAXIMA"
    } else if (tipoStat == 4) {
        potencia = Math.floor(Math.randomRange(15, 40) * m)
        tituloGen = "VELOC."
        descGen = "+" + potencia + "\nVEL.\nMOVIM."
    } else if (tipoStat == 5) {
        potencia = Math.floor(Math.randomRange(10, 30) * m)
        tituloGen = "CRITICO"
        descGen = "+" + potencia + "%\nPROB.\nCRITICA"
    } else if (tipoStat == 6) {
        potencia = 1
        tituloGen = "RAFAGA"
        descGen = "+1 BALA\nPOR\nDISPARO"
    } else if (tipoStat == 7) {
        potencia = Math.floor(Math.randomRange(20, 60) * m)
        tituloGen = "IMAN XP"
        descGen = "+" + potencia + "\nRADIO\nDE EXP"
    } else if (tipoStat == 8) {
        potencia = Math.floor(Math.randomRange(30, 100) * m)
        tituloGen = "CURAR"
        descGen = "CURA\n+" + potencia + "\nDE VIDA"
    } else if (tipoStat == 9) {
        potencia = Math.floor(Math.randomRange(25, 75) * m)
        tituloGen = "ESCUDO"
        descGen = "+" + potencia + "\nPTS DE\nESCUDO"
    } else if (tipoStat == 10) {
        potencia = Math.floor(Math.randomRange(20, 50) * m)
        tituloGen = "IMAN $"
        descGen = "+" + potencia + "\nRADIO\nMONEDAS"
    } else if (tipoStat == 11) {
        potencia = Math.floor(Math.randomRange(25, 80) * m)
        tituloGen = "ORO +"
        descGen = "+" + potencia + "%\nORO\nEXTRA"
    } else if (tipoStat == 12) {
        potencia = Math.max(1, Math.floor(Math.randomRange(10, 25) * m / 5))
        tituloGen = "DEFENSA"
        descGen = "-" + potencia + "\nDANO\nRECIBIDO"
    } else if (tipoStat == 13) {
        potencia = Math.floor(Math.randomRange(30, 90) * m)
        tituloGen = "BALAS"
        descGen = "+" + potencia + "\nVEL.\nBALAS"
    } else if (tipoStat == 14) {
        potencia = Math.floor(Math.randomRange(20, 80) * m)
        tituloGen = "EXP +"
        descGen = "+" + potencia + "%\nEXP.\nGANADA"
    } else if (tipoStat == 15) {
        potencia = 1
        colorRareza = 2
        if (nivelHabilidadDash > 0) {
            tituloGen = "DASH+"
            descGen = "MENOS\nESPERA\nEN DASH"
        } else {
            tituloGen = "DASH"
            descGen = "ESQUIVA\nY HIERE\nBOTON B"
        }
    } else if (tipoStat == 16) {
        potencia = 1
        colorRareza = 9
        if (nivelHabilidadNova > 0) {
            tituloGen = "NOVA+"
            descGen = "MAS\nDANO Y\nRADIO"
        } else {
            tituloGen = "NOVA"
            descGen = "ATAQUE\nAREA\nCADA 5S"
        }
    } else if (tipoStat == 17) {
        potencia = 1
        colorRareza = 5
        tituloGen = "PERFORA"
        descGen = "BALAS\nPASAN\n+1 ENEM"
    } else if (tipoStat == 18) {
        potencia = 1
        colorRareza = 2
        tituloGen = "VAMPIRO"
        descGen = "+0.5HP\nPOR\nBAJA"
    } else if (tipoStat == 19) {
        potencia = Math.floor(Math.randomRange(4, 9) * m)
        tituloGen = "REGEN"
        descGen = "+" + (potencia / 10) + " HP\nCADA\nSEGUNDO"
    } else if (tipoStat == 20) {
        potencia = Math.floor(Math.randomRange(10, 25) * m)
        tituloGen = "ESPINAS"
        descGen = "REFLEJA\n" + potencia + "\nDANO"
    } else if (tipoStat == 21) {
        potencia = Math.floor(Math.randomRange(8, 20) * m)
        tituloGen = "CODICIA"
        descGen = "+" + potencia + "%\nDROP\nMONEDAS"
    } else if (tipoStat == 22) {
        potencia = 1
        colorRareza = 2
        tituloGen = "BOMBA"
        if (nivelExplosivas > 0) {
            descGen = "EXPLOS.\nMAS\nGRANDES"
        } else {
            descGen = "BALAS\nEXPLOS.\nEN AREA"
        }
    } else if (tipoStat == 23) {
        potencia = 1
        colorRareza = 2
        tituloGen = "ORBES"
        descGen = "+1 ORBE\nGIRA\nCONTIGO"
    } else if (tipoStat == 24) {
        potencia = 1
        colorRareza = 9
        if (nivelRayo > 0) {
            tituloGen = "RAYO+"
            descGen = "MAS\nRAPIDO\nY FUERTE"
        } else {
            tituloGen = "RAYO"
            descGen = "RAYO\nAL AZAR\nCADA 3S"
        }
    } else if (tipoStat == 25) {
        potencia = 1
        colorRareza = 2
        if (nivelAura > 0) {
            tituloGen = "AURA+"
            descGen = "MAS\nGRANDE\nY FUERTE"
        } else {
            tituloGen = "AURA"
            descGen = "ZONA DE\nDANO\nCERCANA"
        }
    } else if (tipoStat == 26) {
        potencia = 1
        colorRareza = 2
        tituloGen = "ATRAER"
        descGen = "ATRAE\nTODO\nAHORA"
    } else if (tipoStat == 27) {
        potencia = Math.floor(Math.randomRange(4, 9) * m)
        tituloGen = "ESQUIVA"
        descGen = "+" + potencia + "%\nDE\nEVADIR"
    } else if (tipoStat == 28) {
        potencia = 1
        colorRareza = 5
        tituloGen = "HIELO"
        if (nivelHielo > 0) {
            descGen = "FRENO\nMAYOR\nY MAS"
        } else {
            descGen = "BALAS\nFRENAN\nA TODOS"
        }
    } else if (tipoStat == 29) {
        potencia = Math.floor(Math.randomRange(20, 50) * m)
        tituloGen = "CRIT X"
        descGen = "+" + potencia + "%\nDANO\nCRITICO"
    } else if (tipoStat == 31) {
        potencia = 1
        colorRareza = 5
        tituloGen = "COMBO+"
        descGen = "COMBO\nDURA\n+0.7 S"
    } else if (tipoStat == 32) {
        potencia = Math.floor(Math.randomRange(20, 40) * m)
        tituloGen = "DETONA"
        descGen = "+" + potencia + "%\nDANO\nEXPLOS."
    } else {
        potencia = 1
        colorRareza = 9
        tituloGen = "REVIVIR"
        descGen = "REVIVES\nSI\nMUERES"
    }

    return {
        titulo: tituloGen,
        descripcion: descGen,
        tipoStat: tipoStat,
        valorPotencia: potencia,
        rarezaColor: colorRareza
    }
}

function presentarTresOpcionesMejora() {
    estadoActual = EstadoJuego.MenuSubirNivel
    indiceCartaSeleccionada = 0
    opcionesCartasPresentadas = []

    congelarEscena()

    let usados: number[] = []
    let intentos = 0
    while (opcionesCartasPresentadas.length < 3 && intentos < 60) {
        intentos++
        let c = generarMejoraAleatoria()
        let ty = c.tipoStat
        if (usados.indexOf(ty) >= 0) continue
        if (ty == 6 && numProyectiles >= 7) continue
        if (ty == 23 && nivelOrbes >= 6) continue
        if (ty == 27 && esquivaProb >= 45) continue
        if (ty == 30 && vidasExtra >= 2) continue
        if (ty == 31 && comboVentanaExtra >= 2100) continue
        if ((ty == 26 || ty == 30) && Math.randomRange(1, 100) > 40) continue
        usados.push(ty)
        opcionesCartasPresentadas.push(c)
    }
}

function aplicarMejoraProcedural(mejora: MejoraProcedural) {
    let t = mejora.tipoStat
    let v = mejora.valorPotencia

    if (t >= 100) aplicarReliquia(t - 100)
    else if (t == 1) danoAtaque += reliquias[0] ? Math.floor(v * 1.6) : v
    else if (t == 2) cadenciaDisparoMs = Math.max(30, cadenciaDisparoMs - v)
    else if (t == 3) { vidaMaxima += v; vidaActual += v }
    else if (t == 4) { velMovimiento += v; controller.moveSprite(jugadorSprite, velMovimiento, velMovimiento) }
    else if (t == 5) probabilidadCritico = Math.min(80, probabilidadCritico + v)
    else if (t == 6) numProyectiles += v
    else if (t == 7) radioAtraccionXP += v
    else if (t == 8) vidaActual = Math.min(vidaMaxima, vidaActual + v)
    else if (t == 9) { puntosEscudoActivo += v; actualizarGraficoEscudo() }
    else if (t == 10) radioAtraccionMonedas += v
    else if (t == 11) multiplicadorMonedas += (v / 100)
    else if (t == 12) armaduraReduccion += v
    else if (t == 13) velProyectil += v
    else if (t == 14) multiplicadorXP += (v / 100)
    else if (t == 15) { if (nivelHabilidadDash == 0) modoB = 0; nivelHabilidadDash += 1 }
    else if (t == 16) nivelHabilidadNova += 1
    else if (t == 17) perforacion += 1
    else if (t == 18) vampirismo += 1
    else if (t == 19) regenPorSeg += v / 10
    else if (t == 20) espinas += v
    else if (t == 21) dropMonedaExtra += v
    else if (t == 22) nivelExplosivas += 1
    else if (t == 23) nivelOrbes += 1
    else if (t == 24) nivelRayo += 1
    else if (t == 25) nivelAura += 1
    else if (t == 26) imantarTodo()
    else if (t == 27) esquivaProb = Math.min(45, esquivaProb + v)
    else if (t == 28) nivelHielo += 1
    else if (t == 29) multiplicadorCritico += v / 100
    else if (t == 30) vidasExtra += 1
    else if (t == 31) comboVentanaExtra += 700
    else if (t == 32) multExplosivo += v / 100
}

function imantarTodo() {
    for (let g of sprites.allOfKind(SpriteKind.SemillaXP)) g.data["imantado"] = true
    for (let m of sprites.allOfKind(SpriteKind.MonedaOro)) m.data["imantado"] = true
    for (let p of sprites.allOfKind(SpriteKind.PocionVida)) p.data["imantado"] = true
}

function radioAura(): number {
    return 28 + 6 * nivelAura
}

function cdNova(): number {
    return Math.max(2500, 5000 - 500 * (nivelHabilidadNova - 1))
}

// =========================================================
// INICIO DE PARTIDA Y OLEADAS
// =========================================================

function limpiarTodo() {
    if (jugadorSprite) controller.moveSprite(jugadorSprite, 0, 0)
    sprites.destroyAllSpritesOfKind(SpriteKind.Player)
    sprites.destroyAllSpritesOfKind(SpriteKind.Enemy)
    sprites.destroyAllSpritesOfKind(SpriteKind.JefeEnemigo)
    sprites.destroyAllSpritesOfKind(SpriteKind.ProyectilJugador)
    sprites.destroyAllSpritesOfKind(SpriteKind.ProyectilEnemigo)
    sprites.destroyAllSpritesOfKind(SpriteKind.SemillaXP)
    sprites.destroyAllSpritesOfKind(SpriteKind.PocionVida)
    sprites.destroyAllSpritesOfKind(SpriteKind.MonedaOro)
    sprites.destroyAllSpritesOfKind(SpriteKind.TiendaMercader)
    sprites.destroyAllSpritesOfKind(SpriteKind.EscudoProtector)
    sprites.destroyAllSpritesOfKind(SpriteKind.Orbe)
    sprites.destroyAllSpritesOfKind(SpriteKind.Food)
    sprites.destroyAllSpritesOfKind(SpriteKind.Recurso)
    sprites.destroyAllSpritesOfKind(SpriteKind.Casa)
    sprites.destroyAllSpritesOfKind(SpriteKind.Npc)
    sprites.destroyAllSpritesOfKind(SpriteKind.Bomba)
    sprites.destroyAllSpritesOfKind(SpriteKind.Mina)
    meteoros = []
    chunksCargados = []
    ciudadesActivas = []
    raidActiva = false
    npcCerca = null
    hayCiudadCerca = false
    ciudadActualNombre = ""
    jugadorSprite = null
    spriteEscudo = null
    tiendaActivaSprite = null
    orbes = []
    particulasFondo = []
    textosFlotantes = []
    enZonaActivacionTienda = false
    enemigosFrame = []
    jefesFrame = []
    objetivoCache = null
    fxVivos = 0
    balasEnemigasVivas = 0
    ultimoFrameAnim = -1
    ultimoFrameMs = game.runtime()
}

function iniciarPartida() {
    limpiarTodo()
    estadoActual = EstadoJuego.Jugando

    vidaMaxima = 100
    vidaActual = vidaMaxima
    velMovimiento = 95
    nivelJugador = 1
    xpActual = 0
    xpSiguienteNivel = 100
    puntosPuntuacion = 0
    cantidadMonedas = 0
    acumMonedas = 0
    invulnerableHasta = 0

    danoAtaque = 25
    cadenciaDisparoMs = 150
    numProyectiles = 1
    velProyectil = 240
    probabilidadCritico = 10
    multiplicadorCritico = 2.0
    radioAtraccionXP = 30
    multiplicadorXP = 1.0
    armaduraReduccion = 0
    multiplicadorMonedas = 1.0
    radioAtraccionMonedas = 40
    puntosEscudoActivo = 0

    perforacion = 0
    vampirismo = 0
    regenPorSeg = 0
    proxRegen = 0
    espinas = 0
    dropMonedaExtra = 0
    nivelExplosivas = 0
    nivelOrbes = 0
    nivelRayo = 0
    proxRayo = 0
    nivelAura = 0
    proxAura = 0
    esquivaProb = 0
    nivelHielo = 0
    vidasExtra = 0

    nivelHabilidadDash = 0
    nivelHabilidadNova = 0
    cooldownDashMs = 0
    cooldownNovaMs = 0

    // Bonus del personaje elegido
    if (skinSeleccionada == 1) multiplicadorMonedas += 0.5
    else if (skinSeleccionada == 2) danoAtaque += 10
    else if (skinSeleccionada == 3) velMovimiento += 20
    else if (skinSeleccionada == 4) { vidaMaxima += 40; vidaActual = vidaMaxima }
    else if (skinSeleccionada == 5) nivelHabilidadNova = 1
    else if (skinSeleccionada == 6) probabilidadCritico += 15
    else if (skinSeleccionada == 7) { nivelHabilidadDash = 1; esquivaProb = 10 }

    // V20: inventario y crafteo
    mats = [0, 0, 0, 0, 0, 0, 0, 0]
    mejorasCraft = [0, 0, 0, 0, 0]
    biomaActual = -1
    proxToastBioma = 0
    colSombra = 6
    objetivoCache = null
    proxBusqueda = 0
    balasVivas = 0
    proxCheckOleada = 0
    tengoArma = [true, false, false, false, false]
    armaEquipada = 0
    bombas = 0
    raidActiva = false
    regalos = [0, 0, 0]
    npcRegalo = null
    npcRegaloFase = 0
    tiempoEnCiudadMs = 0
    raidAvisado = false
    ultimoRaidTick = game.runtime()
    ciudadesRaid = []
    ciudadesArrasadas = []
    ciudadesAliadas = []
    escanCx = -99999
    escanCy = -99999
    escanArras = -1
    proxEscaneoCuerpo = 0
    casaOpc = ["SALIR"]
    casaAcc = [4]
    vendas = 0
    modoB = (nivelHabilidadDash > 0) ? 0 : 1
    proxBomba = 0
    descansoHasta = 0

    // Estadisticas de la partida
    killsPartida = 0
    monedasPartida = 0
    jefesPartida = 0
    tiempoPartidaMs = 0
    sumarPartida = 1
    ultimoTickMs = game.runtime()
    nuevosDesbloqueos = []
    nuevoRecord = false
    ultimoAtacante = ""
    tiposVistos = [false, false, false, false, false, false, false, false]
    comprasTienda = [0, 0, 0, 0, 0, 0, 0, 0]
    bannerHasta = 0
    toastHasta = 0
    mensajeTiendaHasta = 0

    oleadaActual = 1
    bichosEnOleada = 10 + (nivelDificultad * 6)
    totalBichosOleadaInicial = bichosEnOleada
    pctOleadaMax = 0
    pctOleadaVis = 0
    xpPendienteDirecto = 0
    gemasXPCuenta = 0
    monedasCuenta = 0
    explosionesFrame = 0
    hayElites = false
    hayLideres = false
    ultimaDirX = 1
    ultimaDirY = 0

    reiniciarV27()

    scene.setBackgroundColor(7)

    jugadorFrameA = recolorSkin(imgJugadorBase, SKIN_PRINCIPAL[skinSeleccionada], SKIN_OSCURO[skinSeleccionada])
    jugadorFrameB = desplazarImagen(jugadorFrameA, 1)

    jugadorSprite = sprites.create(jugadorFrameA, SpriteKind.Player)
    jugadorSprite.setPosition(80, 60)
    jugadorSprite.z = 1
    scene.cameraFollowSprite(jugadorSprite)
    controller.moveSprite(jugadorSprite, velMovimiento, velMovimiento)

    if (nivelHabilidadNova > 0) actualizarGraficoEscudo()
    proxMundo = 0
    actualizarMundo(game.runtime())
    prepararSiguienteOleada()
}

function volverAlMenu() {
    limpiarTodo()
    estadoActual = EstadoJuego.MenuPrincipal
    opcionMenuSel = 0
    scene.cameraFollowSprite(null)
    scene.centerCameraAt(80, 60)
    inicializarFondoParticulas()
    menuT0 = game.runtime()
}

function verificarYSpawnearTiendaAleatoria() {
    if (tiendaActivaSprite) {
        tiendaActivaSprite.destroy()
        tiendaActivaSprite = null
    }
    // Tienda lejos del spawn (180 a 300 pixeles): hay que explorar
    if (Math.randomRange(1, 100) <= 70) {
        tiendaActivaSprite = sprites.create(imgCirculoTienda, SpriteKind.TiendaMercader)
        let anguloTienda = Math.randomRange(0, 360) * (Math.PI / 180)
        let distanciaLejana = Math.randomRange(180, 300)
        tiendaActivaSprite.setPosition(
            jugadorSprite.x + Math.cos(anguloTienda) * distanciaLejana,
            jugadorSprite.y + Math.sin(anguloTienda) * distanciaLejana
        )
        tiendaActivaSprite.z = 0
        mostrarToast("HAY UNA TIENDA!", "BUSCA EL CIRCULO", 5)
    }
}

function prepararSiguienteOleada() {
    bichosRestantesPorSpawn = bichosEnOleada
    totalBichosOleadaInicial = bichosEnOleada
    tiempoProximoSpawn = game.runtime() + 800
    pctOleadaMax = 0
    pctOleadaVis = 0

    verificarYSpawnearTiendaAleatoria()
    comprobarMisiones()

    // V27: mutacion de oleada (ajusta cantidades, coloca minas...)
    elegirModOleada()

    if (oleadaActual % 5 == 0) {
        spawnJefe()
    } else if (modOleada != 0) {
        mostrarBanner(MOD_NOMBRE[modOleada], MOD_DESC[modOleada], MOD_COL[modOleada])
    } else {
        mostrarBanner("OLEADA " + oleadaActual, NOMBRES_DIFICULTAD[nivelDificultad], 5)
    }
}

function spawnJefe() {
    let variante = Math.floor(oleadaActual / 5) - 1
    let frames = crearFramesJefe(variante)
    let jefe = sprites.create(frames[0], SpriteKind.JefeEnemigo)
    animation.runImageAnimation(jefe, frames, 350, true)
    jefe.setPosition(jugadorSprite.x + 140, jugadorSprite.y + 140)
    jefe.z = 2

    let multiplicadorHp = 1.0
    let multiplicadorDano = 1.0
    let velJefe = 25

    if (nivelDificultad == 0) {
        multiplicadorHp = 1.0; multiplicadorDano = 1.0; velJefe = 20
    } else if (nivelDificultad == 1) {
        multiplicadorHp = 2.5; multiplicadorDano = 2.0; velJefe = 32
    } else if (nivelDificultad == 2) {
        multiplicadorHp = 5.5; multiplicadorDano = 3.8; velJefe = 48
    }

    let hpBase = (500 + (oleadaActual * 180)) * multiplicadorHp
    jefe.data["hp"] = hpBase
    jefe.data["maxHp"] = hpBase
    jefe.data["dano"] = (30 + (oleadaActual * 6)) * multiplicadorDano
    jefe.data["velocidad"] = velJefe
    jefe.data["nombre"] = NOMBRES_JEFE[variante % NOMBRES_JEFE.length]
    jefe.data["patron"] = 0
    jefe.data["proxAtaque"] = game.runtime() + 2500
    totalBichosOleadaInicial += 1

    scene.cameraShake(4, 500)
    mostrarBanner("JEFE: " + NOMBRES_JEFE[variante % NOMBRES_JEFE.length], "OLEADA " + oleadaActual, 2)
}

// =========================================================
// ENEMIGOS
// =========================================================

let poolTipoOleada: number = -1
let poolTipo: number[] = []

function elegirTipoEnemigo(): number {
    if (poolTipoOleada != oleadaActual) {
        poolTipoOleada = oleadaActual
        let pool: number[] = [0, 0, 0]
        if (oleadaActual >= 2) { pool.push(1); pool.push(1) }
        if (oleadaActual >= 3) { pool.push(2); pool.push(3) }
        if (oleadaActual >= 4) pool.push(5)
        if (oleadaActual >= 5) pool.push(6)
        if (oleadaActual >= 6) { pool.push(4); pool.push(3) }
        poolTipo = pool
    }
    return poolTipo[Math.randomRange(0, poolTipo.length - 1)]
}

function crearEnemigo(tipo: number, x: number, y: number): Sprite {
    let frames = FRAMES_TIPO[tipo]
    let bicho = sprites.create(frames[0], SpriteKind.Enemy)
    // V25: sin animation.runImageAnimation por enemigo; el cambio de frame lo hace actualizarEnemigos
    bicho.z = 1
    bicho.setPosition(x, y)

    let multDifHp = (nivelDificultad == 2) ? 2.2 : (nivelDificultad == 1 ? 1.4 : 0.8)
    let multDifDano = (nivelDificultad == 2) ? 2.5 : (nivelDificultad == 1 ? 1.5 : 0.7)
    let multDifVel = (nivelDificultad == 2) ? 1.4 : (nivelDificultad == 1 ? 1.1 : 0.9)

    let hp = (25 + (oleadaActual * 15)) * multDifHp * HP_TIPO[tipo]
    let dano = (10 + (oleadaActual * 3)) * multDifDano * DANO_TIPO[tipo]
    let vel = Math.min(85, (32 + (oleadaActual * 2.5)) * multDifVel * VEL_TIPO[tipo])
    if (modOleada == MOD_ENJAMBRE) {
        hp = hp * 0.5
        dano = dano * 0.8
        vel = vel * 1.12
    } else if (modOleada == MOD_ORO) {
        vel = vel * 1.2
    }

    bicho.data["tipo"] = tipo
    bicho.data["hp"] = hp
    bicho.data["maxHp"] = hp
    bicho.data["dano"] = dano
    bicho.data["velocidad"] = vel
    bicho.data["proxDisparo"] = game.runtime() + Math.randomRange(1200, 2400)

    if (tipo >= 3 && tipo <= 6 && !tiposVistos[tipo]) {
        tiposVistos[tipo] = true
        let aviso = "CUIDADO!"
        if (tipo == 3) mostrarToast(aviso, "ARQUEROS DISPARAN", 2)
        else if (tipo == 4) mostrarToast(aviso, "BRUJOS: MAGIA x3", 2)
        else if (tipo == 5) mostrarToast(aviso, "BOMBITAS EXPLOTAN", 2)
        else mostrarToast(aviso, "GELATINA SE DIVIDE", 2)
    }
    return bicho
}

sprites.onDestroyed(SpriteKind.ProyectilEnemigo, function (bala) {
    balasEnemigasVivas = Math.max(0, balasEnemigasVivas - 1)
})

function disparoEnemigo(x: number, y: number, ang: number, vel: number, dano: number, magico: boolean) {
    if (balasEnemigasVivas >= MAX_BALAS_ENEM_Q[calidad]) return
    balasEnemigasVivas++
    let b = sprites.create(magico ? imgBalaMagica : imgBalaEnemiga, SpriteKind.ProyectilEnemigo)
    b.setPosition(x, y)
    b.z = 2
    b.vx = Math.cos(ang) * vel
    b.vy = Math.sin(ang) * vel
    b.lifespan = 3200
    b.setFlag(SpriteFlag.AutoDestroy, true)
    b.data["dano"] = dano
}

function explotarBombita(b: Sprite) {
    if (b.data["muerto"]) return
    b.data["muerto"] = true
    let bx = b.x
    let by = b.y
    let danoB = ((b.data["dano"] as number) || 20) * 1.2
    b.destroy()
    // V27: la explosion tambien alcanza a los demas enemigos (y encadena)
    detonarBombita(bx, by, b, danoB)
}

function actualizarEnemigos(ahora: number) {
    let lista = enemigosFrame
    if (raidActiva) npcsCache = sprites.allOfKind(SpriteKind.Npc)
    // Con muchos enemigos, cada uno piensa un frame de cada dos (mantiene su velocidad entre medias).
    // Los lejanos (fuera de pantalla) piensan solo 1 de cada 4 frames.
    let escalonar = lista.length > LIMITE_IA_Q[calidad]
    // Animacion de los enemigos: un unico cambio de frame global cada 280 ms
    let frameAnim = Math.floor(ahora / 280) % 2
    ultimoFrameAnim = frameAnim
    frameIA++
    let jx = jugadorSprite.x
    let jy = jugadorSprite.y
    // V27: relojes rotos y lideres (se calculan una vez por frame)
    let tiempoLento = reliquias[1] && vidaActual <= vidaMaxima * 0.35
    let lideres: Sprite[] = []
    if (hayLideres) {
        for (let l of lista) {
            if (!l.data["muerto"] && l.data["elite"] == 4) lideres.push(l)
        }
        hayLideres = lideres.length > 0
    }
    let grupoAnim = frameIA & 3
    for (let b of lista) {
        // Animacion repartida: cada enemigo cambia de frame en su turno (1 de cada 4 frames), sin pico unico
        if ((b.id & 3) == grupoAnim) {
            let imA = FRAMES_TIPO[(b.data["tipo"] as number) || 0][frameAnim]
            if (b.image != imA) b.setImage(imA)
        }
        if (escalonar) {
            let ddx = b.x - jx
            let ddy = b.y - jy
            let lejos = ddx * ddx + ddy * ddy > 150 * 150
            if ((b.id + frameIA) % (lejos ? 4 : 2) != 0) continue
        }
        let bd = b.data
        if (bd["muerto"]) continue
        let tipo = (bd["tipo"] as number) || 0
        let vel = (bd["velocidad"] as number) || 30
        if (ahora < ((bd["lentoHasta"] as number) || 0)) vel = vel * 0.5
        if (tiempoLento) vel = vel * 0.55
        if (lideres.length > 0 && bd["elite"] != 4) {
            for (let ld of lideres) {
                let ldx = ld.x - b.x
                let ldy = ld.y - b.y
                if (ldx * ldx + ldy * ldy <= 48 * 48) {
                    vel = vel * 1.35
                    break
                }
            }
        }

        let objX = jugadorSprite.x
        let objY = jugadorSprite.y
        if (bd["raider"]) {
            let nv = npcMasCercano(b.x, b.y)
            if (nv) {
                let ax = nv.x - b.x
                let ay = nv.y - b.y
                let px = jugadorSprite.x - b.x
                let py = jugadorSprite.y - b.y
                if (ax * ax + ay * ay < px * px + py * py + 1600) {
                    objX = nv.x
                    objY = nv.y
                }
            }
        }
        let dx = objX - b.x
        let dy = objY - b.y
        let d = Math.sqrt(dx * dx + dy * dy)
        if (d < 1) d = 1
        // Reciclaje: un enemigo que se quedo muy atras reaparece cerca del jugador
        // (no se acumulan mobs inutiles lejos y la oleada avanza)
        if (d > 280 && !bd["raider"]) {
            let ar = Math.randomRange(0, 359) * (Math.PI / 180)
            let rr = Math.randomRange(140, 180)
            b.setPosition(objX + Math.cos(ar) * rr, objY + Math.sin(ar) * rr)
            continue
        }
        let ux = dx / d
        let uy = dy / d

        // V27: elite FASEADO. Marca un punto cerca de donde ibas a estar y salta alli
        if (bd["elite"] == 3) {
            let tp = tiempoPartidaMs
            if (((bd["fase"] as number) || 0) == 0) {
                if (tp >= ((bd["faseT"] as number) || 0)) {
                    bd["faseX"] = jugadorSprite.x + jugadorSprite.vx * 0.6 + Math.randomRange(-18, 18)
                    bd["faseY"] = jugadorSprite.y + jugadorSprite.vy * 0.6 + Math.randomRange(-18, 18)
                    bd["fase"] = 1
                    bd["faseT"] = tp + 650
                }
            } else {
                b.vx = 0
                b.vy = 0
                if (tp >= ((bd["faseT"] as number) || 0)) {
                    b.setPosition(bd["faseX"] as number, bd["faseY"] as number)
                    crearAnillo(b.x, b.y, 20, 10, 220)
                    let pdx = jugadorSprite.x - b.x
                    let pdy = jugadorSprite.y - b.y
                    if (pdx * pdx + pdy * pdy <= 20 * 20) {
                        recibirDanoJugador(((bd["dano"] as number) || 12) * 0.8, "FASEADO")
                    }
                    bd["fase"] = 0
                    bd["faseT"] = tp + Math.randomRange(2600, 3800)
                }
                continue
            }
        }

        if (tipo == 3 || tipo == 4) {
            // A distancia: mantiene la posicion y dispara
            let ideal = (tipo == 3) ? 85 : 100
            if (d > ideal + 15) {
                b.vx = ux * vel
                b.vy = uy * vel
            } else if (d < ideal - 20) {
                b.vx = -ux * vel
                b.vy = -uy * vel
            } else {
                b.vx = -uy * vel * 0.5
                b.vy = ux * vel * 0.5
            }
            if (ahora >= ((bd["proxDisparo"] as number) || 0) && d < 150) {
                let danoP = (bd["dano"] as number) || 10
                let ang = Math.atan2(dy, dx)
                if (tipo == 3) {
                    disparoEnemigo(b.x, b.y, ang, 95, danoP, false)
                    bd["proxDisparo"] = ahora + 1900
                } else {
                    disparoEnemigo(b.x, b.y, ang - 0.3, 70, danoP, true)
                    disparoEnemigo(b.x, b.y, ang, 70, danoP, true)
                    disparoEnemigo(b.x, b.y, ang + 0.3, 70, danoP, true)
                    bd["proxDisparo"] = ahora + 2600
                }
            }
        } else if (tipo == 5) {
            // Bombita: corre y explota
            b.vx = ux * vel
            b.vy = uy * vel
            if (d < 24) {
                explotarBombita(b)
            }
        } else {
            b.vx = ux * vel
            b.vy = uy * vel
        }
        repelerDeCiudad(b, vel)
    }
}

function actualizarJefes(ahora: number) {
    for (let j of jefesFrame) {
        if (j.data["muerto"]) continue
        let vel = (j.data["velocidad"] as number) || 25
        if (ahora < ((j.data["lentoHasta"] as number) || 0)) vel = vel * 0.5
        if (reliquias[1] && vidaActual <= vidaMaxima * 0.35) vel = vel * 0.55
        let dx = jugadorSprite.x - j.x
        let dy = jugadorSprite.y - j.y
        let d = Math.sqrt(dx * dx + dy * dy)
        if (d < 1) d = 1
        j.vx = dx / d * vel
        j.vy = dy / d * vel
        repelerDeCiudad(j, vel)

        if (ahora >= ((j.data["proxAtaque"] as number) || 0)) {
            let patron = (j.data["patron"] as number) || 0
            j.data["patron"] = patron + 1
            j.data["proxAtaque"] = ahora + ((nivelDificultad == 2) ? 1700 : 2400)
            let danoB = ((j.data["dano"] as number) || 30) * 0.5
            let p = patron % 3
            j.sayText("!", 400)
            if (p == 0) {
                // Anillo de balas
                for (let k = 0; k < 12; k++) {
                    disparoEnemigo(j.x, j.y, k * Math.PI / 6, 65, danoB, false)
                }
            } else if (p == 1) {
                // Abanico dirigido
                let ang = Math.atan2(dy, dx)
                for (let k = -2; k <= 2; k++) {
                    disparoEnemigo(j.x, j.y, ang + k * 0.28, 90, danoB, true)
                }
            } else {
                // Invoca esbirros + anillo corto
                for (let k = 0; k < 3; k++) {
                    let a = Math.randomRange(0, 360) * (Math.PI / 180)
                    crearEnemigo(7, j.x + Math.cos(a) * 30, j.y + Math.sin(a) * 30)
                }
                totalBichosOleadaInicial += 3
                for (let k = 0; k < 6; k++) {
                    disparoEnemigo(j.x, j.y, k * Math.PI / 3, 60, danoB, false)
                }
            }
        }
    }
}

// =========================================================
// DISPARO
// =========================================================

// =========================================================
// BUCLE PRINCIPAL
// =========================================================

// Mide la fluidez real y sube/baja la calidad sola.
// Baja rapido si va lento (>46 ms por frame) y sube despacio si va sobrado (<36 ms).
function actualizarCalidad(ahora: number) {
    let dt = ahora - ultimoFrameMs
    ultimoFrameMs = ahora
    // V28: calidad fija elegida por el jugador (movil: BAJA)
    if (calidadModo > 0) {
        calidad = calidadModo - 1
        return
    }
    // Ignora pausas (menus, tienda...) y el primer frame
    if (dt <= 0 || dt > 250) return
    dtMedio = dtMedio * 0.92 + dt * 0.08
    if (ahora < proxEvalCalidad) return
    proxEvalCalidad = ahora + 1500
    if (dtMedio > 40 && calidad < 2) {
        calidad++
        rachaBuena = 0
        // Cada bajada hace mas lenta la siguiente subida (evita oscilar)
        rachaNecesaria = Math.min(40, rachaNecesaria * 2)
    } else if (dtMedio < 34 && calidad > 0) {
        rachaBuena++
        if (rachaBuena >= rachaNecesaria) {
            calidad--
            rachaBuena = 0
        }
    } else {
        rachaBuena = 0
    }
}

function congelarEscena() {
    controller.moveSprite(jugadorSprite, 0, 0)
    jugadorSprite.vx = 0
    jugadorSprite.vy = 0
    jugadorSprite.setFlag(SpriteFlag.Invisible, false)
    for (let b of sprites.allOfKind(SpriteKind.Enemy)) { b.vx = 0; b.vy = 0 }
    for (let j of sprites.allOfKind(SpriteKind.JefeEnemigo)) { j.vx = 0; j.vy = 0 }
    sprites.destroyAllSpritesOfKind(SpriteKind.ProyectilJugador)
    sprites.destroyAllSpritesOfKind(SpriteKind.ProyectilEnemigo)
    textosFlotantes = []
    bombas += sprites.allOfKind(SpriteKind.Bomba).length
    sprites.destroyAllSpritesOfKind(SpriteKind.Bomba)
}

function reanudarJuego() {
    estadoActual = EstadoJuego.Jugando
    controller.moveSprite(jugadorSprite, velMovimiento, velMovimiento)
    let ahora = game.runtime()
    tiempoProximoSpawn = ahora + 500
    ultimoTickMs = ahora
    proxRayo = ahora + 1500
    for (let b of sprites.allOfKind(SpriteKind.Enemy)) {
        b.data["proxDisparo"] = ahora + Math.randomRange(900, 1800)
    }
}

function golpearRayo(ahora: number) {
    let candidatos: Sprite[] = []
    for (let b of enemigosFrame) {
        let dx = b.x - jugadorSprite.x
        let dy = b.y - jugadorSprite.y
        if (dx * dx + dy * dy < 130 * 130 && !b.data["muerto"]) candidatos.push(b)
    }
    for (let j of jefesFrame) {
        if (!j.data["muerto"]) candidatos.push(j)
    }
    if (candidatos.length == 0) return
    let golpesRayo = reliquias[5] ? 2 : 1
    for (let g = 0; g < golpesRayo; g++) {
        let objetivo = candidatos[Math.randomRange(0, candidatos.length - 1)]
        if (objetivo.data["muerto"]) continue
        let ox = objetivo.x
        let oy = objetivo.y
        crearRayoVisual(ox, oy)
        crearEfectoMuerte(ox, oy)
        music.setVolume(Math.map(volumenAudio, 0, 100, 0, 90))
        music.playTone(1200, 40)
        procesarDanoAEnemigo(objetivo, danoAtaque * (1.8 + 0.4 * nivelRayo), true)
    }
}

game.onUpdate(function () {
    if (estadoActual != EstadoJuego.Jugando || !jugadorSprite) return

    let tiempoAhora = game.runtime()

    // V25: calidad adaptativa y listas de este frame (una sola consulta por frame)
    actualizarCalidad(tiempoAhora)
    enemigosFrame = sprites.allOfKind(SpriteKind.Enemy)
    jefesFrame = sprites.allOfKind(SpriteKind.JefeEnemigo)

    // Tiempo de partida (ignora pausas)
    let dt = tiempoAhora - ultimoTickMs
    ultimoTickMs = tiempoAhora
    if (dt > 0 && dt < 100) tiempoPartidaMs += dt

    // Animacion del jugador y parpadeo al ser golpeado
    let moviendo = jugadorSprite.vx != 0 || jugadorSprite.vy != 0
    if (moviendo) {
        ultimaDirX = jugadorSprite.vx > 0 ? 1 : (jugadorSprite.vx < 0 ? -1 : 0)
        ultimaDirY = jugadorSprite.vy > 0 ? 1 : (jugadorSprite.vy < 0 ? -1 : 0)
    }
    let frameJ = (moviendo && Math.floor(tiempoAhora / 140) % 2 == 1) ? jugadorFrameB : jugadorFrameA
    if (jugadorSprite.image != frameJ) jugadorSprite.setImage(frameJ)
    let invulnerable = tiempoAhora < invulnerableHasta
    jugadorSprite.setFlag(SpriteFlag.Invisible, invulnerable && Math.floor(tiempoAhora / 50) % 2 == 0)

    // Mundo (ciudades y recursos), interaccion y bombas
    actualizarMundo(tiempoAhora)
    if ((frameIA & 1) == 0) actualizarInteraccion()
    actualizarRaid(tiempoAhora)
    actualizarRegaloNPC()
    actualizarRegalos(tiempoAhora)
    actualizarBombas(tiempoAhora)
    if (actualizarMecanicasV27(tiempoAhora)) return

    // Disparo continuo (junto a un vecino, A sirve para entrar)
    if ((controller.A.isPressed() || (disparoAuto && (enemigosFrame.length > 0 || jefesFrame.length > 0))) && !npcCerca) {
        ejecutarDisparoManual()
    }

    // Regeneracion
    if (regenPorSeg > 0 && tiempoAhora >= proxRegen) {
        proxRegen = tiempoAhora + 1000
        if (vidaActual < vidaMaxima) vidaActual = Math.min(vidaMaxima, vidaActual + regenPorSeg)
    }

    // Listas de este frame (se comparten entre nova, orbes y aura)
    let enemigos: Sprite[] = enemigosFrame
    let jefes: Sprite[] = jefesFrame

    // Nova automatica
    if (nivelHabilidadNova > 0 && tiempoAhora >= cooldownNovaMs) {
        cooldownNovaMs = tiempoAhora + cdNova()
        let radioNova = 56 + 8 * nivelHabilidadNova
        let multNova = 1.5 + 0.4 * (nivelHabilidadNova - 1)
        music.setVolume(Math.map(volumenAudio, 0, 100, 0, 120))
        music.playTone(300, 100)
        scene.cameraShake(3, 200)
        crearAnillo(jugadorSprite.x, jugadorSprite.y, radioNova, 9, 220)
        for (let bicho of enemigos) {
            let dx = bicho.x - jugadorSprite.x
            let dy = bicho.y - jugadorSprite.y
            if (dx * dx + dy * dy <= radioNova * radioNova) {
                procesarDanoAEnemigo(bicho, danoAtaque * multNova, true)
            }
        }
        for (let jefe of jefes) {
            let dx = jefe.x - jugadorSprite.x
            let dy = jefe.y - jugadorSprite.y
            if (dx * dx + dy * dy <= radioNova * radioNova) {
                procesarDanoAEnemigo(jefe, danoAtaque * (multNova - 0.5), true)
            }
        }
    }

    // Orbes giratorios
    if (nivelOrbes > 0) {
        while (orbes.length < nivelOrbes) {
            let o = sprites.create(imgOrbe, SpriteKind.Orbe)
            o.setFlag(SpriteFlag.Ghost, true)
            o.z = 2
            orbes.push(o)
        }
        let dmgOrbe = Math.max(4, danoAtaque * 0.6)
        let proyEnemigas = sprites.allOfKind(SpriteKind.ProyectilEnemigo)
        for (let i = 0; i < orbes.length; i++) {
            let ang = tiempoAhora / 380 + i * 6.2832 / orbes.length
            let ox = jugadorSprite.x + Math.cos(ang) * 26
            let oy = jugadorSprite.y + Math.sin(ang) * 26
            orbes[i].setPosition(ox, oy)
            for (let b of enemigos) {
                let dx = b.x - ox
                let dy = b.y - oy
                if (dx * dx + dy * dy < 12 * 12 && tiempoAhora >= ((b.data["orbCd"] as number) || 0)) {
                    b.data["orbCd"] = tiempoAhora + 400
                    procesarDanoAEnemigo(b, dmgOrbe, false)
                }
            }
            for (let j of jefes) {
                let dx = j.x - ox
                let dy = j.y - oy
                if (dx * dx + dy * dy < 18 * 18 && tiempoAhora >= ((j.data["orbCd"] as number) || 0)) {
                    j.data["orbCd"] = tiempoAhora + 400
                    procesarDanoAEnemigo(j, dmgOrbe, false)
                }
            }
            // Los orbes tambien bloquean proyectiles enemigos
            for (let pe of proyEnemigas) {
                let dx = pe.x - ox
                let dy = pe.y - oy
                if (dx * dx + dy * dy < 10 * 10) pe.destroy()
            }
        }
    }

    // Aura de dano
    if (nivelAura > 0 && tiempoAhora >= proxAura) {
        proxAura = tiempoAhora + 500
        let ra = radioAura()
        let dmgAura = Math.max(3, danoAtaque * (0.25 + 0.1 * nivelAura))
        for (let b of enemigos) {
            let dx = b.x - jugadorSprite.x
            let dy = b.y - jugadorSprite.y
            if (dx * dx + dy * dy <= ra * ra) procesarDanoAEnemigo(b, dmgAura, false)
        }
        for (let j of jefes) {
            let dx = j.x - jugadorSprite.x
            let dy = j.y - jugadorSprite.y
            if (dx * dx + dy * dy <= (ra + 12) * (ra + 12)) procesarDanoAEnemigo(j, dmgAura, false)
        }
    }

    // Rayos
    if (nivelRayo > 0 && tiempoAhora >= proxRayo) {
        proxRayo = tiempoAhora + Math.max(900, 3200 - 350 * nivelRayo)
        golpearRayo(tiempoAhora)
    }

    // Aparicion de enemigos
    if (bichosRestantesPorSpawn > 0 && tiempoAhora >= tiempoProximoSpawn) {
        if (enemigosFrame.length < MAX_ENEMIGOS_Q[calidad]) {
            let tipo = elegirTipoEnemigo()
            let anguloRandom = Math.randomRange(0, 360) * (Math.PI / 180)
            let radioDistancia = Math.randomRange(130, 180)
            let nuevoBicho = crearEnemigo(tipo,
                jugadorSprite.x + Math.cos(anguloRandom) * radioDistancia,
                jugadorSprite.y + Math.sin(anguloRandom) * radioDistancia)
            intentarElite(nuevoBicho)
            bichosRestantesPorSpawn--
        }
        tiempoProximoSpawn = tiempoAhora + Math.floor(Math.max(90, 500 - (oleadaActual * 18)) * (modOleada == MOD_ENJAMBRE ? 0.55 : 1))
    }

    actualizarEnemigos(tiempoAhora)
    actualizarJefes(tiempoAhora)

    if ((frameIA & 1) == 0) {
    // Atraccion de XP
    let gemasXP = sprites.allOfKind(SpriteKind.SemillaXP)
    gemasXPCuenta = gemasXP.length
    let sobrantesXP = gemasXP.length - MAX_BOTIN_Q[calidad]
    for (let gema of gemasXP) {
        // Con muchas gemas en el suelo, las mas viejas vuelan solas al jugador (menos sprites)
        if (sobrantesXP > 0) {
            gema.data["imantado"] = true
            sobrantesXP--
        }
        let dx = jugadorSprite.x - gema.x
        let dy = jugadorSprite.y - gema.y
        let dist2 = dx * dx + dy * dy
        if (gema.data["imantado"]) {
            let d = Math.max(1, Math.sqrt(dist2))
            gema.vx = dx / d * 170
            gema.vy = dy / d * 170
        } else if (dist2 < radioAtraccionXP * radioAtraccionXP) {
            gema.vx = dx * 3
            gema.vy = dy * 3
        }
    }

    // Atraccion de monedas
    let monedasSuelo = sprites.allOfKind(SpriteKind.MonedaOro)
    monedasCuenta = monedasSuelo.length
    let sobrantesOro = monedasSuelo.length - MAX_BOTIN_Q[calidad]
    // Animacion de monedas global (antes una animacion por moneda)
    let frameMoneda = FRAMES_MONEDA[Math.floor(tiempoAhora / 130) % 4]
    for (let moneda of monedasSuelo) {
        if (sobrantesOro > 0) {
            moneda.data["imantado"] = true
            sobrantesOro--
        }
        if (moneda.image != frameMoneda) moneda.setImage(frameMoneda)
        let dx = jugadorSprite.x - moneda.x
        let dy = jugadorSprite.y - moneda.y
        let dist2 = dx * dx + dy * dy
        if (moneda.data["imantado"]) {
            let d = Math.max(1, Math.sqrt(dist2))
            moneda.vx = dx / d * 170
            moneda.vy = dy / d * 170
        } else if (dist2 < radioAtraccionMonedas * radioAtraccionMonedas) {
            moneda.vx = dx * 3.5
            moneda.vy = dy * 3.5
        }
    }

    // Pociones imantadas
    for (let pv of sprites.allOfKind(SpriteKind.PocionVida)) {
        if (pv.data["imantado"]) {
            let dx = jugadorSprite.x - pv.x
            let dy = jugadorSprite.y - pv.y
            let d = Math.max(1, Math.sqrt(dx * dx + dy * dy))
            pv.vx = dx / d * 170
            pv.vy = dy / d * 170
        }
    }

    }

    // Permanencia en el circulo de la tienda (3 segundos)
    if (tiendaActivaSprite) {
        let dxT = jugadorSprite.x - tiendaActivaSprite.x
        let dyT = jugadorSprite.y - tiendaActivaSprite.y
        let distT = Math.sqrt(dxT * dxT + dyT * dyT)
        if (distT <= 22) {
            if (!enZonaActivacionTienda) {
                enZonaActivacionTienda = true
                tiempoInicioPermanenciaTienda = game.runtime()
            } else {
                let transcurrido = game.runtime() - tiempoInicioPermanenciaTienda
                if (transcurrido >= 3000) {
                    enZonaActivacionTienda = false
                    estadoActual = EstadoJuego.TiendaInteractiva
                    opcionTiendaSel = 0
                    mensajeTiendaHasta = 0
                    congelarEscena()
                    sonarConfirmar()
                }
            }
        } else {
            enZonaActivacionTienda = false
        }
    }

    if (puntosEscudoActivo > 0 && spriteEscudo) {
        spriteEscudo.setPosition(jugadorSprite.x, jugadorSprite.y)
    }

    // Limpieza de numeros flotantes caducados
    for (let i = textosFlotantes.length - 1; i >= 0; i--) {
        if (tiempoAhora > textosFlotantes[i].fin) textosFlotantes.removeAt(i)
    }

    // Fin de oleada
    if (bichosRestantesPorSpawn <= 0 && tiempoAhora >= proxCheckOleada) {
        proxCheckOleada = tiempoAhora + 250
        if (sprites.allOfKind(SpriteKind.Enemy).length == 0 && sprites.allOfKind(SpriteKind.JefeEnemigo).length == 0) {
            puntosPuntuacion += 100 * oleadaActual
            oleadaActual++
            bichosEnOleada += 5
            prepararSiguienteOleada()
        }
    }
})

function actualizarGraficoEscudo() {
    if (puntosEscudoActivo > 0 && !spriteEscudo) {
        spriteEscudo = sprites.create(imgEscudo, SpriteKind.EscudoProtector)
        spriteEscudo.setFlag(SpriteFlag.Ghost, true)
        spriteEscudo.z = 2
    } else if (puntosEscudoActivo <= 0 && spriteEscudo) {
        spriteEscudo.destroy()
        spriteEscudo = null
    }
}

// =========================================================
// DANO, BOTIN Y COLISIONES
// =========================================================

function crearMoneda(x: number, y: number) {
    let moneda = sprites.create(imgMoneda, SpriteKind.MonedaOro)
    moneda.setPosition(x, y)
    moneda.z = 1
}

function procesarDanoAEnemigo(enemigo: Sprite, dano: number, mostrar: boolean) {
    if (enemigo.data["muerto"]) return

    let esCritico = Math.randomRange(1, 100) <= probabilidadCritico
    let danoFinal = Math.floor(esCritico ? dano * multiplicadorCritico : dano)
    if (danoFinal < 1) danoFinal = 1

    // V27: el escudo de los elites BLINDADOS absorbe primero
    let danoCasco = danoFinal
    let escudoE = (enemigo.data["escudo"] as number) || 0
    if (escudoE > 0) {
        let absorbido = Math.min(escudoE, danoCasco)
        enemigo.data["escudo"] = escudoE - absorbido
        danoCasco -= absorbido
        if (escudoE - absorbido <= 0) romperEscudo(enemigo)
    }

    let hpActual = ((enemigo.data["hp"] as number) || 10) - danoCasco
    enemigo.data["hp"] = hpActual

    if (mostrar) {
        if (esCritico) textoFlotante(enemigo.x, enemigo.y - 8, "" + danoFinal + "!", 5)
        else textoFlotante(enemigo.x, enemigo.y - 8, "" + danoFinal, 1)
    }

    if (hpActual <= 0) {
        enemigo.data["muerto"] = true
        let esJefe = enemigo.kind() == SpriteKind.JefeEnemigo
        let tipo = (enemigo.data["tipo"] as number) || 0
        let ex = enemigo.x
        let ey = enemigo.y

        puntosPuntuacion += Math.floor((esJefe ? 500 : 20) * COMBO_F_PTS[comboTier])
        killsPartida++
        registrarBajaCombo(ex, ey)
        if (reliquias[2] && jugadorSprite) {
            killsBomba++
            if (killsBomba >= 8) {
                killsBomba = 0
                bombas += 1
                textoFlotante(jugadorSprite.x, jugadorSprite.y - 14, "+1 BOMBA", 4)
            }
        }
        if (vampirismo > 0) vidaActual = Math.min(vidaMaxima, vidaActual + 0.5 * vampirismo)

        crearEfectoMuerte(ex, ey)
        soltarMateriales(tipo, esJefe, ex, ey)
        if (tipo == 5 && !esJefe) detonarBombita(ex, ey, enemigo, ((enemigo.data["dano"] as number) || 20) * 0.7)
        if (enemigo.data["elite"]) muerteElite(enemigo, ex, ey)
        if (esJefe) reliquiaPendiente = true

        if (!esJefe && gemasXPCuenta >= MAX_BOTIN_Q[calidad]) {
            // Demasiadas gemas en el suelo: la experiencia se suma directa (sin crear otro sprite)
            xpPendienteDirecto += Math.floor(25 * multiplicadorXP * COMBO_F_XP[comboTier])
        } else {
            let gemaXP = sprites.create(imgGemaXP, SpriteKind.SemillaXP)
            gemaXP.setPosition(ex, ey)
            gemaXP.z = 1
            if (esJefe) gemaXP.data["xp"] = 150
            gemasXPCuenta++
        }

        if (esJefe) {
            jefesPartida++
            scene.cameraShake(6, 600)
            for (let k = 0; k < 10; k++) crearMoneda(ex + Math.randomRange(-18, 18), ey + Math.randomRange(-18, 18))
            let gemaVida = sprites.create(imgGemaVida, SpriteKind.PocionVida)
            gemaVida.setPosition(ex, ey + 10)
            gemaVida.z = 1
            mostrarToast("JEFE DERROTADO!", "+500 PUNTOS", 5)
        } else {
            if (Math.randomRange(1, 100) <= 5) {
                let gemaVida = sprites.create(imgGemaVida, SpriteKind.PocionVida)
                gemaVida.setPosition(ex + Math.randomRange(-6, 6), ey + Math.randomRange(-6, 6))
                gemaVida.z = 1
            }
            if (Math.randomRange(1, 100) <= Math.min(100, 60 + dropMonedaExtra) || modOleada == MOD_ORO) {
                if (monedasCuenta >= MAX_BOTIN_Q[calidad]) {
                    ganarOroDirecto()
                    if (modOleada == MOD_ORO) ganarOroDirecto()
                } else {
                    crearMoneda(ex + Math.randomRange(-8, 8), ey + Math.randomRange(-8, 8))
                    monedasCuenta++
                    if (modOleada == MOD_ORO) {
                        crearMoneda(ex + Math.randomRange(-8, 8), ey + Math.randomRange(-8, 8))
                        monedasCuenta++
                    }
                }
            }
            // La gelatina se divide en dos minis
            if (tipo == 6) {
                for (let k = 0; k < 2; k++) {
                    crearEnemigo(7, ex + Math.randomRange(-10, 10), ey + Math.randomRange(-10, 10))
                }
                totalBichosOleadaInicial += 2
            }
        }

        enemigo.destroy()
        comprobarMisiones()
    }
}

function explosionBala(x: number, y: number, excluir: Sprite) {
    // Tope de explosiones por frame (cada una recorre todos los enemigos)
    if (explosionesFrame >= 6 - 2 * calidad) return
    explosionesFrame++
    let r = 18 + 6 * nivelExplosivas
    crearAnillo(x, y, r, 4, 160)
    for (let b of enemigosFrame) {
        if (b == excluir) continue
        let dx = b.x - x
        let dy = b.y - y
        if (dx * dx + dy * dy <= r * r) procesarDanoAEnemigo(b, danoAtaque * 0.5 * multExplosivo, false)
    }
    for (let j of jefesFrame) {
        if (j == excluir) continue
        let dx = j.x - x
        let dy = j.y - y
        if (dx * dx + dy * dy <= (r + 10) * (r + 10)) procesarDanoAEnemigo(j, danoAtaque * 0.5 * multExplosivo, false)
    }
}

function manejarImpactoBala(bala: Sprite, objetivo: Sprite) {
    if (estadoActual != EstadoJuego.Jugando) return
    if (bala.data["gastada"]) return
    let perf = (bala.data["perf"] as number) || 0
    if (perf > 0) {
        if (yaGolpeada(bala, objetivo.id)) return
        bala.data["perf"] = perf - 1
    } else {
        bala.data["gastada"] = true
    }

    let ox = objetivo.x
    let oy = objetivo.y
    procesarDanoAEnemigo(objetivo, danoAtaque * ((bala.data["mult"] as number) || 1), true)
    if (nivelHielo > 0 && !objetivo.data["muerto"]) {
        objetivo.data["lentoHasta"] = game.runtime() + 1000 + 300 * nivelHielo
    }
    if (nivelExplosivas > 0) explosionBala(ox, oy, objetivo)

    if (perf <= 0) bala.destroy()
}

sprites.onOverlap(SpriteKind.ProyectilJugador, SpriteKind.Enemy, function (bala, bicho) {
    manejarImpactoBala(bala, bicho)
})

sprites.onOverlap(SpriteKind.ProyectilJugador, SpriteKind.JefeEnemigo, function (bala, jefe) {
    manejarImpactoBala(bala, jefe)
})

// Devuelve true si el golpe llego a hacer dano
function recibirDanoJugador(danoBase: number, origen: string): boolean {
    let ahora = game.runtime()
    if (estadoActual != EstadoJuego.Jugando) return false
    if (ahora < invulnerableHasta) return false
    if (zonaSegura(jugadorSprite.x, jugadorSprite.y)) return false

    if (esquivaProb > 0 && Math.randomRange(1, 100) <= esquivaProb) {
        invulnerableHasta = ahora + 250
        textoFlotante(jugadorSprite.x, jugadorSprite.y - 12, "ESQUIVA", 9)
        return false
    }

    invulnerableHasta = ahora + INVULNERABILIDAD_MS
    ultimoAtacante = origen
    ultimoDanoMs = tiempoPartidaMs

    let danoReal = Math.max(1, Math.floor(danoBase - armaduraReduccion))
    textoFlotante(jugadorSprite.x, jugadorSprite.y - 12, "-" + danoReal, 2)
    scene.cameraShake(2, 120)

    let habiaEscudo = puntosEscudoActivo > 0
    if (puntosEscudoActivo > 0) {
        puntosEscudoActivo -= danoReal
        if (puntosEscudoActivo < 0) {
            vidaActual += puntosEscudoActivo
            puntosEscudoActivo = 0
        }
        actualizarGraficoEscudo()
    } else {
        vidaActual -= danoReal
    }
    // V27: AEGIS devuelve el golpe en cuanto se rompe el escudo
    if (habiaEscudo && puntosEscudoActivo <= 0 && reliquias[4] && vidaActual > 0) ondaAegis()

    if (vidaActual <= 0) {
        if (vidasExtra > 0) {
            // Segunda vida: revives con la mitad y una explosion
            vidasExtra--
            vidaActual = Math.max(1, vidaMaxima * 0.5)
            invulnerableHasta = ahora + 2000
            scene.cameraShake(5, 400)
            crearAnillo(jugadorSprite.x, jugadorSprite.y, 70, 9, 300)
            for (let b of sprites.allOfKind(SpriteKind.Enemy)) {
                let dx = b.x - jugadorSprite.x
                let dy = b.y - jugadorSprite.y
                if (dx * dx + dy * dy <= 70 * 70) procesarDanoAEnemigo(b, danoAtaque * 3, true)
            }
            sprites.destroyAllSpritesOfKind(SpriteKind.ProyectilEnemigo)
            mostrarToast("HAS REVIVIDO!", "OTRA OPORTUNIDAD", 9)
        } else {
            morirJugador()
        }
    }
    return true
}

function morirJugador() {
    if (estadoActual == EstadoJuego.GameOver) return
    estadoActual = EstadoJuego.GameOver
    tiempoMuerteMs = game.runtime()
    opcionGameOverSel = 0
    goTick = 0

    controller.moveSprite(jugadorSprite, 0, 0)
    jugadorSprite.vx = 0
    jugadorSprite.vy = 0
    for (let b of sprites.allOfKind(SpriteKind.Enemy)) { b.vx = 0; b.vy = 0 }
    for (let j of sprites.allOfKind(SpriteKind.JefeEnemigo)) { j.vx = 0; j.vy = 0 }
    sprites.destroyAllSpritesOfKind(SpriteKind.ProyectilJugador)
    sprites.destroyAllSpritesOfKind(SpriteKind.ProyectilEnemigo)

    crearEfectoMuerte(jugadorSprite.x, jugadorSprite.y)
    crearAnillo(jugadorSprite.x, jugadorSprite.y, 30, 2, 400)
    jugadorSprite.setFlag(SpriteFlag.Invisible, true)
    scene.cameraShake(6, 600)
    music.setVolume(Math.map(volumenAudio, 0, 100, 0, 150))
    music.playTone(196, 300)

    finalizarPartida()
}

// Guarda estadisticas, records y comprueba misiones
function finalizarPartida() {
    comprobarMisiones()
    statKills += killsPartida
    statMonedas += monedasPartida
    statJefes += jefesPartida
    statMaxOleada = Math.max(statMaxOleada, oleadaActual)
    statMaxNivel = Math.max(statMaxNivel, nivelJugador)
    statMaxPts = Math.max(statMaxPts, puntosPuntuacion)
    if (nivelDificultad == 2) statNoche = Math.max(statNoche, oleadaActual)
    statPartidas++
    sumarPartida = 0
    guardarProgreso()

    nuevoRecord = puntosPuntuacion > obtenerRecordDificultad(nivelDificultad)
    guardarRecordDificultad(nivelDificultad, puntosPuntuacion)
}

sprites.onOverlap(SpriteKind.Player, SpriteKind.SemillaXP, function (jugador, gema) {
    // Solo se recoge si estamos jugando (evita perder XP o subir dos veces en el mismo frame)
    if (estadoActual != EstadoJuego.Jugando) return
    let base = (gema.data["xp"] as number) || 25
    gema.destroy()
    sonarNavegacion()

    xpActual += Math.floor(base * multiplicadorXP * COMBO_F_XP[comboTier])
    comprobarSubidaNivel()
})

function comprobarSubidaNivel() {
    if (xpActual >= xpSiguienteNivel) {
        nivelJugador++
        xpActual = xpActual - xpSiguienteNivel
        xpSiguienteNivel += 60
        comprobarMisiones()
        presentarTresOpcionesMejora()
    }
}

// Oro: logica comun (recogida normal y botin directo cuando hay demasiadas monedas en el suelo)
function ganarOroDirecto() {
    // El multiplicador de oro acumula decimales (antes 1.5x no daba nada)
    acumMonedas += multiplicadorMonedas * (comboTier >= 2 ? 1.25 : 1)
    let ganadas = Math.floor(acumMonedas)
    acumMonedas -= ganadas
    cantidadMonedas += ganadas
    monedasPartida += ganadas
}

sprites.onOverlap(SpriteKind.Player, SpriteKind.PocionVida, function (jugador, gemaVida) {
    if (estadoActual != EstadoJuego.Jugando) return
    gemaVida.destroy()
    sonarConfirmar()
    vidaActual = Math.min(vidaMaxima, vidaActual + 25)
    textoFlotante(jugador.x, jugador.y - 12, "+25", 7)
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.MonedaOro, function (jugador, moneda) {
    if (estadoActual != EstadoJuego.Jugando) return
    moneda.destroy()
    sonarNavegacion()
    ganarOroDirecto()
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (jugador, bicho) {
    if (estadoActual != EstadoJuego.Jugando) return
    let tipo = (bicho.data["tipo"] as number) || 0
    if (tipo == 5) {
        explotarBombita(bicho)
        return
    }
    let danoEnemigo = (bicho.data["dano"] as number) || 10
    let golpeo = recibirDanoJugador(danoEnemigo, NOMBRE_TIPO[tipo])
    if (golpeo && espinas > 0) procesarDanoAEnemigo(bicho, espinas, true)

    if (!bicho.data["muerto"]) {
        bicho.x += (bicho.x < jugador.x) ? -18 : 18
        bicho.y += (bicho.y < jugador.y) ? -18 : 18
    }
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.JefeEnemigo, function (jugador, jefe) {
    if (estadoActual != EstadoJuego.Jugando) return
    let danoJefe = (jefe.data["dano"] as number) || 30
    recibirDanoJugador(danoJefe, "JEFE")

    // Empujon al jefe para alejarlo del jugador
    jefe.x += (jefe.x < jugador.x) ? -30 : 30
    jefe.y += (jefe.y < jugador.y) ? -30 : 30
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.ProyectilEnemigo, function (jugador, bala) {
    if (estadoActual != EstadoJuego.Jugando) return
    let danoB = (bala.data["dano"] as number) || 10
    bala.destroy()
    recibirDanoJugador(danoB, "PROYECTIL")
})

// =========================================================
// V20: CIUDADES, RECURSOS, CRAFTEO, ARMAS, BOMBAS E INVENTARIO
// =========================================================

const CHUNK = 256
const RADIO_CIUDAD = 75
// V24: textos de cada idioma (0 espanol, 1 ingles, 2 frances, 3 aleman, 4 italiano, 5 japones)
// Solo letras ASCII: la fuente del juego no tiene tildes ni enes.
const NOMBRES_CIUDAD_C: string[][] = [
    ["VILLA ROBLE", "PUERTO SOL", "NIDO ALTO", "VALLE LUNA", "FUERTE PAZ", "ALDEA BRISA"],
    ["OAKFORD", "STONEBRIDGE", "MILLHAVEN", "RAVENSMERE", "WINDMERE", "ASHBURY"],
    ["VILLENEUVE", "MONTCLAIR", "PONT-ROUGE", "BELLEROSE", "SAINT-LUC", "FONTAINE"],
    ["SCHWARZDORF", "BERGHEIM", "WALDSTADT", "EICHENAU", "ROTHAUSEN", "LINDENBERG"],
    ["BORGO SOLE", "MONTE ROSSO", "VALLE VERDE", "PORTO LUNA", "CASTELLINO", "BELLAVISTA"],
    ["SAKURAMACHI", "YAMAZATO", "KAWAGOE", "HANAMURA", "MIZUNOSATO", "TAKAYAMA"]
]
const NOMBRES_NPC_C: string[][] = [
    ["MARTA", "BRUNO", "ELENA", "TOMAS", "LUCIA", "HUGO"],
    ["JOHN", "MARY", "OLIVER", "EMMA", "HARRY", "LUCY"],
    ["MARIE", "PIERRE", "CLAIRE", "LUC", "JULIE", "HENRI"],
    ["HANS", "ANNA", "KLAUS", "GRETA", "LUKAS", "HEIDI"],
    ["MARCO", "GIULIA", "LUCA", "SOFIA", "PAOLO", "ELENA"],
    ["HARU", "KENJI", "YUKI", "TARO", "AIKO", "RIN"]
]
// Saludo al entrar en el pueblo y palabra de "vecino"
const SALUDO_C: string[] = ["BIENVENIDO!", "WELCOME!", "BIENVENUE!", "WILLKOMMEN!", "BENVENUTO!", "YOKOSO!"]
const ROL_NOMBRE_C: string[] = ["VECINO", "NEIGHBOR", "VOISIN", "NACHBAR", "VICINO", "RINJIN"]
// Opciones de la casa: craftear, dormir, salir
const OPC_CRAFT_C: string[] = ["CRAFTEAR", "CRAFT", "FABRIQUER", "BAUEN", "CREA", "TSUKURU"]
const OPC_DORMIR_C: string[] = ["DORMIR", "SLEEP", "DORMIR", "RUHEN", "RIPOSA", "NERU"]
const OPC_SALIR_C: string[] = ["SALIR", "EXIT", "SORTIR", "RAUS", "ESCI", "DERU"]
// Frases del vecino (3 casas por pueblo). Maximo 13 letras por linea y 3 lineas
const ROL_FRASE_C: string[][] = [
    ["PASA, ESTA\nES TU CASA.", "CRAFTEA Y\nDESCANSA CON\nCALMA.", "AQUI ESTAS\nA SALVO."],
    ["COME IN, THIS\nIS YOUR HOME.", "CRAFT & REST\nIN PEACE.", "YOU ARE SAFE\nHERE, FRIEND."],
    ["ENTREZ, C'EST\nVOTRE MAISON.", "FABRIQUEZ ET\nREPOSEZ-VOUS\nEN PAIX.", "ICI VOUS ETES\nEN SECURITE."],
    ["KOMM HEREIN,\nDAS IST DEIN\nHAUS.", "BAUE UND RUHE\nDICH AUS.", "HIER BIST DU\nSICHER."],
    ["ENTRA, E CASA\nTUA, AMICO.", "CREA E RIPOSA\nIN PACE.", "QUI SEI AL\nSICURO."],
    ["HAIRE! KOKO\nWA ANATA NO\nIE DESU.", "TSUKUTTE\nYASUNDE NE.", "KOKO WA ANZEN\nDESU."]
]

// Posicion de las casas respecto al centro de la ciudad (x, y por casa)
const CASA_OFF: number[] = [-44, -20, 34, -24, -4, 34]

// V23: todas las casas son iguales (craftear y descansar). Nadie vende nada.

// Precio de descansar (las ciudades aliadas son gratis)
const PRECIO_DESCANSO = 8

// Materiales: 0 madera, 1 piedra, 2 fibra, 3 hierro, 4 polvora
// V22: 5 CACTUS (desierto), 6 CRISTAL (tundra), 7 ESPORAS (pantano / bosque)
const NUM_MATS = 8
const MAT_NOMBRE: string[] = ["MADERA", "PIEDRA", "FIBRA", "HIERRO", "POLVORA", "CACTUS", "CRISTAL", "ESPORAS"]
const MAT_ABR: string[] = ["MAD", "PIE", "FIB", "HIE", "POL", "CAC", "CRI", "ESP"]
const MAT_COL: number[] = [4, 1, 3, 9, 2, 7, 6, 11]
// Recursos del mapa: 0 arbol, 1 arbusto, 2 roca, 3 roca con hierro, 4 cactus, 5 cristal, 6 hongo
const HP_RECURSO: number[] = [5, 1, 6, 6, 4, 7, 1]

// Los arbustos y hongos se recogen al pasar por encima
function esRecolectable(rt: number): boolean {
    return rt == 1 || rt == 6
}

// Armas: 0 pistola, 1 espada, 2 arco, 3 escopeta, 4 hacha
const ARMA_NOMBRE: string[] = ["PISTOLA", "ESPADA", "ARCO", "ESCOPETA", "HACHA"]
const ARMA_DESC: string[] = [
    "DISPARO BASICO AUTOMATICO",
    "CERCA: CORTE EN ARCO",
    "FLECHAS QUE PERFORAN",
    "5 BALINES A CORTA DISTANCIA",
    "CERCA: GIRA EN 360 GRADOS"
]
const MULT_CAD: number[] = [1, 1.4, 1.7, 3.2, 2.8]
const SONIDO_ARMA: number[] = [880, 520, 660, 220, 330]
// Alcance de las armas cuerpo a cuerpo (0 = es un arma de disparo)
const ARMA_ALCANCE: number[] = [0, 36, 0, 0, 32]

// Recetas: 0 espada, 1 arco, 2 escopeta, 3 hacha, 4 bombas, 5 venda
// V22 (mejoras permanentes, max 3 cada una): 6 armadura, 7 botas, 8 amuleto, 9 hielo, 10 elixir
const REC_NOMBRE: string[] = ["ESPADA", "ARCO", "ESCOPETA", "HACHA", "2 BOMBAS", "VENDA", "ARMADURA", "BOTAS", "AMULETO", "HIELO", "ELIXIR"]
const REC_DESC: string[] = [
    "CERCA: CORTE EN ARCO",
    "FLECHAS QUE PERFORAN",
    "5 BALINES, CORTO ALCANCE",
    "CERCA: GIRA EN 360 GRADOS",
    "EXPLOTAN EN AREA (BOTON B)",
    "CURA 40 DE VIDA (MENU)",
    "-2 DANO RECIBIDO (MAX 3)",
    "+12 VELOCIDAD (MAX 3)",
    "+8% CRITICO (MAX 3)",
    "HIELO: RALENTIZA (MAX 3)",
    "+15 VIDA MAX (MAX 3)"
]
const MEJORA_MAX = 3
//                                        mad pie fib hie pol cac cri esp
const REC_COSTE: number[][] = [
    [2, 3, 0, 1, 0, 0, 0, 0],
    [4, 0, 4, 0, 0, 0, 0, 0],
    [3, 0, 0, 3, 2, 0, 0, 0],
    [3, 5, 2, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 2, 0, 0, 0],
    [0, 0, 4, 0, 0, 0, 0, 0],
    [0, 0, 3, 1, 0, 6, 0, 0],
    [2, 0, 3, 0, 0, 0, 0, 4],
    [0, 2, 0, 1, 0, 0, 4, 0],
    [0, 0, 0, 0, 2, 0, 5, 1],
    [0, 0, 0, 0, 0, 3, 2, 3]
]
const INV_FILAS = 8
const INV_DESC: string[] = [
    ARMA_DESC[0], ARMA_DESC[1], ARMA_DESC[2], ARMA_DESC[3], ARMA_DESC[4],
    "A: EL BOTON B LANZA BOMBAS",
    "A: EL BOTON B HACE DASH",
    "A: CURA 40 DE VIDA"
]

// Estado del mundo y del jugador (V20)
let chunksCargados: Chunk[] = []
let ciudadesActivas: Ciudad[] = []
let proxMundo: number = 0
let npcCerca: Sprite = null
let hayCiudadCerca: boolean = false
let ciudadCercanaX: number = 0
let ciudadCercanaY: number = 0
let ciudadActualNombre: string = ""
let mats: number[] = [0, 0, 0, 0, 0, 0, 0, 0]
let tengoArma: boolean[] = [true, false, false, false, false]
let armaEquipada: number = 0
let bombas: number = 0
let vendas: number = 0
let modoB: number = 1
let proxBomba: number = 0
let invSel: number = 0
let craftSel: number = 0
let casaSel: number = 0
let casaNombre: string = ""
let casaFrase: string = ""
let retratoNPC: Image = null
let descansoHasta: number = 0
let casaRol: number = 0
let casaIdioma: number = 0
let casaAliada: boolean = false
let casaOpc: string[] = ["SALIR"]
let casaAcc: number[] = [4]
let ciudadesAliadas: string[] = []
let ciudadCercanaNombre: string = ""
let ciudadCercanaDist: number = 0
// Cache de ciudades candidatas para la flecha guia (solo se recalcula al cambiar de chunk)
let escanCx: number = -99999
let escanCy: number = -99999
let escanArras: number = -1
let candX: number[] = []
let candY: number[] = []
let candN: string[] = []
// Reparto de la IA enemiga entre frames y espera del escaneo cuerpo a cuerpo
let frameIA: number = 0
let proxEscaneoCuerpo: number = 0
let npcsCache: Sprite[] = []

// ---------------------------------------------------------
// Arte nuevo
// ---------------------------------------------------------

const imgIconoPistola = img`
    ........
    .bbbbbbb
    .bbbbbbb
    .eeb....
    .ee.....
    .ee.....
    ........
    ........
`
const imgIconoEspada = img`
    ......1f
    .....11f
    ....11f.
    .4.11f..
    ..411...
    ...4....
    ..e.4...
    .ee.....
`
const imgIconoArco = img`
    .ee.....
    e.e.....
    e..e....
    e...1111
    e..e....
    e.e.....
    .ee.....
    ........
`
const imgIconoEscopeta = img`
    ........
    .bbbbbbb
    bbbbbbbb
    eeee4...
    .eeee...
    ..ee....
    ........
    ........
`
const imgIconoHacha = img`
    .bbb....
    bbbbb.e.
    bbbb.e..
    .bb.e...
    ...e....
    ..e.....
    .e......
    e.......
`
const imgIconoBomba = img`
    .....45.
    ....e...
    ...fff..
    ..f232f.
    .f2222f.
    .f2222f.
    ..ffff..
    ........
`
const imgIconoVenda = img`
    .111111.
    11122111
    11122111
    12222221
    12222221
    11122111
    11122111
    .111111.
`
const imgIconoCasa = img`
    ...22...
    ..2222..
    .222222.
    22222222
    .dddddd.
    .ddeedd.
    .ddeedd.
    .dddddd.
`
const imgIconoArmadura = img`
    .77..77.
    77777777
    7f7777f7
    77777777
    .777777.
    .777777.
    .77ff77.
    ..7..7..
`
const imgIconoBotas = img`
    ........
    .44.....
    .44.....
    .44.....
    .444....
    .44444..
    .ffffff.
    ........
`
const imgIconoAmuleto = img`
    .5....5.
    ..5..5..
    ...55...
    ..9999..
    .991199.
    .999999.
    ..9999..
    ...99...
`
const imgIconoHielo = img`
    ...11...
    .1.11.1.
    ..1991..
    11999911
    ..1991..
    .1.11.1.
    ...11...
    ........
`
const imgIconoElixir = img`
    ..eeee..
    ...11...
    ...11...
    ..1771..
    .177771.
    .177771.
    .177771.
    ..1111..
`
const FRAMES_BOMBA: Image[] = [imgIconoBomba.doubled(), reemplazarColor(imgIconoBomba, 2, 5).doubled()]
const ICONOS_INV: Image[] = [imgIconoPistola, imgIconoEspada, imgIconoArco, imgIconoEscopeta, imgIconoHacha, imgIconoBomba, imgIconoRayo, imgIconoVenda]
ICONOS_TIENDA = [imgGemaVida, imgIconoEscudo, imgIconoVenda, imgIconoBomba, imgIconoBomba, imgIconoHacha, imgIconoArco, imgIconoSalir]
const ICONOS_REC: Image[] = [imgIconoEspada, imgIconoArco, imgIconoEscopeta, imgIconoHacha, imgIconoBomba, imgIconoVenda, imgIconoArmadura, imgIconoBotas, imgIconoAmuleto, imgIconoHielo, imgIconoElixir]

const imgBalaArco: Image = reemplazarColor(reemplazarColor(imgBala, 4, 8), 5, 9)
const imgPerdigon: Image = crearImgPerdigon()

function crearImgPerdigon(): Image {
    let p = image.create(4, 4)
    p.fill(4)
    p.setPixel(0, 0, 0)
    p.setPixel(3, 0, 0)
    p.setPixel(0, 3, 0)
    p.setPixel(3, 3, 0)
    p.setPixel(1, 1, 5)
    return p
}

function crearImgArbol(v: number): Image {
    let a = image.create(24, 30)
    a.fillRect(10, 18, 5, 12, 15)
    a.fillRect(11, 18, 3, 12, 14)
    if (v == 0) {
        a.fillCircle(12, 11, 11, 15)
        a.fillCircle(12, 11, 10, 7)
        a.fillCircle(16, 15, 5, 6)
        a.fillCircle(9, 7, 3, 6)
        a.setPixel(7, 5, 1)
        a.setPixel(8, 4, 1)
        a.fillRect(14, 8, 2, 2, 2)
        a.fillRect(7, 13, 2, 2, 2)
    } else {
        for (let i = 0; i < 4; i++) {
            let w = 5 + i * 4
            let x0 = 12 - Math.floor(w / 2)
            let y0 = 1 + i * 5
            a.fillRect(x0, y0, w, 7, 15)
            a.fillRect(x0 + 1, y0 + 1, w - 2, 5, 7)
            a.fillRect(x0 + Math.floor(w / 2), y0 + 1, Math.floor(w / 2) - 1, 5, 6)
        }
        a.fillRect(11, 20, 3, 10, 14)
    }
    return a
}

function crearImgArbusto(v: number): Image {
    let b = image.create(14, 10)
    b.fillCircle(4, 6, 4, 15)
    b.fillCircle(10, 6, 4, 15)
    b.fillCircle(7, 4, 4, 15)
    b.fillCircle(4, 6, 3, 7)
    b.fillCircle(10, 6, 3, 7)
    b.fillCircle(7, 4, 3, 7)
    b.fillRect(8, 6, 3, 2, 6)
    b.setPixel(5, 3, 6)
    if (v == 1) {
        b.setPixel(4, 6, 2)
        b.setPixel(10, 5, 2)
        b.setPixel(7, 3, 2)
        b.setPixel(6, 7, 2)
    }
    return b
}

function crearImgRoca(v: number): Image {
    let r = image.create(14, 12)
    r.fillCircle(7, 6, 6, 15)
    r.fillCircle(7, 6, 5, 11)
    r.fillRect(3, 3, 3, 2, 1)
    r.fillRect(8, 9, 4, 2, 12)
    if (v == 1) {
        r.fillRect(5, 6, 2, 2, 4)
        r.fillRect(9, 4, 2, 2, 4)
        r.fillRect(4, 9, 2, 1, 4)
    }
    return r
}

// ---------------------------------------------------------
// V24: CULTURAS (idiomas). Cada idioma tiene su tipo de pueblo
// 0 espanol, 1 ingles, 2 frances, 3 aleman, 4 italiano, 5 japones (romaji)
// ---------------------------------------------------------
const NUM_CULTURAS = 6

// Color mas oscuro para las lineas del tejado
function sombraTecho(c: number): number {
    if (c == 4) return 2
    if (c == 2) return 14
    if (c == 8) return 12
    if (c == 9) return 8
    return 15
}

// Trapecio de tejado: de y0 a y1, con media anchura inicial h0 y final h1
function dibujarTecho(c: Image, y0: number, y1: number, h0: number, h1: number, col: number, rayas: number) {
    let filas = y1 - y0
    let oscuro = sombraTecho(col)
    for (let r = 0; r <= filas; r++) {
        let half = Math.min(19, h0 + Math.floor((h1 - h0) * r / Math.max(1, filas)))
        c.drawLine(20 - half, y0 + r, 19 + half, y0 + r, col)
        if (r % rayas == rayas - 1) c.drawLine(21 - half, y0 + r, 18 + half, y0 + r, oscuro)
        c.setPixel(20 - half, y0 + r, 15)
        c.setPixel(19 + half, y0 + r, 15)
    }
    c.drawLine(21 - Math.min(19, h0), y0 - 1, 18 + Math.min(19, h0), y0 - 1, 15)
}

function crearCasaES(techo: number): Image {
    let c = image.create(40, 36)
    c.fillRect(3, 14, 34, 21, 15)
    c.fillRect(4, 15, 32, 19, 1)
    c.fillRect(31, 15, 5, 19, 13)
    c.fillRect(4, 31, 32, 3, 13)
    dibujarTecho(c, 5, 13, 11, 19, techo, 3)
    c.drawLine(0, 14, 39, 14, 15)
    c.fillRect(28, 0, 5, 7, 15)
    c.fillRect(29, 1, 3, 6, 13)
    // puerta con arco
    c.fillRect(16, 23, 9, 12, 15)
    c.fillRect(18, 22, 5, 1, 15)
    c.fillRect(17, 24, 7, 10, 14)
    c.fillRect(19, 23, 3, 1, 14)
    c.setPixel(22, 29, 5)
    // ventanas con postigos azules y macetas
    for (let k = 0; k < 2; k++) {
        let x = (k == 0) ? 8 : 27
        c.fillRect(x, 20, 6, 7, 15)
        c.fillRect(x + 1, 21, 4, 5, 9)
        c.fillRect(x - 2, 20, 2, 7, 8)
        c.fillRect(x + 6, 20, 2, 7, 8)
        c.fillRect(x - 1, 27, 8, 1, 14)
        c.setPixel(x, 26, 2)
        c.setPixel(x + 2, 26, 3)
        c.setPixel(x + 4, 26, 2)
    }
    return c
}

function crearCasaEN(techo: number): Image {
    let c = image.create(40, 36)
    c.fillRect(3, 14, 34, 21, 15)
    c.fillRect(4, 15, 32, 19, 11)
    for (let k = 0; k < 4; k++) {
        let y = 18 + k * 4
        c.drawLine(4, y, 35, y, 12)
        let off = (k % 2 == 0) ? 0 : 4
        for (let x = 6 + off; x < 35; x += 8) c.drawLine(x, y - 3, x, y - 1, 12)
    }
    dibujarTecho(c, 1, 13, 5, 19, techo, 2)
    c.drawLine(0, 14, 39, 14, 15)
    c.fillRect(29, 0, 6, 9, 15)
    c.fillRect(30, 1, 4, 8, 12)
    c.fillRect(30, 1, 4, 1, 11)
    // puerta de madera
    c.fillRect(16, 22, 9, 13, 15)
    c.fillRect(17, 23, 7, 12, 14)
    c.drawLine(20, 23, 20, 34, 15)
    c.setPixel(22, 29, 5)
    // ventanas con cruz
    for (let k = 0; k < 2; k++) {
        let x = (k == 0) ? 8 : 27
        c.fillRect(x, 20, 6, 6, 15)
        c.fillRect(x + 1, 21, 4, 4, 9)
        c.drawLine(x + 3, 21, x + 3, 24, 15)
        c.drawLine(x + 1, 22, x + 4, 22, 15)
        c.fillRect(x - 1, 26, 8, 1, 1)
    }
    return c
}

function crearCasaFR(techo: number): Image {
    let c = image.create(40, 36)
    c.fillRect(3, 16, 34, 19, 15)
    c.fillRect(4, 17, 32, 17, 13)
    c.fillRect(4, 17, 2, 17, 1)
    c.fillRect(34, 17, 2, 17, 1)
    c.drawLine(4, 17, 35, 17, 1)
    dibujarTecho(c, 3, 15, 9, 19, techo, 3)
    c.drawLine(0, 16, 39, 16, 15)
    // buhardilla
    c.fillRect(16, 6, 8, 8, 15)
    c.fillRect(17, 7, 6, 6, 9)
    c.drawLine(20, 7, 20, 12, 1)
    c.fillRect(15, 5, 10, 1, 1)
    c.fillRect(30, 0, 5, 8, 15)
    c.fillRect(31, 1, 3, 7, 14)
    // puerta doble azul
    c.fillRect(16, 23, 9, 12, 15)
    c.fillRect(17, 24, 3, 11, 8)
    c.fillRect(21, 24, 3, 11, 8)
    c.setPixel(19, 29, 5)
    c.setPixel(21, 29, 5)
    // ventanas altas con contraventanas
    for (let k = 0; k < 2; k++) {
        let x = (k == 0) ? 8 : 27
        c.fillRect(x, 20, 6, 10, 15)
        c.fillRect(x + 1, 21, 4, 8, 9)
        c.drawLine(x + 1, 25, x + 4, 25, 15)
        c.fillRect(x - 2, 20, 2, 10, 9)
        c.fillRect(x + 6, 20, 2, 10, 9)
        c.drawLine(x - 1, 20, x - 1, 29, 8)
        c.drawLine(x + 7, 20, x + 7, 29, 8)
    }
    return c
}

function crearCasaDE(techo: number): Image {
    let c = image.create(40, 36)
    c.fillRect(3, 14, 34, 21, 15)
    c.fillRect(4, 15, 32, 19, 1)
    // entramado de madera
    let postes: number[] = [4, 14, 25, 34]
    for (let p of postes) c.fillRect(p, 15, 2, 19, 14)
    c.fillRect(4, 15, 32, 2, 14)
    c.fillRect(4, 22, 32, 1, 14)
    c.fillRect(4, 33, 32, 1, 14)
    c.drawLine(6, 17, 12, 21, 14)
    c.drawLine(35, 17, 27, 21, 14)
    dibujarTecho(c, 1, 13, 4, 19, techo, 3)
    c.drawLine(0, 14, 39, 14, 15)
    // ventanita del desvan
    c.fillRect(17, 5, 6, 6, 15)
    c.fillRect(18, 6, 4, 4, 9)
    c.drawLine(20, 6, 20, 9, 1)
    // puerta
    c.fillRect(16, 23, 9, 12, 15)
    c.fillRect(17, 24, 7, 11, 14)
    c.drawRect(18, 25, 5, 4, 15)
    c.setPixel(22, 30, 5)
    // ventanas con jardinera
    for (let k = 0; k < 2; k++) {
        let x = (k == 0) ? 7 : 28
        c.fillRect(x, 18, 6, 7, 15)
        c.fillRect(x + 1, 19, 4, 5, 9)
        c.drawLine(x + 3, 19, x + 3, 23, 14)
        c.fillRect(x - 1, 25, 8, 2, 14)
        c.setPixel(x, 24, 2)
        c.setPixel(x + 2, 24, 3)
        c.setPixel(x + 4, 24, 2)
        c.setPixel(x + 6, 24, 5)
    }
    return c
}

function crearCasaIT(techo: number): Image {
    let c = image.create(40, 36)
    c.fillRect(3, 14, 34, 21, 15)
    c.fillRect(4, 15, 32, 19, 13)
    c.fillRect(4, 32, 32, 2, 4)
    dibujarTecho(c, 7, 13, 11, 16, techo, 3)
    c.drawLine(0, 14, 39, 14, 15)
    // campanile
    c.fillRect(27, 1, 9, 14, 15)
    c.fillRect(28, 2, 7, 13, 13)
    c.fillRect(30, 4, 3, 5, 15)
    c.setPixel(30, 4, 13)
    c.setPixel(32, 4, 13)
    c.drawLine(28, 0, 34, 0, techo)
    c.drawLine(29, 1, 33, 1, techo)
    // puerta verde con arco
    c.fillRect(16, 23, 9, 12, 15)
    c.fillRect(18, 22, 5, 1, 15)
    c.fillRect(17, 24, 7, 10, 7)
    c.fillRect(19, 23, 3, 1, 7)
    c.drawLine(20, 24, 20, 33, 6)
    c.setPixel(22, 29, 5)
    // ventanas con postigos verdes
    for (let k = 0; k < 2; k++) {
        let x = (k == 0) ? 8 : 28
        c.fillRect(x, 20, 5, 7, 15)
        c.fillRect(x + 1, 21, 3, 5, 9)
        c.fillRect(x - 2, 20, 2, 7, 7)
        c.fillRect(x + 5, 20, 2, 7, 7)
        c.setPixel(x + 1, 27, 2)
        c.setPixel(x + 3, 27, 3)
    }
    return c
}

function crearCasaJP(techo: number): Image {
    let c = image.create(40, 36)
    // cuerpo inferior
    c.fillRect(4, 21, 32, 14, 15)
    c.fillRect(5, 22, 30, 12, 1)
    c.fillRect(5, 22, 2, 12, 2)
    c.fillRect(33, 22, 2, 12, 2)
    // puerta corredera (shoji)
    c.fillRect(15, 24, 10, 11, 15)
    c.fillRect(16, 25, 8, 10, 13)
    c.drawLine(20, 25, 20, 34, 14)
    c.drawLine(16, 29, 23, 29, 14)
    // ventanas shoji
    for (let k = 0; k < 2; k++) {
        let x = (k == 0) ? 8 : 27
        c.fillRect(x, 25, 5, 6, 15)
        c.fillRect(x + 1, 26, 3, 4, 13)
        c.drawLine(x + 2, 26, x + 2, 29, 14)
    }
    // tejado inferior (aleros curvados)
    for (let r = 0; r < 6; r++) {
        let half = 14 + r
        c.drawLine(20 - half, 15 + r, 19 + half, 15 + r, techo)
        c.setPixel(20 - half, 15 + r, 15)
        c.setPixel(19 + half, 15 + r, 15)
    }
    c.drawLine(2, 21, 37, 21, 15)
    c.setPixel(1, 20, 15)
    c.setPixel(38, 20, 15)
    c.setPixel(1, 19, 15)
    c.setPixel(38, 19, 15)
    // cuerpo superior
    c.fillRect(11, 9, 18, 6, 15)
    c.fillRect(12, 10, 16, 5, 1)
    c.fillRect(12, 10, 2, 5, 2)
    c.fillRect(26, 10, 2, 5, 2)
    c.fillRect(18, 10, 4, 4, 13)
    c.drawLine(20, 10, 20, 13, 14)
    // tejado superior
    for (let r = 0; r < 6; r++) {
        let half = 7 + r
        c.drawLine(20 - half, 3 + r, 19 + half, 3 + r, techo)
        c.setPixel(20 - half, 3 + r, 15)
        c.setPixel(19 + half, 3 + r, 15)
    }
    c.drawLine(7, 9, 32, 9, 15)
    c.setPixel(6, 8, 15)
    c.setPixel(33, 8, 15)
    // remate
    c.fillRect(19, 0, 2, 3, 15)
    c.setPixel(19, 1, 5)
    c.setPixel(20, 1, 5)
    return c
}

function crearImgCasaCultura(idioma: number, techo: number): Image {
    if (idioma == 1) return crearCasaEN(techo)
    if (idioma == 2) return crearCasaFR(techo)
    if (idioma == 3) return crearCasaDE(techo)
    if (idioma == 4) return crearCasaIT(techo)
    if (idioma == 5) return crearCasaJP(techo)
    return crearCasaES(techo)
}

// NPC: forma del sombrero (0 normal, 1 boina, 2 tirol, 3 copa, 4 kasa, 5 paja)
function crearImgNPC(pri: number, osc: number, sombrero: number, forma: number): Image {
    let im = recolorSkin(imgJugadorBase, pri, osc)
    if (forma == 1) {
        im.fillRect(3, 1, 10, 2, sombrero)
        im.fillRect(5, 0, 6, 1, sombrero)
        im.fillRect(3, 3, 10, 1, 15)
    } else if (forma == 2) {
        im.fillRect(5, 0, 6, 3, sombrero)
        im.fillRect(3, 3, 10, 1, sombrero)
        im.fillRect(5, 2, 6, 1, 15)
        im.setPixel(10, 0, 2)
    } else if (forma == 3) {
        im.fillRect(5, 0, 6, 3, 15)
        im.fillRect(5, 2, 6, 1, sombrero)
        im.fillRect(3, 3, 10, 1, 15)
    } else if (forma == 4) {
        im.fillRect(7, 0, 2, 1, sombrero)
        im.fillRect(5, 1, 6, 1, sombrero)
        im.fillRect(3, 2, 10, 1, sombrero)
        im.fillRect(1, 3, 14, 1, 15)
    } else if (forma == 5) {
        im.fillRect(5, 0, 6, 3, sombrero)
        im.fillRect(5, 2, 6, 1, 2)
        im.fillRect(1, 3, 14, 1, sombrero)
    } else {
        im.fillRect(4, 0, 8, 3, sombrero)
        im.fillRect(3, 3, 10, 1, 15)
    }
    return im
}

function recolor2(src: Image, de1: number, a1: number, de2: number, a2: number): Image {
    let r = src.clone()
    r.replace(de1, a1)
    r.replace(de2, a2)
    return r
}

function crearImgCactus(v: number): Image {
    let c = image.create(16, 24)
    // contornos
    c.fillRect(5, 1, 7, 23, 15)
    c.fillRect(0, 9, 7, 5, 15)
    c.fillRect(0, 3, 5, 8, 15)
    if (v == 0) {
        c.fillRect(10, 12, 6, 5, 15)
        c.fillRect(11, 6, 5, 8, 15)
    }
    // relleno
    c.fillRect(6, 2, 5, 21, 7)
    c.fillRect(1, 10, 6, 3, 7)
    c.fillRect(1, 4, 3, 7, 7)
    if (v == 0) {
        c.fillRect(10, 13, 5, 3, 7)
        c.fillRect(12, 7, 3, 7, 7)
    }
    // sombra y espinas
    c.fillRect(9, 2, 1, 21, 6)
    c.setPixel(7, 6, 1)
    c.setPixel(8, 12, 1)
    c.setPixel(7, 17, 1)
    c.setPixel(2, 6, 1)
    if (v == 0) c.setPixel(13, 9, 1)
    if (v == 1) {
        c.fillRect(7, 0, 3, 2, 2)
        c.setPixel(8, 0, 5)
    }
    return c
}

function dibujarCristal(im: Image, cx: number, base: number, alto: number, mitad: number) {
    let top = base - alto
    let corte = Math.floor(alto * 0.65)
    for (let i = 0; i <= alto; i++) {
        let h = (i < corte) ? Math.floor(mitad * i / corte) : mitad
        im.drawLine(cx - h - 1, top + i, cx + h + 1, top + i, 15)
    }
    for (let i = 1; i < alto; i++) {
        let h = (i < corte) ? Math.floor(mitad * i / corte) : mitad
        im.drawLine(cx - h, top + i, cx + h, top + i, 9)
        im.setPixel(cx + h, top + i, 8)
    }
    im.drawLine(cx - 1, top + 3, cx - 1, base - 3, 1)
}

function crearImgCristal(v: number): Image {
    let c = image.create(18, 20)
    if (v == 0) {
        dibujarCristal(c, 4, 19, 9, 2)
        dibujarCristal(c, 14, 19, 11, 2)
        dibujarCristal(c, 9, 19, 17, 4)
    } else {
        dibujarCristal(c, 5, 19, 12, 3)
        dibujarCristal(c, 12, 19, 16, 3)
    }
    return c
}

function crearImgHongo(v: number): Image {
    let h = image.create(12, 12)
    let capa = (v == 0) ? 2 : 11
    let punto = (v == 0) ? 1 : 9
    h.fillCircle(6, 5, 5, 15)
    h.fillCircle(6, 5, 4, capa)
    h.fillRect(0, 7, 12, 5, 0)
    h.fillRect(1, 6, 10, 2, 15)
    h.fillRect(2, 6, 8, 1, capa)
    h.fillRect(4, 8, 4, 4, 15)
    h.fillRect(5, 8, 2, 3, 1)
    h.setPixel(4, 3, punto)
    h.setPixel(7, 2, punto)
    h.setPixel(8, 5, punto)
    return h
}

const IMG_ARBOL: Image[] = [crearImgArbol(0), crearImgArbol(1)]
const IMG_ARBUSTO: Image[] = [crearImgArbusto(0), crearImgArbusto(1)]
const IMG_ARBOL_NIEVE: Image[] = [recolor2(IMG_ARBOL[0], 7, 1, 6, 9), recolor2(IMG_ARBOL[1], 7, 1, 6, 9)]
const IMG_ARBUSTO_SECO: Image[] = [recolor2(IMG_ARBUSTO[0], 7, 4, 6, 14), recolor2(IMG_ARBUSTO[1], 7, 4, 6, 14)]
const IMG_ARBUSTO_NIEVE: Image[] = [recolor2(IMG_ARBUSTO[0], 7, 9, 6, 1), recolor2(IMG_ARBUSTO[1], 7, 9, 6, 1)]
const IMG_CACTUS: Image[] = [crearImgCactus(0), crearImgCactus(1)]
const IMG_CRISTAL: Image[] = [crearImgCristal(0), crearImgCristal(1)]
const IMG_HONGO: Image[] = [crearImgHongo(0), crearImgHongo(1)]
const IMG_ROCA: Image[] = [crearImgRoca(0), crearImgRoca(1)]

// Tejados de las 3 variantes de casa de cada idioma
const TECHOS_C: number[][] = [[4, 2, 14], [14, 12, 2], [8, 12, 2], [2, 14, 12], [4, 2, 14], [12, 8, 2]]
// Ropa de los 3 vecinos de cada idioma: (principal, oscuro, sombrero, forma) x 3
const NPC_DEF: number[][] = [
    [3, 2, 2, 0, 7, 6, 5, 0, 13, 14, 4, 0],
    [7, 6, 2, 3, 2, 14, 5, 3, 9, 8, 1, 3],
    [9, 8, 2, 1, 1, 13, 8, 1, 2, 14, 15, 1],
    [7, 6, 6, 2, 2, 14, 7, 2, 1, 13, 6, 2],
    [4, 2, 5, 5, 7, 6, 13, 5, 2, 14, 13, 5],
    [9, 8, 13, 4, 2, 14, 4, 4, 12, 15, 13, 4]
]

function crearCasasCultura(): Image[][] {
    let r: Image[][] = []
    for (let i = 0; i < NUM_CULTURAS; i++) {
        let fila: Image[] = []
        for (let v = 0; v < 3; v++) fila.push(crearImgCasaCultura(i, TECHOS_C[i][v]))
        r.push(fila)
    }
    return r
}

function crearNpcsCultura(): Image[][] {
    let r: Image[][] = []
    for (let i = 0; i < NUM_CULTURAS; i++) {
        let fila: Image[] = []
        let d = NPC_DEF[i]
        for (let v = 0; v < 3; v++) {
            fila.push(crearImgNPC(d[v * 4], d[v * 4 + 1], d[v * 4 + 2], d[v * 4 + 3]))
        }
        r.push(fila)
    }
    return r
}

const IMG_CASAS_C: Image[][] = crearCasasCultura()
const IMG_NPC_C: Image[][] = crearNpcsCultura()

function crearImgPozo(): Image {
    let p = image.create(18, 18)
    p.fillCircle(9, 10, 8, 15)
    p.fillCircle(9, 10, 7, 13)
    p.fillCircle(9, 10, 5, 15)
    p.fillCircle(9, 10, 4, 8)
    p.fillRect(6, 9, 3, 1, 9)
    return p
}
const IMG_POZO: Image = crearImgPozo()

// ---------------------------------------------------------
// Mundo por chunks: ciudades y recursos (determinista)
// ---------------------------------------------------------

function hashChunk(cx: number, cy: number, salt: number): number {
    return Math.abs(((cx * 92821) ^ (cy * 68917) ^ (salt * 51787)) % 4093)
}

// V22: el mundo se divide en celdas de 10x10 chunks (2560 px). Cada celda tiene como mucho
// UNA ciudad, en un punto aleatorio lejos de los bordes. La celda (0,0) es la del inicio.
const CELDA = 10

function celdaCX(gx: number, gy: number): number {
    if (gx == 0 && gy == 0) return 1
    return gx * CELDA + 2 + hashMacro(gx, gy, 21) % 6
}

function celdaCY(gx: number, gy: number): number {
    if (gx == 0 && gy == 0) return 1
    return gy * CELDA + 2 + hashMacro(gx, gy, 22) % 6
}

function celdaTieneCiudad(gx: number, gy: number): boolean {
    if (gx == 0 && gy == 0) return true
    return hashMacro(gx, gy, 1) % 100 < 70
}

function esCiudad(cx: number, cy: number): boolean {
    let gx = Math.floor(cx / CELDA)
    let gy = Math.floor(cy / CELDA)
    if (celdaCX(gx, gy) != cx || celdaCY(gx, gy) != cy) return false
    return celdaTieneCiudad(gx, gy)
}

function ciudadX(cx: number, cy: number): number {
    return cx * CHUNK + 60 + hashChunk(cx, cy, 2) % 137
}

function ciudadY(cx: number, cy: number): number {
    return cy * CHUNK + 60 + hashChunk(cx, cy, 3) % 137
}

// V24: idioma (tipo de pueblo) de cada ciudad. Cada zona de 2x2 celdas habla un idioma,
// la zona de inicio es espanola y los pueblos en bosques de cerezos son japoneses.
function culturaCiudad(cx: number, cy: number): number {
    if (biomaEn(ciudadX(cx, cy), ciudadY(cx, cy)) == 8) return 5
    let bx = Math.floor(Math.floor(cx / CELDA) / 2)
    let by = Math.floor(Math.floor(cy / CELDA) / 2)
    if (bx == 0 && by == 0) return 0
    return hashMacro(bx, by, 71) % NUM_CULTURAS
}

function nombreCiudad(cx: number, cy: number, idioma: number): string {
    let lista = NOMBRES_CIUDAD_C[idioma]
    return lista[hashChunk(cx, cy, 5) % lista.length]
}


function chunkCargado(cx: number, cy: number): boolean {
    for (let ch of chunksCargados) {
        if (ch.cx == cx && ch.cy == cy) return true
    }
    return false
}

function ciudadEn(x: number, y: number): Ciudad {
    for (let c of ciudadesActivas) {
        let dx = x - c.x
        let dy = y - c.y
        if (dx * dx + dy * dy < RADIO_CIUDAD * RADIO_CIUDAD) return c
    }
    return null
}

// V24: variantes de recursos por bioma. Cambia colores por pixel (permite intercambiar colores)
function recolorMapa(src: Image, de: number[], a: number[]): Image {
    let r = src.clone()
    for (let y = 0; y < src.height; y++) {
        for (let x = 0; x < src.width; x++) {
            let i = de.indexOf(src.getPixel(x, y))
            if (i >= 0) r.setPixel(x, y, a[i])
        }
    }
    return r
}

const IMG_ARBOL_JUNGLA: Image[] = [recolorMapa(IMG_ARBOL[0], [7, 6], [6, 7]), recolorMapa(IMG_ARBOL[1], [7, 6], [6, 7])]
const IMG_ARBOL_CEREZO: Image[] = [recolorMapa(IMG_ARBOL[0], [7, 6], [3, 11]), recolorMapa(IMG_ARBOL[1], [7, 6], [3, 11])]
const IMG_ARBUSTO_QUEMADO: Image[] = [recolorMapa(IMG_ARBUSTO[0], [7, 6], [12, 14]), recolorMapa(IMG_ARBUSTO[1], [7, 6], [12, 14])]
const IMG_ARBUSTO_JUNGLA: Image[] = [recolorMapa(IMG_ARBUSTO[0], [7, 6], [6, 7]), recolorMapa(IMG_ARBUSTO[1], [7, 6], [6, 7])]
const IMG_ARBUSTO_CEREZO: Image[] = [recolorMapa(IMG_ARBUSTO[0], [7, 6], [3, 11]), recolorMapa(IMG_ARBUSTO[1], [7, 6], [3, 11])]
const IMG_ROCA_MESA: Image[] = [recolorMapa(IMG_ROCA[0], [11, 12, 1], [13, 14, 1]), recolorMapa(IMG_ROCA[1], [11, 12, 1], [13, 14, 1])]
const IMG_ROCA_VOLCAN: Image[] = [recolorMapa(IMG_ROCA[0], [11, 12, 1], [14, 15, 13]), recolorMapa(IMG_ROCA[1], [11, 12, 1], [14, 15, 13])]
const IMG_ROCA_MONTANA: Image[] = [recolorMapa(IMG_ROCA[0], [11, 12], [13, 11]), recolorMapa(IMG_ROCA[1], [11, 12], [13, 11])]
const IMG_CRISTAL_ROJO: Image[] = [recolorMapa(IMG_CRISTAL[0], [9, 8], [2, 14]), recolorMapa(IMG_CRISTAL[1], [9, 8], [2, 14])]

function imagenRecurso(rt: number, v: number, b: number): Image {
    if (rt == 0) {
        if (b == 3) return IMG_ARBOL_NIEVE[v]
        if (b == 7) return IMG_ARBOL_JUNGLA[v]
        if (b == 8) return IMG_ARBOL_CEREZO[v]
        return IMG_ARBOL[v]
    }
    if (rt == 1) {
        if (b == 2 || b == 5) return IMG_ARBUSTO_SECO[v]
        if (b == 3) return IMG_ARBUSTO_NIEVE[v]
        if (b == 6) return IMG_ARBUSTO_QUEMADO[v]
        if (b == 7) return IMG_ARBUSTO_JUNGLA[v]
        if (b == 8) return IMG_ARBUSTO_CEREZO[v]
        return IMG_ARBUSTO[v]
    }
    if (rt == 2 || rt == 3) {
        let h = (rt == 3) ? 1 : 0
        if (b == 5) return IMG_ROCA_MESA[h]
        if (b == 6) return IMG_ROCA_VOLCAN[h]
        if (b == 9) return IMG_ROCA_MONTANA[h]
        return IMG_ROCA[h]
    }
    if (rt == 4) return IMG_CACTUS[v]
    if (rt == 5) return (b == 6) ? IMG_CRISTAL_ROJO[v] : IMG_CRISTAL[v]
    return IMG_HONGO[v]
}

function crearRecurso(ch: Chunk, rt: number, x: number, y: number, v: number, b: number) {
    let s = sprites.create(imagenRecurso(rt, v, b), SpriteKind.Recurso)
    s.setPosition(x, y)
    s.z = (rt == 0 || rt == 4) ? 0.7 : 0.6
    s.data["rt"] = rt
    s.data["hp"] = HP_RECURSO[rt]
    ch.sprites.push(s)
}

// Que recurso sale en cada bioma. roll: 0-99. r2: 0-99 (para elegir roca normal o con hierro)
// Recursos: 0 arbol, 1 arbusto, 2 roca, 3 roca con hierro, 4 cactus, 5 cristal, 6 hongo
function tipoRecursoBioma(b: number, roll: number, r2: number): number {
    if (b == 0) {
        if (roll < 30) return 0
        if (roll < 70) return 1
        if (roll < 84) return (r2 < 30) ? 3 : 2
        return -1
    }
    if (b == 1) {
        if (roll < 52) return 0
        if (roll < 74) return 1
        if (roll < 80) return (r2 < 30) ? 3 : 2
        if (roll < 86) return 6
        return -1
    }
    if (b == 2) {
        if (roll < 34) return 4
        if (roll < 54) return (r2 < 45) ? 3 : 2
        if (roll < 72) return 1
        return -1
    }
    if (b == 3) {
        if (roll < 26) return 0
        if (roll < 50) return 5
        if (roll < 64) return (r2 < 30) ? 3 : 2
        if (roll < 78) return 1
        return -1
    }
    if (b == 4) {
        if (roll < 24) return 0
        if (roll < 54) return 6
        if (roll < 74) return 1
        if (roll < 80) return (r2 < 30) ? 3 : 2
        return -1
    }
    if (b == 5) {
        // Mesa roja: cactus y mucha roca con hierro
        if (roll < 22) return 4
        if (roll < 54) return (r2 < 50) ? 3 : 2
        if (roll < 68) return 1
        return -1
    }
    if (b == 6) {
        // Volcan: roca oscura, hierro y cristales rojos
        if (roll < 42) return (r2 < 55) ? 3 : 2
        if (roll < 58) return 5
        if (roll < 68) return 1
        return -1
    }
    if (b == 7) {
        // Jungla: arboles muy densos, hongos y arbustos
        if (roll < 50) return 0
        if (roll < 64) return 6
        if (roll < 86) return 1
        if (roll < 91) return (r2 < 30) ? 3 : 2
        return -1
    }
    if (b == 8) {
        // Cerezos: arboles rosas y arbustos
        if (roll < 48) return 0
        if (roll < 78) return 1
        if (roll < 86) return (r2 < 30) ? 3 : 2
        return -1
    }
    // Montanas: roca, hierro, cristales y algun pino
    if (roll < 40) return (r2 < 42) ? 3 : 2
    if (roll < 54) return 5
    if (roll < 72) return 0
    if (roll < 78) return 1
    return -1
}

// Hay alguna ciudad a menos de r pixeles? (mira las celdas vecinas, asi tambien evita el cruce de chunks)
function cercaDeCiudad(x: number, y: number, r: number): boolean {
    let gx0 = Math.floor(x / (CELDA * CHUNK))
    let gy0 = Math.floor(y / (CELDA * CHUNK))
    for (let gx = gx0 - 1; gx <= gx0 + 1; gx++) {
        for (let gy = gy0 - 1; gy <= gy0 + 1; gy++) {
            if (!celdaTieneCiudad(gx, gy)) continue
            let qx = celdaCX(gx, gy)
            let qy = celdaCY(gx, gy)
            let dx = x - ciudadX(qx, qy)
            let dy = y - ciudadY(qx, qy)
            if (dx * dx + dy * dy < r * r) return true
        }
    }
    return false
}

function sembrarRecursosBioma(ch: Chunk) {
    for (let i = 0; i < 18; i++) {
        let x = ch.cx * CHUNK + 10 + hashChunk(ch.cx, ch.cy, 100 + i) % (CHUNK - 20)
        let y = ch.cy * CHUNK + 10 + hashChunk(ch.cx, ch.cy, 130 + i) % (CHUNK - 20)
        if (ch.cx == 0 && ch.cy == 0) {
            let sx = x - 80
            let sy = y - 60
            if (sx * sx + sy * sy < 30 * 30) continue
        }
        if (cercaDeCiudad(x, y, 85)) continue
        let b = biomaEn(x, y)
        let roll = hashChunk(ch.cx, ch.cy, 160 + i) % 100
        let v = hashChunk(ch.cx, ch.cy, 190 + i) % 2
        if (b == 9) v = 1
        let rt = tipoRecursoBioma(b, roll, hashChunk(ch.cx, ch.cy, 220 + i) % 100)
        if (rt < 0) continue
        crearRecurso(ch, rt, x, y, v, b)
    }
}

function cargarChunk(cx: number, cy: number) {
    let ch: Chunk = { cx: cx, cy: cy, sprites: [] }
    let hay = esCiudad(cx, cy)
    let arrasada = ciudadesArrasadas.indexOf(claveCiudad(cx, cy)) >= 0
    let tx = 0
    let ty = 0
    if (hay) {
        tx = ciudadX(cx, cy)
        ty = ciudadY(cx, cy)
        let idioma = culturaCiudad(cx, cy)
        let nombre = nombreCiudad(cx, cy, idioma)
        ciudadesActivas.push({ cx: cx, cy: cy, x: tx, y: ty, nombre: nombre, idioma: idioma })
        let pozo = sprites.create(IMG_POZO, SpriteKind.Casa)
        pozo.setPosition(tx, ty)
        pozo.z = 0.25
        pozo.setFlag(SpriteFlag.Ghost, true)
        ch.sprites.push(pozo)
        let nCasas = 2 + hashChunk(cx, cy, 6) % 2
        for (let i = 0; i < nCasas; i++) {
            let hx = tx + CASA_OFF[i * 2]
            let hy = ty + CASA_OFF[i * 2 + 1]
            let casa = sprites.create(IMG_CASAS_C[idioma][(hashChunk(cx, cy, 7) + i) % 3], SpriteKind.Casa)
            casa.setPosition(hx, hy)
            casa.z = 0.3
            ch.sprites.push(casa)
            if (arrasada) continue
            let npc = sprites.create(IMG_NPC_C[idioma][(hashChunk(cx, cy, 8) + i) % 3], SpriteKind.Npc)
            npc.setPosition(hx, hy + 28)
            npc.z = 0.8
            npc.data["hp"] = 80
            npc.data["hpMax"] = 80
            npc.data["nombre"] = NOMBRES_NPC_C[idioma][(hashChunk(cx, cy, 9) + i * 2) % NOMBRES_NPC_C[idioma].length]
            npc.data["idioma"] = idioma
            npc.data["rol"] = i
            ch.sprites.push(npc)
        }
    }
    sembrarRecursosBioma(ch)
    chunksCargados.push(ch)
}

function actualizarMundo(ahora: number) {
    if (!jugadorSprite || ahora < proxMundo) return
    proxMundo = ahora + 350
    let pcx = Math.floor(jugadorSprite.x / CHUNK)
    let pcy = Math.floor(jugadorSprite.y / CHUNK)

    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (!chunkCargado(pcx + dx, pcy + dy)) cargarChunk(pcx + dx, pcy + dy)
        }
    }
    for (let i = chunksCargados.length - 1; i >= 0; i--) {
        let ch = chunksCargados[i]
        if (Math.abs(ch.cx - pcx) > 2 || Math.abs(ch.cy - pcy) > 2) {
            for (let s of ch.sprites) s.destroy()
            for (let k = ciudadesActivas.length - 1; k >= 0; k--) {
                if (ciudadesActivas[k].cx == ch.cx && ciudadesActivas[k].cy == ch.cy) ciudadesActivas.removeAt(k)
            }
            chunksCargados.removeAt(i)
        }
    }

    // Ciudad mas cercana (para la flecha guia)
    if (pcx != escanCx || pcy != escanCy || ciudadesArrasadas.length != escanArras) {
        escanCx = pcx
        escanCy = pcy
        escanArras = ciudadesArrasadas.length
        candX = []
        candY = []
        candN = []
        let pgx = Math.floor(pcx / CELDA)
        let pgy = Math.floor(pcy / CELDA)
        for (let gx = pgx - 2; gx <= pgx + 2; gx++) {
            for (let gy = pgy - 2; gy <= pgy + 2; gy++) {
                if (!celdaTieneCiudad(gx, gy)) continue
                let qx = celdaCX(gx, gy)
                let qy = celdaCY(gx, gy)
                if (ciudadesArrasadas.indexOf(claveCiudad(qx, qy)) < 0) {
                    candX.push(ciudadX(qx, qy))
                    candY.push(ciudadY(qx, qy))
                    candN.push(nombreCiudad(qx, qy, culturaCiudad(qx, qy)))
                }
            }
        }
    }
    let mejor = 999999999
    hayCiudadCerca = false
    for (let i = 0; i < candX.length; i++) {
        let ddx = candX[i] - jugadorSprite.x
        let ddy = candY[i] - jugadorSprite.y
        let d2 = ddx * ddx + ddy * ddy
        if (d2 < mejor) {
            mejor = d2
            ciudadCercanaX = candX[i]
            ciudadCercanaY = candY[i]
            ciudadCercanaNombre = candN[i]
            hayCiudadCerca = true
        }
    }

    if (hayCiudadCerca) ciudadCercanaDist = Math.floor(Math.sqrt(mejor))

    // Aviso al entrar en una ciudad
    let c = ciudadEn(jugadorSprite.x, jugadorSprite.y)
    if (c) {
        if (ciudadActualNombre != c.nombre) {
            ciudadActualNombre = c.nombre
            mostrarToast(c.nombre, SALUDO_C[c.idioma], 9)
        }
    } else {
        ciudadActualNombre = ""
    }

    // Bioma actual: cambia el color de las sombras y avisa al entrar en uno nuevo
    let bi = biomaEn(jugadorSprite.x, jugadorSprite.y)
    if (bi != biomaActual) {
        if (biomaActual >= 0 && ahora > proxToastBioma && !c) {
            proxToastBioma = ahora + 6000
            mostrarToast(BIOMA_NOMBRE[bi], BIOMA_TIP[bi], BIOMA_COL[bi])
        }
        biomaActual = bi
        colSombra = SOMBRA_BIOMA[bi]
    }
}

function actualizarInteraccion() {
    npcCerca = null
    if (ciudadesActivas.length == 0 || raidActiva) return
    let mejor = 22 * 22
    for (let n of sprites.allOfKind(SpriteKind.Npc)) {
        let dx = n.x - jugadorSprite.x
        let dy = n.y - jugadorSprite.y
        let d2 = dx * dx + dy * dy
        if (d2 < mejor) {
            mejor = d2
            npcCerca = n
        }
    }
    // Durante una redada las casas estan cerradas
    if (raidActiva) npcCerca = null
}

// Los enemigos no pueden entrar en las ciudades
function repelerDeCiudad(s: Sprite, vel: number) {
    if (ciudadesActivas.length == 0 || s.data["muerto"]) return
    let c = ciudadEn(s.x, s.y)
    if (!c) return
    if (raidActiva && c.cx == raidCx && c.cy == raidCy) return
    let dx = s.x - c.x
    let dy = s.y - c.y
    let d = Math.max(1, Math.sqrt(dx * dx + dy * dy))
    s.vx = dx / d * vel * 1.3
    s.vy = dy / d * vel * 1.3
}

// Anillo de la zona segura
scene.createRenderable(0.4, function (target: Image, camera: scene.Camera) {
    if (!enPartida()) return
    for (let c of ciudadesActivas) {
        let cx = Math.floor(c.x - camera.drawOffsetX)
        let cy = Math.floor(c.y - camera.drawOffsetY)
        if (cx < -90 || cx > 250 || cy < -90 || cy > 210) continue
        let enRaid = raidActiva && c.cx == raidCx && c.cy == raidCy
        target.drawCircle(cx, cy, RADIO_CIUDAD, enRaid ? ((Math.floor(game.runtime() / 150) % 2 == 0) ? 2 : 4) : ((Math.floor(game.runtime() / 400) % 2 == 0) ? 9 : 8))
    }
})


// ---------------------------------------------------------
// Redadas: si te quedas mucho en una ciudad, los enemigos la atacan
// ---------------------------------------------------------

const RAID_AVISO_MS = 12000
const RAID_TIEMPO_MS = 20000
let raidActiva: boolean = false
let raidCx: number = 0
let raidCy: number = 0
let tiempoEnCiudadMs: number = 0
let raidAvisado: boolean = false
let ultimoRaidTick: number = 0
let ciudadesRaid: string[] = []
let ciudadesArrasadas: string[] = []

// V23: habilidades EXCLUSIVAS que regala un vecino al salvar la ciudad.
// No salen al subir de nivel ni se venden en la tienda.
const REGALO_NOMBRE: string[] = ["ESCUDO ALDEA", "TERREMOTO", "ARSENAL"]
const REGALO_DESC: string[] = ["ESCUDO SOLO", "ONDA CADA 10S", "BOMBA GRATIS"]
let regalos: number[] = [0, 0, 0]
let proxRegaloEscudo: number = 0
let proxTerremoto: number = 0
let proxArsenal: number = 0
let npcRegalo: Sprite = null
let npcRegaloFase: number = 0
let npcCasaX: number = 0
let npcCasaY: number = 0

function elegirRegalo(): number {
    let libres: number[] = []
    for (let i = 0; i < 3; i++) {
        if (regalos[i] == 0) libres.push(i)
    }
    if (libres.length > 0) return libres[Math.randomRange(0, libres.length - 1)]
    return Math.randomRange(0, 2)
}

// El vecino mas cercano al jugador sale a buscarle para darle el regalo
function iniciarRegaloNPC(c: Ciudad) {
    let mejor: Sprite = null
    let md = 9999999
    for (let n of npcsDeCiudad(c)) {
        let dx = n.x - jugadorSprite.x
        let dy = n.y - jugadorSprite.y
        let d2 = dx * dx + dy * dy
        if (d2 < md) {
            md = d2
            mejor = n
        }
    }
    if (!mejor) return
    npcRegalo = mejor
    npcRegaloFase = 1
    npcCasaX = mejor.x
    npcCasaY = mejor.y
    textoFlotante(mejor.x, mejor.y - 14, "TE BUSCA!", 5)
}

function entregarRegalo() {
    let r = elegirRegalo()
    regalos[r] += 1
    let ahora = game.runtime()
    if (r == 0) proxRegaloEscudo = ahora + 4000
    else if (r == 1) proxTerremoto = ahora + 4000
    else proxArsenal = ahora + 4000
    let nombre = "" + npcRegalo.data["nombre"]
    mostrarBanner(nombre + " TE REGALA", "HABILIDAD ESPECIAL", 9)
    mostrarToast(REGALO_NOMBRE[r] + (regalos[r] > 1 ? " NIV " + regalos[r] : ""), REGALO_DESC[r], 9)
    crearAnillo(jugadorSprite.x, jugadorSprite.y, 30, 9, 400)
    music.setVolume(Math.map(volumenAudio, 0, 100, 0, 150))
    music.playTone(523, 100)
    music.playTone(659, 100)
    music.playTone(784, 220)
    npcRegaloFase = 2
}

function actualizarRegaloNPC() {
    if (npcRegaloFase == 0 || !npcRegalo) return
    if (sprites.allOfKind(SpriteKind.Npc).indexOf(npcRegalo) < 0) {
        npcRegalo = null
        npcRegaloFase = 0
        return
    }
    let tx = npcRegaloFase == 1 ? jugadorSprite.x : npcCasaX
    let ty = npcRegaloFase == 1 ? jugadorSprite.y : npcCasaY
    let dx = tx - npcRegalo.x
    let dy = ty - npcRegalo.y
    let d = Math.sqrt(dx * dx + dy * dy)
    if (d < 16 && npcRegaloFase == 1) {
        npcRegalo.setVelocity(0, 0)
        entregarRegalo()
    } else if (d < 3 && npcRegaloFase == 2) {
        npcRegalo.setVelocity(0, 0)
        npcRegalo = null
        npcRegaloFase = 0
    } else {
        npcRegalo.setVelocity(dx / d * 55, dy / d * 55)
    }
}

// Efectos de las habilidades de regalo (se llama cada frame)
function actualizarRegalos(ahora: number) {
    if (regalos[0] > 0 && ahora >= proxRegaloEscudo) {
        proxRegaloEscudo = ahora + Math.max(5000, 11000 - 2000 * regalos[0])
        if (puntosEscudoActivo < 40 + 20 * regalos[0]) {
            puntosEscudoActivo += 20
            actualizarGraficoEscudo()
            textoFlotante(jugadorSprite.x, jugadorSprite.y - 14, "+20 ESCUDO", 9)
        }
    }
    if (regalos[1] > 0 && ahora >= proxTerremoto) {
        proxTerremoto = ahora + Math.max(5000, 10000 - 1500 * regalos[1])
        let rt = 60 + 10 * regalos[1]
        let dm = Math.max(20, danoAtaque * (1.2 + 0.3 * regalos[1]))
        crearAnillo(jugadorSprite.x, jugadorSprite.y, rt, 4, 350)
        scene.cameraShake(3, 250)
        for (let b of sprites.allOfKind(SpriteKind.Enemy)) {
            let dx = b.x - jugadorSprite.x
            let dy = b.y - jugadorSprite.y
            if (dx * dx + dy * dy <= rt * rt) procesarDanoAEnemigo(b, dm, false)
        }
        for (let j of sprites.allOfKind(SpriteKind.JefeEnemigo)) {
            let dx = j.x - jugadorSprite.x
            let dy = j.y - jugadorSprite.y
            if (dx * dx + dy * dy <= (rt + 12) * (rt + 12)) procesarDanoAEnemigo(j, dm, false)
        }
    }
    if (regalos[2] > 0 && ahora >= proxArsenal) {
        proxArsenal = ahora + Math.max(5000, 12000 - 2000 * regalos[2])
        if (bombas < 30) {
            bombas += 1
            textoFlotante(jugadorSprite.x, jugadorSprite.y - 14, "+1 BOMBA", 9)
        }
    }
}

function claveCiudad(cx: number, cy: number): string {
    return cx + "," + cy
}

function ciudadPorClave(cx: number, cy: number): Ciudad {
    for (let c of ciudadesActivas) {
        if (c.cx == cx && c.cy == cy) return c
    }
    return null
}

// La ciudad deja de ser segura solo mientras dura su redada
function zonaSegura(x: number, y: number): boolean {
    let c = ciudadEn(x, y)
    if (!c) return false
    if (raidActiva && c.cx == raidCx && c.cy == raidCy) return false
    return true
}

function npcsDeCiudad(c: Ciudad): Sprite[] {
    let lista: Sprite[] = []
    for (let n of sprites.allOfKind(SpriteKind.Npc)) {
        let dx = n.x - c.x
        let dy = n.y - c.y
        if (dx * dx + dy * dy < (RADIO_CIUDAD + 30) * (RADIO_CIUDAD + 30)) lista.push(n)
    }
    return lista
}

function npcMasCercano(x: number, y: number): Sprite {
    let mejor: Sprite = null
    let md = 9999999
    for (let n of npcsCache) {
        let dx = n.x - x
        let dy = n.y - y
        let d2 = dx * dx + dy * dy
        if (d2 < md) {
            md = d2
            mejor = n
        }
    }
    return mejor
}

function iniciarRaid(c: Ciudad) {
    raidActiva = true
    raidCx = c.cx
    raidCy = c.cy
    ciudadesRaid.push(claveCiudad(c.cx, c.cy))
    let n = Math.min(14, 6 + oleadaActual)
    for (let i = 0; i < n; i++) {
        let ang = Math.randomRange(0, 360) * (Math.PI / 180)
        let pool: number[] = [0, 0, 1, 2]
        if (oleadaActual >= 5) pool.push(6)
        let tipo = pool[Math.randomRange(0, pool.length - 1)]
        let e = crearEnemigo(tipo, c.x + Math.cos(ang) * (RADIO_CIUDAD + 55), c.y + Math.sin(ang) * (RADIO_CIUDAD + 55))
        e.data["raider"] = true
    }
    totalBichosOleadaInicial += n
    mostrarBanner("REDADA!", "PROTEGE A LA GENTE", 2)
    scene.cameraShake(4, 400)
    music.setVolume(Math.map(volumenAudio, 0, 100, 0, 140))
    music.playTone(165, 300)
}

function matarNPC(n: Sprite) {
    crearEfectoMuerte(n.x, n.y)
    textoFlotante(n.x, n.y - 14, "" + n.data["nombre"] + " HA CAIDO", 2)
    n.destroy()
}

function terminarRaid(exito: boolean, motivo: string) {
    raidActiva = false
    let clave = claveCiudad(raidCx, raidCy)
    for (let e of sprites.allOfKind(SpriteKind.Enemy)) e.data["raider"] = false
    if (exito) {
        let c = ciudadPorClave(raidCx, raidCy)
        let vivos = c ? npcsDeCiudad(c).length : 1
        let oro = 30 + 20 * vivos
        cantidadMonedas += oro
        monedasPartida += oro
        puntosPuntuacion += 300
        bombas += 2
        if (ciudadesAliadas.indexOf(clave) < 0) ciudadesAliadas.push(clave)
        ganarMaterial(3, 2, jugadorSprite.x, jugadorSprite.y - 12)
        ganarMaterial(4, 2, jugadorSprite.x, jugadorSprite.y - 20)
        ganarMaterial(0, 3, jugadorSprite.x, jugadorSprite.y - 28)
        mostrarBanner("CIUDAD SALVADA!", "+" + oro + " ORO +2 BOMBAS", 5)
        if (c) {
            mostrarToast(c.nombre, "AHORA ES ALIADA", 5)
            iniciarRegaloNPC(c)
        }
        music.setVolume(Math.map(volumenAudio, 0, 100, 0, 150))
        music.playTone(784, 120)
        music.playTone(988, 200)
    } else {
        ciudadesArrasadas.push(clave)
        mostrarBanner("CIUDAD ARRASADA", motivo, 2)
        music.setVolume(Math.map(volumenAudio, 0, 100, 0, 150))
        music.playTone(147, 400)
    }
}

function actualizarRaid(ahora: number) {
    let dt = ahora - ultimoRaidTick
    ultimoRaidTick = ahora
    if (dt > 100 || dt < 0) dt = 0

    if (!raidActiva) {
        let c = ciudadEn(jugadorSprite.x, jugadorSprite.y)
        if (c && ciudadesRaid.indexOf(claveCiudad(c.cx, c.cy)) < 0 && npcsDeCiudad(c).length > 0) {
            tiempoEnCiudadMs += dt
            if (tiempoEnCiudadMs >= RAID_AVISO_MS && !raidAvisado) {
                raidAvisado = true
                mostrarToast("SE OYEN RUIDOS...", "ALGO SE ACERCA", 2)
            }
            if (tiempoEnCiudadMs >= RAID_TIEMPO_MS) {
                tiempoEnCiudadMs = 0
                raidAvisado = false
                iniciarRaid(c)
            }
        } else {
            tiempoEnCiudadMs = Math.max(0, tiempoEnCiudadMs - dt)
            if (tiempoEnCiudadMs < RAID_AVISO_MS) raidAvisado = false
        }
        return
    }

    let ciudad = ciudadPorClave(raidCx, raidCy)
    if (!ciudad) {
        terminarRaid(false, "LA ABANDONASTE")
        return
    }
    let gente = npcsDeCiudad(ciudad)
    let huboMuerte = false
    let enemigosRaid = sprites.allOfKind(SpriteKind.Enemy)
    for (let n of gente) {
        if (ahora < ((n.data["cd"] as number) || 0)) continue
        for (let e of enemigosRaid) {
            let dx = e.x - n.x
            let dy = e.y - n.y
            if (dx * dx + dy * dy < 14 * 14) {
                n.data["cd"] = ahora + 450
                n.data["hp"] = (n.data["hp"] as number) - 12
                textoFlotante(n.x, n.y - 10, "-12", 2)
                if ((n.data["hp"] as number) <= 0) {
                    matarNPC(n)
                    huboMuerte = true
                }
                break
            }
        }
    }
    let vivos = huboMuerte ? npcsDeCiudad(ciudad).length : gente.length
    let raiders = 0
    for (let e of enemigosRaid) {
        if (e.data["raider"] && !e.data["muerto"]) raiders++
    }
    if (vivos == 0) terminarRaid(false, "NADIE SOBREVIVIO")
    else if (raiders == 0) terminarRaid(true, "")
}

// ---------------------------------------------------------
// Recursos: recoger materiales
// ---------------------------------------------------------

function ganarMaterial(m: number, n: number, x: number, y: number) {
    mats[m] = Math.min(99, mats[m] + n)
    textoFlotante(x, y, "+" + n + " " + MAT_NOMBRE[m], MAT_COL[m])
}

function golpearRecurso(r: Sprite, golpes: number) {
    if (r.data["muerto"]) return
    let hp = (r.data["hp"] as number) - golpes
    r.data["hp"] = hp
    let rt = r.data["rt"] as number
    music.setVolume(Math.map(volumenAudio, 0, 100, 0, 70))
    music.playTone(esRecolectable(rt) ? 700 : 240, 25)
    if (hp > 0) {
        r.x += (hp % 2 == 0) ? 1 : -1
        return
    }
    r.data["muerto"] = true
    let x = r.x
    let y = r.y
    crearEfectoMuerte(x, y)
    if (rt == 0) {
        ganarMaterial(0, Math.randomRange(2, 3), x, y - 6)
        if (Math.randomRange(1, 100) <= 30) ganarMaterial(2, 1, x, y - 14)
    } else if (rt == 1) {
        ganarMaterial(2, Math.randomRange(1, 2), x, y - 6)
        if (Math.randomRange(1, 100) <= 20) ganarMaterial(0, 1, x, y - 14)
    } else if (rt == 2) {
        ganarMaterial(1, Math.randomRange(2, 3), x, y - 6)
    } else if (rt == 4) {
        ganarMaterial(5, Math.randomRange(2, 3), x, y - 6)
        if (Math.randomRange(1, 100) <= 25) ganarMaterial(2, 1, x, y - 14)
    } else if (rt == 5) {
        ganarMaterial(6, Math.randomRange(1, 2), x, y - 6)
        if (Math.randomRange(1, 100) <= 35) ganarMaterial(1, 1, x, y - 14)
    } else if (rt == 6) {
        ganarMaterial(7, Math.randomRange(1, 2), x, y - 6)
        if (Math.randomRange(1, 100) <= 20) ganarMaterial(2, 1, x, y - 14)
    } else {
        ganarMaterial(3, Math.randomRange(1, 2), x, y - 6)
        ganarMaterial(1, 1, x, y - 14)
    }
    r.destroy()
}

// Botin de materiales al matar enemigos
function soltarMateriales(tipo: number, esJefe: boolean, x: number, y: number) {
    if (esJefe) {
        ganarMaterial(3, 3, x, y - 6)
        ganarMaterial(4, 3, x, y - 14)
        ganarMaterial(0, 3, x, y - 22)
        return
    }
    if (tipo == 5) {
        ganarMaterial(4, Math.randomRange(1, 2), x, y - 6)
        return
    }
    if (Math.randomRange(1, 100) <= 7) ganarMaterial(4, 1, x, y - 6)
    let probHierro = (tipo == 1) ? 18 : 4
    if (Math.randomRange(1, 100) <= probHierro) ganarMaterial(3, 1, x, y - 14)
}

// Los arbustos se recogen al pasar por encima
sprites.onOverlap(SpriteKind.Player, SpriteKind.Recurso, function (jugador, r) {
    if (estadoActual != EstadoJuego.Jugando) return
    if (!esRecolectable(r.data["rt"] as number)) return
    golpearRecurso(r, 99)
})

// Arboles y rocas: se rompen a balazos (la bala los atraviesa)
sprites.onOverlap(SpriteKind.ProyectilJugador, SpriteKind.Recurso, function (bala, r) {
    if (estadoActual != EstadoJuego.Jugando) return
    if (esRecolectable(r.data["rt"] as number)) return
    if (bala.data["gastada"]) return
    if (yaGolpeada(bala, r.id)) return
    golpearRecurso(r, 1)
})

// ---------------------------------------------------------
// Armas y bombas
// ---------------------------------------------------------

function cadenciaArma(): number {
    return Math.max(35, Math.floor(cadenciaDisparoMs * MULT_CAD[armaEquipada] * factorCadenciaV27()))
}

function buscarObjetivo(): Sprite {
    let ahora = game.runtime()
    let camX = scene.cameraProperty(CameraProperty.X) - 80
    let camY = scene.cameraProperty(CameraProperty.Y) - 60
    // Mientras el objetivo siga vivo y en pantalla se reutiliza (evita recorrer todos los enemigos en cada disparo)
    if (objetivoCache && ahora < proxBusqueda && !objetivoCache.data["muerto"]) {
        let ox = objetivoCache.x - camX
        let oy = objetivoCache.y - camY
        if (ox >= -10 && ox <= 170 && oy >= -10 && oy <= 130) return objetivoCache
    }
    let objetivo: Sprite = null
    let menor = 9999999
    for (let bicho of enemigosFrame) {
        if (bicho.data["muerto"]) continue
        let scrX = bicho.x - camX
        let scrY = bicho.y - camY
        if (scrX >= 0 && scrX <= 160 && scrY >= 0 && scrY <= 120) {
            let dx = bicho.x - jugadorSprite.x
            let dy = bicho.y - jugadorSprite.y
            let d2 = dx * dx + dy * dy
            if (d2 < menor) {
                menor = d2
                objetivo = bicho
            }
        }
    }
    for (let jefe of jefesFrame) {
        if (jefe.data["muerto"]) continue
        let scrX = jefe.x - camX
        let scrY = jefe.y - camY
        if (scrX >= -10 && scrX <= 170 && scrY >= -10 && scrY <= 130) {
            let dx = jefe.x - jugadorSprite.x
            let dy = jefe.y - jugadorSprite.y
            let d2 = dx * dx + dy * dy
            if (d2 < menor) {
                menor = d2
                objetivo = jefe
            }
        }
    }
    objetivoCache = objetivo
    proxBusqueda = ahora + 110
    return objetivo
}

// Cuenta de balas vivas (limite para que nunca se llene la pantalla de sprites)
sprites.onDestroyed(SpriteKind.ProyectilJugador, function (bala) {
    balasVivas = Math.max(0, balasVivas - 1)
})

// Lista de objetivos ya golpeados por una bala que perfora (se crea solo cuando hace falta)
function yaGolpeada(bala: Sprite, id: number): boolean {
    let hits: number[] = bala.data["hits"]
    if (!hits) {
        hits = []
        bala.data["hits"] = hits
    }
    if (hits.indexOf(id) >= 0) return true
    hits.push(id)
    return false
}

function crearBala(imagen: Image, ang: number, vel: number, vida: number, perf: number, mult: number) {
    if (balasVivas >= MAX_BALAS_Q[calidad]) return
    balasVivas++
    let bala = sprites.create(imagen, SpriteKind.ProyectilJugador)
    bala.setPosition(jugadorSprite.x, jugadorSprite.y)
    bala.z = 2
    bala.vx = Math.cos(ang) * vel
    bala.vy = Math.sin(ang) * vel
    bala.lifespan = vida
    bala.setFlag(SpriteFlag.AutoDestroy, true)
    bala.data["perf"] = perf
    bala.data["mult"] = mult
}

function crearSlash(x: number, y: number, ang: number, radio: number, cosMin: number) {
    let tam = radio * 2 + 6
    let completo = cosMin <= -0.99
    let im: Image = null
    if (completo && slashHacha && slashHacha.width == tam) {
        im = slashHacha
    } else {
        let c = Math.floor(tam / 2)
        im = image.create(tam, tam)
        let semi = completo ? Math.PI : Math.acos(Math.max(-1, Math.min(1, cosMin)))
        for (let a = ang - semi; a <= ang + semi; a += 0.1) {
            im.fillRect(c + Math.round(Math.cos(a) * (radio - 1)), c + Math.round(Math.sin(a) * (radio - 1)), 2, 2, 1)
            im.setPixel(c + Math.round(Math.cos(a) * (radio - 4)), c + Math.round(Math.sin(a) * (radio - 4)), 9)
        }
        if (completo) slashHacha = im
    }
    // El tajo es gameplay visible: no se descarta, pero cuenta en el contador de efectos
    fxVivos++
    let s = sprites.create(im, SpriteKind.Food)
    s.setPosition(x, y)
    s.z = 3
    s.setFlag(SpriteFlag.Ghost, true)
    s.lifespan = 110
}

function golpeCuerpo(s: Sprite, radio: number, ux: number, uy: number, cosMin: number, mult: number) {
    let dx = s.x - jugadorSprite.x
    let dy = s.y - jugadorSprite.y
    let d2 = dx * dx + dy * dy
    if (d2 > radio * radio) return
    let d = Math.max(1, Math.sqrt(d2))
    if ((dx * ux + dy * uy) / d < cosMin) return
    let esJefe = s.kind() == SpriteKind.JefeEnemigo
    procesarDanoAEnemigo(s, danoAtaque * mult, true)
    if (s.data["muerto"]) return
    if (nivelHielo > 0) s.data["lentoHasta"] = game.runtime() + 1000 + 300 * nivelHielo
    if (!esJefe) {
        s.x += dx / d * 8
        s.y += dy / d * 8
    }
}

function ataqueCuerpo(ang: number, radio: number, cosMin: number, mult: number) {
    crearSlash(jugadorSprite.x, jugadorSprite.y, ang, radio, cosMin)
    let ux = Math.cos(ang)
    let uy = Math.sin(ang)
    for (let b of enemigosFrame) golpeCuerpo(b, radio, ux, uy, cosMin, mult)
    for (let j of jefesFrame) golpeCuerpo(j, radio + 8, ux, uy, cosMin, mult)
    for (let r of sprites.allOfKind(SpriteKind.Recurso)) {
        if (esRecolectable(r.data["rt"] as number)) continue
        let dx = r.x - jugadorSprite.x
        let dy = r.y - jugadorSprite.y
        if (dx * dx + dy * dy <= (radio + 6) * (radio + 6)) golpearRecurso(r, 2)
    }
}

// Objetivo para armas cuerpo a cuerpo: enemigo, jefe o recurso DENTRO del alcance
function objetivoCuerpo(alcance: number): Sprite {
    let mejor: Sprite = null
    let md = 99999999
    for (let b of enemigosFrame) {
        if (b.data["muerto"]) continue
        let dx = b.x - jugadorSprite.x
        let dy = b.y - jugadorSprite.y
        let d2 = dx * dx + dy * dy
        if (d2 <= alcance * alcance && d2 < md) {
            md = d2
            mejor = b
        }
    }
    for (let j of jefesFrame) {
        if (j.data["muerto"]) continue
        let dx = j.x - jugadorSprite.x
        let dy = j.y - jugadorSprite.y
        let d2 = dx * dx + dy * dy
        if (d2 <= (alcance + 8) * (alcance + 8) && d2 < md) {
            md = d2
            mejor = j
        }
    }
    if (mejor) return mejor
    for (let r of sprites.allOfKind(SpriteKind.Recurso)) {
        if (r.data["muerto"]) continue
        if (esRecolectable(r.data["rt"] as number)) continue
        let dx = r.x - jugadorSprite.x
        let dy = r.y - jugadorSprite.y
        let d2 = dx * dx + dy * dy
        if (d2 <= (alcance + 6) * (alcance + 6) && d2 < md) {
            md = d2
            mejor = r
        }
    }
    return mejor
}

function ejecutarDisparoManual() {
    let tiempoAhora = game.runtime()
    if (!jugadorSprite || tiempoAhora - ultimoDisparoMs < cadenciaArma()) return

    let arma = armaEquipada
    let objetivo: Sprite = null
    if (ARMA_ALCANCE[arma] > 0) {
        // Cuerpo a cuerpo: no dispara nada, solo golpea si hay algo cerca
        if (tiempoAhora < proxEscaneoCuerpo) return
        objetivo = objetivoCuerpo(ARMA_ALCANCE[arma])
        if (!objetivo) {
            proxEscaneoCuerpo = tiempoAhora + 70
            return
        }
    }
    ultimoDisparoMs = tiempoAhora

    if (jugadorSprite.vx != 0 || jugadorSprite.vy != 0) {
        ultimaDirX = jugadorSprite.vx > 0 ? 1 : (jugadorSprite.vx < 0 ? -1 : 0)
        ultimaDirY = jugadorSprite.vy > 0 ? 1 : (jugadorSprite.vy < 0 ? -1 : 0)
    }
    if (!objetivo) objetivo = buscarObjetivo()
    let ang = 0
    if (objetivo) {
        ang = Math.atan2(objetivo.y - jugadorSprite.y, objetivo.x - jugadorSprite.x)
    } else {
        if (ultimaDirX == 0 && ultimaDirY == 0) ultimaDirX = 1
        ang = Math.atan2(ultimaDirY, ultimaDirX)
    }

    if (tiempoAhora - ultimoSonidoDisparo >= SONIDO_DISPARO_MS_Q[calidad]) {
        ultimoSonidoDisparo = tiempoAhora
        music.setVolume(Math.map(volumenAudio, 0, 100, 0, 80))
        music.playTone(SONIDO_ARMA[arma], arma == 3 ? 50 : 25)
    }

    if (arma == 1) {
        ataqueCuerpo(ang, 36, 0.2, 2.2)
    } else if (arma == 4) {
        ataqueCuerpo(ang, 32, -1, 3.4)
    } else if (arma == 2) {
        for (let i = 0; i < numProyectiles; i++) {
            let a = ang + (i - (numProyectiles - 1) / 2) * 0.2
            crearBala(imgBalaArco, a, velProyectil * 1.3, 1800, perforacion + 2, 1.6)
        }
    } else if (arma == 3) {
        let n = 4 + numProyectiles
        for (let i = 0; i < n; i++) {
            let a = ang + (i - (n - 1) / 2) * 0.17 + Math.randomRange(-10, 10) * 0.01
            crearBala(imgPerdigon, a, velProyectil * 0.9, 420, perforacion, 0.7)
        }
    } else {
        for (let i = 0; i < numProyectiles; i++) {
            let a = ang
            if (numProyectiles > 1) a += (i - (numProyectiles - 1) / 2) * 0.25
            crearBala(imgBala, a, velProyectil, 1400, perforacion, 1)
        }
    }
}

function accionBotonB() {
    if (modoB == 1 || nivelHabilidadDash <= 0) lanzarBomba()
    else usarDash()
}

function lanzarBomba() {
    if (!jugadorSprite) return
    let ahora = game.runtime()
    if (ahora < proxBomba) return
    if (bombas <= 0) {
        proxBomba = ahora + 400
        textoFlotante(jugadorSprite.x, jugadorSprite.y - 12, "SIN BOMBAS", 2)
        sonarCancelar()
        return
    }
    bombas--
    proxBomba = ahora + 500
    let objetivo = buscarObjetivo()
    let ang = 0
    let dist = 55
    if (objetivo) {
        let dx = objetivo.x - jugadorSprite.x
        let dy = objetivo.y - jugadorSprite.y
        ang = Math.atan2(dy, dx)
        dist = Math.min(110, Math.sqrt(dx * dx + dy * dy))
    } else {
        if (ultimaDirX == 0 && ultimaDirY == 0) ultimaDirX = 1
        ang = Math.atan2(ultimaDirY, ultimaDirX)
    }
    let b = sprites.create(FRAMES_BOMBA[0], SpriteKind.Bomba)
    animation.runImageAnimation(b, FRAMES_BOMBA, 120, true)
    b.setPosition(jugadorSprite.x, jugadorSprite.y)
    b.z = 2
    b.vx = Math.cos(ang) * dist / 0.45
    b.vy = Math.sin(ang) * dist / 0.45
    b.data["fin"] = ahora + 450
    music.setVolume(Math.map(volumenAudio, 0, 100, 0, 90))
    music.playTone(400, 40)
}

function explotarBomba(b: Sprite) {
    let x = b.x
    let y = b.y
    b.destroy()
    let R = 46
    crearAnillo(x, y, R, 4, 260)
    crearEfectoMuerte(x, y)
    scene.cameraShake(4, 250)
    music.setVolume(Math.map(volumenAudio, 0, 100, 0, 130))
    music.playTone(150, 160)
    for (let e of sprites.allOfKind(SpriteKind.Enemy)) {
        let dx = e.x - x
        let dy = e.y - y
        if (dx * dx + dy * dy <= R * R) procesarDanoAEnemigo(e, (danoAtaque * 4 + 20) * multExplosivo, true)
    }
    for (let j of sprites.allOfKind(SpriteKind.JefeEnemigo)) {
        let dx = j.x - x
        let dy = j.y - y
        if (dx * dx + dy * dy <= (R + 10) * (R + 10)) procesarDanoAEnemigo(j, danoAtaque * 3 * multExplosivo, true)
    }
    for (let r of sprites.allOfKind(SpriteKind.Recurso)) {
        let dx = r.x - x
        let dy = r.y - y
        if (dx * dx + dy * dy <= R * R) golpearRecurso(r, 3)
    }
}

function actualizarBombas(ahora: number) {
    for (let b of sprites.allOfKind(SpriteKind.Bomba)) {
        if (ahora >= (b.data["fin"] as number)) explotarBomba(b)
    }
}

// ---------------------------------------------------------
// Inventario (boton MENU)
// ---------------------------------------------------------

function abrirInventario() {
    estadoActual = EstadoJuego.Inventario
    invSel = armaEquipada
    mensajeTiendaHasta = 0
    congelarEscena()
    sonarConfirmar()
}

function cerrarInventario() {
    sonarCancelar()
    reanudarJuego()
}

function usarFilaInventario() {
    let i = invSel
    if (i < 5) {
        if (tengoArma[i]) {
            armaEquipada = i
            sonarConfirmar()
            avisoTienda("EQUIPADA: " + ARMA_NOMBRE[i], 7)
        } else {
            sonarCancelar()
            avisoTienda("AUN NO LA TIENES", 2)
        }
    } else if (i == 5) {
        modoB = 1
        sonarConfirmar()
        avisoTienda("B LANZA BOMBAS", 7)
    } else if (i == 6) {
        if (nivelHabilidadDash > 0) {
            modoB = 0
            sonarConfirmar()
            avisoTienda("B HACE DASH", 7)
        } else {
            sonarCancelar()
            avisoTienda("DASH BLOQUEADO", 2)
        }
    } else {
        if (vendas <= 0) {
            sonarCancelar()
            avisoTienda("NO TIENES VENDAS", 2)
        } else if (vidaActual >= vidaMaxima) {
            sonarCancelar()
            avisoTienda("VIDA YA LLENA", 4)
        } else {
            vendas--
            vidaActual = Math.min(vidaMaxima, vidaActual + 40)
            sonarConfirmar()
            avisoTienda("+40 DE VIDA", 7)
        }
    }
}

function dibujarInventario(t: number) {
    let ahora = game.runtime()
    screen.fillRect(0, 0, 160, 120, 15)
    uiCabecera("INVENTARIO", 5, "LV" + nivelJugador)
    for (let k = 0; k < REL_NOMBRE.length; k++) {
        screen.fillRect(92 + k * 6, 6, 5, 5, reliquias[k] ? REL_COL[k] : 12)
        screen.drawRect(92 + k * 6, 6, 5, 5, reliquias[k] ? 1 : 8)
    }

    uiPanel(2, 18, 104, 84, 8)
    for (let j = 0; j < INV_FILAS; j++) {
        let y = 21 + j * 10
        let sel = j == invSel
        let nombre = ""
        let estado = ""
        let colN = 1
        let colE = 13
        if (j < 5) {
            nombre = ARMA_NOMBRE[j]
            if (!tengoArma[j]) {
                colN = 13
                estado = "---"
            } else if (armaEquipada == j) {
                estado = "EQUIP."
                colE = 7
            }
        } else if (j == 5) {
            nombre = "BOMBAS x" + bombas
            if (modoB == 1) {
                estado = "[B]"
                colE = 5
            }
        } else if (j == 6) {
            nombre = "DASH"
            if (nivelHabilidadDash <= 0) {
                colN = 13
                estado = "---"
            } else if (modoB == 0) {
                estado = "[B]"
                colE = 5
            }
        } else {
            nombre = "VENDA x" + vendas
        }
        if (sel) {
            screen.fillRect(4, y - 1, 100, 10, 8)
            screen.drawRect(4, y - 1, 100, 10, (Math.floor(t) % 2 == 0) ? 5 : 4)
        }
        screen.drawTransparentImage(ICONOS_INV[j], 6, y)
        screen.print(nombre, 17, y + 2, sel ? 5 : colN, image.font5)
        if (estado != "") {
            if (colE == 7) {
                uiChip(100 - estado.length * 6 - 3, y, estado, 7, 15)
            } else {
                screen.print(estado, 102 - estado.length * 6, y + 2, colE, image.font5)
            }
        }
    }

    // Materiales
    uiPanel(108, 18, 50, 84, 8)
    screen.print("MATERIAL", 112, 22, 9, image.font5)
    screen.drawLine(111, 28, 154, 28, 8)
    for (let k = 0; k < NUM_MATS; k++) {
        let y = 32 + k * 8
        screen.fillRect(112, y, 5, 5, MAT_COL[k])
        screen.drawRect(111, y - 1, 7, 7, 15)
        screen.print(MAT_ABR[k], 121, y, mats[k] > 0 ? 1 : 13, image.font5)
        let sm = "" + mats[k]
        screen.print(sm, 155 - sm.length * 6, y, mats[k] > 0 ? 5 : 13, image.font5)
    }

    uiPanel(0, 103, 160, 17, 5)
    if (ahora < mensajeTiendaHasta) {
        uiCentro(mensajeTienda, 108, mensajeTiendaColor, image.font8, 15)
    } else {
        screen.print(INV_DESC[invSel], 4, 106, 1, image.font5)
        let accionB = (modoB == 1 || nivelHabilidadDash <= 0) ? "BOMBA" : "DASH"
        uiTecla(4, 111, "B", 2)
        screen.print(accionB, 14, 112, 9, image.font5)
        uiTecla(52, 111, "A", 7)
        screen.print("USAR", 62, 112, 9, image.font5)
        screen.print("MENU: CERRAR", 94, 112, 13, image.font5)
    }
}

// ---------------------------------------------------------
// Casas, descanso y crafteo
// ---------------------------------------------------------

function entrarCasa(npc: Sprite) {
    casaNombre = npc.data["nombre"] as string
    casaRol = (npc.data["rol"] as number) || 0
    casaIdioma = (npc.data["idioma"] as number) || 0
    casaFrase = ROL_FRASE_C[casaIdioma][casaRol]
    casaAliada = ciudadAliada(ciudadEn(npc.x, npc.y))
    prepararOpcionesCasa()
    retratoNPC = npc.image.doubled()
    casaSel = 0
    descansoHasta = 0
    mensajeTiendaHasta = 0
    congelarEscena()
    estadoActual = EstadoJuego.DentroCasa
    sonarConfirmar()
}

function salirDeCasa() {
    sonarCancelar()
    reanudarJuego()
}

function ciudadAliada(c: Ciudad): boolean {
    if (!c) return false
    return ciudadesAliadas.indexOf(claveCiudad(c.cx, c.cy)) >= 0
}

// Acciones: 0 dormir, 1 craftear, 4 salir
function precioCasa(accion: number): number {
    return casaAliada ? 0 : PRECIO_DESCANSO
}

function prepararOpcionesCasa() {
    casaAcc = [1, 0, 4]
    casaOpc = [OPC_CRAFT_C[casaIdioma], OPC_DORMIR_C[casaIdioma] + " " + precioCasa(0) + "$", OPC_SALIR_C[casaIdioma]]
}

function accionCasa() {
    let ahora = game.runtime()
    if (ahora < descansoHasta) return
    let acc = casaAcc[casaSel]
    if (acc == 0) {
        if (vidaActual >= vidaMaxima) {
            sonarCancelar()
            avisoTienda("VIDA YA LLENA", 4)
        } else if (cantidadMonedas < precioCasa(0)) {
            sonarCancelar()
            avisoTienda("SIN ORO", 2)
        } else {
            cantidadMonedas -= precioCasa(0)
            vidaActual = vidaMaxima
            descansoHasta = ahora + 1500
            music.setVolume(Math.map(volumenAudio, 0, 100, 0, 120))
            music.playTone(392, 200)
            music.playTone(523, 300)
            avisoTienda("VIDA MAXIMA!", 7)
            mensajeTiendaHasta = descansoHasta + 1300
        }
    } else if (acc == 1) {
        craftSel = 0
        mensajeTiendaHasta = 0
        estadoActual = EstadoJuego.Crafteo
        sonarConfirmar()
    } else {
        salirDeCasa()
    }
}

function puedeCraftear(r: number): boolean {
    for (let i = 0; i < NUM_MATS; i++) {
        if (mats[i] < REC_COSTE[r][i]) return false
    }
    return true
}

function craftear(r: number) {
    if (r < 4 && tengoArma[r + 1]) {
        sonarCancelar()
        avisoTienda("YA LA TIENES", 4)
        return
    }
    if (r == 4 && bombas >= 30) {
        sonarCancelar()
        avisoTienda("MAXIMO 30 BOMBAS", 4)
        return
    }
    if (r == 5 && vendas >= 9) {
        sonarCancelar()
        avisoTienda("MAXIMO 9 VENDAS", 4)
        return
    }
    if (r >= 6 && mejorasCraft[r - 6] >= MEJORA_MAX) {
        sonarCancelar()
        avisoTienda("YA AL MAXIMO", 4)
        return
    }
    for (let i = 0; i < NUM_MATS; i++) {
        if (mats[i] < REC_COSTE[r][i]) {
            sonarCancelar()
            avisoTienda("FALTA " + MAT_NOMBRE[i], 2)
            return
        }
    }
    for (let i = 0; i < NUM_MATS; i++) mats[i] -= REC_COSTE[r][i]
    if (r < 4) {
        tengoArma[r + 1] = true
        armaEquipada = r + 1
        avisoTienda("CREADA: " + ARMA_NOMBRE[r + 1], 7)
    } else if (r == 4) {
        bombas += 2
        avisoTienda("+2 BOMBAS", 7)
    } else if (r == 5) {
        vendas += 1
        avisoTienda("+1 VENDA", 7)
    } else {
        aplicarMejoraCraft(r - 6)
    }
    sonarConfirmar()
    music.playTone(784, 80)
}

// Mejoras permanentes de los materiales de bioma (la velocidad se aplica al volver al juego)
function aplicarMejoraCraft(k: number) {
    mejorasCraft[k] += 1
    if (k == 0) {
        armaduraReduccion += 2
        avisoTienda("ARMADURA +2", 7)
    } else if (k == 1) {
        velMovimiento += 12
        avisoTienda("VELOCIDAD +12", 7)
    } else if (k == 2) {
        probabilidadCritico = Math.min(80, probabilidadCritico + 8)
        avisoTienda("CRITICO +8%", 7)
    } else if (k == 3) {
        nivelHielo += 1
        avisoTienda("HIELO NIVEL " + nivelHielo, 7)
    } else {
        vidaMaxima += 15
        vidaActual += 15
        avisoTienda("VIDA MAX +15", 7)
    }
}

function dibujarCasa(t: number) {
    let ahora = game.runtime()
    // Pared
    screen.fillRect(0, 0, 160, 44, 13)
    for (let x = 8; x < 160; x += 16) screen.fillRect(x, 0, 1, 44, 14)
    screen.fillRect(0, 40, 160, 4, 11)
    screen.fillRect(0, 44, 160, 3, 14)
    screen.drawLine(0, 47, 159, 47, 15)
    // Suelo de tablones
    screen.fillRect(0, 48, 160, 72, 4)
    for (let r = 0; r < 8; r++) {
        let y = 48 + r * 9
        screen.fillRect(0, y, 160, 1, 14)
        screen.fillRect((r * 47 + 20) % 150, y, 1, 9, 14)
    }
    // Ventana con cortinas
    screen.fillRect(14, 8, 30, 24, 14)
    screen.fillRect(16, 10, 26, 20, 9)
    screen.fillRect(28, 10, 2, 20, 14)
    screen.fillRect(16, 19, 26, 2, 14)
    screen.fillRect(18, 12, 4, 1, 1)
    screen.fillRect(10, 6, 4, 28, 2)
    screen.fillRect(44, 6, 4, 28, 2)
    screen.fillRect(12, 34, 34, 2, 14)
    // Cuadro en la pared
    screen.fillRect(60, 8, 22, 17, 14)
    screen.fillRect(62, 10, 18, 13, 9)
    screen.fillRect(62, 18, 18, 5, 7)
    screen.fillCircle(75, 15, 2, 5)
    // Estante con libros
    screen.fillRect(60, 30, 26, 2, 14)
    screen.fillRect(62, 24, 3, 6, 2)
    screen.fillRect(66, 25, 3, 5, 8)
    screen.fillRect(70, 23, 3, 7, 7)
    // Cama
    screen.fillRect(102, 14, 52, 31, 15)
    screen.fillRect(103, 15, 50, 29, 14)
    screen.fillRect(105, 17, 46, 25, 1)
    screen.fillRect(105, 28, 46, 14, 2)
    screen.fillRect(107, 19, 14, 8, 9)
    // Mesa con vela
    screen.fillRect(8, 56, 28, 4, 13)
    screen.fillRect(8, 60, 28, 1, 15)
    screen.fillRect(10, 61, 3, 12, 14)
    screen.fillRect(31, 61, 3, 12, 14)
    screen.fillRect(20, 49, 3, 7, 1)
    screen.fillRect(21, 46, 1, 3, (Math.floor(t) % 2 == 0) ? 5 : 4)
    screen.fillCircle(21, 44, 4, (Math.floor(t) % 2 == 0) ? 4 : 2)
    screen.fillRect(21, 45, 1, 4, 5)
    // Planta
    screen.fillRect(138, 62, 10, 8, 14)
    screen.fillRect(139, 62, 8, 2, 4)
    screen.fillCircle(143, 57, 5, 7)
    screen.fillCircle(139, 53, 3, 7)
    screen.fillCircle(147, 53, 3, 6)
    // Alfombra, sombra y vecino
    screen.fillRect(50, 62, 60, 21, 5)
    screen.fillRect(52, 64, 56, 17, 2)
    screen.fillRect(56, 68, 48, 1, 5)
    screen.fillRect(56, 76, 48, 1, 5)
    screen.fillRect(66, 65, 12, 2, 14)
    screen.drawTransparentImage(retratoNPC, 64, 50 + Math.floor(Math.sin(t) * 1))

    uiMonedero(158 - (14 + ("" + cantidadMonedas).length * 6), 2, cantidadMonedas)

    // Panel inferior: opciones a la izquierda, dialogo a la derecha
    uiPanel(0, 84, 160, 36, 5)
    for (let i = 0; i < casaOpc.length; i++) {
        uiBoton(4, 88 + i * 10, 68, 9, casaOpc[i], i == casaSel, t, false)
    }
    screen.drawLine(76, 88, 76, 116, 8)
    if (ahora < mensajeTiendaHasta) {
        screen.print(mensajeTienda, 80, 100, mensajeTiendaColor, image.font5)
    } else {
        screen.print(casaNombre, 80, 87, 9, image.font5)
        screen.print(ROL_NOMBRE_C[casaIdioma] + (casaAliada ? "*" : ""), 80, 94, casaAliada ? 7 : 5, image.font5)
        dibujarLineas(casaFrase, 80, 103, 1, 7)
    }

    // Dormir
    if (ahora < descansoHasta) {
        screen.fillRect(0, 0, 160, 120, 15)
        screen.fillCircle(118, 28, 11, 5)
        screen.fillCircle(123, 25, 10, 15)
        for (let k = 0; k < 9; k++) {
            let sx = (k * 41 + 9) % 150 + 4
            let sy = (k * 23 + 5) % 50 + 4
            if ((Math.floor(t) + k) % 3 != 0) screen.setPixel(sx, sy, 1)
        }
        let fz = Math.floor(t) % 4
        screen.print("Z", 60, 58 - fz * 2, 9, image.font8)
        screen.print("Z", 72, 50 - fz * 2, 11, image.font8)
        screen.print("Z", 84, 42 - fz * 2, 1, image.font8)
        uiCentro("DESCANSANDO", 70, 1, image.font5, -1)
        dibujarBarra(50, 84, 60, 5, 1 - (descansoHasta - ahora) / 1500, 7)
    }
}

function dibujarCrafteo(t: number) {
    let ahora = game.runtime()
    screen.fillRect(0, 0, 160, 120, 15)
    uiCabecera("CRAFTEO", 5, (craftSel + 1) + "/" + REC_NOMBRE.length)
    screen.drawTransparentImage(imgIconoCasa, 84, 4)

    uiPanel(2, 18, 104, 84, 8)
    let top = Math.max(0, Math.min(REC_NOMBRE.length - 6, craftSel - 2))
    for (let jj = 0; jj < 6; jj++) {
        let j = top + jj
        let y = 22 + jj * 13
        let sel = j == craftSel
        let nivelMejora = (j >= 6) ? mejorasCraft[j - 6] : 0
        let ya = (j < 4 && tengoArma[j + 1]) || (j >= 6 && nivelMejora >= MEJORA_MAX)
        let ok = puedeCraftear(j)
        if (sel) {
            screen.fillRect(4, y - 2, 94, 12, 8)
            screen.drawRect(4, y - 2, 94, 12, (Math.floor(t) % 2 == 0) ? 5 : 4)
        }
        screen.drawTransparentImage(ICONOS_REC[j], 6, y - 1)
        screen.print(REC_NOMBRE[j], 17, y + 1, sel ? 5 : ((ok || ya) ? 1 : 13), image.font5)
        let est = ya ? ((j >= 6) ? "MAX" : "TIENES") : (ok ? "LISTO" : "")
        if (est == "" && nivelMejora > 0) est = nivelMejora + "/" + MEJORA_MAX
        if (ok && !ya) {
            uiChip(95 - est.length * 6 - 3, y - 1, est, 7, 15)
        } else {
            screen.print(est, 96 - est.length * 6, y + 1, ya ? 13 : 5, image.font5)
        }
    }
    uiScroll(100, 21, 78, REC_NOMBRE.length, 6, top)

    uiPanel(108, 18, 50, 84, 8)
    screen.print("COSTE", 112, 22, 9, image.font5)
    screen.drawLine(111, 28, 154, 28, 8)
    for (let k = 0; k < NUM_MATS; k++) {
        let need = REC_COSTE[craftSel][k]
        let col = 13
        if (need > 0) col = (mats[k] >= need) ? 7 : 2
        let y = 32 + k * 8
        screen.fillRect(112, y, 5, 5, need > 0 ? MAT_COL[k] : 12)
        screen.drawRect(111, y - 1, 7, 7, 15)
        let txt = MAT_ABR[k] + " " + mats[k]
        if (need > 0) txt += "/" + need
        screen.print(txt, 121, y, col, image.font5)
    }

    uiPanel(0, 103, 160, 17, 5)
    if (ahora < mensajeTiendaHasta) {
        uiCentro(mensajeTienda, 108, mensajeTiendaColor, image.font8, 15)
    } else {
        screen.print(REC_DESC[craftSel], 4, 106, 1, image.font5)
        uiTecla(4, 111, "A", 7)
        screen.print("CREAR", 14, 112, 9, image.font5)
        uiTecla(58, 111, "B", 2)
        screen.print("VOLVER", 68, 112, 9, image.font5)
    }
}

// ---------------------------------------------------------
// HUD extra: flecha a la ciudad, aviso de entrada y arma
// ---------------------------------------------------------

function dibujarExtrasMundo(t: number, camX: number, camY: number) {
    // Flecha hacia la ciudad mas cercana
    if (hayCiudadCerca) {
        let sx = ciudadCercanaX - camX
        let sy = ciudadCercanaY - camY
        if (sx < 0 || sx > 160 || sy < 16 || sy > 118) {
            uiIndicador(sx, sy, t, imgIconoCasa, 9, Math.floor(ciudadCercanaDist / 10) + "M")
        }
    }

    // Aviso para entrar en una casa
    if (npcCerca && estadoActual == EstadoJuego.Jugando) {
        let idiN = (npcCerca.data["idioma"] as number) || 0
        let txtE = ROL_NOMBRE_C[idiN]
        let wE = txtE.length * 6 + 18
        let px = Math.max(Math.floor(wE / 2) + 1, Math.min(159 - Math.floor(wE / 2), Math.floor(npcCerca.x - camX)))
        let py = Math.max(20, Math.floor(npcCerca.y - camY) - 20)
        let bx = px - Math.floor(wE / 2)
        screen.fillRect(bx, py - 2, wE, 11, 15)
        screen.drawRect(bx, py - 2, wE, 11, 9)
        uiTecla(bx + 3, py, "A", 7)
        screen.print(txtE, bx + 13, py + 1, 5, image.font5)
    }

    // Redada: barras de vida de los ciudadanos y contador
    if (raidActiva) {
        let vivosN = 0
        for (let n of sprites.allOfKind(SpriteKind.Npc)) {
            let hpN = Math.max(0, (n.data["hp"] as number) / (n.data["hpMax"] as number))
            let bx = Math.floor(n.x - camX) - 7
            let by = Math.floor(n.y - camY) - 12
            screen.fillRect(bx, by, 14, 3, 15)
            screen.fillRect(bx, by, Math.floor(14 * hpN), 3, 7)
            screen.drawRect(bx - 1, by - 1, 16, 5, 1)
            vivosN++
        }
        let raiders = 0
        for (let e of enemigosFrame) {
            if (e.data["raider"] && !e.data["muerto"]) raiders++
        }
        let txtR = "REDADA! GENTE:" + vivosN + " ENEM:" + raiders
        screen.fillRect(1, 91, txtR.length * 6 + 3, 9, 15)
        screen.print(txtR, 3, 93, (Math.floor(t) % 2 == 0) ? 2 : 5, image.font5)
    }

    // Arma equipada y accion del boton B
    uiPanel(95, 96, 64, 20, 8)
    screen.fillRect(97, 98, 10, 10, 15)
    screen.drawRect(97, 98, 10, 10, 9)
    screen.drawTransparentImage(ICONOS_INV[armaEquipada], 98, 99)
    screen.print(ARMA_NOMBRE[armaEquipada], 111, 100, 5, image.font5)
    uiTecla(98, 108, "B", 2)
    if (modoB == 1 || nivelHabilidadDash <= 0) {
        screen.drawTransparentImage(ICONOS_INV[5], 108, 107)
        screen.print(hudTxt(5, "x", bombas), 118, 109, bombas > 0 ? 1 : 13, image.font5)
    } else {
        screen.print("DASH", 108, 109, 9, image.font5)
    }
}

// =========================================================
// V27: NUEVAS MECANICAS
//   1) COMBO / FRENESI          4) MUTACIONES DE OLEADA
//   2) BOMBITAS EN CADENA       5) RELIQUIAS DE JEFE
//   3) ELITES CON AFIJOS        6) DASH OFENSIVO
// Todo funciona con el reloj de partida (tiempoPartidaMs), que no avanza
// en menus, tienda ni casas: ningun temporizador se rompe al pausar.
// =========================================================

function sonidoV27(freq: number, dur: number, vol: number) {
    music.setVolume(Math.map(volumenAudio, 0, 100, 0, vol))
    music.playTone(freq, dur)
}

function reiniciarV27() {
    comboCuenta = 0
    comboHastaMs = 0
    comboTier = 0
    comboMax = 0
    comboVentanaExtra = 0
    proxKaboomCombo = 0
    cadenaProf = 0
    multExplosivo = 1.0
    elitesMatadas = 0
    afijosVistos = [false, false, false, false, false]
    modOleada = 0
    ultimoMod = 0
    meteoros = []
    proxMeteoro = 0
    santActivo = false
    santCarga = 0
    proxSant = 35000
    santUltTp = 0
    santHechos = 0
    reliquias = [false, false, false, false, false, false]
    reliquiaPendiente = false
    modoReliquia = false
    killsBomba = 0
    overdriveHasta = 0
    proxOverdrive = 0
    proxAegis = 0
    ultimoDanoMs = -99999
}

// Dano "del mundo" (meteoritos, minas): escala con la dificultad como los enemigos
function danoMundo(base: number): number {
    let m = (nivelDificultad == 2) ? 1.8 : (nivelDificultad == 1 ? 1.2 : 0.8)
    return Math.floor(base * m)
}

// Daña a todo enemigo vivo (y jefes, con menos efecto) dentro de un radio.
// Devuelve cuantos enemigos alcanzo. Respeta la bandera "muerto" (sin dobles bajas).
function danarEnRadio(x: number, y: number, r: number, dano: number, mostrar: boolean): number {
    let n = 0
    let r2 = r * r
    for (let b of enemigosFrame) {
        if (b.data["muerto"]) continue
        let dx = b.x - x
        let dy = b.y - y
        if (dx * dx + dy * dy <= r2) {
            n++
            procesarDanoAEnemigo(b, dano, mostrar)
        }
    }
    let rj = r + 10
    for (let j of jefesFrame) {
        if (j.data["muerto"]) continue
        let dx = j.x - x
        let dy = j.y - y
        if (dx * dx + dy * dy <= rj * rj) {
            n++
            procesarDanoAEnemigo(j, dano * 0.6, mostrar)
        }
    }
    return n
}

// ---------------------------------------------------------
// 1) COMBO / FRENESI
// Encadena bajas antes de que se acabe la barra. Cada nivel mejora la
// cadencia, la puntuacion y la experiencia; el oro sube desde FRENESI y en
// KABOOM cada baja detona una mini explosion.
// ---------------------------------------------------------

function ventanaCombo(): number {
    return Math.max(1800, 2800 - 280 * comboTier) + comboVentanaExtra
}

function registrarBajaCombo(x: number, y: number) {
    comboCuenta++
    if (comboCuenta > comboMax) comboMax = comboCuenta
    comboHastaMs = tiempoPartidaMs + ventanaCombo()
    let t = 0
    for (let k = 0; k < COMBO_UMBRAL.length; k++) {
        if (comboCuenta >= COMBO_UMBRAL[k]) t = k + 1
    }
    if (t > comboTier) {
        comboTier = t
        if (jugadorSprite) textoFlotante(jugadorSprite.x, jugadorSprite.y - 20, COMBO_NOMBRE[t], COMBO_COL[t])
        sonidoV27(440 + 140 * t, 90, 110)
        scene.cameraShake(2, 160)
    }
    // Nivel KABOOM: cada baja detona una mini explosion (con enfriamiento y limite de cadena)
    if (comboTier >= 3 && tiempoPartidaMs >= proxKaboomCombo && cadenaProf < 3) {
        proxKaboomCombo = tiempoPartidaMs + 140
        cadenaProf++
        crearAnillo(x, y, 22, 2, 180)
        danarEnRadio(x, y, 22, Math.max(8, danoAtaque * 0.6 * multExplosivo), false)
        cadenaProf--
    }
}

function actualizarCombo(tp: number) {
    if (comboCuenta > 0 && tp > comboHastaMs) {
        if (comboCuenta >= COMBO_UMBRAL[0] && jugadorSprite) {
            textoFlotante(jugadorSprite.x, jugadorSprite.y - 20, "COMBO x" + comboCuenta, 13)
        }
        comboCuenta = 0
        comboTier = 0
    }
}

function factorCadenciaV27(): number {
    let f = COMBO_F_CAD[comboTier]
    if (tiempoPartidaMs < overdriveHasta) f = f * 0.4
    return f
}

// ---------------------------------------------------------
// 2) BOMBITAS EN CADENA
// Una bombita abatida a distancia detona y dana a los enemigos cercanos
// (y estos, si son bombitas, detonan a su vez). Sacar 3 o mas bajas de una
// sola explosion da un bonus KABOOM. Cerca de ti, ojo: tambien te alcanza.
// ---------------------------------------------------------

const R_BOMBITA = 34

function detonarBombita(x: number, y: number, fuente: Sprite, danoJugador: number) {
    if (cadenaProf >= 6) return
    cadenaProf++
    let k0 = killsPartida
    crearAnillo(x, y, R_BOMBITA, 4, 260)
    crearEfectoMuerte(x, y)
    scene.cameraShake(3, 200)
    sonidoV27(140, 140, 120)

    let dxj = jugadorSprite.x - x
    let dyj = jugadorSprite.y - y
    if (dxj * dxj + dyj * dyj <= R_BOMBITA * R_BOMBITA) {
        recibirDanoJugador(danoJugador, "BOMBITA")
    }
    danarEnRadio(x, y, R_BOMBITA, Math.max(40, danoAtaque * 3 * multExplosivo), true)

    if (cadenaProf == 1) {
        let n = killsPartida - k0
        if (n >= 3) {
            textoFlotante(x, y - 16, "KABOOM x" + n + "!", 5)
            puntosPuntuacion += 40 * n
            for (let k = 0; k < Math.min(n, 6); k++) {
                crearMoneda(x + Math.randomRange(-14, 14), y + Math.randomRange(-14, 14))
            }
            sonidoV27(660, 120, 130)
        }
    }
    cadenaProf--
}

// ---------------------------------------------------------
// 3) ELITES CON AFIJOS
// Desde la oleada 3 algunos enemigos nacen como elite: mucha vida, mejor
// botin y un afijo con su propio contra-juego.
//   VOLATIL  : explota al morir (matalo lejos de ti y cerca de la horda)
//   BLINDADO : escudo extra que hay que romper antes de tocarle la vida
//   FASEADO  : se teletransporta donde ibas a estar (mira el aviso morado)
//   LIDER    : acelera a los de su alrededor; si cae, la horda se desorienta
// ---------------------------------------------------------

function contarElites(): number {
    let n = 0
    for (let e of enemigosFrame) {
        if (!e.data["muerto"] && e.data["elite"]) n++
    }
    return n
}

function convertirEnElite(b: Sprite, af: number) {
    let bd = b.data
    bd["elite"] = af
    hayElites = true
    if (af == 4) hayLideres = true
    let hp = ((bd["maxHp"] as number) || 50) * 2.4
    bd["hp"] = hp
    bd["maxHp"] = hp
    bd["dano"] = ((bd["dano"] as number) || 10) * 1.25
    if (af == 2) {
        bd["escudo"] = hp
        bd["escudoMax"] = hp
    }
    if (af == 3) {
        bd["fase"] = 0
        bd["faseT"] = tiempoPartidaMs + 2200
    }
    if (!afijosVistos[af]) {
        afijosVistos[af] = true
        mostrarToast("ELITE " + AFIJO_NOMBRE[af] + "!", AFIJO_AVISO[af], AFIJO_COL[af])
    }
}

function intentarElite(b: Sprite) {
    if (oleadaActual < 3) return
    let tipo = (b.data["tipo"] as number) || 0
    if (tipo == 5 || tipo == 7) return
    let prob = Math.min(16, 2 + oleadaActual * 1.2 + nivelDificultad * 2)
    if (Math.randomRange(1, 1000) > Math.floor(prob * 10)) return
    if (contarElites() >= 1 + Math.floor(oleadaActual / 4)) return
    convertirEnElite(b, Math.randomRange(1, 4))
}

function romperEscudo(b: Sprite) {
    crearAnillo(b.x, b.y, 16, 9, 220)
    textoFlotante(b.x, b.y - 14, "ESCUDO ROTO!", 9)
    sonidoV27(900, 60, 100)
}

function explosionVolatil(x: number, y: number, fuente: Sprite) {
    if (cadenaProf >= 5) return
    cadenaProf++
    let R = 32
    crearAnillo(x, y, R, 2, 280)
    crearEfectoMuerte(x, y)
    scene.cameraShake(4, 260)
    sonidoV27(130, 150, 130)
    let dxj = jugadorSprite.x - x
    let dyj = jugadorSprite.y - y
    if (dxj * dxj + dyj * dyj <= R * R) {
        recibirDanoJugador(((fuente.data["dano"] as number) || 20) * 1.1, "VOLATIL")
    }
    danarEnRadio(x, y, R, Math.max(40, danoAtaque * 3 * multExplosivo), true)
    cadenaProf--
}

function muerteElite(b: Sprite, ex: number, ey: number) {
    let af = (b.data["elite"] as number) || 0
    if (af == 0) return
    elitesMatadas++
    for (let k = 0; k < 4; k++) crearMoneda(ex + Math.randomRange(-12, 12), ey + Math.randomRange(-12, 12))
    let gx = sprites.create(imgGemaXP, SpriteKind.SemillaXP)
    gx.setPosition(ex + 6, ey)
    gx.z = 1
    gx.data["xp"] = 60
    if (Math.randomRange(1, 100) <= 35) {
        let pv = sprites.create(imgGemaVida, SpriteKind.PocionVida)
        pv.setPosition(ex - 6, ey + 4)
        pv.z = 1
    }
    textoFlotante(ex, ey - 12, "ELITE!", AFIJO_COL[af])
    if (af == 1) {
        explosionVolatil(ex, ey, b)
    } else if (af == 4) {
        crearAnillo(ex, ey, 40, 5, 300)
        let ahora = game.runtime()
        for (let e of enemigosFrame) {
            if (e.data["muerto"]) continue
            let dx = e.x - ex
            let dy = e.y - ey
            if (dx * dx + dy * dy <= 70 * 70) e.data["lentoHasta"] = ahora + 2200
        }
        textoFlotante(ex, ey - 22, "SIN LIDER!", 5)
    }
}

// Marcas visuales de los elites (esquinas, barra de vida con escudo, aura, aviso de salto)
function dibujarElites(camX: number, camY: number, t: number) {
    if (!hayElites) return
    let parpadeo = Math.floor(t) % 2 == 0
    let hallado = false
    for (let b of enemigosFrame) {
        let bd = b.data
        let af = (bd["elite"] as number) || 0
        if (af == 0 || bd["muerto"]) continue
        hallado = true
        let sx = Math.floor(b.x - camX)
        let sy = Math.floor(b.y - camY)
        if (sx < -50 || sx > 210 || sy < -50 || sy > 170) continue
        let col = AFIJO_COL[af]
        let c = parpadeo ? col : 1

        if (af == 4) screen.drawCircle(sx, sy, 48, 5)

        // esquinas
        screen.drawLine(sx - 8, sy - 8, sx - 5, sy - 8, c)
        screen.drawLine(sx - 8, sy - 8, sx - 8, sy - 5, c)
        screen.drawLine(sx + 8, sy - 8, sx + 5, sy - 8, c)
        screen.drawLine(sx + 8, sy - 8, sx + 8, sy - 5, c)
        screen.drawLine(sx - 8, sy + 8, sx - 5, sy + 8, c)
        screen.drawLine(sx - 8, sy + 8, sx - 8, sy + 5, c)
        screen.drawLine(sx + 8, sy + 8, sx + 5, sy + 8, c)
        screen.drawLine(sx + 8, sy + 8, sx + 8, sy + 5, c)

        // barra de vida (siempre visible) + escudo
        let hpPct = Math.max(0, ((bd["hp"] as number) || 0) / Math.max(1, (bd["maxHp"] as number) || 1))
        screen.fillRect(sx - 8, sy - 15, 16, 4, 15)
        screen.fillRect(sx - 8, sy - 15, Math.floor(16 * Math.min(1, hpPct)), 4, 2)
        let esc = (bd["escudo"] as number) || 0
        if (esc > 0) {
            let escPct = Math.min(1, esc / Math.max(1, (bd["escudoMax"] as number) || 1))
            screen.fillRect(sx - 8, sy - 15, Math.floor(16 * escPct), 4, 9)
        }
        screen.drawRect(sx - 9, sy - 16, 18, 6, col)

        // FASEADO: marca el punto de llegada
        if (af == 3 && ((bd["fase"] as number) || 0) == 1) {
            let fx = Math.floor((bd["faseX"] as number) - camX)
            let fy = Math.floor((bd["faseY"] as number) - camY)
            screen.drawCircle(fx, fy, 20, parpadeo ? 10 : 1)
            screen.drawCircle(fx, fy, 12, 11)
            screen.drawLine(fx - 4, fy, fx + 4, fy, 10)
            screen.drawLine(fx, fy - 4, fx, fy + 4, 10)
        }
    }
    hayElites = hallado
}

// ---------------------------------------------------------
// 4) MUTACIONES DE OLEADA
// Algunas oleadas llegan alteradas. Cada una premia jugar con la cabeza.
// ---------------------------------------------------------

function crearImgMina(estado: number): Image {
    let im = image.create(9, 9)
    im.fillRect(1, 2, 7, 5, 12)
    im.fillRect(2, 1, 5, 7, 12)
    im.setPixel(4, 0, 13)
    im.setPixel(4, 8, 13)
    im.setPixel(0, 4, 13)
    im.setPixel(8, 4, 13)
    im.setPixel(1, 1, 13)
    im.setPixel(7, 1, 13)
    im.setPixel(1, 7, 13)
    im.setPixel(7, 7, 13)
    let c = estado == 0 ? 13 : (estado == 1 ? 2 : 5)
    im.fillRect(3, 3, 3, 3, c)
    im.setPixel(4, 4, 1)
    return im
}
const imgMinaApagada: Image = crearImgMina(0)
const imgMinaRoja: Image = crearImgMina(1)
const imgMinaAmarilla: Image = crearImgMina(2)

function colocarMinas() {
    let n = Math.min(10, 5 + Math.floor(oleadaActual / 2))
    for (let i = 0; i < n; i++) {
        let a = Math.randomRange(0, 359) * (Math.PI / 180)
        let r = Math.randomRange(48, 130)
        let m = sprites.create(imgMinaApagada, SpriteKind.Mina)
        m.setPosition(jugadorSprite.x + Math.cos(a) * r, jugadorSprite.y + Math.sin(a) * r)
        m.z = 0
        m.data["arma"] = tiempoPartidaMs + 1200
    }
}

function elegirModOleada() {
    // Limpia lo de la oleada anterior
    sprites.destroyAllSpritesOfKind(SpriteKind.Mina)
    meteoros = []
    proxMeteoro = tiempoPartidaMs + 2500
    modOleada = 0
    // Los jefes y la primera oleada van sin mutacion
    if (oleadaActual < 2 || oleadaActual % 5 == 0) return
    if (Math.randomRange(1, 100) > 36 + 6 * nivelDificultad) return
    let m = Math.randomRange(1, 4)
    if (m == ultimoMod) m = (m % 4) + 1
    modOleada = m
    ultimoMod = m
    if (m == MOD_ENJAMBRE) {
        bichosRestantesPorSpawn = Math.ceil(bichosEnOleada * 1.7)
        totalBichosOleadaInicial = bichosRestantesPorSpawn
    } else if (m == MOD_MINAS) {
        colocarMinas()
    }
}

function programarMeteoro(tp: number) {
    let x = 0
    let y = 0
    if (Math.randomRange(1, 100) <= 60 || enemigosFrame.length == 0) {
        // Apunta a donde ibas a estar: hay que cambiar de rumbo
        x = jugadorSprite.x + jugadorSprite.vx * 0.7 + Math.randomRange(-14, 14)
        y = jugadorSprite.y + jugadorSprite.vy * 0.7 + Math.randomRange(-14, 14)
    } else {
        // O cae sobre la horda: aprovechalo
        let e = enemigosFrame[Math.randomRange(0, enemigosFrame.length - 1)]
        x = e.x
        y = e.y
    }
    meteoros.push({ x: x, y: y, t0: tp, fin: tp + 1000, dano: danoMundo(14 + 3 * oleadaActual) })
}

function impactoMeteoro(m: Meteoro) {
    let R = 24
    crearAnillo(m.x, m.y, R, 4, 280)
    crearEfectoMuerte(m.x, m.y)
    scene.cameraShake(3, 220)
    sonidoV27(110, 160, 130)
    let dxj = jugadorSprite.x - m.x
    let dyj = jugadorSprite.y - m.y
    if (dxj * dxj + dyj * dyj <= R * R) recibirDanoJugador(m.dano, "METEORITO")
    danarEnRadio(m.x, m.y, R, Math.max(30, danoAtaque * 3 * multExplosivo), true)
}

function explotarMina(m: Sprite) {
    if (m.data["muerto"]) return
    m.data["muerto"] = true
    let x = m.x
    let y = m.y
    m.destroy()
    let R = 28
    crearAnillo(x, y, R, 2, 260)
    crearEfectoMuerte(x, y)
    scene.cameraShake(3, 200)
    sonidoV27(150, 140, 120)
    if (jugadorSprite) {
        let dxj = jugadorSprite.x - x
        let dyj = jugadorSprite.y - y
        if (dxj * dxj + dyj * dyj <= R * R) recibirDanoJugador(danoMundo(20 + 3 * oleadaActual), "MINA")
    }
    danarEnRadio(x, y, R, Math.max(35, danoAtaque * 3 * multExplosivo), true)
}

function actualizarMinas(ahora: number, tp: number) {
    let minas = sprites.allOfKind(SpriteKind.Mina)
    if (minas.length == 0) return
    let imParpadeo = (Math.floor(ahora / 260) % 2 == 0) ? imgMinaRoja : imgMinaAmarilla
    for (let m of minas) {
        if (m.data["muerto"]) continue
        if (tp < ((m.data["arma"] as number) || 0)) continue
        if (m.image != imParpadeo) m.setImage(imParpadeo)
        let dispara = false
        let dx = jugadorSprite.x - m.x
        let dy = jugadorSprite.y - m.y
        if (dx * dx + dy * dy < 100) dispara = true
        if (!dispara) {
            for (let e of enemigosFrame) {
                if (e.data["muerto"]) continue
                let ex = e.x - m.x
                let ey = e.y - m.y
                if (ex * ex + ey * ey < 81) {
                    dispara = true
                    break
                }
            }
        }
        if (!dispara) {
            for (let j of jefesFrame) {
                let ex = j.x - m.x
                let ey = j.y - m.y
                if (ex * ex + ey * ey < 196) {
                    dispara = true
                    break
                }
            }
        }
        if (dispara) explotarMina(m)
    }
}

// Disparar a una mina armada la detona a distancia
sprites.onOverlap(SpriteKind.ProyectilJugador, SpriteKind.Mina, function (bala, mina) {
    if (estadoActual != EstadoJuego.Jugando) return
    if (tiempoPartidaMs < ((mina.data["arma"] as number) || 0)) return
    bala.destroy()
    explotarMina(mina)
})

function actualizarMods(ahora: number, tp: number) {
    if (modOleada == MOD_METEORITOS && tp >= proxMeteoro && meteoros.length < 4) {
        proxMeteoro = tp + Math.max(850, 1900 - 60 * oleadaActual)
        programarMeteoro(tp)
    }
    for (let i = meteoros.length - 1; i >= 0; i--) {
        if (tp >= meteoros[i].fin) {
            let m = meteoros[i]
            meteoros.removeAt(i)
            impactoMeteoro(m)
        }
    }
    if (modOleada == MOD_MINAS) actualizarMinas(ahora, tp)
    actualizarSantuario(ahora, tp)
}

function santDentro(): boolean {
    let dx = jugadorSprite.x - santX
    let dy = jugadorSprite.y - santY
    return dx * dx + dy * dy <= 22 * 22
}

function actualizarSantuario(ahora: number, tp: number) {
    let dt = tp - santUltTp
    santUltTp = tp
    if (dt < 0 || dt > 250) dt = 0
    if (!santActivo) {
        if (tp >= proxSant && oleadaActual >= 2 && jefesFrame.length == 0) {
            let a = Math.randomRange(0, 628) / 100
            let r = Math.randomRange(55, 80)
            santX = jugadorSprite.x + Math.cos(a) * r
            santY = jugadorSprite.y + Math.sin(a) * r
            santActivo = true
            santCarga = 0
            santFin = tp + 24000
            proxEcoSant = tp + 1200
            mostrarBanner("SANTUARIO", "QUEDATE 5 SEG DENTRO", 9)
            sonidoV27(660, 140, 110)
        }
        return
    }
    if (santDentro()) {
        santCarga = Math.min(1, santCarga + dt / 5000)
        if (tp >= proxEcoSant) {
            proxEcoSant = tp + 1100
            if (enemigosFrame.length < MAX_ENEMIGOS_Q[calidad]) {
                let a = Math.randomRange(0, 628) / 100
                crearEnemigo(elegirTipoEnemigo(), santX + Math.cos(a) * 50, santY + Math.sin(a) * 50)
            }
            crearAnillo(santX, santY, 14, 9, 260)
            sonidoV27(300 + Math.floor(santCarga * 500), 40, 70)
        }
    } else {
        santCarga = Math.max(0, santCarga - dt / 14000)
    }
    if (santCarga >= 1) {
        santActivo = false
        santHechos++
        proxSant = tp + 40000
        crearAnillo(santX, santY, 48, 5, 420)
        crearAnillo(santX, santY, 24, 9, 320)
        scene.cameraShake(3, 260)
        danarEnRadio(santX, santY, 60, Math.max(40, danoAtaque * 4), true)
        vidaActual = Math.min(vidaMaxima, vidaActual + Math.floor(vidaMaxima * 0.3))
        invulnerableHasta = ahora + 1500
        xpPendienteDirecto += 30 + 5 * oleadaActual
        for (let k = 0; k < 6; k++) {
            crearMoneda(santX + Math.randomRange(-22, 22), santY + Math.randomRange(-22, 22))
        }
        textoFlotante(jugadorSprite.x, jugadorSprite.y - 14, "+VIDA", 7)
        mostrarToast("SANTUARIO!", "VIDA +30% ORO Y XP", 5)
        sonidoV27(523, 90, 120)
        sonidoV27(784, 160, 120)
    } else if (tp >= santFin) {
        santActivo = false
        proxSant = tp + 25000
        mostrarToast("SANTUARIO PERDIDO", "LA LUZ SE APAGO", 2)
        sonidoV27(180, 200, 100)
    }
}

// ---------------------------------------------------------
// 5) RELIQUIAS DE JEFE
// Cada jefe derrotado ofrece 3 reliquias (sin repetir). Son poderosas y
// algunas tienen precio: cambian la forma de jugar toda la partida.
// ---------------------------------------------------------

function presentarReliquias() {
    let libres: number[] = []
    for (let i = 0; i < REL_NOMBRE.length; i++) {
        if (!reliquias[i]) libres.push(i)
    }
    if (libres.length == 0) {
        // Coleccion completa: premio en oro
        for (let k = 0; k < 8; k++) {
            crearMoneda(jugadorSprite.x + Math.randomRange(-24, 24), jugadorSprite.y + Math.randomRange(-24, 24))
        }
        mostrarToast("COLECCION COMPLETA", "+8 MONEDAS", 10)
        return
    }
    estadoActual = EstadoJuego.MenuSubirNivel
    modoReliquia = true
    indiceCartaSeleccionada = 0
    opcionesCartasPresentadas = []
    congelarEscena()
    while (opcionesCartasPresentadas.length < 3 && libres.length > 0) {
        let k = Math.randomRange(0, libres.length - 1)
        let r = libres[k]
        libres.removeAt(k)
        opcionesCartasPresentadas.push({
            titulo: REL_NOMBRE[r],
            descripcion: REL_DESC[r],
            tipoStat: 100 + r,
            valorPotencia: 1,
            rarezaColor: 10
        })
    }
    sonidoV27(784, 140, 120)
}

function aplicarReliquia(r: number) {
    modoReliquia = false
    reliquias[r] = true
    if (r == 0) {
        vidaMaxima = Math.max(30, Math.floor(vidaMaxima * 0.7))
        vidaActual = Math.min(vidaActual, vidaMaxima)
        danoAtaque = Math.floor(danoAtaque * 1.6)
    } else if (r == 3) {
        proxOverdrive = tiempoPartidaMs + 6000
    } else if (r == 4) {
        ultimoDanoMs = tiempoPartidaMs
    } else if (r == 5) {
        nivelRayo += 1
    }
    mostrarToast("RELIQUIA: " + REL_NOMBRE[r], REL_AVISO[r], 10)
}

function ondaAegis() {
    let x = jugadorSprite.x
    let y = jugadorSprite.y
    crearAnillo(x, y, 48, 9, 300)
    scene.cameraShake(3, 200)
    sonidoV27(500, 100, 120)
    danarEnRadio(x, y, 48, danoAtaque * 3, true)
    for (let p of sprites.allOfKind(SpriteKind.ProyectilEnemigo)) {
        let dx = p.x - x
        let dy = p.y - y
        if (dx * dx + dy * dy <= 56 * 56) p.destroy()
    }
    textoFlotante(x, y - 20, "AEGIS!", 9)
}

function actualizarReliquias(tp: number) {
    // FUROR: cada 14 s, 4 s de cadencia desatada
    if (reliquias[3] && tp >= proxOverdrive) {
        overdriveHasta = tp + 4000
        proxOverdrive = tp + 14000
        textoFlotante(jugadorSprite.x, jugadorSprite.y - 20, "FURIA!", 5)
        crearAnillo(jugadorSprite.x, jugadorSprite.y, 20, 5, 200)
        sonidoV27(880, 120, 120)
    }
    // AEGIS: si llevas 4 s sin que te toquen, el escudo se recarga
    if (reliquias[4] && tp - ultimoDanoMs >= 4000 && tp >= proxAegis) {
        proxAegis = tp + 1000
        let tope = Math.max(30, Math.floor(vidaMaxima * 0.4))
        if (puntosEscudoActivo < tope) {
            puntosEscudoActivo = Math.min(tope, puntosEscudoActivo + 10)
            actualizarGraficoEscudo()
        }
    }
}

// ---------------------------------------------------------
// 6) DASH OFENSIVO: embiste, hiere y desvia proyectiles por el camino
// ---------------------------------------------------------

function distSegmento(px: number, py: number, x0: number, y0: number, sx: number, sy: number, l2: number): number {
    let t = ((px - x0) * sx + (py - y0) * sy) / l2
    if (t < 0) t = 0
    else if (t > 1) t = 1
    let cx = x0 + sx * t - px
    let cy = y0 + sy * t - py
    return Math.sqrt(cx * cx + cy * cy)
}

function dashEmbestida(x0: number, y0: number, x1: number, y1: number) {
    let sx = x1 - x0
    let sy = y1 - y0
    let l2 = sx * sx + sy * sy
    if (l2 < 1) return
    let l = Math.sqrt(l2)
    let dmg = danoAtaque * (1.4 + 0.2 * nivelHabilidadDash)
    let golpes = 0
    for (let e of sprites.allOfKind(SpriteKind.Enemy)) {
        if (e.data["muerto"]) continue
        if (distSegmento(e.x, e.y, x0, y0, sx, sy, l2) <= 20) {
            golpes++
            procesarDanoAEnemigo(e, dmg, true)
            if (!e.data["muerto"]) {
                e.x += sx / l * 14
                e.y += sy / l * 14
            }
        }
    }
    for (let j of sprites.allOfKind(SpriteKind.JefeEnemigo)) {
        if (j.data["muerto"]) continue
        if (distSegmento(j.x, j.y, x0, y0, sx, sy, l2) <= 24) {
            golpes++
            procesarDanoAEnemigo(j, dmg * 0.6, true)
        }
    }
    for (let p of sprites.allOfKind(SpriteKind.ProyectilEnemigo)) {
        if (distSegmento(p.x, p.y, x0, y0, sx, sy, l2) <= 26) {
            p.destroy()
            golpes++
        }
    }
    if (golpes > 0) textoFlotante(x1, y1 - 18, "EMBESTIDA!", 9)
}

// ---------------------------------------------------------
// Actualizacion por frame (devuelve true si ha abierto un menu y hay que cortar el frame)
// ---------------------------------------------------------

function actualizarMecanicasV27(ahora: number): boolean {
    let tp = tiempoPartidaMs
    if (reliquiaPendiente) {
        reliquiaPendiente = false
        presentarReliquias()
        if (estadoActual != EstadoJuego.Jugando) return true
    }
    if (xpPendienteDirecto > 0) {
        xpActual += xpPendienteDirecto
        xpPendienteDirecto = 0
        comprobarSubidaNivel()
        if (estadoActual != EstadoJuego.Jugando) return true
    }
    explosionesFrame = 0
    actualizarCombo(tp)
    actualizarReliquias(tp)
    actualizarMods(ahora, tp)
    return false
}

// ---------------------------------------------------------
// Dibujo: avisos del mundo y HUD de las mecanicas nuevas
// ---------------------------------------------------------

function dibujarMundoV27(t: number, camX: number, camY: number) {
    // Meteoritos: zona de impacto que se llena y la roca que cae
    for (let m of meteoros) {
        let sx = Math.floor(m.x - camX)
        let sy = Math.floor(m.y - camY)
        if (sx < -30 || sx > 190 || sy < -30 || sy > 150) continue
        let p = Math.min(1, Math.max(0, (tiempoPartidaMs - m.t0) / (m.fin - m.t0)))
        screen.drawCircle(sx, sy, 24, p > 0.7 ? 2 : 4)
        screen.drawCircle(sx, sy, Math.max(1, Math.floor(24 * p)), 5)
        screen.drawLine(sx - 3, sy, sx + 3, sy, 2)
        screen.drawLine(sx, sy - 3, sx, sy + 3, 2)
        let ry = sy - Math.floor((1 - p) * 70)
        screen.fillCircle(sx, ry, 3, 4)
        screen.fillCircle(sx, ry, 1, 5)
    }
    // V28: santuario (anillo de puntos que se enciende, pilares y cristal)
    if (santActivo && jugadorSprite) {
        let sx = Math.floor(santX - camX)
        let sy = Math.floor(santY - camY)
        if (sx > -30 && sx < 190 && sy > -30 && sy < 150) {
            let dentro = santDentro()
            let pasos = calidad == 2 ? 16 : 28
            for (let k = 0; k < pasos; k++) {
                let a = (k / pasos) * 6.2832 - 1.5708
                let px = sx + Math.round(Math.cos(a) * 22)
                let py = sy + Math.round(Math.sin(a) * 22)
                let lleno = k / pasos < santCarga
                screen.fillRect(px - 1, py - 1, 2, 2, lleno ? 5 : (dentro ? 4 : 9))
            }
            for (let k = 0; k < 4; k++) {
                let a = k * 1.5708 + 0.7854
                let px = sx + Math.round(Math.cos(a) * 22)
                let py = sy + Math.round(Math.sin(a) * 22)
                screen.fillRect(px - 2, py - 5, 4, 7, 12)
                screen.fillRect(px - 2, py - 5, 4, 2, dentro ? 5 : 9)
            }
            let bob = Math.round(Math.sin(t * 0.9) * 2)
            let cc = dentro ? 5 : 9
            screen.drawLine(sx, sy - 7 + bob, sx + 4, sy + bob, cc)
            screen.drawLine(sx + 4, sy + bob, sx, sy + 7 + bob, cc)
            screen.drawLine(sx, sy + 7 + bob, sx - 4, sy + bob, cc)
            screen.drawLine(sx - 4, sy + bob, sx, sy - 7 + bob, cc)
            screen.drawLine(sx, sy - 7 + bob, sx, sy + 7 + bob, 1)
            if (dentro) screen.drawCircle(sx, sy, 6 + Math.floor((t * 6) % 14), 5)
        }
    }
    dibujarElites(camX, camY, t)
    // RELOJ: con la vida baja el tiempo se ralentiza (borde morado)
    if (reliquias[1] && vidaActual <= vidaMaxima * 0.35) {
        screen.drawRect(0, 15, 160, 101, (Math.floor(t) % 2 == 0) ? 11 : 10)
        screen.drawRect(1, 16, 158, 99, 12)
    }
}

function dibujarHudV27(t: number, hayJefe: boolean) {
    // Combo
    if (comboCuenta >= 2) {
        let y = hayJefe ? 40 : 27
        let col = COMBO_COL[comboTier]
        screen.fillRect(1, y, 29, 13, 15)
        screen.drawRect(1, y, 29, 13, col)
        screen.print("x" + comboCuenta, 4, y + 3, col, image.font5)
        let rest = Math.max(0, Math.min(1, (comboHastaMs - tiempoPartidaMs) / ventanaCombo()))
        screen.fillRect(3, y + 10, 25, 2, 12)
        screen.fillRect(3, y + 10, Math.floor(25 * rest), 2, col)
    }
    // V28: santuario (barra de carga y flecha que apunta hacia el)
    if (santActivo && jugadorSprite) {
        if (!hayJefe) {
            screen.fillRect(48, 26, 64, 12, 15)
            screen.drawRect(48, 26, 64, 12, 9)
            screen.print("SANTUARIO", 52, 28, 9, image.font5)
            screen.fillRect(51, 34, 58, 2, 12)
            screen.fillRect(51, 34, Math.floor(58 * santCarga), 2, 5)
        }
        let dx = santX - jugadorSprite.x
        let dy = santY - jugadorSprite.y
        if (Math.abs(dx) > 70 || Math.abs(dy) > 44) {
            let ang = Math.atan2(dy, dx)
            let ca = Math.cos(ang)
            let sa = Math.sin(ang)
            let kx = Math.abs(ca) > 0.01 ? 68 / Math.abs(ca) : 999
            let ky = Math.abs(sa) > 0.01 ? 42 / Math.abs(sa) : 999
            let kk = Math.min(kx, ky)
            let ax = 80 + Math.round(ca * kk)
            let ay = Math.max(30, Math.min(100, 62 + Math.round(sa * kk)))
            screen.fillCircle(ax, ay, 4, 15)
            screen.drawCircle(ax, ay, 4, 9)
            screen.drawLine(ax, ay, ax + Math.round(ca * 7), ay + Math.round(sa * 7), 5)
            screen.setPixel(ax, ay, 1)
        }
    }
    // Mutacion de la oleada
    if (modOleada != 0) {
        let c = MOD_COL[modOleada]
        screen.fillRect(125, 26, 34, 9, 15)
        screen.drawRect(125, 26, 34, 9, c)
        screen.print(MOD_CORTO[modOleada], 128, 28, c, image.font5)
    }
    // Furor
    if (reliquias[3]) {
        let activo = tiempoPartidaMs < overdriveHasta
        let pct = activo ? (overdriveHasta - tiempoPartidaMs) / 4000 : 1 - Math.max(0, proxOverdrive - tiempoPartidaMs) / 14000
        dibujarBarraHabilidad(96, 86, activo ? "FURIA!" : "FURIA", pct, activo || pct >= 1)
    }
}

// =========================================================
// ARRANQUE (siempre al final del archivo)
// =========================================================

cargarProgreso()
inicializarFondoParticulas()
if (CODIGO_GUARDADO_ARCHIVO != "") importarCodigo(CODIGO_GUARDADO_ARCHIVO, true)
if (leerNum("TUTO_VISTO") == 0) abrirTutorial(true)
