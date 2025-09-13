// src/components/CodeTutorEditor.jsx
import { useRef, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import "./../css/CodeEditor.css";

export default function CodeTutorEditor({
  language,            // "python" | "javascript" | "cpp" | "java" | "c"
  problem,
  problemId,
  initialCode = "",
  onCodeChange,
  externalApiRef,      // <-- NEW: parent can call .current.getCode(), .current.compile(), .current.reset()
}) {
  const [busy, setBusy] = useState(false);
  const [typing, setTyping] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [review, setReview] = useState(null);
  const [uiError, setUiError] = useState("");
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);

  // ---- expose imperative API to parent
  useEffect(() => {
    if (!externalApiRef) return;
    externalApiRef.current = {
      getCode: () => handleGetCode(),
      compile: () => handleCompile(),
      reset: () => resetToStarter(),
    };
    // optional cleanup
    return () => { if (externalApiRef) externalApiRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, problem, problemId]);

  // -------- utils
  const detab   = (s) => String(s || "").replace(/\t/g, "    ");
  const dedent  = (text) => {
    const lines = detab(text).replace(/\r\n?/g, "\n").split("\n");
    while (lines.length && lines[0].trim() === "") lines.shift();
    while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
    if (!lines.length) return "";
    let minIndent = Infinity;
    for (const ln of lines) {
      if (!ln.trim()) continue;
      const n = (ln.match(/^\s*/) || [""])[0].length;
      if (n < minIndent) minIndent = n;
    }
    if (!Number.isFinite(minIndent)) minIndent = 0;
    return lines.map(ln => ln.slice(Math.min(minIndent, (ln.match(/^\s*/) || [""])[0].length))).join("\n");
  };
  const indentOf = (ln) => (String(ln).match(/^\s*/) || [""])[0].length;

  const coerceJSON = (answer) => {
    if (answer && typeof answer === "object") return answer;
    if (answer == null) throw new Error("Empty JSON from model");
    let s = String(answer).trim();
    const fence = s.match(/```(?:json|javascript|js)?\s*([\s\S]*?)```/i);
    if (fence) s = fence[1].trim();
    const start = s.indexOf("{"), end = s.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) s = s.slice(start, end + 1);
    s = s.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
    s = s.replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(s);
  };

  const onMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.updateOptions({
      fontSize: 16,
      minimap: { enabled: false },
      lineNumbers: "on",
      automaticLayout: true,
      scrollBeyondLastLine: false,
    });
    setTimeout(() => editor.layout(), 0);
    if (initialCode) editor.setValue(initialCode);
  };
  const handleChange = (val) => onCodeChange?.(val || "");

  const clearDecorations = () => {
    const ed = editorRef.current, mo = monacoRef.current;
    if (!ed || !mo) return;
    decorationsRef.current = ed.deltaDecorations(decorationsRef.current, []);
    mo.editor.setModelMarkers(ed.getModel(), "lint", []);
  };

  // ---- Python quick lints
  const lintIndentationPython = (fullText) => {
    const issues = [];
    const lines = String(fullText).replace(/\r\n?/g, "\n").split("\n");
    lines.forEach((ln, i) => {
      if (/\t/.test(ln)) {
        issues.push({ line: i + 1, start_col: 1, end_col: indentOf(ln) + 1,
          severity: "warn", reason: "Tab indentation detected", hint: "Use spaces only (PEP8 suggests 4 spaces)." });
      }
    });
    let inTriple = false;
    const isTriple = (ln) => /("""|''')/.test(ln);
    for (let i = 0; i < lines.length; i++) {
      const ln = lines[i];
      if (isTriple(ln)) inTriple = !inTriple;
      if (inTriple) continue;
      const raw = ln.replace(/#.*$/, "");
      if (/:$/.test(raw.trim())) {
        let j = i + 1;
        while (j < lines.length && lines[j].trim() === "") j++;
        if (j < lines.length && indentOf(lines[j]) <= indentOf(ln)) {
          issues.push({ line: j + 1, start_col: 1, end_col: 200, severity: "error",
            reason: "Expected an indented block after ':'", hint: "Indent this block further." });
        }
      }
    }
    return issues;
  };

  // ---- Monaco typing
  const typeAtCursor = async (text, speedMs = 6) => {
    const ed = editorRef.current, mo = monacoRef.current;
    if (!ed || !mo) return;
    setTyping(true);
    for (let i = 0; i < text.length; i++) {
      const pos = ed.getPosition();
      ed.executeEdits("ai-type", [{
        range: new mo.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column),
        text: text[i],
        forceMoveMarkers: true
      }]);
      ed.revealPositionInCenterIfOutsideViewport(ed.getPosition());
      handleChange(ed.getValue());
      await new Promise(r => setTimeout(r, speedMs));
    }
    setTyping(false);
  };
  const typeAtPosition = async (lineNumber, column, text, speedMs = 6) => {
    const ed = editorRef.current;
    if (!ed) return;
    ed.setPosition({ lineNumber, column });
    await typeAtCursor(text, speedMs);
  };

  const insertAtTopIfMissing = async (needles, textToInsert) => {
    const ed = editorRef.current;
    if (!ed || !textToInsert.trim()) return;
    const existing = ed.getValue();
    const missing = needles.some(n => !new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\\b`).test(existing));
    if (!missing) return;
    await typeAtPosition(1, 1, textToInsert.trim() + "\n\n");
  };

  const insertHelpersAboveFunction_TYPED = async (helpersText) => {
    const ed = editorRef.current, mo = monacoRef.current;
    if (!ed || !mo) return;
    const model = ed.getModel();
    const lines = model.getLinesContent();
    let insertLine = 1;
    for (let i = 0; i < lines.length; i++) {
      if (/\b(class|var|let|const|public\s+class|def|int\*|vector<|[\w:<>*]+\s+\w+\s*\([^)]*\)\s*\{)/.test(lines[i])) {
        insertLine = i + 1; break;
      }
    }
    await typeAtPosition(insertLine, 1, helpersText.trim() + "\n\n");
  };

  // ---------------- Language parameter readers ----------------
  const getPythonStarterParams = () => {
    const ed = editorRef.current;
    const text = ed?.getValue() || "";
    const m = text.match(/^\s*def\s+[A-Za-z_]\w*\s*\(([^)]*)\)\s*:/m);
    if (!m) return [];
    return m[1]
      .split(",")
      .map(s => s.trim().split("=")[0].trim())
      .map(s => s.replace(/:.+$/, "").trim())
      .filter(p => p !== "self" && p !== "cls");
  };

  const getJSStarterParams = () => {
    const ed = editorRef.current;
    const text = ed?.getValue() || "";
    const m = text.match(/var\s+[A-Za-z_]\w*\s*=\s*function\s*\(([^)]*)\)/);
    if (!m) return [];
    return m[1].split(",").map(s => s.trim()).filter(Boolean);
  };

  const getCPPStarterParams = () => {
    const ed = editorRef.current;
    const text = ed?.getValue() || "";
    const m = text.match(/vector\s*<\s*int\s*>\s*\w+\s*\(([^)]*)\)/);
    if (!m) return [];
    return m[1].split(",").map(s => s.trim().split(" ").pop().replace(/[\*\&]+/g,""));
  };

  const getJavaStarterParams = () => {
    const ed = editorRef.current;
    const text = ed?.getValue() || "";
    const m = text.match(/public\s+\w+\s*\[\]\s*\w+\s*\(([^)]*)\)/);
    if (!m) return [];
    return m[1].split(",").map(s => s.trim().split(" ").pop());
  };

  const getCStarterParams = () => {
    const ed = editorRef.current;
    const text = ed?.getValue() || "";
    const m = text.match(/int\*\s*\w+\s*\(([^)]*)\)/);
    if (!m) return [];
    return m[1]
      .split(",")
      .map(s => s.trim().split(" ").pop());
  };

  // ---------------- Brace/Block tools ----------------
  const stripOuterBraces = (t) => {
    const s = String(t || "");
    const first = s.indexOf("{");
    if (first === -1) return s;
    let depth = 0, start = -1;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch === "{") { if (depth === 0) start = i + 1; depth++; }
      else if (ch === "}") { depth--; if (depth === 0) return s.slice(start, i); }
    }
    return s;
  };

  // ---------------- Per-language sanitizers (extract ONLY body) ----------------
  const extractPythonBody = (raw) => {
    const s = detab(raw).replace(/\r\n?/g, "\n");
    const m = s.match(/^\s*def\s+[A-Za-z_]\w*\s*\([^)]*\)\s*:\s*$/m);
    if (!m) return dedent(s).trim();
    const headerIdx = s.split("\n").findIndex(l => l === m[0]);
    const lines = s.split("\n");
    const headerIndent = indentOf(lines[headerIdx]);
    const bodyLines = [];
    for (let i = headerIdx + 1; i < lines.length; i++) {
      const ln = lines[i];
      if (ln.trim() === "") { bodyLines.push(ln); continue; }
      if (indentOf(ln) <= headerIndent) break;
      bodyLines.push(ln.slice(headerIndent + 4 > 0 ? headerIndent + 4 : 0));
    }
    return dedent(bodyLines.join("\n")).trim();
  };

  const sanitizePython = (raw) => {
    return { body: extractPythonBody(raw), helpers: "" };
  };

  const sanitizeJS = (raw) => {
    let s = dedent(detab(raw)).replace(/\r\n?/g, "\n").trim();
    if (/function\s*\(|=>\s*\{/.test(s) || /\bfunction\s+[A-Za-z_]\w*\s*\(/.test(s)) {
      s = stripOuterBraces(s);
      if (/\{/.test(s) && /\}/.test(s) && /return\s/.test(s)) s = stripOuterBraces(s);
    }
    return { body: s.trim(), helpers: "" };
  };

  const sanitizeCPP = (raw) => {
    let s = dedent(detab(raw)).replace(/\r\n?/g, "\n");
    s = s.replace(/^\s*#\s*include[^\n]*\n/gm, "")
         .replace(/^\s*using\s+namespace\s+std\s*;\s*$/gm, "");
    if (/class\s+Solution/.test(s)) s = stripOuterBraces(s);
    if (/[\w:\<\>\*&\s]+\s+\w+\s*\([^)]*\)\s*\{/.test(s)) s = stripOuterBraces(s);
    return { body: s.trim(), helpers: "" };
  };

  const sanitizeJava = (raw) => {
    let s = dedent(detab(raw)).replace(/\r\n?/g, "\n");
    s = s.replace(/^\s*import\s+[^\n]*\n/gm, "");
    if (/class\s+Solution/.test(s)) s = stripOuterBraces(s);
    if (/public\s+\w+\s*\[\]\s*\w+\s*\([^)]*\)\s*\{/.test(s)) s = stripOuterBraces(s);
    return { body: s.trim(), helpers: "" };
  };

  const sanitizeC = (raw) => {
    let s = dedent(detab(raw)).replace(/\r\n?/g, "\n");
    s = s.replace(/^\s*#\s*include[^\n]*\n/gm, "")
         .replace(/typedef\s+struct[\s\S]*?;\s*/gm, "")
         .replace(/int\s+main\s*\([^)]*\)\s*\{[\s\S]*?\}\s*/gm, "");
    if (/int\*\s+\w+\s*\([^)]*\)\s*\{/.test(s)) s = stripOuterBraces(s);
    return { body: s.trim(), helpers: "" };
  };

  // -------- Language anchors (where to type)
  const typeBody_Python = async (body) => {
    const ed = editorRef.current, mo = monacoRef.current;
    const model = ed?.getModel();
    if (!ed || !mo || !model) return false;
    const lines = model.getLinesContent();
    let inDef = false, defIndent = 0, passInfo = null;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i], indent = indentOf(line);
      if (/^\s*def\s+\w+\s*\(.*\)\s*:/.test(line)) { inDef = true; defIndent = indent; continue; }
      if (inDef) {
        if (line.trim() !== "" && indent <= defIndent) { inDef = false; }
        else if (/^\s*(?:#\s*)?pass\b/.test(line)) {
          const passIndent = indentOf(line);
          passInfo = { lineNumber: i + 1, colStart: passIndent + 1 };
          break;
        }
      }
    }
    if (!passInfo) return false;

    const normalized = dedent(detab(body)).replace(/\r\n?/g, "\n").trimEnd();
    const pad = " ".repeat(passInfo.colStart - 1);
    const reindented = normalized.split("\n").map(ln => (ln ? pad + ln : ln)).join("\n");

    const lineMaxCol = model.getLineMaxColumn(passInfo.lineNumber);
    ed.executeEdits("delete-pass", [{
      range: new mo.Range(passInfo.lineNumber, passInfo.colStart, passInfo.lineNumber, lineMaxCol),
      text: "",
      forceMoveMarkers: true,
    }]);

    const insertLine = Math.min(model.getLineCount(), passInfo.lineNumber + 1);
    await typeAtPosition(insertLine, 1, reindented);

    const lints = lintIndentationPython(ed.getValue());
    if (lints.length) applyDecorations(lints);
    return true;
  };

  const typeBody_JS = async (body) => {
    const ed = editorRef.current, mo = monacoRef.current;
    const model = ed?.getModel();
    if (!ed || !mo || !model) return false;
    const lines = model.getLinesContent();
    let closeIdx = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (/^\s*}\s*;\s*$/.test(lines[i])) { closeIdx = i; break; }
    }
    if (closeIdx === -1) return false;
    const closeIndent = indentOf(lines[closeIdx]);
    const pad = " ".repeat(closeIndent + 2);
    const reindented = dedent(detab(body)).split("\n").map(ln => (ln ? pad + ln : ln)).join("\n") + "\n";
    await typeAtPosition(closeIdx + 1, 1, reindented);
    return true;
  };

  const typeBody_CPP = async (body) => {
    const ed = editorRef.current, mo = monacoRef.current;
    const model = ed?.getModel();
    if (!ed || !mo || !model) return false;
    const lines = model.getLinesContent();
    let start = -1, end = -1;
    for (let i = 0; i < lines.length; i++) {
      if (/\/\/\s*Your code here/.test(lines[i])) start = i;
      if (/^\s*return\s*\{\s*\}\s*;/.test(lines[i])) end = i;
    }
    if (start === -1) {
      const idxClose = lines.findIndex((ln, i) => i > 0 && /^\s*}\s*;\s*$/.test(ln));
      const closeIdx = idxClose === -1 ? lines.length - 1 : idxClose;
      const pad = " ".repeat(Math.max(0, indentOf(lines[closeIdx]) + 2));
      const reindented = dedent(detab(body)).split("\n").map(ln => (ln ? pad + ln : ln)).join("\n") + "\n";
      await typeAtPosition(closeIdx + 1, 1, reindented);
      return true;
    }
    const insertLine = start + 1;
    const pad = " ".repeat(indentOf(lines[start]));
    const endCol = model.getLineMaxColumn(end + 1);
    ed.executeEdits("delete-cpp-placeholder", [{
      range: new mo.Range(start + 1, 1, end + 1, endCol),
      text: "",
      forceMoveMarkers: true,
    }]);
    const reindented = dedent(detab(body)).split("\n").map(ln => (ln ? pad + ln : ln)).join("\n") + "\n";
    await typeAtPosition(insertLine, 1, reindented);
    return true;
  };

  const typeBody_Java = async (body) => {
    const ed = editorRef.current, mo = monacoRef.current;
    const model = ed?.getModel();
    if (!ed || !mo || !model) return false;
    const lines = model.getLinesContent();
    const idx = lines.findIndex(ln => /\breturn\s+new\s+int\s*\[\s*0\s*\]\s*;/.test(ln));
    let insertLine = (idx !== -1) ? idx + 1 : lines.findIndex((ln) => /^\s*}\s*$/.test(ln));
    if (insertLine === -1) insertLine = lines.length;
    const pad = " ".repeat(idx !== -1 ? indentOf(lines[idx]) : 4);
    if (idx !== -1) {
      ed.executeEdits("delete-java-placeholder", [{
        range: new mo.Range(idx + 1, 1, idx + 1, model.getLineMaxColumn(idx + 1)),
        text: "",
        forceMoveMarkers: true,
      }]);
    }
    const reindented = dedent(detab(body)).split("\n").map(ln => (ln ? pad + ln : ln)).join("\n") + "\n";
    await typeAtPosition(insertLine, 1, reindented);
    return true;
  };

  const typeBody_C = async (body) => {
    const ed = editorRef.current, mo = monacoRef.current;
    const model = ed?.getModel();
    if (!ed || !mo || !model) return false;
    const lines = model.getLinesContent();
    const idxA = lines.findIndex(ln => /\*returnSize\s*=\s*0\s*;/.test(ln));
    const idxB = lines.findIndex(ln => /\breturn\s+NULL\s*;/.test(ln));
    let insertLine = (idxA !== -1 ? idxA + 1 : (idxB !== -1 ? idxB + 1 : lines.length));
    const pad = " ".repeat(idxA !== -1 ? indentOf(lines[idxA]) : (idxB !== -1 ? indentOf(lines[idxB]) : 4));
    const startL = (idxA !== -1) ? idxA + 1 : (idxB !== -1 ? idxB + 1 : -1);
    const endL   = (idxB !== -1) ? idxB + 1 : startL;
    if (startL !== -1 && endL !== -1) {
      ed.executeEdits("delete-c-placeholder", [{
        range: new mo.Range(startL, 1, endL, model.getLineMaxColumn(endL)),
        text: "",
        forceMoveMarkers: true,
      }]);
    }
    const reindented = dedent(detab(body)).split("\n").map(ln => (ln ? pad + ln : ln)).join("\n") + "\n";
    await typeAtPosition(insertLine, 1, reindented);
    return true;
  };

  const applyDecorations = (issues = []) => {
    const ed = editorRef.current, mo = monacoRef.current;
    if (!ed || !mo) return;
    const model = ed.getModel();
    const markers = [];
    const decos = issues.map(iss => {
      const line = Number(iss.line) || 1;
      const start = Math.max(Number(iss.start_col) || 1, 1);
      const end   = Math.max(Number(iss.end_col) || start + 1, start + 1);
      markers.push({
        severity: iss.severity === "warn" ? mo.MarkerSeverity.Warning : mo.MarkerSeverity.Error,
        message: (iss.reason || "Issue") + (iss.hint ? ` — Hint: ${iss.hint}` : ""),
        startLineNumber: line, startColumn: start, endLineNumber: line, endColumn: end, source: "AI",
      });
        return {
        range: new mo.Range(line, start, line, end),
        options: {
          inlineClassName: iss.severity === "warn" ? "inline-warn" : "inline-error",
          glyphMarginClassName: iss.severity === "warn" ? "glyph-warn" : "glyph-error",
          glyphMarginHoverMessage: { value: (iss.reason || "Issue") + (iss.hint ? `\nHint: ${iss.hint}` : "") },
        },
      };
    });
    decorationsRef.current = ed.deltaDecorations(decorationsRef.current, decos);
    mo.editor.setModelMarkers(model, "lint", markers);
  };

  // ---- network
  const postTutor = async (payload) => {
    const res = await fetch("/api/ai-tutor", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.details || data?.error || `HTTP ${res.status}`);
    return data;
  };

  const fetchStarter = async () => {
    const qs = new URLSearchParams({ problem_id: String(problemId), language });
    const res = await fetch(`/api/starter?${qs.toString()}`, { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `Starter fetch failed (${res.status})`);
    return data?.starter ?? data?.code ?? "";
  };

  const resetToStarter = async () => {
    const ed = editorRef.current;
    if (!ed) return "";
    const starter = await fetchStarter().catch(() => "");
    ed.setValue(starter || "");
    handleChange(starter || "");
    await new Promise(r => setTimeout(r, 0));
    return starter || "";
  };

  // -------- language-specific import/include helpers ----------
  const ensureJavaImports = async (body) => {
    const needsMap = /\bMap<|HashMap<|List<|ArrayList<|Set<|HashSet</.test(body);
    if (!needsMap) return;
    await insertAtTopIfMissing(["import java.util."], "import java.util.*;");
  };

  const ensureCppIncludes = async (body) => {
    const incs = [];
    if (/\bvector\b/.test(body)) incs.push("#include <vector>");
    if (/\bunordered_map\b/.test(body) || /\bmap\b/.test(body)) incs.push("#include <unordered_map>");
    if (!incs.length) return;
    await insertAtTopIfMissing(["#include <vector>", "#include <unordered_map>"], incs.join("\n"));
  };

  const ensureCIncludes = async (body) => {
    const incs = [];
    if (/\bmalloc\b|\bfree\b/.test(body)) incs.push("#include <stdlib.h>");
    if (/\bmemset\b|\bmemcpy\b/.test(body)) incs.push("#include <string.h>");
    if (!incs.length) return;
    await insertAtTopIfMissing(["#include <stdlib.h>", "#include <string.h>"], incs.join("\n"));
  };

  // ---- actions
  const handleGetCode = async () => {
    if (!problem) return;
    setUiError("");
    setBusy(true); clearDecorations(); setRunResult(null); setReview(null);
    try {
      const skeleton = await resetToStarter();

      // Ask AI for body-only
      let payload;
      try {
        const data = await postTutor({ mode: "code_fill", language, problem, question: skeleton });
        payload = coerceJSON(data.answer);
      } catch (e) {
        const full = await postTutor({ mode: "code_tutor", language, problem });
        const raw  = String(full.answer || "");
        const match = raw.match(/```[\w+-]*\n([\s\S]*?)```/);
        payload = { body: match ? match[1] : raw, helpers: "" };
      }

      // 1) Sanitize AI output per language (EXTRACT ONLY BODY)
      const lang = (language || "").toLowerCase();
      let body = payload?.body || "";
      let helpers = ""; // reserved if you later want helpers

      if (lang === "python")       ({ body } = sanitizePython(body));
      else if (lang === "javascript") ({ body } = sanitizeJS(body));
      else if (lang === "cpp")     ({ body } = sanitizeCPP(body));
      else if (lang === "java")    ({ body } = sanitizeJava(body));
      else if (lang === "c")       ({ body } = sanitizeC(body));

      // 2) Ensure imports/includes when the body needs them
      if (lang === "java") await ensureJavaImports(body);
      if (lang === "cpp")  await ensureCppIncludes(body);
      if (lang === "c")    await ensureCIncludes(body);

      // 3) Type the body into the correct location
      let ok = false;
      if (lang === "python")       ok = await typeBody_Python(body);
      else if (lang === "javascript") ok = await typeBody_JS(body);
      else if (lang === "cpp")     ok = await typeBody_CPP(body);
      else if (lang === "java")    ok = await typeBody_Java(body);
      else if (lang === "c")       ok = await typeBody_C(body);

      if (!ok) {
        const ed = editorRef.current, model = ed.getModel();
        await typeAtPosition(
          model.getLineCount(),
          model.getLineMaxColumn(model.getLineCount()),
          "\n" + dedent(detab(body)) + "\n"
        );
      }

      if (lang === "python") {
        const issues = lintIndentationPython(editorRef.current.getValue());
        if (issues.length) applyDecorations(issues);
      }
    } catch (e) {
      console.error(e);
      setUiError(String(e.message || e));
      alert(String(e.message || "Could not fill the starter function."));
    } finally {
      setBusy(false);
    }
  };

  const handleCompile = async () => {
    const ed = editorRef.current;
    if (!ed) return;
    const current = ed.getValue();
    setUiError("");
    setBusy(true); clearDecorations(); setRunResult(null); setReview(null);
    try {
      const runResp = await fetch("/api/run", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code: current, problem_id: problemId }),
      });
      const runData = await runResp.json().catch(() => ({}));
      setRunResult(runResp.ok ? runData : { error: runData?.detail || "Run failed" });

      const lintIssues = language === "python" ? lintIndentationPython(current) : [];
      if (lintIssues.length) applyDecorations(lintIssues);

      const reviewData = await postTutor({ mode: "review", language, problem, question: current });
      const payload = coerceJSON(reviewData.answer);
      setReview(payload);
      applyDecorations([...(lintIssues || []), ...(payload?.issues || [])]);
    } catch (e) {
      console.error(e);
      setUiError(String(e.message || e));
      alert(String(e.message || "Compile/Review failed."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="editor-tutor-wrap">
      <div className="editor-toolbar">
        <div className="left">
          <strong>Smart Tutor Editor</strong>
        </div>
        <div className="right">
          <button disabled={busy || typing} onClick={handleGetCode}>Get Code</button>
        </div>
      </div>

      {uiError && <div className="panel" style={{borderColor:"#663"}}><strong>AI Error:</strong> {uiError}</div>}

      <div className="editor-container" style={{minHeight: 360}}>
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          onMount={onMount}
          onChange={handleChange}
          options={{ smoothScrolling: true }}
        />
      </div>

      <div className="results-pane">
        {runResult && (
          <div className="panel">
            <h3>Run Results</h3>
            <pre>{JSON.stringify(runResult, null, 2)}</pre>
          </div>
        )}
        {review && (
          <div className="panel">
            <h3>AI Review</h3>
            <p>{review.summary}</p>
            {Array.isArray(review.issues) && review.issues.length > 0 && (
              <ul>
                {review.issues.map((i, idx) => (
                  <li key={idx}>Line {i.line}: {i.reason}{i.hint ? ` — Hint: ${i.hint}` : ""}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
