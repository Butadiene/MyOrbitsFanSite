  import * as THREE from 'three';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
  import PLANETS from './planets.js';
  import { showDecor, hideDecor } from './decor.js';

  // キャラクター紹介文は任意の外部ファイル（characters.js）。
  // git管理外のため存在しないこともあるので、無ければ黙ってスキップする。
  let CHARACTER_DESCRIPTIONS = {};
  try {
    ({ CHARACTER_DESCRIPTIONS } = await import('./characters.js'));
  } catch (e) {
    console.info('characters.js が無いため、キャラクター紹介は非表示になります。');
  }


  // ----------------------------------------------------------------------
  // Canvas で惑星テクスチャを生成（外部画像に依存しない）
  // ----------------------------------------------------------------------
  function makePlanetTexture(planet, size = 512) {
    const c = document.createElement('canvas');
    c.width = size; c.height = size / 2;
    const ctx = c.getContext('2d');
    const [a, b, hi] = planet.colors;
    const w = c.width, h = c.height;

    // ベースの縦グラデーション
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, b); g.addColorStop(0.5, a); g.addColorStop(1, b);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

    const rand = mulberry(planet.key.length * 99 + planet.distance);

    if (planet.texture === 'gas' || planet.texture === 'cloudy') {
      // 横縞模様
      for (let i = 0; i < 26; i++) {
        const y = rand() * h;
        const bh = 4 + rand() * 16;
        ctx.fillStyle = shade([a, b, hi][Math.floor(rand() * 3)], (rand() - 0.5) * 40);
        ctx.globalAlpha = 0.55;
        ctx.fillRect(0, y, w, bh);
      }
      ctx.globalAlpha = 1;
    } else if (planet.texture === 'earth') {
      // 大陸風のブロブ
      ctx.fillStyle = planet.colors[1];
      for (let i = 0; i < 28; i++) {
        ctx.globalAlpha = 0.85;
        blob(ctx, rand() * w, rand() * h, 12 + rand() * 50, rand);
      }
      ctx.globalAlpha = 1;
    } else if (planet.texture === 'ice') {
      for (let i = 0; i < 14; i++) {
        const y = rand() * h;
        ctx.fillStyle = shade(hi, (rand() - 0.5) * 24);
        ctx.globalAlpha = 0.35;
        ctx.fillRect(0, y, w, 3 + rand() * 8);
      }
      ctx.globalAlpha = 1;
    } else {
      // 岩石：クレーターと斑点
      for (let i = 0; i < 260; i++) {
        const x = rand() * w, y = rand() * h, r = rand() * 6 + 1;
        ctx.fillStyle = shade(a, (rand() - 0.5) * 60);
        ctx.globalAlpha = 0.5;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    return c;
  }

  function blob(ctx, x, y, r, rand) {
    ctx.beginPath();
    const pts = 8;
    for (let i = 0; i <= pts; i++) {
      const ang = (i / pts) * Math.PI * 2;
      const rr = r * (0.6 + rand() * 0.7);
      const px = x + Math.cos(ang) * rr, py = y + Math.sin(ang) * rr * 0.7;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
  }

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return `rgb(${r|0},${g|0},${b|0})`;
  }
  function mulberry(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ----------------------------------------------------------------------
  // Three.js シーン構築
  // ----------------------------------------------------------------------
  const app = document.getElementById('app');
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 5000);
  camera.position.set(0, 110, 260);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  app.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 30;
  controls.maxDistance = 900;

  // テクスチャ読み込み（用意された equirectangular マップ）
  const TEX_DIR = 'textures/ssc/';   // Solar System Scope（CC BY 4.0）
  // 読み込みの進捗を「太陽系を生成中…」に表示し、全テクスチャ完了で自動的に隠す
  const loadingEl = document.getElementById('loading');
  const loadingManager = new THREE.LoadingManager();
  loadingManager.onProgress = (url, loaded, total) => {
    const pct = total ? Math.round((loaded / total) * 100) : 0;
    loadingEl.textContent = `太陽系を生成中… ${pct}%`;
  };
  loadingManager.onLoad = () => loadingEl.classList.add('hide');
  const texLoader = new THREE.TextureLoader(loadingManager);
  function loadTex(file, { srgb = true } = {}) {
    // スラッシュを含む場合はそのままのパス、含まない場合は既定フォルダ配下とみなす
    const path = file.includes('/') ? file : TEX_DIR + file;
    const t = texLoader.load(path);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  }

  // 天体の表面マテリアル：用意されたテクスチャがあれば使い、無ければ手描きにフォールバック
  //   map     … フルカラーのテクスチャをそのまま使う
  //   tintMap … モノクロのテクスチャを「模様」として使い、天体の色（colors[0]）で着色する
  function bodyMaterial(data, roughness) {
    const opts = { roughness, metalness: 0.04 };
    let map;
    if (data.tintMap) {
      // モノクロの模様 × 天体色 → 色はそのままに模様だけ反映
      map = loadTex(data.tintMap);
      opts.color = new THREE.Color(data.colors ? data.colors[0] : 0xffffff);
    } else if (data.map) {
      map = loadTex(data.map);
    } else {
      map = new THREE.CanvasTexture(makePlanetTexture(data, 256));
      map.colorSpace = THREE.SRGBColorSpace;
    }
    opts.map = map;
    // ノーマルマップ（地球など）— 凹凸の陰影を付ける。色ではないので非sRGBで読み込む。
    if (data.normalMap) {
      opts.normalMap = loadTex(data.normalMap, { srgb: false });
      opts.normalScale = new THREE.Vector2(0.8, 0.8);
    }
    data._tex = map;   // ポップアップのプレビュー描画に流用
    return new THREE.MeshStandardMaterial(opts);
  }

  // 星空の背景
  function makeStars() {
    const geo = new THREE.BufferGeometry();
    const n = 2500, pos = new Float32Array(n * 3);
    const rand = mulberry(7);
    for (let i = 0; i < n; i++) {
      const r = 800 + rand() * 1500;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i*3+2] = r * Math.cos(phi);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: true });
    return new THREE.Points(geo, mat);
  }
  const starField = makeStars();
  scene.add(starField);

  // 太陽
  const sunTex = loadTex('sun.jpg');
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(12, 48, 48),
    new THREE.MeshBasicMaterial({ map: sunTex })
  );
  // 太陽もクリックで詳細を表示できるようにデータを持たせる
  const SUN = {
    key: 'sun', name: '太陽', en: 'Sun', star: true,
    colors: ['#ff9b2e', '#e07a12', '#ffd27a'],   // 左キャラの英字色などに使うオレンジ
    subtitle: '太陽系の中心に輝く恒星',
    desc: '太陽系の質量の99.8%以上を占める、自ら輝く恒星です。中心部では水素がヘリウムに変わる核融合が起こり、莫大なエネルギーを生み出しています。その重力がすべての惑星をつなぎとめ、光と熱が地球の生命を支えています。',
    facts: { '直径': '1,392,000 km', '表面温度': '約 5,500 ℃', '中心温度': '約 1,500 万℃', '分類': 'G型主系列星' },
    character: 'character_images/sun.png',
    _photo: 'nasa_planets_images/sun.jpg',
    _mesh: sun, _tex: sunTex
  };
  sun.userData.planet = SUN;
  scene.add(sun);

  scene.add(new THREE.AmbientLight(0xffffff, 0.18));
  const sunLight = new THREE.PointLight(0xffffff, 2.6, 0, 0.0);
  scene.add(sunLight);

  // 惑星と軌道を生成
  const orbitLines = [];
  const labels = [];
  const planetMeshes = [];
  const selectables = [sun]; // クリック・ホバー対象（太陽＋惑星＋衛星）
  const moonGroups = [];    // 惑星ごとの衛星のまとまり
  const moonLabels = [];    // 衛星名ラベル（位置追従用）
  const cloudLayers = [];   // 雲・大気レイヤー（オンオフ用）

  // ポップアップの惑星側に使う NASA 写真（パブリックドメイン）。用意のある天体のみ。
  const NASA_PHOTO_KEYS = new Set(['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']);

  // 扁平率 f =（赤道半径−極半径）/ 赤道半径（実測値）。自転軸方向に潰して回転楕円体にする。
  // ガス惑星は大きく潰れ、岩石惑星はほぼ真球（＝物理的に正しい見た目）。
  const FLATTENING = {
    mercury: 0.0009, venus: 0.0, earth: 0.00335, mars: 0.00589,
    jupiter: 0.06487, saturn: 0.09796, uranus: 0.02293, neptune: 0.01708, pluto: 0.0,
  };

  // 実スケール距離用：太陽からの平均距離（天文単位 AU）。表示単位への換算係数が AU_SCALE。
  // 係数は「水星が太陽（半径12）にめり込まない」値を基準にしている（0.387AU×36≈13.9）。
  const DIST_AU = {
    mercury: 0.387, venus: 0.723, earth: 1.0, mars: 1.524,
    jupiter: 5.203, saturn: 9.537, uranus: 19.191, neptune: 30.07, pluto: 39.48,
  };
  const AU_SCALE = 36;

  PLANETS.forEach((p) => {
    // イメージキャラクター（character_images/<key>.png）。無ければ openPopup 側で自動的に畳む。
    p.character = `character_images/${p.key}.png`;
    // NASA 写真があれば、ポップアップではそれを惑星画像として使う
    if (NASA_PHOTO_KEYS.has(p.key)) p._photo = `nasa_planets_images/${p.key}.jpg`;
    // 公転面の傾き（黄道に対する軌道傾斜角）を表すグループ。
    // 軌道線・惑星のピボットをまとめて傾けることで、軌道ごと斜めになる。
    // node（昇交点の向き）を惑星ごとに変えて、傾く方向もばらつかせる。
    const orbitPlane = new THREE.Object3D();
    orbitPlane.rotation.order = 'YXZ';
    orbitPlane.rotation.y = mulberry(Math.round(p.distance) * 7 + 1)() * Math.PI * 2;
    orbitPlane.rotation.x = THREE.MathUtils.degToRad(p.incl || 0);
    scene.add(orbitPlane);

    // 公転の中心となるピボット
    const pivot = new THREE.Object3D();
    orbitPlane.add(pivot);

    // 公転で動く位置だけを担うグループ（pivot と一緒に公転して軌道上に並ぶ）。
    // 毎フレーム公転分を打ち消す逆回転(rotation.y)を入れ、地軸の向きを空間に固定する。
    // （これをしないと地軸が公転と一緒に回り、常に同じ季節になってしまう）
    const posGroup = new THREE.Object3D();
    posGroup.position.x = p.distance;
    pivot.add(posGroup);

    // 地軸の傾きを表すグループ（向きは空間に固定される）
    const tiltGroup = new THREE.Object3D();
    tiltGroup.rotation.z = THREE.MathUtils.degToRad(p.tilt || 0);
    posGroup.add(tiltGroup);

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(p.size, 48, 48),
      bodyMaterial(p, 0.85)
    );
    mesh.userData.planet = p;
    // 扁平率を自転軸（ローカルY）方向のスケールで反映（雲・大気レイヤーも一緒に潰れる）
    mesh.scale.y = 1 - (FLATTENING[p.key] || 0);
    tiltGroup.add(mesh);          // 傾いた軸のまわりで自転する
    planetMeshes.push(mesh);
    selectables.push(mesh);

    // 雲・大気レイヤー（金星＝不透明な大気 / 地球＝半透明の雲）。オンオフ可能。
    if (p.cloud) {
      const cl = p.cloud;
      let cmat;
      if (cl.opaque) {
        // 金星：分厚い大気が地表を覆い隠す
        cmat = new THREE.MeshStandardMaterial({ map: loadTex(cl.map), roughness: 1, metalness: 0 });
      } else {
        // 地球：白い雲を半透明に重ねる（雲テクスチャの明度をそのまま不透明度に使う）
        cmat = new THREE.MeshStandardMaterial({
          color: 0xffffff, alphaMap: loadTex(cl.map, { srgb: false }),
          transparent: true, depthWrite: false, opacity: 0.9, roughness: 1
        });
      }
      const cloud = new THREE.Mesh(new THREE.SphereGeometry(p.size * (cl.scale || 1.02), 48, 48), cmat);
      mesh.add(cloud);            // 惑星と一緒に自転・傾斜する
      cloudLayers.push(cloud);
      p._cloud = cloud;
    }

    // 環（土星・天王星）— 惑星の赤道面に沿う。
    // 天王星は地軸が約98°傾いているため、環はほぼ縦向きに見える。
    if (p.ring) {
      // 内外半径の比（惑星半径に対する倍率）。プレビュー描画でも使うので保持する。
      p._ringInner = p.key === 'saturn' ? 1.2 : 1.78;
      p._ringOuter = p.key === 'saturn' ? 2.3 : 1.98;
      const inner = p.size * p._ringInner;
      const outer = p.size * p._ringOuter;
      const rgeo = new THREE.RingGeometry(inner, outer, 160);
      // UV を半径方向に貼り直す（リングのテクスチャ＝内→外のグラデーション帯を正しく巻く）
      const rpos = rgeo.attributes.position, ruv = rgeo.attributes.uv, rv = new THREE.Vector3();
      for (let i = 0; i < rpos.count; i++) {
        rv.fromBufferAttribute(rpos, i);
        ruv.setXY(i, (rv.length() - inner) / (outer - inner), 0.5);
      }
      // ポップアップのプレビューでも同じテクスチャを使えるよう惑星に保持しておく
      if (p.ringTex) p._ringTex = loadTex(p.ringTex);
      const ringMat = p.ringTex
        ? new THREE.MeshBasicMaterial({ map: p._ringTex, side: THREE.DoubleSide, transparent: true })
        : new THREE.MeshBasicMaterial({ color: 0x8fc7cf, side: THREE.DoubleSide, transparent: true, opacity: 0.38 });
      const ring = new THREE.Mesh(rgeo, ringMat);
      ring.rotation.x = Math.PI / 2;   // 赤道面に正確に合わせる
      tiltGroup.add(ring);             // 傾きはグループ側が担う
    }

    // 衛星（普段は非表示。親惑星にフォーカスしたときだけ表示してごちゃつきを防ぐ）
    const group = { planet: p, meshes: [], orbits: [], labels: [] };
    if (p.moons) {
      p.moons.forEach((m) => {
        m.isMoon = true;
        m.parent = p;
        // 月・カロンは親（地球・冥王星）のキャラ絵に一緒に描かれているので、
        // これらの衛星を選んだときは親のキャラ絵を表示する。
        if (m.key === 'moon' || m.key === 'charon') m.character = p.character;

        // 軌道の基準面：黄道に近い衛星（月など）は黄道面（posGroup＝地軸傾斜を受けない面）、
        // それ以外は親惑星の赤道面（tiltGroup＝地軸の傾きを共有）。
        const mRef = (m.refPlane === 'ecliptic') ? posGroup : tiltGroup;
        // 衛星ごとの軌道傾斜（基準面に対する incl 度）。昇交点の向きは見栄え用に少し散らす。
        const mOrbit = new THREE.Object3D();
        mOrbit.rotation.order = 'YXZ';
        mOrbit.rotation.y = mulberry(m.key.length * 5 + 3)() * Math.PI * 2;
        mOrbit.rotation.x = THREE.MathUtils.degToRad(m.incl || 0);
        mRef.add(mOrbit);

        // 衛星の公転ピボット（傾けた軌道面の上で回る）
        const mPivot = new THREE.Object3D();
        mPivot.rotation.y = mulberry(m.key.length * 13 + m.distance)() * Math.PI * 2;
        mOrbit.add(mPivot);

        const mmesh = new THREE.Mesh(
          new THREE.SphereGeometry(m.size, 32, 32),
          bodyMaterial(m, 0.95)
        );
        mmesh.position.x = m.distance;
        // 潮汐ロック：常に同じ面（表側）を母惑星へ向ける。
        // テクスチャの中心（表側）は球の +X 側に来るが、それは母惑星と反対を向くため
        // 180°回して表側を母惑星側へ向ける。
        mmesh.rotation.y = Math.PI;
        mmesh.userData.planet = m;
        mPivot.add(mmesh);
        selectables.push(mmesh);

        // 衛星の軌道線
        const og = new THREE.BufferGeometry();
        const mpts = [];
        for (let i = 0; i <= 80; i++) {
          const a = (i / 80) * Math.PI * 2;
          mpts.push(Math.cos(a) * m.distance, 0, Math.sin(a) * m.distance);
        }
        og.setAttribute('position', new THREE.Float32BufferAttribute(mpts, 3));
        const oline = new THREE.Line(og, new THREE.LineBasicMaterial({ color: 0x70839f, transparent: true, opacity: 0.45 }));
        mOrbit.add(oline);   // 軌道線も傾いた軌道面に合わせる

        // 衛星名ラベル（惑星より小さめ）
        const mlabel = makeLabel(m.name, { font: 22, scale: [9, 2.25], color: '#dfe7f2' });
        mlabel.userData.mesh = mmesh;
        scene.add(mlabel);
        moonLabels.push(mlabel);

        m._pivot = mPivot;
        m._mesh = mmesh;

        group.meshes.push(mmesh);
        group.orbits.push(oline);
        group.labels.push(mlabel);
      });
    }
    moonGroups.push(group);

    // 軌道線
    const orbitGeo = new THREE.BufferGeometry();
    const seg = 128, pts = [];
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      pts.push(Math.cos(a) * p.distance, 0, Math.sin(a) * p.distance);
    }
    orbitGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const orbit = new THREE.Line(orbitGeo, new THREE.LineBasicMaterial({ color: 0x3a567f, transparent: true, opacity: 0.5 }));
    orbitPlane.add(orbit);   // 軌道線も公転面と一緒に傾く
    orbitLines.push(orbit);

    // 名前ラベル（スプライト）
    const label = makeLabel(p.name);
    label.userData.mesh = mesh;
    scene.add(label);
    labels.push(label);

    // ランダムな初期角度
    pivot.rotation.y = mulberry(p.distance)() * Math.PI * 2;
    posGroup.rotation.y = -pivot.rotation.y;   // 公転を打ち消して地軸を空間に固定
    p._pivot = pivot;
    p._posGroup = posGroup;
    p._mesh = mesh;
    // 「現在の配置」モードと様式化レイアウトを行き来できるよう、参照と初期姿勢を保存
    p._orbitPlane = orbitPlane;
    p._tiltGroup = tiltGroup;
    p._stylizedOrbitQuat = orbitPlane.quaternion.clone();
    p._stylizedTiltQuat = tiltGroup.quaternion.clone();
    // 距離スケール切替用：表示距離・実スケール距離・軌道線の参照を保存
    p._orbitLine = orbit;
    p._displayDist = p.distance;
    p._realDist = (DIST_AU[p.key] || (p.distance / 60)) * AU_SCALE;
  });

  function makeLabel(text, opts = {}) {
    const fs = opts.font || 30;
    const color = opts.color || '#cfe0f5';
    const c = document.createElement('canvas');
    c.width = 256; c.height = 64;
    const ctx = c.getContext('2d');
    ctx.font = `600 ${fs}px "Hiragino Sans","Noto Sans JP",sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 6;
    ctx.fillText(text, 128, 32);
    const tex = new THREE.CanvasTexture(c);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    const sc = opts.scale || [16, 4];
    sp.scale.set(sc[0], sc[1], 1);
    return sp;
  }

  // ----------------------------------------------------------------------
  // インタラクション：クリック / ホバー
  // ----------------------------------------------------------------------
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const tooltip = document.getElementById('tooltip');
  let hovered = null;

  function setPointer(e) {
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / innerHeight) * 2 + 1;
  }

  // 近接ピック用の作業ベクトル（毎フレームの確保を避けて使い回す）
  const _wp = new THREE.Vector3();
  const _edge = new THREE.Vector3();
  const _camRight = new THREE.Vector3();
  const _proj = new THREE.Vector3();
  function projectToScreen(v) {
    _proj.copy(v).project(camera);
    return { x: (_proj.x * 0.5 + 0.5) * innerWidth, y: (-_proj.y * 0.5 + 0.5) * innerHeight, behind: _proj.z > 1 };
  }

  // カーソル位置の天体を拾う。まず正確なレイ判定、外れたら画面上の近接でも拾う。
  // 小さな天体や少し外したときでも、付近にマウスを添えれば選べるようにする。
  const PICK_PAD = 14;       // 見かけの半径に上乗せする余白(px)
  const PICK_MIN_R = 16;     // 最小の当たり半径(px)。極小の天体でもこの大きさは確保する
  function pickSelectable(e) {
    setPointer(e);
    raycaster.setFromCamera(mouse, camera);
    const hit = raycaster.intersectObjects(selectables, false).find(h => h.object.visible);
    if (hit) return hit.object;

    _camRight.setFromMatrixColumn(camera.matrixWorld, 0); // カメラの右方向（ワールド）
    let best = null, bestDist = Infinity;
    for (const obj of selectables) {
      if (!obj.visible) continue;
      obj.getWorldPosition(_wp);
      const c = projectToScreen(_wp);
      if (c.behind) continue;
      // 天体の見かけの半径(px)を、中心と「半径ぶん横にずらした点」の画面距離から求める
      if (!obj.geometry.boundingSphere) obj.geometry.computeBoundingSphere();
      const r = obj.geometry.boundingSphere.radius;
      _edge.copy(_wp).addScaledVector(_camRight, r);
      const ec = projectToScreen(_edge);
      const rpx = Math.hypot(ec.x - c.x, ec.y - c.y);
      const threshold = Math.max(rpx + PICK_PAD, PICK_MIN_R);
      const dist = Math.hypot(e.clientX - c.x, e.clientY - c.y);
      if (dist <= threshold && dist < bestDist) { bestDist = dist; best = obj; }
    }
    return best;
  }

  renderer.domElement.addEventListener('pointermove', (e) => {
    const hitObj = pickSelectable(e);
    if (hitObj) {
      hovered = hitObj;
      renderer.domElement.style.cursor = 'pointer';
      tooltip.textContent = hovered.userData.planet.name;
      tooltip.style.left = e.clientX + 'px';
      tooltip.style.top = e.clientY + 'px';
      tooltip.style.opacity = '1';
    } else {
      hovered = null;
      renderer.domElement.style.cursor = 'grab';
      tooltip.style.opacity = '0';
    }
  });

  // クリック（ドラッグと区別するため移動量をチェック）
  let downPos = null;
  renderer.domElement.addEventListener('pointerdown', (e) => { downPos = { x: e.clientX, y: e.clientY }; });
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!downPos) return;
    const moved = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
    downPos = null;
    if (moved > 6) return; // ドラッグなので無視
    const hitObj = pickSelectable(e);
    if (hitObj) {
      openPopup(hitObj.userData.planet);
    } else if (popup.classList.contains('show')) {
      // 何もないところをクリック（ドラッグではない）→ ポップアップを閉じてフォーカス解除
      focusTarget = null;
      activePlanet = null;
      updateMoonVisibility();
      closePopup();
    }
  });

  // ----------------------------------------------------------------------
  // ポップアップ
  // ----------------------------------------------------------------------
  const popup = document.getElementById('popup');
  const popupCanvas = popup.querySelector('canvas.planet-img');
  const popupPhoto = popup.querySelector('img.planet-photo');
  const popupChar = popup.querySelector('img.char-img');
  const popupPreview = popup.querySelector('.preview');
  // キャラクター画像が無い（git管理外）場合は枠を畳んで通常表示に戻す
  popupChar.onerror = () => { popupChar.removeAttribute('src'); popupPreview.classList.remove('has-character', 'has-char-img'); };

  // 惑星選択時の左側の大きな立ち絵＋名前表示（PC のみ）は decor.js が担当する。

  // ポップアップに天体の内容を流し込んで表示状態にする（フェード制御は openPopup 側）
  // 画像の差し替えは、新しい画像のデコード完了を待ってからフェードインする。
  // （待たずに src を変えると、デコードが終わるまで前の画像が表示され続け、
  //   フェードイン後にパッと切り替わってしまうため。）
  async function fillPopup(p) {
    const seq = ++openSeq;

    popup.querySelector('h2').textContent = `${p.name}（${p.en}）`;
    popup.querySelector('.subtitle').textContent = p.subtitle;
    popup.querySelector('p').textContent = p.desc;
    popup.querySelector('.badge').textContent = p.isMoon
      ? `MOON · ${p.parent.name}の衛星`
      : (p.star ? 'STAR' : (p.dwarf ? 'DWARF PLANET' : 'PLANET'));

    const facts = popup.querySelector('.facts');
    facts.innerHTML = '';
    for (const [k, v] of Object.entries(p.facts)) {
      const d = document.createElement('div');
      d.innerHTML = `<span class="label">${k}</span><span class="value">${v}</span>`;
      facts.appendChild(d);
    }

    // キャラクター紹介文（characters.js にまとめてある。用意されている天体のみ表示）
    const charDescBox = popup.querySelector('.char-desc');
    const charEntry = CHARACTER_DESCRIPTIONS[p.key];
    // 文字列だけの旧形式と、{ desc, quote } の新形式の両方に対応する
    const charDesc = typeof charEntry === 'string' ? charEntry : (charEntry && charEntry.desc);
    const charQuote = (charEntry && typeof charEntry === 'object') ? (charEntry.quote || '') : '';
    if (charDesc) {
      popup.querySelector('.cd-text').textContent = charDesc;
      popup.querySelector('.cd-quote').textContent = charQuote;
      charDescBox.classList.add('show');
    } else {
      charDescBox.classList.remove('show');
    }

    // 惑星の絵：NASA 写真があればそれを使い、無ければ球体プレビューを描く。
    // 写真は decode 完了を待ってから表示し、フェードイン後のチラ見え・差し替えを防ぐ。
    let photoReady = false;
    if (p._photo) {
      popupPhoto.alt = `${p.name}（${p.en}）`;
      popupPhoto.src = p._photo;
      try { await popupPhoto.decode(); photoReady = true; } catch { photoReady = false; }
    }
    if (!photoReady) {
      popupPhoto.removeAttribute('src');
      drawPlanetPreview(popupCanvas, p);   // 火星・太陽・衛星など写真が無い天体
    }

    // イメージキャラクター画像（ポップアップ内の小さい立ち絵。用意されている惑星のみ）。
    // src を差し替えたら decode() の完了を待つ（失敗時も先へ進む）。
    let charReady = false;
    if (p.character) {
      popupChar.alt = `${p.name}のイメージキャラクター`;
      popupChar.src = p.character;
      try { await popupChar.decode(); charReady = true; } catch { charReady = false; }
    } else {
      popupChar.removeAttribute('src');
      popupChar.alt = '';
    }

    // 待っている間に別の天体が選び直されていたら、この呼び出しは破棄する
    if (seq !== openSeq) return;

    // プレビューのレイアウト：
    //  写真あり → has-photo（写真を全面に敷きキャラを右に重ねる）
    //  写真なし＋キャラ → has-character（円形プレビュー＋キャラ横並び）
    popupPreview.classList.toggle('has-photo', photoReady);
    popupPreview.classList.toggle('has-character', !photoReady && charReady);
    popupPreview.classList.toggle('has-char-img', charReady);

    // 左の大きな立ち絵＋名前（PCのみ・decor.js が表示/アニメを担当）
    showDecor(p);

    popup.classList.add('show');
  }

  // 表示中の天体を覚えておき、別の天体に切り替えるときはフェードアウト→差し替え→フェードインする
  let shownKey = null;
  let swapTimer = null;
  let openSeq = 0;   // fillPopup の世代番号（画像デコード待ち中の追い越し検出用）
  function openPopup(p) {
    // カメラ寄せと衛星表示はフェードを待たずに即座に反映する
    activePlanet = p.isMoon ? p.parent : p;
    updateMoonVisibility();
    focusPlanet(p.isMoon ? p.parent : p);

    if (popup.classList.contains('show') && shownKey !== p.key) {
      // すでに別の天体を表示中：一度フェードアウトしてから新しい内容でフェードインする
      popup.classList.remove('show');
      hideDecor();
      clearTimeout(swapTimer);
      swapTimer = setTimeout(() => fillPopup(p), 400);
    } else {
      // 非表示から、または同じ天体の再選択：そのままフェードイン
      clearTimeout(swapTimer);
      fillPopup(p);
    }
    shownKey = p.key;
  }

  function drawPlanetPreview(canvas, p) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height, cx = W/2, cy = H/2;
    // リングを持つ惑星は、環（本体の最大約2.3倍）が収まるよう本体を小さめに描く
    const R = W * (p.ring ? 0.20 : 0.45);
    ctx.clearRect(0, 0, W, H);

    // 本体：円にクリップしてテクスチャ＋陰影を描く（ほぼディフューズ：白ハイライトは最小限）
    function drawBody() {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2); ctx.clip();
      const img = p._tex && p._tex.image;
      if (img && img.complete && img.width) {
        const s = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, cx - R, cy - R, R*2, R*2);
        // モノクロの模様テクスチャは天体色で着色（3D表示と合わせる）
        if (p.tintMap && p.colors) {
          ctx.save();
          ctx.globalCompositeOperation = 'multiply';
          ctx.fillStyle = p.colors[0];
          ctx.fillRect(cx - R, cy - R, R*2, R*2);
          ctx.restore();
        }
      } else {
        ctx.drawImage(makePlanetTexture(p, 600), cx - R, cy - R, R*2, R*2);
      }
      // 太陽はエミッション（自己発光）。ビューワーの MeshBasicMaterial と同じく
      // 陰影を付けずテクスチャをフル輝度で見せる。惑星は球体のディフューズ陰影を付ける。
      if (!p.star) {
        const sh = ctx.createRadialGradient(cx - R*0.35, cy - R*0.35, R*0.2, cx, cy, R*1.15);
        sh.addColorStop(0, 'rgba(255,255,255,0.04)');
        sh.addColorStop(0.5, 'rgba(0,0,0,0)');
        sh.addColorStop(1, 'rgba(0,0,0,0.55)');
        ctx.fillStyle = sh; ctx.fillRect(cx - R, cy - R, R*2, R*2);
      }
      ctx.restore();

      // 太陽の発光（縁の外側ににじむグロー）。加算合成で「輝き」を表現する。
      if (p.star) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(cx, cy, R*0.6, cx, cy, R*1.5);
        g.addColorStop(0, 'rgba(255,221,150,0)');
        g.addColorStop(0.66, 'rgba(255,210,130,0.45)');
        g.addColorStop(1, 'rgba(255,170,70,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, R*1.5, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      }
    }

    // リングが無ければ本体だけ描いて終わり
    if (!p.ring) { drawBody(); return; }

    // ---- 環：3D と同じテクスチャ(saturn_ring.png)を使う ----
    // テクスチャは内→外の帯（U = 内縁→外縁）。中央1行を読み取り、
    // 「半径で色が決まる」性質を半径方向グラデーションに変換して描く（透明な隙間も再現）。
    const tiltRad = THREE.MathUtils.degToRad(p.tilt || 0);
    const squash = 0.32;                          // 見込み角による縦方向の圧縮
    const innerR = R * (p._ringInner || 1.2);
    const outerR = R * (p._ringOuter || 2.3);

    let ringFill = null;
    const rtex = p._ringTex && p._ringTex.image;
    if (rtex && rtex.complete && rtex.width) {
      try {
        const tmp = document.createElement('canvas');
        tmp.width = rtex.width; tmp.height = 1;
        const tctx = tmp.getContext('2d');
        tctx.drawImage(rtex, 0, rtex.height >> 1, rtex.width, 1, 0, 0, rtex.width, 1);
        const data = tctx.getImageData(0, 0, rtex.width, 1).data;
        // ローカル座標(0,0)中心で作る。実際の位置・圧縮は描画時の変換で行う。
        const grad = ctx.createRadialGradient(0, 0, innerR, 0, 0, outerR);
        const N = 48;
        for (let i = 0; i <= N; i++) {
          const u = i / N;
          const o = Math.min(rtex.width - 1, (u * (rtex.width - 1)) | 0) * 4;
          grad.addColorStop(u, `rgba(${data[o]},${data[o+1]},${data[o+2]},${data[o+3] / 255})`);
        }
        ringFill = grad;
      } catch (e) { ringFill = null; }
    }
    if (!ringFill) {
      // フォールバック（テクスチャ未読込・取得失敗時）：単色の半透明リング
      ringFill = p.key === 'saturn' ? 'rgba(216,199,154,0.7)' : 'rgba(159,212,216,0.5)';
    }

    // 環を描く。half='back'（奥side）/'front'（手前side）/'full'。
    // ローカル y の符号で奥・手前を分け、本体をはさんで描くことで前後関係を出す。
    function drawRing(half) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(tiltRad);
      if (half !== 'full') {
        ctx.beginPath();
        if (half === 'back') ctx.rect(-W, -H, W * 2, H);  // ローカル y < 0（奥）
        else                 ctx.rect(-W, 0, W * 2, H);   // ローカル y > 0（手前）
        ctx.clip();
      }
      ctx.scale(1, squash);
      ctx.fillStyle = ringFill;
      ctx.beginPath();
      ctx.arc(0, 0, outerR, 0, Math.PI * 2);
      ctx.arc(0, 0, innerR, 0, Math.PI * 2);
      ctx.fill('evenodd');
      ctx.restore();
    }

    drawRing('back');   // 奥側のリング（本体の後ろ）
    drawBody();         // 本体
    drawRing('front');  // 手前側のリング（本体の前）
  }

  function closePopup() {
    clearTimeout(swapTimer);
    openSeq++;            // デコード待ち中の fillPopup を無効化し、閉じた後の再表示を防ぐ
    shownKey = null;
    popup.classList.remove('show');
    hideDecor();
  }
  popup.querySelector('.close').addEventListener('click', closePopup);
  popup.querySelector('.close-mobile').addEventListener('click', closePopup);  // スマホ用の閉じるボタン

  // 選択した惑星にカメラを寄せる
  let focusTarget = null;
  function focusPlanet(p) { focusTarget = p._mesh; }

  // 衛星の表示制御：アクティブな惑星の衛星だけを見せる
  let activePlanet = null;
  function updateMoonVisibility() {
    moonGroups.forEach((g) => {
      const on = moonsEnabled && g.planet === activePlanet;
      g.meshes.forEach(x => x.visible = on);
      g.orbits.forEach(x => x.visible = on && showOrbits);
      g.labels.forEach(x => x.visible = on && showLabels);
    });
  }

  // ----------------------------------------------------------------------
  // コントロールボタン
  // ----------------------------------------------------------------------
  let paused = false, showOrbits = true, showLabels = true, moonsEnabled = true, showClouds = true;
  let speedFactor = 1;  // 公転・自転スピードの倍率（スライダーで調整）
  const btnPause = document.getElementById('btn-pause');
  const btnOrbits = document.getElementById('btn-orbits');
  const btnLabels = document.getElementById('btn-labels');
  const btnMoons = document.getElementById('btn-moons');
  const btnClouds = document.getElementById('btn-clouds');

  btnPause.onclick = () => {
    paused = !paused;
    btnPause.textContent = paused ? '▶ 再生' : '⏸ 一時停止';
    btnPause.classList.toggle('active', paused);
  };
  btnOrbits.onclick = () => {
    showOrbits = !showOrbits;
    orbitLines.forEach(o => o.visible = showOrbits);
    btnOrbits.classList.toggle('active', showOrbits);
    updateMoonVisibility();
  };
  btnLabels.onclick = () => {
    showLabels = !showLabels;
    labels.forEach(l => l.visible = showLabels);
    btnLabels.classList.toggle('active', showLabels);
    updateMoonVisibility();
  };
  btnMoons.onclick = () => {
    moonsEnabled = !moonsEnabled;
    btnMoons.classList.toggle('active', moonsEnabled);
    updateMoonVisibility();
  };
  btnClouds.onclick = () => {
    showClouds = !showClouds;
    cloudLayers.forEach(c => c.visible = showClouds);
    btnClouds.classList.toggle('active', showClouds);
  };

  // ----- 速度スライダー（ボタンを押すと現れる、控えめな調整パネル） -----
  const speedToggle = document.getElementById('speed-toggle');
  const speedPanel = document.getElementById('speed-panel');
  const speedRange = document.getElementById('speed-range');
  const speedValue = document.getElementById('speed-value');
  const speedReset = document.getElementById('speed-reset');
  // 対数スライダー：スライダー位置(0〜STEPS)を ×0.1〜×20 に対数で対応させる
  const SPEED_MIN = 0.1, SPEED_MAX = 20, SPEED_STEPS = 1000;
  const posToSpeed = (pos) => SPEED_MIN * Math.pow(SPEED_MAX / SPEED_MIN, pos / SPEED_STEPS);
  const speedToPos = (v) => Math.round(SPEED_STEPS * Math.log(v / SPEED_MIN) / Math.log(SPEED_MAX / SPEED_MIN));
  const fmtSpeed = (v) => '×' + (v < 10 ? v.toFixed(1) : Math.round(v));
  function applySpeedFromSlider() {
    speedFactor = posToSpeed(parseFloat(speedRange.value));
    speedValue.textContent = fmtSpeed(speedFactor);
  }
  speedToggle.addEventListener('click', () => {
    const willOpen = speedPanel.hasAttribute('hidden');
    speedPanel.toggleAttribute('hidden', !willOpen);
    speedToggle.classList.toggle('active', willOpen);
    speedToggle.setAttribute('aria-expanded', String(willOpen));
  });
  speedRange.addEventListener('input', applySpeedFromSlider);
  speedReset.addEventListener('click', () => {
    speedRange.value = String(speedToPos(1));
    applySpeedFromSlider();
  });
  // 初期値（×1.0）に合わせてスライダー位置と表示をそろえる
  speedRange.value = String(speedToPos(1));
  applySpeedFromSlider();

  // ----------------------------------------------------------------------
  // 「現在の配置」モード：実際の公転位置・自転軸の向きを反映する
  //   ・軌道要素（JPL/Standish, 1800–2050年で誤差およそ1°以下）から今の
  //     日心黄経・黄緯を計算し、惑星を実際の「太陽から見た方向」に置く。
  //   ・IAU の自転極 (α0, δ0) から自転軸を空間内の実方向へ固定する。
  //   ・距離や軌道の楕円形は見やすさ優先のまま（合わせるのは“向き”だけ）。
  //   ・このモードの間は、その瞬間の配置を保つため公転・自転を停止する。
  // ----------------------------------------------------------------------
  // 軌道要素 [J2000値, 1世紀あたりの変化率]。a:長半径, e:離心率, I:傾斜,
  //   L:平均黄経, w:近日点黄経(ϖ), O:昇交点黄経(Ω)。角度は度。
  const ELEMENTS = {
    mercury: { a:[0.38709927,0.00000037], e:[0.20563593,0.00001906], I:[7.00497902,-0.00594749], L:[252.25032350,149472.67411175], w:[77.45779628,0.16047689], O:[48.33076593,-0.12534081] },
    venus:   { a:[0.72333566,0.00000390], e:[0.00677672,-0.00004107], I:[3.39467605,-0.00078890], L:[181.97909950,58517.81538729], w:[131.60246718,0.00268329], O:[76.67984255,-0.27769418] },
    earth:   { a:[1.00000261,0.00000562], e:[0.01671123,-0.00004392], I:[-0.00001531,-0.01294668], L:[100.46457166,35999.37244981], w:[102.93768193,0.32327364], O:[0.0,0.0] },
    mars:    { a:[1.52371034,0.00001847], e:[0.09339410,0.00007882], I:[1.84969142,-0.00813131], L:[-4.55343205,19140.30268499], w:[-23.94362959,0.44441088], O:[49.55953891,-0.29257343] },
    jupiter: { a:[5.20288700,-0.00011607], e:[0.04838624,-0.00013253], I:[1.30439695,-0.00183714], L:[34.39644051,3034.74612775], w:[14.72847983,0.21252668], O:[100.47390909,0.20469106] },
    saturn:  { a:[9.53667594,-0.00125060], e:[0.05386179,-0.00050991], I:[2.48599187,0.00193609], L:[49.95424423,1222.49362201], w:[92.59887831,-0.41897216], O:[113.66242448,-0.28867794] },
    uranus:  { a:[19.18916464,-0.00196176], e:[0.04725744,-0.00004397], I:[0.77263783,-0.00242939], L:[313.23810451,428.48202785], w:[170.95427630,0.40805281], O:[74.01692503,0.04240589] },
    neptune: { a:[30.06992276,0.00026291], e:[0.00859048,0.00005105], I:[1.77004347,0.00035372], L:[-55.12002969,218.45945325], w:[44.96476227,-0.32241464], O:[131.78422574,-0.00508664] },
    pluto:   { a:[39.48211675,-0.00031596], e:[0.24882730,0.00005170], I:[17.14001206,0.00004818], L:[238.92903833,145.20780515], w:[224.06891629,-0.04062942], O:[110.30393684,-0.01183482] },
  };
  // IAU 自転北極の向き（J2000 赤道座標, 度）。季節を決める自転軸の向きに使う。
  const POLES = {
    mercury: { ra:281.0103, dec:61.4155 },
    venus:   { ra:272.76,   dec:67.16 },
    earth:   { ra:0.0,      dec:90.0 },
    mars:    { ra:317.681,  dec:52.887 },
    jupiter: { ra:268.057,  dec:64.495 },
    saturn:  { ra:40.589,   dec:83.537 },
    uranus:  { ra:257.311,  dec:-15.175 },
    neptune: { ra:299.36,   dec:43.46 },
    pluto:   { ra:132.993,  dec:-6.163 },
  };
  const DEG = Math.PI / 180;
  const ECL = 23.43928 * DEG;   // 黄道傾斜角（赤道座標→黄道座標の変換に使用）
  const UP = new THREE.Vector3(0, 1, 0);

  // 軌道要素から、現在の昇交点からの緯度引数 u・昇交点 Ω・傾斜 I（ラジアン）を求める
  function keplerState(el, T) {
    const a = el.a[0] + el.a[1] * T;          // （表示には使わないが将来用に算出）
    const e = el.e[0] + el.e[1] * T;
    const I = (el.I[0] + el.I[1] * T) * DEG;
    const L = el.L[0] + el.L[1] * T;
    const wbar = el.w[0] + el.w[1] * T;
    const Om = (el.O[0] + el.O[1] * T) * DEG;
    const omega = (wbar - el.O[0] - el.O[1] * T) * DEG;  // 近日点引数 ω = ϖ - Ω
    let M = (L - wbar) % 360; if (M > 180) M -= 360; if (M < -180) M += 360;
    M *= DEG;
    // ケプラー方程式 M = E - e sinE をニュートン法で解く
    let E = M + e * Math.sin(M);
    for (let k = 0; k < 12; k++) {
      const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
      E -= dE; if (Math.abs(dE) < 1e-9) break;
    }
    const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
    return { u: omega + nu, Om, I, a, e };
  }

  // 軌道面の向きを表すクォータニオン（基準の XZ 円軌道を実軌道面へ写す）。
  //   pivot.rotation.y = u とすると惑星が実位置に来る。
  function orbitQuat(Om, I) {
    const cO = Math.cos(Om), sO = Math.sin(Om), cI = Math.cos(I), sI = Math.sin(I);
    const A = new THREE.Vector3(cO, 0, -sO);                 // 昇交点方向（u=0）
    const B = new THREE.Vector3(-sO * cI, sI, -cO * cI);     // u=90° 方向
    const N = new THREE.Vector3().crossVectors(A, B).normalize();
    const C = new THREE.Vector3().crossVectors(A, N);
    return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(A, N, C));
  }

  // IAU 極（赤道座標）→ シーン座標の単位ベクトル（Y=黄道北）
  function poleToScene(ra, dec) {
    const cd = Math.cos(dec * DEG), sd = Math.sin(dec * DEG);
    const ca = Math.cos(ra * DEG), sa = Math.sin(ra * DEG);
    const xe = cd * ca, ye = cd * sa, ze = sd;               // 赤道直交座標
    const xc = xe, yc = ye * Math.cos(ECL) + ze * Math.sin(ECL), zc = -ye * Math.sin(ECL) + ze * Math.cos(ECL); // 黄道
    return new THREE.Vector3(xc, zc, -yc).normalize();       // シーン座標（Y上）
  }

  let realMode = false;
  const btnReal = document.getElementById('btn-real');
  const p2 = (n) => String(n).padStart(2, '0');

  // 指定した日時（ミリ秒）の実際の配置を反映する
  function applyRealLayout(dateMs) {
    const JD = dateMs / 86400000 + 2440587.5;
    const T = (JD - 2451545.0) / 36525;     // J2000 からのユリウス世紀
    PLANETS.forEach((p) => {
      const el = ELEMENTS[p.key];
      if (!el) return;
      const { u, Om, I } = keplerState(el, T);
      const q = orbitQuat(Om, I);
      p._orbitPlane.quaternion.copy(q);
      p._pivot.rotation.y = u;
      p._posGroup.rotation.y = -u;          // 軸を空間固定する不変条件を保つ
      const pole = POLES[p.key];
      if (pole) {
        // tiltGroup のワールド姿勢 = q · tiltGroup なので、q⁻¹·(＋Y→極方向) を入れれば
        // 自転軸はワールドで極方向に固定される。
        const desired = new THREE.Quaternion().setFromUnitVectors(UP, poleToScene(pole.ra, pole.dec));
        p._tiltGroup.quaternion.copy(q).invert().multiply(desired);
      }
    });
  }

  function restoreStylizedLayout() {
    PLANETS.forEach((p) => {
      p._orbitPlane.quaternion.copy(p._stylizedOrbitQuat);
      p._tiltGroup.quaternion.copy(p._stylizedTiltQuat);
    });
  }

  // ----- 日時指定・時間送り（誕生日の空、など）-----
  const realPanel = document.getElementById('real-panel');
  const realDateInput = document.getElementById('real-date');
  const realOffset = document.getElementById('real-offset');
  const realNowBtn = document.getElementById('real-now');
  const realWhen = document.getElementById('real-when');
  const toLocalInput = (d) =>
    `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}`;
  // 基準日時（入力）＋スライダーの日数オフセット ＝ 実際に表示する日時
  const baseMs = () => (realDateInput.value ? new Date(realDateInput.value).getTime() : Date.now());
  const effectiveMs = () => baseMs() + Number(realOffset.value) * 86400000;
  function refreshReal() {
    const ms = effectiveMs();
    applyRealLayout(ms);
    const d = new Date(ms);
    realWhen.textContent = `${d.getFullYear()}/${p2(d.getMonth() + 1)}/${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}`;
  }
  realDateInput.addEventListener('input', () => { realOffset.value = '0'; refreshReal(); });
  realOffset.addEventListener('input', refreshReal);
  realNowBtn.addEventListener('click', () => {
    realDateInput.value = toLocalInput(new Date());
    realOffset.value = '0';
    refreshReal();
  });

  btnReal.onclick = () => {
    realMode = !realMode;
    btnReal.classList.toggle('active', realMode);
    if (realMode) {
      if (!realDateInput.value) realDateInput.value = toLocalInput(new Date());
      realOffset.value = '0';
      refreshReal();
      realPanel.hidden = false;
    } else {
      restoreStylizedLayout();
      realPanel.hidden = true;
    }
  };

  // ----- 距離スケール切替（表示用 ↔ 実スケール）-----
  let realScale = false;
  const btnScale = document.getElementById('btn-scale');
  function applyDistanceScale(real) {
    PLANETS.forEach((p) => {
      const d = real ? p._realDist : p._displayDist;
      p._posGroup.position.x = d;
      const k = d / p._displayDist;
      p._orbitLine.scale.set(k, 1, k);   // 軌道線も同じ比率で広げて惑星に合わせる
    });
    controls.maxDistance = real ? 2200 : 900;  // 実スケールは外惑星が遠いのでズームアウトを許す
  }
  btnScale.onclick = () => {
    realScale = !realScale;
    btnScale.classList.toggle('active', realScale);
    applyDistanceScale(realScale);
  };

  // 初期状態では衛星は非表示（惑星をクリックすると現れる）
  updateMoonVisibility();

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePopup(); });

  // ----------------------------------------------------------------------
  // アニメーションループ
  // ----------------------------------------------------------------------
  const SPEED = 0.0016;
  const tmp = new THREE.Vector3();

  let rafId = 0;
  function animate() {
    rafId = requestAnimationFrame(animate);

    // 「現在の配置」モードでは、その瞬間の配置を保つため動きを止める
    if (!paused && !realMode) {
      PLANETS.forEach((p) => {
        p._pivot.rotation.y += p.speed * SPEED * speedFactor;
        p._posGroup.rotation.y = -p._pivot.rotation.y;  // 地軸の向きを空間に固定（季節が生まれる）
        p._mesh.rotation.y += p.spin * speedFactor;
        if (p.moons) p.moons.forEach(m => { m._pivot.rotation.y += m.speed * SPEED * 4 * speedFactor; });
      });
      sun.rotation.y += 0.001 * speedFactor;
    }

    // ラベルを惑星の上に追従
    labels.forEach((l) => {
      l.userData.mesh.getWorldPosition(tmp);
      l.position.set(tmp.x, tmp.y + l.userData.mesh.userData.planet.size + 4, tmp.z);
    });

    // 衛星ラベルの追従（表示中のものだけ）
    moonLabels.forEach((l) => {
      if (!l.visible) return;
      const m = l.userData.mesh.userData.planet;
      l.userData.mesh.getWorldPosition(tmp);
      l.position.set(tmp.x, tmp.y + m.size + 1.6, tmp.z);
    });

    // 惑星にフォーカス中はカメラのターゲットを滑らかに移動
    if (focusTarget) {
      focusTarget.getWorldPosition(tmp);
      controls.target.lerp(tmp, 0.06);
    } else {
      controls.target.lerp(new THREE.Vector3(0,0,0), 0.04);
    }

    controls.update();
    // 星空をカメラに追従させ、どれだけ引いても常に背景になるようにする（手前に来ない）
    starField.position.copy(camera.position);
    renderer.render(scene, camera);
  }

  // ダブルクリックでフォーカス解除（衛星も隠してビューをすっきりさせる）
  renderer.domElement.addEventListener('dblclick', () => {
    focusTarget = null;
    activePlanet = null;
    updateMoonVisibility();
    closePopup();
  });

  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  animate();

  // タブが非表示の間は描画ループを止めて省電力に（再表示で再開）
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    } else if (!rafId) {
      rafId = requestAnimationFrame(animate);
    }
  });

  // 安全策：何らかの理由で onLoad が来なくても、一定時間で必ずローディングを隠す
  setTimeout(() => loadingEl.classList.add('hide'), 12000);
