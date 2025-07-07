# app/services/code_executor.py

import subprocess
import tempfile
import os

def execute_code(language, code, test_input):
    ext_map = {
        'python': '.py',
        'cpp': '.cpp',
        'c': '.c',
        'java': '.java'
    }

    ext = ext_map.get(language)
    if not ext:
        return {"error": f"{language} not supported"}

    with tempfile.TemporaryDirectory() as tmpdir:
        code_file = os.path.join(tmpdir, 'Main' + ext)
        with open(code_file, 'w') as f:
            f.write(code)

        if language == 'python':
            run_cmd = ['python3', code_file]
        elif language == 'cpp':
            executable = os.path.join(tmpdir, 'a.out')
            compile_cmd = ['g++', code_file, '-o', executable]
            result = subprocess.run(compile_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            if result.returncode != 0:
                return {"error": result.stderr}
            run_cmd = [executable]
        else:
            return {"error": f"{language} support coming soon."}

        try:
            result = subprocess.run(run_cmd, input=test_input, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=5, text=True)
            if result.returncode != 0:
                return {"error": result.stderr}
            return {"output": result.stdout.strip()}
        except subprocess.TimeoutExpired:
            return {"error": "Execution timed out"}
