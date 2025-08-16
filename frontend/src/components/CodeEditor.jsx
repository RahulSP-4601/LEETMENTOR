import Editor from '@monaco-editor/react'
import '../css/CodeEditor.css'

export default function CodeEditor({ language, code, setCode }) {
  return (
    <div className="editor-container">
      <Editor
        height="100%"               // <= important
        language={language}
        theme="vs-dark"
        value={code}
        onChange={setCode}
        options={{
          fontSize: 16,
          minimap: { enabled: false },
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  )
}
