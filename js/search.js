/*
*******************************************************************************
*********************************** SEARCH ************************************
*******************************************************************************
*/
org.oecd.exalead.Search = function(config, templates) {
	$.extend(true, this, new LOG('error'));

	$(document).ajaxStart($.proxy(function() { this.alert('info', this.messages[this.language].info, 'no'); }, this));
	$(document).ajaxStop( function() { $('.alert.no').remove(); } );

	this.term = null;
	this.page = 0;

	this.sort = 'desc(document_lastmodifieddate)';

	this.pagingSize = 9;

	this.facets = [];
	this.refinements = {};

	$.extend(true, this, org.oecd.exalead.defaultconfig);
	if ( typeof config !== 'undefined' ) {
		$.extend(true, this, config);
	}

	this.templates = templates;
	this._drawUI();

	this._initHistory();
}

org.oecd.exalead.Search.version = '1.0';

org.oecd.exalead.Search.prototype._initHistory = function() {
	var History = window.History; 
    if ( !History.enabled ) {
        return false;
    }

    $(window).bind('statechange', $.proxy( this._onStateChange, this ) );

    this._applyStateFromURL();
}

org.oecd.exalead.Search.prototype._applyStateFromURL = function() {
	this.debug('_applyStateFromURL');

	var request = new org.oecd.exalead.Request();
		
	var q = request.get('q'); this.trace(q);
	if ( q ) {
		this.term = q;
		$(this.searchField).val(q.replace(/\+/g, ' '));
	} else {
		this.term = null;
		$(this.searchField).val('');
	}

	var sl = request.get('sl');
	if ( sl ) this.logic = sl;

	var hf = request.get('hf');
	if ( hf ) {
		this.hit.perPage = hf;
		var pp = $(this.templates.tools.paging.selector + '[id="' + this.hit.perPage + '"]');
		pp.addClass('active');
		pp.siblings().removeClass('active');
	}

	var b = request.get('b');
	if ( b ) this.page = b / this.hit.perPage;

	var s = request.get('s');
	if ( s ) {
		this.sort = s;
		var ss = $(this.templates.tools.sorting.selector + '[id="' + this.sort + '"]');
		ss.addClass('active');
		ss.siblings().removeClass('active');
	}

	var r = request.get('r');
	this.refinements = {};
	if ( r ) {
		if ( $.isArray(r) ) {
			$.each(r, $.proxy(function(idx, refinement) {
				this.refinements[refinement.substring(1).replace(/\+/g, ' ')] = refinement.charAt(0);
			}, this) );
		} else {
			this.refinements[r.substring(1).replace(/\+/g, ' ')] = r.charAt(0);
		}
	}
}

org.oecd.exalead.Search.prototype._onStateChange = function() {
	this.debug('_onStateChange');

	this._applyStateFromURL();
	
	this.trace('callback?', this.callback);

	$.get(this.endpoint, $.param(this._stateToSearchParams(), true))
			.then( $.proxy( this.callback, this ) )
			.done( $.proxy( function() { this.alert('success', this.messages[this.language].success); }, this ) )
			.fail( $.proxy( function() { this.error(arguments); this.alert('error', this.messages[this.language].error); }, this ) );
}

org.oecd.exalead.Search.prototype._drawUI = function() {
	// Draw
	var sorting = Mustache.compilePartial('sorting', this.templates.tools.sorting.tpl);
	var paging = Mustache.compilePartial('paging', this.templates.tools.paging.tpl);
	var tools = Mustache.compile(this.templates.tools.tpl);

	var toolsObj = {
		sorting: {
			title: this.messages[this.language].sorting.title,
			items: [
			]
		},
		paging: {
			title: this.messages[this.language].paging.title,
			items: [
			]
		}
	}

	$.each(this.sorting, $.proxy(function(idx, item) {
		var uiItem = {name: this.messages[this.language].sorting[item.name], value: item.value, active: item.value==this.sort?'active':''};
		toolsObj.sorting.items.push(uiItem);
	}, this));

	$.each(this.paging, $.proxy(function(idx, item) {
		var uiItem = {name: item.name, value: item.value, active: item.value==this.hit.perPage?'active':''};
		toolsObj.paging.items.push(uiItem);	
	}, this));

	$('#' + this.toolsContainer).append(tools(toolsObj));

	// Bind events
	$('#' + this.toolsContainer + ' ' + this.templates.tools.paging.selector).click($.proxy(function(event) { 
		var li = $(event.delegateTarget);
		var perPage = $(li).attr('id');
		
		$(li).addClass('active');
		$(li).siblings().removeClass('active');

		this.hit.perPage = perPage;
		this.run();
	}, this));

	$('#' + this.toolsContainer + ' ' + this.templates.tools.sorting.selector).click($.proxy(function(event) { 
		var li = $(event.delegateTarget);
		var sort = $(li).attr('id');
		
		$(li).addClass('active');
		$(li).siblings().removeClass('active');

		this.sort = sort;
		this.run();
	}, this));
}

org.oecd.exalead.Search.prototype.drawResults = function(xml) {
	$xml = $( xml );

	$('#' + this.container).empty();
	$('#' + this.nbHitsContainer).empty();

	this.nbHits = $xml.find('Answer').attr('nhits'); 
	$('#' + this.nbHitsContainer).append( $('<span></span>', {'class': 'badge badge-success'}).append(this.nbHits + ' ' + this.messages[this.language].results) );

	$xml.find('Hit').each($.proxy(function(idx, hit) {
		var hitObj = {};


		var realIdx = (this.page * this.hit.perPage) + idx + 1;
		hitObj['id'] = 'hit_' + realIdx;

		if ( this.hit.numbered ) {
			hitObj['idx'] = realIdx + '. ';
		}

		// METAs
		$(this.hit.metas).each($.proxy(function(idx, meta) {
			$(hit).find('Meta[name="'+meta.name+'"]').each($.proxy(
				function(index, element) {
					hitObj[meta.name] = new org.oecd.exalead.Meta(element, meta.type, meta.format).toHTML();
				}, this));
		}, this));

		// FACETs
		if ( this.hit.facets.length ) {
			// Draw
			hitObj['facets'] = {items: []};
			$(this.hit.facets).each($.proxy(function(idx, facet) {
				$(hit).find('AnswerGroup[id="'+facet.id+'"]').each($.proxy(function(index, element) {

					var $element = $(element);
					$element.find('Categories>Category').each($.proxy(function(idx, el) { 
									
						var r =  $(el).attr('id');
						var title = $(el).attr('title');
						if (facet.resource)
							title = this.messages[this.language][facet.resource][$(el).attr('title')];

						hitObj['facets'].items.push({id: r, name: facet[this.language], value: title});
						
					}, this));

				}, this));
			}, this));

			// Bind events
			$('#' + this.container).find(this.hit.facetSelector).click($.proxy(function(event) {
				var li = $(event.delegateTarget).parent();
				var r = li.attr('id');
				if ( !this.refinements[r] || this.refinements[r] != '+' ) {
					this.refinements[r]='+';
				}
				this.run();
			}, this));

		}
		$('#' + this.container).append(this.hit.tpl(hitObj));

	}, this));

}

org.oecd.exalead.Search.prototype._calculatePagination = function(p, M) {
	var pages = [];

	var out = '';
	var N = this.pagingSize;
	var P = Math.floor( (N+2)/2 ) + 1;
	var s = (p==1?' active':'');

	pages.push({idx:1, active:s});

	var min = 2;
	var max = N-min;

	if ( p >= P ) {
		max = p + Math.floor(N/2) - 1;
		if ( max < M ) { 
			min = p - Math.floor(N/2) + 1;
		} else { 
			min = (M>N?M-N+2:2);
			max = M-1;
		}
		pages.push({idx:'...', active: ' disabled'});
	}

	if ( M-1 < max ) {
		max = M-1;
	}

	for (var i=min; i<=max; i++) {
		if ( i == p ) s = ' active'
		else s = '';

		pages.push({idx:i, active:s});
	}

	if ( M > N && max < M-1 ) {
		pages.push({idx:'...', active: ' disabled'});
	}

	if ( M > 1 ) {
		s = (p==M?' active':'');
		pages.push({idx:M, active:s});
	}

	return pages;
}


org.oecd.exalead.Search.prototype.drawPagination = function() {
	// Draw
	$('#' + this.pagingContainer).empty();

	if ( this.nbHits == 0 ) return;

	var ul = $('<ul></ul>');

	// Previous
	ul.append(this.pagination.previous.tpl({disabled: (this.page == 0?' disabled':'')}));
	
	// Page
	var M = Math.floor(this.nbHits / this.hit.perPage);
	if ( this.nbHits % this.hit.perPage > 0 ) M++;

	var p = this.page+1;
	$.each(this._calculatePagination(p, M ), $.proxy(function(idx, page) {
		ul.append(this.pagination.page.tpl(page));
	}, this));

	// Next
	ul.append(this.pagination.next.tpl({disabled: ( this.page == Math.floor(this.nbHits / this.hit.perPage)?' disabled':'')}));
	
	$('#' + this.pagingContainer).append( ul );

	// Bind events 
	$('#' + this.pagingContainer + ' ' + this.pagination.page.selector).each($.proxy(function(i, item) { 
		$(item).click($.proxy(function(event) {
			var li = $(event.delegateTarget);

			var active 	 =  li.hasClass('active');
			var disabled =  li.hasClass('disabled');
			if ( active || disabled )
				return;
			
			var idx = li.attr('id').split('_')[1];

			this.page = new Number(idx)-1;
			this.runPage();
		}, this));
	}, this));

	// Previous
	$('#' + this.pagingContainer + ' ' + this.pagination.previous.selector).click($.proxy(function(event) {
		var disabled =  $(event.delegateTarget).hasClass('disabled');
		if ( disabled )
			return;
		this.page = this.page - 1;
		this.runPage();
	}, this));

	// Next
	$('#' + this.pagingContainer + ' ' + this.pagination.next.selector).click($.proxy(function(event) {
		var disabled =  $(event.delegateTarget).hasClass('disabled'); 
		if ( disabled )
			return;
		this.page = this.page + 1;
		this.runPage();
	}, this));
}

org.oecd.exalead.Search.prototype._recurseFacet = function(xml, root, facet) {
	var $xml = $(xml);

	var categoriesData = [];

	var selector = root + '>Category';
	$xml.find(selector).each($.proxy(function(idx, el) {
		if ( facet.max && idx >= facet.max )
					return false;
				
		var r =  $(el).attr('id');

		var title = $(el).attr('title');
		if (facet.resource)
			title = this.messages[this.language][facet.resource][$(el).attr('title')];

		var cssClass = '';
		var subCategoriesData = [];
		if ( this.refinements[r] ) {
			if ( this.refinements[r] == '+' ) {
				cssClass = 'active';
				if ( facet.hierarchy )
					subCategoriesData = this._recurseFacet(el, selector, facet);
			}
			if ( this.refinements[r] == '-' ) {
				cssClass = 'not';
			}
		}

		var categoryData = {
			id: r, 
			title: title, 
			count: $(el).attr('count'), 
			not: this.messages[this.language].not, 
			active: cssClass, 
			items: [], 
			hasItems: function() { return this.items.length; },
			expandable: facet.expandable?' expandable':''
		};
		$.each(subCategoriesData, function() { 
			categoryData.items.push(this); 
		});
		
		categoriesData.push(categoryData);
	},this));

	return categoriesData;
}

org.oecd.exalead.Search.prototype.drawFacets = function(xml) {
	if ( !this.facets.length )
		return;

	// Draw
	var facetsContainer = $('#'+this.facetsContainer);
	facetsContainer.empty();

	var $xml = $(xml);

	var facetsData = {};
	facetsData.facets = [];
	$(this.facets).each($.proxy(function(idx, facet) {
		$xml.find('Answer>groups>AnswerGroup[id="' + facet.id + '"]').each($.proxy(function(idx, element) {
			var facetData = {header: facet[this.language], items: [], expandable: facet.expandable?' expandable':''};
			var $element = $(element); 

			var categories = this._recurseFacet($element, 'categories', facet);
			$.each(categories, function() { 
				facetData.items.push(this); 
			});

			facetsData.facets.push(facetData);
		}, this));
	}, this));

	facetsContainer.append(this.facet.tpl(facetsData));

	// Bind events
	facetsContainer.find(this.facet.itemSelector).click($.proxy(function(event) {
		var li = $(event.delegateTarget); 
		var r = li.attr('id');	
		if ( li.hasClass('active') ) {
			delete this.refinements[r];
			// Remove "deeper" refinements
			$.each(this.refinements, $.proxy( function(k,v) { 
				if ( k.indexOf(r)==0 ) { 
					delete this.refinements[k];
				} 
			}, this) );
		} else {	
			this.refinements[r]='+';
		}
		this.run();
	}, this));

	facetsContainer.find(this.facet.notSelector).click($.proxy(function(event){ 
		var li = $(event.target).parent().parent();
		var r = li.attr('id');
		if ( li.hasClass('not') ) {
			delete this.refinements[r];
		} else {
			// Remove "deeper" refinements
			$.each(this.refinements, $.proxy( function(k,v) { 
				if ( k.indexOf(r)==0 ) { 
					delete this.refinements[k];
				} 
			}, this) );
			this.refinements[r]='-';
		}
		this.run();
		event.stopPropagation();
	}, this));
}


org.oecd.exalead.Search.prototype.run = function() {
	this.debug('run');
	this.page = 0; 
	this._call(function(arguments) { this.drawResults(arguments); this.drawPagination(arguments); this.drawFacets(arguments); } );
}

org.oecd.exalead.Search.prototype.runPage = function() {
	this._call(function(arguments) { this.drawResults(arguments);  this.drawPagination(arguments); });
}

org.oecd.exalead.Search.prototype._call = function(callback) { 
	this.debug('_call');

	// Store to use in 'onstatechanged' handler ?
	this.callback = callback;

	var params = this._stateToSearchParams();
	if ( ! params.s ) params.s = 'score';
	this.trace(this.term, params, $.param(params, true));

	// Instead of calling Exalead, we trigger a statechange event by pushing the state
	History.pushState(null, null, '?'+$.param(params, true));

	// Force run if it is the first time
	if ( !this.hasRun ) {
		this.hasRun = true;
		$(window).trigger('statechange');
	}

}

org.oecd.exalead.Search.prototype._stateToSearchParams = function() {
	var rParam = [];
	$.each(this.refinements,function(key, value) { rParam.push(value+key); });
	var params = {'hf': this.hit.perPage, 'b': this.page*this.hit.perPage, 'r': rParam};
	if ( this.logic != null ) {
		params.sl = this.logic;
	}
	if ( this.term != null ) {
		params.q = this.term;
	}
	if ( this.sort && this.sort.length > 0 && this.sort != 'score' ) {
		params.s = this.sort;
	}
	return params;
}

org.oecd.exalead.Search.prototype.alert = function(type, message) {
	alert(type.toUpperCase() + ': ' + message);
}

org.oecd.exalead.Search.prototype.closeAlerts = function() {
	$('.alert').alert('close');
}

/*
*******************************************************************************
************************************ META *************************************
*******************************************************************************
*/
org.oecd.exalead.Meta = function(xml, type, format) { 
	this.xml  = xml;
	this.type = type;
	this.format = format;
	this.name = $(this.xml).attr('name');
}

org.oecd.exalead.Meta.prototype.toHTML = function() { 
	var html = '';
	var segments = $(this.xml).find('TextSeg');
	if ( segments.length ) {
		segments.each(function(idx, element) {
			if ( $(element).attr('highlighted') == 'true' ) { 
				html += '<strong>' + $(element).text() + '</strong>';
			} else {
				html += $(element).text();
			}
		});
	} else {
		$(this.xml).find('MetaString').each($.proxy(function(idx, element) {
			var metaText = $(element).text();
			if ( this.type == 'date' ) {
				var dateObj = moment(metaText);
				if ( dateObj.isValid() ) {
					metaText = dateObj.format(this.format);
				} 
			}
			if ( this.type == 'file_size' ) {
				var nb = new Number(metaText);
				metaText = Math.round(nb/100)/10 + ' KB';
			}
			html += metaText;
		}, this));
	}
	
	return html;
}

/*
*******************************************************************************
******************************* REQUEST PARAMS ********************************
*******************************************************************************
*/
org.oecd.exalead.Request = function() {
	$.extend(true, this, new LOG('error'));

	this.parameters = {};

	var url = document.location.href;
	this.trace(url);

	var splitted = url.split('?'); 
	if ( splitted.length == 2 ) {

		var queryString = splitted[1];
		var params = queryString.split('&');
		$.each(params, $.proxy(function(idx, item) {
			var param = item.split('=');
			if ( param.length == 2 ) {
				var key = param[0];
				var value = param[1];

				var p = this.parameters[key];
				if ( p ) {
					if ( $.isArray(p) ) {
						this.parameters[key].push(value);
					} else {
						this.parameters[key] = [];
						this.parameters[key].push(p);
						this.parameters[key].push(value);
					}
				} else 
					this.parameters[param[0]] = param[1];
			} else if ( param.length == 1 ) 
				this.parameters[param[0]] = null;
		}, this))

	}

	this.trace(this.parameters);
}

org.oecd.exalead.Request.prototype.get = function(name) {
	return this.parameters[name];
}

/*
*******************************************************************************
***************************** VERY SIMLPE LOGGER ******************************
*******************************************************************************
*/
LOG = function(level) {
	this.level = level;

	this.trace = function() { if ( this.level == 'trace' ) console.log(arguments); }
	this.debug = function() { if ( this.level == 'debug' || this.level == 'trace' ) console.log(arguments); }
	this.warn  = function() { if ( this.level == 'warn'  || this.level == 'debug' || this.level == 'trace' ) console.log(arguments); }
	this.error = function() { if ( this.level == 'error' || this.level == 'warn'  || this.level == 'debug' || this.level == 'trace' ) console.log(arguments); }
}