# テクスチャ・画像の出典一覧 / Texture & Image Sources

本サイトで使用している天体テクスチャ（3Dモデルに貼る画像）と、ポップアップの惑星写真の出典をまとめています。

- すべてのURLは **2026-06-25 にアクセス可能であることを確認済み**です。
- ライセンス表記：
  - **SSC** = [Solar System Scope](https://www.solarsystemscope.com/textures/) — [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)（要・帰属表示）
  - **PD** = Public Domain（NASA の画像。クレジット表記は任意だが推奨）

---

## 1. 3D テクスチャ（球体・環に貼る画像）`textures/`

### Solar System Scope（CC BY 4.0）

出典ページ（全ファイル共通）：<https://www.solarsystemscope.com/textures/>

| ファイル | 用途（天体） | 提供元 | ライセンス |
|---|---|---|---|
| `textures/ssc/mercury.jpg` | 水星 | Solar System Scope | SSC |
| `textures/ssc/venus_surface.jpg` | 金星（地表） | Solar System Scope | SSC |
| `textures/ssc/venus_atmosphere.jpg` | 金星（大気・雲） | Solar System Scope | SSC |
| `textures/ssc/earth_day.jpg` | 地球（昼） | Solar System Scope | SSC |
| `textures/ssc/earth_clouds.jpg` | 地球（雲） | Solar System Scope | SSC |
| `textures/ssc/earth_normal.png` | 地球（法線マップ） | Solar System Scope | SSC |
| `textures/ssc/moon.jpg` | 月 | Solar System Scope | SSC |
| `textures/ssc/mars.jpg` | 火星 | Solar System Scope | SSC |
| `textures/ssc/jupiter.jpg` | 木星 | Solar System Scope | SSC |
| `textures/ssc/saturn.jpg` | 土星 | Solar System Scope | SSC |
| `textures/ssc/saturn_ring.png` | 土星の環 | Solar System Scope | SSC |
| `textures/ssc/uranus.jpg` | 天王星 | Solar System Scope | SSC |
| `textures/ssc/neptune.jpg` | 海王星 | Solar System Scope | SSC |
| `textures/ssc/sun.jpg` | 太陽 | Solar System Scope | SSC |

> `textures/ssc/earth_normal_source.tif` … 地球法線マップの元データ。アプリでは未使用（`earth_normal.png` を使用）。

### NASA（Public Domain）

| ファイル | 用途（天体） | 提供元 | ライセンス | 出典URL |
|---|---|---|---|---|
| `textures/nasa/pluto.jpg` | 冥王星 | NASA / JHUAPL / SwRI（New Horizons） | PD | <https://science.nasa.gov/resource/pluto-global-color-map/> |
| `textures/nasa/charon.jpg` | カロン | Image credit: NASA/Johns Hopkins University Applied Physics Laboratory/Southwest Research Institute（PIA19866） | — | <https://www.jpl.nasa.gov/images/pia19866-global-map-of-plutos-moon-charon/> |
| `textures/nasa/io.webp` | イオ（木星の衛星） | NASA / JPL | PD | <https://science.nasa.gov/3d-resources/> |
| `textures/nasa/europa.webp` | エウロパ（木星の衛星） | NASA / JPL | PD | <https://science.nasa.gov/3d-resources/> |
| `textures/nasa/ganymede.webp` | ガニメデ（木星の衛星） | NASA / JPL | PD | <https://science.nasa.gov/3d-resources/> |
| `textures/nasa/callisto.webp` | カリスト（木星の衛星） | NASA / JPL | PD | <https://science.nasa.gov/3d-resources/> |

---

## 2. ポップアップの惑星写真 `nasa_planets_images/`

惑星をクリックしたときに表示する実写（または観測）画像。3Dテクスチャとは別の用途です。

| ファイル | 天体 | 提供元 | ライセンス | 出典URL |
|---|---|---|---|---|
| `nasa_planets_images/mercury.jpg` | 水星 | NASA | PD | <https://science.nasa.gov/image-detail/amf-0780dc8c-09ad-4bbd-8ef2-75c289c94791/> |
| `nasa_planets_images/venus.jpg` | 金星（Mariner 10） | NASA / JPL | PD | <https://science.nasa.gov/photojournal/venus-from-mariner-10/> |
| `nasa_planets_images/earth.jpg` | 地球（Artemis II） | NASA | PD | <https://science.nasa.gov/earth/earth-observatory/a-moonlit-earth-as-seen-from-artemis-ii/> |
| `nasa_planets_images/mars.jpg` | 火星 | NASA / JPL | PD | <https://www.jpl.nasa.gov/news/nasas-legacy-of-mars-exploration/> |
| `nasa_planets_images/jupiter.jpg` | 木星（Cassini） | NASA / JPL | PD | <https://science.nasa.gov/photojournal/cassini-jupiter-portrait/> |
| `nasa_planets_images/saturn.jpg` | 土星 | NASA | PD | <https://science.nasa.gov/image-detail/amf-cda9ff2b-35bd-4a6f-9c87-de73faf68c94/> |
| `nasa_planets_images/uranus.jpg` | 天王星 | NASA | PD | <https://science.nasa.gov/uranus/facts/> |
| `nasa_planets_images/neptune.jpg` | 海王星（PIA01492） | NASA / JPL | PD | <https://science.nasa.gov/image-detail/amf-pia01492/> |
| `nasa_planets_images/pluto.jpg` | 冥王星（PIA20291） | NASA / JHUAPL / SwRI | PD | <https://science.nasa.gov/image-detail/color-image-of-pluto-pia20291-2/> |
| `nasa_planets_images/sun.jpg` | 太陽（SDO / AIA） | NASA / SDO（Wikimedia 経由） | PD | <https://commons.wikimedia.org/wiki/File:The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg> |

---

## 3. サイトアイコン・OGP 画像

これらは NASA / SSC 素材ではなく、**fy_fp7 氏提供のキャラクターイラスト**を使用しています（パブリックドメインではありません）。

| ファイル | 用途 | 提供元 | 取扱い |
|---|---|---|---|
| `mini-earth-char.png` | 元イラスト（earth キャラ） | © fy_fp7 | 原作者様のご厚意により当サイト限定で掲載。転載・再配布・改変はご遠慮ください。 |
| `apple-touch-icon.png` | ファビコン／ホーム画面アイコン | © fy_fp7（加工：当サイト） | 上記イラストを白背景に配置したもの。**fy_fp7 氏のイラストを含む**ため同条件。 |
| `ogp.png` | OGP / Twitter カード画像 | © fy_fp7（加工：当サイト） | 同上。 |

---

## 4. 完全性チェック（不足分の確認）

アプリ内で実際に読み込んでいる画像（`index.html` の参照）と本一覧を突き合わせた結果：

- ✅ **3Dテクスチャ（`textures/`）はすべて出典あり**。SSC 14点 + NASA 6点（冥王星・カロン・ガリレオ衛星4）。
- ✅ **ポップアップ写真（`nasa_planets_images/`）は全10天体すべて出典URLあり**（水星・金星・地球・火星・木星・土星・天王星・海王星・冥王星・太陽）。
- ✅ 上記以外に、アプリが読み込んでいるのに出典が記載されていない画像は **なし**。

### 補足・注意点
- **SSC テクスチャ**：個別ファイルの直リンクは無く、コレクションページ（上記URL）が共通の出典。利用時は **「Solar System Scope」への帰属表示（CC BY 4.0）が必須**。
- **ガリレオ衛星（io/europa/ganymede/callisto）**：NASA の 3D リソースページ（共通URL）が出典。個別ページURLは未記録。
- **太陽のポップアップ写真**：NASA/SDO の画像を Wikimedia Commons 経由で取得（パブリックドメイン）。
- **`earth_normal_source.tif`**：元データのみでアプリ未使用のため、配信・クレジットの対象外。

---

最終確認日：2026-06-25
