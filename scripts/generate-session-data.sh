#!/usr/bin/env bash
# b_path:: scripts/generate-session-data.sh
set -euo pipefail

# Generate JSON data from session handovers and git history
# Output: sessions.json containing all session metadata

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SESSIONS_DIR="$PROJECT_ROOT/docs/sessions"
OUTPUT_FILE="$PROJECT_ROOT/sessions.json"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }

# Check if jq is available
if ! command -v jq &> /dev/null; then
    log_error "jq is required but not installed. Install with: brew install jq"
    exit 1
fi

# Extract session metadata from handover markdown
extract_session_metadata() {
    local session_dir="$1"
    local session_num="$2"
    local handover_file="$session_dir/SESSION_HANDOVER.md"
    local git_ref_file="$session_dir/git-ref.txt"

    if [[ ! -f "$handover_file" ]]; then
        log_warn "Missing handover for session $session_num"
        return 1
    fi

    local date, focus, title, git_ref

    # Extract date (look for **Date:** pattern and clean it)
    date=$(grep -m 1 "^\*\*Date:\*\*" "$handover_file" | sed 's/.*: //' | sed 's/\*\*//g' | xargs || echo "")

    # Extract focus (look for **Focus:** pattern and clean it)
    focus=$(grep -m 1 "^\*\*Focus:\*\*" "$handover_file" | sed 's/.*: //' | sed 's/\*\*//g' | xargs || echo "")

    # Extract title from first heading
    title=$(grep -m 1 "^# " "$handover_file" | sed 's/^# //' || echo "Session $session_num")

    # Get git ref
    git_ref=""
    if [[ -f "$git_ref_file" ]]; then
        git_ref=$(cat "$git_ref_file" | tr -d '\n')
    fi

    # Get git commit metadata if ref exists
    local commit_date=""
    local commit_message=""
    local files_changed=0
    local insertions=0
    local deletions=0
    local stats
    local accomplishments
    local artifacts
    local tests_passing

    if [[ -n "$git_ref" ]] && git rev-parse --verify "$git_ref" &> /dev/null; then
        commit_date=$(git show -s --format=%cI "$git_ref" 2>/dev/null || echo "")
        commit_message=$(git show -s --format=%s "$git_ref" 2>/dev/null || echo "")

        # Get stats
        stats=$(git show --stat --format="" "$git_ref" 2>/dev/null | tail -1 || echo "")
        files_changed=$(echo "$stats" | grep -o '[0-9]* file' | grep -o '[0-9]*' || echo "0")
        insertions=$(echo "$stats" | grep -o '[0-9]* insertion' | grep -o '[0-9]*' || echo "0")
        deletions=$(echo "$stats" | grep -o '[0-9]* deletion' | grep -o '[0-9]*' || echo "0")
    fi

    # Extract accomplishments (lines starting with - or * after "Accomplished" section)
    accomplishments=$(awk '/## .*Accomplished/,/^## / {
        if ($0 ~ /^[[:space:]]*[-*]/ && $0 !~ /^## /) {
            gsub(/^[[:space:]]*[-*][[:space:]]*/, "");
            gsub(/\[x\][[:space:]]*/, "");
            gsub(/\[ \][[:space:]]*/, "");
            gsub(/✅[[:space:]]*/, "");
            gsub(/❌[[:space:]]*/, "");
            gsub(/^[[:space:]]+|[[:space:]]+$/, "");
            if (length($0) > 0 && length($0) < 200) print $0;
        }
    }' "$handover_file" | head -20 | jq -R . | jq -s .)

    # Get artifact files (exclude SESSION_HANDOVER.md and git-ref.txt)
    artifacts=$(find "$session_dir" -maxdepth 1 -type f \
        ! -name "SESSION_HANDOVER.md" \
        ! -name "git-ref.txt" \
        -exec basename {} \; | jq -R . | jq -s .)

    # Extract test count if mentioned
    tests_passing=$(grep -o '[0-9,]*[0-9] tests passing' "$handover_file" | head -1 | grep -o '[0-9,]*[0-9]' | tr -d ',' || echo "0")

    # Extract tags/categories from focus and accomplishments
    local tags="[]"
    if echo "$focus$accomplishments" | grep -qi "test"; then
        tags=$(echo "$tags" | jq '. += ["tests"]')
    fi
    if echo "$focus$accomplishments" | grep -qi "bug\|fix"; then
        tags=$(echo "$tags" | jq '. += ["bugfix"]')
    fi
    if echo "$focus$accomplishments" | grep -qi "generator"; then
        tags=$(echo "$tags" | jq '. += ["generators"]')
    fi
    if echo "$focus$accomplishments" | grep -qi "parser\|parsing"; then
        tags=$(echo "$tags" | jq '. += ["parsers"]')
    fi
    if echo "$focus$accomplishments" | grep -qi "ADR\|architecture\|decision"; then
        tags=$(echo "$tags" | jq '. += ["architecture"]')
    fi
    if echo "$focus$accomplishments" | grep -qi "refactor"; then
        tags=$(echo "$tags" | jq '. += ["refactor"]')
    fi
    if echo "$focus$accomplishments" | grep -qi "performance"; then
        tags=$(echo "$tags" | jq '. += ["performance"]')
    fi
    if echo "$focus$accomplishments" | grep -qi "DX\|developer experience"; then
        tags=$(echo "$tags" | jq '. += ["dx"]')
    fi

    # Build JSON object
    jq -n \
        --arg num "$session_num" \
        --arg title "$title" \
        --arg date "$date" \
        --arg focus "$focus" \
        --arg git_ref "$git_ref" \
        --arg commit_date "$commit_date" \
        --arg commit_message "$commit_message" \
        --argjson files_changed "$files_changed" \
        --argjson insertions "$insertions" \
        --argjson deletions "$deletions" \
        --argjson accomplishments "$accomplishments" \
        --argjson artifacts "$artifacts" \
        --argjson tests_passing "$tests_passing" \
        --argjson tags "$tags" \
        '{
            number: $num | tonumber,
            title: $title,
            date: $date,
            focus: $focus,
            tags: $tags,
            git: {
                ref: $git_ref,
                commit_date: $commit_date,
                commit_message: $commit_message,
                stats: {
                    files_changed: $files_changed,
                    insertions: $insertions,
                    deletions: $deletions
                }
            },
            accomplishments: $accomplishments,
            artifacts: $artifacts,
            metrics: {
                tests_passing: $tests_passing
            }
        }'
}

# Main processing
log_info "Scanning sessions directory: $SESSIONS_DIR"

# Get all session directories
session_dirs=$(find "$SESSIONS_DIR" -maxdepth 1 -type d -name '[0-9][0-9][0-9]' | sort -V)
session_count=$(echo "$session_dirs" | wc -l | tr -d ' ')

log_info "Found $session_count sessions"

# Process each session
sessions_json="[]"
processed=0

for session_dir in $session_dirs; do
    session_num=$(basename "$session_dir")

    if session_data=$(extract_session_metadata "$session_dir" "$session_num"); then
        sessions_json=$(echo "$sessions_json" | jq --argjson new_session "$session_data" '. += [$new_session]')
        processed=$((processed + 1))
    fi
done

# Get current repo stats
log_info "Gathering repository statistics..."

total_commits=$(git rev-list --count HEAD 2>/dev/null || echo "0")
first_commit=$(git rev-list --max-parents=0 HEAD 2>/dev/null || echo "")
first_commit_date=$(git show -s --format=%cI "$first_commit" 2>/dev/null || echo "")
last_commit=$(git rev-parse HEAD 2>/dev/null || echo "")
last_commit_date=$(git show -s --format=%cI "$last_commit" 2>/dev/null || echo "")

# Count test files
test_files=$(find "$PROJECT_ROOT/packages" -name "*.test.ts" -o -name "*.test.tsx" 2>/dev/null | wc -l | tr -d ' ')

# Build final JSON structure
final_json=$(jq -n \
    --argjson sessions "$sessions_json" \
    --argjson total_commits "$total_commits" \
    --arg first_commit_date "$first_commit_date" \
    --arg last_commit_date "$last_commit_date" \
    --argjson total_sessions "$processed" \
    --argjson test_files "$test_files" \
    '{
        meta: {
            generated_at: (now | todate),
            total_sessions: $total_sessions,
            total_commits: $total_commits,
            first_commit_date: $first_commit_date,
            last_commit_date: $last_commit_date,
            test_files: $test_files
        },
        sessions: $sessions
    }')

# Write output
echo "$final_json" | jq '.' > "$OUTPUT_FILE"

log_info "Generated $OUTPUT_FILE with $processed sessions"
log_info "Repository stats: $total_commits commits, $test_files test files"

# Show sample
echo ""
echo "Sample (first 2 sessions):"
jq '.sessions | .[0:2]' "$OUTPUT_FILE"
