/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

load('config');

load('lib/WindowManager');
load('lib/prefs');
load('lib/locale');

var MAIN_WINDOW = 'mail:3pane';
var DOMAIN = 'extensions.fontsizemenu@clear-code.com.';

var stringBundle = locale.get('chrome://fontsizemenu/locale/fontsizemenu.properties');

function FontSizeMenu(aWindow) {
  this.window = aWindow;
  this.init();
}
FontSizeMenu.prototype = {
  get document() {
    return this.window.document;
  },

  get language() {
    return prefs.getPref('font.language.group', Ci.nsIPrefLocalizedString).data;
  },

  get currentSize() {
    return prefs.getPref('font.size.fixed.' + this.language);
  },
  set currentSize(aValue) {
    prefs.setPref('font.size.fixed.' + this.language, aValue);
    prefs.setPref('font.size.variable.' + this.language, aValue);
  },

  getSize: function FontSizeMenu_getSize(aType) {
    return prefs.getPref(DOMAIN + aType + '.size') || 0;
  },

  init: function FontSizeMenu_init() {
    this.viewMenuItem = this.createMenu('menu_View_Popup', 'mailviewCharsetMenu', 'viewmenu');
    this.appMenuItem = this.createMenu('appmenu_View_Popup', 'appmenu_charsetMenu', 'appmenu');
  },
  createMenu: function FontSizeMenu_createMenu(aParent, aNextItem, aPrefix) {
    var parent = this.document.getElementById(aParent);
    if (!parent)
      return null;

    var menu = this.document.createElement('menu');
    menu.setAttribute('id', aPrefix + '-fontsize');
    menu.setAttribute('label', stringBundle.getString('menu.label'));
    menu.setAttribute('accesskey', stringBundle.getString('menu.accesskey'));

    var popup = this.document.createElement('menupopup');
    popup.setAttribute('onpopupshowing', 'FontSizeMenu.onPopupshowing(event)');
    popup.setAttribute('oncommand', 'FontSizeMenu.onCommand(event)');
    menu.appendChild(popup);

    var items = prefs.getChildren(DOMAIN).map(function(aBaseKey) {
      var type      = aBaseKey.replace(DOMAIN, '');
      var label     = prefs.getPref(aBaseKey);
      var accesskey = prefs.getPref(aBaseKey + '.accesskey');
      var size      = prefs.getPref(aBaseKey + '.size');

      var item = this.document.createElement('menuitem');
      item.setAttribute('id', aPrefix + '-fontsize-' + type);
      item.setAttribute('type', 'radio');
      item.setAttribute('value', type);
      item.setAttribute('label', label);
      if (accesskey)
        item.setAttribute('accesskey', accesskey);
      item._size = size;
      return item;
    }, this);

    items.sort(function(aA, aB) {
      return aB._size - aA._size;
    });

    items.forEach(function(aItem) {
      popup.appendChild(aItem);
    });

    var nextItem = this.document.getElementById(aNextItem);
    parent.insertBefore(menu, nextItem);
    return menu;
  },

  destroy: function FontSizeMenu_destroy() {
    if (this.viewMenuItem)
      this.viewMenuItem.parentNode.removeChild(this.viewMenuItem);
    delete this.viewMenuItem;

    if (this.appMenuItem)
      this.appMenuItem.parentNode.removeChild(this.appMenuItem);
    delete this.appMenuItem;

    delete this.window;
  },

  onPopupshowing: function FontSizeMenu_onPopupshowing(aEvent) {
    var currentSize = this.currentSize;

    var items = Array.map(aEvent.target.querySelectorAll('menuitem[value]'), function(aItem) {
      aItem._size = this.getSize(aItem.value);
      return aItem;
    }, this);
    items.sort(function(aA, aB) {
      return aB._size - aA._size;
    });

    if (items.some(function(aItem) {
          if (currentSize >= aItem._size) {
            aItem.setAttribute('checked', true);
            return true;
          }
          return false;
        }, this))
      return;

    items[items.length-1].setAttribute('checked', true);
  },

  onCommand: function FontSizeMenu_onCommand(aEvent) {
    this.currentSize = this.getSize(aEvent.target.value);
    this.window.ReloadMessage();
  }
};

function handleWindow(aWindow)
{
  var doc = aWindow.document;
  if (doc.documentElement.getAttribute('windowtype') != MAIN_WINDOW)
    return;
  aWindow.FontSizeMenu = new FontSizeMenu(aWindow);
}

WindowManager.getWindows(MAIN_WINDOW).forEach(handleWindow);
WindowManager.addHandler(handleWindow);

function shutdown()
{
  WindowManager.getWindows(MAIN_WINDOW).forEach(function(aWindow) {
    aWindow.FontSizeMenu.destroy();
    delete aWindow.FontSizeMenu;
  });
  WindowManager.removeHandler(handleWindow);

  MAIN_WINDOW = undefined;
  DOMAIN = undefined;
  FontSizeMenu = undefined;
  stringBundle = undefined;

  locale = undefined;
  WindowManager = undefined;
  prefs = undefined;
}
