function MobileMenu(container) {
	this.nav = container;
	this.root = container.children[0];
	this.submenus = container.getElementsByClassName('submenu');
	this.currentLevel = 0;
	this.timeoutId = 0;
}

MobileMenu.prototype.getSubmenus = function(root, level, submenu, submenus) {
	console.log('getSubmenus', root, level, submenu, submenus);
	return Array.prototype.filter.call(submenus === undefined ? this.submenus : submenus, function(ul) {
		return true
			&& (root === undefined || root === ul.getAttribute('data-root'))
			&& (level === undefined || level == ul.getAttribute('data-level'))
			&& (submenu === undefined || submenu === ul.getAttribute('data-submenu'));
	});
};

MobileMenu.prototype.onAnimationEnd = function() {
	console.log('onAnimationEnd', this.currentRoot, this.currentLevel, this.isAnimationForward);
	if (this.currentLevel === 0) {
		this.getSubmenus(this.currentRoot).forEach(function(ul) { ul.classList.remove('current-root'); });
	}
	if (!this.isAnimationForward && this.currentLevel > 0) {
		this.getSubmenus(this.currentRoot, this.currentLevel + 1).forEach(function(ul) {
			ul.classList.remove('current-menu');
		});
	}
};

MobileMenu.prototype.resetAnimationTimeout = function() {
	clearTimeout(this.timeoutId);
	this.timeoutId = setTimeout(this.onAnimationEnd.bind(this), 500);
};

MobileMenu.prototype.updateCurrentLevel = function(level, delayedAnimation) {
	console.log('updateCurrentLevel', level);
	if (level < 0 || level === this.currentLevel) return false;
	if (delayedAnimation) setTimeout(function() { this.nav.setAttribute('data-level', level); }.bind(this), 16);
	else this.nav.setAttribute('data-level', level);
	this.resetAnimationTimeout();
	this.isAnimationForward = this.currentLevel < level;
	this.currentLevel = level;
	return true;
};

MobileMenu.prototype.setRoot = function(name) {
	console.log('setRoot', name);
	this.currentRoot = name;
	this.currentMenus = [];
	var subs = this.getSubmenus(name);
	if (subs.length === 0) return false;
	subs.forEach(function(ul) { ul.classList.add('current-root'); });
	return this.updateCurrentLevel(1, true);
};

MobileMenu.prototype.goBack = function() {
	console.log('goBack');
	this.getSubmenus(this.currentRoot, this.currentLevel).forEach(function(ul) {
		ul.classList.remove('current-menu');
	});
	if (this.currentMenus.length) this.currentMenus.pop();
	return this.updateCurrentLevel(this.currentLevel - 1);
};

MobileMenu.prototype.goForward = function(submenu) {
	console.log('goForward', submenu);
	var level = this.currentLevel + 1;
	var next = this.getSubmenus(this.currentRoot, level);
	if (next.length === 0) return false;
	var current = this.getSubmenus(undefined, undefined, this.currentMenus.concat([submenu]).join('-'), next);
	if (current.length === 0) return false;
	current.forEach(function(ul) { ul.classList.add('current-menu'); });
	this.currentMenus.push(submenu);
	return this.updateCurrentLevel(level, true);
};

MobileMenu.prototype.onClick = function(a) {
	if (a.className === 'back') return this.goBack();
	var ul = a.parentNode.parentNode;
	if (ul === this.root) return this.setRoot(a.innerHTML);
	return this.goForward(a.innerHTML);
};

MobileMenu.prototype.addSubmenuLink = function(parent, child) {
	var li = document.createElement('li');
	var a = document.createElement('a');
	a.href = '#';
	a.innerHTML = child.getAttribute('data-submenu').split('-').pop();
	li.appendChild(a);
	parent.insertBefore(li, parent.children[1]);
};

MobileMenu.prototype.addSubmenuLinks = function() {
	Array.prototype.filter.call(this.submenus, function(ul) {
		return parseInt(ul.getAttribute('data-level'), 10) > 1;
	}).forEach(function(next) {
		var level = parseInt(next.getAttribute('data-level'), 10),
				name;
		if (level > 2) {
			var parts = next.getAttribute('data-submenu').split('-');
			parts.pop();
			name = parts.join('-');
		}
		else name = 'root';
		var prev = this.getSubmenus(next.getAttribute('data-root'), level - 1, name);
		this.addSubmenuLink(prev[0], next);
	}.bind(this));
};

MobileMenu.prototype.getBackButtonTitle = function(ul) {
	switch (ul.getAttribute('data-level')) {
	case '1':
		return 'main menu';
	case '2':
		return ul.getAttribute('data-root');
	default:
		var path = ul.getAttribute('data-root') + '-' + ul.getAttribute('data-submenu');
		var parts = path.split('-');
		parts.pop();
		return parts.join(' ');
	}
};

MobileMenu.prototype.updateBackButtonTitles = function() {
	Array.prototype.forEach.call(this.submenus, function(ul) {
		ul.getElementsByTagName('a')[0].innerHTML += this.getBackButtonTitle(ul);
	}.bind(this));
};

MobileMenu.prototype.init = function() {
	this.addSubmenuLinks();
	this.updateBackButtonTitles();
	this.nav.addEventListener('click', function(e) {
		var link;
		if ((e.target.nodeName === 'A' || e.target.nodeName === 'LI')
			&& (link = e.target.nodeName === 'A' ? e.target : e.target.children[0])
			&& this.onClick(link)) e.preventDefault();
		else if (e.target.nodeName === 'LI') location.href = e.target.children[0].href;
	}.bind(this));
};
