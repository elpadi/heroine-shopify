(function($) {
	$(document).ready(function() {
		$('#menu-toggler').on('click', function(e) {
			$(document.body).toggleClass('mobile-menu-visible');
		});
	});
})(jQuery);
