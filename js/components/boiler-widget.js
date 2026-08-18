/* global THREE */
'use strict';

const BOILER_CATEGORIES = {
    corpus:      { color: '#b8bec4', label: 'Корпус' },
    hydraulics:  { color: '#4fa3d1', label: 'Гидравлика' },
    combustion:  { color: '#e08a3c', label: 'Газ и горение' },
    electronics: { color: '#4cc38a', label: 'Электроника' },
    heat:        { color: '#c97c4b', label: 'Теплообмен' },
    vent:        { color: '#9aa4ad', label: 'Вентиляция' }
};

const EMISSIVE_HOVER = 0x5a3810;
const EMISSIVE_SELECT = 0x8a5018;

function initBoilerWidget(wrapper, options = {}) {
    if (!wrapper || typeof THREE === 'undefined') return null;

    const decorBlock = wrapper.closest('.hero-decor-block');
    const container = wrapper.querySelector('.boiler-widget__scene');
    const tooltip = wrapper.querySelector('.boiler-widget__tooltip');
    const ttCat = wrapper.querySelector('[data-bw-tt-cat]');
    const ttName = wrapper.querySelector('[data-bw-tt-name]');
    const ttDesc = wrapper.querySelector('[data-bw-tt-desc]');
    const slider = wrapper.querySelector('[data-bw-explode-slider]');
    const valEl = wrapper.querySelector('[data-bw-explode-val]');
    const labelsToggle = wrapper.querySelector('[data-bw-labels-toggle]');

    if (!container || !tooltip) return null;

    let scene, camera, renderer, controls, raycaster, mouse;
    let lastPointer = { x: 0, y: 0 };
    let parts = [];
    let interactiveParts = [];
    let explodeAmount = 0.3;
    let hoveredPart = null;
    let labelsVisible = true;
    let uiCounter = 0;
    let animating = true;
    let pointerActive = false;
    let frontPanelPart = null;
    let lastPanelAlpha = -1;
    let mats;

    const TextureGen = {
        cv(w, h) {
            const c = document.createElement('canvas');
            c.width = w;
            c.height = h;
            return { c, ctx: c.getContext('2d') };
        },

        brushedMetal(base = '#9aa0a5') {
            const { c, ctx } = this.cv(1024, 1024);
            ctx.fillStyle = base;
            ctx.fillRect(0, 0, 1024, 1024);
            for (let i = 0; i < 2600; i++) {
                const y = Math.random() * 1024;
                const len = Math.random() * 40 + 8;
                const a = Math.random() * 0.13;
                ctx.strokeStyle = Math.random() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;
                ctx.lineWidth = Math.random() * 1.4 + 0.3;
                ctx.beginPath();
                ctx.moveTo(Math.random() * 1024, y);
                ctx.lineTo(Math.random() * 1024 + len, y);
                ctx.stroke();
            }
            const grad = ctx.createLinearGradient(0, 0, 0, 1024);
            grad.addColorStop(0, 'rgba(255,255,255,0.06)');
            grad.addColorStop(0.5, 'rgba(0,0,0,0)');
            grad.addColorStop(1, 'rgba(0,0,0,0.1)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 1024, 1024);
            const tex = new THREE.CanvasTexture(c);
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            return tex;
        },

        copper() {
            const { c, ctx } = this.cv(512, 512);
            const grad = ctx.createLinearGradient(0, 0, 512, 0);
            grad.addColorStop(0, '#a9673f');
            grad.addColorStop(0.22, '#e0996b');
            grad.addColorStop(0.5, '#f0b587');
            grad.addColorStop(0.78, '#c67e50');
            grad.addColorStop(1, '#a9673f');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 512, 512);
            for (let i = 0; i < 400; i++) {
                ctx.fillStyle = `rgba(60,30,10,${Math.random() * 0.12})`;
                ctx.fillRect(Math.random() * 512, 0, Math.random() * 4 + 0.5, 512);
            }
            const tex = new THREE.CanvasTexture(c);
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            return tex;
        },

        ribbed(base = '#3a3d40', dark = '#1b1d1f', axis = 'y', count = 26) {
            const { c, ctx } = this.cv(256, 256);
            ctx.fillStyle = base;
            ctx.fillRect(0, 0, 256, 256);
            ctx.fillStyle = dark;
            const step = 256 / count;
            for (let i = 0; i < count; i++) {
                if (axis === 'y') ctx.fillRect(0, i * step, 256, step * 0.42);
                else ctx.fillRect(i * step, 0, step * 0.42, 256);
            }
            const tex = new THREE.CanvasTexture(c);
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            return tex;
        },

        fins() {
            const { c, ctx } = this.cv(256, 256);
            ctx.fillStyle = '#7c8085';
            ctx.fillRect(0, 0, 256, 256);
            for (let y = 0; y < 256; y += 10) {
                ctx.fillStyle = '#3d4043';
                ctx.fillRect(0, y, 256, 5);
                ctx.fillStyle = 'rgba(255,255,255,0.18)';
                ctx.fillRect(0, y + 5, 256, 1);
            }
            const tex = new THREE.CanvasTexture(c);
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(1, 3);
            return tex;
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

        powderCoat(color = '#e2e6e9') {
            const { c, ctx } = this.cv(512, 512);
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, 512, 512);
            for (let i = 0; i < 9000; i++) {
                ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.035})`;
                ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.6, 1.6);
            }
            const grad = ctx.createRadialGradient(256, 180, 50, 256, 256, 420);
            grad.addColorStop(0, 'rgba(255,255,255,0.25)');
            grad.addColorStop(1, 'rgba(0,0,0,0.06)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 512, 512);
            const tex = new THREE.CanvasTexture(c);
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            return tex;
        },

        pcb() {
            const { c, ctx } = this.cv(768, 384);
            ctx.fillStyle = '#0c3a26';
            ctx.fillRect(0, 0, 768, 384);
            ctx.strokeStyle = 'rgba(210,180,90,0.55)';
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
            ctx.fillStyle = '#555555';
            ctx.textAlign = 'center';
            ctx.font = '700 85px Golos Text, sans-serif';
            ctx.fillText('Vaillant', 256, 95);
            return new THREE.CanvasTexture(c);
        }
    };

    function initMaterials() {
        mats = {
            whitePlastic: new THREE.MeshStandardMaterial({ map: TextureGen.powderCoat('#e2e6e9'), roughness: 0.75, metalness: 0.05 }),
            panelPlastic: new THREE.MeshStandardMaterial({ color: 0xe4e8eb, roughness: 0.84, metalness: 0.03 }),
            darkMetal: new THREE.MeshStandardMaterial({ map: TextureGen.brushedMetal('#585c60'), roughness: 0.55, metalness: 0.75 }),
            silverMetal: new THREE.MeshStandardMaterial({ map: TextureGen.brushedMetal('#aeb4b9'), roughness: 0.35, metalness: 0.85 }),
            copper: new THREE.MeshStandardMaterial({ map: TextureGen.copper(), roughness: 0.28, metalness: 0.9 }),
            redVessel: new THREE.MeshStandardMaterial({ color: 0xb23a2f, map: TextureGen.powderCoat('#c94c3f'), roughness: 0.65, metalness: 0.15 }),
            pcb: new THREE.MeshStandardMaterial({ map: TextureGen.pcb(), roughness: 0.5, metalness: 0.1 }),
            glass: new THREE.MeshStandardMaterial({ map: TextureGen.brushedMetal('#cfd6da'), transparent: true, opacity: 0.28, roughness: 0.15, metalness: 0.4, depthWrite: false }),
            fins: new THREE.MeshStandardMaterial({ map: TextureGen.fins(), roughness: 0.5, metalness: 0.65 }),
            perforated: new THREE.MeshStandardMaterial({ map: TextureGen.perforated(), roughness: 0.6, metalness: 0.6 }),
            pump: new THREE.MeshStandardMaterial({ map: TextureGen.ribbed('#5a5e62', '#25282a', 'y', 24), roughness: 0.45, metalness: 0.7 }),
            logo: new THREE.MeshStandardMaterial({ map: TextureGen.logo(), transparent: true, roughness: 0.3 }),
            screen: new THREE.MeshStandardMaterial({ color: 0x5a7b8c, roughness: 0.2 }),
            seam: new THREE.MeshStandardMaterial({ color: 0xb0b5b9, roughness: 0.9 }),
            knob: new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.4, metalness: 0.1 })
        };
    }

    function applyEdges(mesh, angleThreshold = 18) {
        if (!mesh.geometry) return;
        const edgesGeo = new THREE.EdgesGeometry(mesh.geometry, angleThreshold);
        const edgesMat = new THREE.LineBasicMaterial({
            color: 0x111111,
            transparent: true,
            opacity: 0.92,
            depthTest: true
        });
        const edges = new THREE.LineSegments(edgesGeo, edgesMat);
        edges.renderOrder = (mesh.renderOrder || 0) + 1;
        mesh.add(edges);
    }

    function createLabelSprite(number, colorHex) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.arc(64, 64, 58, 0, Math.PI * 2);
        ctx.fillStyle = colorHex;
        ctx.fill();
        ctx.lineWidth = 6;
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.stroke();
        ctx.fillStyle = '#1e2025';
        ctx.font = '700 56px Golos Text, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(number), 64, 68);
        const tex = new THREE.CanvasTexture(canvas);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
        sprite.scale.set(1.6, 1.6, 1.6);
        sprite.renderOrder = 999;
        return sprite;
    }

    function addPart(geometry, material, basePos, explodeDir, name, meta) {
        const isInteractive = meta.interactive !== false;
        const mesh = new THREE.Mesh(geometry, material.clone());
        mesh.position.copy(basePos);
        mesh.castShadow = meta.castShadow !== false;
        mesh.receiveShadow = meta.receiveShadow !== false;
        if (meta.edges !== false) applyEdges(mesh);
        geometry.computeBoundingBox();
        const halfH = (geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2;
        mesh.userData = {
            name,
            category: BOILER_CATEGORIES[meta.category] ? meta.category : 'corpus',
            desc: meta.desc || '',
            basePos: basePos.clone(),
            explodeDir: explodeDir.clone(),
            isInteractive,
            originalEmissive: mesh.material.emissive ? mesh.material.emissive.clone() : new THREE.Color(0x000000)
        };
        if (isInteractive) {
            uiCounter++;
            mesh.userData.id = uiCounter;
            const catColor = BOILER_CATEGORIES[mesh.userData.category].color;
            const label = createLabelSprite(uiCounter, catColor);
            scene.add(label);
            mesh.userData.label = label;
            mesh.userData.labelOffset = halfH + 1.6;
            const leaderMat = new THREE.LineBasicMaterial({ color: catColor, transparent: true, opacity: 0.55, depthTest: false });
            const leader = new THREE.Line(new THREE.BufferGeometry().setFromPoints([mesh.position.clone(), mesh.position.clone()]), leaderMat);
            leader.renderOrder = 998;
            scene.add(leader);
            mesh.userData.leader = leader;
            interactiveParts.push(mesh);
        }
        scene.add(mesh);
        parts.push(mesh);
        return mesh;
    }

    function buildBoilerModel() {
        addPart(new THREE.BoxGeometry(15, 24, 1.4), mats.silverMetal, new THREE.Vector3(0, 0, -4), new THREE.Vector3(0, 0, -7), 'Несущее шасси', { category: 'corpus', desc: 'Оцинкованная стальная рама для крепления узлов.' });
        const vesselGeo = new THREE.CylinderGeometry(6, 6, 3, 32);
        vesselGeo.rotateX(Math.PI / 2);
        addPart(vesselGeo, mats.redVessel, new THREE.Vector3(0, 4, -2.5), new THREE.Vector3(0, 9, -13), 'Расширительный бак', { category: 'hydraulics', desc: 'Компенсирует расширение теплоносителя в системе.' });
        addPart(new THREE.BoxGeometry(11, 4.6, 6), mats.fins, new THREE.Vector3(0, 7, 1), new THREE.Vector3(0, 13, -2), 'Первичный теплообменник', { category: 'heat', desc: 'Снимает тепло с продуктов сгорания.' });
        addPart(new THREE.CylinderGeometry(0.3, 0.3, 10, 16), mats.copper, new THREE.Vector3(0, 7, 3), new THREE.Vector3(0, 13, 4), 'Змеевик', { interactive: false, castShadow: false });
        const fanGeo = new THREE.CylinderGeometry(2.7, 2.7, 2.2, 32);
        fanGeo.rotateX(Math.PI / 2);
        addPart(fanGeo, mats.darkMetal, new THREE.Vector3(3.5, 2, 3), new THREE.Vector3(9, 6, 9), 'Вентилятор дымоудаления', { category: 'vent', desc: 'Создаёт тягу для отвода газов.' });
        addPart(new THREE.BoxGeometry(9.5, 1.6, 4.5), mats.perforated, new THREE.Vector3(0, -1, 1), new THREE.Vector3(0, -3, 3), 'Модулируемая горелка', { category: 'combustion', desc: 'Распределяет пламя для равномерного нагрева.' });
        addPart(new THREE.BoxGeometry(11.5, 7, 6.5), mats.glass, new THREE.Vector3(0, 1.5, 1), new THREE.Vector3(0, 6, 8), 'Кожух', { interactive: false, castShadow: false, receiveShadow: false });
        const pumpGeo = new THREE.CylinderGeometry(1.8, 1.8, 3.6, 32);
        pumpGeo.rotateX(Math.PI / 2);
        addPart(pumpGeo, mats.pump, new THREE.Vector3(4.5, -6, 2), new THREE.Vector3(11, -5, 7), 'Циркуляционный насос', { category: 'hydraulics', desc: 'Обеспечивает циркуляцию теплоносителя.' });
        addPart(new THREE.BoxGeometry(3.1, 4, 3.1), mats.silverMetal, new THREE.Vector3(-4.5, -6.5, 1.5), new THREE.Vector3(-10.5, -5, 5), 'Газовый клапан', { category: 'combustion', desc: 'Дозирует подачу газа.' });
        addPart(new THREE.BoxGeometry(7, 2.1, 3), mats.fins, new THREE.Vector3(0, -5, -2), new THREE.Vector3(0, -10.5, -7), 'Вторичный теплообменник ГВС', { category: 'heat', desc: 'Греет проточную воду.' });
        addPart(new THREE.BoxGeometry(10, 1.5, 2), mats.silverMetal, new THREE.Vector3(0, -9, 1), new THREE.Vector3(0, -16, 2), 'Гидравлические подключения', { category: 'hydraulics', desc: 'Подвод труб отопления, воды и газа.' });
        addPart(new THREE.BoxGeometry(15, 5.6, 3), mats.pcb, new THREE.Vector3(0, -10, 4), new THREE.Vector3(0, -13, 13), 'Электронная плата', { category: 'electronics', desc: 'Управляет всеми процессами котла.' });

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
        const frontPanel = addPart(coverGeo, mats.panelPlastic, new THREE.Vector3(0, 0, 4.6), new THREE.Vector3(0, 0, 26), 'Лицевая панель', { category: 'corpus', desc: 'Внешний защитный кожух с панелью управления.' });
        frontPanel.renderOrder = 3;
        frontPanelPart = frontPanel;

        const seam = new THREE.Mesh(new THREE.BoxGeometry(15.7, 0.05, 5.5), mats.seam);
        seam.position.set(0, -4.5, 0);
        seam.castShadow = false;
        seam.receiveShadow = false;
        frontPanel.add(seam);
        applyEdges(seam);
        const bezel = new THREE.Mesh(new THREE.BoxGeometry(7, 4.5, 0.2), mats.panelPlastic);
        bezel.position.set(0, -9, 2.62);
        bezel.castShadow = false;
        bezel.receiveShadow = false;
        frontPanel.add(bezel);
        applyEdges(bezel);
        const lcd = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 0.1), mats.screen);
        lcd.position.set(0, -7.8, 2.72);
        lcd.castShadow = false;
        lcd.receiveShadow = false;
        frontPanel.add(lcd);
        applyEdges(lcd);
        const knobGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.4, 32);
        knobGeo.rotateX(Math.PI / 2);
        const knob = new THREE.Mesh(knobGeo, mats.knob);
        knob.position.set(0, -9.8, 2.72);
        knob.castShadow = false;
        knob.receiveShadow = false;
        frontPanel.add(knob);
        applyEdges(knob);
        const btnGeo = new THREE.BoxGeometry(0.6, 0.2, 0.1);
        const btn1 = new THREE.Mesh(btnGeo, mats.seam);
        btn1.position.set(-1, -8.7, 2.72);
        btn1.castShadow = false;
        btn1.receiveShadow = false;
        frontPanel.add(btn1);
        applyEdges(btn1);
        const btn2 = new THREE.Mesh(btnGeo, mats.seam);
        btn2.position.set(1, -8.7, 2.72);
        btn2.castShadow = false;
        btn2.receiveShadow = false;
        frontPanel.add(btn2);
        applyEdges(btn2);
        const logoMesh = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.25), mats.logo);
        logoMesh.position.set(0, -3, 2.68);
        logoMesh.castShadow = false;
        logoMesh.receiveShadow = false;
        frontPanel.add(logoMesh);
        applyEdges(logoMesh);

        updateFrontPanelAlpha(Math.max(0, 1 - explodeAmount * 1.4));
    }


    function updateFrontPanelAlpha(alpha) {
        if (!frontPanelPart || Math.abs(alpha - lastPanelAlpha) < 0.001) return;
        lastPanelAlpha = alpha;

        frontPanelPart.traverse((obj) => {
            if (!obj.material || obj.isLineSegments) return;
            if (obj.material.userData.baseOpacity === undefined) {
                obj.material.userData.baseOpacity = obj.material.opacity ?? 1;
            }
            const base = obj.material.userData.baseOpacity;
            if (alpha >= 0.995) {
                obj.material.transparent = base < 1;
                obj.material.opacity = base;
                obj.material.depthWrite = true;
            } else {
                obj.material.transparent = true;
                obj.material.opacity = alpha * base;
                obj.material.depthWrite = false;
            }
        });
    }

    function clearHover() {
        if (!hoveredPart) return;
        hoveredPart.material.emissive.copy(hoveredPart.userData.originalEmissive);
        hoveredPart = null;
        tooltip.style.display = 'none';
        wrapper.style.cursor = '';
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

    function animate() {
        if (!animating) return;
        requestAnimationFrame(animate);

        const lerpSpeed = options.reducedMotion ? 1 : 0.1;
        parts.forEach((part) => {
            if (part === frontPanelPart) {
                updateFrontPanelAlpha(Math.max(0, 1 - explodeAmount * 1.4));
            }
            const targetPos = part.userData.basePos.clone().add(part.userData.explodeDir.clone().multiplyScalar(explodeAmount));
            if (lerpSpeed === 1) part.position.copy(targetPos);
            else part.position.lerp(targetPos, lerpSpeed);

            if (part.userData.isInteractive && part.userData.label) {
                const labelPos = part.position.clone();
                labelPos.y += part.userData.labelOffset;
                part.userData.label.position.copy(labelPos);
                part.userData.label.visible = labelsVisible && explodeAmount > 0.04 && part.material.opacity !== 0;
                const linePositions = part.userData.leader.geometry.attributes.position;
                linePositions.setXYZ(0, part.position.x, part.position.y, part.position.z);
                linePositions.setXYZ(1, labelPos.x, labelPos.y - 0.3, labelPos.z);
                linePositions.needsUpdate = true;
                part.userData.leader.visible = part.userData.label.visible;
            }
        });

        if (pointerActive) {
            raycaster.setFromCamera(mouse, camera);
            const testableMeshes = interactiveParts.filter((p) => {
                if (p === frontPanelPart && lastPanelAlpha < 0.35) return false;
                return !p.material.transparent || p.material.opacity > 0.2;
            });
            const intersects = raycaster.intersectObjects(testableMeshes);
            if (intersects.length > 0) {
                const object = intersects[0].object;
                if (hoveredPart !== object) {
                    if (hoveredPart) hoveredPart.material.emissive.copy(hoveredPart.userData.originalEmissive);
                    hoveredPart = object;
                    hoveredPart.material.emissive.setHex(EMISSIVE_HOVER);
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

    function setupEvents() {
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (!width || !height) continue;
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            }
        });
        resizeObserver.observe(wrapper);

        if (slider && valEl) {
            slider.addEventListener('input', () => {
                explodeAmount = parseFloat(slider.value);
                valEl.textContent = `${Math.round(explodeAmount * 100)}%`;
                slider.style.background = `linear-gradient(to right, #F2A623 0%, #F2A623 ${explodeAmount * 100}%, rgba(255,255,255,0.14) ${explodeAmount * 100}%)`;
            });
            slider.dispatchEvent(new Event('input'));
        }

        labelsToggle?.addEventListener('click', () => {
            labelsVisible = !labelsVisible;
            labelsToggle.classList.toggle('is-active', labelsVisible);
            labelsToggle.setAttribute('aria-pressed', String(labelsVisible));
        });



        wrapper.addEventListener('mouseenter', () => {
            pointerActive = true;
        });

        wrapper.addEventListener('mouseleave', () => {
            pointerActive = false;
            mouse.set(-10, -10);
            clearHover();
        });

        wrapper.addEventListener('mousemove', (e) => {
            lastPointer.x = e.clientX;
            lastPointer.y = e.clientY;
            const rect = wrapper.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            if (tooltip.style.display === 'block') {
                updateTooltipPosition(e.clientX, e.clientY);
            }
        });


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

    function setupLighting(targetScene) {
        targetScene.add(new THREE.AmbientLight(0xfff6ef, 0.16));

        const keyLight = new THREE.DirectionalLight(0xfff9f4, 0.95);
        keyLight.position.set(24, 38, 30);
        keyLight.castShadow = true;

        const shadow = keyLight.shadow;
        shadow.mapSize.set(2048, 2048);
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

        const fillLight = new THREE.DirectionalLight(0xc5dbff, 0.2);
        fillLight.position.set(-26, 16, -14);
        targetScene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xffe2b8, 0.14);
        rimLight.position.set(-6, 8, 34);
        targetScene.add(rimLight);

        targetScene.add(new THREE.HemisphereLight(0xe6f0ff, 0x12141a, 0.18));
    }

    function setupGround(targetScene) {
        const groundGeo = new THREE.CircleGeometry(30, 56);
        groundGeo.rotateX(-Math.PI / 2);
        const ground = new THREE.Mesh(
            groundGeo,
            new THREE.ShadowMaterial({ color: 0x08090c, opacity: 0.42 })
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
                opacity: 0.9
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
    camera.position.set(38, 22, 54);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(initW, initH);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2(-10, -10);

    initMaterials();
    setupLighting(scene);
    setupGround(scene);

    buildBoilerModel();


    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !options.reducedMotion;
    controls.dampingFactor = 0.06;
    controls.target.set(0, -1, 2);
    controls.maxDistance = 110;
    controls.minDistance = 14;
    controls.maxPolarAngle = Math.PI * 0.92;

    setupEvents();
    animate();

    return {
        destroy() {
            animating = false;
            renderer.dispose();
        }
    };
}

window.initBoilerWidget = initBoilerWidget;
