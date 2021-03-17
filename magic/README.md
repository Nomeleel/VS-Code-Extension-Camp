# Magic README

Magic project vs code extension.

## Features

+ [Snippets](#snippets)
+ [Gutter Color](#guttercolor)
+ [APP Json File Auto Update](#appjsonfileautoupdate)
+ [Json Syntaxe Highlight](#jsonsyntaxehighlight)
+ [Support Definition For Json](#supportdefinitionforjson)
+ [Quick Action](#quickaction)
+ [Magic Field Outline](#magicfieldoutline)

### Snippets

重复代码当然要用Snippet了

![Container Snippets](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/container_snippet.gif)

支持大多数常用的Widget

![Widget Snippets](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/snippets.png)

当然如果还有没添加的话，可以自己添加snippet，这还有添加snippet的snippet

![Snippets Snippet](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/snippets_snippet.gif)

另外还有一些重复的Script也可以搞成Snippet

![Script Snippet](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/script_snippet.gif)

未完，待续...

### <span id = "guttercolor">Gutter Color</span>

排水沟颜色块展示, 隔壁[Dart](https://github.com/Dart-Code/Dart-Code)插件抄过来的 

![Gutter Color](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/gutter_color.png)

### <span id = "appjsonfileautoupdate">APP Json File Auto Update</span>

添加、删除、重命名、移动Json文件时，自动更新app.json文件

***Add***

![Add](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/add_json_file.gif)

***Delete***

![Delete](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/delete_json_file.gif)

![Delete More File](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/delete_jsons_file.gif)

***Rename***

![Rename](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/rename_json_file.gif)

***Move***

![Move](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/move_json_file.gif)

### <span id = "jsonsyntaxehighlight">Json Syntaxe Highlight</span>

普通json就是单调的两个颜色，可读性太差，所以就给一些特殊的地方高亮显示，例如type，codeRef，还有各种key，后续还可以继续添加规则，现在显示如下：

![Json Syntaxe](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/json_syntaxe.png)

### <span id = "supportdefinitionforjson">Support Definition For Json</span>

写json时会写到很多Widget，但老是忘记它有啥属性，所以就要老是要打开定义Widget的文件，所以就需要像其他语言一样，按F12就可以自动跳转到对应文件，
除了Widget，脚本也实现了这个功能，另外对于type后面跟的文件名也支持跳转，也可以通过F12跳转到对应的文件。

![Json Definition](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/json_definition.gif)

### <span id = "quickaction">Quick Action</span>

文件中右键菜单中添加快捷Action，添加脚本注册信息到initScript中。

![Add In Init Script](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/add_in_init_script.png)

### <span id = "magicfieldoutline">Magic Field Outline</span>

这是针对Json文件的大纲副视图面板，茫茫文件中，可以一眼找到关注的字段，你只要把字段配置出来，剩下的就交给时间。

***字段对应的值支持正则***

![Magic Field Outline RegExp](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/magic_field_outline_reg_exp.gif)

***面板结果支持定位跳转***

![Magic Field Outline Jump](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/magic_field_outline_jump.gif)

***结果支持分页，并可以调整每页长度***

![Magic Field Outline Page Size](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/magic_field_outline_page_size.gif)

***配置的字段支持调整顺序***

![Magic Field Outline Field Sort](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/magic_field_outline_field_sort.gif)

***支持按行排序或者默认按字段分组显示***

![Magic Field Outline Sort By](https://raw.githubusercontent.com/Nomeleel/Assets/master/vs_code_extension_collection/markdown/magic_field_outline_sort_by.gif)

**Enjoy!**