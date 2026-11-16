---
Order: 157
TOCTitle: Insiders
PageTitle: "Visual Studio Code 1.147 (Insiders)"
MetaDescription: "エージェントセッション管理、チャットリソース、Markdown編集など、Visual Studio Code Insidersの新機能をご確認ください。"
MetaSocialImage: 1_147/release-highlights.webp
Date: 2026-11-18
DownloadVersion: 1.147.0
Milestone: 1.147.0
ProductEdition: Insiders
---
# Visual Studio Code 1.147 <!-- %IF INSIDERS % (Insiders) %ENDIF % -->

[LinkedIn](https://www.linkedin.com/showcase/vs-code)、[X](https://go.microsoft.com/fwlink/?LinkID=533687)、[Bluesky](https://bsky.app/profile/vscode.dev)、[Instagram](https://www.instagram.com/vscode)をフォローしてください<!-- %IF INSIDERS % | Follow Insiders Changelog on [X](https://x.com/VSCodeChangelog) or [Bluesky](https://bsky.app/profile/vscodechangelog.bsky.social) %ENDIF % --> <!-- %IF IN_PRODUCT % | [View online](https://code.visualstudio.com/updates)%ENDIF % -->

---

_最終更新日: 2026年11月13日_

Visual Studio Code 1.147 <!-- %IF INSIDERS % Insiders %ENDIF % -->リリースへようこそ。

<!-- %IF INSIDERS %
These release notes cover the Insiders build of VS Code and continue to evolve as new features are added.

You can still track our progress in the [Commit log](https://github.com/Microsoft/vscode/commits/main) and our list of [Closed issues](https://github.com/Microsoft/vscode/issues?q=is%3Aissue%20is%3Aclosed%20milestone%3A1.147.0).
%ENDIF % -->

ハッピーコーディング！

---

<!-- %IF STABLE %
To try new features as soon as possible, [**download the nightly Insiders build**](https://code.visualstudio.com/insiders), which includes the latest updates as soon as they are available.

---
%ENDIF % -->

<!-- TOC
<div class="toc-nav-layout">
  <nav id="toc-nav">
    <div>In this update</div>
    <ul>
      <li><a href="#november-12-2026">November 12, 2026</a></li>
      <li><a href="#november-11-2026">November 11, 2026</a></li>
      <li><a href="#november-10-2026">November 10, 2026</a></li>
    </ul>
  </nav>
  <div class="notes-main">
Navigation End -->

## 2026年11月12日

* テキストファイル、Markdownドキュメント、チャット、統合ブラウザタブを作成するためのエディタータブバー**+**メニューを追加しました。_[#347849:エディタータブバーの実験的な新しいタブ(+)ボタン](https://github.com/microsoft/vscode/issues/347849)_
* コードの生成、チャットの開始、言語の選択、または名前未設定ファイルを別のエディターで再度開くためのアクションを追加しました。_[#347848:実験的機能:新しい名前未設定ファイルのヒントにアクションのリストを表示する](https://github.com/microsoft/vscode/issues/347848)_
* チャットに貼り付けられた画像の名前を、可能であればそのソースファイルにちなんだものに変更するようにしました。_[#347828:チャット:貼り付けられた画像にソースファイルの名前を付ける](https://github.com/microsoft/vscode/issues/347828)_
* Agentsウィンドウの**[フォルダーを開く]**ダイアログが選択したローカルフォルダーの親から開始されるようになり、兄弟プロジェクト間の移動が減りました。_[#335652:フォルダーの選択:現在のフォルダーの親フォルダーを開始点にする](https://github.com/microsoft/vscode/issues/335652)_
* ツールバーメニューを使用して、Agentsウィンドウのクリーンアップエディターでワークツリーをフィルターおよび並べ替えできるようになりました。_[#347138:ワークツリークリーンアップ用のコントロール領域のデザイン改善](https://github.com/microsoft/vscode/issues/347138)_
* HTMLおよびCSSファイル内の単行の`#region`コメントに対するミニマップのセクションヘッダーを表示するようにしました。_[#210637: HTMLおよびCSSのリージョンに対してミニマップのセクションヘッダーが表示されない](https://github.com/microsoft/vscode/issues/210637)_
* [ローカル拡張機能の開発](https://code.visualstudio.com/api/advanced-topics/using-proposed-api)中に、エディターおよびAgentsウィンドウのタイトルバーにボタンを提供する機能を追加するための、提案中の`contribTitleBar` APIを追加しました。_[#347839:提案中のAPI:エディターとAgentsウィンドウのタイトルバーに拡張機能からボタンを追加できるようにする](https://github.com/microsoft/vscode/issues/347839)_
* 実験的な**[AI使用統計情報]**ステータスバーウィジェットを削除しました。_[#340001: AI使用統計情報ウィジェットを削除する](https://github.com/microsoft/vscode/issues/340001)_

## 2026年11月11日

* 両方のウィンドウが同じエージェントホストを使用している場合、Agentsウィンドウと、WSL、Remote - SSH、またはDev Containerエディターウィンドウの間でエージェントセッションを共有できるようになりました。_[#346859: AgentsウィンドウとWSL、SSH、Dev Containerエディターウィンドウの間でエージェントホストセッションを共有する](https://github.com/microsoft/vscode/issues/346859)_
* 互換性のある受信トレイのカテゴリ間でセッションをドラッグして、ピン留め、保留、クリア、アーカイブ、または再開できるようになりました（実験的）。_[#346934:受信トレイモード:グループ間でセッションをドラッグできない](https://github.com/microsoft/vscode/issues/346934)_
* すべてのWebリンクを統合ブラウザで開く機能を有効にしました。_[#316528:すべてのリンクを統合ブラウザで開くオプション](https://github.com/microsoft/vscode/issues/316528)_

## 2026年11月10日

* 受信トレイモードで、条件を満たすセッションに対してインラインの**[プルリクエストのマージ]**アクションを追加しました（実験的）。_[#346936:受信トレイモード:マージ準備完了のセッションにインラインのマージアクションがない](https://github.com/microsoft/vscode/issues/346936)_
* **[受信トレイ]**を表示したまま、受信トレイモードで空のカテゴリを非表示にするようにしました（実験的）。_[#346938:受信トレイモード:空のセクションが垂直方向のスペースを占有しすぎる](https://github.com/microsoft/vscode/issues/346938)_
* Agentsウィンドウで「モデルの比較(プレビュー)」の親チャットにマウスオーバーすると、その元の設定が表示されるようになりました。_[#347109:モデルの比較:親チャットへのマウスオーバー時に元の設定を表示する](https://github.com/microsoft/vscode/issues/347109)_
* セッション復元のリマインダーを維持しながら、ワークツリークリーンアップの確認メッセージを短縮しました。_[#347134:ワークツリークリーンアップの確認メッセージが不要に冗長である](https://github.com/microsoft/vscode/issues/347134)_
* Markdownエディターで折りたたみ可能な`<details>`セクションのサポートを追加しました（実験的）。_[#347433: Markdownエディター: `<details>`/`<summary>`を折りたたみ可能なセクションとしてレンダリングする](https://github.com/microsoft/vscode/issues/347433)_
* チャット入力の上にピン留めされたチャットファイルを表示する機能のサポートを追加しました（実験的）。_[#345427:拡張機能がチャット入力の上にビューをドッキングできるようにする](https://github.com/microsoft/vscode/issues/345427)_
* VS Codeのペットを非表示にするコンテキストメニューオプションを追加しました（実験的）。_[#346510: vscode-petのオプションを削除する](https://github.com/microsoft/vscode/issues/346510)_
* ワークスペースおよび実行環境ごとに受信トレイのセッションをフィルターできるようになりました（実験的）。_[#347488:受信トレイにワークスペースと環境スコープのピッカーを追加する](https://github.com/microsoft/vscode/issues/347488)_

---

新しい機能の準備ができたらすぐに試してくださるユーザーの皆様に心より感謝いたします。ぜひ頻繁にこちらを確認して新機能についてご確認ください。

<a id="scroll-to-top" role="button" title="Scroll to top" aria-label="scroll to top" href="#"><span class="icon"></span></a>
<link rel="stylesheet" type="text/css" href="css/inproduct_releasenotes.css"/>
