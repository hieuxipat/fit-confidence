#!/bin/bash
# PostToolUse hook (Edit|Write) — cảnh báo nếu file vừa sửa lộ secret pattern.
# Lưu ý: PostToolUse chạy SAU khi sửa → chỉ cảnh báo, không undo được.
INPUT=$(cat)
if command -v jq >/dev/null 2>&1; then
  FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
elif command -v python3 >/dev/null 2>&1; then
  FILE=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tool_input',{}).get('file_path',''))" 2>/dev/null)
else
  exit 0
fi
[ -z "$FILE" ] || [ ! -f "$FILE" ] && exit 0
if grep -qEi 'sk_live_|api[_-]?key[[:space:]]*=|password[[:space:]]*=|BEGIN (RSA|OPENSSH) PRIVATE KEY|postgres://[^[:space:]]*:[^[:space:]]*@' "$FILE"; then
  echo "⚠️  CẢNH BÁO: file $FILE có thể chứa secret. Kiểm tra trước khi commit!" >&2
fi
exit 0
