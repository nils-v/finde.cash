/**
 * Created by nilsvierus on 16.03.17.
 */

(function (utils, constants, leaflet, $) {
 	'use strict';

	var cashMap = leaflet.map('cashMap', {
		zoomControl: false,
		attributionControl: false,
		contextmenu: true,
		contextmenuItems: [{
			text: 'Neu anlegen',
			callback: utils.createFeature
		}, {
			text: 'Adresse anzeigen',
			callback: utils.showCurrAddress
		}]
	}).setView([52.516, 13.389], 15);

 	var mapboxLayer = leaflet.tileLayer(
 		'https://a.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=' + constants.MAPBOX_TOKEN,
		{
			detectRetina: true,
			attribution: constants.CASHMAP_ATTR + ' | ' + constants.MAPBOX_ATTR + ' | ' + constants.OSM_ATTR
		}).addTo(cashMap);

	var osmLayer = leaflet.tileLayer(
		'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		{
			detectRetina: true,
			attribution: constants.CASHMAP_ATTR + ' | ' + constants.OSM_ATTR
		});

	var ocmLayer = leaflet.tileLayer(
		'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=' + constants.TFOREST_KEY,
		{
			detectRetina: true,
			attribution: constants.CASHMAP_ATTR + ' | ' + constants.TFOREST_ATTR + ' | ' + constants.OSM_ATTR
		});

	var hybridLayer = leaflet.tileLayer(
		'https://a.tiles.mapbox.com/v4/mapbox.streets-satellite/{z}/{x}/{y}.png?access_token=' + constants.MAPBOX_TOKEN,
		{
			detectRetina: true,
			attribution: constants.CASHMAP_ATTR + ' | ' + constants.MAPBOX_ATTR + ' | ' + constants.OSM_ATTR
		});

    var baseLayers = {
		'MapBox' : mapboxLayer,
    	'OpenStreetMap' : osmLayer,
		'OpenCycleMap' : ocmLayer,
		'Satellit' : hybridLayer
	};

    var overlayLayers = {
		'sparkassen': null,
		'vrbanken': null,
		'cashpool': null,
		'cashgroup': null,
		'sonstige': null
	};

	// Map Controls =======================================================
	// Oben links: Suche
	leaflet.Control.geocoder({
		position: 'topleft',
		placeholder: 'Ort/Adresse...',
		errorMessage: 'Nicht gefunden.'
	}).addTo(cashMap);

    // Oben rechts: Baselayer, Zoom, Locate
	leaflet.control.layers(baseLayers).addTo(cashMap);
    leaflet.control.zoom({ position: 'topright' }).addTo(cashMap);
    leaflet.control.locate({ position: 'topright' }).addTo(cashMap);

    // Unten rechts: Attibution
	leaflet.control.attribution().addTo(cashMap);

    // Unten links: Maßstab
    leaflet.control.scale({ position: 'bottomleft' }).addTo(cashMap);

    // Versionsnummer
	$('#version').html('Version: ' + constants.VERSION.number + ' / ' + constants.VERSION.date);

	// Standort einstellen und darauf zoomen
	cashMap.locate({setView: true, maxZoom: 16});

	/*
	 Eventhandler =======================================================
	 */

	// Map -----------
	// <moveend>: Ende von <Karte verschieben>
	cashMap.on('moveend', function(e) {

		 if (this.getZoom() <= 13) {
			 utils.removeAtmLayers(cashMap);
		 } else {
			 utils.loadOsmDataAndCreateLayers(cashMap, overlayLayers);

		 }
	});

	// <zoomend>: ???
	cashMap.on('zoomend', function(e) {

		if (this.getZoom() <= 13) {
			$("#zoomAlert").removeClass('invisible'); }
		else {
			$("#zoomAlert").addClass('invisible');
		}
	});

	cashMap.on('locationfound', function(e) {

	});

	cashMap.on('locationerror', function(e) {

		$('#errorAlert')
			.html('Dein Standort konnte nicht ermittelt werden.' + constants.CLOSE_BUTTON)
			.removeClass('invisible');

		utils.loadOsmDataAndCreateLayers(cashMap, overlayLayers);

	});

	// Alert Handling
	// Hide Alert
	$('.close, #errorAlert').click(function (e) {

		$('#errorAlert').addClass('invisible');

	});

	// Menü Filter -----------
	/*
	 Auswahl Bankenverbund, Ein-/Ausschalten des Layers
	 */
	$('.dropdown-item').click(function (e) {

		if ($('i', this).hasClass('invisible')) {
			// Layer einschalten
			$('i', this).removeClass('invisible');

			if (!cashMap.hasLayer(overlayLayers[$(this).attr('id')])) {

				cashMap.addLayer(overlayLayers[$(this).attr('id')]);

			}

		} else {
			// Layer ausschalten
			$('i', this).addClass('invisible');

			if (cashMap.hasLayer(overlayLayers[$(this).attr('id')])) {

				cashMap.removeLayer(overlayLayers[$(this).attr('id')]);

			}
		}
	});

})(cashmap_utils, cashmap_const, window.L, window.jQuery);