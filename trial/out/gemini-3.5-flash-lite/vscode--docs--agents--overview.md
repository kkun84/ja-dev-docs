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
# {% data variables.product.prodname_vscode_shortname %}でのAIを活用したビルド

{% data variables.product.prodname_vscode %}では、タスクに応じて必要なだけのAIを活用できます。入力時のサジェスト機能の取得、コード、テスト、デバッガーの横で動作するエージェントとの連携、または{% data variables.copilot.agents_window %}でのプロジェクトをまたいだタスクの調整などを行います。作業の進捗に合わせて、これらのアプローチを組み合わせることができます。

複数のプロバイダーからモデルを選択し、サポートされているアカウントまたは独自のAPIキーを使用して、{% data variables.product.prodname_copilot_short %}、{% data variables.product.prodname_anthropic_claude_short %}、または{% data variables.product.prodname_openai_codex_short %}のエージェントハーネスを利用します。ハーネスは、モデルに関連するツールやワークフローを提供します。カスタマイズやプラグインを使用することで、作業に合わせたエージェントの調整が可能になります。

継続性機能により、最初からやり直すことなく、サポートされているインターフェイス間でエージェントの作業を引き継ぐことができます。{% data variables.copilot.github_environments %}を通じて自分のマシンのセッションに接続するか、ローカルホストをオンラインに維持せずにクラウドセッションを使用します。

## 開始方法を選択する

<div class="card-grid">
    <a class="card" href="/docs/agents/quickstart">
        <i class="codicon codicon-hubot" aria-hidden="true"></i>
        <div>
            <p><strong>最初のAIタスクを完了する</strong></p>
            <p>AIコーディングは初めてですか？推奨されるデフォルト設定で小さなアプリをビルドして検証し、変更点を確認します。</p>
        </div>
    </a>
    <a class="card" href="/docs/agents/guides/overview#experienced-agent-fast-track">
        <i class="codicon codicon-tools" aria-hidden="true"></i>
        <div>
            <p><strong>{% data variables.product.prodname_vscode_shortname %}にAIワークフローを持ち込む</strong></p>
            <p>すでにAIコーディングツールを使用していますか？アカウントまたはモデルを接続し、エージェントハーネスを選択して、自分のリポジトリで作業します。</p>
        </div>
    </a>
</div>

* **自分のコードから始めたい場合:** [ファイルを変更せずにコードベースを探索し](/docs/agents/guides/explore-a-codebase.md)、コードに対してその説明を検証します。
* **{% data variables.product.prodname_vscode_shortname %}が初めての場合:** まず[エディターをインストールしてワークスペースを開きます](/docs/getstarted/overview.md)。

<video src="images/agents-overview/build-with-ai-overview.mp4" title="Video overview of building with AI in VS Code, showing inline suggestions, collaboration alongside code, and task orchestration in the Agents window." autoplay loop controls muted></video>

<a name="what-you-can-do-with-ai"></a>
<a name="ways-to-work-with-agents"></a>

## 作業方法を選択する

タスクに応じて異なるエクスペリエンスを切り替え、[インターフェイス間でエージェントセッションを継続して](#continue-across-interfaces-and-machines)、中断したところから再開します。

<div class="card-grid">
    <a class="card" href="/docs/editing/ai-powered-suggestions">
        <i class="codicon codicon-edit" aria-hidden="true"></i>
        <div>
            <p><strong>支援を受けながらコードを書く</strong></p>
            <p>次の編集の提案を含め、入力時にインラインサジェストを取得します。</p>
        </div>
    </a>
    <a id="work-alongside-your-code" class="card" href="/docs/agents/run/chat-view">
        <i class="codicon codicon-comment-discussion" aria-hidden="true"></i>
        <div>
            <p><strong>コードの横で連携する</strong></p>
            <p>{% data variables.copilot.chat_view %}でエージェントと連携し、エディター、ターミナル、テスト、デバッガーの横で現在のワークスペースに集中して作業します。</p>
        </div>
    </a>
    <a id="delegate-and-manage-tasks" class="card" href="/docs/agents/run/agents-window">
        <i class="codicon codicon-hubot" aria-hidden="true"></i>
        <div>
            <p><strong>作業を委任して調整する</strong></p>
            <p>{% data variables.copilot.agents_window %}で、プロジェクトをまたいだタスクの割り当てやエージェントセッションの管理を行います。</p>
        </div>
    </a>
</div>

[エージェント](/docs/agents/concepts/agents.md)は、モデルとツールを使用して関連するコードの検索、変更の実行、およびチェックを行います。{% data variables.copilot.chat_view %}と{% data variables.copilot.agents_window %}の両方でエージェントが実行されます。ユーザーが目標を設定し、作業を誘導し、結果を確認します。

定型作業の場合は、プロンプトを[自動化](/docs/agents/run/automations.md)として保存します。ローカルで定期実行するか、クラウド自動化 `feature(cloud-automations)`を使用して、コンピューターの電源がオフの間も継続するスケジュール実行やイベントトリガーによるリポジトリ作業を行います。定期的な作業を有効にする前に、手動実行を確認してください。

焦点を絞った編集を行うには、コードから離れることなく[インラインチャット](/docs/chat/inline-chat.md)を使用します。特定のタスクの機能を比較するには、[AI機能チートシート](/docs/agents/reference/ai-features-cheat-sheet.md#choose-a-feature)を使用します。

## モデル、エージェント、およびツールを選択する

最初のエージェントタスクでは、すべてのオプションを設定せずに[クイックスタートを使用します](/docs/agents/quickstart.md)。ニーズの変化に応じて、以下の選択肢を調整できます。

| 選択 | オプション |
|------|------------|
| **モデル** | {% data variables.product.prodname_copilot %}を通じて[複数のプロバイダーからモデルを選択](/docs/agent-customization/language-models.md)するか、独自の[APIキー（BYOK）](/docs/agent-customization/language-models.md#bring-your-own-language-model-key)またはサポートされているローカルモデルを使用します。 |
| **エージェントハーネス** | [ツールとワークフロー](/docs/agents/run/agent-harnesses.md#compare-agent-harnesses)に基づいて、{% data variables.product.prodname_copilot_short %}、{% data variables.product.prodname_anthropic_claude_short %}、または{% data variables.product.prodname_openai_codex_short %}から選択します。 |
| **アクセスと課金** | 既存の{% data variables.product.prodname_copilot %}プラン、サポートされているプロバイダーのアカウント、またはAPIキーを使用します。[ハーネスの要件](/docs/agents/run/agent-harnesses.md#requirements-and-setup)を確認してください。 |
| **カスタマイズ** | [プラグイン](/docs/agent-customization/agent-plugins.md)、[プロジェクト指示](/docs/agents/guides/customize-copilot-guide.md)、[スキル](/docs/agent-customization/agent-skills.md)を使用してエージェントを調整します。[Model Context Protocol (MCP) サーバー](/docs/agent-customization/mcp-servers.md)を通じて外部ツールを接続します。 |

## インターフェイスやマシンをまたいで継続する

継続性とは、最初からやり直すことなく、サポートされているインターフェイスやマシン間でエージェントの作業を引き継ぐことを意味します。ワークスペースと実行環境がホストに残ったまま、エージェントとやり取りする場所を選択します。セッションのサポート状況や要件は、ハーネスや宛先によって異なります。

| 作業を行いたい場所 | ここから開始 |
|--------------------|--------------|
| **{% data variables.product.prodname_copilot_short %}アプリとデバイスをまたぐ** | [{% data variables.copilot.github_environments %}](/docs/agents/run/remote-agent-sessions.md#github-environments) `feature(github-environments)`を使用して開発マシンを登録し、{% data variables.product.prodname_vscode_shortname %}、{% data variables.copilot.github_copilot_app %}、{% data variables.copilot.copilot_cli_short %}、GitHub.com、またはGitHub Mobileからエージェントセッションを継続します。利用可能なアクションはクライアントによって異なります。 |
| **管理されたクラウドコンピューティング環境** | 自分のマシンをオンラインに維持せずにインタラクティブなエージェント作業を行うには、[クラウドセッション](/docs/agents/run/cloud-sandbox-sessions.md) `feature(cloud-sessions)`を使用します。既存のクラウドセッションを再度開いて会話を継続します。実行環境はクラウド環境に維持され、その可用性とライフサイクルはサービスによって管理されます。 |
| **エディターまたは{% data variables.copilot.agents_window %}** | {% data variables.product.prodname_copilot %}、{% data variables.product.prodname_anthropic_claude_short %}、または{% data variables.product.prodname_openai_codex_short %}のエージェントハーネスを{% data variables.product.prodname_vscode_shortname %}内で使用し、[インターフェイスをまたいでセッションを継続します](/docs/agents/run/sessions/manage-sessions.md#continue-between-the-chat-view-and-agents-window)。 |
| **別のマシンの{% data variables.product.prodname_vscode_shortname %}** | [SSH](/docs/agents/run/remote-agent-sessions.md#connect-via-ssh)または[開発トンネル](/docs/agents/run/remote-agent-sessions.md#connect-via-dev-tunnel)を通じた、{% data variables.product.prodname_vscode_shortname %}固有のリモート接続を使用します。開発トンネルは[ブラウザーベースの{% data variables.copilot.agents_window %}](/docs/agents/run/remote-agent-sessions.md#use-the-agents-window-in-the-browser)もサポートしています。 |

自分のマシンで実行されるセッションの場合は、ホストを実行状態にしてアクセス可能な状態に維持してください。クラウドセッションでは、代わりに管理されたコンピューティングを使用します。クラウドでの作業のためにクラウドセッションを開始し、その後そのセッションを再度開いて継続します。

独自 プライベートリポジトリを使用して、[{% data variables.product.prodname_vscode_shortname %}でクラウドエージェントタスクを開始し、{% data variables.copilot.copilot_cli_short %}でそれを継続します](/docs/agents/cloud-continuity-tutorial.md)（実験的機能）。

ツールが実行される場所とモデルがホストされる場所は、それぞれ個別に選択できます。エージェントは、モデルリクエストをホストされたプロバイダーに送信しながら、自分のマシン上のファイルを編集できます。

## 制御を維持する

AIは不正確なコードを生成したり、ユーザーの意図を誤解したりする可能性があります。どの変更をコードベースに反映させるかの最終的な判断責任はユーザーにあります。

* **統合前にレビューする。** エージェントは、セッションフォルダーやワークツリーに直接編集内容を保存できます。変更をコミットまたはマージする前に、[差分を確認し、結果を検証します](/docs/agents/run/review-code-edits.md)。
* **アクションを制御し、作業をリダイレクトする。** [権限と承認](/docs/agents/run/approvals.md)を使用して、確認を必要とするアクションを決定します。[リクエストの誘導や停止を行うことができますが](/docs/chat/chat-overview.md#send-messages-while-a-request-is-running)、停止しても完了したアクションや外部サービスへの変更は元に戻りません。
* **分離について理解する。** Gitワークツリーによってコードの変更は分離されますが、これはセキュリティ境界ではありません。エージェントが実行するターミナルコマンドに対するファイルシステムやネットワークの制限については、[プラットフォーム固有のサンドボックス化オプション](/docs/chat/chat-overview.md#send-messages-while-a-request-is-running)を確認してください。

既存のプロジェクトでエージェントを使用する前に、[推奨されるセキュリティ基準](/docs/agents/best-practices.md)を確認してください。管理されたデバイスでは、組織が[エンタープライズAIポリシー](/docs/enterprise/manage-ai-settings.md)を通じて、利用可能なエージェント、モデル、およびツールを制限している場合があります。チャットにエージェントが表示されない場合は、[可用性のトラブルシューティング手順](/docs/agents/agent-troubleshooting/faq.md#agents-are-not-available-in-chat)を確認してください。

キーボード、スクリーンリーダー、およびロービジョン向けのワークフローについては、[アクセシブルビューおよびその他のアクセシビリティ機能](/docs/configure/accessibility/accessibility.md#accessible-view)の使用方法を参照してください。

## 次のステップ

* [エージェントのベストプラクティスをプロジェクトに適用する](/docs/agents/best-practices.md)。
* [品質、信頼性、およびAIクレジットの使用量を比較する](/docs/agents/guides/optimize-usage.md)。