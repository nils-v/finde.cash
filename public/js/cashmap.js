/**
 * Created by nilsvierus on 16.03.17.
 */

VERSION = [
	{
		number: '0.9.2',
		date: '10.06.2017'
	},
	{
		number: '0.8.3',
		date: '23.04.2017'
	}];

RELEASE_NOTES = {};

RELEASE_NOTES['0.9.2'] = '<p>Du kannst jetzt über einen rechten Mausklick/Tap & Hold oder das Menü neue Geldautomaten' +
	' in OSM erfassen. Die Adresse wird automatisch ermittelt und &uuml;bernommen, Du kannst sie vor dem Hochladen' +
	' korrigieren.</p>';

RELEASE_NOTES['0.8.3'] = '<p>Mit einem rechten Mausklick oder einem langen Tap kannst Du in der Karte die dort ' +
	'n&auml;chstliegende Adresse anzeigen lassen.</p>';

MAPBOX_TOKEN = 'pk.eyJ1IjoibmlscyIsImEiOiJjaW1wNzdrcGQwMDJ6d2FtNHk3YzJqZmRkIn0.MLGG4q0ptisudg2S85r0oA';
TFOREST_KEY = 'f75e52ff671445ffa6b2eaeff9f1143d';

CASHMAP_ATTR = '<span class="hideAttr">Developed by </span>' +
	'<a target="_new" href="http://www.osm-maps.eu">osm-maps.eu</a>';
OVERPASS_ATTR = '<span class="hideAttr">Data via </span>' +
	'<a target="_new" href="http://www.overpass-api.com">Overpass API</a>';
MAPBOX_ATTR = '<span class="hideAttr">Imagery © </span>' +
	'<a target="_new" href="http://www.mapbox.com">Mapbox</a>';
TFOREST_ATTR = '<span class="hideAttr">Maps © </span>' +
	'<a target="_new" href="http://www.thunderforest.com">Thunderforest</a>';
OSM_ATTR = '<a target="_new" href="http://openstreetmap.org">OpenStreetMap</a>-' +
	'<span class="hideAttr">Mitwirkende </span>(' +
	'<a target="_new" href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>)';
ICON_ATTR = '<span class="hideAttr">Icons by </span>' +
	'<a  target="_new" href="http://www.flaticon.com/authors/dave-gandy" title="Dave Gandy">flaticon</a>';

CLOSE_BUTTON = '<button type="button" class="close" aria-label="Schlie&szlig;en">' +
	'<span aria-hidden="true">&times;</span></button>';

MARKER_COLOR = {
	'sparkassen': 'lightred',
	'vrbanken'	: 'lightgreen',
	'cashpool'	: 'blue',
	'cashgroup'	: 'beige',
	'sonstige'	: 'lightgray'
};

WOCHENTAG_NAME = {
	'su':'Sonntag',
	'mo':'Montag',
	'tu':'Dienstag',
	'we':'Mittwoch',
	'th':'Donnerstag',
	'fr':'Freitag',
	'sa':'Samstag',
	'ph':'Feiertage'
};

NETWORK = {
	'sparkassen': 'Sparkassen-Finanzverbund',
	'vrbanken'	: 'BankCard Servicenetz (VR Banken)',
	'cashpool'	: 'CashPool',
	'cashgroup'	: 'Cash Group',
	'sonstige'	: 'keiner'
};

/**
 *  Globale Variablen
 *
 */
var addressMarker = null;
var newMarker = {};
var newMarkerLatLon = {};
var releaseNotes = '';
var timerID = null;
/**
 * create leaflet map with context menu
 *
 * setview to cover Germany
 */
var cashMap = L.map('cashMap', {
	zoomControl: false,
	attributionControl: false,
	contextmenu: true,
	contextmenuWidth: 140,
	contextmenuItems: [
		{
			text: 'Erfassen ...',
			icon: 'img/pencil.png',
			retinaIcon: 'img/pencil_@2.png',
			callback: newFeatureOnMap
		}, {
			separator: true,
		}, {
			text: 'Adresse',
			icon: 'img/address.png',
			retinaIcon: 'img/address_@2.png',
			callback: showAddress
		}]
}).setView([51.0, 9.9], 6);

/**
 * define base layers
 */
var mapboxLayer = L.tileLayer(
	'https://a.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=' + MAPBOX_TOKEN,
	{
		maxZoom: 19,
		detectRetina: true,
		attribution: CASHMAP_ATTR + ' | ' + OVERPASS_ATTR + ' | ' + MAPBOX_ATTR + ' | ' + ICON_ATTR + ' | ' +
			OSM_ATTR
	}).addTo(cashMap);

var osmLayer = L.tileLayer(
	'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
	{
		maxZoom: 19,
		detectRetina: true,
		attribution: CASHMAP_ATTR + ' | ' + OVERPASS_ATTR + ' | ' + OSM_ATTR
	});

var ocmLayer = L.tileLayer(
	'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=' + TFOREST_KEY,
	{
		maxZoom: 19,
		detectRetina: true,
		attribution: CASHMAP_ATTR + ' | ' + OVERPASS_ATTR + ' | ' + TFOREST_ATTR + ' | ' +
			OSM_ATTR
	});

var hybridLayer = L.tileLayer(
	'https://a.tiles.mapbox.com/v4/mapbox.streets-satellite/{z}/{x}/{y}.png?access_token=' + MAPBOX_TOKEN,
	{
		maxZoom: 19,
		detectRetina: true,
		attribution: CASHMAP_ATTR + ' | ' + OVERPASS_ATTR + ' | ' + MAPBOX_ATTR + ' | ' +
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
	'sparkassen': null,
	'vrbanken': null,
	'cashpool': null,
	'cashgroup': null,
	'sonstige': null
};

// define map controls =======================================================

// top left search
var cashMapGeoCoder = L.Control.Geocoder.google();
L.Control.geocoder({
	position: 		'topleft',
	placeholder: 	'Ort/Adresse...',
	errorMessage: 	'Nicht gefunden.',
	geocoder: 		cashMapGeoCoder
}).addTo(cashMap);

// top right: base layer switcher, zoom, locate
L.control.layers(baseLayers).addTo(cashMap);
L.control.zoom({ position: 'topright' }).addTo(cashMap);
L.control.locate({ position: 'topright' }).addTo(cashMap);

// bottom right: attribution
L.control.attribution().addTo(cashMap);

// bottom left: scale
L.control.scale({ position: 'bottomleft' }).addTo(cashMap);

// build version history
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
	 oauth_secret: "fAJv1DunRsvAjoyft03tksqitRcjEIFISqMwu9H9",
	 oauth_consumer_key: "lQKPCyfCvhQU3CxCHaESW4LN8Zq9Lmp2a8d49nAx",
	 auto: true,
	 url: 'https://www.openstreetmap.org'
});

// log4javascript
var log = log4javascript.getLogger();

var ajaxAppender = new log4javascript.AjaxAppender("php/srv_log.php");
ajaxAppender.setThreshold(log4javascript.Level.ERROR);
log.addAppender(ajaxAppender);

// map events -----------------------------------------------------------------------------------------
/**
 * event handler map - start of map move
 *
 * switch off spiner
 * clear timer for delayed data loading
 */
cashMap.on('movestart', function(e) {

	cashMap.spin(false);
	if (timerID) {
		window.clearTimeout(timerID);
		timerID = null;
	}

});

/**
 * event handler map - end of map move
 *
 * 	only if timer (1,5 sec) elapsed: load data
 * 	(delayed loading to avoid load errors at fast map moves on mobile devices)
 *
 *  if zoom <=12 no data load
 * 	if zoom 13..15 -> load data with Overpass API
 * 	if zoom >16..18 -> load data with OSM API

 */
cashMap.on('moveend', function(e) {

	var currZoom = this.getZoom();
	if (currZoom > 12) {
		timerloadOsmDataID = window.setTimeout(function () {
			loadOsmData(currZoom > 15 ? true : false)
		}, 1500);
	}
});

/**
 * event handler map - end of zoom change
 *
 * 	if zoom factor <= 12 show warning, remove marker layers
 * 	else hide warning
 * 	(data is loaded via moveend event handler)
 */
cashMap.on('zoomend', function(e) {

	$("#dangerAlert").html('').addClass('invisible');
	if (this.getZoom() <= 12) {

		removeAtmLayers(cashMap);
		$("#warningAlert").html('Zoome weiter hinein für Anzeige!' + CLOSE_BUTTON).removeClass('invisible');

	} else {

		$("#warningAlert").html('').addClass('invisible');

	}
});

/**
 *
 * event handler map - geo location found
 *
 * hide message
 */
cashMap.on('locationfound', function(e) {

	$("#warningAlert").html('').addClass('invisible');

});

/**
 *
 * event handler map - geo location not found
 *
 * 	- show closable alert
 */
cashMap.on('locationerror', function(e) {

	$("#warningAlert").html('').addClass('invisible');
	$('#dangerAlert')
		.html('Dein Standort konnte nicht ermittelt werden.<br />Zoome weiter in die Karte, um Daten anzuzeigen.' +
			CLOSE_BUTTON)
		.removeClass('invisible');

});

// jQuery events ------------------------------------------------------------------------------

/*
*
* Menu ----------------------------------------------------------------------------------------
*
*/

/**
 * menu item click handler
 *
 * #sparkassen, #vrbanken, #cashgroup, #cashpool, #sonstige - toggle marker layers
 *
 */
$('#sparkassen, #vrbanken, #cashgroup, #cashpool, #sonstige').click( function (e) {

	if ($('i', this).hasClass('invisible')) {
		// show layer
		$('i', this).removeClass('invisible');
		if (!cashMap.hasLayer(overlayLayers[$(this).attr('id')])) {

			cashMap.addLayer(overlayLayers[$(this).attr('id')]);

		}

	} else {
		// hide layer
		$('i', this).addClass('invisible');
		if (cashMap.hasLayer(overlayLayers[$(this).attr('id')])) {

			cashMap.removeLayer(overlayLayers[$(this).attr('id')]);

		}
	}
	return false
});


/**
 * menu item click handler
 *
 * #menuNew - set draggable red marker with start icon for new atm
 *
 * set marker click handler for new form/delete marker
 *
 */
$('#menuNewOnMap').click( function (e) {

	if (newMarker) { cashMap.removeLayer(newMarker); }

	newMarker = L.marker(
		cashMap.getCenter(), {
		icon: L.AwesomeMarkers.icon({
			icon: 'star',
			prefix: 'fa',
			markerColor: 'red',
			iconColor: 'white'
		}),
		draggable: true,
		contextmenu: true,
		contextmenuInheritItems: false,
		contextmenuItems: [{
			text: 'Erfassen ...',
			icon: 'img/pencil.png',
			retinaIcon: 'img/pencil_@2.png',
			callback: editNewMarker

		}, {
			separator: true
		}, {
			text: 'Verwerfen',
			icon: 'img/trash.png',
			retinaIcon: 'img/trash_@2.png',
			callback: deleteNewMarker
		}]
	}).bindPopup(
		'<div style="font-size: 1rem">' +
		'Ziehe den Marker zur gew&uuml;nschten Position,<br />dann Rechts-Klick/Tap&Hold zum Bearbeiten.</div>'
	).addTo(cashMap);

	// show hint popup
	newMarker.openPopup();

	// new position reached
	newMarker.on('dragend', function (e) {

		newMarker.openPopup();
		return false

	});

	// left click -> show hint popup
	newMarker.on('click', function (e) {

		newMarker.openPopup();
		return false

	});

	// right click - context menu edit/cancel
	newMarker.on('contextmenu', function (e) {

		newMarker.closePopup();
		newMarkerLatLon = newMarker.getLatLng();
		return false
	});

});


/**
 * menu item click handler
 *
 * #osmLoginToggle - menu OSM / item Anmelden/Abmelden
 *
 * login in to osm / lgour from OSM
 */
$('#osmLoginToggle').click( function (e) {

	if (!cashMapAuth.authenticated()) {

		cashMapAuth.authenticate( function() {

			srvLog ('not authenticated');
			// getOsmUser sets #osmLoginToggle and #osmLogin
			getOsmUser();

		});

	} else {

		cashMapAuth.logout();
		srvLog ('logged out');

		getOsmUser();

	}
	return false
});


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
 */
$('#newFeatureModal').on('show.bs.modal', function (e) {

	initNewFeatureForm();

})


/**
 * selectbox change handler
 *
 * #operatorSelect - set atm network field according to bank select
 */
$("#operatorSelect").change(function() {
	var network = '';
	var operator = $("#operatorSelect option:selected").text();
	if (operator.search(/sparkasse|landesbank berlin|bw bank|lbbw/i) > -1) {
		network = "Sparkassen-Finanzverbund";
	} else if (operator.search(/Volksbank|Raiffeisen|PSD/i) > -1) {
		network = "BankCard-Netz (VR-Banken)";
	} else if (operator.search(/Sparda|Targo|Santander|citibank|BBBank|Sozialwirtschaft/i) > -1) {
		network = "CashGroup";
	} else if (operator.search(/Commerzbank|Deutsche Bank|Postbank|Norisbank|Berliner Bank|HypoVereinsbank/i) > -1) {
		network = "Cashpool";
	} else {
		network = "Keiner";
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
	$("#networkSelect").val(network).attr("selected", true);

	return false
});


/**
 * selectbox change handler
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
						'<a target="_new" href="http://wiki.openstreetmap.org/wiki/Key:opening_hours">opening_hours</a>])' +
				'</small>' +
				'<input class="form-control" name="xOsmOpeningText" id="osmOpeningText" type="text">' +
			'</div>'
		);

	}

	return false
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
 * @param e
 */
function toggleChevron(e) {

	$(e.target)
		.prev('.card-header')
		.find('i.indicator')
		.toggleClass('fa-chevron-down fa-chevron-up');
}


/**
 * button click handler
 *
 * #btnFormCancel, #btnFormClose - close form #newFeatureForm
 *
 * 		reset form
 * 		clear validation markup
 *
 * 		propagate event to bootstrap
 */
$('#btnFormCancel, #btnFormClose').click ( function (e) {

	initNewFeatureForm();

});

// ---------------------------------------------------------------------------------------------------

/**
 * #btnDeleteFeature - delete feature
 */
$('#btnDeleteFeature').click ( function (e) {

	newChangeset(
		"atm out of service",
		$('#delFeatureObj').val(),
		deleteNode
	);
	$("#deleteFeatureModal").modal('hide');
});


// alert boxes **************************************************************************
// clear and close warning alert
/**
 * button click handler
 *
 * #warningAlert, #dangerAlert - close box
 */
$('.close, #warningAlert').click(function (e) {
	$('#warningAlert').html('').addClass('invisible');
});


// close danger alert
$('.close, #dangerAlert').click(function (e) {
	$('#dangerAlert').html('').addClass('invisible');
});


/**
 * main function (after DOM is loaded) *************************************************************
 */
$(function () {

	// check OSM authentication, if yes show authenticated user
	getOsmUser();

	// locate geo position
	$('#warningAlert').html('Ermittle Deinen Standort ...').removeClass('invisible');
	cashMap.locate({setView: true});

	/**
	 * form validation
	 *
	 * #newFeatureForm - validate form fields <operator> and <comment>
	 *
	 *     #operatorSelect has to be filled
	 *     if #operatorSelect = Sparkassen ...' | 'Volksbanken ...' | 'Andere ...' -> #operatorInput has to be filled
	 *     #commentInput has to be filled
	 *
	 *     reference to fields by <name> attribut, not <id>!
	 *     submit handler starts feature upload to OSM
	 *     empty function <errorPlacement> hides standard error messages
	 */
	$('#newFeatureForm').validate({
		// vaidate filds even they are collapsed
		ignore: false,

		// do not validate on focusout
		onfocusout: false,

		// do not validate on keyup
		onkeyup: false,

		// validation rules per field
		rules: {
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
			;

			// set hidden <opening_hours> field from text field
			if ($('#osmOpeningText').length > 0) {
				$("#OpeningHoursHidden").val($('#osmOpeningText').val());
			}
			;

			// convert additional tag/value pairs, mark with class addTagField to remove on initForm
			for (i = 1; i < 4; i++) {
				if ($('#osmTag' + i).length > 0 && $('#osmValue' + i).length > 0) {
					$('#collapseOther .form-group').append(
						'<input class="addTagField" type="hidden" name="' + $('#osmTag' + i).val() +
							'" id="osmTagHidden' + i + '">');
					$('#osmTagHidden' + i).val($('#osmValue' + i).val());
				}
			}

			// write data to osm database
			newChangeset( $("#commentInput").val(), null, uploadNode );

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
	});

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
 * retzurn error description in German (locale = de)
 *
 * @param ohString
 *
 * @returns {string} err - error msg from opening_hours lib
 */
function getOpeningHoursError (ohString) {
	try {
		var oh = new opening_hours(ohString, {}, { 'locale': 'de' });
	} catch (err){
		srvLog(err);
		return (err)
	}
	return null;
}


// functions ---------------------------------------------------------------------------------------
/**
 * getOsmUser - Calls the OSM API to get the logged in user details as xml
 *
 * 	- sets the user details in menu item OSM
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

				srvLog ('authenticated');
			}

		});
	} else {

		$("#osmLoginToggle").html('<i class="fa fa-sign-in"></i>&nbsp;&nbsp;Anmelden');
		$('#osmUser').html('nicht angemeldet');

		srvLog ('not authenticated');
	}
}

/**
 *
 * loadOsmData - load data from OSM via Overpass API and create map layers for atm networks
 *
 * @param {useAPI06} boolean - if true: use API 0.6, else use overpass API
 *
 * @param {object} overlayLayers - internal layers object
 *
 * 		get map bounds and use it as bbox for API call
 *
 */
function loadOsmData (useAPI06) {

	var bounds = cashMap.getBounds();

	cashMap.spin(true, {
		color: '#0026FF',
		radius: 20,
		width: 7,
		length: 20,
		top: 10
	});

	if (useAPI06) {
		//  API 0.6 ================================================================================
		// temp GeoJSON layer to cover all atm/bank
		var atmLayer = L.geoJson(null, {});
		var atmData = {}, atmDataAsGeojson = {};

		$.ajax({
			//url: "https://master.apis.dev.openstreetmap.org/api/0.6/map?bbox=" + bounds.toBBoxString(),
			url: "https://api.openstreetmap.org/api/0.6/map?bbox=" + bounds.toBBoxString(),
			dataType: "xml",
			success: function (data) {

				// convert XML to GeoJSON
				var OsmDataAsGeojson = osmtogeojson(data);

				$.each(OsmDataAsGeojson.features, function (index, feature) {

					// add only atm and bank with atm to geoJSON layer
					if (
						(feature.properties.tags.hasOwnProperty('amenity') &&
						 feature.properties.tags['amenity'] === 'atm')
						||
						(feature.properties.tags.hasOwnProperty('amenity') &&
						 feature.properties.tags['amenity'] === 'bank' &&
						 feature.properties.tags.hasOwnProperty('atm') &&
						 feature.properties.tags['atm'] === 'yes')
					)
					{
						atmLayer.addData(feature);
					}

				});

				// save layer data as GeoJSON
				atmDataAsGeojson = atmLayer.toGeoJSON();

				// create geoJson Layers (one per atm network) and put in overlayLayers object
				Object.keys(overlayLayers).forEach(function (verbund) {

					// removeLayer
					if (cashMap.hasLayer(overlayLayers[verbund])) {
						cashMap.removeLayer(overlayLayers[verbund]);
					}

					overlayLayers[verbund] = createAtmLayer(atmDataAsGeojson, verbund);

					// if filter condition in menu checked: add to map
					if (!($('i', '#' + verbund).hasClass('invisible'))) {
						overlayLayers[verbund].addTo(cashMap);
					}
				});

				cashMap.spin(false);

			},
			error: function (jqxhr, options, error) {
				cashMap.spin(false);
				srvLog('ajax error');
				srvLog(jqxhr.responseText)

			}

		});
	} else {

		// Overpass API =================================================================================

		var bboxString = '(' + bounds.getSouth().toString() + ',' + bounds.getWest().toString() + ',' +
			bounds.getNorth().toString() + ',' + bounds.getEast().toString() + ')';

		var osmOverpassCall = 'https://overpass-api.de/api/interpreter?data=[out:json];(' +
			'node["amenity"="bank"]["atm"="yes"]' + bboxString + ';' +
			'way["amenity"="bank"]["atm"="yes"]' + bboxString + ';' +
			'node["amenity"="atm"]' + bboxString + ';);out body qt;';

		$.getJSON(osmOverpassCall).done( function (data) {

			// convert overpass JSON to GeoJSON
			var atmDataAsGeojson = osmtogeojson(data);

			// create geoJson Layers (one per atm network) and put in overlayLayers Object
			Object.keys(overlayLayers).forEach( function (verbund) {

				if (cashMap.hasLayer(overlayLayers[verbund])) {
					cashMap.removeLayer(overlayLayers[verbund]);
				}

				overlayLayers[verbund] = createAtmLayer(
					atmDataAsGeojson,
					verbund,
					MARKER_COLOR[verbund]
				);

				// if filter condition is checked: add to map
				if (!($('i', '#' + verbund).hasClass('invisible'))) {
					overlayLayers[verbund].addTo(cashMap);
				}
			});

			cashMap.spin(false);

		}).fail( function (jwxhr_Object) {

			cashMap.spin(false);
			srvLog(jwxhr_Object.statusText);

			$('#dangerAlert')
				.html('OSM-Daten konnten nicht gelesen werden.' +
					' <span class="errorCode">(Fehler: ' + jwxhr_Object.status + ' - ' +
					jwxhr_Object.statusText + ')</span>' + CLOSE_BUTTON)
				.removeClass('invisible');

		});
	}
}

/**
 *
 * createAtmLayer: creates a layer on map for specified atm pool <networkName> from geojson data
 * 		uses networkMarkerColor to define marker color (from predefined set)
 *
 * @param {json} geoJsonData - data in geojson format
 * @param {string} networkName - atm pool ("sparkasse"|"vrbanken"|"cashgroup"|"cashpool"|"sonstige")
 *
 * @returns {L.geoJSON} - geoJSON layer object
 */
function createAtmLayer (geoJsonData, networkName) {
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
			return (checkAtmNetwork(networkName, feature));
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
			var oh = {};
			if (feature.properties.tags.opening_hours) {

				// opening hours lib throws error on invalid values
				try {
					var oh = new opening_hours(feature.properties.tags.opening_hours);
					var ohDefined = (oh.getWarnings().length === 0);
				} catch (err){
					srvLog('pointToLayer/opening_hours err: ' + feature.id + '/' + err)
				}

			}

			// TODO Awsome durch Glyphicon ersetzen
			return L.marker(latlng, {
					icon: L.AwesomeMarkers.icon(
						{
							icon: feature.properties.tags.amenity === 'bank' ? 'institution' : 'euro',
							prefix: 'fa',
							markerColor: MARKER_COLOR[networkName],
							iconColor: (ohDefined) ? (oh.getState() ? '#278c11' : '#c60816') : 'black'
						}),
					contextmenu: true,
					contextmenuInheritItems: false,
					contextmenuItems: [{
						text: 'Bearbeiten ...',
						icon: 'img/pencil.png',
						retinaIcon: 'img/pencil_@2.png',
						callback: editFeature
					}, {
						text: 'Löschen',
						icon: 'img/trash.png',
						retinaIcon: 'img/trash_@2.png',
						callback: deleteFeature
					},
						{
						separator: true
					}, {
						text: 'Route',
						icon: 'img/route.png',
						retinaIcon: 'img/route_@2.png',
						callback: routeToFeature
					}]
				} // L.marker
			);

		},

		/**
		 *
		 * option: onEachFeature
		 *
		 * @param feature
		 * @param layer
		 */
		onEachFeature: function (feature, layer) {

			if (feature.properties.tags) {

				// Modal  / Tab Allgemein füllen
				var headerLine = (feature.properties.tags.amenity === "bank") ? "Bank" : "Geldautomat";
				var featureInfo = '';
				var openingTable = '';
				var osmInfo = '';

				var oh = {};
				var ohValid = false;

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
					featureInfo += '<p>Automatenverbund: ' + NETWORK[getAtmNetwork(feature)];
					osmInfo +=	((headerLine === 'Geldautomat') ?
						'<p><i>Automatenverbund (Attribut [' +
						'<a target="_new" href="http://wiki.openstreetmap.org/wiki/Key:network">network</a>' +
						']) nicht erfasst.</i></p>' : '');
				}

				// [opening_hours]
				if (feature.properties.tags.opening_hours) {

					try {
						oh = new opening_hours(feature.properties.tags.opening_hours, {}, { 'locale': 'de' });
						ohValid = (oh.getWarnings().length === 0);

					} catch (err) {
						srvLog('onEachFeature/opening_hours err: ' + feature.id + '/' + err)
					}

					var ohSimple = new SimpleOpeningHours(feature.properties.tags.opening_hours);
					var ohSimplTable = ohSimple.getTable();

					if (ohValid) {

						featureInfo += (oh.getState() ?
							'<p class="text-success font-weight-bold">Jetzt ge&ouml;ffnet.</p>' :
							'<p class="text-danger font-weight-bold">Jetzt geschlossen.</p>');

						// create simplified table of opening_hours
						// TODO i18n of WOCHENTAG_NAME
						openingTable = '<table class="table table-striped table-bordered table-responsive">';
						Object.keys(ohSimplTable).forEach(function (dayOfWeek) {
							if (ohSimplTable[dayOfWeek][0]) {
								openingTable += "<tr><th>" + WOCHENTAG_NAME[dayOfWeek] + "</th><td>";
								ohSimplTable[dayOfWeek].forEach(function (oh) {
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

					openingTable = '<p>Keine &Ouml;ffnungszeit erfasst.</p>';
					/*
					openingTable += '<button type="button" id="btnEditOpeningHours" ' +
						'class="btn bt-sm btn-outline-primary pull-right disabled">Jetzt erfassen</button>';
					*/
				}

				// Modal Tab OSM Info füllen
				var osmTagTable = buildOsmTagsTable(feature);

				/**
				 * mouse click handler
				 */
				layer.on({ click: function (e) {

					$('#feature-info a:first').tab('show');
					$("#feature-title").html(headerLine);
					$("#feature-info").html(featureInfo);
					$("#osm-tags").html(osmTagTable + osmInfo);
					$("#opening").html(openingTable);

					$("#featureModal").modal('show');
				}
				});

			}
		}
	});
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

	// reset form fields
	$('#newFeatureForm').trigger('reset');

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

	// remove validator markups
	$('#newFeatureForm').find('.has-danger').removeClass('has-danger');
	$('#newFeatureForm').find('.form-control-danger').removeClass('form-control-danger');

}


/**
 *
 * editFeature - not implemented
 *
 * @param e - event object
 */
function editFeature (e) {

	$("#warningAlert").html('Funktion noch nicht verf&uuml;gbar.' +
		CLOSE_BUTTON).removeClass('invisible');

}

/**
 *
 * deleteFeature - delete the marked feature from OSM database (only amenity=atm)
 *
 * @param e - event object
 */
function deleteFeature (e) {

	if (e.relatedTarget.feature.properties.tags.amenity === 'atm') {
		// set header
		$('#deleteFeatureTitle').html('Geldautomat l&ouml;schen');

		// set osm tags for modal window
		$('#delFeatureOsmTags').html(buildOsmTagsTable(e.relatedTarget.feature));

		// store feature object
		$('#delFeatureObj').val(e.relatedTarget.feature);

		$("#deleteFeatureModal").modal('show');
	} else {
		$("#dangerAlert").html('Es k&ouml;nnen nur als Geldautomat getaggte Objekte gel&ouml;scht werden.' +
			CLOSE_BUTTON).removeClass('invisible');
	}

}

/**
 *
 * routeToFeature - not implemented
 *
 * @param e - Event object
 */
function routeToFeature (e) {

	$("#warningAlert").html('Funktion noch nicht verf&uuml;gbar.' +
		CLOSE_BUTTON).removeClass('invisible');

}

/**
 *
 *
 * editNewMarker - show form to create new featuer
 */
function editNewMarker (e) {

	initNewFeatureForm ();

	if (!cashMapAuth.authenticated()) {

		$("#osmAuthInfoModal").modal('show');

	} else {

		getOsmUser();

		// reverse geocode address and fill address fields
		cashMapGeoCoder.reverse( newMarkerLatLon, cashMap.options.crs.scale(cashMap.getZoom()),

			function(results) {
				// set coords in hidden form fields
				$("#latitudeHidden").val(newMarkerLatLon.lat.toFixed(6));
				$("#longitudeHidden").val(newMarkerLatLon.lng.toFixed(6));

				results[0].properties.forEach(function (value) {
					if (value.types[0]) {
						if (value.types[0] === 'route') {
							$("#streetInput").val(value.long_name);
						} else if (value.types[0] === 'street_number') {
							$("#numberInput").val(value.long_name);
						} else if (value.types[0] === 'postal_code') {
							$("#postcodeInput").val(value.long_name);
						} else if (value.types[0] === 'locality') {
							$("#cityInput").val(value.long_name);
						} else if (value.types[0] === 'country') {
							$("#countryInput").val(value.short_name);
							$("#countryLong").val(value.long_name)
						}
					}
				});

			}
		);
		if (cashMap.hasLayer(newMarker)) { cashMap.removeLayer(newMarker);}

		$("#newFeatureModal").modal('show');
	}
}

/**
 * deleteNewMarker - delete the newly created marker
 */
function deleteNewMarker (e) {

	if (cashMap.hasLayer(newMarker)) { cashMap.removeLayer(newMarker);}

}

/**
 * removeAtmLayers - delete all overlay(marker) layers
 *
 */
function removeAtmLayers () {

	cashMap.eachLayer (function (layer) { if (layer.feature) { cashMap.removeLayer (layer); } });

}

/**
 *
 * buildOsmTagsTable - ceate a bootdstrap 4 table (striped) from all osm tags of <feature>
 *     attribute names are links to osm wiki
 *
 * @param feature
 *
 * @returns {string} - html string of the table
 */
function buildOsmTagsTable (feature) {

	// Modal Tab OSM Info füllen
	var osmTagTable = '<table class="table table-striped table-bordered">';
	osmTagTable += 	'<tr><th><strong>Attribut</strong></th><td><strong>Wert</strong></td></tr>';

	Object.keys(feature.properties.tags).forEach(function (tag) {

		// TODO Wiki link by language
		osmTagTable += '<tr><th>' +
			'<a  target="_new" href="http://wiki.openstreetmap.org/wiki/Key:' + tag + '">' +
			tag + '</a></th><td>' + feature.properties.tags[tag] +	'</td></tr>';

	});
	osmTagTable += "</table><br />";
	return (osmTagTable);
}



/**
 *
 * checkAtmNetwork - check if feature belongs to atm pool <name>
 *
 * @param {string} name - name of atm pool ("sparkasse"|"vrbanken"|"cashgroup"|"cashpool"|"sonstige")
 * @param {L.feature} feature - map feature
 *
 * @returns {boolean}
 */
function checkAtmNetwork (name, feature) {

	return (name === getAtmNetwork(feature));

}

/**
 *
 * getAtmNetwork - returns atm pool the feature is belonging to
 *
 * @param {L.feature} feature - feature to be checked
 * @returns {string} - atm pool (must fit menu ids)
 *    "sparkasse"|"vrbanken"|"cashgroup"|"cashpool"|"sonstige"
 */
function getAtmNetwork (feature) {

	var network = feature.properties.tags.network;
	var operator = feature.properties.tags.operator;
	var name = feature.properties.tags.name;

	// 1st check: [network]
	if (network) {

		if (network.search(/sparkasse/i) > -1) { return "sparkassen";}
		if (network.search(/BankCard|Genossenschaft/i) > -1) { return "vrbanken";}
		if (network.search(/cashpool/i) > -1) { return "cashpool";}
		if (network.search(/cash group|cashgroup/i) > -1) { return "cashgroup";}
		return "sonstige";

	} else {
		// 2nd check: [operator]
		if (operator) {
			if (operator.search(/sparkasse|landesbank berlin|bw bank|lbbw/i) > -1) {
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
				if (name.search(/sparkasse|landesbank berlin|bw bank|lbbw/i) > -1) {
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
}

/**
 *
 * newFeatureOnMap - create new feature on map
 *
 * 		check if authenticated to OSM
 * 		reverse geocode address of click position (google)
 * 		set compact address info from result set
 * 		set address form fields from result set
 * 		show edit form
 */
function newFeatureOnMap (e) {

	initNewFeatureForm ();

	if (!cashMapAuth.authenticated()) {

		$("#osmAuthInfoModal").modal('show');

	} else {

		// reverse geocode address and fill in address fields
		cashMapGeoCoder.reverse( e.latlng, cashMap.options.crs.scale(cashMap.getZoom()),
			function(results) {

				// set coords in hidden form fields
				$("#latitudeHidden").val(e.latlng.lat.toFixed(6));
				$("#longitudeHidden").val(e.latlng.lng.toFixed(6));

				// set address fields
				results[0].properties.forEach(function (value) {
					if (value.types[0]) {
						if (value.types[0] === 'route') {
							$("#streetInput").val(value.long_name);
						} else if (value.types[0] === 'street_number') {
							$("#numberInput").val(value.long_name);
						} else if (value.types[0] === 'postal_code') {
							$("#postcodeInput").val(value.long_name);
						} else if (value.types[0] === 'locality') {
							$("#cityInput").val(value.long_name);
						} else if (value.types[0] === 'country') {
							$("#countryInput").val(value.short_name);
							$("#countryLong").val(value.long_name)
						}
					}
				});

			}
		);

		$("#newFeatureModal").modal('show');
	}
};

/**
 *
 * showAddress - show address on mouse position
 *
 * 		reverse geocode address of click position (google)
 * 	 	create marker if not exist
 * 	 	bind and show popup with nearest address
 * 	 	remove marker on popup close
 */
function showAddress (e) {

	cashMapGeoCoder.reverse( e.latlng, cashMap.options.crs.scale(cashMap.getZoom()),
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
				addressMarker.openPopup().on('popupclose', function () {
					cashMap.removeLayer (addressMarker);
				});
			}
		}
	);
}


/**
 *
 *  newChangeset - create OSM changeset
 *
 * @param comment
 * @param feature
 * @param callbackEditNode - function to be called to upload node
 */
function newChangeset (comment, feature, callbackEditNode) {

	var newChangeset =
		"<osm>" +
		"<changeset>" +
		"<tag k='created_by' v='finde.cash " + VERSION[0].number + "'/>" +
		"<tag k='comment' v='" + comment + "'/>" +
		"</changeset>" +
		"</osm>";

	srvLog (newChangeset);

	cashMapAuth.xhr({
		method: "PUT",
		path: "/api/0.6/changeset/create",
		options: {
			header: {
				"Content-Type": "text/xml"
			}
		},
		content: newChangeset
	}, function(err, changeset_id) {
		if (err) {
			console.log(err);

			$("#dangerAlert").html('Fehler beim Hochladen zum OSM-Server, bitte wiederholen.' +
				CLOSE_BUTTON).removeClass('invisible');
			return (null)

		} else {
			srvLog ('new changeset: ' + changeset_id);
			callbackEditNode(changeset_id, feature);
		}
	});

}

/**
 *
 * uploadNode:
 *
 * @param changeset_id - Id of changeset

 */
function uploadNode (changeset_id) {
	var node = '';
	var specOperator = false;

	if (changeset_id) {
		// create tags from form fields
		$.each($("#newFeatureForm").serializeArray(), function (index, tag) {

			if (tag.name === 'osmId') {

				// header <osmChange>
				node = "<osmChange>";
				node += "<create>";
				node += "<node id='-1' ";
				node += "lon='" + $("#longitudeHidden").val() + "' lat='" + $("#latitudeHidden ").val() + "' ";
				node += "version='0' changeset='" + changeset_id + "'>";
				node += "<tag k='amenity' v='atm'/>";

			} else {
				if (tag.name !== 'comment' &&       // comment stored only in header
					tag.value !== 'Unbekannt' &&    // unbekannt
					tag.name !== 'ohType' &&        // typ opening_hours (internal field)
					tag.name !== 'latitude' &&      // latitude in header
					tag.name !== 'longitude' &&     // longitude in header
					tag.name.substr(0,1) !== "x" && // internal fields for opening hours calc starting with "x"
					tag.value.length > 0) {
					// check institut field on Sparkassen, VR-Banken
					if (tag.name === 'operator' && tag.value === 'Sparkassen ...') {
						node += "<tag k='operator' v='Sparkasse'/>";
					} else if (tag.name === 'operator' && tag.value === 'Volksbanken ...') {
						node += "<tag k='operator' v='Volksbank'/>";
					} else if (tag.name === 'operator' && tag.value === 'Andere ...') {
						specOperator = true;
					} else if (tag.name === 'operator' && tag.value === 'Andere ...') {
						if (specOperator) {
							node += "<tag k='operator' v='" + tag.name + "'/>";
						}
					} else if (tag.name === 'network') {
						if (tag.value !== 'Keiner') {
							node += "<tag k='" + tag.name + "' v='" + tag.value + "'/>";
						}
					} else {
						node += "<tag k='" + tag.name + "' v='" + tag.value + "'/>";
					}
				}
			}
		});

		// footer
		node += "</node></create><delete if-unused='true'/>";
		node += "</osmChange>";

		srvLog(node);

		cashMapAuth.xhr({
			method: "POST",
			path: "/api/0.6/changeset/" + changeset_id + "/upload",
			options: {
				header: {
					"Content-Type": "text/xml"
				}
			},
			content: node
		}, function (err, result) {
			if (err) {
				console.log(err);
				$("#dangerAlert").html('Fehler beim Hochladen zum OSM-Server, bitte wiederholen.' +
					CLOSE_BUTTON).removeClass('invisible');
				;

			} else {

				// TODO convert XML
				srvLog('new node: ' + result.getElementsByTagName("node")[0].getAttribute("new_id"));

				cashMapAuth.xhr({
					method: "PUT",
					path: "/api/0.6/changeset/" + changeset_id + "/close"
				}, function (err) {
					if (err) {
						console.log(err);
						$("#dangerAlert").html('Fehler beim Hochladen zum OSM-Server, bitte wiederholen.' +
							CLOSE_BUTTON).removeClass('invisible');
						;

					} else {

						// load data with API request
						loadOsmData(true);

					}
				});
			}
		});

	}
}


/**
 *
 * deleteNode:  delete node with ID
 *
 * @param changeset_id - Id of changeset

 */
function deleteNode (changeset_id, feature) {
	node = '';
	console.log ('deleteNode: ' + changeset_id + '/' + feature.properties.id)

	if (changeset_id) {

		node = '<osmChange>';
		node += '<delete>';
		node += '<node id="' + feature.properties.id + '"';
		node += ' lon="' + feature.geometry.coordinates[0] + '" lat="' + feature.geometry.coordinates[1] + '"';
		node += ' version="' + feature.properties.meta.version + '" changeset="' + changeset_id + '">';
		node += '<tag k="amenity" v="atm"/>';
		node += '</node></delete>';
		node += '</osmChange>';

		srvLog(node);

		cashMapAuth.xhr({
			method: 'POST',
			path: '/api/0.6/changeset/' + changeset_id + '/upload',
			options: {
				header: {
					'Content-Type': 'text/xml'
				}
			},
			content: node
		}, function (err, result) {
			if (err) {
				console.log(err);
				srvLog(err);
				$("#dangerAlert").html('Fehler beim L&ouml;schvorgang, bitte wiederholen.' +
					CLOSE_BUTTON).removeClass('invisible');

			} else {

				cashMapAuth.xhr({
					method: "PUT",
					path: "/api/0.6/changeset/" + changeset_id + "/close"
				}, function (err) {
					if (err) {
						console.log(err);
						srvLog(err);
						$("#dangerAlert").html('Fehler beim L&ouml;schvorgang, bitte wiederholen.' +
							CLOSE_BUTTON).removeClass('invisible');

					} else {
						// reload data with API request
						loadOsmData(true);
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

