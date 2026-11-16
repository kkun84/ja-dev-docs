---
Order: 156
TOCTitle: "1.146"
PageTitle: "Visual Studio Code 1.146"
MetaDescription: "Visual Studio Code 1.146の新機能"
MetaSocialImage: 1_146/release-highlights.webp
Date: 2026-11-11
DownloadVersion: 1.146.0
Milestone: 1.146.0
ProductEdition: Stable
---
# Visual Studio Code 1.146

<!-- %IF IN_PRODUCT %
Follow us on [LinkedIn](https://www.linkedin.com/showcase/vs-code), [X](https://go.microsoft.com/fwlink/?LinkID=533687), [Bluesky](https://bsky.app/profile/vscode.dev), [Instagram](https://www.instagram.com/vscode) | [View online](https://code.visualstudio.com/updates)
%ENDIF % -->
<!-- %IF IN_WEB %
<p class="release-metadata"><span>Release date: November 11, 2026</span> <span class="release-channel">Stable</span></p>
%ENDIF % -->
<!-- %IF IN_PRODUCT %
_Release date: November 11, 2026_
%ENDIF % -->

<!-- DOWNLOAD_LINKS_PLACEHOLDER -->

<!-- RELEASE_HIGHLIGHTS_START -->
## リリースハイライト

必要な作業のために脳力を温存しましょう。インボックスモードにより、適切なセッションに注意を向けながら、エージェントにモデル比較を任せることができます。チャットウィンドウと拡張機能を使って、タスクに合わせたエージェントワークスペースを構築しましょう。

* [インボックスモード(実験的)](#inbox-mode-for-sessions-experimental):すべてのプロジェクトにわたって注意が必要なセッションに集中し、その他のセッションは後回しにスヌーズします。

* [モデル比較(プレビュー)](#model-comparison-improvements-preview): Copilot Fusionを組み込んだ結果を比較したり、エージェントに比較を実行させたりできます。

* [チャットウィンドウ(プレビュー)](#chat-windows-preview):チャットに専用のウィンドウを割り当て、チャット、エディター、ターミナルをタスクに合わせて再配置できます。

* [エージェントウィンドウでの拡張機能(実験的)](#install-and-manage-extensions-in-the-agents-window-experimental):より充実したエージェントエクスペリエンスのために拡張機能を見つけてインストールできます。

* [ローカルハーネスの非推奨化](#copilot-harness-and-deprecation-of-the-local-harness): 2027年2月のローカルハーネス削除の前に、Copilotハーネスへ移行してください。

ハッピーコーディング！<!-- RELEASE_HIGHLIGHTS_END -->

<!-- %IF STABLE %
<p class="release-update-guidance">Already installed? Use <strong>Check for Updates</strong> in VS Code. For upcoming features, use the <a href="https://code.visualstudio.com/insiders">Insiders build</a>.</p>
%ENDIF % -->

<!-- TOC
<div class="toc-nav-layout">
  <nav id="toc-nav">
    <div>In this update</div>
    <ul>
      <li><a href="#release-highlights">Release highlights</a></li>
      <li><a href="#agents">Agents</a></li>
      <li><a href="#chat">Chat</a></li>
      <li><a href="#mcp">MCP</a></li>
      <li><a href="#trust-and-security">Trust and security</a></li>
      <li><a href="#accessibility">Accessibility</a></li>
      <li><a href="#editor-experience">Editor Experience</a></li>
      <li><a href="#enterprise">Enterprise</a></li>
      <li><a href="#deprecated-features-and-settings">Deprecated features and settings</a></li>
      <li><a href="#notable-fixes">Notable fixes</a></li>
      <li><a href="#thank-you">Thank you</a></li>
    </ul>
  </nav>
  <div class="notes-main">
Navigation End -->

## エージェント

### Copilotハーネスとローカルハーネスの非推奨化

Copilotハーネスは最新のエージェントハーネスであり、[VS Code 1.143](https://code.visualstudio.com/updates/v1_143#_copilot-harness-as-the-default)以降、新規セッションのデフォルトになっています。これはCopilot SDKを基盤として構築されており、Copilot製品間で動作、機能、機能改善を統一するのに役立ちます。Copilotハーネスのセッションは[Agent Host](https://code.visualstudio.com/docs/agents/concepts/agent-host)経由で実行されるため、バックグラウンドで実行し続け、VS Codeのエディターウィンドウとエージェントウィンドウの両方からアクセスできます。組織向けには、Copilotハーネスは、ローカルハーネスにはない管理されたサンドボックスポリシーと権限ポリシーも強制します。

デフォルトとしてCopilotハーネスを使用するフィードバックをお寄せいただいた皆様に感謝いたします。皆様からのフィードバックによりハーネスのエクスペリエンスが形作られ、次のステップへの道しるべとなります。このリリースより、**ローカルハーネスは非推奨となり、3ヶ月後（2027年2月）に削除されます**：

* **今後3ヶ月間**:ワークフローを移行する間もローカルハーネスを引き続き使用できますが、機能的には凍結されます。新機能や改善はCopilotハーネスに焦点を当てており、ローカルハーネスでのサポートは保証されません。
* **3ヶ月後**:ローカルハーネスは利用できなくなります。VS Code 1.142で導入された、[ローカルハーネスをデフォルトに維持する](https://code.visualstudio.com/docs/enterprise/manage-ai-settings#_keep-local-harness-as-default)ためのエンタープライズ管理設定`vscode.temporaryDefaultToLocalHarness`も削除されます。

Copilotハーネスは新規セッションですでにデフォルトになっているため、新しいアクションを実行する必要がない場合があります。Copilotハーネスを使用していることを確認するには、新しいセッションを開始するときにハーネスピッカーで**Copilot**を探してください：

![Copilot SDKおよびAgent Hostの統合に関するホバー説明とともに、ハーネスピッカーでCopilotが選択されている状態を示すスクリーンショット。](images/1_146/harness-copilot-description.webp)

まだローカルハーネスを使用している場合は、2027年2月までに完全にCopilotハーネスへ移行する計画を立ててください。[ローカルからCopilotへのハーネス移行ガイド](https://code.visualstudio.com/docs/agents/run/move-to-copilot)では、カスタマイズの互換性、既存のローカル会話の継続、組織へのロールアウトと検証について説明しています。問題が発生した場合は、[issueを作成して](https://github.com/microsoft/vscode/issues)お知らせください。

### セッションのインボックスモード(実験的)

**設定**: `setting(sessions.list.inboxEnabled)`

各ワークスペースを確認しなくても、エージェントを追跡できます。インボックスモードを使用すると、注意が必要なもの、まだ実行中のもの、マージの準備ができているものを1つのビューで確認できます。

`setting(sessions.list.inboxEnabled)`設定を有効にし（デフォルトではオフ）、エージェントウィンドウのセッションリストで**グループ化>インボックスモード**を選択します。

![エージェントウィンドウの「グループ化」メニューで「インボックスモード」が選択されている状態を示すスクリーンショット。](images/1_146/sessions-inbox-mode.webp)

注意が必要なセッションは、**作業中**、**マージ準備完了**、**保留中**、**完了**の各グループの上の先頭に表示されます。後回しにできるセッションの場合は、**インボックスから非表示**、**保留にする**、または**スヌーズ**を使用して脇に置きます。気が変わった場合は**元に戻す**を選択します。

セッションを非表示にしてもアーカイブされません。アーカイブするには、**セッションを完了としてマーク**を選択します。

![「作業中」、「マージ準備完了」、「保留中」、「完了」の各カテゴリの上にあるインボックスに、注意が必要なセッションが表示されている状態を示すスクリーンショット。](images/1_146/sessions-inbox.webp)

### セッションリストのインラインアクション(実験的)

**Setting**: `setting(sessions.list.inlineActions)`

エージェントウィンドウのセッションリストから直接、失敗したチェックの修正やレビューコメントへの対応を行います。この設定（デフォルトではオフ）を有効にすると、チェックの修正、コメントへの対応、またはその両方を行うためのインラインアクションが表示されます。

各アクションは、その行のセッションまたはネストされたセッションに対して、開くことなくバックグラウンドでリクエストを送信します。この設定は、エージェントマージを有効にしたり、アクションの権限を変更したりするものではありません。

![エージェントウィンドウのセッションリスト内のセッションの下に「コメントへの対応」ボタンが表示されている状態を示すスクリーンショット。](images/1_146/inline-session-actions.webp)

### チャットウィンドウ(プレビュー)

**設定**: `setting(sessions.chatWindows.enabled)`

複数のチャットを同時に実行している場合、それらをすべて1つのエージェントウィンドウに保持していると、それらを切り替える必要が生じ、待機中のチャットを見失うことになります。チャットウィンドウを使用すると、チャットを独自のウィンドウで開き、チャット、エディター、ターミナルがタスクに合うようにそのウィンドウを配置できます。

Stableでこのプレビュー機能を試すには、`setting(sessions.chatWindows.enabled)`を有効にします。VS Code Insidersではデフォルトで有効になっており、Stableではデフォルトでオフになっています。

ドキュメントで[チャットウィンドウ](https://code.visualstudio.com/docs/agents/run/agents-window#_open-chats-in-separate-windows)の詳細を確認してください。

チャットを新しいウィンドウで開くには、セッションリストでセッションまたはチャットを右クリックし、**開く方法** > **新しいウィンドウ**を選択します。チャットをエージェントウィンドウの外へドラッグして新しいウィンドウを作成することもできます。**メインウィンドウに移動**コマンドを使用して元のウィンドウに戻すことも可能です。

次の動画は、チャットを独自のウィンドウで開く様子を示しています。

<video src="images/1_146/chat-windows-open.mp4" title="Video showing a chat opened in a new window from the Agents window, with the chat beside its editors." autoplay loop controls muted></video>

チャットウィンドウには、1つ以上のセッションからの複数のチャットを保持できます。タイトルバーで別のセッションを選択したり、別のウィンドウからチャットをドラッグしたり、タイトルバーの左側にある**新しいセッション** (`<kbd title="macOS: ⌘N">Ctrl+N</kbd>`)を選択してそのウィンドウで新しいセッションを開始できます。チャットウィンドウは、VS Codeを再起動した後も、チャットやエディターとともに再度開きます。

チャットウィンドウ内のコンテンツはパーツに整理されており、ワークフローに合わせて自由に配置できます。

* **パーツの移動:**パーツの上端にあるグラバーをつかんでウィンドウの別の側や別のパーツの横にドラッグします。**パーツを左に移動**、**パーツを右に移動**、**パーツ上に移動**、**パーツ下に移動**を使用することもできます。
* **パーツ間でタブを移動:**タブを別のパーツにドラッグするか、パーツの端にドロップしてそのパーツを分割します。コマンドパレットから同様の操作を行うには、**エディターをパーツに移動**または**エディターを新しいパーツに移動(左/右/上/下)**を使用します。エディタータブをチャット入力欄にドラッグすると、コンテキストとしてチャットに添付できます。
* **ターミナルの配置:**ターミナルをエディターの下またはチャットの下にドラッグすると、**ターミナルの位置**が**エディターの下**または**チャットの下**に設定されます。ウィンドウの下端にドロップすると、**全幅**に設定されます。ターミナルの**...**メニューから位置を変更することもできます。
* **レイアウトの切り替え:**タイトルバーの**レイアウトの構成**を使用して、チャット、エディター、またはその両方を並べて表示するか、積み重ねて表示します。スタックレイアウトでは、**エージェント:チャットの会話を切り替え**によってチャットが入力欄のみに折りたたまれるため、エディターがウィンドウの残りの部分占有します。

ウィンドウを最初に開いた状態に戻すには、**開発者:チャットウィンドウのレイアウトをリセット**を使用します。

次の動画は、チャットウィンドウの再配置とレイアウトのリセットを示しています。

<video src="images/1_146/chat-windows-layout.mp4" title="Video showing parts and tabs of a chat window being rearranged, and the layout being reset." autoplay loop controls muted></video>

[issueを作成して](https://github.com/microsoft/vscode/issues)ご意見をお聞かせください。

### エージェントウィンドウでの拡張機能のインストールと管理(実験的)

エージェントカスタマイズの**拡張機能**セクションでは、エディターウィンドウでの有効化状態を変更することなく、インストール済みのどの拡張機能をエージェントウィンドウで実行するかを選択できます。以前は、拡張機能を追加するにはエディターウィンドウに切り替えてインストールする必要がありました。このリリースでは、エージェントウィンドウから離れることなく拡張機能の検索、インストール、アンインストールを行うことができます：

* **マーケットプレイスからのインストール**:検索を行うとマーケットプレイスも照会され、まだ所有していない一致する拡張機能が、パブリッシャー、インストール数、評価とともに一覧表示されます。拡張機能をインストールすると、VS Codeに追加され、エージェントウィンドウで有効になります。プレリリースなどの別のバージョンをインストールするには、**インストール**の横にあるドロップダウンを使用します。
* **インストール前に動作しない機能を確認**:エージェントウィンドウのサポートを宣言せずにビュー、デバッガー、ステータスバーアイテム、またはウォークスルーを提供している拡張機能には、サポートされていない機能の一覧を示す警告が表示されます。組織で許可されていないなどの理由でインストールできない拡張機能には、その理由が表示されます。
* **キーボードショートカットで開く**: `<kbd title="macOS: ⇧⌘X">Ctrl+Shift+X</kbd>`を押すか、**拡張機能:拡張機能の管理**を実行してセクションを開きます。エディターウィンドウでの拡張機能ビューのショートカットを変更した場合、そのショートカットはエージェントウィンドウでも機能します。

![エージェントウィンドウの「拡張機能」セクションを示すスクリーンショット。](images/1_146/extensions-agents-window.webp)

### モデル比較の改善(プレビュー)

**設定**: `setting(sessions.chat.compareAgents.tools.enabled)`

エージェントウィンドウの[モデルの比較](https://code.visualstudio.com/docs/agents/run/compare-models)を使用すると、複数のモデルで同じプロンプトを実行し、ジャッジで結果を評価し、シンセサイザーでそれぞれの長所を組み合わせることができます。このリリースにより、比較の設定、整理、自動化がより簡単になりました：

* **チャットのみの応答の評価と合成**:ワークスペースを選択せずにジャッジとシンセサイザーを追加します。**合成**を選択すると合成が開始され、元の試行を変更せずに新しいチャットが作成されます。
* **Copilot Fusionの比較**:試行、ジャッジ、またはシンセサイザー用に、Fusionおよびそれがサポートする労力階層を選択します。
* **エージェントによる評価の実行(実験的)**: `setting(sessions.chat.compareAgents.tools.enabled)`を有効にすると、エージェントがモデルの発見、比較の起動、結果と会話参照の読み取りを行って、シナリオ全体の調査結果を要約できるようになります。ツールはデフォルトではオフになっており、モデルの比較が有効になっている必要があります。これらを無効にしても、手動の比較は引き続き利用できます。

### キャンバスの改善(プレビュー)

**設定**: `setting(chat.canvases.enabled)`

[キャンバス](https://code.visualstudio.com/docs/agents/run/canvases)は、あなたとCopilotが計画、ダッシュボード、その他のアーティファクトで共同作業を行うための共有のインタラクティブなサーフェスです。このリリースでは、権限プロンプトが追加され、キャンバスの検出と継続性が向上しました：

* **キャンバス拡張機能の権限**: Copilotハーネスセッションでは、キャンバス拡張機能はフックなどの特権機能を初期化する前に承認を求めます。
* **キャンバスの検索と再オープン**:キャンバスメニューでは、**実行中**のキャンバスと、新しいインスタンスを作成できる**利用可能**なキャンバスが区別されます。エージェントウィンドウでは、キャンバスを作成またはインストールするアクションが**さらに検出**の下に表示されます。
* **プロンプトなしでの再開**:非アクティブなCopilotハーネスセッションに戻ると、別のメッセージを送信しなくてもキャンバスが復元されます。
* **よりスムーズな再接続**:キャンバスプロバイダーが再起動している間、最後のキャンバス画像は再接続インジケーターとともに表示されたままになります。
* **チャットと一緒にキャンバスを維持**:個別のチャットウィンドウでは、チャットがウィンドウから離れるとキャンバスタブが閉じ、そのチャットと一緒に再び開くことができます。また、ウィンドウをリロードした後も、フォーカスを奪うことなくキャンバスが復元されます。

### コンピューター共有の構成(実験的)

**設定**: `setting(sessions.chat.experimental.remoteEnvironmentsThisComputer)`

エージェントウィンドウのリモート環境エディターは、リモート接続を管理するための中央の場所です。このリリースでは、このコンピューターを他のクライアントと共有する方法を管理できるようになりました。共有が有効かどうかにかかわらず、ローカルセッションはこのコンピューター上で直接実行され続けます。

GitHub EnvironmentsまたはDev Tunnelsを通じてこのコンピューターを共有するか、共有をオフにします。他のクライアントに表示されるコンピューター名を変更することもできます。

チャットの環境ピッカー、コマンドパレット、またはタイトルバーの**リモート接続**メニュー（アンテナアイコン。ここからも同じ共有オプションを提供しています）から**リモート環境の管理**を選択してエディターを開きます。

![リモート環境エディターの「このコンピューター」セクションを示し、dev-workstationという名前でDev Tunnelsを介した共有が「その他の環境」テーブルの上に表示されているスクリーンショット。](images/1_146/remote-environments-this-computer.webp)

[リモートアクセスのためのホストを利用可能にする方法](https://code.visualstudio.com/docs/agents/run/remote-agent-sessions#_make-a-host-available-for-remote-access)の詳細を確認してください。

### 仮想リポジトリのAgent Hostサポート

VS Codeは仮想ワークスペースをサポートしており、[GitHubリポジトリをクローンせずに表示する](https://code.visualstudio.com/docs/sourcecontrol/github#_github-repositories-extension)ような操作が可能になります。

Copilotハーネスは以前は仮想リポジトリで動作しませんでした。このリリースでは仮想リポジトリのサポートが追加されたため、ローカルフォルダの場合と同じCopilot機能とワークフローを使用できます。

## チャット

### VS CodeでのCopilot CLIセッションの継続(実験的)

VS Code外のターミナルで[GitHub Copilot CLI](https://github.com/features/copilot/cli)を使用しているときに、セッションをVS Codeに移動して続行できるようになりました。

CLIに`/code`を入力するか、VS Code Insidersの場合は`/code-insiders`を入力します。CLIが終了し、VS Codeが実行されていない場合は起動した上で、セッションのフォルダのウィンドウのチャットビューで同じセッションを開きます。セッションは、会話履歴、モデルと推論の労力、モードと権限を維持します。

<video src="images/1_146/copilot-cli-code.mp4" title="Video showing the /code-insiders command in the Copilot CLI launching VS Code Insiders, which opens the same session in the Chat view with its history, model, and permissions." autoplay loop controls muted></video>

`/code`コマンドはCopilot CLIでは実験的です。これには、実験的機能が有効になっている（`/settings experimental on`）Copilot CLI 1.0.107以降が必要です。`--allow-tool`やセッションに対して付与した承認など、CLIプロセスのみに適用される権限は引き継がれず、CLIは引き渡す前にそれらを一覧表示します。別のCopilot CLIプロセスがまだセッションを開いている場合、VS Codeは開く前に確認します。CLIに戻るには、引き渡し時にCLIが表示する`copilot --resume`コマンドを実行します。

### バックグラウンド送信アクションの設定可能なショートカット

**設定**: `setting(chat.sendInBackgroundTip.enabled)`

エージェントウィンドウのコンポーザーで`<kbd title="macOS: ⌥Enter">Alt+Enter</kbd>`を押すと、開かずに新しいセッションを開始できます。**キーボードショートカット**で**チャット:バックグラウンドで送信**のショートカットを再割り当てまたは削除できます。

オプションのヒントに、構成されたショートカットが表示され、**Keyboard Shortcuts**へのリンクが示されます。`setting(chat.sendInBackgroundTip.enabled)`で有効にします（実験的、デフォルトではオフ）。

## MCP

### MCP上のスキル(プレビュー)

**設定**: `setting(chat.agentHost.mcpSkills.enabled)`

このバージョンのVS Codeでは、SEP-2640 [MCP上のスキル](https://github.com/modelcontextprotocol/ext-skills)のサポートが追加され、MCPサーバーがモデルにスキルを自動的に提供できるようになります。

スキルを提供するMCPサーバーに初めて接続するときに、モデルコンテキストへの許可を求められます。その後、モデルはこれらのスキルと対話できるようになり、エージェントカスタマイズエディターの**スキル**タブで確認できます。

## 信頼性とセキュリティ

### 改善された権限プロンプト

Copilotハーネスは以前、Webフェッチ、ターミナルコマンド、ファイル読み取りなどの操作に対して、広範すぎるツールレベルの許可を提案していました。たとえば、URLをフェッチするためのデフォルトのアクションは「このセッションで許可」であり、モデルはそのセッション中に任意のURLにアクセスできるようになっていました。

現在、権限プロンプトはよりきめ細かくなっており、デフォルトで特定のドメイン、コマンド、およびディレクトリの許可を追加します。

### サンドボックスでの環境変数のマスク

**設定**: `setting(chat.agent.sandbox.credentials.envVars)`

機密情報を保護するために、サンドボックス化されたセッションでどの環境変数をマスクし、エージェントツールから隠すかを構成できます。サンドボックス化されたツールはプレースホルダーを受け取り、実際の値は承認されたHTTPS宛先のみに提供されます。

この例では、サンドボックス化によって`API_TOKEN`環境変数の値がプレースホルダーに置き換えられます。実際の値は、`injectHosts`（ここでは`api.example.com`）にリストされているホストへの発信HTTPSリクエストでのみ復元されます。他のホストへのリクエストはプレースホルダーを保持し、実際の値を受け取りません。

```json
{
    "chat.agent.sandbox.credentials.envVars": {
        "API_TOKEN": {
            "injectHosts": ["api.example.com"]
        }
    }
}
```

設定には秘密の値ではなく変数名を入力してください。Windowsでは、環境変数のマスクにローカルネットワークアクセスが必要です。macOSおよびWindowsでは、OS証明書の信頼を必要とするツールに対してサンドボックスCA証明書を信頼してください。

詳細については、[サンドボックスネットワークアクセス](https://code.visualstudio.com/docs/agents/run/agent-sandboxing#_configure-network-access)と[証明書の信頼](https://code.visualstudio.com/docs/agents/run/agent-sandboxing#_trust-the-sandbox-ca-certificate-on-windows-and-macos)を参照してください。

### チャット入力におけるサンドボックスの状態

権限メニューを開かずに、ターミナルサンドボックスが有効になっているかどうかを確認できます。エディターとエージェントウィンドウの両方で、空のチャット入力には、**ターミナル用のサンドボックス化**がオンのときに**(sandbox enabled)**が表示されます。チャットを切り替えたり設定を変更したりしても、プレースホルダーは同期されたままになります。

![チャット入力のプレースホルダーに「Chat with Copilot (sandbox enabled)」と表示されている状態を示すスクリーンショット。](images/1_146/sandbox-enabled-placeholder.webp)


## アクセシビリティ

### ウェルカム画面での視覚的なキーボードフォーカス

ウェルカムページ自体にキーボードフォーカスがある場合、ページに視覚的なアウトラインが表示されるため、ナビゲーション中の位置を追跡できます。このページはスクリーンリーダーユーザーも引き続きフォーカス可能です。

## エディターエクスペリエンス

### Mermaid 12のサポート

VS Codeは、チャット、マークダウンプレビュー、およびノートブックでMermaid図をレンダリングする際にMermaid 12を使用するようになりました。ユースケース図を含む新しい図の種類を使用できるようになり、更新された自動レイアウト動作の恩恵を受けられます。

| 変更前: Mermaid 11 | 変更後: Mermaid 12 |
| --- | --- |
| ![古いフローチャートおよびサブグラフのレイアウトとユースケース図のエラーでレンダリングされたMermaid 11を示すスクリーンショット。](images/1_146/mermaid-11.png) | ![更新されたフローチャートおよびサブグラフのレイアウトとレンダリングされたユースケース図で表示されたMermaid 12を示すスクリーンショット。](images/1_146/mermaid-12.png) |

### 統合ブラウザーでのローカルHTMLファイルのアドレスのコピー

[統合ブラウザー](https://code.visualstudio.com/docs/debugtest/integrated-browser)でローカルHTMLファイルをプレビューするときに、その`file://`アドレスを選択してコピーし、外部ブラウザーやターミナルに貼り付けることができます。

## エンタープライズ

### エンタープライズプロキシの背後にあるCopilotセッション

Copilotセッションは、ローカル、WSL、またはローカルDev Containerで実行されている場合、プロキシ自動構成（PAC）やKerberos認証を含め、VS Codeの[プロキシ構成](https://code.visualstudio.com/docs/setup/network)に従います。組織のルーティングルールにより、単一のプロキシ経由で強制的にリクエストを送信するのではなく、宛先ごとに異なるプロキシまたは直接接続を選択できます。

### ポリシー制限に関する組織のヘルプリンク

組織は、[enterprise-managed settings](https://code.visualstudio.com/docs/enterprise/manage-ai-settings)で`communication.support.url`を設定することにより、ブロックされた開発者を独自のヘルプページに誘導できます。従業員が組織のCopilot使用ポリシーやサポート案内を確認できるページへのURLを指定することをお勧めします。有効な絶対HTTPまたはHTTPS URLを指定すると、無効化されたagentや組織で無効化されたモデルなどのサポート対象のポリシー制限に**Contact Admin**リンクが追加されます。

たとえば、組織のマネージド設定では次のようになります。

```json
{
  "communication": {
    "support": {
      "url": "https://ai.example.com/your-companys-ai-landing-support-page"
    }
  }
}
```

### キャンバス拡張機能のエンタープライズ制御

Copilotハネスセッションでは、`strictPluginOnlyCustomization`によってスタンドアロンのスキル、エージェント、フック、MCPサーバーがすでに制限されていました。今回の更新により、ユーザー、プロジェクト、セッションの各ディレクトリからのスタンドアロンのキャンバス拡張機能もブロックされるようになり、管理者は使用するキャンバス拡張機能が適格なプラグインからのものであることを必須にできるようになりました。

[enterprise-managed settings](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/use-managed-settings/get-started)で`true`を使用すると、サポートされているすべてのスタンドアロンカテゴリをブロックしつつ、適格なプラグインコンテンツを許可できます。

```json
{
  "strictPluginOnlyCustomization": true
}
```

特定のカテゴリのみを制限するには、`true`を`"skills"`、`"agents"`、`"hooks"`、`"mcp"`、`"extensions"`のいずれかを含むリストに置き換えます。

> **メモ:**ブール値のみを受け付けるVS Codeの`ChatStrictPluginOnlyCustomization`ポリシーでは、キャンバス拡張機能は制御されません。これらはCopilot SDKによって管理されるため、前述のCopilot管理設定を使用してください。

ポリシーの詳細については、[enterprise-managed settings reference](https://docs.github.com/en/copilot/reference/enterprise-administrators/enterprise-managed-settings)を参照してください。

## 非推奨となった機能と設定

### このリリースでの新しい非推奨機能

* [ローカルハーネスは非推奨になりました](#copilot-harness-and-deprecation-of-the-local-harness)。2027年2月に削除される予定です。

### 今後非推奨になる予定の機能

なし

## 主な修正

### エージェントの編集メトリックにおける過剰カウントの修正

[GitHub Copilot usage metrics](https://docs.github.com/en/copilot/reference/copilot-usage-metrics)を通じて報告されるエージェントの編集メトリックで、編集間の変更されていないテキストが新しく追加または削除されたコードとしてカウントされないようになりました。

<!-- RELEASE_THANK_YOU_START -->
## 謝辞

### Issueの追跡

Issue追跡への貢献者:

* [@gjsjohnmurray (John Murray)](https://github.com/gjsjohnmurray)
* [@RedCMD (RedCMD)](https://github.com/RedCMD)
* [@IllusionMH (Andrii Dieiev)](https://github.com/IllusionMH)
* [@albertosantini (Alberto Santini)](https://github.com/albertosantini)

### Pull request

`vscode`への貢献:

* [@Aditya-kumar-yadav (Aditya Kumar Yadav)](https://github.com/Aditya-kumar-yadav): terminal: collapseTildePathの部分文字列の衝突と正確なホームの折りたたみを修正[PR #343203](https://github.com/microsoft/vscode/pull/343203)
* [@alok-108 (Alok Pandey)](https://github.com/alok-108): debug:例外ブレークポイントのモードをデバッグアダプターに送信[PR #341972](https://github.com/microsoft/vscode/pull/341972)
* [@andysalerno (Andy Salerno)](https://github.com/andysalerno):エージェントホストチャットにCopilot Fusionの推論を表示[PR #346434](https://github.com/microsoft/vscode/pull/346434)
* [@Carrotstudiosoftwarehouse (Carrotstudio.it)](https://github.com/Carrotstudiosoftwarehouse):プロンプトのURL確認ダイアログで完全なURIにアクセス可能な状態を維持[PR #332937](https://github.com/microsoft/vscode/pull/332937)
* [@Chethan616 (Chethan Krishna)](https://github.com/Chethan616):インラインチャットウィジェットの下の空白部分をクリックしたときにターミナルにフォーカスが当たらない問題を修正[PR #334804](https://github.com/microsoft/vscode/pull/334804)
* [@ericbaum (Eric Baum)](https://github.com/ericbaum): mcp:ホームディレクトリ検出アダプターにURIベースのdefaultCwdを使用[PR #345650](https://github.com/microsoft/vscode/pull/345650)
* [@genius-0963 (Saurabh Sungh)](https://github.com/genius-0963): #345692の修正:新しいドラフトセッションに置き換えるときにドラフトオープンエディターを保持[PR #345807](https://github.com/microsoft/vscode/pull/345807)
* [@LuisPeixoto (Luis Peixoto)](https://github.com/LuisPeixoto): Hooksセクションの説明を修正[PR #346593](https://github.com/microsoft/vscode/pull/346593)
* [@maxteneff (Max Bartenev)](https://github.com/maxteneff):すでに開いているターミナルでparentTerminalが無視される問題を修正[PR #342420](https://github.com/microsoft/vscode/pull/342420)
* [@mcumming (Michael Cummings (MSFT))](https://github.com/mcumming)
  * マーケットプレイスの403応答によって繰り返しサインインが求められる問題を修正[PR #343686](https://github.com/microsoft/vscode/pull/343686)
  * プライベートマーケットプレイスの拡張機能のブロック:ワークベンチのUXの追加とゲーティングの更新[PR #341049](https://github.com/microsoft/vscode/pull/341049)
  * リダイレクト時にオリジン間でリクエストの資格情報を転送しない[PR #343690](https://github.com/microsoft/vscode/pull/343690)
  * マーケットプレイスの保護されたリソースディスカバリーをキャッシュおよび合流[PR #343687](https://github.com/microsoft/vscode/pull/343687)
* [@minwookshin (Minwook Shin)](https://github.com/minwookshin):明示的なインライン編集ガターメニューの表示設定を尊重[PR #339575](https://github.com/microsoft/vscode/pull/339575)
* [@monil-patel](https://github.com/monil-patel): VS Codeの設定を通じたポリシーヘルパーの登録を許可[PR #345712](https://github.com/microsoft/vscode/pull/345712)
* [@nkramber](https://github.com/nkramber)
  * ターミナルエディターを別のエディターグループに移動した後も動作し続けるように修正[PR #339488](https://github.com/microsoft/vscode/pull/339488)
  * PATHにない場合にログインシェルパスでターミナルプロファイルを検索[PR #339556](https://github.com/microsoft/vscode/pull/339556)
* [@RealThanhNguyxn (Thanh Nguyen)](https://github.com/RealThanhNguyxn):プロセスセスクマンドパス内の未解決の変数を保持(fixes #160891) [PR #316369](https://github.com/microsoft/vscode/pull/316369)
* [@rksharma-owg (RKS)](https://github.com/rksharma-owg)
  * tasks:プロバイダーのファンアウトを防ぐためにITaskHandleDTOを介してタスクタイプを渡す[PR #336159](https://github.com/microsoft/vscode/pull/336159)
  * 完了通知の前に最後のタスクマーカーをフラッシュ[PR #339551](https://github.com/microsoft/vscode/pull/339551)
  * 同じリソースからの個別のタスクエラーを保持[PR #339550](https://github.com/microsoft/vscode/pull/339550)
* [@ShehabSherif0 (Shehab Sherif)](https://github.com/ShehabSherif0):アクセシビリティシグナルプロパティ変更検知における重複した条件を修正[PR #303604](https://github.com/microsoft/vscode/pull/303604)
* [@SimonSiefke (Simon Siefke)](https://github.com/SimonSiefke)
  * perf:多数のテストを実行するときのTest Explorerのパフォーマンスを向上[PR #345896](https://github.com/microsoft/vscode/pull/345896)
  * fix:ノートブックテキスト差分エディターのメモリリークを修正[PR #331805](https://github.com/microsoft/vscode/pull/331805)
  * fix:カラーピッカーのメモリリークを修正[PR #345461](https://github.com/microsoft/vscode/pull/345461)
  * fix: aiSearchModelのメモリリークを修正[PR #342528](https://github.com/microsoft/vscode/pull/342528)
  * fix:ファイル検索リスナーのメモリリークを修正[PR #345781](https://github.com/microsoft/vscode/pull/345781)
  * fix:ターミナル検索ウィジェットのメモリリークを修正[PR #346139](https://github.com/microsoft/vscode/pull/346139)
  * fix:検索進捗エミッターのメモリリークを修正[PR #346126](https://github.com/microsoft/vscode/pull/346126)
  * perf:メモリ使用量を24 kB削減[PR #342397](https://github.com/microsoft/vscode/pull/342397)
  * fix:タスクプロバイダーのカウンターバグを修正[PR #339387](https://github.com/microsoft/vscode/pull/339387)
  * fix:マーカーリソースマップのメモリリークを修正[PR #346501](https://github.com/microsoft/vscode/pull/346501)
  * fix: debouncedObservableのメモリリークを修正[PR #346498](https://github.com/microsoft/vscode/pull/346498)
  * fix:キーバインド検索のメモリリークを修正[PR #346268](https://github.com/microsoft/vscode/pull/346268)
* [@sumit-2007-git (Sumit kumar)](https://github.com/sumit-2007-git): fix(chat):狭いチャットでのオーバーフローを防ぐために提案されたプロンプトタイトルを切り詰める(fixes #275257) [PR #345436](https://github.com/microsoft/vscode/pull/345436)
* [@vscodebot-pr (VS Code PR Bot)](https://github.com/vscodebot-pr)
  * fix:レンダラーがアタッチされる前のターミナルスクロール操作をガード(fixes #339313) [PR #339330](https://github.com/microsoft/vscode/pull/339330)
  * fix:セル破棄中のノートブックカーソル選択の表示をガード(fixes #328986) [PR #329000](https://github.com/microsoft/vscode/pull/329000)
* [@xingsy97 (xingsy97)](https://github.com/xingsy97): terminal:先読み予測が無効なスタイルシーケンスを誤って拒否する問題を修正[PR #305103](https://github.com/microsoft/vscode/pull/305103)
* [@zohnannor](https://github.com/zohnannor): fix:ミニマップに常に不透明度が適用される原因となる回帰を修正[PR #311689](https://github.com/microsoft/vscode/pull/311689)

<!-- RELEASE_THANK_YOU_END -->
---

新機能の準備ができ次第すぐにお試しいただけることを大変嬉しく思っております。ぜひ頻繁にこちらを確認して、新機能をご確認ください。

>過去のVS Codeバージョンのリリースノートを読むには、[code.visualstudio.com](https://code.visualstudio.com)の[Updates](https://code.visualstudio.com/updates)にアクセスしてください。

<a id="scroll-to-top" role="button" title="Scroll to top" aria-label="scroll to top" href="#"><span class="icon"></span></a>
<link rel="stylesheet" type="text/css" href="css/inproduct_releasenotes.css"/>
