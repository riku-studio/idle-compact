# idle-compact

[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md)

Claude Code / Claude デスクトップ版向けの mod です。セッションが約 1 時間操作されず、プロンプトキャッシュの有効期限が切れる直前（デフォルトでは 58 分後）に、自動で `/compact` を実行します。次にセッションへ戻ったときは、コンテキスト全体ではなく要約だけを再読み込みすれば済みます。

- メインの会話で各ターンが終了するとカウントダウンを開始します。新しいターンが始まるとキャンセルし、そのターンの終了後に再開します。
- コンテキストがしきい値（デフォルトでは 30,000 トークン）未満の場合はスキップします。
- アイドル状態が続く間の圧縮は 1 回だけです。手動の `/compact` や自動圧縮が行われた場合も、カウントダウンをキャンセルします。
- 圧縮が完了すると通知を表示し、圧縮前後のトークン数と、圧縮自体のトークン使用量を知らせます。

## インストール

GitHub からインストールする場合（`<owner>/<repo>` を実際のリポジトリに置き換えてください）：

```bash
claude plugin install idle-compact --marketplace <owner>/<repo>
```

または、Claude Code のターミナルセッションで `/plugin install idle-compact --marketplace <owner>/<repo>` を入力します。

Git URL またはローカルフォルダーからインストールする場合：

```bash
claude plugin marketplace add <GitのURLまたはフォルダーのパス>
```

```bash
claude plugin install idle-compact@idle-compact-local
```

デスクトップ版では、入力欄の横にある + をクリックし、Plugins → Add marketplace を選択します。リポジトリまたはパスを入力してから、Add plugin を選択してください。

## 設定

| オプション | デフォルト | 説明 |
| --- | --- | --- |
| `idleMinutes` | 58 | 最後のターンが終了してから圧縮するまでの待機時間（分）。60 未満に設定してください |
| `minTokens` | 30000 | コンテキストがこのトークン数未満の場合は圧縮をスキップします |
| `instructions` | 空 | 圧縮時に渡す要約の指示。`/compact` の後に入力するテキストに相当します |

例：`claude plugin install idle-compact@idle-compact-local --config idleMinutes=55`

## 注意事項

- 圧縮自体がコンテキスト全体を読み取り（キャッシュ読み取り料金）、要約を生成します。その後セッションに戻らない場合、この費用は無駄になります。
- 圧縮によって細部の情報が失われます。
- タイマーはセッションのプロセス内で動作します。アプリを閉じたり、セッションのプロセスが停止したりすると、圧縮は実行されません。

## テスト

```bash
claude plugin test .
```
