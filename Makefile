.PHONY: test test-release perf clean build build-release

TSC_OPTS=--assumeChangesOnlyAffectDirectDependencies --verbose --listEmittedFiles

all: build

clean:
	yarn run tsc --build --clean
	rm -rf dist

build:
	yarn tsc --build ${TSC_OPTS}

prerelease: \
	build-release \
	test-release

build-release: clean
	yarn run tsc --build tsconfig-release.json ${TSC_OPTS}
	rsync -vv -a --include="*.d.ts" --include="*.js" --exclude="*" ./build/src/* ./dist/

test-release: build-release
	@echo "# Test / Pack"
	@echo "## Test / Pack / CommonJS"
	yarn workspace test-pack-commonjs install
	yarn workspace test-pack-commonjs test
	@echo "## Test / Pack / ESM"
	yarn workspace test-pack-esm install
	yarn workspace test-pack-esm test

perf: build
	for file in build/perf/*.js; do node $$file; done

test:
	yarn tsc --project tsconfig.json
	yarn jest
