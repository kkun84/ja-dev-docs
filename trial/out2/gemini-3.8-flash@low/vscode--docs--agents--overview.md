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
# {% data variables.product.prodname_vscode_shortname %}でのAIを使用した構築

{% data variables.product.prodname_vscode %}では、タスクの必要性に応じてAIを自由な範囲で活用できます。入力中に候補を表示させたり、コード、テスト、デバッガーの横でエージェントと共同作業したり、{% data variables.copilot.agents_window %}でプロジェクト間のタスクを調整したりできます。作業の変化に合わせて、これらのアプローチを組み合わせることができます。

複数のプロバイダーのモデルから選択し、サポートされているアカウントまたは独自のAPIキーを使用して、{% data variables.product.prodname_copilot_short %}、{% data variables.product.prodname_anthropic_claude_short %}、または{% data variables.product.prodname_openai_codex_short %}エージェントハーネスで作業します。ハーネスは、モデルを取り巻くツールとワークフローを提供します。カスタマイズやプラグインにより、エージェントを作業に合わせて調整できます。

継続性機能により、最初からやり直すことなく、サポートされているインターフェイス間でエージェントの作業を引き継ぐことができます。{% data variables.copilot.github_environments %}経由で自身のマシン上のセッションに接続したり、ローカルホストをオンラインに維持することなくクラウドセッションを使用したりできます。

## 開始場所を選択する

<div class="card-grid">
    <a class="card" href="/docs/agents/quickstart">
        <i class="codicon codicon-hubot" aria-hidden="true"></i>
        <div>
            <p><strong>最初のAIタスクを完了する</strong></p>
            <p>AIコーディングが初めてですか？推奨デフォルト値を使用して小さなアプリを構築・検証し、変更を確認します。</p>
        </div>
    </a>
    <a class="card" href="/docs/agents/guides/overview#experienced-agent-fast-track">
        <i class="codicon codicon-tools" aria-hidden="true"></i>
        <div>
            <p><strong>AIワークフローを{% data variables.product.prodname_vscode_shortname %}に導入する</strong></p>
            <p>すでにAIコーディングツールをお使いですか？アカウントまたはモデルを接続し、エージェントハーネスを選択して、自身のコードリポジトリで作業します。</p>
        </div>
    </a>
</div>

* **自身のコードから始めたい場合:** [ファイルを変更せずにコードベースを探索](/docs/agents/guides/explore-a-codebase.md)し、コードと照らし合わせて説明を検証します。
* **{% data variables.product.prodname_vscode_shortname %}が初めての場合:** まず[エディターをインストールしてワークスペースを開き](/docs/getstarted/overview.md)ます。

<video src="images/agents-overview/build-with-ai-overview.mp4" title="Video overview of building with AI in VS Code, showing inline suggestions, collaboration alongside code, and task orchestration in the Agents window." autoplay loop controls muted></video>

<a name="what-you-can-do-with-ai"></a>
<a name="ways-to-work-with-agents"></a>

## 作業方法を選択する

タスクに応じて異なるエクスペリエンスを切り替え、[インターフェイス間でエージェントセッションを継続](#continue-across-interfaces-and-machines)して中断したところから再開します。

<div class="card-grid">
    <a class="card" href="/docs/editing/ai-powered-suggestions">
        <i class="codicon codicon-edit" aria-hidden="true"></i>
        <div>
            <p><strong>支援を受けながらコードを作成する</strong></p>
            <p>次の編集に関する候補など、入力時にインラインサジェストを取得します。</p>
        </div>
    </a>
    <a id="work-alongside-your-code" class="card" href="/docs/agents/run/chat-view">
        <i class="codicon codicon-comment-discussion" aria-hidden="true"></i>
        <div>
            <p><strong>コードと並行して共同作業する</strong></p>
            <p>エディター、ターミナル、テスト、デバッガーと並行して、現在のワークスペースに焦点を当てた{% data variables.copilot.chat_view %}でエージェントと連携します。</p>
        </div>
    </a>
    <a id="delegate-and-manage-tasks" class="card" href="/docs/agents/run/agents-window">
        <i class="codicon codicon-hubot" aria-hidden="true"></i>
        <div>
            <p><strong>作業の委任と調整を行う</strong></p>
            <p>{% data variables.copilot.agents_window %}でタスクを割り当て、プロジェクト全体でエージェントセッションを管理します。</p>
        </div>
    </a>
</div>

[エージェント](/docs/agents/concepts/agents.md)は、モデルとツールを使用して関連コードを検索し、変更を加え、チェックを実行します。{% data variables.copilot.chat_view %}と{% data variables.copilot.agents_window %}の両方でエージェントを実行できます。目標を設定し、作業を指示し、結果を確認します。

定期的な作業の場合は、プロンプトを[automation](/docs/agents/run/automations.md)として保存します。ローカルでスケジュールに従って実行するか、コンピューターがオフの間も継続するスケジュール設定またはイベントトリガーのリポジトリ作業にはクラウドautomation `feature(cloud-automations)`を使用します。定期的な作業を有効にする前に、手動実行の結果を確認してください。

ピンポイントの編集には、コードから離れることなく[inline chat](/docs/chat/inline-chat.md)を使用します。特定のタスクに応じた機能を比較するには、[AI機能チートシート](/docs/agents/reference/ai-features-cheat-sheet.md#choose-a-feature)を使用します。

## モデル、エージェント、ツールの選択

最初のエージェントタスクでは、すべてのオプションを設定せずに[クイックスタートを使用](/docs/agents/quickstart.md)します。ニーズの変化に応じて、以下の選択肢を適宜変更できます。

| 選択肢 | オプション |
|--------|---------|
| **モデル** | {% data variables.product.prodname_copilot %}を通じて[複数のプロバイダーのモデル](/docs/agent-customization/language-models.md)を選択するか、独自の[APIキー（BYOK）](/docs/agent-customization/language-models.md#bring-your-own-language-model-key)またはサポートされているローカルモデルを使用します。 |
| **エージェントハーネス** | [ツールとワークフロー](/docs/agents/run/agent-harnesses.md#compare-agent-harnesses)に基づいて、{% data variables.product.prodname_copilot_short %}、{% data variables.product.prodname_anthropic_claude_short %}、または{% data variables.product.prodname_openai_codex_short %}から選択します。 |
| **アクセスと請求** | 既存の{% data variables.product.prodname_copilot %}プラン、サポートされているプロバイダーアカウント、またはAPIキーを使用します。[ハーネスの要件](/docs/agents/run/agent-harnesses.md#requirements-and-setup)を確認してください。 |
| **カスタマイズ** | [プラグイン](/docs/agent-customization/agent-plugins.md)、[プロジェクト手順](/docs/agents/guides/customize-copilot-guide.md)、および[スキル](/docs/agent-customization/agent-skills.md)を使用してエージェントをカスタマイズします。[Model Context Protocol (MCP) サーバー](/docs/agent-customization/mcp-servers.md)を介して外部ツールを接続します。 |

## インターフェイスとマシン間での継続

継続性機能とは、最初からやり直すことなく、サポートされているインターフェイスやマシン間でエージェントの作業を引き継ぐことを意味します。エージェントのワークスペースと実行環境はホスト上に保持したまま、エージェントとやり取りする場所を選択できます。セッションのサポートと要件は、ハーネスと宛先によって異なります。

| 作業したい場所 | ここから開始 |
|------------------------|------------|
| **{% data variables.product.prodname_copilot_short %}アプリやデバイス間** | [{% data variables.copilot.github_environments %}](/docs/agents/run/remote-agent-sessions.md#github-environments) `feature(github-environments)`を使用して開発マシンを登録し、{% data variables.product.prodname_vscode_shortname %}、{% data variables.copilot.github_copilot_app %}、{% data variables.copilot.copilot_cli_short %}、GitHub.com、またはGitHub Mobileからそのエージェントセッションを継続します。利用可能なアクションはクライアントによって異なります。 |
| **マネージドクラウドコンピュート上** | 自身のマシンをオンラインに維持することなく対話型エージェント作業を行うには、[クラウドセッション](/docs/agents/run/cloud-sandbox-sessions.md) `feature(cloud-sessions)`を使用します。既存のクラウドセッションを再度開いて会話を継続します。実行はクラウド環境内にとどまり、その可用性とライフタイムはサービスによって管理されます。 |
| **エディターまたは{% data variables.copilot.agents_window %}** | {% data variables.product.prodname_vscode_shortname %}で{% data variables.product.prodname_copilot %}、{% data variables.product.prodname_anthropic_claude_short %}、または{% data variables.product.prodname_openai_codex_short %}エージェントハーネスを使用し、[インターフェイス間でセッションを継続](/docs/agents/run/sessions/manage-sessions.md#continue-between-the-chat-view-and-agents-window)します。 |
| **別のマシン上の{% data variables.product.prodname_vscode_shortname %}** | [SSH](/docs/agents/run/remote-agent-sessions.md#connect-via-ssh)または[dev tunnel](/docs/agents/run/remote-agent-sessions.md#connect-via-dev-tunnel)経由で{% data variables.product.prodname_vscode_shortname %}固有のリモート接続を使用します。Dev tunnelは[ブラウザベースの{% data variables.copilot.agents_window %}](/docs/agents/run/remote-agent-sessions.md#use-the-agents-window-in-the-browser)もサポートしています。 |

自身のマシン上で実行されるセッションの場合は、ホストを実行状態のままアクセス可能にしておいてください。クラウドセッションでは代わりにマネージドコンピュートが使用されます。クラウドでの作業用にクラウドセッションを開始し、そのセッションを再度開いて続行します。

自身のプライベートリポジトリを使用して、[{% data variables.product.prodname_vscode_shortname %}でクラウドアカウントタスクを開始し、{% data variables.copilot.copilot_cli_short %}で継続](/docs/agents/cloud-continuity-tutorial.md)します（試験的）。

ツールを実行する場所とモデルがホストされている場所は別個の選択肢です。エージェントは、ホストされているプロバイダーにモデルリクエストを送信しながら、マシン上のファイルを編集できます。

## コントロールの維持

AIは誤ったコードを生成したり、意図を誤解したりする可能性があります。どの変更をコードベースに取り込むかを決定する責任は、引き続きお客様にあります。

* **統合前の確認。** エージェントは編集内容をセッションフォルダーまたはworktreeに直接保存できます。変更をコミットまたはマージする前に、[diffを確認して結果を検証](/docs/agents/run/review-code-edits.md)してください。
* **アクションの制御と作業の方向転換。** [権限と承認](/docs/agents/run/approvals.md)を使用して、確認を必要とするアクションを決定します。[リクエストの誘導や停止](/docs/chat/chat-overview.md#send-messages-while-a-request-is-running)が可能ですが、停止しても完了したアクションや外部サービスへの変更は元に戻りません。
* **分離の理解。** Git worktreeはコードの変更を分離しますが、セキュリティ境界ではありません。エージェントが実行するターミナルコマンドに対するファイルシステムおよびネットワークの制限については、[プラットフォーム固有のサンドボックスオプション](/docs/agents/run/agent-sandboxing.md)を確認してください。

既存のプロジェクトでエージェントを使用する前に、[推奨されるセキュリティベースライン](/docs/agents/run/security.md#recommended-security-baseline)を確認してください。管理対象デバイスでは、組織が[エンタープライズAIポリシー](/docs/enterprise/manage-ai-settings.md)を通じて利用可能なエージェント、モデル、ツールを制限している場合があります。エージェントがチャットに表示されない場合は、[可用性のトラブルシューティング手順](/docs/agents/agent-troubleshooting/faq.md#agents-are-not-available-in-chat)を確認してください。

キーボード、スクリーンリーダー、ロービジョンのワークフローについては、[Accessible Viewやその他のアクセシビリティ機能](/docs/configure/accessibility/accessibility.md#accessible-view)の使用方法を参照してください。

## 次のステップ

* [プロジェクトにエージェントのベストプラクティスを適用する](/docs/agents/best-practices.md)。
* [品質、信頼性、AIクレジットの使用量を比較する](/docs/agents/guides/optimize-usage.md)。
