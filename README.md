# VS-Code-Extension-Collection

VS Code Extension Collection.

这里会收录我所有打算开源的vs code插件，不想为每一个插件创建仓库，合集才是王道。

插件合集：
| Name | Introduction | Note
| :------: | ------ | ------ |
| [Magic](#magic) | 这个主要是为了在工作中写代码时，借助vs code插件提高工作效率，所以功能点都比较特殊。尝试写插件或许是它最大的目的。 | 

## Magic

### 1. Snippets

写代码的时候总会有一些重复性的代码，但每次复制粘贴也会很麻烦，所以这就是snippets存在的意义。
像我写flutter会有很多widget，这些widget种类繁多，幸运的是官方有Dart，Flutter插件帮你做了一些snippets，但不幸的是，出于某种目的我需要使用json文件配置方式写widget，眼馋的我只能自食其力，写了json版本的snippets，但奈何widget也太多了，所以目前只把经常用到的widget加了snippets。

![Snippets](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/snippets.png)

还有就是在写snippets的过程中我发现，这些snippets写的过程也有很多重复的代码，所以就写了编写snippets的snippets，一不小心就自举了 哈哈哈

![Snippet Snippets](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/snippet_snippet.png)

### 2. 排水沟颜色块展示

这个也是眼馋Dart插件对颜色的提示功能。看了下是用TS写的，这不巧了吗，我恰巧会一点点TS。
想了解Dart插件的请出门左转：[Dart插件地址](https://github.com/Dart-Code/Dart-Code)
目前只是简单的搬过来，首先支持 **"#FF000000"** 这种格式，后期可能会支持简写模式。是的，这还是为json文件写的, 如果将来增加解析方式，我再去添加支持对应的方式。

![排水沟颜色块展示](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/gutter_color.png)

### 3. 自维护app.json文件、

基于项目架构，对于json文件，要将其文件名添加到app.json对应节点下。对于这个动作是如此的机械，完全可以写个插件自动监测添加的json文件，一旦你有对json文件操作的动作，便会弹出提醒，询问你是否要维护app.json文件，当你选择是的时候，自动帮你添加、删除、更新来维护app.json文件。

***Add***

![Add](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/add_json_file.gif)

***Delete***

![Delete](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/delete_json_file.gif)

![Delete More File](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/delete_jsons_file.gif)

***Rename***

![Rename](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/rename_json_file.gif)

***Move***

![Move](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/move_json_file.gif)

