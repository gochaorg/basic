VERSION:=`node build/pkginfo.js -ver`
NAME:=`node build/pkginfo.js -name`
PKG:=$(NAME)-${VERSION}.tgz
OUT:=dist
PKG_JSON:=$(OUT)/package.json
PKG_OUT:=$(NAME)-${VERSION}.tgz

info:
	echo "version $(VERSION)"
	echo "name $(NAME)"

tsc:
	tsc

$(PKG_JSON):
	cp package.json $(PKG_JSON)

$(PKG): $(PKG_JSON) tsc
	cd $(OUT) ; npm pack
	mv -v $(OUT)/$(PKG) $(PKG)
	
package: $(PKG)