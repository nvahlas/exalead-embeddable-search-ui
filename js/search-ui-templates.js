org.oecd.exalead.templates = {
	facet: {
		tpl: '{{#facets}}<ul class="nav nav-list{{expandable}}"><li class="nav-header">{{header}}</li>{{#items}}<li id="{{id}}" class="{{active}}"><a href="javascript:;"><span class="title">{{title}}</span><span class="label label-important pull-right">{{not}}</span><span class="badge badge-info pull-right">{{count}}</span></a></li>{{>subitems}}{{/items}}<li class="divider"></li></ul>{{/facets}}',
		tplSubItems: '{{#hasItems}}<ul class="nav nav-list{{expandable}}">{{#items}}<li id="{{id}}" class="{{active}}"><a href="javascript:;">{{title}} <span class="badge badge-info">{{count}}</span><span class="label label-important pull-right">{{not}}</span></a></li>{{>subitems}}{{/items}}</ul>{{/hasItems}}',
		itemSelector: 'ul.nav li[class!="nav-header"][class!="divider"]',
		notSelector: 'ul.nav li[class!="nav-header"] span.label.label-important'
	},

	hit: {
		tpl: '<div id="{{id}}" class="hit"><h3 class="meta title"><span>{{idx}}</span>{{&title}}</h3><p class="meta text">{{&text}}</p><a class="meta url" href="{{publicurl}}">{{publicurl}}</a><span class="meta date">{{lastmodifieddate}}</span><span class="meta file_size">{{file_size}}</span>{{#facets}}<ul class="facets">{{#items}}<li id="{{id}}">{{name}}: <a href="javascript:;">{{value}}</a></li>{{/items}}</ul>{{/facets}}</div>',
		facetSelector: 'div.hit ul.facets li a'
	},

	pagination: {
		tpl: '<ul>{{>previous}}{{>page}}{{>next}}</ul>',
		page: {
			tpl: '<li id="page_{{idx}}" class="page{{active}}"><a href="javascript:;">{{idx}}</a></li>',
			selector: 'li.page'
		},
		next: {
			tpl: '<li class="next{{disabled}}"><a href="javascript:;">&raquo;</a></li>',
			selector: 'li.next'
		},
		previous: {
			tpl: '<li class="previous{{disabled}}"><a href="javascript:;">&laquo;</a></li>',
			selector: 'li.previous'
		}
	},

	tools: {
		tpl: '<ul class="nav nav-pills">{{>sorting}}{{>paging}}</ul>',
		sorting: {
			tpl: '{{#sorting}}<li class="dropdown" id="sorting"><a class="dropdown-toggle" role="button" data-toggle="dropdown" href="javascript:;">{{title}}<b class="caret"></b></a><ul class="dropdown-menu" role="menu">{{#items}}<li class="{{active}}" id="{{value}}"><a href="javascript:;" role="menuitem">{{name}}</a></li>{{/items}}</ul></li>{{/sorting}}',
			selector: '#sorting ul li'
		},

		paging: {
			tpl: '{{#paging}}<li class="dropdown" id="paging"><a class="dropdown-toggle" role="button" data-toggle="dropdown" href="javascript:;">{{title}}<b class="caret"></b></a><ul class="dropdown-menu" role="menu">{{#items}}<li class="{{active}}" id="{{value}}"><a href="javascript:;" role="menuitem">{{name}}</a></li>{{/items}}</ul></li>{{/paging}}',
			selector: '#paging ul li'
		}
	}

}