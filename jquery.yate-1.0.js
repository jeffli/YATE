/*
YATE:  yet another template engine 
authors:  Jeff  Li,  Raghuram Kanadams
license:  New BSD License ( 3-clause license )
 
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
      
      var tpl = unescape($node.html()).replace(/[\r\t\n]/g, " ")
      			.replace(/<y:t\s*remove(.*?)>(.*?)<\/y:t>/g, " ")
      			.replace(/<tr(.*?)y:t_remove(.*?)>(.*?)<\/tr\s*>/g, " ")
      			.replace(/<tbody(.*?)y:t_remove(.*?)>(.*?)<\/tbody\s*>/g, " ")
      			.replace(/<td(.*?)y:t_remove(.*?)>(.*?)<\/td\s*>/g, " ")  ;
      
      var re = new RegExp ('[<|{]y:t\s*(.*?)(="")?[>|}](.*?)[<|{]\/y:t[>|}]');
      var matches = re.exec (tpl);
      while (matches && matches.length > 1) {
      	var property = $.trim (matches[1]);
      	var replacement;
      	
      	if (typeof (options[property]) === 'function') {
       		replacement = "'); p.push( (options['" + property + "'])({'data': data,'index':i,'node': '"+matches[3]+"'}));"
      	}else {
       		replacement = "'); p.push(d." + property + " === undefined? "
       					+" function(){ throw ' template/data mismatch! can NOT find \"" + property + "\" in the data.' }() : d."+property+" );"
      	}
      	tpl = tpl.replace (re, replacement + " p.push('" );
      	matches = re.exec (tpl);
      } 
         
      fnBody += (tpl + "'); };   return p.join(''); ");
      
      // create the function that does the template data binding
      _cache[selectorId] = fn = new Function(["data", "options"], fnBody);
    }
    
    // print out template binding function in firebug
    //console.info(fn.toSource());
    var html = fn(data, options);
    if(returnHtml)  return html;
    
	$node.html(html).show();
	return $node;
 };
 
})(jQuery);
