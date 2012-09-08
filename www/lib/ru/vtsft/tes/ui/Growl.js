if(!dojo._hasResource["ru.vtsft.tes.ui.Growl"]){
// Register this class autoloading
dojo.provide("ru.vtsft.tes.ui.Growl");

// Include dependencies
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

// Create class declaration extending templating system
dojo.declare('ru.vtsft.tes.ui.Growl', [dijit._Widget, dijit._Templated], {

    // Convention defining HTML template resource
    templateString: '<div class="GrowlUi ${errorClass}" ><table width="500px" height="20px" cellspacing="0" cellpadding="0"><tr width="100%" height="100%" valign="middle" align="left"><td width="480px"><span class="CloseButton" dojoAttachEvent="onclick:close">×</span><p>${message}</p></td></tr></table></div>',

    // Custom template variable
    message: null,

    // Length of duration in milliseconds
    timeout: 4000,

    // Private DOM object to wrap all notifications
    _container: null,

    // Timer that we'll reset if the user interacts with the notification
    _timer: null,

    // Pin notification container to top-right of window.
    // These aren't in CSS as the _container object is internal as well.
    containerStyles: {
        'position': 'fixed',
        'top': 0,
        'right': 0,
        'zIndex': 1000,
        'cursor': 'pointer'
    },

    // Before Dojo begins templatizing the HTML, we setup the container
    constructor: function(params) {
        // Combine passed parameters with default params before creating template
        dojo.mixin(this, params);
        if (this.type == "error") {
        	this.errorClass = "error"
        } else if (this.type == "success") {
        	this.errorClass = "success"
        } else {
            this.errorClass = "info"
        }
        this.createWrapper();
    },

    // If container is not already setup, we create one and add it to the DOM.
    createWrapper: function() {
        if (dojo.byId('demoUiErrorContainer')) {
            this.container = dojo.byId('demoUiErrorContainer');
        } else {
            this.container = dojo.doc.createElement('div');
            
            dojo.attr(this.container, 'id', 'demoUiErrorContainer');
            dojo.style(this.container, this.containerStyles);
            
            dojo.place(this.container, dojo.body());
        }
    },

    // 'postCreate' is called after Dojo instantiates the template as 'domNode'. We're
    // responsible for inserting it into the DOM.
    postCreate: function() {
        // Fade in the notification nicely
        dojo.style(this.domNode, 'opacity', 0);
        
        dojo.place(this.domNode, this.container);
        
        dojo.anim(this.domNode, { opacity: 1 }, 250);
        
        this.setTimeout();
    },

    // Call 'close' method after specified amount of time
    setTimeout: function() {
        this.timer = setTimeout(dojo.hitch(this, 'close'), this.timeout);
    },

    // "hover" template hook to stop the timer and allow styling
    _hoverOver: function() {
        clearInterval(this.timer);
        
        dojo.addClass(this.domNode, 'hover');
    },

    // "hover out" template hook to start the timer and remove "hover" styling
    _hoverOut: function() {
        this.setTimeout();
        
        dojo.removeClass(this.domNode, 'hover');
    },

    // Public "close" function for fading out node before removing it from DOM
    close: function() {
        dojo.anim(this.domNode,
                  { opacity: 0 },
                  500,
                  null,
                  dojo.hitch(this, 'remove'));
    },

    // Public "remove" function to shrink the notification prior to removing from
    // DOM. This exists primarily for when multiple notifications are stacked
    remove: function() {
        dojo.anim(this.domNode,
                  { height: 0, margin: 0 },
                  250,
                  null,
                  dojo.partial(dojo.destroy, this.domNode));
    }

})
}