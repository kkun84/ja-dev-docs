---
ContentId: 7c4b8b5e-2d3f-4e8a-9b2c-1a5d6f8e9c0b
DateApproved: 11/11/2026
MetaDescription: "インラインサジェストからリモートセッションに至るまで、VS CodeでAIワークフロー、モデル、およびエージェントを選択します。"
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

Visual Studio Codeでは、タスクに必要なだけのAIを自由度高く活用できます。入力に応じたサジェストの取得、コード・テスト・デバッガーの横で動作するエージェントとの連携、またはAgents windowでのプロジェクトをまたいだタスクの調整が可能です。作業の進捗に合わせて、これらのアプローチを組み合わせて使用します。

複数のプロバイダーからモデルを選択し、サポートされているアカウントまたは自身のAPIキーを使用して、Copilot、Claude、またはCodexのエージェントハーネスを利用します。ハーネスは、モデルを囲むツールやワークフローを提供します。カスタマイズやプラグインを活用することで、作業に合わせてエージェントを調整できます。

継続性機能により、最初からやり直すことなく、サポートされているインターフェイス間でエージェントの作業を引き継ぐことができます。GitHub environmentsを通じて自分のマシンのセッションに接続するか、ローカルホストをオンラインに維持せずにクラウドセッションを使用します。

## 開始方法を選ぶ

<div class="card-grid">
    <a class="card" href="/docs/agents/quickstart">
        <i class="codicon codicon-hubot" aria-hidden="true"></i>
        <div>
            <p><strong>初めてのAIタスクを完了する</strong></p>
            <p>AIコーディングは初めてですか？推奨されるデフォルト設定で小さなアプリを構築・検証し、変更内容を確認します。</p>
        </div>
    </a>
    <a class="card" href="/docs/agents/guides/overview#experienced-agent-fast-track">
        <i class="codicon codicon-tools" aria-hidden="true"></i>
        <div>
            <p><strong>AIワークフローをVS Codeに導入する</strong></p>
            <p>すでにAIコーディングツールを使用していますか？アカウントやモデルを接続し、エージェントハーネスを選択して、自身のリポジトリで作業を行います。</p>
        </div>
    </a>
</div>

* **自身のコードから始めたい場合:** [ファイルを変更せずにコードベースを探索する](/docs/agents/guides/explore-a-codebase.md)を行ってから、コードに対して説明を検証します。
* **VS Codeを初めて使用する場合:**まず[エディターをインストールしてワークスペースを開きます](/docs/getstarted/overview.md)。

<video src="images/agents-overview/build-with-ai-overview.mp4" title="Video overview of building with AI in VS Code, showing inline suggestions, collaboration alongside code, and task orchestration in the Agents window." autoplay loop controls muted></video>

<a name="what-you-can-do-with-ai"></a>
<a name="ways-to-work-with-agents"></a>

## 作業方法を選ぶ

タスクに応じて異なるエクスペリエンスを切り替え、[インターフェイス間でエージェントセッションを継続する](#continue-across-interfaces-and-machines)ことで、中断したところから再開できます。

<div class="card-grid">
    <a class="card" href="/docs/editing/ai-powered-suggestions">
        <i class="codicon codicon-edit" aria-hidden="true"></i>
        <div>
            <p><strong>補助を受けながらコードを書く</strong></p>
            <p>次の編集の提案を含め、入力に応じたインラインサジェストを取得します。</p>
        </div>
    </a>
    <a id="work-alongside-your-code" class="card" href="/docs/agents/run/chat-view">
        <i class="codicon codicon-comment-discussion" aria-hidden="true"></i>
        <div>
            <p><strong>コードの横で連携する</strong></p>
            <p>エディター、ターミナル、テスト、デバッガーの横にある現在のワークスペースに焦点を当てたChat view内のエージェントと作業します。</p>
        </div>
    </a>
    <a id="delegate-and-manage-tasks" class="card" href="/docs/agents/run/agents-window">
        <i class="codicon codicon-hubot" aria-hidden="true"></i>
        <div>
            <p><strong>作業を委任し調整する</strong></p>
            <p>Agents windowでタスクを割り当て、プロジェクトをまたいでエージェントセッションを管理します。</p>
        </div>
    </a>
</div>

[エージェント](/docs/agents/concepts/agents.md)は、モデルとツールを使用して関連するコードの検索、変更の適用、チェックの実行を行います。Chat viewとAgents windowの両方でエージェントが実行されます。あなたが目標を設定し、作業を誘導し、結果を確認します。

定常的な作業では、プロンプトを[自動化](/docs/agents/run/automations.md)として保存します。スケジュールに従ってローカルで実行するか、コンピューターの電源がオフの間も継続するスケジュールまたはイベントトリガーによるリポジトリ作業のためにクラウド自動化`feature(cloud-automations)`を使用します。定期的な作業を有効にする前に、手動での実行を確認してください。

集中的な編集を行うには、コードを離れることなく[インラインチャット](/docs/chat/inline-chat.md)を使用します。特定のタスクの機能を比較するには、[AI機能チートシート](/docs/agents/reference/ai-features-cheat-sheet.md#choose-a-feature)を使用します。

## モデル、エージェント、およびツールを選ぶ

初めてのエージェントタスクでは、すべてのオプションを設定せずに[クイックスタートを使用する](/docs/agents/quickstart.md)ことができます。ニーズの変化に応じて、以下の選択肢を適宜調整できます。

| 選択項目 | オプション |
|--------|---------|
| **モデル** | GitHub Copilotを通じて[複数のプロバイダーのモデル](/docs/agent-customization/language-models.md)を選択するか、独自の[APIキー(BYOK)](/docs/agent-customization/language-models.md#bring-your-own-language-model-key)またはサポートされているローカルモデルを使用します。決定に迷った場合は、[タスク用のモデルを比較して選択する](/docs/agents/guides/choose-a-model.md)を参照してください。 |
| **エージェントハーネス** | [ツールとワークフロー](/docs/agents/run/agent-harnesses.md#compare-agent-harnesses)に基づいて、Copilot、Claude、またはCodexから選択します。 |
| **アクセスと課金** | 既存のGitHub Copilotプラン、サポートされているプロバイダーのアカウント、またはAPIキーを使用します。[ハーネスの要件](/docs/agents/run/agent-harnesses.md#requirements-and-setup)を確認してください。 |
| **カスタマイズ** | [プラグイン](/docs/agent-customization/agent-plugins.md)、[プロジェクトの指示](/docs/agents/guides/customize-copilot-guide.md)、[スキル](/docs/agent-customization/agent-skills.md)を使用してエージェントをカスタマイズします。[Model Context Protocol (MCP)サーバー](/docs/agent-customization/mcp-servers.md)を通じて外部ツールを接続します。 |

## インターフェイスやマシンをまたいだ継続性

継続性とは、最初からやり直すことなく、サポートされているインターフェイスやマシンをまたいでエージェントの作業を引き継ぐことを意味します。ワークスペースと実行環境をホスト側に維持したまま、エージェントと対話する場所を選択できます。セッションのサポート状況や要件は、ハーネスや接続先によって異なります。

| 作業したい場所 | ここから始める |
|------------------------|------------|
| **Copilotのアプリやデバイスをまたいで** | [GitHub environments](/docs/agents/run/remote-agent-sessions.md#github-environments) `feature(github-environments)`を使用して開発用マシンを登録し、VS Code、GitHub Copilot app、Copilot CLI、GitHub.com、またはGitHub Mobileからエージェントセッションを継続します。利用可能なアクションはクライアントによって異なります。 |
| **マネージドクラウドコンピュート上で** | 自分のマシンをオンラインに維持することなくインタラクティブなエージェント作業を行うには、[クラウドセッション](/docs/agents/run/cloud-sandbox-sessions.md) `feature(cloud-sessions)`を使用します。既存のクラウドセッションを再度開いて会話を継続します。実行はクラウド環境内で行われ、その可用性とライフサイクルはサービスによって管理されます。 |
| **エディターまたはAgents window** | VS CodeでGitHub Copilot、Claude、またはCodexエージェントハーネスを使用し、[インターフェイス間でセッションを継続する](/docs/agents/run/sessions/manage-sessions.md#continue-between-the-chat-view-and-agents-window)ことができます。 |
| **別のマシンのVS Code** | [SSH](/docs/agents/run/remote-agent-sessions.md#connect-via-ssh)または[開発用トンネル](/docs/agents/run/remote-agent-sessions.md#connect-via-dev-tunnel)を通じたVS Code固有のリモート接続を使用します。開発用トンネルは[ブラウザーベースのAgents window](/docs/agents/run/remote-agent-sessions.md#use-the-agents-window-in-the-browser)もサポートしています。 |

自分のマシンで実行されるセッションの場合は、ホストの実行状態を維持し、アクセス可能な状態にしておいてください。クラウドセッションでは代わりにマネージドコンピュートが使用されます。クラウドでの作業用にクラウドセッションを開始し、その後そのセッションを再度開いて継続します。

自身のプライベートリポジトリを使用して、[VS Codeでクラウドエージェントタスクを開始し、Copilot CLIでそれを継続する](/docs/agents/cloud-continuity-tutorial.md)ことができます(実験的機能)。

ツールが実行される場所とモデルがホストされる場所は、それぞれ個別に選択できます。エージェントは、ホストされているプロバイダーにモデルのリクエストを送信しながら、マシン上のファイルを編集できます。

## 制御を維持する

AIは誤ったコードを生成したり、意図を誤解したりする可能性があります。コードベースにどのような変更が反映されるかを決定する責任は、常にあなたにあります。

* **統合する前にレビューする。**エージェントはセッションフォルダーやワークツリーに直接編集内容を保存できます。変更をコミットまたはマージする前に、[差分をレビューし、結果を検証する](/docs/agents/run/review-code-edits.md)を行ってください。
* **アクションを制御し、作業を誘導する。** [権限と承認](/docs/agents/run/approvals.md)を使用して、どのアクションに確認が必要かを決定します。[リクエストの誘導や停止](/docs/chat/chat-overview.md#send-messages-while-a-request-is-running)を行うことができますが、停止しても完了したアクションや外部サービスへの変更は取り消されません。
* **分離について理解する。** Gitワークツリーによってコードの変更は分離されますが、セキュリティ境界ではありません。エージェントが実行するターミナルコマンドに対するファイルシステムやネットワークの制限については、[プラットフォーム固有のサンドボックスオプション](/docs/agents/run/agent-sandboxing.md)を確認してください。

既存のプロジェクトでエージェントを使用する前に、[推奨されるセキュリティ基準](/docs/agents/run/security.md#recommended-security-baseline)を確認してください。管理されたデバイスでは、組織が[エンタープライズAIポリシー](/docs/enterprise/manage-ai-settings.md)を通じて、利用可能なエージェント、モデル、およびツールを制限している場合があります。チャットにエージェントが表示されない場合は、[可用性のトラブルシューティング手順](/docs/agents/agent-troubleshooting/faq.md#agents-are-not-available-in-chat)を確認してください。

キーボード、スクリーンリーダー、およびロービジョン向けのワークフローについては、[アクセシブルビューおよびその他のアクセシビリティ機能](/docs/configure/accessibility/accessibility.md#accessible-view)の使用方法を確認してください。

## 次のステップ

* [エージェントのベストプラクティスをプロジェクトに適用する](/docs/agents/best-practices.md)。
* [品質、信頼性、およびAIクレジットの使用量を比較する](/docs/agents/guides/optimize-usage.md)。
