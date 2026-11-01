// ============================================================================
// DATA.JS — Plano Exacto UF 8 (Arribeños 2968 3°A - 54.66 m²) y Catálogo Real
// Coordenadas en METROS. Origen (0,0) en esquina superior-izquierda (Noroeste).
// Eje X: Oeste (Contrafrente/Aire y Luz) -> Este (Frente/Calle Arribeños)
// Eje Z: Norte (Medianera Pasillo/Living) -> Sur (Medianera Dormitorios)
// ============================================================================

window.APP_DATA = {
  apartmentInfo: {
    name: "Arribeños 2968 — Piso 3° A (UF 8)",
    neighborhood: "Núñez, CABA",
    totalAreaM2: 54.66,
    ceilingHeight: 2.65
  },

  // Habitaciones / Ambientes con polígonos exactos según plano.pdf (UF 8)
  rooms: [
    {
      id: "hall",
      name: "Hall de Entrada",
      dimsLabel: "3.13 × 1.03 m",
      areaM2: 3.22,
      x: 0.00, z: 0.00, w: 3.13, d: 1.03,
      defaultFloor: "parquet_herringbone",
      camPos: { x: 0.6, y: 1.7, z: 0.52 },
      camTarget: { x: 4.8, y: 1.2, z: 1.5 },
      labelPos: { x: 1.55, z: 0.52 }
    },
    {
      id: "living",
      name: "Living / Comedor",
      dimsLabel: "3.90 × 3.60 m",
      areaM2: 14.04,
      x: 3.23, z: 0.00, w: 3.90, d: 3.60,
      defaultFloor: "parquet_herringbone",
      camPos: { x: 3.55, y: 1.75, z: 0.55 },
      camTarget: { x: 5.80, y: 1.10, z: 2.30 },
      labelPos: { x: 5.18, z: 1.80 }
    },
    {
      id: "cocina",
      name: "Cocina + Lavadero",
      dimsLabel: "3.08 × 2.57 m",
      areaM2: 7.92,
      x: 0.00, z: 1.03, w: 3.08, d: 2.57,
      defaultFloor: "tile_white_vein",
      camPos: { x: 1.65, y: 1.75, z: 1.30 },
      camTarget: { x: 1.40, y: 1.00, z: 3.20 },
      labelPos: { x: 1.54, z: 2.30 }
    },
    {
      id: "pasillo",
      name: "Pasillo Distribuidor",
      dimsLabel: "0.95 × 1.78 m",
      areaM2: 1.69,
      x: 3.23, z: 3.60, w: 0.95, d: 1.78,
      defaultFloor: "parquet_herringbone",
      camPos: { x: 3.70, y: 1.68, z: 3.75 },
      camTarget: { x: 3.70, y: 1.20, z: 5.30 },
      labelPos: { x: 3.70, z: 4.50 }
    },
    {
      id: "bano",
      name: "Baño Completo",
      dimsLabel: "2.15 × 1.34 m",
      areaM2: 2.88,
      x: 1.08, z: 3.96, w: 2.15, d: 1.34,
      defaultFloor: "tile_pink_vintage",
      camPos: { x: 3.05, y: 1.72, z: 4.60 },
      camTarget: { x: 1.50, y: 1.05, z: 4.60 },
      labelPos: { x: 2.15, z: 4.63 }
    },
    {
      id: "habitacion",
      name: "Habitación Interna (Aire y Luz)",
      dimsLabel: "3.10 × 3.22 m",
      areaM2: 9.98,
      x: 1.08, z: 5.38, w: 3.10, d: 3.22,
      defaultFloor: "parquet_herringbone",
      camPos: { x: 3.65, y: 1.75, z: 5.65 },
      camTarget: { x: 2.10, y: 0.95, z: 7.40 },
      labelPos: { x: 2.63, z: 7.05 }
    },
    {
      id: "oficina",
      name: "Oficina / Dorm. Frente (Arribeños)",
      dimsLabel: "2.70 × 4.92 m (4.35m libres)",
      areaM2: 13.28,
      x: 4.18, z: 3.68, w: 2.70, d: 4.92,
      defaultFloor: "parquet_herringbone",
      camPos: { x: 4.55, y: 1.75, z: 4.55 },
      camTarget: { x: 5.80, y: 1.05, z: 7.20 },
      labelPos: { x: 5.53, z: 6.45 }
    }
  ],

  // Paredes individuales (cada pared se puede pintar o revestir por separado como pared de acento)
  walls: [
    // Hall de Entrada
    { id: "w_hall_n", room: "hall", name: "Hall — Pared Norte (Larga)", x1: 0.00, z1: 0.00, x2: 3.23, z2: 0.00, thickness: 0.12, defaultColor: "#f5f4f0", defaultTex: "matte" },
    { id: "w_hall_w", room: "hall", name: "Hall — Pared Puerta Entrada", x1: 0.00, z1: 0.00, x2: 0.00, z2: 1.03, thickness: 0.12, defaultColor: "#f5f4f0", defaultTex: "matte",
      openings: [{ type: "door", start: 0.12, end: 0.92, y0: 0, y1: 2.05, label: "Puerta Principal" }]
    },
    { id: "w_hall_s1", room: "hall", name: "Hall — Tabique Cocina Izq.", x1: 0.00, z1: 1.03, x2: 1.05, z2: 1.03, thickness: 0.10, defaultColor: "#f5f4f0", defaultTex: "matte" },
    { id: "w_hall_s2", room: "hall", name: "Hall — Tabique Cocina Der.", x1: 1.80, z1: 1.03, x2: 3.13, z2: 1.03, thickness: 0.10, defaultColor: "#f5f4f0", defaultTex: "matte" },

    // Living / Comedor
    { id: "w_liv_n", room: "living", name: "Living — Pared Norte (Continuación Pasillo)", x1: 3.23, z1: 0.00, x2: 7.13, z2: 0.00, thickness: 0.14, defaultColor: "#f5f4f0", defaultTex: "matte" },
    { id: "w_liv_e", room: "living", name: "Living — Pared Este (Ventanal Calle Arribeños)", x1: 7.13, z1: 0.00, x2: 7.13, z2: 3.60, thickness: 0.18, defaultColor: "#f5f4f0", defaultTex: "matte",
      openings: [{ type: "window", start: 0.85, end: 2.85, y0: 0.85, y1: 2.25, curtainId: "curtain_living", label: "Ventana a Arribeños" }]
    },
    { id: "w_liv_s", room: "living", name: "Living — Pared Sur (Divisoria c/ Oficina)", x1: 4.18, z1: 3.60, x2: 7.13, z2: 3.60, thickness: 0.12, defaultColor: "#f5f4f0", defaultTex: "matte" },
    { id: "w_liv_w", room: "living", name: "Living — Pared Oeste (Divisoria c/ Cocina)", x1: 3.13, z1: 1.03, x2: 3.13, z2: 3.60, thickness: 0.12, defaultColor: "#f5f4f0", defaultTex: "matte" },

    // Cocina
    { id: "w_coc_w", room: "cocina", name: "Cocina — Pared Oeste (Ventana Aire y Luz)", x1: 0.00, z1: 1.03, x2: 0.00, z2: 3.60, thickness: 0.15, defaultColor: "#f3f4f6", defaultTex: "tile_white",
      openings: [{ type: "window", start: 0.55, end: 1.85, y0: 1.05, y1: 2.10, label: "Ventana Cocina" }]
    },
    { id: "w_coc_s", room: "cocina", name: "Cocina — Pared Sur (Mesada, Cocina y Lavadero)", x1: 0.00, z1: 3.60, x2: 3.23, z2: 3.60, thickness: 0.12, defaultColor: "#f3f4f6", defaultTex: "tile_white" },
    { id: "w_coc_e", room: "cocina", name: "Cocina — Pared Este (Heladera)", x1: 3.08, z1: 1.03, x2: 3.08, z2: 3.60, thickness: 0.08, defaultColor: "#f3f4f6", defaultTex: "tile_white" },

    // Baño y Pasillo
    { id: "w_ban_n", room: "bano", name: "Baño — Pared Norte", x1: 1.08, z1: 3.96, x2: 3.23, z2: 3.96, thickness: 0.10, defaultColor: "#f4dce0", defaultTex: "tile_pink" },
    { id: "w_ban_w", room: "bano", name: "Baño — Pared Oeste (Ducha / Ventiluz)", x1: 1.08, z1: 3.96, x2: 1.08, z2: 5.30, thickness: 0.15, defaultColor: "#f4dce0", defaultTex: "tile_pink",
      openings: [{ type: "window", start: 0.35, end: 0.95, y0: 1.45, y1: 2.05, label: "Ventiluz Baño" }]
    },
    { id: "w_ban_s", room: "bano", name: "Baño — Pared Sur (Inodoro / Bidet / Lavatorio)", x1: 1.08, z1: 5.30, x2: 3.23, z2: 5.30, thickness: 0.10, defaultColor: "#f4dce0", defaultTex: "tile_pink" },
    { id: "w_pas_w", room: "pasillo", name: "Pasillo — Pared Oeste (Puerta Baño)", x1: 3.23, z1: 3.60, x2: 3.23, z2: 5.38, thickness: 0.10, defaultColor: "#f5f4f0", defaultTex: "matte",
      openings: [{ type: "door", start: 0.62, end: 1.32, y0: 0, y1: 2.05, label: "Puerta Baño" }]
    },
    { id: "w_pas_e", room: "pasillo", name: "Pasillo — Pared Este (Puerta Oficina)", x1: 4.18, z1: 3.60, x2: 4.18, z2: 5.38, thickness: 0.10, defaultColor: "#f5f4f0", defaultTex: "matte",
      openings: [{ type: "door", start: 0.55, end: 1.30, y0: 0, y1: 2.05, label: "Puerta Oficina" }]
    },

    // Habitación Interna (con placard de madera)
    { id: "w_hab_n", room: "habitacion", name: "Habitación — Pared Norte (Placard y Puerta)", x1: 1.08, z1: 5.38, x2: 4.18, z2: 5.38, thickness: 0.10, defaultColor: "#f5f4f0", defaultTex: "matte",
      openings: [{ type: "door", start: 2.22, end: 2.98, y0: 0, y1: 2.05, label: "Puerta Habitación" }]
    },
    { id: "w_hab_w", room: "habitacion", name: "Habitación — Pared Oeste (Ventana Aire y Luz)", x1: 1.08, z1: 5.38, x2: 1.08, z2: 8.60, thickness: 0.16, defaultColor: "#f5f4f0", defaultTex: "matte",
      openings: [{ type: "window", start: 0.65, end: 2.40, y0: 0.85, y1: 2.20, curtainId: "curtain_habitacion", label: "Ventana Habitación" }]
    },
    { id: "w_hab_s", room: "habitacion", name: "Habitación — Pared Sur (Cabecera Principal)", x1: 1.08, z1: 8.60, x2: 4.18, z2: 8.60, thickness: 0.15, defaultColor: "#f5f4f0", defaultTex: "matte" },
    { id: "w_hab_e", room: "habitacion", name: "Habitación — Pared Este (Divisoria c/ Oficina)", x1: 4.18, z1: 5.38, x2: 4.18, z2: 8.60, thickness: 0.12, defaultColor: "#f5f4f0", defaultTex: "matte" },

    // Oficina / Dormitorio Frente (da a Calle Arribeños)
    { id: "w_ofi_n", room: "oficina", name: "Oficina — Pared Norte (Placard Empotrado Blanco)", x1: 4.18, z1: 3.68, x2: 6.88, z2: 3.68, thickness: 0.10, defaultColor: "#f5f4f0", defaultTex: "matte" },
    { id: "w_ofi_e", room: "oficina", name: "Oficina — Pared Este (Ventanal Calle Arribeños)", x1: 6.88, z1: 3.68, x2: 6.88, z2: 8.60, thickness: 0.18, defaultColor: "#f5f4f0", defaultTex: "matte",
      openings: [{ type: "window", start: 1.50, end: 3.65, y0: 0.85, y1: 2.25, curtainId: "curtain_oficina", label: "Ventana Oficina (Arribeños)" }]
    },
    { id: "w_ofi_s", room: "oficina", name: "Oficina — Pared Sur (Fondo 2.70m)", x1: 4.18, z1: 8.60, x2: 6.88, z2: 8.60, thickness: 0.15, defaultColor: "#f5f4f0", defaultTex: "matte" },
    { id: "w_ofi_w", room: "oficina", name: "Oficina — Pared Oeste (Larga 3.22m libres)", x1: 4.12, z1: 5.38, x2: 4.12, z2: 8.60, thickness: 0.08, defaultColor: "#f5f4f0", defaultTex: "matte" }
  ],

  // Paleta de Pinturas y Texturas de Pared
  paintSwatches: [
    { id: "blanco_tiza", name: "Blanco Tiza (Actual)", hex: "#f5f4f0" },
    { id: "arena_calida", name: "Arena Cálida", hex: "#e6dec8" },
    { id: "greige_lino", name: "Greige Lino", hex: "#d2cbc0" },
    { id: "verde_salvia", name: "Verde Salvia", hex: "#9caf9e" },
    { id: "verde_bosque", name: "Verde Bosque", hex: "#3d5949" },
    { id: "azul_petroleo", name: "Azul Petróleo", hex: "#2c4c63" },
    { id: "azul_acero", name: "Azul Acero", hex: "#6f8fa6" },
    { id: "terracota", name: "Terracota Suave", hex: "#c87d65" },
    { id: "gris_cemento", name: "Gris Microcemento", hex: "#9ea3a8" },
    { id: "gris_grafito", name: "Gris Grafito Acento", hex: "#3e434c" },
    { id: "ocre_mostaza", name: "Ocre / Mostaza", hex: "#d4a44c" },
    { id: "rosa_viejo", name: "Rosa Empolvado", hex: "#d9b8b8" }
  ],

  wallTextures: [
    { id: "matte", name: "Pintura Látex Mate" },
    { id: "microcement", name: "Microcemento Alisado" },
    { id: "wood_slats", name: "Varillado de Madera (WPC)" },
    { id: "linen_wall", name: "Empapelado Lino Texturado" },
    { id: "brick_white", name: "Ladrillo Visto Blanco" }
  ],

  floorStyles: [
    { id: "parquet_herringbone", name: "Parquet Espina de Pescado Original (Roble/Caldén)" },
    { id: "parquet_honey", name: "Parquet Hidrolaqueado Miel Cálido" },
    { id: "parquet_scandi", name: "Madera Clara Escandinava" },
    { id: "microcement_floor", name: "Porcelanato / Microcemento Gris" }
  ],

  // ==========================================================================
  // CATÁLOGO COMPLETO DE TUS MUEBLES REALES (depto_actual/Medidas.txt + Fotos)
  // Dimensiones en centímetros (w = ancho frente, d = profundidad, h = alto)
  // ==========================================================================
  furnitureCatalog: [
    {
      id: "rack_tv",
      name: "Rack TV Industrial (3 Estantes Madera + Hierro)",
      category: "Living",
      w: 192, d: 30, h: 80, elevation: 0,
      photo: "depto_actual/WhatsApp Image 2026-10-31 at 17.44.00.jpeg",
      notes: "Con cascos blancos, juego Catan, pelotas y cuadros apilados según foto."
    },
    {
      id: "tv_55",
      name: "Smart TV 55\" + 2 Parlantes Torre + Sansevieria",
      category: "Living",
      w: 123, d: 18, h: 72, elevation: 80,
      photo: "depto_actual/WhatsApp Image 2026-10-31 at 17.44.00.jpeg",
      notes: "Va apoyada sobre el Rack TV (altura 80 cm) con parlantes laterales."
    },
    {
      id: "estanteria_alta",
      name: "Biblioteca Alta Madera Clara (5 Estantes + Potus)",
      category: "Living",
      w: 60, d: 30, h: 180, elevation: 0,
      photo: "depto_actual/WhatsApp Image 2026-10-31 at 17.44.00 (1).jpeg",
      notes: "Ideal al lado del Rack TV (192 + 60 = 252 cm en pared de 390 cm)."
    },
    {
      id: "sofa",
      name: "Sofá 3 Cuerpos Gris Topo + Almohadones Verdes",
      category: "Living",
      w: 200, d: 90, h: 80, elevation: 0,
      photo: "depto_actual/WhatsApp Image 2026-10-31 at 17.44.00 (2).jpeg",
      notes: "200×90×80 cm. Incluye opción de mostrar tu Bandera Argentina en la pared detrás."
    },
    {
      id: "mesa_ratona",
      name: "Mesa Ratona Redonda Madera Maciza + Planta",
      category: "Living",
      w: 80, d: 80, h: 42, elevation: 0,
      photo: "depto_actual/WhatsApp Image 2026-10-31 at 17.44.00 (2).jpeg",
      notes: "Mesa baja rústica frente al sofá."
    },
    {
      id: "mesa_comedor",
      name: "Mesa Negra Comedor / Escritorio (140 / 170 cm)",
      category: "Living / Oficina",
      w: 140, wExtended: 170, d: 90, h: 90, elevation: 0,
      isExtensible: true,
      extended: false,
      photo: "depto_actual/WhatsApp Image 2026-10-31 at 17.44.01.jpeg",
      notes: "140×90×90 cm cerrada, extensible a 170×90×90 cm (botón en el inspector)."
    },
    {
      id: "silla_comedor_1",
      name: "Silla Tapizada Gris Oscuro #1",
      category: "Living",
      w: 46, d: 48, h: 90, elevation: 0,
      photo: "depto_actual/WhatsApp Image 2026-10-31 at 17.44.00 (2).jpeg",
      notes: "Silla de comedor tapizada con patas de madera."
    },
    {
      id: "silla_comedor_2",
      name: "Silla Tapizada Gris Oscuro #2",
      category: "Living",
      w: 46, d: 48, h: 90, elevation: 0,
      photo: "depto_actual/WhatsApp Image 2026-10-31 at 17.44.00 (2).jpeg",
      notes: "Segunda silla de comedor tapizada."
    },
    {
      id: "escritorio_1",
      name: "Escritorio Home Office #1 (90 × 50 cm)",
      category: "Oficina",
      w: 90, d: 50, h: 75, elevation: 0,
      photo: "depto_actual/WhatsApp Image 2026-10-31 at 17.43.59.jpeg",
      notes: "Escritorio compacto de 90 cm de ancho × 50 cm de profundidad × 75 cm de alto con monitor/notebook."
    },
    {
      id: "escritorio_2",
      name: "Escritorio Home Office #2 (90 × 50 cm)",
      category: "Oficina",
      w: 90, d: 50, h: 75, elevation: 0,
      photo: "depto_actual/WhatsApp Image 2026-10-31 at 17.43.59.jpeg",
      notes: "Segundo escritorio de 90 cm de ancho × 50 cm de profundidad × 75 cm de alto."
    },
    {
      id: "silla_mesh_1",
      name: "Silla Ergonómica Mesh Negra (c/ Almohadón Mostaza)",
      category: "Oficina",
      w: 60, d: 60, h: 100, elevation: 0,
      photo: "depto_actual/WhatsApp Image 2026-10-31 at 17.43.59.jpeg",
      notes: "Silla giratoria principal de home-office."
    },
    {
      id: "silla_mesh_2",
      name: "Silla Ergonómica Mesh Negra #2",
      category: "Oficina",
      w: 60, d: 60, h: 100, elevation: 0,
      photo: "depto_actual/WhatsApp Image 2026-10-31 at 17.43.59.jpeg",
      notes: "Segunda silla giratoria mesh negra."
    },
    {
      id: "teclado_calma",
      name: "Teclado Musical en Pie Tijera + Cartel 'CALMA'",
      category: "Oficina / Living",
      w: 95, d: 38, h: 82, elevation: 0,
      photo: "depto_actual/WhatsApp Image 2026-10-31 at 17.44.00 (4).jpeg",
      notes: "Con el cuadro verde 'CALMA' colgado arriba."
    },
    {
      id: "cubos_pared",
      name: "4 Cubos Flotantes (2 Madera + 2 Azules)",
      category: "Oficina / Living",
      w: 135, d: 20, h: 55, elevation: 138,
      photo: "depto_actual/WhatsApp Image 2026-10-31 at 17.44.00 (4).jpeg",
      notes: "Estantes flotantes con plantas y adornos a 1.38m de altura."
    },
    {
      id: "carrito_plantas",
      name: "Mesita Auxiliar / Carrito de Madera c/ Plantas",
      category: "Oficina / Living",
      w: 55, d: 40, h: 65, elevation: 0,
      photo: "depto_actual/WhatsApp Image 2026-10-31 at 17.44.00 (4).jpeg",
      notes: "Mesita de 2 niveles con macetas."
    },
    {
      id: "maceta_palmera",
      name: "Maceta Negra Grande c/ Palmera de Interior",
      category: "Living / Oficina",
      w: 44, d: 44, h: 88, elevation: 0,
      photo: "depto_actual/WhatsApp Image 2026-10-31 at 17.44.01.jpeg",
      notes: "Planta alta ideal cerca del ventanal de Arribeños."
    },
    {
      id: "cama_2p",
      name: "Cama Sommier 2 Plazas (140 × 190 cm)",
      category: "Dormitorio",
      w: 140, d: 190, h: 58, elevation: 0,
      photo: "depto_actual/WhatsApp Image 2026-10-31 at 17.43.59 (2).jpeg",
      notes: "Sommier 140×190 cm con acolchado beige y almohadas."
    },
    {
      id: "mesita_luz",
      name: "Mesita de Luz Blanca + Sansevieria",
      category: "Dormitorio",
      w: 42, d: 36, h: 55, elevation: 0,
      photo: "depto_actual/WhatsApp Image 2026-10-31 at 17.43.59 (2).jpeg",
      notes: "Con cajón, estante y maceta blanca con lengua de suegra."
    },
    {
      id: "rack_dorm",
      name: "Rack Dormitorio (68×25×103 cm) + TV 32\" (80×50)",
      category: "Dormitorio",
      w: 80, d: 26, h: 153, elevation: 0,
      photo: "depto_actual/WhatsApp Image 2026-10-31 at 17.43.59 (1).jpeg",
      notes: "Mueble madera oscura (68×25×103 cm) con tu TV de 80×50 cm arriba."
    },
    {
      id: "perchero_negro",
      name: "Perchero / Botinero Metálico Negro",
      category: "Dormitorio",
      w: 50, d: 30, h: 100, elevation: 0,
      photo: "depto_actual/WhatsApp Image 2026-10-31 at 17.43.59 (1).jpeg",
      notes: "Estructura negra con estantes inferiores."
    },
    {
      id: "ventilador_pie",
      name: "Ventilador de Pie Blanco",
      category: "Dormitorio / Oficina",
      w: 45, d: 45, h: 130, elevation: 0,
      photo: "depto_actual/WhatsApp Image 2026-10-31 at 17.43.59 (1).jpeg",
      notes: "Ventilador blanco regulable."
    },
    {
      id: "placard_madera_existente",
      name: "Placard de Madera Existente (Depto Nuevo)",
      category: "Dormitorio",
      w: 195, d: 60, h: 240, elevation: 0,
      photo: "depto_nuevo/habitacion 2.webp",
      notes: "El placard de 3 puertas y baulera que ya está en la Habitación Interna (podés ocultarlo si decidís sacarlo)."
    }
  ],

  // ==========================================================================
  // 3 DISEÑOS / DISTRIBUCIONES INTELIGENTES PRE-ARMADAS
  // Coordenadas (x, z) en METROS del centro de cada mueble; rot en GRADOS (0, 90, 180, 270)
  // rot = 0   -> el frente del mueble mira hacia el SUR (+Z)
  // rot = 180 -> el frente del mueble mira hacia el NORTE (-Z)
  // rot = 90  -> el frente del mueble mira hacia el ESTE (+X)
  // rot = 270 -> el frente del mueble mira hacia el OESTE (-X)
  // ==========================================================================
  presets: {
    preset_1: {
      name: "Opción 1 (Recomendada): Dormitorio en Hab. Interna + Oficina c/ 2 Escritorios (90×50)",
      description: "2 Escritorios de 90×50 cm en la Oficina al Frente (Calle Arribeños), Comedor + Living integrados y Dormitorio silencioso al Aire y Luz.",
      items: {
        // LIVING + COMEDOR
        rack_tv:         { x: 5.25, z: 0.20, rot: 0,   visible: true },
        tv_55:           { x: 5.25, z: 0.20, rot: 0,   visible: true },
        estanteria_alta: { x: 6.60, z: 0.20, rot: 0,   visible: true },
        sofa:            { x: 5.65, z: 3.10, rot: 180, visible: true },
        mesa_ratona:     { x: 5.65, z: 1.95, rot: 0,   visible: true },
        mesa_comedor:    { x: 3.72, z: 2.15, rot: 90,  visible: true, extended: false },
        silla_comedor_1: { x: 3.72, z: 1.28, rot: 0,   visible: true },
        silla_comedor_2: { x: 3.72, z: 3.02, rot: 180, visible: true },
        maceta_palmera:  { x: 6.85, z: 3.25, rot: 270, visible: true },
        // OFICINA (Frente a Arribeños — 2 Escritorios de 90x50 cm + Teclado + Cubos)
        escritorio_1:    { x: 4.46, z: 5.85, rot: 90,  visible: true },
        escritorio_2:    { x: 4.46, z: 6.78, rot: 90,  visible: true },
        silla_mesh_1:    { x: 5.08, z: 5.85, rot: 270, visible: true },
        silla_mesh_2:    { x: 5.08, z: 6.78, rot: 270, visible: true },
        cubos_pared:     { x: 4.28, z: 6.32, rot: 90,  visible: true },
        teclado_calma:   { x: 4.42, z: 7.88, rot: 90,  visible: true },
        carrito_plantas: { x: 6.50, z: 8.20, rot: 180, visible: true },
        // HABITACIÓN INTERNA (Dormitorio)
        placard_madera_existente: { x: 2.15, z: 5.70, rot: 0, visible: true },
        cama_2p:         { x: 2.55, z: 7.60, rot: 180, visible: true },
        mesita_luz:      { x: 3.55, z: 8.35, rot: 180, visible: true },
        rack_dorm:       { x: 4.00, z: 6.85, rot: 270, visible: true },
        perchero_negro:  { x: 1.38, z: 8.38, rot: 180, visible: true },
        ventilador_pie:  { x: 1.45, z: 6.55, rot: 90,  visible: true }
      }
    },

    preset_2: {
      name: "Opción 2 (Invertida): Dormitorio al Frente (Arribeños) + Oficina Interna c/ 2 Escritorios",
      description: "Usa el dormitorio largo con placard blanco empotrado para tu cama 140×190 y ubica los 2 escritorios de 90×50 cm en la habitación interna.",
      items: {
        // LIVING
        rack_tv:         { x: 5.25, z: 0.20, rot: 0,   visible: true },
        tv_55:           { x: 5.25, z: 0.20, rot: 0,   visible: true },
        estanteria_alta: { x: 6.60, z: 0.20, rot: 0,   visible: true },
        sofa:            { x: 5.65, z: 3.10, rot: 180, visible: true },
        mesa_ratona:     { x: 5.65, z: 1.95, rot: 0,   visible: true },
        mesa_comedor:    { x: 3.72, z: 2.15, rot: 90,  visible: true, extended: false },
        silla_comedor_1: { x: 3.72, z: 1.28, rot: 0,   visible: true },
        silla_comedor_2: { x: 3.72, z: 3.02, rot: 180, visible: true },
        maceta_palmera:  { x: 6.85, z: 3.25, rot: 270, visible: true },
        // DORMITORIO EN AMBIENTE FRENTE (Oficina -> Dormitorio)
        cama_2p:         { x: 5.15, z: 6.80, rot: 90,  visible: true },
        mesita_luz:      { x: 4.40, z: 7.82, rot: 90,  visible: true },
        rack_dorm:       { x: 6.68, z: 6.80, rot: 270, visible: true },
        perchero_negro:  { x: 4.45, z: 5.55, rot: 90,  visible: true },
        ventilador_pie:  { x: 6.45, z: 8.15, rot: 180, visible: true },
        // OFICINA EN HABITACIÓN INTERNA (con los 2 escritorios de 90x50 cm)
        placard_madera_existente: { x: 2.15, z: 5.70, rot: 0, visible: true },
        escritorio_1:    { x: 2.15, z: 8.30, rot: 180, visible: true },
        escritorio_2:    { x: 3.08, z: 8.30, rot: 180, visible: true },
        silla_mesh_1:    { x: 2.15, z: 7.68, rot: 0,   visible: true },
        silla_mesh_2:    { x: 3.08, z: 7.68, rot: 0,   visible: true },
        teclado_calma:   { x: 3.92, z: 6.85, rot: 270, visible: true },
        cubos_pared:     { x: 2.60, z: 8.48, rot: 180, visible: true },
        carrito_plantas: { x: 1.35, z: 7.95, rot: 90,  visible: true }
      }
    },

    preset_3: {
      name: "Opción 3 (Escritorios en L / Enfrentados): Oficina en L + Living Invertido",
      description: "En la Oficina ubica un escritorio de 90×50 en la pared Oeste y otro en la pared Sur mirando al ambiente, y el Living invertido.",
      items: {
        // LIVING SOCIAL CON COMEDOR
        sofa:            { x: 5.65, z: 0.50, rot: 0,   visible: true },
        mesa_ratona:     { x: 5.65, z: 1.55, rot: 0,   visible: true },
        rack_tv:         { x: 5.65, z: 3.40, rot: 180, visible: true },
        tv_55:           { x: 5.65, z: 3.40, rot: 180, visible: true },
        estanteria_alta: { x: 4.35, z: 3.40, rot: 180, visible: true },
        mesa_comedor:    { x: 3.80, z: 1.85, rot: 90,  visible: true, extended: false },
        silla_comedor_1: { x: 3.80, z: 1.00, rot: 0,   visible: true },
        silla_comedor_2: { x: 3.80, z: 2.70, rot: 180, visible: true },
        maceta_palmera:  { x: 6.80, z: 0.45, rot: 270, visible: true },
        // OFICINA CON 2 ESCRITORIOS 90x50 EN L
        escritorio_1:    { x: 4.46, z: 6.10, rot: 90,  visible: true },
        silla_mesh_1:    { x: 5.08, z: 6.10, rot: 270, visible: true },
        escritorio_2:    { x: 5.45, z: 8.30, rot: 180, visible: true },
        silla_mesh_2:    { x: 5.45, z: 7.68, rot: 0,   visible: true },
        teclado_calma:   { x: 4.42, z: 7.45, rot: 90,  visible: true },
        cubos_pared:     { x: 4.28, z: 6.10, rot: 90,  visible: true },
        carrito_plantas: { x: 6.50, z: 8.15, rot: 180, visible: true },
        // DORMITORIO INTERNO
        placard_madera_existente: { x: 2.15, z: 5.70, rot: 0, visible: true },
        cama_2p:         { x: 2.55, z: 7.60, rot: 180, visible: true },
        mesita_luz:      { x: 3.55, z: 8.35, rot: 180, visible: true },
        rack_dorm:       { x: 4.00, z: 6.85, rot: 270, visible: true },
        perchero_negro:  { x: 1.38, z: 8.38, rot: 180, visible: true },
        ventilador_pie:  { x: 1.45, z: 6.55, rot: 90,  visible: true }
      }
    }
  },

  // ==========================================================================
  // ESCENAS REALES PARA EL ESTUDIO FOTOGRÁFICO 2.5D (PINTURA + LED + STICKERS)
  // Coordenadas normalizadas (0.0 a 1.0) sobre las fotos reales de depto_nuevo/
  // ==========================================================================
  photoStudioScenes: [
    {
      id: "living_1",
      name: "Living — Vista desde Entrada hacia Ventanal (living 1)",
      photo: "depto_nuevo/living 1.webp",
      walls: [
        {
          id: "mask_liv_izq",
          name: "Pared Norte (Izquierda — Ideal Rack TV 192cm)",
          points: [[0.0, 0.0], [0.47, 0.14], [0.47, 0.67], [0.0, 0.91]]
        },
        {
          id: "mask_liv_fondo",
          name: "Pared Este (Fondo Ventanal Arribeños)",
          points: [[0.47, 0.14], [0.92, 0.04], [0.92, 0.72], [0.47, 0.67]]
        },
        {
          id: "mask_liv_der",
          name: "Pared Sur (Derecha — Ideal Sofá 200cm)",
          points: [[0.92, 0.04], [1.0, 0.0], [1.0, 0.85], [0.92, 0.72]]
        }
      ],
      windowZone: { x: 0.56, y: 0.21, w: 0.29, h: 0.37 },
      ledZones: [
        { name: "Cinta LED Cielorraso Cálida", x1: 0.05, y1: 0.08, x2: 0.46, y2: 0.15 },
        { name: "Backlight LED detrás de TV", x1: 0.18, y1: 0.42, x2: 0.36, y2: 0.45 }
      ]
    },
    {
      id: "living_2",
      name: "Living — Vista hacia Pasillo Distribuidor (living 2)",
      photo: "depto_nuevo/living 2.webp",
      walls: [
        {
          id: "mask_liv2_izq",
          name: "Pared Ventanal (Izquierda)",
          points: [[0.0, 0.0], [0.29, 0.13], [0.29, 0.73], [0.0, 0.89]]
        },
        {
          id: "mask_liv2_centro",
          name: "Pared Sur (Derecha de Pasillo — Sofá / Rack)",
          points: [[0.29, 0.13], [0.68, 0.13], [0.68, 0.72], [0.29, 0.73]]
        },
        {
          id: "mask_liv2_der",
          name: "Tabique Cocina (Derecha)",
          points: [[0.82, 0.10], [1.0, 0.0], [1.0, 0.88], [0.82, 0.76]]
        }
      ],
      windowZone: { x: 0.02, y: 0.18, w: 0.20, h: 0.42 },
      ledZones: [
        { name: "Tira LED Pared Principal", x1: 0.31, y1: 0.14, x2: 0.66, y2: 0.14 }
      ]
    },
    {
      id: "oficina_1",
      name: "Oficina / Dorm. Frente — Vista hacia Ventanal Arribeños (oficina 1)",
      photo: "depto_nuevo/oficina 1.webp",
      walls: [
        {
          id: "mask_ofi_izq",
          name: "Pared Este (Alrededor de Ventana)",
          points: [[0.0, 0.0], [0.43, 0.16], [0.43, 0.66], [0.0, 0.82]]
        },
        {
          id: "mask_ofi_fondo",
          name: "Pared Sur (Fondo 2.70m)",
          points: [[0.43, 0.16], [0.76, 0.16], [0.76, 0.66], [0.43, 0.66]]
        },
        {
          id: "mask_ofi_der",
          name: "Pared Oeste (Larga — Ideal Escritorio/Cubos/Teclado)",
          points: [[0.76, 0.16], [1.0, 0.02], [1.0, 0.89], [0.76, 0.66]]
        }
      ],
      windowZone: { x: 0.05, y: 0.16, w: 0.33, h: 0.40 },
      ledZones: [
        { name: "Tira LED Escritorio / Pared Derecha", x1: 0.77, y1: 0.48, x2: 0.98, y2: 0.56 }
      ]
    },
    {
      id: "habitacion_1",
      name: "Habitación Interna — Vista Ventana Aire y Luz (habitacion 1)",
      photo: "depto_nuevo/habitacion 1.webp",
      walls: [
        {
          id: "mask_hab_izq",
          name: "Pared Este (Izquierda)",
          points: [[0.0, 0.0], [0.23, 0.14], [0.23, 0.69], [0.0, 0.88]]
        },
        {
          id: "mask_hab_fondo",
          name: "Pared Sur (Cabecera Cama 2 Plazas — 3.00m)",
          points: [[0.23, 0.14], [0.68, 0.15], [0.68, 0.68], [0.23, 0.69]]
        },
        {
          id: "mask_hab_der",
          name: "Pared Oeste (Ventana Aire y Luz)",
          points: [[0.68, 0.15], [1.0, 0.04], [1.0, 0.86], [0.68, 0.68]]
        }
      ],
      windowZone: { x: 0.71, y: 0.18, w: 0.26, h: 0.38 },
      ledZones: [
        { name: "Tira LED Cálida Cabecera Cama", x1: 0.25, y1: 0.52, x2: 0.66, y2: 0.52 }
      ]
    },
    {
      id: "habitacion_2",
      name: "Habitación Interna — Vista Placard de Madera (habitacion 2)",
      photo: "depto_nuevo/habitacion 2.webp",
      walls: [
        {
          id: "mask_hab2_izq",
          name: "Pared Oeste (Izquierda)",
          points: [[0.0, 0.0], [0.22, 0.14], [0.22, 0.72], [0.0, 0.88]]
        },
        {
          id: "mask_hab2_der",
          name: "Pared Este (Derecha de Puerta)",
          points: [[0.78, 0.12], [1.0, 0.0], [1.0, 0.86], [0.78, 0.72]]
        }
      ],
      windowZone: null,
      ledZones: [
        { name: "Luz LED Superior Baulera Placard", x1: 0.24, y1: 0.11, x2: 0.62, y2: 0.13 }
      ]
    }
  ],

  // Comparativas Antes / Después con Renders IA Fotorrealistas
  aiRenders: [
    {
      id: "ai_living",
      title: "Living / Estar — Tus Muebles en Arribeños 2968",
      subtitle: "Rack TV 192cm + TV 55\" + Biblioteca 180cm a la izquierda; Sofá 200cm + Mesa Ratona a la derecha; Cortinas Roller + Lino",
      beforeImg: "depto_nuevo/living 1.webp",
      afterImg: "renders_ia/render_living.jpg",
      metrics: [
        "Ancho total del Living: 3.90 m × 3.60 m",
        "Pared Norte (Izquierda): 390 cm -> Tu Rack (192 cm) + Biblioteca (60 cm) suman 252 cm (sobran 138 cm libres).",
        "Paso entre Mesa Ratona y Rack TV: 145 cm libres de circulación cómoda."
      ]
    },
    {
      id: "ai_oficina",
      title: "Oficina / Estudio al Frente — Home Office & Música",
      subtitle: "Mesa Negra 140/170×90cm + 2 Sillas Mesh + Cubos Flotantes Azules/Madera + Teclado Musical c/ cuadro 'CALMA'",
      beforeImg: "depto_nuevo/oficina 1.webp",
      afterImg: "renders_ia/render_oficina.jpg",
      metrics: [
        "Ancho de la Oficina: 2.70 m × 4.35 m libres (descontando placard empotrado).",
        "Con la Mesa Negra (90 cm de prof.) apoyada o perpendicular, quedan 180 cm de paso libre para las dos sillas giratorias.",
        "El Teclado Musical (95×38 cm) y los Cubos Flotantes entran con total holgura en la pared larga."
      ]
    },
    {
      id: "ai_dormitorio",
      title: "Habitación Interna — Tu Dormitorio Principal",
      subtitle: "Cama 2 Plazas (140×190 cm) + Mesita de Luz Blanca c/ Sansevieria + Rack TV Dormitorio + Perchero Negro",
      beforeImg: "depto_nuevo/habitacion 1.webp",
      afterImg: "renders_ia/render_dormitorio.jpg",
      metrics: [
        "Dimensiones: 3.00 m de ancho × 3.22 m de largo (2.60 m libres desde el placard de madera hasta la pared Sur).",
        "Cama (190 cm de largo) apoyada en pared Sur: deja 70 cm libres para abrir las puertas del placard de madera sin chocar.",
        "Ancho libre a los lados de la cama (140 cm): quedan 160 cm para tu Mesita de Luz (42 cm), Perchero (50 cm) y paso a la ventana."
      ]
    }
  ]
};
