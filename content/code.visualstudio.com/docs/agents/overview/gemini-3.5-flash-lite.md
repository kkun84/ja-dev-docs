---
ContentId: 7c4b8b5e-2d3f-4e8a-9b2c-1a5d6f8e9c0b
DateApproved: 11/11/2026
MetaDescription: "インラインサジェストからリモートセッションまで、VS CodeでAIのワークフロー、モデル、エージェントを選択します。"
Keywords:
- GitHub Copilot
- AI
- agents
- autonomous
- agentic
- multi-file editing
- architecture
- refactoring
- cloud sessions
- copilot cli
- third-party agents
- language models
- MCP
- plugins
- enterprise
- overview
- getting started
- free
- copilot free
- bring your own key
- BYOK
- local models
- agent harness
- continuity
- {% data variables.copilot.github_environments %}
---

# VS CodeでAIを活用した開発を行う

Visual Studio Codeでは、タスクのニーズに合わせて、必要な量のAIを利用できます。入力に応じたサジェストの取得、コード、テスト、デバッガーの横で動作するエージェントとの協業、またはAgents windowでのプロジェクトをまたいだタスクの調整を行います。作業の変化に応じてこれらのアプローチを組み合わせてください。

複数のプロバイダーからモデルを選択し、サポートされているアカウントまたは独自のAPIキーを使用して、Copilot、Claude、またはCodexのエージェントハーネスを利用します。ハーネスは、モデル周辺のツールとワークフローを提供します。カスタマイズやプラグインにより、作業に合わせてエージェントを調整できます。

連続性機能を使用すると、最初からやり直すことなく、サポートされているインターフェイス間でエージェントの作業を引き継ぐことができます。GitHub environmentsを介して自分のマシンのセッションに接続するか、ローカルホストをオンラインに維持せずにクラウドセッションを使用します。

## 開始方法を選択する

<div class="card-grid">
    <a class="card" href="/docs/agents/quickstart">
        <i class="codicon codicon-hubot" aria-hidden="true"></i>
        <div>
            <p><strong>最初のAIタスクを完了する</strong></p>
            <p>AIコーディングが初めてですか？推奨されるデフォルト設定で小さなアプリをビルドして検証し、変更内容を確認します。</p>
        </div>
    </a>
    <a class="card" href="/docs/agents/guides/overview#experienced-agent-fast-track">
        <i class="codicon codicon-tools" aria-hidden="true"></i>
        <div>
            <p><strong>AIワークフローをVS Codeに導入する</strong></p>
            <p>すでにAIコーディングツールを使用していますか？アカウントまたはモデルを接続し、エージェントハーネスを選択して、独自のレポジトリで作業します。</p>
        </div>
    </a>
</div>

* **独自のコードから開始したい場合:** [ファイルを変更せずにコードベースを探索し](/docs/agents/guides/explore-a-codebase.md)、その説明をご自身のコードと照らし合わせて検証します。
* **VS Codeが初めての場合:**まず[エディターをインストールしてワークスペースを開きます](/docs/getstarted/overview.md)。

<video src="images/agents-overview/build-with-ai-overview.mp4" title="Video overview of building with AI in VS Code, showing inline suggestions, collaboration alongside code, and task orchestration in the Agents window." autoplay loop controls muted></video>

<a name="what-you-can-do-with-ai"></a>
<a name="ways-to-work-with-agents"></a>

## 作業方法を選択する

タスクに応じて異なるエクスペリエンスを切り替え、[インターフェイス間でエージェントセッションを継続](#continue-across-interfaces-and-machines)して、中断したところから再開します。

<div class="card-grid">
    <a class="card" href="/docs/editing/ai-powered-suggestions">
        <i class="codicon codicon-edit" aria-hidden="true"></i>
        <div>
            <p><strong>支援を受けながらコードを書く</strong></p>
            <p>次に行ったほうがよい編集の提案を含め、入力時にインラインサジェストを取得します。</p>
        </div>
    </a>
    <a id="work-alongside-your-code" class="card" href="/docs/agents/run/chat-view">
        <i class="codicon codicon-comment-discussion" aria-hidden="true"></i>
        <div>
            <p><strong>コードの横で協業する</strong></p>
            <p>エディター、ターミナル、テスト、デバッガーと並行して、現在のワークスペースにフォーカスしたChat viewのエージェントと作業します。</p>
        </div>
    </a>
    <a id="delegate-and-manage-tasks" class="card" href="/docs/agents/run/agents-window">
        <i class="codicon codicon-hubot" aria-hidden="true"></i>
        <div>
            <p><strong>作業を委任して調整する</strong></p>
            <p>Agents windowでプロジェクト全体のタスクの割り当てやエージェントセッションの管理を行います。</p>
        </div>
    </a>
</div>

[エージェント](/docs/agents/concepts/agents.md)は、モデルとツールを使用して関連するコードを見つけ、変更を加え、チェックを実行します。Chat viewとAgents windowの両方でエージェントが実行されます。ユーザーは目標を設定し、作業をガイドし、結果を確認します。

定常的な作業では、プロンプトを[オートメーション](/docs/agents/run/automations.md)として保存します。スケジュールに従ってローカルで実行するか、コンピューターの電源を切っている間も継続するスケジュールまたはイベント駆動型のレポジトリ作業には、クラウドオートメーション`feature(cloud-automations)`を使用します。定期的な作業を有効にする前に、手動での実行を確認してください。

フォーカスした編集を行うには、コードから離れることなく[インラインチャット](/docs/chat/inline-chat.md)を使用します。特定のタスクの機能を比較するには、[AI機能早見表](/docs/agents/reference/ai-features-cheat-sheet.md#choose-a-feature)を使用します。

## モデル、エージェント、およびツールを選択する

最初のエージェントタスクでは、すべてのオプションを設定せずに[クイックスタートを使用します](/docs/agents/quickstart.md)。ニーズの変化に応じて、以下の選択肢を調整できます。

| 選択項目 | オプション |
|--------|---------|
| **モデル** | GitHub Copilotを通じて[複数のプロバイダーのモデル](/docs/agent-customization/language-models.md)を選択するか、独自の[APIキー(BYOK)](/docs/agent-customization/language-models.md#bring-your-own-language-model-key)またはサポートされているローカルモデルを使用します。 |
| **エージェントハーネス** | [ツールとワークフロー](/docs/agents/run/agent-harnesses.md#compare-agent-harnesses)に基づいて、Copilot、Claude、またはCodexから選択します。 |
| **アクセスと請求** | 既存のGitHub Copilotプラン、サポートされているプロバイダーのアカウント、またはAPIキーを使用します。[ハーネスの要件](/docs/agents/run/agent-harnesses.md#requirements-and-setup)を確認してください。 |
| **カスタマイズ** | [プラグイン](/docs/agent-customization/agent-plugins.md)、[プロジェクトの指示](/docs/agents/guides/customize-copilot-guide.md)、および[スキル](/docs/agent-customization/agent-skills.md)を使用してエージェントを調整します。[Model Context Protocol (MCP)サーバー](/docs/agent-customization/mcp-servers.md)を介して外部ツールを接続します。 |

## インターフェイスやマシンをまたいだ継続

継続性とは、最初からやり直すことなく、サポートされているインターフェイスやマシン間でエージェントの作業を引き継ぐことを意味します。ワークスペースと実行環境をホストに保持したまま、エージェントと対話する場所を選択します。セッションのサポート内容や要件は、ハーネスや宛先によって異なります。

| 作業を行う場所 | ここから開始 |
|------------------------|------------|
| **Copilotのアプリとデバイス間** | [GitHub environments](/docs/agents/run/remote-agent-sessions.md#github-environments) `feature(github-environments)`を使用して開発マシンを登録し、VS Code、GitHub Copilot app、Copilot CLI、GitHub.com、またはGitHub Mobileからエージェントセッションを継続します。利用できる操作はクライアントによって異なります。 |
| **管理されたクラウドコンピューティング上** | 自分のマシンの電源をオンラインに保つことなく対話型のエージェント作業を行うには、[クラウドセッション](/docs/agents/run/cloud-sandbox-sessions.md) `feature(cloud-sessions)`を使用します。既存のクラウドセッションを再度開いて会話を続行します。実行はクラウド環境で行われ、その可用性とライフタイムはサービスによって管理されます。 |
| **エディターまたはAgents window** | VS CodeでGitHub Copilot、Claude、またはCodexエージェントハーネスを使用し、[インターフェイス間でセッションを継続します](/docs/agents/run/sessions/manage-sessions.md#continue-between-the-chat-view-and-agents-window)。 |
| **別のマシンのVS Code** | [SSH](/docs/agents/run/remote-agent-sessions.md#connect-via-ssh)または[devトンネル](/docs/agents/run/remote-agent-sessions.md#connect-via-dev-tunnel)を介したVS Code固有のリモート接続を使用します。devトンネルは、[ブラウザーベースのAgents window](/docs/agents/run/remote-agent-sessions.md#use-the-agents-window-in-the-browser)もサポートしています。 |

自分のマシンで実行されるセッションの場合は、ホストを実行状態に保ち、アクセス可能な状態を維持してください。クラウドセッションでは代わりに管理されたコンピューティングを使用します。クラウドでの作業のためにクラウドセッションを開始し、そのセッションを再度開いて続行します。

独自のプライベートレポジトリを使用して、[VS Codeでクラウドエージェントタスクを開始し、Copilot CLIでそれを継続します](/docs/agents/cloud-continuity-tutorial.md) (実験的機能)。

ツールの実行場所とモデルのホスト場所は個別に選択できます。エージェントは、ホストされているプロバイダーにモデルのリクエストを送信しながら、マシン上のファイルを編集できます。

## 制御を維持する

AIは不正確なコードを作成したり、意図を誤解したりする可能性があります。コードベースにどのような変更を取り込むかを決定する責任は、常にユーザーにあります。

* **統合する前に確認する。**エージェントは、セッションフォルダーやワークツリーに直接編集内容を保存できます。変更をコミットまたはマージする前に、[差分を確認し、結果を検証します](/docs/agents/run/review-code-edits.md)。
* **アクションの制御と作業の誘導。** [権限と承認](/docs/agents/run/approvals.md)を使用して、確認が必要なアクションを決定します。[リクエストを誘導または停止する](/docs/chat/chat-overview.md#send-messages-while-a-request-is-running)ことができますが、停止しても完了したアクションや外部サービスへの変更は取り消されません。
* **分離について理解する。** Gitワークツリーはコードの変更を分離しますが、セキュリティ境界ではありません。エージェントが実行するターミナルコマンドに対するファイルシステムおよびネットワークの制限については、[プラットフォーム固有のサンドボックスオプション](/docs/agents/run/agent-sandboxing.md)を確認してください。

既存のプロジェクトでエージェントを使用する前に、[推奨されるセキュリティベースライン](/docs/agents/run/security.md#recommended-security-baseline)を確認してください。管理されたデバイスでは、組織が[エンタープライズAIポリシー](/docs/enterprise/manage-ai-settings.md)を通じて、利用可能なエージェント、モデル、およびツールを制限している場合があります。チャットにエージェントが表示されない場合は、[可用性のトラブルシューティング手順](/docs/agents/agent-troubleshooting/faq.md#agents-are-not-available-in-chat)を確認してください。

キーボード、スクリーンリーダー、およびロービジョン向けのワークフローについては、[アクセシブルビューおよびその他のアクセシビリティ機能](/docs/configure/accessibility/accessibility.md#accessible-view)の使用方法を確認してください。

## 次のステップ

* [エージェントのベストプラクティスをプロジェクトに適用します](/docs/agents/best-practices.md)。
* [品質、信頼性、およびAIクレジットの使用量を比較します](/docs/agents/guides/optimize-usage.md)。
