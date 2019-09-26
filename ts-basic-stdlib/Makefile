VER=1.0.0
PKG_NAME=ts-basic-stdlib-$(VER).tgz
OUT_DIR=dist
OUT_PKG_JSN=$(OUT_DIR)/src/package.json

all: $(PKG_NAME)

$(PKG_NAME): tsc2js $(OUT_PKG_JSN)
	cd $(OUT_DIR)/src ; npm pack
	mv $(OUT_DIR)/src/$(PKG_NAME) .

tsc2js:
	tsc

$(OUT_PKG_JSN):
	cp package.json $(OUT_PKG_JSN)