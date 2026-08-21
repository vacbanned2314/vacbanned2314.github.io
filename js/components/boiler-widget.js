/* global THREE */
'use strict';

const BOILER_CATEGORIES = {
    corpus:      { color: '#c7c9c5', label: 'Корпус' },
    hydraulics:  { color: '#8fa8ad', label: 'Гидравлика' },
    combustion:  { color: '#c87542', label: 'Газ и горение' },
    electronics: { color: '#a6a19a', label: 'Автоматика' },
    heat:        { color: '#c87542', label: 'Теплообмен' },
    vent:        { color: '#aab2b2', label: 'Дымоудаление' }
};

const EMISSIVE_HOVER = 0x3d210f;

function initBoilerWidget(wrapper, options = {}) {
    if (!wrapper || typeof THREE === 'undefined') {
        wrapper?.querySelector('.boiler-widget__fallback')?.removeAttribute('hidden');
        return null;
    }

    const container = wrapper.querySelector('.boiler-widget__scene');
    const tooltip = wrapper.querySelector('.boiler-widget__tooltip');
    const ttCat = wrapper.querySelector('[data-bw-tt-cat]');
    const ttName = wrapper.querySelector('[data-bw-tt-name]');
    const ttDesc = wrapper.querySelector('[data-bw-tt-desc]');
    const slider = wrapper.querySelector('[data-bw-explode-slider]');
    const controlsRail = wrapper.querySelector('.boiler-widget__controls');
    const fallback = wrapper.querySelector('.boiler-widget__fallback');

    if (!container || !tooltip) return null;

    let scene, camera, renderer, controls, raycaster, mouse;
    const lastPointer = { x: 0, y: 0 };
    const parts = [];
    const interactiveParts = [];
    let explodeAmount = options.mobile ? 0 : 0.3;
    let hoveredPart = null;
    let animating = true;
    let pointerActive = false;
    let animationFrameId = null;
    let frontPanelPart = null;
    let lightingRig = null;
    let themeObserver = null;
    let mats;
    let environmentRenderTarget = null;
    let resizeObserver = null;
    const failedTextures = new Set();
    const cleanupFns = [];

    const listen = (target, eventName, handler, options) => {
        if (!target) return;
        target.addEventListener(eventName, handler, options);
        cleanupFns.push(() => target.removeEventListener(eventName, handler, options));
    };

    const CanvasTextures = {
        cv(w, h) {
            const c = document.createElement('canvas');
            c.width = w;
            c.height = h;
            return { c, ctx: c.getContext('2d') };
        },

        perforated(base = '#2b2d2f') {
            const { c, ctx } = this.cv(256, 256);
            ctx.fillStyle = base;
            ctx.fillRect(0, 0, 256, 256);
            ctx.fillStyle = '#0a0a0a';
            for (let y = 10; y < 256; y += 16) {
                for (let x = 10; x < 256; x += 16) {
                    ctx.beginPath();
                    ctx.arc(x, y, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            const tex = new THREE.CanvasTexture(c);
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            return tex;
        },

        pcb() {
            const { c, ctx } = this.cv(768, 384);
            ctx.fillStyle = '#284438';
            ctx.fillRect(0, 0, 768, 384);
            ctx.strokeStyle = 'rgba(210,180,90,0.5)';
            ctx.lineWidth = 2;
            for (let i = 0; i < 70; i++) {
                ctx.beginPath();
                let x = Math.random() * 768;
                let y = Math.random() * 384;
                ctx.moveTo(x, y);
                for (let s = 0; s < 3; s++) {
                    x += (Math.random() - 0.5) * 90;
                    y += (Math.random() - 0.5) * 60;
                    ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
            for (let i = 0; i < 16; i++) {
                const x = 30 + Math.random() * 700;
                const y = 30 + Math.random() * 320;
                const w = 40 + Math.random() * 60;
                const h = 24 + Math.random() * 30;
                ctx.fillStyle = '#1a1a1a';
                ctx.fillRect(x, y, w, h);
                ctx.fillStyle = '#c9c9c9';
                for (let p = 0; p < w; p += 8) {
                    ctx.fillRect(x + p, y - 4, 3, 4);
                    ctx.fillRect(x + p, y + h, 3, 4);
                }
            }
            return new THREE.CanvasTexture(c);
        },

        logo() {
            const { c, ctx } = this.cv(512, 128);
            ctx.clearRect(0, 0, 512, 128);
            ctx.fillStyle = '#596164';
            ctx.textAlign = 'center';
            ctx.font = '700 italic 56px Arial, sans-serif';
            ctx.fillText('Vaillant', 256, 66);
            ctx.fillStyle = '#788286';
            ctx.font = '600 19px Arial, sans-serif';
            ctx.letterSpacing = '1px';
            ctx.fillText('ecoTEC plus', 256, 103);
            return new THREE.CanvasTexture(c);
        }
    };

    function applyMaterialTextureFallback(material) {
        if (!material) return;

        const mapFailed = material.map && failedTextures.has(material.map);
        if (!mapFailed) return;

        material.map = null;
        if (material.userData?.textureFallbackColor != null && material.color) {
            material.color.setHex(material.userData.textureFallbackColor);
        }
        if (material.userData?.hideWhenTextureFails) {
            material.transparent = true;
            material.opacity = 0;
        }
        material.needsUpdate = true;
    }

    function registerFailedTexture(texture) {
        if (!texture) return;
        failedTextures.add(texture);

        Object.values(mats || {}).forEach(applyMaterialTextureFallback);
        scene?.traverse((object) => {
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.filter(Boolean).forEach(applyMaterialTextureFallback);
        });

        if (renderer && scene && camera) renderer.render(scene, camera);
    }

    function loadMaterialTexture(path, repeatX = 2, repeatY = 2) {
        let texture;
        texture = new THREE.TextureLoader().load(
            path,
            () => {
                if (animating && options.mobile && renderer && scene && camera) renderer.render(scene, camera);
            },
            undefined,
            () => registerFailedTexture(texture)
        );
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(repeatX, repeatY);
        texture.encoding = THREE.sRGBEncoding;
        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
        if (window.location.protocol === 'file:') {
            window.setTimeout(() => registerFailedTexture(texture), 0);
        }
        return texture;
    }

    function initMaterials() {
        const enamel = loadMaterialTexture('assets/textures/boiler/enamel-warm.webp', 2.2, 3.2);
        const steel = loadMaterialTexture('assets/textures/boiler/steel-brushed.webp', 2.4, 2.4);
        const copper = loadMaterialTexture('assets/textures/boiler/copper-clean.webp', 2, 2);
        const composite = loadMaterialTexture('assets/textures/boiler/composite-graphite.webp', 2, 2);

        mats = {
            panelPlastic: new THREE.MeshPhysicalMaterial({ map: enamel, color: 0xffffff, roughness: 0.7, metalness: 0.04, clearcoat: 0.12, clearcoatRoughness: 0.68, envMapIntensity: 0.45 }),
            innerSteel: new THREE.MeshStandardMaterial({ map: steel, color: 0xffffff, roughness: 0.48, metalness: 0.58, envMapIntensity: 1 }),
            darkMetal: new THREE.MeshStandardMaterial({ map: composite, color: 0xffffff, roughness: 0.66, metalness: 0.18, envMapIntensity: 0.58 }),
            silverMetal: new THREE.MeshStandardMaterial({ map: steel, color: 0xffffff, roughness: 0.3, metalness: 0.72, envMapIntensity: 1.15 }),
            copper: new THREE.MeshStandardMaterial({ map: copper, color: 0xffffff, roughness: 0.36, metalness: 0.68, envMapIntensity: 1.08 }),
            brass: new THREE.MeshStandardMaterial({ color: 0xbd9159, roughness: 0.38, metalness: 0.62, envMapIntensity: 0.95 }),
            redVessel: new THREE.MeshStandardMaterial({ color: 0xad4941, roughness: 0.53, metalness: 0.12, envMapIntensity: 0.5 }),
            pcb: new THREE.MeshStandardMaterial({ map: CanvasTextures.pcb(), color: 0xffffff, roughness: 0.58, metalness: 0.04, envMapIntensity: 0.3 }),
            rubber: new THREE.MeshStandardMaterial({ color: 0x24292a, roughness: 0.9, metalness: 0.01, envMapIntensity: 0.12 }),
            fins: new THREE.MeshStandardMaterial({ map: steel, color: 0xffffff, roughness: 0.4, metalness: 0.62, envMapIntensity: 1 }),
            perforated: new THREE.MeshStandardMaterial({ map: CanvasTextures.perforated('#3f4647'), color: 0xffffff, roughness: 0.62, metalness: 0.28, envMapIntensity: 0.65 }),
            pump: new THREE.MeshStandardMaterial({ map: composite, color: 0xffffff, roughness: 0.58, metalness: 0.16, envMapIntensity: 0.5 }),
            logo: new THREE.MeshStandardMaterial({ map: CanvasTextures.logo(), color: 0xffffff, transparent: true, alphaTest: 0.04, roughness: 0.46, metalness: 0.04, envMapIntensity: 0.25 }),
            controlPanel: new THREE.MeshPhysicalMaterial({ map: composite, color: 0xffffff, roughness: 0.58, metalness: 0.08, clearcoat: 0.16, clearcoatRoughness: 0.5, envMapIntensity: 0.55 }),
            screen: new THREE.MeshPhysicalMaterial({ color: 0x31535b, emissive: 0x0d1d20, emissiveIntensity: 0.38, roughness: 0.16, metalness: 0.05, clearcoat: 0.44, clearcoatRoughness: 0.16, envMapIntensity: 0.8 }),
            seam: new THREE.MeshStandardMaterial({ color: 0x9ba3a3, roughness: 0.68, metalness: 0.34, envMapIntensity: 0.72 }),
            knob: new THREE.MeshStandardMaterial({ map: enamel, color: 0xffffff, roughness: 0.42, metalness: 0.08, envMapIntensity: 0.38 }),
            ceramic: new THREE.MeshStandardMaterial({ color: 0xe8e2d7, roughness: 0.72, metalness: 0.02, envMapIntensity: 0.2 }),
            black: new THREE.MeshStandardMaterial({ map: composite, color: 0x7a8081, roughness: 0.8, metalness: 0.04, envMapIntensity: 0.18 })
        };

        [
            [mats.panelPlastic, 0xebe8e1],
            [mats.innerSteel, 0xb7bdbc],
            [mats.darkMetal, 0x454c4e],
            [mats.silverMetal, 0xc2c8c7],
            [mats.copper, 0xc87542],
            [mats.fins, 0xaeb5b4],
            [mats.perforated, 0x3f4647],
            [mats.pump, 0x4a5254],
            [mats.controlPanel, 0x353d3f],
            [mats.knob, 0xe5e2dc],
            [mats.black, 0x303638]
        ].forEach(([material, fallbackColor]) => {
            material.userData.textureFallbackColor = fallbackColor;
        });
        mats.logo.userData.hideWhenTextureFails = true;
    }

    function applyEdges(mesh, angleThreshold = 18, opacity = 0.42) {
        if (!mesh.geometry) return;
        const edgesGeo = new THREE.EdgesGeometry(mesh.geometry, angleThreshold);
        const edgesMat = new THREE.LineBasicMaterial({
            color: 0x161a1d,
            transparent: true,
            opacity,
            depthTest: true
        });
        const edges = new THREE.LineSegments(edgesGeo, edgesMat);
        edges.renderOrder = (mesh.renderOrder || 0) + 1;
        mesh.add(edges);
    }

    function addPart(geometry, material, basePos, explodeDir, name, meta) {
        const isInteractive = meta.interactive !== false;
        const instanceMaterial = material.clone();
        applyMaterialTextureFallback(instanceMaterial);
        const mesh = new THREE.Mesh(geometry, instanceMaterial);
        mesh.position.copy(basePos);
        mesh.castShadow = meta.castShadow !== false;
        mesh.receiveShadow = meta.receiveShadow !== false;
        if (meta.edges !== false) applyEdges(mesh, meta.edgeThreshold || 18, meta.edgeOpacity || 0.42);
        mesh.userData = {
            name,
            category: BOILER_CATEGORIES[meta.category] ? meta.category : 'corpus',
            desc: meta.desc || '',
            basePos: basePos.clone(),
            explodeDir: explodeDir.clone(),
            targetPos: basePos.clone(),
            isInteractive
        };
        if (isInteractive) {
            interactiveParts.push(mesh);
        }
        scene.add(mesh);
        parts.push(mesh);
        return mesh;
    }

    function addDetail(parent, geometry, material, position, rotation = [0, 0, 0], options = {}) {
        const instanceMaterial = material.clone();
        applyMaterialTextureFallback(instanceMaterial);
        const mesh = new THREE.Mesh(geometry, instanceMaterial);
        mesh.position.set(...position);
        mesh.rotation.set(...rotation);
        mesh.castShadow = options.castShadow !== false;
        mesh.receiveShadow = options.receiveShadow !== false;
        mesh.userData.interactiveRoot = parent;
        if (options.edges) applyEdges(mesh, options.edgeThreshold || 20, options.edgeOpacity || 0.22);
        parent.add(mesh);
        return mesh;
    }

    function addBoltRing(parent, radius, z, count = 6) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            addDetail(
                parent,
                new THREE.CylinderGeometry(0.12, 0.12, 0.16, 10),
                mats.silverMetal,
                [Math.cos(angle) * radius, Math.sin(angle) * radius, z],
                [Math.PI / 2, 0, 0]
            );
        }
    }

    function roundedBox(width, height, depth, radius = 0.35, bevel = 0.08) {
        const shape = new THREE.Shape();
        const w = width / 2;
        const h = height / 2;
        const r = Math.min(radius, w - 0.02, h - 0.02);
        shape.moveTo(-w + r, -h);
        shape.lineTo(w - r, -h);
        shape.quadraticCurveTo(w, -h, w, -h + r);
        shape.lineTo(w, h - r);
        shape.quadraticCurveTo(w, h, w - r, h);
        shape.lineTo(-w + r, h);
        shape.quadraticCurveTo(-w, h, -w, h - r);
        shape.lineTo(-w, -h + r);
        shape.quadraticCurveTo(-w, -h, -w + r, -h);
        const geometry = new THREE.ExtrudeGeometry(shape, {
            depth,
            bevelEnabled: true,
            bevelThickness: bevel,
            bevelSize: bevel,
            bevelSegments: 3,
            curveSegments: 8
        });
        geometry.center();
        return geometry;
    }

    function tube(points, radius = 0.16) {
        const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
        return new THREE.TubeGeometry(curve, 24, radius, 10, false);
    }

    function buildBoilerModel() {
        const frame = addPart(
            roundedBox(15.2, 24.2, 1.2, 0.45, 0.05),
            mats.silverMetal,
            new THREE.Vector3(0, 0, -4),
            new THREE.Vector3(0, 0, -7),
            'Несущая рама',
            { category: 'corpus', desc: 'Оцинкованное шасси с направляющими и точками крепления узлов.' }
        );
        addDetail(frame, new THREE.BoxGeometry(0.8, 22.2, 0.75), mats.innerSteel, [-6.7, 0, 0.9], [0, 0, 0], { edges: true });
        addDetail(frame, new THREE.BoxGeometry(0.8, 22.2, 0.75), mats.innerSteel, [6.7, 0, 0.9], [0, 0, 0], { edges: true });
        addDetail(frame, new THREE.BoxGeometry(12.7, 0.75, 0.8), mats.innerSteel, [0, 10.5, 0.9], [0, 0, 0], { edges: true });
        addDetail(frame, new THREE.BoxGeometry(12.7, 0.75, 0.8), mats.innerSteel, [0, -10.5, 0.9], [0, 0, 0], { edges: true });
        [[-6.25, 10], [6.25, 10], [-6.25, -10], [6.25, -10]].forEach(([x, y]) => {
            addDetail(frame, new THREE.CylinderGeometry(0.2, 0.2, 0.24, 12), mats.darkMetal, [x, y, 1.45], [Math.PI / 2, 0, 0]);
        });

        const vesselGeo = new THREE.CylinderGeometry(6, 6, 3, 32);
        vesselGeo.rotateX(Math.PI / 2);
        const vessel = addPart(vesselGeo, mats.redVessel, new THREE.Vector3(0, 4, -2.5), new THREE.Vector3(0, 9, -13), 'Расширительный бак', { category: 'hydraulics', desc: 'Компенсирует изменение объёма теплоносителя и стабилизирует давление.' });
        addDetail(vessel, new THREE.CylinderGeometry(0.85, 0.85, 0.4, 24), mats.darkMetal, [0, 0, 1.7], [Math.PI / 2, 0, 0]);
        addDetail(vessel, new THREE.CylinderGeometry(0.32, 0.32, 1.1, 16), mats.brass, [0, -5.8, 0.4]);
        addDetail(vessel, new THREE.BoxGeometry(8.8, 0.45, 0.7), mats.innerSteel, [0, 0, -1.75], [0, 0, 0], { edges: true });

        const primary = addPart(roundedBox(11.2, 5.1, 4.4, 0.55, 0.08), mats.innerSteel, new THREE.Vector3(0, 7, 1), new THREE.Vector3(0, 13, -2), 'Первичный теплообменник', { category: 'heat', desc: 'Передаёт тепло продуктов сгорания воде отопительного контура.' });
        for (let i = 0; i < 15; i++) {
            addDetail(primary, new THREE.BoxGeometry(10.2, 0.1, 4.8), mats.fins, [0, -2.1 + i * 0.3, 0.1]);
        }
        addDetail(primary, tube([[-4.8, -1.7, 2.5], [-2.5, -1.7, 2.8], [-2.5, 1.7, 2.8], [0, 1.7, 2.8], [0, -1.7, 2.8], [2.5, -1.7, 2.8], [2.5, 1.7, 2.8], [4.8, 1.7, 2.5]], 0.24), mats.copper, [0, 0, 0]);
        addDetail(primary, new THREE.CylinderGeometry(0.5, 0.5, 1.1, 18), mats.copper, [-4.9, -1.7, 2.35], [Math.PI / 2, 0, 0]);
        addDetail(primary, new THREE.CylinderGeometry(0.5, 0.5, 1.1, 18), mats.copper, [4.9, 1.7, 2.35], [Math.PI / 2, 0, 0]);

        const fanGeo = new THREE.CylinderGeometry(2.7, 2.7, 2.2, 32);
        fanGeo.rotateX(Math.PI / 2);
        const fan = addPart(fanGeo, mats.darkMetal, new THREE.Vector3(3.5, 2, 3), new THREE.Vector3(9, 6, 9), 'Вентилятор дымоудаления', { category: 'vent', desc: 'Поддерживает стабильную тягу и выводит продукты сгорания.' });
        addDetail(fan, new THREE.CylinderGeometry(1.25, 1.25, 0.55, 28), mats.silverMetal, [0, 0, 1.3], [Math.PI / 2, 0, 0]);
        for (let i = 0; i < 8; i++) {
            const angle = i * Math.PI / 4;
            addDetail(fan, new THREE.BoxGeometry(1.2, 0.3, 0.16), mats.silverMetal, [Math.cos(angle) * 1.1, Math.sin(angle) * 1.1, 1.62], [0, 0, angle + 0.35]);
        }
        addBoltRing(fan, 2.25, 1.63, 6);
        addDetail(fan, new THREE.CylinderGeometry(1.05, 1.05, 2.1, 24), mats.innerSteel, [0, 2.65, -0.25]);

        const burner = addPart(roundedBox(9.5, 1.7, 4.1, 0.28, 0.04), mats.perforated, new THREE.Vector3(0, -1, 1), new THREE.Vector3(0, -3, 3), 'Модулируемая горелка', { category: 'combustion', desc: 'Равномерно распределяет газовоздушную смесь и регулирует мощность.' });
        addDetail(burner, new THREE.BoxGeometry(10, 0.2, 4.5), mats.innerSteel, [0, 0.78, 0], [0, 0, 0], { edges: true });
        addDetail(burner, new THREE.CylinderGeometry(0.13, 0.13, 3.6, 10), mats.ceramic, [-3.4, 1.25, 0.5]);
        addDetail(burner, new THREE.CylinderGeometry(0.08, 0.08, 2.8, 10), mats.silverMetal, [-3.4, 2.25, 0.5], [0, 0, -0.34]);
        const pumpGeo = new THREE.CylinderGeometry(1.8, 1.8, 3.6, 32);
        pumpGeo.rotateX(Math.PI / 2);
        const pump = addPart(pumpGeo, mats.pump, new THREE.Vector3(4.5, -6, 2), new THREE.Vector3(11, -5, 7), 'Циркуляционный насос', { category: 'hydraulics', desc: 'Обеспечивает циркуляцию теплоносителя по системе отопления.' });
        addDetail(pump, new THREE.CylinderGeometry(1.05, 1.05, 0.62, 28), mats.darkMetal, [0, 0, 2.05], [Math.PI / 2, 0, 0]);
        addDetail(pump, new THREE.CylinderGeometry(0.32, 0.32, 0.74, 20), mats.silverMetal, [0, 0, 2.42], [Math.PI / 2, 0, 0]);
        addBoltRing(pump, 1.45, 2.38, 6);
        addDetail(pump, roundedBox(2.4, 1.8, 2.1, 0.28, 0.04), mats.controlPanel, [2.2, 0.1, -0.15], [0, 0, 0], { edges: true });
        addDetail(pump, tube([[0, 1.5, -1.3], [0, 3, -1.3], [-1.4, 4.1, -1.3]], 0.23), mats.copper, [0, 0, 0]);

        const gasValve = addPart(roundedBox(3.1, 4, 3.1, 0.35, 0.05), mats.silverMetal, new THREE.Vector3(-4.5, -6.5, 1.5), new THREE.Vector3(-10.5, -5, 5), 'Газовый клапан', { category: 'combustion', desc: 'Точно дозирует подачу газа в зависимости от требуемой мощности.' });
        addDetail(gasValve, new THREE.CylinderGeometry(1.05, 1.05, 0.9, 24), mats.darkMetal, [0, 0, 1.9], [Math.PI / 2, 0, 0]);
        addDetail(gasValve, new THREE.CylinderGeometry(0.45, 0.45, 1.2, 18), mats.brass, [0, -2.45, 0]);
        addDetail(gasValve, new THREE.CylinderGeometry(0.45, 0.45, 1.2, 18), mats.brass, [0, 2.45, 0]);
        const secondary = addPart(roundedBox(7.2, 2.2, 2.5, 0.28, 0.04), mats.innerSteel, new THREE.Vector3(0, -5, -2), new THREE.Vector3(0, -10.5, -7), 'Вторичный теплообменник ГВС', { category: 'heat', desc: 'Передаёт тепло проточной воде для горячего водоснабжения.' });
        for (let i = 0; i < 12; i++) {
            addDetail(secondary, new THREE.BoxGeometry(6.7, 0.08, 2.9), mats.fins, [0, -0.92 + i * 0.17, 0]);
        }
        addDetail(secondary, new THREE.CylinderGeometry(0.35, 0.35, 0.9, 16), mats.copper, [-2.7, -1.45, 0]);
        addDetail(secondary, new THREE.CylinderGeometry(0.35, 0.35, 0.9, 16), mats.copper, [2.7, -1.45, 0]);

        const manifold = addPart(roundedBox(10, 1.5, 2, 0.28, 0.04), mats.silverMetal, new THREE.Vector3(0, -9, 1), new THREE.Vector3(0, -16, 2), 'Гидравлические подключения', { category: 'hydraulics', desc: 'Пять сервисных подключений отопления, воды и газа.' });
        [-4, -2, 0, 2, 4].forEach((x, index) => {
            const material = index === 2 ? mats.brass : (index % 2 ? mats.copper : mats.silverMetal);
            addDetail(manifold, new THREE.CylinderGeometry(0.45, 0.52, 2.2, 18), material, [x, -1.7, 0]);
            addDetail(manifold, new THREE.TorusGeometry(0.52, 0.1, 8, 20), mats.darkMetal, [x, -2.78, 0], [Math.PI / 2, 0, 0]);
        });

        const electronics = addPart(roundedBox(15, 5.6, 2.8, 0.55, 0.06), mats.controlPanel, new THREE.Vector3(0, -10, 4), new THREE.Vector3(0, -13, 13), 'Плата управления', { category: 'electronics', desc: 'Контролирует горение, насосы, датчики и защитные алгоритмы.' });
        addDetail(electronics, new THREE.BoxGeometry(13.4, 4.2, 0.18), mats.pcb, [0, 0, 1.55]);
        [[-4.6, 0.9], [-2.5, -0.8], [0.4, 0.6], [3.6, -0.7]].forEach(([x, y], index) => {
            addDetail(electronics, new THREE.BoxGeometry(index === 0 ? 2 : 1.3, index === 0 ? 1.1 : 0.8, 0.38), mats.black, [x, y, 1.82]);
        });
        [-4.8, -3.9, 4.2, 5].forEach((x) => {
            addDetail(electronics, new THREE.CylinderGeometry(0.23, 0.23, 0.7, 14), mats.darkMetal, [x, -1.3, 1.95], [Math.PI / 2, 0, 0]);
        });
        for (let x = -5; x <= 5; x += 1) {
            addDetail(electronics, new THREE.BoxGeometry(0.65, 0.55, 0.35), mats.ceramic, [x, 1.55, 1.83]);
        }

        const w = 15.5;
        const h = 25;
        const r = 0.8;
        const shape = new THREE.Shape();
        shape.moveTo(-w / 2 + r, -h / 2);
        shape.lineTo(w / 2 - r, -h / 2);
        shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
        shape.lineTo(w / 2, h / 2 - r);
        shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
        shape.lineTo(-w / 2 + r, h / 2);
        shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
        shape.lineTo(-w / 2, -h / 2 + r);
        shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
        const coverGeo = new THREE.ExtrudeGeometry(shape, { depth: 5.2, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 3, curveSegments: 12 });
        coverGeo.center();
        const frontPanel = addPart(coverGeo, mats.panelPlastic, new THREE.Vector3(0, 0, 4.6), new THREE.Vector3(5.5, 0, 26), 'Лицевая панель', { category: 'corpus', desc: 'Съёмный порошково-окрашенный кожух с тепло- и шумоизоляцией.', edgeOpacity: 0.18 });
        frontPanel.renderOrder = 3;
        frontPanelPart = frontPanel;

        const seam = new THREE.Mesh(new THREE.BoxGeometry(15.7, 0.05, 5.5), mats.seam.clone());
        seam.position.set(0, -4.5, 0);
        seam.castShadow = false;
        seam.receiveShadow = false;
        frontPanel.add(seam);
        applyEdges(seam);
        const bezel = new THREE.Mesh(new THREE.BoxGeometry(7, 4.5, 0.2), mats.controlPanel.clone());
        bezel.position.set(0, -9, 2.62);
        bezel.castShadow = false;
        bezel.receiveShadow = false;
        frontPanel.add(bezel);
        applyEdges(bezel);
        const lcd = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 0.1), mats.screen.clone());
        lcd.position.set(0, -7.8, 2.72);
        lcd.castShadow = false;
        lcd.receiveShadow = false;
        frontPanel.add(lcd);
        applyEdges(lcd);
        const knobGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.4, 32);
        knobGeo.rotateX(Math.PI / 2);
        const knob = new THREE.Mesh(knobGeo, mats.knob.clone());
        knob.position.set(0, -9.8, 2.72);
        knob.castShadow = false;
        knob.receiveShadow = false;
        frontPanel.add(knob);
        applyEdges(knob);
        const btnGeo = new THREE.BoxGeometry(0.6, 0.2, 0.1);
        const btn1 = new THREE.Mesh(btnGeo, mats.seam.clone());
        btn1.position.set(-1, -8.7, 2.72);
        btn1.castShadow = false;
        btn1.receiveShadow = false;
        frontPanel.add(btn1);
        applyEdges(btn1);
        const btn2 = new THREE.Mesh(btnGeo, mats.seam.clone());
        btn2.position.set(1, -8.7, 2.72);
        btn2.castShadow = false;
        btn2.receiveShadow = false;
        frontPanel.add(btn2);
        applyEdges(btn2);
        const logoMesh = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.25), mats.logo.clone());
        logoMesh.position.set(0, 5.1, 2.68);
        logoMesh.castShadow = false;
        logoMesh.receiveShadow = false;
        frontPanel.add(logoMesh);
        applyEdges(logoMesh);
        for (let x = -2.7; x <= 2.7; x += 0.6) {
            addDetail(frontPanel, new THREE.BoxGeometry(0.32, 0.06, 0.08), mats.seam, [x, 10.8, 2.75]);
        }
    }

    function clearHover() {
        if (!hoveredPart) return;
        setPartHighlight(hoveredPart, false);
        hoveredPart = null;
        tooltip.style.display = 'none';
        wrapper.style.cursor = '';
    }

    function setPartHighlight(part, active) {
        part.traverse((object) => {
            if (!object.material?.emissive) return;
            if (!object.userData.hoverBaseEmissive) {
                object.userData.hoverBaseEmissive = object.material.emissive.clone();
            }
            if (active) object.material.emissive.setHex(EMISSIVE_HOVER);
            else object.material.emissive.copy(object.userData.hoverBaseEmissive);
        });
    }

    function getInteractiveRoot(object) {
        let candidate = object;
        while (candidate && !candidate.userData?.isInteractive) candidate = candidate.parent;
        return candidate || null;
    }

    function updateTooltipPosition(clientX, clientY) {
        const rect = wrapper.getBoundingClientRect();
        const offset = 12;
        const padding = 8;
        const ttW = tooltip.offsetWidth;
        const ttH = tooltip.offsetHeight;

        let x = clientX - rect.left + offset;
        let y = clientY - rect.top + offset;

        if (x + ttW + padding > rect.width) {
            x = clientX - rect.left - ttW - offset;
        }
        if (y + ttH + padding > rect.height) {
            y = clientY - rect.top - ttH - offset;
        }

        x = Math.max(padding, Math.min(x, rect.width - ttW - padding));
        y = Math.max(padding, Math.min(y, rect.height - ttH - padding));

        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
    }

    function renderFrame() {
        const lerpSpeed = options.reducedMotion ? 1 : 0.1;
        parts.forEach((part) => {
            const targetPos = part.userData.targetPos
                .copy(part.userData.basePos)
                .addScaledVector(part.userData.explodeDir, explodeAmount);
            if (lerpSpeed === 1) part.position.copy(targetPos);
            else part.position.lerp(targetPos, lerpSpeed);
        });

        if (!options.mobile && pointerActive) {
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(interactiveParts, true);
            if (intersects.length > 0) {
                const object = getInteractiveRoot(intersects[0].object);
                if (!object) {
                    clearHover();
                } else if (hoveredPart !== object) {
                    if (hoveredPart) setPartHighlight(hoveredPart, false);
                    hoveredPart = object;
                    setPartHighlight(hoveredPart, true);
                    if (ttCat) {
                        const cat = BOILER_CATEGORIES[object.userData.category];
                        if (cat) {
                            ttCat.textContent = cat.label;
                            ttCat.style.color = cat.color;
                            ttCat.style.display = 'block';
                        } else {
                            ttCat.style.display = 'none';
                        }
                    }
                    if (ttName) ttName.textContent = object.userData.name;
                    if (ttDesc) ttDesc.textContent = object.userData.desc;
                    tooltip.style.display = 'block';
                    updateTooltipPosition(lastPointer.x, lastPointer.y);
                    wrapper.style.cursor = 'pointer';
                }
            } else {
                clearHover();
            }
        } else {
            clearHover();
        }

        if (controls) controls.update();
        renderer.render(scene, camera);
    }

    function animate() {
        if (!animating) return;
        animationFrameId = requestAnimationFrame(animate);
        renderFrame();
    }

    function setupEvents() {
        resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (!width || !height) continue;
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
                if (options.mobile) renderFrame();
            }
        });
        resizeObserver.observe(container);

        if (slider) {
            const updateSliderTrack = () => {
                const progress = Math.round(explodeAmount * 100);
                slider.style.background = `linear-gradient(to right, var(--bw-accent) 0%, var(--bw-accent) ${progress}%, rgba(255,255,255,0.14) ${progress}%)`;
            };

            if (options.mobile) {
                slider.value = '0';
                slider.disabled = true;
                explodeAmount = 0;
                updateSliderTrack();
            } else {
                slider.value = String(explodeAmount);
                slider.disabled = false;
                updateSliderTrack();
            }

            listen(slider, 'input', () => {
                if (options.mobile) return;
                const nextAmount = Number.parseFloat(slider.value);
                explodeAmount = Number.isFinite(nextAmount) ? THREE.MathUtils.clamp(nextAmount, 0, 1) : 0.3;
                updateSliderTrack();
                controlsRail?.classList.add('has-interacted');
            });
        }

        if (!options.mobile) {
            listen(wrapper, 'mouseenter', () => {
                pointerActive = true;
            });

            listen(wrapper, 'mouseleave', () => {
                pointerActive = false;
                mouse.set(-10, -10);
                clearHover();
            });

            listen(wrapper, 'mousemove', (event) => {
                lastPointer.x = event.clientX;
                lastPointer.y = event.clientY;
                const rect = wrapper.getBoundingClientRect();
                mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
                if (tooltip.style.display === 'block') {
                    updateTooltipPosition(event.clientX, event.clientY);
                }
            });
        }
    }

    function createContactShadowTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(128, 128, 8, 128, 128, 128);
        grad.addColorStop(0, 'rgba(0,0,0,0.5)');
        grad.addColorStop(0.45, 'rgba(0,0,0,0.22)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);
        return new THREE.CanvasTexture(canvas);
    }

    function setupStudioEnvironment(targetScene) {
        const width = options.mobile ? 256 : 512;
        const height = width / 2;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        const base = ctx.createLinearGradient(0, 0, 0, height);
        base.addColorStop(0, '#435054');
        base.addColorStop(0.46, '#232d30');
        base.addColorStop(1, '#12191b');
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, width, height);

        ctx.globalCompositeOperation = 'screen';
        const warmSoftbox = ctx.createRadialGradient(width * 0.2, height * 0.16, 2, width * 0.2, height * 0.16, width * 0.3);
        warmSoftbox.addColorStop(0, 'rgba(255,246,232,0.98)');
        warmSoftbox.addColorStop(0.28, 'rgba(255,225,194,0.46)');
        warmSoftbox.addColorStop(1, 'rgba(255,214,176,0)');
        ctx.fillStyle = warmSoftbox;
        ctx.fillRect(0, 0, width, height);

        const coolStrip = ctx.createRadialGradient(width * 0.78, height * 0.34, 2, width * 0.78, height * 0.34, width * 0.2);
        coolStrip.addColorStop(0, 'rgba(221,244,248,0.72)');
        coolStrip.addColorStop(0.36, 'rgba(170,214,224,0.25)');
        coolStrip.addColorStop(1, 'rgba(152,205,218,0)');
        ctx.fillStyle = coolStrip;
        ctx.fillRect(0, 0, width, height);

        const lowFill = ctx.createLinearGradient(0, height * 0.45, 0, height);
        lowFill.addColorStop(0, 'rgba(112,132,136,0)');
        lowFill.addColorStop(1, 'rgba(112,132,136,0.24)');
        ctx.fillStyle = lowFill;
        ctx.fillRect(0, 0, width, height);

        const environmentSource = new THREE.CanvasTexture(canvas);
        environmentSource.mapping = THREE.EquirectangularReflectionMapping;
        environmentSource.encoding = THREE.sRGBEncoding;

        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();
        environmentRenderTarget = pmremGenerator.fromEquirectangular(environmentSource);
        targetScene.environment = environmentRenderTarget.texture;

        environmentSource.dispose();
        pmremGenerator.dispose();
    }

    function setupLighting(targetScene) {
        const ambientLight = new THREE.AmbientLight(0xfff6ef, 0.28);
        targetScene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xfff9f4, 1.1);
        keyLight.position.set(22, 34, 28);
        keyLight.castShadow = true;

        const shadow = keyLight.shadow;
        const shadowSize = options.mobile ? 1024 : 1536;
        shadow.mapSize.set(shadowSize, shadowSize);
        shadow.bias = -0.00012;
        shadow.normalBias = 0.028;
        shadow.radius = 5;

        const shadowCam = shadow.camera;
        shadowCam.near = 8;
        shadowCam.far = 88;
        shadowCam.left = -26;
        shadowCam.right = 26;
        shadowCam.top = 26;
        shadowCam.bottom = -26;
        shadowCam.updateProjectionMatrix();

        keyLight.target.position.set(0, -2, 1);
        targetScene.add(keyLight);
        targetScene.add(keyLight.target);

        const fillLight = new THREE.DirectionalLight(0xc7d9de, 0.38);
        fillLight.position.set(-24, 16, -18);
        targetScene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xffd2a8, 0.22);
        rimLight.position.set(-8, 10, 34);
        targetScene.add(rimLight);

        const hemisphereLight = new THREE.HemisphereLight(0xe6f0ff, 0x111617, 0.3);
        targetScene.add(hemisphereLight);

        lightingRig = {
            ambient: ambientLight,
            key: keyLight,
            fill: fillLight,
            rim: rimLight,
            hemisphere: hemisphereLight
        };
    }

    function applyThemeCalibration() {
        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        renderer.toneMappingExposure = isDark ? 1.2 : 1.08;

        if (lightingRig) {
            lightingRig.ambient.intensity = isDark ? 0.5 : 0.28;
            lightingRig.key.intensity = isDark ? 1.24 : 1.1;
            lightingRig.fill.intensity = isDark ? 0.54 : 0.38;
            lightingRig.rim.intensity = isDark ? 0.3 : 0.22;
            lightingRig.hemisphere.intensity = isDark ? 0.42 : 0.3;
        }

        [mats?.panelPlastic, frontPanelPart?.material].filter(Boolean).forEach((material) => {
            material.color.setHex(0xffffff);
            material.emissive.setHex(isDark ? 0x8a8174 : 0x17140f);
            material.emissiveIntensity = isDark ? 0.46 : 0.04;
            material.needsUpdate = true;
        });

        if (options.mobile) renderFrame();
    }

    function setupThemeSync() {
        applyThemeCalibration();
        themeObserver = new MutationObserver(applyThemeCalibration);
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }

    function setupGround(targetScene) {
        const groundGeo = new THREE.CircleGeometry(30, 56);
        groundGeo.rotateX(-Math.PI / 2);
        const ground = new THREE.Mesh(
            groundGeo,
            new THREE.ShadowMaterial({ color: 0x08090c, opacity: 0.26 })
        );
        ground.position.y = -13.2;
        ground.receiveShadow = true;
        targetScene.add(ground);

        const contact = new THREE.Mesh(
            new THREE.PlaneGeometry(28, 20),
            new THREE.MeshBasicMaterial({
                map: createContactShadowTexture(),
                transparent: true,
                depthWrite: false,
                opacity: 0.62
            })
        );
        contact.rotation.x = -Math.PI / 2;
        contact.position.set(0, -13.18, 1.5);
        contact.renderOrder = -1;
        targetScene.add(contact);
    }

    scene = new THREE.Scene();
    const initW = container.clientWidth || 1;
    const initH = container.clientHeight || 1;
    camera = new THREE.PerspectiveCamera(38, initW / initH, 0.1, 1000);
    camera.position.set(35, 20.5, 50);
    try {
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            premultipliedAlpha: false,
            powerPreference: 'high-performance'
        });
    } catch (error) {
        fallback?.removeAttribute('hidden');
        return null;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, options.mobile ? 1.5 : 2));
    renderer.setSize(initW, initH);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2(-10, -10);

    initMaterials();
    setupStudioEnvironment(scene);
    setupLighting(scene);
    setupGround(scene);

    buildBoilerModel();
    setupThemeSync();


    if (typeof THREE.OrbitControls !== 'function') {
        fallback?.removeAttribute('hidden');
        renderer.dispose();
        renderer.domElement.remove();
        return null;
    }
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enabled = !options.mobile;
    controls.enableDamping = !options.reducedMotion;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.enableRotate = !options.mobile;
    controls.enableZoom = !options.mobile;
    controls.screenSpacePanning = false;
    controls.rotateSpeed = 0.55;
    controls.zoomSpeed = 0.65;
    controls.target.set(0, -2.2, 2);
    controls.maxDistance = 110;
    controls.minDistance = 14;
    controls.minPolarAngle = 0.58;
    controls.maxPolarAngle = 2.42;

    setupEvents();
    if (options.mobile) renderFrame();
    else animate();

    return {
        destroy() {
            animating = false;
            if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
            resizeObserver?.disconnect();
            themeObserver?.disconnect();
            cleanupFns.splice(0).forEach((cleanup) => cleanup());
            clearHover();
            controls?.dispose?.();
            const disposedMaterials = new Set();
            const disposedTextures = new Set();

            const disposeMaterial = (material) => {
                if (!material || disposedMaterials.has(material)) return;
                disposedMaterials.add(material);
                ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'alphaMap'].forEach((key) => {
                    const texture = material[key];
                    if (texture && !disposedTextures.has(texture)) {
                        disposedTextures.add(texture);
                        texture.dispose();
                    }
                });
                material.dispose?.();
            };

            scene.traverse((object) => {
                object.geometry?.dispose?.();
                const materials = Array.isArray(object.material) ? object.material : [object.material];
                materials.forEach(disposeMaterial);
            });
            Object.values(mats || {}).forEach(disposeMaterial);
            scene.environment = null;
            environmentRenderTarget?.dispose();
            environmentRenderTarget = null;
            renderer.dispose();
            renderer.forceContextLoss?.();
            renderer.domElement.remove();
        }
    };
}

window.initBoilerWidget = initBoilerWidget;
