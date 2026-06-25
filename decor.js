// ============================================================
//  左側の大きな立ち絵＋名前表示（PC のみ）
//  sai-san のコードの「左側キャラクター表示・アニメーション・文字」を、
//  外部ライブラリ（anime.js）に依存せず CSS トランジションで再現したもの。
//  ・#tachie  … 大きな立ち絵。下からスプリング風にせり上がる。右端はマスクでフェード。
//  ・#name-romaji / #name-kanji … 左下に大きくローマ字名・漢字名。左からスライドイン。
//  表示/非表示は #decor に .show を付け外しするだけ（アニメは CSS 側）。
// ============================================================
const decor = document.getElementById('decor');
const tachie = decor ? document.getElementById('tachie') : null;
const nameRomaji = decor ? document.getElementById('name-romaji') : null;
const nameKanji = decor ? document.getElementById('name-kanji') : null;

// 切り替え中のデコード完了コールバックを無効化する世代カウンタ
let decorSeq = 0;

export function showDecor(p) {
  if (!decor) return;
  const seq = ++decorSeq;
  const src = p && p.character;
  if (!src) { hideDecor(); return; }
  // 文字は先に確定（テキストは軽い）
  nameRomaji.textContent = p.en || '';
  nameKanji.textContent = p.name || '';
  // 英字（ローマ字名）の色は planets.js の各天体カラー（colors[0]）を反映する
  nameRomaji.style.color = (p.colors && p.colors[0]) || '';
  tachie.alt = `${p.name}のイメージキャラクター`;

  // 大きな立ち絵はデコード完了を待ってからアニメ開始（カクつき防止）。
  // この時点では decor は非表示（画面外）なので、差し替えても見えない。
  tachie.src = src;
  const reveal = () => {
    if (seq !== decorSeq) return;   // 待機中に別天体へ切り替わったら破棄
    decor.classList.remove('show');
    void decor.offsetWidth;         // reflow を挟んでトランジションを確実に再生
    decor.classList.add('show');
  };
  if (tachie.decode) tachie.decode().then(reveal).catch(reveal);
  else reveal();
}

export function hideDecor() {
  if (!decor) return;
  decorSeq++;     // 進行中のデコード待ちを無効化
  decor.classList.remove('show');
}
