/**
 * Created by nilsvierus on 10.04.17.
 */

var cashmap_const = cashmap_const || {};

(function (constants) {
	'use strict';

	constants.VERSION = {
		number: '0.8.2',
		date:	'20.04.2017'
	};

	constants.MAPBOX_TOKEN = 'pk.eyJ1IjoibmlscyIsImEiOiJjaW1wNzdrcGQwMDJ6d2FtNHk3YzJqZmRkIn0.MLGG4q0ptisudg2S85r0oA';
	constants.TFOREST_KEY = 'f75e52ff671445ffa6b2eaeff9f1143d';

//	constants.CASHMAP_ATTR = 'Developed by <a href="http://www.osm-maps.eu">osm-maps.eu</a>';
	constants.CASHMAP_ATTR = 'Developed by osm-maps';
	constants.MAPBOX_ATTR = 'Imagery © <a href="http://mapbox.com">Mapbox</a>';
	constants.TFOREST_ATTR = 'Maps © <a href="http://www.thunderforest.com">Thunderforest</a>';
	constants.OSM_ATTR = '<a href="http://openstreetmap.org">OpenStreetMap</a>-Mitwirkende (' +
		'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>)';

	constants.CLOSE_BUTTON = '<button type="button" class="close" aria-label="Schliessen">' +
		'<span aria-hidden="true">&times;</span></button>';

	constants.MARKER_COLOR = {
		'sparkassen': 'lightred',
		'vrbanken'	: 'lightgreen',
		'cashpool'	: 'blue',
		'cashgroup'	: 'beige',
		'sonstige'	: 'lightgray'
	};

	constants.WOCHENTAG_NAME = {
		'su':'Sonntag',
		'mo':'Montag',
		'tu':'Dienstag',
		'we':'Mittwoch',
		'th':'Donnerstag',
		'fr':'Freitag',
		'sa':'Samstag',
		'ph':'Feiertage'
	};

	constants.NETWORK = {
		'sparkassen': 'Sparkassen-Finanzverbund',
		'vrbanken'	: 'BankCard Servicenetz (VR Banken)',
		'cashpool'	: 'CashPool',
		'cashgroup'	: 'Cash Group',
		'sonstige'	: 'keiner'
	};

})(cashmap_const);