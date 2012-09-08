//This profile is used just to illustrate the layout of a layered build.
//All layers have an implicit dependency on dojo.js.

//Normally you should not specify a layer object for dojo.js. It is normally
//implicitly built containing the dojo "base" functionality (dojo._base).
//However, if you prefer the Dojo 0.4.x build behavior, you can specify a
//"dojo.js" layer to get that behavior. It is shown below, but the normal
//0.9 approach is to *not* specify it.

//

dependencies = {
	expandProvide: true,
	stripConsole : 'normal',
	  action : 'clean,release',
	  optimize : 'shrinksafe',
	  releaseName : 'release',
	  localeList : 'ru',
	  releaseDir :'../../../../vendors/',
		mini:true,
	layers: [
		
		{
			//For 0.9 you normally do not specify a dojo.js layer.
			//Note that you do not need to specify dojo.js as a dependency for
			//other layers -- it is always an implicit dependency.
			name: "dojo-mini.js",
			dependencies: [
								
				"dojo.parser",
				"dojo.string",
				"dojo.cookie",
				"dojo.cache",
				"dojo.DeferredList",
				"dojo.fx",
				"dojo.html",
				"dojo.hash",
				"dojo.number",
				"dojo.window",
				"dojo.AdapterRegistry",
				"dojo.Stateful",
				"dojo.regexp",
				"dojo.i18n",
				
				"dojo.io.iframe",
				"dojo.io.script",
				
				"dojo.data.ItemFileWriteStore",
				"dojo.data.ItemFileReadStore",
				
				"dojo.rpc.JsonpService",
				"dojo.rpc.JsonService",
				"dojo.rpc.RpcService",
				
				"dojo.dnd.Avatar",
				"dojo.dnd.Manager",
				"dojo.dnd.Selector",
				"dojo.dnd.Source",
				
				"data.util.filter",
				"data.util.simpleFetch",
				"data.util.sorter",
				
				"dojo.fx.Toggler"
			]
		},
		
		{
			name: "../dijit/dijit-mini.js",
			layerDependencies: [
				"dojo.js"
			],
			dependencies: [
				"dijit.dijit",
				"dijit.dijit-all"
			]
		},
		{
			name: "../dojox/dojox-mini.js",
			layerDependencies: [
				"dojo.js",
				"../dijit/dijit-mini.js"
			],
			dependencies: [
				"dojox.fx._base",
				
				"dojox.data.JsonRestStore",
				"dojox.data.ServiceStore",
				
				"dojox.html.metrics",
				
				"dojox.io.httpParse",
				"dojox.io.windowName",
				"dojox.io.xhrPlugins",
				"dojox.io.xhrWindowNamePlugin",
				
				"dojox.json.ref",
				
				"dojox.rpc.JsonRest",
				"dojox.rpc.Rest",
				
				"dojox.secure.capability"
			]
		},
		{
			name: "../dojox/grid/DataGrid.js",
			layerDependencies: [
				"dojo.js",
				"../dijit/dijit-mini.js",
				"../dojox/dojox-mini.js"
			],
			dependencies: [
				"dojox.grid.DataGrid",
				
			]
		}
	],

	prefixes: [
		["dojox", "../dojox"]
	]
}

//If you choose to optimize the JS files in a prefix directory (via the optimize= build parameter),
//you can choose to have a custom copyright text prepended to the optimized file. To do this, specify
//the path to a file tha contains the copyright info as the third array item in the prefixes array. For
//instance:
//	prefixes: [
//		[ "mycompany", "/path/to/mycompany", "/path/to/mycompany/copyright.txt"]
//	]
//
//	If no copyright is specified in this optimize case, then by default, the dojo copyright will be used.
