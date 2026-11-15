---
title: Using Copilot in the cloud on GitHub
shortTitle: Use Copilot in the cloud on GitHub
allowTitleToDifferFromFilename: true
intro: 'Start {% data variables.copilot.copilot_in_the_cloud_short %} sessions directly on {% data variables.product.github %}, then iterate on the results without leaving your browser.'
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

{% data variables.copilot.copilot_in_the_cloud %}セッションは、{% data variables.product.github %}上の複数の場所から開始できます。セッションの実行後は、ブラウザーを離れることなく、進行状況の監視、フォローアッププロンプトによる指示、結果のpull requestへの反復作業を行うことができます。

{% data variables.copilot.copilot_in_the_cloud_short %}について詳しくは、[AUTOTITLE](/copilot/concepts/copilot-surfaces/copilot-on-github)を参照してください。

これらの同じエントリーポイントから、{% data variables.copilot.agent_apps %}を使用してパートナー構築のエージェントを開始することもできます。詳しくは、[AUTOTITLE](/copilot/how-tos/use-copilot-agents/cloud-agent/use-agent-apps)を参照してください。

## {% data variables.copilot.copilot_in_the_cloud_short %}セッションの開始

セッションは、いくつかの異なるエントリーポイントから開始できます。

* [github.com/copilot](https://github.com/copilot?ref_product=copilot&ref_type=engagement&ref_style=text&utm_source=cloud-gh-docs-home-cta&utm_medium=docs&utm_campaign=universe-2026)にある{% data variables.product.prodname_copilot_short %} {% octicon "home" aria-label="The home icon" %}ホームページ。
* [https://github.com](https://github.com?ref_product=copilot&ref_type=engagement&ref_style=text)にサインインしたときの{% octicon "mark-github" aria-label="The github octocat logo" %} {% data variables.product.github %}個人用ダッシュボードまたは{% octicon "home" aria-label="The home icon" %}ホームページ。
* リポジトリ内の**{% octicon "agent" aria-label="The Agents icon" %} Agents**タブまたはパネル。

デフォルト設定のままプロンプトをすぐに送信することも、プロンプトを送信する前にタスクに合わせてセッションを設定することもできます。

1. プロンプトボックスに、{% data variables.product.prodname_copilot_short %}に実行してほしい内容を記述します。希望する結果と制約事項を含めます。

   > [!TIP]
   > プロンプトでスラッシュコマンドを使用して特定のアクションを実行することもできます。たとえば、セカンドオピニオンを取得するための`/rubber-duck`、脆弱性がないかリポジトリをレビューするための`/security-review`、セッションの使用状況情報を表示するための`/usage`などです。

1. 必要に応じて、**{% octicon "plus" aria-hidden="true" aria-label="plus" %} Attach**をクリックして、リクエストのリファレンスを{% data variables.product.prodname_copilot_short %}に提供します。

   **Files and folders**、**Upload from computer**、**Repository**、または**Space**を選択して、リクエストのコンテキストを提供します。

   クラウドサンドボックスセッションでは、コネクタと個人用カスタムMCPサーバーを設定して、サードパーティソースから追加のコンテキストを提供できます。[AUTOTITLE](/copilot/concepts/customizations/copilot-connectors)および[AUTOTITLE](/copilot/concepts/customizations/mcp#personal-mcp-servers)を参照してください。

1. **Mode**ピッカーを開いて、{% data variables.product.prodname_copilot_short %}とのコラボレーション方法を選択します。

   * **Interactive**: (デフォルト) {% data variables.product.prodname_copilot_short %}とステップバイステップで作業します。
   * **Autopilot**: エンドツーエンドの実行のためにタスクを{% data variables.product.prodname_copilot_short %}に委任します。

   同じメニューで、**Tool permissions**を使用してツールリクエストの承認方法を制御します。

   * **Assisted** (デフォルト)を選択します。これにより、安全性チェックを使用してリクエストを承認するかユーザーに尋ねるかが決定されます。
   * **Always ask**を選択すると、リクエストごとに承認が必要になります。
   * **Allow all**を選択すると、すべてのツール、パス、およびURLリクエストが自動的に承認されます。

1. **Models**ピッカーを開き、**Auto** (デフォルト)または特定のモデルを選択します。モデルは、速度とコスト効率、汎用性とインテリジェンス、または複雑なタスクに対応する機能のいずれかを選択できるように、それぞれの強みによってグループ化されています。選択したモデルが**Balance**などの構成可能な推論をサポートしている場合は、ドロップダウンメニューを使用して推論レベルを選択することもできます。

1. プロンプトボックスの下にある**Chat**セッションコンテキストピッカーを使用して、セッションのスコープ(個人、Organization、またはリポジトリ)を選択します。

   * 検索ボックスにリポジトリ名を入力して、追加するリポジトリを検索します。
   * **Ask anything across repositories**の下で、**Chat**を選択してリポジトリを横断して質問します。デフォルトのスコープは個人のリポジトリです。右側の画像をクリックしてアカウントメニューを開き、Organizationを選択するか、リポジトリ所有者(ユーザーまたはOrganization)で検索してスコープを変更します。
   * **Work in a repository**の下で、作業する最近のリポジトリを選択します。一覧表示されるリポジトリには、選択したスコープが反映されます。

   > [!NOTE]
   > * **Attach**メニュー(前のステップ)からリポジトリを追加すると、プロンプトのリファレンス(コンテキスト資料)が提供されます。一方、ここで**Start a session**の下でリポジトリを選択すると、そのリポジトリがセッションの作業リポジトリ(スコープ)になります。セッションの開始時に、クラウドサンドボックスはリポジトリのコピーを取得し、既存の制約の範囲内で、そのコンテンツを操作する権限を{% data variables.product.prodname_copilot_short %}に付与します。
   > * リポジトリが一覧に表示されない場合は、個人設定、またはOrganizationやEnterpriseのポリシーによって{% data variables.product.prodname_copilot_short %}から除外されている可能性があります。

   必要に応じて、上記でリポジトリを選択した場合は、**main** (または一覧表示されているデフォルトブランチ名)をクリックして、{% data variables.product.prodname_copilot_short %}が作業コンテキストとして使用し、その中で動作するブランチを選択することもできます。

{% data reusables.copilot.environment-picker %}

1. **Send message**をクリックするか、<kbd>Enter</kbd>キーを押してプロンプトを送信し、セッションを開始します。

{% data variables.product.prodname_copilot_short %}はプロンプトに応答し、選択したコンテキストと環境に基づいてセッションを開始します。要求された場合、{% data variables.product.prodname_copilot_short %}は変更されたファイルの一覧、pull request、生成された成果物(調査計画など)、およびその他の関連出力を生成します。

### ファイル、issue、またはpull request内からの{% data variables.product.prodname_copilot_short %}の開始

コンテキストに応じたページから{% data variables.product.prodname_copilot_short %}とのチャットセッションを開くと、開いているファイル、issue、またはpull requestのコンテキストでセッションが開始されます。

コンテキストパネル自体の中から新しいエージェントセッションを開始することはできません。{% data variables.product.prodname_copilot_short %}ページ、ホームページ、またはエージェントタブから開始する必要があります。

## {% data variables.copilot.copilot_cloud_agent %}でのセッションの開始

### エージェントタブまたはパネルからのセッションの開始

セッションは、エージェントタブおよびエージェントパネルから開始できます。唯一の違いはエントリーポイントです。「New agent task」フォームが表示された後の手順は同じです。

{% data reusables.copilot.open-agents-panel-or-page %}
{% data reusables.copilot.cloud-agent.new-agent-task-form-instructions %}

### ダッシュボードからのセッションの開始

ダッシュボードのプロンプトボックスから{% data variables.product.prodname_copilot_short %}に作業の開始を依頼できます。ダッシュボードは、ログインした状態で[https://github.com](https://github.com)にアクセスしたときに表示される、{% data variables.product.github %}でのアクティビティのパーソナライズされた概要です。

1. [https://github.com](https://github.com/?ref_product=desktop&ref_type=engagement&ref_style=text)のダッシュボードに移動します。
1. **{% octicon "agent" aria-label="The Agents icon" %} Task**ボタンをクリックします。
1. プロンプトフィールドのドロップダウンメニューを使用して、{% data variables.product.prodname_copilot_short %}に作業させたいリポジトリを選択します。
1. リクエストを説明するプロンプトを入力します。

    たとえば、`Implement a user friendly message for common errors.`のように入力します。

    {% data variables.product.prodname_copilot_short %}にpull requestを開いてほしい場合は、プロンプトで依頼できます(例: `Open a pull request to implement a user friendly message for common errors.`)。

1. 必要に応じて、{% data variables.product.prodname_copilot_short %}のpull requestのベースブランチを選択します。{% data variables.product.prodname_copilot_short %}はこのブランチに基づいて新しいブランチを作成します。
{% data reusables.copilot.optional-select-custom-agent-dotcom %}
1. **{% octicon "paper-airplane" aria-label="Send now" %} Send now**をクリックするか、<kbd>Return</kbd>キーを押します。

   エージェントタブに移動し、{% data variables.product.prodname_copilot_short %}が新しいセッションを開始します。これはプロンプトボックスの下にある「Recent sessions」リストに表示されます。{% data variables.product.prodname_copilot_short %}はタスクに取り組み、コードの変更をプッシュします。

   > [!NOTE]
   > フィーチャープレビューで**New Dashboard Experience**を有効にしている場合、新しいセッションはダッシュボードのプロンプトボックスの下にある「Agent sessions」に表示されます。詳しくは、[AUTOTITLE](/account-and-profile/reference/personal-dashboard#home-dashboard-view)を参照してください。

### {% data variables.copilot.copilot_chat_short %}からの開始

{% data variables.copilot.copilot_chat_short %}からタスクを開始すると、新しい{% data variables.copilot.copilot_cloud_agent %}セッションに現在のチャット会話のコンテキストが組み込まれます。つまり、`/task`プロンプトで{% data variables.product.prodname_copilot_short %}とすでに共有した詳細を再度説明する必要はありません。

1. {% data variables.product.prodname_dotcom_the_website %}で{% data variables.copilot.copilot_chat %}を開きます。
1. `/task`と入力して{% data variables.product.prodname_copilot_short %}にpull requestの作成を依頼し、{% data variables.product.prodname_copilot_short %}に変更してほしい内容の詳細を指定します。

   たとえば、`/task Create a pull request to put backticks around file names and variables in output.`のように指定します。

1. 必要に応じて、{% data variables.product.prodname_copilot_short %}のpull requestのベースブランチを選択します。{% data variables.product.prodname_copilot_short %}はこのブランチに基づいて新しいブランチを作成し、そのブランチをターゲットとするpull requestに変更をプッシュします。
{% data reusables.copilot.optional-select-custom-agent-dotcom %}
1. **{% octicon "paper-airplane" aria-label="Start task" %}**をクリックするか、<kbd>Enter</kbd>キーを押します。

   {% data variables.product.prodname_copilot_short %}が新しいセッションを開始し、プロンプトボックスの下のリストに表示されます。{% data variables.product.prodname_copilot_short %}はタスクに取り組み、そのpull requestに変更をプッシュした後、完了時にあなたをレビュアーとして追加し、通知をトリガーします。

## issueの{% data variables.product.prodname_copilot_short %}への割り当て

issueを{% data variables.product.prodname_copilot_short %}に割り当てることで、{% data variables.product.prodname_copilot_short %}にissueの作業開始を依頼できます。{% data variables.product.prodname_copilot_short %}はタスクの作業を開始し、pull requestを作成して、完了時にあなたにレビューをリクエストします。

> [!NOTE]
> この機能は{% data variables.release-phases.public_preview %}段階にあり、変更される可能性があります。

{% data reusables.repositories.navigate-to-repo %}
{% data reusables.repositories.sidebar-issues %}

1. {% data variables.product.prodname_copilot_short %}に割り当てたいissueを開きます。
1. 右側のサイドメニューで、**Assignees**をクリックします。

   ![issueの右サイドバーのスクリーンショット。「Assignees」というラベルのヘッダーが濃いオレンジ色で囲まれている。](/assets/images/help/issues/assignee-menu.png)

1. 担当者リストから**Copilot**をクリックします。

   ![issueの「Assignees」ウィンドウのスクリーンショット。リストでCopilotが選択可能になっている。](/assets/images/help/copilot/cloud-agent/assign-to-copilot.png)

   追加のオプションが表示されます。

   ![ターゲットリポジトリ、開始ブランチ、{% data variables.copilot.copilot_custom_agent_short %}、追加の指示のオプションを示す「Assign to Copilot」ダイアログのスクリーンショット。](/assets/images/help/copilot/cloud-agent/assign-to-copilot-dialog.png)

1. **Optional prompt**フィールドでは、{% data variables.product.prodname_copilot_short %}に対する具体的なガイダンスを追加できます。{% data variables.product.prodname_copilot_short %}がタスクを理解して完了するのに役立つコンテキスト、制約、または特定の要件を追加します。

   たとえば、使用する特定のコーディングパターンやフレームワーク、テスト要件、コードスタイルの設定、変更すべき/変更すべきでないファイルやディレクトリに関する指示を含めることができます。

   ここで指定する詳細に加えて、{% data variables.product.prodname_copilot_short %}はターゲットリポジトリ用に構成されているカスタム指示を使用します。[AUTOTITLE](/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions)を参照してください。

1. ダイアログのドロップダウンメニューを使用して、{% data variables.product.prodname_copilot_short %}が作業するリポジトリと、分岐元のブランチを変更できます。

   **少なくとも**読み取りアクセス権を持つすべてのリポジトリが、リポジトリのドロップダウンメニューに表示されます。ただし、リポジトリを選択できるのは、そのリポジトリへの書き込みアクセス権があり、**かつ**そのリポジトリで{% data variables.copilot.copilot_cloud_agent %}が有効になっている場合のみです。

   issueのソースOrganizationとは異なるOrganizationのリポジトリを選択した場合、またはissueがプライベートリポジトリにあるときにパブリックリポジトリを選択した場合は、警告が表示されます。

   リポジトリを指定しない場合、{% data variables.product.prodname_copilot_short %}はissueと同じリポジトリで作業します。ブランチを指定しない場合、{% data variables.product.prodname_copilot_short %}は選択したリポジトリのデフォルトブランチから作業します。

   > [!TIP]
   > issueを{% data variables.product.prodname_copilot_short %}に割り当てると、issueのタイトル、説明、現在存在するコメント、および指定した追加の指示が送信されます。issueを割り当てた後、{% data variables.product.prodname_copilot_short %}はissueに追加された以降のコメントを認識しないため、それらに反応しません。追加情報がある場合や、元の要件に変更がある場合は、{% data variables.product.prodname_copilot_short %}が作成したpull requestにコメントとして追加してください。

{% data reusables.copilot.optional-select-custom-agent-dotcom %}
{% data reusables.copilot.optional-select-copilot-cloud-agent-model %}

{% data variables.product.prodname_dotcom_the_website %}上の他の場所からも、issueを{% data variables.product.prodname_copilot_short %}に割り当てることができます。

* リポジトリの**{% octicon "issue-opened" aria-hidden="true" aria-label="issue-opened" %} Issues**ページにあるissueのリストから。
* {% data variables.product.github %} {% data variables.projects.projects_v2_caps %}でissueを表示しているとき。

## 新しいリポジトリのシード

新しいリポジトリを作成するときに、プロンプトを入力して新しいリポジトリのシードを{% data variables.product.prodname_copilot_short %}に依頼できます。

{% data reusables.repositories.create_new %}
{% data reusables.repositories.owner-drop-down %}
1. **Prompt**フィールドに、{% data variables.product.prodname_copilot_short %}に構築してほしい内容を説明するプロンプトを入力します。

    たとえば、`Create a Rust CLI for converting CSV spreadsheets to Markdown`のように入力します。
{% data reusables.repositories.create-repo %}

    {% data variables.product.prodname_copilot_short %}はすぐにドラフトpull requestを開きます。{% data variables.product.prodname_copilot_short %}はタスクに取り組み、そのpull requestに変更をプッシュした後、完了時にあなたをレビュアーとして追加し、通知をトリガーします。

## 失敗した{% data variables.product.prodname_actions %}ワークフロールンの修正

pull requestブランチで{% data variables.product.prodname_actions %}ワークフロールンが失敗した場合、{% data variables.product.prodname_copilot_short %}に失敗の調査と修正を依頼できます。

1. {% data variables.product.github %}で、失敗したワークフロールンのジョブページに移動します。
1. **{% octicon "agent" aria-label="The Agents icon" %} Fix with {% data variables.product.prodname_copilot_short %}**ボタンをクリックします。

   {% data variables.product.prodname_copilot_short %}が新しいセッションを開始し、失敗の原因を調査して、ブランチに修正をプッシュします。

## pull requestでの作業の継続

既存のpull requestに対して、変更の適用やレビューコメントへの対応を{% data variables.product.prodname_copilot_short %}に依頼できます。その後、生成されたセッションを追跡し、フォローアップの指示を提供できます。

### {% data variables.product.prodname_copilot_short %}への変更の依頼

任意のpull requestのコメントで`@copilot`をメンションして、{% data variables.product.prodname_copilot_short %}に変更を依頼できます。これは、{% data variables.product.prodname_copilot_short %}が作成したpull requestだけでなく、あなたや他の人が作成したpull requestでも機能します。

デフォルトでは、{% data variables.product.prodname_copilot_short %}はコミットをpull requestブランチに直接プッシュします。代わりに別のpull requestを作成する場合は、コメントでその旨を記述します。ブランチをチェックアウトして、自分で変更をプッシュすることもできます。

{% data variables.product.github %}のWebインターフェースからpull requestのコメント(レビューまたはレビューコメントではない)を送信するときは、モデルピッカーでモデルを選択します。{% data variables.product.prodname_copilot_short %}は、デフォルトで元のpull requestのモデルを使用します。

### レビューコメントの委任

レビューコメントを委任して、人間のレビュアーや{% data variables.copilot.copilot_code-review %}からのフィードバックを{% data variables.product.prodname_copilot_short %}に実装させることができます。

1. pull requestで、**Files changed**タブを開きます。
1. {% data variables.product.prodname_copilot_short %}に実装させたい最初のレビューコメントに移動します。
   * 1つのコメントを委任するには、**Fix with {% data variables.product.prodname_copilot_short %}**をクリックします。
   * 複数のコメントを委任するには、**Add to batch**をクリックします。{% data variables.product.prodname_copilot_short %}に作業させたいコメントの追加を続けます。
1. **Manage batch**パネルで、追加の指示を追加し、必要に応じてモデルピッカーでモデルを選択します。
1. {% data variables.product.prodname_copilot_short %}による変更の適用方法を選択します。
   * 変更をブランチに直接コミットするには、**{% octicon "agent" aria-label="The Agents icon" %} Fix and commit**をクリックします。
   * 変更を含む新しいpull requestを{% data variables.product.prodname_copilot_short %}に作成させるには、ドロップダウンメニューから**Fix and open pull request**をクリックします。

### セッションの追跡と継続

{% data reusables.copilot.cloud-agent.write-access-required %}

コメントに応じて{% data variables.product.prodname_copilot_short %}が新しいセッションを開始すると、コメントに目の絵文字(👀)リアクションが表示されます。pull requestのタイムラインに「Copilot has started work」イベントが表示されます。

![目のリアクションが付いたレビューコメントと「Copilot started work」タイムラインイベントを含むpull requestタイムラインのスクリーンショット。](/assets/images/help/copilot/cloud-agent/comment-to-agent-on-pr.png)

{% data variables.product.prodname_copilot_short %}は同じpull requestでの以前のセッションのコンテキストを記憶しているため、フォローアップのリクエストがより迅速かつ確実になります。pull requestが{% data variables.copilot.copilot_custom_agent_short %}によって作成された場合、`@copilot`をメンションすると同じエージェントの使用が継続されます。

## マージコンフリクトの解決

pull requestのマージコンフリクトの解決は、2つの方法で{% data variables.product.prodname_copilot_short %}に依頼できます。

* **「Fix with {% data variables.product.prodname_copilot_short %}」ボタンの使用**: pull requestにマージコンフリクトがある場合は、マージボックスに表示される**Fix with {% data variables.product.prodname_copilot_short %}**ボタンをクリックします。
* **@copilotメンションの使用**: pull requestのコメントで`@copilot`をメンションし、コンフリクトの修正を依頼します(例: 「@copilot resolve the merge conflicts on this PR」)。

{% data variables.product.prodname_copilot_short %}は競合する変更を分析し、それらを解決して、ビルド、テスト、およびリンターが引き続き成功することを確認します。その後、マージ前に解決策を確認できるようにレビューをリクエストします。

## {% data variables.copilot.copilot_automations %}を使用した{% data variables.product.prodname_copilot_short %}の自動実行

{% data variables.copilot.copilot_automations %}を設定して、スケジュールに従って、またはissueが開かれたなどのイベントに応じて、{% data variables.product.prodname_copilot_short %}を自動的に実行できます。{% data variables.copilot.copilot_automations %}の作成と管理は、リポジトリの**Agents**タブにある**{% data variables.copilot.copilot_automations_cap %}**ペインから行います。詳しくは、[AUTOTITLE](/copilot/how-tos/use-copilot-agents/cloud-agent/create-automations)を参照してください。

## {% data variables.product.prodname_actions %}ワークフロールンの管理

{% data reusables.copilot.cloud-agent-workflow-run-approval-default %} 詳しくは、[AUTOTITLE](/copilot/how-tos/use-copilot-agents/cloud-agent/configuring-agent-settings)を参照してください。

## {% data variables.product.prodname_copilot_short %}の作業に関するフィードバックの提供

{% data variables.product.prodname_copilot_short %}のpull requestやコメントにあるフィードバックボタンを使用して、出力を評価します。いただいたフィードバックは、{% data variables.product.prodname_copilot_short %}の品質向上に役立ちます。

1. {% data variables.product.prodname_copilot_short %}からのpull requestまたはコメントで、高評価(:+1:)または低評価(:-1:)ボタンをクリックします。
1. 低評価ボタンをクリックした場合は、必要に応じて理由を選択してコメントを残し、**Submit feedback**をクリックします。

## 参考資料

* [AUTOTITLE](/copilot/concepts/copilot-surfaces/copilot-on-github)
* [AUTOTITLE](/copilot/tutorials/cloud-agent/get-the-best-results)
* [AUTOTITLE](/copilot/how-tos/use-copilot-agents/cloud-agent/troubleshoot-cloud-agent)
