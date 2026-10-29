# business-libs

ビジネス向けの React 部品ライブラリ（estate / news / portal / publish / person）のリポジトリ。
フロント（[jibunsee-react](https://github.com/aidabo/jibunsee-react)）が `packages/business` としてリンクし、ページビルダー（stackpage）の部品として使う。

**公開リポジトリ**。秘密の値・テナントの実データ・内部の URL を入れない。

## この文書の内容

| 節 | 内容 |
|---|---|
| [パッケージ](#パッケージ) | 5 つのパッケージの名前・役割・入口 |
| [中の構成](#中の構成) | 主なフォルダ |
| [開発の手順](#開発の手順) | 入れる・ビルド・型検査 |
| [ホストとのつながり](#ホストとのつながり) | リンク、dist の読まれ方、FEATURE フラグ |
| [setup-symlinks.sh](#setup-symlinkssh) | 依存の解決のためのリンクを作るスクリプト |
| [決まり・注意](#決まり注意) | 壊しやすい所 |
| [レビュー](#レビュー) | PR と cross-review |
| [詳しい文書](#詳しい文書) | フロント側の文書へのリンク |

## パッケージ

| フォルダ | package.json の名前 | 役割 | 入口（`exports`） |
|---|---|---|---|
| `estate` | `@ghost-next/estate` | 不動産のページの部品（物件カード・検索・詳細・問い合わせ・リフォーム など） | `.` → `dist/estate.{js,cjs}`（React の部品）、`./core` → `dist/core.{js,cjs}`（React を使わない整形・View Model） |
| `news` | `@ghost-next/news` | ニュース（紙面・記事の閲覧・編集デスク） | `.` → `dist/news.{es,cjs}.js`、`./core` → `dist/core.{es,cjs}.js`（React を使わない処理） |
| `portal` | `@ghost-next/portal` | ポータルの部品（お知らせ・リンク集・問い合わせフォーム・ファイル一覧 など） | `.` → `dist/portal.{es,umd}.js` |
| `publish` | `@ghost-next/publish` | 出版・ニュース・自治体向けの部品（記事カード・紙面ヘッダ・連載・イベント など） | `.` → `dist/publish.{es,umd}.js`、`./src/sample-pages`（サンプルページ。**ソースのまま**読まれる） |
| `person` | `@ghost-next/person` | 人物・年表・エピソードの部品 | `.` → `dist/person.{es,umd}.js` |

各パッケージの `src/index.ts` は、ページビルダーに登録する部品の表 `<Name>Components` と既定の props `<Name>DefaultProps`、
翻訳を渡す `<Name>Provider` を export する（例: `EstateComponents`・`EstateDefaultProps`・`EstateProvider`）。

## 中の構成

```
package.json        ルート。workspaces は estate / news / portal / publish（person は入っていない）
setup-symlinks.sh   依存の解決のためのリンクを作る（下の節）
docs/               このリポジトリの作業記録（i18n-progress.md）
estate/             src/（部品）、src/core/（React なしの処理）、src/api/、scripts/seed-pages.ts、data/db.json、CLAUDE.md
news/               src/reader・desk・core・adapter・shared
portal/  publish/  person/
```

各パッケージは Vite のライブラリモードでビルドし、`dist/` に出す（`dist/` は git に入れない）。
`docs/` の中身: [docs/i18n-progress.md](docs/i18n-progress.md)（翻訳の対応の記録）。

## 開発の手順

普段は単体では動かさず、フロントの workspace の中で使う（フロントの root の `workspaces` に `packages/business/*` がある）。
clone の場所とリンクは [01-workspace](https://github.com/aidabo/jibunsee-react/blob/main/docs/development/01-workspace.md) のとおり。

```bash
# 依存を入れる（フロントの root で。packages/business/* も workspace として入る）
cd ~/work/legacy/01-ghost-front && yarn install

# ビルド（各パッケージの build は `tsc && vite build`。tsc は noEmit で型検査だけ）
yarn --cwd ~/work/legacy/11-business build          # estate / news / portal / publish（person は入らない）
yarn --cwd ~/work/legacy/11-business/person build   # person
yarn --cwd ~/work/legacy/11-business/estate build   # 1 つだけ
# フロントの root からは yarn build:estate / build:publish / build:news もある（build:news はホストの build:news も走らせる）

# 型検査だけ（パッケージのフォルダで）
npx tsc --noEmit -p .
```

- estate・portal・publish・person には `dev`（Vite の開発サーバ）と `preview` もある。news は `build` だけ。
- **テストは無い**（`*.test.ts` は `.gitignore` に入っている）。動きはフロントのテストと画面で確かめる
  （[06](https://github.com/aidabo/jibunsee-react/blob/main/docs/development/06-business-libs-estate.md#ライブラリの変更の流れ)）。

## ホストとのつながり

- フロントの `packages/business` は、このリポジトリへの symlink。ホスト（`apps/host`）は `@ghost-next/*` として読む。
- ホストは **ビルド済みの `dist`** を読む（`exports` が `dist` を指す）。ソースを変えたら、そのパッケージをビルドし直す。watch は無い。
  例外は publish の `./src/sample-pages`（ホストのシード処理がソースを直接読む）。
- 部品はホストの `src/templates/registry/ComponentsProvider.tsx` で登録され、各 `<Name>Provider` に `t`（ホストの i18n）が渡される。
- ホストのビルドで、FEATURE フラグが `true` でないパッケージはスタブ（`apps/host/src/lib/*-stub.ts`）に置き換わる（`apps/host/next.config.js`）。

| パッケージ | 有効にするフラグ | 無効のとき |
|---|---|---|
| estate | `ESTATE_FEATURE_ENABLED=true` | `estate-stub.ts` |
| news | `NEWS_FEATURE_ENABLED=true` | `news-stub.ts`（`@ghost-next/news/core` は置き換わらず、常に本物） |
| publish | `PUBLISHING_FEATURE_ENABLED=true`（旧名 `PUBLISH_FEATURE_ENABLED` も効く） | `publish-stub.ts` |
| person | `PERSON_FEATURE_ENABLED=true` | `person-stub.ts` |
| portal | （フラグなし） | 常に組み込まれる |

## setup-symlinks.sh

フロントの `packages/business` は workspace の外（このリポジトリ）を指すリンクなので、Node や tsc が実際のパスから上へたどっても、
フロントの root の `node_modules`（依存が hoist される場所）に届かない。このスクリプトは、`estate/node_modules` と `portal/node_modules` に
root の `node_modules` の react・react-dom・型・vite・tailwindcss などへのリンクを作る（既にあれば飛ばす）。

```bash
cd ~/work/legacy/01-ghost-front
bash packages/business/setup-symlinks.sh            # リンク経由で実行すると root を自分で見つける
# または root を渡す: bash ~/work/legacy/11-business/setup-symlinks.sh ~/work/legacy/01-ghost-front
```

先に `yarn install` が要る（root の `node_modules` が無いと止まる）。リンクするのは estate と portal だけ。

## 決まり・注意

- **ホストに依存しない**。ホストのコードを import しない。ホストの機能は props・Provider で受け取る
  （翻訳は `t`、news はさらに `NewsHostAdapter`）。
- **文言は翻訳を通す**。部品の中の固定の文言は `t()` を使い、訳はフロントの `packages/i18n/locales/{ja,en,zh}/<名前空間>.json` に足す。
  物件の情報・記事の本文・価格などのデータは訳さない。
- estate・news の `core` に React やブラウザの API を持ち込まない（サーバでも使う）。
- 部品を足したら `<Name>Components` と `<Name>DefaultProps` に登録する。新しい export をフロントで使うなら、フロントにも PR を出す。
- 変えたら **ビルドしてから** ホストで確かめる。配布のビルドは手元の作業フォルダ（未コミットの変更・最後の `dist`）をそのまま取り込むので、
  配布の前に main にそろえてビルドし直す。

## レビュー

PR は cross-review（エージェント同士の相互レビュー）でもレビューされる。このリポジトリでは、変更のあったパッケージごとに
`npx tsc --noEmit -p .` が走る。PR の前に、変えたパッケージで同じ型検査を通しておく。

## 詳しい文書

- [06. ビジネスライブラリと Estate](https://github.com/aidabo/jibunsee-react/blob/main/docs/development/06-business-libs-estate.md) — このライブラリの決まり、変更の流れ、Estate の通しの手順
- [01. ワークスペースとリポジトリ](https://github.com/aidabo/jibunsee-react/blob/main/docs/development/01-workspace.md) — clone の場所とリンク
- [04. フロントエンド](https://github.com/aidabo/jibunsee-react/blob/main/docs/development/04-frontend.md) — ホストの開発とテスト
- [estate/CLAUDE.md](estate/CLAUDE.md) — estate の構成メモ（英語。部品の数などは古い）
