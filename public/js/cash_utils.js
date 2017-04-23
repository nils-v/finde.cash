/**
 * Created by nilsvierus on 17.03.17.
 */

var cashmap_utils = cashmap_utils || {};

(function (utils, constants, leaflet, $) {
	'use strict';
	
	utils.loadOsmDataAndCreateLayers = function (map, atmOverlays) {

		var bounds = map.getBounds();
		var bboxString = '(' + bounds.getSouth().toString() + ',' + bounds.getWest().toString() + ',' +
			bounds.getNorth().toString() + ',' + bounds.getEast().toString() + ')';

		var osmOverpassCall = 'https://overpass-api.de/api/interpreter?data=[out:json];(' +
			'node["amenity"="bank"]["atm"="yes"]' + bboxString + ';' +
			'way["amenity"="bank"]["atm"="yes"]' + bboxString + ';' +
			'node["amenity"="atm"]' + bboxString + ';);out body qt;';

		map.spin(true, {
			color : '#0026FF',
			radius : 20,
			width : 7,
			length : 20,
			top: 10
		});

		// call Overpass API (after every move of the map and zoom in/out)
		$.getJSON(osmOverpassCall).done (function (data) {

			// convert overpass JSON to GeoJSON
			var atmDataAsGeojson = osmtogeojson(data);

			// create geoJson Layers (one per atm network) and put in atmOverlays Object

			Object.keys(atmOverlays).forEach(function (verbund) {

				if (atmOverlays[verbund]) {

					map.removeLayer(atmOverlays[verbund]);
				}

				atmOverlays[verbund] = utils.createAtmNetworkLayer(
					atmDataAsGeojson,
					verbund,
					constants.MARKER_COLOR[verbund]
				);

				// if filter condition checked: add to map
				if (!($('i', '#'+verbund).hasClass('invisible'))) {

					atmOverlays[verbund].addTo(map);
				}
			});

			map.spin(false);

		}).fail (function (jwxhr_Object) {

			map.spin(false);
			console.log(jwxhr_Object);

			$('#errorAlert')
				.html('OSM-Daten konnten nicht gelesen werden.' +
					' <span class="errorCode">(Fehler: ' + jwxhr_Object.status + ' - ' +
					jwxhr_Object.statusText + ')</span>' + constants.CLOSE_BUTTON)
				.removeClass('invisible');

		});

	};

	/*
	 createAtmNetworkLayer: function
	 */
	utils.createAtmNetworkLayer = function (geoJsonData, networkName, networkMarkerColor) {
		return leaflet.geoJSON(geoJsonData, {

			filter: function (feature, layer) {
				return (utils.checkAtmNetwork(networkName, feature));
			},

			pointToLayer: function (feature, latlng) {
				var ohDefined = false;
				if (feature.properties.tags.opening_hours) {

					var oh = new SimpleOpeningHours(feature.properties.tags.opening_hours);
					var ohObj = oh.getTable();
					var validOh = false;
					Object.keys(ohObj).forEach(function (dayOfWeek) {
						if (ohObj[dayOfWeek].length !== 0)  { ohDefined = true;}
					});

				}

				// TODO Awsome durch Glyphicon ersetzen
				return leaflet.marker(latlng, {
						icon: leaflet.AwesomeMarkers.icon({
							icon: feature.properties.tags.amenity === 'bank' ? 'institution' : 'euro',
							prefix: 'fa',
							markerColor: networkMarkerColor,
							iconColor: (ohDefined) ? (oh.isOpenNow() ? '#278c11' : '#c60816') : 'black'
						})
					}
				);

			},

			onEachFeature: function (feature, layer) {

				if (feature.properties.tags) {

					// Modal  / Tab Allgemein füllen
					var headerLine = (feature.properties.tags.amenity === "bank") ? "Bank" : "Geldautomat";
					var featureInfo = '';
					var openingTable = '';
					var osmInfo = '';

					// [operator]
					if (feature.properties.tags.operator) {
						featureInfo += ((headerLine === 'Bank') ? '<p>Name: ' : '<p>Betrieben von: ') +
							feature.properties.tags.operator + '</p>';
					} else {
						osmInfo += (headerLine === 'Geldautomat') ?
							'<p><i>Betreiber (Attribut [' +
							'<a target="_new" href="http://wiki.openstreetmap.org/wiki/Key:operator">operator</a>' +
							']) nicht erfasst.</i></p>' : '';
						if (feature.properties.tags.name) {
							featureInfo += ((headerLine === 'Bank') ? '<p>Name: ' : '<p>Betrieben von: ') +
								feature.properties.tags.name + '</p>';
						} else {
							osmInfo += '<p><i>Bankname (Attribut [' +
								'<a target="_new" href="http://wiki.openstreetmap.org/wiki/Key:name">name</a>' +
								']) nicht erfasst.</i></p>';
						}
					}

					// [network]
					if (feature.properties.tags.network) {
						featureInfo += '<p>Automatenverbund: ' + (feature.properties.tags.network) + '</p>';
					} else {
						featureInfo += '<p>Automatenverbund: ' + constants.NETWORK[utils.getAtmNetwork(feature)]
						osmInfo +=	((headerLine === 'Geldautomat') ?
							'<p><i>Automatenverbund (Attribut [' +
							'<a target="_new" href="http://wiki.openstreetmap.org/wiki/Key:network">network</a>' +
							']) nicht erfasst.</i></p>' : '');
					}

					// [opening_hours]
					if (feature.properties.tags.opening_hours) {

						var openHours = new SimpleOpeningHours(feature.properties.tags.opening_hours);
						var ohObj = openHours.getTable();
/*
						console.log('1. OSM:' + feature.properties.tags.opening_hours);
						console.log('2. ohTable: ' + ohObj);
						console.table(ohObj);
*/
						var validOh = false;
						Object.keys(ohObj).forEach(function (dayOfWeek) {
							if (ohObj[dayOfWeek].length !== 0) { validOh = true;}
						});

						if (validOh) {
							/*
							console.log('3. Datum: ' + new Date().toTimeString());
							console.log('4. valid oh -' + (openHours.isOpenNow() ? 'offen' : 'zu'));
							*/

							featureInfo += (openHours.isOpenNow() ?
								'<p class="text-success font-weight-bold">Jetzt ge&ouml;ffnet.</p>' :
								'<p class="text-danger font-weight-bold">Jetzt geschlossen.</p>');

							openingTable = '<table class="table-sm table-striped table-bordered table-responsive">';
							Object.keys(ohObj).forEach(function (dayOfWeek) {
								if (ohObj[dayOfWeek][0]) {

									openingTable += "<tr><th>" + constants.WOCHENTAG_NAME[dayOfWeek] + "</th><td>";
									ohObj[dayOfWeek].forEach(function (oh) {
										openingTable += oh + "    ";
									});
									openingTable += "</td></tr>";
								}
							});
							openingTable += "</table>";
						} else {
							openingTable += '<p>Ung&uuml;ltige &Ouml;ffnungszeit erfasst.</p>';
						}
					} else {
						featureInfo += '<p><strong>Keine &Ouml;ffnungszeit erfasst.</strong></p>';
						osmInfo += '<p><i>&Ouml;ffnungszeiten (Attribut [' +
							'<a target="_new" href="http://wiki.openstreetmap.org/wiki/Key:opening_hours">opening_hours</a>' +
							']) nicht erfasst.</i></p>';

						openingTable += '<button type="button" id="newOpeningHours" ' +
							'class="btn bt-sm btn-outline-primary pull-right disabled">Jetzt erfassen</button>';
					}

					// Modal Tab OSM Info füllen
					var osmTagTable = '<table class="table-sm table-striped table-bordered table-responsive">';
					osmTagTable += 	'<tr><th><strong>Attribut</strong></th><td><strong>Wert</strong></td></tr>';

					Object.keys(feature.properties.tags).forEach(function (tag) {

						// TODO Sprachabhängig
						osmTagTable += '<tr><th>' +
							'<a  target="_new" href="http://wiki.openstreetmap.org/wiki/Key:' + tag + '">' +
							tag + '</a></th><td>' + feature.properties.tags[tag] +	'</td></tr>';

					});

					osmTagTable += "</table><br />";

					layer.on({ click: function (e) {

						// erster Tab aktiv
						$('#feature-info a:first').tab('show');
						// Kopfzeile füllen
						$("#feature-title").html(headerLine);
						// Übersicht füllen
						$("#feature-info").html(featureInfo);
						//OSM Tags Tabelle füllen
						$("#osm-tags").html(osmTagTable + osmInfo);
						// Öffnungszeiten-Tabelle
						$("#opening").html(openingTable);
						// Modal anzeigen
						$("#featureModal").modal("show");
						}
					});

				}
			}
		});
	};

	/*
	 removeAtmLayers: löscht alle overlay Layer
	*/
	utils.removeAtmLayers = function (map) {

		map.eachLayer (function (layer) {
			if (layer.feature) {
				map.removeLayer (layer);
			}
		});
	};

	/*
	 checkAtmNetwork: prüft, ob der Automatenverbund (ermittelt aus feature) dem Parameter "name" entspricht
    */
	utils.checkAtmNetwork = function (name, feature) {

		return (name === utils.getAtmNetwork(feature));

	};

	/*
	 getAtmNetwork: gibt den Automatenverbund anhand der OSM-Tags [network], [operator] und [name] zurück
	*/

	utils.getAtmNetwork = function (feature) {

		var network = feature.properties.tags.network;
		var operator = feature.properties.tags.operator;
		var name = feature.properties.tags.name;

		// check [network] first
		if (network) {

			if (network.search(/sparkasse/i) > -1) { return "sparkassen";}
			if (network.search(/BankCard|Genossenschaft/i) > -1) { return "vrbanken";}
			if (network.search(/cashpool/i) > -1) { return "cashpool";}
			if (network.search(/cash group|cashgroup/i) > -1) { return "cashgroup";}
			return "sonstige";

		} else {
			// 2nd check: [operator]
			if (operator) {
				if (operator.search(/sparkasse|landesbank berlin/i) > -1) {
					return "sparkassen";
				}
				if (operator.search(/Volksbank|Raiffeisen|PSD/i) > -1) {
					return "vrbanken";
				}
				if (operator.search(/Sparda|Targo|Santander|citibank|BBBank|Sozialwirtschaft/i) > -1) {
					return "cashpool";
				}
				if (operator.search(/Commerzbank|Deutsche Bank|Postbank|Norisbank|Berliner Bank|HypoVereinsbank/i) > -1) {
					return "cashgroup";
				}
				return "sonstige";

			} else {
				// 3rd check: [name]
				if (name) {
					if (name.search(/sparkasse|landesbank berlin/i) > -1) {
						return "sparkassen";
					}
					if (name.search(/Volksbank|Raiffeisen|PSD/i) > -1) {
						return "vrbanken";
					}
					if (name.search(/Sparda|Targo|Santander|citibank|BBBank|Sozialwirtschaft/i) > -1) {
						return "cashpool";
					}
					if (name.search(/Commerzbank|Deutsche Bank|Postbank|Norisbank|Berliner Bank|HypoVereinsbank/i) > -1) {
						return "cashgroup";
					}
					return "sonstige";
				} else {
					return "sonstige";
				}
			}
		}
	};

})(cashmap_utils, cashmap_const, window.L, window.jQuery);