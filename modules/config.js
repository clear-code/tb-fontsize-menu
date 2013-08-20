/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var config = require('lib/config');

load('lib/locale');
var stringBundle = locale.get('chrome://fontsizemenu/locale/fontsizemenu.properties');

var DOMAIN = 'extensions.fontsizemenu@clear-code.com.';
config.setDefault(DOMAIN + 'large',            stringBundle.getString('menu.large.label'));
config.setDefault(DOMAIN + 'large.accesskey',  stringBundle.getString('menu.large.accesskey'));
config.setDefault(DOMAIN + 'large.size',       16);
config.setDefault(DOMAIN + 'medium',           stringBundle.getString('menu.medium.label'));
config.setDefault(DOMAIN + 'medium.accesskey', stringBundle.getString('menu.medium.accesskey'));
config.setDefault(DOMAIN + 'medium.size',      12);
config.setDefault(DOMAIN + 'small',            stringBundle.getString('menu.small.label'));
config.setDefault(DOMAIN + 'small.accesskey',  stringBundle.getString('menu.small.accesskey'));
config.setDefault(DOMAIN + 'small.size',       10);

function shutdown()
{
  DOMAIN = undefined;
  stringBundle = undefined;
  locale = undefined;
  config = undefined;
}
