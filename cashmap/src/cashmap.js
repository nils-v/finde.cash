/**
 * Created by nilsvierus on 16.03.17.
 */


var VERSION = [
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

var MIN_ZOOM = 13;        // minimal zoom for data load to avoid cluttering

/**
 *  Globale Variablen
 *
 */
var addressMarker = null,
	releaseNotes = '',
	sidebarFeatureList;
var borderLayer = null;
var myLocation = null, myLocationMarker = null;

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
	//fillColor: "#0B5898",
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

var cashMapGeoCoderProvider = L.Control.Geocoder.google();
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

// EasyButton
// TODO load button add to map only on appropriate zoom
var btnLoadData = L.easyButton({
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

// top right: show travel time
/*
var btnShowTravelTime = L.easyButton({
	id: 'btn-show-time', 		// an id for the generated button
	position: 'topright',      	// inherited from L.Control -- the corner it goes in
	leafletClasses: true,     	// use leaflet classes to style the button?
	states:[
		{                 		// specify different icons and responses for your button
		stateName: 'show-time',
		onClick: function(button, map){
			showTravelTime(true);
			button.state('hide-time');
		},
		title: 'Zu Fu&szlig; in 10 min...',
		icon: 'fa-clock-o'
	},	{                 		// specify different icons and responses for your button
		stateName: 'hide-time',
		onClick: function(button, map){
			showTravelTime(false);
			button.state('show-time');
		},
		title: 'Ausschalten',
		icon: 'fa-times'
	}]
}).addTo(cashMap);
*/
// r360 services ---------------------------------------------------------
// show 10 + 20 min travel times from map center

/*
var travelTimeCloudLayer = r360.leafletPolygonLayer().addTo(cashMap);
var travelTimeOptions = r360.travelOptions();

travelTimeOptions.setServiceKey('1TJD1WJERN3ORD1DM2PVL2M');
travelTimeOptions.setServiceUrl('https://service.route360.net/germany/');
travelTimeOptions.setTravelTimes([600, 1200]);	// we want to have polygons for 10 + 20 minutes walk
travelTimeOptions.setColors([600, 1200]);	// we want to have polygons for 10 + 20 minutes walk

travelTimeOptions.setTravelType('walk'); 	// go by foot
*/

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


// OAuth object DEV server
/*
var cashMapAuth = osmAuth({
	oauth_secret: "df73nlidufppGIW14ch3IrgVlMNHkfIvs6pqnpCh",
	oauth_consumer_key: "38cPnvmmnxOF8CN8gVfsdENclYK1XIvBRaWxQR5u",
	auto: true,
	url: 'https://master.apis.dev.openstreetmap.org'
});
*/

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
 * - switch off spinner
 */
cashMap.on('movestart zoomstart', function(e) {

	cashMap.spin(false);

	// Move the crosshair to the center of the map when the user pans
	crosshair.setLatLng(cashMap.getCenter());

});


/**
 *
 */
cashMap.on('move', function(e) {
	// Move the crosshair to the center of the map when the user pans
	if (!myLocation) {
		crosshair.setLatLng(cashMap.getCenter());
	}
});

/**
 * bind event handler <moveend> to map (fires on zoomend too)
 *
 *  - if data not l.oaded yet or new map bounds are not fully within loaded area -> check zoom
 *  - if zoom >= MIN_ZOOM no data load
 *  - if zoom > MIN_ZOOM start timer for data load  * 	(delayed loading to avoid load errors at fast map moves on mobile devices)
 *  - update sidebar feature list
 *
 */
cashMap.on('moveend', function(e) {

	var currZoom = cashMap.getZoom();

	hideInfo();

	if (!currentDataBounds || !currentDataBounds.contains(cashMap.getBounds())) {

		if (currZoom >= MIN_ZOOM) {
			loadOsmData(currZoom);
		}
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
		btnLoadData.disable();

	} else {

		hideWarning();
		btnLoadData.enable();
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
		cashMap.fire('moveend'); // load data
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


/**
 *
 * bind event handler <click> to map
 *
 * - remove new feature marker
 */
cashMap.on('click', function(e) {

	if (cashMap.hasLayer(newMarkerLayer)) { cashMap.removeLayer(newMarkerLayer);}

});

// Geocoder events ------------------------------------------------------------------------------
/*
 * bind event handler <markgeocode> to geocoder
 *
 * - if address found:
 * 		remove atm layers
 * 		remove routes
 *
 */
cashMapGeoCoder.on('markgeocode', function(e) {

	// TODO remove marker on location found
	clearAtmLayersAndRoutes();
	currentDataBounds = null;
	cashMap.fire('moveend');

});

// jQuery events ------------------------------------------------------------------------------
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
			getOsmUser();
		});

	} else {

		cashMapAuth.logout();
		getOsmUser();

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
	showSidebar(false);

	return false;
});


/**
 *
 * showSidebar
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
 * - shows distance in m/km
 *
 */
function syncSidebar() {

	var mapCenterLatLng = cashMap.getCenter();
	var featureCenter = null;

	// empty sidebar table
	$('#tableFeature tbody').empty();

	// iterate atm layers array
	Object.keys(overlayLayers).forEach( function (verbund) {

		// check if laxer group is visible
		if (cashMap.hasLayer(overlayLayers[verbund])) {

			// iterate all markers of layer group
			overlayLayers[verbund].eachLayer(function (layer) {

				var lat, lon = null;
				// for polygons use centroid
				if (layer.feature.geometry.type === 'Polygon') {
					var centroid = turf.centroid(layer.feature);
					lon = centroid.geometry.coordinates[0];
					lat = centroid.geometry.coordinates[1];
					featureCenter = [lat, lon];

				} else {
					featureCenter = layer.getLatLng();
					lon = layer.feature.geometry.coordinates[0];
					lat = layer.feature.geometry.coordinates[1];
				}

				// if shown on map: show in sidebar
				if (cashMap.getBounds().contains(featureCenter)) {

					var osmTags = layer.feature.properties.tags;
					var tableRow = '<tr class="featureRow" id="' + L.stamp(layer) + '" verbund=' + verbund +
						' lat="' + lat + '" lng="' + lon + '"><td style="vertical-align: middle;">' +
						'<i class="fa fa-' + ((osmTags.amenity === 'bank') ? 'bank"' : 'euro"') + '></i></td>' +
						'<td class="featureName">';

					if (osmTags.amenity === 'bank') {
						tableRow += osmTags.hasOwnProperty('name') ?
							(osmTags.name.length > 18 ? osmTags.name.substr(0,16) + '...' : osmTags.name) :
							'&lt;Kein Name&gt;';
					} else {
						tableRow += osmTags.hasOwnProperty('operator') ?
							(osmTags.operator.length > 18 ? osmTags.operator.substr(0,16) + '...' : osmTags.operator) :
							'&lt;Kein Operator&gt;';
					}
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

/**
 *
 * bind event handler <nmouseover> to document on no touch devices
 *
 * - check mouseout on sidebar row
 * - clear other highlights
 * - set highlight on marker (use attributes lat/lng from data row)
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

	// do not move away from geolocation
	//cashMap.setView([$(this).attr('lat'), $(this).attr('lng')], 17);

	// preserve highlight on mouseout
	$(document).off('mouseout', '.featureRow', clearHighlight);

	// open modal for selected feature
	overlayLayers[$(this).attr('verbund')]
		.getLayer(parseInt($(this).attr('id'), 10))
		.fire('click');

});


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

			// getOsmUser sets #osmLoginToggle and #navbarDropdownOsm
			getOsmUser();

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
	var operator = $('#operatorSelect option:selected').text();
	if (operator.search(/sparkasse|landesbank\ berlin|bw\ bank|bw-bank|lbbw/i) > -1) {
		network = 'Sparkassen-Finanzverbund';
	} else if (operator.search(/Volksbank|Raiffeisen|PSD|GLS/i) > -1) {
		network = 'BankCard-Netz (VR-Banken)';
	} else if (operator.search(/Sparda|Targo|Santander|citibank|BBBank|Sozialwirtschaft/i) > -1) {
		network = 'Cashpool';
	} else if (operator.search(/Commerzbank|Deutsche\ Bank|Postbank|Norisbank|Berliner\ Bank|HypoVereinsbank/i) > -1) {
		network = 'CashGroup';
	} else {
		network = 'Keiner';
	}

	// show operator input field in case of Sparkassen, Volksbanken, Andere
	if (operator === 'Sparkassen ...' || operator === 'Volksbanken ...') {
		$("#operatorInput").html('').prop('disabled', false).attr('placeholder', 'Institutsname ...');
	} else if (operator === 'Andere ...') {
		$("#operatorInput").html('').prop('disabled', false).attr('placeholder', 'Betreibername ...');
	} else {
		$("#operatorInput").html('').prop('disabled', true).attr('placeholder', '');
	}

	// select network form control
	$('#networkSelect').val(network).attr('selected', true);

	return false;
});


/**
 * select box change handler
 *
 * #typeOpeningSelect - set type of opening hours entry, create additional fields
 * dynamically
 */
$("#typeOpeningSelect").change(function() {

	var typ = $("#typeOpeningSelect option:selected").val();

	// reset DIVs
	$("#OpeningHoursHidden").val('');
	if ($('#timeFields').length > 0) { $('#timeFields').remove(); }
	if ($('#osmOpeningText').length > 0) { $('#ohFields').remove(); }

	// set 24/7, no dynamic fields
	if (typ === '1') {

		$("#OpeningHoursHidden").val('24/7');

	// set Mo-Fr, create fields for slot1 and slot2, remove textual input field
	} else if (typ === '2') {

		$('#collapseOpening .form-group').append(
			'<div class="form-group mt-2" id="timeFields">' +
				'<div class="form-inline">' +
					'<label class="mr-sm-2" for="fromTime1">von - bis (1)</label>' +
					'<input class="form-control col-4 mr-2" name ="xFromTime1" id="fromTime1" type="time" placeholder="hh:mm">' +
					'<input class="form-control col-4" name ="xToTime1" id="toTime1" type="time" placeholder="hh:mm">' +
				'</div>' +
				'<div class="form-inline mt-2">' +
					'<label class="mr-sm-2" for="fromTime2">von - bis (2)</label>' +
					'<input class="form-control col-4 mr-2" name ="xFromTime2" id="fromTime2" type="time" placeholder="hh:mm">' +
					'<input class="form-control col-4" name ="xToTime2" id="toTime2" type="time" placeholder="hh:mm">' +
				'</div>' +
			'</div>'
		);

	} else if (typ === '3') {

		$('#collapseOpening .form-group').append(
			'<div class="form-group" id="ohFields">' +
				'<small class="text-muted ml-2">' +
					'<strong>&Ouml;ffnungszeiten</strong> (OSM-Attribut: [' +
						'<a target="_blank" href="http://wiki.openstreetmap.org/wiki/Key:opening_hours">opening_hours</a>])' +
				'</small>' +
				'<input class="form-control" name="xOsmOpeningText" id="osmOpeningText" type="text">' +
			'</div>'
		);

	}

	return false;
});


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
 * #btnRouteZuFuss - show route "Zu Fuß"
 * #btnRouteRad - show route "Mit dem Rad"
 * #btnRouteOEPNV - show route "Mit ÖPNV"
 *
 * - check for polygon, if yes, take the center (turf.centroid()) as tgt
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
	if (!routeToFeature(getTargetMarker(routeTargetLayer), 'transit')) {
		 showInfo('Kein &Ouml;PNV Routing verf&uuml;gbar.')
	}

});


$('#btnEditOpeningHours').click ( function (event) {
	console.log('clicked for new oh');
});


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
	var featureId = $('#featureObj').val()['id'];

	if (!cashMapAuth.authenticated()) {

		$("#osmAuthInfoModal").modal('show');

	} else {

		readFeatureVersion(featureId);
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
 *
 * readFeatureVersion - read the feature details
 *
 * get xml data of feature via API 0.6 and store in DOM (#delFeatureVersion)
 *
 * @param featureId
 */
function readFeatureVersion (featureId) {

	cashMapAuth.xhr({
		method: "GET",
		path: "/api/0.6/" + featureId
	}, function(err, details) {
		if (err) {

			srvLog ('GET details error: '  + err);
		} else {

			// store in DOM
			$('#delFeatureVersion')
				.val(details.getElementsByTagName(featureId.split('/')[0])[0].getAttribute("version"));

		}
	});
}


/**
* #deleteFeatureModal - show event
*
* init form GUI delete feature
*/
$('#deleteFeatureModal').on('show.bs.modal', function (e) {

	initDeleteFeatureForm();

});


/**
 * initNewFeatureForm - reset form #deleteFeatureForm
 *
 * reset form fields
 *
 */
function initDeleteFeatureForm () {

	// reset form fields and remove validator markups
	$('#deleteFeatureForm')
	.trigger('reset')
	.find('.has-danger').removeClass('has-danger')
	.find('.form-control-danger').removeClass('form-control-danger');

}


/**
 *
 * deleteFeature - ask for deletion of the feature from OSM database
 *
 * @param featureId - Id of feature to delete
 */
function deleteFeature (featureId) {

	var feature = $('#featureObj').val();

	// set header
	$('#deleteFeatureTitle').html($('#feature-title').html() + ' l&ouml;schen');

	// set osm tags for modal window
	$('#delFeatureOsmTags').html($('#osmTags').html());

	// store coords in DOM for deletion
	$('#delLatitude').val(feature.geometry.coordinates[1]);
	$('#delLongitude').val(feature.geometry.coordinates[0]);

	// store necessary feature data in DOM
	$('#delFeatureId').val(featureId);

	// show modal for deletion
	$("#deleteFeatureModal").modal('show');
}


/**
 * main function (after DOM is loaded) *************************************************************
 */
$(function () {

	// check OSM authentication, if yes show authenticated user
	getOsmUser();

	// get polygon to check if atm is in Germany
	readGermanyBorders();

	// locate geo position
	// TODO add delay for message
	//showInfo('Ermittle Deinen Standort ...');

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
	 *     #operatorSelect has to be filled
	 *     if #operatorSelect = Sparkassen ...' | 'Volksbanken ...' | 'Andere ...' -> #operatorInput has to be filled
	 *     #commentInput has to be filled
	 *
	 *     reference to fields by <name> attribut, not <id>!
	 *     submit handler starts feature upload to OSM
	 *
	 *     TODO inhibit ENTER on form
	 */
	$('#newFeatureForm').validate({
		debug: true,

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
			name: {
				// name required for Andere
				required: {
					depends: function(element) {
						return (
							$('#operatorSelect option')
							.filter(':selected')
							.text() === 'Andere ...'
						);
					}
				}
			},
			xToTime1: {
				// toTime 1 required when fromTime 1 filled
				required: {
					depends: function (element) {
						return ($('#xFromTime1').length > 0);
					}
				}
			},
			xToTime2: {
				// toTime 2 required when fromTime 2 filled
				required: {
					depends: function (element) {
						return ($('#xFromTime2').length > 0);
					}
				}
			},
			xOsmOpeningText: {
				// opening_hours required for type "Eingabe"
				required: {
					depends: function(element) {
						return ($('#typeOpeningSelect option').filter(':selected').val() === '3');
					}
				},
				// check the string
				validateOpeningHours: true
			},
			xComment: {
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

			$(element).parent().addClass('has-danger');
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

			$(element).parent().removeClass('has-danger');
			$(element).removeClass('form-control-danger');
		},

		/**
		 * errorPlacement - define how to show validation error message
		 *
		 * show message only for field <xOsmOpeningText> (created by opening_hours lib)
		 *
		 * @param error
		 * @param element
		 */
		errorPlacement: function(error, element) {
			if (element.attr('name') === 'xOsmOpeningText') {
				error.appendTo( element.parent() );
			}
		},

		/**
		 * function to be called on form submit
		 *
		 * creates opening hours string from Mo-Fr timeslots (if filled) and fill hidden field
		 * fill hidden field with opening hours string
		 * converts additional tag fields into key/value pairs
		 * calls creatikon of new changeset
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
				$("#OpeningHoursHidden").val(openingHours);
			}

			// set hidden <opening_hours> field from text field
			if ($('#osmOpeningText').length > 0) {
				$("#OpeningHoursHidden").val($('#osmOpeningText').val());
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

			// write data to osm database
			createChangeset( $("#commentInput").val(), null, uploadCreation );

			$("#newFeatureModal").modal('hide');
		},

		/**
		 *
		 * function to be called on invalid fields - iterates error list and opens the collapsed accordion to
		 * show error markings (red border+red cross)
		 *
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
		debug: true,

		// do not validate on focusout
		onfocusout: false,

		// do not validate on keyup
		onkeyup: false,

		// validation rules per field
		rules: {
			comment: {
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

			$(element).parent().addClass('has-danger');
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

			$(element).parent().removeClass('has-danger');
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

			createChangeset($( "#commentDelete").val(), $('#delFeatureId').val(), uploadDeletion );
			$("#deleteFeatureModal").modal('hide');

		}

	}); // $('#deleteFeatureForm').validate()

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


// functions ---------------------------------------------------------------------------------------
/**
 * getOsmUser - Calls the OSM API to get the logged in user details as xml
 *
 * 	- sets the user details in menu item "OSM"
 * 	- toggles the login/logout out menu item text
 *
 */
function getOsmUser () {

	if (cashMapAuth.authenticated ()) {
		cashMapAuth.xhr({
			method: "GET",
			path: "/api/0.6/user/details"

		}, function(err, details) {
			if (err) {

				srvLog ('auth error: '  + err);
			} else {

				$('#osmUser').html(details.getElementsByTagName("user")[0].getAttribute("display_name"));
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
	/*
	if (distMeter >= 1000) {
		distText = (Math.round(distMeter / 100)) / 10 + ' km';
	} else {
		distText = Math.round(distMeter/10) * 10 + ' m';
	}
	return (distText);
	*/

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
	var sec = Math.floor( timeSec%60 );

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

$('#btnInfoClose').click (function () {
	hideInfo();
});

$('#btnWarningClose').click (function () {
	hideWarning();
});

$('#btnDangerClose').click (function () {
	hideError();
});

function showInfo(text) {
	$('#infoAlertText').html(text);
	$('#infoAlert').removeClass('invisible');
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
	var featureCenter 	= null;

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
		srvLog('error on overpass load: ' + jwxhr_Object.status + ' - ' + jwxhr_Object.statusText );

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

			if (osmTags.hasOwnProperty('name') && osmTags.name.search(/gls/i) > -1) {
				mColor = '#6A9140';
			} else {
				if (osmTags.hasOwnProperty('operator') && osmTags.operator.search(/gls/i) > -1) {
					mColor = '#6A9140';
				}
			}

			if (osmTags.amenity === 'bank') {
				featureTitle = osmTags.hasOwnProperty('name') ? osmTags.name : 'Kein Name erfasst';
			} else {
				featureTitle = osmTags.hasOwnProperty('operator') ? osmTags.operator : 'Kein Operator erfasst';
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
					srvLog('pointToLayer/opening_hours err: ' + feature.id + '/' + err);
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
		 * create text for info modal tabs and register event handler to show modal
		 *
		 * @param feature
		 * @param layer
		 */
		onEachFeature: function (feature, layer) {

			if (feature.properties.tags) {

				// Modal  / Tab Allgemein füllen
				var featureTitle = (feature.properties.tags.amenity === "bank") ? "Bank" : "Geldautomat";
				var featureInfo = '';
				var openingTable = '';
				var osmInfoMissing = '';

				var oh = {};
				var ohValid = false;

				// [operator]
				if (feature.properties.tags.operator) {
					featureInfo += ((featureTitle === 'Bank') ? '<p>Name: ' : '<p>Betrieben von: ') +
						feature.properties.tags.operator + '</p>';
				} else {
					osmInfoMissing += (featureTitle === 'Geldautomat') ?
						'<p><i>Betreiber (Attribut [' +
						'<a target="_blank" href="http://wiki.openstreetmap.org/wiki/Key:operator">operator</a>' +
						']) nicht erfasst.</i></p>' : '';
					if (feature.properties.tags.name) {
						featureInfo += ((featureTitle === 'Bank') ? '<p>Name: ' : '<p>Betrieben von: ') +
							feature.properties.tags.name + '</p>';
					} else {
						osmInfoMissing += '<p><i>Bankname (Attribut [' +
							'<a target="_blank" href="http://wiki.openstreetmap.org/wiki/Key:name">name</a>' +
							']) nicht erfasst.</i></p>';
					}
				}

				// [network]
				if (feature.properties.tags.network) {
					featureInfo += '<p>Automatenverbund: ' + (feature.properties.tags.network) + '</p>';
				} else {
					featureInfo += '<p>Automatenverbund: ' + NETWORK_NAME[getAtmNetwork(feature)];
					osmInfoMissing +=	((featureTitle === 'Geldautomat') ?
						'<p><i>Automatenverbund (Attribut [' +
						'<a target="_blank" href="http://wiki.openstreetmap.org/wiki/Key:network">network</a>' +
						']) nicht erfasst.</i></p>' : '');
				}

				// [opening_hours]
				if (feature.properties.tags.opening_hours) {

					try {
						oh = new opening_hours(
							feature.properties.tags.opening_hours,
							{
								"address":{
									"country":"Deutschland",
									"country_code":"de"
								}
							},
							{ 'locale': 'de' });
						//console.log(oh.getState());
						//console.log(oh.getWarnings());
						ohValid = (oh.getWarnings().length === 0);
					} catch (err) {
						console.log('onEachFeature/opening_hours err: ' + feature.id + '/' + err)
					}

					var ohSimple = new SimpleOpeningHours(feature.properties.tags.opening_hours);
					var ohSimplTable = ohSimple.getTable();

					if (ohValid) {

						featureInfo += (oh.getState() ?
							'<p class="text-success font-weight-bold">Jetzt ge&ouml;ffnet.</p>' :
							'<p class="text-danger font-weight-bold">Jetzt geschlossen.</p>');

						// create simplified table of opening_hours
						openingTable = '<table class="table table-striped table-bordered table-responsive">';
						Object.keys(ohSimplTable).forEach(function (dayOfWeek) {
							if (ohSimplTable[dayOfWeek][0]) {
								openingTable += "<tr><td>" + WOCHENTAG_NAME[dayOfWeek] + "</td><td>";
								ohSimplTable[dayOfWeek].forEach(function (oh) {
									openingTable += oh + "    ";
								});
								openingTable += "</td></tr>";
							}
						});
						openingTable += "</table>";
					} else {
						openingTable += '<p>Erfasste &Ouml;ffnungszeit ung&uuml;ltig oder nicht tabellarisch darstellbar.</p>';
					}
				} else {
					featureInfo 	+= '<p><strong>Keine &Ouml;ffnungszeit erfasst.</strong></p>';
					osmInfoMissing 	+= '<p><i>&Ouml;ffnungszeiten (Attribut [' +
						'<a target="_blank" href="http://wiki.openstreetmap.org/wiki/Key:opening_hours">opening_hours</a>' +
						']) nicht erfasst.</i></p>';

					openingTable 	+= '<p>Keine &Ouml;ffnungszeit erfasst.</p>';
					/*
					var btnEditOpeningHours = L.DomUtil.create('button',
							'btn btn-outline-secondary mt-2 btnEditOpeningHours');
					btnEditOpeningHours.setAttribute('type', 'button');
					btnEditOpeningHours.innerHTML = 'Jetzt erfassen';
					*/
				}

				// Modal Tab OSM Info füllen
				var osmTagTable = buildOsmTagsTable(feature);

				/**
				 * mouse left click handler for marker
				 */
				layer.on('click', function (e) {

					// store feature object
					$('#featureObj').val(feature);
					// store layer object (marker/polygon) for routing
					$('#layerObj').val($(this));

					// set texts in modal elements
					$('#feature-title').html(featureTitle);
					$('#infoText').html(featureInfo);

					// table of opning hours
					$('#openingTable').html(openingTable);


					// table of osm tags
					$('#osmTagsTable').html(osmTagTable);
					// missing osm tags
					$('#osmInfoMissing').html(osmInfoMissing);

					// hack to activate first visible tab
					$('#featureModalTabs a.nav-link')
						.filter(function() {return $(this).css('display') === 'block'; })
						.first()
						.tab('show');

					$("#featureModal").modal('show');
				});
				/**
				 * do not propagate contextmenu event to map
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

	// remove dynamically created fields for opening hours
	if ($('#timeFields').length > 0) { $('#timeFields').remove(); }
	if ($('#ohFields').length > 0) { $('#ohFields').remove(); }

	// remove dynamically created hidden fields for additional tags
	$('#collapseOthers .addTagField').remove();

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
	$('#newFeatureForm')
		.trigger('reset')
		.find('.has-danger').removeClass('has-danger')
		.find('.form-control-danger').removeClass('form-control-danger');

}


/**
 *
 * showTravelTime - show/hide cloud with travel time of 10 mins (walk)
 *
 */
/*
function showTravelTime (show) {

	if (show) {
		travelTimeSrcMarker = L.circleMarker(
			cashMap.getCenter(),
			{radius: 2}
			).addTo(cashMap);

		// we only have one source which is the marker we just added
		travelTimeOptions.addSource(travelTimeSrcMarker);

		r360.PolygonService.getTravelTimePolygons(travelTimeOptions, function(polygons){

			travelTimeCloudLayer.setColors([{
				'time': 600,
				'color': '#78C2AD'
			} ]);
			// add the returned polygons to the polygon layer
			// and zoom the map to fit the polygons perfectly
			travelTimeCloudLayer.clearAndAddLayers(polygons, true);
		});
	} else {
		travelTimeCloudLayer.clearLayers();
		cashMap.removeLayer(travelTimeSrcMarker);
		travelTimeSrcMarker = L.geoJSON(null);
	}
}
*/

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
		routeLayer.clearLayers();
		routeLayer.bindPopup('');

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
				console.log('routing error: ' + errcode + '/' + errmsg);

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

	if (!cashMapAuth.authenticated()) {

		$("#osmAuthInfoModal").modal('show');

	} else {

		getOsmUser();

		// reverse geocode address and fill address fields
		cashMapGeoCoderProvider.reverse( markerLatLon,
			cashMap.options.crs.scale(cashMap.getZoom()),
			function(results) {
				// set coords in hidden form fields
				$('#latitudeHidden').val(markerLatLon.lat.toFixed(6));
				$('#longitudeHidden').val(markerLatLon.lng.toFixed(6));

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

		// TODO preserve new marker
		if (cashMap.hasLayer(newMarkerLayer)) { cashMap.removeLayer(newMarkerLayer);}

		$("#newFeatureModal").modal('show');
	}
}

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
 * @returns {string} - atm pool:  "sparkasse"|"vrbanken"|"cashgroup"|"cashpool"|'keiner'
 */
function getAtmNetwork (feature) {

	var network = feature.properties.tags.network;
	var operator = feature.properties.tags.operator;
	var name = feature.properties.tags.name;
	var featureCenter = null;

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

		if (network.search(/sparkasse|landesbank/i) > -1) { return "sparkassen";}
		if (network.search(/BankCard|Genossenschaft/i) > -1) { return "vrbanken";}
		if (network.search(/cashpool/i) > -1) { return "cashpool";}
		if (network.search(/cash\ group|cashgroup/i) > -1) { return "cashgroup";}
		return 'keiner';

	} else {
		// 2nd check: [operator]
		if (operator) {
			if (operator.search(/sparkasse|landesbank\ berlin|bw\ bank|bw-bank|lbbw/i) > -1) {
				return "sparkassen";
			}
			if (operator.search(/Volksbank|Raiffeisen|PSD|GLS/i) > -1) {
				return "vrbanken";
			}
			if (operator.search(/Sparda|Targo|Santander|citibank|BBBank|Sozialwirtschaft/i) > -1) {
				return "cashpool";
			}
			if (operator.search(/Commerzbank|Deutsche\ Bank|Postbank|Norisbank|Berliner\ Bank|HypoVereinsbank/i) > -1) {
				return "cashgroup";
			}
			return 'keiner';

		} else {
			// 3rd check: [name]
			if (name) {
				if (name.search(/sparkasse|landesbank\ berlin|bw\ bank|bw-bank|lbbw/i) > -1) {
					return "sparkassen";
				}
				if (name.search(/Volksbank|Raiffeisen|PSD|GLS/i) > -1) {
					return "vrbanken";
				}
				if (name.search(/Sparda|Targo|Santander|citibank|BBBank|Sozialwirtschaft/i) > -1) {
					return "cashpool";
				}
				if (name.search(/Commerzbank|Deutsche\ Bank|Postbank|Norisbank|Berliner\ Bank|HypoVereinsbank/i) > -1) {
					return "cashgroup";
				}
				return 'keiner';
			} else {
				return 'keiner';
			}
		}
	}
}

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
	 */
	newMarkerLayer.on('dragend', function (e) {
		newMarkerLayer.openPopup();
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


/**
 *
 *  createChangeset - create OSM changeset
 *  - create new changeset in xml format
 *  - add finde.cash as creator
 *  - add comment from feature form
 *  - API call to PUT changeset
 *
 * @param {string} comment
 * @param {string} featureId (<node|way>/<osm-id>)
 * @param {function} callback - function to be called to upload node (delete/upload)
 */
function createChangeset (comment, featureId, callback) {

	var xmlString =
		"<osm><changeset>" +
		"<tag k='created_by' v='finde.cash " + VERSION[0].number + "'/>" +
		"<tag k='comment' v='" + comment + "'/>" +
		"</changeset></osm>";

	srvLog (xmlString);

	cashMapAuth.xhr({
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
			return (null)

		} else {
			srvLog ('new changeset created, id: ' + changesetId);
			callback(changesetId, featureId);
		}
	});
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
	var specOperator = false;

	if (changesetId) {
		// create array og key/value pairs from all form input fields
		$.each($("#newFeatureForm").serializeArray(), function (index, tag) {
			srvLog (index + ' - ' + tag.name + ' : ' + tag.value);

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
					tag.name.substr(0,1) !== "x" && // internal fields start with "x"
					tag.value.length > 0) {
					// some special handling on Sparkassen, VR-Banken
					if (tag.name === 'operator' && tag.value === 'Sparkassen ...') {
						// set <name> tag to general bank name
						xmlString += "<tag k='name' v='Sparkasse'/>";

					} else if (tag.name === 'operator' && tag.value === 'Volksbanken ...') {
						// set <name> tag to general bank name
						xmlString += "<tag k='name' v='Volksbank'/>";


					} else if (tag.name === 'specialOperator') {
						// take special operator value as <operator> tag
						xmlString += "<tag k='operator' v='" + tag.value + "'/>";

					// special: German atm networks
					} else if (tag.name === 'network') {
						if (tag.value !== 'Keiner') {
							xmlString += "<tag k='network' v='" + tag.value + "'/>";
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

				srvLog('new node created, id: ' + result.getElementsByTagName("node")[0].getAttribute("new_id"));

				cashMapAuth.xhr({
					method: "PUT",
					path: "/api/0.6/changeset/" + changesetId + "/close"
				}, function (err) {
					if (err) {

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
		xmlString += ' lon="' + $("#delLongitude").val() + '" lat="' + $("#delLatitude").val() + '"';
		xmlString += ' version="' + $('#delFeatureVersion').val() + '" changeset="' + changesetId + '">';
		xmlString += '<tag k="amenity" v="atm"/>';
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

