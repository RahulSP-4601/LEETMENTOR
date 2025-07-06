// src/components/CodeEditor.jsx
import Editor from '@monaco-editor/react'
import '../css/CodeEditor.css'

export default function CodeEditor({ language, code, setCode }) {
  return (
    <div className="editor-container">
      <Editor
        height="550px"
        language={language}
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value)}
        options={{
          fontSize: 16,
          minimap: { enabled: false },
          fontFamily: 'Fira Code, monospace',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  )
}
