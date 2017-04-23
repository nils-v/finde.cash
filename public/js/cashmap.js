/**
 * Created by nilsvierus on 16.03.17.
 */

(function (utils, constants, leaflet, $) {
 	'use strict';

	var cashMap = leaflet.map('cashMap', {
		zoomControl: false,
		attributionControl: false
	}).setView([52.516, 13.389], 15);

 	var mapboxLayer = leaflet.tileLayer(
 		'https://a.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=' + constants.MAPBOX_TOKEN,
		{
			detectRetina: true,
			attribution: constants.CASHMAP_ATTR + ' | ' + constants.OVERPASS_ATTR + ' | ' + constants.MAPBOX_ATTR + ' | ' +
				constants.OSM_ATTR
		}).addTo(cashMap);

	var osmLayer = leaflet.tileLayer(
		'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		{
			detectRetina: true,
			attribution: constants.CASHMAP_ATTR + ' | ' + constants.OVERPASS_ATTR + ' | ' + constants.OSM_ATTR
		});

	var ocmLayer = leaflet.tileLayer(
		'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=' + constants.TFOREST_KEY,
		{
			detectRetina: true,
			attribution: constants.CASHMAP_ATTR + ' | ' + constants.OVERPASS_ATTR + ' | ' + constants.TFOREST_ATTR + ' | ' +
				constants.OSM_ATTR
		});

	var hybridLayer = leaflet.tileLayer(
		'https://a.tiles.mapbox.com/v4/mapbox.streets-satellite/{z}/{x}/{y}.png?access_token=' + constants.MAPBOX_TOKEN,
		{
			detectRetina: true,
			attribution: constants.CASHMAP_ATTR + ' | ' + constants.OVERPASS_ATTR + ' | ' + constants.MAPBOX_ATTR + ' | ' +
				constants.OSM_ATTR
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

    //var cashMapGeoCoder = leaflet.Control.Geocoder.mapbox();
	var cashMapGeoCoder = leaflet.Control.Geocoder.google();

    var addressMarker, latLonAddressMarker;


	// Map Controls =======================================================
	// Oben links: Suche
	leaflet.Control.geocoder({
		position: 		'topleft',
		placeholder: 	'Ort/Adresse...',
		errorMessage: 	'Nicht gefunden.',
		geocoder: 		cashMapGeoCoder
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
	$('#versionNumber').html('Version: ' + constants.VERSION.number + ' / ' + constants.VERSION.date);

	// Release-Notes
	$('#releaseNotes').html('<h5>Neues in Version: ' + constants.VERSION.number + '</h5>' +
		constants.RELEASE_NOTES);

	// Standort einstellen und darauf zoomen
	cashMap.locate({setView: true, maxZoom: 16});

	/*
	 Eventhandler =======================================================
	 */

	// Map -----------
	cashMap.on('moveend', function(e) {

		 if (this.getZoom() <= 13) {
			 utils.removeAtmLayers(cashMap);
		 } else {
			 utils.loadOsmDataAndCreateLayers(cashMap, overlayLayers);

		 }
	});

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

	cashMap.on('contextmenu', function(e) {

		latLonAddressMarker = e.latlng;
		$("#contextMenu").css({
			left: e.containerPoint.x,
			top: e.containerPoint.y
		}).show();
		return false;
	});


	$("#contextMenu").on("click", "a", function() {

		$("#contextMenu").hide();

	});


	$('#contextMenuAtmNew').click(function (e) {
		cashMapGeoCoder.reverse(
			latLonAddressMarker,
			cashMap.options.crs.scale(cashMap.getZoom()),
			function(results) {
				// Adressfelder vorbelegen
			}
		);

	});

	$('#contextMenuAddress').click(function (e) {

		cashMapGeoCoder.reverse(
			latLonAddressMarker,
			cashMap.options.crs.scale(cashMap.getZoom()),
			function(results) {

				var r = results[0];
				if (r) {
					if (addressMarker) {
						if (!cashMap.hasLayer(addressMarker)) {
							cashMap.addLayer(addressMarker);
						}
						addressMarker.setLatLng(r.center).setPopupContent(r.html || r.name);
					} else {
						addressMarker = leaflet.marker(r.center)
							.bindPopup(r.name).addTo(cashMap);

					}
					addressMarker.openPopup().on('popupclose', function () { cashMap.removeLayer (addressMarker); });
				}
			}
		);

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
	// TODO Select auf ID umstellen
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