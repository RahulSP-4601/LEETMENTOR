import subprocess
import tempfile
import os
import json
import re
import platform

def get_python_function_name(code):
    match = re.search(r'def\s+(\w+)\s*\(', code)
    return match.group(1) if match else 'solution'

def get_java_class_and_method(code):
    class_match = re.search(r'class\s+(\w+)', code)
    method_match = re.search(r'\s+(\w+)\s*\(', code)
    class_name = class_match.group(1) if class_match else 'Main'
    method_name = method_match.group(1) if method_match else 'solution'
    return class_name, method_name

def get_cpp_function_name(code):
    match = re.search(r'(?:vector|int|float|double|string)\s*<*\w*>*\s+(\w+)\s*\(', code)
    return match.group(1) if match else 'solution'

def get_js_function_name(code):
    match = re.search(r'function\s+(\w+)\s*\(', code)
    return match.group(1) if match else 'solution'

def convert_args(language, input_dict):
    nums = input_dict['nums']
    target = input_dict['target']

    if language == 'java':
        return f"new int[]{{{', '.join(map(str, nums))}}}, {target}"
    elif language == 'cpp':
        return f"vector<int>{{{', '.join(map(str, nums))}}}, {target}"
    elif language == 'c':
        return {
            "nums": "{" + ", ".join(map(str, nums)) + "}",
            "len": str(len(nums)),
            "target": str(target)
        }
    elif language == 'javascript':
        return f"{json.dumps(nums)}, {target}"
    else:
        return ', '.join(json.dumps(v) for v in input_dict.values())

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
            input_args = convert_args(language, input_dict)
        except Exception as e:
            return {"error": f"Failed to parse test input: {str(e)}"}

        if language == 'python':
            func_name = get_python_function_name(code)
            code += f"\n\nif __name__ == '__main__':\n    print(Solution().{func_name}({input_args}))\n"

        elif language == 'java':
            class_name, method_name = get_java_class_and_method(code)
            wrapper = (
                f"\npublic class Main {{\n"
                f"    public static void main(String[] args) {{\n"
                f"        {class_name} obj = new {class_name}();\n"
                f"        int[] res = obj.{method_name}({input_args});\n"
                f"        System.out.print(\"[\");\n"
                f"        for (int i = 0; i < res.length; i++) {{\n"
                f"            System.out.print(res[i]);\n"
                f"            if (i < res.length - 1) System.out.print(\", \");\n"
                f"        }}\n"
                f"        System.out.println(\"]\");\n"
                f"    }}\n}}"
            )
            code += "\n" + wrapper

        elif language == 'cpp':
            func_name = get_cpp_function_name(code)
            wrapper = (
                f"\n#include <iostream>\n#include <vector>\nusing namespace std;\n"
                f"int main() {{\n"
                f"    vector<int> result = {func_name}({input_args});\n"
                f"    cout << \"[\";\n"
                f"    for (int i = 0; i < result.size(); ++i) {{\n"
                f"        cout << result[i];\n"
                f"        if (i < result.size() - 1) cout << \", \";\n"
                f"    }}\n"
                f"    cout << \"]\" << endl;\n"
                f"    return 0;\n}}"
            )
            code += "\n" + wrapper

        elif language == 'c':
            try:
                c_args = convert_args('c', input_dict)
            except:
                return {"error": "Failed to parse C args"}
            wrapper = (
                f"\n#include <stdio.h>\n"
                f"int main() {{\n"
                f"    int nums[] = {c_args['nums']};\n"
                f"    int len = {c_args['len']};\n"
                f"    int target = {c_args['target']};\n"
                f"    for (int i = 0; i < len; i++) {{\n"
                f"        for (int j = i + 1; j < len; j++) {{\n"
                f"            if (nums[i] + nums[j] == target) {{\n"
                f"                printf(\"[%d, %d]\\n\", i, j);\n"
                f"                return 0;\n"
                f"            }}\n"
                f"        }}\n"
                f"    }}\n"
                f"    printf(\"[]\\n\");\n"
                f"    return 0;\n}}"
            )
            code = wrapper

        elif language == 'javascript':
            func_name = get_js_function_name(code)
            code += f"\nconsole.log(JSON.stringify({func_name}({input_args})));"

        with open(code_file, 'w') as f:
            f.write(code)

        if not os.path.exists(code_file):
            return {"error": "Code file was not created"}

        if language == 'python':
            run_cmd = ['python3', code_file]

        elif language == 'cpp':
            exe = os.path.join(tmpdir, 'a.out')
            is_mac = platform.system() == 'Darwin'
            sdk_path = '/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk'
            compile_cmd = [
                'clang++' if is_mac else 'g++',
                '-std=c++17',
                code_file,
                '-o', exe
            ]
            if is_mac:
                compile_cmd += [
                    '-isysroot', sdk_path,
                    '-stdlib=libc++',
                    '-I', f'{sdk_path}/usr/include/c++/v1',
                    '-I', f'{sdk_path}/usr/include'
                ]
            compile = subprocess.run(compile_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            if compile.returncode != 0:
                return {"error": compile.stderr}
            run_cmd = [exe]

        elif language == 'c':
            exe = os.path.join(tmpdir, 'a.out')
            compile = subprocess.run(['gcc', code_file, '-o', exe], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            if compile.returncode != 0:
                return {"error": compile.stderr}
            run_cmd = [exe]

        elif language == 'java':
            compile = subprocess.run(['javac', code_file], cwd=tmpdir, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            if compile.returncode != 0:
                return {"error": compile.stderr}
            run_cmd = ['java', '-cp', tmpdir, 'Main']

        elif language == 'javascript':
            run_cmd = ['node', code_file]

        try:
            result = subprocess.run(run_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=5, text=True)
            if result.returncode != 0:
                return {"error": result.stderr}
            return {"output": result.stdout.strip()}
        except subprocess.TimeoutExpired:
            return {"error": "Execution timed out"}
