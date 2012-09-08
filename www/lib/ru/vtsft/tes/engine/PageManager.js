/**
 * Plugin for page managment
 */

$.provide("ru.vtsft.tes.engine.PageManager");

$.require("dojo.fx");
$.require("dojo.DeferredList");
$.require("dojo.parser");
$.require("dojo.hash")
$.declare("ru.vtsft.tes.engine.PageManager", null, {

    eventManager : null,

    core : null,

    pagesBox : null,

    pages : {},

    currentPage : null,

    previousPage : null,

    descriptor : {},

    moduleBoxes : {},

    hashHandler : null,

    startHash : null,

    currentSubPage : null,

    previousSubPage : null,

    wasReloaded : false,

    constructor : function (args) {
        $.safeMixin(this, args);
        var self = this;
    },

    init : function (descriptor) {
        var self = this;

        this.descriptor = descriptor;
        if (this.descriptor.nodeId) {
            this.pagesBox = $.byId(this.descriptor.nodeId) || null;
        } else {
            throw EXCEPTION.PAGE_MANAGER_INIT_FAILED;
        }

        if (this.descriptor && this.descriptor.pages) {

            /**
             * Define startHash if page was reloaded or open with hash
             */
            this.startHash = ($.hash() && $.hash() != "") ? $.hash() : null
            return true;
        }

        throw EXCEPTION.PAGE_MANAGER_INIT_FAILED;
    },

    initPages : function () {
        var self = this;
        /**
         * if we already have some pages we has to remove their
         */
        for (var p in this.pages) {
            this.removePage(p);
        }

        var promises = [];

        for (var i in this.descriptor.pages) {

            var role = this.descriptor.pages[i].private;

            if (!role || (this.securityManager && role && this.securityManager.hasAccess(role))) {
                promises.push(this.addPage(this.descriptor.pages[i]));
            }
        }

        this.previousSubPage = null;
        this.previousPage = null;
        this.currentSubPage = null;
        this.currentPage = null;

        /**
                 * We need to switch page if hash was changed
                 */
                self.hashHandler = $.subscribe("/dojo/hashchange", this, function (e) {
                        var subPage = self.getSubpageFromHash(e);
                        e = self.getPageFromHash(e);
                        if (e != self.currentPage || subPage != self.currentSubPage) {
                            self.switchPage(e, subPage);
                        }
                });

        return new dojo.DeferredList(promises);

    },

    reload : function (fullReload) {
        var self = this;

        if (this.hashHandler) {
            $.unsubscribe(this.hashHandler);
            this.hashHandler = null;
        }

        return this.initPages().then(
            function() {
                return self.createNavigation()
            }).then(function() {
                return self.toStartPage(fullReload);
            });

    },

    toStartPage : function (useCurrentHash) {
        var defaultPage = (this.securityManager) ? this.securityManager.getProperty("UserSettings.defaultPage") : null;

        /**
         * From Hash -> From user's default page -> From app default page
         */

        var hashPage = !useCurrentHash ? this.getPageFromHash(this.startHash) : null;
        var hashSubPage = !useCurrentHash ? this.getSubpageFromHash(this.startHash) : null;
        this.switchPage((this.pages[hashPage]) ? hashPage : ((defaultPage) ? defaultPage.value : this.descriptor.startPage), hashSubPage);

        /**
         * only one time page was loading from hash
         */
        this.startHash = null;
    },

    switchPage : function (toPage, subPage) {
        var self = this;

        if (this.pages[toPage]) {

            subPage = this._checkSubPage(toPage, subPage) ? subPage : null;

            this.previousPage = this.currentPage;
            this.currentPage = toPage;

            this.previousSubPage = this.currentSubPage;
            this.currentSubPage = subPage;

            /**
             * Refreshing module at old page
             */

            if (this.previousPage) {
                for (var i = 0; i < self.pages[this.previousPage].modules.length; i++) {
                    self.core.refreshModule(self.pages[this.previousPage].modules[i]);
                }
            }

            /**
             * If change only subpage.
             */

            if (this.currentPage == this.previousPage && this.currentSubPage != this.previousSubPage) {
                this.core.eventManager.fire("SwitchSubPage", {subPage: this.currentSubPage, previousSubPage : this.previousSubPage}, this.currentPage);
                this.setSubpage(this.currentSubPage);
                return;

            }

            var dfd = new dojo.Deferred();

            dfd.then(function (result) {

                if (self.previousPage) {
                    self.core.eventManager.fire("Close", {from : self.previousPage, to : self.currentPage, subPage: self.currentSubPage, previousSubPage : self.previousSubPage}, self.previousPage);
                    /*$.removeClass($.byId(self.descriptor.navigationNode + '_page_' + self.previousPage), "active");
                    $.style(self.pages[self.previousPage].node, "display", "none");*/
                }

                //$.addClass($.byId(self.descriptor.navigationNode + '_page_' + toPage), "active");
                $.style(self.pages[toPage].node, "opacity", "1");
                $.style(self.pages[toPage].node, "display", "block");
                self.core.eventManager.fire("Open", {from : self.previousPage, to : self.currentPage, subPage: self.currentSubPage, previousSubPage : self.previousSubPage}, self.currentPage);

                /**
                 * To avoid double call of onhashchange, we set new hash only if switchPage was called by user not by browser's history
                 */

                if (self.getPageFromHash() != toPage || self.getSubpageFromHash() != subPage) {
                    if (subPage) {
                        $.hash(toPage + "," + subPage, false, true);
                    } else {
                        $.hash(toPage, false, true);
                    }
                }

                /**
                 * initialization of modules
                 */
                for (var i = 0; i < self.pages[toPage].modules.length; i++) {
                    var module = self.pages[toPage].modules[i];
                    if (!self.core.runningModules[module]) {
                        $.place($.create("div", {
                            "class" : "PageLoader"
                        }), self.getBox(module), "last")

                        self.core.initModule(module, self.getBox(module), !!self.descriptor.pages[toPage].layout[module]).then(function (e) {
                            self.core.runModule(e);
                        },function () {

                        })
                    } else {
                        self.core.refreshModule(module, true);
                    }
                }
            })

            if (this.pages[this.previousPage]) {
                $.fadeOut({
                    node:this.pages[this.previousPage].node,
                    duration: 100,
                    onEnd : function () {
                        dfd.resolve();
                    }
                }).play();
            } else {
                dfd.resolve();
            }

        } else {
            throw EXCEPTION.PAGE_NOT_FOUND;
        }

    },

    removePage : function (_page) {
        var self = this;
        var page = self.pages[_page];

        /**
         * destroying modules
         */
        $.forEach(page.modules, function(item) {
            self.core.destroyModule(item);
        })

        /**
         * destroying widgets
         */
        $.forEach(page.widgets, function(item) {
            item.destroyRecursive();
        })

        /**
         * removing nodes
         */
        dojo.query(page.node).orphan();

        if (self.currentPage == page.name) {
            self.currentPage = null;
        }

        self.core.eventManager.unbind();

        delete self.pages[_page];
    },

    addPage : function (page) {
        var self = this;

        if (typeof page === "string") {
            page = this.descriptor.pages[page];
        }

        if (typeof page === "object") {
            var dfd = $.xhrGet(
                {
                    url : page.template
                }
            )

            dfd.then(function (result) {
                var page_div = $.create("div", {
                    className : "page",
                    innerHTML : result
                })

                self.pages[page.name] = {};
                self.pages[page.name].widgets = $.parser.parse(page_div);
                self.pages[page.name].node = page_div;
                self.pages[page.name].caption = page.caption
                $.place(page_div, self.pagesBox, "last");

                if (!(dojo.isFF < 4)) {
                    var script = dojo.query("script", page_div)[0];
                    if (script) {
                        eval(script.innerHTML);
                    }
                }
                self.pages[page.name].modules = self._parse(page_div);
                $.style(page_div, "display", "none")

            })

            return dfd;
        }
    },

    createNavigation : function () {
        var self = this;
        var dfd = new $.Deferred();
dfd.resolve();
        /**
         * animation
         */
/*
        if (this.descriptor.navigationNode && $.byId(self.descriptor.navigationNode)) {
            var height = $.style(self.descriptor.navigationNode, "height");
            if ($.query(" > li", self.descriptor.navigationNode).length > 0) {

                $.animateProperty({
                    properties: {height:{start: height, end : 0}},
                    duration: 100,
                    node : this.descriptor.navigationNode,
                    onEnd : function () {
                        dfd.resolve();
                        $.animateProperty({
                            properties: {height:{start: 0, end : height}},
                            node : self.descriptor.navigationNode,
                            duration: 100
                        }).play();
                    }
                }).play();
            } else {
                dfd.resolve();
            }
        } else {
            dfd.reject();
        }
*/
        return dfd/*.then(function () {
            $.query(" > li", self.descriptor.navigationNode).orphan();
            for (var pageName in self.descriptor.pages) {

                var page = self.descriptor.pages[pageName]

                if (!self.pages[page.name]) {
                    continue;
                }

                var li = $.create("li", {
                    innerHTML : '<span>' + page.caption + '</span>',
                    id: self.descriptor.navigationNode + '_page_' + page.name,
                    "class" : (self.currentPage == page.name) ? "active" : ""
                })

                $.connect(li, "onclick", page, function(event) {
                    if (self.currentPage != this.name) {
                        self.switchPage(this.name);
                    }
                })

                $.place(li, $.byId(self.descriptor.navigationNode));
            }
        });*/
    },

    getBox : function (name) {
        return this.moduleBoxes[name];
    },

    getActualPages : function () {
        var result = [];

        for (i in this.pages) {
            result.push({value: i, name : this.pages[i].caption})
        }

        return result;
    },

    getSubpageFromHash : function (hash) {
        var subpage = (hash || $.hash()).split(",") || [];
        return subpage[1];
    },

    getPageFromHash : function (hash) {
        var subpage = (hash || $.hash()).split(",") || [];
        return subpage[0];
    },

    setSubpage : function (subPage) {
        if (subPage) {
            $.hash(this.getPageFromHash() + "," + subPage);
        } else {
            $.hash(this.getPageFromHash());
        }
    },

    _parse : function (page) {
        var modules = dojo.query("[moduleId]", page);
        var result = [];
        for (var i = 0; i < modules.length; i++) {
            result[i] = modules[i].attributes.moduleId.nodeValue
            this.moduleBoxes[result[i]] = modules[i];
        }
        return result
    },

    _checkSubPage : function(page, subPage) {
        if (!subPage) {
            return true;
        }

        if (page && subPage && this.descriptor.pages[page] && this.descriptor.pages[page].subPages[subPage]) {
            var subPage = this.descriptor.pages[page].subPages[subPage];
            return this.securityManager && this.securityManager.hasAccess(subPage.private)
        } else {
            return false;
        }
    }
});
