# My Orbits Fan Site

[@fy_fp7](https://x.com/fy_fp7) さんのオリジナル創作「**Myorbits.**」の **非公式ファンサイト**です（有志による制作）。公式・本家とは関係ありません。

Three.js で作成した、ブラウザで動く太陽系の 3D ビューワーです。惑星・衛星をクリックすると詳細とイメージキャラクターが表示されます。右上の「このサイトについて」から、作品の世界観を読むことができます。

## 使い方

ローカルで開く場合は、静的ファイルを HTTP サーバーで配信してください（`file://` 直開きだとモジュール読み込みに失敗します）。

```bash
python3 -m http.server 8080
# http://localhost:8080/ を開く
```

## クレジット / Credits

### 天体テクスチャ

- **惑星・衛星のテクスチャ**：[Solar System Scope](https://www.solarsystemscope.com/textures/) — [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- **冥王星・ガリレオ衛星のテクスチャ**：[NASA](https://www.nasa.gov/)（Public Domain）
- **カロンのテクスチャ**：Image credit: NASA/Johns Hopkins University Applied Physics Laboratory/Southwest Research Institute
- **ポップアップの惑星写真**（`nasa_planets_images/`）：[NASA](https://www.nasa.gov/)（Public Domain）

> 各テクスチャ・画像のファイル別の出典URL一覧は [`TEXTURE_SOURCES.md`](./TEXTURE_SOURCES.md) にまとめています。

### キャラクター画像（イラスト）

`character_images/` に含まれるキャラクターイラスト、および `mini-earth-char.png`（サイトアイコン／OGP画像に使用）は **fy_fp7** 氏の著作物です。

- © fy_fp7 — <https://lit.link/fyfp>
- 掲載しているイラストは、**原作者様ご本人のご厚意により、当サイト限定で掲載許可**をいただいています。
- イラストおよび原作に関する権利はすべて fy_fp7 氏に帰属します。
- サイトアイコン（`apple-touch-icon.png`）と OGP 画像（`ogp.png`）は `mini-earth-char.png` を加工したもので、**fy_fp7 氏のイラストを含みます**。
- **掲載イラスト（およびそれを含む生成画像）の転載・再配布・改変はご遠慮ください。**

### キャラクター説明文

各天体のキャラクター紹介文（`characters.js`）は **yellow_tulip013** 氏によるものです。

- 文章：yellow_tulip013 — <https://x.com/yellow_tulip013>

### ディレクション

- yellow_tulip013 — <https://x.com/yellow_tulip013>

### 使用ライブラリ

- **[three.js](https://threejs.org/)**（r160 / MIT License）— `vendor/three/` に同梱（CDN 非依存）。

### Webサイト作成

- Butadiene

### コード提供・実装協力

- 42（[@pseudocardiac](https://x.com/pseudocardiac)）— ファイル構成、PC版の左側キャラクター表示・アニメーション・タイポグラフィ

## このサイトについて

本サイトは有志が制作した「Myorbits.」の**非公式ファンサイト**であり、作品の紹介と応援を目的としてファンが運営しています。原作者である fy_fp7 氏の公式サイトではありません。掲載イラストは原作者様ご本人のご厚意により当サイト限定で掲載許可をいただいたもので、イラストおよび原作に関する権利はすべて fy_fp7 氏に帰属します。掲載イラストの転載・再配布はご遠慮ください。

## License

本リポジトリのソースコード（HTML / CSS / JavaScript）の利用条件と、上記サードパーティ素材（テクスチャ・キャラクター画像）のライセンスは別個のものです。サードパーティ素材は各提供元の条件に従ってください。特にキャラクター画像・原作設定は権利者（fy_fp7 氏）の許諾なく利用できません。
