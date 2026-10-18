// @local/dsh-skill-groups — host half.
//
// Serves /api/skill-groups/describe: given the skill names the browser half
// currently shows, reads each skill SKILL.md and returns a Chinese label /
// description. This is what makes a newly installed skill appear with a
// Chinese note without any configuration.
//
// Extraction is deterministic and local: read the file, take the frontmatter
// description (or the first prose paragraph), keep any Chinese sentence it
// finds, and otherwise synthesise a short Chinese summary from a keyword
// table. Nothing leaves the machine and no model is called.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

/** Cordis plugin name. */
export const name = "skill-groups-v2";

/** Services required before the describe route can mount. */
export const inject = ["webServer", "skills"];

/** Route paths (mirrored by the browser half). */
const ROUTES = { describe: "/api/skill-groups-v2/describe", skills: "/api/skill-groups-v2/skills", version: "/api/skill-groups-v2/version" };
const HOST_BUILD = "v9-selfpanel";

/** Every skill root a lookup may read, most specific first. */
function skillRoots(dshHome, agentsHome) {
  var roots = [
    join(dshHome, "skills"),
    join(agentsHome, "skills"),
    join(dshHome, "..", "harness", "skills"),
    join(homedir(), ".dsh", "skills"),
    join(homedir(), ".claude", "skills"),
  ];
  // 桌面版 Office 业务技能与内置 Office 技能
  var officeCandidates = [
    process.env.DSH_DESKTOP_OFFICE_RESOURCES,
    join(dshHome, "..", "office-runtime"),
    join(process.env.LOCALAPPDATA || "", "Programs", "dsh-desktop", "resources", "office-runtime"),
    join("D:", "Tools", "AI", "DSH Desktop", "resources", "office-runtime")
  ].filter(Boolean);
  var officeRoot = officeCandidates.find(function (c) { return existsSync(join(c, "office-skills")); });
  if (officeRoot) {
    roots.push(join(officeRoot, "business-skills"));
    roots.push(join(officeRoot, "office-skills"));
  }
  return roots;
}

/** Whether a string already contains a CJK ideograph. */
function hasChinese(text) {
  return /[\u4e00-\u9fff]/.test(String(text || ""));
}

/** Classify a scanned skill root for display. */
function labelSource(root) {
  const norm = root.replace(/\\/g, "/").toLowerCase();
  if (norm.includes(".claude/skills")) return "claude-skills";
  if (norm.includes("office-runtime")) return "bundled";
  const home = homedir().replace(/\\/g, "/").toLowerCase();
  if (norm.startsWith(home + "/.dsh/skills")) return "user-dsh";
  if (norm.includes(".agents/skills")) return "user-agents";
  if (norm.includes("/.dsh/skills")) return "user-dsh";
  return "bundled";
}

/** Split YAML frontmatter from a SKILL.md body. */
function splitFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (match === null) return { front: "", body: raw };
  return { front: match[1], body: raw.slice(match[0].length) };
}

/** Read one key from a frontmatter block. */
function frontmatterValue(front, key) {
  const lines = front.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const m = new RegExp("^" + key + ":\\s*(.*)$").exec(lines[i]);
    if (m === null) continue;
    let v = m[1].trim();
    // 块标量：| 或 > 后跟缩进的多行
    if (v === "|" || v === ">" || v === "|-" || v === ">-") {
      const parts = [];
      for (let j = i + 1; j < lines.length; j += 1) {
        if (lines[j].trim() === "") { parts.push(""); continue; }
        if (!/^\s/.test(lines[j])) break;
        parts.push(lines[j].trim());
      }
      return parts.join(" ").replace(/\s+/g, " ").trim();
    }
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    return v;
  }
  return undefined;
}

/** First non-empty prose sentence of a markdown body. */
function firstProse(body) {
  const lines = body.split(/\r?\n/);
  for (const line of lines) {
    const text = line.trim();
    if (text === "") continue;
    if (text.startsWith("#")) continue;
    if (text.startsWith(">")) continue;
    if (text.startsWith("```")) continue;
    if (text.startsWith("-") || text.startsWith("*") || text.startsWith("|")) continue;
    return text.replace(/\s+/g, " ");
  }
  return "";
}

/** Summarise an English description into a short Chinese phrase. */
function chineseSummary(haystack) {
  // 顺序即优先级：越具体越靠前，避免 "review"/"word" 这类泛词误吞。
  const rules = [
    [/humaniz|ai-sounding|ai writing|de-ai|sounding like a human/i, "写作与润色"],
    [/manuscript|paper|thesis|academic|journal|literature review|citation|latex|preprint/i, "学术论文写作"],
    [/deep research|systematic review|fact-check|evidence|meta-analys|literature search/i, "研究检索与分析"],
    [/docx|pptx|xlsx|powerpoint|spreadsheet|excel workbook|word document|公文|会议纪要|工作汇报|研究报告/i, "办公文档处理"],
    [/image|photo|illustration|background|figure generat/i, "图像生成"],
    [/data-?viz|dataset|chart|statistic|metric|pandas|kaggle|经营指标|数据质量/i, "数据分析与图表"],
    [/debug|plugin|architecture|refactor|sandbox|acl|git|code review/i, "开发与调试"],
    [/polish|rewrite|prose|style|tone|editing/i, "写作与润色"],
    [/meeting|minutes|summar/i, "会议与报告整理"],
    [/memory|context|knowledge|hindsight/i, "记忆与知识管理"]
  ];
  for (const pair of rules) {
    if (pair[0].test(haystack)) return pair[1];
  }
  return "";
}

/** Describe one skill from its SKILL.md. */
function describeSkill(file, fallbackDescription) {
  let raw = "";
  try {
    if (existsSync(file)) raw = readFileSync(file, "utf8");
  } catch (e) {
    raw = "";
  }
  const split = splitFrontmatter(raw);
  const ownName = frontmatterValue(split.front, "name") || "";
  const ownDescription = frontmatterValue(split.front, "description") || "";
  const candidate = ownDescription !== "" ? ownDescription : (fallbackDescription || "");
  if (hasChinese(candidate)) return { title: ownName, note: candidate.slice(0, 220) };
  const prose = firstProse(split.body);
  if (hasChinese(prose)) return { title: ownName, note: prose.slice(0, 220) };
  const summary = chineseSummary([ownName, candidate, prose].join(" "));
  return { title: ownName, note: summary };
}

/** Resolve a skill name to its SKILL.md. */
function resolveSkillFile(skillName, roots) {
  for (const root of roots) {
    const candidate = join(root, skillName, "SKILL.md");
    if (existsSync(candidate)) return candidate;
  }
  return undefined;
}

/** Host plugin body: mount the describe route. */
export function apply(ctx) {
  const dshHome = process.env.DSH_HOME || join(homedir(), ".dsh");
  const agentsHome = process.env.DSH_AGENTS_HOME || join(homedir(), ".agents");
  const roots = skillRoots(dshHome, agentsHome);
  console.log("[skill-groups] host half applying, build " + HOST_BUILD);
  ctx.effect(function () {
    return ctx.webServer.register({
      kind: "exact",
      path: ROUTES.version,
      handler: async function (req, res) {
        res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ build: HOST_BUILD }));
      }
    });
  }, "skill-groups-v2: version route");

  // 直接读 host 侧技能注册表：不依赖会话是否打开
  ctx.effect(function () {
    return ctx.webServer.register({
      kind: "exact",
      path: ROUTES.skills,
      handler: async function (req, res) {
        try {
          const url = new URL(req.url || "/", "http://localhost");
          const cwd = url.searchParams.get("cwd") || undefined;
          const summaries = await ctx.skills.list({ ...(cwd === undefined ? {} : { cwd }) });
          const byName = new Map();
          for (const s of summaries) {
            byName.set(s.name, {
              name: s.name,
              description: s.description || "",
              path: s.path,
              source: s.source,
              modelInvocable: s.invocation ? s.invocation.modelInvocable !== false : true
            });
          }
          // 磁盘扫描：用户技能根（注册表全局层看不到 preset 层与 .claude 等目录）
          const home = homedir();
          const diskRoots = [
            join(home, ".dsh", "skills"),
            join(agentsHome, "skills"),
            join(home, ".claude", "skills"),
            join(dshHome, "skills")
          ];
          // office-runtime 与 harness 同级（安装目录）或通过 env 指定
          // office-runtime 定位：env 指定 > harness 同级 > DSH_HOME 同级
          const candidates = [
            process.env.DSH_DESKTOP_OFFICE_RESOURCES,
            join(dshHome, "..", "office-runtime"),
            process.env.DSH_HOME ? join(process.env.DSH_HOME, "..", "office-runtime") : undefined,
            // Windows 桌面版默认安装位置
            join(process.env.LOCALAPPDATA || "", "Programs", "dsh-desktop", "resources", "office-runtime"),
            join("D:", "Tools", "AI", "DSH Desktop", "resources", "office-runtime")
          ].filter(Boolean);
          const officeRoot = candidates.find((c) => existsSync(join(c, "office-skills")));
          if (officeRoot) {
            diskRoots.push(join(officeRoot, "business-skills"));
            diskRoots.push(join(officeRoot, "office-skills"));
          }
          for (const root of diskRoots) {
            let entries = [];
            try { entries = readdirSync(root, { withFileTypes: true }); } catch (e) { continue; }
            for (const entry of entries) {
              if (!entry.isDirectory()) continue;
              const skillMd = join(root, entry.name, "SKILL.md");
              if (!existsSync(skillMd) || byName.has(entry.name)) continue;
              try {
                const raw = readFileSync(skillMd, "utf8");
                const split = splitFrontmatter(raw);
                const description = frontmatterValue(split.front, "description") || "";
                let modelInvocable = true;
                const disable = frontmatterValue(split.front, "disable-model-invocation");
                if (disable === "true") modelInvocable = false;
                byName.set(entry.name, {
                  name: entry.name,
                  description: description,
                  path: skillMd,
                  source: labelSource(root),
                  modelInvocable: modelInvocable
                });
              } catch (e) { /* 跳过不可读的技能 */ }
            }
          }
          const payload = [...byName.values()];
          res.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
          res.end(JSON.stringify({ build: HOST_BUILD, count: payload.length, skills: payload }));
        } catch (error) {
          res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ error: String(error) }));
        }
      }
    });
  }, "skill-groups-v2: skills route");

  ctx.effect(function () {
    return ctx.webServer.register({
      kind: "exact",
      path: ROUTES.describe,
      handler: async function (req, res) {
        try {
          const url = new URL(req.url || "/", "http://localhost");
          const raw = url.searchParams.get("names") || "";
          const names = raw.split(",").filter(function (n) { return n !== ""; });
          const notes = {};
          for (const skillName of names) {
            const file = resolveSkillFile(skillName, roots);
            if (file === undefined) continue;
            notes[skillName] = describeSkill(file, "");
          }
          res.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
          res.end(JSON.stringify({ notes: notes }));
        } catch (error) {
          res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ error: String(error) }));
        }
      }
    });
  }, "skill-groups-v2: describe route");
}
