if (!dojo._hasResource["ru.vtsft.tes.ui.Filter"]) {
    dojo._hasResource["ru.vtsft.tes.ui.Filter"] = true;

    dojo.provide("ru.vtsft.tes.ui.Filter");

    dojo.requireLocalization("ru.vtsft.tes.ui", "Filter", null);
    dojo.require("dojo.i18n");
    dojo.require("dijit.Tooltip");
    dojo.require("dijit.form.ComboBox");
    dojo.require("dijit.form.ValidationTextBox");
    dojo.require("dojo.data.ItemFileWriteStore")
    dojo.require("dijit.form.DropDownButton");
    dojo.require("dijit.TooltipDialog");
    dojo.require("dijit.form.TextBox");
    dojo.require("dijit.form.Button");
    dojo.require("dojo.number");
    dojo.require("dojo.date.locale");
    dojo.require("dijit.form.CheckBox");
    dojo.require("dijit.form.DateTextBox");
    dojo.require("dijit.Toolbar");
    dojo.require("dijit.form.Button");
    dojo.require("dijit._Widget");
    dojo.require("dijit._Templated");

    dojo.declare("ru.vtsft.tes.ui.Filter", [dijit._Widget, dijit._Templated], {
        templateString: dojo.cache("ru.vtsft.tes.ui", "resources/templates/Filter.html"),

        widgetsInTemplate : true,

        dataMapping : null,

        filterIDPull : 0,

        locale : dojo.i18n.getLocalization("ru.vtsft.tes.ui", "Filter", "ru"),

        lastQuery : "",

        constructor : function (params, srcNodeRef) {
            dojo.safeMixin(this, params);
            this.inherited(arguments);

            this.filters = [];
            this.simpleFilter = new this.SimpleFilter(this);
            this.rangeFilter = new this.RangeFilter(this);
            this.enumFilter = new this.EnumFilter(this);
            this.dateFilter = new this.DateFilter(this);
        },

        createFilterDialog : function () {
            var self = this;
            var dialog = this.filterDialog;
            //Combobox with fields

            this.filterDialogButton.startup();
            
            dojo.forEach(this.dataMapping, function (item, index) {

                if (item.fieldType == "simple") {
                    item.filter = self.simpleFilter;
                }

                if (item.fieldType == "range") {
                    item.filter = self.rangeFilter;
                }

                if (item.fieldType == "enum") {
                    item.filter = self.enumFilter;
                }

                if (item.fieldType == "range_date") {
                    item.filter = self.dateFilter;
                }

            })

            this.filteringSelect.set("store", new dojo.data.ItemFileWriteStore({
                data: {
                    identifier: 'field',
                    items:this.dataMapping,
                    hierarchical : false,
                    searchAttr : "name"
                }
            }))

            this.clearFilterDialogBox(true);

            this.addButton.onClick = function () {
                if(self.addMoreButton.onClick()){
                    self.filterDialogButton.closeDropDown();
                    self.clearFilterDialogBox(true);
                }
            };

            this.addMoreButton.onClick = function (event) {
                var filter = self.filteringSelect.item.filter[0];
                if (filter.validate()) {
                    var newFilter = filter.createFilter();
                    newFilter.isExclude = self.isExcludinfFilter.checked;
                    self.addFilter.call(self, newFilter);
                    filter.reset(event);
                    if (event) {
                        self.refreshFilterDialogBox();
                    } else {
                        return true;
                    }
                } else {
                    return false;
                }
            }

            this.cancelButton.onClick = function (event) {
                if (self.filteringSelect.item) {
                    self.filteringSelect.item.filter[0].reset()
                }
                self.clearFilterDialogBox(true);
                dialog._onSubmit();

            }
            var filterIDPull = 0;

            dojo.connect(this.filteringSelect, "onChange", function(event) {
                if (self.filteringSelect.item && self.filteringSelect.item.filter[0]) {
                    var filter = self.filteringSelect.item.filter[0];

                    filter.init(self.filteringSelect.item);

                    self.clearFilterDialogBox();

                    dojo.fadeIn({ node: self.dialog_content }).play();
                    dojo.style(self.dialog_placeholder, "display", "none");

                    dojo.place(filter.domNode, dojo.byId(self.id + "_filterFields"), "last");

                    dojo.place(self.addMoreButton.domNode, dojo.byId(self.id + "_filterButtons"), "last");
                    dojo.place(self.addButton.domNode, dojo.byId(self.id + "_filterButtons"), "last");

                }

            });

            this.filterDialogButton.set("disabled", false);
        },

        createGroup : function (filter) {
            var self = this;

            var templateContent = '<div style="width : 420px"></div> <div class="dijitDialogTitleBar">Фильтры поля "${title}"<br/><span class="subTitle"></span></div><div class="TooltipDialogContent" ><div style="clear:both"></div></div><div class="dijitDialogPaneButtons smallButtons" align="right"></div></div>'
            var group = dijit.byId(this.id + "_filter_group_" + filter.field);
            if (!group) {

                group = new dijit.form.DropDownButton({
                    templateString:dojo.cache("dijit.form","templates/DropDownButtonWithRemove.html",'<div  class="dijitReset dijitStretch dijitButtonNode" dojoAttachPoint="focusNode,titleNode,_arrowWrapperNode, _popupStateNode"><div class="dijitReset dijitInline DropDownButton " dojoAttachPoint="_buttonNode, containerNode, _popupStateNode"><span class="dijitReset dijitInline dijitButtonText " dojoAttachPoint="containerNode"></span><span class="dijitReset dijitInline dijitArrowButtonInner"></span></div><div dojoAttachPoint="removeButton" class="dijitReset dijitInline FilterGroupRemoveButton">×</div>    <input ${!nameAttrSetting} type="${type}" value="${value}" class="dijitOffScreen" tabIndex="-1" dojoAttachPoint="valueNode"/></div>'),
                    label : filter.name || "NO_NAME",
                    "class" : "groupFilter",
                    _stopClickEvents : true,
                    postCreate : function () {
                        dijit.form.DropDownButton.prototype.postCreate.apply(this, arguments);
                        dojo.connect(this.removeButton, "onclick", function (event){
                           group.closeDropDown();
                           self.filters = dojo.filter(self.filters, function(item, index) {
                                if (item.field == filter.field) {
                                    dojo.query("* > #" + self.id + "_li_" + item.id, group.dropDown.domNode).orphan();
                                }
                                return item.field != filter.field;
                            })


                           group.destroy();
                           dojo.query("#" + self.id + "_li_" + filter.field, dojo.byId(self.id + "_filterList")).orphan();

                        });
                    },
                    id : this.id + "_filter_group_" + filter.field,
                    dropDown : new dijit.TooltipDialog({
                        content : dojo.string.substitute(templateContent, {
                            title : filter.name
                        }),
                        width : "420px"
                    })
                });

                if (filter.fieldType == "simple") {
                    group.filter = new this.SimpleFilter(this);
                }
                if (filter.fieldType == "range") {
                    group.filter = new this.RangeFilter(this);
                }
                if (filter.fieldType == "range_date") {
                    group.filter = new this.DateFilter(this);
                }
                if (filter.fieldType == "enum") {
                    group.filter = new this.EnumFilter(this);

                }

                group.filterConteiner = dojo.create("ui",{
                    "class":"FilterConteiner",
                    ui_id : this.id + "_filter_group_ui_" + filter.field
                }, dojo.query(".TooltipDialogContent", group.dropDown.domNode)[0], "first")

                group.editNode = dojo.create("div", {});

                group.isExclude = new dijit.form.CheckBox({
                    type : "checkbox"
                });

                dojo.place(dojo.create("label", {
                    "for" : group.isExclude.id,
                    "innerHTML" : this.locale.DECLUDING_FILTER
                }), group.editNode)

                dojo.place(group.isExclude.domNode, group.editNode, "first");
                dojo.addClass(group.filter.domNode, "filterFields");
                dojo.place(group.filter.domNode, group.editNode, "last");

                if (group.filter) {
                    dojo.style(group.editNode, "display", "none");
                    dojo.style(group.editNode, "opacity", "0");
                    dojo.place(group.editNode, dojo.query(".TooltipDialogContent", group.dropDown.domNode)[0], "first");
                }

                group.closeButton = new dijit.form.Button({
                    label : this.locale.CLOSE,
                    "class" : "smallButton",
                    onClick : function () {
                        group.closeDropDown();
                    }
                })

                group.addButton = new dijit.form.Button({
                    label : this.locale.ADD,
                    "class" : "smallButton primary"
                })

                group.okButton = new dijit.form.Button({
                    label : this.locale.EDIT,
                    "class" : "smallButton  primary",
                    style : {"display" : "none"}
                })

                group.okAddButton = new dijit.form.Button({
                    label : this.locale.OK,
                    "class" : "smallButton  primary",
                    style : {"display" : "none"}
                })

                group.cancelButton = new dijit.form.Button({
                    label : this.locale.CANCEL,
                    "class" : "smallButton",
                    style : {"display" : "none"}
                })

                dojo.place(group.closeButton.domNode, dojo.query(".dijitDialogPaneButtons", group.dropDown.domNode)[0], "last");
                dojo.place(group.addButton.domNode, dojo.query(".dijitDialogPaneButtons", group.dropDown.domNode)[0], "last");
                dojo.place(group.cancelButton.domNode, dojo.query(".dijitDialogPaneButtons", group.dropDown.domNode)[0], "last");
                dojo.place(group.okButton.domNode, dojo.query(".dijitDialogPaneButtons", group.dropDown.domNode)[0], "last");
                dojo.place(group.okAddButton.domNode, dojo.query(".dijitDialogPaneButtons", group.dropDown.domNode)[0], "last")

                var li = dojo.create("li", {
                    id : this.id + "_li_" + filter.field
                }, dojo.byId(self.id + "_filterList"), "last");

                dojo.place(group.domNode, li, "first");

                var toFilterList = function () {
                    dojo.style(group.closeButton.domNode, "display", "inline");
                    dojo.style(group.cancelButton.domNode, "display", "none");
                    dojo.style(group.addButton.domNode, "display", "inline");
                    dojo.style(group.okButton.domNode, "display", "none");
                    dojo.style(group.okAddButton.domNode, "display", "none");
                    dojo.fadeOut({
                        node:group.editNode,
                        duration: 200,
                        onEnd : function () {
                            dojo.query(".subTitle",group.dropDown.domNode)[0].innerHTML=""
                            dojo.style(group.filterConteiner, "display", "inline");
                            dojo.style(group.editNode, "display", "none");
                            dojo.fadeIn({node:group.filterConteiner, duration: 200}).play();
                        }
                    }).play()
                }

                dojo.connect(group.cancelButton, "onClick", function (event) {
                    toFilterList();
                })

                dojo.connect(group.okButton, "onClick", function (event) {
                    if (group.filter.validate()){
                        var newFilter = group.filter.createFilter();
                        newFilter.isExclude = group.isExclude.checked;
                        self.addFilter(newFilter)
                        toFilterList();
                    }
                })

                dojo.connect(group.okAddButton, "onClick", function (event) {
                    if (group.filter.validate()){
                        var newFilter = group.filter.createFilter();
                        newFilter.isExclude = group.isExclude.checked;
                        self.addFilter(newFilter);
                        toFilterList();
                    }
                })

                dojo.connect(group.addButton, "onClick", function (event) {
                    group.filter.init($.filter(self.dataMapping, function (item, index) {
                            return item.field == filter.field
                        })[0]);
                    dojo.style(group.closeButton.domNode, "display", "none");
                    dojo.style(group.cancelButton.domNode, "display", "inline");
                    dojo.style(group.addButton.domNode, "display", "none");
                    dojo.style(group.okButton.domNode, "display", "none");
                    dojo.style(group.okAddButton.domNode, "display", "inline");
                    group.isExclude.set("checked", false);
                    dojo.fadeOut({
                        node:group.filterConteiner,
                        duration: 200,
                        onEnd : function () {
                            dojo.style(group.filterConteiner, "display", "none");
                            dojo.style(group.editNode, "display", "inline");
                            dojo.query(".subTitle",group.dropDown.domNode)[0].innerHTML=self.locale.ADD_FILTER
                            dojo.fadeIn({node:group.editNode, duration: 200}).play();

                        }
                    }).play()
                })
            }
            return group;
        },

        /**
         * Adding new filter
         */
        addFilter : function (filter) {
            var self = this;
            var group = this.createGroup(filter);
            var li = {};

            if (filter.id) {
                for (i = 0; i < this.filters.length; i++) {
                    if (this.filters[i].id == filter.id) {
                        li = dojo.query("* > #" + self.id + "_li_" + filter.id, group.dropDown.domNode)[0];
                        dojo.query("> *", li).orphan();
                        this.filters[i] = filter;
                        break;
                    }
                }
            } else {
                filter.id = this.filterIDPull;
                this.filterIDPull++;

                if (filter.fieldType == "enum") {
                    this.filters = dojo.filter(self.filters, function(item, index) {
                        if (item.field == filter.field) {
                            dojo.query("* > #" + self.id + "_li_" + item.id, group.dropDown.domNode).orphan();
                        }
                        return item.field != filter.field;
                    })
                }
                this.filters.push(filter);
                var ui = dojo.query(".FilterConteiner", group.dropDown.domNode)[0];
                li = dojo.create("li", {

                    id : this.id + "_li_" + filter.id,
                    "class" : ("singleFilter " + ((filter.fieldType == "enum") ? " enum " : ""))
                }, group.filterConteiner, "first");


            }

            var table = dojo.create("table", {
                width : "100%",
                height : "100%",
                align : "left",
                valign : "middle",
                cellpadding : 0,
                cellspacing : 0
            })

            var tr = dojo.create("tr", {width:"100%"}, table, "first");

            var labelToolTip = "";

            if (filter.fieldType == "simple") {
                labelToolTip += "<b>" + filter.value + "</b>"
            }

            if (filter.fieldType == "range") {
                labelToolTip += ((filter.min) ? "От : <b>" + filter.min + "</b>" : "")
                    + ((filter.max) ? "<br/>По : <b>" + filter.max + "</b>" : "")
            }

            if (filter.fieldType == "range_date") {
                labelToolTip += ((filter.min) ? "От : <b>" + self.formateDate(filter.min) + "</b>" : "")
                    + ((filter.max) ? "<br/>По : <b>" + self.formateDate(filter.max) + "</b>" : "")
            }

            if (filter.fieldType == "enum") {
                for (var i = 0; i < filter.names.length; i++) {
                    labelToolTip += "<b>" + filter.names[i] + "</b><br/>";
                }
            }

            var editButton = dojo.create("td", {
                innerHTML : '<div class="editFilterButton" >'+labelToolTip+"</div>",
                id : this.id + "_li_editButton" + filter.id,
                style : {cursor : "pointer"}
            }, tr, "first");

            if (filter.isExclude) {

                dojo.create("div", {
                    innerHTML : this.locale.EXCLUDING,
                    className :  "exclude"
                }, editButton, "last");

                dojo.create("td", {}, tr, "last");
            }

            var removeButton = dojo.create("td", {
                className : "removeFilterButton",
                innerHTML : "×",
                align : "center",
                rowspan : (filter.isExclude) ? "2" : "1",
                width : "20px"
            }, tr, "last");


            dojo.place(table, li, "first");


            dojo.connect(editButton, "onclick", function (event) {

                dojo.style(group.closeButton.domNode, "display", "none");
                dojo.style(group.cancelButton.domNode, "display", "inline");
                dojo.style(group.addButton.domNode, "display", "none");
                dojo.style(group.okButton.domNode, "display", "inline");
                group.isExclude.set("checked", filter.isExclude || false);
                if (group.filter) {
                    group.filter.init($.filter(self.dataMapping, function (item, index) {
                            return item.field == filter.field
                        })[0], filter);
                    dojo.fadeOut({
                        node:group.filterConteiner,
                        duration: 200,
                        onEnd : function () {
                            dojo.style(group.filterConteiner, "display", "none");
                            dojo.style(group.editNode, "display", "inline");
                            dojo.query(".subTitle",group.dropDown.domNode)[0].innerHTML=self.locale.EDIT_FILTER
                            dojo.fadeIn({node:group.editNode, duration: 200}).play();
                        }
                    }).play()
                }
            })


            dojo.connect(removeButton, "onclick", function (event) {
                dojo.query(li).orphan();
                self.filters = dojo.filter(self.filters, function(item, index) {
                    return item != filter;
                })
                if (!dojo.some(self.filters, function (item) {
                    return item.field == filter.field;
                })) {
                    group.closeDropDown();
                    group.destroy();
                }
                self.onFilterChange(self.filters, filter, "remove");
            })

            this.onFilterChange(this.filters, filter, "add");
        },
        /**
         * remove all filter widgets domNode
         */
        clearFilterDialogBox : function (force) {
            //destroing old filter field and widget's if nessesary
            if (force) {
                this.filteringSelect.reset();
                dojo.fadeOut({ node: this.dialog_content }).play();
            }
            this.refreshFilterDialogBox();
            dojo.query('#' + this.id + '_filterFields > *').orphan();
            dojo.query('#' + this.id + '_filterButtons>:not(span[widgetid=' + this.cancelButton.id + '])').orphan();
            dojo.style(this.dialog_placeholder, "display", "inline");
        },
        /**
         * reset all filter widgets
         */
        refreshFilterDialogBox : function () {
            this.isRemoveOld.set("checked", false);
            this.isRemoveOld.set("disabled", false);
            this.isExcludinfFilter.set("checked", false);
            this.isExcludinfFilter.set("disabled", false);
        },

        buildQuery : function (isActive) {

            this.lastQuery = new Array(this.filters.length);

            for (i in this.filters) {

                if (isActive) {
                    this.setActiveFilter(this.filters[i]);
                }

                this.lastQuery[i] = {};
                dojo.mixin(this.lastQuery[i], this.filters[i]);
                this.lastQuery[i].id = null;
            }

            this.lastQuery = {query:{filterItems:this.lastQuery}};

            return this.lastQuery;

        },

        setActiveFilter : function(filter) {
            if (!filter.isActive) {
                // dojo.addClass(dojo.byId(this.id + "_li_" + filter.id), " active");
            }
            filter.isActive = true;
        },

        onFilterChange : function (filters, filter, action) {
        },

        formateDate : function (val) {
            return val.replace(/^(\d{4})-(\d{2})-(\d{2})T.*$/, "$1.$2.$3")
        },
        /**
         *
         * @param parent
         * @return new simple filter
         */
        SimpleFilter : function  (parent) {
            var field = new dijit.form.ValidationTextBox({
                trim : true,
                placeHolder : parent.locale.INPUT_PLACEHOLDER

            })

            this.domNode = dojo.create("div");

            dojo.create("label", {
                "for" : field.id,
                innerHTML : parent.locale.SIMPLE_FIELD
            }, this.domNode, "last")

            dojo.create("br", {}, this.domNode, "last");

            dojo.place(field.domNode, this.domNode, "last");

            this.createFilter = function () {
                return {
                    id : (this.filter) ? this.filter.id : null,
                    field : this.fieldParams.field,
                    fieldType : this.fieldParams.fieldType,
                    name : this.fieldParams.name,
                    value : field.value,
                    like : this.fieldParams.like || false
                }
            }

            this.validate = function () {
                return field.value != "" && field.isValid();
            }

            this.init = function (fieldParams, filter) {
                if (arguments.length == 0) {
                    this.filter = null;
                    return;
                } else {
                    this.fieldParams = fieldParams;
                }
                this.fieldParams = fieldParams;
                field.regexp = (fieldParams.regexp) ? fieldParams.regexp[0] : '.*';

                if (filter) {
                    field.set("value", filter.value);
                    this.filter = filter;
                } else {
                    this.reset();
                    this.filter = null;
                }
            }

            this.reset = function () {
                field.reset();
            }
            return this;
        },

        RangeFilter : function  (parent) {

            var fieldFrom = new dijit.form.ValidationTextBox({
                trim : true,
                placeHolder : parent.locale.INPUT_PLACEHOLDER
            })

            var fieldTo = new dijit.form.ValidationTextBox({
                trim : true,
                placeHolder : parent.locale.INPUT_PLACEHOLDER
            })

            this.domNode = dojo.create("div");

            var dl = dojo.create("dl", {}, this.domNode, "first");

            dojo.create("dt", {
                innerHTML : parent.locale.RANGE_MIN_FIELD
            }, dl, "last");

            var dd = dojo.create("dd");
            dojo.place(fieldFrom.domNode, dd);
            dojo.place(dd, dl, "last");

            dojo.create("dt", {
                innerHTML : parent.locale.RANGE_MAX_FIELD
            }, dl, "last");

            dd = dojo.create("dd");
            dojo.place(fieldTo.domNode, dd);
            dojo.place(dd, dl, "last");


            this.createFilter = function () {
                return  {
                    id : (this.filter) ? this.filter.id : null,
                    field : this.fieldParams.field,
                    fieldType : this.fieldParams.fieldType,
                    name : this.fieldParams.name,
                    min : fieldFrom.value,
                    max : fieldTo.value
                };
            }

            this.validate = function () {
                var fromIsValid = fieldFrom.value != "" && fieldFrom.isValid();
                var toIsValid = fieldTo.value != "" && fieldTo.isValid()
                return (fromIsValid && toIsValid) || (fieldFrom.value == "" && toIsValid) || (fromIsValid && fieldTo.value == "")

            }

            this.init = function (fieldParams, filter) {
                if (arguments.length == 0) {
                    this.filter = null;
                    this.reset();
                } else {
                    this.fieldParams = fieldParams;
                }
                this.fieldParams = fieldParams;

                fieldFrom.regExp = (fieldParams.regexp) ? fieldParams.regexp[0] : '.*';
                fieldTo.regExp = fieldFrom.regExp

                fieldFrom.invalidMessage  = (fieldParams.invalidMessage) ? fieldParams.invalidMessage[0] : fieldFrom.invalidMessage;
                fieldTo.invalidMessage = fieldFrom.invalidMessage;

                if (filter) {
                    fieldFrom.set("value", filter.min);
                    fieldTo.set("value", filter.max);
                    this.filter = filter;
                } else {
                    this.reset();
                    this.filter = null;
                }
            }

            this.reset = function () {
                fieldFrom.reset();
                fieldTo.reset();
            }

            return this;
        },

        DateFilter : function  (parent) {
            this.domNode = dojo.create("div");

            var fieldFrom = new dijit.form.DateTextBox({
                trim : true,
                value : new Date()
            })

            var fieldTo = new dijit.form.DateTextBox({
                trim : true,
                value : new Date()
            })

            var dl = dojo.create("dl", {}, this.domNode, "first");

            dojo.create("dt", {
                innerHTML : parent.locale.RANGE_MIN_FIELD
            }, dl, "last");

            var dd = dojo.create("dd");
            dojo.place(fieldFrom.domNode, dd);
            dojo.place(dd, dl, "last");

            dojo.create("dt", {
                innerHTML : parent.locale.RANGE_MAX_FIELD
            }, dl, "last");

            dd = dojo.create("dd");
            dojo.place(fieldTo.domNode, dd);
            dojo.place(dd, dl, "last");


            this.createFilter = function () {
                var min = null;

                if (fieldFrom.value) {
                    fieldFrom.value.setHours(0);
                    fieldFrom.value.setMinutes(0);
                    fieldFrom.value.setSeconds(0);
                    fieldFrom.value.setMilliseconds(0);
                    min = dojo.date.stamp.toISOString(fieldFrom.value, {
                        milliseconds : true
                    }).replace(/\+\d\d:\d\d$/, "");
                }

                var max = null;
                if (fieldTo.value) {
                    fieldTo.value.setHours(23);
                    fieldTo.value.setMinutes(59);
                    fieldTo.value.setSeconds(59);
                    fieldTo.value.setMilliseconds(999);
                    max = dojo.date.stamp.toISOString(fieldTo.value, {
                        milliseconds : true
                    }).replace(/\+\d\d:\d\d$/, "");
                    ;
                }

                return {
                    id : (this.filter) ? this.filter.id : null,
                    field : this.fieldParams.field,
                    fieldType : this.fieldParams.fieldType,
                    name : this.fieldParams.name,
                    min : min,
                    max : max
                }


            }

            this.validate = function () {
                return fieldFrom.value != null || fieldTo.value != null;
            }

            this.init = function (fieldParams, filter) {
                if (arguments.length == 0) {
                    this.filter = null;
                    return;
                } else {
                    this.fieldParams = fieldParams;
                }
                this.fieldParams = fieldParams;
                fieldFrom.regexp = fieldParams.regexp || fieldFrom.regexp;
                fieldTo.regexp = fieldParams.regexp || fieldTo.regexp;

                if (filter) {
                    fieldFrom.set("value", filter.min);
                    fieldTo.set("value", filter.max);
                    this.filter = filter;
                } else {
                    this.reset();
                    this.filter = null;
                }
            }

            this.reset = function () {
                fieldFrom.reset();
                fieldTo.reset();
            }
            return this;
        },

        EnumFilter : function  (parent) {

            var self = this;

            var checkboxs = new Array();
            this.domNode = dojo.create("div");


            this.createFilter = function () {
                var checkedCheckboxs = dojo.filter(checkboxs, function(item, index) {
                    return item.checked;
                })
                if (checkedCheckboxs && checkedCheckboxs.length > 0) {

                    var values = new Array();
                    var names = new Array();
                    for (var i = 0; i < checkedCheckboxs.length; i++) {
                        if (checkedCheckboxs[i].checked) {
                            values.push(checkedCheckboxs[i].value);
                            names.push(checkedCheckboxs[i].text);
                        }
                    }


                    return {
                        id : (this.filter) ? this.filter.id : null,
                        field : this.fieldParams.field,
                        name : this.fieldParams.name,
                        fieldType : this.fieldParams.fieldType,
                        values : values,
                        names : names,
                        isExclude : false
                    };
                }
            }

            this.validate = function () {
                return true;
            }

            this.init = function (fieldParams, filter) {
                if (arguments.length == 0) {
                    this.filter = null;
                    this.reset();
                } else {
                    this.fieldParams = fieldParams;
                }

                checkboxs = new Array();
                dojo.query(" > * ", this.domNode).orphan();

                var _enum = [];
                if (fieldParams._enum && fieldParams._enum instanceof Array) {
                    _enum = fieldParams._enum[0]._value;
                } else if (fieldParams._enum) {
                    _enum = fieldParams._enum._value;
                }

                for (var i = 0; i < _enum.length; i++) {

                    var checkBox = new dijit.form.CheckBox({
                        name: "checkBox" + i,
                        value: _enum[i].id,
                        text : _enum[i].value,
                        checked: (filter) ? dojo.some(filter.values, function (item, index) {
                            return _enum[i].id == item
                        }) : false
                    });
                    checkboxs.push(checkBox);
                    dojo.place(checkBox.domNode, this.domNode);

                    dojo.create("label", {
                        "for" : checkBox.id,
                        innerHTML : _enum[i].value + "<br/>"
                    }, this.domNode, "last");
                }

                if (filter) {
                    this.filter = filter;
                } else {
                    this.filter = null;
                }
            }

            this.reset = function (event) {
                for (var i = 0; i < checkboxs.length; i++) {
                    if (event) {
                        checkboxs[i].set("checked", false)
                    } else {
                        checkboxs[i].destroy();
                    }
                }
            }
            return this;
        }
    })
}

