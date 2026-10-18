window.__ModuleLoader__.load({
  id: "dsh-skill-groups",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    var react = require("react");
    var jsx = require("react/jsx-runtime");

    var SOURCE_NAME = "skill-groups";
    var BUILD = "v10-nov2";
    console.log("[skill-groups] client loaded: " + BUILD);
    // 显式名单优先：这些技能的名字本身就决定了类别，不受关键词干扰。
    var EXPLICIT = {
      "academic-paper": "research", "academic-paper-composer": "research",
      "academic-paper-reviewer": "research", "academic-paper-strategist": "research",
      "academic-pipeline": "research", "arxiv-research": "research",
      "deep-research": "research", "research-writer": "research",
      "research-writing-skill": "research", "writing-guard": "research",
      "innovation-point": "research", "scientific-toolkit-skill": "data",
      "office-docx": "office", "office-pptx": "office", "office-xlsx": "office",
      "office-academic-skill": "office", "gov-doc-writing": "office",
      "meeting-recap": "office", "work-report-writer": "office",
      "data-viz-gen": "data", "dataset-health-audit": "data", "saas-metrics-coach": "data",
      "humanizer": "write", "generate-image": "media",
      "hindsight-coding-agent": "dev", "diagnose-windows-sandbox-acl": "dev"
    };

    var CATEGORIES = [
      { key: "research", label: "科研写作", icon: "\uD83D\uDCC4" },
      { key: "office",   label: "办公文档", icon: "\uD83D\uDCCA" },
      { key: "data",     label: "数据图表", icon: "\uD83D\uDCC8" },
      { key: "write",    label: "沟通改写", icon: "\u270D\uFE0F" },
      { key: "media",    label: "图像生成", icon: "\uD83C\uDFA8" },
      { key: "dev",      label: "开发诊断", icon: "\u2699\uFE0F" },
      { key: "other",    label: "其他",     icon: "\uD83D\uDCE6" }
    ];

    // 兜底关键词：只在显式名单未命中时使用，顺序从专到泛。
    var KEYWORD_RULES = [
      { key: "office",   re: /docx|pptx|xlsx|powerpoint|spreadsheet|公文|汇报|纪要|报告/i },
      { key: "data",     re: /viz|chart|dataset|metric|statistic|pandas|kaggle|图表|数据/i },
      { key: "write",    re: /humaniz|polish|rewrite|改写|润色|语气/i },
      { key: "media",    re: /image|photo|illustration|图\u7247|绘图/i },
      { key: "dev",      re: /debug|sandbox|acl|plugin|git|code|诊断/i },
      { key: "research", re: /paper|thesis|academic|journal|manuscript|论文|学术|文献/i }
    ];

    var ORIGINS = [
      { key: "user-dsh", label: "我的技能", icon: "\uD83E\uDDE9", match: "/.dsh/skills/" },
      { key: "user-agents", label: "我的技能 (agents)", icon: "\uD83E\uDDE9", match: "/.agents/skills/" },
      { key: "harness", label: "harness 技能", icon: "\uD83E\uDDE0", match: "/harness/skills/" },
      { key: "bundled", label: "内置技能", icon: "\uD83D\uDCDA", match: "/node_modules/" }
    ];

    var inject = ["sessions", "slots"];

    function norm(p) { return String(p || "").replace(/\\/g, "/"); }

    function categoryOf(skill) {
      var explicit = EXPLICIT[skill.name];
      if (explicit !== undefined) {
        for (var e = 0; e < CATEGORIES.length; e += 1) {
          if (CATEGORIES[e].key === explicit) return CATEGORIES[e];
        }
      }
      var hay = [skill.name, skill.description, norm(skill.path)].join(" ");
      for (var r = 0; r < KEYWORD_RULES.length; r += 1) {
        if (KEYWORD_RULES[r].re.test(hay)) {
          for (var k = 0; k < CATEGORIES.length; k += 1) {
            if (CATEGORIES[k].key === KEYWORD_RULES[r].key) return CATEGORIES[k];
          }
        }
      }
      return CATEGORIES[CATEGORIES.length - 1];
    }

    // 中文说明表：覆盖已知技能；未覆盖的走关键词兜底或原描述。
    var ZH_DESC = {
      "academic-paper": "学术论文写作流水线：12 个 agent，11 种模式（写作/大纲/修订/摘要/文献综述/格式转换/引用检查等），支持 6 种论文类型与 5 种引用格式",
      "academic-paper-composer": "从优化后的大纲逐章写成投稿级稿件，含章节间一致性检查",
      "academic-paper-reviewer": "多视角同行评审：5 人评审小组（期刊匹配 + 3 个同行角色 + 魔鬼代言人）",
      "academic-paper-strategist": "选题策划：研究缺口识别、原创性评估、论文大纲优化、预印本平台要求",
      "academic-pipeline": "全流程编排器：选题→写作→完整性检查→评审→修订→再评审→定稿，10 个阶段",
      "arxiv-research": "检索 arXiv 论文、分析内容、构建文献综述、生成引用，支持 TikZ 图提取",
      "data-viz-gen": "数据图表：按数据类型和业务问题选择图表与标注，配合 office-xlsx 保留原生公式",
      "dataset-health-audit": "数据质量审计：缺失、异常、单位、口径、重复与可复现性检查",
      "deep-research": "深度研究：13 个 agent，8 种模式（完整研究/快速简报/论文评审/文献综述/事实核查/系统综述等）",
      "diagnose-windows-sandbox-acl": "排查 Windows 下 DSH 沙箱权限拒绝：检查并修复路径 ACL",
      "generate-image": "生成照片、插画和背景图，用于演示文稿与文档",
      "gov-doc-writing": "公文写作：按单位、文种、角色和现有材料生成通知、报告、请示等",
      "hindsight-coding-agent": "Hindsight 记忆系统说明：如何存储/检索项目记忆、配置知识页面",
      "meeting-recap": "会议纪要：整理议题、讨论、决议、行动项、负责人和截止日期",
      "office-academic-skill": "中文学术 Word/PPT 工作流：论文阅读报告、论文或组会 PPT、可编辑 DOCX/PPTX",
      "office-docx": "Word 文档：创建、读取、编辑、检查 .docx，含表格与格式化",
      "office-pptx": "PowerPoint：创建、读取、编辑、检查 .pptx，含文本、表格、图片、图表",
      "office-xlsx": "Excel：读取、创建、修改 .xlsx，含数据、公式、格式化和 pandas 分析",
      "research-writer": "研究报告：整理研究问题、证据、来源、判断与风险，产出可编辑报告",
      "research-writing-skill": "中文科研写作：论文正文、摘要、引言、方法、结果、讨论、审稿回复、LaTeX 文稿润色",
      "saas-metrics-coach": "经营指标：核对收入、MRR、客户留存、增长假设与计算口径",
      "scientific-toolkit-skill": "科研计算工具箱：MATLAB/Octave、Python 科学计算、信号处理、图像处理、统计、仿真、优化、论文配图",
      "work-report-writer": "工作汇报：整理日报、周报、月报与阶段总结，核对交付、数字、风险和下期计划",
      "humanizer": "去 AI 腔：把机器味文字改写成自然的人话，只改说法不改内容",
      "writing-guard": "论文写作审计与 Word 安全编辑：去 AI 腔、删冗余、守住科学论断、核对表格与编辑范围",
      "innovation-point": "按 PCB-YOLO/FDDC-YOLO 论文范式撰写深度学习目标检测论文的 Methods 章节",
      "defuddle": "从网页提取正文内容，去掉导航与广告",
      "excalidraw-skill": "画示意图、流程图与架构图",
      "ui-ux-pro-max": "UI/UX 设计与前端界面评审",
      "webapp-testing": "Web 应用端到端测试",
      "web-design-reviewer": "网页设计评审",
      "kaggle-learner": "Kaggle 竞赛学习与实践",
      "math-reasoning": "数学推理与证明",
      "code-review-excellence": "代码评审规范与实践",
      "bug-detective": "缺陷定位与排查",
      "git-workflow": "Git 工作流与分支管理",
      "planning-with-files": "用文件做任务规划与跟踪",
      "skill-development": "开发新的 DSH 技能",
      "skill-improver": "改进现有技能质量",
      "skill-quality-reviewer": "技能质量评审",
      "mcp-integration": "接入 MCP 服务",
      "hook-development": "开发 DSH 钩子",
      "command-development": "开发 DSH 斜杠命令",
      "plugin-structure": "插件包结构规范",
      "zotero-obsidian-bridge": "Zotero 与 Obsidian 文献库联动",
      "obsidian-project-kb-core": "Obsidian 项目知识库核心流程",
      "obsidian-literature-workflow": "Obsidian 文献工作流",
      "obsidian-source-ingestion": "Obsidian 原始资料导入"
    };

    // 关键词兜底：把英文描述概括成中文短语。
    var ZH_FALLBACK = [
      { re: /office|docx|pptx|xlsx|word|excel|powerpoint/i, zh: "办公文档处理" },
      { re: /paper|thesis|academic|manuscript|journal/i, zh: "学术论文写作" },
      { re: /research|literature|survey/i, zh: "研究检索与分析" },
      { re: /image|photo|illustration/i, zh: "图像生成" },
      { re: /data|chart|stat|analy/i, zh: "数据分析" },
      { re: /code|git|debug|plugin|test/i, zh: "开发与调试" },
      { re: /write|edit|polish|style/i, zh: "写作与润色" }
    ];

    function zhDescription(skill) {
      var known = ZH_DESC[skill.name];
      if (known !== undefined) return known;
      var hay = [skill.name, skill.description].join(" ");
      for (var i = 0; i < ZH_FALLBACK.length; i += 1) {
        if (ZH_FALLBACK[i].re.test(hay)) return ZH_FALLBACK[i].zh;
      }
      return "";
    }

    function originOf(skill) {
      var p = norm(skill.path);
      for (var i = 0; i < ORIGINS.length; i += 1) {
        if (p.indexOf(ORIGINS[i].match) >= 0) return ORIGINS[i];
      }
      return { key: "other", label: "其他来源", icon: "\uD83D\uDCC1" };
    }

    // ── 中文说明缓存（模块级，跨会话共享）──────────────────────────
    var noteCache = {};
    var noteInflight = null;

    /** 向 host 侧批量取回这批技能的中文说明，取不到的记为 null。 */
    function fetchNotes(names) {
      var missing = names.filter(function (n) { return noteCache[n] === undefined; });
      if (missing.length === 0) return Promise.resolve(noteCache);
      if (noteInflight !== null) {
        return noteInflight.then(function () { return fetchNotes(names); });
      }
      noteInflight = (async function () {
        try {
          var url = "/api/skill-groups/describe?names=" + encodeURIComponent(missing.join(","));
          var controller = new AbortController();
          var timer = setTimeout(function () { controller.abort(); }, 1200);
          var response;
          try {
            response = await fetch(url, { headers: { "accept": "application/json" }, signal: controller.signal });
          } finally {
            clearTimeout(timer);
          }
          if (!response.ok) return;
          var payload = await response.json();
          var notes = payload && payload.notes ? payload.notes : {};
          Object.keys(notes).forEach(function (key) { noteCache[key] = notes[key]; });
          missing.forEach(function (name) {
            if (noteCache[name] === undefined) noteCache[name] = null;
          });
        } catch (error) {
          console.warn("[skill-groups] describe fetch failed:", error);
        } finally {
          noteInflight = null;
        }
      })();
      return noteInflight.then(function () { return noteCache; });
    }

    /** 一条技能的最终说明：host 提取的中文 > 本地中文表 > 原描述。 */
    function descriptionOf(skill) {
      var note = noteCache[skill.name];
      if (note && note.note) return note.note;
      return zhDescription(skill) || skill.description || "";
    }

    // ORIGINS 复用为来源分组元数据（label/icon 已有）。
    var ORIGIN_GROUPS = [];
    for (var oi = 0; oi < ORIGINS.length; oi += 1) ORIGIN_GROUPS.push(ORIGINS[oi]);
    ORIGIN_GROUPS.push({ key: "other", label: "其他来源", icon: "\uD83D\uDCC1" });
    var drillPath = null;
    var viewByOrigin = false;
    /** 刚因点击分类行被关闭：按钮的 launcher 订阅会据此重新打开到该分类。 */
    var pendingDrill = null;

    /**
     * 双层分组：根层是分类目录行（drill），分类层平铺技能。
     * @param catalog - 会话技能目录。
     * @param query   - 触发查询串。
     * @param byOrigin- true 按来源，false 按类别。
     */
    function buildCandidates(catalog, query, byOrigin) {
      var groups = byOrigin ? ORIGIN_GROUPS : CATEGORIES;
      var matches = catalog.filter(function (s) { return s.name.indexOf(query) === 0; });
      var buckets = {};
      var order = [];
      for (var i = 0; i < matches.length; i += 1) {
        var b = byOrigin ? originOf(matches[i]) : categoryOf(matches[i]);
        if (buckets[b.key] === undefined) { buckets[b.key] = []; order.push(b.key); }
        buckets[b.key].push(matches[i]);
      }
      // 分类层：平铺该类技能
      if (drillPath !== null) {
        var meta = null;
        for (var g = 0; g < groups.length; g += 1) {
          if (groups[g].key === drillPath) { meta = groups[g]; break; }
        }
        if (meta === null) { drillPath = null; return buildCandidates(catalog, query, byOrigin); }
        var items = buckets[drillPath] || [];
        var out2 = [];
        for (var j = 0; j < items.length; j += 1) {
          out2.push({
            name: items[j].name,
            description: (items[j].modelInvocable === false ? "\uFF08\u4EC5\u624B\u52A8\u8C03\u7528\uFF09 \u00B7 " : "") + descriptionOf(items[j])
          });
        }
        return out2;
      }
      // 根层：分类目录行
      var preferred = [];
      for (var n = 0; n < groups.length; n += 1) preferred.push(groups[n].key);
      for (var m = 0; m < order.length; m += 1) {
        if (preferred.indexOf(order[m]) < 0) preferred.push(order[m]);
      }
      var out = [];
      for (var q = 0; q < preferred.length; q += 1) {
        var key = preferred[q];
        var list = buckets[key];
        if (list === undefined || list.length === 0) continue;
        var meta2 = null;
        for (var r = 0; r < groups.length; r += 1) {
          if (groups[r].key === key) { meta2 = groups[r]; break; }
        }
        var title = meta2 === null ? key : ((meta2.icon ? meta2.icon + " " : "") + meta2.label);
        out.push({
          name: title,
          description: list.length + " \u4E2A\u6280\u80FD",
          drill: true,
          icon: meta2 !== null && meta2.icon ? meta2.icon : "\uD83D\uDCC1",
          hint: key
        });
      }
      return out;
    }
    function apply(ctx) {
      var sessions = ctx.sessions;
      var fetches = new Map();

      /** 简单超时包装：网络请求不允许拖住菜单。 */
      function withDeadline(promise, ms, fallback) {
        return new Promise(function (resolve) {
          var settled = false;
          var timer = setTimeout(function () {
            if (settled) return;
            settled = true;
            console.warn("[skill-groups] request timed out after " + ms + "ms");
            resolve(fallback);
          }, ms);
          promise.then(function (value) {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            resolve(value);
          }, function (error) {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            console.warn("[skill-groups] request failed:", error && error.message ? error.message : error);
            resolve(fallback);
          });
        });
      }

      /** 目录缓存：host 侧路由直读注册表，与会话是否打开无关。 */
      var catalogCache = null;

      function fetchCatalog(sessionId) {
        if (catalogCache !== null) return Promise.resolve(catalogCache);
            var request = fetch("/api/skill-groups/skills", { headers: { "accept": "application/json" } })
          .then(function (response) {
            if (!response.ok) throw new Error("skills route status " + response.status);
            return response.json();
          })
          .then(function (payload) {
            var list = (payload && payload.skills ? payload.skills : []).map(function (s) {
              return {
                name: s.name,
                description: s.description || "",
                path: s.path,
                source: s.source,
                modelInvocable: s.modelInvocable !== false
              };
            });
            catalogCache = list;
            console.log("[skill-groups] catalog ready: " + list.length + " skills");
            return list;
          });
        return withDeadline(request, 3000, []);
      }

      ctx.effect(function () { return function () {
        fetches.forEach(function (e) { e.abort.abort(); });
        fetches.clear();
      }; }, "skill-groups: catalog cache");
      
      function SkillGroupsButton(props) {
        var sessionId = props.session;
        var inputActions = props.inputActions;
        var openState = react.useState(false);
        var open = openState[0];
        var setOpen = openState[1];
        var paneState = react.useState({ name: "root", key: null });
        var pane = paneState[0];
        var setPane = paneState[1];
        var catState = react.useState(null);
        var catalog = catState[0];
        var setCatalog = catState[1];
        var qState = react.useState("");
        var query = qState[0];
        var setQuery = qState[1];
        var panelRef = react.useRef(null);
        var anchorRef = react.useRef(null);

        react.useEffect(function () {
          if (!open || catalog !== null) return undefined;
          var cancelled = false;
          fetchCatalog(sessionId).then(function (list) {
            if (!cancelled) setCatalog(list);
          }).catch(function () { if (!cancelled) setCatalog([]); });
          return function () { cancelled = true; };
        }, [open, catalog]);

        react.useEffect(function () {
          if (!open) return undefined;
          var onKey = function (ev) { if (ev.key === "Escape") { setOpen(false); setPane({ name: "root", key: null }); } };
          var onDown = function (ev) {
            if (panelRef.current && !panelRef.current.contains(ev.target) &&
                anchorRef.current && !anchorRef.current.contains(ev.target)) {
              setOpen(false); setPane({ name: "root", key: null });
            }
          };
          document.addEventListener("keydown", onKey);
          document.addEventListener("pointerdown", onDown, true);
          return function () {
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("pointerdown", onDown, true);
          };
        }, [open]);

        function pickSkill(skill) {
          try {
            if (inputActions !== undefined && inputActions.captureInsertion !== undefined) {
              var span = inputActions.captureInsertion();
              inputActions.insertText("/" + skill.name + " ", span);
            } else {
              console.warn("[skill-groups] inputActions unavailable");
            }
          } catch (error) {
            console.error("[skill-groups] insert failed:", error);
          }
          setOpen(false);
          setPane({ name: "root", key: null });
          setQuery("");
        }

        var groups = viewByOrigin ? ORIGIN_GROUPS : CATEGORIES;
        var filtered = (catalog || []).filter(function (s) { return query === "" || s.name.indexOf(query) === 0; });
        var rows = [];
        if (pane.name === "root") {
          var buckets = {}; var order = [];
          for (var i = 0; i < filtered.length; i += 1) {
            var b = viewByOrigin ? originOf(filtered[i]) : categoryOf(filtered[i]);
            if (buckets[b.key] === undefined) { buckets[b.key] = []; order.push(b.key); }
            buckets[b.key].push(filtered[i]);
          }
          for (var n = 0; n < groups.length; n += 1) {
            var gkey = groups[n].key;
            var glist = buckets[gkey];
            if (glist === undefined || glist.length === 0) continue;
            rows.push({ kind: "group", title: (groups[n].icon ? groups[n].icon + " " : "") + groups[n].label, count: glist.length, key: gkey });
          }
        } else {
          for (var j = 0; j < filtered.length; j += 1) {
            var bucket = viewByOrigin ? originOf(filtered[j]) : categoryOf(filtered[j]);
            if (bucket.key === pane.key) {
              rows.push({ kind: "skill", name: filtered[j].name, description: (filtered[j].modelInvocable === false ? "\uFF08\u4EC5\u624B\u52A8\u8C03\u7528\uFF09\u00B7 " : "") + descriptionOf(filtered[j]) });
            }
          }
        }

        var icon = jsx.jsx("span", { "aria-hidden": "true", style: { display: "inline-flex", width: 16, height: 16, flex: "none", fontSize: 14, lineHeight: 1 }, children: "\uD83E\uDDE9" });
        var label = jsx.jsx("span", { style: { textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0, overflow: "hidden" }, children: "\u6280\u80FD" });

        var panel = null;
        if (open) {
          var rowButtons = [];
          for (var r = 0; r < rows.length; r += 1) {
            var row = rows[r];
            var rowChildren;
            if (row.kind === "group") {
              rowChildren = [
                jsx.jsx("span", { style: { flex: 1 }, children: row.title }),
                jsx.jsx("span", { style: { color: "var(--dsw-alias-label-tertiary)", fontSize: 12 }, children: row.count + " \u4E2A" }),
                jsx.jsx("span", { style: { color: "var(--dsw-alias-label-tertiary)" }, children: "\u203A" })
              ];
            } else {
              rowChildren = [
                jsx.jsx("span", { style: { flex: "none", fontWeight: 600 }, children: row.name }),
                jsx.jsx("span", { style: { flex: 1, color: "var(--dsw-alias-label-tertiary)", fontSize: 12, textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden", marginLeft: 8 }, children: row.description })
              ];
            }
            var hoverCss = function (ev) { ev.currentTarget.style.background = "var(--dsw-alias-interactive-bg-hover)"; };
            var leaveCss = function (ev) { ev.currentTarget.style.background = "transparent"; };
            var onClick = row.kind === "group"
              ? (function (k) { return function () { setPane({ name: "category", key: k }); setQuery(""); }; })(row.key)
              : (function (s) { return function () { pickSkill({ name: s }); }; })(row.name);
            rowButtons.push(jsx.jsx("button", {
              type: "button",
              onClick: onClick,
              onMouseEnter: hoverCss,
              onMouseLeave: leaveCss,
              style: { display: "flex", alignItems: "center", width: "100%", gap: 8, padding: "8px 10px", border: "none", borderRadius: 8, background: "transparent", cursor: "pointer", textAlign: "left", fontSize: 13, color: "var(--dsw-alias-label-primary)" },
              children: rowChildren
            }, (row.kind === "group" ? "g-" : "s-") + (row.key || row.name)));
          }
          panel = jsx.jsx("div", {
            ref: panelRef,
            style: { position: "absolute", bottom: "calc(100% + 8px)", left: 0, zIndex: 1100, minWidth: 300, maxWidth: 460, maxHeight: 380, overflow: "auto", borderRadius: 12, background: "var(--dsw-alias-bg-base, #fff)", border: "1px solid var(--dsw-alias-border-l1)", boxShadow: "var(--dsw-elevation-prominent, 0 8px 30px rgba(0,0,0,.14))", padding: 6 },
            children: [
              jsx.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, padding: "4px 6px" }, children: [
                pane.name === "category" ? jsx.jsx("button", {
                  type: "button",
                  onClick: function () { setPane({ name: "root", key: null }); setQuery(""); },
                  style: { border: "none", background: "transparent", cursor: "pointer", color: "var(--dsw-alias-label-secondary)", fontSize: 12, padding: "2px 4px" },
                  children: "\u2190 \u5168\u90E8"
                }) : null,
                jsx.jsx("input", {
                  value: query,
                  placeholder: "\u641C\u7D22...",
                  onChange: function (ev) { setQuery(ev.target.value); },
                  style: { flex: 1, minWidth: 0, height: 26, borderRadius: 8, border: "1px solid var(--dsw-alias-border-l1)", background: "transparent", outline: "none", padding: "0 8px", fontSize: 12, color: "var(--dsw-alias-label-primary)" }
              })
              ] }),
              jsx.jsx("div", { children: rowButtons.length > 0 ? rowButtons : jsx.jsx("div", { style: { padding: "10px", color: "var(--dsw-alias-label-tertiary)", fontSize: 12 }, children: "\u6CA1\u6709\u5339\u914D\u7684\u6280\u80FD" }) })
            ]
          });
        }

        return jsx.jsxs("div", {
          ref: anchorRef,
          style: { position: "relative", display: "inline-flex" },
          children: [
            jsx.jsxs("button", {
              type: "button",
              className: "skill-groups-trigger",
              "aria-label": "\u6280\u80FD",
              "aria-haspopup": "menu",
              "aria-expanded": open,
              title: "\u6280\u80FD\uFF08\u6309\u7C7B\u522B\u5206\u7EC4\uFF09",
              onMouseDown: function (e) { e.preventDefault(); },
              onClick: function () { setOpen(!open); setPane({ name: "root", key: null }); setQuery(""); },
              style: { borderRadius: "var(--dsw-radius-sm)", minWidth: 0, height: 28, color: "var(--dsw-alias-label-secondary)", cursor: "pointer", background: "0 0", border: "none", outline: "none", alignItems: "center", gap: 4, padding: "0 4px 0 8px", fontSize: 13, fontWeight: 400, lineHeight: "20px", display: "flex" },
              children: [icon, label]
            }),
            panel
          ]
        });
      }
      ctx.slots.inject("conversation.input.left", function () {
        return ctx.slots.register({
          name: "conversation.input.left",
          id: "skill-groups-button",
          order: 10,
          inject: function (sessionId) { return { session: sessionId }; }
        }, SkillGroupsButton);
      });
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
