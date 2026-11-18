---
ContentId: DE4EAE2F-4542-4363-BB74-BE47D64141E6
DateApproved: 11/11/2026
MetaDescription: "複数カーソル、検索、フォーマット、折りたたみ、自動括弧閉じを使用して、Visual Studio Codeで効率的にコードを編集します。"
MetaSocialImage: images/codebasics/code-basics-social.png
---
# 基本的な編集

Visual Studio Codeは何よりもまずエディターであり、生産性の高いソースコード編集に必要な機能を備えています。このトピックでは、エディターの基本について説明し、コード作成をスムーズに進められるようにします。

## キーボードショートカット

コードの記述中にキーボードから手を離さないことは、高い生産性を維持するために不可欠です。VS Codeには豊富なデフォルトのキーボードショートカットが用意されており、それらをカスタマイズすることもできます。

* [キーボードショートカットのリファレンス](/docs/configure/keybindings.md#keyboard-shortcuts-reference) -リファレンスシートをダウンロードして、最もよく使われる人気のキーボードショートカットを学びます。
* [キーマップ拡張機能のインストール](/docs/configure/keybindings.md#keymap-extensions) -キーマップ拡張機能をインストールすることで、VS Codeで以前のエディター（Sublime Text、Atom、Vimなど）のキーボードショートカットを使用できます。
* [キーボードショートカットのカスタマイズ](/docs/configure/keybindings.md#keyboard-shortcuts-editor) -自分のスタイルに合わせてデフォルトのキーボードショートカットを変更します。

## 複数選択（マルチカーソル）

VS Codeは、高速で同時に編集するためのマルチカーソルをサポートしています。`kbstyle(Alt+Click)`を使用して、セカンダリカーソル（薄く表示されます）を追加できます。各カーソルは、配置されたコンテキストに基づいて独立して動作します。カーソルを追加する一般的な方法として、下または上にカーソルを挿入する`<kbd title="macOS: ⌥⌘Down">Ctrl+Alt+Down</kbd>`または`<kbd title="macOS: ⌥⌘Up">Ctrl+Alt+Up</kbd>`があります。

> [!NOTE]
> グラフィックカードのドライバー（NVIDIAなど）がこれらのデフォルトのショートカットを上書きする場合があります。

<video src="images/codebasics/multicursor.mp4" title="Video showing Multi-cursor." autoplay loop controls muted></video>

`<kbd title="macOS: ⌘D">Ctrl+D</kbd>`は、カーソル位置の単語、または現在の選択範囲の次の出現箇所を選択します。

>[!TIP]
> マルチカーソル検索の使用中に、一致する次の出現箇所をスキップするには、`<kbd title="macOS: ⌘K ⌘D">Ctrl+K Ctrl+D</kbd>`を実行します。これにより、繰り返しテキストを編集する際に不要な選択が追加されるのを防ぐことができます。

<video src="images/codebasics/multicursor-word.mp4" title="Video showing Multi-cursor-next-word." autoplay loop controls muted></video>

> [!TIP]
> また、`<kbd title="macOS: ⇧⌘L">Ctrl+Shift+L</kbd>`を使用してカーソルを追加することもできます。これにより、現在選択されているテキストの各出現箇所に選択範囲が追加されます。

### マルチカーソル修飾子

複数カーソルを適用するための修飾キーを、macOSでは`kbstyle(Cmd+Click)`に、WindowsおよびLinuxでは`kbstyle(Ctrl+Click)`に変更したい場合は、`setting(editor.multiCursorModifier)`[設定](/docs/configure/settings.md)で行うことができます。これにより、Sublime TextやAtomなどの他のエディターから移行してきたユーザーも、慣れ親しんだキーボード修飾子を使い続けることができます。

この設定には次の値を指定できます。

* `ctrlCmd` - Windowsでは`kbstyle(Ctrl)`、macOSでは`kbstyle(Cmd)`に割り当てられます。
* `alt` -既存のデフォルトである`kbstyle(Alt)`です。

また、**[選択(Selection)]** > **[マルチカーソルにCtrl+Clickを使用(Switch to Ctrl+Click for Multi-Cursor)]**または**[選択(Selection)]** > **[マルチカーソルにAlt+Clickを使用(Switch to Alt+Click for Multi-Cursor)]**メニュー項目を使用して、この設定をすばやく切り替えることもできます。

**[定義へ移動(Go to Definition)]**および**[リンクを開く(Open Link)]**のジェスチャもこの設定を尊重し、競合しないように適応します。たとえば、設定が`ctrlCmd`の場合、複数カーソルは`kbstyle(Ctrl/Cmd+Click)`で追加でき、リンクを開く操作や定義へ移動する操作は`kbstyle(Alt+Click)`で呼び出すことができます。

### 選択範囲の縮小/拡大

現在の選択範囲を素早く縮小または拡大します。`<kbd title="macOS: ⌃⇧Left">Shift+Alt+Left</kbd>`および`<kbd title="macOS: ⌃⇧Right">Shift+Alt+Right</kbd>`でトリガーします。

以下は、`<kbd title="macOS: ⌃⇧Right">Shift+Alt+Right</kbd>`で選択範囲を拡大する例です。

<video src="images/codebasics/expandselection.mp4" title="Video showing Expand selection." autoplay loop controls muted></video>

## 列（ボックス）選択

一方の隅にカーソルを置き、`kbstyle(Shift+Alt)`を押しながら反対側の隅までドラッグします。

<video src="images/codebasics/column-select.mp4" title="Video showing Column text selection." autoplay loop controls muted></video>

> [!NOTE]
> `kbstyle(Ctrl/Cmd)`を[マルチカーソル修飾子](#multi-cursor-modifier)として使用している場合、これは`kbstyle(Shift+Ctrl/Cmd)`に変わります。

macOSおよびWindowsには列選択用のデフォルトのキーボードショートカットもありますが、Linuxにはありません。

キー|コマンド|コマンドID
---|-------|----------
`<kbd title="macOS: ⌥⇧⌘Down">Ctrl+Shift+Alt+Down</kbd>`|列を選択して下へ|`cursorColumnSelectDown`
`<kbd title="macOS: ⌥⇧⌘Up">Ctrl+Shift+Alt+Up</kbd>`|列を選択して上へ|`cursorColumnSelectUp`
`<kbd title="macOS: ⌥⇧⌘Left">Ctrl+Shift+Alt+Left</kbd>`|列を選択して左へ|`cursorColumnSelectLeft`
`<kbd title="macOS: ⌥⇧⌘Right">Ctrl+Shift+Alt+Right</kbd>`|列を選択して右へ|`cursorColumnSelectRight`
`<kbd title="macOS: ⌥⇧⌘Pagedown">Ctrl+Shift+Alt+Pagedown</kbd>`|列を選択してページ下へ|`cursorColumnSelectPageDown`
`<kbd title="macOS: ⌥⇧⌘Pageup">Ctrl+Shift+Alt+Pageup</kbd>`|列を選択してページ上へ|`cursorColumnSelectPageUp`

必要に応じて、`keybindings.json`を[編集](/docs/configure/keybindings.md)して、より馴染みのあるものにバインドすることができます。

### 列選択の貼り付け

列選択をコピーして単一のカーソル位置に貼り付ける場合、`setting(editor.multiCursorPaste)`のデフォルトの`spread`値は、コピーした各行を同じ視覚的列の連続した行に挿入します。列を維持するために、エディターは必要に応じて、短い宛先の行やコピーされた行に通常のスペースをパディングします。

この例では、コピーされた行は`A`、`B`、および`C`であり、`|`はカーソルを表しています。

```text
Before          After
abc|            abcA
x               x  B
123456          123C456
```

コピーしたテキストを通常の複数行テキストとして1つの宛先に貼り付けるには、`setting(editor.multiCursorPaste)`を`full`に設定します。

複数のカーソルに貼り付ける場合、コピーされた行の数がカーソルの数と一致していれば、ドキュメントの順序で1行ずつ割り当てられます。それ以外の場合は、コピーされたテキスト全体が各カーソルに貼り付けられます。

### 列選択モード

ユーザー設定の**[エディター:列選択(Editor: Column Selection)]**がこの機能を制御します。このモードに入ると、ステータスバーに示されるように、マウスジェスチャと矢印キーによってデフォルトで列選択が作成されます。このグローバルな切り替えは、**[選択(Selection)]** > **[列選択モード(Column Selection Mode)]**メニュー項目からもアクセスできます。さらに、ステータスバーから列選択モードを無効にすることもできます。

## 対応する括弧の自動補完

開き括弧を入力すると、アクティブな言語構成に基づいて、VS Codeに対応する閉じ括弧を挿入させることができます。この動作は`setting(editor.autoClosingBrackets)`設定で制御されます。

* `languageDefined`:言語構成を使用して、閉じ括弧を挿入するタイミングを決定します。この値がデフォルトです。
* `beforeWhitespace`:カーソルが空白文字の前にある場合にのみ、閉じ括弧を挿入します。
* `always`:常に閉じ括弧を挿入します。
* `never`:閉じ括弧を挿入しません。

`languageDefined`および`beforeWhitespace`の値の場合、対応するペアのない閉じ括弧がドキュメントの後のほうに存在する場合、VS Codeは重複して挿入しません。ペアのない閉じ括弧がすでに存在する場合でも閉じ括弧を挿入するには、`setting(editor.autoClosingBrackets)`を`always`に設定します。

> [!NOTE]
> 括弧のバランス調整は、トークン認識型の括弧情報に依存します。トークン化が完了するまで、または括弧ペアの分析には大きすぎるファイルの場合、エディターは標準の自動補完動作を使用します。複数のカーソルがある場合、いずれかのカーソルがペアのない閉じ括弧とペアにできる場合、エディターはすべてのカーソルで自動補完を抑制します。

引用符の自動補完は、`setting(editor.autoClosingQuotes)`設定によって個別に制御されます。

## 保存/自動保存

デフォルトでは、VS Codeでディスクに変更を保存するには、`<kbd title="macOS: ⌘S">Ctrl+S</kbd>`という明示的なアクションが必要です。

エディターに変更が保存されていない場合、エディタータブにドットインジケーターが表示され、エクスプローラービューには未保存ファイルの数を示すバッジが表示されます。これらの変更はまだディスクに保存されていませんが、アプリケーションが予期せず終了した場合に復元できるように、VS Codeが自動的にバックアップを作成します（[ホットエグジット](#hot-exit)を参照してください）。

ただし、`Auto Save`を簡単に有効にすることができます。これにより、設定された遅延の後、またはエディターからフォーカスが外れたとき変更が保存されます。このオプションを有効にすると、ファイルを明示的に保存する必要はありません。`Auto Save`を有効にする最も簡単な方法は、**[ファイル(File)]** > **[自動保存(Auto Save)]**の切り替えを使用して、一定時間経過後の保存をオンまたはオフにすることです。

`Auto Save`の詳細を制御するには、ユーザーまたはワークスペースの[設定](/docs/configure/settings.md)を開き、関連する設定を見つけます。

* `setting(files.autoSave)`:次の値を取ることができます。
  * `off` -自動保存を無効にします。
  * `afterDelay` -設定された遅延の後にファイルを保存します（デフォルトは1000 ms）。
  * `onFocusChange` -変更されたファイルの編集画面からフォーカスが外れたときにファイルを保存します。
  * `onWindowChange` - VS Codeウィンドウからフォーカスが外れたときにファイルを保存します。
* `setting(files.autoSaveDelay)`: `setting(files.autoSave)`が`afterDelay`に設定されている場合の遅延時間をミリ秒単位で設定します。デフォルトは1000 msです。

特定の言語やファイルタイプに対して`Auto Save`の機能をカスタマイズしたい場合は、言語固有のルールを加えて`settings.json`ファイルから行うことができます。

たとえば、LaTeXファイルに対して`Auto Save`を無効にするには、次のように設定します。

```json
    "[latex]": {
        "files.autoSave": "off",
    },
```

## ホットエグジット

デフォルトでは、VS Codeは終了時にファイルの未保存の変更を記憶します。ホットエグジットは、**[ファイル(File)]** > **[終了(Exit)]**（macOSでは**[Code]** > **[終了(Quit)]**）からアプリケーションが閉じられたとき、または最後のウィンドウが閉じられたときにトリガーされます。

`setting(files.hotExit)`に次の値を設定して、ホットエグジットを構成できます。

* `"off"`:ホットエグジットを無効にします。
* `"onExit"`:アプリケーションが閉じられたとき、つまりWindows/Linuxで最後のウィンドウが閉じられたとき、または`workbench.action.quit`コマンドがトリガーされたとき（**[コマンドパレット(Command Palette)]**、キーボードショートカット、またはメニューから）に、ホットエグジットがトリガーされます。フォルダーが開いていないすべてのウィンドウは、次回の起動時に復元されます。
* `"onExitAndWindowClose"`:アプリケーションが閉じられたとき、つまりWindows/Linuxで最後のウィンドウが閉じられたとき、または`workbench.action.quit`コマンドがトリガーされたとき（**[コマンドパレット(Command Palette)]**、キーボードショートカット、またはメニューから）に、ホットエグジットがトリガーされます。また、最後のウィンドウであるかどうかに関係なく、フォルダーが開いているウィンドウでもトリガーされます。フォルダーが開いていないすべてのウィンドウは、次回の起動時に復元されます。シャットダウン前と同じようにフォルダーウィンドウを復元するには、`setting(window.restoreWindows)`を`all`に設定します。

ホットエグジットに問題が発生した場合、標準のインストール場所の次のフォルダーにすべてのバックアップが保存されます。

* **Windows** `%APPDATA%\Code\Backups`
* **macOS** `$HOME/Library/Application Support/Code/Backups`
* **Linux** `$HOME/.config/Code/Backups`

## 検索と置換

VS Codeを使用すると、現在開いているファイル内のテキストをすばやく検索して置換できます。`<kbd title="macOS: ⌘F">Ctrl+F</kbd>`を押してエディターで検索コントロールを開き、検索文字列を入力します。検索結果は、エディター、概要ルーラー、およびミニマップで強調表示されます。

VS Codeは、入力時にすぐに検索を開始します。`kbstyle(Enter)`を押したときにのみ検索を開始するには、`setting(editor.find.findOnType)`設定をオフにします。

一致が見つかった後に検索コントロールを自動的に閉じ、エディターにフォーカスを戻すには、`setting(editor.find.closeOnResult)`設定を有効にします。

現在のファイル内に複数の一致がある場合は、検索入力ボックスにフォーカスがある状態で`<kbd title="macOS: F3">F3</kbd>`を押して次の結果に移動するか、`<kbd title="macOS: ⇧F3">Shift+F3</kbd>`を押して前の結果に移動します。

デフォルトでは、VS Codeはワークスペースの検索と置換のクエリの履歴を保存し、再起動後もそれを復元します。この動作は、`setting(editor.find.history)`および`setting(editor.find.replaceHistory)`設定で構成できます。履歴の保存を無効にするには、値を`never`に設定します。

### 選択範囲からの検索文字列のシード

検索コントロールを開くと、エディターで選択されているテキストが検索入力ボックスに自動的に入力されます。選択範囲が空の場合、代わりにカーソル下の単語が入力ボックスに挿入されます。

<video src="images/codebasics/seed-search-string-from-selection.mp4" title="Video showing Seed Search String From Selection." autoplay loop controls muted></video>

この機能は、`setting(editor.find.seedSearchStringFromSelection)`を`"never"`に設定することでオフにすることができます。

### 選択範囲内を検索

デフォルトでは、検索操作はエディター内のファイル全体に対して実行されます。検索をテキストの選択範囲に限定するには、検索コントロールの**[選択範囲内を検索(Find in Selection)]**アイコンを選択するか、`<kbd title="macOS: ⌥⌘L">Alt+L</kbd>`を押します。

<video src="images/codebasics/find-in-selection.mp4" title="Video showing Find In Selection." autoplay loop controls muted></video>

これを検索コントロールのデフォルトの動作にしたい場合は、`setting(editor.find.autoFindInSelection)`を`always`に設定するか、複数行のコンテンツが選択されている場合にのみ選択したテキストに対して実行したい場合は`multiline`に設定します。

### 高度な検索と置換のオプション

より高度なシナリオのために、検索および置換コントロールには次のオプションがあります。

* 検索コントロール:

  * 大文字と小文字を区別する(Match Case)
  * 単語単位で一致させる(Match Whole Word)
  * 正規表現(Regular Expression)

* 置換コントロール:

  * 大文字と小文字の維持(Preserve case)

![高度な検索と置換のオプション](images/codebasics/search-replace-advanced-options.png)

### 複数行のサポートと検索コントロールのサイズ変更

検索入力ボックスと置換入力ボックスにテキストを貼り付けることで、複数行のテキストを検索できます。`kbstyle(Ctrl+Enter)`を押すと、入力ボックスに新しい行が挿入されます。

<video src="images/codebasics/multiple-line-support.mp4" title="Video showing Multiple Line Support." autoplay loop controls muted></video>

長いテキストを検索しているとき、検索コントロールのデフォルトサイズが小さすぎる場合があります。左側のサッシュをドラッグして検索コントロールを拡大するか、左側のサッシュをダブルクリックして最大化するか、デフォルトサイズに縮小することができます。

<video src="images/codebasics/resize-find-widget.mp4" title="Video showing Resize Find control." autoplay loop controls muted></video>

## ファイル横断検索

VS Codeを使用すると、現在開いているフォルダー内のすべてのファイルを素早く検索できます。`<kbd title="macOS: ⇧⌘F">Ctrl+Shift+F</kbd>`を押して検索語を入力します。検索結果は、検索語を含むファイルごとにグループ化され、各ファイル内のヒット数とその場所が表示されます。ファイル展開すると、そのファイル内のすべてのヒットのプレビューが表示されます。次に、ヒットの1つをシングルクリックして、エディターで表示します。

![ファイル間のシンプルなテキスト検索](images/codebasics/search.png)

> [!TIP]
> VS Codeは、検索ボックスでの正規表現検索もサポートしています。

検索ボックスの右下にある省略記号（**[検索の詳細の切り替え(Toggle Search Details)]**）を選択するか、`<kbd title="macOS: ⇧⌘J">Ctrl+Shift+J</kbd>`を押すことで、高度な検索オプションを構成できます。これにより、検索を構成するための追加フィールドが表示されます。

> [!TIP]
> クイック検索を使用すると、現在開いているフォルダー内のすべてのファイルからテキストをすばやく見つけることができます。コマンドパレット（`<kbd title="macOS: F1">F1</kbd>`）を開き、**[検索:クイック検索(Search: Quick Search)]**コマンドを入力します。

### 高度な検索オプション

![高度な検索オプション](images/codebasics/searchadvanced-v2.png)

検索ボックスの下にある2つの入力ボックスには、検索に含めるパターンや除外するパターンを入力できます。`example`と入力すると、ワークスペース内の`example`という名前のすべてのフォルダーとファイルに一致します。`./example`と入力すると、ワークスペースのトップレベルにある`example/`フォルダーに一致します。複数のパターンを区切るには`,`を使用します。パスにはスラッシュを使用する必要があります。また、[globパターン](/docs/editor/glob-patterns.md)の構文を使用することもできます。例: 

* パスセグメント内の0文字以上の文字に一致する`*`
* パスセグメント内の1文字に一致する`?`
* なしを含め、任意の数のパスセグメントに一致する`**`
* 条件をグループ化するための`{}`（例: `{**/*.html,**/*.txt}`はすべてのHTMLファイルとテキストファイルに一致します）
* 一致させる文字の範囲を**宣言**するための`[]`（`example.0`、`example.1`、…に一致させるための`example.[0-9]`）
* 一致させる文字の範囲を否定するための`[!...]`（`example.a`、`example.b`に一致し、`example.0`には一致しない`example.[!0-9]`）

**大文字と小文字の区別に関する注意:** Globパターンは、オペレーティングシステムのファイルシステムルールに従います。WindowsおよびmacOSでは、パターンは大文字と小文字を区別しません（たとえば、`*.CS`は`file.cs`に一致します）。Linuxでは、パターンは大文字と小文字を区別します。これは、検索テキスト自体が大文字と小文字を区別するかどうかを制御する、検索テキストの**[大文字と小文字を区別(Match Case)]**切り替えとは別です。[globパターン](/docs/editor/glob-patterns.md#case-sensitivity)の詳細については、こちらをご覧ください。

VS Codeは、興味のない検索結果の数を減らすために、デフォルトで一部のフォルダーを除外します（例: `node_modules`）。`setting(files.exclude)`および`setting(search.exclude)`セクションの下でこれらの規則を変更するには、[設定](/docs/configure/settings.md)を開きます。

エクスプローラーに表示せずに除外されたフォルダー内の選択したファイルを検索するには、[settings.jsonファイル](/docs/configure/settings.md#settings-json-file)の`setting(search.exclude)`に`!`例外を追加します。たとえば、この例外は、デフォルトの`node_modules`除外にもかかわらず`node_modules/@types`を検索します。

```json
{
  "search.exclude": {
    "!node_modules/@types": true
  }
}
```

検索は`setting(files.exclude)`からパターンを継承し、どちらかの設定の例外で、もう一方の除外を上書きできます。例外はクイックオープンのファイル検索にも適用され、`.gitignore`ルールを上書きします。これらはこれらの設定にのみ適用され、**[除外するファイル(files to exclude)]**入力ボックスには適用されません。優先順位のルールと制限については、[除外の例外](/docs/editor/glob-patterns.md#exclude-exceptions)を参照してください。

検索ビューのglobパターンは、`setting(files.exclude)`や`setting(search.exclude)`などの設定とは動作が異なることに注意してください。設定では、ワークスペース内のサブフォルダー`folder1/example`にある`example`という名前のフォルダーに一致させるために、`**/example`を使用する必要があります。検索ビューでは、`**`プレフィックスが想定されます。これらの設定のglobパターンは、常にワークスペースフォルダーのパスからの相対パスとして評価されます。

また、**files to exclude**ボックスにある**Use Exclude Settings and Ignore Files**トグルボタンにも注意してください。このトグルは、`.gitignore`ファイルによって無視されるファイル、および/または`setting(files.exclude)`や`setting(search.exclude)`設定に一致するファイルを除外するかどうかを決定します。

**files to include**ボックスでは、**Search only in changed files**トグルボタンを使用して、検索結果をソース管理のコミットされていない変更があるファイルに限定できます。リポジトリがない場合や検索する変更がない場合、このトグルは無効になります。

> [!NOTE]
> `.gitignore`ファイル内のパターンは、WindowsとmacOSでは大文字と小文字を区別せず、Linuxでは区別して一致させます。詳細については、[globパターンが大文字と小文字を区別するかどうか](/docs/editor/glob-patterns.md#case-sensitivity)を参照してください。

> [!TIP]
> エクスプローラーからフォルダーを右クリックし、**Find in Folder**を選択して、フォルダー内のみを検索できます。

### 検索のパフォーマンスと過剰なripgrepプロセスに関するトラブルシューティング

VS Codeは、高速なワークスペース検索を実行するために[ripgrep](https://github.com/BurntSushi/ripgrep) (`rg`)ツールを使用しています。大規模なコードベースにおいて、検索が遅くなった場合や、複数の`rg`プロセスが多くのCPUを消費している場合は、次の設定を確認してください。

1. **「Use Exclude Settings and Ignore Files」トグルの確認:**検索ビューで**Toggle Search Details** (省略記号`...`アイコン)を展開し、**files to exclude**ボックス内の**Use Exclude Settings and Ignore Files**トグルボタン(歯車アイコン)が有効になっていることを確認します。このトグルをオフにすると、除外ファイルや`files.exclude`、`search.exclude`設定がバイパスされます。これにより、`node_modules`やビルド出力などの大規模なディレクトリが含まれる可能性があり、検索時間とCPU使用率が増加します。**files to include**および**files to exclude**の明示的なパターンは引き続き適用されます。
2. **除外設定の確認:**検索時に`.gitignore`ファイルと`.ignore`ファイルが考慮されるように、設定で`setting(search.useIgnoreFiles)`が(デフォルトの) `true`に設定されていることを確認します。
3. **シンボリックリンクの追跡の無効化:**ワークスペースに循環的なシンボリックリンクや大規模なシンボリックリンクディレクトリが含まれている場合は、設定で`setting(search.followSymlinks)`を`false`に設定し、`rg`が外部または再帰的なリンクを走査しないようにします。
4. **大規模な生成されたディレクトリの除外:**プロジェクト固有のビルドフォルダー、パッケージマネージャーの成果物、またはワークツリーを、`settings.json`内の`setting(search.exclude)`に追加します。

   ```json
   {
     "search.exclude": {
       "**/node_modules/**": true,
       "**/target/**": true,
       "**/.worktrees/**": true
     }
   }
   ```

> [!TIP]
> 検索結果が見つからない場合や、予想よりも時間がかかる場合のその他のトラブルシューティングについては、[Search Issues wiki](https://github.com/microsoft/vscode/wiki/Search-Issues)を参照してください。

### 検索と置換

ファイル間で検索と置換を行うこともできます。検索ウィジェットを展開して、[Replace]テキストボックスを表示します。

![search and replace](images/codebasics/global-search-replace.png)

置換テキストボックスにテキストを入力すると、保留中の変更の差分が表示されます。置換テキストボックスからすべてのファイルにわたって置換を行ったり、1つのファイル内で一括置換したり、単一の変更を置換したりできます。

![search and replace diff view](images/codebasics/search-replace-example.png)

> [!TIP]
> `<kbd title="macOS: ⌥Down">Alt+Down</kbd>`と`<kbd title="macOS: ⌥Up">Alt+Up</kbd>`を使用して検索用語の履歴を移動することで、以前の検索用語をすばやく再利用できます。

### 正規表現置換における大文字と小文字の変更

VS Codeでは、エディター内またはグローバルで検索と置換を実行する際に、正規表現のマッチンググループの大文字と小文字の変更がサポートされています。これは修飾子`\u\U\l\L`を使用して行われます。ここで、`\u`と`\l`は1文字を大文字/小文字にし、`\U`と`\L`はマッチンググループの残りの部分を大文字/小文字にします。

例:

<video src="images/codebasics/case-change-replace.mp4" title="Video showing Changing case while doing find and replace." autoplay loop controls muted></video>

修飾子は積み重ねることもできます。たとえば、`\u\u\u$1`はグループの最初の3文字を大文字にし、`\l\U$1`は最初の文字を小文字にして残りを大文字にします。キャプチャグループは置換文字列内の`$n`によって参照され、`n`はキャプチャグループの順序です。

## Search Editor

Search Editorを使用すると、構文のハイライト表示や周囲のコンテキストのオプション行を備えたフルサイズのエディターでワークスペースの検索結果を表示できます。

以下は、コンテキストとして一致箇所の前後の2行のテキストと共に「SearchEditor」という単語を検索した結果です:

![Search Editor overview](images/codebasics/search-editor-overview.png)

**Open Search Editor**コマンドは、既存のSearch Editorが存在する場合はそれを開き、存在しない場合は新しく作成します。**New Search Editor**コマンドは常に新しいSearch Editorを作成します。

Search Editorでは、現在のエディターグループでソースの場所を開く`<kbd title="macOS: F12">F12</kbd>`や、横のエディターでその場所を開く`<kbd title="macOS: ⌘K F12">Ctrl+K F12</kbd>`などの**Go to Definition**アクションを使用して結果に移動できます。さらに、`setting(search.searchEditor.singleClickBehaviour)`および`setting(search.searchEditor.doubleClickBehaviour)`設定を使用して、検索結果をシングルクリックまたはダブルクリックしたときの動作を設定できます。たとえば、定義のピークウィンドウを開くか、ソースの場所を開くかを選択できます。

また、検索ビューの上部にある**Open New Search Editor**ボタンを使用したり、結果ツリーの上部にある**Open in editor**リンクや**Search Editor: Open Results in Editor**コマンドを使用して、検索ビューから既存の結果をSearch Editorにコピーしたりすることもできます。

![Search Editor Button](images/codebasics/search-editor-button.png)

上記のSearch Editorは、検索ビューの上部にある**Open New Search Editor**ボタン(3番目のボタン)を選択して開かれました。

### Search Editorのコマンドと引数

* `search.action.openNewEditor` -新しいタブでSearch Editorを開きます。
* `search.action.openInEditor` -現在の検索結果を新しいSearch Editorにコピーします。
* `search.action.openNewEditorToSide` -現在開いているウインドウの隣の新しいウインドウでSearch Editorを開きます。

キーボードショートカットで新しいSearch Editorの動作を設定できるようにするために、Search Editorのコマンド(`search.action.openNewEditor`、`search.action.openNewEditorToSide`)に渡すことができる2つの引数があります:

* `triggerSearch` - Search Editorが開かれたときに検索を自動的に実行するかどうか。デフォルトはtrueです。
* `focusResults` -検索の結果またはクエリ入力のどちらにフォーカスを置くか。デフォルトはtrueです。

たとえば、次のキーボードショートカットは、Search Editorが開かれたときに検索を実行しますが、フォーカスは検索クエリコントロールに残します。

```json
{
    "key": "ctrl+o",
    "command": "search.action.openNewEditor",
    "args": { "query": "VS Code", "triggerSearch":true, "focusResults": false }
}
```

### Search Editorコンテキストのデフォルト

`setting(search.searchEditor.defaultNumberOfContextLines)`設定のデフォルト値は1であり、Search Editorの各結果行の前後に1行のコンテキストが表示されることを意味します。

### 最後のSearch Editorの設定を再利用する

`setting(search.searchEditor.reusePriorSearchConfiguration)`設定(デフォルトは`false`)を使用すると、新しいSearch Editorを作成するときに、最後アクティブだったSearch Editorの設定を再利用できます。

## IntelliSense

常に単語補完が提供されますが、JavaScript、JSON、HTML、CSS、SCSS、Less、C#、TypeScriptなどの豊富な[言語](/docs/languages/overview.md)向けには、真のIntelliSenseエクスペリエンスが提供されます。言語サービスが可能な補完を認識している場合、入力時にIntelliSenseのサジェストがポップアップ表示されます。`<kbd title="macOS: ⌘I">Ctrl+I</kbd>`を使用していつでも手動でトリガーできます。デフォルトでは`kbstyle(Tab)`または`kbstyle(Enter)`が受け入れのキーボードトリガーですが、[これらのキーボードショートカットをカスタマイズ](/docs/configure/keybindings.md)することもできます。

> [!TIP]
>  サジェストのフィルタリングではキャメルケースがサポートされているため、メソッド名の大文字の部分の文字を入力してサジェストを絞り込むことができます。たとえば、「cra」と入力すると、「createApplication」がすぐに表示されます。

> [!TIP]
> IntelliSenseのサジェストは、`setting(editor.quickSuggestions)`および`setting(editor.suggestOnTriggerCharacters)` [設定](/docs/configure/settings.md)で設定できます。

JavaScriptおよびTypeScript開発者は、[npmjs](https://www.npmjs.com)型宣言(typings)ファイルリポジトリを利用して、一般的なJavaScriptライブラリ(Node.js、React、Angular)のIntelliSenseを取得できます。型宣言ファイルの使用方法についての詳細な説明は、[JavaScript language](/docs/languages/javascript.md#intellisense)のトピックおよび[Node.js](/docs/nodejs/nodejs-tutorial.md)のチュートリアルに記載されています。

詳細については、[IntelliSenseのドキュメント](/docs/editing/intellisense.md)を参照してください。

## フォーマット

VS Codeは、ソースコードのフォーマットを強力にサポートしています。エディターには2つの明確なフォーマットアクションがあります:

* **Format Document** (`<kbd title="macOS: ⌥⇧F">Shift+Alt+F</kbd>`) -アクティブなファイル全体をフォーマットします。
* **Format Selection** (`<kbd title="macOS: ⌘K ⌘F">Ctrl+K Ctrl+F</kbd>`) -選択したテキストをフォーマットします。

これらは**コマンドパレット** (`<kbd title="macOS: F1">F1</kbd>`)またはエディターのコンテキストメニューから呼び出すことができます。

VS Codeには、JavaScript、TypeScript、JSON、HTML、CSSのデフォルトフォーマッタが用意されています。各言語には、ユーザー設定またはワークスペース[設定](/docs/configure/settings.md)で好みに合わせて調整できる特定のフォーマットオプション(`setting(html.format.indentInnerHtml)`など)があります。同じ言語のフォーマットを提供する別の拡張機能がインストールされている場合は、デフォルトの言語フォーマッタを無効にすることもできます。

```json
"html.format.enable": false
```

コードのフォーマットを手動で呼び出すだけでなく、入力、保存、貼り付けなどのユーザーの操作に基づいてフォーマットをトリガーすることもできます。これらはデフォルトではオフになっていますが、次の[設定](/docs/configure/settings.md)でこれらの動作を有効にすることができます:

* `setting(editor.formatOnType)` -入力後にその行をフォーマットします。
* `setting(editor.formatOnSave)` -保存時にファイルをフォーマットします。
* `setting(editor.formatOnPaste)` -貼り付けられたコンテンツをフォーマットします。

> [!NOTE]
> すべてのフォーマッタがペースト時のフォーマットをサポートしているわけではありません。これは、そのためにはテキストの選択範囲または範囲のフォーマットをサポートしている必要があるためです。

デフォルトのフォーマッタに加えて、Marketplaceで他の言語やフォーマットツールをサポートする拡張機能を見つけることができます。`Formatters`カテゴリがあるため、[フォーマット拡張機能](https://marketplace.visualstudio.com/search?target=VSCode&category=Formatters&sortBy=Installs)を簡単に検索して見つけることができます。**Extensions**ビューの検索ボックスに「formatters」または「category:formatters」と入力すると、VS Code内の拡張機能のフィルタリングされたリストが表示されます。

## 折りたたみ

行番号と行頭の間のガターにある折りたたみアイコンを使用して、ソースコードの領域を折りたたむことができます。ガターにマウスを移動してクリックすると、領域の折りたたみと展開が行われます。折りたたみアイコンで`kbstyle(Shift + Click)`を使用すると、その領域および内側のすべての領域を折りたたむか展開します。

![Folding](images/codebasics/folding.png)

次のアクションを使用することもできます:

* Fold (`<kbd title="macOS: ⌥⌘[">Ctrl+Shift+[</kbd>`)は、カーソル位置にある折りたたまれていない最も内側の領域を折りたたみます。
* Unfold (`<kbd title="macOS: ⌥⌘]">Ctrl+Shift+]</kbd>`)は、カーソル位置にある折りたたまれた領域を展開します。
* Toggle Fold (`<kbd title="macOS: ⌘K ⌘L">Ctrl+K Ctrl+L</kbd>`)は、カーソル位置にある領域を折りたたむか展開します。
* Fold Recursively (`<kbd title="macOS: ⌘K ⌘[">Ctrl+K Ctrl+[</kbd>`)は、カーソル位置にある折りたたまれていない最も内側の領域と、その領域内のすべての領域を折りたたみます。
* Unfold Recursively (`<kbd title="macOS: ⌘K ⌘]">Ctrl+K Ctrl+]</kbd>`)は、カーソル位置にある領域と、その領域内のすべての領域を展開します。
* Fold All (`<kbd title="macOS: ⌘K ⌘0">Ctrl+K Ctrl+0</kbd>`)は、エディター内のすべての領域を折りたたみます。
* Unfold All (`<kbd title="macOS: ⌘K ⌘J">Ctrl+K Ctrl+J</kbd>`)は、エディター内のすべての領域を展開します。
* Fold Level X (レベル2の場合は`<kbd title="macOS: ⌘K ⌘2">Ctrl+K Ctrl+2</kbd>`)は、現在のカーソル位置の領域を除き、レベルXのすべての領域を折りたたみます。
* Fold All Block Comments (`<kbd title="macOS: ⌘K ⌘/">Ctrl+K Ctrl+/</kbd>`)は、ブロックコメントトークンで始まるすべての領域を折りたたみます。

折りたたみ領域は、デフォルトで行のインデントに基づいて評価されます。折りたたみ領域は、行のインデントが1つ以降の行よりも小さい場合に開始し、同じかより小さいインデントの行がある場合に終了します。

折りたたみ領域は、エディターの設定された言語の構文トークンに基づいて計算することもできます。Markdown、HTML、CSS、LESS、SCSS、JSONなどの言語では、すでに構文を認識した折りたたみが提供されています。

上記の値の1つ(またはすべて)についてインデントベースの折りたたみに戻したい場合は、以下を使用します:

```json
  "[html]": {
    "editor.foldingStrategy": "indentation"
  },
```

領域は、各言語によって定義されたマーカーによって定義することもできます。現在、次の言語にマーカーが定義されています:

Language|Start region|End region
--------|------------|----------
Bat|`::#region`または`REM #region`|`::#endregion`または`REM #endregion`
C#|`#region`|`#endregion`
C/C++|`#pragma region`|`#pragma endregion`
CSS/Less/SCSS|`/*#region*/`|`/*#endregion*/`
Coffeescript|`#region`|`#endregion`
F#|`//#region`または`(#region)`|`//#endregion`または`(#endregion)`
Java|`//#region`または`//<editor-fold>`|`//#endregion`または`//</editor-fold>`
Markdown|`<!-- #region -->`|`<!-- #endregion -->`
Perl5|`#region`または`=pod`|`#endregion`または`=cut`
PHP|`#region`|`#endregion`
PowerShell|`#region`|`#endregion`
Python|`#region`または`# region`|`#endregion`または`# endregion`
TypeScript/JavaScript|`//#region` |`//#endregion`
Visual Basic|`#Region`|`#End Region`

マーカーによって定義された領域のみを折りたたんだり展開したりするには、以下を使用します:

* Fold Marker Regions (`<kbd title="macOS: ⌘K ⌘8">Ctrl+K Ctrl+8</kbd>`)はすべてのマーカー領域を折りたたみます。
* Unfold Marker Regions (`<kbd title="macOS: ⌘K ⌘9">Ctrl+K Ctrl+9</kbd>`)はすべてのマーカー領域を展開します。

### 選択範囲の折りたたみ

**Create Manual Folding Ranges from Selection** (`<kbd title="macOS: ⌘K ⌘,">Ctrl+K Ctrl+,</kbd>`)コマンドは、現在選択されている行から折りたたみ範囲を作成し、それを折りたたみます。その範囲は**manual**折りたたみ範囲と呼ばれ、折りたたみプロバイダーによって計算された範囲の上に適用されます。

手動の折りたたみ範囲は、**Remove Manual Folding Ranges** (`<kbd title="macOS: ⌘K ⌘.">Ctrl+K Ctrl+.</kbd>`)コマンドで削除できます。

手動の折りたたみ範囲は、プログラミング言語による折りたたみのサポートがない場合に特に便利です。

## インデント

VS Codeを使用すると、テキストのインデントや、スペースまたはタブストップのどちらを使用するかを制御できます。デフォルトでは、VS Codeはスペースを挿入し、`kbstyle(Tab)`キーあたり4つのスペースを使用します。別のデフォルトを使用する場合は、`setting(editor.insertSpaces)`および`setting(editor.tabSize)` [設定](/docs/configure/settings.md)を変更できます。

```json
    "editor.insertSpaces": true,
    "editor.tabSize": 4,
```

### 自動検出

VS Codeは開いているファイルを分析し、ドキュメントで使用されているインデントを判断します。自動検出されたインデントは、デフォルトのインデント設定を上書きします。検出された設定は、ステータスバーの右側に表示されます:

![auto detect indentation](images/codebasics/indentation-detection.png)

ステータスバーのインデント表示をクリックすると、開いているファイルのデフォルト設定を変更したり、タブストップとスペースの間で変換したりできるインデントコマンドを含むドロップダウンが表示されます。

![indentation commands](images/codebasics/indentation-commands.png)

> [!NOTE]
> VS Codeの自動検出は、2、4、6、または8スペースのインデントを確認します。ファイルが異なる数のスペースを使用している場合、インデントが正しく検出されないことがあります。たとえば、3つのスペースでインデントする規則がある場合は、`setting(editor.detectIndentation)`をオフにして、タブサイズを明示的に3に設定するとよいでしょう。

```json
    "editor.detectIndentation": false,
    "editor.tabSize": 3,
```

## ファイルエンコーディングのサポート

**User Settings**または**Workspace Settings**で`setting(files.encoding)`設定を使用して、ファイルエンコーディングをグローバルまたはワークスペースごとに設定します。

![files.encoding setting](images/codebasics/filesencodingsetting.png)

ファイルエンコーディングはステータスバーで確認できます。

![Encoding in status bar](images/codebasics/fileencoding.png)

ステータスバーのエンコーディングボタンをクリックすると、アクティブなファイルを別のエンコーディングで再度開くか保存できます。

![Reopen or save with a different encoding](images/codebasics/encodingclicked.png)

次にエンコーディングを選択します。

![Select an encoding](images/codebasics/encodingselection.png)

## 上書きモード

バージョン1.96より前では、Vim [キーマップ拡張機能](/docs/configure/keybindings.md#keymap-extensions)をインストールしていない限り、VS Codeはカーソル位置に文字が挿入される*挿入*モードのみをサポートしていました。

バージョン1.96以降、VS Codeは*上書き*モードをサポートしており、カーソル位置に文字を挿入する代わりに既存の文字を上書きできます。デフォルトでは、上書きモードはオフになっています。

挿入モードと上書きモードを切り替えるには、コマンドパレットで**Toggle Overtype/Insert Mode**コマンドを実行するか、(`<kbd title="macOS: ⌥⌘O">Insert</kbd>`)を押します。上書きモードのときは、ステータスバーのインジケーターに`OVR`が表示されます。

`setting(editor.overtypeCursorStyle)`設定を構成して、上書きモードのカーソルスタイルを変更できます。

貼り付け時にテキストを上書きするには、`setting(editor.overtypeOnPaste)`設定を使用します。この設定を有効にするには、上書きモードである必要があります。

## ファイルを比較する

VS Codeでは、現在または任意の2つのファイルの内容を比較するためのいくつかの方法がサポートされています。

エディターでアクティブなファイルが開いている場合、次の比較オプションを使用できます。

* **ワークスペースファイルと比較**:コマンドパレットで**File: Compare Active File With...**を選択し、比較する別のファイルを選択します。
* **クリップボードと比較**:コマンドパレットで**File: Compare Active File with Clipboard** (`<kbd title="macOS: ⌘K C">Ctrl+K C</kbd>`)を選択し、現在のファイルとクリップボードの内容を比較します。
* **保存されたファイルと比較**:コマンドパレットで**File: Compare Active File with Saved** (`<kbd title="macOS: ⌘K D">Ctrl+K D</kbd>`)を選択し、現在のファイルと最後に保存したバージョンを比較します。

任意の2つのファイルを比較するには:

* エクスプローラービューでファイルを右クリックし、**Select for Compare**を選択します。次に、2つ目のファイルを右クリックし、**Compare with Selected**を選択します。
* 空のエディターウィンドウ間で比較を開始するには、コマンドパレットから**File: Compare New Untitled Text Files**を選択します。

> [!TIP]
> コマンドラインからVS Codeを`--diff`オプション付きで起動して、2つのファイルを比較できます。[VS Codeコマンドラインインターフェイス](/docs/configure/command-line.md#core-cli-options)の詳細を確認してください。

## 次のステップ

基本的なユーザーインターフェイスについては一通り説明しましたが、VS Codeには他にも多くの機能があります。詳細については以下をお読みください。

* [入門ビデオ-セットアップと基本](/docs/introvideos/basics.md) - VS Codeの基本に関するチュートリアルをご覧ください。
* [ユーザー/ワークスペース設定](/docs/configure/settings.md) -ユーザー設定とワークスペース設定を使用して、好みに合わせてVS Codeを構成する方法を学びます。
* [コードナビゲーション](/docs/editing/editingevolved.md) -定義のピーク、定義への移動などを行います。
* [統合ターミナル](/docs/terminal/basics.md) - VS Code内からコマンドラインタスクをすばやく実行するための統合ターミナルについて学びます。
* [IntelliSense](/docs/editing/intellisense.md) - VS Codeによるスマートなコード補完機能を利用できます。
* [デバッグ](/docs/debugtest/debugging.md) - VS Codeが真価を発揮する機能です。

## よくある質問

### グローバルな検索と置換は可能ですか？

はい、検索ビューのテキストボックスを拡張して置換テキストフィールドを表示します。ワークスペース内のすべてのファイルで検索と置換を実行できます。フォルダーを開かずにVS Codeを起動した場合、検索は現在開いているファイルに対してのみ実行されることに注意してください。

![global search and replace](images/codebasics/global-search-replace.png)

### ワードラップを有効にするにはどうすればよいですか？

`setting(editor.wordWrap)` [設定](/docs/configure/settings.md)でワードラップを制御できます。デフォルトでは、`setting(editor.wordWrap)`は`off`ですが、`on`に設定すると、テキストはエディターのビューポート幅で折り返されます。

```json
    "editor.wordWrap": "on"
```

VS Codeセッションのワードラップは`<kbd title="macOS: ⌥Z">Alt+Z</kbd>`で切り替えることができます。

垂直ルーラーを表示させたいカラムの文字位置の配列を受け取る`setting(editor.rulers)`設定を使用して、エディターに垂直カラムルーラーを追加することもできます。

他のエディターと同様に、**Cut**や**Copy**などのコマンドは折り返された行全体に適用されます。トリプルクリックすると、折り返された行全体が選択されます。`kbstyle(Home)`を2回押すと、カーソルがその行の先頭に移動します。`kbstyle(End)`を2回押すと、カーソルがその行の末尾に移動します。

### ワードラップされた行で余分なカーソルが配置されるのを防ぐにはどうすればよいですか？

現在の選択範囲の上または下に追加するときに改行を無視したい場合は、次のようにキーボードショートカットの`args`に`{ "logicalLine": true }`を渡すことができます。

```json
{
  "key": "shift+alt+down",
  "command": "editor.action.insertCursorBelow",
  "when": "textInputFocus",
  "args": { "logicalLine": true },
},
{
  "key": "shift+alt+up",
  "command": "editor.action.insertCursorAbove",
  "when": "textInputFocus",
  "args": { "logicalLine": true },
},
```

### 検索が遅かったり、CPUを過剰に消費したりするのはなぜですか？

VS Codeでの検索はripgrep (`rg`)によって駆動されています。複数の`rg`プロセスが実行されている場合や検索が遅い場合は、検索ビューの詳細で**Use Exclude Settings and Ignore Files**トグルボタンがオンになっていることを確認し、`setting(search.useIgnoreFiles)`が有効であることを確認して、`node_modules`やビルドキャッシュなどの重いディレクトリを`setting(search.exclude)`で除外してください。手順については、[検索パフォーマンスのトラブルシューティング](#troubleshoot-search-performance-and-excessive-ripgrep-processes)を参照してください。
