/* globals $ */
'use strict';

$(function(){
	//	Main function that shows and hides the requested tabs and their content
	var setTab = function(tabContainerId, tabId){
		//	Remove class "active" from currently active tab
		$('#' + tabContainerId + ' ul li').removeClass('active');

		//	Now add class "active" to the selected/clicked tab
		$('#' + tabContainerId + ' a[rel="'+tabId+'"]').parent().addClass("active");

		//	Hide contents for all the tabs.
		//	The '_content' part is merged with tabContainerId and the result
		//	is the content container ID.
		//	For example for the original tabs: tabContainerId + '_content' = original_tabs_content
		$('#' + tabContainerId + '_content .tab_content').hide();

		//	Show the selected tab content
		$('#' + tabContainerId + '_content #' + tabId).fadeIn();
	};

	//	Function that gets the hash from URL
	var getHash = function(){
		if (window.location.hash) {
			//	Get the hash from URL
			var url = window.location.hash;

			//	Remove the #
      var currentHash = url.substring(1);

			//	Split the IDs with comma
			var currentHashes = currentHash.split(",");

			//	Loop over the array and activate the tabs if more then one in URL hash
			$.each(currentHashes, function(i, v){
				setTab($('a[rel="'+v+'"]').parent().parent().parent().attr('id'), v);
			});
		}
	};

	//	Called when page is first loaded or refreshed
	getHash();

	//	Looks for changes in the URL hash
	$(window).bind('hashchange', function() {
		getHash();
	});


	$('.tabs_wrapper ul li').mouseenter(function() {
		var tabId = $(this).children('a').attr('rel');
		//	Update the hash in the url
		window.location.hash = tabId;

		//	Do nothing when tab is clicked
		return false;
    });

	//	Called when we click on the tab itself
	$('.tabs_wrapper ul li').click(function() {
		var tabId = $(this).children('a').attr('rel');

		//	Update the hash in the url
		window.location.hash = tabId;

		//	Do nothing when tab is clicked
		return false;
	});
});

