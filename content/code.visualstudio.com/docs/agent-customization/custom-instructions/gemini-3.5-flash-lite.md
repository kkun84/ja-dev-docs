---
ContentId: 8b4f3c21-4e02-4a89-9f15-7a8d6b5c2e91
DateApproved: 11/11/2026
MetaDescription: "VS Codeでカスタム指示を作成およびテストして、プロジェクト規則でエージェントをガイドします。"
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
# VS Codeでカスタム指示を使用する

カスタム指示を使用すると、コードを追加する場所、使用するライブラリ、実行するテストなど、プロジェクトに関する再利用可能なガイダンスをエージェントに提供できます。このガイダンスをすべてのプロンプトで繰り返すのではなくMarkdownファイルに保存し、ソース管理を通じてプロジェクトの指示を共有します。

エージェントが繰り返し見落としている1つの規則から始めます。[Agent Customizationsエディター](/docs/agent-customization/overview.md#agent-customizations-editor)で指示を作成し、さらにターゲットを絞ったガイダンスを追加する前に、新しいチャットでその効果をテストします。サポートされている場所、ファイルの構文、設定については、[カスタム指示リファレンス](/docs/agents/reference/custom-instructions-reference.md)を参照してください。

指示はモデルをガイドするものです。準拠を保証したり、テスト、コードレビュー、セキュリティ制御の代わりになったりするものではありません。入力時の[インラインサジェスチョン](/docs/editing/ai-powered-suggestions.md)には適用されません。

## プロジェクトの指示を使い始める

リポジトリのルートを開き、使用する予定の[エージェントハーネスを選択します](/docs/agents/run/agent-harnesses.md#select-a-harness)。ハーネスによって、読み取る指示ファイルが決まります。たとえば、CopilotセッションでClaudeモデルを選択しても、Claudeハーネスには切り替わりません。

最初のセットアップでは、新しいワークツリーではなく現在のフォルダーで作業し、テストセッションからコミットされていない指示にアクセスできるようにします。

### プロジェクトの指示を作成する

1. コマンドパレット(`kb(workbench.action.showCommands)`)から**Chat: Open Customizations**を実行してAgent Customizationsエディターを開き、**Instructions**タブを選択します。

1. プロジェクト指示ファイルを追加するには、**Workspace**の横にある`+`を選択し、`AGENTS.md`や`CLAUDE.md`など、ハーネス用に用意されているプロジェクト指示ファイルを選択します。エディターによってワークスペースにファイルが作成されるか、ファイルが開きます。

   リポジトリにすでにプロジェクト指示ファイルがある場合は、競合するコピーを作成せずにそのファイルを開いてください。

1. 繰り返される問題に対処するいくつかの具体的な規則を追加します。たとえば、Node.jsのAPIプロジェクトでは、次の指示を使用できます。パスとテストコマンドを、リポジトリで機能するものに置き換えてください。

   ```markdown
   # Project instructions

   * Add HTTP handlers under `src/api/routes`.
   * Keep database access in `src/repositories` so handlers remain independently testable.
   * Add or update tests for behavior changes, and run `npm test -- <test-file>` for the affected tests.
   ```

1. ファイルを保存します。これらのプロジェクト指示ファイルにフロントマターは必要ありません。

#### ファイルを直接作成する

Agent Customizationsエディターの外部でファイルを作成する場合は、ハーネスでサポートされているプロジェクト指示ファイルを使用します。以下のパスはリポジトリのルートからの相対パスです。必要に応じて、不足しているフォルダーを作成してください。

| ハーネス | プロジェクト指示ファイル |
|---------|---------------------------|
| Copilot | `.github/copilot-instructions.md`または`AGENTS.md` |
| Anthropic Claude | `CLAUDE.md` |
| OpenAI Codex | `AGENTS.md` |
| ローカル`feature(local-harness)` | `.github/copilot-instructions.md`または`AGENTS.md` |

規則を追加してファイルを保存し、以下のように検証します。`AGENTS.md`はCodex専用のファイルではなく、クロスエージェントフォーマットです。1つのファイルを複数のハーネス間で共有する前に、[サポートされている形式](/docs/agents/reference/custom-instructions-reference.md#supported-formats-and-locations)を確認してください。

### 指示を検証する

規則が結果に影響を与える小さなタスクをテストします。全体を通して同じハーネスとリポジトリを使用します。

1. コマンドパレット(`kb(workbench.action.showCommands)`)から**Chat: Open Customizations**を実行します。**Instructions**を選択し、ファイルがリストされていることを確認します。これは発見の確認であり、エージェントが規則に従っているかどうかの確認ではありません。
1. テストが指示を作成した会話のガイダンスに依存しないように、新しいチャットを開始します。
1. プロンプトで規則を繰り返すことなく、小さな変更を依頼します。APIの例では、プロジェクトの既存のパターンを使用してエンドポイントを追加するようにエージェントに依頼します。
1. 利用可能な場合は、応答の**References**セクションで指示ファイルを確認します。詳細が必要な場合は、[エージェントのデバッグログでリクエストを検査します](/docs/agents/agent-troubleshooting/chat-debug-view.md#instructions-or-a-prompt-file-are-not-applied)。
1. 変更内容とツールの動作を確認します。この例では、ハンドラーが追加された場所、データのアクセス方法、エージェントが関連するテストを実行したかどうかを確認します。

結果が目的を満たしている場合は、チームが使用できるように指示ファイルをレビューしてコミットします。満たしていない場合は、規則を追加する前に、[ファイルが検出されたか、含まれていたか、従われたかを確認します](#troubleshoot-instructions)。

変更前と変更後の完全な比較およびチームへの展開ワークフローについては、[コードベースのAIの構成](/docs/agents/guides/customize-copilot-guide.md)に従ってください。

## 指示の適用方法

スコープとアクティベーションは、異なる質問に対する答えとなります。スコープは、ガイダンスがどこで利用可能か、誰がそれを共有するかを決定します。アクティベーションは、そのガイダンスがリクエストにいつ含まれるかを決定します。

| スコープ | 用途 |
|-------|------------|
| ワークスペースまたはリポジトリ | ソース管理を通じて貢献者と共有されるプロジェクトの規則 |
| ユーザー | ハーネスでサポートされている場所における、プロジェクト横断的な個人的設定 |
| 組織 | サポートされている環境向けの、一元管理されたガイダンス |

広範囲に適用される規則については、プロジェクトの指示から始めます。コードベースの一部のみで必要なガイダンスには、ターゲットを絞った指示を使用します。

| アクティベーション | 仕組み |
|------------|--------------|
| プロジェクト全体 | ハーネスには、プロジェクト指示ファイルからのガイダンスが含まれます。 |
| ファイルパターン | `.instructions.md`ファイルは`applyTo`を使用するか、Claudeルールファイルは`paths`を使用して、エージェントが作業するファイルに一致させます。 |
| タスクの関連性 | Localセッションでは、`description`により、エージェントがタスク用の指示ファイルを読み込むかどうかを決定できます。これはパターンマッチングとは別に行われます。 |
| 手動 | 自動検出またはアクティベーションが適切でない場合に、特定のリクエストのガイダンスを添付します。 |

`AGENTS.md`などの指示ファイルは、既存のエージェントにガイダンスを提供します。[カスタムエージェント](/docs/agent-customization/custom-agents.md)を定義するものではありません。コーディング規則やプロジェクトのコンテキストではなく、再利用可能なマルチステップのワークフローについては、[エージェントスキル](/docs/agent-customization/agent-skills.md)の検討をお勧めします。ワークフローを自分で作成する前に、[カスタマイズマーケットプレイスで既存のスキルを探してください](/docs/agent-customization/agent-skills.md#install-a-skill-from-the-customization-marketplace-preview)。リポジトリ固有のコマンドと規則は、プロジェクトの指示に含めておいてください。

## 特定のファイルまたはタスクに指示を適用する

プロジェクト全体の規則は、メインの指示ファイルに保持します。テストにアプリケーションコードとは異なる規則が必要な場合などに、ターゲットを絞ったガイダンスを追加します。次の例では、Pythonのテスト規則のスコープを`tests`ディレクトリに限定しています。

目的のハーネスを選択した状態で、Agent Customizationsエディターから始めます。以下のハーネスの手順に従ってから、パスと規則をプロジェクトに合わせて調整します。

{% tabs id="instruction-harness" %} {% tab label="{% data variables.product.prodname_copilot_short %}またはLocal" %}

1. コマンドパレット(`kb(workbench.action.showCommands)`)から**Chat: Open Customizations**を実行し、**Instructions**を選択します。
1. `AGENTS.md`のようなプロジェクト全体のファイルではなく、**Workspace**の横にある`+`ボタンを選択し、新しい指示ファイルのアクションを選択します。
1. プロンプトが表示されたら`.github/instructions`を選択し、ファイル名として`python-tests`を入力します。
1. 生成されたファイルに、次のフロントマターと指示を追加します。

指示を適用するファイルを指定するには`applyTo`を使用します。

```markdown
---
applyTo: 'tests/**/*.py'
---
# Python tests

* Reuse fixtures from `tests/conftest.py` instead of duplicating setup.
* Name tests `test_<behavior>_<condition>`.
* Run `python -m pytest <test-file>` after changing a test.
```

パターンは`tests/test_api.py`および`tests/unit/test_api.py`に一致しますが、`src/api.py`には一致しません。これは`.github/instructions`ディレクトリではなく、ワークスペースまたはプロジェクトのルートからの相対パスになります。

ファイルを直接作成する場合は、`.github/instructions/python-tests.instructions.md`として保存します。異なる言語、フォルダー、またはタスクに適用されるガイダンスには、個別の`.instructions.md`ファイルを使用します。

Localセッション`feature(local-harness)`では、タスクベースの検出のために、`'Use when creating or updating Python tests.'`などの`description`を追加することもできます。説明は`applyTo`に対する追加の制限ではありません。エージェントは、パターンマッチングとは別に、関連性に基づいてファイルを読み込むことができます。

{% /tab %}
{% tab label="Claude" %}

1. **Claude**ハーネスを選択した状態でAgent Customizationsエディターを開き、**Instructions**を選択します。
1. プロジェクト全体の`CLAUDE.md`ファイルではなく、**Workspace**の横にある`+`ボタンを選択し、新しいルールファイルのアクションを選択します。
1. プロンプトが表示されたら`.claude/rules`を選択し、ファイル名として`python-tests`を入力します。
1. 生成されたファイルに、次のフロントマターと指示を追加します。

ルールを適用するファイルパターンをリストするには`paths`を使用します。パターンはプロジェクトのルートからの相対パスです。

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

ルールは、ネストされたディレクトリを含め、`tests`配下のPythonファイルをターゲットにします。`paths`がない場合、ルールは一般的に適用されます。

ファイルを直接作成する場合は、`.claude/rules/python-tests.md`として保存します。異なる言語、フォルダー、またはタスクに適用されるガイダンスには、個別のルールファイルを使用します。

{% /tab %}
{% tab label="Codex" %}

ネストされた指示の場合は、**Codex**ハーネスを選択した状態のAgent Customizationsエディターの**Overview**セクションを使用してファイルをリクエストします。

```prompt
Create or update tests/AGENTS.md with Python testing conventions.
Reuse fixtures from conftest.py, name tests test_<behavior>_<condition>,
and run python -m pytest <test-file> after changing a test.
Preserve existing guidance and do not change application code.
```

使用する前に生成されたファイルをレビューします。Codexは`applyTo`や`paths`パターンではなくディレクトリの場所を使用し、これらのファイルにはYAMLフロントマターは必要ありません。プロジェクト全体の指示はリポジトリルートの`AGENTS.md`に保持し、ターゲットを絞ったガイダンスは該当するディレクトリに保持します。

たとえば、`tests/AGENTS.md`には以下が含まれます。

```markdown
# Python tests

* Reuse fixtures from `conftest.py` instead of duplicating setup.
* Name tests `test_<behavior>_<condition>`.
* Run `python -m pytest <test-file>` after changing a test.
```

`tests`を作業ディレクトリとして新しいCodexセッションを開始します。Codexは、リポジトリルートからそのディレクトリまでのパスに沿って指示を読み込みます。エディターでテストファイルを開いても、セッションの作業ディレクトリは変更されません。

ファイルを直接作成する場合は、例を`tests/AGENTS.md`として保存します。

{% /tab %}
{% /tabs %}

ファイルを作成した後、

1. 保存して、同じハーネスで新しいチャットを開始します。
1. 一致するディレクトリ内のテストを追加または更新するようにエージェントに依頼します。
1. [包含と動作を検証します](#verify-your-instructions)。テストが命名規則とフィクスチャ規則に従っていること、およびエージェントがテストコマンドを実行することを確認します。

その他のパターンとネストされたファイルの動作については、[指示のアクティベーション](/docs/agents/reference/custom-instructions-reference.md#discovery-and-activation)を参照してください。

### 1つのリクエストに指示を添付する

1回限りの要件については、共有ルールを作成するのではなく、プロンプトにガイダンスを記述します。

1つのリクエストで既存の指示ファイルを再利用するには、チャット入力の**Add Context** (`+`アイコン)を選択し、リクエストを送信する前にファイルを選択します。

## 効果的な指示を書く

リポジトリ内のすべてを説明するのではなく、エージェントがプロジェクト固有の決定を下すのに役立つルールを書きます。

| 次のようにする代わりに | 次のように書きます |
|------------|-------|
| 良いテストを書きなさい。 | `tests/conftest.py`のフィクスチャを再利用し、テストを変更した後に`python -m pytest <test-file>`を実行します。 |
| アーキテクチャに従ってください。 | HTTPハンドラーが個別にテスト可能な状態を維持できるように、データベースアクセスを`src/repositories`内に保持します。 |
| スタイルに従ってください。 | エラー文字列を返すのではなく、`src/errors.ts`の既存のエラー型を使用します。 |

* **規則を簡潔に保ちます。**各要件に対して短いステートメントを使用し、自明ではない制約については説明を追加します。
* **実行可能な詳細を優先します。**エージェントが使用すべきコマンド、ディレクトリ、ライブラリ、または既存の例を指定します。
* **不要なコンテキストを避けます。**フォーマッターやリンターによって強制されるルールを重複させないでください。プロジェクト全体のファイルから特殊なガイダンスを移動します。
* **コードとともに指示を維持します。**ソース管理を通じて変更をレビューし、コマンド、アーキテクチャ、または依存関係が変更されたときにルールを更新します。
* **サポートドキュメントは注意して参照してください。**相対パスと`/`区切り文字を使用したMarkdownリンクを使用します。リンクは、ドキュメントの内容がモデルに届くことを保証するものではありません。[参照ファイルの動作](/docs/agents/reference/custom-instructions-reference.md#reference-other-files)を確認してください。

### 競合する指示を解決する

個人、リポジトリ、組織のガイダンス間で共有要件を一貫させます。普遍的な優先順位に依存しないでください。[組み合わせ規則はハーネスによって異なります](/docs/agents/reference/custom-instructions-reference.md#combine-instruction-sources)。

個人の指示が1つのライブラリを要求し、リポジトリが別のライブラリを要求している場合は、競合する個人のルールを削除するか絞り込みます。補うための別のルールを追加しないでください。競合を解決した後に、新しいチャットで同じ代表的なタスクを繰り返します。

## プロジェクトと個人の指示を管理する

Agent Customizationsエディターの**Instructions**に戻って、既存の指示を見つけて編集します。個人の指示を追加するには、**User**の横にある`+`を選択します。ハーネスでサポートされている名前と保存場所のプロンプトに従い、ファイルを保存して、そのハーネスを使用した新しいチャットで検証します。

プロジェクト横断的な個人的設定にはユーザー範囲を使用します。チームが望む場合を除き、共有プロジェクトファイルに個人の応答設定を含めないでください。場所と同期の制限については、[ユーザー指示](/docs/agents/reference/custom-instructions-reference.md#user-instructions)を参照してください。

関連するエージェント、スキル、またはツールと共に、[エージェントプラグイン](/docs/agent-customization/agent-plugins.md#what-plugins-provide)のルールコンポーネントとして指示を配布することもできます。サポートは、選択したハーネスとプラグインの形式によって異なります。バンドルをクライアント間で共有する前に、[プラグインの互換性](/docs/agent-customization/agent-plugins.md#cross-tool-compatibility)を確認してください。

<a name="sync-local-agent-instructions-across-devices"></a>

## 指示の形式と設定

[カスタム指示リファレンス](/docs/agents/reference/custom-instructions-reference.md)を使用して、以下を調べます。

* [ファイル形式、場所、フロントマター](/docs/agents/reference/custom-instructions-reference.md#supported-formats-and-locations)。
* [発見、パターン、ネストされた指示](/docs/agents/reference/custom-instructions-reference.md#discovery-and-activation)。
* [個人の指示とSettings Sync](/docs/agents/reference/custom-instructions-reference.md#user-instructions)。
* [組織の指示](/docs/agents/reference/custom-instructions-reference.md#organization-instructions)。
* [指示と生成されたコンテンツの設定](/docs/agents/reference/custom-instructions-reference.md#settings)。

## 指示のトラブルシューティング

ガイダンスを変更する前に、障害の段階を特定します。

| 確認される現象 | 確認事項 |
|------------------|---------------|
| ファイルがCustomizationsエディターにリストされない。 | 選択されたハーネス、ファイル名、サポートされている場所、およびセッションが変更を含むフォルダーを使用しているかどうかを確認します。 |
| ファイルは検出されるが、タスクに含まれない。 | フロントマターのエラーとアクティベーション条件を確認します。一致するファイルをテストするか、指示を手動で添付します。Localの場合は、該当する[検出設定](/docs/agents/reference/custom-instructions-reference.md#local-harness-settings)を確認してください。 |
| ファイルは含まれるが、結果がそれに従わない。 | 矛盾したルールや曖昧なルールがないか確認します。1つのルールを明確にし、新しいチャットでタスクを繰り返して、実際の変更点とツールの動作を比較します。 |

利用可能な場合の応答の**References**セクションは、コンプライアンスではなく包含の確認に役立ちます。詳細な証拠については、[指示の診断](/docs/agents/agent-troubleshooting/chat-debug-view.md#instructions-or-a-prompt-file-are-not-applied)に従ってください。問題を再現する前にロギングを準備します。

## 関連リソース

* 測定された作成、検証、共有ワークフローについては、[コードベースのAIの構成](/docs/agents/guides/customize-copilot-guide.md)を参照してください。
* 構文とハーネス固有の動作については、[カスタム指示リファレンス](/docs/agents/reference/custom-instructions-reference.md)を参照してください。
* 指示、スキル、その他のカスタマイズの中から選択するには、[エージェントのカスタマイズの概念](/docs/agents/concepts/customization.md)を参照してください。
