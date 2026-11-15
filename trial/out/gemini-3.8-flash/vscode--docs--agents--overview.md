---
ContentId: 7c4b8b5e-2d3f-4e8a-9b2c-1a5d6f8e9c0b
DateApproved: 11/11/2026
MetaDescription: Choose AI workflows, models, and agents in {% data variables.product.prodname_vscode_shortname %}, from inline suggestions to remote sessions.
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
# {% data variables.product.prodname_vscode_shortname %}でAIを活用して構築する

{% data variables.product.prodname_vscode %}では、タスクの必要性に応じてAIを必要なだけ活用できます。入力しながらサジェストを受け取ったり、コード、テスト、デバッガーの横でエージェントと共同作業したり、{% data variables.copilot.agents_window %}でプロジェクト間のタスクを調整したりできます。作業の変化に合わせてこれらのアプローチを組み合わせることができます。

複数のプロバイダーからモデルを選択し、サポートされているアカウントまたは独自のAPIキーを使用して、{% data variables.product.prodname_copilot_short %}、{% data variables.product.prodname_anthropic_claude_short %}、または{% data variables.product.prodname_openai_codex_short %}のエージェントハーネスで作業します。ハーネスは、モデルを取り巻くツールとワークフローを提供します。カスタマイズやプラグインにより、エージェントを作業に合わせて調整できます。

Continuityにより、最初からやり直すことなく、サポートされているインターフェース間でエージェントの作業を引き継ぐことができます。{% data variables.copilot.github_environments %}を通じて自身のマシン上のセッションに接続するか、ローカルホストをオンラインに保たずにクラウドセッションを使用します。

## 開始方法を選択する

<div class="card-grid">
    <a class="card" href="/docs/agents/quickstart">
        <i class="codicon codicon-hubot" aria-hidden="true"></i>
        <div>
            <p><strong>最初のAIタスクを完了する</strong></p>
            <p>AIコーディングは初めてですか? 推奨されるデフォルト設定で小規模なアプリを構築して検証し、変更内容を確認します。</p>
        </div>
    </a>
    <a class="card" href="/docs/agents/guides/overview#experienced-agent-fast-track">
        <i class="codicon codicon-tools" aria-hidden="true"></i>
        <div>
            <p><strong>{% data variables.product.prodname_vscode_shortname %}にAIワークフローを導入する</strong></p>
            <p>すでにAIコーディングツールをお使いですか? アカウントやモデルを接続し、エージェントハーネスを選択して、自身のリポジトリで作業します。</p>
        </div>
    </a>
</div>

* **自身のコードから始めたい場合:** [ファイルを変更せずにコードベースを探索](/docs/agents/guides/explore-a-codebase.md)し、説明をコードと照らし合わせて確認します。
* **{% data variables.product.prodname_vscode_shortname %}を初めて使用する場合:** まず[エディターをインストールしてワークスペースを開き](/docs/getstarted/overview.md)ます。

<video src="images/agents-overview/build-with-ai-overview.mp4" title="Video overview of building with AI in VS Code, showing inline suggestions, collaboration alongside code, and task orchestration in the Agents window." autoplay loop controls muted></video>

<a name="what-you-can-do-with-ai"></a>
<a name="ways-to-work-with-agents"></a>

## 作業方法を選択する

タスクに応じて異なるエクスペリエンスを切り替え、[インターフェース間でエージェントセッションを継続](#continue-across-interfaces-and-machines)して中断したところから再開できます。

<div class="card-grid">
    <a class="card" href="/docs/editing/ai-powered-suggestions">
        <i class="codicon codicon-edit" aria-hidden="true"></i>
        <div>
            <p><strong>アシスタンスを受けながらコードを記述する</strong></p>
            <p>入力しながらインラインサジェスト（次の編集の提案を含む）を受け取ります。</p>
        </div>
    </a>
    <a id="work-alongside-your-code" class="card" href="/docs/agents/run/chat-view">
        <i class="codicon codicon-comment-discussion" aria-hidden="true"></i>
        <div>
            <p><strong>コードの横で共同作業する</strong></p>
            <p>エディター、ターミナル、テスト、デバッガーの横で現在のワークスペースに焦点を当て、{% data variables.copilot.chat_view %}のエージェントと作業します。</p>
        </div>
    </a>
    <a id="delegate-and-manage-tasks" class="card" href="/docs/agents/run/agents-window">
        <i class="codicon codicon-hubot" aria-hidden="true"></i>
        <div>
            <p><strong>作業の委任と調整</strong></p>
            <p>{% data variables.copilot.agents_window %}でタスクを割り当て、プロジェクト全体でエージェントセッションを管理します。</p>
        </div>
    </a>
</div>

[エージェント](/docs/agents/concepts/agents.md)は、モデルとツールを使用して関連するコードを見つけ、変更を加え、チェックを実行します。{% data variables.copilot.chat_view %}と{% data variables.copilot.agents_window %}の両方でエージェントが実行されます。ユーザーは目標を設定し、作業を指示し、結果を確認します。

定常的な作業には、プロンプトを[オートメーション](/docs/agents/run/automations.md)として保存します。スケジュールに従ってローカルで実行するか、コンピューターがオフの間も継続するスケジュール設定またはイベントトリガーによるリポジトリ作業にクラウドオートメーション`feature(cloud-automations)`を使用します。定期的な作業を有効にする前に、手動実行を確認してください。

集中的な編集には、コードから離れることなく[inline chat](/docs/chat/inline-chat.md)を使用します。特定のタスクの機能を比較するには、[AI機能チートシート](/docs/agents/reference/ai-features-cheat-sheet.md#choose-a-feature)を使用します。

## モデル、エージェント、ツールの選択

最初のエージェントタスクでは、すべてのオプションを設定せずに[クイックスタートを使用](/docs/agents/quickstart.md)します。ニーズの変化に応じて、以下の選択肢を調整できます。

| 選択肢 | オプション |
|--------|---------|
| **Models** | {% data variables.product.prodname_copilot %}を通じて[複数のプロバイダーのモデルを選択](/docs/agent-customization/language-models.md)するか、独自の[APIキー（BYOK）](/docs/agent-customization/language-models.md#bring-your-own-language-model-key)またはサポートされているローカルモデルを使用します。 |
| **Agent harnesses** | [ツールとワークフロー](/docs/agents/run/agent-harnesses.md#compare-agent-harnesses)に基づいて、{% data variables.product.prodname_copilot_short %}、{% data variables.product.prodname_anthropic_claude_short %}、または{% data variables.product.prodname_openai_codex_short %}から選択します。 |
| **Access and billing** | 既存の{% data variables.product.prodname_copilot %}プラン、サポートされているプロバイダーアカウント、またはAPIキーを使用します。[ハーネスの要件](/docs/agents/run/agent-harnesses.md#requirements-and-setup)を確認してください。 |
| **Customization** | [プラグイン](/docs/agent-customization/agent-plugins.md)、[プロジェクトの手順](/docs/agents/guides/customize-copilot-guide.md)、[スキル](/docs/agent-customization/agent-skills.md)を使用してエージェントをカスタマイズします。[Model Context Protocol（MCP）サーバー](/docs/agent-customization/mcp-servers.md)を介して外部ツールを接続します。 |

## インターフェースやマシンをまたいで継続する

Continuityとは、最初からやり直すことなく、サポートされているインターフェースやマシン間でエージェントの作業を引き継ぐことを意味します。エージェントのワークスペースと実行をホスト上に維持したまま、エージェントとやり取りする場所を選択します。セッションのサポート状況と要件は、ハーネスおよび接続先によって異なります。

| 作業したい場所 | ここから開始 |
|------------------------|------------|
| **{% data variables.product.prodname_copilot_short %}アプリやデバイス間** | [{% data variables.copilot.github_environments %}](/docs/agents/run/remote-agent-sessions.md#github-environments)`feature(github-environments)`を使用して開発マシンを登録し、{% data variables.product.prodname_vscode_shortname %}、{% data variables.copilot.github_copilot_app %}、{% data variables.copilot.copilot_cli_short %}、GitHub.com、またはGitHub Mobileからそのエージェントセッションを継続します。利用可能なアクションはクライアントによって異なります。 |
| **マネージドクラウドコンピュート上** | 自身のマシンをオンラインに保たずにインタラクティブなエージェント作業を行うには、[クラウドセッション](/docs/agents/run/cloud-sandbox-sessions.md)`feature(cloud-sessions)`を使用します。既存のクラウドセッションを再度開いて会話を続けます。実行はクラウド環境内にとどまり、その可用性と有効期間はサービスによって管理されます。 |
| **エディターまたは{% data variables.copilot.agents_window %}** | {% data variables.product.prodname_vscode_shortname %}で{% data variables.product.prodname_copilot %}、{% data variables.product.prodname_anthropic_claude_short %}、または{% data variables.product.prodname_openai_codex_short %}のエージェントハーネスを使用し、[インターフェース間でセッションを継続](/docs/agents/run/sessions/manage-sessions.md#continue-between-the-chat-view-and-agents-window)します。 |
| **別のマシン上の{% data variables.product.prodname_vscode_shortname %}** | [SSH](/docs/agents/run/remote-agent-sessions.md#connect-via-ssh)または[dev tunnel](/docs/agents/run/remote-agent-sessions.md#connect-via-dev-tunnel)を介した{% data variables.product.prodname_vscode_shortname %}固有のリモート接続を使用します。Dev tunnelは[ブラウザーベースの{% data variables.copilot.agents_window %}](/docs/agents/run/remote-agent-sessions.md#use-the-agents-window-in-the-browser)もサポートしています。 |

自身のマシンで実行されるセッションの場合は、ホストを実行状態にし、到達可能な状態に保ってください。クラウドセッションでは代わりにマネージドコンピュートが使用されます。クラウドでの作業用にクラウドセッションを開始し、そのセッションを再度開いて継続します。

独自のプライベートリポジトリを使用して、[{% data variables.product.prodname_vscode_shortname %}でクラウドエージェントタスクを開始し、{% data variables.copilot.copilot_cli_short %}で継続](/docs/agents/cloud-continuity-tutorial.md)します（Experimental）。

ツールがどこで実行されるかと、モデルがどこでホストされているかは個別の選択肢です。エージェントは、ホストされているプロバイダーにモデルリクエストを送信しながら、マシン上のファイルを編集できます。

## 制御を維持する

AIは誤ったコードを生成したり、意図を誤解したりすることがあります。どの変更をコードベースに反映するかを決定する責任は、引き続きユーザーにあります。

* **統合前のレビュー。** エージェントは編集内容をセッションフォルダーまたはworktreeに直接保存できます。変更をコミットまたはマージする前に、[diffを確認して結果を検証](/docs/agents/run/review-code-edits.md)してください。
* **アクションの制御と作業の方向転換。** [権限と承認](/docs/agents/run/approvals.md)を使用して、どのアクションに確認が必要かを決定します。[リクエストを誘導または停止](/docs/chat/chat-overview.md#send-messages-while-a-request-is-running)できますが、停止しても完了したアクションや外部サービスへの変更は元に戻りません。
* **分離の理解。** Gitのworktreeはコード変更を分離して保持しますが、セキュリティ境界ではありません。エージェントが実行するターミナルコマンドに対するファイルシステムおよびネットワークの制限については、[プラットフォーム固有のサンドボックスオプション](/docs/agents/run/agent-sandboxing.md)を確認してください。

既存のプロジェクトでエージェントを使用する前に、[推奨されるセキュリティベースライン](/docs/agents/run/security.md#recommended-security-baseline)を確認してください。管理対象デバイスでは、組織が[エンタープライズAIポリシー](/docs/enterprise/manage-ai-settings.md)を通じて利用可能なエージェント、モデル、ツールを制限している場合があります。エージェントがチャットに表示されない場合は、[可用性のトラブルシューティング手順](/docs/agents/agent-troubleshooting/faq.md#agents-are-not-available-in-chat)を確認してください。

キーボード、スクリーンリーダー、ロービジョン向けのワークフローについては、[Accessible Viewやその他のアクセシビリティ機能](/docs/configure/accessibility/accessibility.md#accessible-view)の使用方法を確認してください。

## 次のステップ

* [エージェントのベストプラクティスをプロジェクトに適用する](/docs/agents/best-practices.md)。
* [品質、信頼性、AIクレジットの使用量を比較する](/docs/agents/guides/optimize-usage.md)。