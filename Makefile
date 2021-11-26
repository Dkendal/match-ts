.PHONY: test test-release perf clean build build-release

TSC_OPTS=--assumeChangesOnlyAffectDirectDependencies --verbose --listEmittedFiles

log=@echo $$(tput smso)$(1)$$(tput rmso)

all: build

clean:
	yarn run tsc --build --clean
	rm -rf dist

build:
	yarn tsc --build ${TSC_OPTS}

prepack: \
	build-release \
	test-release

build-release:
	$(call log,# build-release / tsc ...)
	yarn run tsc --build tsconfig-release.json ${TSC_OPTS}
	$(call log,# build-release ✅)

test-release: \
	build-release \
	test-release-package-check \
	test-release-cjs \
	test-release-ts
	$(call log,# test-release ✅)

test-release-package-check:
	$(call log,# test-release / Package exports ...)
	package-check

test-release-cjs:
	$(call log,# test-release / CommonJS ...)
	yarn workspace test-pack-commonjs install
	yarn workspace test-pack-commonjs test
	$(call log,# test-release / CommonJS ✅)

# FIXME: node esm support is weird
test-release-esm:
	$(call log,# test-release / ESM)
	yarn workspace test-pack-esm install
	yarn workspace test-pack-esm test
	$(call log,# test-release / ESM ✅)

test-release-ts:
	$(call log,# test-release / Typescript ...)
	yarn workspace test-pack-ts install
	yarn workspace test-pack-ts build
	yarn workspace test-pack-ts test
	$(call log,# test-release / Typescript ✅)

perf: build
	for file in build/perf/*.js; do node $$file; done

test:
	yarn tsc --project tsconfig.json
	yarn jest
