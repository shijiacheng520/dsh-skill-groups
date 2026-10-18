# dsh-skill-groups

> DSH Desktop 输入框技能选择器 —— 把散落各处的技能整理成带图标的中文分组面板，一键插入。

在 DSH Desktop 的对话输入框左侧加一枚「🧩 技能」按钮。点开是一个自绘面板：

- **双层下钻**：根页显示分类（科研写作、办公文档、数据图表……），点分类进入技能列表
- **自动分类**：显式名单优先，其余按关键词规则兜底，新装技能无需配置
- **中文说明**：三级兜底 —— SKILL.md 中文描述 → 内置中文表 → host 侧从 SKILL.md 提取摘要
- **全量技能**：host 侧合并注册表与磁盘扫描（`~/.dsh`、`~/.agents`、`~/.claude`、安装目录 office-runtime），preset 层技能也能看到
- **搜索**：面板顶部即输即滤，跨分类匹配名称与说明
- **安全插入**：走官方 `inputActions.captureInsertion / insertText` 通道，不碰草稿状态机

## 安装

DSH Desktop 插件目录布局（`web` profile）：

```
<DSH profile>/                    # %APPDATA%\dsh-desktop\harness\profiles\web
├── package.json                  # dependencies 加 "@local/dsh-skill-groups"
├── .local-plugins/
│   └── dsh-skill-groups/         # 本仓库内容
└── node_modules/
    └── @local/
        └── dsh-skill-groups -> ../../.local-plugins/dsh-skill-groups
```

`package.json` 里补两处：

```json
{
  "dependencies": { "@local/dsh-skill-groups": "file:./.local-plugins/dsh-skill-groups" },
  "dsh": { "profile": { "bundles": ["@local/dsh-skill-groups"] } }
}
```

重启 DSH Desktop，输入框左侧出现「🧩 技能」即成功。

## 配置

面板行为的可调项都在 `lib/client.js` 顶部：

- `CATEGORIES` —— 分类定义（icon / label），7 类
- `EXPLICIT` —— 显式技能→分类映射，优先于关键词
- `KEYWORD_RULES` —— 兜底关键词规则，先匹配先赢
- `ZH_DESC` —— 技能名→中文一句话说明（可选，缺失时自动兜底）

host 侧 `lib/index.js` 无需配置；office-runtime 定位失败时技能照常可用，仅少 12 个内置 office 技能。

## 架构

```
client (lib/client.js)                 host (lib/index.js)
┌──────────────────────────┐   fetch   ┌────────────────────────────┐
│ 🧩按钮 + 自绘面板          │ ────────▶ │ /api/skill-picker/skills   │
│ 分类状态机 + 搜索          │           │  注册表 + 磁盘扫描合并        │
│ insertText 插入 /技能名    │           │ /api/skill-picker/describe │
└──────────────────────────┘           │  读 SKILL.md 提中文摘要      │
                                       └────────────────────────────┘
```

- client 注入点：`conversation.input.left` 插槽（session scope）
- 面板为自绘 React 组件（useState + createPortal），不受官方 slash 菜单「选中即关闭」约束
- host 数据合并策略：注册表优先，磁盘扫描按名去重补全
- `withDeadline(3000)` 兜底：host 不可达时面板仍能打开（空列表），不拖死输入框

## 卸载

删 `node_modules/@local/dsh-skill-groups` 链接、`.local-plugins/dsh-skill-groups` 目录，并移除 `package.json` 中两处条目，重启即可。

## License

MIT
