---
title: "GitHubでのCopilot in the cloudの使用"
shortTitle: "GitHubでCopilot in the cloudを使用する"
allowTitleToDifferFromFilename: true
intro: "GitHub上でCopilot in the cloudセッションを直接開始し、ブラウザを離れることなく結果を反復処理します。"
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

GitHub上のさまざまな場所から、GitHub Copilot in the cloudセッションを開始できます。セッションの実行が開始されたら、ブラウザを離れることなく、その進捗を監視したり、追加のプロンプトで指示を与えたり、結果として作成されたpull requestを改善したりすることができます。

Copilot in the cloudの詳細については、[GitHub Copilot on GitHub.com and GitHub Mobile](/copilot/concepts/copilot-surfaces/copilot-on-github)を参照してください。

また、これらの同じエントリーポイントから、agent appsを使用してパートナー製のエージェントを開始することもできます。詳細については、「[Using agent apps](/copilot/how-tos/use-copilot-agents/cloud-agent/use-agent-apps)」を参照してください。

## Copilot in the cloudセッションの開始

いくつかの異なるエントリーポイントからセッションを開始できます。

* [github.com/copilot](https://github.com/copilot?ref_product=copilot&ref_type=engagement&ref_style=text&utm_source=cloud-gh-docs-home-cta&utm_medium=docs&utm_campaign=universe-2026)にあるあなたのCopilotホームぺージ。
* [https://github.com](https://github.com?ref_product=copilot&ref_type=engagement&ref_style=text)にサインインしているときの、GitHubのパーソナルダッシュボードまたはホームページ。
* リポジトリ内の** Agents**タブまたはパネル。

デフォルトの設定のまますぐにプロンプトを送信することも、タスクに合わせてセッションを設定してからプロンプトを送信することもできます。

1. プロンプトボックスに、Copilotに実行させたい内容を入力します。希望する結果と制約事項を含めてください。

   > [!TIP]
   > また、プロンプト内でスラッシュコマンドを使用して特定のアクションを実行することもできます。たとえば、第2の意見を得るための`/rubber-duck`、リポジトリの脆弱性をレビューするための`/security-review`、セッションの使用状況情報を表示するための`/usage`などがあります。

1. オプションで、** Attach**をクリックして、Copilotのリクエストに対する参照情報を指定します。

   **Files and folders**、**Upload from computer**、**Repository**、または**Space**を選択して、リクエストのコンテキストを提供します。

   クラウドサンドボックスセッションの場合、コネクタやパーソナルカスタムMCPサーバーを設定することで、サードパーティのソースから追加のコンテキストを提供できます。「[Copilot connectors](/copilot/concepts/customizations/copilot-connectors)」および「[Model Context Protocol (MCP)](/copilot/concepts/customizations/mcp#personal-mcp-servers)」を参照してください。

1. **Mode**ピッカーを開いて、Copilotとの連携方法を選択します。

   * **Interactive**:（デフォルト）Copilotとステップバイステップで作業します。
   * **Autopilot**:エンドツーエンドの実行をCopilotに委任します。

   同じメニューで、**Tool permissions**を使用してツールリクエストの承認方法を制御します。

   * **Assisted**（デフォルト）を選択すると、セキュリティチェックを使用してリクエストを承認するかどうかを判断するか、あなたに確認します。
   * **Always ask**を選択すると、リクエストごとに承認が必要になります。
   * **Allow all**を選択すると、すべてのツール、パス、およびURLのリクエストが自動的に承認されます。

1. **Models**ピッカーを開き、**Auto**（デフォルト）または特定モデルを選択します。モデルは、速度とコスト効率、汎用性と知能、または複雑なタスクへの適性の間で選択しやすくするために、その強みごとにグループ化されています。選択したモデルが**Balance**などの設定可能な推論をサポートしている場合は、ドロップダウンメニューを使用して推論レベルを選択することもできます。

1. プロンプトボックスの下にある**Chat**セッションコンテキストピッカーを使用して、セッションのスコープ（個人、組織、またはリポジトリ）を選択します。

   * 検索ボックスにリポジトリ名を入力して、追加するリポジトリを検索します。
   * **Ask anything across repositories**で、**Chat**を選択してリポジトリ横断的に質問します。デフォルトのスコープはあなたの個人リポジトリです。右側の画像をクリックしてアカウントメニューを開き、組織を選択するか、リポジトリ所有者（ユーザーまたは組織）で検索してスコープを変更します。
   * **Work in a repository**で、作業する最近のリポジトリを選択します。リストされるリポジトリは、選択されたスコープを反映します。

   > [!NOTE]
   > * （前のステップの）**Attach**メニューからリポジトリを追加すると、プロンプトの参照資料（コンテキスト素材）が提供されます。一方、ここで**Start a session**の下で選択すると、そのリポジトリがセッションの作業リポジトリ（スコープ）になります。セッションの開始時に、クラウドサンドボックスはそのリポジトリのコピーを取得し、既存の制約内でそのコンテンツを操作する権限をCopilotに付与します。
   > * リポジトリがリストに表示されない場合、個人の設定、組織、またはエンタープライズのポリシーによってCopilotから除外されている可能性があります。

   オプションで、上記でリポジトリを選択している場合は、**main**（またはリストされているデフォルトのブランチ名）をクリックして、Copilotが作業コンテキストとして使用し、その中で操作を行うブランチを選択することもできます。

1. ** Environment**を開いて、Copilotの実行場所を選択します。

   * **Cloud**:（デフォルト）GitHubがホストするクラウドサンドボックスで実行します。
   * **Actions**: GitHub Actionsベースの環境で実行します。事前にChatセッションのコンテキストを選択している場合、このセッションの環境として選択することはできません。
   * **Environments**:リストを展開し、リストされているリモート環境のいずれかを選択します。

1. **Send message**をクリックするか、<kbd>Enter</kbd>キーを押してプロンプトを送信し、セッションを開始します。

Copilotはプロンプトに応答し、選択されたコンテキストと環境に基づいてセッションを開始します。要求された場合、Copilotは変更されたファイルのリスト、pull request、生成された成果物（リサーチプランなど）、およびその他の関連する出力を生成します。

### ファイル、issue、またはpull request内からのCopilotの開始

コンテキストページからCopilotとのチャットセッションを開くと、セッションは、開いているファイル、issue、またはpull requestのコンテキストを引き継いで開始されます。

コンテキストパネル自体から新しいエージェントセッションを開始することはできません。Copilotページ、ホームページ、またはエージェントタブから開始する必要があります。

## Copilot cloud agentでのセッションの開始

### エージェントタブまたはパネルからのセッションの開始

エージェントタブやエージェントパネルからセッションを開始できます。唯一の違いはエントリーポイントであり、「新しいエージェントタスク」フォームが表示されたら、その後の手順は同じです。

1. エージェントパネルまたはタブを開きます。

   * リポジトリ内の** Agents**タブを開きます。
   * **GitHub Copilotのすべてのセッションページに移動する**: [github.com/copilot](https://github.com/copilot?ref_product=copilot&ref_type=engagement&ref_style=text&utm_source=open-agent-panel-reusable-home&utm_medium=docs&utm_campaign=universe-2026)にアクセスします。トップナビゲーションバーのGitHub Copilotメニューを開き、**View all sessions**をクリックすることでもここにアクセスできます。
   * **エージェントパネルを開く**:リポジトリのコードタブで、「Go to file」検索バーの右側をクリックします。
1. プロンプトフィールドのドロップダウンメニューを使用して、Copilotに作業させたいリポジトリを選択します。
1. ** Environment**を開いて、Copilotの実行場所を選択します。

   * **Cloud**:（デフォルト）GitHubがホストするクラウドサンドボックスで実行します。
   * **Actions**: GitHub Actionsベースの環境で実行します。事前にChatセッションのコンテキストを選択している場合、このセッションの環境として選択することはできません。
   * **Environments**:リストを展開し、リストされているリモート環境のいずれかを選択します。
1. リクエストを説明するプロンプトを入力します。スクリーンショットやUIモックアップなどの視覚的な入力を、画像の貼り付け、ドラッグ、またはアップロードによって追加することもできます。サポートされているファイル: image/png、image/jpeg、image/gif、image/webp。

    たとえば、`Implement a user friendly message for common errors.`などです。

    Copilotにpull requestを開かせたい場合は、プロンプトでたとえば`Open a pull request to implement a user friendly message for common errors.`のように依頼できます。

1. オプションで、Copilotの変更のベースブランチを選択します。Copilotはこのブランチに基づいて新しいブランチを作成します。
1. オプションで、特殊な動作やツールを持つエージェントまたはcustom agentを割り当てたい場合は、クリックしてエージェントドロップダウンメニューを開くことができます。リポジトリ、組織、またはエンタープライズから既存のcustom agentを選択できます。また、** Create an agent**をクリックして、選択したリポジトリとブランチに新しいagent profileを作成することもできます。詳細については、「[Creating custom agents for Copilot cloud agent](/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/create-custom-agents)」を参照してください。
    > [!NOTE]サードパーティのコーディングエージェントは、すべての有料の[Copilotプラン](/copilot/get-started/plans)で利用できます。
1. オプションで、ドロップダウンメニューを使用してCopilotが使用するモデルを選択できます。選択したモデルが設定可能な推論をサポートしている場合は、ドロップダウンメニューを使用して推論レベルを選択することもできます。詳細については、「[Changing the AI model for GitHub Copilot cloud agent](/copilot/how-tos/use-copilot-agents/cloud-agent/changing-the-ai-model)」を参照してください。
1. ****をクリックするか、<kbd>Enter</kbd>キーを押します。

    Copilotが新しいセッションを開始し、プロンプトボックスの下のリストに表示されます。Copilotはタスクに取り組み、コードの変更をプッシュします。

    セッションログから1クリックでCopilotの作業を追跡し、pull requestを開くことができます。詳細については、「[Managing agent sessions](/copilot/how-tos/copilot-on-github/use-copilot-agents/manage-and-track-agents)」を参照してください。

### ダッシュボードからのセッションの開始

ダッシュボードのプロンプトボックスからCopilotに作業の開始を依頼できます。ダッシュボードは、GitHubでのアクティビティのパーソナライズされた概要であり、ログインした状態で[https://github.com](https://github.com)にアクセスしたときに表示されます。

1. [https://github.com](https://github.com/?ref_product=desktop&ref_type=engagement&ref_style=text)にあるダッシュボードに移動します。
1. ** Task**ボタンをクリックします。
1. プロンプトフィールドのドロップダウンメニューを使用して、Copilotに作業させたいリポジトリを選択します。
1. リクエストを説明するプロンプトを入力します。

    たとえば、`Implement a user friendly message for common errors.`などです。

    Copilotにpull requestを開かせたい場合は、プロンプトでたとえば`Open a pull request to implement a user friendly message for common errors.`のように依頼できます。

1. オプションで、Copilotのpull requestのベースブランチを選択します。Copilotはこのブランチに基づいて新しいブランチを作成します。
1. オプションで、特殊な動作やツールを持つエージェントまたはcustom agentを割り当てたい場合は、クリックしてエージェントドロップダウンメニューを開くことができます。リポジトリ、組織、またはエンタープライズから既存のcustom agentを選択できます。また、** Create an agent**をクリックして、選択したリポジトリとブランチに新しいagent profileを作成することもできます。詳細については、「[Creating custom agents for Copilot cloud agent](/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/create-custom-agents)」を参照してください。
    > [!NOTE]サードパーティのコーディングエージェントは、すべての有料の[Copilotプラン](/copilot/get-started/plans)で利用できます。
1. ** Send now**をクリックするか、<kbd>Return</kbd>キーを押します。

   エージェントタブに移動し、Copilotが新しいセッションを開始します。これはプロンプトボックスの下の「Recent sessions」リストに表示されます。Copilotはタスクに取り組み、コードの変更をプッシュします。

   > [!NOTE]
   > 機能プレビューで**New Dashboard Experience**を有効にしている場合、新しいセッションはダッシュボードのプロンプトボックスの下にある「Agent sessions」に表示されます。詳細については、「[Personal dashboard](/account-and-profile/reference/personal-dashboard#home-dashboard-view)」を参照してください。

### Copilot Chatからの開始

Copilot Chatからタスクを開始すると、新しいCopilot cloud agentセッションには現在のチャット会話のコンテキストが組み込まれます。つまり、`/task`プロンプト内でCopilotにすでに共有した詳細を再度説明する必要はありません。

1. GitHub.comでGitHub Copilot Chatを開きます。
1. `/task`と入力して、pull requestを作成するようにCopilotに依頼し、Copilotに変更させたい内容の詳細を指定します。

   たとえば、`/task Create a pull request to put backticks around file names and variables in output.`などです。

1. オプションで、Copilotのpull requestのベースブランチを選択します。Copilotはこのブランチに基づいて新しいブランチを作成し、そのブランチをターゲットとするpull requestに変更をプッシュします。
1. オプションで、特殊な動作やツールを持つエージェントまたはcustom agentを割り当てたい場合は、クリックしてエージェントドロップダウンメニューを開くことができます。リポジトリ、組織、またはエンタープライズから既存のcustom agentを選択できます。また、** Create an agent**をクリックして、選択したリポジトリとブランチに新しいagent profileを作成することもできます。詳細については、「[Creating custom agents for Copilot cloud agent](/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/create-custom-agents)」を参照してください。
    > [!NOTE]サードパーティのコーディングエージェントは、すべての有料の[Copilotプラン](/copilot/get-started/plans)で利用できます。
1. ****をクリックするか、<kbd>Enter</kbd>キーを押します。

   Copilotが新しいセッションを開始し、プロンプトボックスの下のリストに表示されます。Copilotはタスクに取り組み、そのpull requestに変更をプッシュし、完了するとあなたをレビューアとして追加して通知をトリガーします。

## Copilotへのissueの割り当て

issueをCopilotに割り当てることで、Copilotにissueの作業開始を依頼できます。Copilotはタスクの作業を開始し、pull requestを作成し、完了するとあなたにレビューを依頼します。

> [!NOTE]
> この機能はpublic previewであり、変更される可能性があります。

1. GitHubで、リポジトリのメインページに移動します。
1. リポジトリ名の下にある** Issues**をクリックします。

   ![リポジトリのメインページのスクリーンショット。水平ナビゲーションバーの「Issues」というラベルのタブが濃いオレンジ色で囲まれています。](/assets/images/help/repository/repo-tabs-issues-global-nav-update.png)

1. Copilotに割り当てたいissueを開きます。
1. 右側のメニューで、**Assignees**をクリックします。

   ![issueの右サイドバーのスクリーンショット。「Assignees」というラベルのヘッダーが濃いオレンジ色で囲まれています。](/assets/images/help/issues/assignee-menu.png)

1. 担当者リストから**Copilot**をクリックします。

   ![issueの「Assignees」ウィンドウのスクリーンショット。リストにCopilotが表示されています。](/assets/images/help/copilot/cloud-agent/assign-to-copilot.png)

   追加のオプションが表示されます。

   !["Assign to Copilot"ダイアログのスクリーンショット。ターゲットリポジトリ、開始ブランチ、custom agent、追加の指示のオプションが表示されています。](/assets/images/help/copilot/cloud-agent/assign-to-copilot-dialog.png)

1. **Optional prompt**フィールドで、Copilotに対する具体的なガイダンスを追加できます。Copilotがタスクを理解して完了するのに役立つコンテキスト、制約、または特定の要件を追加します。

   たとえば、使用する特定のコーディングパターンやフレームワーク、テスト要件、コードスタイルの好み、変更すべきまたは変更すべきではないファイルやディレクトリに関する指示を含めることができます。

   ここで提供する詳細に加えて、Copilotはターゲットリポジトリ用に設定されたカスタムインストラクションを使用します。「[Adding repository custom instructions for GitHub Copilot](/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions)」を参照してください。

1. ダイアログのドロップダウンメニューを使用して、Copilotが作業するリポジトリと、そこから分岐するブランチを変更できます。

   **少なくとも**読み取りアクセス権を持つすべてのリポジトリが、リポジトリのドロップダウンメニューに表示されます。ただし、リポジトリを選択できるのは、書き込みアクセス権があり、**かつ**そのリポジトリでCopilot cloud agentが有効になっている場合のみです。

   issueの元となった組織とは異なる組織のリポジトリを選択した場合、またはissueがプライベートリポジトリにあるときにパブリックリポジトリを選択した場合は、警告が表示されます。

   リポジトリを指定しない場合、Copilotはissueと同じリポジトリで作業します。ブランチを指定しない場合、Copilotは選択したリポジトリのデフォルトブランチから作業を行います。

   > [!TIP]
   > issueをCopilotに割り当てると、issueのタイトル、説明、既存のコメント、および提供した追加の指示が送信されます。issueを割り当てた後、Copilotはその後にissueに追加されたコメントを認識しないため、それに対して反応しません。詳細情報や元の要件への変更がある場合は、Copilotが作成するpull requestにコメントとして追加してください。

1. オプションで、特殊な動作やツールを持つエージェントまたはcustom agentを割り当てたい場合は、クリックしてエージェントドロップダウンメニューを開くことができます。リポジトリ、組織、またはエンタープライズから既存のcustom agentを選択できます。また、** Create an agent**をクリックして、選択したリポジトリとブランチに新しいagent profileを作成することもできます。詳細については、「[Creating custom agents for Copilot cloud agent](/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/create-custom-agents)」を参照してください。
    > [!NOTE]サードパーティのコーディングエージェントは、すべての有料の[Copilotプラン](/copilot/get-started/plans)で利用できます。
1. オプションで、ドロップダウンメニューを使用してCopilotが使用するモデルを選択できます。選択したモデルが設定可能な推論をサポートしている場合は、ドロップダウンメニューを使用して推論レベルを選択することもできます。詳細については、「[Changing the AI model for GitHub Copilot cloud agent](/copilot/how-tos/use-copilot-agents/cloud-agent/changing-the-ai-model)」を参照してください。

また、GitHub.comの他の場所からもCopilotにissueを割り当てることができます。

* リポジトリの** Issues**ページのissueのリストから。
* GitHub Projectsでissueを表示しているとき。

## 新しいリポジトリのシード作成

新しいリポジトリを作成するときに、プロンプトを入力してCopilotに新しいリポジトリのシード作成を依頼できます。

1. 任意のページの右上隅で、選択してから**New repository**をクリックします。

   ![新しいアイテムを作成するためのオプションを表示するGitHubのドロップダウンメニューのスクリーンショット。「New repository」メニュー項目が濃いオレンジ色で囲まれています。](/assets/images/help/repository/repo-create-global-nav-update.png)
1. **Owner**ドロップダウンメニューを使用して、リポジトリを所有させたいアカウントを選択します。![Screenshot of the owner menu for a new GitHub repository. The menu shows two options, octocat and github.](/assets/images/help/repository/create-repository-owner.png)
1. **Prompt**フィールドに、Copilotに構築させたい内容を説明するプロンプトを入力します。

    たとえば、`Create a Rust CLI for converting CSV spreadsheets to Markdown`などです。
1. **Create repository**をクリックします。

    Copilotがすぐにドラフトのpull requestを開きます。Copilotはタスクに取り組み、変更をそのpull requestにプッシュします。完了すると、あなたをレビュアーに追加して通知をトリガーします。

## 失敗したGitHub Actionsワークフロー実行の修正

pull requestのブランチでGitHub Actionsのワークフロー実行が失敗した場合、Copilotに調査と修正を依頼できます。

1. GitHubで、失敗したワークフロー実行のジョブページに移動します。
1. **Fix with Copilot**ボタンをクリックします。

   Copilotが新しいセッションを開始し、失敗の原因を調査して、ブランチに修正をプッシュします。

## pull requestでの作業の継続

Copilotに変更を依頼したり、既存のpull requestのレビューコメントに対処させたりすることができます。その後、結果のセッションを追跡し、追加の指示を出すことができます。

### Copilotに変更を依頼する

任意のpull requestのコメント内で`@copilot`をメンションして、Copilotに変更を依頼できます。これは、Copilotによって作成されたpull requestや、あなたや他のユーザーが作成したpull requestで機能します。

デフォルトでは、Copilotはpull requestのブランチに直接コミットをプッシュします。代わりに別のpull requestを作成するには、その旨をコメントに記述してください。また、ブランチをチェックアウトして自分で変更をプッシュすることもできます。

GitHub Webインターフェースからpull requestのコメント（レビューやレビューコメントではない）を送信する場合、モデルピッカーでモデルを選択してください。Copilotはデフォルトで、元のpull requestのモデルを使用します。

### レビューコメントの委任

レビューコメントを委任して、人間やGitHub Copilot code reviewのレビュアーからのフィードバックをCopilotに実装させることができます。

1. pull requestで、**Files changed**タブを開きます。
1. Copilotに実装させたい最初のレビューコメントに移動します。
   * 1つのコメントを委任するには、**Fix with Copilot**をクリックします。
   * 複数のコメントを委任するには、**Add to batch**をクリックします。Copilotに作業させたいコメントを追加し続けます。
1. **Manage batch**パネルで、追加の指示を入力し、必要に応じてモデルピッカーでモデルを選択します。
1. Copilotに変更を適用する方法を選択します。
   * 変更をブランチに直接コミットするには、**Fix and commit**をクリックします。
   * Copilotに変更を加えた新しいpull requestを作成させるには、ドロップダウンメニューから**Fix and open pull request**をクリックします。

### セッションの追跡と継続

Copilotは、リポジトリへの書き込み権限を持つユーザーからのコメントにのみ応答します。

コメントに応答してCopilotが新しいセッションを開始すると、コメントに目が描かれた絵文字（👀）のリアクションが表示されます。pull requestのタイムラインに「Copilot has started work」というイベントが表示されます。

![目のリアクションと「Copilot started work」のタイムラインイベントがあるレビューコメントが表示されたpull requestのタイムラインのスクリーンショット](/assets/images/help/copilot/cloud-agent/comment-to-agent-on-pr.png)

Copilotは同じpull requestでの以前のセッションのコンテキストを記憶しているため、後続のリクエストがより速く、信頼性が高くなります。pull requestがcustom agentによって作成された場合、`@copilot`をメンションすると、その同じエージェントの使用が継続されます。

## マージコンフリクトの解決

2つの方法でCopilotにpull requestのマージコンフリクトの解決を依頼できます。

* **「Fix with Copilot」ボタンの使用**: pull requestにマージコンフリクトがある場合は、マージボックスに表示される**Fix with Copilot**ボタンをクリックします。
* **@copilotメンションの使用**: pull requestのコメント内で`@copilot`をメンションし、コンフリクトの修正を依頼します（例：「@copilot resolve the merge conflicts on this PR.」）。

Copilotはコンフリクトしている変更を分析して解決し、ビルド、テスト、リンターが引き続き合格することを確認します。その後、マージする前にあなたが解決を確認できるように、レビューをリクエストします。

## automationsを使用してCopilotを自動的に実行する

スケジュールに従って、またはissueが開かれるなどのイベントに応答して、Copilotを自動的に実行するようにautomationsを設定できます。リポジトリの**Agents**タブにある**Automations**ペインからautomationsを作成および管理します。詳細については、「[Creating automations with Copilot cloud agent](/copilot/how-tos/use-copilot-agents/cloud-agent/create-automations)」を参照してください。

## GitHub Actionsワークフロー実行の管理

デフォルトでは、Copilotがpull requestに変更をプッシュしたとき、GitHub Actionsワークフローは自動的に実行されません。

GitHub Actionsワークフローには特権が与えられ、機密性の高いシークレットにアクセスできる場合があります。pull request内の提案された変更を検査し、pull requestブランチでワークフローを実行しても問題ないことを確認してください。特に、ワークフローファイルに影響を与える`.github/workflows/`ディレクトリ内の変更には十分に注意してください。

GitHub Actionsワークフローの実行を許可するには、pull requestのマージボックスにある**Approve and run workflows**ボタンをクリックします。

![「Approve and run workflows」ボタンがあるCopilotからのpull requestのマージボックスのスクリーンショット](/assets/images/help/copilot/cloud-agent/approve-and-run-workflows.png)

必要に応じて、人間の介入なしにGitHub Actionsワークフローを実行できるようにCopilot cloud agentを設定できます。詳細については、「[Configuring settings for GitHub Copilot in the cloud](/copilot/how-tos/use-copilot-agents/cloud-agent/configuring-agent-settings)」を参照してください。

## Copilotの作業に対するフィードバックの提供

Copilotのpull requestやコメントにあるフィードバックボタンを使用して、出力を評価します。あなたのフィードバックはCopilotの品質向上に役立ちます。

1. Copilotからのpull requestまたはコメントで、サムズアップ（:+1:）またはサムズダウン（:-1:）ボタンをクリックします。
1. サムズダウンボタンをクリックした場合は、必要に応じて理由を選択し、コメントを残して、**Submit feedback**をクリックします。

## 参考資料

* [GitHub.comおよびGitHub MobileでのGitHub Copilot](/copilot/concepts/copilot-surfaces/copilot-on-github)
* [タスクの作業にGitHub Copilotを使用するためのベストプラクティス](/copilot/tutorials/cloud-agent/get-the-best-results)
* [Troubleshooting GitHub Copilot cloud agent](/copilot/how-tos/use-copilot-agents/cloud-agent/troubleshoot-cloud-agent)
