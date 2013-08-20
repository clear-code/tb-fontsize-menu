/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var FontSizeMenu = {
  domain: 'extensions.fontsizemenu@clear-code.com.',

  get prefs() {
    delete this.prefs;
    let namespace = {};
    Cu.import('resource://fontsizemenu-modules/prefs.js', namespace);
    return this.prefs = namespace.prefs;
  },

  get language() {
    return this.prefs.getPref('font.language.group', Ci.nsIPrefLocalizedString).data;
  },

  get currentSize() {
    return this.prefs.getPref('font.size.fixed.' + this.language);
  },
  set currentSize(aValue) {
    this.prefs.setPref('font.size.fixed.' + this.language, aValue);
    this.prefs.setPref('font.size.variable.' + this.language, aValue);
  },

  getSize: function FontSizeMenu_getSize(aType) {
    return this.prefs.getPref(this.domain + aType + '.size') || 0;
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
  }
};
