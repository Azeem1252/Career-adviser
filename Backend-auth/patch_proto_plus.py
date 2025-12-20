
import os

path = r"..\.venv\Lib\site-packages\proto\marshal\compat.py"
if not os.path.exists(path):
    print(f"File not found: {path}")
    exit(1)

with open(path, "r") as f:
    content = f.read()

# Patch upb import
target_upb = """try:
    from google._upb import _message as _message_upb
except ImportError:"""
replacement_upb = """try:
    from google._upb import _message as _message_upb
except (ImportError, TypeError):"""

# Patch pyext import (Cpp implementation)
target_pyext = """try:
    from google.protobuf.pyext import _message as _message_pyext
except ImportError:"""
replacement_pyext = """try:
    from google.protobuf.pyext import _message as _message_pyext
except (ImportError, TypeError):"""

new_content = content
if target_upb in new_content:
    new_content = new_content.replace(target_upb, replacement_upb)
    print("Patched upb import")
else:
    print("Could not find upb import block")

if target_pyext in new_content:
    new_content = new_content.replace(target_pyext, replacement_pyext)
    print("Patched pyext import")
else:
    print("Could not find pyext import block")

if new_content != content:
    with open(path, "w") as f:
        f.write(new_content)
    print("File updated")
else:
    print("No changes made")
