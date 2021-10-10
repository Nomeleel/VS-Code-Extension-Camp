# Color Decoration

将VS Code文档左侧排水渠显示色块方案提取成模块，方便配置和扩展。

## How to use

```ts
export function activate(context: ExtensionContext) {
	context.subscriptions.push(new ColorDecoration(
		context.globalStorageUri.path, 
		new ColorDecorationConfig(
			['dart'], // 匹配语言
			['dart'], // 匹配文件后缀名
			new ColorRangeComputerARGBProvider() // 匹配方式，可自定义添加
		)
	));
}
```

