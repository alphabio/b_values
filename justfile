# CSS Shorthand Expand - Build Commands
set shell := ["bash", "-cu"]

# Default task
default: check

dev:
    pnpm dev

# ------------- Build & Test -------------
build:
    pnpm build

test:
    pnpm test

cover:
    pnpm test:coverage
# ------------- Quality Gates -------------

typecheck:
    pnpm typecheck

format:
    pnpm format

lint:
    pnpm lint

check:
    pnpm check


# ------------- Development -------------
clean:
    pnpm clean

# ------------- Dependencies -------------

# Check for outdated dependencies
deps-check:
    @echo "📦 Checking package.json dependencies..."
    pnpm outdated -r || true
    @echo ""
    @echo "📦 Checking catalog dependencies..."
    npx -y pnpm-catalog-updates check || true

# Update package.json dependencies (root devDependencies)
deps-update:
    pnpm update -r --latest
    pnpm install
    @echo "✅ package.json dependencies updated."

# Update catalog dependencies (pnpm-workspace.yaml)
deps-catalog:
    npx -y pnpm-catalog-updates --update
    pnpm install
    @echo "✅ Catalog dependencies updated."

# Update everything (package.json + catalog)
deps-upgrade-all: deps-update deps-catalog
    @echo "✅ All dependencies updated."

# Full update workflow with validation
deps-upgrade: deps-upgrade-all check build test
    @echo "🎉 All dependencies updated and tests passed!"

# Add a new dependency to catalog
deps-add package:
    ./scripts/add-catalog-dep.sh {{package}}

# ------------- llm -------------

# Add path comment header to files
path_helper:
    b_path_helper --execute --relative

llm_txt:
    b_llm_txt packages/b_fluid-sim/src --recursive > docs/b_fluid-sim.txt
    b_llm_txt apps/explore/src/app/routes/displacement --recursive > docs/b_explore.txt


llm: path_helper
