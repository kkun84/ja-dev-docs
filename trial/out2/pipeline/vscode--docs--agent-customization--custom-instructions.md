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

カスタム指示を使用すると、コードを追加する場所、使用するライブラリ、実行するテストなど、プロジェクトに関する再利用可能なガイダンスをエージェントに提供できます。このガイダンスをすべてのプロンプトで繰り返すのではなく、Markdownファイルに保存し、ソース管理を通じてプロジェクトの指示を共有します。

エージェントが繰り返し見落としている1つの規約から始めます。[Agent Customizationsエディター](/docs/agent-customization/overview.md#agent-customizations-editor)で指示を作成し、よりターゲットを絞ったガイダンスを追加する前に、新しいチャットでその効果をテストします。サポートされている場所、ファイルの構文、および設定については、[カスタム指示リファレンス](/docs/agents/reference/custom-instructions-reference.md)を参照してください。

指示はモデルをガイドするものです。コンプライアンスを保証するものではなく、テスト、コードレビュー、セキュリティ制御の代わりにもなりません。入力時の[インラインサジェスチョン](/docs/editing/ai-powered-suggestions.md)には適用されません。

## プロジェクト指示の概要

リポジトリのルートを開き、使用する予定の[エージェントハーネスを選択します](/docs/agents/run/agent-harnesses.md#select-a-harness)。どの指示ファイルを読み取るかは、ハーネスによって決まります。たとえば、{% data variables.product.prodname_copilot_short %}セッションでClaudeモデルを選択しても、Claudeハーネスには切り替わりません。

最初のセットアップでは、テストセッションからコミットされていない指示にアクセスできるようにするため、新しいワークツリーではなく現在のフォルダーで作業します。

### プロジェクト指示の作成

1. コマンドパレット（`kb(workbench.action.showCommands)`）から **Chat: Open Customizations** を実行してAgent Customizationsエディターを開き、**Instructions** タブを選択します。

1. プロジェクト指示ファイルを追加するには、**Workspace** の横にある `+` を選択し、`AGENTS.md` や `CLAUDE.md` など、ハーネス用に提示されたプロジェクト指示ファイルを選択します。エディターによってワークスペース内にファイルが作成またはオープンされます。

   リポジトリにすでにプロジェクト指示ファイルが存在する場合は、競合するコピーを作成するのではなく、既存のファイルを開いてください。

1. 繰り返される問題に対処するいくつかの具体的なルールを追加します。たとえば、Node.jsのAPIプロジェクトでは、次の指示を使用する場合があります。パスとテストコマンドを、リポジトリで機能するものに置き換えてください。

   ```markdown
   # Project instructions

   * Add HTTP handlers under `src/api/routes`.
   * Keep database access in `src/repositories` so handlers remain independently testable.
   * Add or update tests for behavior changes, and run `npm test -- <test-file>` for the affected tests.
   ```

1. ファイルを保存します。これらのプロジェクト指示ファイルにフロントマターは必要ありません。

#### ファイルを直接作成する

Agent Customizationsエディター以外でファイルを作成したい場合は、ハーネスでサポートされているプロジェクト指示ファイルを使用します。以下のパスはリポジトリのルートからの相対パスです。必要に応じて存在しないフォルダーを作成してください。

| ハーネス | プロジェクト指示ファイル |
|---------|---------------------------|
| {% data variables.product.prodname_copilot_short %} | `.github/copilot-instructions.md` または `AGENTS.md` |
| {% data variables.product.prodname_anthropic_claude %} | `CLAUDE.md` |
| {% data variables.product.prodname_openai_codex %} | `AGENTS.md` |
| ローカル `feature(local-harness)` | `.github/copilot-instructions.md` または `AGENTS.md` |

ルールを追加してファイルを保存し、以下で説明するように検証します。`AGENTS.md` はクロスエージェントのフォーマットであり、Codex専用のファイルではありません。1つのファイルを複数のハーネス間で共有する前に、[サポートされているフォーマット](/docs/agents/reference/custom-instructions-reference.md#supported-formats-and-locations)を参照してください。

### 指示の検証

ルールが結果に影響を与える小さなタスクをテストします。最初から最後まで同じハーネスとリポジトリを使用します。

1. コマンドパレット（`kb(workbench.action.showCommands)`）から **Chat: Open Customizations** を実行します。**Instructions** を選択し、ファイルがリストされていることを確認します。これは発見の確認であり、エージェントがルールに従っているかどうかの確認ではありません。
1. 指示を作成した会話のガイダンスにテストが依存しないように、新しいチャットを開始します。
1. プロンプトでルールを繰り返さずに、小さな変更を依頼します。APIの例であれば、プロジェクトの既存のパターンを使用してエンドポイントを追加するようにエージェントに依頼します。
1. 利用可能な場合は、レスポンスの **References** セクションで指示ファイルを確認します。詳細が必要な場合は、[Agent Debug Logsでリクエストを検査します](/docs/agents/agent-troubleshooting/chat-debug-view.md#instructions-or-a-prompt-file-are-not-applied)。
1. 変更内容とツールの動作を確認します。例の場合は、ハンドラーが追加された場所、データのアクセス方法、およびエージェントが関連するテストを実行したかどうかを確認します。

結果が目標を満たしている場合は、チームが使用できるように指示ファイルをレビューしてコミットします。満たしていない場合は、ルールを追加する前に、[ファイルが発見されたか、含まれていたか、従われたかを確認します](#troubleshoot-instructions)。

完全な変更前後の比較とチームへの展開ワークフローについては、[コードベース向けAIの設定](/docs/agents/guides/customize-copilot-guide.md)に従ってください。

## 指示の適用方法

スコープとアクティベーションは異なる質問に答えるものです。スコープによって、ガイダンスを利用できる場所とそれを共有するユーザーが決まります。アクティベーションによって、そのガイダンスがリクエストにいつ含まれるかが決まります。

| スコープ | 用途 |
|-------|------------|
| ワークスペースまたはリポジトリ | ソース管理を通じてコントリビューターと共有されるプロジェクト規約 |
| ユーザー | ハーネスでサポートされている場所における、プロジェクトをまたいだ個人的な設定 |
| 組織 | サポートされているエクスペリエンス向けの一元管理されたガイダンス |

幅広く適用されるルールには、プロジェクト指示から始めます。コードベースの一部のみで必要なガイダンスには、ターゲットを絞った指示を使用します。

| アクティベーション | 動作の仕組み |
|------------|--------------|
| プロジェクト全体 | ハーネスには、そのプロジェクト指示ファイルからのガイダンスが含まれます。 |
| ファイルパターン | `.instructions.md` ファイルでは `applyTo` を使用するか、Claudeルールファイルでは `paths` を使用して、エージェントが操作するファイルに一致させます。 |
| タスクの関連性 | ローカルセッションでは、`description` により、エージェントがタスクの指示ファイルを読み取るかどうかを決定できます。これはパターンマッチングとは別です。 |
| 手動 | 自動的な発見やアクティベーションが適切ではない特定のリクエストに対して、ガイダンスを添付します。 |

`AGENTS.md` などの指示ファイルは、既存のエージェントにガイダンスを提供します。[カスタムエージェント](/docs/agent-customization/custom-agents.md)を定義するものではありません。コーディング規約やプロジェクトコンテキストではなく、再利用可能な複数ステップのワークフローの場合は、[エージェントスキル](/docs/agent-customization/agent-skills.md)を検討してください。自分でワークフローを作成する前に、[カスタマイズマーケットプレイスで既存のスキルを探します](/docs/agent-customization/agent-skills.md#install-a-skill-from-the-customization-marketplace-preview)。リポジトリ固有のコマンドと規約は、プロジェクト指示に記述してください。

## 特定のファイルやタスクへの指示の適用

プロジェクト全体のルールは、メインの指示ファイルに記述します。たとえば、テストにアプリケーションコードとは異なる規約が必要な場合などは、ターゲットを絞ったガイダンスを追加します。次の例では、Pythonのテストルールを `tests` ディレクトリに限定しています。

目的のハーネスを選択した状態で、Agent Customizationsエディターから始めます。以下のハーネスの手順に従ってから、パスとルールをプロジェクトに合わせて調整します。

{% tabs id="instruction-harness" %}
{% tab label="{% data variables.product.prodname_copilot_short %} or Local" %}

1. コマンドパレット（`kb(workbench.action.showCommands)`）から **Chat: Open Customizations** を実行し、**Instructions** を選択します。
1. **Workspace** の横にある `+` ボタンを選択し、プロジェクト全体の設定ファイル（`AGENTS.md` など）ではなく、新しい指示ファイルを作成するアクションを選択します。
1. プロンプトが表示されたら `.github/instructions` を選択し、ファイル名として `python-tests` を入力します。
1. 生成されたファイルに、次のフロントマットと指示を追加します。

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

ローカルセッション `feature(local-harness)` では、タスクベースの発見のために、`'Use when creating or updating Python tests.'` などの `description` を追加することもできます。説明は `applyTo` に対する追加の制限ではありません。エージェントは、パターンマッチングとは別に、関連性に基づいてファイルを読み込むことができます。

{% /tab %}
{% tab label="Claude" %}

1. **Claude** ハーネスを選択した状態でAgent Customizationsエディターを開き、**Instructions** を選択します。
1. **Workspace** の横にある `+` ボタンを選択し、プロジェクト全体の `CLAUDE.md` ファイルではなく、新しいルールファイルを作成するアクションを選択します。
1. プロンプトが表示されたら `.claude/rules` を選択し、ファイル名として `python-tests` を入力します。
1. 生成されたファイルに、次のフロントマットと指示を追加します。

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

このルールは、ネストされたディレクトリを含め、`tests` 配下のPythonファイルを対象としています。`paths` がない場合、ルールは全般的に適用されます。

ファイルを直接作成したい場合は、`.claude/rules/python-tests.md` として保存します。異なる言語、フォルダー、またはタスクに適用されるガイダンスには、個別のルールファイルを使用します。

{% /tab %}
{% tab label="Codex" %}

ネストされた指示の場合は、**Codex** ハーネスを選択した状態でAgent Customizationsエディターの **Overview** セクションを使用して、ファイルの作成を要求します。

```prompt
Create or update tests/AGENTS.md with Python testing conventions.
Reuse fixtures from conftest.py, name tests test_<behavior>_<condition>,
and run python -m pytest <test-file> after changing a test.
Preserve existing guidance and do not change application code.
```

使用する前に生成されたファイルをレビューします。Codexでは `applyTo` や `paths` のパターンの代わりにディレクトリの場所を使用するため、これらのファイルにYAMLフロントマターは必要ありません。プロジェクト全体の指示はリポジトリルートの `AGENTS.md` に保持し、ターゲットを絞ったガイダンスは該当するディレクトリに保持します。

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

ファイルを作成した後：

1. ファイルを保存し、同じハーネスで新しいチャットを開始します。
2. 一致するディレクトリ内のテストを追加または更新するようにエージェントに依頼します。
3. [包含と動作を検証します](#verify-your-instructions)。テストが命名規則とフィクスチャ規約に従っていること、およびエージェントがテストコマンドを実行していることを確認します。

追加のパターンやネストされたファイルの動作については、[指示のアクティベーション](/docs/agents/reference/custom-instructions-reference.md#discovery-and-activation)を参照してください。

### 1つのリクエストに指示を添付する

1回限りの要件については、共有ルールを作成する代わりに、プロンプトにガイダンスを記述します。

1つのリクエストのために既存の指示ファイルを再利用するには、チャット入力欄にある **Add Context**（`+` アイコン）を選択し、リクエストを送信する前にファイルを選択します。

## 効果的な指示の記述

リポジトリ内のすべてを説明するのではなく、エージェントがプロジェクト固有の決定を下しやすくなるルールを記述します。

| ❌ 避けるべき記述 | ⭕ 推奨される記述 |
|------------|-------|
| 良いテストを書く。 | `tests/conftest.py` からフィクスチャを再利用し、テストを変更した後に `python -m pytest <test-file>` を実行する。 |
| アーキテクチャに従う。 | HTTPハンドラーが独立してテスト可能な状態を維持できるように、データベースアクセスは `src/repositories` に留める。 |
| スタイルに従う。 | エラー文字列を返すのではなく、`src/errors.ts` 内の既存のエラー型を使用する。 |

* **ルールを簡潔に保つ。** 各要件に対して短い文を使用し、自明ではない制約について説明します。
* **実行可能な詳細を優先する。** エージェントが使用すべきコマンド、ディレクトリ、ライブラリ、または既存の例を指定します。
* **不要なコンテキストを避ける。** フォーマッターやリンターによって強制されるルールを重複させないでください。プロジェクト全体の設定ファイルから特殊なガイダンスを移動させます。
* **コードとともに指示を維持する。** ソース管理を通じて変更をレビューし、コマンド、アーキテクチャ、または依存関係が変更されたときにルールを更新します。
* **サポートドキュメントを慎重に参照する。** 相対パスと `/` 区切り文字を使用したMarkdownリンクを使用します。リンクがあるからといって、ドキュメントの内容がモデルに届くことが保証されるわけではありません。[参照されたファイルの動作](/docs/agents/reference/custom-instructions-reference.md#reference-other-files)を確認してください。

### 矛盾する指示の解決

共有要件は、個人的な設定、リポジトリ、組織のガイダンス間で一貫性を保ちます。普遍的な優先順位の順序に依存しないでください：[組み合わせのルールはハーネスによって異なります](/docs/agents/reference/custom-instructions-reference.md#combine-instruction-sources)。

個人の指示で1つのライブラリが要求され、リポジトリで別のライブラリが必要とされる場合は、矛盾する個人的なルールを削除するか絞り込みます。補うための別のルールを追加しないでください。競合を解決した後、新しいチャットで同じ代表的なタスクを繰り返します。

## プロジェクト指示と個人指示の管理

既存の指示を見つけて編集するには、Agent Customizationsエディターの **Instructions** に戻ります。個人指示を追加するには、**User** の横にある `+` を選択します。ハーネスでサポートされている名前と保存場所のプロンプトに従い、ファイルを保存し、そのハーネスを使用した新しいチャットで検証します。

プロジェクトをまたいだ個人的な設定には、ユーザースコープを使用します。チームも望んでいない限り、個人のレスポンス設定を共有のプロジェクトファイルに入れないでください。場所と同期の制限については、[個人指示](/docs/agents/reference/custom-instructions-reference.md#user-instructions)を参照してください。

関連するエージェント、スキル、ツールとともに、[エージェントプラグイン](/docs/agent-customization/agent-plugins.md#what-plugins-provide)内のルールコンポーネントとして指示を配布することもできます。サポートは、選択されたハーネスとプラグインのフォーマットによって異なります。クライアント間でバンドルを共有する前に、[プラグインの互換性](/docs/agent-customization/agent-plugins.md#cross-tool-compatibility)を確認してください。

<a name="sync-local-agent-instructions-across-devices"></a>

## 指示のフォーマットと設定

[カスタム指示リファレンス](/docs/agents/reference/custom-instructions-reference.md)を使用して、以下を調べます。

* [ファイル形式、場所、フロントマター](/docs/agents/reference/custom-instructions-reference.md#supported-formats-and-locations)。
* [発見、パターン、ネストされた指示](/docs/agents/reference/custom-instructions-reference.md#discovery-and-activation)。
* [個人指示と設定の同期](/docs/agents/reference/custom-instructions-reference.md#user-instructions)。
* [組織の指示](/docs/agents/reference/custom-instructions-reference.md#organization-instructions)。
* [指示と生成されたコンテンツの設定](/docs/agents/reference/custom-instructions-reference.md#settings)。

## 指示のトラブルシューティング

ガイダンスを変更する前に、失敗の段階を特定します。

| 発生している現象 | 確認すべきこと |
|------------------|---------------|
| ファイルがCustomizationsエディターに表示されない。 | 選択されたハーネス、ファイル名、サポートされている場所、およびセッションが変更内容を含むフォルダーを使用しているかどうかを確認します。 |
| ファイルが発見されているが、タスクに含まれていない。 | フロントマターのエラーとアクティベーション条件を確認します。一致するファイルをテストするか、指示を手動で添付します。ローカルの場合は、該当する[発見設定](/docs/agents/reference/custom-instructions-reference.md#local-harness-settings)を確認します。 |
| ファイルが含まれているが、結果がそれに従っていない。 | 矛盾しているルールや曖昧なルールがないか確認します。1つのルールを明確にし、新しいチャットでタスクを繰り返し、実際の変更とツールの動作を比較します。 |

利用可能な場合、レスポンスの **References** セクションは、コンプライアンスではなく包含の確認に役立ちます。詳細な証拠については、[指示の診断](/docs/agents/agent-troubleshooting/chat-debug-view.md#instructions-or-a-prompt-file-are-not-applied)に従ってください。問題の再現前にロギングを準備してください。

## 関連リソース

* 測定された作成、検証、共有ワークフローについては、[コードベース向けAIの設定](/docs/agents/guides/customize-copilot-guide.md)を参照してください。
* 構文とハーネス固有の動作については、[カスタム指示リファレンス](/docs/agents/reference/custom-instructions-reference.md)を参照してください。
* 指示、スキル、その他のカスタマイズの中から選択するには、[エージェントのカスタマイズの概念](/docs/agents/concepts/customization.md)を参照してください。
