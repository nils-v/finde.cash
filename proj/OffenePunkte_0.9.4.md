## Offene Punkte Version 0.9.4

6.7.2017
### Funktional
1. Hilfetext
* Struktur festlegen (evtl. Tabs) - erledigt
* Infos zu Bankenverbünden/Automatengebühren 
* Infos zu OSM
* Infos zur Standortermittlung
* Link auf Handbuch
2. Text "Über"
* Haftungsausschluss?
* Tab mit Credits/Libs - erledigt
3. Gestaltung Marker-Details
* Marker mit typischen Verbund-Farben 
* neutraler Marker für Ausland und Andere
4. Auswertung Ways [amenity=bank] und Darstellung - erledigt
5. Neuanlage: Attribut [cash_in=yes|no] anbieten
6. OSM-API: Shell Tankstellen lesen als Teil der Cash Group
7. Suchfunktion für Namen/Operator
8. Anzeige location, moving location
9. Kontext Menu Karte: neuer Eintrag "Entfernungen von hier"
10. Beim Löschen eigenen Comment erfassen - erledigt
11. Info Modal nach Neuanlage, keine API 0.6 - erledigt
12. Einstellungen: Autoload Daten, Auto Locate, Routing ZuFuss/Fahrrad

### Coding
1. Javascript
* Modultechnik auswählen (ES2016)
* Fehlerbehandlung ergänzen
* Promises einführen
* Babel verwenden - erledigt

2. IDE
* Taskrunner Grunt konfigurieren - erledigt
* package.json - erledigt
* Github Repository erstellen
* JSMin einsetzen
* uglifyJS konfigurieren/einsetzen
* scss-lint einsetzen

3. UX/Bootstrap
* Typografie
    * Schrift condensed für < xs,  < sm
* Alerts
    * Breite anpassen an screen width (w-75 nach media query verschieben)
* Touch Handling
* ARIA labelling
    * .modal ergänzen: aria-labelledby="id of .modal-title" (id in .modal-title ergänzen!)
    * ARIA Test (Screenreader)

### Marketing
* Aufbau Blog osm-maps.eu
    * Blog Landing page 
* evtl. Verweis bei opening_hours oder overpass turbo
* SEO
    * Bücher suchen - erledigt
    * Tipps bei 1und1 lesen - erledigt
    * Seite optimieren - erledigt
    
### Dokumentation
1. UX:
* RWD (Bootstrap)
* Oberflächen-Design
* Farbschema (Minty)
* Menü + Navigation mobile+Desktop
* Buttons responsive

2. Javascript
* externe Module, CDN vs. lokal

3. Hosting
* 1und1:
    * SSL-Zertifikat
    * Umleitung auf https (.htaccess)
    * sftp Zugang
    * php-Konfiguration für logging
    
### Internationalization
1. Adressen in Landessprache reverse codieren

