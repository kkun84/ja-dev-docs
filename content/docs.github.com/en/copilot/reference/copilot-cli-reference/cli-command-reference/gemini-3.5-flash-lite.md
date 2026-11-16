---
title: "GitHub Copilot CLIコマンドリファレンス"
shortTitle: "CLIコマンドリファレンス"
intro: "Copilot CLIを効果的に使用するためのコマンドとキーボードショートカットを見つけます。"
versions:
  feature: copilot
category:
  - Author and optimize with Copilot # Copilot discovery page
  - Build with Copilot CLI # Copilot CLI bespoke landing page
contentType: reference
redirect_from:
  - /copilot/reference/cli-command-reference
docsTeamMetrics:
  - copilot-cli
---

## コマンドラインコマンド

| コマンド                | 目的                                            |
|------------------------|----------------------------------------------------|
| `copilot`              | インタラクティブなユーザーインターフェイスを起動します。             |
| `copilot app`          | 現在のディレクトリでGitHub Copilot appを開き、新しいセッションに直接ディープリンクします。ディープリンクを処理できない場合はブラウザーでアプリのダウンロードページを開くフォールバックが行われます。ブラウザーが利用できない場合は、手動で開くためのURLが出力されます。 |
| `copilot completion SHELL` | Copilot CLIのタブ補完を有効にするために使用できる、選択したシェルのシェルスクリプトを出力します。サポートされているシェル: `bash`、`zsh`、`fish`。[`copilot completion`の使用](#using-copilot-completion)を参照してください。 |
| `copilot config [KEY] [VALUE]` | インタラクティブセッションの外で、コマンドラインからCopilotの設定を読み取ったり変更したりします。[`copilot config`の使用](#using-copilot-config)を参照してください。 |
| `copilot help [TOPIC]` | ヘルプ情報を表示します。ヘルプのトピックには、`billing`、`config`、`commands`、`environment`、`logging`、`monitoring`、`permissions`、`providers`、`sandbox`が含まれます。 |
| `copilot init`         | このリポジトリのCopilotカスタムインストラクションを初期化します。 |
| `copilot login [OPTION]` | OAuthを介してCopilotで認証します。[`copilot login`オプション](#copilot-login-options)を参照してください。 |
| `copilot mcp`          | コマンドラインからMCPサーバーの設定を管理します。 |
| `copilot memories import FILE` | JSONLファイルから準備された記憶をインポートします。[記憶のインポート](#importing-memories)を参照してください。 |
| `copilot plugin`       | プラグインおよびプラグインマーケットプレイスを管理します(一覧表示、有効化、無効化、アンインストールなど)。`copilot plugins` (複数形)はレガシーなエイリアスです。[GitHub Copilot CLIプラグインリファレンス](/copilot/reference/copilot-cli-reference/cli-plugin-reference)を参照してください。 |
| `copilot instruction` | 現在の作業ディレクトリで見つかったカスタムインストラクションソースを非対話形式で一覧表示します。[`copilot instruction`の使用](#using-copilot-instruction)を参照してください。 |
| `copilot lsp`          | 設定された言語サーバーを非対話形式で一覧表示します。[`copilot lsp`の使用](#using-copilot-lsp)を参照してください。 |
| `copilot sandbox ca`   | インタラクティブセッションの外からサンドボックスのプロキシ認証局を管理します。[`copilot sandbox ca`の使用](#using-copilot-sandbox-ca)を参照してください。 |
| `copilot skill`        | コマンドラインからエージェントスキルを管理します(スキルのリスト表示、追加、削除、有効化、無効化)。[非対話形式でのスキルの管理](#managing-skills-non-interactively)を参照してください。 |
| `copilot update`       | 最新バージョンをダウンロードしてインストールします。特定のバージョンを使用するには、[GitHub Copilot CLIプログラマティックリファレンス](/copilot/reference/copilot-cli-reference/cli-programmatic-reference#pinning-the-cli-version)の「CLIバージョンのピン留め」を参照してください。 |
| `copilot version`      | バージョン情報を表示し、アップデートを確認します。 |
| `copilot workflow run WORKFLOW-NAME` | チャットプロンプトを送信せずに、既存の動的ワークフローを直接実行します。実行が完了または停止するのを待ちます。[`copilot workflow run`の使用](#using-copilot-workflow-run)を参照してください。 |

### `copilot login`オプション

| オプション                  | 目的                                                                                       |
|-------------------------|-----------------------------------------------------------------------------------------------|
| `--host HOST`         | GitHubホストURL (デフォルト: `https://github.com`)。データresidencyを使用するGitHub Enterprise Cloudインスタンス(例: `https://example.ghe.com`)で認証する場合に使用します。 |
| `--web-flow`          | ブラウザーベース(ウェブ)の認証フローを強制します。これはローカルターミナルでのデフォルトです。 |
| `--device-code`       | OAuthデバイスコードフローを強制します。これはリモートターミナルやCIでのデフォルトです。 |
| `--with-token`        | OAuthフローを開始する代わりに、標準入力から認証トークンを読み取ります。標準入力がターミナルの場合、入力をエコーバックせずにプロンプトを表示します。`--web-flow`および`--device-code`と競合します。 |

ローカルターミナル、またはブラウザーに到達できる非TTYローカルプロセス(デスクトップOS、またはディスプレイやブラウザーシグナルを備えたLinuxなど)では、デフォルトの認証モードはブラウザーベースのウェブフローです。CLIがブラウザーを開いて承認を行い、ローカルループバックコールバックで結果をキャプチャします。リモートターミナル(SSH、GitHub Codespaces、devコンテナーなど)やCIでは、通常ブラウザーがループバックポートに到達できないため、CLIはデフォルトでOAuthデバイスコードフローを使用します。自動的に選択されたフローを上書きするには、`--web-flow`または`--device-code`を使用してください。

完了後、認証トークンはシステムの資格情報ストアに安全に保存されます。資格情報ストアが見つからない場合、トークンは`~/.copilot/` (または設定されている場合は`COPILOT_HOME`で指定されたディレクトリ)の下のプレーンテキストの設定ファイルに保存されます。

または、Copilot CLIは環境変数に見つかった認証トークンを使用します。優先順位の順に次の変数が確認されます: `COPILOT_GITHUB_TOKEN`、`GH_TOKEN`、`GITHUB_TOKEN`。この方法は、自動化などのヘッドレスでの使用に最適です。

サポートされているトークンの種類には、「Copilot Requests」権限を持つfine-grained personal access tokens (v2パソナ/ PAT)、Copilot CLIアプリからのOAuthトークン、およびGitHub CLI (`gh`)アプリからのOAuthトークンが含まれます。従来のpersonal access tokens (`ghp_`)はサポートされていません。

**例:**

```shell
# Authenticate with github.com
copilot login

# Authenticate with GitHub Enterprise Cloud (data residency)
copilot login --host https://example.ghe.com

# Force the device code flow, for example on a remote terminal
copilot login --device-code

# Force the browser (web) flow, for example on a local terminal
copilot login --web-flow

# Read a token from standard input, bypassing the OAuth flow entirely
copilot login --with-token < mytoken.txt

# Use a fine-grained PAT via environment variable
COPILOT_GITHUB_TOKEN=github_pat_... copilot
```

### `copilot completion`の使用

コマンド`copilot completion SHELL`は、指定されたシェル(bash、zsh、またはfish)用のスクリプトを出力します。

このスクリプトを読み込む(またはシェルの補完ディレクトリに書き込む)ことにより、ターミナルで`copilot`のサブコマンド、コマンドオプション、およびコマンドオプションの既知の値の選択肢に対するタブ補完を有効にできます。`copilot config`の場合、補完には設定キー、ブール値および列挙値、パス値設定のファイルやディレクトリも含まれます。

#### 使用例

Bash (現在のセッションのみ):

```bash copy
source <(copilot completion bash)
```

Bash (永続的、Linux):

```bash copy
copilot completion bash | sudo tee /etc/bash_completion.d/copilot
```

Zsh —出力を$fpath上のディレクトリに書き込みます。このコマンドを実行した後にシェルを再起動します:

```shell copy
copilot completion zsh > "${fpath[1]}/_copilot"
```

Fish:

```shell copy
copilot completion fish > ~/.config/fish/completions/copilot.fish
```

### 非対話形式でのプラグインの管理

インタラクティブセッションを開かずに、コマンドラインからプラグインのインストール、一覧表示、更新、有効化、無効化、アンインストールを行うには、`copilot plugin`を使用します。`copilot plugins` (複数形)は同じコマンドのレガシーなエイリアスです。完全なコマンドおよびオプションのリファレンスについては、[GitHub Copilot CLIプラグインリファレンス](/copilot/reference/copilot-cli-reference/cli-plugin-reference)を参照してください。

### `copilot config`の使用

インタラクティブセッションの外で、コマンドラインからCopilotの設定を読み取って変更するには、`copilot config`を実行します。これは、`/settings` (または`/config`)スラッシュコマンドの非対話形式の代替手段です。設定ファイルとそのキーの詳細については、[GitHub Copilot CLI設定ディレクトリ](/copilot/reference/copilot-cli-reference/cli-config-dir-reference#settingsjson)を参照してください。

```bash
# Print a setting
copilot config theme

# Set a nested value (dot notation)
copilot config footer.showQuota off

# Append an item to a list setting (added only if not already present)
copilot config allowedUrls github.com

# Append an item that starts with a dash
copilot config powershellFlags -- -NoProfile

# Remove a key, or one list item
copilot config --rm theme
copilot config --rm allowedUrls github.com

# List settings as key=value lines, or as JSON
copilot config --list
copilot config --repo --list --json
```

| オプション/引数 | 説明                                                                                |
| --------------- | -------------------------------------------------------------------------------------------- |
| `KEY`           | ドット表記の設定キー(例: `footer.showQuota`)。 |
| `VALUE`         | 設定、追加、または`--rm`を使用してリストから削除する値。 |
| `--list`        | 設定を`key=value`行として一覧表示します。`KEY`/`VALUE`/`--rm`と競合します。 |
| `--json`        | `--list`をJSONとして出力します。`--list`が必要です。 |
| `--rm`          | キー、またはリストから指定された項目のみを削除します。`KEY`が必要です。 |
| `--global`      | ユーザー設定ファイルを使用します(デフォルト)。`--repo`/`--local`と競合します。 |
| `--repo`        | リポジトリの`.github/copilot/settings.json`を使用します。`--global`/`--local`と競合します。 |
| `--local`       | リポジトリの`.github/copilot/settings.local.json`を使用します。`--global`/`--repo`と競合します。 |

値は設定の型と一致している必要があります:ブール値の場合は`on`/`off`または`true`/`false`、数値設定の場合は数値、列挙値の場合は許可された選択肢です。リストを読み取ると1行に1項目が出力され、グループを読み取るとJSONが出力されます。未設定のキーはステータス`1`で終了します。機密の値は出力から隠されます。

コマンドはデフォルトでユーザー設定ファイル(`~/.copilot`内の`settings.json`、または設定されている場合は`$COPILOT_HOME`内)を使用します。`--repo`および`--local`は、リポジトリが上書きできる設定のみを受け入れます。[GitHub Copilot CLI設定ディレクトリ](/copilot/reference/copilot-cli-reference/cli-config-dir-reference#repository-settings-githubcopilotsettingsjson)を参照してください。利用可能な設定を表示するには`copilot help config`を実行してください。

### `copilot instruction`の使用

現在の作業ディレクトリで見つかったカスタムインストラクションソースを非対話形式で一覧表示するには、`copilot instruction list`を実行します。これは、廃止された`copilot plugins list --kind instruction`に置き換わるものです。

```bash
copilot instruction list
copilot instruction list --json
```

| オプション                | 説明                                                                       |
|-----------------------|------------------------------------------------------------------------------------|
| `--json`              | テキストの代わりにJSONを出力します。                                                            |
| `--config-dir=DIRECTORY` | 設定ディレクトリへのパス。このオプションは非推奨です。代わりに`COPILOT_HOME`を使用してください。 | <!-- markdownlint-disable-line GHD046 -->

各`--json`エントリは`{ id, label, description?, location, type, sourcePath, defaultDisabled, applyTo? }`の形状を持っています。この一覧表示では、プラグインによって提供されたインストラクションがグローバルなユーザー設定に対してのみ解決されます。信頼されたリポジトリまたは管理された設定によって有効化されたインストラクションは、ライブセッションでは適用される場合でも、ここには表示されないことがあります。

### `copilot lsp`の使用

設定された言語サーバーを非対話形式で一覧表示するには、`copilot lsp list`を実行します。これは、廃止された`copilot plugins list --kind lsp`に置き換わるものです。このコマンドは検査専用です。言語サーバーの開始、停止、または再読み込みを行うには、インタラクティブセッションで`/lsp`スラッシュコマンドを使用してください。

```bash
copilot lsp list
copilot lsp list --json
```

| オプション                | 説明                                                                       |
|-----------------------|------------------------------------------------------------------------------------|
| `--json`              | テキストの代わりにJSONを出力します。                                                            |
| `--config-dir=DIRECTORY` | 設定ディレクトリへのパス。このオプションは非推奨です。代わりに`COPILOT_HOME`を使用してください。 | <!-- markdownlint-disable-line GHD046 -->

各`--json`エントリは`{ id, fileExtensions?, sourcePlugin? }`の形状を持っています。

カスタムエージェントおよびセッションスコープのフックは、`copilot instruction`、`copilot lsp`、`copilot plugin`、`copilot mcp`、`copilot skill`の対象外です。これらはすべてライブセッションを必要とします。

### 記憶のインポート

JSONLファイルからユーザーレベルの設定とリポジトリレベルの事実を検証およびインポートするには、`copilot memories import`を使用します。

```shell
copilot memories import PATH-TO-FILE
```

| オプション | 説明 |
| --- | --- |
| `--dry-run` | 認証や記憶の送信を行わずに、ファイル全体を検証します。 |
| `--on-conflict skip\|error` | 競合するレコードをスキップするか、エラーとして扱います。デフォルトは`error`です。 |
| `--output json` | 人間が読める形式のテキストではなく、インポート結果をJSONとして返します。 |

いずれかの行のスキーマ検証が失敗した場合、レコードは送信されません。検証が成功した後、レコードは個別に送信されるため、サービス障害により部分的なインポートが発生する可能性があります。レコードごとの結果を確認し、失敗したレコードのみを再試行してください。`--on-conflict skip`オプションは、入力ファイル内の重複IDや、記憶サービスによって報告された競合をスキップします。インポートの再実行によって重複した記憶が回避されることは保証されません。ファイル形式と例については、[GitHub Copilotの記憶を手動で作成する](/copilot/how-tos/use-copilot-agents/copilot-memory/create-memories#importing-memories-with-copilot-cli)を参照してください。

### `copilot workflow run`の使用

インタラクティブセッションを開かずに、拡張機能によって提供される動的ワークフローを実行します:

```shell copy
copilot workflow run WORKFLOW-NAME [OPTIONS]
```

`WORKFLOW-NAME`は、拡張機能ファイルのパスではなく、拡張機能によって登録された名前です。コマンドは実行を開始し、完了、一時停止、またはその他の停止を待ちます。

| オプション | 説明 |
| ------ | ----------- |
| `--args JSON`または`--args @PATH` | ワークショップの入力を指定します。ここでは"JSON"をインラインJSONに置き換えるか、"PATH"をUTF-8 JSONファイルのパスに置き換えます。省略した場合はデフォルトで`{}`になります。受け付けられる入力はワークフローによって異なります。 |
| `--result-file PATH` | 返された値を標準出力に含める代わりに、JSONとしてファイルに書き込みます。書き込みは、ワークフローが完了し、結果が返された場合にのみ行われます。既存のファイルは、新しい結果の書き込みが正常に完了した後にのみ置き換えられます。 |
| `-s`, `--silent` | 進行状況の出力を抑制します。ファイルへの出力が指定されていない限り、最終結果は引き続き出力されます。エラーやステータスの診断情報は、標準エラーに出力される場合があります。 |
| `--output-format FORMAT` | 標準出力の形式を`text` (デフォルト)または`json` (JSONL、1行につき1つのJSONレコード)に設定します。最終的なワークフローレコードのみを受け取るには、`json`と`--silent`を組み合わせて使用します。`--result-file`のJSON形式は変更されません。 |

相対的な引数ファイルおよび結果ファイルのパスは、作業ディレクトリから解決されます。`--silent`が指定されていない場合、出力にはワークフローによって報告されたフェーズと進行状況メッセージが含まれます。

このコマンドは、CLIの認証、モデル、権限、およびサンドボックスの設定を使用します。`--allow-tool`や`--allow-url`などの権限オプションは、ワークフローのエージェントに適用されます。権限の承認プロンプトは表示されません。

プロンプトおよびセッションモードのオプションをこのコマンドと組み合わせることはできません。例として、`-p`、`-i`、`--agent`、`--fleet`、`--autopilot`、`--resume`、`--continue`があります。パイプされた標準入力は、プロンプトまたはワークフローの引数としては使用されません。

詳細については、[Using dynamic workflows](/copilot/how-tos/use-copilot-agents/use-dynamic-workflows#running-a-dynamic-workflow-from-the-command-line)および[GitHub Copilot CLI programmatic reference](/copilot/reference/copilot-cli-reference/cli-programmatic-reference#running-dynamic-workflows)を参照してください。

### `copilot sandbox ca`の使用

対話型セッションの外から(TTYなしの管理対象デバイスのプロビジョニング時など)、サンドボックスのプロキシ証明機関を管理するには、`copilot sandbox ca`を実行します。これは、`/sandbox ca`スラッシュコマンド(`create`、`trust`、`rotate`、`remove`)に加え、`status`チェックをミラーリングしたものです。

```bash
copilot sandbox ca status
copilot sandbox ca create
copilot sandbox ca trust
copilot sandbox ca rotate
copilot sandbox ca remove
```

| サブコマンド                     | 説明                                                               |
|---------------------------------|-----------------------------------------------------------------------------|
| `copilot sandbox ca status`    | 何も変更せずに信頼状態を報告します。 |
| `copilot sandbox ca create`    | 必要に応じて、証明機関を信頼せずに作成します。 |
| `copilot sandbox ca trust [CA.PEM]` | OSの信頼ストアに機関(デフォルト:独自の機関)を追加します。 |
| `copilot sandbox ca rotate`    | 現在の信頼状態を維持しながら、機関を置き換えます。 |
| `copilot sandbox ca remove`    | OSの信頼ストアから機関を削除します。バンドルベースのパスは引き続き機能します。 |

証明機関はそのユーザーのCopilot CLIホームディレクトリに保存されるため、`SYSTEM`や`root`として昇格した状態ではなく、Copilot CLIを実行するユーザーとしてこれらのコマンドを実行してください。無人セットアップのガイダンスについては`copilot sandbox ca trust --help`を実行してください。CLIの残りの部分と同様に、`--config-dir` (または`COPILOT_HOME`)はこれらのコマンドのデフォルト以外のCopilot CLIホームを対象にします。

## セッションサイドバー

セッションサイドバーは、現在の会話の横にドッキングされるパネルであり、ローカルのGitHub Copilot CLIセッションをすばやく操作する方法を提供します。

サイドバーにフォーカスがあるときは、次のキーボードショートカットを使用できます。

| ショートカット | 目的 |
|----------|---------|
| <kbd>←</kbd> | 会話からサイドバーを開き、フォーカスをサイドバーに移動します(Vim: `h`)。 |
| <kbd>→</kbd> | フォーカスを会話に戻します。もう一度押すとサイドバーが閉じます(Vim: `l`)。 |
| <kbd>↑</kbd>/<kbd>↓</kbd> | サイドバー内のセッション間を移動します(`k` / `j`も使用可能)。 |
| <kbd>Enter</kbd> | 選択したセッションを開き、フォーカスを会話に戻します。 |
| `n` | 新しいセッションを開始します。 |
| `x`を2回押す | 選択したセッションを閉じます。 |
| <kbd>↑</kbd>の後に<kbd>Tab</kbd> | セッションリストの一番上から、<kbd>↑</kbd>でヘッダーボタン(**←**サイドバーを閉じる、**+**新しいセッション)に移動します。<kbd>Tab</kbd>でそれらを切り替えます。 |
| `?` | サイドバーのヘルプを表示します。 |

サイドバーはマウス操作にも対応しています。

| ジェスチャ | 目的 |
|---------|---------|
| セッションをクリックする | そのセッションに切り替えて会話に戻ります。 |
| セッションをダブルクリックする | そのセッションに切り替えてサイドバーにとどまります。 |
| 区切り線をドラッグする | サイドバーのサイズを変更します。 |
| サイドバーにマウスオーバーしてスクロールする | セッションリストをスクロールします。 |
| ヘッダーボタンをクリックする | **←**でサイドバーを閉じ、**+**で新しいセッションを開始します。 |
| セッションの右側にマウスオーバーする | 閉じるボタンを表示します(`sidebar.showCloseButton`が必要です)。 |

### セッションのステータスインジケーター

サイドバーの各セッションには、現在の状態を示すインジケーターが表示されます。

| インジケーター | 意味 |
|-----------|---------|
| 緑色の`●` (常時点灯) | セッションはアイドル状態です。次のプロンプトを待っています。 |
| 紫色の`●` (点滅) | ターンが実行中です。エージェントがアクティブに作業しています。 |
| 青色の`●` (常時点灯) | 別のセッションにいる間にエージェントがターンを完了しましたが、まだそのセッションを開いていません。セッションを開くと、この未読状態がクリアされます。 |
| 黄色の`●` (常時点灯) | エージェントがエラーで停止したか、注意を必要としています。 |
| 灰色の`○` (常時点灯) | 再開可能なセッションです。保存されていますが、現在は実行されていません。 |
| 黄色の`!` | 続行するための権限がセッションに必要です。 |
| 黄色の`?` | 質問への回答または選択をセッションが待っています。 |

上記の色の名前は目安です。正確な色合いは、ターミナルの配色や`/theme`で設定したテーマによって異なります。たとえば、`github`テーマは独自の固定色を使用し、`colorblind`テーマは緑と赤の代わりに青と黄色を使用します。フルカラーをサポートしていないターミナルでは、ドットにターミナル独自の緑、青、黄色が使用されます。

上記の色名はデフォルトのチャットモードに関連しています。プランモードやオートパイロットモードでは、一部のドットの色が異なります。それらのモードでは、セッション名のテキストの色も変更されます。色はターミナル、テーマ、モードによって変化する可能性があるため、常時点灯または点滅の形状と、`!`、`?`、`○`のマーカーが最も信頼できる手がかりになります。

### セッションサイドバーの設定

対話型CLIセッションで`/settings sidebar`スラッシュコマンドを使用して、セッションサイドバーのこれらの設定を調整します。

<!-- This table is written as an HTML table, rather than Markdown, so that the Description column can be given more width. -->
<table>
  <colgroup>
    <col width="25%">
    <col width="65%">
    <col width="10%">
  </colgroup>
  <thead>
    <tr>
      <th>設定</th>
      <th>説明</th>
      <th>デフォルト</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>sidebar.enabled</code></td>
      <td>セッションサイドバーの表示を許可します。</td>
      <td>オン</td>
    </tr>
    <tr>
      <td><code>sidebar.showResumableSessions</code></td>
      <td>The sidebar includes previous sessions that you can resume. When set to <code>off</code>, only active sessions are listed. Changes to this setting take effect the next time Copilot CLI is started.</td>
      <td>オン</td>
    </tr>
    <tr>
      <td><code>sidebar.showHeaderButtons</code></td>
      <td>サイドバーを折りたたむため(<strong>←</strong>)および新しいセッションを開始するため(<strong>+</strong>)のボタン行をサイドバーの上部に表示します。</td>
      <td>オン</td>
    </tr>
    <tr>
      <td><code>sidebar.showCloseButton</code></td>
    <td><kbd>X</kbd>をクリックする代わりとして、サイドバー内のセッションの右側にマウスを移動すると、<strong>セッションを閉じる</strong>ボタンが表示されます。これをクリックし、もう一度クリックして確認します。セッションが実行中であったかどうかにかかわらず、完全に削除されます。このようにして削除されたセッションを再開することはできません。</td>
      <td>オフ</td>
    </tr>
    <tr>
      <td><code>sidebar.hoverFocus</code></td>
      <td>マウスポインターの位置に応じて、メインのCLIタブからサイドバーにフォーカスが変更されます。</td>
      <td>オフ</td>
    </tr>
    <tr>
      <td><code>sidebar.coloredHints</code></td>
      <td>サイドバーが開いていて会話にフォーカスがあるときは、注意を引くためにサイドバーのアクセントカラーで<strong>サイドバーを使用</strong>ヒントを表示します。オフの場合、他のヒントと同じ色が使用されます。サイドバーが閉じているときは、常に他のヒントと同じ色が使用されます。</td>
      <td>オン</td>
    </tr>
    <tr>
      <td><code>sidebar.accentActiveSession</code></td>
      <td>サイドバーでのセッション選択のハイライトを変更します。オンの場合、会話で現在開いているセッションにメインのハイライトが適用されます。オフの場合、キーボードの上下矢印(またはマウス)で選択されたセッションにメインのハイライトが適用されます。</td>
      <td>オン</td>
    </tr>
  </tbody>
</table>

セッションサイドバーの詳細については、[Working with multiple GitHub Copilot CLI sessions](/copilot/how-tos/copilot-cli/use-copilot-cli/work-with-multiple-sessions)を参照してください。

## 対話型インターフェイスにおけるグローバルショートカット

| ショートカット                            | 目的                               |
|-------------------------------------|---------------------------------------|
| `@ FILENAME`                        | ファイルの内容をコンテキストに含めます。 |
| `# NUMBER`                          | GitHubのissueまたはpull requestをコンテキストに含めます。 |
| `! COMMAND`                                         | Copilotをバイパスして、ローカルシェルでコマンドを実行します。空のプロンプトで`!`のみを入力すると、複数のシェルコマンドを順番に実行するためのシェルモードに入ります。空のプロンプトで<kbd>Esc</kbd>または<kbd>Ctrl</kbd>+<kbd>C</kbd>を押すと、シェルモードを終了します。 |
| `$`                                 | プロンプトで`$`のみを入力し、<kbd>Enter</kbd>キーを押すと、セッションの作業ディレクトリをルートとする実際の対話型シェル(Unixでは`$SHELL`、Windowsでは`%COMSPEC%`)にターミナルが引き渡されます。`!`シェルモードとは異なり、これによりCLI UIが完全に一時停止されるため、ジョブ制御、フルスクリーンアプリ、タブ補完、および色がネイティブに機能します。シェルを終了して(Unixでは`exit`または<kbd>Ctrl</kbd>+<kbd>D</kbd>) CLIに戻ります。実際のTTY上のローカルで信頼されたアイドル状態のセッションに対してのみ有効になります。エンタープライズ管理設定で無効にすることができます。デフォルトで有効になっています。`shellShortcut`設定で無効にします。[GitHub Copilot CLI configuration directory](/copilot/reference/copilot-cli-reference/cli-config-dir-reference#configuration-file-settings)を参照してください。 |
| `?`                                 | クイックヘルプを開きます(空のプロンプトの場合)。もう一度押すと非表示になり、リテラルの`?`が挿入されます。 |
| <kbd>Esc</kbd>                      | 現在の操作をキャンセルします。2回押すと、実行中のターンを中断するか、メインエージェントがアイドル状態のときにバックグラウンドエージェントを停止します。ローカルセッションで、モデルがまだターンの回答を開始していない場合、2回目の押下により、編集用にプロンプトボックスにプロンプトが再び表示されます。 |
| <kbd>Ctrl</kbd>+<kbd>C</kbd>        | 操作のキャンセル/入力のクリア。2回押すと終了します。 |
| <kbd>Ctrl</kbd>+<kbd>D</kbd>        | シャットダウン。                             |
| <kbd>Ctrl</kbd>+<kbd>G</kbd>        | 外部エディター(`$EDITOR`)でプロンプトを編集します。 |
| <kbd>Ctrl</kbd>+<kbd>L</kbd>        | 画面をクリアします。                     |
| <kbd>Ctrl</kbd>+<kbd>Enter</kbd>または<kbd>Ctrl</kbd>+<kbd>Q</kbd> | エージェントが実行中のときに送信するメッセージをキューに入れます。 |
| <kbd>Ctrl</kbd>+<kbd>R</kbd>        | コマンド履歴を逆方向に検索します。 |
| <kbd>Ctrl</kbd>+<kbd>Space</kbd>    | 音声入力を有効または無効にします（<kbd>Ctrl</kbd>+<kbd>X</kbd>を押してから`v`を押すのと同じです）。これは、ターミナルとOSがその入力を通す場合のみ機能します。OSやターミナルのキーバインドでこのキー割り当てを解放する必要がある場合があります。代わりに<kbd>Ctrl</kbd>+<kbd>X</kbd>を押してから`v`を使用してください。 |
| <kbd>Ctrl</kbd>+<kbd>V</kbd> | クリップボードから添付ファイルとして貼り付けます。 |
| <kbd>Alt</kbd>+<kbd>V</kbd> | クリップボードから画像を添付ファイルとして貼り付けます。 |
| <kbd>Ctrl</kbd>+<kbd>X</kbd>を押してから`/`  | プロンプトの入力を開始した後に、スラッシュコマンドを実行できるようにします。たとえば、プロンプトを再入力せずにモデルを変更したい場合などに使用します。 |
| <kbd>Ctrl</kbd>+<kbd>X</kbd>を押してから`e`  | 外部エディタ（`$EDITOR`）でプロンプトを編集します。 |
| <kbd>Ctrl</kbd>+<kbd>X</kbd>を押してから`b`  | 実行中のタスクまたはシェルコマンドをバックグラウンドに移動します。 |
| <kbd>Ctrl</kbd>+<kbd>X</kbd>を押してから`g`  | オートパイロットの目標パネルを折りたたむか展開します。 |
| <kbd>Ctrl</kbd>+<kbd>X</kbd>を押してから`h`  | 現在のセッションのサイドバーを非表示にします。 |
| <kbd>Ctrl</kbd>+<kbd>X</kbd>を押してから`o`  | タイムラインから最新のリンクを開きます。 |
| <kbd>Ctrl</kbd>+<kbd>X</kbd>を押してから`v`  | 音声入力を有効または無効にします。 |
| <kbd>Ctrl</kbd>+<kbd>X</kbd>を押してから`x`  | 現在のセッションを閉じます。 |
| <kbd>Ctrl</kbd>+<kbd>Z</kbd>        | プロセスをバックグラウンドに一時停止します（Unix）。 |
| <kbd>Shift</kbd>+<kbd>Enter</kbd>または<kbd>Option</kbd>+<kbd>Enter</kbd>（Mac）/ <kbd>Alt</kbd>+<kbd>Enter</kbd>（Windows/Linux） | 入力に改行を挿入します。 |
| <kbd>Shift</kbd>+<kbd>Tab</kbd>     | 標準、計画、およびオートパイロットモードの間で切り替えます。 |

ローカルセッションでは、現在のタスクが完了した後に順番に実行するプロンプト、シェルコマンド、およびサポートされているスラッシュコマンドをキューに入れることができます。エージェントの実行中に<kbd>Ctrl</kbd>+<kbd>Q</kbd>を押すと、現在の入力をキューに入れることができます。キューに入れられた項目には「保留中（pending）」ラベルが表示され、実行前であれば個別にキャンセルできます。

プロンプトボックスが空の状態で<kbd>↑</kbd>を押すと、直近にキューに入れたプロンプトやステアリングプロンプトをプロンプトボックスに呼び戻し、再送信する前に編集できます。これが可能な場合、キューの横に「取得（recall）」のヒントが表示されます。送信済みコマンド履歴を破壊せずにナビゲートするには、代わりに<kbd>Ctrl</kbd>+<kbd>P</kbd>を使用してください。

ローカルセッションにおいて、モデルがまだ回答を開始していない送信済みプロンプトに対して<kbd>Esc</kbd>を2回押すと、プロンプトがプロンプトボックスに戻され、会話から削除されます。モデルがすでに回答を開始している場合は、2回目の<kbd>Esc</kbd>キーの押下によって実行中のターンが中断されます。その後、プロンプトボックスが空の状態で<kbd>↑</kbd>を押すと、プロンプトがプロンプトボックスに復元されます。

## 対話型インターフェイスにおけるタイムラインのショートカット

| ショートカット                     | 目的                               |
|------------------------------|---------------------------------------|
| <kbd>Ctrl</kbd>+<kbd>F</kbd> | タイムライン検索を開きます。 |
| <kbd>Ctrl</kbd>+<kbd>O</kbd> | プロンプトに入力がない状態で、Copilotの応答タイムラインにある最近のアイテムを展開して詳細を表示します。 |
| <kbd>Ctrl</kbd>+<kbd>E</kbd> | プロンプトに入力がない状態で、Copilotの応答タイムラインにあるすべてのアイテムを展開します。 |
| <kbd>Ctrl</kbd>+<kbd>T</kbd> | 応答内の推論の表示を展開または折りたたみます。 |
| <kbd>Page Up</kbd> / <kbd>Page Down</kbd> | タイムラインを1ページ単位で上下にスクロールします。 |

## タスクダイアログのショートカット

タスクダイアログが開いているとき（`/tasks`経由で開かれます）：

| ショートカット | 目的 |
|----------|---------|
| <kbd>↑</kbd> / <kbd>K</kbd> | 選択範囲を上に移動します。 |
| <kbd>↓</kbd> / <kbd>J</kbd> | 選択範囲下に移動します。 |
| <kbd>Enter</kbd> | タスクの詳細を表示するか、選択したサブエージェント自身のセッションビューにテレポートします。 |
| `a` | ネストされたすべてのサブエージェントレベルの表示と、このレベルのタスクのみの表示を切り替えます。 |
| `f` | アクティブなサブエージェントやシェルだけでなく、完了したものも表示するように切り替えます。 |
| <kbd>X</kbd> | 選択したアクティブなタスクを強制終了します。 |
| <kbd>R</kbd> | 選択した完了済みタスクを削除します。 |
| <kbd>B</kbd> | 選択した同期タスクをバックグラウンドに昇格させます。 |
| <kbd>Esc</kbd> | ダイアログを閉じます（またはリストに戻ります）。 |

独自のネストされたサブエージェントを生成するサブエージェントはインデントされたツリーとして表示され、テレポート先の行は「current」としてハイライトされます。サブエージェントのビューにドリルダウンしている間は、メインセッションと同様にプロンプトボックスからステアリングメッセージを送信できます。

## 中断されたセッションの復元

クラッシュやマシンの再起動などにより、CLIプロセスが終了したときにセッションが開いたままだった場合、次回の`copilot`の起動時にセッションの復元を提案し、どのセッションを復元するか、あるいは新しく開始するかを選択できます。エージェントが処理の途中で中断されていたセッションは、復元されると自動的にその作業を再開します。

この復元動作は、起動ダイアログがリメイクされるまでの間、一時的にオプトイン方式になっています。有効にするには、`COPILOT_ENABLE_INTERRUPTED_SESSION_RESTORE`環境変数を`1`に設定してください。[環境変数](#environment-variables)を参照してください。

## セッションピッカーのショートカット

セッションピッカーが開いているとき（`/resume`または`--continue`経由で開かれます）：

| ショートカット | 目的 |
|----------|---------|
| <kbd>↑</kbd>/<kbd>↓</kbd> | 選択範囲を上下に移動します。 |
| <kbd>Enter</kbd> | 選択したセッションを開きます。 |
| `s` | ソート順を循環させます：関連度（relevance）→作成日時（created）→名前（name）→最終使用日時（last used）。 |
| <kbd>Tab</kbd> | ローカルタブとリモートタブを切り替えます。 |
| `x` | 選択したセッションを削除します。 |
| <kbd>Esc</kbd> | ピッカーを閉じます。 |

セッションは次のモードでソートされます：

| モード | 説明 |
|------|-------------|
| `relevance` | 現在の作業ディレクトリとの一致度に基づいてセッションのスコアを付けます（デフォルト）。 |
| `last used` | 最も最近変更されたセッションを最初に表示します。 |
| `created` | 最も最近作成されたセッションを最初に表示します。 |
| `name` | セッション名順（アルファベット順）でソートします。名前のないセッションは末尾に配置されます。 |

別のウィンドウですでに開いているセッションは、関連度以外のすべてのソートモードで最上部に浮動表示されます。作業ディレクトリのコンテキストが利用できない場合、`relevance`モードはスキップされます。

## 会話開始前の環境ピッカー

新しいセッションで最初のメッセージを送信する前に、空のプロンプトボックスで<kbd>Ctrl</kbd>+<kbd>E</kbd>を押すと、会話を実行する環境（ローカルマシンまたはクラウド環境）を選択できます。環境は最初のメッセージを送信したときにプロビジョニングされます。

> [!NOTE]
> 環境ピッカーを使用するには、アカウントでクラウドセッションが利用可能である必要があります。これは`--remote`、`--no-remote`、`--remote-export`、`--no-remote-export`、および`--connect`オプションと同じ要件です。[コマンドラインオプション](#command-line-options)を参照してください。

会話が開始されると、<kbd>Ctrl</kbd>+<kbd>E</kbd>は他の動作に戻ります。入力中にカーソルを行末に移動する、または空のプロンプトボックスでタイムライン内のすべてのアイテムを展開する動作になります。[対話型インターフェイスにおけるナビゲーションショートカット](#navigation-shortcuts-in-the-interactive-interface)および[対話型インターフェイスにおけるタイムラインのショートカット](#timeline-shortcuts-in-the-interactive-interface)を参照してください。

## サイドバーおよびセッションタブのショートカット

現在のセッションのサイドバーを使用すると、現在のセッションを離れることなく、セッションの閲覧や切り替えを行うことができます。プロンプトボックスが空の状態で<kbd>←</kbd> / <kbd>→</kbd>を押すと、「閉じた状態」「タイムラインにフォーカス」「サイドバーにフォーカス」の3つの状態のフォーカスサイクルを移動できます。`sidebar`設定を使用してサイドバーを完全に無効にすることもできます。[GitHub Copilot CLI configuration directory](/copilot/reference/copilot-cli-reference/cli-config-dir-reference#configuration-file-settings)を参照してください。

| ショートカット | 目的 |
|----------|---------|
| <kbd>←</kbd>（現在のタブ、閉じた状態） | サイドバーを開きます。タイムラインにフォーカスが維持されます。 |
| <kbd>←</kbd>（タイムラインにフォーカス） | フォーカスをサイドバーに移動します。 |
| <kbd>→</kbd>（サイドバーにフォーカス） | フォーカスをタイムラインに戻します。 |
| <kbd>→</kbd>（タイムラインにフォーカス） | サイドバーを閉じます。 |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | タブ（**Current**、**Sessions**など）を切り替えます。 |
| <kbd>↑</kbd> / <kbd>↓</kbd>（サイドバーにフォーカス） | 選択カーソルを移動します。`j` / `k`もエイリアスとして使用できます。 |
| <kbd>Enter</kbd>（サイドバーにフォーカスがある状態） | フォアグラウンドセッションを選択したカードに切り替えます。 |
| `n`（サイドバーにフォーカスがある状態） | 新しいバックグラウンドセッションを起動し、フォアグラウンドに表示します。 |
| `s`（サイドバーにフォーカスがある状態） | 並び替え順を切り替えます（recent → created → name → none）。 |
| `x`、`x`（サイドバーにフォーカスがある状態） | 選択したカードを閉じます（1回のキー入力で有効化され、閉じる前に赤色で表示されます）。 |

サイドバーの境界線をドラッグしてサイズを変更できます。また、使用可能な最小幅を下回ると自動的に折りたたまれます。各カードには、ステータスドット、セッション名、Gitブランチ（ブランチがない場合は作業ディレクトリ）が表示されます。フォアグラウンドセッションのタイトルはアクセントカラーで強調表示され、そのカードには控えめな常時背景色が適用されます。

ドットはセッションのステータスを示します。各ドットの意味については、[Session status indicators](#session-status-indicators)を参照してください。

有効な並び替え順（`recent`、`created`、`name`、または挿入順の`none`）は、再起動後も保持されます。

マウス操作はキーボードと同様に行えます。カードをクリックするとフォアグラウンドセッションが切り替わり、カードまたは空白の領域をダブルクリックするとサイドバーにフォーカスが移動します。また、サイドバーにフォーカスがある状態でタイムラインペインをクリックすると、フォーカスがサイドバーに戻ります。

**Sessions**タブには、現在のセッションと、再開可能なすべてのセッション履歴が「Resumable」区切りの下に一覧表示されます。

| ショートカット | 目的 |
|----------|---------|
| <kbd>↑</kbd>/<kbd>↓</kbd> | 行を移動します。 |
| <kbd>Shift</kbd>+<kbd>↑</kbd>/<kbd>↓</kbd> | ページ単位で上下に移動します。 |
| <kbd>Enter</kbd> | 選択したセッションを再開します。 |
| `n` | 新しいセッションを開始します。 |
| `a` | フィルターのスコープを切り替えます（all → local → remote (cloud)）。 |
| `/` | 名前、ブランチまたは作業ディレクトリ、リポジトリ、セッションIDを対象に、ライブ検索を実行します。 |
| `x`、`x` | 選択した行を閉じる、または削除します（1回のキー入力で有効化され、実行前に赤色で表示されます）。<kbd>Ctrl</kbd>+<kbd>X</kbd>を押した後に`x`を押す2キーのエイリアスも引き続き機能します。 |
| <kbd>←</kbd>/<kbd>→</kbd> | タブを切り替えます。 |

**Sessions**タブのリモート（クラウド）行には、オンラインまたはオフラインのステータスとリポジトリも表示されます。

行の上で`x`を2回押すと、実行中のセッションが終了するか、ローカルの再開可能な行の場合はそのセッションに保存された履歴が完全に削除されます。<kbd>Esc</kbd>キーを押す、他のキーを押す、ハイライトを移動する、またはタイムアウトすると、保留中の確認がキャンセルされます。

## Diffモードのショートカット

Diffモードが開いている場合（`/diff`で入ります）：

| ショートカット | 目的 |
|----------|---------|
| <kbd>↑</kbd> / `k` | 選択範囲を1行上に移動します。 |
| <kbd>↓</kbd> / `j` | 選択範囲を1行下に移動します。 |
| <kbd>←</kbd> / `h` | 前のファイルにジャンプします。 |
| <kbd>→</kbd> / `l` | 次のファイルにジャンプします。 |
| <kbd>Home</kbd> / `g` | 先頭の行にジャンプします。 |
| <kbd>End</kbd> / `G` | 末尾の行にジャンプします。 |
| <kbd>Page Up</kbd> | 1ページ上にスクロールします。 |
| <kbd>Page Down</kbd> | 1ページ下にスクロールします。 |
| <kbd>Ctrl</kbd>+<kbd>U</kbd> | 半ページ上にスクロールします。 |
| <kbd>Ctrl</kbd>+<kbd>D</kbd> | 半ページ下にスクロールします。 |
| `Click` | クリックしたdiffの行を選択します（マウスサポートが必要です）。 |
| マウススクロール | 上下にスクロールします。 |
| <kbd>Alt</kbd>/<kbd>Option</kbd>+スクロール | 細かい調整のために1行ずつスクロールします。 |
| `c` | 選択した行にコメントを追加または編集します。 |
| `s` | コメントの概要を表示します（コメントが存在する場合）。 |
| `b` | 未ステージの変更とブランチのdiffを切り替えます。 |
| `w` | 空白のみの変更の非表示を切り替えます。 |
| <kbd>Enter</kbd> | すべてのコメントを送信します（コメントが存在する場合）。 |
| `r` | diffを更新します（リモートセッションのみ）。 |
| <kbd>Esc</kbd> / <kbd>Ctrl</kbd>+<kbd>C</kbd> | Diffモードを終了します。 |

## インタラクティブインターフェイスでのナビゲーションショートカット

| ショートカット                            | 目的                                      |
|-------------------------------------|----------------------------------------------|
| <kbd>Ctrl</kbd>+<kbd>A</kbd>        | 行頭に移動します（入力時）。 |
| <kbd>Ctrl</kbd>+<kbd>B</kbd>        | 前の文字に移動します。              |
| <kbd>Ctrl</kbd>+<kbd>E</kbd>        | 行末に移動します（入力時）。       |
| <kbd>Ctrl</kbd>+<kbd>F</kbd>        | 次の文字に移動します。                  |
| <kbd>Ctrl</kbd>+<kbd>H</kbd>        | 前の文字を削除します。               |
| <kbd>Ctrl</kbd>+<kbd>K</kbd>        | カーソルから行末までを削除します。カーソルが行末にある場合は、改行を削除します。 |
| <kbd>Ctrl</kbd>+<kbd>U</kbd>        | カーソルから行頭までを削除します。 |
| <kbd>Ctrl</kbd>+<kbd>W</kbd>        | 前の単語を削除します。                    |
| <kbd>Home</kbd>                     | 現在の表示上の行の先頭に移動します。               |
| <kbd>End</kbd>                      | 現在の表示上の行の末尾に移動します。                 |
| <kbd>Ctrl</kbd>+<kbd>Home</kbd>     | テキストの先頭に移動します。                              |
| <kbd>Ctrl</kbd>+<kbd>End</kbd>      | テキストの末尾に移動します。                                |
| <kbd>Alt</kbd>+<kbd>←</kbd>/<kbd>→</kbd> (Windows/Linux)<br><kbd>Option</kbd>+<kbd>←</kbd>/<kbd>→</kbd> (Mac) | 単語単位でカーソルを移動します。             |
| <kbd>↑</kbd>/<kbd>↓</kbd>           | コマンド履歴を移動します。プロンプトボックスが空の場合、利用可能な履歴があれば、<kbd>↑</kbd>を押すと直近にキューに追加されたプロンプトやステアリングプロンプトが代わりに呼び出されます。 |
| <kbd>Ctrl</kbd>+<kbd>P</kbd>        | キューに登録されたプロンプトの呼び出し動作をトリガーせず、破壊的ではない方法で送信済みのコマンド履歴を移動します。 |
| <kbd>Tab</kbd> / <kbd>Ctrl</kbd>+<kbd>Y</kbd> | 現在のインライン補完候補を受け入れます。 |

## インタラクティブインターフェイスのスラッシュコマンド

これらは、インタラクティブなCLIセッション内から使用できるスラッシュコマンドです。これらのスラッシュコマンドの一部は、ACPサーバー経由でCLIを使用するクライアントでも利用できます。詳細については、[Copilot CLI ACP server](/copilot/reference/copilot-cli-reference/acp-server)を参照してください。

| コマンド                                             | 目的 |
|-----------------------------------------------------|---------|
| `/add-dir PATH`                                     | ディレクトリへのファイルアクセスを許可し、信頼された設定としてそのスキル（`.github/`、`.agents/`、`.claude/`）とエージェント（`.github/`、`.claude/`）を読み込みます。サンドボックスが有効な場合、現在のセッションにおけるディレクトリへのサンドボックスアクセスも付与します。 |
| `/after [DELAY PROMPT]`、`/after`                 | 現在のセッションに対して、1回限りのプロンプト、スキル、またはスケジュール可能なスラッシュコマンドをスケジュールします（例: `/after 30m remind me the time`または`/after 1h /chronicle standup`）。引数を指定しない場合は、スケジュールマネージャーが表示されます。実験的モードでのみ利用可能です。 |
| `/agent`                                            | 利用可能なエージェント（存在する場合）を参照して選択します。[Custom agents](/copilot/concepts/customizations/custom-agents)を参照してください。 |
| `/app`                                              | 現在のセッションをGitHub Copilot appで開くか（バージョン1.1.3以降が必要）、アプリがインストールされていない場合はダウンロードURLを表示します。 |
| `/ask [QUESTION]`, `/btw [QUESTION]`                    | 会話履歴に追加せずに、簡単なサイドの質問をします。レスポンスはMarkdownとしてレンダリングされます。回答ダイアログで<kbd>Ctrl</kbd>+<kbd>E</kbd>キーを押すと展開され、<kbd>Ctrl</kbd>+<kbd>Y</kbd>キーを押すと回答全体がコピーされます。質問なしでコマンドを実行すると、現在のセッションで直前のサイドの質問の回答を再度開きます。[GitHub Copilot CLIでのサイドの質問の実行](/copilot/how-tos/copilot-cli/use-copilot-cli/ask-a-side-question)を参照してください。 |
| `/allow-all [on\|off\|show]`, `/yolo [on\|off\|show]` | すべての権限（ツール、パス、URL）を有効にします。これは`/permissions allow-all`のエイリアスです。標準コマンドとそのサブコマンドについては、`/permissions`の行を参照してください。 |
| `/autopilot [OBJECTIVE]`, `/goal [OBJECTIVE]` | オートパイロットモードを開始または再フォーカスします。オプションで、明示的な目的を指定できます（例：`/goal Refactor the auth module`）。目的を指定しない場合、オートパイロットはコンテキストから意図を推測し、ステータスパネルには推測された目的として最後のプロンプトが表示されます。`--max-ai-credits N`を使用して、目的に対するAIクレジットの消費量を制限できます（例：`/goal Refactor the auth module --max-ai-credits 5`）。上限に達すると、オートパイロットは一時停止し、上限に対する使用クレジットを報告するパネルが開きます。新しい金額を入力すると新しいクレジット期間で再開され、パネルを閉じると一時停止状態が維持されます。パネルを使用せず、目的テキストなしでオプションを単独で実行して、一時停止した目的をご自身で再開することもできます（例：`/goal --max-ai-credits 5`）。これはパネルが実行するアクションと同じです。指定したクレジットの新しい期間（増分ではなく完全な新しい上限）を開き、目的を続行します。`/goal on`および`/goal off`は、目的を設定せずにオートパイロットモードを切り替えます。また、`--max-ai-credits`は受け付けません。アクティブな目標はプロンプトボックスの上部にピン留めされたパネルとしてレンダリングされ、目標、使用されたクレジット、およびTODOの進捗状況が表示されます。パネルは、短いターミナル（30行未満）では単一の識別行に自動的に折りたたまれ、その閾値を超えると展開されます。<kbd>Ctrl</kbd>+<kbd>X</kbd>キーを押してから`g`キーを押すと、自動サイズ調整を手動で上書きできます。 |
| `/changelog [summarize] [VERSION\|last N\|since VERSION]`, `/release-notes [summarize] [VERSION\|last N\|since VERSION]` | CLIの変更履歴を表示します。オプションで、バージョン、最近のリリース数、または開始バージョンを指定できます。AI生成の要約を作成するには、キーワード`summarize`を追加します。 |
| `/chronicle <standup\|tips\|improve\|reindex\|skills create\|skills review\|skills status>` | セッション履歴のツールとインサイト。`skills`サブコマンドは、観察された使用状況から生成されたリポジトリスキル提案の下書き、レビュー、およびステータスの追跡を行います。[GitHub Copilot CLIセッションデータの使用](/copilot/how-tos/copilot-cli/use-copilot-cli/chronicle#using-the-chronicle-slash-command)を参照してください。 |
| `/clear [PROMPT]`, `/new [PROMPT]`, `/reset [PROMPT]` | 新しい会話を開始します。`/new worktree`は、現在のセッションをクリアする代わりに、新しいGitワークツリーで空のセッションを開始し、現在の会話とその作業ディレクトリを変更しないままにします。 |
| `/clikit [COMPONENT]`                               | CLIのビジネスコンポーネントのプレビューを行います（例:クォータ情報）。 |
| `/collect-debug-logs [file\|gist\|share] [PATH]`    | デバッグログをアーカイブまたはGitHubのGistに収集するか、GitHubにアップロードします（`share`）。[デバッグログの収集と共有](#collecting-and-sharing-debug-logs)を参照してください。 |
| `/compact [FOCUS-INSTRUCTIONS]`                     | 会話履歴を要約して、コンテキストウィンドウの使用量を削減します。オプションでフォーカス指示を指定して要約を誘導します（例: `/compact focus on the auth module`）。[GitHub Copilotのコンテキストの管理](/copilot/concepts/prompting-and-context/context-management#compaction)を参照してください。 |
| `/context`                                          | コンテキストウィンドウのトークン使用量と視覚化を表示します。[GitHub Copilotのコンテキストの管理](/copilot/concepts/prompting-and-context/context-management#checking-your-context-usage)を参照してください。 |
| `/copy`                                             | 最後のレスポンスをクリップボードにコピーします。 |
| `/cwd`, `/cd [PATH]`                                | 作業ディレクトリを変更するか、現在のディレクトリを表示します。 |
| `/delegate [PROMPT]`                                | AI生成のpull requestを使用して、変更をリモートリポジトリに委任します。[Copilotへのタスクの委任](/copilot/how-tos/copilot-cli/use-copilot-cli/delegate-tasks-to-cca)を参照してください。 |
| `/diagnose [PROMPT]`, `/diagnose`                   | 現在のセッションログのエラー、予期しない動作、およびその他の問題分析を行います。オプションでカスタムプロンプトを含めて、特定の問題に診断の焦点を当てます。 |
| `/diff`                                             | 現在のディレクトリの変更をレビューします。作業ツリーがクリーンな場合は、自動的にブランチdiffに切り替わります（実験的機能）。 |
| `/downgrade VERSION`                              | 特定のCLIバージョンをダウンロードして再起動します。チームアカウントで利用できます。 |
| `/env`                                              | ロードされた環境の詳細（指示、MCPサーバー、スキル、エージェント、フック、プラグイン、LSP、拡張機能）を表示します。 |
| `/every [INTERVAL] PROMPT`, `/every`              | 現在のセッションに対して、定期的なプロンプト、スキル、またはスケジュール可能なスラッシュコマンドをスケジュールします（例: `/every 1h run tests`または`/every 1d /chronicle standup`）。引数なしの場合、スケジュールマネージャーが表示されます。実験的モードでのみ利用可能です。 |
| `/exit`, `/quit`                                    | 現在のセッションを閉じます。他のセッションが実行中の場合、終了する代わりに、残っている最も新しいセッションをフォアグラウンドにします。これが最後のオープンなセッションである場合にのみ、CLIを終了します。`/exit print`は常にCLIを終了し、トランスクリプトのダンプを提案します。`/exit`および`/quit`（`print`バリアントを含む）は、エージェントの実行中に<kbd>Ctrl</kbd>+<kbd>Q</kbd>キーでキューに入れることもできます。現在のターンと、その前にあるキューに入っているシェルコマンドが完了すると、CLIはセッションを閉じます。 |
| `/extensions [manage\|mode]`, `/extension`          | CLIの拡張機能を管理します。実験的モードでのみ利用可能です。 |
| `/experimental [on\|off\|show]`                     | 実験的機能の切り替え、設定、または表示を行います。 |
| `/feedback`, `/bug`                                 | CLIに関するフィードバックを提供します。ログ付きのフィードバックルートを提供できます。[デバッグログの収集と共有](#collecting-and-sharing-debug-logs)を参照してください。 |
| `/fleet [PROMPT]`                                   | タスクの一部の並列サブエージェント実行を有効にします。[`/fleet`コマンドを使用したタスク完了の高速化](/copilot/how-tos/copilot-cli/use-copilot-cli/speed-up-task-completion)を参照してください。 |
| `/help`                                             | 対話型コマンドのヘルプを表示します。 |
| `/ide`                                              | IDEワークスペースに接続します。[GitHub Copilot CLIをVS Codeに接続する](/copilot/how-tos/copilot-cli/use-copilot-cli/connecting-vs-code#managing-the-connection-with-the-ide-slash-command)を参照してください。 |
| `/init [suppress\|INSTRUCTIONS]`                 | このリポジトリのCopilotカスタム指示とエージェント機能を初期化します。コマンドの後のテキストによって、書き込まれる内容がガイドされます。`suppress`は、このリポジトリの起動リマインダーを非表示にします。[Copilotのプロジェクト初期化](#project-initialization-for-copilot)を参照してください。 |
| `/instructions`                                     | カスタム指示ファイルの表示と切り替えを行います。 |
| `/keep-alive [on\|off\|busy\|DURATION]`, `/caffeinate [on\|off\|busy\|DURATION]` | マシンのスリープを防ぎます：CLIセッションがアクティブな間、エージェントがビジーな間、または指定された時間。`30`、`30m`、`2h`、`1d`などの継続時間を受け付けます（数字のみの場合はデフォルトで分になります）。 |
| `/limits`                                           | 対話型レスポンス制限ダイアログを開きます。 |
| `/limits set max-ai-credits VALUE`                  | レスポンスごとに許可されるAIクレジットのソフト上限を設定します。レスポンス制限は、ユーザーメッセージごとにリセットされるソフトリミットです。[GitHub Copilot CLIでのAI creditセッション制限の設定](/copilot/how-tos/copilot-cli/use-copilot-cli/set-session-limit)を参照してください。 |
| `/limits unset [max-ai-credits\|all]`               | 特定のレスポンス制限、またはすべてのレスポンス制限を削除します。 |
| `/list-dirs`                                        | ファイルアクセスが許可されているすべてのディレクトリを表示します。 |
| `/login`                                            | Copilotにログインします。 |
| `/logout`                                           | Copilotからログアウトします。 |
| `/lsp [show\|test\|reload\|logs\|help] [SERVER-NAME]` | 言語サーバーの設定を管理します。`logs`サブコマンドは、ライブLSPサービスログパネルを開きます。 |
| `/mcp [config\|list\|show\|add\|edit\|delete\|disable\|enable\|auth\|reload\|search] [SERVER-NAME]` | MCPサーバーの設定を管理します。サブコマンドなし、または`config`を指定すると、プラグインダッシュボードがMCPサーバーリストにピン留めされて開きます。追加、編集、および認証フォームもそのダッシュボード内で開くため、フォームを閉じるとサーバーリストに戻ります。`show`または`show SERVER-NAME`を使用して、設定されたすべてのサーバーを表示するか、1つのサーバーの詳細（利用可能なツールを含む）を直接開き、有効または無効にします。プラグインが提供するサーバーの場合、`show SERVER-NAME`はソースの属性も表示します（例: `Source: Plugin my-plugin (1.2.0)`）。`list`（エイリアス`ls`）は、接続状態とライブ状態を示す設定済みサーバーのプレーンテキストリストを出力します。単体の`/mcp`、`config`、`show`、および`list`（エイリアス`ls`）は読み取り専用であるかダッシュボードを開くため、エージェントがターンの処理でビジーな間も実行できます。変更を伴うサブコマンド（`add`、`edit`、`delete`、`disable`、`enable`、`auth`、`reload`、および`search`）は、ターンが完了するまでブロックされます。`edit <name>`は、ユーザー層のウィザードを開く代わりに、ワークスペースソースのサーバー（リポジトリの`.mcp.json`で定義されたもの）を拒否します。これは、保存するとワークスペースのエントリがまだシャドウしている同名のユーザーエントリがサイレントに作成されるためです。エラーには、直接編集するファイル名が表示されます。`delete <name>`は、ワークスペースソースのサーバーの削除を求められたときに同じファイルを報告します。サンドボックス化されたローカルサーバーには`connected (sandboxed)`ステータスが表示されます。[GitHub Copilot CLIへのMCPサーバーの追加](/copilot/how-tos/copilot-cli/customize-copilot/add-mcp-servers#managing-mcp-servers)を参照してください。 |
| `/model [--session\|--global\|--repo\|--local] [MODEL\|auto TIER]`, `/models`      | 使用するAIモデルを選択するか、**Auto**を選択します。モデルIDは大文字と小文字を区別せず、標準IDが保存されます。デフォルト（または`--session`、エイリアス`-s`）では、保存された設定を変更せずに、現在のセッションのモデル、推論の度合い、またはコンテキストウィンドウのみを変更します。代わりに`--repo`/`--local`はリポジトリ設定でデフォルトモデルをピン留めし、`--global`（または`/config model`）は将来のセッションのデフォルトを設定します。長コンテキストバリアントを持つモデルで<kbd>Tab</kbd>キーを押すと、Context列がデフォルトウィンドウと長コンテキストウィンドウの間で切り替わります。ピッカーはモデルをセクションにグループ化します。<kbd>Shift</kbd>+<kbd>Tab</kbd>キーを押すと、推奨（Recent、Recommended、New、およびその他のモデル）、ベンダー、カテゴリの間でグループ化を循環できます。ピッカーは、選択可能な場合に、有効な管理対象デフォルトモデルにデフォルトバッジを付けます。ベンダー固有のデータ保持条項を持つモデルには、ベンダーのポリシーへのリンクが含まれるデータ保持警告バナーが表示されます。ターンの途中で使用可能です。エージェントの実行中に要求された変更は、キャンセル可能な(<kbd>Ctrl</kbd>+<kbd>C</kbd>)コマンドとしてキューに入れられ、リクエストの途中でライブモデルを切り替えるのではなく、現在のターンが完了した後に適用されます。`/model auto TIER`（`efficiency`、`balance`、または`intelligence`）を使用して、特定のAutoルーティング層を直接選択します（Auto層の推奨ヒントの「switch」アクションからの選択も含みます）。Autoがモデルを選択すると、APIが提供する場合はいつでも、タイムラインにその選択の理由が表示されます。[GitHub Copilot auto model selectionについて](/copilot/concepts/models/auto-model-selection)を参照してください。 |
| `/permissions [default\|assisted\|allow-all\|show]`  | 権限モード（`default`、`assisted`、`allow-all`）を切り替えるか、現在のモード（`show`）を表示します。これは権限モード変更のための標準コマンドです。`/allow-all`および`/yolo`は引き続きエイリアスとしてサポートされます。アシスト付き権限の詳細については、[手動承認なしで安全なコマンドの実行を許可する](/copilot/concepts/customizations/allowing-safe-commands)を参照してください。 |
| `/permissions reset`                                | 現在のセッションのメモリ内のすべてのツールとパスの承認をリセットします（次回使用時に再プロンプトを表示します）。 |
| `/plan [PROMPT]`                                    | コーディングの前に実装計画を作成します。 |
| `/plugin`                            | インストール済みのプラグインを表示するプラグインダッシュボードを開きます。プラグインを選択し、<kbd>Enter</kbd>キーを押すと、詳細情報や、有効化、無効化、アップデート、アンインストールなどのアクションが表示されます。<kbd>←</kbd>および<kbd>→</kbd>キーを使用して、**Installed**、**Online**、**Marketplace**の各ビューを切り替えます。ダッシュボードにはプラグインのみが表示されます。MCPサーバーには`/mcp`を、スキルには`/skills`を使用してください。[AUTOTITLE](/copilot/concepts/agents/about-plugins)を参照してください。 |
| `/plugin install SOURCE`             | マーケットプレイスの仕様、GitHubリポジトリ、git URL、またはローカルパスからプラグインをインストールします。 |
| `/plugin update PLUGIN[@MARKETPLACE]` | インストール済みのプラグインをアップデートします。 |
| `/plugin uninstall PLUGIN[@MARKETPLACE]`（エイリアス`remove`、`rm`） | プラグインをアンインストールします。 |
| `/plugin list`（エイリアス`ls`）          | インストール済みのプラグインを一覧表示します。チームのプラグイン割り当てにより、チームメンバーのオプションのデフォルトが設定されます。デフォルトで有効として割り当てられたプラグインは、無効にするか管理対象の設定がデフォルトを上書きしない限り、有効として表示され、そのスキルがロードされます。対照的に、エンタープライズチームの設定を含め、管理対象の`enabledPlugins`を通じて強制されるプラグインは、ローカルで無効にすることはできません。[GitHub Copilot CLIプラグインリファレンス](/copilot/reference/copilot-cli-reference/cli-plugin-reference#cli-commands)を参照してください。 |
| `/plugin marketplace add SOURCE`     | マーケットプレイスを追加します。 |
| `/plugin marketplace remove NAME`    | マーケットプレイスを削除します。 |
| `/plugin marketplace list`           | 登録されているマーケットプレイスを一覧表示します。 |
| `/plugin marketplace browse NAME`    | マーケットプレイス内のプラグインを閲覧します。 |
| `/plugin marketplace update [NAME]`（エイリアス`refresh`） | マーケットプレイスのプラグインカタログを再取得します。名前が指定されていない場合は、登録されているすべてのマーケットプレイスを対象とします。 |
| `/pr [view\|create\|fix\|auto\|automerge]`          | 現在のブランチのpull requestを管理します。`auto`はpull requestをグリーン状態にして停止します。`automerge`（エイリアス: `agentmerge`）はpull requestをグリーン状態にしてマージします。リポジトリにpull requestテンプレート（`.github/pull_request_template.md`または`.github/PULL_REQUEST_TEMPLATE/`配下のファイル）がある場合、`create`はデフォルトでそれに従い、汎用的な本文を作成するのではなく、見出し、コメント、チェックリスト項目を保持し、正確な詳細を入力します。テンプレートを適用したくない場合は、Copilotにスキップするように依頼してください。[/prコマンドを使用したpull requestの管理](/copilot/how-tos/copilot-cli/use-copilot-cli/manage-pull-requests)を参照してください。 |
| `/refine TEXT`                                      | 大まかに作成されたプロンプトを、レビュー用の明確なプロンプトに書き換えます。引数なしで実行すると（<kbd>Ctrl</kbd>+<kbd>X</kbd>キーを押してから`/refine`キーを押す）、現在の入力ボックスがクリーンアップされます。音声入力されたプロンプトに対して特に役立ちます。 |
| `/remote [on\|off]`                                 | リモートコントロールのステータスを表示し（引数が指定されていない場合）、リモートステアリングを有効にし（`on`）、リモート接続を終了します（`off`）。[別のデバイスからのGitHub Copilot CLIセッションのステアリング](/copilot/how-tos/copilot-cli/use-copilot-cli/steer-remotely)を参照してください。 |
| `/rename [NAME]`                                    | 現在のセッションの名前を変更します（省略された場合は名前を自動生成します。`/session rename`のエイリアス）。 |
| `/research TOPIC`                                   | GitHubの検索とWebソースを使用して、詳細な調査を実行します。[GitHub Copilot CLIを使用した調査](/copilot/how-tos/copilot-cli/use-copilot-cli/research-with-copilot-cli)を参照してください。 |
| `/reset-allowed-tools`                              | 現在のセッションの権限をリセットします。これにより、セッションツールの承認がクリアされ、権限モードが手動に戻り（いずれかがオンになっている場合はallow-allまたはassisted permissionsがオフになります）、現在の場所に対して保存された承認がクリアされます。`--allow-tool`、`--deny-tool`、`--allow-url`、`--deny-url`などの明示的な起動ルールは、セッションのベースラインの一部として残ります。 |
| `/restart`                                          | CLIを再起動し、フォアグラウンドセッションだけでなく、現在のプロセスのすべてのライブセッションを復元します。ターゲットのCLIバージョンで複数のセッションを復元できない場合は、フォアグラウンドセッションのみで続行するかキャンセルするかを確認するプロンプトが表示されます。`-w`または`--worktree`を使用してGitワークツリーで開始されたセッションは、同じワークツリーで再開されます。`/model`で選択されたモデルは保持されます。 |
| `/resume [SESSION-ID]`, `/continue [SESSION-ID]`    | リストから選択して別のセッションに切り替えます（オプションでセッションIDを指定します）。 |
| `/review [PROMPT]`                                  | コードレビューエージェントを実行して変更を分析します。[GitHub Copilot CLIによるコードレビューのリクエスト](/copilot/how-tos/copilot-cli/use-copilot-cli/agentic-code-review)を参照してください。 |
| `/rubber-duck [PROMPT]`                             | 計画、コード、およびテストについてラバーダックエージェントに相談し、セカンドオピニオンを求めます。[ラバーダックエージェントによるセカンドオピニオンの取得](/copilot/concepts/agent-capabilities/choosing-and-delegating-agent-work/getting-a-second-opinion)を参照してください。 |
| `/sandbox [config\|status\|policy [COMMAND]\|enable\|disable]` | ファイルシステムとネットワークへのアクセスに対するサンドボックスの制限を管理します。`config`（または単体の`/sandbox`）を実行すると設定ダイアログが開き、環境シークレットの候補が提示されたり、保存する前にマスキングホストを追加したりできます。ダイアログの**General**タブには、現在のセッションでサンドボックスを有効にするオプションと、新しいセッションのデフォルトを設定するオプションが個別に用意されています。どちらのオプションを変更しても、もう一方は変更されません。`/sandbox enable session`および`/sandbox disable session`を使用すると、保存されているデフォルトを変更せずに、現在のセッションのサンドボックス設定を変更できます。`status`は、現在のセッションでサンドボックスが有効になっているかどうかを表示します。サンドボックスが有効な場合、`policy`には、ソースとアクセスタイプ、ネットワーク設定、開発者ツールへのアクセス、サンドボックスの機能別にグループ化されたパスの許可と制限が表示されます。`/sandbox policy npm install`などのコマンドを追加して、実行せずに開発者ツールへのアクセスを検査することもできます。通常、`enable`および`disable`は保存された設定を更新します。組織でサンドボックスが義務付けられている場合、バイパスが許可されていない限り、`disable`は拒否されます。その場合、無効化は現在のセッションにのみ適用されます。 |
| `/sandbox ca [create\|trust\|rotate\|remove]`       | サンドボックスのプロキシ証明機関を管理します。`create`は信頼せずに書き込みます。`trust`はOSの信頼ストアに追加します。`rotate`は信頼状態を維持したまま置き換えます。`remove`はOSの信頼を解除します。セッションの外（管理対象デバイスなど）で同じ操作を実行する方法については、[`copilot sandbox ca`の使用](#using-copilot-sandbox-ca)を参照してください。 |
| `/search [QUERY]`、`/find [QUERY]`                  | 会話のタイムラインを検索します。 |
| `/security-review [PROMPT]`                         | アクティブなローカルのコード変更に対して集中的なセキュリティレビューを実行し、修復の提案とともに優先順位付けされた脆弱性の検出結果を返します。このコマンドは、リポジトリ全体のセキュリティ監査ではありません。 |
| `/session [info\|checkpoints [n]\|files\|plan\|rename [NAME]\|cleanup\|prune\|delete [ID]\|delete-all]`、`/sessions [info\|checkpoints [n]\|files\|plan\|rename [NAME]\|cleanup\|prune\|delete [ID]\|delete-all]`  | セッション情報を表示し、セッションを管理します。`info`サブコマンドは、セッションリンク（利用可能な場合）を含むセッションの詳細を表示します。サブコマンド：`info`、`checkpoints`、`files`、`plan`、`rename`、`cleanup`、`prune`、`delete`、`delete-all`。 |
| `/settings [--repo\|--local] [show KEY\|KEY\|KEY VALUE]`、<br>`/config [--repo\|--local] [show KEY\|KEY\|KEY VALUE]` | 設定ダイアログを開くか、特定の設定（`KEY`）にフォーカスした状態で開くか、設定をインラインで設定する（`KEY VALUE`）か、設定の現在の値を表示します（`show KEY`）。`show`は、値をクリアテキストで出力する代わりに、シークレットの名前が付けられた値（設定内にネストされたトークンやAPIキーなど）をマスクします。ダイアログには、**User**、**Repo**、**Repo (local)**、**Problems**の各タブが表示されます。切り替えるには<kbd>Tab</kbd>/<kbd>Shift</kbd>+<kbd>Tab</kbd>を使用します。他のスコープで上書きされた設定には、どのスコープが優先されるかを示すバッジが表示されます。**Problems**タブは、注意が必要な設定（不明なキーや無効なキーなど）のクロススコープビューです。いずれかのスコープに問題がある場合は、ラベルに`Problems (2)`などの件数が表示され、問題がない場合は単に`Problems`と表示されます。ダイアログには、表示されている設定、領域、ローカルリソースを検索するグローバル検索も含まれます。ユーザー設定ファイルの代わりに`.github/copilot/settings.json`または`.github/copilot/settings.local.json`を対象にするには、`--repo`または`--local`を追加します（例：`/settings --repo model gpt-6-astra`）。この方法で設定できるのは、[リポジトリで上書き可能なキー](/copilot/reference/copilot-cli-reference/cli-config-dir-reference#repository-settings-githubcopilotsettingsjson)のみです。アクティブな組織またはMDMによって管理されているポリシーによって制御される行は、`(managed)`タグが付いた読み取り専用としてレンダリングされます。[`/settings`コマンドによる設定の変更](/copilot/how-tos/copilot-cli/customize-copilot/change-settings)を参照してください。 |
| `/share [link\|off\|file\|html\|gist\|research] [...]`、`/export [...]` | 現在のセッションを共有します。サブコマンドを指定しない場合、何も共有またはエクスポートせずに共有メニューを開きます。`link`はセッションを共有し、共有可能なGitHubリンクを出力します。`off`または`link off`はリンクの共有を停止します。`file [session\|research] [PATH]`はMarkdownファイルにエクスポートします。`html [session\|research] [PATH]`はHTMLファイルにエクスポートします。`gist [session\|research]`はGitHubのgistを作成します。`research [PATH]`は調査レポートをエクスポートします。 |
| `/skills`                                            | Skillsタブでプラグインダッシュボードを開きます。 |
| `/skills list`                                       | 利用可能なすべてのスキルを一覧表示します。 |
| `/skills info NAME`                                  | 特定のスキルの詳細を表示します。 |
| `/skills add [--project] <FILE\|URL\|DIRECTORY>`     | ファイル、URL、またはディレクトリからスキルを追加します。`--project`を使用すると、ファイルまたはURLのインストール対象をユーザーアカウントではなくこのリポジトリに限定できます。 |
| `/skills remove <NAME\|DIRECTORY>`                   | 名前でスキルを削除するか、カスタムスキルディレクトリの登録を解除します。 |
| `/skills reload`                                     | すべてのディレクトリからスキルを再読み込みします。[GitHub Copilot CLIのエージェントスキルの追加](/copilot/how-tos/copilot-cli/customize-copilot/add-skills)を参照してください。 |
| `/statusline`、`/footer`                            | ステータス行に表示する項目を設定します。 |
| `/subagents`、`/agents`                             | デフォルトおよびエージェントごとのsubagentモデルを設定します。エージェント独自の定義、または`subagents`設定のオーバーライドのいずれかで`modelPolicy: "required"`が設定されている場合、ピッカーにはロックされた**Model**エントリと、「required - cannot be overridden」（エージェント定義自体でポリシーが設定されている場合は「required by agent definition」）と表示される**Model enforcement**行が表示されます。エージェント定義で要求されている場合を除き、再びオーバーライドを許可するには、ピッカーからポリシーを`"preferred"`に戻します。[GitHub Copilot CLI configuration directory](/copilot/reference/copilot-cli-reference/cli-config-dir-reference#configuration-file-settings)を参照してください。 |
| `/tasks`                                            | タスク（サブエージェントおよびシェルコマンド）の表示と管理を行います。 |
| `/terminal-setup`      | 複数行の入力サポート（<kbd>Shift</kbd>+<kbd>Enter</kbd>および<kbd>Ctrl</kbd>+<kbd>Enter</kbd>）用にターミナルを設定します。 |
| `/theme [default\|github\|dim\|high-contrast\|colorblind]`   | カラーモードの表示または設定を行います。 |
| `/tuikit [colors\|icons\|select\|tabbar]`           | TUIkitデザインシステムのコンポーネントとカラーカラーをプレビューします。 |
| `/undo`、`/rewind`                                  | リワインドピッカーを開き、セッションを以前のユーザーのターンに巻き戻します。**Conversation only**（ファイルをそのままにして会話を巻き戻す）または**Conversation + files**（そのターンおよびその後の破棄されたターンでCopilotが変更したファイルを、編集後に自分で変更した箇所をスキップして、変更前の内容に復元する）から選択できます。ファイルの変更は、編集ツール、シェルコマンド、サブエージェントにわたってターンごとに追跡されるため、Gitは必要ありません。巻き戻しは元に戻すことができません。以降のターンはセッションから削除されます。コピーを保持するには、事前に`/fork`を使用してください。 |
| `/update`、`/upgrade`                               | CLIを最新バージョンに更新します。`/update stable`または`/update prerelease`を使用すると、今後の更新のために選択したチャネルも保存されます。 |
| `/usage`                                            | モデルごとのトークン総数を含め、セッションの使用量指標と統計情報を表示します。トークンベースの課金アカウントの場合、各モデルの行には独自のAI creditの消費量（例：`1 AIC`）も表示されます。トークン数が記録されない課金対象モデルには、クレジットのみが表示されます。 |
| `/user [show\|list\|switch]`                        | サインインしているアカウントを管理します。 |
| `/version`                                          | バージョン情報を表示し、更新を確認します。 |
| `/vim`                                              | プロンプトボックスのVimモードを切り替え、Vimスタイルのモーダル編集を有効にします。移動（例：`hjkl`、`w`、`b`、`e`、`0`、`$`、`gg`、`G`）、文字検索（`f`/`F`/`t`/`T`/`;`/`,`）、挿入コマンド（`i`/`a`/`o`）、編集コマンド（`r`/`~`/`J`/`x`/`D`/`C`）、オペレーター（`d`/`c`/`y`）、ヤンクとプット（`y`/`p`/`P`）、繰り返し（`.`）、元に戻す・やり直し（`u`/<kbd>Ctrl</kbd>+<kbd>R</kbd>）、カウント、およびノーマルモードに戻るための<kbd>Esc</kbd>が含まれます。`editorMode`設定でも設定可能です。[GitHub Copilot CLI configuration directory](/copilot/reference/copilot-cli-reference/cli-config-dir-reference#user-settings-copilotsettingsjson)を参照してください。 |
| `/voice [on\|off\|models\|devices]`                 | 音声モードの切り替え、利用可能な音声モデルの参照、または入力デバイス（マイク）の選択を行います。 |
| `/workflows`                                        | ワークフローの実行、フェーズ、エージェント、進捗状況を監視します。トークンベースの課金プランが必要です。登録されたワークフローを直接実行するには、[`copilot workflow run`の使用](#using-copilot-workflow-run)を参照してください。 |
| `/fork [NAME]`、`/branch [NAME]`                    | 現在のセッションを新しいセッションにフォークします（オプションで名前を指定可能）。エージェントの実行中にも使用でき、ソースセッションはバックグラウンドで動作し続けます。`/fork worktree`は、現在のセッションの会話コンテキストを維持したまま、`HEAD`から分岐した新しいGitワークツリーにフォークします。 |
| `/worktree [branch\|task]`                          | 新しいGit worktreeを作成してそこに切り替え、未着手の変更を現在のworktreeに残します。ブランチ名、タスクの説明（複数行対応、新しいworktreeでの最初のプロンプトとして使用されます）を渡すか、引数を省略して会話からブランチ名を自動生成します。デフォルトでは、現在のチェックアウト（`HEAD`）から分岐します。リモートのデフォルトブランチから分岐するように設定するには、`worktreeBaseRef`設定を`"defaultBranch"`に設定します。[GitHub Copilot CLI configuration directory](/copilot/reference/copilot-cli-reference/cli-config-dir-reference#user-settings-copilotsettingsjson)を参照してください。Gitリポジトリが必要です。 |
| `/worktree new [PROMPT]`                            | 非推奨です。代わりに`/new worktree`を使用してください。現在の会話と作業ディレクトリを変更せずに、新しいGitワークツリーで新しい会話を開始します。オプションで最初のプロンプトを指定します。`new`はサブコマンドキーワードとして予約されているため、リテラルのブランチ名として使用することはできません。`/worktree`と同じ`worktreeBaseRef`設定に従います。 | <!-- markdownlint-disable-line GHD046 -->
| `/move [branch\|task]`                              | 未着手の変更を新しいGitワークツリーに移動してそこに切り替えます。ブランチ名、タスクの説明（複数行対応、新しいワークツリーでの開始プロンプトとして使用）を渡すか、引数を省略して会話からブランチ名を自動生成します。Gitリポジトリが必要です。 |

利用可能なスラッシュコマンドの完全なリストを表示するには、CLIのインタラクティブインターフェイスで`/help`を入力します。

単体の`/every`または`/after`で開かれるスケジュールマネージャーでは、<kbd>↑</kbd>/<kbd>↓</kbd>を使用してエントリを選択し、`x`で削除します。スケジュールは、引数を指定した`/every`または`/after`を使用してプロンプト入力からのみ追加できます。ダイアログ自体は読み取りと削除専用です。

`/every`および`/after`が有効になっていない場合でも、セッションにアクティブなスケジュールがあるときは、デフォルトでフッターに「N scheduled」インジケーターが表示されます。

`/plugin`は、インストール済みのプラグインやマーケットプレイスの新しいバージョンが上流で利用可能になるとフラグを表示し、ダッシュボードから**Update**アクションを提供します。

`/mcp list`/`ls`および`/plugin list`/`ls`（単体の`/plugin`を含む）は読み取り専用であり、エージェントがターンの処理で忙しいときでも実行できます。その他のすべての`/mcp`および`/plugin`サブコマンドは、ターンが完了するまでブロックされます。

> [!NOTE]
> 実験的な`/plugins`コマンドは削除されました。そのリソースは`/plugin`、`/mcp`、`/skills`に移動されました。エージェントと指示には`/subagents`と`/instructions`を使用してください。

### デバッグログの収集と共有

トラブルシューティング用のデバッグログを収集するには、`/collect-debug-logs [file|gist|share] [PATH]`を使用します：

| ターゲット  | 説明 |
|---------|-------------|
| `file`  | ログを`PATH`のローカルアーカイブに保存します（`PATH`が省略された場合はデフォルトの場所が使用されます）。 |
| `gist`  | ログを秘密のGitHub gistにアップロードします。 |
| `share` | ローカルアーカイブを保存した後、GitHubにアップロードします。 |

`/collect-debug-logs share`、および`/feedback`から提供されるログ付きフィードバックのルートでは、最初にローカルアーカイブを保存し、GitHubにアップロードする前に（デフォルトで**No**となる）新しい同意を求めます。アップロードは現在、GitHubのスタッフおよび内部ユーザーのみが利用可能であり、一般にはまだ利用できません。GitHub以外のユーザーは、既存のアーカイブおよびgistのルート、および既存のパブリックフィードバックルートを引き続き使用します。

## コマンドラインオプション

| オプション                             | 用途                                  |
|------------------------------------|------------------------------------------|
| `--add-dir=PATH`                   | ディレクトリへのファイルアクセスを許可し、そのスキル（`.github/`、`.agents/`、`.claude/`）およびエージェント（`.github/`、`.claude/`）を信頼された設定として読み込みます（複数回使用可能）。相対パスは、オプションの順序に関係なく、セッションの作業ディレクトリ（`--resume`、`--worktree`、または`-C`のディレクトリ）を基準として解決されます。パスは既存のディレクトリである必要があります。パスが存在しない場合や通常のファイルである場合、どのモードでも同様に、フラグ固有のエラーにより起動が即座に失敗します。 |
| `--add-github-mcp-tool=TOOL`       | デフォルトのCLIサブセットの代わりに、GitHub MCPサーバーで有効にするツールを追加します（複数回使用可能）。すべてのツールには`*`を使用します。 |
| `--add-github-mcp-toolset=TOOLSET` | デフォルトのCLIサブセットの代わりに、GitHub MCPサーバーで有効にするツールセットを追加します（複数回使用可能）。すべてのツールセットには`all`を使用します。 |
| `--additional-mcp-config=JSON`     | このセッションでのみ有効なMCPサーバーを追加します。サーバー設定は、JSON文字列またはファイルパス（`@`をプレフィックスとして付加）として指定できます。相対的な`@file`パスは、オプションの順序に関係なく、セッションの作業ディレクトリ（`--resume`、`--worktree`、または`-C`のディレクトリ）を基準として解決されます。`~/.copilot/mcp-config.json`の設定を拡張します。同じ名前を持つインストール済みのMCPサーバー設定を上書きします。[GitHub Copilot CLIのMCPサーバーの追加](/copilot/how-tos/copilot-cli/customize-copilot/add-mcp-servers)を参照してください。 |
| `--agent=AGENT`                    | 使用するcustom agentを指定します。[カスタムエージェント](/copilot/concepts/customizations/custom-agents)を参照してください。 |
| `--allow-all`                      | すべての権限を有効にします（`--allow-all-tools --allow-all-paths --allow-all-urls`と同等）。 |
| `--allow-all-mcp-server-instructions` | システムプロンプトにすべてのMCPサーバーからの初期化手順を含めます。デフォルトでは、許可リストに登録されたサーバーの手順のみが事前に含まれ、他のサーバーの手順は必要に応じて取得されます。 |
| `--allow-all-paths`                | ファイルパスの検証を無効にし、任意のパスへのアクセスを許可します。 |
| `--allow-all-tools`                | モデルの安全性レビューや個別の承認プロンプトなしで、包括的なツール権限を付与します。拒否ルールとエンタープライズの制限は引き続き適用されます（環境変数：`COPILOT_ALLOW_ALL`）。 |
| `--allow-all-urls`                 | 確認なしですべてのURLへのアクセスを許可します。 |
| `--allow-tool=TOOL ...`            | CLIの使用が許可されているツール。許可を求めるプロンプトは表示されません。複数のツールの場合は、引用符で囲んだカンマ区切りのリストを使用します。[ツールの使用の許可と拒否](/copilot/how-tos/copilot-cli/use-copilot-cli/allowing-tools#allowing-or-denying-permission-for-specific-tools)を参照してください。 |
| `--allow-url=URL ...`              | 特定のURLまたはドメインへのアクセスを許可します。複数のURLの場合は、引用符で囲んだカンマ区切りのリストを使用します。 |
| `--acp`                            | Agent Client Protocolサーバーとして起動します。 |
| `--assisted-approval`              | 実行時にassisted permissionsを有効にし、安全性レビューによって適格な権限リクエストを承認できるようにします。非対話型の実行（つまり、`-p`または`--prompt`を使用する実行、およびターミナルが接続されていない環境での実行）でのみ有効です。正常に有効化された場合、`--allow-all-tools`よりも優先されますが、`--allow-all-paths`または`--allow-all-urls`には影響しません（環境変数：`COPILOT_ASSISTED_APPROVAL`）。[手動承認なしで安全なコマンドの実行を許可する](/copilot/concepts/customizations/allowing-safe-commands)を参照してください。 |
| `--attachment PATH`                | 初期プロンプトにファイルを添付します（複数回使用可能）。画像ファイルも受け入れられますが、正常に送信するには、選択したモデルと組織のポリシーでビジョン入力が許可されている必要があります。 |
| `--autopilot`                      | オートパイロットの継続を有効にします。`task_complete`が呼び出されるまでエージェントが作業を続け、その後対話モードに戻ります。[GitHub Copilot CLIでのオートパイロットモードの使用](/copilot/how-tos/copilot-cli/use-copilot-cli/use-autopilot-mode)を参照してください。 |
| `--available-tools=TOOL ...`       | モデルが使用できるのはこれらのツールのみになります。複数のツールの場合は、引用符で囲んだカンマ区切りのリストを使用します。[ツールの使用の許可と拒否](/copilot/how-tos/copilot-cli/use-copilot-cli/allowing-tools)を参照してください。 |
| `--banner`、`--no-banner`          | 起動バナーを表示または非表示にします。 |
| `--bash-env`                       | bashシェルでの`BASH_ENV`サポートを有効にします。 |
| `-C DIRECTORY`                     | 他の処理を実行する前に作業ディレクトリを変更します。 |
| `--connect[=SESSION-ID]`           | リモートセッションに直接接続します(オプションでセッションIDまたはタスクIDを指定します)。`--resume`および`--continue`とは併用できません。 |
| `--context TIER`。                  | 段階的価格設定モデルのコンテキストウィンドウのティアを設定します(永続化された設定を上書きし、新規のインタラクティブセッションで適用されます)。選択肢: "default"、"long_context"。 |
| `--config-dir=DIRECTORY`           | 設定ディレクトリを設定するためのこのオプションは非推奨になりました。代わりに`COPILOT_HOME`環境変数を使用してください。 | <!-- markdownlint-disable-line GHD046 -->
| `--continue`                       | 現在の作業ディレクトリで最も新しいセッションを再開し、見つからない場合はグローバルで最も新しいセッションにフォールバックします。`--resume`とは併用できません。 |
| `--deny-tool=TOOL ...`             | CLIに使用の許可を与えないツールです。許可を求めるプロンプトは表示されません。複数のツールを指定するには、引用符で囲み、カンマ区切りでリストを指定します。 |
| `--deny-url=URL ...`               | 特定のURLまたはドメインへのアクセスを拒否します。`--allow-url`よりも優先されます。複数のURLを指定するには、引用符で囲み、カンマ区切りでリストを指定します。 |
| `--disable-builtin-mcps`           | 今回の実行で組み込みサーバーセットを無効にします。プラグインが提供するすべてのサーバーが無効になるわけではありません。影響を受けるサーバーとコンピュータ使用を無効にする方法については、[組み込みMCPサーバー](#built-in-mcp-servers)を参照してください。 |
| `--disable-client-telemetry`       | CLIによって送信されるテレメトリを無効にします。サーバー側のテレメトリには影響しません。 |
| `--disable-mcp-server=SERVER-NAME` | 特定のMCPサーバーを無効にします(複数回使用できます)。 |
| `--disallow-temp-dir`              | システム一時ディレクトリへの自動アクセスを防止します。 |
| `--effort=LEVEL`、`--reasoning-effort=LEVEL` | 推論の労力レベルを設定します(`low`、`medium`、`high`、`xhigh`、`max`)。`max`はAnthropicモデルの最も深い深度のティアです。 |
| `--enable-all-github-mcp-tools`    | デフォルトのCLIサブセットの代わりに、すべてのGitHub MCPサーバーツールを有効にします。`--add-github-mcp-toolset`および`--add-github-mcp-tool`オプションを上書きします。 |
| `--enable-mcp-server=SERVER-NAME`  | 設定で無効になっているMCPサーバーを、このセッションに限り再度有効にします(複数回使用できます)。この変更は設定に永続化されません。 |
| `--enable-memory`                  | プロンプトモードでメモリを有効にします(デフォルトでは無効です)。 |
| `--enable-reasoning-summaries`     | 非推奨の互換性オプションです(受け付けられますが無視されます)。サポートされているOpenAIモデルの詳細な推論サマリーはデフォルトで表示されます。<kbd>Ctrl</kbd>+<kbd>T</kbd>で切り替えます。 | <!-- markdownlint-disable-line GHD046 -->
| `--excluded-tools=TOOL ...`        | これらのツールはモデルで使用できなくなります。複数のツールを指定するには、引用符で囲み、カンマ区切りでリストを指定します。 |
| `--experimental`                   | 実験的機能を有効にします(無効にするには`--no-experimental`を使用します)。 |
| `--extension-sdk-path DIRECTORY`   | 拡張機能のサブプロセスに注入されるバンドルされた`@github/copilot-sdk`を、ローカルの`copilot-sdk/`フォルダで上書きします。無効なパスの場合はバンドルされたSDKにフォールバックします。 |
| `--fleet`                          | プロンプトをfleetモード(並列サブエージェントオーケストレーション)で実行します。`-i`、`-p`、またはパイプで渡された標準入力と組み合わせて使用します。これにはそれらのいずれかのソースからのプロンプトが必要であり、単体では効果がありません。これは、インタラクティブプロンプトの先頭に`/fleet`スラッシュコマンドを付加することと同等です。`-p`またはパイプ入力を使用すると、非対話形式で同じfleetオーケストレーションがディスパッチされます。[`/fleet`コマンドを使用したタスク完了の高速化](/copilot/how-tos/copilot-cli/use-copilot-cli/speed-up-task-completion)を参照してください。 |
| `-h`、`--help`                     | ヘルプを表示します。 |
| `-i PROMPT`、`--interactive=PROMPT`  | インタラクティブセッションを開始し、このプロンプトを自動的に実行します。 |
| `--log-dir=DIRECTORY`              | ログファイルディレクトリを設定します(デフォルト: `~/.copilot/logs/`)。先頭の`~`はホームディレクトリに展開されます。 |
| `--log-level=LEVEL`                | ログレベルを設定します(選択肢: `none`、`error`、`warning`、`info`、`debug`、`all`、`default`)。 |
| `--max-ai-credits=CREDITS`         | 各応答に許可されるAIクレジットのソフト上限を設定します。この制限はユーザーメッセージごとにリセットされ、セッション中に`/limits`で調整できます。[GitHub Copilot CLIでAI creditセッション制限を設定する](/copilot/how-tos/copilot-cli/use-copilot-cli/set-session-limit)を参照してください。 |
| `--max-autopilot-continues=COUNT`  | アクティブなautopilotの目的外での自動継続の最大回数(デフォルト: 5)。非負の整数である必要があります。不正な値(`NaN`、負の値、小数、または科学的記数法)は拒否されます。[GitHub Copilot CLIでAutopilotモードを使用する](/copilot/how-tos/copilot-cli/use-copilot-cli/use-autopilot-mode)を参照してください。 |
| `--mode=MODE`                      | 初期エージェントモードを設定します(選択肢: `interactive`、`plan`、`autopilot`)。計画してから自動実行するには、`--plan`と組み合わせます(`--plan --mode autopilot`として)。人間による承認を待つ代わりに、セッションが計画モードで開始され、計画の準備ができたら自動的にautopilotモードに進行します。その他の`--plan --mode MODE`の組み合わせは拒否されます。 |
| `--model=MODEL`                    | 使用するAIモデルを設定します。Copilotが利用可能な最適なモデルを自動的に選択するようにするには、値として`auto`を渡します。エージェントが`model-policy: required`を設定していない限り、明示的な`--model`はカスタムエージェントの`model`よりも優先されます。[GitHub Copilot auto model selectionについて](/copilot/concepts/models/auto-model-selection)を参照してください。 |
| `--mouse[=VALUE]`                  | インタラクティブインターフェイスでのマウスサポートを有効または無効にします。VALUEには`on` (デフォルト)または`off`を指定できます。有効にすると、CLIはタイムラインのスクロールやタブのクリックなど、独自のインターフェイスを操作するためにマウスイベント(スクロールホイール、クリックなど)をキャプチャします。無効にすると、テキスト選択やスクロールバックなどのターミナルのネイティブなマウス動作が保持されます。このオプションを明示的に設定すると、その値が設定ファイルに永続化されます。 |
| `-n NAME`、`--name=NAME`           | 新しいセッションの名前を設定します。`--resume`および`/resume`が名前でセッションを検索するために使用されます。 |
| `--no-ask-user`                    | `ask_user`ツールを無効にします(エージェントは質問をせずに自律的に動作します)。 |
| `--no-auto-update`                 | CLIの自動更新を無効にし、インストールされているバージョンの代わりに新しくキャッシュされたバージョンが実行されるのを防ぎます。 |
| `--no-bash-env`                    | bashシェルの`BASH_ENV`サポートを無効にします。 |
| `--no-color`                       | すべてのカラー出力を無効にします。 |
| `--no-custom-instructions`         | `AGENTS.md`および関連ファイルからのカスタム指示の読み込みを無効にします。 |
| `--no-experimental`                | 実験的機能を無効にします。 |
| `--no-mouse`                       | マウスサポートを無効にします。 |
| `--no-remote`                      | 削除されました。インタラクティブセッション中にリモート接続を終了するには`/remote off`を使用してください。 |
| `--no-remote-export`               | `--sync-session=off`に名前が変更されました。 |
| `--output-format=FORMAT`           | FORMATには`text` (デフォルト)または`json` (JSONLを出力: 1行につき1つのJSONオブジェクト)を指定できます。 |
| `-p PROMPT`、`--prompt=PROMPT`     | プログラムからプロンプトを実行します(完了時、または実行が中断された場合はゼロ以外のステータスで終了します)。終了サマリーには、セッションを継続するための`copilot --resume=SESSION-ID`のヒントが含まれます。プロンプト内でファイルまたはディレクトリパスの前に`@`を使用してコンテキストとして含めます(例: `copilot -p "Explain @src/app.js"`)。[GitHub Copilot CLIをプログラムから実行する](/copilot/how-tos/copilot-cli/automate-copilot-cli/run-cli-programmatically)を参照してください。 |
| `--plan`                           | 計画モードで開始します。`--mode plan`の短縮形です。`--autopilot`と組み合わせることはできません。計画してから自動実行するために`--mode autopilot`と組み合わせることができます。その他の`--mode`の値は拒否されます。 |
| `--plain-diff`                     | リッチなdiffレンダリングを無効にします(Git設定で指定されたdiffツールによる構文強調表示)。 |
| `--plugin-dir=DIRECTORY`           | ローカルディレクトリからプラグインを読み込みます(複数回使用できます)。相対パスは、オプションの順序に関係なく、セッション作業ディレクトリ(`--resume`、`--worktree`、または`-C`ディレクトリ)を基準として解決されます。`--plugin-dir`プラグインによって提供されるエージェントは、インタラクティブセッションおよび`-p`セッションだけでなく、サーバーモード(`--server`)セッションでも使用できます。 |
| `--remote`                         | インタラクティブな起動時や`-p`との併用はサポートされていません。代わりにインタラクティブセッション中に`/remote on`を使用してください。このフラグは、`--server`または`--headless`を使用したレガシーSDKサーバーの起動では引き続きサポートされます。[別のデバイスからGitHub Copilot CLIセッションを制御する](/copilot/how-tos/copilot-cli/use-copilot-cli/steer-remotely)を参照してください。 |
| `--remote-export`                  | `--sync-session=on`に名前が変更されました。 |
| `-r`、`--resume[=VALUE]`           | リストから選択して、以前のインタラクティブセッションを再開します。オプションで、セッションID、IDプレフィックス、またはセッション名を指定します。名前の照合は完全一致であり、大文字と小文字が区別されます。一致する明示的な名前がない場合は、自動生成されたサマリーにフォールバックします。`--continue`とは併用できません。値のない単純な`--resume`はインタラクティブセッションピッカーを表示しますが、これにはTTYが必要です。複数のセッションが存在し、ピッカーを表示できない場合(`-p`、非TTYの`-i`、またはパイプされた標準入力などの下)、新しいセッションを暗黙的に開始する代わりにCLIはエラーで終了します。明示的な`--resume=SESSION-ID`を渡すか、`--continue`を使用してください。 |
| `-s`、`--silent`                   | エージェントの応答のみを出力します(使用統計なし)。`-p`を使用したスクリプト作成に便利です。 |
| `--screen-reader`                  | このセッションに限りスクリーンリーダーの最適化を有効にし、設定に好みを保存するかどうかを尋ねます。 |
| `--secret-env-vars=VAR ...`        | シェルおよびMCPサーバー環境から環境変数をマスクします(複数回使用できます)。複数の変数を指定するには、引用符で囲み、カンマ区切りでリストを指定します。`GITHUB_TOKEN`および`COPILOT_GITHUB_TOKEN`環境変数の値は、デフォルトで出力からマスクされます。 |
| `--session-id ID`                  | IDプレフィックスやセッション名による`--resume`のより広範な一致を行いたくない場合は、正確なセッションIDまたはタスクIDを使用します。IDが既存のセッションまたはタスクと一致する場合、そのセッションまたはタスクが再開されます。何も一致しない場合、値が有効なUUIDである場合にのみ新しいセッションが作成されます。名前やIDプレフィックスでは新しいセッションは作成されません。オープンまたは作成するセッションを決定するために競合するため、このオプションを`--resume`、`--continue`、`--connect`などの他のセッション選択またはセッション開始オプションと組み合わせないでください。 |
| `--trust-folder`                   | 1つの新しい非対話型セッション(`-p`またはパイプされた標準入力)に対して、作業ディレクトリのフック、ワークスペースMCPサーバー、およびリポジトリプラグインの設定を信頼します。この信頼は`trustedFolders`に保存されず、ツールやパスの許可の付与ではありません。`--resume`、`--continue`、または`--session-id`と組み合わせることはできません。 |
| `--sandbox`                        | 保存されたサンドボックス設定を変更することなく、このセッションに限りOSレベルのシェルサンドボックスを有効にします。`-p`と併用すると便利です。 |
| `--no-sandbox` | 保存されたサンドボックス設定を変更することなく、このセッションに限りローカルのサンドボックスを無効にします。エンタープライズ管理ポリシーがサンドボックスを適用するように構成されている場合、このオプションは無視されます。 |
| `--share=PATH`                     | プログラムセッションの完了後、セッションをMarkdownファイルに共有します(デフォルトパス: `./copilot-session-<ID>.md`)。 |
| `--share-gist`                     | プログラムセッションの完了後、セッションをシークレットGitHub gistに共有します。 |
| `--stream=MODE`                    | ストリーミングモードを有効または無効にします。これにより、完全な応答の到着を待つのではなく、生成されるにつれてCopilotの応答をプログレッシブに表示します(モードの選択肢: `on`または`off`、デフォルト: `on`)。
| `--sync-session[=on\|off]`         | 今回の実行で、読み取り専用のセッション履歴の同期を有効または無効にします。値を指定しない場合は、同期を有効にします。リモートコントロールは有効になりません。省略した場合は、設定とデフォルトの動作が使用されます。組織のクラウドセッションストレージポリシーが無効であるか、または判断できない場合、同期は拒否されます。 |
| `-v`、`--version`                  | バージョン情報を表示します。 |
| `-w`、`--worktree[=NAME]`          | デフォルトで`<repo>.worktrees/`の下に独立したGitワークフロー(worktree)を作成または再利用し、その中でセッションを開始します。場所を設定するには`worktreePathTemplate`設定を使用します。`NAME`はオプションです。ブランチ名を自動生成するには省略します。デフォルトでは現在のチェックアウト(`HEAD`)から分岐します。リモートのデフォルト分支から分岐するように設定するには、`worktreeBaseRef`設定を`"defaultBranch"`に設定します。`--resume`、`--continue`、および`--connect`とは併用できません。 |
| `--yolo`                           | すべての権限を有効にします（`--allow-all`と同等です）。 |

コマンドとオプションの完全なリストを表示するには、`copilot help`を実行します。

> [!NOTE]
> リモートセッション機能を利用するには、アカウントでその機能が利用可能である必要があります。従来の`--remote`オプションはインタラクティブセッションの制御用ではなく、`--no-remote`はサポートされなくなりました。
> 
> インタラクティブセッション中にリモートコントロールを有効にするには、`/remote on`を使用します。リモート接続を終了するには、`/remote off`を使用します。

クラッシュやマシンの再起動などにより、CLIプロセスの終了時にセッションがまだ開いていた場合、次に`copilot`を起動したときにそのセッションを復元するオプションが提示されます。復元可能なセッションを確認するか、代わりに新しいセッションを開始することができます。エージェントが処理の途中で中断していた復元されたセッションは、その作業を自動的に再開します。

### Plan-then-autopilot

Plan-then-autopilotを使用すると、セッションを計画モード（plan mode）で開始し、人間の承認を待たずに、計画の準備ができたら自動的に自動操縦モード（autopilot mode）に移行して続行できます。これを有効にするには、`--plan --mode autopilot`を使用するか、コマンドラインオプションではなく環境変数のみを注入できるハーネスの場合は`COPILOT_PLAN_THEN_AUTOPILOT`環境変数を使用します。両方が設定されている場合、明示的なオプションが優先され、環境変数が無視されたという警告がCLIに表示されます。

### 企業管理されたサンドボックスのフロア

企業管理ポリシーにより、最小限の下限としてOSレベルのシェルサンドボックスを強制することができます。つまり、`--no-sandbox`を指定した場合でも、ポリシーによってサンドボックスが強制的に有効化されることがあります。これはオプション自体の失敗ではなく、ポリシーのオーバーライドです。対照的に、`--sandbox`はサンドボックスを有効にするだけで決して解除しないため影響を受けません。有効なポリシーでサンドボックスのバイパスが許可されている場合は、アクティブなバイパス権限プロンプトに応答しながら、現在のセッションの残りの期間についてサンドボックスを明示的に無効化できます。

管理されたフロアによってサンドボックスが強制され、実効的な`sandbox.allowBypass`が`true`（ポリシーで`sandbox.enabled`のみが`true`に設定されている場合のデフォルト）である場合、`/sandbox disable`を実行して現在のセッションの残りの期間サンドボックスをオプトアウトします。最初にバイパスプロンプトは必要ありません。このオプトアウトはセッション内のみのものであり、`settings.json`には何も保存されず、新しいセッションは再びサンドボックス化された状態で開始され、`/sandbox enable`は新しいセッションを待たずに即座にサンドボックスを復元します。`allowBypass`が`false`である場合、`/sandbox disable`はサンドボックスが管理ポリシーによって強制されており無効化できないというメッセージとともに拒否します。

管理ポリシーが設定をオーバーライドした場合、オプションが機能しなかったのではなくポリシーの適用による挙動であることが明確になるよう、インタラクティブタイムライン（または`-p`を使用している場合はstderr）に警告が表示されます。ポリシーを変更する必要がある場合は、管理者に連絡してください。セッションの実効的な制限を確認するには、`/sandbox status`または`/sandbox policy`を使用します。

管理された`sandbox.failIfUnavailable`設定を`true`に設定し、さらに`sandbox.enabled`を`true`に設定すると、サンドボックスを確立できない場合にサンドボックスが必須になります。利用可能なサンドボックスバックエンドによってポリシーを検証、コンパイル、または適用できない場合、Copilotは、サンドボックス化されていない状態でコマンドの実行にフォールバックする代わりに、モデルとツールの実行をブロックします。[Enterprise managed settings](/copilot/reference/enterprise-administrators/enterprise-managed-settings#sandbox)を参照してください。

またCLIは、`--no-sandbox`をオーバーライドする場合だけでなく、ユーザーが要求していないセッションで管理ポリシーがサンドボックスを有効にした場合にも警告を表示します。これには、サーバー管理設定がログイン後にのみ利用可能になるため、起動後にポリシーが届いたセッションも含まれます。独自のSETTINGSや`--sandbox`オプションによってすでにサンドボックスが要求されていた場合、セッション状態が想定通りであるため、警告は省略されます。

読み込めない管理ポリシーがデバイスにある場合、CLIはフェイルクローズし、最も制限の厳しいレベルでサンドボックスを適用します。この通知では、ポリシーを特定できなかったことが説明され、解決を待つように指示されます。サポートされていないホストに対する起動時の警告も同じ文言を使用します。

### allow-allオプションの制限

`permissions.disableBypassPermissionsMode`が`"disable"`に設定されている場合、すべての権限を許可するコマンドラインオプション（`--allow-all-tools`、`--allow-all-paths`、`--allow-all-urls`、`--allow-all`、`--yolo`）は起動時に抑制され、昇格された権限を付与するために使用できなくなります。CLIは、これらのオプションを抑制したときにポリシー警告を表示します。`/permissions allow-all`スラッシュコマンド、およびそのエイリアスである`/allow-all`と`/yolo`も抑制されます。この設定はassisted permissionsをオフにするものではなく、これらは個別に制御されます。

#### `disable`によってオフになるもの

`permissions.disableBypassPermissionsMode`の値が`disable`の場合、すべての権限を付与するコマンドラインオプションは効果を持ちません。これらのオプションは、`--allow-all-tools`、`--allow-all-paths`、`--allow-all-urls`、`--allow-all`、および`--yolo`です。

この制限は、インタラクティブセッション中にも適用されます。allow-allモードを有効にするスラッシュコマンドは引き続き使用できますが、説明メッセージとともに拒否されます。

| コマンド | `disable`での結果 |
|---------|------------------------|
| `/permissions allow-all` | 拒否されます |
| 引数なしの`/allow-all`（およびそのエイリアス`/yolo`）、または`on` | 拒否されます |
| `/permissions assisted` | 許可されます |
| `/allow-all off`、`/allow-all show`、`/permissions default`、`/permissions show` | 許可されます |

allow-allコマンドが拒否された場合、メッセージは制限の由来によって異なります。独自の設定による制限の場合は「Bypass permissions mode has been disabled in your settings.」と報告されます。管理またはMDMポリシーによる制限の場合は「Bypass permissions mode has been disabled by policy. Contact your administrator for more information.」と報告されます。

#### 認識されない値

`permissions.disableBypassPermissionsMode`がこのバージョンで認識されない値に設定されている場合、CLIはその値を拒否しません。代わりにその値をログに記録し、安全なデフォルトとして`disable`を適用します。不正な形式のポリシーであっても、allow-allオプションを暗黙的に許可するのではなく、引き続き制限します。

#### 設定の由来となる場所

`permissions.disableBypassPermissionsMode`を設定できるソースは3つあります。これらは永続性が高くなる順にリストされています。

| ソース | スコープ | アカウントの切り替えによってクリアされますか？ |
|--------|-------|---------------------------|
| ユーザー設定（`~/.copilot/settings.json`） | マシン | いいえ。すべてのアカウントに適用されます。 |
| 管理設定（アカウントごとにサーバーから取得） | アカウント | はい。CLIは新しくアクティブになったアカウントのポリシーを読み込みます。 |
| MDMポリシー（plist/レジストリ/ファイル） | デバイス | いいえ。デバイスレベルのポリシーはアカウントの切り替えによって上書きされません。 |

### ポリシーを確認できない場合の制限の動作

ポリシーチェックの失敗によって、セッションが無制限の状態になるとは限りません。CLIは、管理されていないアカウントまたはデバイスと、適用可能な管理ポリシーを確認できないアカウントまたはデバイスを区別します。

* **確認されていない管理ポリシーによって権限を制限できます。**ポリシーチェックの保留中、または管理対象アカウントやデバイスのポリシーを確認できない場合、CLIは権限のエスカレーションをブロックし、アクションに対する明示的な承認を要求できます。これは、以前のポリシーでallow-allオプションが無効化されていない場合でも適用されることがあります。
* **サーバーポリシーはアカウント固有です。**更新が失敗した場合でも、同じアカウントに対して以前に取得したポリシーが有効なままになることがあります。アカウントを切り替えると、前のアカウントのサーバーポリシーを引き継ぐのではなく、新しいアカウントのポリシーが読み込まれます。
* **デバイスの制限はアカウント間で持続します。**アカウントを切り替えても、権限モードをブロックするMDMの制限やユーザー設定は削除されません。設定を省略したサーバー応答は、それらの制限を上書きしません。

## サポートされているモデル

AIモデルを選択するには、`--model=MODEL`または`COPILOT_MODEL`環境変数を使用します。Copilotに利用可能な最適なモデルを自動的に選択させるには、`auto`渡します。

| モデル | 最適な用途 |
|-------|----------|
| `claude-sonnet-5.5` | 汎用コーディング（デフォルト） |
| `gpt-6.1-sol` | 推奨、オプトイン（自動デフォルトではありません） |
| `gpt-6.1-terra` | 推奨、オプトイン（自動デフォルトではありません） |
| `gpt-6-astra` | 推奨、オプトイン（自動デフォルトではありません） |
| `gpt-6-luna` | 推奨、オプトイン（自動デフォルトではありません） |
| `claude-opus-5.5` | 推奨、高機能な複雑なタスク |
| `claude-haiku-5.5` | 高速で軽量な操作 |
| `claude-haiku-4.5` | 高速で軽量な操作 |
| `gpt-5.3-codex` | コード中心のタスク |
| `gemini-3.8-flash` | 高速なGoogle Geminiの応答 |

また、`/model`スラッシュコマンドを使用して、インタラクティブセッション中にモデルを切り替えることもできます。

## ツール可用性の値

`--available-tools`および`--excluded-tools`オプションは、以下の値をサポートしています。

### シェルツール

| ツール名 | 説明 |
|---|---|
| `bash` / `powershell` | コマンドを実行する |
| `list_bash` / `list_powershell` | アクティブなシェルセッションをリストする |
| `read_bash` / `read_powershell` | シェルセッションからの出力を読み取る |
| `stop_bash` / `stop_powershell` | シェルセッションを終了する |
| `write_bash` / `write_powershell` | シェルセッションに入力を送信する |

### ファイル操作ツール

| ツール名 | 説明 |
|---|---|
| `apply_patch` | パッチを適用する（`edit`/`create`の代わりに一部のモデルで使用されます） |
| `create` | 新しいファイルを作成する |
| `edit` | 文字列の置換によってファイルを編集する |
| `view` | ファイルまたはディレクトリを読み取る |

### エージェントおよびタスク委任ツール

| ツール名 | 説明 |
|---|---|
| `list_agents` | 利用可能なエージェントをリストする |
| `read_agent` | バックグラウンドエージェントのステータスを確認する |
| `task` | サブエージェントを実行する |
| `write_agent` | 実行中のエージェントにメッセージを送信する |

### その他のツール

| ツール名 | 説明 |
|---|---|
| `ask_user` | ユーザーに質問する |
| `glob` | パターンに一致するファイルを検索します。 |
| `grep`（または`rg`） | ファイル内のテキストを検索します。 |
| `skill` | カスタムskillを呼び出します。 |
| `web_fetch` | Webコンテンツを取得して解析します。 |

## ツールの権限パターン

`--allow-tool`および`--deny-tool`オプションは、`Kind(argument)`形式の権限パターンを受け付けます。引数は任意です。省略した場合は、その種類のすべてのツールに一致します。

| 種類 | 説明 | パターンの例 |
|------|-------------|-----------------|
| `memory` | エージェントのメモリに事実を保存します。[AUTOTITLE]（/copilot/concepts/agents/copilot-memory）を参照してください。 | `memory` |
| `read` | ファイルまたはディレクトリの読み取り | `read`、`read(.env)` |
| `shell` | シェルコマンドの実行 | `shell(git push)`、`shell(git:*)`、`shell` |
| `url` | web-fetchまたはシェル経由でのURLアクセス | `url(github.com)`、`url(https://*.api.com)` |
| `write` | ファイルの作成または変更 | `write`、`write(src/*.ts)` |
| SERVER-NAME | MCPサーバツールの呼び出し | `MyMCP(create_issue)`、`MyMCP` |

`shell`ルールの場合、`:*`サフィックスはコマンドの語幹の後にスペースが続くものに一致し、部分一致を防ぎます。たとえば、`shell(git:*)`は`git push`および`git pull`に一致しますが、`gitea`には一致しません。

拒否ルールは、`--allow-all`が設定されている場合でも、許可ルールよりも常に優先されます。

```shell
# Allow all git commands except git push
copilot --allow-tool='shell(git:*)' --deny-tool='shell(git push)'

# Allow a specific MCP server tool
copilot --allow-tool='MyMCP(create_issue)'

# Allow all tools from a server
copilot --allow-tool='MyMCP'

# Deny writes to a specific path (exact or trailing-path-segment match; no glob support yet)
copilot --deny-tool='write(secret.txt)'
```

`--deny-tool='write(PATH)'`は拒否の対象範囲をそのパスに限定し、他の書き込みには影響を与えません。一致の判定ではシンボリックリンクと`.`/`..`セグメントが解決され、macOSおよびWindowsでは大文字と小文字が区別されません。

## 環境変数

| 変数 | 説明 |
|----------|-------------|
| `COPILOT_ALLOW_ALL` | すべての権限を自動的に許可します（`--allow-all`と同等です）。有効にするには`true`、`1`、`yes`、`on`、または`y`（大文字と小文字は区別されず、前後の空白は無視されます）を受け付け、無効にするには`false`、`0`、`no`、`off`、`n`、または空の値を受け付けます。正確に`true`に設定すると、プロンプトなしで作業ディレクトリも信頼され、そのディレクトリのskills、プラグイン、MCPサーバ、およびフック（シェルコマンドを実行するフックを含みます）が読み込まれます。その他の真値の表記では、ツールの自動承認のみが行われます。 |
| `COPILOT_ASSISTED_APPROVAL` | 非対話型の実行でassisted permissionsを有効にするには`true`に設定します（`--assisted-approval`と同等です）。 |
| `COPILOT_AUTO_UPDATE` | CLIおよびファーストパーティプラグインの自動アップデートを無効にし、インストールされているバージョンの代わりに新しくキャッシュされたCLIバージョンが実行されるのを防ぐには`false`に設定します。 |
| `COPILOT_CACHE_HOME` | キャッシュディレクトリ（マーケットプレイスのキャッシュ、自動アップデートパッケージ、その他の一時データに使用されます）を上書きします。プラットフォームのデフォルトについては、[GitHub Copilot CLI configuration directory](/copilot/reference/copilot-cli-reference/cli-config-dir-reference#changing-the-location-of-the-configuration-directory)を参照してください。 |
| `COPILOT_CHILD_OOM_SCORE_ADJ` | Linuxのみ。CLIによって生成されたシェルコマンドプロセスツリーに適用される`oom_score_adj`バイアスを上書きし、CLI自体よりも前にカーネルのOOM（Out-Of-Memory）キラーが暴走した子プロセスツリー（ビルドなど）を回収するようにします。デフォルト: `300`。範囲: `-1000`～`1000`。バイアスを無効にするには`off`に設定します。 |
| `COPILOT_CUSTOM_INSTRUCTIONS_DIRS` | カスタム指示のための追加ディレクトリのカンマ区切りリストです。 |
| `COPILOT_EDITOR` | 対話型編集のエディタコマンド（`$VISUAL`および`$EDITOR`の後に確認されます）。何も設定されていない場合のデフォルトは`vi`です。 |
| `COPILOT_ENABLE_HTTP2` | HTTP/2トランスポートを選択するには`1`または`true`に設定します。デフォルトはHTTP/1.1です。 |
| `COPILOT_ENABLE_INTERRUPTED_SESSION_RESTORE` | クラッシュやマシンの再起動などによってCLIプロセスが終了したときに、まだ開いていたセッションの復元を有効にするには`1`に設定します。この復元動作は、開始時のダイアログが作り直されている間の一時的なオプトイン機能です。[Restoring an interrupted session](#restoring-an-interrupted-session)を参照してください。 |
| `COPILOT_GH_HOST` |Copilot CLI専用のGitHubホスト名で、`GH_HOST`を上書きします。`GH_HOST`がGitHub Enterprise Serverをターゲットにしている一方で、CopilotがGitHub.comまたはGitHub Enterprise Cloudのホスト名に対して認証を行う必要がある場合に使用します。 |
| `COPILOT_GITHUB_TOKEN` | 認証トークン。`GH_TOKEN`および`GITHUB_TOKEN`よりも優先されます。 |
| `COPILOT_HOME` | 構成および状態ディレクトリを上書きします。デフォルト: `$HOME/.copilot`。 |
| `COPILOT_LARGE_OUTPUT_THRESHOLD_BYTES` | モデルに直接返されるツール出力の最大UTF-8バイトサイズ。デフォルト: `20480`（20 KiB）。[Managing context for GitHub Copilot](/copilot/concepts/prompting-and-context/context-management#managing-large-tool-output-for-copilot-cli)を参照してください。 |
| `COPILOT_MCP_TOOL_CACHE` | プロセス全体でのローカルMCPサーバツールスナップショットの読み込みと永続化を無効にするには`false`に設定します。[Tool snapshot caching](#tool-snapshot-caching)を参照してください。 |
| `COPILOT_MODEL` | AIモデルを設定します。 |
| `COPILOT_PLAN_THEN_AUTOPILOT` | 環境変数のみを注入できるハーネスに対して、プラン作成後に自動パイロットを実行するモード（`--plan --mode autopilot`と同等）を要求するには、`1`、`true`、`yes`、または`on`に設定します。明示的な`--mode`、`--autopilot`、または`--plan`オプションが渡された場合は、警告とともに無視されます。[Plan-then-autopilot](#plan-then-autopilot)を参照してください。 |
| `COPILOT_PROMPT_FRAME` | 入力プロンプトの周囲の装飾的なUIフレームを有効にするには`1`に、無効にするには`0`に設定します。現在のセッションの`PROMPT_FRAME`実験的機能フラグを上書きします。 |
| `COPILOT_PROVIDER_API_KEY_COMMAND` | プロバイダからの各リクエストの前に、最新のBYOK（Bring Your Own Key）APIキーを出力するシェルコマンド。`COPILOT_PROVIDER_API_KEY`環境変数よりも優先されます。`COPILOT_PROVIDER_HEADERS`を介して設定されたカスタムヘッダーと競合する場合でも、その出力が一致する資格情報ヘッダーを置き換えます。 |
| `COPILOT_PROVIDERS_CONFIG` | BYOKプロバイダおよびモデルレジストリを定義するJSONファイルへのパスで、`providers`および`models`キーを持つオブジェクトとして指定します。デフォルト: `<COPILOT_HOME>/providers.json`。このファイルで任意のプロバイダまたはモデルが宣言されている場合、レガシーな`COPILOT_PROVIDER_*`環境変数よりも優先されます。[`providers.json`](/copilot/reference/copilot-cli-reference/cli-config-dir-reference#providersjson)を参照してください。 |
| `COPILOT_SKILLS_DIRS` | skillsのための追加ディレクトリのカンマ区切りリストです。 |
| `PLUGINS_DASHBOARD` | 指定なしの`/plugin`、`/mcp`、および`/skills`によって開かれるプラグインダッシュボードを無効にし、非対話型の`copilot plugin`/`copilot plugins`コマンドを無効にするには`false`に設定します。 |
| `COPILOT_STRIP_REASONING_ON_RESUME` | セッションの再開時にBYOKの推論トークンを削除せずに保持するには`0`または`false`に設定します。デフォルトでは削除されます。 |
| `COPILOT_SUBAGENT_MAX_CONCURRENT` | セッションごとの最大同時サブエージェント数（デフォルト: `32`、範囲: `1`～`256`）。 |
| `COPILOT_SUBAGENT_MAX_DEPTH` | サブエージェントの最大ネスト深度（デフォルト: `4`、範囲: `1`～`128`）。 |
| `COPILOT_TASK_WAIT_TIMEOUT_SECONDS` | 終了する前に保留中のバックグラウンドエージェントまたはシェルコマンドの完了を`-p`（および`-p --autopilot`）が待機する最大秒数（デフォルト: `600`。`0`は待機せずに即座に終了します）。 |
| `GH_HOST` | GitHub CLIおよびCopilot CLIの両方のGitHubホスト名（デフォルト: `github.com`）。データ主権対応のホスト名を持つGitHub Enterprise Cloudに設定します。Copilot CLIのみに対しては`COPILOT_GH_HOST`で上書きします。 |
| `GH_TOKEN` | 認証トークン。`GITHUB_TOKEN`よりも優先されます。 |
| `GITHUB_COPILOT_PROMPT_MODE_EXTENSIONS` | プロンプトモード（`-p`）でプロジェクト拡張機能を読み込み、拡張機能管理ツールを許可するには`true`に設定します。対話的な信頼なしにリポジトリ制御下の拡張機能コードが実行されるのを防ぐため、デフォルトでは無効になっています。 |
| `GITHUB_COPILOT_PROMPT_MODE_REPO_HOOKS` | プロンプトモード（`-p`）でリポジトリフックを読み込むには`true`に設定します。リポジトリフックは、フォルダがすでに信頼されている場合や`COPILOT_ALLOW_ALL`が設定されている場合にも自動的に読み込まれます。 |
| `GITHUB_COPILOT_PROMPT_MODE_WORKSPACE_MCP` | プロンプトモード（`-p`）でワークスペースのMCPソースを読み込むには`true`に設定します。対話的な信頼なしにリポジトリ制御下のMCPサーバが起動するのを防ぐため、デフォルトでは無効になっています。 |
| `GITHUB_TOKEN` | 認証トークン。 |
| `PLAIN_DIFF` | リッチなdiffレンダリングを無効にするには`true`に設定します。 |
| `USE_BUILTIN_RIPGREP` | バンドル版ではなくシステムのripgrepを使用するには`false`に設定します。 |
 | `USE_TGREP` | Gitリポジトリの外、または仮想化ファイルシステムやネットワークファイルシステム（Gitチェックアウト用のVFSやSMB/9pマウントなど）上であっても常にトライグラムインデックス型検索エンジンの[tgrep](https://github.com/microsoft/tgrep)を使用するには`true`に設定し、常にripgrepを使用するには`false`に設定します。Gitリポジトリの外で強制された場合、tgrepは作業ディレクトリ自体をインデックス化するため、ホームディレクトリなどの巨大な場所で強制することは避けてください。Windowsのクラウド同期フォルダ（OneDriveなど）では、これが`true`に設定されている場合でも、常にripgrepが使用されます。未設定の場合、Copilot CLIはGitリポジトリ内かつ非仮想化ファイルシステム上であり、かつ`TGREP_FILE_COUNT_THRESHOLD`で設定されたファイル数の閾値に達した場合にのみ、ripgrepからtgrepに自動的に切り替えます。`USE_TGREP=true`を設定すると、この閾値を完全にバイパスします。`USE_TGREP=false`は引き続きtgrepを無効にします。 |
| `TGREP_FILE_COUNT_THRESHOLD` | 自動tgrepインデックス検索のための最小ファイル数（非負の整数。デフォルト: Windowsでは`10000`、その他の環境では`50000`）。無効な値はプラットフォームのデフォルトにフォールバックします。`0`はファイル数の要件のみを解除し、その他の自動開始チェックは引き続き適用されます。 |

## 設定ファイルの設定

ユーザー設定、リポジトリ設定、ローカル設定の完全なリストや、それらがどのようにカスケードされるかを含む、設定ファイルの設定に関する詳細情報については、[GitHub Copilot CLI configuration directory](/copilot/reference/copilot-cli-reference/cli-config-dir-reference#configuration-file-settings)を参照してください。

## Copilotのプロジェクト初期化

コマンド`copilot init`、または対話型セッション内でスラッシュコマンド`/init`を使用すると、Copilotがコードベースを分析し、リポジトリに`.github/copilot-instructions.md`ファイルを書き込むか更新します。このカスタム指示ファイルには、今後のCLIセッションを改善するためのプロジェクト固有のガイダンスが含まれています。

通常、新しいプロジェクトを開始するときや、既存のリポジトリでCopilot CLIを使い始めるときに`copilot init`または`/init`を使用します。

作成または更新される`copilot-instructions.md`ファイルには、通常次の内容が記載されます。

* ビルド、テスト、およびリントのコマンド。
* 高レベルのアーキテクチャ。
* コードベース固有の規約。

ファイルがすでに存在する場合、Copilotは改善案を提案します。これを適用するかどうかを選択できます。

CLIは起動時に`copilot-instructions.md`ファイルを探し、見つからない場合は次のメッセージを表示します。

> 💡 copilot instructionsが見つかりませんでした。/initを実行して、このプロジェクト用のcopilot-instructions.mdファイルを生成してください。

このファイルを作成したくない場合は、スラッシュコマンド`/init suppress`を使用して、現在のリポジトリでのこの起動メッセージを永続的に非表示にすることができます。

詳細については、[Adding repository custom instructions for GitHub Copilot](/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions)を参照してください。

初期化セッションのみでOSレベルのシェルサンドボックスを有効化または無効化するには、保存されているサンドボックス設定を変更せずに`copilot init`と共に`--sandbox`または`--no-sandbox`を使用します。これらのオプションには、他のエントリーポイントと同様に企業管理のサンドボックスの制約が適用されます。[Enterprise-managed sandbox floor](#enterprise-managed-sandbox-floor)を参照してください。

### カスタム指示の場所

Copilot CLIは、次の場所から同時にカスタム指示を読み込みます（すべてマージされます）：

| 場所 | 備考 |
|----------|-------|
| `CLAUDE.md` | Gitのルートおよびカレントディレクトリ内 |
| `GEMINI.md` | Gitのルートおよびカレントディレクトリ内 |
| `AGENTS.md` | Gitのルートおよびカレントディレクトリ内 |
| `.github/instructions/**/*.instructions.md` | Gitのルートおよびカレントディレクトリ内 |
| `.claude/rules/**/*.md` | Gitのルートおよびカレントディレクトリ内 |
| `.github/copilot-instructions.md` | Gitのルートおよびカレントディレクトリ内 |
| `$HOME/.copilot/copilot-instructions.md` | — |
| `$HOME/.copilot/instructions/**/*.instructions.md` | — |
| `COPILOT_CUSTOM_INSTRUCTIONS_DIRS` | 環境変数による追加ディレクトリ。 |

Copilot CLIは、`.github/instructions/**/*.instructions.md`ファイルを読み込むのと同じ方法で、`.claude/rules/**/*.md`からClaude Codeルールファイルを読み込みます。`paths`（または`applyTo`）フロントマターキーを使用して、一致するファイルにルールをスコープ指定します：

```markdown
---
paths: "src/api/**/*.ts"
description: API layer conventions
---

Use the shared `ApiError` type for all thrown errors in this directory.
```

リポジトリのルートおよび作業ディレクトリにあるスコープ指定されたルールは、エージェントが一致するファイルを読み取るか編集するときに自動的に適用されます。

### カスタム指示のインポート

指示ファイルは`@path`インポートをサポートしています。別のファイルの内容をインライン化するには、行頭に`@`とパスを記述します。パスは、指示ファイルのディレクトリからの相対パスまたは絶対パスにすることができます。インポートは、循環参照およびサイズのガードを備えた深度制限まで、再帰的に解決されます。これは`AGENTS.md`、`CLAUDE.md`、および`.github/copilot-instructions.md`でサポートされています。

## フックのリファレンス

フックの設定形式、フックイベント、入力ペイロード、決定制御など、フックに関する詳細情報については、[GitHub Copilot hooks reference](/copilot/reference/hooks-reference)を参照してください。

## MCPサーバーの設定

MCPサーバーは、CLIエージェントに追加のツールを提供します。永続的なサーバーは`~/.copilot/mcp-config.json`で設定します。単一のセッション用に追加のサーバーを追加するには`--additional-mcp-config`を使用します。

サンドボックス内で起動するローカル（stdio）サーバー（`/sandbox`スラッシュコマンドを参照）は、`copilot mcp list`および`/mcp list`で`connected (sandboxed)`ステータスを表示します。リモート（HTTP/SSE）サーバーはローカルでサンドボックス化されませんが、CLIからの接続はサンドボックスのネットワークポリシーによって制限される場合があります。

`copilot mcp list`および`/mcp list`は、テキスト出力では無効化されたサーバーに`(disabled)`サフィックスを付け、`--json`出力ではサーバーごとに`"enabled": false`を付けます。`copilot mcp get`は`Status: Enabled`/`Disabled`の行を表示します。

`/sandbox`の切り替えは、ローカル（stdio）MCPサーバーのみを再起動します。これらはサンドボックス内で起動するためです。リモート（HTTP/SSE）サーバーは接続されたままになります。

`/mcp edit <name>`は、ユーザー層のウィザードを開く代わりに、リポジトリの`.mcp.json`で定義されたワークスペース由来のサーバーを拒否します。これは、保存すると、ワークスペースのサーバーがまだシャドウしている同名のユーザーエントリが静かに作成されてしまうためです。エラーでは直接編集すべきファイル名が示されます。`/mcp delete <name>`は、ワークスペース由来のサーバーの削除を求められたときにも同じファイルを報告します。

### `copilot mcp`サブコマンド

対話型セッションを開始せずにコマンドラインからMCPサーバーの設定を管理するには、`copilot mcp`を使用します。

| サブコマンド | 説明 |
|------------|-------------|
| `list [--json]` | プラグイン提供のサーバーや、`--additional-mcp-config`または`--plugin-dir`を介して供給されたサーバーを含め、ソースごとにグループ化された設定済みのすべてのMCPサーバーを一覧表示します。 |
| `get <name> [--json]` | 特定のサーバーの設定とツールを表示します。プラグイン提供のサーバーの場合、ソースプラグインの名前とバージョンも表示されます。 |
| `add [options] <name> [url]` | ユーザー設定にサーバーを追加します。`~/.copilot/mcp-config.json`に書き込みます。 |
| `enable <name>` / `disable <name>` | 名前を指定してサーバーを有効または無効にします。変更はユーザー設定に永続化され、将来のセッションに適用されます。 |
| `remove <name>` | ユーザーレベルのサーバーを削除します。ワークスペースサーバーは、その設定ファイルを直接編集する必要があります。 |

ローカル（stdio）サーバーの場合は、`--`の後にコマンドを指定します：

```shell copy
copilot mcp add SERVER-NAME -- COMMAND [ARGS...]
```

リモートのHTTPまたはSSEサーバーの場合は、トランスポートを指定してURLを提供します：

```shell copy
copilot mcp add --transport http SERVER-NAME URL
```

**`copilot mcp add`のオプション:**

| オプション | 説明 |
|--------|-------------|
| `-- <command> [args...]` | ローカル（stdio）サーバーのコマンドと引数。 |
| `<url>` | リモートサーバーのURL。 |
| `--transport <transport>` | トランスポートの種類：`stdio`、`http`、または`sse`。デフォルトは`stdio`です。 |
| `--env KEY=VALUE` | 環境変数（繰り返し指定可能）。 |
| `--header "HEADER: VALUE"` | リモートサーバー用のHTTPヘッダー（繰り返し指定可能）。 |
| `--tools <tools>` | ツールフィルター：すべての場合は`"*"`、カンマ区切りのリスト、またはなしの場合は`""`。 |
| `--timeout <ms>` | ツール検出およびツール呼び出しのタイムアウト（ミリ秒）。デフォルト：`30000`。少数部、単位サフィックス、符号、指数を持たない正の整数であり、`1`から`4294967295`までを指定する必要があります。 |
| `--json` | 追加された設定をJSONとして出力します。 |
| `--show-secrets` | 環境変数とヘッダーの完全な値を表示します。 |

`/mcp add`/`/mcp edit`の対話型フォームでは、`env`フィールドにカンマ区切りの`KEY=VALUE`ペア、またはJSONオブジェクト（例：`{"API_KEY":"secret"}`）として入力します。`$PATH`はデフォルトで含まれているため、リストに含める必要はありません。

> [!CAUTION]
> `--show-secrets`は、機密性の高い環境変数やヘッダーの値をターミナルやログに出力することができます。このオプションは信頼できる環境でのみ使用し、共有ログや履歴への出力のコピー、貼り付け、その他のキャプチャは避けてください。

### トランスポートの種類

| 種類 | 説明 | 必須フィールド |
|------|-------------|----------------|
| `local` / `stdio` | stdin/stdoutを介して通信するローカルプロセス。 | `command`、`args` |
| `http` | ストリーム可能なHTTPトランスポートを使用するリモートサーバー。`"streamable-http"`もエイリアスとして受け入れられ、`"http"`に正規化されます。 | `url` |
| `sse` | Server-Sent Eventsトランスポートを使用するリモートサーバー。 | `url` |

### ローカルサーバーの設定フィールド

| フィールド | 必須 | 説明 |
|-------|----------|-------------|
| `command` | はい | サーバーを起動するコマンド。 |
| `args` | はい | コマンド引数（配列）。 |
| `tools` | はい | 有効化するツール：すべての場合は`["*"]`、または特定のツール名のリスト。 |
| `env` | いいえ | 環境変数。`$VAR`、`${VAR}`、および`${VAR:-default}`の展開をサポートしています。 |
| `cwd` | いいえ | サーバーの作業ディレクトリ。 |
| `timeout` | いいえ | ツール検出およびツール呼び出しのタイムアウト（ミリ秒）。デフォルト：`30000`。 |
| `type` | いいえ | `"local"`または`"stdio"`。デフォルト：`"local"`。 |
| `deferTools` | いいえ | `"auto"`（デフォルト）または`"never"`。ツール検索がアクティブな場合でもこのサーバーのツールを常に表示状態にしておくには、`"never"`に設定します。 |
| `disableToolCache` | いいえ | このサーバーのツールスナップショットの読み込みと永続化をスキップするには、`true`に設定します。 |
| `slowConnectionThresholdMs` | いいえ | このサーバーの接続に想定よりも時間がかかっていることをCopilot CLIが警告するまでのミリ秒数。デフォルト：`10000`。この設定は警告が表示されるタイミングにのみ影響し、接続タイムアウトは変更しません。`2147483647`以下の正の整数を指定する必要があります。 |

`slowConnectionThresholdMs`と`timeout`は独立しています。`timeout`は実際の接続予算を設定し（最小値は`60000` ms）、`slowConnectionThresholdMs`は進行中の接続に対する警告をCopilot CLIが出力するタイミングのみを制御します。ツール呼び出しにかかる時間を延長することなく、認証フローの背後にあるサーバーなどの予期される遅いハンドシェイクに対して静かにさせるには、`slowConnectionThresholdMs`を引き上げます。

### ツールスナップショットのキャッシュ

Copilot CLIは、各ローカルサーバーのツールリストのスナップショットを保持するため、バックグラウンドでライブディスカバリーが完了している間、起動時にツールをすぐ利用できるようになります。ライブディスカバリーは常に実行され、完了するとスナップショットを置き換えます。

サーバーに`disableToolCache: true`を設定してそのサーバーのみライブディスカバリーを強制するか、`COPILOT_MCP_TOOL_CACHE=false`環境変数を設定してプロセス全体でスナップショットの読み込みと保持を無効にします。どちらの除外設定も、既存のキャッシュファイルには影響しません。

### プライベートnpmレジストリ

ArtifactoryやGitHub Packagesフィードなどのプライベートnpmレジストリからパッケージを取得するには、`args`配列内で`--registry`を使用します。

```json
{
    "mcpServers": {
        "my-internal-server": {
            "command": "npx",
            "args": [
                "--registry", "https://npm.pkg.github.com",
                "@my-org/internal-mcp-server"
            ],
            "tools": ["*"]
        }
    }
}
```

サーバーのアイデンティティフィンガープリントを計算する際、`--registry`オプションおよびその他のnpm設定オプション（`--userconfig`、`--globalconfig`、`--prefix`、`--cache`、`--node-options`、`--workspace`、`-w`）は、値を受け取る引数として扱われます。これにより、これらのオプションがパッケージ名の前に指定された場合でも、エンタープライズの許可リストチェックとレジストリ検証が正しく機能するようになります。

### リモートサーバー設定フィールド

| フィールド | 必須 | 説明 |
|-------|----------|-------------|
| `type` | はい | `"http"`または`"sse"`（`"streamable-http"`は`"http"`のエイリアスとしても受け付けられます）。 |
| `url` | はい | サーバーのURL。 |
| `tools` | はい | 有効にするツール。 |
| `headers` | いいえ | HTTPヘッダー。変数の展開をサポートしています。 |
| `oauthClientId` | いいえ | 静的なOAuthクライアントID（動的登録をスキップします）。 |
| `oauthScopes` | いいえ | リクエストするOAuthスコープトークンの空ではない配列。`oauthClientId`が必要です。サーバーの`WWW-Authenticate`チャレンジにある空ではないスコープが引き続き優先されます。それ以外の場合は、検出された`scopes_supported`メタデータを上書きします。 |
| `oauthPublicClient` | いいえ | OAuthクライアントがパブリックかどうか。デフォルト: `true`。シークレットが保存されている機密クライアントの場合は`false`に設定します。 |
| `oauthGrantType` | いいえ | OAuthグラントタイプ: `"authorization_code"`（デフォルト、ブラウザーベースのフロー）または`"client_credentials"`（完全なヘッドレス、ブラウザーやコールバックなし）。 |
| `oidc` | いいえ | OIDCトークンのインジェクションを有効にします。`true`の場合、CLIはサーバーの`env`ブロックで参照されている任意の`GITHUB_COPILOT_OIDC_MCP_TOKEN`または`GITHUB_COPILOT_OIDC_MCP_TOKEN_<SUFFIX>`変数のOIDCトークンをインジェクションするか（ローカルサーバー）、トークンを`Bearer` `Authorization`ヘッダーとして送信します（リモートサーバー）。ローカルサーバーの場合は、サーバーごとに一意の変数名を割り当てるために、サフィックス付きのバリアント（例: `${GITHUB_COPILOT_OIDC_MCP_TOKEN_MY_SVC}`）を使用することをお勧めします。 |
| `timeout` | いいえ | ツールディスカバリーおよびツール呼び出しのタイムアウト（ミリ秒）。デフォルト: `30000`。 |
| `deferTools` | いいえ | `"auto"`（デフォルト）または`"never"`。ツール検索がアクティブな場合でもこのサーバーのツールを常に表示状態に保つには、`"never"`に設定します。 |
| `slowConnectionThresholdMs` | いいえ | このサーバーへの接続に想定よりも時間がかかっていることをCopilot CLIが警告するまでのミリ秒数。デフォルト: `10000`。この設定は警告が表示されるタイミングのみに影響し、接続タイムアウトは変更されません。`2147483647`以下の正の整数である必要があります。 |

### OAuthの再認証

OAuthを使用するリモートMCPサーバーは、トークンの有効期限が切れたときや別のアカウントが必要なときに、`needs-auth`ステータスを表示する場合があります。新規のOAuthフローをトリガーするには`/mcp auth <server-name>`を使用します。これによりブラウザーの認証プロンプトが開き、サインインまたはアカウントの切り替えが可能になります。フローが完了すると、サーバーは自動的に再接続します。

Windowsでは、Microsoft Entra IDで保護されたリモートMCPサーバーは、通常プロンプトなしで、OSの認証ブローカー（Web Account Manager）を通じて認証を行います。OSブローカーが存在しないLinuxやmacOSでは、CLIは代わりに`/login` → Microsoft Entraを介して確立されたEntraアカウントから、リソースごとのトークンをサイレントに発行します。そのアカウントでリクエストをサイレントに満たせない場合（サインインしたEntra IDがない、あいまいなアカウント、別クライアント用に事前承認されたリソースなど）、上記のブラウザーフローによるサインインにフォールバックします。`--device-code`を渡すと、ブローカーをバイパスし、ブラウザーフローではなくOAuthデバイスコードフローが強制されます。また、ブローカーライブラリのないWindowsマシンもブラウザーフローにフォールバックします。

### アカウント由来のWorkIQ

Microsoft Entraアカウントでサインインすると、ホストされているWorkIQ MCPサーバーが`/mcp`で利用可能になります。デフォルトでは無効になっています。ディスカバリーだけでは接続、トークンの取得、またはツールの公開は行われません。まずはサイレント認証を試すために、通常のMCPコントロール（`/mcp enable WorkIQ`または`copilot mcp enable WorkIQ`）で有効にしてください。`/mcp auth WorkIQ`は復元用に引き続き利用できます。

サーバーは、別のサービス用に発行されたトークンではなく、サインインしたEntraアカウントに紐づく資格情報を使用します。その有効化は、別のアカウントに引き継がれるのではなく、そのEntra IDに従います。明示的なサーバーの設定と無効化、および組織の許可リストまたは拒否リストのポリシーが引き続き優先されます。WorkIQのエントリは`mcp-config.json`に書き込まれません。これは、独立して認証されたstdioサーバーとして`npx @microsoft/workiq mcp`を実行するのとは無関係です。

### ヘッドレスOAuth（`client_credentials`グラント）

ブラウザーを利用できないCIまたはcronのユースケースでは、`oauthGrantType: "client_credentials"`を設定します。これには以下が必要です。

* `oauthClientId` — MCPプロバイダーによって発行された静的クライアントID。
* `oauthPublicClient: false` —クライアントが機密であること。
* システムキーチェーンに保存された`client_secret`（`/mcp` UIを使用するか、OAuth資格情報ストアに書き込むことで一度設定します）。

設定すると、CLIはブラウザー、コールバックサーバー、PKCE、および動的クライアント登録を完全にスキップします。401エラーが発生するたびに、サーバーで検出されたトークンエンドポイントに対して`grant_type=client_credentials`を直接送信します。

```json
{
    "mcpServers": {
        "headless-api": {
            "type": "http",
            "url": "https://api.example.com/mcp",
            "tools": ["*"],
            "oauthClientId": "YOUR-CLIENT-ID",
            "oauthPublicClient": false,
            "oauthGrantType": "client_credentials"
        }
    }
}
```

### フィルターマッピング

サーバーの設定にある`filterMapping`フィールドを使用して、MCPツールの出力の処理方法を制御します。

| モード | 説明 |
|------|-------------|
| `none` | フィルタリングなし。 |
| `markdown` | 出力をMarkdownとしてフォーマットします。 |
| `hidden_characters` | 非表示文字または制御文字を削除します。デフォルト。 |

### 組み込みMCPサーバー

無効にするか独自の設定を提供しない限り、CLIは認証が利用可能な場合に`github-mcp-server`を自動的に設定します。その他のサーバーは、アカウント、プラットフォーム、CLIのバージョン、および有効なプラグインによって異なります。すべてがデフォルトで利用可能または有効になるわけではありません。

| サーバー | 説明 | 可用性と設定 |
|--------|-------------|------------------------|
| `github-mcp-server` | リポジトリへのアクセスやコード検索を含むGitHubの統合。 | 認証が利用可能な場合はデフォルトで有効になります。公開されるツールは設定によって異なります。 |
| `WorkIQ` | Microsoft Entraアカウントに関連付けられた、ホスト型のMCPサーバー。 | Microsoft Entraアカウントでサインインした後に検出されます。デフォルトでは無効です。[アカウント由来のWorkIQ](#account-derived-workiq)を参照してください。 |
| `browser-use` | バンドルされたプラグインを通じたブラウザーの操作。 | プラグインが含まれるCLIのバージョンで利用可能です。デフォルトでは無効です。`/mcp enable browser-use`で有効にし、対応するブラウザー拡張機能とNode.js 22 or laterをインストールしてから、`/browser-use:activate`を実行するか新しいセッションを開始してください。レガシーサーバー名は`github-copilot-browser`です。 |
| `computer-use` | バンドルされたプラグインを通じたデスクトップアプリケーションの操作。 | macOSおよびWindowsのローカルセッションで利用可能です。デフォルトでは無効です。`/computer on`で有効にしてください。macOSでは、アクセシビリティおよび画面収録の権限が必要です。[Using GitHub Copilot CLI to interact with desktop applications](/copilot/how-tos/copilot-cli/use-copilot-cli/computer-use)を参照してください。 |

管理対象の設定により、サーバーやそのプラグインの有効化が制限される場合があります。

`--disable-builtin-mcps`は、現在の実行において`github-mcp-server`、`WorkIQ`、`browser-use`、およびレガシーブラウザーサーバー名`github-copilot-browser`を無効にします。`computer-use`は無効になりません。現在の実行でそのサーバーを無効にするには`--disable-mcp-server computer-use`を使用し、プラグインを無効にしてその設定を保存するには`/computer off`を使用します。他の特定のサーバーを現在の実行で無効にするには`--disable-mcp-server SERVER-NAME`を使用します。

利用可能なサーバーとその接続状態を確認するには、インタラクティブセッション内で`/mcp list`を使用します。サーバーの設定を検査するには、セッション外で`copilot mcp list`または`copilot mcp get SERVER-NAME`を使用します。サーバーが存在しないか無効であるからといって、必ずしも設定エラーであるとは限りません。上記の可用性と設定の要件を確認してください。

#### GitHub MCPサーバーのツール

`github-mcp-server`は以下のツールを提供します。

| ツール | 説明 |
|-------|-------------|
| `get_file_contents`、`search_code` | リポジトリファイルを閲覧します。 |
| `list_issues`、`issue_read`、`search_issues` | Issueの追跡。 |
| `get_pull_request`、`list_pull_requests`、`get_pull_request_files` | pull request。 |
| `list_commits`、`get_commit` | コミット履歴。 |
| `list_workflow_runs`、`get_workflow_run_logs` | GitHub Actions. |
| `get_label`、`list_label`、`label_write` | ラベル管理。 |

### リソースのディスカバリー

実験的モードでのみ利用可能です。ローカル機能が不足している場合、エージェントは組み込みの`discover-resources`スキルを使用して、追加する公開MCPサーバーやスキルをリモートカタログから検索できます。このスキルは、抽象的な機能（例:「データベースアクセス」や「アーキテクチャ図」）に一致する、関連性でランク付けされたMCPサーバーとスキルをカタログにクエリし、選択肢となる候補を提示します。スキル自体が何かをインストールすることは決してありません。`/plugin`、`/mcp`、および`/skills`のダッシュボードにも、同じリモート結果をローカルリソースリストに統合する型付きカタログ検索が含まれています。

### MCPサーバーの命名規則

サーバー名には、スペース、Unicode文字、句読点を含む、印刷可能な任意の文字を含めることができます。制御文字（U+0000〜U+001F、U+007F）および閉じ括弧（`}`）は許可されていません。サーバー名はツール名のプレフィックスとして使用されます。たとえば、`my-server`という名前のサーバーは`my-server-fetch`のようなツール名を生成し、`My Server`という名前のサーバーは`My Server-fetch`を生成します。

### MCPツール名のサニタイズ

MCPサーバー名とツール名は、モデルに送信される前にサニタイズされます。ツール名で使用できない文字（`a-z`、`A-Z`、`0-9`、`-`、`_`以外のすべての文字）は`-`に置き換えられます。Unicode文字はPunycodeエンコードされます。Punycodeエンコードとの競合を避けるため、`@`記号も`-`に置き換えられます。

結合された名前（`serverName-toolName`）は最大64文字に制限されます。切り詰めによって名前の競合が発生する場合は、一意性を確保するために数値のサフィックス（例: `my-server-tool2`、`my-server-tool3`）が追加されます。

### MCPサーバーの信頼レベル

MCPサーバーは複数のソースからロードされ、それぞれ信頼レベルが異なります。

| ソース | 信頼レベル | レビューの必要性 |
|--------|-------------|----------------|
| 組み込み | 高 | いいえ |
| リポジトリ（`.github/mcp.json`） | 中 | 推奨 |
| ワークスペース(`.mcp.json`) | 中 | 推奨 |
| ユーザー設定(`~/.copilot/mcp-config.json`) | ユーザー定義 | ユーザーの責任 |
| リモートサーバー | 低 | 常時 |

MCPツール呼び出しには、既存の承認や、有効な場合のassisted permissionsなど、セッションの権限ルールが適用されます。外部サービスに対する読み取り専用の操作であっても、承認が必要になる場合があります。

### MCPサーバーの読み込み優先度

異なるソースからのMCPサーバーは、優先度順(高いものが優先)にマージされます。サーバー名が重複する場合、優先度の高いソースが優先されます。

1. `--additional-mcp-config`オプション(最上位)
1. プラグイン提供のサーバー
1. ワークスペースサーバー-作業ディレクトリからGitルートに向かって上向きに読み込まれる`.mcp.json`および`.github/mcp.json`。フォルダーが信頼されている必要があります
1. `~/.copilot/mcp-config.json` (最下位)

> [!NOTE]
> ワークスペースのMCPサーバー(`.mcp.json`および`.github/mcp.json`)は、作業ディレクトリが信頼されていることを条件に、対話型セッションとSDKサーバーモードセッションの両方で読み込まれます。フォルダーの信頼の詳細については、[Allowing and denying tool use](/copilot/how-tos/copilot-cli/use-copilot-cli/allowing-tools)を参照してください。

ワークスペース設定ファイルに無効なサーバーのエントリが含まれている場合、CLIはそのエントリのみをスキップし、有効な他のエントリの読み込みを継続します。スキップされた各エントリについて`Warning: workspace MCP config "<path>": <message>`が出力されます。形式が不正なファイルや読み取り不能なファイル(無効なJSONまたは無効なトップレベル構造)は、従来通り全体がスキップされます。

### エンタープライズMCP許可リスト

GitHub Enterprise組織では、許可されたMCPサーバーの許可リストを適用できます。有効にすると、CLIは接続前に、デフォルト以外の各サーバーをエンタープライズポリシーに照らし合わせて評価します。

GitHub Enterpriseレジストリポリシーが検出された場合(または`MCP_ENTERPRISE_ALLOWLIST`実験的機能フラグが有効な場合)、CLIは次の処理を行います。

1. コマンド、引数、リモートURLに基づいて、設定されたデフォルト以外の各サーバーのフィンガープリントを計算します。
1. フィンガープリントをエンタープライズ許可リストの評価エンドポイントに送信します。
1. フィンガープリントが承認されたサーバーのみを許可し、他のすべてのサーバーは、エンタープライズ名を指定したメッセージとともにブロックします。

このチェックはフェイルクローズです。評価エンドポイントに到達できない場合やエラーが返された場合、ポリシーが検証できるようになるまで、デフォルト以外のサーバーはブロックされます。

エンタープライズ許可リストによってサーバーがブロックされると、CLIは次のように表示します。

```text
MCP server "SERVER-NAME" was blocked by your enterprise "ENTERPRISE-NAME".
Contact your enterprise administrator to add this server to the allowlist.
```

組み込みのデフォルトサーバーは、常に許可リストの適用の対象外となります。

### `.vscode/mcp.json`からの移行

プロジェクトで`.vscode/mcp.json` (VS CodeのMCP設定形式)を使用している場合は、GitHub Copilot CLI用に`.mcp.json`に移行してください。移行により、`servers`キーが`mcpServers`にマッピング変更されます。

**POSIXシェル(bash、zsh、fishなど):**

```shell
jq '{mcpServers: .servers}' .vscode/mcp.json > .mcp.json
```

[`jq`](https://jqlang.github.io/jq/)が必要です。

**PowerShell:**

```powershell
pwsh -NoProfile -Command "`$json = Get-Content '.vscode/mcp.json' -Raw | ConvertFrom-Json; `$content = ([pscustomobject]@{ mcpServers = `$json.servers } | ConvertTo-Json -Depth 100); [System.IO.File]::WriteAllText('.mcp.json', `$content, (New-Object System.Text.UTF8Encoding `$false))"
```

WindowsでPowerShell CoreではなくWindows PowerShellを使用している場合は、`pwsh`を`powershell`に置き換えてください。

### Stdioサーバー出力

MCP stdioトランスポートは、改行区切りのJSON-RPCフレーム専用にstdoutを予約します。CLIは、出力をプロトコルパーサーに渡す前に、プレーンテキストのログ、例外スタックトレース、空白のみの行など、JSON以外の行を自動的に除外します。

すべての診断出力はstdoutではなく**stderr**に書き込んでください。stdoutにログやエラーメッセージを書き込むサーバーは、初期化ハンドシェイクを停止させるパースエラーフィードバックループを引き起こす可能性があります。フィルターは、JSON以外のフレームをサイレントに破棄することでこれを防ぎます。

1 MBを超える行は構造チェックをバイパスし、そのまま転送されます。これは、サイズが大きくても有効なプロトコルフレーム(大規模な`tools/list`応答など)が分割されたりドロップされたりするのを防ぐためです。

## スキルリファレンス

スキルは、CLIの機能を拡張するMarkdownファイルです。各スキルは、`SKILL.md`ファイルを含む独自のディレクトリに配置されます。(`/SKILL-NAME`を使用して、またはエージェントによって自動的に)呼び出されると、スキルのコンテンツが会話にインジェクトされます。

### スキルのフロントマターフィールド

| フィールド | 型 | 必須 | 説明 |
|-------|------|----------|-------------|
| `name` | string | はい | スキルのユニークな識別子。文字または数字で始まり、文字、数字、ハイフン、アンダースコア、ドット、コロン、スペースのみを含む必要があります。最大64文字。コロンを使用すると、名前空間付きの名前を指定できます(例: `my-plugin:search`)。 |
| `description` | string | はい | スキルの動作と、それを使用するタイミング。最大1024文字。 |
| `argument-hint` | string | いいえ | 期待される引数を説明するフリーフォームのヒント。スキルピッカーに表示されます(例: `"[target] [mode]"`)。 |
| `allowed-tools` | stringまたはstring[] | いいえ | スキルがアクティブなときに自動的に許可されるツールのカンマ区切りリストまたはYAML配列。すべてのツールには`"*"`を使用します。 |
| `user-invocable` | boolean | いいえ | ユーザーが`/SKILL-NAME`でスキルを呼び出せるかどうか。デフォルト: `true`。 |
| `disable-model-invocation` | boolean | いいえ | エージェントがこのスキルを自動的に呼び出すのを防ぎます。デフォルト: `false`。 |

### スキルの場所

スキルは、優先度順にこれらの場所から読み込まれます(名前が重複している場合は最初に見つかったものが優先されます)。

| 場所 | スコープ | 説明 |
|----------|-------|-------------|
| `.github/skills/` | プロジェクト | プロジェクト固有のスキル。 |
| `.agents/skills/` | プロジェクト | 代替のプロジェクトの場所。 |
| `.claude/skills/` | プロジェクト | Claude互換の場所。 |
| 親の`.github/skills/` | 継承 | モノレポの親ディレクトリのサポート。 |
| `~/.copilot/skills/` | 個人 | すべてのプロジェクト向けの個人のスキル。 |
| `~/.agents/skills/` | 個人 | すべてのプロジェクト間で共有されるエージェントのスキル。 |
| プラグインディレクトリ | プラグイン | インストールされたプラグインからのスキル。 |
| `COPILOT_SKILLS_DIRS` | カスタム | 追加のディレクトリ(カンマ区切り)。 |
| `--add-dir <path>` | 追加されたルート | `--add-dir`、`/add-dir`、またはSDKの`additionalDirectories`で追加されたディレクトリ下の`.github/skills/`、`.agents/skills/`、および`.claude/skills/`。これは信頼に関する決定であり、追加されたスキルはプロジェクトスキルと同じ信頼レベルで実行されます。 |
| (CLIにバンドル) | 組み込み | CLIに同梱されているスキル。最低優先度—他のどのソースによっても上書き可能です。 |
| (組織/エンタープライズ) | リモート | 組織またはエンタープライズがホストし、AHPリレーを介して投影されるスキル。コンテンツは、スキルが呼び出されたときにオンデマンドで取得されます。 |

リモートスキルはローカルスキルと並行して投影され、ローカルスキルと同じ名前を持つ場合は名前ベースの優先度に従います。

特定のディレクトリ(およびその配下)を検出対象外にするには、上記のどの場所で検出される場合であっても、`ignoredSkillsLocations`設定を使用します。[GitHub Copilot CLI configuration directory](/copilot/reference/copilot-cli-reference/cli-config-dir-reference#configuration-file-settings)を参照してください。

2つのプラグインが同じ名前のスキルを提供する場合、`/my-plugin/search`や`/other-plugin/search`などのプラグイン修飾された呼び出し名を使用して両方が共存します。ベースネームは優先度の高いプラグインにルーティングされます。これはスキルのみに適用されます。コマンドは、優先度の高いソースが勝者となる標準の階層ベースの重複排除を維持します。

### 非対話形式でのスキルの管理

対話型セッションを開かずにコマンドラインからスキルを管理するには、`copilot skill`を使用します。

| サブコマンド | 説明 |
|------------|-------------|
| `list [--json]` | 検出されたすべてのスキルを一覧表示します。 |
| `add <source> [--project]` | ファイルパス、URL、またはディレクトリからスキルを追加します。 |
| `remove <name-or-directory>` | 個人またはプロジェクトのスキルを削除するか、カスタムスキルディレクトリの登録を解除します。 |
| `enable <name>` / `disable <name>` | スキル名でスキルを有効または無効にします。 |

```bash
# Install a skill for your user account (default)
copilot skill add ./my-skill/SKILL.md

# Install a skill into the current project (.github/skills; file or URL skills only)
copilot skill add --project ./my-skill/SKILL.md

# Enable, disable, or remove a skill by name
copilot skill enable my-skill
copilot skill disable my-skill
copilot skill remove my-skill
```

ディレクトリをインストールすると、コピーされるのではなく、カスタムスキルのソースとして登録されます。ファイルやURLをインストールすると、スキルのコンテンツが個人用またはプロジェクト用のスキルディレクトリにコピーされます。対応するインタラクティブコマンドは`/skills add [--project] <FILE|URL|DIRECTORY>`です。

`copilot skill list --json`の行の形式は`{ name, description, source, path, enabled }`です。`remove`を使用する場合は、スキル名、または追加したカスタムスキルディレクトリへのパスのいずれかを指定します。スキル名の場合はそのスキルのファイルが削除され、カスタムディレクトリのパスの場合はディレクトリの登録が解除されるだけで、ファイルはディスク上に残ります。削除できるのは、追加した個人用およびプロジェクト用のスキルのみです。プラグインまたは組み込みセットによって提供されているスキルはこの方法では削除できません(代わりに無効化してください)。これは、廃止された`copilot plugins install --skill [--scope project]`および`copilot plugins remove/enable/disable --skill`に代わるものです。

### コマンド(代替のスキル形式)

コマンドは、`.claude/commands/`内の個別の`.md`ファイルとして保存されるスキルの代替手段です。コマンド名はファイル名から取得されます。コマンドファイルは簡略化された形式を使用し(`name`フィールドは不要)、`argument-hint`、`description`、`allowed-tools`、および`disable-model-invocation`をサポートします。コマンドは、同じ名前を持つスキルよりも優先度が低くなります。

## 拡張機能のモード

> [!NOTE]
> GitHub Copilot CLIの拡張機能は現在実験的な機能であり、変更される可能性があります。

インタラクティブセッションでは、拡張機能を実行するかどうか、およびCopilotがそれらを管理できるかどうかを`/extensions mode`で制御します。

| モード | 拡張機能の実行 | エージェントによる拡張機能の管理 |
| --- | --- | --- |
| **Load & Augment** (デフォルト) | はい | はい |
| **Load Only** | はい | いいえ |
| **Disabled** | いいえ | いいえ |

**Load & Augment**モードでは、検出された拡張機能の一覧表示、ステータスとログの検査、スターター拡張機能のスキャフォールディング、およびコード変更後の拡張機能の再読み込みを行うツールがエージェントに提供されます。これにより、エージェントはリクエストの一部として拡張機能のコードを作成および読み込むことができます。

エージェントに拡張機能管理ツールを与えずに、信頼できる既存の拡張機能のセットを実行するには、**Load Only**を選択します。エージェントは、実行中の拡張機能によって提供されるツールを引き続き呼び出すことができます。

モードの変更は、現在のセッションに即座に適用されます。

* **Disabled**に切り替えると、実行中の拡張機能プロセスが停止し、そのツールが削除されます。
* **Disabled**からいずれかの読み込みモードに切り替えると、拡張機能が開始されます。
* **Load Only**と**Load & Augment**の間で切り替えても、拡張機能は停止せずに、拡張機能管理ツールへのアクセス権のみが変更されます。

拡張機能の無効化は、読み込みモードを選択するまでの今後のセッションに持続します。すでに実行中の他のセッションには影響しません。

拡張機能とそのステータスを調べるには、`/extensions manage`を使用します。検出場所と実装例については、[Creating extensions for GitHub Copilot CLI](/copilot/tutorials/create-an-extension)を参照してください。

## カスタムエージェントのリファレンス

カスタムエージェントは、Markdownファイルで定義された特殊なAIエージェントです。ユーザー、プロジェクト、および追加されたルートのエージェントの場合、エージェントIDは`agents`ディレクトリからの相対ファイルパスから取得されます。CLIは`.agent.md`または`.md`の拡張子を削除し、ディレクトリ区切り文字を`--`に置き換えます。たとえば、`agents/team/reviewer.agent.md`のIDは`team--reviewer`です。

### 組み込みエージェント

| エージェント | デフォルトモデル | 説明 |
|-------|--------------|-------------|
| `code-review` | claude-sonnet-4.6 | シグナル対ノイズ比の高いコードレビュー。バグ、セキュリティの問題、論理エラーがないかdiffを分析します。コードの変更は行いません。 |
| `explore` | gpt-5.6-luna | 高速なコードベース探索。ファイルの検索、コードの読み取り、質問への回答を行います。300ワード未満の焦点を絞った回答を返します。並列実行しても安全です。 |
| `general-purpose` | claude-sonnet-4.6 | 複雑なマルチステップタスク向けのフル機能エージェント。別のコンテキストウィンドウで実行されます。 |
| `research` | claude-haiku-4.5 | 指示に基づいて徹底的な検索を実行します。GitHubリポジトリの検索、ファイルの取得、主張の検証を行い、引用付きの詳細な調査結果を報告します。 |
| `rubber-duck` | 補完モデル | 補完モデルを使用して、提案、デザイン、実装、またはテストに対する建設的な批評を行います。弱点を特定し、改善を提案します。[Getting a second opinion with the rubber duck agent](/copilot/concepts/agent-capabilities/choosing-and-delegating-agent-work/getting-a-second-opinion)を参照してください。 |
| `security-review` | claude-sonnet-4.6 | セキュリティに特化したコードレビュー。11のカテゴリにわたって、確信度の高い脆弱性の変更を分析します。悪用の確信度が80%を超える問題のみをフラグ付けします。重要度と確信度のスコアを報告します。コードの変更は行いません。 |
| `task` | gpt-5.6-luna (claude-haiku-4.5にフォールバックします) | コマンドの実行(テスト、ビルド、lint)。成功時は簡単な概要を、失敗時は完全な出力を返します。 |

`code-review`および`security-review`は、完全なレビューを別のレビューエージェントに転送することはありません。レビューエージェントを起動すると、レビュアーの「使用」または「呼び出し」の要求がすでに満たされるため、ネストされた`code-review`または`security-review`サブエージェントにタスク全体を再帰的に委任するのではなく、委任チェーン全体にわたって、それ自体でレビューを実行します。`code-review`は、リクエストのセキュリティに特化した部分については引き続き専用の`security-review`スペシャリストに引き継ぎ、両方のエージェントが、限定的で独立した範囲の事実確認作業を`explore`などのレビュー以外のエージェントに委任する場合があります。

ルートエージェントのみが`store_memory`または`vote_memory`を呼び出して、メモリの保存や投票を行うことができます。サブエージェントは`read_memories`を介して保存されたメモリへの読み取りアクセスを維持しますが、それらの書き込みや投票を行うことはできません。

### カスタムエージェントのフロントマターフィールド

| フィールド | タイプ | 必須 | 説明 |
|-------|------|----------|-------------|
| `description` | string | はい | エージェントリストおよび`task`ツールに表示される説明。 |
| `include-custom-instructions` | boolean | いいえ | このエージェントがサブエージェントとして実行されるときに、リポジトリの指示ファイル(`copilot-instructions.md`、`AGENTS.md`、`CLAUDE.md`)を含めます。デフォルト: `false`。[Repository custom instructions for subagents](#repository-custom-instructions-for-subagents)を参照してください。 |
| `infer` | boolean | いいえ | メインエージェントによる自動委任を許可します。デフォルト: `true`。 |
| `mcp-servers` | object | いいえ | 接続するMCPサーバー。`~/.copilot/mcp-config.json`と同じスキーマを使用します。 |
| `model` | string | いいえ | このエージェント用のAIモデル。未設定の場合、外部エージェントのモデルを継承します。セッションモデルが`Auto` (サーバー選択)に設定されている場合、このフィールドに関係なく、サブエージェントは常に解決されたセッションモデルを継承します。 |
| `models` | string[] | いいえ | 優先順位順の作成済みモデル。ランタイムは、ユーザーのプランがアクセスできる最初のモデルを使用します。どれも解決されない場合、ディスパッチはセッションのモデルにフォールバックします。両方が設定されている場合、`model`より優先されます。 |
| `modelPolicy` | string | いいえ | `"preferred"` (デフォルト)では、`model`/`models`を`~/.copilot/settings.json`内の`subagents`オーバーライドまたは`/subagents`ピッカーで上書きできます。`"required"`は、ディスパッチを作成済みモデルのいずれかに固定します。上書きは拒否され、ピッカーの**Model**エントリが無効になります。 |
| `name` | string | いいえ | 表示名。`--agent`などを使用して、この値でエージェントを選択することもできます。デフォルトはエージェントIDです。 |
| `reasoningEffort` | string | いいえ | このエージェントのデフォルトの推論努力(`"low"`、`"medium"`、`"high"`など)。未設定の場合、外部エージェントの努力を継承します。 |
| `tools` | string[] | いいえ | エージェントで使用可能なツール。デフォルト: `["*"]` (すべてのツール)。完全なツールアクセスを付与するには、リスト内の任意の場所に`*`を含めます。たとえば、`["view", "*"]`は`view`だけでなくすべてのツールを付与します。 |

`model`、`models`、`modelPolicy`、および`reasoningEffort`は、エージェントが`task`ツールを介してディスパッチされるか、SDKの`session.startSubagent`などを介して直接起動されるかに関係なく適用されます。モデルと努力は、次の優先順位(上ほど高くなります)で解決されます。明示的な呼び出しごとの値、`~/.copilot/settings.json`内の`subagents`オーバーライド、エージェント定義の`model`/`models`/`reasoningEffort`フィールド、親セッションの値です。適用できない宣言されたモデルまたは努力は、ディスパッチを失敗させるのではなく、セッションの値にフォールバックします(エージェントが`modelPolicy: "required"`を宣言している場合を除きます。その場合、作成されていないモデルに暗黙的に置き換えるのではなく、ディスパッチが拒否されます)。

### カスタムエージェントの場所

CLIは、次の優先順位でカスタムエージェントを読み込みます。エージェントのIDが同じ場合は、最初に読み込まれたエージェントが使用されます。

| 優先度 | スコープ | 場所 |
|----------|-------|----------|
| 1 (最高) | ユーザー | `~/.copilot/agents/` |
| 2 | プロジェクト | 現在の作業ディレクトリからGitルートに向かって上の方向にある`.github/agents/` |
| 3 | プロジェクト | 現在の作業ディレクトリからGitルートに向かって上の方向にある`.claude/agents/` |
| 4 | 追加されたルート | `--add-dir`、`/add-dir`、またはSDKの`additionalDirectories`で追加されたディレクトリの下にある`.github/agents/`および`.claude/agents/`。ディレクトリの追加は信頼に関する決定です。そのエージェントは信頼された設定として読み込まれます。 |
| 5 | プラグイン | `<plugin>/agents/` |
| 6 (最低) | リモート | 組織またはエンタープライズのエージェント |

プロジェクトの各行において、CLIは現在の作業ディレクトリを最初にチェックし、次にGitルートまでの親ディレクトリを順にチェックします。そのため、最も深いディレクトリが最優先されます。すべてのプロジェクトの`.github/agents/`ディレクトリは、プロジェクトの`.claude/agents/`ディレクトリよりも前に読み込まれます。つまり、モノレポ内の各パッケージやサブディレクトリが、それぞれ独自のエージェントを提供できます。

省略可能な`name`フロントマターフィールドは、重複排除を制御しません。同じ`name`を持ちながらIDが異なるエージェントは、どちらも読み込まれます。`--agent`に渡された値が複数のエージェントのIDまたは`name`に一致する場合、CLIは上記の優先順位に従って最初に見つかったエージェントを使用します。

### サブエージェントのリポジトリカスタム指示

`task`ツールやSDKの`session.startSubagent`を介してサブエージェントとして起動されたカスタムエージェントは、デフォルトではリポジトリの指示ファイル（`copilot-instructions.md`、`AGENTS.md`、`CLAUDE.md`）を受け取りません。オプトインするには、フロントマターに`include-custom-instructions: true`を設定します。

```markdown
---
name: RepoAwareReviewer
description: Reviews a change against this repository's conventions
tools: ["*"]
include-custom-instructions: true
---

Review the change and flag anything that violates the repository's conventions.
```

| エージェント | リポジトリの指示を受け取るか |
|-------|-----------------------------------|
| セッションエージェント（デフォルトエージェント、または`--agent`で選択されたカスタムエージェント） | はい |
| `general-purpose`サブエージェント | はい |
| 組み込みの`explore`、`task`、および`code-review`サブエージェント | いいえ |
| サブエージェントとして起動されたカスタムエージェント | `include-custom-instructions: true`が指定されている場合のみ |

サブエージェントに`include-custom-instructions: true`が設定されている場合、そのサブエージェントはリポジトリ独自の指示ファイル（`copilot-instructions.md`、`AGENTS.md`、`CLAUDE.md`）を読み込みます。メインセッション専用に読み込んだ追加の指示ディレクトリ（`COPILOT_CUSTOM_INSTRUCTIONS_DIRS`でセッションに指定した個人用ディレクトリなど）は継承されません。`--no-custom-instructions`を指定してセッションを開始すると常に優先されます。そのオプションを使用した場合、`include-custom-instructions: true`を設定しているエージェントを含め、どのエージェントもリポジトリの指示を受け取りません。コードのレビューや編集を行うエージェントなど、リポジトリの規約に従う必要があるエージェントに対してのみ、この設定を有効にしてください。リポジトリの指示によりエージェントが実行ごとに処理する内容が増えるため、ファイルを検索したりテキストを要約したりするだけのエージェントなど、指示を必要としないエージェントではこの設定をオフにしておくことで、実行速度を維持しコストを抑えることができます。

詳細については、[Creating and using custom agents for GitHub Copilot CLI](/copilot/how-tos/copilot-cli/customize-copilot/create-custom-agents-for-cli)を参照してください。

### エージェントの通信

マルチエージェントセッションで周囲のエージェントを調査し、作業を調整するには、カスタムエージェント内で`list_agents`と`write_agent`を使用します。

#### `list_agents`の関係ラベル

関係ラベルは、表示可能なエージェントが現在のアージェントとどのように関連しているかを識別します。ラベルは、共有シブリング通信が有効になっている親セッション内でサブエージェントが実行されているときに表示されます。

| ラベル | 意味 | 用途 |
|-------|---------|-----------|
| `"self"` | 現在のエージェント | どのエントリがアクティブなエージェントを表しているかを確認する |
| `"sibling"` | 同じ親によって起動されたエージェント | `write_agent`を介して他のピアエージェントと連携する |
| `"child"` | 現在のエージェントによって起動されたエージェント | 現在のエージェントから委任された後続の作業を追跡する |

#### スコープ付きのリスト取得

ターゲットを選択する前にリストを絞り込むには、`list_agents`で`scope`を使用します。

| `scope`の値 | 返される内容 | 用途 |
|---------------|---------|-----------|
| 省略時 | 現在のコンテキスト内の周辺のエージェント | 現在のワークフローのデフォルトの作業セットを確認する |
| `"siblings"` | シブリングエージェントのみ | 同じ親によって起動されたピアエージェントを見つける |
| `"children"` | 現在のエージェントの子エージェントのみ | 現在のエージェントから委任された作業を確認する |
| `"all"` | すべての表示可能なエージェント | 調整用に使用せずにセッションツリー全体を検査する |

シングルエージェントセッションでは、デフォルトのビューは子エージェントを中心に表示されます。マルチエージェントセッションでは、ツリー全体の代わりに、直近のローカルコンテキストがデフォルトで表示されます。

```text
list_agents(scope="siblings")
list_agents(scope="children")
list_agents(scope="all")
```

#### スコープ付きのメッセージング

1つのメッセージを複数の関連エージェントに一斉送信するには、`write_agent`で`scope`を使用します。

スコープ付きメッセージングは、共有シブリング通信が有効になっている親セッション内で実行中のサブエージェントからのみ使用してください。トップレベルのセッションでは、代わりに明示的な`agent_id`値を指定してエージェントをターゲットにしてください。

| `scope`の値 | 送信先 | 用途 |
|---------------|----------|-----------|
| `"siblings"` | 表示可能なすべてのシブリングエージェント | 共有セッションでピア作業を調整する |
| `"children"` | 現在のエージェントのすべての子エージェント | 委任された作業に同じ後続処理を送信する |

スコープに一致するエージェントが多すぎる場合、`write_agent`はエラーを返し、代わりに`list_agents`からの明示的な`agent_id`値を要求します。

```text
write_agent(scope="children", message="Re-check your findings against the updated schema.")
write_agent(scope="siblings", message="Post status when your current check completes.")
write_agent(agent_id="explore-auth", message="Focus on token refresh flow and report only confirmed issues.")
```

### サブエージェントの制限

エージェントの無制限な増殖を防ぐため、CLIでは深さと同時実行数の制限が適用されます。

| 制限 | デフォルト | 最大値 |
|-------|---------|-----|
| 最大深度 | `6` | `256` |
| 最大同時実行数 | プランベース | `32` |

**深度**は、エージェントが何層にネストされているかをカウントします。深度の制限に達した場合、最も内側のエージェントはこれ以上サブエージェントを起動できません。**同時実行数**は、セッションツリー全体で同時に実行されているサブエージェントの数をカウントします。制限に達した場合、アクティブなエージェントが完了するまで、新しいサブエージェントのリクエストは拒否されます。

デフォルトの同時実行数の制限は、お使いのCopilotプランによって異なります。

| プラン | 最大同時実行数 |
|------|---------------|
| Free / Education | `2` |
| Pro / Pro+ | `4` |
| Max | `8` |
| Business | `16` |
| Enterprise | `32` |
| 従量制課金 | `32` |

従量制課金を利用しているユーザーは、`subagents.maxConcurrency`および`subagents.maxDepth`設定を使用してこれらの制限を上書きできます。

```json
{
    "subagents": {
        "maxConcurrency": 16,
        "maxDepth": 10
    }
}
```

有効な範囲外の値はクランプされます。`maxConcurrency`は`32`に上限が設定され、`maxDepth`は`256`に上限が設定されます。これらの設定は、従量制課金を使用していないプランでは無視されます。[Configuration file settings](/copilot/reference/copilot-cli-reference/cli-config-dir-reference#configuration-file-settings)を参照してください。

## サイドキックエージェント

サイドキックエージェントはバックグラウンドで自動的に実行され、セッションの受信トレイにコンテキストをパブリッシュします。明示的に呼び出されるのではなく、セッションイベントに応答します。

サイドキックエージェントにするには、任意のエージェント定義に`sidekick:`ブロックを追加します。

```yaml
---
name: Context Gatherer
description: Gathers relevant context when the working directory changes
sidekick:
    triggers:
        - session.context_changed
        - event: user.message
          limit: 1
    behavior: persistent
    maxSendsPerTurn: 2
---

Gather useful context about the current repository and working directory.
Summarize recent changes and any relevant project structure.
```

### サイドキックのトリガー

`triggers`の各エントリは、無制限の回数発火するイベント名文字列のみ、または`event`とオプションの`limit`を持つオブジェクトのいずれかです。

| イベント | 説明 |
|-------|-------------|
| `user.message` | ユーザーのメッセージごとに発火します。 |
| `session.context_changed` | 作業ディレクトリ、リポジトリ、またはブランチが変更されたときに発火します（`cd`の実行後やGitブランチの切り替え後など）。 |

| トリガーフィールド | 型 | デフォルト | 説明 |
|----------------|------|---------|-------------|
| `event` | `string` | 必須 | このエージェントを起動するセッションイベントの型。 |
| `limit` | `number` | 無制限 | セッションごとにこのトリガーが発火できる最大回数。設定する場合は正の整数である必要があります。 |

### サイドキックの設定フィールド

| フィールド | 型 | デフォルト | 説明 |
|-------|------|---------|-------------|
| `triggers` | `string[]`またはobject[] | 必須 | このエージェントを起動するセッションイベントの型。少なくとも1つのトリガーが必要です。 |
| `behavior` | `string` | `"restart"` | `"restart"`:すべての先行する実行をキャンセルし、各トリガーで新しく開始します。`"persistent"`:再起動する代わりに、同じ長期間実行されるプロセスを維持し、既存のループに新しいメッセージを配信します。 |
| `maxSendsPerTurn` | `number` | `1` | 1回のトリガーで許可される最大受信トレイ送信数。`"persistent"`モードでは、配信されたユーザーメッセージごとにこの予算がリセットされます。 |

`"restart"`の動作は、ステートレスなコンテキスト収集エージェントに適しています。`"persistent"`の動作は、ターン間で状態を蓄積するエージェントに適しています。

## 権限承認の応答

CLIが操作の実行許可を求めてプロンプトを表示するときに、次のキーで応答できます。

| キー | 効果 |
|-----|--------|
| `y` | この特定の要求を1回だけ許可します。 |
| `n` | この特定の要求を1回だけ拒否します。 |
| `!` | セッションの残りの期間、すべての同様の要求を許可します。 |
| `#` | セッションの残りの期間、すべての同様の要求を拒否します。 |
| `?` | 要求に関する詳細情報を表示します。 |

完全なダイアログが表示されているときは、次のオプションからも選択できます。

| オプション | スコープ | 永続性 |
|--------|-------|-------------|
| 1回のみ | 単一使用 | なし |
| この場所 | 手動でクリアされるまで | 場所ごとにディスクに保存されます |
| 常に | 永続的 | 設定ファイル |

**This location**オプションは、CLIがロケーションキー（Gitルートまたはカレントディレクトリ）を特定できる場合に表示されます。承認をディスクに永続化するため、次にそのディレクトリで作業するときに、再度プロンプトを表示することなく、同じ権限が自動的に付与されます。

シェルコマンドにツールの承認と、許可されたディレクトリ外のパスへのアクセスが必要な場合、CLIは両方の承認を1つのプロンプトにまとめることができます。1回承認すると、その実行にのみパスアクセスが許可されます。セッションまたは場所に対して承認すると、セッションの残りの期間もパスアクセスが許可されます。

現在のセッションのセッション承認をクリアするには、`/reset-allowed-tools`を使用します。

### 親ドメインのURL承認

URL承認プロンプトでは、正確なオリジンに加えて、`https://*.example.com`などの親ドメインスコープを提供できます。これにより、セッションの残りの期間、`api.example.com`や`flow.example.com`などの登録可能ドメインのすべてのサブドメインが承認されます。

スコープには次の制限があります。

* 承認は現在のセッションのみに適用され、設定には保存されません。
* スキームおよびデフォルト以外のポートは一致している必要があります。
* `s3.amazonaws.com`などの個別に所有されているサフィックスの下にあるホストは、`*.amazonaws.com`を承認しても対象になりません。これにより、*.amazonaws.comの承認が、他のテナントに属している可能性があるs3.amazonaws.comの下にあるバケットに拡張されるのを防ぎます。
* IPアドレス、`localhost`などの単一ラベルホスト、および`github.io`などのパブリックサフィックスには、このオプションは適用されません。

## セキュリティ

### Plan mode

`/plan`は、Copilot CLIがコードベースを探索および分析できる計画セッションを開始しますが、プロジェクトファイルの編集はブロックされます。具体的には以下のとおりです。

- **プロジェクトファイルは保護されます。**ワークスペース内のファイルを変更する編集、パッチ適用、またはシェルコマンドの実行の試みは、自動的にブロックされます。これは単なるモデルへの提案ではなく、直接強制されるため、モデルの動作選択に依存しません。
- **計画自体は引き続き記述できます。** Copilotはメモを保持して計画を起草する場所を必要とするため、独自のプライベート計画ワークスペース内でファイルを作成および編集することが許可されます（レビューして承認する計画ファイルを含みます）。
- **委任されたサブタスクも保護されます。** Copilotが質問の一部を調査するためにヘルパーセッションを起動した場合、そのヘルパーも同じ制限を継承し、プロジェクトを編集できません。
- **これは保証ではなく、セーフティネットです。**この保護は、ファイルを変更する明確で直接的な試みを検出するように設計されており、完全なロックダウンではありません。調査が過度に制限されないように、効果を事前に明確に判断できないシェルコマンドや、接続した外部/MCPツールへの呼び出しなど、一部の操作は意図的に許可されています。実際にはこれが問題になることはほとんどありませんが、Plan modeは、ディスク上の何も変更できないという絶対的な保証ではなく、「適用する前に変更のレビューが必要である」というものとして考える必要があります。

計画に満足したら、それを承認してPlan modeを終了し、Copilotに実際の変更を行わせます。

### コマンドの安全性分析

シェルコマンドは、実行前に分析され、潜在的に危険なパターンが特定されます。

* ファイルの削除(`rm -rf`)
* システムの変更(`sudo`、`chmod 777`)
* ネットワークへのデータ流出(機密パスを指定した`curl`)
* 資格情報のアクセス(`.env`やSSHキーの読み取り)
* 危険な変数を上書きするインライン環境変数の割り当て(例: `PATH=...`、`LD_PRELOAD=...`)

リスクの高いコマンドは、追加の警告や承認プロンプトをトリガーする可能性があります。要求に承認が必要かどうかは、有効な権限によって異なります。

サンドボックスが有効で、**Allow sandbox bypass**設定がオン（デフォルト）の場合、サンドボックスのファイルシステムまたはネットワークポリシーによってブロックされた同期シェルコマンドは、モデルのラウンドトリップなしで、サンドボックス外で再実行するようにプロンプトを表示します。プロンプトを承認すると、コマンドが再実行され、その出力が返されます。辞退すると、サンドボックス化された（ブロックされた）結果が維持されます。

サンドボックスバイパスプロンプトには、**Yes, and disable the sandbox for the rest of this session**オプションも用意されています。これを選択すると、承認されているコマンドだけでなく、現在のセッション内の残りのすべてのコマンドに対してサンドボックスが無効になります。これは現在のセッションにのみ適用されます。`/new`で新しいセッションを開始すると、再びコマンドがサンドボックス化され、このオプションは保存された`sandbox`設定や他の実行中のセッションには影響しません。

デタッチされた（バックグラウンドの）コマンドは、ツール呼び出しよりも長生きするプロセスをサンドボックスがラップできないため、まったくサンドボックス化できません。**Allow sandbox bypass**設定がオンの場合、これは完全に拒否されるのではなく、コマンドの開始前に承認を求めます。承認すると、最初からサンドボックスなしでコマンドが実行されます。

サンドボックスポリシーが拒否のキャプチャをサポートしているWindowsホストでは、ブロックされたインタラクティブなシェルコマンドは、完全なバイパスに直接ジャンプするのではなく、1つのステップでエスカレーションします。承認すると、ブロックではなく記録するようにファイルとプロセスの制限を設定してコマンドが再実行され（ネットワークポリシーは引き続き適用されます）、コマンドが引き続きブロックされている場合にのみ、開示された完全なバイパスにフォールバックします。エスカレーション全体に対して表示されるプロンプトは1つだけです。拒否されたループバックまたはローカルネットワークソケット（例: `127.0.0.1`へのバインドまたは接続）も、サイレントに失敗するのではなく、この同じエスカレーションに到達します。再試行の結果には、ネットワークポリシーが引き続き適用されている場合は「sandbox relaxed」、完全にサンドボックスなしの場合は「sandbox bypassed」というラベルが付けられます。再試行が依然として失敗した場合は、ホストレベルの権限が引き続き適用されることがメッセージで説明されます。

サンドボックスでブロックされたパスを指定する`EPERM`または`EACCES`診断で失敗するコマンドは、コマンドライン自体がそのパスを指定していなかった場合でも、サンドボックスの外で実行することを提案するようになりました。

拒否が、サンドボックスポリシーが許可する範囲から逸脱するターゲットを持つシンボリックリンクによって引き起こされた場合、拒否理由には、許可されたパスのリンクが許可外を指していることが説明され、実際のターゲットの名前が表示されるため、サンドボックスポリシーに追加すべきパスを正確に把握できます。

詳細については、[Configuring local sandbox settings](/copilot/how-tos/cloud-and-local-sandboxes/configuring-local-sandbox-settings#allowing-sandbox-bypass)を参照してください。

#### 環境変数の拒否リスト

CLIは、読み取り専用のコマンドであっても、任意のコードを実行するために悪用される可能性のある環境変数のインライン割り当てをブロックします。ブロックされるカテゴリには以下が含まれます。

| カテゴリ | 例 |
|----------|----------|
| 動的リンカーインジェクション | `LD_*`、`DYLD_*` (すべてのプレフィックス) |
| Gitインデックス設定の上書き | `GIT_CONFIG_COUNT`、`GIT_CONFIG_KEY_*`、`GIT_CONFIG_VALUE_*` (すべての`GIT_CONFIG_`プレフィックス) |
| Git外部プログラムフック | `GIT_EXTERNAL_DIFF`、`GIT_PROXY_COMMAND` |
| Git設定ファイルの上書き | `GIT_CONFIG`、`GIT_CONFIG_GLOBAL`、`GIT_CONFIG_SYSTEM` |
| シェルPATHおよび起動ファイル | `PATH`、`BASH_ENV`、`ENV` |
| 既存のブロックされた変数 | `PAGER`、`GIT_PAGER`、`GIT_EDITOR`、`VISUAL`、`EDITOR`、`GIT_SSH`、`GIT_SSH_COMMAND`、`GIT_ASKPASS`、`BROWSER`、`GH_BROWSER` |

### `web_fetch` SSRF保護

`web_fetch`ツールは、HTTPリクエストを行う前に、サーバーサイドリクエストフォージェリ（SSRF）保護を強制します。

* **プロトコル許可リスト**: `http://`および`https://`のURLのみが許可されます。`file://`およびその他のスキームは拒否されます。
* **IPブロックリスト**:ループバックアドレス（`127.x.x.x`、`::1`）、RFC-1918プライベートレンジ（`10.x`、`172.16–31.x`、`192.168.x`）、およびクラウドメタデータエンドポイント（例: `169.254.169.254`）へのリクエストは、IPリテラルチェックおよびDNS事前解決によってブロックされます。
* **検証済みリダイレクト**: `web_fetch`は`3xx`リダイレクト（最大10ホップ、60秒のネットワーク予算内）に従い、各ホップのターゲットを同じIPブロックリストに対して再検証してからそれに従います。元のURLとは異なるオリジンへのリダイレクトには、他のクロスオリジンフェッチと同様に、権限の承認が必要です。同一オリジンのリダイレクトには、追加のプロンプトなしで従います。最終結果には、コンテンツが`(redirected from <original URL>)`であったことが記載されます。

サンドボックスが有効な場合、リクエストは権限プロンプトの前にサンドボックスネットワークポリシー（アウトバウンドアクセス、ローカルおよびプライベートホスト）に対してチェックされるため、ポリシーによってブロックされたターゲットは、プロンプトを表示せずに素早く失敗します。**Allow sandbox bypass**設定がオンになっており、サンドボックスネットワークプロキシがURLに到達できない場合（ポリシーによってURLが拒否された場合とは対照的に）、`web_fetch`はサンドボックスの外でリクエストを再試行するようにプロンプトを表示します。承認すると、フェッチがもう一度試行され、その結果が返されます。

開発中に`web_fetch`が`localhost`に到達できるようにするには（例:ローカルのドキュメントサーバーの場合）、次の環境変数を設定します。

```bash
export COPILOT_WEB_FETCH_ALLOW_LOCALHOST=1
```

### サンドボックスツールディレクトリの付与

ローカルサンドboxingが有効な場合、Copilot CLIはサンドボックス化されたコマンドが必要とする可能性のあるツールディレクトリを検出し、それぞれに**読み取り専用**アクセスを付与するため、コマンドは変更できない状態のままインストールされたツールチェーンを実行できます。検出は、プロセスの開始前に、コマンドごとに実行され、コマンドの環境から2種類のソースを読み取ります。

* **`PATH`** (Windowsの場合は`Path`)。リストされているすべてのディレクトリが候補となります。
* **名前付きツールチェーン変数。** CLIは、以下の表にある変数を検査します。ディレクトリの値は、そのディレクトリへのアクセスを付与します。パスリストは、オペレーティングシステムのパス区切り文字（Windowsではセミコロン、その他の環境ではコロン）で分割され、各エントリが候補となります。Gitファイル変数は、macOSおよびLinuxでのみ検査されます。

ディレクトリ候補は、ディレクトリとして存在する絶対パスである場合にのみ付与されます。相対パス、欠落しているパス、ファイルシステムのルート（`/`や`C:\`など）、およびシステムクリティカルな場所は検出から除外されます。除外される場所の例には、Windows上の`%WINDIR%`や、macOSおよびLinux上の`/bin`、`/sbin`、`/usr/bin`、`/usr/sbin`、`/boot`、`/proc`、`/sys`、`/dev`が含まれます。理由は`sandbox_spawn`に記録されます。

これらの付与は、シンボリックリンクのターゲットを自動的に追加するのではなく、パスの表記法を保持します。リンクを通じたアクセスがブロックされている場合は、意図したターゲットを明示的に付与してください。重複するディレクトリは、Windowsでは大文字と小文字を区別せずに削除されます。

| 変数 | ツールチェーン | 値 | 通常の設定先 |
|----------|-----------|-------|------------------|
| `BAZEL_VC` | Bazel / Visual C++ | 単一ディレクトリ | Windows |
| `BAZEL_VS` | Bazel / Visual Studio | 単一ディレクトリ | Windows |
| `BAZELISK_HOME` | Bazelisk | 単一ディレクトリ | すべて |
| `BAZELISK_HOME_DARWIN` | Bazelisk | 単一ディレクトリ | macOS |
| `BAZELISK_HOME_LINUX` | Bazelisk | 単一ディレクトリ | Linux |
| `BAZELISK_HOME_WINDOWS` | Bazelisk | 単一ディレクトリ | Windows |
| `CONDA_PREFIX` | Conda | 単一ディレクトリ | すべて |
| `DOTNET_ROOT` | .NET | 単一ディレクトリ | すべて |
| `GIT_CONFIG_SYSTEM` | Gitシステム構成 | ファイル | macOSおよびLinux |
| `GIT_EXEC_PATH` | Gitヘルパー | 単一ディレクトリ | すべて |
| `GIT_SSL_CAINFO` | Git証明書バンドル | ファイル | macOSおよびLinux |
| `GIT_SSL_CAPATH` | Git証明書 | 単一ディレクトリ | すべて |
| `GIT_TEMPLATE_DIR` | Gitテンプレート | 単一ディレクトリ | すべて |
| `GOPATH` | Go | パスリスト | すべて |
| `GOROOT` | Go | 単一ディレクトリ | すべて |
| `JAVA_HOME` | Java | 単一ディレクトリ | すべて |
| `LD_LIBRARY_PATH` | 共有ライブラリ | パスリスト | Linux |
| `NODE_PATH` | Node.js | パスリスト | すべて |
| `NVM_HOME` | Node.js (nvm) | 単一ディレクトリ | Windows |
| `NVM_SYMLINK` | Node.js (nvm) | 単一ディレクトリ | Windows |
| `PATH` / `Path` | 実行ファイル(すべて) | パスリスト | すべて |
| `PSModulePath` | PowerShell | パスリスト | すべて |
| `PYENV_ROOT` | Python (pyenv) | 単一ディレクトリ | すべて |
| `PYTHONHOME` | Python | 単一ディレクトリ | すべて |
| `PYTHONPATH` | Python | パスリスト | すべて |
| `RUSTUP_HOME` | Rust (rustup) | 単一ディレクトリ | すべて |
| `VCINSTALLDIR` | Visual C++ | 単一ディレクトリ | Windows |
| `VCPKG_ROOT` | vcpkg | 単一ディレクトリ | すべて |
| `VIRTUAL_ENV` | Python (venv) | 単一ディレクトリ | すべて |
| `VSINSTALLDIR` | Visual Studio | 単一ディレクトリ | Windows |

2つのGitファイル変数を除く各変数は、すべてのプラットフォームで読み込まれます。**Typically set on**列には、それぞれの変数が通常設定される場所が示されます。設定されていない変数は何も影響しません。

`CARGO_HOME`は、選択されたCargoディレクトリおよびファイルに対するツール固有の権限を通じて個別に処理されます。Cargoホーム全体へのアクセス権は付与されません。開発者ツール権限は、GoやNuGetキャッシュなどの再配置されたキャッシュに追従することもできます。

これらが自動権限のすべてではありません。**Allow dev tool access**が有効な場合、Copilot CLIは、macOSおよびLinuxにおける`~/.local/bin`や`~/.local/lib`、およびWindowsにおける`%LOCALAPPDATA%\Programs`の直下のサブディレクトリを含め、選択されたユーザープロファイルのアプリケーションディレクトリへのアクセスを許可します。また、npmのキャッシュや共有ビルドキャッシュなど、書き込み可能なものを含め、ツール固有のキャッシュやレジストリへのアクセスも許可します。

`/sandbox policy`を実行すると、ソースとアクセス権ごとにグループ化された解決済みのパスが表示されます。**Dev tools**セクションには、現在のディレクトリで検出されたツールとそのパスが一覧表示されます。`/sandbox policy npm install`などのコマンドを追加すると、実行せずに開発者ツールのアクセス権を確認できます。このレポートによって、不足しているキャッシュが作成されることはありません。ポリシーがどのように構成されるかの背後にある概念については、[Understanding filesystem policies for local sandboxing in GitHub Copilot CLI](/copilot/concepts/security-governance-and-network-settings/understanding-local-sandboxing)を参照してください。

## OpenTelemetryモニタリング

Copilot CLIおよびその他のCopilotクライアントは、OpenTelemetry (OTel)モニタリングをサポートしています。設定オプション、エクスポートされるシグナル、および属性については、[OpenTelemetry reference](/copilot/reference/enterprise-administrators/opentelemetry-reference)を参照してください。

OTelはデフォルトでオフになっており、オーバーヘッドはゼロです。次のいずれかの条件が満たされたときに有効になります:

* `COPILOT_OTEL_ENABLED=true`が設定されている
* `OTEL_EXPORTER_OTLP_ENDPOINT`が設定されている
* `COPILOT_OTEL_FILE_EXPORTER_PATH`が設定されている

## 参考資料

* [GitHub Copilot CLI](/copilot/how-tos/copilot-cli)
* [GitHub Copilot hooks reference](/copilot/reference/hooks-reference)
* [GitHub Copilot CLI plugin reference](/copilot/reference/copilot-cli-reference/cli-plugin-reference)
* [GitHub Copilot CLI programmatic reference](/copilot/reference/copilot-cli-reference/cli-programmatic-reference)
* [GitHub Copilot CLI configuration directory](/copilot/reference/copilot-cli-reference/cli-config-dir-reference)
