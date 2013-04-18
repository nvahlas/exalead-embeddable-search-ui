org.oecd.exalead.defaultconfig = {
	endpoint : 'http://vd-w2k8-java-5.main.oecd.org:81/search-api/',

	container : 'results',
	pagingContainer : 'pagination',
	facetsContainer : 'facets',
	nbHitsContainer : 'nbHits',
	toolsContainer  : 'tools',
	
	searchField : '#term',

	logic : null,

	pagination: {
		tpl : Mustache.compile(org.oecd.exalead.templates.pagination.tpl),
		page: {
			tpl : Mustache.compile(org.oecd.exalead.templates.pagination.page.tpl),
			selector : org.oecd.exalead.templates.pagination.page.selector
		},
		previous: {
			tpl : Mustache.compile(org.oecd.exalead.templates.pagination.previous.tpl),
			selector : org.oecd.exalead.templates.pagination.previous.selector
		},
		next: {
			tpl : Mustache.compile(org.oecd.exalead.templates.pagination.next.tpl),
			selector : org.oecd.exalead.templates.pagination.next.selector
		}
	},

	hit : {
		numbered : true,
		perPage : 20,
		metas : [
			{name:'title', type:'title'}, 
			{name:'text', type:'text'},
			{name:'publicurl', type:'url'},
			{name:'lastmodifieddate', type: 'date', format: 'DD MMM YYYY'}
		],
		tpl : Mustache.compile(org.oecd.exalead.templates.hit.tpl),
		facetSelector : org.oecd.exalead.templates.hit.facetSelector,
	},

	facet : {
		tpl : Mustache.compile(org.oecd.exalead.templates.facet.tpl),
		tplSubItems: Mustache.compilePartial('subitems', org.oecd.exalead.templates.facet.tplSubItems),
		itemSelector : org.oecd.exalead.templates.facet.itemSelector,
		notSelector : org.oecd.exalead.templates.facet.notSelector,
	},
	
	messages : {
		en: {
			error: 'Your search failed!', 
			success: 'Your search completed successfully!',
			info: 'Your search is in progress...',
			results: 'results',
			not: 'NOT',
			languages: {en: 'English', fr: 'French', es: 'Spanish', de: 'German'},
			file_types: {pdf: 'PDF Document', html: 'HTML Page', jsp: 'Dynamic Page'},
			sorting: { title: 'Sorted by', relevance: 'Relevance', date_desc: 'Date (descending)', date_asc: 'Date (ascending)' },	
			paging: {title: 'Results per page'}
		}, 
		fr: {
			error: 'Votre recherche a échoué!', 
			success: 'Votre recherche a réussi!',
			info: 'Votre recherche est en cours...',
			results: 'résultats',
			not: 'NON',
			languages: {en: 'Anglais', fr: 'Français', es: 'Espagnol', de: 'Allemand'},
			file_types: {pdf: 'Document PDF', html: 'Page HTML', jsp: 'Page Dynamique'},
			sorting: {title: 'Trié par', relevance: 'Pertinence', date_desc: 'Date (descendante)', date_asc: 'Date (ascendante)'},
			paging: {title: 'Résultats par page'}
		}
	},
	
	language : 'en',

	sorting: [
		{name: 'relevance', value: 'score'},
		{name: 'date_desc', value: 'desc(document_lastmodifieddate)'},
		{name: 'date_asc',  value: 'asc(document_lastmodifieddate)'}
	],

	paging: [
		{name: '5',  value: '5'},
		{name: '10', value: '10'},
		{name: '20', value: '20'},
		{name: '50', value: '50'}
	]
}