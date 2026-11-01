// ============================================================================
// APP.JS — Motor Principal 3D/2D, Medidor de Espacios, Estudio 2.5D y Renders IA
// ============================================================================

(function () {
  const DATA = window.APP_DATA;
  const M3D = window.Models3D;

  // Estado Global de la Aplicación
  const state = {
    viewMode: "3d", // '3d' | '2d' | 'studio' | 'ai'
    sideTab: "muebles", // 'muebles' | 'pintura' | 'luces'
    currentPreset: "preset_1",
    selectedFurnitureId: "escritorio_1",
    selectedWallId: "w_liv_n",
    paintClickMode: false,
    activeSwatchHex: "#9caf9e",
    activeWallTex: "matte",
    wallHeightMode: "normal", // 'normal' (2.60m), 'half' (1.30m), 'low' (0.35m)
    showBlueprintOverlay: false,
    linkTvToRack: true,
    showDimensionLines: true,

    // Iluminación y Cortinas
    timeOfDay: 16.5, // 16:30 hs sol de tarde cálido
    ceilingLightIntensity: 1.1,
    ceilingLightTemp: "#ffedd5",
    ledEnabled: {
      living_tv: true,
      living_ceiling: true,
      oficina_desk: true,
      dorm_bed: true
    },
    ledColor: "#ffaa44",
    curtainStyle: "roller_linen", // 'venetian' | 'roller_linen' | 'blackout' | 'sheer'
    curtainOpenPct: 65, // 0 = cerrado, 100 = abierto
    curtainColor: "#ece7df",

    // Estado de Muebles, Paredes y Pisos
    furniture: {},
    walls: {},
    floors: {}
  };

  // Inicializar estado desde DATA o LocalStorage
  function initDataState() {
    DATA.rooms.forEach((r) => {
      state.floors[r.id] = r.defaultFloor || "parquet_herringbone";
    });
    DATA.walls.forEach((w) => {
      state.walls[w.id] = {
        color: w.defaultColor || "#f5f4f0",
        tex: w.defaultTex || "matte"
      };
    });
    applyPreset("preset_1", false);

    // Cargar guardado previo si existe (fusionando muebles nuevos del catálogo)
    try {
      const saved = localStorage.getItem("arribenos_3a_sim_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.furniture) Object.assign(state.furniture, parsed.furniture);
        if (parsed.walls) Object.assign(state.walls, parsed.walls);
        if (parsed.floors) Object.assign(state.floors, parsed.floors);
      }
    } catch (e) {
      console.warn("No se pudo leer LocalStorage:", e);
    }
  }

  function applyPreset(presetKey, rebuild = true) {
    const preset = DATA.presets[presetKey];
    if (!preset) return;
    state.currentPreset = presetKey;

    DATA.furnitureCatalog.forEach((cat) => {
      const pItem = preset.items[cat.id];
      if (pItem) {
        state.furniture[cat.id] = {
          x: pItem.x,
          z: pItem.z,
          rot: pItem.rot || 0,
          visible: pItem.visible !== false,
          extended: !!pItem.extended,
          showFlag: pItem.showFlag !== false
        };
      } else {
        state.furniture[cat.id] = {
          x: 5.0,
          z: 2.0,
          rot: 0,
          visible: false,
          extended: false,
          showFlag: true
        };
      }
    });

    if (rebuild) {
      rebuildAllFurnitureMeshes();
      updateSelectionVisuals();
      renderSidebar();
      saveState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(
        "arribenos_3a_sim_v2",
        JSON.stringify({
          furniture: state.furniture,
          walls: state.walls,
          floors: state.floors
        })
      );
    } catch (e) {}
  }

  // ==========================================================================
  // ESCENA THREE.JS (3D Y 2D ORTOGRÁFICO)
  // ==========================================================================
  let scene, renderer, perspCam, orthoCam, activeCam, controls;
  let floorGroup, wallGroup, curtainGroup, furnitureGroup, dimGroup, ledGroup, blueprintMesh;
  let sunLight, ambientLight, roomLights = [];
  const furnitureMeshes = {};
  const wallMeshes = {};

  function initThree() {
    const canvas = document.getElementById("canvas3d");
    const container = canvas.parentElement;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0e14);

    const w = container.clientWidth || window.innerWidth - 350;
    const h = container.clientHeight || window.innerHeight - 58;
    const aspect = w / h;

    perspCam = new THREE.PerspectiveCamera(48, aspect, 0.1, 100);
    perspCam.position.set(3.6, 8.8, 11.2);

    const frustumSize = 10.2;
    orthoCam = new THREE.OrthographicCamera(
      (-frustumSize * aspect) / 2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      50
    );
    orthoCam.position.set(3.6, 15, 4.3);
    orthoCam.lookAt(3.6, 0, 4.3);

    activeCam = perspCam;

    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      preserveDrawingBuffer: true
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    controls = new THREE.OrbitControls(activeCam, renderer.domElement);
    controls.target.set(3.8, 0.5, 4.3);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.03;
    controls.minDistance = 1.2;
    controls.maxDistance = 22;

    // Grupos de la escena
    floorGroup = new THREE.Group();
    wallGroup = new THREE.Group();
    curtainGroup = new THREE.Group();
    furnitureGroup = new THREE.Group();
    dimGroup = new THREE.Group();
    ledGroup = new THREE.Group();

    scene.add(floorGroup, wallGroup, curtainGroup, furnitureGroup, dimGroup, ledGroup);

    // Equipamiento fijo (Cocina, Baño, Placard empotrado, Ventiladores de techo)
    scene.add(M3D.buildFixedFixtures());

    // Grilla exterior de referencia (1 cuadro = 1 metro)
    const grid = new THREE.GridHelper(16, 16, 0x1e293b, 0x151c28);
    grid.position.set(3.6, -0.02, 4.3);
    scene.add(grid);

    setupLights();
    buildFloors();
    buildBlueprintOverlay();
    buildWallsAndWindows();
    rebuildAllFurnitureMeshes();
    updateLightingAndCurtains();
    updateSelectionVisuals();

    window.addEventListener("resize", onWindowResize);
    setupViewportInteractions(canvas);

    animate();
  }

  function setupLights() {
    ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    sunLight = new THREE.DirectionalLight(0xfff4e0, 1.15);
    sunLight.position.set(14, 12, 4);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 35;
    const d = 8;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    // Luces puntuales por ambiente (plafones/ventiladores de techo)
    DATA.rooms.forEach((r) => {
      const pt = new THREE.PointLight(0xffedd5, 0.6, 7.5);
      pt.position.set(r.labelPos.x, 2.45, r.labelPos.z);
      scene.add(pt);
      roomLights.push(pt);
    });
  }

  function buildFloors() {
    while (floorGroup.children.length) floorGroup.remove(floorGroup.children[0]);

    DATA.rooms.forEach((r) => {
      const styleId = state.floors[r.id] || r.defaultFloor;
      const tex = M3D.createFloorTexture(styleId).clone();
      tex.needsUpdate = true;
      tex.repeat.set(r.w * 0.9, r.d * 0.9);

      const geo = new THREE.PlaneGeometry(r.w, r.d);
      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: styleId.includes("tile") ? 0.35 : 0.55,
        metalness: 0.05
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(r.x + r.w / 2, 0, r.z + r.d / 2);
      mesh.receiveShadow = true;
      mesh.userData = { roomId: r.id };
      floorGroup.add(mesh);

      // Etiqueta flotante sutil en el piso con nombre y medidas del ambiente
      const labelTex = createRoomFloorBadge(r.name, r.dimsLabel);
      const labelGeo = new THREE.PlaneGeometry(1.55, 0.46);
      const labelMat = new THREE.MeshBasicMaterial({
        map: labelTex,
        transparent: true,
        opacity: 0.82,
        depthWrite: false
      });
      const labelMesh = new THREE.Mesh(labelGeo, labelMat);
      labelMesh.rotation.x = -Math.PI / 2;
      labelMesh.position.set(r.labelPos.x, 0.006, r.labelPos.z);
      floorGroup.add(labelMesh);
    });
  }

  function createRoomFloorBadge(title, subtitle) {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 150;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "rgba(15, 17, 23, 0.72)";
    ctx.beginPath();
    ctx.roundRect(10, 10, 492, 130, 22);
    ctx.fill();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 32px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(title, 256, 66);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "600 26px Inter, sans-serif";
    ctx.fillText(subtitle, 256, 112);
    return new THREE.CanvasTexture(c);
  }

  function buildBlueprintOverlay() {
    if (blueprintMesh) scene.remove(blueprintMesh);
    const loader = new THREE.TextureLoader();
    loader.load(
      "depto_nuevo/plano_uf8.png",
      (tex) => {
        const geo = new THREE.PlaneGeometry(7.65, 9.25);
        const mat = new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          opacity: 0.78,
          depthWrite: false
        });
        blueprintMesh = new THREE.Mesh(geo, mat);
        blueprintMesh.rotation.x = -Math.PI / 2;
        blueprintMesh.position.set(3.55, 0.012, 4.32);
        blueprintMesh.visible = state.showBlueprintOverlay;
        scene.add(blueprintMesh);
      },
      undefined,
      () => {}
    );
  }

  function buildWallsAndWindows() {
    while (wallGroup.children.length) wallGroup.remove(wallGroup.children[0]);
    while (curtainGroup.children.length) curtainGroup.remove(curtainGroup.children[0]);
    Object.keys(wallMeshes).forEach((k) => delete wallMeshes[k]);

    const maxH =
      state.wallHeightMode === "low"
        ? 0.32
        : state.wallHeightMode === "half"
        ? 1.25
        : DATA.apartmentInfo.ceilingHeight;

    DATA.walls.forEach((w) => {
      const dx = w.x2 - w.x1;
      const dz = w.z2 - w.z1;
      const len = Math.hypot(dx, dz);
      const angle = Math.atan2(dz, dx);

      const wState = state.walls[w.id] || { color: w.defaultColor, tex: w.defaultTex };
      const mat = M3D.createWallMaterial(wState.color, wState.tex);

      const singleWallGroup = new THREE.Group();
      singleWallGroup.position.set(w.x1, 0, w.z1);
      singleWallGroup.rotation.y = -angle;
      singleWallGroup.userData = { wallId: w.id };

      const thick = w.thickness || 0.12;

      if (!w.openings || w.openings.length === 0 || state.wallHeightMode === "low") {
        const seg = new THREE.Mesh(new THREE.BoxGeometry(len, maxH, thick), mat);
        seg.position.set(len / 2, maxH / 2, 0);
        seg.castShadow = true;
        seg.receiveShadow = true;
        seg.userData = { wallId: w.id };
        singleWallGroup.add(seg);
      } else {
        // Construir pared con aberturas (puertas / ventanas)
        let cursor = 0;
        w.openings.forEach((op) => {
          if (op.start > cursor) {
            const segLen = op.start - cursor;
            const seg = new THREE.Mesh(new THREE.BoxGeometry(segLen, maxH, thick), mat);
            seg.position.set(cursor + segLen / 2, maxH / 2, 0);
            seg.castShadow = true;
            seg.receiveShadow = true;
            seg.userData = { wallId: w.id };
            singleWallGroup.add(seg);
          }

          const opLen = op.end - op.start;
          const opMid = op.start + opLen / 2;

          // Muro bajo ventana (antepecho)
          if (op.y0 > 0 && maxH > 0) {
            const hBot = Math.min(op.y0, maxH);
            const bot = new THREE.Mesh(new THREE.BoxGeometry(opLen, hBot, thick), mat);
            bot.position.set(opMid, hBot / 2, 0);
            bot.userData = { wallId: w.id };
            singleWallGroup.add(bot);
          }

          // Dintel superior sobre puerta/ventana
          if (maxH > op.y1) {
            const hTop = maxH - op.y1;
            const top = new THREE.Mesh(new THREE.BoxGeometry(opLen, hTop, thick), mat);
            top.position.set(opMid, op.y1 + hTop / 2, 0);
            top.userData = { wallId: w.id };
            singleWallGroup.add(top);
          }

          // Vidrio y Cortinas si es ventana
          if (op.type === "window" && maxH > op.y0) {
            const winH = Math.min(op.y1, maxH) - op.y0;
            if (winH > 0.1) {
              const glass = new THREE.Mesh(
                new THREE.BoxGeometry(opLen, winH, 0.02),
                new THREE.MeshPhysicalMaterial({
                  color: 0xbae6fd,
                  transparent: true,
                  opacity: 0.32,
                  roughness: 0.1
                })
              );
              glass.position.set(opMid, op.y0 + winH / 2, 0);
              singleWallGroup.add(glass);

              // Crear Cortina Interactiva
              if (op.curtainId && state.wallHeightMode !== "low") {
                const cMesh = createCurtainMesh(opLen, winH);
                cMesh.position.set(opMid, op.y0 + winH / 2, -thick / 2 - 0.04);
                singleWallGroup.add(cMesh);
              }
            }
          }

          // Marco de puerta
          if (op.type === "door" && maxH > 0.4) {
            const doorH = Math.min(op.y1, maxH);
            const panel = new THREE.Mesh(
              new THREE.BoxGeometry(opLen * 0.9, doorH * 0.96, 0.035),
              new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.65 })
            );
            panel.position.set(op.start + 0.05, doorH / 2, opLen * 0.42);
            panel.rotation.y = Math.PI / 2.4; // Puerta semi-abierta
            singleWallGroup.add(panel);
          }

          cursor = op.end;
        });

        if (cursor < len) {
          const remLen = len - cursor;
          const seg = new THREE.Mesh(new THREE.BoxGeometry(remLen, maxH, thick), mat);
          seg.position.set(cursor + remLen / 2, maxH / 2, 0);
          seg.castShadow = true;
          seg.receiveShadow = true;
          seg.userData = { wallId: w.id };
          singleWallGroup.add(seg);
        }
      }

      // Borde resaltador si es la pared seleccionada en pestaña Pintura
      if (state.sideTab === "pintura" && state.selectedWallId === w.id) {
        const hl = new THREE.Mesh(
          new THREE.BoxGeometry(len + 0.02, maxH + 0.03, thick + 0.03),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true })
        );
        hl.position.set(len / 2, maxH / 2, 0);
        singleWallGroup.add(hl);
      }

      wallGroup.add(singleWallGroup);
      wallMeshes[w.id] = singleWallGroup;
    });
  }

  function createCurtainMesh(winW, winH) {
    const g = new THREE.Group();
    const closedRatio = 1 - state.curtainOpenPct / 100; // 1 = totalmente cerrado, 0 = abierto
    const col = new THREE.Color(state.curtainColor || "#ece7df");

    if (state.curtainStyle === "venetian") {
      // Persiana americana madera/crema
      const slats = 10;
      for (let i = 0; i < slats * Math.max(0.2, closedRatio); i++) {
        const s = new THREE.Mesh(
          new THREE.BoxGeometry(winW + 0.06, 0.03, 0.04),
          new THREE.MeshStandardMaterial({ color: 0xd6c7b2, roughness: 0.6 })
        );
        s.position.set(0, winH / 2 - i * (winH / slats), 0);
        g.add(s);
      }
    } else if (state.curtainStyle === "blackout") {
      // Roller Blackout
      const rollH = Math.max(0.08, winH * closedRatio);
      const roller = new THREE.Mesh(
        new THREE.BoxGeometry(winW + 0.10, rollH, 0.02),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.9 })
      );
      roller.position.set(0, winH / 2 - rollH / 2, 0);
      g.add(roller);
    } else {
      // Roller + Cortinas de Lino Laterales de piso a techo
      const rollH = Math.max(0.08, winH * closedRatio * 0.7);
      const sunscreen = new THREE.Mesh(
        new THREE.BoxGeometry(winW + 0.06, rollH, 0.015),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.65,
          roughness: 0.8
        })
      );
      sunscreen.position.set(0, winH / 2 - rollH / 2, 0.01);
      g.add(sunscreen);

      // Paños de lino a ambos lados
      const drapeW = Math.max(0.24, (winW * 0.48) * Math.max(0.28, closedRatio));
      [-winW / 2 + drapeW / 2 - 0.04, winW / 2 - drapeW / 2 + 0.04].forEach((dx) => {
        const drape = new THREE.Mesh(
          new THREE.BoxGeometry(drapeW, winH + 0.65, 0.04),
          new THREE.MeshStandardMaterial({ color: col, roughness: 0.92 })
        );
        drape.position.set(dx, -0.25, -0.02);
        g.add(drape);
      });
    }
    return g;
  }

  function rebuildAllFurnitureMeshes() {
    while (furnitureGroup.children.length) furnitureGroup.remove(furnitureGroup.children[0]);
    Object.keys(furnitureMeshes).forEach((k) => delete furnitureMeshes[k]);

    DATA.furnitureCatalog.forEach((itemDef) => {
      const fState = state.furniture[itemDef.id];
      if (!fState) return;

      const mesh = M3D.createFurnitureMesh(itemDef, fState);
      mesh.position.set(fState.x, 0, fState.z);
      mesh.rotation.y = THREE.MathUtils.degToRad(fState.rot || 0);
      mesh.visible = fState.visible !== false;

      furnitureGroup.add(mesh);
      furnitureMeshes[itemDef.id] = mesh;
    });
  }

  // ==========================================================================
  // TIRAS LED, HORA DEL DÍA Y CORTINAS
  // ==========================================================================
  function updateLightingAndCurtains() {
    // 1. Sol según Hora del Día (8 a 23 hs)
    const hr = state.timeOfDay;
    const isNight = hr >= 19.5 || hr <= 7.0;
    const isSunset = hr > 17.5 && hr < 19.5;

    const curtainTransmission = 0.25 + (state.curtainOpenPct / 100) * 0.75;

    if (isNight) {
      sunLight.intensity = 0.08;
      sunLight.color.setHex(0x64748b);
      ambientLight.intensity = 0.35;
      scene.background.setHex(0x07090e);
    } else if (isSunset) {
      sunLight.intensity = 0.95 * curtainTransmission;
      sunLight.color.setHex(0xffb36b);
      sunLight.position.set(12, 6, 6);
      ambientLight.intensity = 0.55;
      scene.background.setHex(0x11131c);
    } else {
      // Mañana sol del Este (Calle Arribeños = +X)
      const morningFactor = hr < 13 ? 1.35 : 1.05;
      sunLight.intensity = morningFactor * curtainTransmission;
      sunLight.color.setHex(0xfffbeb);
      sunLight.position.set(15, 11, 4.3);
      ambientLight.intensity = 0.72;
      scene.background.setHex(0x0d1118);
    }

    // 2. Plafones interiores
    roomLights.forEach((pt) => {
      pt.intensity = state.ceilingLightIntensity * (isNight ? 1.25 : 0.75);
      pt.color.set(state.ceilingLightTemp);
    });

    // 3. Tiras LED (Backlight TV, Cielorraso Living, Escritorio Oficina, Cabecera Cama)
    while (ledGroup.children.length) ledGroup.remove(ledGroup.children[0]);
    const ledCol = new THREE.Color(state.ledColor || "#ffaa44");

    const addLedStrip = (x, y, z, w, h, d) => {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshBasicMaterial({ color: ledCol })
      );
      strip.position.set(x, y, z);
      ledGroup.add(strip);

      const glow = new THREE.PointLight(ledCol, 0.85, 2.6);
      glow.position.set(x, y, z);
      ledGroup.add(glow);
    };

    if (state.ledEnabled.living_tv && state.furniture.tv_55 && state.furniture.tv_55.visible) {
      const tvS = state.furniture.tv_55;
      addLedStrip(tvS.x, 1.18, tvS.z, 1.15, 0.04, 0.04);
    }
    if (state.ledEnabled.living_ceiling) {
      addLedStrip(5.18, 2.56, 0.12, 3.40, 0.03, 0.04);
    }
    if (state.ledEnabled.oficina_desk) {
      ["escritorio_1", "escritorio_2"].forEach((dId) => {
        if (state.furniture[dId] && state.furniture[dId].visible) {
          const dS = state.furniture[dId];
          addLedStrip(dS.x, 0.74, dS.z, 0.75, 0.03, 0.04);
        }
      });
    }
    if (state.ledEnabled.dorm_bed && state.furniture.cama_2p && state.furniture.cama_2p.visible) {
      const cS = state.furniture.cama_2p;
      addLedStrip(cS.x, 0.65, cS.z, 1.30, 0.04, 0.04);
    }
  }

  // ==========================================================================
  // CÁLCULO EXACTO DE DISTANCIAS LIBRES Y PASOS (CLEARANCE EN CENTÍMETROS)
  // ==========================================================================
  function getOrientedBox(furnId) {
    const def = DATA.furnitureCatalog.find((c) => c.id === furnId);
    const st = state.furniture[furnId];
    if (!def || !st) return null;

    const rawW = ((def.isExtensible && st.extended ? def.wExtended : def.w) || 100) / 100;
    const rawD = (def.d || 50) / 100;
    const rot = ((st.rot % 360) + 360) % 360;
    const swapped = rot === 90 || rot === 270;

    const spanX = swapped ? rawD : rawW;
    const spanZ = swapped ? rawW : rawD;

    return {
      xMin: st.x - spanX / 2,
      xMax: st.x + spanX / 2,
      zMin: st.z - spanZ / 2,
      zMax: st.z + spanZ / 2,
      spanX,
      spanZ,
      cx: st.x,
      cz: st.z
    };
  }

  function findContainingRoom(x, z) {
    for (const r of DATA.rooms) {
      if (x >= r.x - 0.15 && x <= r.x + r.w + 0.15 && z >= r.z - 0.15 && z <= r.z + r.d + 0.15) {
        return r;
      }
    }
    return DATA.rooms[1]; // Living por defecto
  }

  function calculateClearances(furnId) {
    const box = getOrientedBox(furnId);
    if (!box) return null;
    const room = findContainingRoom(box.cx, box.cz);

    // Distancias en metros a las 4 paredes del ambiente donde está ubicado
    let distN = box.zMin - room.z;
    let distS = room.z + room.d - box.zMax;
    let distW = box.xMin - room.x;
    let distE = room.x + room.w - box.xMax;

    let labelN = "Pared Norte";
    let labelS = "Pared Sur";
    let labelW = "Pared Oeste";
    let labelE = "Pared Este";

    // Verificar si hay otro mueble más cercano en cada dirección dentro del mismo ambiente
    const defSelf = DATA.furnitureCatalog.find((c) => c.id === furnId);
    const selfElev = (defSelf.elevation || 0) / 100;

    DATA.furnitureCatalog.forEach((otherDef) => {
      if (otherDef.id === furnId) return;
      const otherSt = state.furniture[otherDef.id];
      if (!otherSt || otherSt.visible === false) return;
      // Ignorar objetos apilados (como TV sobre el Rack o cubos flotantes altos)
      if (Math.abs(((otherDef.elevation || 0) / 100) - selfElev) > 0.5) return;

      const ob = getOrientedBox(otherDef.id);
      if (!ob) return;

      const overlapX = Math.min(box.xMax, ob.xMax) - Math.max(box.xMin, ob.xMin);
      const overlapZ = Math.min(box.zMax, ob.zMax) - Math.max(box.zMin, ob.zMin);

      if (overlapX > 0.05) {
        if (ob.zMax <= box.zMin + 0.02) {
          const d = box.zMin - ob.zMax;
          if (d < distN) { distN = d; labelN = otherDef.name.split(" ")[0]; }
        }
        if (ob.zMin >= box.zMax - 0.02) {
          const d = ob.zMin - box.zMax;
          if (d < distS) { distS = d; labelS = otherDef.name.split(" ")[0]; }
        }
      }
      if (overlapZ > 0.05) {
        if (ob.xMax <= box.xMin + 0.02) {
          const d = box.xMin - ob.xMax;
          if (d < distW) { distW = d; labelW = otherDef.name.split(" ")[0]; }
        }
        if (ob.xMin >= box.xMax - 0.02) {
          const d = ob.xMin - box.xMax;
          if (d < distE) { distE = d; labelE = otherDef.name.split(" ")[0]; }
        }
      }
    });

    return {
      room,
      box,
      nCm: Math.round(distN * 100),
      sCm: Math.round(distS * 100),
      wCm: Math.round(distW * 100),
      eCm: Math.round(distE * 100),
      labelN,
      labelS,
      labelW,
      labelE
    };
  }

  // Dibujar líneas de cota y caja de selección en 3D/2D
  function updateSelectionVisuals() {
    while (dimGroup.children.length) dimGroup.remove(dimGroup.children[0]);

    const id = state.selectedFurnitureId;
    if (!id || !state.furniture[id] || state.furniture[id].visible === false) {
      document.getElementById("inspectorCard").classList.remove("visible");
      return;
    }

    const info = calculateClearances(id);
    if (!info) return;

    const { box, room } = info;
    const def = DATA.furnitureCatalog.find((c) => c.id === id);
    const h = (def.h || 80) / 100;
    const elev = (def.elevation || 0) / 100;

    // Caja celeste alrededor del mueble seleccionado
    const outlineGeo = new THREE.BoxGeometry(box.spanX + 0.04, h + 0.04, box.spanZ + 0.04);
    const edges = new THREE.EdgesGeometry(outlineGeo);
    const lineBox = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 })
    );
    lineBox.position.set(box.cx, elev + h / 2, box.cz);
    dimGroup.add(lineBox);

    // Líneas de medición a las 4 paredes del ambiente
    if (state.showDimensionLines) {
      const yLine = 0.05;
      const addMeasureLine = (x1, z1, x2, z2, colorHex) => {
        const pts = [new THREE.Vector3(x1, yLine, z1), new THREE.Vector3(x2, yLine, z2)];
        const lGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const lMat = new THREE.LineBasicMaterial({ color: colorHex });
        dimGroup.add(new THREE.Line(lGeo, lMat));
      };

      addMeasureLine(box.cx, box.zMin, box.cx, room.z, 0x38bdf8);
      addMeasureLine(box.cx, box.zMax, box.cx, room.z + room.d, 0x38bdf8);
      addMeasureLine(box.xMin, box.cz, room.x, box.cz, 0x22c55e);
      addMeasureLine(box.xMax, box.cz, room.x + room.w, box.cz, 0x22c55e);
    }

    updateInspectorCard(def, info);
  }

  function formatClearanceBadge(cm) {
    if (cm < 0) return `<span class="badge-err">Choca (${cm} cm)</span>`;
    if (cm < 45) return `<span class="badge-warn">${cm} cm (Ajustado)</span>`;
    return `<span class="badge-ok">${cm} cm libres</span>`;
  }

  function updateInspectorCard(def, info) {
    const card = document.getElementById("inspectorCard");
    if (!card) return;
    card.classList.add("visible");

    const fState = state.furniture[def.id];
    const wCm = def.isExtensible && fState.extended ? def.wExtended : def.w;

    document.getElementById("inspThumb").src = def.photo;
    document.getElementById("inspName").textContent = def.name;
    document.getElementById("inspDims").textContent = `${wCm} × ${def.d} × ${def.h} cm — en ${info.room.name} (${info.room.dimsLabel})`;

    document.getElementById("clearN").innerHTML = `<span>↑ Hacia ${info.labelN}:</span> ${formatClearanceBadge(info.nCm)}`;
    document.getElementById("clearS").innerHTML = `<span>↓ Hacia ${info.labelS}:</span> ${formatClearanceBadge(info.sCm)}`;
    document.getElementById("clearW").innerHTML = `<span>← Hacia ${info.labelW}:</span> ${formatClearanceBadge(info.wCm)}`;
    document.getElementById("clearE").innerHTML = `<span>→ Hacia ${info.labelE}:</span> ${formatClearanceBadge(info.eCm)}`;

    const extraWrap = document.getElementById("inspExtraActions");
    extraWrap.innerHTML = "";

    if (def.isExtensible) {
      const btnExt = document.createElement("button");
      btnExt.className = "btn btn-sm btn-primary";
      btnExt.textContent = fState.extended ? "⇄ Cerrar Mesa a 140 cm" : "⇄ Extender Mesa a 170 cm";
      btnExt.onclick = () => {
        fState.extended = !fState.extended;
        rebuildAllFurnitureMeshes();
        updateSelectionVisuals();
        renderSidebar();
        saveState();
      };
      extraWrap.appendChild(btnExt);
    }

    if (def.id === "sofa") {
      const btnFlag = document.createElement("button");
      btnFlag.className = "btn btn-sm";
      btnFlag.textContent = fState.showFlag !== false ? "🇦🇷 Ocultar Bandera" : "🇦🇷 Mostrar Bandera";
      btnFlag.onclick = () => {
        fState.showFlag = fState.showFlag === false;
        rebuildAllFurnitureMeshes();
        updateSelectionVisuals();
        saveState();
      };
      extraWrap.appendChild(btnFlag);
    }
  }

  // ==========================================================================
  // INTERACCIÓN CON EL MOUSE EN EL VIEWPORT 3D / 2D (ARRASTRAR Y PINTAR)
  // ==========================================================================
  function setupViewportInteractions(canvas) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectPt = new THREE.Vector3();

    let isDraggingFurniture = false;
    let dragOffset = new THREE.Vector3();

    function updateMouseCoords(ev) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    }

    canvas.addEventListener("pointerdown", (ev) => {
      if (ev.button !== 0) return;
      updateMouseCoords(ev);
      raycaster.setFromCamera(mouse, activeCam);

      // 1. Si está activo el Modo Pintar Pared con Clic
      if (state.paintClickMode || (state.sideTab === "pintura" && ev.shiftKey)) {
        const wallHits = raycaster.intersectObjects(wallGroup.children, true);
        if (wallHits.length > 0) {
          let obj = wallHits[0].object;
          while (obj && !obj.userData.wallId) obj = obj.parent;
          if (obj && obj.userData.wallId) {
            state.selectedWallId = obj.userData.wallId;
            state.walls[state.selectedWallId] = {
              color: state.activeSwatchHex,
              tex: state.activeWallTex
            };
            buildWallsAndWindows();
            renderSidebar();
            saveState();
            return;
          }
        }
      }

      // 2. Detectar clic sobre un mueble
      const furnHits = raycaster.intersectObjects(furnitureGroup.children, true);
      if (furnHits.length > 0) {
        let obj = furnHits[0].object;
        while (obj && !obj.userData.furnitureId) obj = obj.parent;
        if (obj && obj.userData.furnitureId) {
          const fId = obj.userData.furnitureId;
          state.selectedFurnitureId = fId;
          isDraggingFurniture = true;
          controls.enabled = false;

          raycaster.ray.intersectPlane(dragPlane, intersectPt);
          const st = state.furniture[fId];
          dragOffset.set(st.x - intersectPt.x, 0, st.z - intersectPt.z);

          updateSelectionVisuals();
          renderSidebar();
          return;
        }
      }
    });

    window.addEventListener("pointermove", (ev) => {
      if (!isDraggingFurniture || !state.selectedFurnitureId) return;
      updateMouseCoords(ev);
      raycaster.setFromCamera(mouse, activeCam);

      if (raycaster.ray.intersectPlane(dragPlane, intersectPt)) {
        const id = state.selectedFurnitureId;
        const st = state.furniture[id];
        const prevX = st.x;
        const prevZ = st.z;

        // Redondear a pasos de 2 cm (0.02 m) para precisión arquitectónica
        let nx = Math.round((intersectPt.x + dragOffset.x) * 50) / 50;
        let nz = Math.round((intersectPt.z + dragOffset.z) * 50) / 50;

        nx = Math.max(0.25, Math.min(6.95, nx));
        nz = Math.max(0.18, Math.min(8.45, nz));

        st.x = nx;
        st.z = nz;

        if (furnitureMeshes[id]) {
          furnitureMeshes[id].position.set(nx, 0, nz);
        }

        // Si el usuario mueve el Rack de TV, mover la TV de 55" solidariamente
        if (id === "rack_tv" && state.linkTvToRack && state.furniture.tv_55) {
          state.furniture.tv_55.x += nx - prevX;
          state.furniture.tv_55.z += nz - prevZ;
          if (furnitureMeshes.tv_55) {
            furnitureMeshes.tv_55.position.set(state.furniture.tv_55.x, 0, state.furniture.tv_55.z);
          }
        }

        updateSelectionVisuals();
        updateLightingAndCurtains();
      }
    });

    window.addEventListener("pointerup", () => {
      if (isDraggingFurniture) {
        isDraggingFurniture = false;
        controls.enabled = true;
        saveState();
      }
    });

    // Atajos de teclado (R = Rotar 90°, Flechas = Mover de a 5 cm, Supr = Ocultar)
    window.addEventListener("keydown", (ev) => {
      if (state.viewMode !== "3d" && state.viewMode !== "2d") return;
      if (["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)) return;

      const id = state.selectedFurnitureId;
      if (!id || !state.furniture[id]) return;

      if (ev.key === "r" || ev.key === "R") {
        rotateFurniture(id, 90);
      } else if (ev.key === "ArrowUp") {
        nudgeFurniture(id, 0, -0.05);
      } else if (ev.key === "ArrowDown") {
        nudgeFurniture(id, 0, 0.05);
      } else if (ev.key === "ArrowLeft") {
        nudgeFurniture(id, -0.05, 0);
      } else if (ev.key === "ArrowRight") {
        nudgeFurniture(id, 0.05, 0);
      }
    });
  }

  function rotateFurniture(id, deltaDeg = 90) {
    const st = state.furniture[id];
    if (!st) return;
    st.rot = ((st.rot || 0) + deltaDeg) % 360;
    if (furnitureMeshes[id]) {
      furnitureMeshes[id].rotation.y = THREE.MathUtils.degToRad(st.rot);
    }
    if (id === "rack_tv" && state.linkTvToRack && state.furniture.tv_55) {
      state.furniture.tv_55.rot = st.rot;
      if (furnitureMeshes.tv_55) {
        furnitureMeshes.tv_55.rotation.y = THREE.MathUtils.degToRad(st.rot);
      }
    }
    updateSelectionVisuals();
    saveState();
  }

  function nudgeFurniture(id, dx, dz) {
    const st = state.furniture[id];
    if (!st) return;
    st.x = Math.round((st.x + dx) * 100) / 100;
    st.z = Math.round((st.z + dz) * 100) / 100;
    if (furnitureMeshes[id]) {
      furnitureMeshes[id].position.set(st.x, 0, st.z);
    }
    if (id === "rack_tv" && state.linkTvToRack && state.furniture.tv_55) {
      state.furniture.tv_55.x = st.x;
      state.furniture.tv_55.z = st.z;
      if (furnitureMeshes.tv_55) {
        furnitureMeshes.tv_55.position.set(st.x, 0, st.z);
      }
    }
    updateSelectionVisuals();
    saveState();
  }

  // ==========================================================================
  // CÁMARAS RÁPIDAS Y VISTAS (3D / 2D / PRIMERA PERSONA POR AMBIENTE)
  // ==========================================================================
  function setCameraView(targetRoomId) {
    if (targetRoomId === "overview_3d") {
      switchViewMode("3d");
      perspCam.position.set(3.6, 8.8, 11.2);
      controls.target.set(3.8, 0.5, 4.3);
      controls.update();
      return;
    }
    if (targetRoomId === "top_2d") {
      switchViewMode("2d");
      return;
    }

    const r = DATA.rooms.find((rm) => rm.id === targetRoomId);
    if (!r) return;

    switchViewMode("3d");
    perspCam.position.set(r.camPos.x, r.camPos.y, r.camPos.z);
    controls.target.set(r.camTarget.x, r.camTarget.y, r.camTarget.z);
    controls.update();
  }

  function switchViewMode(mode) {
    state.viewMode = mode;
    document.querySelectorAll(".mode-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.mode === mode);
    });

    document.getElementById("studioOverlay").classList.toggle("active", mode === "studio");
    document.getElementById("aiOverlay").classList.toggle("active", mode === "ai");

    if (mode === "2d") {
      activeCam = orthoCam;
      controls.object = orthoCam;
      controls.enableRotate = false;
      orthoCam.position.set(3.6, 15, 4.3);
      orthoCam.lookAt(3.6, 0, 4.3);
      controls.target.set(3.6, 0, 4.3);
      state.wallHeightMode = "low";
      buildWallsAndWindows();
      controls.update();
    } else if (mode === "3d") {
      activeCam = perspCam;
      controls.object = perspCam;
      controls.enableRotate = true;
      if (state.wallHeightMode === "low") {
        state.wallHeightMode = "normal";
        buildWallsAndWindows();
      }
      controls.update();
    } else if (mode === "studio") {
      renderPhotoStudio();
    }
  }

  function onWindowResize() {
    const canvas = document.getElementById("canvas3d");
    const container = canvas.parentElement;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;

    const aspect = w / h;
    perspCam.aspect = aspect;
    perspCam.updateProjectionMatrix();

    const frustumSize = 10.2;
    orthoCam.left = (-frustumSize * aspect) / 2;
    orthoCam.right = (frustumSize * aspect) / 2;
    orthoCam.top = frustumSize / 2;
    orthoCam.bottom = -frustumSize / 2;
    orthoCam.updateProjectionMatrix();

    renderer.setSize(w, h);
  }

  function animate() {
    requestAnimationFrame(animate);
    if (state.viewMode === "3d" || state.viewMode === "2d") {
      controls.update();
      renderer.render(scene, activeCam);
    }
  }

  // ==========================================================================
  // RENDERIZADO DEL PANEL LATERAL (MUEBLES / PINTURA Y PISOS / LUCES Y CORTINAS)
  // ==========================================================================
  function renderSidebar() {
    const container = document.getElementById("sidebarContent");
    container.innerHTML = "";

    if (state.sideTab === "muebles") {
      renderFurnitureTab(container);
    } else if (state.sideTab === "pintura") {
      renderPaintTab(container);
    } else if (state.sideTab === "luces") {
      renderLightsTab(container);
    }
  }

  function renderFurnitureTab(container) {
    const topBox = document.createElement("div");
    topBox.className = "control-group";
    topBox.innerHTML = `
      <div class="section-title">
        <span>Tus Muebles Reales (${DATA.furnitureCatalog.length})</span>
        <label style="font-size:10.5px;cursor:pointer;display:flex;align-items:center;gap:4px;">
          <input type="checkbox" id="chkLinkTv" ${state.linkTvToRack ? "checked" : ""}/> Vincular TV al Rack
        </label>
      </div>
      <div style="font-size:11.5px;color:var(--text-muted);line-height:1.35;">
        Arrastrá cualquier mueble en el plano 3D/2D. Presioná <b>R</b> para rotarlo 90° y mirá abajo a la derecha los centímetros libres.
      </div>
    `;
    container.appendChild(topBox);

    topBox.querySelector("#chkLinkTv").onchange = (e) => {
      state.linkTvToRack = e.target.checked;
    };

    const list = document.createElement("div");
    list.className = "furniture-list";

    DATA.furnitureCatalog.forEach((item) => {
      const fState = state.furniture[item.id] || { visible: true, rot: 0 };
      const isSelected = state.selectedFurnitureId === item.id;
      const room = findContainingRoom(fState.x || 5, fState.z || 2);
      const wVal = item.isExtensible && fState.extended ? item.wExtended : item.w;

      const card = document.createElement("div");
      card.className = `furn-card ${isSelected ? "selected" : ""} ${fState.visible === false ? "hidden-item" : ""}`;
      card.innerHTML = `
        <img class="furn-thumb" src="${item.photo}" alt="${item.name}" />
        <div class="furn-info">
          <div class="furn-name" title="${item.name}">${item.name}</div>
          <div class="furn-dims">📏 ${wVal} × ${item.d} × ${item.h} cm</div>
          <span class="furn-room-badge">📍 ${room ? room.name : "Living"}</span>
        </div>
        <div class="furn-actions">
          <button class="btn btn-sm btn-rot" title="Rotar 90°">↻</button>
          <button class="btn btn-sm btn-vis" title="Mostrar / Ocultar">${fState.visible === false ? "🚫" : "👁️"}</button>
        </div>
      `;

      card.addEventListener("click", (ev) => {
        if (ev.target.closest("button")) return;
        state.selectedFurnitureId = item.id;
        if (fState.visible === false) {
          fState.visible = true;
          if (furnitureMeshes[item.id]) furnitureMeshes[item.id].visible = true;
        }
        updateSelectionVisuals();
        renderSidebar();
      });

      card.querySelector(".btn-rot").onclick = (ev) => {
        ev.stopPropagation();
        state.selectedFurnitureId = item.id;
        rotateFurniture(item.id, 90);
        renderSidebar();
      };

      card.querySelector(".btn-vis").onclick = (ev) => {
        ev.stopPropagation();
        fState.visible = fState.visible === false;
        if (furnitureMeshes[item.id]) furnitureMeshes[item.id].visible = fState.visible;
        updateSelectionVisuals();
        renderSidebar();
        saveState();
      };

      list.appendChild(card);
    });

    container.appendChild(list);
  }

  function renderPaintTab(container) {
    // 1. Selector de Pared Individual o Ambiente
    const wallCtrl = document.createElement("div");
    wallCtrl.className = "control-group";

    const wallOptions = DATA.walls
      .map((w) => `<option value="${w.id}" ${state.selectedWallId === w.id ? "selected" : ""}>${w.name}</option>`)
      .join("");

    wallCtrl.innerHTML = `
      <div class="section-title">1. Elegí una Pared (o hacé clic en 3D)</div>
      <label class="control-row" style="cursor:pointer;background:rgba(56,189,248,0.1);padding:7px;border-radius:7px;border:1px solid var(--accent);">
        <span>🖌️ <b>Pintar paredes haciendo clic en 3D</b></span>
        <input type="checkbox" id="chkPaintClick" ${state.paintClickMode ? "checked" : ""} />
      </label>
      <select id="selWallId" class="preset-select" style="width:100%;margin-top:4px;">
        ${wallOptions}
      </select>
      <div style="display:flex;gap:6px;margin-top:4px;">
        <button class="btn btn-sm btn-primary" id="btnPaintSingle" style="flex:1;justify-content:center;">Pintar Pared (Acento)</button>
        <button class="btn btn-sm" id="btnPaintRoom" style="flex:1;justify-content:center;">Pintar Todo el Ambiente</button>
      </div>
    `;
    container.appendChild(wallCtrl);

    wallCtrl.querySelector("#chkPaintClick").onchange = (e) => {
      state.paintClickMode = e.target.checked;
    };
    wallCtrl.querySelector("#selWallId").onchange = (e) => {
      state.selectedWallId = e.target.value;
      buildWallsAndWindows();
    };
    wallCtrl.querySelector("#btnPaintSingle").onclick = () => {
      state.walls[state.selectedWallId] = {
        color: state.activeSwatchHex,
        tex: state.activeWallTex
      };
      buildWallsAndWindows();
      saveState();
    };
    wallCtrl.querySelector("#btnPaintRoom").onclick = () => {
      const targetWall = DATA.walls.find((w) => w.id === state.selectedWallId);
      if (!targetWall) return;
      DATA.walls.forEach((w) => {
        if (w.room === targetWall.room) {
          state.walls[w.id] = {
            color: state.activeSwatchHex,
            tex: state.activeWallTex
          };
        }
      });
      buildWallsAndWindows();
      saveState();
    };

    // 2. Paleta de Colores + Color Personalizado
    const swatchBox = document.createElement("div");
    swatchBox.className = "control-group";
    swatchBox.innerHTML = `
      <div class="section-title">
        <span>2. Color de Pintura</span>
        <input type="color" id="customColorPicker" value="${state.activeSwatchHex}" style="width:28px;height:22px;border:none;background:none;cursor:pointer;" />
      </div>
      <div class="swatch-grid" id="swatchGrid"></div>
    `;
    container.appendChild(swatchBox);

    const grid = swatchBox.querySelector("#swatchGrid");
    DATA.paintSwatches.forEach((sw) => {
      const b = document.createElement("button");
      b.className = `swatch-btn ${state.activeSwatchHex.toLowerCase() === sw.hex.toLowerCase() ? "active" : ""}`;
      b.innerHTML = `
        <div class="swatch-color" style="background:${sw.hex}"></div>
        <span class="swatch-label">${sw.name}</span>
      `;
      b.onclick = () => {
        state.activeSwatchHex = sw.hex;
        state.walls[state.selectedWallId] = {
          color: state.activeSwatchHex,
          tex: state.activeWallTex
        };
        buildWallsAndWindows();
        renderSidebar();
        saveState();
      };
      grid.appendChild(b);
    });

    swatchBox.querySelector("#customColorPicker").oninput = (e) => {
      state.activeSwatchHex = e.target.value;
      state.walls[state.selectedWallId] = {
        color: state.activeSwatchHex,
        tex: state.activeWallTex
      };
      buildWallsAndWindows();
      saveState();
    };

    // 3. Texturas y Revestimientos de Pared (Varillado WPC, Microcemento, etc.)
    const texBox = document.createElement("div");
    texBox.className = "control-group";
    const texOptions = DATA.wallTextures
      .map((t) => `<option value="${t.id}" ${state.activeWallTex === t.id ? "selected" : ""}>${t.name}</option>`)
      .join("");
    texBox.innerHTML = `
      <div class="section-title">3. Textura / Revestimiento de Pared</div>
      <select id="selWallTex" class="preset-select" style="width:100%;">${texOptions}</select>
    `;
    container.appendChild(texBox);

    texBox.querySelector("#selWallTex").onchange = (e) => {
      state.activeWallTex = e.target.value;
      state.walls[state.selectedWallId] = {
        color: state.activeSwatchHex,
        tex: state.activeWallTex
      };
      buildWallsAndWindows();
      saveState();
    };

    // 4. Estilo de Piso por Ambiente
    const floorBox = document.createElement("div");
    floorBox.className = "control-group";
    const floorOpts = DATA.floorStyles
      .map((f) => `<option value="${f.id}">${f.name}</option>`)
      .join("");
    floorBox.innerHTML = `
      <div class="section-title">4. Piso de Madera / Porcelanato</div>
      <select id="selFloorStyle" class="preset-select" style="width:100%;">${floorOpts}</select>
      <button class="btn btn-sm" id="btnResetPaint" style="margin-top:4px;justify-content:center;">Restaurar Blanco Original en Todo</button>
    `;
    container.appendChild(floorBox);

    floorBox.querySelector("#selFloorStyle").onchange = (e) => {
      const val = e.target.value;
      ["hall", "living", "pasillo", "habitacion", "oficina"].forEach((rId) => {
        state.floors[rId] = val;
      });
      buildFloors();
      saveState();
    };

    floorBox.querySelector("#btnResetPaint").onclick = () => {
      DATA.walls.forEach((w) => {
        state.walls[w.id] = { color: w.defaultColor, tex: w.defaultTex };
      });
      state.paintClickMode = false;
      buildWallsAndWindows();
      renderSidebar();
      saveState();
    };
  }

  function renderLightsTab(container) {
    // 1. Luz Natural y Hora del Día
    const sunBox = document.createElement("div");
    sunBox.className = "control-group";
    sunBox.innerHTML = `
      <div class="section-title">1. Sol y Luz Natural (Calle Arribeños = Este)</div>
      <div class="control-row">
        <span>Hora: <b id="lblTime">${Math.floor(state.timeOfDay)}:00 hs</b></span>
        <input type="range" id="rngTime" min="8" max="22" step="0.5" value="${state.timeOfDay}" />
      </div>
      <div style="display:flex;gap:5px;">
        <button class="btn btn-sm" data-hr="9.5" style="flex:1;justify-content:center;">☀️ Mañana</button>
        <button class="btn btn-sm" data-hr="16.5" style="flex:1;justify-content:center;">🌤️ Tarde</button>
        <button class="btn btn-sm" data-hr="21.0" style="flex:1;justify-content:center;">🌙 Noche</button>
      </div>
    `;
    container.appendChild(sunBox);

    sunBox.querySelector("#rngTime").oninput = (e) => {
      state.timeOfDay = parseFloat(e.target.value);
      sunBox.querySelector("#lblTime").textContent = `${Math.floor(state.timeOfDay)}:00 hs`;
      updateLightingAndCurtains();
    };
    sunBox.querySelectorAll("button[data-hr]").forEach((b) => {
      b.onclick = () => {
        state.timeOfDay = parseFloat(b.dataset.hr);
        renderSidebar();
        updateLightingAndCurtains();
      };
    });

    // 2. Cortinas y Persianas en Ventanales
    const curtBox = document.createElement("div");
    curtBox.className = "control-group";
    curtBox.innerHTML = `
      <div class="section-title">2. Cortinas en Ventanales</div>
      <select id="selCurtainStyle" class="preset-select" style="width:100%;">
        <option value="roller_linen" ${state.curtainStyle === "roller_linen" ? "selected" : ""}>Doble: Roller Sunscreen + Cortinas Lino</option>
        <option value="blackout" ${state.curtainStyle === "blackout" ? "selected" : ""}>Roller Blackout Moderno</option>
        <option value="venetian" ${state.curtainStyle === "venetian" ? "selected" : ""}>Persiana Americana Original</option>
      </select>
      <div class="control-row">
        <span>Apertura: <b id="lblCurtPct">${state.curtainOpenPct}%</b></span>
        <input type="range" id="rngCurtPct" min="0" max="100" step="5" value="${state.curtainOpenPct}" />
      </div>
      <div class="control-row">
        <span>Color de Tela / Cortina:</span>
        <input type="color" id="colCurtain" value="${state.curtainColor}" />
      </div>
    `;
    container.appendChild(curtBox);

    curtBox.querySelector("#selCurtainStyle").onchange = (e) => {
      state.curtainStyle = e.target.value;
      buildWallsAndWindows();
    };
    curtBox.querySelector("#rngCurtPct").oninput = (e) => {
      state.curtainOpenPct = parseInt(e.target.value, 10);
      curtBox.querySelector("#lblCurtPct").textContent = `${state.curtainOpenPct}%`;
      buildWallsAndWindows();
      updateLightingAndCurtains();
    };
    curtBox.querySelector("#colCurtain").oninput = (e) => {
      state.curtainColor = e.target.value;
      buildWallsAndWindows();
    };

    // 3. Tiras LED y Luces de Techo
    const ledBox = document.createElement("div");
    ledBox.className = "control-group";
    ledBox.innerHTML = `
      <div class="section-title">3. Tiras LED y Ambientes</div>
      <div class="control-row">
        <span>Color Tiras LED:</span>
        <input type="color" id="colLed" value="${state.ledColor}" />
      </div>
      <label class="control-row"><input type="checkbox" data-led="living_tv" ${state.ledEnabled.living_tv ? "checked" : ""}/> Backlight LED detrás de TV 55"</label>
      <label class="control-row"><input type="checkbox" data-led="living_ceiling" ${state.ledEnabled.living_ceiling ? "checked" : ""}/> Garganta LED Cielorraso Living</label>
      <label class="control-row"><input type="checkbox" data-led="oficina_desk" ${state.ledEnabled.oficina_desk ? "checked" : ""}/> Tira LED Escritorio Oficina</label>
      <label class="control-row"><input type="checkbox" data-led="dorm_bed" ${state.ledEnabled.dorm_bed ? "checked" : ""}/> Tira LED Cálida Cabecera Cama</label>
      <div class="control-row" style="margin-top:6px;">
        <span>Potencia Plafones:</span>
        <input type="range" id="rngCeiling" min="0" max="2.2" step="0.1" value="${state.ceilingLightIntensity}" />
      </div>
    `;
    container.appendChild(ledBox);

    ledBox.querySelector("#colLed").oninput = (e) => {
      state.ledColor = e.target.value;
      updateLightingAndCurtains();
    };
    ledBox.querySelectorAll("input[data-led]").forEach((chk) => {
      chk.onchange = () => {
        state.ledEnabled[chk.dataset.led] = chk.checked;
        updateLightingAndCurtains();
      };
    });
    ledBox.querySelector("#rngCeiling").oninput = (e) => {
      state.ceilingLightIntensity = parseFloat(e.target.value);
      updateLightingAndCurtains();
    };
  }

  // ==========================================================================
  // ESTUDIO FOTOGRÁFICO REAL 2.5D (PINTAR PAREDES + CORTINAS + RECORTES SOBRE FOTOS)
  // ==========================================================================
  const studioState = {
    sceneIdx: 0,
    wallColors: {}, // wallMaskId -> hex o null (sin pintar)
    selectedMaskId: "mask_liv_izq",
    paintOpacity: 0.58,
    showLedGlow: true,
    ledHex: "#ffaa44",
    curtainRollerPct: 35,
    showLinenDrapes: true,
    stickers: [] // { id, name, img, x, y, w, h, flipX }
  };
  const loadedImages = {};

  function loadImgCached(src, cb) {
    if (loadedImages[src]) {
      cb(loadedImages[src]);
      return;
    }
    const img = new Image();
    img.onload = () => {
      loadedImages[src] = img;
      cb(img);
    };
    img.src = src;
  }

  function initPhotoStudioUI() {
    const selScene = document.getElementById("studioSceneSelect");
    selScene.innerHTML = DATA.photoStudioScenes
      .map((s, idx) => `<option value="${idx}">${s.name}</option>`)
      .join("");

    selScene.onchange = (e) => {
      studioState.sceneIdx = parseInt(e.target.value, 10);
      const sc = DATA.photoStudioScenes[studioState.sceneIdx];
      if (sc.walls.length) studioState.selectedMaskId = sc.walls[0].id;
      populateStudioWallControls();
      renderPhotoStudio();
    };

    // Paleta de pintura en estudio 2.5D
    const studioSwatches = document.getElementById("studioSwatchGrid");
    DATA.paintSwatches.forEach((sw) => {
      const b = document.createElement("button");
      b.className = "swatch-btn";
      b.innerHTML = `<div class="swatch-color" style="background:${sw.hex}"></div><span class="swatch-label">${sw.name}</span>`;
      b.onclick = () => {
        studioState.wallColors[studioState.selectedMaskId] = sw.hex;
        renderPhotoStudio();
      };
      studioSwatches.appendChild(b);
    });

    document.getElementById("btnClearStudioWall").onclick = () => {
      delete studioState.wallColors[studioState.selectedMaskId];
      renderPhotoStudio();
    };

    document.getElementById("rngStudioRoller").oninput = (e) => {
      studioState.curtainRollerPct = parseInt(e.target.value, 10);
      renderPhotoStudio();
    };

    document.getElementById("chkStudioLinen").onchange = (e) => {
      studioState.showLinenDrapes = e.target.checked;
      renderPhotoStudio();
    };

    document.getElementById("chkStudioLed").onchange = (e) => {
      studioState.showLedGlow = e.target.checked;
      renderPhotoStudio();
    };

    // Botones para agregar fotos de muebles como stickers móviles sobre la foto real
    const stickerContainer = document.getElementById("studioFurnitureStickers");
    DATA.furnitureCatalog.slice(0, 10).forEach((item) => {
      const btn = document.createElement("button");
      btn.className = "btn btn-sm";
      btn.style.width = "100%";
      btn.style.justifyContent = "flex-start";
      btn.innerHTML = `➕ ${item.name.split("(")[0]} (${item.w}×${item.d}cm)`;
      btn.onclick = () => {
        loadImgCached(item.photo, (img) => {
          studioState.stickers.push({
            uid: Date.now() + Math.random(),
            label: `${item.name.split(" ")[0]} (${item.w}x${item.h}cm)`,
            img,
            x: 0.35,
            y: 0.48,
            w: 0.24,
            h: 0.24
          });
          renderPhotoStudio();
        });
      };
      stickerContainer.appendChild(btn);
    });

    document.getElementById("btnClearStickers").onclick = () => {
      studioState.stickers = [];
      renderPhotoStudio();
    };

    // Interacción para arrastrar stickers en el canvas 2.5D
    const pCanvas = document.getElementById("photoCanvas");
    let draggingSticker = null;

    pCanvas.addEventListener("pointerdown", (ev) => {
      const rect = pCanvas.getBoundingClientRect();
      const nx = (ev.clientX - rect.left) / rect.width;
      const ny = (ev.clientY - rect.top) / rect.height;

      for (let i = studioState.stickers.length - 1; i >= 0; i--) {
        const st = studioState.stickers[i];
        if (nx >= st.x && nx <= st.x + st.w && ny >= st.y && ny <= st.y + st.h) {
          draggingSticker = st;
          return;
        }
      }
    });

    window.addEventListener("pointermove", (ev) => {
      if (!draggingSticker) return;
      const rect = pCanvas.getBoundingClientRect();
      const nx = (ev.clientX - rect.left) / rect.width;
      const ny = (ev.clientY - rect.top) / rect.height;
      draggingSticker.x = Math.max(0, Math.min(0.85, nx - draggingSticker.w / 2));
      draggingSticker.y = Math.max(0, Math.min(0.85, ny - draggingSticker.h / 2));
      renderPhotoStudio();
    });

    window.addEventListener("pointerup", () => {
      draggingSticker = null;
    });

    populateStudioWallControls();
  }

  function populateStudioWallControls() {
    const sc = DATA.photoStudioScenes[studioState.sceneIdx];
    const selMask = document.getElementById("studioWallSelect");
    selMask.innerHTML = sc.walls
      .map((w) => `<option value="${w.id}" ${studioState.selectedMaskId === w.id ? "selected" : ""}>${w.name}</option>`)
      .join("");
    selMask.onchange = (e) => {
      studioState.selectedMaskId = e.target.value;
    };
  }

  function renderPhotoStudio() {
    const canvas = document.getElementById("photoCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const sc = DATA.photoStudioScenes[studioState.sceneIdx];

    loadImgCached(sc.photo, (baseImg) => {
      canvas.width = baseImg.width || 1024;
      canvas.height = baseImg.height || 683;
      const W = canvas.width;
      const H = canvas.height;

      // 1. Dibujar foto real del departamento nuevo
      ctx.drawImage(baseImg, 0, 0, W, H);

      // 2. Pintar polígonos de pared con multiply (conserva sombras e iluminación real de la foto)
      sc.walls.forEach((wMask) => {
        const hex = studioState.wallColors[wMask.id];
        if (!hex) return;

        ctx.save();
        ctx.beginPath();
        wMask.points.forEach(([px, py], i) => {
          if (i === 0) ctx.moveTo(px * W, py * H);
          else ctx.lineTo(px * W, py * H);
        });
        ctx.closePath();
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = hex;
        ctx.globalAlpha = studioState.paintOpacity;
        ctx.fill();
        ctx.restore();
      });

      // 3. Dibujar Cortinas Roller y Paños de Lino sobre la ventana de la foto
      if (sc.windowZone) {
        const wz = sc.windowZone;
        const wx = wz.x * W;
        const wy = wz.y * H;
        const ww = wz.w * W;
        const wh = wz.h * H;

        if (studioState.curtainRollerPct > 0) {
          const rH = wh * (studioState.curtainRollerPct / 100);
          ctx.save();
          ctx.fillStyle = "rgba(242, 238, 230, 0.86)";
          ctx.fillRect(wx, wy, ww, rH);
          ctx.strokeStyle = "#cbd5e1";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(wx, wy + rH);
          ctx.lineTo(wx + ww, wy + rH);
          ctx.stroke();
          ctx.restore();
        }

        if (studioState.showLinenDrapes) {
          ctx.save();
          ctx.fillStyle = "rgba(235, 229, 218, 0.88)";
          const drapeW = ww * 0.22;
          ctx.fillRect(wx - drapeW * 0.3, wy - 10, drapeW, wh * 1.45);
          ctx.fillRect(wx + ww - drapeW * 0.7, wy - 10, drapeW, wh * 1.45);
          ctx.restore();
        }
      }

      // 4. Efecto Tiras LED Cálidas sobre la foto real
      if (studioState.showLedGlow && sc.ledZones) {
        sc.ledZones.forEach((lz) => {
          ctx.save();
          ctx.strokeStyle = "#ffbb55";
          ctx.shadowColor = "#ff9900";
          ctx.shadowBlur = 28;
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(lz.x1 * W, lz.y1 * H);
          ctx.lineTo(lz.x2 * W, lz.y2 * H);
          ctx.stroke();
          ctx.restore();
        });
      }

      // 5. Dibujar Stickers de Muebles del Usuario
      studioState.stickers.forEach((st) => {
        const sx = st.x * W;
        const sy = st.y * H;
        const sw = st.w * W;
        const sh = st.h * H;

        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.55)";
        ctx.shadowBlur = 14;
        ctx.drawImage(st.img, sx, sy, sw, sh);
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.strokeRect(sx, sy, sw, sh);

        ctx.fillStyle = "rgba(15,17,23,0.85)";
        ctx.fillRect(sx, sy - 22, sw, 22);
        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 12px Inter, sans-serif";
        ctx.fillText(st.label, sx + 6, sy - 7);
        ctx.restore();
      });
    });
  }

  // ==========================================================================
  // COMPARADOR ANTES / DESPUÉS CON RENDERS IA FOTORREALISTAS
  // ==========================================================================
  function initAiRendersGallery() {
    const nav = document.getElementById("aiRoomButtons");
    const beforeImg = document.getElementById("baBeforeImg");
    const afterImg = document.getElementById("baAfterImg");
    const afterClip = document.getElementById("baAfterClip");
    const handle = document.getElementById("baHandle");
    const titleEl = document.getElementById("aiRenderTitle");
    const subEl = document.getElementById("aiRenderSub");
    const metricsEl = document.getElementById("aiRenderMetrics");

    function selectAiRender(idx) {
      const item = DATA.aiRenders[idx];
      if (!item) return;

      nav.querySelectorAll("button").forEach((b, i) => {
        b.classList.toggle("btn-primary", i === idx);
      });

      beforeImg.src = item.beforeImg;
      afterImg.src = item.afterImg;
      titleEl.textContent = item.title;
      subEl.textContent = item.subtitle;
      metricsEl.innerHTML = item.metrics.map((m) => `<li style="margin-bottom:6px;">✅ ${m}</li>`).join("");
    }

    DATA.aiRenders.forEach((r, idx) => {
      const btn = document.createElement("button");
      btn.className = `btn ${idx === 0 ? "btn-primary" : ""}`;
      btn.style.width = "100%";
      btn.style.justifyContent = "flex-start";
      btn.textContent = r.title.split("—")[0];
      btn.onclick = () => selectAiRender(idx);
      nav.appendChild(btn);
    });

    // Slider Antes / Después interactivo
    const wrap = document.getElementById("baSliderWrap");
    let sliding = false;

    function setSliderPct(pct) {
      const clamped = Math.max(3, Math.min(97, pct));
      afterClip.style.clipPath = `inset(0 0 0 ${clamped}%)`;
      handle.style.left = `${clamped}%`;
    }

    setSliderPct(48);

    wrap.addEventListener("pointerdown", (ev) => {
      sliding = true;
      const rect = wrap.getBoundingClientRect();
      setSliderPct(((ev.clientX - rect.left) / rect.width) * 100);
    });
    window.addEventListener("pointermove", (ev) => {
      if (!sliding) return;
      const rect = wrap.getBoundingClientRect();
      setSliderPct(((ev.clientX - rect.left) / rect.width) * 100);
    });
    window.addEventListener("pointerup", () => {
      sliding = false;
    });

    selectAiRender(0);
  }

  // ==========================================================================
  // INICIALIZACIÓN DE EVENTOS DE LA INTERFAZ PRINCIPAL
  // ==========================================================================
  window.addEventListener("DOMContentLoaded", () => {
    initDataState();
    initThree();
    renderSidebar();
    initPhotoStudioUI();
    initAiRendersGallery();

    // Pestañas superiores de modo (3D / 2D / Foto Estudio / Renders IA)
    document.querySelectorAll(".mode-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        switchViewMode(btn.dataset.mode);
      });
    });

    // Pestañas del Sidebar (Muebles / Pintura / Luces)
    document.querySelectorAll(".side-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        state.sideTab = tab.dataset.tab;
        document.querySelectorAll(".side-tab").forEach((t) => t.classList.toggle("active", t === tab));
        buildWallsAndWindows();
        renderSidebar();
      });
    });

    // Selector de 3 Distribuciones Pre-armadas (Presets)
    const presetSel = document.getElementById("presetSelect");
    presetSel.addEventListener("change", (ev) => {
      applyPreset(ev.target.value, true);
    });

    // Botones de Cámara Rápida por Habitación
    document.querySelectorAll("[data-cam]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setCameraView(btn.dataset.cam);
      });
    });

    // Botón Altura de Paredes (Normales / Medias / Bajas para ver mejor el interior)
    document.getElementById("btnToggleWalls").addEventListener("click", () => {
      const order = ["normal", "half", "low"];
      const next = order[(order.indexOf(state.wallHeightMode) + 1) % order.length];
      state.wallHeightMode = next;
      buildWallsAndWindows();
    });

    // Botón Superponer Plano Original UF 8
    document.getElementById("btnToggleBlueprint").addEventListener("click", () => {
      state.showBlueprintOverlay = !state.showBlueprintOverlay;
      if (blueprintMesh) blueprintMesh.visible = state.showBlueprintOverlay;
    });

    // Botones del Inspector Flotante
    document.getElementById("btnInspRotL").onclick = () => rotateFurniture(state.selectedFurnitureId, -90);
    document.getElementById("btnInspRotR").onclick = () => rotateFurniture(state.selectedFurnitureId, 90);
    document.getElementById("btnInspHide").onclick = () => {
      const id = state.selectedFurnitureId;
      if (!id || !state.furniture[id]) return;
      state.furniture[id].visible = false;
      if (furnitureMeshes[id]) furnitureMeshes[id].visible = false;
      updateSelectionVisuals();
      renderSidebar();
      saveState();
    };

    // Botón Captura de Pantalla PNG
    document.getElementById("btnScreenshot").addEventListener("click", () => {
      renderer.render(scene, activeCam);
      const link = document.createElement("a");
      link.download = `Arribenos_2968_3A_${state.currentPreset}.png`;
      link.href = renderer.domElement.toDataURL("image/png");
      link.click();
    });
  });
})();
