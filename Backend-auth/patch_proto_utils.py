
import os

path = r"..\.venv\Lib\site-packages\proto\utils.py"
if not os.path.exists(path):
    print(f"File not found: {path}")
    exit(1)

with open(path, "r") as f:
    content = f.read()

target_import = "from google._upb import _message"
target_except = "except ImportError:"

idx = content.find(target_import)
if idx != -1:
    except_idx = content.find(target_except, idx)
    if except_idx != -1 and (except_idx - idx < 300):
        new_content = content[:except_idx] + "except (ImportError, TypeError):" + content[except_idx + len(target_except):]
        with open(path, "w") as f:
            f.write(new_content)
        print("Patched proto/utils.py")
    else:
        # Fallback: exact string replacement if indenting is predictable or ignore indent
        print("Could not locate except block safely via offset search.")
else:
    print("Target import not found")
