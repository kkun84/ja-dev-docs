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
# {% data variables.product.prodname_vscode_shortname %}でカスタム指示を使用する

カスタム指示を使用すると、コードを追加する場所、使用するライブラリ、実行するテストなど、プロジェクトに関する再利用可能なガイダンスをエージェントに提供できます。このガイダンスをすべてのプロンプトで繰り返す代わりにMarkdownファイルに保存し、ソース管理を通じてプロジェクト指示を共有します。

エージェントが繰り返し見落とす規約が1つある場合は、そこから始めます。[Agent Customizations editor](/docs/agent-customization/overview.md#agent-customizations-editor)で指示を作成し、より的を絞ったガイダンスを追加する前に、新しいチャットでその効果をテストします。サポートされている場所、ファイルの構文、設定については、[カスタム指示リファレンス](/docs/agents/reference/custom-instructions-reference.md)を参照してください。

指示はモデルを誘導するものです。指示はコンプライアンスを保証するものではなく、テスト、コードレビュー、セキュリティ制御に代わるものでもありません。入力時の[インライン候補](/docs/editing/ai-powered-suggestions.md)には適用されません。

## プロジェクト指示の利用を開始する

リポジトリルートを開き、使用する予定の[エージェントハーネスを選択](/docs/agents/run/agent-harnesses.md#select-a-harness)します。ハーネスによって、どの指示ファイルが読み取られるかが決まります。たとえば、{% data variables.product.prodname_copilot_short %}セッションでClaudeモデルを選択しても、Claudeハーネスには切り替わりません。

この最初のセットアップでは、テストセッションがコミットされていない指示にアクセスできるように、新しいワークツリーではなく現在のフォルダーで作業します。

### プロジェクト指示を作成する

1. コマンドパレット（`kb(workbench.action.showCommands)`）から**Chat: Open Customizations**を実行してAgent Customizations editorを開き、**Instructions**タブを選択します。

1. プロジェクト指示ファイルを追加するには、**Workspace**の横にある`+`を選択し、`AGENTS.md`や`CLAUDE.md`など、使用するハーネス向けに提示されているプロジェクト指示ファイルを選択します。エディターによってワークスペース内にファイルが作成されるか、開かれます。

   リポジトリにすでにプロジェクト指示ファイルがある場合は、競合するコピーを作成する代わりにそれを開きます。

1. 繰り返される問題に対処する具体的なルールをいくつか追加します。たとえば、Node.js APIプロジェクトでは次の指示を使用する場合があります。パスとテストコマンドを、リポジトリで動作するものに置き換えてください。

   ```markdown
   # Project instructions

   * Add HTTP handlers under `src/api/routes`.
   * Keep database access in `src/repositories` so handlers remain independently testable.
   * Add or update tests for behavior changes, and run `npm test -- <test-file>` for the affected tests.
   ```

1. ファイルを保存します。これらのプロジェクト指示ファイルにはfrontmatterは不要です。

#### ファイルを直接作成する

Agent Customizations editorの外でファイルを作成する場合は、使用するハーネスでサポートされているプロジェクト指示ファイルを使用します。以下のパスはリポジトリルートからの相対パスです。必要に応じて不足しているフォルダーを作成してください。

| ハーネス | プロジェクト指示ファイル |
|---------|---------------------------|
| {% data variables.product.prodname_copilot_short %} | `.github/copilot-instructions.md`または`AGENTS.md` |
| {% data variables.product.prodname_anthropic_claude %} | `CLAUDE.md` |
| {% data variables.product.prodname_openai_codex %} | `AGENTS.md` |
| Local `feature(local-harness)` | `.github/copilot-instructions.md`または`AGENTS.md` |

ルールを追加し、ファイルを保存して、以下で説明するように検証します。`AGENTS.md`はクロスエージェント形式であり、Codex専用ファイルではありません。1つのファイルをハーネス間で共有する前に、[サポートされている形式](/docs/agents/reference/custom-instructions-reference.md#supported-formats-and-locations)を参照してください。

### 指示を検証する

ルールが結果に影響を与える小さなタスクをテストします。一貫して同じハーネスとリポジトリを使用します。

1. コマンドパレット（`kb(workbench.action.showCommands)`）から**Chat: Open Customizations**を実行します。**Instructions**を選択し、ファイルが一覧表示されていることを確認します。これにより検出が確認されますが、エージェントがルールに従っているかどうかは確認されません。
1. 指示を作成した会話のガイダンスにテストが依存しないよう、新しいチャットを開始します。
1. プロンプトでルールを繰り返さずに、小さな変更を要求します。APIの例では、プロジェクトの既存のパターンを使用してエンドポイントを追加するようエージェントに依頼します。
1. 利用可能な場合は、応答の**References**セクションで指示ファイルを確認します。詳細が必要な場合は、[Agent Debug Logsでリクエストを検査](/docs/agents/agent-troubleshooting/chat-debug-view.md#instructions-or-a-prompt-file-are-not-applied)してください。
1. 変更内容とツールの動作を確認します。この例では、ハンドラーが追加された場所、データへのアクセス方法、エージェントが関連するテストを実行したかどうかを確認します。

結果が目的に合致している場合は、チームが使用できるように指示ファイルをレビューしてコミットします。そうでない場合は、ルールをさらに追加する前に、[ファイルが検出、含有、または遵守されたかどうかを特定](#troubleshoot-instructions)してください。

完全な導入前後の比較とチームへのロールアウトワークフローについては、[コードベース向けにAIを構成する](/docs/agents/guides/customize-copilot-guide.md)に従ってください。

## 指示が適用される仕組み

スコープとアクティブ化は、それぞれ異なる疑問に答えるものです。スコープはガイダンスがどこで利用可能か、誰が共有するかを決定します。アクティブ化は、そのガイダンスがリクエストにいつ含まれるかを決定します。

| スコープ | 用途 |
|-------|------------|
| ワークスペースまたはリポジトリ | ソース管理を通じてコントリビューターと共有するプロジェクト規約 |
| ユーザー | ハーネスでサポートされている場所にある、プロジェクト全体にわたる個人の好み |
| 組織 | サポートされているエクスペリエンス向けの一元管理されたガイダンス |

広く適用されるルールにはプロジェクト指示から始めます。コードベースの一部でのみ必要なガイダンスには、的を絞った指示を使用します。

| アクティブ化 | 仕組み |
|------------|--------------|
| プロジェクト全体 | ハーネスはそのプロジェクト指示ファイルからのガイダンスを含めます。 |
| ファイルパターン | `.instructions.md`ファイルは`applyTo`を使用するか、Claudeルールファイルは`paths`を使用して、エージェントが操作するファイルと一致させます。 |
| タスクの関連性 | Localセッションでは、`description`により、エージェントがタスクの指示ファイルを読み取るかどうかを決定できます。これはパターンマッチングとは別です。 |
| 手動 | 自動検出やアクティブ化が適切でない場合に、特定の要求に対するガイダンスを添付します。 |

`AGENTS.md`などの指示ファイルは、既存のエージェントにガイダンスを提供します。[カスタムエージェント](/docs/agent-customization/custom-agents.md)を定義するものではありません。コーディング規約やプロジェクトのコンテキストではなく、再利用可能なマルチステップワークフローの場合は、[エージェントスキル](/docs/agent-customization/agent-skills.md)を検討してください。ワークフローを自分で記述する前に、[Customization Marketplaceで既存のスキルを探す](/docs/agent-customization/agent-skills.md#install-a-skill-from-the-customization-marketplace-preview)を行ってください。リポジトリ固有のコマンドや規約はプロジェクト指示に残しておきます。

## 特定のファイルまたはタスクに指示を適用する

プロジェクト全体のルールはメインの指示ファイルに保持します。たとえば、テストにアプリケーションコードとは異なる規約が必要な場合などに、的を絞ったガイダンスを追加します。次の例では、Pythonテストルールを`tests`ディレクトリにスコープ設定します。

目的のハーネスを選択した状態でAgent Customizations editorで開始します。以下の使用するハーネス向けの手順を実行し、パスとルールをプロジェクトに合わせて調整します。

{% tabs id="instruction-harness" %}
{% tab label="{% data variables.product.prodname_copilot_short %} or Local" %}

1. コマンドパレット（`kb(workbench.action.showCommands)`）から**Chat: Open Customizations**を実行し、**Instructions**を選択します。
1. **Workspace**の横にある`+`ボタンを選択し、`AGENTS.md`などのプロジェクト全体を対象とするファイルではなく、新しい指示ファイルのアクションを選択します。
1. プロンプトが表示された場合は`.github/instructions`を選択し、ファイル名として`python-tests`を入力します。
1. 生成されたファイルに、次のfrontmatterと指示を追加します。

指示を適用するファイルを指定するには、`applyTo`を使用します。

```markdown
---
applyTo: 'tests/**/*.py'
---
# Python tests

* Reuse fixtures from `tests/conftest.py` instead of duplicating setup.
* Name tests `test_<behavior>_<condition>`.
* Run `python -m pytest <test-file>` after changing a test.
```

このパターンは`tests/test_api.py`および`tests/unit/test_api.py`に一致しますが、`src/api.py`には一致しません。これは`.github/instructions`ディレクトリではなく、ワークスペースまたはプロジェクトルートからの相対パスです。

ファイルを直接作成する場合は、`.github/instructions/python-tests.instructions.md`として保存します。異なる言語、フォルダー、またはタスクに適用されるガイダンスには、個別の`.instructions.md`ファイルを使用します。

Localセッション`feature(local-harness)`では、タスクベースの検出のために`'Use when creating or updating Python tests.'`などの`description`を追加することもできます。説明は`applyTo`に対する追加の制限ではありません。エージェントはパターンマッチングとは別に、関連性に基づいてファイルを読み込むことができます。

{% /tab %}
{% tab label="Claude" %}

1. **Claude**ハーネスを選択した状態でAgent Customizations editorを開き、**Instructions**を選択します。
1. **Workspace**の横にある`+`ボタンを選択し、プロジェクト全体の`CLAUDE.md`ファイルではなく、新しいルールファイルのアクションを選択します。
1. プロンプトが表示された場合は`.claude/rules`を選択し、ファイル名として`python-tests`を入力します。
1. 生成されたファイルに、次のfrontmatterと指示を追加します。

ルールを適用するファイルパターンを一覧表示するには、`paths`を使用します。パターンはプロジェクトルートからの相対パスです。

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

このルールは、入れ子になったディレクトリを含む`tests`以下のPythonファイルを対象とします。`paths`がない場合、ルールは汎用的に適用されます。

ファイルを直接作成する場合は、`.claude/rules/python-tests.md`として保存します。異なる言語、フォルダー、またはタスクに適用されるガイダンスには、個別のルールファイルを使用します。

{% /tab %}
{% tab label="Codex" %}

入れ子になった指示の場合は、**Codex**ハーネスを選択した状態でAgent Customizations editorの**Overview**セクションを使用してファイルを要求します。

```prompt
Create or update tests/AGENTS.md with Python testing conventions.
Reuse fixtures from conftest.py, name tests test_<behavior>_<condition>,
and run python -m pytest <test-file> after changing a test.
Preserve existing guidance and do not change application code.
```

使用する前に、生成されたファイルを確認してください。Codexは`applyTo`や`paths`パターンではなくディレクトリの場所を使用し、これらのファイルにはYAML frontmatterは不要です。プロジェクト全体の指示はリポジトリルートの`AGENTS.md`に保持し、的を絞ったガイダンスは関連するディレクトリに保持します。

たとえば、`tests/AGENTS.md`には次が含まれます。

```markdown
# Python tests

* Reuse fixtures from `conftest.py` instead of duplicating setup.
* Name tests `test_<behavior>_<condition>`.
* Run `python -m pytest <test-file>` after changing a test.
```

`tests`を作業ディレクトリとして新しいCodexセッションを開始します。Codexは、リポジトリルートからそのディレクトリまでのパスに沿って指示を読み込みます。エディターでテストファイルを開いても、セッションの作業ディレクトリは変更されません。

ファイルを直接作成する場合は、この例を`tests/AGENTS.md`として保存します。

{% /tab %}
{% /tabs %}

ファイルの作成後:

1. ファイルを保存し、同じハーネスで新しいチャットを開始します。
1. 一致するディレクトリにテストを追加または更新するようエージェントに依頼します。
1. [含まれていることと動作の検証](#verify-your-instructions)を行います。テストが名前付けとフィクスチャの規約に従っていること、およびエージェントがテストコマンドを実行することを確認します。

追加のパターンや入れ子になったファイルの動作については、[指示のアクティブ化](/docs/agents/reference/custom-instructions-reference.md#discovery-and-activation)を参照してください。

### 1つのリクエストに指示を添付する

1回限りの要件の場合は、共有ルールを作成するのではなく、プロンプトにガイダンスを記述します。

1つのリクエストで既存の指示ファイルを再利用するには、チャット入力で**Add Context**（`+`アイコン）を選択し、リクエストを送信する前にファイルを選択します。

## 効果的な指示を作成する

リポジトリ内のすべてを説明するのではなく、エージェントがプロジェクト固有の決定を行うのに役立つルールを記述します。

| 避けるべき記述 | 推奨する記述 |
|------------|-------|
| 適切なテストを作成する。 | `tests/conftest.py`のフィクスチャを再利用し、テストを変更した後に`python -m pytest <test-file>`を実行する。 |
| アーキテクチャに従う。 | HTTPハンドラーを個別にテスト可能な状態に保つため、データベースアクセスは`src/repositories`に保持する。 |
| スタイルに従う。 | エラーストリングを返すのではなく、`src/errors.ts`の既存のエラータイプを使用する。 |

* **ルールは簡潔に保ちます。**要件ごとに短いステートメントを使用し、自明でない制約を説明します。
* **実用的な詳細を優先します。**エージェントが使用すべきコマンド、ディレクトリ、ライブラリ、または既存の例を指定します。
* **不要なコンテキストを避けます。**フォーマッターやリンターによって強制されるルールを重複して記述しないでください。特殊なガイダンスはプロジェクト全体のファイルから除外します。
* **コードとともに指示をメンテナンスします。**ソース管理を通じて変更をレビューし、コマンド、アーキテクチャ、または依存関係が変更されたときにルールを更新します。
* **サポートドキュメントの参照には注意します。**相対パスと`/`区切り記号を使用したMarkdownリンクを使用します。リンクがあっても、ドキュメントの内容がモデルに届くとは限りません。[参照ファイルの動作](/docs/agents/reference/custom-instructions-reference.md#reference-other-files)を確認してください。

### 競合する指示を解決する

個人、リポジトリ、組織のガイダンス全体で、共有要件の一貫性を維持します。普遍的な優先順位に依存しないでください。[ハーネスによって結合ルールが異なる](/docs/agents/reference/custom-instructions-reference.md#combine-instruction-sources)ためです。

個人の指示があるライブラリを要求し、リポジトリが別のライブラリを必要とする場合は、競合する個人のルールを削除するか絞り込みます。埋め合わせのために別のルールを追加しないでください。競合を解決した後、新しいチャットで同じ代表的なタスクを繰り返します。

## プロジェクトと個人の指示を管理する

既存の指示を見つけて編集するには、Agent Customizations editorの**Instructions**に戻ります。個人の指示を追加するには、**User**の横にある`+`を選択します。プロンプトに従ってハーネスでサポートされている名前と保存場所を指定し、ファイルを保存して、そのハーネスの新しいチャットで検証します。

プロジェクト全体にわたる個人の好みにはユーザー・スコープを使用します。チームも望んでいる場合を除き、個人の応答の好みを共有プロジェクトファイルに入れないでください。場所と同期の制限については、[ユーザー指示](/docs/agents/reference/custom-instructions-reference.md#user-instructions)を参照してください。

関連するエージェント、スキル、またはツールとともに、[エージェントプラグイン](/docs/agent-customization/agent-plugins.md#what-plugins-provide)内のルールコンポーネントとして指示を配布することもできます。サポートは、選択したハーネスとプラグインの形式によって異なります。クライアント間でバンドルを共有する前に、[プラグインの互換性](/docs/agent-customization/agent-plugins.md#cross-tool-compatibility)を確認してください。

<a name="sync-local-agent-instructions-across-devices"></a>

## 指示の形式と設定

以下を調べるには、[カスタム指示リファレンス](/docs/agents/reference/custom-instructions-reference.md)を使用します。

* [ファイル形式、場所、およびfrontmatter](/docs/agents/reference/custom-instructions-reference.md#supported-formats-and-locations)。
* [検出、パターン、および入れ子になった指示](/docs/agents/reference/custom-instructions-reference.md#discovery-and-activation)。
* [個人の指示とSettings Sync](/docs/agents/reference/custom-instructions-reference.md#user-instructions)。
* [組織の指示](/docs/agents/reference/custom-instructions-reference.md#organization-instructions)。
* [指示と生成されたコンテンツの設定](/docs/agents/reference/custom-instructions-reference.md#settings)。

## 指示のトラブルシューティング

ガイダンスを変更する前に、失敗の段階を特定します。

| 確認される状況 | 確認事項 |
|------------------|---------------|
| Customizations editorにファイルが一覧表示されない。 | 選択されているハーネス、ファイル名、サポートされている場所、およびセッションが変更を含むフォルダーを使用しているかどうかを確認します。 |
| ファイルは検出されるが、タスクに含まれない。 | frontmatterのエラーとアクティブ化条件を確認します。一致するファイルをテストするか、指示を手動で添付します。Localの場合は、該当する[検出設定](/docs/agents/reference/custom-instructions-reference.md#local-harness-settings)を確認します。 |
| ファイルは含まれるが、結果がそれに従っていない。 | 矛盾するルールや曖昧なルールがないか確認します。1つのルールを明確にし、新しいチャットでタスクを繰り返して、実際の変更とツールの動作を比較します。 |

利用可能な場合、応答の**References**セクションは、コンプライアンスではなく含まれているかどうかを確認するのに役立ちます。詳細な証拠については、[指示の診断](/docs/agents/agent-troubleshooting/chat-debug-view.md#instructions-or-a-prompt-file-are-not-applied)に従ってください。問題を再現する前にログの準備をしてください。

## 関連リソース

* 測定された作成、検証、共有のワークフローについては、[コードベース向けにAIを構成する](/docs/agents/guides/customize-copilot-guide.md)を参照してください。
* 構文およびハーネス固有の動作については、[カスタム指示リファレンス](/docs/agents/reference/custom-instructions-reference.md)を参照してください。
* 指示、スキル、その他のカスタマイズの中から選択するには、[エージェントのカスタマイズの概念](/docs/agents/concepts/customization.md)を参照してください。