/**
 * Created by nilsvierus on 16.03.17.
 */


var VERSION = [
	{
		number: '0.9.6', date: '07.12.2017'	},
	{
		number: '0.9.5', date: '25.09.2017'	},
	{
		number: '0.9.4', date: '05.07.2017'	},
	{
		number: '0.9.3', date: '02.07.2017'	},
	{
		number: '0.9.2', date: '10.06.2017'	},
	{
		number: '0.8.3', date: '23.04.2017'	}
];

var RELEASE_NOTES = [];

RELEASE_NOTES['0.9.6'] = '<p>Das Routing zum ausgew&auml;hlten Geldautomaten bzw. der Bankfiliale ist jetzt auch ' +
	'per Fahrrad und per &Ouml;PNV m&ouml;glich. Dabei betr&auml;gt die maximale Routenl&auml;nge 30 min.</p>' +
	'<p>F&uuml;r einen bestehenden Geldautomaten bzw. eine Bankfiliale können auch ohne OSM-Account fehlende' +
	' &Ouml;ffnungszeiten eingetragen werden.</p>' +
	'<p>Die genaue Position eines Geldautomaten kann durch Verschieben das Markers auf der Karte korrigiert werden.</p>' +
	'<p>Bei Neuanlage eines Geldautomaten wird die n&auml;chstgelegene Adresse nicht mehr automatisch übernommen</p>';

RELEASE_NOTES['0.9.5'] = '<p>Auf Tablets/Desktops gibt es jetzt links eine einklappbare Liste aller Geldautomaten bzw. ' +
	'Bankfilialen im Kartenausschnitt. Wurde der Standort ermittelt, wird die Entfernung (Luftlinie) vom Standort zum ' +
	'Automaten angezeigt (Symbol: <i class="fa fa-location-arrow"></i>), andernfalls von der Kartenmitte ' +
	'zum Automaten (Symbol: <i class="fa fa-crosshairs"></i>).' +
	'Die Liste ist nach Entfernung aufsteigend sortiert und kann nach Name/Operator gefiltert werden.</p>' +
	'Zum ausgew&auml;hlten Marker (Mausklick) kann die k&uuml;rzeste fu&szlig;l&auml;ufige Route eingeblendet werden. ' +
	'Ein Click/Tap auf die Route zeigt Entfernung und Zeit.</p>';

RELEASE_NOTES['0.9.4'] = '<p>Kleine Fehlerbehebungen.</p>';

RELEASE_NOTES['0.9.3'] = '<p>Die Funktion zur &Uuml;berpr&uuml;fung der &Ouml;ffnungszeiten ber&uuml;cksichtigt ' +
	'jetzt auch Feiertage ("PH"), bislang aber nur in Deutschland.</p>';

RELEASE_NOTES['0.9.2'] = '<p>Du kannst jetzt &uuml;ber einen rechten Mausklick/Tap&Hold auf der Karte neue Geldautomaten' +
	' in OSM erfassen. Die Adresse wird automatisch ermittelt und &uuml;bernommen, Du kannst sie vor dem Hochladen' +
	' korrigieren.</p>';

RELEASE_NOTES['0.8.3'] = '<p>Mit einem rechten Mausklick/Tap&Hold kannst Du in der Karte die dort ' +
	'n&auml;chstliegende Adresse anzeigen lassen.</p>';

var MAPBOX_TOKEN = 'pk.eyJ1IjoibmlscyIsImEiOiJjaW1wNzdrcGQwMDJ6d2FtNHk3YzJqZmRkIn0.MLGG4q0ptisudg2S85r0oA';
var TFOREST_KEY = 'f75e52ff671445ffa6b2eaeff9f1143d';

var CASHMAP_ATTR = '<span class="hideAttr">Developed by&nbsp;</span>' +
	'<a target="_blank" href="http://www.osm-maps.eu">osm-maps.eu</a>';
var MAPBOX_ATTR = '<span class="hideAttr">Imagery ©&nbsp;</span>' +
	'<a target="_blank" href="http://www.mapbox.com">Mapbox</a>';
var TFOREST_ATTR = '<span class="hideAttr">Maps ©&nbsp;</span>' +
	'<a target="_blank" href="http://www.thunderforest.com">Thunderforest</a>';
var OSM_ATTR = '<a target="_blank" href="http://openstreetmap.org">OSM</a>' +
	'<span class="hideAttr">Mitwirkende (' +
	'<a target="_blank" href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>)</span>';
var ICON_ATTR = '<span class="hideAttr">Icons by&nbsp;</span>' +
	'<a  target="_blank" href="http://www.flaticon.com/authors/dave-gandy" title="Dave Gandy">flaticon</a>';


var WOCHENTAG_NAME = {
	'su':'Sonntag',
	'mo':'Montag',
	'tu':'Dienstag',
	'we':'Mittwoch',
	'th':'Donnerstag',
	'fr':'Freitag',
	'sa':'Samstag',
	'ph':'Feiertage'
};

var NETWORK_SHORTNAME = {
	'sparkassen': 'Sparkassen',
	'vrbanken'	: 'VR-Banken',
	'cashpool'	: 'CashPool',
	'cashgroup'	: 'Cash Group',
	'keiner'	: 'Kein Verbund'
};

var NETWORK_NAME = {
	'sparkassen': 'Sparkassen-Finanzverbund',
	'vrbanken'	: 'BankCard Servicenetz (VR Banken)',
	'cashpool'	: 'CashPool',
	'cashgroup'	: 'Cash Group',
	'keiner'	: 'kein Verbund'
};


var STANDARD_COLOR = {
	'sparkassen': '#FF0000',
	'vrbanken'	: '#FF6600',
	'cashpool'	: '#2743A0',
	'cashgroup'	: '#FFCC00',
	'keiner'	: '#666666'
};

// search expressions atm networks
var expSparkasse 	= /sparkasse|landesbank\ berlin|bw\ bank|bw-bank|lbbw/i;
var expVRBanken 	= /Volksbank|VR-Bank|Raiffeisen|PSD|GLS/i;
var expCashPool 	= /Sparda|Targo|Santander|citibank|BBBank|Sozialwirtschaft/i;
var expCashGroup 	= /Commerzbank|Deutsche\ Bank|Postbank|Norisbank|Berliner\ Bank|HypoVereinsbank/i;

var MIN_ZOOM = 13;        // minimal zoom for data load to avoid cluttering

/**
 *  Globale Variablen
 *
 */
var addressMarker = null;
var releaseNotes = '';
var sidebarFeatureList;
var borderLayer = null;
var myLocation = null
var myLocationMarker = null;
var timerID = null;

var currentDataBounds = null;

var routingRegions = [];
var routingAvailable = false;

/*
 * create leaflet map with context menu
 *
 * setview to cover Germany
 */
var cashMap = L.map('cashMap', {
	zoomControl: false,
	attributionControl: false,
	contextmenu: true,
	contextmenuItems: [
		{
			text: 'Erfassen ...',
			icon: 'img/pencil.png',
			retinaIcon: 'img/pencil_@2.png',
			callback: newFeatureOnMap
		}, {
			separator: true
		}, {
			text: 'Adresse',
			icon: 'img/address.png',
			retinaIcon: 'img/address_@2.png',
			callback: showAddress
		}]
}).setView([51.0, 9.9], 6); // Deutschland

/**
 * define base layers
 */
var mapboxLayer = L.tileLayer(
	'https://a.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=' + MAPBOX_TOKEN,
	{
		maxZoom: 19,
		detectRetina: true,
		attribution: CASHMAP_ATTR + ' | ' +  MAPBOX_ATTR + ' | ' + ICON_ATTR + ' | ' +
			OSM_ATTR
	}).addTo(cashMap);

var osmLayer = L.tileLayer(
	'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
	{
		maxZoom: 19,
		detectRetina: true,
		attribution: CASHMAP_ATTR + ' | ' +  OSM_ATTR
	});

var ocmLayer = L.tileLayer(
	'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=' + TFOREST_KEY,
	{
		maxZoom: 19,
		detectRetina: true,
		attribution: CASHMAP_ATTR + ' | ' + TFOREST_ATTR + ' | ' +
			OSM_ATTR
	});

var hybridLayer = L.tileLayer(
	'https://a.tiles.mapbox.com/v4/mapbox.streets-satellite/{z}/{x}/{y}.png?access_token=' + MAPBOX_TOKEN,
	{
		maxZoom: 19,
		detectRetina: true,
		attribution: CASHMAP_ATTR + ' | ' + MAPBOX_ATTR + ' | ' +
			OSM_ATTR
	});

var basAuth = 'Basic ZmluZGUtY2FzaC1lZGl0b3I6PjRVLm5temRrUURpN25LVDM5UkgqQHglTDlES2FU';

// leaflet map layers =======================================================
var baseLayers = {
	'MapBox' : mapboxLayer,
	'OpenStreetMap' : osmLayer,
	'OpenCycleMap' : ocmLayer,
	'Satellit' : hybridLayer
};

var overlayLayers = {
	'sparkassen': L.geoJSON(null),
	'vrbanken'	: L.geoJSON(null),
	'cashpool'	: L.geoJSON(null),
	'cashgroup'	: L.geoJSON(null),
	'keiner'	: L.geoJSON(null)
};

// marker to define new feature
var newMarkerLayer = L.geoJSON(null);

// marker to hightlight selected feature on map
var highlightLayer = L.geoJSON(null).addTo(cashMap);
var highlightStyle = {
	stroke: false,
	fillColor: "#F3969A",
	fillOpacity: 0.8,
	radius: 20
};

// crosshair for the map if not geolocated
var crosshairIcon = L.icon({
	iconUrl: 'img/crosshair.png',
	iconSize:     [20, 20], // size of the icon
	iconAnchor:   [10, 10] // point of the icon which will correspond to marker's location
});
crosshair = new L.marker(cashMap.getCenter(), {icon: crosshairIcon, clickable:false});

// define map controls =======================================================

// EasyButton
// top left: unhide sidebar
var btnShowSidebar = L.easyButton({
	id: 'btn-show-sidebar',     // button id
	position: 'topleft',    // inherited from L.Control -- the corner it goes in
	leafletClasses: true,     	// use leaflet classes to style the button?
	states:[{                 	// specify different icons and responses for your button
		stateName: 'show-sidebar',
		onClick: function(button, map){
			showSidebar(true);
		},
		title: 'Liste einblenden',
		icon: 'fa-chevron-right'
	}]
}).addTo(cashMap);

// bottom right: attribution
L.control.attribution({ position: 'bottomright' }).addTo(cashMap);

// top right: base layer switcher
var cashMapLayerControl = L.control.layers(baseLayers, null, {
	collapsed: true
}).addTo(cashMap);

// bottom right: load data, locate, search, zoom
L.control.zoom({ position: 'bottomright' }).addTo(cashMap);

var cashMapGeoCoderProvider = L.Control.Geocoder.google(
	'AIzaSyDig9g9O1D-MQ30uDjz6ROHzJiRPGrZRzU',	{
		reverseQueryParams: {
			result_type: 'street_address|route|street_number|postal_code|locality|country'
			}
		}
	);

var cashMapGeoCoder = L.Control.geocoder({
	position: 		'bottomright',
	placeholder: 	'Ort/Adresse...',
	errorMessage: 	'Nicht gefunden.',
	geocoder: 		cashMapGeoCoderProvider
}).addTo(cashMap);

// bottom right: search for geo location
L.control.locate({
	position: "bottomright",
	setView: true,
	drawCircle: true,
	keepCurrentZoomLevel: true,
	circleStyle: {
		weight: 1,
		clickable: true
	},
	icon: "fa fa-location-arrow",
	iconLoading: 'fa fa-spinner',
	strings: {
		title: "Zu Deinem Standort",
		popup: "Du bist im Umkreis von ca. {distance}.",
		metersUnits: "Metern",
		outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
	},
	locateOptions: {
		maxZoom: 17,
		watch: true,
		enableHighAccuracy: true,
		maximumAge: 10000,
		timeout: 10000
	}
}).addTo(cashMap);

// EasyButton data load
L.easyButton({
	id: 'btn-load-data', 		// an id for the generated button
	position: 'bottomright',    // inherited from L.Control -- the corner it goes in
	leafletClasses: true,     	// use leaflet classes to style the button?
	states:[{                 	// specify different icons and responses for your button
		stateName: 'load-data',
		onClick: function(button, map){
			loadOsmData(cashMap.getZoom());
		},
		title: 'Daten neu laden',
		icon: 'fa-refresh'
	}]
}).addTo(cashMap);

// bottom left: scale
L.control.scale({ position: 'bottomleft' }).addTo(cashMap);


// show route
var routeSrcMarker = L.geoJSON(null);
var routeLayer = L.featureGroup().addTo(cashMap);


// show version history ------------------------------------------------------------
$('#versionNumber').html('Version: ' + VERSION[0].number + ' / ' +
	VERSION[0].date);

Object.keys(RELEASE_NOTES).forEach(function (number) {
	releaseNotes += '<strong>Release: ' + number + '</strong><br />' + RELEASE_NOTES[number];
});
$('#releaseNotes').html(releaseNotes);


// OAuth object
var cashMapAuth = osmAuth({
	 oauth_secret: 'fAJv1DunRsvAjoyft03tksqitRcjEIFISqMwu9H9',
	 oauth_consumer_key: 'lQKPCyfCvhQU3CxCHaESW4LN8Zq9Lmp2a8d49nAx',
	 auto: true,
	 url: 'https://www.openstreetmap.org'
});


// log4javascript
var log = log4javascript.getLogger();

var ajaxAppender = new log4javascript.AjaxAppender("php/srv_log.php");
ajaxAppender.setThreshold(log4javascript.Level.ERROR);
log.addAppender(ajaxAppender);


//*************************** event handling *******************************************************

// window events -----------------------------------------------------------------------------------
/**
 * bind event handler <resize> to window
 *
 * - check for orientation change and screen size
 * - hide sidebar on tablets and desktops on portrait orientation
 */
$(window).on('resize', function( event ) {
	var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

	var desktopOrTablet = (w > 840);
	var orientationLandscape = (w / h > 1);

	// show sidebar on PC and tablets (width > 840) and on landscape orientation
	showSidebar(desktopOrTablet && orientationLandscape);
	if (desktopOrTablet) {
		$(".leaflet-control-layers").addClass("leaflet-control-layers-expanded");
	}

});

// map events --------------------------------------------------------------------------------------
/*
 * bind event handler <overlayadd> to map
 *
 * - fired when an overlay is selected through the layer control
 * - Update sidebar
 */
cashMap.on('overlayadd', function(e) {

	syncSidebar();

});

/**
 * bind event handler <overlayremove> to map
 *
 * - fired when an overlay is deselected through the layer control.
 * - update sidebar
 */
cashMap.on('overlayremove', function(e) {

	syncSidebar();

});

/**
 * bind event handler <movestart> and <zoomstart> to map
 *
 * - rest timer for data load
 * - switch off spinner
 * - hide info alert
 */
cashMap.on('movestart zoomstart', function(e) {

	window.clearTimeout(timerID);
	cashMap.spin(false);
	hideInfo();
});


/**
 * bind event handler <moveend> to map (fires on zoomend, too)
 *
 *  - if data not loaded yet or new map bounds are not fully within loaded area -> check zoom
 *  - if zoom >= MIN_ZOOM no data load
 *  - if zoom > MIN_ZOOM start timer of 2 sec for data load
 *  * 	(delayed loading to avoid load errors at fast map moves on mobile devices)
 *  - update sidebar feature list
 *
 */
cashMap.on('moveend', function(e) {

	var currZoom = cashMap.getZoom();

	if (!currentDataBounds || !currentDataBounds.contains(cashMap.getBounds())) {

		if (currZoom >= MIN_ZOOM) {
			timerID = window.setTimeout(function () {
				loadOsmData(currZoom);
			}, 2000);
		}
	}

	hideInfo();
	if (!myLocation) {
		crosshair.setLatLng(cashMap.getCenter());
	}

	syncSidebar();

});


/**
 * bind event handler <zoomend> to map
 *
 * 	if zoom factor <= MIN_ZOOM show warning, remove marker layers, empty out sidebar, disable data load button
 * 	else hide warning, enable data load button
 * 	(data is loaded via moveend event handler)
 */
cashMap.on('zoomend', function(e) {

	hideError();

	if (this.getZoom() < MIN_ZOOM) {

		clearAtmLayersAndRoutes();
		currentDataBounds = null;

		showWarning('Zoome weiter hinein, um Daten anzuzeigen!');

	} else {

		hideWarning();
	}

	syncSidebar();
});

/**
 *
 * bind event handler <locationfound> to map
 *
 * - hide message
 * - if accuracy >= 1000 m: show warning, dont set location
 * - if accuracy < 1000 m: set location coords to myLocation
 */
cashMap.on('locationfound', function(e) {

	hideInfo();
	if (e.accuracy < 1000) {
		myLocation = e.latlng;

	} else {
		var ErrText = 'Dein Standort konnte nur ungenau ermittelt werden.';
		if (cashMap.getZoom() < MIN_ZOOM) {
			ErrText += '<br />Zoome weiter hinein, um Daten anzuzeigen!';
		}

		crosshair.addTo(cashMap);
		showWarning(ErrText);
		// load data with current bounding box
		cashMap.fire('moveend');

		// set geoLocated to false
		myLocation = null;
	}

});


/**
 *
 * event handler map - geo location not found
 *
 * 	- show closable alert
 * 	- set myLocation to null
 */
cashMap.on('locationerror', function(e) {

	var ErrText = 'Dein Standort konnte nicht ermittelt werden.';

	hideInfo();
	if (cashMap.getZoom() < MIN_ZOOM) {
		ErrText += '<br />Zoome weiter hinein, um Daten anzuzeigen!';
	}

	crosshair.addTo(cashMap);
	showWarning(ErrText);
	cashMap.fire('moveend'); // load data
	myLocation = null;

});



// geocoder events ------------------------------------------------------------------------------
/*
 * bind event handler <markgeocode> to geocoder
 *
 * - if address found:
 * 		remove atm layers
 * 		remove routes
 * 	    load data
 *
 */
cashMapGeoCoder.on('markgeocode', function(e) {

	// TODO remove marker on location found
	clearAtmLayersAndRoutes();
	currentDataBounds = null;
	cashMap.fire('moveend');

});

// jQuery events ------------------------------------------------------------------------------
/*
 *
 * menu items ---------------------------------------------------------------------------------
 *
 */
/**
 * menu item click handler
 *
 * #menuNewOnMap - set draggable red marker with start icon for new atm in map center
 *
 */
$('#menuNewOnMap').click( function (e) {

	createNewMarker(cashMap.getCenter());

});

/**
 * menu item click handler
 *
 * #osmLoginToggle - menu OSM / item Anmelden/Abmelden
 *
 * login in to osm / logout from OSM
 * sets #osmLoginToggle and #osmLogin
 */
$('#osmLoginToggle').click( function (e) {

	if (!cashMapAuth.authenticated()) {

		cashMapAuth.authenticate( function() {
			showCurrentOsmUser();
		});

	} else {

		cashMapAuth.logout();
		showCurrentOsmUser();

	}
	return false;
});


/*
 *
 * Sidebar ------------------------------------------------------------------------------------
 *
 */
/**
 * close sidebar button click handler
 *
 */
$('#btnHideSidebar').click( function (e) {

	// hide sidebar
	showSidebar(false);

	return false;
});

// --- helper functions sidebar
/**
 *
 * showSidebar
 *
 * - show or hide sidebar
 * - always hide sidebar if screen width < 840 px
 *
 * @param show {boolean} -
 */
function showSidebar(show) {
	var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

	$("#sideBar").animate(
		{width: (show ? 'show' : 'hide')},
		350,
		function() { cashMap.invalidateSize();	}
	);
	if (show) {
		btnShowSidebar.disable();
	} else {
		if (w > 840) {
			btnShowSidebar.enable();
		} else {
			btnShowSidebar.disable();
		}
	}
}

/**
 *
 * function syncSidebar
 *
 * (re)builds table of features according to map bounds
 *
 * - shows icon for bank/atm
 * - shows name/operator or <not defined>
 * - shows location icon if distance is measured to own location
 *     and cross icon if distance is measured from map center
 * - shows distance in m
 *
 */
function syncSidebar() {

	var mapCenterLatLng = cashMap.getCenter();
	var featureCenter = null;

	// empty sidebar table
	$('#tableFeature tbody').empty();

	// iterate atm layers array
	Object.keys(overlayLayers).forEach( function (verbund) {

		// check if layer group is visible
		if (cashMap.hasLayer(overlayLayers[verbund])) {

			// iterate all markers of layer group
			overlayLayers[verbund].eachLayer(function (layer) {

				var lat, lon = null;
				var type = layer.feature.geometry.type;

				// for polygons use centroid
				if (type === 'Polygon') {
					var centroid = turf.centroid(layer.feature);
					lon = centroid.geometry.coordinates[0];
					lat = centroid.geometry.coordinates[1];
					featureCenter = [lat, lon];

				} else if (type === 'Point') {

					featureCenter = layer.getLatLng();
					lon = layer.feature.geometry.coordinates[0];
					lat = layer.feature.geometry.coordinates[1];
					featureCenter = [lat, lon];

				} else {
					featureCenter = [10, 50];
				}

				// if shown on map: show in sidebar
				if (cashMap.getBounds().contains(featureCenter)) {

					var osmTags = layer.feature.properties.tags;
					var showText = null;

					// construct table row
					var tableRow = '<tr class="featureRow" id="' + L.stamp(layer) + '" verbund=' + verbund +
						' lat="' + lat + '" lng="' + lon + '"><td style="vertical-align: middle;">' +
						'<i class="fa fa-' + ((osmTags.amenity === 'bank') ? 'bank"' : 'euro"') + '></i></td>' +
						'<td class="featureName">';

					if (osmTags.operator) 		{ showText = osmTags.operator; }
					else if (osmTags.name) 		{ showText = osmTags.name; }
					else if (osmTags.brand) 	{ showText = osmTags.brand; }

					tableRow += showText ?
							(showText.length > 18 ? showText.substr(0,16) + '...' : showText) :
							'&lt;Kein Betreiber/Name&gt;';
					tableRow += '</td>' + '<td class="featureDistance">' +
						showDistance((myLocation ? myLocation : mapCenterLatLng), featureCenter) + '</td>' +
						'<td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>';

					$('#tableFeature tbody').append(tableRow);
				}
			});
		}
	});

	// TODO clearify creation of sidebarFeatureList object
	/* Update list.js cardFeatureList */
	sidebarFeatureList = new List('cardFeatureList', {
		valueNames: ['featureName', 'featureDistance']
	});
	sidebarFeatureList.sort('featureDistance', {
		order: "asc"
	});

}

/*
 *
 * document ------------------------------------------------------------------------------------
 *
 */
/**
 *
 * bind event handler <nmouseover> to document on no touch devices
 *
 * - check mouseover on sidebar row
 * - clear other highlights
 * - set highlight circle on marker (use attributes lat/lng from data row)
 */
if ( !('ontouchstart' in window) ) {

	$(document).on('mouseover', '.featureRow', function(e) {

		highlightLayer
			.clearLayers()
			.addLayer(L.circleMarker([$(this).attr('lat'), $(this).attr('lng')], highlightStyle));
	});

}


/**
 *
 * bind event handler <mouseout> to document
 *
 * - check mouseout on sidebar row
 * - de-highlight marker
 */
$(document).on('mouseout', '.featureRow', clearHighlight);


/**
 * bind event handler <click> to document
 *
 * - check click on sidebar row
 * - switch off de-highlight event handler
 * - generate click event on marker to open feature form
 */
$(document).on('click', '.featureRow', function(e) {

	// preserve highlight on mouseout
	$(document).off('mouseout', '.featureRow', clearHighlight);

	// center map on selected feature
	cashMap.setView([$(this).attr('lat'), $(this).attr('lng')], 15);

	// open modal for selected feature
	overlayLayers[$(this).attr('verbund')]
		.getLayer(parseInt($(this).attr('id'), 10))
		.fire('click');

});


/*
 *
 * Modal windows --------------------------------------------------------------------------------
 *
 */
/**
 *
 * bind event handler on <hidden.bs.modal> of feature form
 *
 * - reactivate de-highlight marker on mouseout
 */
$('#featureModal').on('hidden.bs.modal', function (e) {

	$(document).on('mouseout', '.featureRow', clearHighlight);

});

//
/**
 *
 * function <clearHighlight>
 *
 * - de-highlight marker
 */
function clearHighlight() {

	highlightLayer.clearLayers();

}
/*
 *
 * osmAuthModal ----------------------------------------------------------------------------------------
 *
 */
/**
 * button click handler
 *
 * #btnOsmLogin - dialogbox osm authentication required
 *
 * login to OSM, request user details
 */
$('#btnOsmLogin').click( function (e) {

	if (!cashMapAuth.authenticated()) {

		cashMapAuth.authenticate( function() {

			// showCurrentOsmUser sets #osmLoginToggle and #navbarDropdownOsm
			showCurrentOsmUser();

		});
	}
});

/*
 *
 * newFeatureModal  -----------------------------------------------------------------------------------
 *
 */

/**
 * #newFeatureModal - show event
 *
 * init form GUI
 */
$('#newFeatureModal').on('show.bs.modal', function (e) {

	initNewFeatureForm();

});


/**
 * selectbox change handler
 *
 * #operatorSelect - set atm network field according to bank select
 */
$('#operatorSelect').change(function() {
	var network = '';

	var operator = $('#operatorSelect').find('option:selected').text();

	if (operator.search(expSparkasse) > -1) 		{ network = 'Sparkassen-Finanzverbund';	}
	else if (operator.search(expVRBanken) > -1) 	{ network = 'BankCard-Netz (VR-Banken)'; }
	else if (operator.search(expCashPool) > -1) 	{ network = 'Cashpool';	}
	else if (operator.search(expCashGroup) > -1) 	{ network = 'Cash Group'; }
	else 											{ network = 'Keiner'; }

	// show operator input field in case of Sparkassen, VR-Banken, Andere
	if (operator === 'Sparkassen ...' || operator === 'VR-Banken ...') {
		$("#operatorInput").html('').prop('disabled', false).attr('placeholder', 'Institutsname ...');
	} else if (operator === 'Andere ...') {
		$("#operatorInput").html('').prop('disabled', false).attr('placeholder', 'Bank/Betreiber ...');
	} else {
		$("#operatorInput").html('').prop('disabled', true).attr('placeholder', '');
	}

	// select network item form control
	$('#networkSelect').val(network).attr('selected', true);

	return false;
});


/**
 * select box change handler for #typeOpeningSelect and #typeOpeningSelectFast
 *
 * - call handler function
 *
 * - reads opening hours type selector and shows different fields dynamically
 * - called for new feature (#typeOpeningSelect) and for existing feature (#typeOpeningSelectFast)
 *
 * @param e {event} 	- event object
 */
$('#typeOpeningSelect, #typeOpeningSelectFast').change(function (e) {
	var typ = $(this).find('option:selected').val();

	// check caller DOM element (#typeOpeningSelect / #typeFastOpeningSelect)
	var fieldSuffix = ($(this)[0].id === 'typeOpeningSelect' ? '' : 'Fast');

	$('#openingHoursHidden' + fieldSuffix).val('');
	// reset created DIVs
	$('#timeFields' + fieldSuffix).remove();
	$('#ohFields' + fieldSuffix).remove();

	// set 24/7, no dynamic fields
	if (typ === '1') {

		$('#openingHoursHidden' + fieldSuffix).val('24/7');

	// set Mo-Fr, create fields for slot1 and slot2, remove textual input field
	} else if (typ === '2') {

		$(this).closest('.form-group').append(
			'<div class="form-group mt-2" id="timeFields' + fieldSuffix + '">' +
				'<div class="form-inline flex-row justify-content-center">' +
					ohFieldSetAsHTML(fieldSuffix, '1') +
				'</div>' +
				'<div class="form-inline flex-row justify-content-center mt-2">' +
					ohFieldSetAsHTML(fieldSuffix, '2') +
				'</div>' +
			'</div>'
		);

	} else if (typ === '3') {

		$(this).closest('.form-group').append(
			'<div class="form-group" id="ohFields' + fieldSuffix + '">' +
				'<small class="text-muted ml-2">' +
					'OSM-Attribut [' +
						'<a target="_blank" href="http://wiki.openstreetmap.org/wiki/Key:opening_hours">opening_hours</a>]' +
				'</small>' +
				'<input class="form-control" name="xosmOpeningText' + fieldSuffix +
					'" id="osmOpeningText' + fieldSuffix + '" type="text">' +
			'</div>'
		);
	}
});

/**
 *
 * @param suffix
 * @param count
 *
 * @returns {string} HTML String to create two opening intervals
 */
function  ohFieldSetAsHTML (suffix, count) {
	return (
		'<label class="hidden-sm-down mx-3" for="' + 'fromTime' + count + suffix + '">von</label>' +
		'<input class="form-control col-5 col-md-4" name ="x' + 'fromTime' + count + suffix + '" ' +
		'id="' + 'fromTime' + count + suffix + '" type="time" placeholder="hh:mm">' +
		'<label class="hidden-sm-down mx-3" for="' + 'fromTime' + count +  suffix + '">bis</label>' +
		'<label class="hidden-md-up m-0" for="' + 'fromTime' + count + suffix + '">&nbsp;-&nbsp;</label>' +
		'<input class="form-control col-5 col-md-4" name ="x' + 'toTime' + count + suffix + '" ' +
		'id="' + 'toTime' + count + suffix + '" type="time" placeholder="hh:mm">'
	);
}

/**
 * toggle chevron on fold/unfold collapsibles
 * (chevron is showing where the collapsible will go on click (up vs. down)!)
 */
$('#collapseGeneral').on('hidden.bs.collapse', toggleChevron);
$('#collapseGeneral').on('shown.bs.collapse', toggleChevron);

$('#collapseAddress').on('hidden.bs.collapse', toggleChevron);
$('#collapseAddress').on('shown.bs.collapse', toggleChevron);

$('#collapseOpening').on('hidden.bs.collapse', toggleChevron);
$('#collapseOpening').on('shown.bs.collapse', toggleChevron);

$('#collapseOther').on('hidden.bs.collapse', toggleChevron);
$('#collapseOther').on('shown.bs.collapse', toggleChevron);

/**
 *
 * card header in #accordionNewFeature - change icon (chevron direction) on expand&collapse
 *
 * @param e - event object
 */
function toggleChevron(e) {

	$(e.target).prev('.card-header')
		.find('i.indicator')
		.toggleClass('fa-chevron-down fa-chevron-up');

}



/**
 * button click handler
 *
 * #btnAskForDelete - ask for delete confirmation
 *
 * 		check for authentication
 * 		if not show auth dialog
 * 		if yes read feature version via API 0.6 (is not read by overpass api)
 * 		call deleteFeature
 */
$('#btnAskForDelete').click ( function (event) {
	var featureId = $('#featureId');

	if (!cashMapAuth.authenticated()) {

		$('#osmAuthInfoModal').modal('show');

	} else {

		deleteFeature(featureId);
	}

});


/**
 * hack to activate first tab of help Modal
 */
$('#helpModalTabs a.nav-link')
	.filter(function() {return $(this).css('display') === 'block'; })
	.first()
	.tab('show');


/**
 * button click handler #btnCancelMoveFeature - cancel movement
 *
 * read marker (layer object) from DOM
 * set marker back to old position
 */
$('#btnCancelMoveFeature').click( function (e) {

	var marker = $('#layerObj').val()[0];
	marker.setLatLng([
		$('#oldLatitudeHidden').val(),
		$('#oldLongitudeHidden').val()
	]);
});

/**
 *
 * readFeatureDetails - read the feature details as XML
 *
 * get xml data of feature via API 0.6 and store it in DOM (#featureXML)
 *
 * @param featureId {string}
 */
function readFeatureDetailsAsXML (featureId) {

	$.get({
		url: "https://api.openstreetmap.org/api/0.6/" + featureId,
		dataType: "xml",
		success: function (data, textStatus, jqXHR) {
			$('#featureXML').val(data);
		}
	});
}




/**
 *
 * deleteFeature - ask for deletion of the feature from OSM database
 *
 * @param featureId - Id of feature to delete
 */
function deleteFeature (featureId) {

	// set header
	$('#deleteFeatureTitle').html($('#feature-title').html() + ' l&ouml;schen');

	// set osm tags table for modal window
	$('#delFeatureOsmTags').html($('#osmTags').html());

	// init deletion form
	initDeleteFeatureForm();

	// show modal for deletion
	$("#deleteFeatureModal").modal('show');
}


/**
 * main function (after DOM is loaded) *************************************************************
 */
$(function () {

	// check OSM authentication, if yes show authenticated user
	showCurrentOsmUser();

	// get polygon to check if atm is in Germany
	readGermanyBorders();

	// locate geo position
	// TODO add delay for message
	showInfo('Ermittle Deinen Standort ...');

	// TODO load larger area and set view to nearest ATM
	cashMap.locate({
		setView: true,
		maxZoom: 15
	});

	// read routing polygons
	initRoutingAreas ();

	// resize window to initalize UI
	$(window).trigger('resize');

	if ($('#sideBar').is(':visible')) { btnShowSidebar.disable(); }

	/**
	 * form validation for #newFeatureForm
	 *
	 * #newFeatureForm - validate form fields <operator> and <comment>
	 *
	 *     if #operatorSelect = Sparkassen ...' | 'VR-Banken ...' | 'Andere ...' -> #operatorInput has to be filled
	 *     #commentInput has to be filled
	 *
	 *     reference to fields by <name> attribut, not <id>!
	 *     submit handler starts feature upload to OSM
	 *
	 *     TODO inhibit ENTER on form
	 */
	$('#newFeatureForm').validate({
		// validate fields even they are collapsed
		ignore: false,

		// do not validate on focusout
		onfocusout: false,

		// do not validate on keyup
		onkeyup: false,

		// validation rules per field
		rules: {
			// operator has to be filled
			operator: {
				required: true
			},
			specialOperator: {
				// <specialOperator> required for Andere, Sparkassen or VR-Banken
				required: {
					depends: function(element) {
						return (
							($('#operatorSelect').find('option:selected').text() === 'Andere ...') ||
							($('#operatorSelect').find('option:selected').text() === 'Sparkassen ...') ||
							($('#operatorSelect').find('option:selected').text() === 'VR-Banken ...')
						);
					}
				}
			},
			xtoTime1: {
				// <toTime 1> required when fromTime 1 filled
				required: {
					depends: function (element) {
						return ($('#xfromTime1').length > 0);
					}
				}
			},
			xtoTime2: {
				// toTime 2 required when fromTime 2 filled
				required: {
					depends: function (element) {
						return ($('#xfromTime2').length > 0);
					}
				}
			},
			xosmOpeningText: {
				// opening_hours required for type "Eingabe"
				required: {
					depends: function(element) {
						return ($('#typeOpeningSelect').find('option:selected').val() === '3');
					}
				},
				// check the string
				validateOpeningHours: true
			},
			xcomment: {
				required: true
			}
		},

		/**
		 * highlight: apply error marking
		 *
		 */
		highlight: function(element) {
			$(element).closest('.form-group, .form-inline').addClass('has-danger');
			$(element).addClass('form-control-danger');
		},

		/**
		 * unhighlight: delete error marking
		 */
		unhighlight: function(element) {
			$(element).closest('.has-danger').removeClass('has-danger');
			$(element).removeClass('form-control-danger');
		},

		/**
		 * errorPlacement - define how to show validation error message
		 *
		 * show message only for field <xosmOpeningText> (created by opening_hours lib)
		 */
		errorPlacement: function(error, element) {
			if (element.attr('name') === 'xosmOpeningText') {
				error.appendTo( element.parent() );
			}
		},

		/**
		 * function to be called on form submit
		 *
		 * creates opening hours string from Mo-Fr timeslots (if filled) and fill hidden field
		 * fill hidden field with opening hours string
		 * converts additional tag fields into key/value pairs
		 * calls creation of new changeset
		 * closes form
		 *
		 * @param form
		 */
		submitHandler: function (form) {

			// set hidden <opening_hours> field from time fields
			if ($('#timeFields').length > 0) {
				var openingHours = 'Mo-Fr ' + $('#fromTime1').val() + '-' + $('#toTime1').val();
				if ($('#fromTime2').val() !== '') {
					openingHours += ',' + $('#fromTime2').val() + '-' + $('#toTime2').val();
				}
				$("#openingHoursHidden").val(openingHours);
			}

			// set hidden <opening_hours> field from text field
			if ($('#osmOpeningText').length > 0) {
				$("#openingHoursHidden").val($('#osmOpeningText').val());
			}

			// convert additional tag/value pairs, mark with class addTagField to remove on initForm
			for (i = 1; i <= 3; i+=1) {
				if ($('#osmTag' + i).length > 0 && $('#osmValue' + i).length > 0) {
					$('#collapseOther .form-group').append(
						'<input class="addTagField" type="hidden" name="' + $('#osmTag' + i).val() +
							'" id="osmTagHidden' + i + '">');
					$('#osmTagHidden' + i).val($('#osmValue' + i).val());
				}
			}

			// write data to osm database (featureId is null)
			createChangeset( $("#commentInput").val(), null, uploadCreation, cashMapAuth );

			$("#newFeatureModal").modal('hide');
		},

		/**
		 *
		 * function to be called on invalid fields - iterates error list and opens the collapsed accordion to
		 * show error markings (red border+red cross)
		 *
		 * @param e
		 * @param validator
		 */
		invalidHandler: function(e, validator) {
			// loop through the errors and open collapsed
			validator.errorList.forEach(function (currentValue, index, array) {
				$(currentValue.element).closest('.collapse').collapse('show');
			});
		}
	}); // $('#newFeatureForm').validate()

	/**
	 * form validation for #delFeatureForm
	 *
	 * #deleteFeatureForm - validate form fields and <comment>
	 *
	 *     #commentDelete has to be filled
	 *
	 *     reference to fields by <name> attribut, not <id>!
	 *     submit handler starts deletion upload to OSM
	 *     empty function <errorPlacement> hides standard error messages
	 *
	 *     TODO inhibit ENTER on form
	 */
	$('#deleteFeatureForm').validate({
		// do not validate on focusout
		onfocusout: false,

		// do not validate on keyup
		onkeyup: false,

		// validation rules per field
		rules: {
			xcomment: {
				required: true
			}
		},

		/**
		 * highlight: apply error marking
		 *
		 * apply bootstrap 4 validation classes
		 *
		 * @param element
		 */
		highlight: function(element) {
			$(element).closest('.form-group, .form-inline').addClass('has-danger');
			$(element).addClass('form-control-danger');
		},

		/**
		 * unhighlight: delete error marking
		 *
		 * remove bootstarp 4 validation classes
		 *
		 * @param element
		 */
		unhighlight: function(element) {

			$(element).closest('.has-danger').removeClass('has-danger');
			$(element).removeClass('form-control-danger');
		},

		/**
		 * errorPlacement - define how to show validation error message

		 *
		 * @param error
		 * @param element
		 */
		errorPlacement: function(error, element) {
		},

		/**
		 * function to be called on form submit
		 *
		 * calls creation of new changeset
		 * closes form
		 *
		 * @param form
		 */
		submitHandler: function (form) {

			createChangeset($('#commentDelete').val(), $('#featureId').val(), uploadDeletion, cashMapAuth);

			$("#deleteFeatureModal").modal('hide');

		}

	}); // $('#deleteFeatureForm').validate()

	/**
	 * form validation for #newFastOpeningForm
	 *
	 * #newFastOpeningForm - validate form fields für fast editing of opening hours
	 *
	 *     reference to fields by <name> attribut, not <id>!
	 *     submit handler starts update upload to OSM
	 *     empty function <errorPlacement> hides standard error messages
	 *
	 *     TODO inhibit ENTER on form
	 */

	$('#newFastOpeningForm').validate({
		// do not validate on focusout
		onfocusout: false,

		// do not validate on keyup
		onkeyup: false,

		// validation rules per field
		rules: {
			xtypeOpeningFast: 	{ required: true },
			xfromTime1Fast: 	{ required: true },
			xtoTime1Fast: 		{ required: true },
			xtoTime2Fast: {
				// toTime 2 required when fromTime 2 filled
				required: { depends: function (element) { return ($('#fromTime2Fast').val() !== ''); }}
			},
			xosmOpeningTextFast: {
				// opening_hours required for type "Direkteingabe"
				required: {
					depends: function(element) {
						return ($('#typeOpeningSelectFast').find('option:selected').val() === '3');
					}
				},
				// check the string via validation method "validateOpeningHours"
				validateOpeningHours: true
			},
			xcomment: 			{ required: true }
		},

		/**
		 * highlight: apply error marking
		 *
		 * apply bootstrap 4 validation classes
		 *
		 * @param element
		 */
		highlight: function(element) {
			$(element).closest('.form-group, .form-inline').addClass('has-danger');
			$(element).addClass('form-control-danger');
		},

		/**
		 * unhighlight: delete error marking
		 *
		 * remove bootstarp 4 validation classes
		 *
		 * @param element
		 */
		unhighlight: function(element) {
			$(element).closest('.has-danger').removeClass('has-danger');
			$(element).removeClass('form-control-danger');
		},

		/**
		 * errorPlacement - define how to show validation error message
		 *
		 * @param error
		 * @param element
		 */
		errorPlacement: function(error, element) {
			if (element.attr('name') === 'xosmOpeningTextFast') {
				error.appendTo( element.parent() );
			}
		},

		/**
		 * function to be called on form submit
		 *
		 * calls creation of new changeset
		 * closes form
		 *
		 * @param form
		 */
		submitHandler: function (form) {

			// set hidden <opening_hours> field from time fields
			if ($('#timeFieldsFast').length > 0) {
				var openingHours = 'Mo-Fr ' + $('#fromTime1Fast').val() + '-' + $('#toTime1Fast').val();
				if ($('#fromTime2Fast').val() !== '') {
					openingHours += ',' + $('#fromTime2Fast').val() + '-' + $('#toTime2Fast').val();
				}
				$('#openingHoursHiddenFast').val(openingHours);

			}

			// set hidden <opening_hours> field from text field
			if ($('#osmOpeningTextFast').length > 0) {
				$("#openingHoursHiddenFast").val($('#osmOpeningTextFast').val());
			}

			// write data to osm database
			createChangeset( $('#OhCommentInputFast').val(), $('#featureId').val(), uploadModification );

			$("#newFastOpeningModal").modal('hide');
		}

	}); // $('#newFastOpeningForm').validate()


	/**
	 * form validation for #delFeatureForm
	 *
	 * #moveFeatureForm - validate  <comment>
	 *
	 *     #commentMove has to be filled
	 *
	 *     reference to fields by <name> attribut, not <id>!
	 *     empty function <errorPlacement> hides standard error messages
	 *
	 *     TODO inhibit ENTER on form
	 */
	$('#moveFeatureForm').validate({
		// do not validate on focusout
		onfocusout: false,

		// do not validate on keyup
		onkeyup: false,

		// validation rules per field
		rules: {
			xcomment: 	{ required: true }
		},

		/**
		 * highlight: apply error marking
		 *
		 * apply bootstrap 4 validation classes
		 *
		 * @param element
		 */
		highlight: function(element) {
			$(element).closest('.form-group, .form-inline').addClass('has-danger');
			$(element).addClass('form-control-danger');
		},

		/**
		 * unhighlight: delete error marking
		 *
		 * remove bootstarp 4 validation classes
		 *
		 * @param element
		 */
		unhighlight: function(element) {
			$(element).closest('.has-danger').removeClass('has-danger');
			$(element).removeClass('form-control-danger');
		},

		/**
		 * errorPlacement - define how to show validation error message
		 *
		 * @param error
		 * @param element
		 */
		errorPlacement: function(error, element) {
		},

		/**
		 * function to be called on form submit
		 *
		 * calls creation of new changeset
		 * closes form
		 *
		 * @param form
		 */
		submitHandler: function (form) {

			// write data to osm database
			createChangeset( $('#commentMove').val(), $('#featureId').val(), uploadMove, cashMapAuth );

			$("#moveFeatureModal").modal('hide');
		}

	}); // $('#moveFeatureForm').validate()

	/**
	 * defines validation method "validateOpeningHours"
	 *
	 * {string} name: name of method used in rule definition
	 * {function}: returns true (valid) when item not empty and has no error
	 * {function}: returns error message
	 */
	$.validator.addMethod("validateOpeningHours",
		function(value, element) {
			return this.optional(element) || !(getOpeningHoursError (element.value));
		},
		function (value, element) {
			return getOpeningHoursError (element.value);
		}
	);

});


/**
 * validates opening_hours string <ohString> by creating an oh object with opening_hours library
 * return error description in German (locale = de)
 *
 * @param ohString
 *
 * @returns {string} err - error msg from opening_hours lib
 */
function getOpeningHoursError (ohString) {

	try {
		var oh = new opening_hours(
			ohString,
			{
				"address":{
					"country":"Deutschland",
					"country_code":"de"
				}
			},
			{ 'locale': 'de' });
	} catch (err) {

		srvLog(err);
		return (err);
	}

	return null;
}


// helper functions ---------------------------------------------------------------------------------------
/**
 * showCurrentOsmUser - Calls the OSM API to get the logged in user details as xml and show name in menu
 *
 * 	- sets the user details in menu item "OSM"
 * 	- toggles the login/logout out menu item text
 *
 */
function showCurrentOsmUser () {

	if (cashMapAuth.authenticated ()) {
		cashMapAuth.xhr({
			method: "GET",
			path: "/api/0.6/user/details"

		}, function(err, details) {
			if (err) {

				srvLog ('auth error: '  + err);

			} else {

				$('#osmUser').html(details.getElementsByTagName('user')[0].getAttribute("display_name"));
				$("#osmLoginToggle").html('<i class="fa fa-sign-out"></i>&nbsp;&nbsp;Abmelden');

			}

		});
	} else {

		$("#osmLoginToggle").html('<i class="fa fa-sign-in"></i>&nbsp;&nbsp;Anmelden');
		$('#osmUser').html('nicht angemeldet');

	}
}


/**
 *
 * showDistance - return distance string with unit between loc and featurePos
 *
 * show meters without comma
 * show kilometers with 1 decimal after comma
 * 
 * @param loc {L.LatLng}
 * @param featurePos {L.LatLng}
 *
 * @returns {string}
 */
function showDistance (loc, featurePos) {

	return ((myLocation ? '<i class="fa fa-location-arrow"></i>&nbsp;' : '<i class="fa fa-crosshairs"></i>&nbsp;') +
		formatDistance(loc.distanceTo(featurePos)));
}


/**
 *
 * @param distMeter - distance in meters
 * @returns {string}
 */
function formatDistance (distMeter) {

	return (Math.round(distMeter/10) * 10 + ' m');

}


/**
 *
 * @param timeSec - duration in seconds
 *
 * @returns {string} - returns formatted duration
 */
function formatTime (timeSec) {
	var hour = Math.floor( timeSec / 3600 );
	var min = Math.floor( (timeSec%3600) / 60 );

	if (hour !== 0) {
		return (hour + ':' + min + ' h');
	} else {
		if (min === 0) {
			return ('<1 min');
		} else {
			return (min + ' min');
		}
	}
}


$('#btnWarningClose').click (function () {
	hideWarning();
});

$('#btnDangerClose').click (function () {
	hideError();
});

function showInfo(text) {
	$('#infoAlertText').html(text);
	$('#infoAlert').removeClass('invisible');
	setTimeout(hideInfo, 3000);
}
function hideInfo() {
	$('#infoAlertText').html('');
	$('#infoAlert').addClass('invisible');
}

function showWarning(text) {
	$('#warningAlertText').html(text);
	$('#warningAlert').removeClass('invisible');
}
function hideWarning() {
	$('#warningAlertText').html('');
	$('#warningAlert').addClass('invisible');
}

function showError(text) {
	$('#dangerAlertText').html(text);
	$('#dangerAlert').removeClass('invisible');
}
function hideError() {
	$('#dangerAlertText').html('');
	$('#dangerAlert').addClass('invisible');
}

/**
 *
 */
function initRoutingAreas () {

	$.getJSON('https://developers.route360.net/api/endpoint')
	.done( function (data) {

		// iterate routing regions
		data.forEach(function (area) {
			var routingArea = {};
			routingArea.name 		= area.name;
			routingArea.endpoint 	= area.endpoint;
			routingArea.layer 		= L.geoJSON(area.region);
			routingArea.hasTransit 	= area.hasTransit;

			// build area of routing regions
			routingRegions.push(routingArea);

		});
		routingAvailable = true;
	})
	.fail( function(jqXHR, statusText, errorThrown) {

		srvLog('route360 not available: ' + errorThrown + '/' + statusText);
		routingAvailable = false;

	});
}

/**
 *
 * function readGermanyBorders
 *
 * reads the German border polygon as geoJSON from file
 *
 */
function readGermanyBorders () {

	$.getJSON('data/de.geojson')
	.done( function (data) {
		borderLayer = L.geoJSON(data, {	});
	})
	.fail( function (jqXHR, textStatus, errorThrown) {
		srvLog('de border polygon - load failed'  + errorThrown +'/' + textStatus);
	});
}

/**
 * getRoutingArea - returns the endpoint + hasTransit for route360 routing service url
 *
 * - check if both endpoints are in same region
 * - if not returns null
 *
 * @param src {L.LatLng}
 * @param tgt {L.LatLng}
 *
 */
function getRoutingArea (src, tgt) {
	var srcEndpoint 	= null;
	var tgtEndpoint 	= null;
	var results 		= [];
	var hasTransit 		= false;

	if (routingAvailable) {
		routingRegions.forEach(function (region) {
			results = leafletPip.pointInLayer(src.getLatLng(), region.layer, true);
			if (results.length > 0) {
				srcEndpoint = region.endpoint;
				hasTransit = region.hasTransit;
			}
		});

		routingRegions.forEach(function (region) {
			results = leafletPip.pointInLayer(tgt.getLatLng(), region.layer, true);
			if (results.length > 0) {
				tgtEndpoint = region.endpoint;
			}
		});

		if (srcEndpoint === tgtEndpoint) {
			routingAvailable = true;
			return (
				{
					endpoint: srcEndpoint,
					transit: hasTransit
				}
			);
		} else {
			routingAvailable = false;
			return null;
		}
	} else {
		return null;
	}
}


/**
 *
 * loadOsmData - load data from OSM via Overpass API and create map layers per atm network
 *
 * 	- get map bounds and use it as bbox for API call
 *
 * @param zoom
 */

function loadOsmData (zoom) {

	if (zoom < MIN_ZOOM) {

		currentDataBounds = null;
		showWarning('Zoome weiter hinein, um Daten anzuzeigen!');

		return;
	}

	// compute padding (enlarge the area to be loaded)
	// only zoom levels: 13..18 /
	// 13,14: small factor each direction (pad = .2)
	// 15,16: double in each direction
	// 17,18: two times in each direction
	if (zoom >= MIN_ZOOM && zoom <= 14) {
		paddingFactor = 0.5;
	} else if (zoom >= 15 && zoom <= 16) {
		paddingFactor = 1;
	} else if (zoom >= 17) {
		paddingFactor = 2;
	}

	currentDataBounds = cashMap.getBounds().pad(paddingFactor);

	cashMap.spin(true, {color: '#0026FF', radius: 20, width: 7,	length: 20,	top: 10	});

	var bboxString = '(' +
		currentDataBounds.getSouth().toString() + ',' +
		currentDataBounds.getWest().toString() + ',' +
		currentDataBounds.getNorth().toString() + ',' +
		currentDataBounds.getEast().toString() + ')';
	
	var osmOverpassCall = 'https://overpass-api.de/api/interpreter?data=[out:json];(' +
		'node["amenity"="bank"]["atm"="yes"]' + bboxString + ';' +
		'way["amenity"="bank"]["atm"="yes"]' + bboxString + ';' +
		'node["amenity"="atm"]' + bboxString + ';' +
		'way["amenity"="atm"]' + bboxString + ';);(._;>;);out body qt;';

	$.getJSON(osmOverpassCall)
		.done( function (data) {

			// convert overpass JSON to GeoJSON
			var atmDataAsGeojson = osmtogeojson(data);

			clearAtmLayersAndRoutes();

			// create geoJson Layers (one per atm network) and put in overlayLayers Object
			Object.keys(overlayLayers).forEach( function (verbund) {

				overlayLayers[verbund] = createAtmNetworkLayer(atmDataAsGeojson, verbund);

				if (overlayLayers[verbund].getLayers().length > 0) {

					// add layer group to map
					cashMap.addLayer(overlayLayers[verbund]);

					// create svg icon
					var myIcon = '<svg width="15px" height="20px" viewBox="0 0 32 52" version="1.1" ' +
						'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
						'<defs><radialGradient id="verlauf_' + verbund + '" r="50%" fx="50%" fy="20%">' +
						'<stop offset="0%" stop-color="white" />' +
						'<stop offset="100%" stop-color="' + STANDARD_COLOR[verbund] + '" />' +
						'</radialGradient></defs>' +
						'<path fill="url(#verlauf_' +	[verbund] + ')" stroke="black" stroke-width="1" ' +
						'd="M16,1 C7.7146,1 1,7.65636364 1,15.8648485 C1,24.0760606 16,51 16,51 C16,51 31,24.0760606 31,15.8648485 C31,7.65636364 24.2815,1 16,1 L16,1 Z"></path></svg>';

					// add layer group to layer control
					cashMapLayerControl.addOverlay(overlayLayers[verbund], myIcon + '&nbsp;' + NETWORK_SHORTNAME[verbund]);
				}
			});

			cashMap.spin(false);
			syncSidebar();

		})
		.fail( function (jwxhr_Object) {

			cashMap.spin(false);
			srvLog('error on overpass load: ' + jwxhr_Object.status + ' - ' + jwxhr_Object.statusText);

			// TODO repeat data load on error
			showError('OSM-Daten konnten nicht gelesen werden.' +
				' <span class="errorCode">(Fehler: ' + jwxhr_Object.status + ' - ' +
				jwxhr_Object.statusText + ')</span>');

			syncSidebar();

		});
}

/**
 *
 * createAtmNetworkLayer: creates a layer on map for specified atm pool <networkName> from geojson data
 * 		uses networkMarkerColor to define marker color (from predefined set)
 *
 * @param {json} geoJsonData - data in geojson format
 * @param {string} networkName - atm pool ("sparkasse"|"vrbanken"|"cashgroup"|"cashpool"|'keiner')
 *
 * @returns {L.geoJSON} - geoJSON layer object
 */
function createAtmNetworkLayer (geoJsonData, networkName) {
	return L.geoJSON(geoJsonData, {

		/**
		 *  option: filter
		 *
		 * @param feature - current map feature
		 * @param layer - layer of current feature
		 *
		 * @returns {boolean} - returns true if feature belongs to <networkName>
		 */
		filter: function (feature, layer) {
			return (atmInNetwork(feature, networkName));
		},

		/**
		 *  option: pointToLayer
		 *
		 * @param feature - current map (point) feature
		 * @param latlng - coordinates of current map (point) feature
		 *
		 * @returns {L.marker} - returns marker with styling, icon and context menu
		 */
		pointToLayer: function (feature, latlng) {
			var ohDefined = false;
			var mColor = STANDARD_COLOR[networkName];
			var oh = {};
			var featureTitle = '';
			var osmTags = feature.properties.tags;

			/* GLS customizaton !!
			if (osmTags.hasOwnProperty('name') && osmTags.name.search(/gls/i) > -1) {
				mColor = '#6A9140';
			} else {
				if (osmTags.hasOwnProperty('operator') && osmTags.operator.search(/gls/i) > -1) {
					mColor = '#6A9140';
				}
			}
			*/

			if (osmTags.amenity === 'bank') {
				if (osmTags.hasOwnProperty('name')) {
					featureTitle = osmTags.name;
				} else if (osmTags.hasOwnProperty('operator')) {
					featureTitle = osmTags.operator;
				} else if (osmTags.hasOwnProperty('brand')) {
					featureTitle = osmTags.brand;
				} else {
					featureTitle = 'Kein Name erfasst';
				}
			} else {
				if (osmTags.hasOwnProperty('operator')) {
					featureTitle = osmTags.operator;
				} else if (osmTags.hasOwnProperty('name')) {
					featureTitle = osmTags.name;
				} else if (osmTags.hasOwnProperty('brand')) {
					featureTitle = osmTags.brand;
				} else {
					featureTitle = 'Kein Operator erfasst';
				}
			}

			if (osmTags.opening_hours) {

				// opening hours lib throws error on invalid values
				try {
					oh = new opening_hours(
						osmTags.opening_hours,
						{
							'address': {
								'country':'Deutschland',
								'country_code':'de'
							}
						},
						{'locale': 'de'});
					ohDefined = (oh.getWarnings().length === 0);
				} catch (err){

				}
			}

			// return svg marker with color
			return L.marker(latlng, {
					icon: L.VectorMarkers.icon(
						{
							iconSize: [35,50],
							icon: osmTags.amenity === 'bank' ? 'bank' : 'euro',
							prefix: 'fa',
							markerColor: mColor,
							iconColor: (ohDefined) ? (oh.getState() ? '#278c11' : '#c60816') : 'black',
							svgDefs: '<defs><radialGradient id="verlauf' + mColor +
								'" r="50%" fx="50%" fy="20%">' +
								'<stop offset="0%" stop-color="white" />' +
								'<stop offset="100%" stop-color="' + mColor + '" /></radialGradient></defs>',
							svgPathOptions: 'fill="url(#verlauf' + mColor + ')" ' +
								'style="stroke: ' + mColor + '; stroke-width: 2;"',
							svgPathDescription: 'M16,1 C7.7146,1 1,7.65636364 1,15.8648485 C1,24.0760606 16,51 16,51 C16,51 31,24.0760606 31,15.8648485 C31,7.65636364 24.2815,1 16,1 L16,1 Z'
						}),
					riseOnHover: true,
					draggable: true,
					title: featureTitle
				}
			);

		},

		/**
		 *  option: style
		 *
		 * @param feature - current map (polygon) feature
		 *
		 * @returns {L.path} - returns polygon style object
		 */
		style: function (feature) {

			return {
				weight: 3,
				color: STANDARD_COLOR[networkName],
				opacity: 0.8,
				bubblingMouseEvents: false
			}
		},
		/**
		 *
		 * option: onEachFeature
		 *
		 * create texts for info modal tabs and register event handler to show modal on click
		 *
		 * @param feature
		 * @param layer
		 */
		onEachFeature: function (feature, layer) {

			var osmTags = feature.properties.tags;

			if (osmTags) {

				// Modal  / Tab Allgemein füllen
				var featureTitle = (osmTags.amenity === "bank") ? "Bank" : "Geldautomat";
				var featureInfo = '';
				var openingTable = '';
				var osmInfoMissing = '';

				var oh = {};
				var ohValid = false;

				// [operator]
				if (osmTags.operator) {
					featureInfo += ((featureTitle === 'Bank') ? '<p>Name: ' : '<p>Betrieben von: ') +
						osmTags.operator + '</p>';
				} else {
					osmInfoMissing += (featureTitle === 'Geldautomat') ?
						'<p><i>Betreiber (Attribut [' +
						'<a target="_blank" href="http://wiki.openstreetmap.org/wiki/Key:operator">operator</a>' +
						']) nicht erfasst.</i></p>' : '';
					if (osmTags.name) {
						featureInfo += ((featureTitle === 'Bank') ? '<p>Name: ' : '<p>Betrieben von: ') +
							osmTags.name + '</p>';
					} else {
						osmInfoMissing += '<p><i>Bankname (Attribut [' +
							'<a target="_blank" href="http://wiki.openstreetmap.org/wiki/Key:name">name</a>' +
							']) nicht erfasst.</i></p>';
					}
				}

				// [network]
				if (osmTags.network) {
					featureInfo += '<p>Automatenverbund: ' + (osmTags.network) + '</p>';
				} else {
					featureInfo += '<p>Automatenverbund: ' + NETWORK_NAME[getAtmNetwork(feature)];
					osmInfoMissing +=	((featureTitle === 'Geldautomat') ?
						'<p><i>Automatenverbund (Attribut [' +
						'<a target="_blank" href="http://wiki.openstreetmap.org/wiki/Key:network">network</a>' +
						']) nicht erfasst.</i></p>' : '');
				}

				if (osmTags.cash_in && osmTags.cash_in === 'yes') {
					featureInfo += '<p>Einzahlung m&ouml;glich</p>';
				}

				// [opening_hours] is defined
				if (osmTags.opening_hours) {

					// try to parse opening hours
					try {
						oh = new opening_hours(	osmTags.opening_hours,
							{
								"address":{
									"country":"Deutschland",
									"country_code":"de"
								}
							},
							{ 'locale': 'de' });

						ohValid = (oh.getWarnings().length === 0);
					} catch (err) {
						srvLog('opening_hours err: ' + feature.id + '/' + err)
					}

					// fill table via SimpleOpeningHours
					var ohSimple = new SimpleOpeningHours(osmTags.opening_hours);
					var ohSimpleTable = ohSimple.getTable();

					// if opening hours could be parsed
					if (ohValid) {

						featureInfo += (oh.getState() ?
							'<p class="text-success font-weight-bold">Jetzt ge&ouml;ffnet.</p>' :
							'<p class="text-danger font-weight-bold">Jetzt geschlossen.</p>');

						// create simplified table of opening_hours
						openingTable = '<table class="table table-striped table-bordered table-responsive">';
						Object.keys(ohSimpleTable).forEach(function (dayOfWeek) {
							if (ohSimpleTable[dayOfWeek][0]) {
								openingTable += "<tr><td>" + WOCHENTAG_NAME[dayOfWeek] + "</td><td>";
								ohSimpleTable[dayOfWeek].forEach(function (oh) {
									openingTable += oh + "    ";
								});
								openingTable += "</td></tr>";
							}
						});
						openingTable += "</table>";
					} else {
						openingTable =
							'<div class="d-flex flex-column flex-sm-row justify-content-center">' +
								'<span class="align-middle my-2 mr-4">Erfasste &Ouml;ffnungszeit ist ung&uuml;ltig.</span>' +
								'<button type="button" class="btn btn-outline-secondary" id="btnEditOpeningHours">' +
								'Jetzt korrigieren</button>' +
							'</div>';
					}

				// [opening_hours] not defined, show button to enter
				} else {
					featureInfo 	+= '<p><strong>Keine &Ouml;ffnungszeit erfasst.</strong></p>';
					osmInfoMissing 	+= '<p><i>&Ouml;ffnungszeiten (Attribut [' +
						'<a target="_blank" href="http://wiki.openstreetmap.org/wiki/Key:opening_hours">opening_hours</a>' +
						']) nicht erfasst.</i></p>';

					openingTable =
						'<div class="d-flex flex-column flex-sm-row justify-content-center">' +
							'<span class="align-middle my-2 mr-4">Keine &Ouml;ffnungszeit erfasst.</span>' +
							'<button type="button" class="btn btn-outline-secondary" id="btnEditOpeningHours">' +
							'Jetzt erfassen</button>' +
						'</div>';
				}

				// Modal Tab OSM Info füllen
				var osmTagTable = buildOsmTagsTable(feature);

				/**
				 * event handler for start of dragging
				 *
				 * - fill DOM elements
				 * - read feature details as XML
				 */
				layer.on('dragstart', function (e) {

					clearHighlight();
					// save old position
					$('#oldLongitudeHidden').val(e.target.feature.geometry.coordinates[0]);
					$('#oldLatitudeHidden').val(e.target.feature.geometry.coordinates[1]);

					// marker opaque, show popup not closeable
					layer.setOpacity(0.7)
					.bindPopup('Objekt an neue Position verschieben', {closeButton: false})
					.addTo(cashMap);
					layer.openPopup();

				});

				/**
				 * event handler for end of marker drag ('dragend')
				 *
				 * - fill DOM elements
				 * - read feature details as XML
				 * - set form details
				 * - reverse geocode address
				 *  - open dialog form
				 */
				layer.on('dragend', function (e) {

					// reset marker
					layer.closePopup().unbindPopup().setOpacity(1);

					// check authorisation
					if (!cashMapAuth.authenticated()) {

						// restore old position
						layer.setLatLng([
							$('#oldLatitudeHidden').val(),
							$('#oldLongitudeHidden').val()
						]);

						// show login box
						$("#osmAuthInfoModal").modal('show');

					} else {

						var feat = e.target.feature;
						var coord = e.target._latlng;

						// store feature object
						$('#featureId').val(feat.id);
						$('#featureObj').val(feat);

						// store layer object (marker/polygon) in DOM for later use
						$('#layerObj').val($(this));

						// read feature details with API 0.6 and store as XML in #featureXML
						readFeatureDetailsAsXML(feat.id);

						$('#moveFeatureTitle').html('Standort korrigieren');

						// save new position in DOM for changeset
						$('#newLongitudeHidden').val(coord.lng);
						$('#newLatitudeHidden').val(coord.lat);

						initMoveFeatureForm();

						// reverse geocode address and fill new address fields
						cashMapGeoCoderProvider.reverse(
							coord,
							cashMap.options.crs.scale(cashMap.getZoom()),
							function (results) {

								if (results.length > 0) {

									results[0].properties.forEach(function (value) {
										if (value.types[0]) {
											if (value.types[0] === 'route') {
												$('#newStreetInput').val(value.long_name);
											} else if (value.types[0] === 'street_number') {
												$('#newNumberInput').val(value.long_name);
											} else if (value.types[0] === 'postal_code') {
												$('#newPostcodeInput').val(value.long_name);
											} else if (value.types[0] === 'locality') {
												$('#newCityInput').val(value.long_name);
											} else if (value.types[0] === 'country') {
												$('#newCountryInput').val(value.short_name);
												$('#newCountryLong').val(value.long_name)
											}
										}
									});
									$('#infoNewAddress').html('Neue Adresse:').removeClass('text-info');
								} else {

									$('#infoNewAddress').html('Adresse konnte nicht ermittelt werden.')
										.addClass('text-info');;
									// TODO Hinweis, das Adresse nicht ermittelt wurde
									srvLog('reverse geocoding error: ' + feat.id + ' - ' +
										coord.lat + '/' + coord.lng);
								}
							}
						);

						$('#moveFeatureModal').modal('show');
					}
				});

				/**
				 * mouse left click handler for marker ('click')
				 *
				 * - fill DOM elements
				 * - read feature details as XML and store in DOM
				 */
				layer.on('click', function (e) {

					// hidden fields
					// store feature object
					$('#featureId').val(feature.id);
					$('#featureObj').val(feature);

					// store layer object (marker/polygon) for routing
					$('#layerObj').val($(this));

					// read feature details with API 0.6 and store as XML in #featureXML
					readFeatureDetailsAsXML(feature.id);

					// fill 1st tab
					// set texts in modal elements
					$('#feature-title').html(featureTitle);
					$('#infoText').html(featureInfo);

					// fill 2nd tab
					// table of opening hours
					$('#openingTable').html(openingTable);

					// fill 3nd tab
					// table of osm tags
					$('#osmTagsTable').html(osmTagTable);
					// missing osm tags
					$('#osmInfoMissing').html(osmInfoMissing);

					// register click handler for new created button
					$('#btnEditOpeningHours').click(function (event) {

						// close current modal
						$("#featureModal").modal('hide');

						// init form for editing opening hours
						initNewFastOpeningForm ();

						// open modal #newFastOpeningModal
						$("#newFastOpeningModal").modal('show');
					});

					// hack to activate first visible tab
					$('#featureModalTabs')
						.find('a.nav-link')
						.filter(function() {return $(this).css('display') === 'block'; })
						.first()
						.tab('show');

					$("#featureModal").modal('show');
				});

				/**
				 * event handler for 'contextmenu'
				 *
				 * - do not propagate contextmenu event to map
				 */
				layer.on('contextmenu', function (e) {
					return false;
				});

			}
		}
	})
}


/**
 * initNewFeatureForm - reset form #newFeatureForm
 *
 * reset form fields
 * hide 2nd operator field
 * remove bootstrap error classes
 * open first accordion, set chevrons
 * remove dynamically created fields
 *
 */
function initNewFeatureForm () {
	var form = $('#newFeatureForm');

	// remove dynamically created fields for opening hours
	$('#timeFields').remove();
	$('#ohFields').remove();

	// remove dynamically created hidden fields for additional tags
	// TODO check jQuery filter vs. find for array removal
	$('#collapseOthers').find('.addTagField').remove();

	// disable operator field and delete placeholder
	$('#operatorInput').prop('disabled', true).attr('placeholder', '');

	// open first accordion
	$('#collapseGeneral').addClass('show')
		.find('i.indicator').addClass('fa-chevron-up').removeClass('fa-chevron-down');

	// close the others
	$('#collapseAddress').removeClass('show')
		.find('i.indicator').addClass('fa-chevron-down').removeClass('fa-chevron-up');
	$('#collapseOpening').removeClass('show')
		.find('i.indicator').addClass('fa-chevron-down').removeClass('fa-chevron-up');
	$('#collapseOther').removeClass('show')
		.find('i.indicator').addClass('fa-chevron-down').removeClass('fa-chevron-up');

	// reset form fields and remove validator markups
	form.trigger('reset');
	form.find('.has-danger').removeClass('has-danger');
	form.find('.form-control-danger').removeClass('form-control-danger');

}

/**
 *
 * initNewFastOpeningForm - reset form #newFastOpeningForm
 *
 * reset/clear form fields
 * remove bootstrap error classes

 */
function initNewFastOpeningForm () {
	var form = $('#newFastOpeningForm');

	// remove dynamically created fields for opening hours
	$('#ohFieldsFast').remove();

	// reset form fields and remove validator markups
	form.trigger('reset');
	form.find('.has-danger').removeClass('has-danger');
	form.find('.form-control-danger').removeClass('form-control-danger');
	form.find('.error').remove();

}

/**
 * initMoveFeatureForm - reset form #moveFeatureForm
 *
 * reset/clear form fields
 * remove bootstrap error classes
 *
 * */
function initMoveFeatureForm () {
	var form = $('#moveFeatureForm');

	// reset form fields and remove validator markups
	form.trigger('reset');
	form.find('.has-danger').removeClass('has-danger');
	form.find('.form-control-danger').removeClass('form-control-danger');
}


/**
 * initDeleteFeatureForm - reset form #deleteFeatureForm
 *
 * reset form fields
 *
 */
function initDeleteFeatureForm () {
	var form = $('#deleteFeatureForm');

	// reset form fields and remove validator markups
	form.trigger('reset');
	form.find('.has-danger').removeClass('has-danger');
	form.find('.form-control-danger').removeClass('form-control-danger');

}


//============================  Routing ======================================================
/**
 * button click handler "Zeige Route"
 *
 * #btnRouteZuFuss - show route "Zu Fuß"
 * #btnRouteRad - show route "Mit dem Rad"
 * #btnRouteOEPNV - show route "Mit ÖPNV"
 *
 * - check for polygon, if yes, take the center (turf.centroid()) as tgt
 * - call routeToFeature with target and travelType
 *
 */

$('#btnRouteZuFuss').click ( function (e) {

	// get  marker from saved DOM layer object
	var routeTargetLayer = $('#layerObj').val()[0];

	// calc center (when polygon) and calc route to it
	routeToFeature(getTargetMarker(routeTargetLayer), 'walk');

});

$('#btnRouteRad').click ( function (e) {

	// get  marker from saved DOM layer object
	var routeTargetLayer = $('#layerObj').val()[0];

	// calc center (when polygon) and calc route to it
	routeToFeature(getTargetMarker(routeTargetLayer), 'bike');

});

$('#btnRouteOEPNV').click ( function (e) {

	// get  marker from saved DOM layer object
	var routeTargetLayer = $('#layerObj').val()[0];

	// calc center (when polygon) and calc route to it
	// show info when public transport routing is not available
	if (!routeToFeature(getTargetMarker(routeTargetLayer), 'transit')) {
		showInfo('Kein &Ouml;PNV Routing verf&uuml;gbar.')
	}

});


/**
 *
 * routeToFeature - calc and display route to target marker
 *
 * set src marker to last geolocation or map center
 *
 * @param routeTargetMarker - target marker object
 * @param travelType {string} - travel type
 */
function routeToFeature (routeTargetMarker, travelType) {
	var srcLatLon = null;

	// clear existing src marker
	if (cashMap.hasLayer(routeSrcMarker)) { cashMap.removeLayer(routeSrcMarker); }

	// if geolocated set blue circle marker as source
	// TODO select route src point
	if (myLocation && cashMap.getBounds().contains(myLocation)) {

		myLocationMarker = L.circleMarker(myLocation, {radius: 2}).addTo(cashMap);
		srcLatLon = myLocation;

	} else {

		// set src to map center
		srcLatLon = cashMap.getCenter();
	}

	// define source marker and make it draggable
	routeSrcMarker = L.marker(
		srcLatLon,
		{
			icon: L.VectorMarkers.icon({
				icon: 'street-view',
				prefix: 'fa',
				markerColor: 'red',
				iconColor: 'white'
			}),
			draggable: true
		}
	);
	// check if routing type 'transit' is available
	if (travelType === 'transit' && !getRoutingArea(routeSrcMarker, routeTargetMarker).transit) {
		routeSrcMarker = null;
		return false;
	}

	routeSrcMarker.bindPopup('Ziehe den Marker ggf. zur gew&uuml;nschten Start-Position.')
		.addTo(cashMap);

	// delete blue circle marker on dragstart
	routeSrcMarker.on('dragstart', function (event) {
		if (cashMap.hasLayer(myLocationMarker)) { cashMap.removeLayer(myLocationMarker) }
	});

	// after drag end of source marker, show new route
	routeSrcMarker.on('dragend', function (event) {
		showRoute(routeSrcMarker, routeTargetMarker, travelType)
	});

	// do not propagate context menu event to map
	routeSrcMarker.on('contextmenu', function (event) {
		return false;
	});

	showRoute(routeSrcMarker, routeTargetMarker, travelType);

	return true;
}

/**
 *
 * showRoute - animates the route from src to target marker
 *
 * @param src {L.marker} - source marker
 * @param tgt {L.marker} - target marker
 * @param travelType {string} - travel type  ('WALK'|'BIKE'|'TRANSIT')
 *
 */
function showRoute (src, tgt, travelType) {

	var routeOptions = r360.travelOptions();
	routeOptions.setServiceKey('1TJD1WJERN3ORD1DM2PVL2M');

	//
	endpoint = getRoutingArea(src, tgt).endpoint;

	if (endpoint) {

		routeOptions.setServiceUrl('https://service.route360.net/' + endpoint + '/');
		routeOptions.setTravelType(travelType);
		routeOptions.setMaxEdgeWeight(1800);    // max duration on free plans
		routeOptions.setRecommendations(-1); 	// no alternative route recommendations

		// delete existing route(s)
		routeLayer.clearLayers().bindPopup('');

		// set src and target
		routeOptions.addSource(src);
		routeOptions.addTarget(tgt);

		r360.RouteService.getRoutes(routeOptions,

			function (routes) {

				// create DOM element
				var routePopupDOMElem 	= L.DomUtil.create('div', 'card border-0');
				var routePopupTable 	= L.DomUtil.create('div', 'routeInfoTable', routePopupDOMElem);
				var routePopupBtnDelete	= L.DomUtil.create('button', 'btn btn-outline-secondary routePopupBtnDelete mt-2',
											routePopupDOMElem);
				routePopupBtnDelete.setAttribute('type', 'button');
				routePopupBtnDelete.innerHTML = 'Route l&ouml;schen';

				var pointArray 	= L.GeoJSON.latLngsToCoords(routes[0].points);
				var popupCenter = turf.along(turf.lineString(pointArray), routes[0].length/2, 'meters');

				var popupRouteDetails 	= '';
				var isTransit = false;

				// fade in route with points (walk) and lines (bike) and circle	(transfer)
				r360.LeafletUtil.fadeIn(routeLayer, routes[0], 1000, 'travelDistance', {}, showRouteInfo);

				// iterate segments to fill info popup
				routes[0].routeSegments.forEach(function (segment) {

					popupRouteDetails += '<div class="routeInfoRow">';
					switch (segment.type) {
						case 'WALK':
							popupRouteDetails +=
								'<div class="routeInfoCell"><img width="20" height="25" src="img/man.svg"></div>' +
								'<div class="routeInfoCell">' + formatDistance(segment.distance * 1000) + ' / ' +
								formatTime(segment.travelTime) + '</div>';
							break;
						case 'BIKE':
							popupRouteDetails +=
								'<div class="routeInfoCell"><img width="25" height="25" src="img/bicycle.svg">' +
								'</div>' +
								'<div class="routeInfoCell">' + formatDistance(segment.distance * 1000) + ' / ' +
								formatTime(segment.travelTime) + '' +
								'</div>';
							break;
						case 'TRANSFER':
							break;
						case 'TRANSIT':

							popupRouteDetails +=
								'<div class="routeInfoCell">' + getRouteTypeIcon(segment.routeType) + '</div>' +
								'<div class="routeInfoCell">Linie ' + segment.routeShortName  +
									((segment.tripHeadSign) ? ' ("' + segment.tripHeadSign + '")' : '')  +
								'</div>' +
								'</div><div class="routeInfoRow">' +
								'<div class="routeInfoCell"></div>' +
								'<div class="routeInfoCell">' + segment.startname + '&nbsp;&rarr;<br />' + segment.endname + '</div>' +
								'</div>';
							isTransit = true;
							break;
					}
					// end of table row
					popupRouteDetails += '</div>';
				});

				// add total time on transit routes
				if (isTransit) {
					popupRouteDetails +=  '<div class="routeInfoRow"><div class="routeInfoCell"></div>' +
						'<div class="routeInfoCell">Gesamtdauer: ' + formatTime(routes[0].travelTime) + '</div></div>'
				}
				routePopupTable.innerHTML = popupRouteDetails;

				routeLayer.setPopupContent(routePopupDOMElem);
				routeLayer.openPopup(L.GeoJSON.coordsToLatLng(popupCenter.geometry.coordinates));

			},
			function (errcode, errmsg) {
				srvLog('routing error: ' + errcode + '/' + errmsg);

				// max routing time 1800 sec -> translate message
				if (errcode === 'no-route-found' && errmsg.search(/1800/i) > -1) {
					showError('Routen l&auml;nger als 30 min nicht m&ouml;glich');
				} else {
					showError('Fehler beim Routing: <br />' + errmsg);
				}

				// delete src marker
				if (cashMap.hasLayer(routeSrcMarker)) {
					cashMap.removeLayer(routeSrcMarker);
				}
			}

		);
	}
}

/**
 * showRouteInfo - show route data on click
 *
 * @param event
 */
function showRouteInfo(event) {

}

/**
 *
 * map click handler - handles only event on popup Delete button bubbeled to map
 *
 * - delete route layer
 * - close popup
 * - delete source marker
 * - delete blue circle marker if present
 *
 */
$('#cashMap').on('click', '.routePopupBtnDelete', function() {

	routeLayer.clearLayers();
	routeLayer.closePopup();
	if (cashMap.hasLayer(routeSrcMarker)) {
		cashMap.removeLayer(routeSrcMarker);
	}
	if (cashMap.hasLayer(myLocationMarker)) {
		cashMap.removeLayer(myLocationMarker)
	}

});




/**
 *
 * @param {} routeType - RoutenTyp nach GTFS Standard
 *
 * used by route360.net:
 * 0, 1, 2, 3, 4, 6, 7, 100, 106, 107, 109, 400, 401, 402, 700, 702, 704, 713, 714, 715, 800, 900, 1000, 1100, 1400
 *
 * @returns {HTML-String} - img Tag with size and svg
 */
function getRouteTypeIcon (routeType) {
	switch (routeType) {
		// 0 - Tram, Streetcar, Light rail. Any light rail or street level system within a metropolitan area.
		// 900	Tram Service
		case 0:
		case 900:
			return ('<img width="20" height="22" src="img/tram.svg">');
			break;

		// 1 - Subway, Metro. Any underground rail system within a metropolitan area.
		case 1:
			return ('<img width="15" height="25" src="img/subway.svg">');
			break;

		// 2 - Rail. Used for intercity or long-distance travel.
		// 100	Railway Service
		// 106	Regional Rail Service
		// 107	Tourist Railway Service
		// 109	Suburban Railway

		case 2:
		case 100:
		case 106:
		case 107:
		case 109:
			return ('<img width="20" height="22" src="img/rail.svg">');
			break;

		// 3 - Bus. Used for short- and long-distance bus routes.
		// 700 - Bus service
		// 702	Express Bus Service
		// 704	Local Bus Service
		// 713	School and Public Service Bus
		// 714	Rail Replacement Bus Service
		// 715	Demand and Response Bus Service
		case 3:
		case 700:
		case 702:
		case 704:
		case 713:
		case 714:
		case 715:
			return ('<img width="20" height="25" src="img/bus.svg">');
			break;

		//  4 - Ferry. Used for short- and long-distance boat service.
		// 1000	Water Transport Service
		case 4:
		case 1000:
			return ('<img width="25" height="25" src="img/ferry.svg">');
			break;

		//  6 - Gondola, Suspended cable car. Typically used for aerial cable cars where the car is suspended from the cable
		case 6:
			return ('<img width="25" height="25" src="img/cablecar.svg">');
			break;

		//  7 - Funicular. Any rail system designed for steep inclines
		// 1400	Funicular Service
		case 7:
		case 1400:
			return ('<img width="25" height="25" src="img/funicular.svg">');
			break;

		// S-Bahn Berlin
		case 109:
			return ('<img width="15" height="15" src="img/s-berlin.svg">');
			break;

		// 400	U-Bahn "U" (blau)
		case 400:
			return ('<img width="15" height="15" src="img/u-berlin.svg">');
			break;

		// Urban Railway Services
		// 401	Metro Service
		// 402	Underground Service
		case 401:
		case 402:
			return ('<img width="20" height="25" src="img/subway.svg">');
			break;

		// 800	Trolleybus Service
		case 800:
			return ('<img width="20" height="25" src="img/trolley.svg">');
			break;

		// 1100	Air Service
		case 1100:
			return ('<img width="20" height="25" src="img/plane.svg">');
			break;

		default:
			return ('<img width="20" height="22" src="img/rail.svg">');
			break;

	}
}
/**
 * clearAtmLayersAndRoutes - remove all overlay layers from map and layer control
 *
 * - clear overlay layer from overlayLayers
 * - remove layers from control
 */
function clearAtmLayersAndRoutes (map) {

	Object.keys(overlayLayers).forEach( function (verbund) {

		// remove group layer from control
		cashMapLayerControl.removeLayer(overlayLayers[verbund]);

		// clear features from layer group
		overlayLayers[verbund].clearLayers();

		// set layer group to null
		overlayLayers[verbund] = L.geoJSON(null);

		// clear routes and start marker
		routeLayer.closePopup();
		routeLayer.clearLayers();

		if (cashMap.hasLayer(routeSrcMarker)) {	cashMap.removeLayer(routeSrcMarker); }
	})
}


//======================== Helper functions =============================================
/**
 *
 * getTargetMarker - computes center if layer is polygon, else return layer
 *
 * @param featureLayer	- featureLayer
 * @returns {L.Marker} 	- when polygon: centroid of polygon, else layer itself
 */
function getTargetMarker (featureLayer) {

	if (featureLayer.feature.geometry.type === 'Polygon') {
		var centroid = turf.centroid(featureLayer.feature);
		return L.marker ([centroid.geometry.coordinates[1], centroid.geometry.coordinates[0]]);
	} else {
		// return marker
		return (featureLayer)
	}

}

/**
 *
 * buildOsmTagsTable - create a bootstrap 4 table (striped) from all osm tags of <feature>
 *     attribute names are links to osm wiki
 *
 * @param feature
 *
 * @returns {string} - html string of the table
 */
function buildOsmTagsTable (feature) {

	// Modal Tab OSM Info füllen
	var osmTagTable = '<table class="table table-striped table-bordered table-responsive">';
	osmTagTable += '<thead class="thead-inverse"><tr><th>Attribut</th><th>Wert</th></tr></thead>';
	osmTagTable += '<tbody>';

	Object.keys(feature.properties.tags).forEach(function (tag) {

		// TODO Wiki link by language
		osmTagTable += '<tr><td><a  target="_blank" href="http://wiki.openstreetmap.org/wiki/Key:' + tag + '">' +
			tag + '</a></td><td>' + feature.properties.tags[tag] +	'</td></tr>';

	});
	osmTagTable += "</tbody></table>";
	return (osmTagTable);
}


/**
 *
 * atmInNetwork - check if feature belongs to atm pool <name>
 *
 * @param {L.feature} feature - map feature
 * @param {string} network - name of atm pool ("sparkasse"|"vrbanken"|"cashgroup"|"cashpool"|'keiner')
 *
 * @returns {boolean}
 */
function atmInNetwork (feature, network) {
	return (getAtmNetwork(feature) === network);
}


/**
 *
 * getAtmNetwork - returns atm pool the feature is belonging to
 *
 * @param {L.feature} feature - feature to be checked
 *
 * @returns {string} - atm pool:  "sparkasse"|"vrbanken"|"cashgroup"|"cashpool"|'keiner'
 */
function getAtmNetwork (feature) {

	var network = feature.properties.tags.network;
	var operator = feature.properties.tags.operator;
	var name = feature.properties.tags.name;
	var brand = feature.properties.tags.brand;
	var featureCenter = null;

	// calc center point and check if in Germany
	if (feature.geometry.type === 'Polygon') {
		var centroid = turf.centroid(feature);
		featureCenter = [centroid.geometry.coordinates[0], centroid.geometry.coordinates[1]];
	} else {
		featureCenter = [feature.geometry.coordinates[0], feature.geometry.coordinates[1]];
	}
	// outside Germany no networks
	if (leafletPip.pointInLayer(featureCenter, borderLayer, true).length === 0) {
		return('keiner');
	}

	// 1st check: [network]
	if (network) {

		if (network.search(/sparkasse|landesbank/i) > -1) 		{ return "sparkassen";}
		if (network.search(/BankCard|Genossenschaft/i) > -1) 	{ return "vrbanken";}
		if (network.search(/cashpool/i) > -1) 					{ return "cashpool";}
		if (network.search(/cash\ group|cashgroup/i) > -1) 		{ return "cashgroup";}
		return 'keiner';

	} else {
		// 2nd check: [operator]
		if (operator) {
			if (operator.search(expSparkasse) > -1) 	{ return "sparkassen";}
			if (operator.search(expVRBanken) > -1) 		{ return "vrbanken";}
			if (operator.search(expCashPool) > -1) 		{ return "cashpool";}
			if (operator.search(expCashGroup) > -1) 	{ return "cashgroup";}
			return 'keiner';

		} else {
			// 3rd check: [name]
			if (name) {
				if (name.search(expSparkasse) > -1) 	{ return "sparkassen";}
				if (name.search(expVRBanken) > -1) 		{ return "vrbanken";}
				if (name.search(expCashPool) > -1) 		{ return "cashpool";}
				if (name.search(expCashGroup) > -1) 	{ return "cashgroup";}
				return 'keiner';

			} else {
				// 4th check: [brand]
				if (brand) {
					if (brand.search(expSparkasse) > -1) 	{ return "sparkassen";}
					if (brand.search(expVRBanken) > -1) 	{ return "vrbanken";}
					if (brand.search(expCashPool) > -1) 	{ return "cashpool";}
					if (brand.search(expCashGroup) > -1) 	{ return "cashgroup";}
					return 'keiner';

				} else {
					return 'keiner';
				}
			}
		}
	}
}

//========================= New Feature ================================================
/**
 * context menu item handler
 *
 * newFeatureOnMap - create marker for new feature on click position
 *
 * @param e <event> - event object (contains coordinates)
 */
function newFeatureOnMap (e) {
	createNewMarker (e.latlng);
}

/**
 * createNewMarker - creates marker for new feature
 *
 * remove existing new feature marker
 * create red marker with white plus icon
 * open popup with explanation to drag
 * bind click handler for edit
 * do not propagate contextmenu event to map
 *
 * @param markerLatLon <L.LatLon> - coordinates of marker
 *
 */
function createNewMarker (markerLatLon) {

	if (newMarkerLayer) {
		cashMap.removeLayer(newMarkerLayer);
	}

	newMarkerLayer = L.marker(
		markerLatLon,
		{
			icon: L.VectorMarkers.icon({
				icon: 'plus',
				prefix: 'fa',
				markerColor: 'red',
				iconColor: 'white'
			}),
			draggable: true
		}).bindPopup(
		'Ziehe den Marker zur gew&uuml;nschten Position, dann Mausklick/Tap zum Erfassen.'
	).addTo(cashMap);
	newMarkerLayer.openPopup();

	/**
	 * event handler for dragend
	 * - show help text popup
	 * - remove marker on popup close
	 */
	newMarkerLayer.on('dragend', function (e) {

		newMarkerLayer.openPopup().on('popupclose', function (e) {

			if (cashMap.hasLayer(newMarkerLayer)) {
				cashMap.removeLayer(newMarkerLayer);
			}
		});
	});

	/**
	 * event handler for left click
	 * - close popup
	 * - show edit form
 	 */
	newMarkerLayer.on('click', function (e) {

		newMarkerLayer.closePopup();
		editNewMarker(newMarkerLayer.getLatLng());
	});

	/**
	 * event handler for contextmenu
	 * - do not propagate context menu event to map
 	 */
	newMarkerLayer.on('contextmenu', function (e) {


		return false;
	});
}



/**
 *
 * editNewMarker - show form to create new feature
 *
 * 		initialize form
 *  	check if authenticated to OSM
 * 		reverse geocode address of click position (provider: google)
 * 		set compact address info from result set
 * 		set address form fields from result set
 * 		show edit form
 *
 * @param markerLatLon - coordinates of marker
 */
function editNewMarker (markerLatLon) {

	// check authorisation
	if (!cashMapAuth.authenticated()) {

		$("#osmAuthInfoModal").modal('show');

	} else {

		// show user name on menu
		showCurrentOsmUser();

		// set coords in hidden form fields
		$('#latitudeHidden').val(markerLatLon.lat.toFixed(6));
		$('#longitudeHidden').val(markerLatLon.lng.toFixed(6));

		// reverse geocode address and fill address fields
		cashMapGeoCoderProvider.reverse( markerLatLon,
			cashMap.options.crs.scale(cashMap.getZoom()),
			function(results) {

				results[0].properties.forEach(function (value) {
					if (value.types[0]) {
						if (value.types[0] === 'route') {
							$('#streetInput').val(value.long_name);
						} else if (value.types[0] === 'street_number') {
							$('#numberInput').val(value.long_name);
						} else if (value.types[0] === 'postal_code') {
							$('#postcodeInput').val(value.long_name);
						} else if (value.types[0] === 'locality') {
							$('#cityInput').val(value.long_name);
						} else if (value.types[0] === 'country') {
							$('#countryInput').val(value.short_name);
							$('#countryLong').val(value.long_name)
						}
					}
				});

			}
		);

		// delete new marker from map
		if (cashMap.hasLayer(newMarkerLayer)) { cashMap.removeLayer(newMarkerLayer);}

		$("#newFeatureModal").modal('show');
	}
}


/**
 *
 * showAddress - show address on mouse position
 *
 * 	- reverse geocode address of click position (google)
 * 	- create marker if not exist
 * 	- bind and show popup with nearest address
 * 	- remove marker on popup close
 */
function showAddress (e) {

	cashMapGeoCoderProvider.reverse( e.latlng, cashMap.options.crs.scale(cashMap.getZoom()),
		function(results) {

			var r = results[0];

			if (r) {
				if (addressMarker) {
					if (!cashMap.hasLayer(addressMarker)) {
						cashMap.addLayer(addressMarker);
					}
					addressMarker.setLatLng(r.center).setPopupContent(r.name);
				} else {
					addressMarker = L.marker(r.center)
						.bindPopup(r.name).addTo(cashMap);
				}
				/**
				 * bind event handler for popupclose
				 * - remove marker
				 */
				addressMarker.openPopup().on('popupclose', function () {
					cashMap.removeLayer (addressMarker);
				});
			}
		}
	);
}


//===================================== changeset handling =================================
/**
 *
 *  createChangeset - create OSM changeset
 *  - create new changeset in xml format
 *  - add finde.cash as creator
 *  - add comment from feature form
 *  - API call to PUT changeset
 *
 * @param {string} comment		- changeset comment
 * @param {string} featureId 	- OSM Id (<node|way>/<osm-id>)
 * @param {function} callback 	- function to be called to upload node (delete/upload/modify)
 * @param {object} authObj		- authentication object (empty fpr basic authentication)
 */
function createChangeset (comment, featureId, callback, authObj) {

	var xmlString =
		"<osm><changeset>" +
		"<tag k='created_by' v='finde.cash " + VERSION[0].number + "'/>" +
		"<tag k='comment' v='" + comment + "'/>" +
		"</changeset></osm>";
	srvLog (xmlString);

	if (authObj) {
		authObj.xhr({
			method: "PUT",
			path: "/api/0.6/changeset/create",
			options: {
				header: {
					"Content-Type": "text/xml"
				}
			},
			content: xmlString
		}, function(err, changesetId) {
			if (err) {
				srvLog('error creating changeset');
				showError('Fehler beim Hochladen zum OSM-Server, bitte wiederholen.');

			} else {
				srvLog ('new changeset created, id: ' + changesetId + ', featureId: ' + featureId);
				callback(changesetId, featureId);
			}
		});

	} else {

		// basic authentication
		$.ajax ({
			url: 'https://api.openstreetmap.org/api/0.6/changeset/create',
			type: 'PUT',
			beforeSend: function (xhr) {
				xhr.setRequestHeader("Authorization", basAuth);
			},
			options: {
				header: {
					'Content-Type': 'text/xml'
				}
			},
			data: xmlString,
			success: function (changesetId) {
				srvLog('new changeset created, id: ' + changesetId);
				callback(changesetId, featureId);
			},
			error: function (jqXHR, exception) {
				srvLog('error creating changeset: ' + jqXHR.status + '/' + exception);
				showError('Fehler beim Hochladen zum OSM-Server, bitte wiederholen.');

			}
		});
	}

}

/**
 *
 * uploadCreation: 
 * 
 * upload the changeset for deletion to OSM database
 * create changeset data from DOM form elements
 *
 * @param changesetId - Id of changeset

 */
function uploadCreation (changesetId) {
	var xmlString = '';

	if (changesetId) {

		// create array of key/value pairs from all form input fields and iterate
		$.each($("#newFeatureForm").serializeArray(), function (index, tag) {

			if (tag.name === 'osmId') {

				// header <osmChange>
				xmlString = "<osmChange><create><node id='-1' " +
					"lon='" + $("#longitudeHidden").val() + "' lat='" + $("#latitudeHidden ").val() + "' " +
					"version='0' changeset='" + changesetId + "'>";

				// TODO add amenity=bank
				xmlString += "<tag k='amenity' v='atm'/>";

			} else {
				if (tag.value !== 'Unbekannt' &&    // do not store Unbekannt
					tag.value !== 'Andere ...' &&   // if operator = 'Andere...' take specialOperator field
					tag.name.substr(0,1) !== "x" && // do not process internal fields starting with "x"
					tag.value.length > 0) {

					// some special handling on Sparkassen, VR-Banken
					if (tag.name === 'operator' && tag.value === 'Sparkassen ...') {
						// set <name> tag to general bank name
						xmlString += "<tag k='name' v='Sparkasse'/>";

					} else if (tag.name === 'operator' && tag.value === 'VR-Banken ...') {
						// set <name> tag to general bank name
						xmlString += "<tag k='name' v='VR-Bank'/>";

					} else if (tag.name === 'specialOperator') {
						// take special operator value as <operator> tag
						xmlString += "<tag k='operator' v='" + tag.value + "'/>";

					// special: German atm networks
					} else if (tag.name === 'network') {
						if (tag.value !== 'Keiner') {
							xmlString += "<tag k='network' v='" + tag.value + "'/>";
						}

					// store address only if checked
					} else if (tag.name.search(/addr\:/i) > -1) {
						if ($('#writeAddress').prop('checked')) {
							xmlString += "<tag k='" + tag.name + "' v='" + tag.value + "'/>";
						}

					// default: put field into changeset
					} else {
						xmlString += "<tag k='" + tag.name + "' v='" + tag.value + "'/>";
					}
				}
			}
		});

		// footer
		xmlString += "</node></create><delete if-unused='true'/></osmChange>";
		srvLog(xmlString);

		cashMapAuth.xhr({
			method: "POST",
			path: "/api/0.6/changeset/" + changesetId + "/upload",
			options: {
				header: {
					"Content-Type": "text/xml"
				}
			},
			content: xmlString
		}, function (err, result) {
			if (err) {
				srvLog('error on node upload: ' + err);
				showError('Fehler beim Hochladen zum OSM-Server, bitte wiederholen.');

			} else {

				srvLog('new node created, id: ' + result.getElementsByTagName('node')[0].getAttribute("new_id"));

				cashMapAuth.xhr({
					method: "PUT",
					path: "/api/0.6/changeset/" + changesetId + "/close"
				}, function (err) {
					if (err) {

						srvLog('error uploading node: ' + err);
						showError('Fehler beim Hochladen zum OSM-Server, bitte wiederholen.');

					} else {
						srvLog('node created.');
						$("#congratsNewFeatureModal").modal('show');

					}
				});
			}
		});
	}
}


/**
 *
 * uploadModification:  modify node with ID <featureId>
 *
 * @param changesetId - Id of change set
 * @param featureId - feature id to be modified (format: <node|way>/<number>)
 *
 */
function uploadModification (changesetId, featureId) {

	var xmlString = '';
	// read from DOm XML node|way
	var xmlNode = $('#featureXML').val().getElementsByTagName(featureId.split('/')[0])[0];

	if (changesetId) {
		// header
		xmlString = '<osmChange><modify>';

		// node|way
		xmlString += '<' + featureId.split('/')[0];

		// id number
		xmlString += ' id="' + featureId.split('/')[1] + '"';

		xmlString += ' lon="' + xmlNode.getAttribute('lon') + '" lat="' + xmlNode.getAttribute('lat') + '"';

		// version and change set id
		xmlString += ' version="' + xmlNode.getAttribute('version') + '" changeset="' + changesetId + '">';

		// add existing keys
		Object.keys(xmlNode.children).forEach(function(key) {

			// omit old opening_hours (erroneous)
			if (xmlNode.children[key].outerHTML.search(/opening_hours/i) === -1) {
				xmlString += xmlNode.children[key].outerHTML
			}
		});

		// add new <opening_hours> key
		if ($('#openingHoursHiddenFast').val() !== '') {
			xmlString += '<tag k="opening_hours" v="' + $('#openingHoursHiddenFast').val() + '"/>'
		}

		// closing node|way tag
		xmlString += '</' + featureId.split('/')[0] + '>';

		// footer
		xmlString += '</modify></osmChange>';
		srvLog(xmlString);

		$.ajax ({
			beforeSend: function (xhr) {
				xhr.setRequestHeader("Authorization", basAuth) ;
			},
			method: 'POST',
			url: 'https://api.openstreetmap.org/api/0.6/changeset/' + changesetId + '/upload',
			options: {
				header: {
					'Content-Type': 'text/xml'
				}
			},
			data: xmlString,
			error: function (jqXHR, exception) {
				srvLog('error on modification upload: ' + jqXHR.status + '/' +  exception);
				showError('Fehler beim Speichern der &Auml;nderungen, bitte wiederholen.');

			},
			success: function (response) {

				srvLog(featureId.split('/')[0] + ' modified.');
				// close changeset
				$.ajax ({

					url: "https://api.openstreetmap.org/api/0.6/changeset/" + changesetId + "/close",
					method: "PUT",
					beforeSend: function (xhr) {
						xhr.setRequestHeader("Authorization", basAuth) ;
					},
					error: function (jqXHR, exception) {
						rvLog('error on closing changeset: ' + jqXHR.status + '/' +  exception);

					},
					success: function (response) {
						srvLog('changeset closed.');
						showInfo('Die &Auml;nderungen wurden gespeichert und werden in wenigen Minuten angezeigt.');

					}
				});
			}
		});
	}
}


/**
 *
 * uploadMove:  modify node with ID <featureId>
 *
 * @param changesetId - Id of change set
 * @param featureId - feature id to be modified (format: <node|way>/<number>)
 *
 */
function uploadMove (changesetId, featureId) {

	var xmlString = '';
	// read from DOM XML node|way
	var xmlNode = $('#featureXML').val().getElementsByTagName(featureId.split('/')[0])[0];

	if (changesetId) {
		// header
		xmlString = '<osmChange><modify>';

		// node|way
		xmlString += '<' + featureId.split('/')[0];

		// id number
		xmlString += ' id="' + featureId.split('/')[1] + '"';

		// new coordinates
		xmlString += ' lon="' + $('#newLongitudeHidden').val() + '" lat="' + $('#newLatitudeHidden').val() + '"';

		// version and change set id
		xmlString += ' version="' + xmlNode.getAttribute('version') + '" changeset="' + changesetId + '">';

		// add existing keys
		Object.keys(xmlNode.children).forEach(function(key) {

			// omit address fields
			if (xmlNode.children[key].outerHTML.search(/addr\:/i) === -1) {
				xmlString += xmlNode.children[key].outerHTML
			}
		});

		// add new new address fields from DOM if write address is checked
		$.each($('#moveFeatureForm').serializeArray(),
			function (index, tag) {
				if (tag.name.search(/addr\:/i) > -1) {
					if ($('#writeNewAddress').prop('checked')) {
						xmlString += "<tag k='" + tag.name + "' v='" + tag.value + "'/>";
					}
				}
			}
		);

		// closing node|way tag
		xmlString += '</' + featureId.split('/')[0] + '>';

		// footer
		xmlString += '</modify></osmChange>';

		srvLog(xmlString);

		cashMapAuth.xhr({
			method: 'POST',
			path: '/api/0.6/changeset/' + changesetId + '/upload',
			options: {
				header: {
					'Content-Type': 'text/xml'
				}
			},
			content: xmlString
		}, function (err, result) {
			if (err) {

				srvLog('error on upload move: ' + err.responseText);
				showError('Fehler beim Hochladen zum OSM-Server, bitte wiederholen.');

			} else {

				cashMapAuth.xhr({
					method: "PUT",
					path: "/api/0.6/changeset/" + changesetId + "/close"
				}, function (err) {

					if (err) {

						srvLog('error on closing changeset: ' + err.responseText);
						showError('Fehler beim Hochladen zum OSM-Server, bitte wiederholen.');

					} else {
						srvLog('new position saved.');
						showInfo('Neue Position in OSM gespeichert.');
					}
				});
			}
		});

	}
}

/**
 *
 * uploadDeletion:  delete node with ID
 *
 * @param changesetId - Id of changeset
 * @param featureId - feature id to be deleted (format: <node|way>/<number>)
 *
 */
function uploadDeletion (changesetId, featureId) {
	xmlString = '';
	srvLog('uploadDeletion changeset: ' + changesetId + ' - feature:' + featureId);

	if (changesetId) {

		xmlString = '<osmChange><delete>';
		xmlString += '<' + featureId.split('/')[0];
		xmlString += ' id="' + featureId.split('/')[1] + '"';
		xmlString += ' lon="' + $('#featureXML').val().getElementsByTagName(featureId.split('/')[0])[0].getAttribute('lon') + '"';
		xmlString += ' lat="' + $('#featureXML').val().getElementsByTagName(featureId.split('/')[0])[0].getAttribute('lat') + '"';
		xmlString += ' version="' +
			$('#featureXML').val().getElementsByTagName(featureId.split('/')[0])[0].getAttribute('version') + '"';
		xmlString += ' changeset="' + changesetId + '">';
		xmlString += '</' + featureId.split('/')[0] + '></delete>';
		xmlString += '</osmChange>';

		srvLog(xmlString);

		cashMapAuth.xhr({
			method: 'POST',
			path: '/api/0.6/changeset/' + changesetId + '/upload',
			options: {
				header: {
					'Content-Type': 'text/xml'
				}
			},
			content: xmlString
		}, function (err, result) {
			if (err) {

				srvLog('error on upload deletion: ' + err.responseText);
				showError('Fehler beim L&ouml;schvorgang, bitte wiederholen.');

			} else {

				cashMapAuth.xhr({
					method: "PUT",
					path: "/api/0.6/changeset/" + changesetId + "/close"
				}, function (err) {

					if (err) {

						srvLog('error on closing changeset: ' + err.responseText);
						showError('Fehler beim L&ouml;schvorgang, bitte wiederholen.');

					} else {
						srvLog('node deleted.');
						showInfo('Du hast das Objekt aus OSM gelöscht.');
					}
				});
			}
		});

	}
}

/**
 * srvlog - send logtext via ajax POST to server script
 *
 * @param {string} - text to be logged
 */
function srvLog (text) {

	var logtext = $('#osmUser').html() + '> ' + text;
	$.post( "php/srv_log.php", { message: logtext });

}

