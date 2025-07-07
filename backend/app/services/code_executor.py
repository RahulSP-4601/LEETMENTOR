# app/services/code_executor.py

import subprocess
import tempfile
import os
import json
import re

def get_python_function_name(code):
    match = re.search(r'def\s+(\w+)\s*\(', code)
    return match.group(1) if match else 'function_not_found'

def get_java_class_and_method(code):
    class_match = re.search(r'class\s+(\w+)', code)
    method_match = re.search(r'\s+(\w+)\s*\(', code)
    class_name = class_match.group(1) if class_match else 'Main'
    method_name = method_match.group(1) if method_match else 'solution'
    return class_name, method_name

def get_cpp_function_name(code):
    match = re.search(r'\w+\s+(\w+)\s*\(', code)
    return match.group(1) if match else 'solution'

def execute_code(language, code, test_input):
    ext_map = {
        'python': '.py',
        'cpp': '.cpp',
        'c': '.c',
        'java': '.java',
        'javascript': '.js'
    }

    ext = ext_map.get(language)
    if not ext:
        return {"error": f"{language} not supported"}

    with tempfile.TemporaryDirectory() as tmpdir:
        filename = 'Main' + ext
        code_file = os.path.join(tmpdir, filename)

        try:
            input_dict = json.loads(test_input)
            input_args = ", ".join([repr(v) if not isinstance(v, str) else f'"{v}"' for v in input_dict.values()])
        except Exception as e:
            return {"error": f"Failed to parse test input: {str(e)}"}

        # Append invocation logic to code
        if language == 'python':
            func_name = get_python_function_name(code)
            invocation = f"\n\nif __name__ == '__main__':\n    print(Solution().{func_name}({input_args}))\n"
            code += invocation

        elif language == 'java':
            class_name, method_name = get_java_class_and_method(code)
            invocation = (
                f"\npublic class Main {{\n"
                f"    public static void main(String[] args) {{\n"
                f"        {class_name} obj = new {class_name}();\n"
                f"        System.out.println(java.util.Arrays.toString(obj.{method_name}({input_args})));\n"
                f"    }}\n}}"
            )
            code += "\n" + invocation

        elif language == 'cpp':
            func_name = get_cpp_function_name(code)
            invocation = (
                f"\n#include <iostream>\nusing namespace std;\n"
                f"int main() {{\n"
                f"    auto result = {func_name}({input_args});\n"
                f"    cout << \"[\";\n"
                f"    for (int i = 0; i < result.size(); ++i) {{\n"
                f"        cout << result[i];\n"
                f"        if (i != result.size() - 1) cout << \", \";\n"
                f"    }}\n"
                f"    cout << \"]\" << endl;\n"
                f"    return 0;\n}}"
            )
            code += "\n" + invocation

        elif language == 'c':
            # C requires more boilerplate, assume user prints internally for now
            pass

        elif language == 'javascript':
            invocation = f"\nconsole.log({get_cpp_function_name(code)}({input_args}));"
            code += invocation

        with open(code_file, 'w') as f:
            f.write(code)

        if language == 'python':
            run_cmd = ['python3', code_file]
        elif language == 'cpp':
            executable = os.path.join(tmpdir, 'a.out')
            result = subprocess.run(['g++', code_file, '-o', executable], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            if result.returncode != 0:
                return {"error": result.stderr}
            run_cmd = [executable]
        elif language == 'c':
            executable = os.path.join(tmpdir, 'a.out')
            result = subprocess.run(['gcc', code_file, '-o', executable], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            if result.returncode != 0:
                return {"error": result.stderr}
            run_cmd = [executable]
        elif language == 'java':
            compile_result = subprocess.run(['javac', code_file], cwd=tmpdir, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            if compile_result.returncode != 0:
                return {"error": compile_result.stderr}
            run_cmd = ['java', '-cp', tmpdir, 'Main']
        elif language == 'javascript':
            run_cmd = ['node', code_file]
        else:
            return {"error": f"{language} support not implemented"}

        try:
            result = subprocess.run(run_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=5, text=True)
            if result.returncode != 0:
                return {"error": result.stderr}
            return {"output": result.stdout.strip()}
        except subprocess.TimeoutExpired:
            return {"error": "Execution timed out"}
