.PHONY: test test-release perf clean build build-release

TSC_OPTS=--assumeChangesOnlyAffectDirectDependencies --verbose --listEmittedFiles

log=@echo $$(tput smso)$(1)$$(tput rmso)

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
	$(call log,# build-release / tsc)
	yarn run tsc --build tsconfig-release.json ${TSC_OPTS}
	$(call log,# build-release / copying dist)
	rsync -vv -a --include="*.d.ts" --include="*.js" --exclude="*" ./build/src/* ./dist/
	$(call log,# build-release ✅)

test-release: build-release
	$(call log,# test-release / Package exports)
	package-check
	$(call log,# test-release / CommonJS)
	yarn workspace test-pack-commonjs install
	yarn workspace test-pack-commonjs test
	$(call log,# test-release / ESM)
	yarn workspace test-pack-esm install
	yarn workspace test-pack-esm test
	$(call log,# test-release ✅)

perf: build
	for file in build/perf/*.js; do node $$file; done

test:
	yarn tsc --project tsconfig.json
	yarn jest
