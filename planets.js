  // ----------------------------------------------------------------------
  // 惑星データ（日本語の解説つき）
  //   size       : 表示用の半径（実スケールではなく見やすさ優先）
  //   distance   : 太陽からの表示距離
  //   speed      : 公転の相対速度
  //   spin       : 自転速度
  //   colors     : テクスチャ生成用のベース色
  //   tilt       : 地軸の傾き（度／実際の値に近づけている）
  // ----------------------------------------------------------------------
  const PLANETS = [
    {
      key: 'mercury', name: '水星', en: 'Mercury',
      size: 1.6, distance: 28, speed: 4.15, spin: 0.004, tilt: 0.03, incl: 7.0,
      colors: ['#8a8073', '#6b6258', '#a89c8c'], texture: 'rocky',
      map: 'mercury.jpg',
      subtitle: '太陽系で最も内側の惑星',
      desc: '太陽に最も近い、最小の惑星です。大気がほとんどないため昼夜の温度差が極端で、昼は約430℃、夜は約-180℃にもなります。表面は月のようにクレーターで覆われています。',
      facts: { '直径': '4,879 km', '公転周期': '88 日', '自転周期': '59 日', '衛星': 'なし' }
    },
    {
      key: 'venus', name: '金星', en: 'Venus',
      size: 2.4, distance: 42, speed: 1.62, spin: -0.002, tilt: 177.4, incl: 3.4,
      colors: ['#e8c98a', '#c9a25e', '#f3ddae'], texture: 'cloudy',
      map: 'venus_surface.jpg',
      cloud: { map: 'venus_atmosphere.jpg', opaque: true, scale: 1.025, label: '大気' },
      subtitle: '灼熱の双子星',
      desc: '地球とほぼ同じ大きさで「地球の双子」とも呼ばれます。厚い二酸化炭素の大気による温室効果で表面温度は約460℃に達し、太陽系で最も熱い惑星です。自転の向きが他の惑星と逆なのも特徴です。',
      facts: { '直径': '12,104 km', '公転周期': '225 日', '自転周期': '243 日', '衛星': 'なし' }
    },
    {
      key: 'earth', name: '地球', en: 'Earth',
      size: 2.6, distance: 58, speed: 1.0, spin: 0.02, tilt: 23.4, incl: 0.0,
      colors: ['#2a6fb0', '#3f9d52', '#dfe9f5'], texture: 'earth',
      map: 'earth_day.jpg',
      normalMap: 'earth_normal.png',
      cloud: { map: 'earth_clouds.jpg', opaque: false, scale: 1.02, label: '雲' },
      moons: [
        { key: 'moon', name: '月', en: 'Moon', size: 0.7, distance: 6, speed: 2.2,
          incl: 5.1, refPlane: 'ecliptic',   // 月は地球赤道ではなく黄道に近い面を公転
          colors: ['#bdbdbd', '#8f8f8f', '#e2e2e2'], texture: 'rocky', map: 'moon.jpg',
          subtitle: '地球の唯一の衛星',
          desc: '地球で唯一の自然衛星で、太陽系では5番目に大きな衛星です。常に同じ面を地球へ向けており、潮の満ち引きを引き起こしています。',
          facts: { '直径': '3,474 km', '公転周期': '27.3 日', '母惑星': '地球' } }
      ],
      subtitle: '私たちの故郷',
      desc: '液体の水と豊かな大気を持ち、生命が確認されている唯一の惑星です。表面の約7割が海で覆われ、適度な温度と磁場が生命を守っています。唯一の衛星として月を持ちます。',
      facts: { '直径': '12,742 km', '公転周期': '365 日', '自転周期': '24 時間', '衛星': '1（月）' }
    },
    {
      key: 'mars', name: '火星', en: 'Mars',
      size: 2.0, distance: 74, speed: 0.53, spin: 0.018, tilt: 25.2, incl: 1.85,
      colors: ['#c1502e', '#9c3b22', '#e0764d'], texture: 'rocky',
      map: 'mars.jpg',
      subtitle: '赤い惑星',
      desc: '酸化鉄（さび）に覆われた表面が赤く見えることから「赤い惑星」と呼ばれます。太陽系最大の火山オリンポス山や巨大な峡谷を持ち、かつて水が流れた痕跡があるため生命探査の最有力候補です。',
      facts: { '直径': '6,779 km', '公転周期': '687 日', '自転周期': '24.6 時間', '衛星': '2' }
    },
    {
      key: 'jupiter', name: '木星', en: 'Jupiter',
      size: 6.5, distance: 100, speed: 0.084, spin: 0.04, tilt: 3.1, incl: 1.3,
      colors: ['#d8b48c', '#b5895f', '#e9d4b6'], texture: 'gas',
      map: 'jupiter.jpg',
      moons: [
        { key: 'io', name: 'イオ', en: 'Io', size: 0.5, distance: 10, speed: 3.2, incl: 0.04,
          colors: ['#e8d24a', '#cdae2e', '#f4e58a'], texture: 'rocky',
          map: 'textures/nasa/io.webp',
          subtitle: '太陽系で最も火山が活発',
          desc: '木星の強い潮汐力で内部が熱せられ、太陽系で最も火山活動が活発な天体です。硫黄を噴き上げ、黄や赤の毒々しい表面をしています。',
          facts: { '直径': '3,643 km', '公転周期': '1.8 日', '母惑星': '木星' } },
        { key: 'europa', name: 'エウロパ', en: 'Europa', size: 0.45, distance: 13, speed: 2.4, incl: 0.47,
          colors: ['#d9c4a0', '#bda983', '#efe3c8'], texture: 'ice',
          tintMap: 'textures/nasa/europa.webp',
          subtitle: '氷の下に海を持つ衛星',
          desc: '表面を覆う氷の下に液体の海があると考えられ、地球外生命の有力な候補地として探査が計画されています。',
          facts: { '直径': '3,122 km', '公転周期': '3.6 日', '母惑星': '木星' } },
        { key: 'ganymede', name: 'ガニメデ', en: 'Ganymede', size: 0.75, distance: 16.5, speed: 1.7, incl: 0.2,
          colors: ['#9a8c7a', '#7d7064', '#bcae9c'], texture: 'rocky',
          tintMap: 'textures/nasa/ganymede.webp',
          subtitle: '太陽系最大の衛星',
          desc: '太陽系で最も大きな衛星で、惑星の水星よりも大きいほどです。衛星では唯一、自前の磁場を持っています。',
          facts: { '直径': '5,268 km', '公転周期': '7.2 日', '母惑星': '木星' } },
        { key: 'callisto', name: 'カリスト', en: 'Callisto', size: 0.7, distance: 20, speed: 1.2, incl: 0.19,
          colors: ['#6b5d52', '#52473f', '#8a7a6c'], texture: 'rocky',
          tintMap: 'textures/nasa/callisto.webp',
          subtitle: 'クレーターだらけの古い衛星',
          desc: '太陽系で最もクレーターに覆われた天体のひとつで、約40億年前の非常に古い表面をほぼそのまま保っています。',
          facts: { '直径': '4,821 km', '公転周期': '16.7 日', '母惑星': '木星' } }
      ],
      subtitle: '太陽系最大の惑星',
      desc: '太陽系で最も大きなガス惑星で、地球が1,300個以上入る巨大さです。表面の縞模様は高速のジェット気流で、「大赤斑」と呼ばれる地球数個分の巨大な嵐が何百年も続いています。',
      facts: { '直径': '139,820 km', '公転周期': '11.9 年', '自転周期': '9.9 時間', '衛星': '95+' }
    },
    {
      key: 'saturn', name: '土星', en: 'Saturn',
      size: 5.5, distance: 138, speed: 0.034, spin: 0.038, tilt: 26.7, incl: 2.49,
      colors: ['#e7d2a0', '#c9ad74', '#f1e3c0'], texture: 'gas', ring: true,
      map: 'saturn.jpg',
      ringTex: 'saturn_ring.png',
      moons: [
        { key: 'titan', name: 'タイタン', en: 'Titan', size: 0.75, distance: 15.5, speed: 1.6, incl: 0.35,
          colors: ['#d8973c', '#b97a26', '#eab866'], texture: 'cloudy',
          subtitle: '濃い大気を持つ衛星',
          desc: '太陽系で2番目に大きな衛星。地球以外で唯一、濃い大気と地表の液体（メタンの川や湖）を持つ、極めて特異な天体です。',
          facts: { '直径': '5,150 km', '公転周期': '16 日', '母惑星': '土星' } }
      ],
      subtitle: '美しい環を持つ惑星',
      desc: '無数の氷や岩の粒からなる壮大な環で知られるガス惑星です。環の幅は約27万kmにも及びますが、厚さは数十メートルしかありません。密度が非常に低く、水に浮くほど軽い惑星です。',
      facts: { '直径': '116,460 km', '公転周期': '29.5 年', '自転周期': '10.7 時間', '衛星': '146+' }
    },
    {
      key: 'uranus', name: '天王星', en: 'Uranus',
      size: 4.0, distance: 176, speed: 0.012, spin: 0.03, tilt: 97.8, incl: 0.77,
      colors: ['#9fe3e3', '#7ec5c9', '#c4f0f0'], texture: 'ice', ring: true,
      map: 'uranus.jpg',
      moons: [
        { key: 'miranda', name: 'ミランダ', en: 'Miranda', size: 0.4, distance: 11, speed: 2.0, incl: 4.34,
          colors: ['#b8bcc0', '#969aa0', '#d6dade'], texture: 'ice',
          subtitle: '継ぎはぎ模様の小衛星',
          desc: '高さ20kmにも達する巨大な崖や、入り組んだ奇妙な地形を持つ小さな衛星。まるで一度砕けて再集合したかのような「継ぎはぎ」の表面で知られます。',
          facts: { '直径': '472 km', '公転周期': '1.4 日', '母惑星': '天王星' } }
      ],
      subtitle: '横倒しで回る氷の惑星',
      desc: 'メタンを含む大気が青緑色に見える氷の巨大惑星です。自転軸が約98度傾いており、ほぼ横倒しの状態で公転する非常に珍しい惑星です。そのため極端な季節変化が起こります。',
      facts: { '直径': '50,724 km', '公転周期': '84 年', '自転周期': '17.2 時間', '衛星': '28' }
    },
    {
      key: 'neptune', name: '海王星', en: 'Neptune',
      size: 3.9, distance: 210, speed: 0.006, spin: 0.032, tilt: 28.3, incl: 1.77,
      colors: ['#3b6fd6', '#2b52a8', '#6f9bf0'], texture: 'ice',
      map: 'neptune.jpg',
      moons: [
        { key: 'triton', name: 'トリトン', en: 'Triton', size: 0.55, distance: 9, speed: 1.8, incl: 157,
          colors: ['#d6c0b0', '#b89a88', '#efe0d2'], texture: 'ice',
          subtitle: '逆向きに公転する衛星',
          desc: '母惑星の自転と逆向きに公転する珍しい衛星で、窒素の間欠泉を噴き上げています。元は太陽系外縁の天体が捕らえられたものと考えられています。',
          facts: { '直径': '2,707 km', '公転周期': '5.9 日', '母惑星': '海王星' } }
      ],
      subtitle: '太陽系最果ての惑星',
      desc: '太陽から最も遠い惑星で、深い青色が特徴です。太陽系で最も強い風が吹き、その速度は秒速600mにも達します。望遠鏡ではなく数学的な計算によって存在が予言され、発見された惑星です。',
      facts: { '直径': '49,244 km', '公転周期': '165 年', '自転周期': '16.1 時間', '衛星': '16' }
    },
    {
      key: 'pluto', name: '冥王星', en: 'Pluto', dwarf: true,
      size: 1.0, distance: 248, speed: 0.004, spin: 0.012, tilt: 122.5, incl: 17.2,
      colors: ['#caa886', '#a8835f', '#e3cbb0'], texture: 'ice',
      map: 'textures/nasa/pluto.jpg',
      moons: [
        { key: 'charon', name: 'カロン', en: 'Charon', size: 0.5, distance: 3.2, speed: 1.4, incl: 0.0,
          colors: ['#b0a99f', '#8d877d', '#d0cac2'], texture: 'ice',
          map: 'textures/nasa/charon.jpg',
          subtitle: '冥王星と対を成す巨大な衛星',
          desc: '直径が冥王星の半分以上もある大きな衛星です。互いに共通の重心のまわりを回り、常に同じ面を向け合う「二重天体」とも呼ばれる珍しい関係にあります。',
          facts: { '直径': '1,212 km', '公転周期': '6.4 日', '母惑星': '冥王星' } }
      ],
      subtitle: '太陽系外縁の準惑星',
      desc: 'かつては9番目の惑星とされましたが、2006年に準惑星へ分類変更されました。表面には窒素やメタンの氷が広がり、ハート形の平原「トンボー領域」が探査機ニューホライズンズによって発見されました。',
      facts: { '直径': '2,377 km', '公転周期': '248 年', '自転周期': '6.4 日', '衛星': '5' }
    }
  ];

export default PLANETS;
