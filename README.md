#brackets-quick-insert

## Overview

This is an Extension for [Brackets](https://github.com/adobe/brackets). 

This extension is something to insert a tag and a filepath easily.<br>
この機能拡張はタグやhtmlキャラクター、ファイルパスなどを簡単に挿入するためのものです。

Many parts, I was an **brackets-quick-markup** in reference. thanks!<br>
多くの部分を**brackets-quick-markup**を参考にさせていただきました。感謝！
[https://github.com/redmunds/brackets-quick-markup](https://github.com/redmunds/brackets-quick-markup)

## Description

A tag and a filepath insert by onekey shortcut.<br>
タグやファイルパスをワンキーショートカットで挿入します。

And user can customize.<br>
さらにユーザーがカスタマイズすることも可能です。

* insert single tag (ex:&lt;br&gt;)
* insert pair tag (ex:&lt;p&gt;...&lt;/p&gt;)
* insert html character (ex:&amp;lt; / &amp;amp;)
* insert relative filepath (ex:../img/bg.jpg)

### Make relative path from drop file

Open dialog and drop file, a relative path makes that place a file.<br>
ダイアログを開いて画像などのファイルをドロップすると、相対パスを挿入することができます。

## Usage

* Shift + Enter ... &lt;br&gt;
* Ctrl + Shift + Enter ... &lt;p&gt;...&lt;/p&gt;
* Ctrl + Alt + ,(comma) .. &amp;lt;
* Ctrl + Alt + .(period) ... &amp;gt;
* Ctrl + Alt + 6 ... &amp;amp;
* Ctrl + I ... **open dialog**

The tags and shortcuts are defined in [data.json](https://github.com/sygnas/brackets-quick-insert/blob/master/data.json).<br>
このタグやショートカットは data.json で設定しています。


##Install from URL

1. Open the the Extension Manager from the File menu
2. Copy paste the URL of the github repo or zip file


## License

MIT-licensed -- see _main.js_ for details.


