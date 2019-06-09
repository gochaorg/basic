/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./out/hello.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./out/WidgetUtil.js":
/*!***************************!*\
  !*** ./out/WidgetUtil.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar HtmlElementBuilder =\n/** @class */\nfunction () {\n  function HtmlElementBuilder(el) {\n    this.el = el;\n  }\n\n  HtmlElementBuilder.prototype.append = function (prnt) {\n    if (prnt) {\n      prnt.appendChild(this.el);\n    }\n\n    return this;\n  };\n\n  HtmlElementBuilder.prototype.html = function (v) {\n    this.el.innerHTML = v;\n    return this;\n  };\n\n  HtmlElementBuilder.prototype.attr = function (name, val) {\n    this.el.setAttribute(name, val);\n    return this;\n  };\n\n  HtmlElementBuilder.prototype.onclick = function (listener) {\n    this.el.addEventListener(\"click\", function (ev) {\n      listener(ev);\n      return null;\n    });\n    return this;\n  };\n\n  return HtmlElementBuilder;\n}();\n\nexports.HtmlElementBuilder = HtmlElementBuilder;\n\nfunction el(tagname, attribs) {\n  var el = document.createElement(tagname);\n\n  if (attribs) {\n    for (var k in attribs) {\n      var v = attribs[k];\n\n      if (typeof v == 'string') {\n        el.setAttribute(k, v);\n      } else if (typeof v == 'number') {\n        el.setAttribute(k, '' + v);\n      } else if (typeof v == 'boolean') {\n        el.setAttribute(k, v ? 'true' : 'false');\n      }\n    }\n  }\n\n  return new HtmlElementBuilder(el);\n}\n\nexports.el = el;\n\nfunction div(attribs) {\n  return el('div', attribs);\n}\n\nexports.div = div;\n\nfunction span(attribs) {\n  return el('span', attribs);\n}\n\nexports.span = span;\n\nfunction input(attribs) {\n  return el('input', attribs);\n}\n\nexports.input = input;\n\nfunction textInput(attribs) {\n  return el('input', attribs).attr('type', 'text');\n}\n\nexports.textInput = textInput;\n\nfunction button(attribs) {\n  return el('button', attribs);\n}\n\nexports.button = button; //createEL( 'aa', {a:1,b:2} )\n\n//# sourceURL=webpack:///./out/WidgetUtil.js?");

/***/ }),

/***/ "./out/hello.js":
/*!**********************!*\
  !*** ./out/hello.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar __importStar = this && this.__importStar || function (mod) {\n  if (mod && mod.__esModule) return mod;\n  var result = {};\n  if (mod != null) for (var k in mod) {\n    if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];\n  }\n  result[\"default\"] = mod;\n  return result;\n};\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar wu = __importStar(__webpack_require__(/*! ./WidgetUtil */ \"./out/WidgetUtil.js\"));\n\nvar GWBASICApp =\n/** @class */\nfunction () {\n  function GWBASICApp() {}\n\n  Object.defineProperty(GWBASICApp.prototype, \"root\", {\n    //#region root : HTMLElement\n    get: function get() {\n      return document.getElementById('app');\n    },\n    enumerable: true,\n    configurable: true\n  });\n  Object.defineProperty(GWBASICApp.prototype, \"appInnerHtml\", {\n    get: function get() {\n      if (this.root) {\n        return this.root.innerHTML;\n      }\n\n      return null;\n    },\n    set: function set(html) {\n      if (html && this.root) {\n        this.root.innerHTML = html;\n      }\n    },\n    enumerable: true,\n    configurable: true\n  });\n  Object.defineProperty(GWBASICApp.prototype, \"sourceBlock\", {\n    //#endregion\n    //#region sourceBlock : HTMLElement\n    get: function get() {\n      if (this.root) {\n        return this.root.querySelector('.source');\n      }\n\n      return null;\n    },\n    enumerable: true,\n    configurable: true\n  }); //#endregion\n\n  GWBASICApp.prototype.init = function () {\n    var _this = this;\n\n    if (this.root) {\n      // header\n      wu.div().html('Like GWBasic').append(this.root); // source block\n\n      wu.div({\n        \"class\": 'source'\n      }).append(this.root); // eval block\n\n      var evalBlock = wu.div({\n        \"class\": 'eval'\n      }).append(this.root).el;\n      var inp1_1 = wu.textInput().append(evalBlock).el;\n      wu.button().html('eval').onclick(function (e) {\n        return _this.gwBasicEval(inp1_1.value);\n      }).append(evalBlock);\n    }\n  };\n\n  GWBASICApp.prototype.gwBasicEval = function (command) {\n    if (this.sourceBlock) {\n      this.sourceBlock.textContent = command;\n    }\n\n    console.log('eval command ' + command);\n  };\n\n  return GWBASICApp;\n}();\n\nnew GWBASICApp().init();\n\n//# sourceURL=webpack:///./out/hello.js?");

/***/ })

/******/ });