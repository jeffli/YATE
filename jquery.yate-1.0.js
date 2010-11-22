/*
YATE:  yet another template engine 
authors:  Jeff  Li,  Raghuram Kanadams
license:  New BSD License ( 3-clause license )
version:  1.02
 
Copyright (c) 2010, Mu Dynamics Lab
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the "Mu Dynamics Inc", "Mu Dynamics Lab" nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL "MU DYNAMICS LAB" BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

(function($) {
  var _cache = {};
  
  $.yate = function(obj){
  	if(!obj) return false;
  	
	var selectorId = obj.template_selector;
	var data = obj.data;
	var options = obj.options;
	var returnHtml = obj.returnHtml;
	var debug = obj.debug;
	//console.info(debug);
	
  	var $node = $(selectorId) ;
  	// selector finds nothing, return
   	if ( !$node ) return false;
	if(!data || !data.length){
	 	$node.hide();
	 	return false;	 	
	}
   	typeof options != 'object' ? options = {}: '';
   	
  	// use selector as key to load from cache
    var fn = _cache[selectorId];
    
    // can't find such a template function, build it.
    if(!fn){
   	
   	  var fnBody = "var p=[]; (typeof data.length != 'number') ?  data=[data]: '' ;  "
      	+"for(var i=0;i<data.length;i++){"
      	+"var d=data[i]; "
      	+"p.push('";
      
      var tpl = unescape($node.html()).replace(/[\r\t\n]/gi, " ")
      			.replace(/<y:t\s*remove(.*?)>(.*?)<\/y:t>/gi, " ")
      			.replace(/<table([^>]*?)y:t_remove(.*?)>(.*?)<\/tbody\s*>/gi, " ")
      			.replace(/<thead([^>]*?)y:t_remove(.*?)>(.*?)<\/tbody\s*>/gi, " ")
      			.replace(/<tbody([^>]*?)y:t_remove(.*?)>(.*?)<\/tbody\s*>/gi, " ")
      			.replace(/<tr([^>]*?)y:t_remove(.*?)>(.*?)<\/tr\s*>/gi, " ")
      			.replace(/<td([^>]*?)y:t_remove(.*?)>(.*?)<\/td\s*>/gi, " ")  ;
      
      var rewindPoint = [];
      var re = new RegExp ('[<|{]y:t\s*(.*?)(="")?[>|}](.*?)([<|{]\/y:t[>|}]|[<|{]y:t)', "gi");
      var propertyAttributeRegex = /property\s*=\s*[\'\\\"](.*)[\'\\\"]/gi; //This is for identifying <y:t property="myProperty"> Syntax
      var matches = re.exec (tpl);
      while (matches && matches.length > 1) {
      	
      	if(matches[4].indexOf("/y:t") > -1 || matches[4].indexOf("/Y:T") > -1){
	      	var property = $.trim (matches[1]);
	      	var propertyAttributeMatches = propertyAttributeRegex.exec (property);
	      	if (propertyAttributeMatches && propertyAttributeMatches.length > 1) {
	      		property = 	propertyAttributeMatches[1];
	      	}
	      	propertyAttributeRegex.lastIndex = 0;
	      	var replacement;
 
	      	if (typeof (options[property]) === 'function') {
	       		replacement = "'); p.push( (options['" + property + "'])({'data': data,'index':i,'node': '"
	       					+matches[3].replace(/\); p\.push\(/g,'+')  // need to get rid of p.push in case it's a nested tag
	       					+" '}));"
	      	}else {
	       		replacement = "'); p.push( (d['" + property + "'] === undefined && debug ? "
	       					+" function(){ throw ' template/data mismatch! can NOT find \"" + property + "\" in the data.' }() : d['"+property+"']) );"
	      	}
	      	tpl = tpl.replace (matches[0], replacement + " p.push('" );
 
	      	if(rewindPoint.length > 0){
	      		re.lastIndex = rewindPoint.pop();
	      	}
      	}
      	// there is a nest tag
      	else{
      		re.lastIndex -=  4;
      		rewindPoint.push(matches.index);
      	}
      	matches = re.exec (tpl);
      } 
         
      fnBody += (tpl + "'); };   return p.join(''); ");
      
      // create the function that does the template data binding
      _cache[selectorId] = fn = new Function(["data", "options", "debug"], fnBody);
    }
    
    // print out template binding function in firebug
    if(debug) console.info($.browser.mozilla? fn.toSource() : fn);
    var html = fn(data, options, debug);
    if(returnHtml)  return html;
    
	$node.html(html).show();
	return $node;
 };
 
})(jQuery);
