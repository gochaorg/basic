# node version
NODE_VER=node12

# startup javascript
STARTUP=./out/ts/tsbasic.js

# dist layout
BIN=dist/bin
BIN_W64=${BIN}/tsbasic-win-x64.exe
BIN_L64=${BIN}/tsbasic-linux-x64
BIN_M64=${BIN}/tsbasic-macos-x64

# build tools
PKG_EXE=./node_modules/.bin/pkg

dist: dist/html ${BIN}

dist-dir:
	mkdir -p dist

dist/html: dist-dir
	npm run-script build

${BIN_W64}: dist/html
	${PKG_EXE} -t ${NODE_VER}-win-x64 -o ${BIN_W64} ${STARTUP}

${BIN_L64}: dist/html
	${PKG_EXE} -t ${NODE_VER}-linux-x64 -o ${BIN_L64} ${STARTUP}
	chmod a+x ${BIN_L64}

${BIN_M64}: dist/html
	${PKG_EXE} -t ${NODE_VER}-macos-x64 -o ${BIN_M64} ${STARTUP}
	chmod a+x ${BIN_M64}

${BIN}: ${BIN_W64} ${BIN_L64} ${BIN_M64}
