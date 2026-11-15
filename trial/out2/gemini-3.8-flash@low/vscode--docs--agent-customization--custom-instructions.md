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
# {% data variables.product.prodname_vscode_shortname %}でのカスタムインストラクションの使用

カスタムインストラクションは、コードを追加する場所、使用するライブラリ、実行するテストなど、プロジェクトに関する再利用可能なガイダンスをエージェントに提供します。プロンプトごとにこのガイダンスを繰り返す代わりにMarkdownファイルに保存し、ソース管理を通じてプロジェクトのインストラクションを共有します。

まずはエージェントが繰り返し見落とす1つの規約から始めます。[Agent Customizations editor](/docs/agent-customization/overview.md#agent-customizations-editor)でインストラクションを作成し、よりターゲットを絞ったガイダンスを追加する前に、新しいチャットでその効果をテストします。サポートされている場所、構文、設定については、[カスタムインストラクションのリファレンス](/docs/agents/reference/custom-instructions-reference.md)を参照してください。

インストラクションはモデルをガイドするものです。コンプライアンスを保証するものではなく、テスト、コードレビュー、セキュリティ制御に代わるものでもありません。入力中の[インライン候補](/docs/editing/ai-powered-suggestions.md)には適用されません。

## プロジェクトのインストラクションを使い始める

リポジトリルートを開き、使用する予定の[エージェントハーネスを選択](/docs/agents/run/agent-harnesses.md#select-a-harness)します。ハーネスによって読み込まれるインストラクションファイルが決まります。たとえば、{% data variables.product.prodname_copilot_short %}セッションでClaudeモデルを選択しても、Claudeハーネスに切り替わるわけではありません。

この最初のセットアップでは、テストセッションが未コミットのインストラクションにアクセスできるように、新しいワークツリーではなく現在のフォルダーで作業します。

### プロジェクトのインストラクションを作成する

1. コマンドパレット（`kb(workbench.action.showCommands)`）から**Chat: Open Customizations**を実行してAgent Customizations editorを開き、**Instructions**タブを選択します。

1. プロジェクトのインストラクションファイルを追加するには、**Workspace**の横にある`+`を選択し、`AGENTS.md`や`CLAUDE.md`など、ハーネス用に提示されたプロジェクトインストラクションファイルを選択します。エディターによってワークスペース内にファイルが作成または開かれます。

   リポジトリにすでにプロジェクトのインストラクションファイルが存在する場合は、競合するコピーを作成するのではなく、そのファイルを開いてください。

1. 繰り返し発生する問題に対処する具体的なルールをいくつか追加します。たとえば、Node.js APIプロジェクトでは以下のインストラクションを使用できます。パスとテストコマンドをリポジトリで機能するものに置き換えてください。

   ```markdown
   # Project instructions

   * Add HTTP handlers under `src/api/routes`.
   * Keep database access in `src/repositories` so handlers remain independently testable.
   * Add or update tests for behavior changes, and run `npm test -- <test-file>` for the affected tests.
   ```

1. ファイルを保存します。これらのプロジェクトインストラクションファイルにはfrontmatterは不要です。

#### ファイルを直接作成する

Agent Customizations editorの外でファイルを作成したい場合は、ハーネスでサポートされているプロジェクトインストラクションファイルを使用します。以下のパスはリポジトリルートからの相対パスです。必要に応じて不足しているフォルダーを作成してください。

| ハーネス | プロジェクトのインストラクションファイル |
|---------|---------------------------|
| {% data variables.product.prodname_copilot_short %} | `.github/copilot-instructions.md`または`AGENTS.md` |
| {% data variables.product.prodname_anthropic_claude %} | `CLAUDE.md` |
| {% data variables.product.prodname_openai_codex %} | `AGENTS.md` |
| Local `feature(local-harness)` | `.github/copilot-instructions.md`または`AGENTS.md` |

ルールを追加してファイルを保存し、後述の手順で確認します。`AGENTS.md`はエージェント間で共通の形式であり、Codex専用のファイルではありません。複数のハーネス間で1つのファイルを共有する前に、[サポートされている形式](/docs/agents/reference/custom-instructions-reference.md#supported-formats-and-locations)を確認してください。

### インストラクションを検証する

ルールが結果に影響を与える小さなタスクをテストします。一貫して同じハーネスとリポジトリを使用します。

1. コマンドパレット（`kb(workbench.action.showCommands)`）から**Chat: Open Customizations**を実行します。**Instructions**を選択し、ファイルがリストされていることを確認します。これにより、エージェントがルールに従っているかどうかではなく、検出されるかどうかが確認されます。
1. 新しいチャットを開始し、インストラクションを作成した会話からのガイダンスにテストが依存しないようにします。
1. プロンプトでルールを繰り返さずに、小さな変更を依頼します。APIの例では、プロジェクトの既存のパターンを使用してエンドポイントを追加するようエージェントに依頼します。
1. 利用可能な場合は、レスポンスの**References**セクションでインストラクションファイルを確認します。さらに詳細が必要な場合は、[Agent Debug Logsでリクエストを検査](/docs/agents/agent-troubleshooting/chat-debug-view.md#instructions-or-a-prompt-file-are-not-applied)します。
1. 変更内容とツールの動作を確認します。この例では、ハンドラーが追加された場所、データへのアクセス方法、エージェントが関連するテストを実行したかどうかを確認します。

結果が目標を満たしている場合は、インストラクションファイルをレビューしてコミットし、チームが使用できるようにします。満たしていない場合は、ルールをさらに追加する前に、[ファイルが検出されたか、含まれたか、または準拠されたかを特定](#troubleshoot-instructions)します。

完全な前後比較とチームへのロールアウトワークフローについては、[コードベースに合わせてAIを構成する](/docs/agents/guides/customize-copilot-guide.md)に従ってください。

## インストラクションの適用方法

スコープとアクティベーションは異なる疑問に答えるものです。スコープは、ガイダンスが利用可能な場所とそれを共有するユーザーを決定します。アクティベーションは、そのガイダンスがリクエストにいつ含まれるかを決定します。

| スコープ | 使用用途 |
|-------|------------|
| ワークスペースまたはリポジトリ | ソース管理を通じてコントリビューターと共有されるプロジェクトの規約 |
| ユーザー | ハーネスでサポートされている場所にある、プロジェクト全体にわたる個人の好み |
| Organization | サポートされているエクスペリエンス向けの一元管理されたガイダンス |

広く適用されるルールには、プロジェクトのインストラクションから始めます。コードベースの一部でのみ必要なガイダンスには、ターゲットを絞ったインストラクションを使用します。

| アクティベーション | 仕組み |
|------------|--------------|
| プロジェクト全体 | ハーネスは、そのプロジェクトのインストラクションファイルからガイダンスを含めます。 |
| ファイルパターン | `.instructions.md`ファイルは`applyTo`を使用し、Claude rulesファイルは`paths`を使用して、エージェントが操作するファイルと一致させます。 |
| タスクの関連性 | Localセッションでは、`description`によってエージェントがタスクのインストラクションファイルを読み込むかどうかを決定できます。これはパターンマッチングとは別です。 |
| 手動 | 自動検出やアクティベーションが適切でない場合に、特定のリクエスト用のガイダンスを添付します。 |

`AGENTS.md`などのインストラクションファイルは、既存のエージェントにガイダンスを提供します。[カスタムエージェント](/docs/agent-customization/custom-agents.md)を定義するものではありません。コーディング規約やプロジェクトのコンテキストではなく、再利用可能なマルチステップのワークフローには、[エージェントスキル](/docs/agent-customization/agent-skills.md)を検討してください。ワークフローを自分で作成する前に、[Customization Marketplaceで既存のスキルを探して](/docs/agent-customization/agent-skills.md#install-a-skill-from-the-customization-marketplace-preview)ください。リポジトリ固有のコマンドと規約はプロジェクトのインストラクションに保持します。

## 特定のファイルまたはタスクにインストラクションを適用する

プロジェクト全体のルールはメインのインストラクションファイルに保持します。たとえば、テストにアプリケーションコードとは異なる規約が必要な場合などには、ターゲットを絞ったガイダンスを追加します。以下の例では、Pythonのテストルールを`tests`ディレクトリにスコープ設定します。

対象のハーネスを選択した状態でAgent Customizations editorで開始します。以下のハーネス向けの手順を使用し、パスとルールをプロジェクトに合わせて調整してください。

{% tabs id="instruction-harness" %}
{% tab label="{% data variables.product.prodname_copilot_short %} or Local" %}

1. コマンドパレット（`kb(workbench.action.showCommands)`）から**Chat: Open Customizations**を実行し、**Instructions**を選択します。
1. **Workspace**の横にある`+`ボタンを選択し、`AGENTS.md`などのプロジェクト全体のファイルではなく、新しいインストラクションファイルのアクションを選択します。
1. プロンプトが表示されたら`.github/instructions`を選択し、ファイル名として`python-tests`を入力します。
1. 生成されたファイルに、次のfrontmatterとインストラクションを追加します。

インストラクションを適用するファイルを指定するには、`applyTo`を使用します。

```markdown
---
applyTo: 'tests/**/*.py'
---
# Python tests

* Reuse fixtures from `tests/conftest.py` instead of duplicating setup.
* Name tests `test_<behavior>_<condition>`.
* Run `python -m pytest <test-file>` after changing a test.
```

このパターンは`tests/test_api.py`および`tests/unit/test_api.py`に一致しますが、`src/api.py`には一致しません。これは`.github/instructions`ディレクトリではなく、ワークスペースまたはプロジェクトのルートからの相対パスです。

ファイルを直接作成する場合は、`.github/instructions/python-tests.instructions.md`として保存します。異なる言語、フォルダー、またはタスクに適用されるガイダンスには、別々の`.instructions.md`ファイルを使用します。

Localセッション`feature(local-harness)`では、タスクベースの検出のために`'Use when creating or updating Python tests.'`などの`description`を追加することもできます。この説明は`applyTo`に対する追加の制限ではありません。エージェントはパターンマッチングとは別に関連性によってファイルを読み込むことができます。

{% /tab %}
{% tab label="Claude" %}

1. **Claude**ハーネスを選択した状態でAgent Customizations editorを開き、**Instructions**を選択します。
1. **Workspace**の横にある`+`ボタンを選択し、プロジェクト全体の`CLAUDE.md`ファイルではなく、新しいrulesファイルのアクションを選択します。
1. プロンプトが表示されたら`.claude/rules`を選択し、ファイル名として`python-tests`を入力します。
1. 生成されたファイルに、次のfrontmatterとインストラクションを追加します。

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

このルールは、ネストされたディレクトリを含む`tests`以下のPythonファイルを対象とします。`paths`がない場合、ルールは汎用的に適用されます。

ファイルを直接作成する場合は、`.claude/rules/python-tests.md`として保存します。異なる言語、フォルダー、またはタスクに適用されるガイダンスには、別々のrulesファイルを使用します。

{% /tab %}
{% tab label="Codex" %}

ネストされたインストラクションの場合は、**Codex**ハーネスを選択した状態でAgent Customizations editorの**Overview**セクションを使用してファイルを要求します。

```prompt
Create or update tests/AGENTS.md with Python testing conventions.
Reuse fixtures from conftest.py, name tests test_<behavior>_<condition>,
and run python -m pytest <test-file> after changing a test.
Preserve existing guidance and do not change application code.
```

使用する前に、生成されたファイルをレビューしてください。Codexは`applyTo`や`paths`パターンではなくディレクトリの場所を使用し、これらのファイルにはYAML frontmatterは必要ありません。プロジェクト全体のインストラクションはリポジトリルートの`AGENTS.md`に保持し、ターゲットを絞ったガイダンスは関連するディレクトリに保持します。

たとえば、`tests/AGENTS.md`には以下が含まれます。

```markdown
# Python tests

* Reuse fixtures from `conftest.py` instead of duplicating setup.
* Name tests `test_<behavior>_<condition>`.
* Run `python -m pytest <test-file>` after changing a test.
```

作業ディレクトリを`tests`として新しいCodexセッションを開始します。Codexは、リポジトリルートからそのディレクトリまでのパスに沿ってインストラクションを読み込みます。エディターでテストファイルを開いても、セッションの作業ディレクトリは変更されません。

ファイルを直接作成する場合は、この例を`tests/AGENTS.md`として保存します。

{% /tab %}
{% /tabs %}

ファイルを作成した後:

1. ファイルを保存し、同じハーネスで新しいチャットを開始します。
1. 一致するディレクトリ内のテストを追加または更新するようエージェントに依頼します。
1. [含有と動作を検証](#verify-your-instructions)します。テストが命名規則とフィクスチャの規約に従っていること、およびエージェントがテストコマンドを実行することを確認します。

追加のパターンやネストされたファイルの動作については、[インストラクションのアクティベーション](/docs/agents/reference/custom-instructions-reference.md#discovery-and-activation)を参照してください。

### 1つのリクエストにインストラクションを添付する

1回限りの要件の場合は、共有ルールを作成するのではなく、プロンプトにガイダンスを記述します。

1つのリクエストで既存のインストラクションファイルを再利用するには、チャット入力で**Add Context**（`+`アイコン）を選択し、リクエストを送信する前にファイルを選択します。

## 効果的なインストラクションを書く

リポジトリ内のすべてを説明するのではなく、エージェントがプロジェクト固有の決定を下すのに役立つルールを記述します。

| 改善前 | 改善後 |
|------------|-------|
| 適切なテストを書いてください。 | `tests/conftest.py`のフィクスチャを再利用し、テストを変更した後は`python -m pytest <test-file>`を実行してください。 |
| アーキテクチャに従ってください。 | HTTPハンドラーが個別にテスト可能な状態を維持できるように、データベースアクセスは`src/repositories`に保持してください。 |
| スタイルに従ってください。 | エラーストリングを返すのではなく、`src/errors.ts`の既存のエラータイプを使用してください。 |

* **ルールは簡潔にする。** 各要件には短い記述を使用し、自明でない制約を説明します。
* **実行可能な詳細を優先する。** エージェントが使用すべきコマンド、ディレクトリ、ライブラリ、または既存の例を指定します。
* **不要なコンテキストを避ける。** フォーマッターやリンターによって強制されるルールを重複して記述しないでください。特化したガイダンスはプロジェクト全体のファイルから移動します。
* **コードとともにインストラクションを保守する。** ソース管理を通じて変更をレビューし、コマンド、アーキテクチャ、または依存関係が変更されたときにルールを更新します。
* **補足ドキュメントの参照は慎重に行う。** 相対パスと`/`区切り文字を含むMarkdownリンクを使用します。リンクがあるからといって、ドキュメントの内容がモデルに届くことが保証されるわけではありません。[参照ファイルの動作](/docs/agents/reference/custom-instructions-reference.md#reference-other-files)を確認してください。

### 競合するインストラクションを解決する

個人、リポジトリ、Organizationのガイダンス全体で共有要件の一貫性を保ちます。普遍的な優先順位に依存しないでください。[結合ルールはハーネスによって異なります](/docs/agents/reference/custom-instructions-reference.md#combine-instruction-sources)。

個人のインストラクションが特定のライブラリを要求し、リポジトリが別のライブラリを要求している場合は、競合している個人のルールを削除するか絞り込みます。埋め合わせのために別のルールを追加しないでください。競合を解決した後、新しいチャットで同じ代表的なタスクを繰り返します。

## プロジェクトと個人のインストラクションを管理する

Agent Customizations editorの**Instructions**に戻り、既存のインストラクションを見つけて編集します。個人のインストラクションを追加するには、**User**の横にある`+`を選択します。プロンプトに従ってハーネスでサポートされている名前と保存場所を指定し、ファイルを保存して、そのハーネスを使用した新しいチャットで検証します。

プロジェクト全体にわたる個人の好みにはユーザースコープを使用します。チームもそれを望んでいる場合を除き、個別のレスポンスの好みを共有プロジェクトファイルに入れないでください。場所と同期の制限については、[ユーザーのインストラクション](/docs/agents/reference/custom-instructions-reference.md#user-instructions)を参照してください。

また、関連するエージェント、スキル、ツールと並んで、[エージェントプラグイン](/docs/agent-customization/agent-plugins.md#what-plugins-provide)のルールコンポーネントとしてインストラクションを配布することもできます。サポートは選択したハーネスとプラグインの形式によって異なります。クライアント間でバンドルを共有する前に、[プラグインの互換性](/docs/agent-customization/agent-plugins.md#cross-tool-compatibility)を確認してください。

<a name="sync-local-agent-instructions-across-devices"></a>

## インストラクションの形式と設定

以下を調べるには、[カスタムインストラクションのリファレンス](/docs/agents/reference/custom-instructions-reference.md)を使用してください。

* [ファイル形式、場所、frontmatter](/docs/agents/reference/custom-instructions-reference.md#supported-formats-and-locations)
* [検出、パターン、ネストされたインストラクション](/docs/agents/reference/custom-instructions-reference.md#discovery-and-activation)
* [個人のインストラクションとSettings Sync](/docs/agents/reference/custom-instructions-reference.md#user-instructions)
* [Organizationのインストラクション](/docs/agents/reference/custom-instructions-reference.md#organization-instructions)
* [インストラクションと生成コンテンツの設定](/docs/agents/reference/custom-instructions-reference.md#settings)

## インストラクションのトラブルシューティング

ガイダンスを変更する前に、失敗の段階を特定します。

| 観察される事象 | 確認すべき事項 |
|------------------|---------------|
| Customizations editorにファイルがリストされない。 | 選択されているハーネス、ファイル名、サポートされている場所、およびセッションで変更を含むフォルダーが使用されているかどうかを確認します。 |
| ファイルは検出されるが、タスクに含まれない。 | frontmatterのエラーとアクティベーション条件を確認します。一致するファイルをテストするか、インストラクションを手動で添付します。Localの場合は、該当する[検出設定](/docs/agents/reference/custom-instructions-reference.md#local-harness-settings)を確認します。 |
| ファイルは含まれているが、結果がそれに従っていない。 | 矛盾したルールや曖昧なルールがないか確認します。1つのルールを明確にし、新しいチャットでタスクを繰り返し、実際の変更とツールの動作を比較します。 |

利用可能な場合、レスポンスの**References**セクションは、準拠しているかではなく、含まれているかどうかを確認するのに役立ちます。詳細なエビデンスについては、[インストラクションの診断](/docs/agents/agent-troubleshooting/chat-debug-view.md#instructions-or-a-prompt-file-are-not-applied)に従ってください。問題を再現する前にログ記録を準備します。

## 関連リソース

* 計画的な作成、検証、共有のワークフローについては、[コードベースに合わせてAIを構成する](/docs/agents/guides/customize-copilot-guide.md)
* 構文とハーネス固有の動作については、[カスタムインストラクションのリファレンス](/docs/agents/reference/custom-instructions-reference.md)
* インストラクション、スキル、その他のカスタマイズの使い分けについては、[エージェントカスタマイズの概念](/docs/agents/concepts/customization.md)
