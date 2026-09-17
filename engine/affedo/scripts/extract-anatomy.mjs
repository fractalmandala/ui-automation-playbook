import fs from "node:fs";
import path from "node:path";
import { parse } from "svelte/compiler";

function extractAnatomy(componentPath, componentName) {
  const content = fs.readFileSync(componentPath, "utf8");
  const ast = parse(content, { modern: true });

  const anatomy = {
    component: componentName,
    source: componentPath,
    parts: {},
    states: {},
    props: {},
    snippets: []
  };

  // 1. Walk Instance Script AST for $props()
  if (ast.instance) {
    walkJs(ast.instance, {
      VariableDeclarator(node) {
        if (
          node.init &&
          (node.init.type === "CallExpression" || node.init.callee?.name === "$props") &&
          node.id.type === "ObjectPattern"
        ) {
          for (const prop of node.id.properties) {
            if (prop.type === "Property") {
              const key = prop.key.name || prop.key.value;
              let defaultVal = null;
              if (prop.value.type === "AssignmentPattern") {
                defaultVal = extractLiteral(prop.value.right);
              }
              anatomy.props[key] = {
                type: typeof defaultVal,
                default: defaultVal
              };
            }
          }
        }
      }
    });
  }

  // 2. Deep walk HTML Fragment AST
  if (ast.fragment) {
    walkHtml(ast.fragment, {
      RegularElement(node) {
        processElement(node, anatomy);
      },
      Element(node) {
        processElement(node, anatomy);
      },
      RenderTag(node) {
        const snippetName = node.expression?.name || node.expression?.callee?.name || "children";
        if (!anatomy.snippets.includes(snippetName)) {
          anatomy.snippets.push(snippetName);
        }
      },
      SnippetBlock(node) {
        const snippetName = node.expression?.name;
        if (snippetName && !anatomy.snippets.includes(snippetName)) {
          anatomy.snippets.push(snippetName);
        }
      }
    });
  }

  return anatomy;
}

function processElement(node, anatomy) {
  let slotName = null;
  let role = null;
  let partAttr = null;

  for (const attr of node.attributes || []) {
    if (attr.name === "data-slot" && attr.value?.[0]?.data) {
      slotName = attr.value[0].data;
    }
    if (attr.name === "part" && attr.value?.[0]?.data) {
      partAttr = attr.value[0].data;
    }
    if (attr.name === "role" && attr.value?.[0]?.data) {
      role = attr.value[0].data;
    }
    if (attr.name && (attr.name.startsWith("data-") || attr.name.startsWith("aria-"))) {
      const partKey = slotName || partAttr || node.name;
      if (!anatomy.states[partKey]) anatomy.states[partKey] = [];
      if (!anatomy.states[partKey].includes(attr.name)) {
        anatomy.states[partKey].push(attr.name);
      }
    }
  }

  const partIdentifier = slotName || partAttr || (["button", "dialog", "input", "span", "div"].includes(node.name) && (role || slotName || partAttr) ? (slotName || partAttr) : null);
  if (partIdentifier && !anatomy.parts[partIdentifier]) {
    anatomy.parts[partIdentifier] = {
      tag: node.name,
      role: role || null,
      dataSlot: slotName || partIdentifier
    };
  }
}

function extractLiteral(node) {
  if (!node) return null;
  if (node.type === "Literal") return node.value;
  if (node.type === "UnaryExpression" && node.operator === "-") return -extractLiteral(node.argument);
  if (node.type === "Identifier") return node.name;
  return null;
}

function walkJs(node, visitors) {
  if (!node || typeof node !== "object") return;
  if (visitors[node.type]) visitors[node.type](node);
  for (const key of Object.keys(node)) {
    if (key === "parent") continue;
    const child = node[key];
    if (Array.isArray(child)) {
      for (const item of child) walkJs(item, visitors);
    } else if (child && typeof child === "object") {
      walkJs(child, visitors);
    }
  }
}

function walkHtml(node, visitors) {
  if (!node || typeof node !== "object") return;
  if (visitors[node.type]) visitors[node.type](node);
  for (const key of Object.keys(node)) {
    if (key === "parent") continue;
    const child = node[key];
    if (Array.isArray(child)) {
      for (const item of child) walkHtml(item, visitors);
    } else if (child && typeof child === "object") {
      walkHtml(child, visitors);
    }
  }
}

// CLI Execution
const args = process.argv.slice(2);
if (args.length >= 2) {
  const [filePath, compName] = args;
  const result = extractAnatomy(filePath, compName);
  const outDir = path.resolve("anatomy");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, compName.toLowerCase() + ".json");
  fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
  console.log("Extracted anatomy to " + outFile);
}

export { extractAnatomy };
