(function($) {
	var mobileMenu = new MobileMenu(document.getElementById('mobile-main-menu'));
	$(document).ready(function() {
		$('#menu-toggler').on('click', function(e) {
			$(document.body).toggleClass('mobile-menu-visible');
		});
		mobileMenu.init();
	});
})(jQuery);
