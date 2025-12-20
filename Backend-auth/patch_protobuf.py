
import os

path = r"..\.venv\Lib\site-packages\google\protobuf\internal\api_implementation.py"
if not os.path.exists(path):
    print(f"File not found: {path}")
    exit(1)

with open(path, "r") as f:
    content = f.read()

target = "pass  # Unspecified by compiler flags."
if target in content:
    new_content = content.replace(target, target + "\n_implementation_type = 'python'")
    with open(path, "w") as f:
        f.write(new_content)
    print("Patched successfully")
else:
    print("Target string not found. Content snippet:")
    start = content.find("except ImportError:")
    if start != -1:
        print(content[start:start+200])
    else:
        print("Could not find exception block")
