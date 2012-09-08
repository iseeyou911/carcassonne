if(!dojo._hasResource["ru.vtsft.tes.ui.DynComboBox"]){
// Register this class autoloading
dojo.provide("ru.vtsft.tes.ui.DynComboBox");

// Include dependencies
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

// Create class declaration extending templating system
dojo.declare('ru.vtsft.tes.ui.DynComboBox', [dijit._Widget, dijit._Templated], {
    widgetsInTemplate : true,
    // Convention defining HTML template resource
    templateString: '<div class="" ><div data-dojo-type="dijit.form.Button" data-dojo-attach-point="addButton"><span>Добавить</span></div><ul data-dojo-attach-point="comboBox" class="DynComboBoxItemHolder"></ul></div>',

    rowTemplate : [/*{type : 'TextBox', name : 'HER'}*/],

    items : {},

    // Before Dojo begins templatizing the HTML, we setup the container
    constructor: function(params) {

        // Combine passed parameters with default params before creating template
        dojo.mixin(this, params);

        for (var i in this.rowTemplate){
            this.items[this.rowTemplate[i].name] = {};
        }
    },

    // 'postCreate' is called after Dojo instantiates the template as 'domNode'. We're
    // responsible for inserting it into the DOM.
    postCreate: function() {
        var self = this;
        
        dojo.connect(this.addButton, "onClick", function(){
            self._addNewRow();
        })
    },

    _addNewRow : function (){
        var li = $.create("li",{

        }, this.comboBox);

        for (var i in this.rowTemplate){

            var item = new dijit.form[this.rowTemplate[i].type]({
                value: this.rowTemplate[i].value || '',
                style: this.rowTemplate[i].style || {}
            });
            this.items[this.rowTemplate[i].name] = item;

            dojo.place(item.domNode, li);
        }


    }

})
}