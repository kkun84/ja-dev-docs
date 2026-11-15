---
Order: 157
TOCTitle: Insiders
PageTitle: "Visual Studio Code 1.147 (Insiders)"
MetaDescription: Learn what is new in Visual Studio Code Insiders, including agent session management, chat resources, and Markdown editing.
MetaSocialImage: 1_147/release-highlights.webp
Date: 2026-11-18
DownloadVersion: 1.147.0
Milestone: 1.147.0
ProductEdition: Insiders
---
# Visual Studio Code 1.147 <!-- %IF INSIDERS % (Insiders) %ENDIF % -->

[LinkedIn](https://www.linkedin.com/showcase/vs-code)、[X](https://go.microsoft.com/fwlink/?LinkID=533687)、[Bluesky](https://bsky.app/profile/vscode.dev)、[Instagram](https://www.instagram.com/vscode)<!-- %IF INSIDERS % | Follow Insiders Changelog on [X](https://x.com/VSCodeChangelog) or [Bluesky](https://bsky.app/profile/vscodechangelog.bsky.social) %ENDIF % --><!-- %IF IN_PRODUCT % | [View online](https://code.visualstudio.com/updates)%ENDIF % -->でフォローしてください。

---

_最終更新日: 2026年11月13日_

Visual Studio Codeの1.147<!-- %IF INSIDERS % Insiders %ENDIF % -->リリースへようこそ。

<!-- %IF INSIDERS %
These release notes cover the Insiders build of VS Code and continue to evolve as new features are added.

You can still track our progress in the [Commit log](https://github.com/Microsoft/vscode/commits/main) and our list of [Closed issues](https://github.com/Microsoft/vscode/issues?q=is%3Aissue%20is%3Aclosed%20milestone%3A1.147.0).
%ENDIF % -->

Happy Coding!

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

* テキストファイル、Markdownドキュメント、チャット、統合ブラウザータブを作成するためのエディタータブバーの**+**メニューを追加しました。_[#347849: Experimental new tab (+) button in the editor tab bar](https://github.com/microsoft/vscode/issues/347849)_
* コードの生成、チャットの開始、言語の選択、または無題ファイルを別のエディターで再度開くためのアクションを追加しました。_[#347848: Experiment: show a list of actions in the hint of new untitled files](https://github.com/microsoft/vscode/issues/347848)_
* 利用可能な場合、チャットに貼り付けられた画像に元のファイル名に基づく名前を付けます。_[#347828: Chat: name pasted images after their source file](https://github.com/microsoft/vscode/issues/347828)_
* 兄弟プロジェクト間の移動を減らすため、Agentsウィンドウの**Open Folder**ダイアログで選択したローカルフォルダーの親フォルダーを開始位置にしました。_[#335652: Choose Folder: Make parent folder of current folder the starting point](https://github.com/microsoft/vscode/issues/335652)_
* ツールバーメニューを使用して、Agentsウィンドウのクリーンアップエディターでワークツリーをフィルター処理および並べ替えます。_[#347138: Controls area for worktree cleanup could use some design love](https://github.com/microsoft/vscode/issues/347138)_
* HTMLおよびCSSファイル内の1行の`#region`コメントに対してminimapセクションヘッダーを表示します。_[#210637: Minimap section headers are not shown for regions in HTML and CSS](https://github.com/microsoft/vscode/issues/210637)_
* [ローカル拡張機能の開発](https://code.visualstudio.com/api/advanced-topics/using-proposed-api)中にエディターおよびAgentsウィンドウのタイトルバーにボタンを追加するための提案中の`contribTitleBar` APIを追加しました。_[#347839: Proposed API: let extensions contribute buttons to the title bar of the editor and Agents windows](https://github.com/microsoft/vscode/issues/347839)_
* 試験的な**AI Usage Statistics** Status Barウィジェットを削除しました。_[#340001: Remove the AI Usage Statistics widget](https://github.com/microsoft/vscode/issues/340001)_

## 2026年11月11日

* 両方のウィンドウが同じエージェントホストを使用している場合、AgentsウィンドウとWSL、Remote - SSH、またはDev Containerのエディターウィンドウ間でエージェントセッションを共有します。_[#346859: Share agent host sessions between the Agents Window and WSL, SSH and Dev Container editor windows](https://github.com/microsoft/vscode/issues/346859)_
* 互換性のあるinboxカテゴリ間でセッションをドラッグして、ピン留め、保留、クリア、アーカイブ、または再開できます(Experimental)。_[#346934: Inbox mode: Sessions cannot be dragged between groups](https://github.com/microsoft/vscode/issues/346934)_
* すべてのWebリンクを統合ブラウザーで開くことができるようにしました。_[#316528: Option to open all links in Integrated Browser](https://github.com/microsoft/vscode/issues/316528)_

## 2026年11月10日

* inboxモードで対象となるセッションにインラインの**Merge Pull Request**アクションを追加しました(Experimental)。_[#346936: Inbox mode: Ready to Merge sessions have no inline Merge action](https://github.com/microsoft/vscode/issues/346936)_
* **Inbox**を表示したまま、inboxモードで空のカテゴリを非表示にしました(Experimental)。_[#346938: Inbox mode: Empty sections take up too much vertical space](https://github.com/microsoft/vscode/issues/346938)_
* AgentsウィンドウでCompare Models (Preview)の親チャットにカーソルを合わせると、その元の設定が表示されます。_[#347109: Model compare: show original settings on hover of the parent chat](https://github.com/microsoft/vscode/issues/347109)_
* セッション復元のリマインダーを維持しながら、ワークツリークリーンアップの確認メッセージを簡潔にしました。_[#347134: Worktree cleanup confirmation is unncessarily wordy](https://github.com/microsoft/vscode/issues/347134)_
* Markdownエディターで折りたたみ可能な`<details>`セクションのサポートを追加しました(Experimental)。_[#347433: Markdown editor: render `<details>`/`<summary>` as collapsible sections](https://github.com/microsoft/vscode/issues/347433)_
* チャット入力欄の上にピン留めされたチャットファイルを表示するサポートを追加しました(Experimental)。_[#345427: Let extensions dock views above the chat input](https://github.com/microsoft/vscode/issues/345427)_
* VS Code petを非表示にするコンテキストメニューオプションを追加しました(Experimental)。_[#346510: Remove option for vscode-pet](https://github.com/microsoft/vscode/issues/346510)_
* ワークスペースと実行環境でinboxセッションをフィルター処理します(Experimental)。_[#347488: Add workspace and environment scope pickers to Inbox](https://github.com/microsoft/vscode/issues/347488)_

---

新機能が準備でき次第すぐにお試しいただけることに感謝いたします。定期的にこちらをご確認いただき、新機能をご確認ください。

<a id="scroll-to-top" role="button" title="Scroll to top" aria-label="scroll to top" href="#"><span class="icon"></span></a>
<link rel="stylesheet" type="text/css" href="css/inproduct_releasenotes.css"/>