var __s;
$(function() {
	// Search configuration
	var config = {
		'language': 'en', 
		'logic': 'dotstat', 
		'hit': {
			'numbered': true,
			'perPage': 20,
			'metas': [
				{name:'title', type:'title'}, 
				{name:'text', type:'text'},
				{name:'publicurl', type:'url'},
				{name:'lastmodifieddate', type: 'date', format: 'MMM DD, YYYY'},
				{name:'file_size', type: 'text', type: 'file_size'}
			],
			'facets': [
				{id: 'Language', en: 'Language', fr: 'Langue', resource: 'languages'},
				{id: 'file_extension', en: 'Document type', fr: 'Type de document', resource: 'file_types'}
			]
		},
		'facets' : [
			{id: 'Language', en: 'Language', fr: 'Langue', resource: 'languages' },
			{id: 'Source', en: 'Source', fr: 'Source' },
			{id: 'dotstat_datasetname', en: 'Dataset', fr: 'Jeu de données', expandable: true},
			{id: 'lastmodifieddate', en: 'Last modification date', fr: 'Date de dernière modification', hierarchy: true, max: 5},
			{id: 'file_extension', en: 'Document type', fr: 'Type de document', resource: 'file_types'}
		]
	};

	var search = new org.oecd.exalead.Search(config, org.oecd.exalead.templates);

	// Overriding the default alert function
	search.alert = function(type, message, autoclose) {
		var alert = $('<div></div>')
			.attr('class', 'alert alert-'+type+' fade' )
			.append( $('<button></button>').attr('class', 'close').attr('data-dismiss', 'alert').html('&times;') )
			.append(message)
		$('#messages').append(alert);
		alert.addClass('in');
		if ( typeof autoclose === 'undefined' )
			window.setTimeout( $.proxy(function() { this.alert('close'); }, alert), 1000);
		else
			alert.addClass(autoclose);
	}

	$('#search').click(function() {
		search.term = $('#term').val();
		search.run();
	});
	$('#term').keypress(function(e) {
		if (e.which == 13) {
			search.term = $('#term').val();
			search.run();
		}
	});
	$('#term').focus();

	search.run();

	__s = search;
});