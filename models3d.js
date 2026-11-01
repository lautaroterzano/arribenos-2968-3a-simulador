// ============================================================================
// MODELS3D.JS — Generador Procedural 3D de Tus Muebles Reales, Texturas y Luces
// Escala: 1 unidad Three.js = 1.00 metro (100 centímetros)
// ============================================================================

window.Models3D = (function () {
  const textureCache = {};

  // --------------------------------------------------------------------------
  // 1. GENERADOR DE TEXTURAS PROCEDURALES (PISOS Y PAREDES)
  // --------------------------------------------------------------------------
  function createFloorTexture(styleId) {
    const cacheKey = "floor_" + styleId;
    if (textureCache[cacheKey]) return textureCache[cacheKey];

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    if (styleId === "parquet_herringbone" || styleId === "parquet_honey" || styleId === "parquet_scandi") {
      const palette =
        styleId === "parquet_honey"
          ? ["#b87a3d", "#c68849", "#a96d32", "#cf9254"]
          : styleId === "parquet_scandi"
          ? ["#d8c3a5", "#e2cfb4", "#cbb392", "#dfd0b8"]
          : ["#9c6334", "#ad713f", "#8c5528", "#b97c48"]; // Roble/Caldén original

      ctx.fillStyle = palette[0];
      ctx.fillRect(0, 0, 512, 512);

      const pw = 32;
      const pl = 96;
      ctx.strokeStyle = "rgba(40, 20, 5, 0.28)";
      ctx.lineWidth = 1.5;

      for (let y = -pl; y < 512 + pl; y += pw) {
        for (let x = -pl; x < 512 + pl; x += pl) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(Math.PI / 4);
          ctx.fillStyle = palette[Math.abs(Math.floor((x + y) / pw)) % palette.length];
          ctx.fillRect(0, 0, pl, pw);
          ctx.strokeRect(0, 0, pl, pw);
          ctx.restore();

          ctx.save();
          ctx.translate(x + pl / 2, y + pw / 2);
          ctx.rotate(-Math.PI / 4);
          ctx.fillStyle = palette[Math.abs(Math.floor((x - y) / pw) + 1) % palette.length];
          ctx.fillRect(0, 0, pl, pw);
          ctx.strokeRect(0, 0, pl, pw);
          ctx.restore();
        }
      }
    } else if (styleId === "tile_white_vein") {
      ctx.fillStyle = "#eceff3";
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 3;
      const step = 128;
      for (let i = 0; i <= 512; i += step) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
      }
    } else if (styleId === "tile_pink_vintage") {
      ctx.fillStyle = "#e6c6cc";
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = "#cfa5ad";
      ctx.lineWidth = 2;
      const step = 64;
      for (let i = 0; i <= 512; i += step) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
      }
    } else {
      // Microcemento gris
      ctx.fillStyle = "#949aa1";
      ctx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 400; i++) {
        ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)";
        ctx.beginPath();
        ctx.arc(Math.random() * 512, Math.random() * 512, 18 + Math.random() * 40, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2.2, 2.2);
    textureCache[cacheKey] = tex;
    return tex;
  }

  function createWallMaterial(colorHex, texId) {
    const key = "wall_" + colorHex + "_" + texId;
    if (textureCache[key]) return textureCache[key];

    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = colorHex || "#f5f4f0";
    ctx.fillRect(0, 0, 256, 256);

    let roughness = 0.85;
    let bumpScale = 0.01;

    if (texId === "wood_slats") {
      // Varillado WPC madera cálida combinada con el tinte
      ctx.fillStyle = "#8d5b34";
      ctx.fillRect(0, 0, 256, 256);
      for (let x = 0; x < 256; x += 16) {
        ctx.fillStyle = "#b57c4e";
        ctx.fillRect(x + 2, 0, 11, 256);
        ctx.fillStyle = "#472b14";
        ctx.fillRect(x + 13, 0, 3, 256);
      }
      roughness = 0.55;
    } else if (texId === "microcement") {
      for (let i = 0; i < 220; i++) {
        ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.045)";
        ctx.beginPath();
        ctx.arc(Math.random() * 256, Math.random() * 256, 10 + Math.random() * 28, 0, Math.PI * 2);
        ctx.fill();
      }
      roughness = 0.45;
    } else if (texId === "linen_wall") {
      ctx.strokeStyle = "rgba(0,0,0,0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 256; i += 4) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke();
      }
      roughness = 0.92;
    } else if (texId === "brick_white") {
      ctx.strokeStyle = "rgba(0,0,0,0.14)";
      ctx.lineWidth = 2;
      const bh = 32, bw = 64;
      for (let y = 0; y < 256; y += bh) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke();
        const offset = (y / bh) % 2 === 0 ? 0 : bw / 2;
        for (let x = offset; x < 256; x += bw) {
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + bh); ctx.stroke();
        }
      }
    } else if (texId === "tile_white" || texId === "tile_pink") {
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i <= 256; i += 32) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke();
      }
      roughness = 0.25;
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 1.5);

    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: roughness,
      metalness: 0.04
    });
    textureCache[key] = mat;
    return mat;
  }

  // --------------------------------------------------------------------------
  // 2. MUEBLES REALES DEL USUARIO (ESCALA EXACTA CM -> METROS)
  // --------------------------------------------------------------------------
  function makeBox(w, h, d, color, roughness = 0.6, metalness = 0.05) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  function createLabelCanvas(text, bgColor = "#2f5e4e", textColor = "#ffffff") {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 128;
    const ctx = c.getContext("2d");
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 256, 128);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, 240, 112);
    ctx.fillStyle = textColor;
    ctx.font = "bold 46px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 128, 66);
    return new THREE.CanvasTexture(c);
  }

  function createArgentinaFlagTexture() {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 160;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#74acdf";
    ctx.fillRect(0, 0, 256, 53);
    ctx.fillRect(0, 107, 256, 53);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 53, 256, 54);
    ctx.fillStyle = "#f6b40e";
    ctx.beginPath();
    ctx.arc(128, 80, 16, 0, Math.PI * 2);
    ctx.fill();
    return new THREE.CanvasTexture(c);
  }

  function createFurnitureMesh(itemDef, itemState) {
    const group = new THREE.Group();
    const isExtended = itemDef.isExtensible && itemState && itemState.extended;
    const W = ((isExtended ? itemDef.wExtended : itemDef.w) || 100) / 100;
    const D = (itemDef.d || 50) / 100;
    const H = (itemDef.h || 80) / 100;
    const elev = (itemDef.elevation || 0) / 100;

    const woodWarm = 0x9b673b;
    const woodLight = 0xc59b6d;
    const woodDark = 0x3b2618;
    const ironBlack = 0x1e2229;

    switch (itemDef.id) {
      case "rack_tv": {
        // 192 x 30 x 80 cm — 3 estantes de madera + estructura hierro negro + cascos + Catan + pelotas
        const shelfH = [0.08, 0.42, 0.78];
        shelfH.forEach((sy) => {
          const shelf = makeBox(W, 0.03, D, woodWarm, 0.55);
          shelf.position.set(0, sy, 0);
          group.add(shelf);
        });
        // 6 patas verticales de hierro negro
        [-W / 2 + 0.02, 0, W / 2 - 0.02].forEach((px) => {
          [-D / 2 + 0.02, D / 2 - 0.02].forEach((pz) => {
            const leg = makeBox(0.025, H, 0.025, ironBlack, 0.4, 0.6);
            leg.position.set(px, H / 2, pz);
            group.add(leg);
          });
        });
        // Cascos blancos decorativos en el estante medio
        [-0.52, -0.25].forEach((hx) => {
          const helmet = new THREE.Mesh(
            new THREE.SphereGeometry(0.11, 16, 12),
            new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 })
          );
          helmet.position.set(hx, 0.53, 0);
          group.add(helmet);
        });
        // Caja roja Catan
        const catan = makeBox(0.28, 0.08, 0.22, 0xb91c1c, 0.5);
        catan.position.set(0.32, 0.48, 0);
        group.add(catan);
        // Pelotas en estante inferior
        [0.45, 0.68].forEach((bx, idx) => {
          const ball = new THREE.Mesh(
            new THREE.SphereGeometry(0.10, 14, 14),
            new THREE.MeshStandardMaterial({ color: idx === 0 ? 0xea580c : 0xe2e8f0, roughness: 0.5 })
          );
          ball.position.set(bx, 0.19, 0);
          group.add(ball);
        });
        break;
      }

      case "tv_55": {
        // Smart TV 55" (123cm) + 2 parlantes torre + Sansevieria apoyados sobre el rack (elev=0.80)
        const panel = makeBox(W, H - 0.06, 0.04, 0x0f1319, 0.2, 0.4);
        panel.position.set(0, elev + H / 2, -0.02);
        group.add(panel);

        const screen = makeBox(W - 0.04, H - 0.10, 0.01, 0x1e293b, 0.1, 0.8);
        screen.position.set(0, elev + H / 2, 0.005);
        group.add(screen);

        // Parlantes laterales
        [-W / 2 - 0.12, W / 2 + 0.12].forEach((sx) => {
          const spk = makeBox(0.14, 0.46, 0.16, 0x18181b, 0.4, 0.3);
          spk.position.set(sx, elev + 0.23, 0);
          group.add(spk);
        });

        // Maceta blanca c/ Sansevieria a la izquierda
        const pot = new THREE.Mesh(
          new THREE.CylinderGeometry(0.07, 0.06, 0.13, 12),
          new THREE.MeshStandardMaterial({ color: 0xf8fafc })
        );
        pot.position.set(-W / 2 - 0.28, elev + 0.065, 0.03);
        group.add(pot);
        const leaf = new THREE.Mesh(
          new THREE.ConeGeometry(0.06, 0.28, 6),
          new THREE.MeshStandardMaterial({ color: 0x2e6f40 })
        );
        leaf.position.set(-W / 2 - 0.28, elev + 0.24, 0.03);
        group.add(leaf);
        break;
      }

      case "estanteria_alta": {
        // Biblioteca 60 x 30 x 180 cm madera clara + 5 estantes + potus
        const sideL = makeBox(0.025, H, D, woodLight, 0.6);
        sideL.position.set(-W / 2 + 0.012, H / 2, 0);
        const sideR = makeBox(0.025, H, D, woodLight, 0.6);
        sideR.position.set(W / 2 - 0.012, H / 2, 0);
        group.add(sideL, sideR);

        for (let i = 0; i < 5; i++) {
          const sy = 0.12 + i * 0.40;
          const sh = makeBox(W - 0.02, 0.025, D, woodLight, 0.6);
          sh.position.set(0, sy, 0);
          group.add(sh);
        }
        // Planta potus arriba
        const plant = new THREE.Mesh(
          new THREE.SphereGeometry(0.14, 12, 10),
          new THREE.MeshStandardMaterial({ color: 0x3b7a57, roughness: 0.8 })
        );
        plant.position.set(0.08, H + 0.08, 0);
        group.add(plant);
        break;
      }

      case "sofa": {
        // Sofá 3 cuerpos 200 x 90 x 80 cm gris topo + almohadones verdes + bandera Argentina opcional
        const sofaColor = 0x6e6a66;
        const base = makeBox(W, 0.38, D, sofaColor, 0.85);
        base.position.set(0, 0.22, 0);
        group.add(base);

        const back = makeBox(W, 0.44, 0.22, sofaColor, 0.85);
        back.position.set(0, 0.58, -D / 2 + 0.11);
        group.add(back);

        [-W / 2 + 0.11, W / 2 - 0.11].forEach((ax) => {
          const arm = makeBox(0.22, 0.42, D, sofaColor, 0.85);
          arm.position.set(ax, 0.42, 0);
          group.add(arm);
        });

        // 2 Almohadones verdes oliva como en la foto
        [-0.62, 0.62].forEach((px) => {
          const pillow = makeBox(0.34, 0.30, 0.14, 0x556b2f, 0.8);
          pillow.position.set(px, 0.54, -0.14);
          pillow.rotation.x = 0.2;
          group.add(pillow);
        });

        // Bandera Argentina opcional en la pared detrás del sofá
        if (itemState && itemState.showFlag !== false) {
          const flagGeo = new THREE.PlaneGeometry(1.35, 0.82);
          const flagMat = new THREE.MeshStandardMaterial({
            map: createArgentinaFlagTexture(),
            side: THREE.DoubleSide,
            roughness: 0.75
          });
          const flag = new THREE.Mesh(flagGeo, flagMat);
          flag.position.set(0, 1.48, -D / 2 - 0.01);
          group.add(flag);
        }
        break;
      }

      case "mesa_ratona": {
        // Mesa ratona redonda 80 x 80 x 42 cm
        const top = new THREE.Mesh(
          new THREE.CylinderGeometry(W / 2, W / 2, 0.04, 28),
          new THREE.MeshStandardMaterial({ color: woodWarm, roughness: 0.55 })
        );
        top.position.set(0, H - 0.02, 0);
        top.castShadow = true;
        group.add(top);

        [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]].forEach(([lx, lz]) => {
          const leg = makeBox(0.04, H - 0.04, 0.04, woodDark, 0.7);
          leg.position.set(lx, (H - 0.04) / 2, lz);
          group.add(leg);
        });

        const miniPlant = new THREE.Mesh(
          new THREE.SphereGeometry(0.11, 12, 10),
          new THREE.MeshStandardMaterial({ color: 0x3f7d4c })
        );
        miniPlant.position.set(0, H + 0.09, 0);
        group.add(miniPlant);
        break;
      }

      case "mesa_comedor": {
        // Mesa Negra 140 (o 170) x 90 x 90 cm
        const top = makeBox(W, 0.045, D, 0x18191c, 0.4, 0.15);
        top.position.set(0, H - 0.022, 0);
        group.add(top);

        const ox = W / 2 - 0.06;
        const oz = D / 2 - 0.06;
        [[-ox, -oz], [ox, -oz], [-ox, oz], [ox, oz]].forEach(([lx, lz]) => {
          const leg = makeBox(0.055, H - 0.04, 0.055, 0x18191c, 0.45, 0.15);
          leg.position.set(lx, (H - 0.04) / 2, lz);
          group.add(leg);
        });
        break;
      }

      case "escritorio_1":
      case "escritorio_2": {
        // Escritorio Home Office 90 x 50 x 75 cm (tapa madera + estructura negra + monitor y notebook)
        const deskTop = makeBox(W, 0.035, D, woodWarm, 0.5, 0.05);
        deskTop.position.set(0, H - 0.0175, 0);
        group.add(deskTop);

        const lxOff = W / 2 - 0.035;
        const lzOff = D / 2 - 0.035;
        [[-lxOff, -lzOff], [lxOff, -lzOff], [-lxOff, lzOff], [lxOff, lzOff]].forEach(([lx, lz]) => {
          const leg = makeBox(0.035, H - 0.035, 0.035, ironBlack, 0.4, 0.5);
          leg.position.set(lx, (H - 0.035) / 2, lz);
          group.add(leg);
        });

        // Monitor + soporte + pad teclado sobre el escritorio
        const stand = makeBox(0.14, 0.10, 0.12, 0x1e293b, 0.4, 0.5);
        stand.position.set(0, H + 0.05, -D / 2 + 0.12);
        const monitor = makeBox(0.52, 0.31, 0.025, 0x0f172a, 0.2, 0.6);
        monitor.position.set(0, H + 0.22, -D / 2 + 0.12);
        const pad = makeBox(0.58, 0.006, 0.24, 0x1e2229, 0.8);
        pad.position.set(0, H + 0.004, 0.06);
        group.add(stand, monitor, pad);
        break;
      }

      case "silla_mesh_1":
      case "silla_mesh_2": {
        // Silla Ergonómica Mesh Negra (60x60x100 cm)
        const seat = makeBox(0.48, 0.06, 0.48, 0x1e2229, 0.7);
        seat.position.set(0, 0.48, 0);
        group.add(seat);

        const backrest = makeBox(0.46, 0.52, 0.04, 0x15181e, 0.6);
        backrest.position.set(0, 0.76, -0.22);
        group.add(backrest);

        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.025, 0.45, 10),
          new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.7 })
        );
        pole.position.set(0, 0.23, 0);
        group.add(pole);

        const baseStar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.28, 0.28, 0.04, 5),
          new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
        );
        baseStar.position.set(0, 0.03, 0);
        group.add(baseStar);

        if (itemDef.id === "silla_mesh_1") {
          const mustardPillow = makeBox(0.32, 0.18, 0.07, 0xd99b26, 0.8);
          mustardPillow.position.set(0, 0.62, -0.18);
          group.add(mustardPillow);
        }
        break;
      }

      case "silla_comedor_1":
      case "silla_comedor_2": {
        const seat = makeBox(W, 0.06, D, 0x475569, 0.8);
        seat.position.set(0, 0.46, 0);
        const back = makeBox(W, 0.44, 0.05, 0x475569, 0.8);
        back.position.set(0, 0.68, -D / 2 + 0.025);
        group.add(seat, back);

        [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].forEach(([lx, lz]) => {
          const leg = makeBox(0.03, 0.46, 0.03, woodWarm, 0.6);
          leg.position.set(lx, 0.23, lz);
          group.add(leg);
        });
        break;
      }

      case "teclado_calma": {
        // Teclado musical en soporte tijera + cartel verde "CALMA"
        const body = makeBox(W, 0.09, D, 0x111318, 0.3, 0.4);
        body.position.set(0, H - 0.045, 0);
        group.add(body);

        const keys = makeBox(W - 0.12, 0.02, D * 0.45, 0xf8fafc, 0.2);
        keys.position.set(0, H + 0.005, D * 0.18);
        group.add(keys);

        // Soporte tijera en X
        const stand1 = makeBox(0.03, H, 0.03, ironBlack);
        stand1.position.set(0, H / 2, 0);
        stand1.rotation.z = 0.42;
        const stand2 = makeBox(0.03, H, 0.03, ironBlack);
        stand2.position.set(0, H / 2, 0);
        stand2.rotation.z = -0.42;
        group.add(stand1, stand2);

        // Cuadro "CALMA" colgado arriba
        const calmaGeo = new THREE.BoxGeometry(0.46, 0.22, 0.025);
        const calmaMat = new THREE.MeshStandardMaterial({
          map: createLabelCanvas("CALMA", "#3a6b59", "#ffffff"),
          roughness: 0.5
        });
        const calmaSign = new THREE.Mesh(calmaGeo, calmaMat);
        calmaSign.position.set(0, 1.32, -D / 2 + 0.02);
        group.add(calmaSign);
        break;
      }

      case "cubos_pared": {
        // 4 cubos flotantes (2 madera, 2 azules)
        const offsets = [
          { x: -0.42, y: elev + 0.25, col: woodWarm },
          { x: -0.14, y: elev + 0.12, col: 0x3b6e8c },
          { x: 0.14,  y: elev + 0.28, col: woodWarm },
          { x: 0.42,  y: elev + 0.14, col: 0x3b6e8c }
        ];
        offsets.forEach((c) => {
          const cube = makeBox(0.26, 0.26, D, c.col, 0.55);
          cube.position.set(c.x, c.y, 0);
          group.add(cube);
        });
        break;
      }

      case "cama_2p": {
        // Cama Sommier 2 Plazas 140 x 190 x 58 cm
        const sommier = makeBox(W, 0.28, D, 0x33363b, 0.8);
        sommier.position.set(0, 0.16, 0);
        const mattress = makeBox(W - 0.02, 0.26, D - 0.02, 0xd8cab8, 0.85);
        mattress.position.set(0, 0.42, 0);
        group.add(sommier, mattress);

        // Almohadas en la cabecera (-Z)
        [-0.34, 0.34].forEach((px) => {
          const pillow = makeBox(0.54, 0.11, 0.34, 0xf8fafc, 0.8);
          pillow.position.set(px, 0.58, -D / 2 + 0.24);
          group.add(pillow);
        });

        // Pie de cama manta
        const blanket = makeBox(W + 0.01, 0.27, 0.55, 0xc2b29f, 0.9);
        blanket.position.set(0, 0.43, D / 2 - 0.28);
        group.add(blanket);
        break;
      }

      case "mesita_luz": {
        // Mesita de luz blanca 42 x 36 x 55 cm + Sansevieria
        const body = makeBox(W, H, D, 0xf8fafc, 0.4);
        body.position.set(0, H / 2, 0);
        group.add(body);

        const pot = new THREE.Mesh(
          new THREE.CylinderGeometry(0.07, 0.06, 0.12, 12),
          new THREE.MeshStandardMaterial({ color: 0xffffff })
        );
        pot.position.set(0, H + 0.06, 0);
        const snake = new THREE.Mesh(
          new THREE.ConeGeometry(0.06, 0.25, 6),
          new THREE.MeshStandardMaterial({ color: 0x2e6f40 })
        );
        snake.position.set(0, H + 0.22, 0);
        group.add(pot, snake);
        break;
      }

      case "rack_dorm": {
        // Rack dormitorio madera oscura (68x25x103) + TV (80x50) = 153 cm total
        const rackH = 1.03;
        const rack = makeBox(0.68, rackH, 0.25, woodDark, 0.6);
        rack.position.set(0, rackH / 2, 0);
        group.add(rack);

        const tv = makeBox(0.80, 0.50, 0.05, 0x111318, 0.2, 0.5);
        tv.position.set(0, rackH + 0.26, 0);
        group.add(tv);
        break;
      }

      case "placard_madera_existente": {
        // Placard de madera de 3 puertas y baulera existente en Habitación (195x60x240 cm)
        const main = makeBox(W, H, D, 0x7c4d2b, 0.55);
        main.position.set(0, H / 2, 0);
        group.add(main);
        // Líneas divisorias de puertas
        [-W / 6, W / 6].forEach((dx) => {
          const seam = makeBox(0.01, H - 0.08, 0.01, 0x3b2313);
          seam.position.set(dx, H / 2, D / 2 + 0.005);
          group.add(seam);
        });
        break;
      }

      case "maceta_palmera": {
        const pot = new THREE.Mesh(
          new THREE.CylinderGeometry(0.16, 0.12, 0.34, 14),
          new THREE.MeshStandardMaterial({ color: 0x1e2229, roughness: 0.5 })
        );
        pot.position.set(0, 0.17, 0);
        const foliage = new THREE.Mesh(
          new THREE.SphereGeometry(0.28, 12, 10),
          new THREE.MeshStandardMaterial({ color: 0x2d6a3e, roughness: 0.8 })
        );
        foliage.scale.set(1, 1.35, 1);
        foliage.position.set(0, 0.58, 0);
        group.add(pot, foliage);
        break;
      }

      case "ventilador_pie": {
        const base = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.18, 0.04, 16),
          new THREE.MeshStandardMaterial({ color: 0xf1f5f9 })
        );
        base.position.set(0, 0.02, 0);
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 1.05, 10),
          new THREE.MeshStandardMaterial({ color: 0xf1f5f9 })
        );
        pole.position.set(0, 0.55, 0);
        const head = new THREE.Mesh(
          new THREE.CylinderGeometry(0.21, 0.21, 0.08, 18),
          new THREE.MeshStandardMaterial({ color: 0xe2e8f0, wireframe: false })
        );
        head.rotation.x = Math.PI / 2;
        head.position.set(0, 1.12, 0.05);
        group.add(base, pole, head);
        break;
      }

      default: {
        const box = makeBox(W, H, D, woodWarm, 0.65);
        box.position.set(0, elev + H / 2, 0);
        group.add(box);
      }
    }

    // Flecha sutil en la base indicando el FRENTE del mueble (+Z local)
    const dirGeo = new THREE.ConeGeometry(0.06, 0.14, 4);
    const dirMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 });
    const dirCone = new THREE.Mesh(dirGeo, dirMat);
    dirCone.rotation.x = Math.PI / 2;
    dirCone.position.set(0, 0.03, D / 2 + 0.07);
    dirCone.name = "frontIndicator";
    group.add(dirCone);

    // Hitbox invisible para facilitar clic y arrastre en 3D/2D
    const hitGeo = new THREE.BoxGeometry(W, Math.max(H, 0.4), D);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitbox = new THREE.Mesh(hitGeo, hitMat);
    hitbox.position.set(0, elev + Math.max(H, 0.4) / 2, 0);
    hitbox.userData.furnitureId = itemDef.id;
    group.add(hitbox);

    group.userData = {
      furnitureId: itemDef.id,
      w: W,
      d: D,
      h: H,
      elevation: elev
    };

    return group;
  }

  // --------------------------------------------------------------------------
  // 3. EQUIPAMIENTO FIJO DEL DEPARTAMENTO NUEVO (COCINA, BAÑO, PLACARD, TECHOS)
  // --------------------------------------------------------------------------
  function buildFixedFixtures() {
    const fixtures = new THREE.Group();
    fixtures.name = "fixedFixtures";

    // A) COCINA + LAVADERO (Pared Sur z = 3.60, de x = 0.05 a 3.05)
    // Mesada gris y mueble bajo mesada blanco
    const counter = makeBox(2.25, 0.85, 0.58, 0xf8fafc, 0.4);
    counter.position.set(1.90, 0.425, 3.28);
    const counterTop = makeBox(2.27, 0.04, 0.60, 0xcbd5e1, 0.3, 0.2);
    counterTop.position.set(1.90, 0.86, 3.28);
    fixtures.add(counter, counterTop);

    // Cocina a gas negra 4 hornallas (como en cocina 1.webp)
    const stove = makeBox(0.56, 0.86, 0.58, 0x18181b, 0.35, 0.4);
    stove.position.set(1.12, 0.43, 3.28);
    fixtures.add(stove);

    // Calefón Orbis blanco en pared
    const heater = makeBox(0.38, 0.68, 0.24, 0xffffff, 0.3);
    heater.position.set(0.35, 1.58, 3.44);
    fixtures.add(heater);

    // Pileta de lavar + Espacio Lavarropas junto a la ventana (x = 0.35..0.82)
    const washer = makeBox(0.58, 0.85, 0.58, 0xf1f5f9, 0.3);
    washer.position.set(0.42, 0.425, 3.28);
    fixtures.add(washer);

    // Espacio Heladera en Cocina (x = 2.72, z = 1.45)
    const fridge = makeBox(0.66, 1.78, 0.66, 0xe2e8f0, 0.25, 0.35);
    fridge.position.set(2.70, 0.89, 1.42);
    fixtures.add(fridge);

    // B) BAÑO COMPLETO (x = 1.08..3.23, z = 3.96..5.30)
    // Ducha a la izquierda + Inodoro + Bidet + Lavatorio
    const showerBase = makeBox(0.75, 0.08, 1.25, 0xf8fafc, 0.3);
    showerBase.position.set(1.48, 0.04, 4.63);
    const toilet = makeBox(0.42, 0.44, 0.55, 0xffffff, 0.2);
    toilet.position.set(2.15, 0.22, 5.00);
    const bidet = makeBox(0.38, 0.40, 0.52, 0xffffff, 0.2);
    bidet.position.set(2.65, 0.20, 5.00);
    const sink = makeBox(0.52, 0.82, 0.42, 0xfce7f3, 0.25);
    sink.position.set(2.55, 0.41, 4.22);
    fixtures.add(showerBase, toilet, bidet, sink);

    // C) PLACARD BLANCO EMPOTRADO EN OFICINA (Pared Norte z = 3.68..4.25, x = 4.90..6.78)
    const builtInCloset = makeBox(1.88, 2.45, 0.56, 0xf3f2ee, 0.6);
    builtInCloset.position.set(5.84, 1.225, 3.96);
    fixtures.add(builtInCloset);

    // D) RADIADOR CALEFACCIÓN Y AIRE EN LIVING (según living 1.webp)
    const radiator = makeBox(0.14, 0.68, 0.65, 0xe5e7eb, 0.5, 0.3);
    radiator.position.set(7.02, 0.38, 3.18);
    fixtures.add(radiator);

    // E) VENTILADORES DE TECHO DE MADERA (en Living, Oficina y Habitación según fotos)
    const fanCoords = [
      { x: 5.18, z: 1.80 },
      { x: 5.53, z: 6.30 },
      { x: 2.63, z: 7.00 }
    ];
    fanCoords.forEach((fc) => {
      const fanGroup = new THREE.Group();
      fanGroup.position.set(fc.x, 2.48, fc.z);
      const motor = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 0.08, 14),
        new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.6, roughness: 0.3 })
      );
      fanGroup.add(motor);
      for (let b = 0; b < 4; b++) {
        const blade = makeBox(0.48, 0.015, 0.13, 0x7c4a24, 0.6);
        const pivot = new THREE.Group();
        pivot.rotation.y = (b * Math.PI) / 2;
        blade.position.set(0.32, 0, 0);
        pivot.add(blade);
        fanGroup.add(pivot);
      }
      fixtures.add(fanGroup);
    });

    return fixtures;
  }

  return {
    createFloorTexture,
    createWallMaterial,
    createFurnitureMesh,
    buildFixedFixtures
  };
})();
