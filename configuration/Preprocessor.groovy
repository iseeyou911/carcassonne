import java.text.ParseException;

if (project.properties['project.confPath'] == null || project.properties['project.sourceDir'] == null){
	throw new RuntimeException ("project.confPath or project.sourceDir not found");
}

class Global {
	static vars = [:]
 }
Global.vars.closePattern = null;
Global.vars.state = null;

def path1 = project.properties['project.confPath']
def checkNextLine = null;
def replaceTo = null;
def configFile = [:]
Global.vars.closePattern = null;
Global.vars.state = null;


new File(path1).readLines().each{
	def pair = it =~ /^([^:]*):(.*)$/;
	if (pair.matches()) {
		configFile.put(pair[0][1].trim(), pair[0][2].trim());
	}
};

println configFile;

def checkCondition;
checkCondition = {condition ->
	def pair = condition =~ /^([^=]*)=(.*)$/;
	if (pair.matches()) {
		def key = pair[0][1].trim();
		def value = pair[0][2].trim();
		return configFile.get(key) != null && configFile.get(key) == value;
	}
	return configFile.get(condition) != null;
}

/*
* Replace command
*/
def replace;
replace  =  { line, patternO, ml ->
   matcher = (line =~ patternO);
   def result;
   if(matcher.find()) {
	   def strPattern = matcher[0][2];
	   def strReplace = matcher[0][1];
	   def condition = matcher[0][3];
	   def oldText = matcher[0][4];
	   if (condition != null && !checkCondition(condition)){
		   return null;
	   }
	   if (strReplace != null ) {
		   def str = (strReplace.trim().replaceAll(/\$\{([^}]*)\}/, {full, word ->
			   def pair = word =~ /^([^:]*):(.*)$/;
			   if (pair.matches()) {
				   word = pair[0][1]
			   }

			   def tmp = configFile.get(word);
			   if (tmp == null ){
				   println project.properties[word]
				   tmp = project.properties[word];
			   }

			   if (tmp != null) {
				   if (pair.matches() && pair[0][2] == "removeQuotes") {
					   tmp.replaceAll(/^['"](.*)['"]$/, '$1')
				   } else if (pair.matches()) {
				   throw new RuntimeException("Can't find command ${pair[0][2]}")
				   } else {
					   tmp
				   }
			   } else {
				   throw new RuntimeException("Can't find placeholder ${full}")
			   }
		   }))

		   result = matcher.replaceAll (str).trim()
	   } else {
		   result = matcher.replaceAll (oldText).trim()
	   }

	   if (ml){
		   Global.vars.state = "REPLACE_START";
	   }

	   if (strPattern != null || ml) {
		   return [strPattern, result]
	   } else {
		   return result;
	   }
   }
}

/*
* Replace command
*/
def insert;

insert = { line, patternO, ml ->
   matcher = (line =~ patternO);

   if(matcher.find()) {
	   def condition = matcher[0][1];
	   if (condition == null || checkCondition(condition)){
		   if (ml){
			   Global.vars.state = "INSERT_START";
		   }
		   return "";
	   }
   }
}

 def patterns = [

 	js : [
 			replace : [
 				calll : replace,
 				single : ~/\/\*\s*replace\s*to\s*=\s*\^([^\^]*)\^\s*(?:pattern\s*=\s*\^([^\^]*)\^\s*)?(?:if\s*=\s*\^([^\^]*)\^\s*)?\*\/(?:(.*)(?=\/\*\/\s*replace\s*\*\/)\/\*\/\s*replace\s*\*\/)/,
 				open : ~/\/\*\s*replace\s*to\s*=\s*\^([^\^]*)\^\s*(?:pattern\s*=\s*\^([^\^]*)\^\s*)?(?:if\s*=\s*\^([^\^]*)\^\s*)?\s*\*\/\s*/,
 				close : ~/\s*\/replace\s*\*\/\s*/
 			],
 			insert : [
 				calll : insert,
 				open : ~/\/\*\s*insert\s*(?:if\s*=\s*\^([^\^]*)\^\s*)?\s*/,
 				close : ~/\s*\/insert\s*\*\/\s*/
 			]
 		],

 	html : [
 			replace : [
 				calll : replace,
 				open : ~/<!--\s*replace\s*to\s*=\s*\^([^\^]*)\^\s*(?:pattern\s*=\s*\^([^\^]*)\^\s*)?(?:if\s*=\s*\^([^\^]*)\^\s*)?-->/,
 				close : ~/<!--\s*\/replace\s*-->/
 			],
 			insert : [
 				calll : insert,
 				open : ~/<!--\s*insert\s*(?:if\s*=\s*\^([^\^]*)\^\s*)?\s*/,
 				close : ~/\s*\/insert\s*-->\s*/
 			]
 		]

 ]


def editClos = null;
editClos = {
//println "Dir ${it.canonicalPath}";
	def matcher = it.canonicalPath =~ /.*\\(.*)$/
	def stringWasReplaced = false;

		if (matcher.find() && matcher[0][1] != "vendors")
		{
			it.eachDir ( editClos );
			it.eachFileMatch(~/.*\.(?:html|js|json)/) {
			f ->
				//println "Reading file ${f.path}"
				def editedLines = 0;
				def lines = f.readLines();
				def newFile = [];
				for (line in lines) {
					def ext = (f.path =~ /\.([^.]*)$/);
					def result = null;

					if (Global.vars.state == null){
						def cPatterns = patterns[ext[0][1]];
						if (cPatterns != null) {

							Global.vars.closePattern = null;
							cPatterns.each{
								if (it.value['single'] != null){
									result = it.value['calll'] (line, it.value['single'], false);
								}

								if (result == null && it.value['open'] != null){
									result = it.value['calll'] (line, it.value['open'], true);
									Global.vars.closePattern = it.value['close'];
								}
							}
						}

						if (result instanceof ArrayList) {
							checkNextLine = result[0];
							replaceTo = result[1];
							result = "";
						}
					} else {

						if (Global.vars.state != null && checkEnd(line, Global.vars.closePattern)) {
							Global.vars.state = null;
							checkNextLine = null;
							stringWasReplaced = false;
							line = "";
						} else {
							if (Global.vars.state == "REPLACE_START") {
								if(checkNextLine != null) {
									result = line.replace(checkNextLine, replaceTo);
								} else if (!stringWasReplaced){
									result = replaceTo;
									stringWasReplaced = true;
								} else {
								    result = "";
								}

								println result;
							}

							if (Global.vars.state == "INSERT_START" && result == null) {
								result = line;
								println result;
							}
						}
					}

					if (result != null) {
						editedLines++;
						newFile << result;
					} else {
						newFile << line;
					}
				}
				if (editedLines > 0) {
					f.write(newFile.join("\n"), "UTF-8")
				}
			}
		}
	}


def checkEnd (line, patternC) {
	matcher = (line =~ patternC);
	if(matcher.find()) {
		def strInsert = matcher[0][1];

		if (strInsert != null) {
			return true;
		}
	}
	return false;
}

// Apply closure
editClos( new File(project.properties['project.sourceDir']) )

