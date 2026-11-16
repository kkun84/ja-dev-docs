---
title: "GitHubでのCopilot in the cloudの使用"
shortTitle: "GitHubでCopilot in the cloudを使用する"
allowTitleToDifferFromFilename: true
intro: "GitHub上で直接Copilot in the cloudセッションを開始し、ブラウザを離れることなく結果をブラッシュアップします。"
product: '{% data reusables.gated-features.copilot-in-the-cloud %}<br><a href="https://github.com/features/copilot/plans?ref_product=copilot&ref_type=purchase&ref_style=button&utm_source=use-cloud-gh-purchase&utm_medium=docs&utm_campaign=universe-2026" target="_blank" class="btn btn-primary mt-3 mr-3 no-underline"><span>Sign up for {% data variables.product.prodname_copilot_short %}</span> {% octicon "link-external" height:16 %}</a>'
versions:
  feature: copilot
redirect_from:
  - /copilot/how-tos/copilot-on-github/use-copilot-agents/iterate-with-copilot
  - /copilot/how-tos/use-copilot-agents/coding-agent/make-changes-to-an-existing-pr
  - /copilot/how-tos/use-copilot-agents/cloud-agent/make-changes-to-an-existing-pr
contentType: how-tos
category:
  - Author and optimize with Copilot
---

## はじめに

GitHub上のさまざまな場所からGitHub Copilot in the cloudセッションを開始できます。セッションの実行が開始されたら、その進捗を監視し、フォローアッププロンプトで指示を与え、ブラウザを離れることなく結果のpull requestをブラッシュアップできます。

Copilot in the cloudの詳細については、[AUTOTITLE](/copilot/concepts/copilot-surfaces/copilot-on-github)を参照してください。

agent appsを使用して、これらと同じエントリーポイントからパートナー製エージェントを開始することもできます。詳細については、[AUTOTITLE](/copilot/how-tos/use-copilot-agents/cloud-agent/use-agent-apps)を参照してください。

## Copilot in the cloudセッションの開始

さまざまな異なるエントリーポイントからセッションを開始できます。

* [github.com/copilot](https://github.com/copilot?ref_product=copilot&ref_type=engagement&ref_style=text&utm_source=cloud-gh-docs-home-cta&utm_medium=docs&utm_campaign=universe-2026)にあるCopilot {% octicon "home" aria-label="The home icon" %}ホームペ－ジ。
* [https://github.com](https://github.com?ref_product=copilot&ref_type=engagement&ref_style=text)にサインインしているときの、{% octicon "mark-github" aria-label="The github octocat logo" %} GitHubパーソナルダッシュボードまたは{% octicon "home" aria-label="The home icon" %}ホームページ。
* リポジトリ内の**{% octicon "agent" aria-label="The Agents icon" %} Agents**タブまたはパネル。

デフォルト設定のまますぐにプロンプトを送信することも、プロンプトを送信する前にタスクに合わせてセッションを設定することもできます。

1. プロンプトボックスに、Copilotに実行させたい内容を入力します。希望する成果物と制約事項を含めます。

   > [!TIP]
   > また、プロンプト内でスラッシュコマンドを使用して特定のアクションを実行することもできます。たとえば、第2の意見を得るための`/rubber-duck`、リポジトリに脆弱性がないかレビューするための`/security-review`、セッションの使用状況情報を表示するための`/usage`などがあります。

1. 必要に応じて、**{% octicon "plus" aria-hidden="true" aria-label="plus" %}添付**をクリックして、Copilotのリクエストに関するリファレンスを指定します。

   **ファイルとフォルダ**、**コンピュータからアップロード**、**リポジトリ**、または**スペース**を選択して、リクエストのコンテキストを提供します。

   クラウドサンドボックスセッションでは、コネクターやパーソナルカスタムMCPサーバーを設定することで、サードパーティのソースから追加のコンテキストを提供できます。[AUTOTITLE](/copilot/concepts/customizations/copilot-connectors)および[AUTOTITLE](/copilot/concepts/customizations/mcp#personal-mcp-servers)を参照してください。

1. **モード**ピッカーを開いて、Copilotとの連携方法を選択します。

   * **対話型**:（デフォルト）Copilotとステップバイステップで作業します。
   * **オートパイロット**:タスクをCopilotに委任して、エンドツーエンドで実行させます。

   同じメニューで、**ツール権限**を使用してツールリクエストの承認方法を制御します。

   * **アシスト付き**（デフォルト）を選択すると、安全性チェックを使用してリクエストを承認するかどうかを決定するか、ユーザーに確認します。
   * **常に確認する**を選択すると、リクエストごとに承認が必要になります。
   * **すべてを許可**を選択すると、すべてのツール、パス、URLのリクエストが自動的に承認されます。

1. **モデル**ピッカーを開き、**自動**（デフォルト）または特定のモデルを選択します。モデルは、速度とコスト効率、汎用性と知能、または複雑なタスクの処理能力のいずれかを選択しやすいように、長所ごとにグループ化されています。**バランス**などの設定可能な推論をサポートするモデルを選択した場合は、ドロップダウンメニューを使用して推論レベルを選択することもできます。

1. プロンプトボックスの下にある**チャット**セッションのコンテキストピッカーを使用して、セッションのスコープ（個人、組織、またはリポジトリ）を選択します。

   * 検索ボックスに追加するリポジトリ名を入力して検索します。
   * **リポジトリを横断して質問する**の下で、**チャット**を選択してリポジトリを横断して質問します。デフォルトのスコープは個人のリポジトリです。右側の画像をクリックしてアカウントメニューを開き、組織を選択するか、リポジトリの所有者（ユーザーまたは組織）で検索してスコープを変更します。
   * **リポジトリで作業する**の下で、作業する最近のリポジトリを選択します。リストされるリポジトリは、選択したスコープを反映します。

   > [!NOTE]
   > * **添付**メニュー（前のステップ）からリポジトリを追加すると、プロンプトのリファレンス（コンテキスト資料）が提供されます。一方、ここで**セッションの開始**の下で選択すると、そのリポジトリがセッションの作業リポジトリ（スコープ）になります。セッションの開始時に、クラウドサンドボックスはそのリポジトリのコピーを作成し、既存の制約の範囲内でそのコンテンツを処理する権限をCopilotに付与します。
   > * リポジトリが表示されない場合は、個人の設定、組織、またはエンタープライズポリシーによってCopilotから除外されている可能性があります。

   任意で、上記でリポジトリを選択している場合は、**main**（または表示されているデフォルトブランチ名）をクリックして、Copilotが作業コンテキストとして使用し、その中で操作するブランチを選択することもできます。

{% data reusables.copilot.environment-picker %}

1. **メッセージを送信**をクリックするか、<kbd>Enter</kbd>キーを押してプロンプトを送信し、セッションを開始します。

Copilotは、選択されたコンテキストと環境に基づいてプロンプトに応答し、セッションを開始します。要求された場合、Copilotは変更されたファイルのリスト、pull request、生成された成果物（リサーチプランなど）、およびその他の関連する出力を生成します。

### ファイル、issue、またはpull request内からのCopilotの開始

コンテキストページからCopilotとのチャットセッションを開くと、セッションは開いているファイル、issue、またはpull requestのコンテキストから始まります。

コンテキストパネル内から新しいエージェントセッションを開始することはできません。Copilotページ、ホームページ、またはエージェントタブから開始する必要があります。

## Copilot cloud agentによるセッションの開始

### エージェントタブまたはパネルからのセッションの開始

エージェントタブとエージェントパネルからセッションを開始できます。唯一の違いはエントリーポイントです。「新規エージェントタスク」フォームが表示されたら、その後の手順は同じです。

{% data reusables.copilot.open-agents-panel-or-page %}
{% data reusables.copilot.cloud-agent.new-agent-task-form-instructions %}

### ダッシュボードからのセッションの開始

ダッシュボードのプロンプトボックスからCopilotに作業の開始を依頼できます。ダッシュボードは、ログインした状態で[https://github.com](https://github.com)にアクセスしたときに表示される、GitHubでのアクティビティをパーソナライズして概要を示したものです。

1. [https://github.com](https://github.com/?ref_product=desktop&ref_type=engagement&ref_style=text)のダッシュボードに移動します。
1. **{% octicon "agent" aria-label="The Agents icon" %} Task**ボタンをクリックします。
1. プロンプトフィールドのドロップダウンメニューを使用して、Copilotに作業させたいリポジトリを選択します。
1. リクエスト内容を説明するプロンプトを入力します。

    たとえば、`Implement a user friendly message for common errors.`のように入力します。

    Copilotにpull requestを開いてほしい場合は、たとえば`Open a pull request to implement a user friendly message for common errors.`のようにプロンプトで依頼できます。

1. オプションで、Copilotのpull requestのベースブランチを選択します。Copilotはこのブランチに基づいて新しいブランチを作成します。{% data reusables.copilot.optional-select-custom-agent-dotcom %}
1. **{% octicon "paper-airplane" aria-label="Send now" %} Send now**をクリックするか、<kbd>Return</kbd>キーを押します。

   エージェントタブに移動し、Copilotが新しいセッションを開始します。これはプロンプトボックスの下の「Recent sessions」リストに表示されます。Copilotはタスクに取り組み、コードの変更をプッシュします。

   > [!NOTE]
   > 機能プレビューで**新機能ダッシュボード**を有効にしている場合、新しいセッションはダッシュボードのプロンプトボックスの下にある「Agent sessions」に表示されます。詳細については、[AUTOTITLE](/account-and-profile/reference/personal-dashboard#home-dashboard-view)を参照してください。

### Copilot Chatからの開始

Copilot Chatからタスクを開始すると、新しいCopilot cloud agentセッションには現在のチャット会話のコンテキストが組み込まれます。つまり、`/task`のプロンプトでCopilotにすでに伝えた詳細を言い直す必要はありません。

1. GitHub.comでGitHub Copilot Chatを開きます。
1. `/task`と入力してCopilotにpull requestの作成を依頼し、Copilotに変更させたい内容の詳細を指定します。

   たとえば、`/task Create a pull request to put backticks around file names and variables in output.`のように入力します。

1. オプションで、Copilotのpull requestのベースブランチを選択します。Copilotはこのブランチに基づいて新しいブランチを作成し、そのブランチをターゲットとするpull requestに変更をプッシュします。{% data reusables.copilot.optional-select-custom-agent-dotcom %}
1. **{% octicon "paper-airplane" aria-label="Start task" %}**をクリックするか、<kbd>Enter</kbd>キーを押します。

   Copilotが新しいセッションを開始し、プロンプトボックスの下のリストに表示されます。Copilotはタスクに取り組み、pull requestに変更をプッシュし、完了するとレビュアーとしてあなたを追加して通知をトリガーします。

## Copilotへのissueの割り当て

issueをCopilotに割り当てることで、Copilotにissueの作業を開始するよう依頼できます。Copilotはタスクの作業を開始し、pull requestを作成し、完了するとあなたにレビューを依頼します。

> [!NOTE]
> この機能はpublic previewであり、変更される可能性があります。

{% data reusables.repositories.navigate-to-repo %}
{% data reusables.repositories.sidebar-issues %}

1. Copilotに割り当てたいissueを開きます。
1. 右側のメニューで、**Assignees**をクリックします。

   ![issueの右サイドバーのスクリーンショット。「Assignees」というラベルの付いたヘッダーが濃いオレンジ色で囲まれています。](/assets/images/help/issues/assignee-menu.png)

1. 割り当て担当者のリストから**Copilot**をクリックします。

   ![issueの「Assignees」ウィンドウのスクリーンショット。リストにCopilotが含まれています。](/assets/images/help/copilot/cloud-agent/assign-to-copilot.png)

   追加のオプションが表示されます。

   ![ターゲットリポジトリ、開始ブランチ、custom agent、および追加の指示のオプションを示す「Assign to Copilot」ダイアログのスクリーンショット。](/assets/images/help/copilot/cloud-agent/assign-to-copilot-dialog.png)

1. **Optional prompt**フィールドで、Copilotに対する具体的なガイダンスを追加できます。Copilotがタスクを理解して完了するのに役立つコンテキスト、制約、または具体的な要件を追加します。

   たとえば、使用する特定のコーディングパターンやフレームワーク、テスト要件、コードスタイルの好み、変更すべきまたは変更すべきでないファイルやディレクトリに関する指示を含めることができます。

   ここで指定する詳細に加えて、Copilotはターゲットリポジトリに対して設定されたカスタムインストラクションを使用します。[AUTOTITLE](/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions)を参照してください。

1. ダイアログのドロップダウンメニューを使用して、Copilotが作業するリポジトリと、分岐元となるブランチを変更できます。

   読み取りアクセス権を**少なくとも**持っているすべてのリポジトリが、リポジトリのドロップダウンメニューに表示されます。ただし、そのリポジトリに対する書き込みアクセス権があり、**かつ**そのリポジトリでCopilot cloud agentが有効になっている場合にのみ、リポジトリを選択できます。

   issueの元となった組織とは異なる組織のリポジトリを選択した場合、またはissueがプライベートリポジトリにあるときにパブリックリポジトリを選択した場合は、警告が表示されます。

   リポジトリを指定しない場合、Copilotはissueと同じリポジトリで作業します。ブランチを指定しない場合、Copilotは選択したリポジトリのデフォルトブランチから作業します。

   > [!TIP]
   > Copilotにissueを割り当てると、issueのタイトル、説明、既存のコメント、および提供した追加の指示が送信されます。issueを割り当てた後、Copilotはその後にissueに追加されたコメントを認識しないため、それに対して反応しません。追加の情報や元の要件からの変更がある場合は、Copilotが作成するpull requestのコメントとして追加してください。

{% data reusables.copilot.optional-select-custom-agent-dotcom %}
{% data reusables.copilot.optional-select-copilot-cloud-agent-model %}

GitHub.com上の他の場所からも、Copilotにissueを割り当てることができます。

* リポジトリの**{% octicon "issue-opened" aria-hidden="true" aria-label="issue-opened" %} Issues**ページのissueリストから。
* GitHub Projectsでissueを表示しているとき。

## 新しいリポジトリの初期化

新しいリポジトリを作成する際、プロンプトを入力してCopilotに新しいリポジトリの初期化を依頼できます。

{% data reusables.repositories.create_new %}
{% data reusables.repositories.owner-drop-down %}
1. **Prompt**フィールドに、Copilotに構築させたい内容を説明するプロンプトを入力します。

    たとえば、`Create a Rust CLI for converting CSV spreadsheets to Markdown` {% data reusables.repositories.create-repo %}のように入力します。

    Copilotはすぐにドラフトのpull requestを開きます。Copilotはタスクに取り組み、pull requestに変更をプッシュし、完了するとレビュアーとしてあなたを追加して通知をトリガーします。

## 失敗したGitHub Actionsワークフロー実行の修正

pull requestのブランチでGitHub Actionsのワークフロー実行が失敗した場合は、Copilotに調査と修正を依頼できます。

1. GitHubで、失敗したワークフロー実行のジョブページに移動します。
1. **{% octicon "agent" aria-label="The Agents icon" %} Fix with Copilot**ボタンをクリックします。

   Copilotが新しいセッションを開始し、失敗の原因を調査して、ブランチに修正をプッシュします。

## pull requestでの作業の継続

既存のpull requestに対する変更やレビューコメントへの対応をCopilotに依頼できます。その後、結果のセッションを追跡し、フォローアップの指示を提供できます。

### Copilotへの変更の依頼

任意のpull requestのコメントで`@copilot`をメンションして、Copilotに変更を依頼できます。これは、Copilotが作成したpull requestや、あなたや他の人が作成したpull requestで機能します。

デフォルトでは、Copilotはpull requestのブランチに直接コミットをプッシュします。代わりに別のpull requestを作成するには、その旨をコメントに記述します。自分でブランチをチェックアウトして変更をプッシュすることもできます。

GitHubのWebインターフェースからpull requestのコメント（レビューやレビューコメントではない）を送信する際は、モデルピッカーでモデルを選択します。Copilotはデフォルトで元のpull requestのモデルを使用します。

### レビューコメントの委任

レビューコメントを委任して、人間のレビュアーやGitHub Copilot code reviewからのフィードバックをCopilotに実装させることができます。

1. pull requestで、**Files changed**タブを開きます。
1. Copilotに実装させたい最初のレビューコメントに移動します。
   * 1つのコメントを委任するには、**Fix with Copilot**をクリックします。
   * 複数のコメントを委任するには、**Add to batch**をクリックします。Copilotに作業させたいコメントを追加し続けます。
1. **Manage batch**パネルで、追加の指示を記述し、必要に応じてモデルピッカーでモデルを選択します。
1. Copilotにどのように変更を適用させるかを選択します。
   * 変更をブランチに直接コミットするには、**{% octicon "agent" aria-label="The Agents icon" %} Fix and commit**をクリックします。
   * 変更を含む新しいpull requestをCopilotに作成させるには、ドロップダウンメニューから**Fix and open pull request**をクリックします。

### セッションの追跡と継続

{% data reusables.copilot.cloud-agent.write-access-required %}

コメントに応答してCopilotが新しいセッションを開始すると、コメントに目が描かれた絵文字（👀）のリアクションが表示されます。pull requestのタイムラインに「Copilot has started work」イベントが表示されます。

![目のリアクションと「Copilot started work」タイムラインイベントが付いたレビューコメントが表示されているpull requestのタイムラインのスクリーンショット。](/assets/images/help/copilot/cloud-agent/comment-to-agent-on-pr.png)

Copilotは同じpull requestでの以前のセッションのコンテキストを記憶しているため、フォローアップのリクエストがより速く、より確実になります。pull requestがcustom agentによって作成された場合、`@copilot`をメンションすると同じエージェントが引き続き使用されます。

## マージ競合の解決

pull requestのマージ競合を解決するようにCopilotに依頼する方法には、次の2つがあります。

* **「Fix with Copilot」ボタンの使用**: pull requestにマージ競合がある場合は、マージボックスに表示される**Fix with Copilot**ボタンをクリックします。
* **@copilotメンションの使用**: pull requestのコメント内で`@copilot`をメンションし、競合の修正を依頼します（例：「@copilot resolve the merge conflicts on this PR.」）。

Copilotは競合している変更を分析し、それらを解決して、ビルド、テスト、およびリンターが引き続き合格することを確認します。その後、マージする前に解決を確認できるように、レビューを依頼します。

## automationsによるCopilotの自動実行

スケジュールに従って、またはissueのオープンなどのイベントに応答して、Copilotを自動的に実行するようにautomationsを設定できます。リポジトリの**Agents**タブにある**Automations**ペインからautomationsを作成および管理します。詳細については、[AUTOTITLE](/copilot/how-tos/use-copilot-agents/cloud-agent/create-automations)を参照してください。

## GitHub Actionsワークフロー実行の管理

{% data reusables.copilot.cloud-agent-workflow-run-approval-default %}詳細については、[AUTOTITLE](/copilot/how-tos/use-copilot-agents/cloud-agent/configuring-agent-settings)を参照してください。

## Copilotの作業に対するフィードバックの提供

Copilotのpull requestやコメントにあるフィードバックボタンを使用して、出力を評価します。あなたのフィードバックはCopilotの品質向上に役立ちます。

1. Copilotからのpull requestまたはコメントで、親指を立てる（:+1:）または親指を下げる（:-1:）ボタンをクリックします。
1. 親指を下げるボタンをクリックした場合は、必要に応じて理由を選択してコメントを残し、**Submit feedback**をクリックします。

## さらに読む

* [AUTOTITLE](/copilot/concepts/copilot-surfaces/copilot-on-github)
* [AUTOTITLE](/copilot/tutorials/cloud-agent/get-the-best-results)
* [AUTOTITLE](/copilot/how-tos/use-copilot-agents/cloud-agent/troubleshoot-cloud-agent)
