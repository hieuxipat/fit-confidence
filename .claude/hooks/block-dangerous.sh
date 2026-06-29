#!/bin/bash
# PreToolUse hook — chặn lệnh nguy hiểm trước khi Claude Code chạy.
# Quy ước exit code: 2 = BLOCK (chặn). 0 = cho qua.
#   ⚠️ exit 1 KHÔNG chặn — chỉ là warning, action VẪN chạy!

INPUT=$(cat)   # đọc JSON từ stdin (KHÔNG dùng biến môi trường)

# Lấy command. Ưu tiên jq; nếu thiếu jq thì fallback sang python3 (luôn có trên đa số máy dev).
if command -v jq >/dev/null 2>&1; then
  CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)
elif command -v python3 >/dev/null 2>&1; then
  CMD=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tool_input',{}).get('command',''))" 2>/dev/null)
else
  # Không có công cụ parse JSON → KHÔNG cho qua âm thầm. Chặn để an toàn (fail-closed).
  echo "⚠️  Hook cần 'jq' hoặc 'python3' để hoạt động. Cài jq: brew/apt install jq" >&2
  exit 2
fi

# Không lấy được command (không phải lệnh Bash có .command) → cho qua
if [ -z "$CMD" ] || [ "$CMD" = "null" ]; then
  exit 0
fi

# Pattern "dangerous by policy" — luôn chặn. Pattern CỤ THỂ để tránh false positive.
if echo "$CMD" | grep -qEi 'rm[[:space:]]+-[a-z]*r[a-z]*f|DROP[[:space:]]+TABLE|TRUNCATE[[:space:]]+TABLE|git[[:space:]]+push[[:space:]].*--force|git[[:space:]]+reset[[:space:]]+--hard|chmod[[:space:]]+-R[[:space:]]+777|curl[[:space:]].*\|[[:space:]]*sh|wget[[:space:]].*\|[[:space:]]*bash|mkfs|dd[[:space:]]+if='; then
  echo "🚫 BLOCKED bởi guardrail hook — lệnh nguy hiểm:" >&2
  echo "    $CMD" >&2
  echo "    Nếu thật sự cần, hãy chạy thủ công ngoài Claude Code." >&2
  exit 2
fi

exit 0
