---
ContentId: 8b4f3c21-4e02-4a89-9f15-7a8d6b5c2e91
DateApproved: 11/11/2026
MetaDescription: Create and test custom instructions in {% data variables.product.prodname_vscode_shortname %} to guide agents with project conventions.
MetaSocialImage: ../../learn/images/shared/agent-first-development-social.png
Keywords:
- customize
- rules
- instructions
- copilot-instructions.md
- AGENTS.md
- CLAUDE.md
- coding standards
- ai
- copilot
---
# {% data variables.product.prodname_vscode_shortname %} でのカスタム指示の使用

カスタム指示を使用すると、コードを追加する場所、使用するライブラリ、実行するテストなど、プロジェクトに関する再利用可能なガイダンスをエージェントに提供できます。すべてのプロンプトで繰り返すのではなく、このガイダンスをMarkdownファイルに保存し、ソース管理を通じてプロジェクトの指示を共有します。

エージェントが繰り返し見落としている1つの規約から始めます。 [Agent Customizations エディター](/docs/agent-customization/overview.md#agent-customizations-editor) で指示を作成し、よりターゲットを絞ったガイダンスを追加する前に、新しいチャットでその効果をテストします。サポートされている場所、ファイルの構文、設定については、[カスタム指示リファレンス](/docs/agents/reference/custom-instructions-reference.md) を参照してください。

指示はモデルをガイドするものです。コンプライアンスを保証するものではなく、テスト、コードレビュー、セキュリティ制御の代わりにもなりません。入力時の [インラインサジェスチョン](/docs/editing/ai-powered-suggestions.md) には適用されません。

## プロジェクトの指示の概要

リポジトリのルートを開き、使用する予定の [エージェントハーネスを選択](/docs/agents/run/agent-harnesses.md#select-a-harness) します。ハーネスによって、どの指示ファイルが読み取られるかが決まります。たとえば、{% data variables.product.prodname_copilot_short %} セッションで Claude モデルを選択しても、Claude ハーネスには切り替わりません。

最初のセットアップでは、テストセッションからコミットされていない指示にアクセスできるように、新しいワークツリーではなく現在のフォルダーで作業します。

### プロジェクトの指示を作成する

1. コマンドパレット (`kb(workbench.action.showCommands)`) から **Chat: Open Customizations** を実行して Agent Customizations エディターを開き、**Instructions** タブを選択します。

1. プロジェクトの指示ファイルを追加するには、**Workspace** の横にある `+` を選択し、`AGENTS.md` や `CLAUDE.md` など、ハーネス用に提示されたプロジェクト指示ファイルを選択します。エディターによって、ワークスペースにファイルが作成されるか、ファイルが開きます。

   リポジトリにすでにプロジェクト指示ファイルがある場合は、競合するコピーを作成するのではなく、既存のファイルを開いてください。

1. 繰り返し発生する問題に対処するいくつかの具体的なルールを追加します。たとえば、Node.js APIプロジェクトでは、次の指示を使用できます。パスとテストコマンドを、リポジトリで機能するものに置き換えてください。

   ```markdown
   # Project instructions

   * Add HTTP handlers under `src/api/routes`.
   * Keep database access in `src/repositories` so handlers remain independently testable.
   * Add or update tests for behavior changes, and run `npm test -- <test-file>` for the affected tests.
   ```

1. ファイルを保存します。これらのプロジェクト指示ファイルには、フロントマターは必要ありません。

#### ファイルを直接作成する

Agent Customizations エディター以外でファイルを作成する場合は、ハーネスでサポートされているプロジェクト指示ファイルを使用してください。以下のパスはリポジトリのルートからの相対パスです。必要に応じて、存在しないフォルダーを作成します。

| ハーネス | プロジェクト指示ファイル |
|---------|---------------------------|
| {% data variables.product.prodname_copilot_short %} | `.github/copilot-instructions.md` または `AGENTS.md` |
| {% data variables.product.prodname_anthropic_claude %} | `CLAUDE.md` |
| {% data variables.product.prodname_openai_codex %} | `AGENTS.md` |
| ローカル `feature(local-harness)` | `.github/copilot-instructions.md` または `AGENTS.md` |

ルールを追加し、ファイルを保存し、以下で説明するように検証します。 `AGENTS.md` はクロスエージェントの形式であり、Codex専用のファイルではありません。1つのファイルを複数のハーネス間で共有する前に、[サポートされている形式](/docs/agents/reference/custom-instructions-reference.md#supported-formats-and-locations) を確認してください。

### 指示を検証する

ルールが結果に影響するような小さなタスクをテストします。最初から最後まで同じハーネスとリポジトリを使用します。

1. コマンドパレット (`kb(workbench.action.showCommands)`) から **Chat: Open Customizations** を実行します。**Instructions** を選択し、ファイルがリストされていることを確認します。これは、エージェントがルールに従うかどうかではなく、検出されるかどうかを確認するものです。
1. 指示を作成した会話からのガイダンスにテストが依存しないように、新しいチャットを開始します。
1. プロンプトでルールを繰り返さずに、小さな変更を依頼します。APIの例では、プロジェクトの既存のパターンを使用してエンドポイントを追加するようにエージェントに依頼します。
1. 利用可能な場合は、レスポンスの **References** セクションで指示ファイルを確認します。詳細が必要な場合は、[Agent デバッグログでリクエストを検査](/docs/agents/agent-troubleshooting/chat-debug-view.md#instructions-or-a-prompt-file-are-not-applied) します。
1. 変更とツールのクエリを確認します。この例では、ハンドラーが追加された場所、データのアクセス方法、エージェントが関連するテストを実行したかどうかを確認します。

結果が目標を満たしている場合は、チームが使用できるように指示ファイルをレビューしてコミットします。満たしていない場合は、ルールを追加する前に、[ファイルが検出されたか、含まれていたか、従われたかを確認](#troubleshoot-instructions) します。

完全な変更前後の比較とチームへのロールアウトワークフローについては、[コードベース向けのAI構成](/docs/agents/guides/customize-copilot-guide.md) に従ってください。

## 指示の適用方法

スコープとアクティベーションは、異なる質問に対する答えです。スコープは、ガイダンスがどこで利用可能であり、誰がそれを共有するかを決定します。アクティベーションは、そのガイダンスがリクエストにいつ含まれるかを決定します。

| スコープ | 使用目的 |
|-------|------------|
| ワークスペースまたはリポジトリ | ソース管理を通じてコントリビューターと共有されるプロジェクト規約 |
| ユーザー | ハーネスでサポートされている場所における、プロジェクト横断的な個人の好み |
| 組織 | サポートされているエクスペリエンス向けの一元管理されたガイダンス |

広く適用されるルールについては、プロジェクトの指示から始めます。コードベースの一部のみで必要なガイダンスについては、ターゲットを絞った指示を使用します。

| アクティベーション | 動作の仕組み |
|------------|--------------|
| プロジェクト全体 | ハーネスには、プロジェクト指示ファイルからのガイダンスが含まれます。 |
| ファイルパターン | `.instructions.md` ファイルは `applyTo` を使用するか、Claude ルールファイルは `paths` を使用して、エージェントが処理するファイルと一致させます。 |
| タスクの関連性 | ローカルセッションでは、`description` により、エージェントはタスク用の指示ファイルを読み込むかどうかを決定できます。これはパターンマッチングとは別です。 |
| 手動 | 自動検出またはアクティベーションが適切ではない特定のリクエストのガイダンスを添付します。 |

`AGENTS.md` などの指示ファイルは、既存のエージェントにガイダンスを提供します。[カスタムエージェント](/docs/agent-customization/custom-agents.md) を定義するものではありません。コーディング規約やプロジェクトコンテキストではなく、再利用可能な多段階のワークフローについては、[エージェントスキル](/docs/agent-customization/agent-skills.md) の使用を検討してください。自分でワークフローを作成する前に、[カスタマイズマーケットプレイスで既存のスキルを探して](/docs/agent-customization/agent-skills.md#install-a-skill-from-the-customization-marketplace-preview) ください。リポジトリ固有のコマンドと規約は、プロジェクトの指示に記述してください。

## 特定のファイルまたはタスクへの指示の適用

プロジェクト全体のルールは、メインの指示ファイルに維持します。たとえば、テストにアプリケーションコードとは異なる規約が必要な場合などは、ターゲットを絞ったガイダンスを追加します。次の例では、Pythonのテストルールを `tests` ディレクトリにスコープしています。

目的のハーネスを選択した状態で、Agent Customizations エディターから始めます。以下のハーネスの手順に従ってから、パスとルールをプロジェクトに合わせて調整します。

{% tabs id="instruction-harness" %}
{% tab label="{% data variables.product.prodname_copilot_short %} またはローカル" %}

1. コマンドパレット (`kb(workbench.action.showCommands)`) から **Chat: Open Customizations** を実行し、**Instructions** を選択します。
1. **Workspace** の横にある `+` ボタンを選択し、プロジェクト全体のファイル (`AGENTS.md` など) ではなく、新しい指示ファイルのアクションを選択します。
1. プロンプトが表示された場合は `.github/instructions` を選択し、ファイル名として `python-tests` を入力します。
1. 生成されたファイルに、次のフロントマターと指示を追加します。

指示を適用するファイルを指定するには、`applyTo` を使用します。

```markdown
---
applyTo: 'tests/**/*.py'
---
# Python tests

* Reuse fixtures from `tests/conftest.py` instead of duplicating setup.
* Name tests `test_<behavior>_<condition>`.
* Run `python -m pytest <test-file>` after changing a test.
```

このパターンは `tests/test_api.py` および `tests/unit/test_api.py` に一致しますが、`src/api.py` には一致しません。これは `.github/instructions` ディレクトリではなく、ワークスペースまたはプロジェクトのルートからの相対パスです。

ファイルを直接作成したい場合は、`.github/instructions/python-tests.instructions.md` として保存します。異なる言語、フォルダー、またはタスクに適用されるガイダンスには、個別の `.instructions.md` ファイルを使用します。

ローカルセッション `feature(local-harness)` では、タスクベースの発見のために、`'Use when creating or updating Python tests.'` などの `description` を追加することもできます。説明は `applyTo` に対する追加の制限ではありません。エージェントは、パターンマッチングとは別に、関連性によってファイルを読み込むことができます。

{% /tab %}
{% tab label="Claude" %}

1. **Claude** ハーネスを選択した状態で Agent Customizations エディターを開き、**Instructions** を選択します。
1. **Workspace** の横にある `+` ボタンを選択し、プロジェクト全体の `CLAUDE.md` ファイルではなく、新しいルールファイルのアクションを選択します。
1. プロンプトが表示された場合は `.claude/rules` を選択し、ファイル名として `python-tests` を入力します。
1. 生成されたファイルに、次のフロントマターと指示を追加します。

ルールを適用するファイルパターンを一覧表示するには、`paths` を使用します。パターンはプロジェクトルートからの相対パスです。

```markdown
---
paths:
  - 'tests/**/*.py'
---
# Python tests

* Reuse fixtures from `tests/conftest.py` instead of duplicating setup.
* Name tests `test_<behavior>_<condition>`.
* Run `python -m pytest <test-file>` after changing a test.
```

ルールは、ネストされたディレクトリを含め、`tests` 以下のPythonファイルを対象としています。 `paths` がないと、ルールは全般的に適用されます。

ファイルを直接作成したい場合は、`.claude/rules/python-tests.md` として保存します。異なる言語、フォルダー、またはタスクに適用されるガイダンスには、個別のルールファイルを使用します。

{% /tab %}
{% tab label="Codex" %}

ネストされた指示については、**Codex** ハーネスを選択した状態で Agent Customizations エディターの **Overview** セクションを使用してファイルを要求します。

```prompt
Create or update tests/AGENTS.md with Python testing conventions.
Reuse fixtures from conftest.py, name tests test_<behavior>_<condition>,
and run python -m pytest <test-file> after changing a test.
Preserve existing guidance and do not change application code.
```

使用する前に生成されたファイルをレビューします。Codexは `applyTo` や `paths` のパターンではなくディレクトリの場所を使用し、これらのファイルにはYAMLフロントマターは必要ありません。プロジェクト全体の指示はリポジトリルートの `AGENTS.md` に維持し、ターゲットを絞ったガイダンスは関連するディレクトリに維持します。

たとえば、`tests/AGENTS.md` には以下が含まれます。

```markdown
# Python tests

* Reuse fixtures from `conftest.py` instead of duplicating setup.
* Name tests `test_<behavior>_<condition>`.
* Run `python -m pytest <test-file>` after changing a test.
```

`tests` を作業ディレクトリとして新しいCodexセッションを開始します。Codexは、リポジトリルートからそのディレクトリまでのパスに沿って指示を読み込みます。エディターでテストファイルを開いても、セッションの作業ディレクトリは変更されません。

ファイルを直接作成したい場合は、例を `tests/AGENTS.md` として保存します。

{% /tab %}
{% /tabs %}

ファイルを作成した後:

1. ファイルを保存し、同じハーネスで新しいチャットを開始します。
1. 一致するディレクトリ内のテストを追加または更新するようにエージェントに依頼します。
1. [インクルージョンと動作を検証](#verify-your-instructions) します。テストが命名規則とフィクスチャ規則に従っていること、およびエージェントがテストコマンドを実行していることを確認します。

追加のパターンとネストされたファイルの動作については、[指示のアクティベーション](/docs/agents/reference/custom-instructions-reference.md#discovery-and-activation) を参照してください。

### 1つのリクエストに指示を添付する

1回限りの要件については、共有ルールを作成するのではなく、プロンプトにガイダンスを記述します。

1つのリクエストのために既存の指示ファイルを再利用するには、チャット入力の **Add Context** (`+` アイコン) を選択し、リクエストを送信する前にファイルを選択します。

## 効果的な指示の記述

リポジトリ内のすべてを説明するのではなく、エージェントがプロジェクト固有の決定を下すのに役立つルールを記述します。

| 代わりに | 次のように記述します |
|------------|-------|
| 良いテストを記述する。 | `tests/conftest.py` のフィクスチャを再利用し、テストの変更後に `python -m pytest <test-file>` を実行する。 |
| アーキテクチャに従う。 | HTTPハンドラーが独立してテスト可能な状態を維持できるように、データベースアクセスを `src/repositories` に保持する。 |
| スタイルに従う。 | エラー文字列を返すのではなく、`src/errors.ts` の既存のエラー型を使用する。 |

* **ルールを簡潔に保つ。** 各要件に対して短いステートメントを使用し、自明ではない制約については説明します。
* **実行可能な詳細を優先する。** エージェントが使用すべきコマンド、ディレクトリ、ライブラリ、または既存の例を指定します。
* **不要なコンテキストを避ける。** フォーマッターやリンターによって強制されるルールを重複させないでください。特殊なガイダンスはプロジェクト全体のファイルから移動させます。
* **コードとともに指示をメンテナンスする。** ソース管理を通じて変更をレビューし、コマンド、アーキテクチャ、または依存関係が変更されたときにルールを更新します。
* **サポートドキュメントを慎重に参照する。** 相対パスと `/` 区切り文字を使用したMarkdownリンクを使用します。リンクは、ドキュメントの内容がモデルに到達することを保証するものではありません。[参照されたファイルの動作](/docs/agents/reference/custom-instructions-reference.md#reference-other-files) を確認してください。

### 競合する指示の解決

共有要件は、個人、リポジトリ、組織のガイダンス間で一貫性を保ちます。普遍的な優先順位に依存しないでください。[組み合わせのルールはハーネスによって異なり](/docs/agents/reference/custom-instructions-reference.md#combine-instruction-sources) ます。

個人の指示が1つのライブラリを要求し、リポジトリが別のライブラリを要求している場合は、競合している個人のルールを削除するか、範囲を狭めます。補正するためにもう1つのルールを追加しないでください。競合を解決した後に、新しいチャットで同じ代表的なタスクを繰り返します。

## プロジェクトと個人の指示の管理

Agent Customizations エディターの **Instructions** に戻って、既存の指示を見つけて編集します。個人の指示を追加するには、**User** の横にある `+` を選択します。ハーネスでサポートされている名前と保存場所のプロンプトに従い、ファイルを保存し、そのハーネスを使用した新しいチャットで検証します。

プロジェクト横断的な個人の好みには、ユーザーのスコープを使用します。チームが望んでいる場合を除き、個人の応答の好み共有プロジェクトファイルに配置しないでください。場所と同期の制限については、[ユーザー指示](/docs/agents/reference/custom-instructions-reference.md#user-instructions) を参照してください。

また、関連するエージェント、スキル、またはツールとともに、[エージェントプラグイン](/docs/agent-customization/agent-plugins.md#what-plugins-provide) 内のルールコンポーネントとして指示を配布することもできます。サポートは、選択したハーネスとプラグインの形式によって異なります。クライアント間でバンドルを共有する前に、[プラグインの互換性](/docs/agent-customization/agent-plugins.md#cross-tool-compatibility) を確認してください。

<a name="sync-local-agent-instructions-across-devices"></a>

## 指示の形式と設定

[カスタム指示リファレンス](/docs/agents/reference/custom-instructions-reference.md) を使用して、以下を確認します。

* [ファイル形式、場所、フロントマター](/docs/agents/reference/custom-instructions-reference.md#supported-formats-and-locations)。
* [検出、パターン、ネストされた指示](/docs/agents/reference/custom-instructions-reference.md#discovery-and-activation)。
* [個人の指示と設定の同期](/docs/agents/reference/custom-instructions-reference.md#user-instructions)。
* [組織の指示](/docs/agents/reference/custom-instructions-reference.md#organization-instructions)。
* [指示と生成されたコンテンツの設定](/docs/agents/reference/custom-instructions-reference.md#settings)。

## 指示のトラブルシューティング

ガイダンスを変更する前に、障害のステージを特定します。

| 観察される内容 | 確認すべき事項 |
|------------------|---------------|
| ファイルが Customizations エディターにリストされない。 | 選択したハーネス、ファイル名、サポートされている場所、およびセッションが変更を含むフォルダーを使用しているかどうかを確認します。 |
| ファイルが検出されたが、タスクに含まれない。 | フロントマターのエラーとアクティベーション条件を確認します。一致するファイルをテストするか、手動で指示を添付します。ローカルの場合は、該当する[検出設定](/docs/agents/reference/custom-instructions-reference.md#local-harness-settings) を確認します。 |
| ファイルが含まれているが、結果がそれに従わない。 | 矛盾しているルールや曖昧なルールがないか確認します。1つのルールを明確にし、新しいチャットでタスクを繰り返し、実際の変更とツールのクエリを比較します。 |

利用可能な場合のレスポンスの **References** セクションは、コンプライアンスではなく、包含の確認に役立ちます。詳細な証拠については、[指示の診断](/docs/agents/agent-troubleshooting/chat-debug-view.md#instructions-or-a-prompt-file-are-not-applied) に従ってください。問題の再現の前にロギングを準備します。

## 関連リソース

* 測定された作成、検証、共有のワークフローについては、[コードベース向けのAI構成](/docs/agents/guides/customize-copilot-guide.md) を参照してください。
* 構文とハーネス固有の動作については、[カスタム指示リファレンス](/docs/agents/reference/custom-instructions-reference.md) を参照してください。
* 指示、スキル、その他のカスタマイズの中から選択するには、[エージェントのカスタマイズの概念](/docs/agents/concepts/customization.md) を参照してください。