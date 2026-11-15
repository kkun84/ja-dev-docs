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

{% data variables.copilot.copilot_in_the_cloud %}セッションは、{% data variables.product.github %}上のいくつかの場所から開始できます。セッションの実行中は、ブラウザを離れることなく、進捗状況のモニタリング、フォローアッププロンプトによる指示、結果のpull requestに対する調整を行うことができます。

{% data variables.copilot.copilot_in_the_cloud_short %}について詳しくは、[AUTOTITLE](/copilot/concepts/copilot-surfaces/copilot-on-github)をご覧ください。

また、{% data variables.copilot.agent_apps %}を使用して、同じエントリポイントからパートナーが構築したエージェントを開始することもできます。詳しくは、[AUTOTITLE](/copilot/how-tos/use-copilot-agents/cloud-agent/use-agent-apps)をご覧ください。

## {% data variables.copilot.copilot_in_the_cloud_short %}セッションの開始

複数の異なるエントリポイントからセッションを開始できます。

* [github.com/copilot](https://github.com/copilot?ref_product=copilot&ref_type=engagement&ref_style=text&utm_source=cloud-gh-docs-home-cta&utm_medium=docs&utm_campaign=universe-2026)にある{% data variables.product.prodname_copilot_short %} {% octicon "home" aria-label="The home icon" %}ホームページ。
* [https://github.com](https://github.com?ref_product=copilot&ref_type=engagement&ref_style=text)でサインインしたときの{% octicon "mark-github" aria-label="The github octocat logo" %} {% data variables.product.github %}個人ダッシュボードまたは{% octicon "home" aria-label="The home icon" %}ホームページ。
* リポジトリ内の**{% octicon "agent" aria-label="The Agents icon" %} Agents**タブまたはパネル。

既定の設定ですぐにプロンプトを送信することも、プロンプトを送信する前にタスクに合わせてセッションを設定することもできます。

1. プロンプトボックスに、{% data variables.product.prodname_copilot_short %}に実行してほしい内容を記述します。期待する結果や制約事項も含めてください。

   > [!TIP]
   > プロンプトでスラッシュコマンドを使用して特定のアクションを実行することもできます。たとえば、セカンドオピニオンを取得するための`/rubber-duck`、脆弱性がないかリポジトリをレビューするための`/security-review`、セッションの使用状況情報を表示するための`/usage`などです。

1. 必要に応じて、**{% octicon "plus" aria-hidden="true" aria-label="plus" %} Attach**をクリックして、リクエストに対する参考情報を{% data variables.product.prodname_copilot_short %}に提供します。

   リクエストにコンテキストを提供するには、**Files and folders**、**Upload from computer**、**Repository**、または**Space**を選択します。

   クラウドサンドボックスセッションでは、コネクタや個人のカスタムMCPサーバーを設定することで、サードパーティソースから追加のコンテキストを提供できます。[AUTOTITLE](/copilot/concepts/customizations/copilot-connectors)および[AUTOTITLE](/copilot/concepts/customizations/mcp#personal-mcp-servers)をご覧ください。

1. **Mode**ピッカーを開いて、{% data variables.product.prodname_copilot_short %}とのコラボレーション方法を選択します。

   * **Interactive**: (既定) {% data variables.product.prodname_copilot_short %}とステップバイステップで作業します。
   * **Autopilot**: エンドツーエンドで実行するタスクを{% data variables.product.prodname_copilot_short %}に委任します。

   同じメニューで、**Tool permissions**を使用してツールのリクエストを承認する方法を制御します。

   * **Assisted** (既定)を選択します。セーフティチェックを使用して、リクエストを承認するかユーザーに確認するかを決定します。
   * リクエストごとに承認を必須にするには、**Always ask**を選択します。
   * すべてのツール、パス、およびURLのリクエストを自動的に承認するには、**Allow all**を選択します。

1. **Models**ピッカーを開き、**Auto** (既定)または特定のモデルを選択します。モデルは長所ごとにグループ化されており、速度とコスト効率、汎用性とインテリジェンス、複雑なタスクの処理能力のいずれかを選択するのに役立ちます。選択したモデルが**Balance**などの設定可能な推論をサポートしている場合は、ドロップダウンメニューを使用して推論レベルを選択することもできます。

1. プロンプトボックスの下にある**Chat**セッションコンテキストピッカーを使用して、セッションのスコープ(個人、Organization、またはリポジトリ)を選択します。

   * 検索ボックスにリポジトリ名を入力して、追加するリポジトリを検索します。
   * **Ask anything across repositories**の下で、**Chat**を選択してリポジトリ全体にわたって質問します。既定のスコープは個人のリポジトリです。右側の画像をクリックしてアカウントメニューを開き、Organizationを選択するか、リポジトリ所有者(ユーザーまたはOrganization)で検索してスコープを変更します。
   * **Work in a repository**の下で、作業する最近のリポジトリを選択します。一覧表示されるリポジトリには、選択したスコープが反映されます。

   > [!NOTE]
   > * (前のステップで)**Attach**メニューからリポジトリを追加すると、プロンプトの参考資料(コンテキスト資料)が提供されます。一方、ここで**Start a session**の下で選択すると、そのリポジトリがセッションの作業リポジトリ(スコープ)になります。セッションの開始時に、クラウドサンドボックスはリポジトリのコピーを取得し、既存の制約の範囲内でそのコンテンツを操作する権限を{% data variables.product.prodname_copilot_short %}に付与します。
   > * リポジトリが一覧に表示されない場合は、個人設定、あるいはOrganizationやEnterpriseのポリシーによって、{% data variables.product.prodname_copilot_short %}から除外されている可能性があります。

   任意で、上記でリポジトリを選択した場合は、**main**(または一覧に表示されている既定のブランチ名)をクリックして、{% data variables.product.prodname_copilot_short %}が作業コンテキストとして使用し、その中で操作するブランチを選択することもできます。

{% data reusables.copilot.environment-picker %}

1. **Send message**をクリックするか、<kbd>Enter</kbd>キーを押してプロンプトを送信し、セッションを開始します。

{% data variables.product.prodname_copilot_short %}はプロンプトに応答し、選択したコンテキストと環境に基づいてセッションを開始します。要求された場合、{% data variables.product.prodname_copilot_short %}は変更されたファイルの一覧、pull request、生成されたアーティファクト(調査計画など)、およびその他の関連出力を生成します。

### ファイル、issue、またはpull request内からの{% data variables.product.prodname_copilot_short %}の開始

コンテキストに応じたページから{% data variables.product.prodname_copilot_short %}とのチャットセッションを開くと、開いているファイル、issue、またはpull requestのコンテキストでセッションが開始されます。

コンテキストパネル自体の中から新しいエージェントセッションを開始することはできません。{% data variables.product.prodname_copilot_short %}ページ、ホームページ、またはエージェントタブから開始する必要があります。

## {% data variables.copilot.copilot_cloud_agent %}でのセッションの開始

### エージェントタブまたはパネルからのセッションの開始

エージェントタブおよびエージェントパネルからセッションを開始できます。違いはエントリポイントのみであり、"New agent task"フォームが表示された後の手順は同じです。

{% data reusables.copilot.open-agents-panel-or-page %}
{% data reusables.copilot.cloud-agent.new-agent-task-form-instructions %}

### ダッシュボードからのセッションの開始

ダッシュボードのプロンプトボックスから{% data variables.product.prodname_copilot_short %}に作業の開始を依頼できます。ダッシュボードは、ログインした状態で[https://github.com](https://github.com)にアクセスしたときに表示される、{% data variables.product.github %}上でのアクティビティのパーソナライズされた概要です。

1. [https://github.com](https://github.com/?ref_product=desktop&ref_type=engagement&ref_style=text)のダッシュボードに移動します。
1. **{% octicon "agent" aria-label="The Agents icon" %} Task**ボタンをクリックします。
1. プロンプトフィールドのドロップダウンメニューを使用して、{% data variables.product.prodname_copilot_short %}に作業させたいリポジトリを選択します。
1. リクエストを説明するプロンプトを入力します。

    たとえば、`Implement a user friendly message for common errors.`

    {% data variables.product.prodname_copilot_short %}にpull requestを作成させたい場合は、プロンプトで要求できます(例: `Open a pull request to implement a user friendly message for common errors.`)。

1. 必要に応じて、{% data variables.product.prodname_copilot_short %}のpull requestのベースブランチを選択します。{% data variables.product.prodname_copilot_short %}はこのブランチに基づいて新しいブランチを作成します。
{% data reusables.copilot.optional-select-custom-agent-dotcom %}
1. **{% octicon "paper-airplane" aria-label="Send now" %} Send now**をクリックするか、<kbd>Return</kbd>キーを押します。

   エージェントタブに移動し、{% data variables.product.prodname_copilot_short %}によって新しいセッションが開始され、プロンプトボックスの下にある"Recent sessions"リストに表示されます。{% data variables.product.prodname_copilot_short %}はタスクに取り組み、コードの変更をプッシュします。

   > [!NOTE]
   > フィーチャープレビューで**New Dashboard Experience**を有効にしている場合、新しいセッションはダッシュボードのプロンプトボックスの下にある"Agent sessions"に表示されます。詳しくは、[AUTOTITLE](/account-and-profile/reference/personal-dashboard#home-dashboard-view)をご覧ください。

### {% data variables.copilot.copilot_chat_short %}からの開始

{% data variables.copilot.copilot_chat_short %}からタスクを開始すると、新しい{% data variables.copilot.copilot_cloud_agent %}セッションに現在のチャットの会話のコンテキストが組み込まれます。つまり、`/task`プロンプトで既に{% data variables.product.prodname_copilot_short %}と共有している詳細を再度説明する必要はありません。

1. {% data variables.product.prodname_dotcom_the_website %}で{% data variables.copilot.copilot_chat %}を開きます。
1. `/task`と入力して{% data variables.product.prodname_copilot_short %}にpull requestの作成を依頼し、{% data variables.product.prodname_copilot_short %}に変更してほしい内容の詳細を指定します。

   たとえば、`/task Create a pull request to put backticks around file names and variables in output.`

1. 必要に応じて、{% data variables.product.prodname_copilot_short %}のpull requestのベースブランチを選択します。{% data variables.product.prodname_copilot_short %}はこのブランチに基づいて新しいブランチを作成し、そのブランチをターゲットとするpull requestに変更をプッシュします。
{% data reusables.copilot.optional-select-custom-agent-dotcom %}
1. **{% octicon "paper-airplane" aria-label="Start task" %}**をクリックするか、<kbd>Enter</kbd>キーを押します。

   {% data variables.product.prodname_copilot_short %}によって新しいセッションが開始され、プロンプトボックスの下のリストに表示されます。{% data variables.product.prodname_copilot_short %}はタスクに取り組み、そのpull requestに変更をプッシュし、完了するとあなたをレビューアとして追加して通知をトリガーします。

## {% data variables.product.prodname_copilot_short %}へのissueの割り当て

issueを{% data variables.product.prodname_copilot_short %}に割り当てることで、{% data variables.product.prodname_copilot_short %}にそのissueの対応を開始するよう依頼できます。{% data variables.product.prodname_copilot_short %}はタスクへの取り組みを開始し、pull requestを作成して、完了するとあなたにレビューをリクエストします。

> [!NOTE]
> この機能は{% data variables.release-phases.public_preview %}段階にあり、変更される可能性があります。

{% data reusables.repositories.navigate-to-repo %}
{% data reusables.repositories.sidebar-issues %}

1. {% data variables.product.prodname_copilot_short %}に割り当てたいissueを開きます。
1. 右側のサイドメニューで、**Assignees**をクリックします。

   ![issueの右サイドバーのスクリーンショット。「Assignees」というラベルの付いたヘッダーが濃いオレンジ色で囲まれています。](/assets/images/help/issues/assignee-menu.png)

1. 担当者リストから**Copilot**をクリックします。

   ![issueの「Assignees」ウィンドウのスクリーンショット。リストにCopilotが表示されています。](/assets/images/help/copilot/cloud-agent/assign-to-copilot.png)

   追加のオプションが表示されます。

   ![ターゲットリポジトリ、開始ブランチ、{% data variables.copilot.copilot_custom_agent_short %}、および追加の指示のオプションを表示する「Assign to Copilot」ダイアログのスクリーンショット。](/assets/images/help/copilot/cloud-agent/assign-to-copilot-dialog.png)

1. **Optional prompt**フィールドでは、{% data variables.product.prodname_copilot_short %}への具体的なガイダンスを追加できます。{% data variables.product.prodname_copilot_short %}がタスクを理解して完了するのに役立つコンテキスト、制約、または特定の要件を追加してください。

   たとえば、使用する特定のコーディングパターンやフレームワーク、テスト要件、コードスタイルの設定、変更すべきまたは変更すべきでないファイルやディレクトリに関する指示を含めることができます。

   ここで指定した詳細に加えて、{% data variables.product.prodname_copilot_short %}はターゲットリポジトリ用に設定されているカスタム指示を使用します。[AUTOTITLE](/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions)をご覧ください。

1. ダイアログのドロップダウンメニューを使用して、{% data variables.product.prodname_copilot_short %}が作業するリポジトリと、分岐元のブランチを変更できます。

   **少なくとも**読み取りアクセス権を持つすべてのリポジトリが、リポジトリのドロップダウンメニューに表示されます。ただし、リポジトリを選択できるのは、そのリポジトリへの書き込みアクセス権があり、**かつ**そのリポジトリで{% data variables.copilot.copilot_cloud_agent %}が有効になっている場合のみです。

   issueのソースOrganizationとは異なるOrganizationのリポジトリを選択した場合、またはissueがプライベートリポジトリにあるときにパブリックリポジトリを選択した場合は、警告が表示されます。

   リポジトリを指定しない場合、{% data variables.product.prodname_copilot_short %}はissueと同じリポジトリで作業します。ブランチを指定しない場合、{% data variables.product.prodname_copilot_short %}は選択したリポジトリの既定のブランチから作業します。

   > [!TIP]
   > issueを{% data variables.product.prodname_copilot_short %}に割り当てると、issueのタイトル、説明、現在存在するコメント、および提供した追加の指示が送信されます。issueを割り当てた後、{% data variables.product.prodname_copilot_short %}はissueに追加された以降のコメントを認識しないため、それらに反応しません。追加情報がある場合や、元の要件に変更がある場合は、{% data variables.product.prodname_copilot_short %}が作成するpull requestにコメントとして追加してください。

{% data reusables.copilot.optional-select-custom-agent-dotcom %}
{% data reusables.copilot.optional-select-copilot-cloud-agent-model %}

{% data variables.product.prodname_dotcom_the_website %}上の他の場所から{% data variables.product.prodname_copilot_short %}にissueを割り当てることもできます。

* リポジトリの**{% octicon "issue-opened" aria-hidden="true" aria-label="issue-opened" %} Issues**ページのissueリストから。
* {% data variables.product.github %} {% data variables.projects.projects_v2_caps %}でissueを表示しているとき。

## 新しいリポジトリのシード

新しいリポジトリを作成する際、プロンプトを入力して新しいリポジトリをシードするよう{% data variables.product.prodname_copilot_short %}に依頼できます。

{% data reusables.repositories.create_new %}
{% data reusables.repositories.owner-drop-down %}
1. **Prompt**フィールドに、{% data variables.product.prodname_copilot_short %}に構築してほしい内容を説明するプロンプトを入力します。

    たとえば、`Create a Rust CLI for converting CSV spreadsheets to Markdown`
{% data reusables.repositories.create-repo %}

    {% data variables.product.prodname_copilot_short %}は直ちにドラフトpull requestを開きます。{% data variables.product.prodname_copilot_short %}はタスクに取り組み、そのpull requestに変更をプッシュし、完了するとあなたをレビューアとして追加して通知をトリガーします。

## 失敗した{% data variables.product.prodname_actions %}ワークフロールンの修正

pull requestブランチで{% data variables.product.prodname_actions %}ワークフロールンが失敗した場合、{% data variables.product.prodname_copilot_short %}に失敗の調査と修正を依頼できます。

1. {% data variables.product.github %}で、失敗したワークフロールンのジョブページに移動します。
1. **{% octicon "agent" aria-label="The Agents icon" %} Fix with {% data variables.product.prodname_copilot_short %}**ボタンをクリックします。

   {% data variables.product.prodname_copilot_short %}によって新しいセッションが開始され、失敗の原因が調査され、ブランチに修正がプッシュされます。

## pull requestでの作業の継続

既存のpull requestで変更を加えたり、レビューコメントに対処したりするよう{% data variables.product.prodname_copilot_short %}に依頼できます。その後、結果のセッションを追跡し、フォローアップの指示を提供できます。

### {% data variables.product.prodname_copilot_short %}への変更の依頼

任意のpull requestのコメントで`@copilot`をメンションして、{% data variables.product.prodname_copilot_short %}に変更を加えるよう依頼できます。これは、{% data variables.product.prodname_copilot_short %}によって作成されたpull requestだけでなく、あなたや他の人が作成したpull requestでも機能します。

既定では、{% data variables.product.prodname_copilot_short %}はコミットをpull requestブランチに直接プッシュします。代わりに別のpull requestを作成したい場合は、コメントでその旨を説明してください。ブランチをチェックアウトして、自分で変更をプッシュすることもできます。

{% data variables.product.github %} Webインターフェースからpull requestのコメント(レビューやレビューコメントではありません)を送信する際は、モデルピッカーでモデルを選択します。{% data variables.product.prodname_copilot_short %}は既定で元のpull requestのモデルを使用します。

### レビューコメントの委任

レビューコメントを委任して、人間のレビューアや{% data variables.copilot.copilot_code-review %}からのフィードバックを{% data variables.product.prodname_copilot_short %}に実装させることができます。

1. pull requestで、**Files changed**タブを開きます。
1. {% data variables.product.prodname_copilot_short %}に実装させたい最初のレビューコメントに移動します。
   * 1つのコメントを委任するには、**Fix with {% data variables.product.prodname_copilot_short %}**をクリックします。
   * 複数のコメントを委任するには、**Add to batch**をクリックします。{% data variables.product.prodname_copilot_short %}に処理させたいコメントを引き続き追加します。
1. **Manage batch**パネルで追加の指示を追加し、必要に応じてモデルピッカーでモデルを選択します。
1. {% data variables.product.prodname_copilot_short %}に変更を適用させる方法を選択します。
   * 変更をブランチに直接コミットするには、**{% octicon "agent" aria-label="The Agents icon" %} Fix and commit**をクリックします。
   * {% data variables.product.prodname_copilot_short %}に変更を含む新しいpull requestを作成させるには、ドロップダウンメニューから**Fix and open pull request**をクリックします。

### セッションの追跡と継続

{% data reusables.copilot.cloud-agent.write-access-required %}

コメントに応じて{% data variables.product.prodname_copilot_short %}が新しいセッションを開始すると、コメントに目の絵文字(👀)リアクションが表示されます。pull requestのタイムラインに"Copilot has started work"イベントが表示されます。

![目のリアクションが付いたレビューコメントと「Copilot started work」タイムラインイベントを含むpull requestタイムラインのスクリーンショット。](/assets/images/help/copilot/cloud-agent/comment-to-agent-on-pr.png)

{% data variables.product.prodname_copilot_short %}は同じpull requestでの以前のセッションのコンテキストを記憶しているため、フォローアップのリクエストはより高速で信頼性が高くなります。pull requestが{% data variables.copilot.copilot_custom_agent_short %}によって作成された場合、`@copilot`をメンションすると同じエージェントの使用が継続されます。

## マージコンフリクトの解決

次の2つの方法で、pull requestのマージコンフリクトを解決するよう{% data variables.product.prodname_copilot_short %}に依頼できます。

* **「Fix with {% data variables.product.prodname_copilot_short %}」ボタンの使用**: pull requestにマージコンフリクトがある場合は、マージボックスに表示される**Fix with {% data variables.product.prodname_copilot_short %}**ボタンをクリックします。
* **@copilot メンションの使用**: pull requestのコメントで`@copilot`をメンションし、コンフリクトを修正するよう依頼します(例: 「@copilot resolve the merge conflicts on this PR」)。

{% data variables.product.prodname_copilot_short %}は競合する変更を分析し、それらを解決して、ビルド、テスト、およびリンターが引き続き成功することを確認します。その後、マージする前に解決内容を確認できるように、あなたにレビューをリクエストします。

## {% data variables.copilot.copilot_automations %}による{% data variables.product.prodname_copilot_short %}の自動実行

{% data variables.copilot.copilot_automations %}を設定して、スケジュールに従って、またはissueのオープンなどのイベントに応じて、{% data variables.product.prodname_copilot_short %}を自動的に実行できます。{% data variables.copilot.copilot_automations %}の作成と管理は、リポジトリの**Agents**タブにある**{% data variables.copilot.copilot_automations_cap %}**ペインから行います。詳しくは、[AUTOTITLE](/copilot/how-tos/use-copilot-agents/cloud-agent/create-automations)をご覧ください。

## {% data variables.product.prodname_actions %}ワークフロールンの管理

{% data reusables.copilot.cloud-agent-workflow-run-approval-default %} 詳しくは、[AUTOTITLE](/copilot/how-tos/use-copilot-agents/cloud-agent/configuring-agent-settings)をご覧ください。

## {% data variables.product.prodname_copilot_short %}の作業に対するフィードバックの提供

{% data variables.product.prodname_copilot_short %}のpull requestやコメントにあるフィードバックボタンを使用して、出力を評価します。あなたのフィードバックは、{% data variables.product.prodname_copilot_short %}の品質向上に役立ちます。

1. {% data variables.product.prodname_copilot_short %}からのpull requestまたはコメントで、親指を立てたアイコン(:+1:)または親指を下げたアイコン(:-1:)のボタンをクリックします。
1. 親指を下げたアイコンのボタンをクリックした場合は、必要に応じて理由を選択してコメントを残し、**Submit feedback**をクリックします。

## 参考資料

* [AUTOTITLE](/copilot/concepts/copilot-surfaces/copilot-on-github)
* [AUTOTITLE](/copilot/tutorials/cloud-agent/get-the-best-results)
* [AUTOTITLE](/copilot/how-tos/use-copilot-agents/cloud-agent/troubleshoot-cloud-agent)
