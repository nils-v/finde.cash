/*!
 * CashMap's Gruntfile
 * nils vierus, osm-maps
 * 14.7.2017
 */

module.exports = function (grunt) {
	'use strict';

	// Project configuration.
	grunt.initConfig({

		// read meta data from package.json
		pkg: grunt.file.readJSON('package.json'),

		// babel used
		babel: {
			dist: {
				options: {
					extends: '../../.babelrc',
					sourceMap: true,
					presets: ['babel-preset-es2015']
				},
				files: {
					'cashmap/dist/cashmap.js' : 'cashmap/src/cashmap.js'
				}
			}
		},

		// empty out cashmap distribution dir and public/js dir
		clean: ['cashmap/dist/*','public/js/*'],

		// CSS build configuration
		// copy to cashmap folder
		copy: {
			dev: {
				files: [
					{
						src: ['cashmap/src/cashmap.js'],
						dest: 'public/js/cashmap.js',
						filter: 'isFile'
					}
					]
			},
			cashmap: {
				files: [
					{
						src: ['cashmap/dist/cashmap.min.js'],
						dest: 'public/js/cashmap.min.js',
						filter: 'isFile'
					}
				]
			}
		},

		// spawn bootstrap 4 gruntfile
		grunt: {
			bootstrap: {
				gruntfile: 'bootstrap-4/Gruntfile.js',
				task: 'dist'
			}
		},

		// check HTML quality
		htmllint: {
			options: {
				ignore: [
					'Attribute “autocomplete” is only allowed when the input type is “color”, “date”, “datetime”, “datetime-local”, “email”, “hidden”, “month”, “number”, “password”, “range”, “search”, “tel”, “text”, “time”, “url”, or “week”.',
					'Attribute “autocomplete” not allowed on element “button” at this point.',
					'Consider avoiding viewport values that prevent users from resizing documents.',
					'Consider using the “h1” element as a top-level heading only (all “h1” elements are treated as top-level headings by many screen readers and other tools).',
					'Element “div” not allowed as child of element “progress” in this context. (Suppressing further errors from this subtree.)',
					'Element “img” is missing required attribute “src”.',
					'The “color” input type is not supported in all browsers. Please be sure to test, and consider using a polyfill.',
					'The “date” input type is not supported in all browsers. Please be sure to test, and consider using a polyfill.',
					'The “datetime” input type is not supported in all browsers. Please be sure to test, and consider using a polyfill.',
					'The “datetime-local” input type is not supported in all browsers. Please be sure to test, and consider using a polyfill.',
					'The “month” input type is not supported in all browsers. Please be sure to test, and consider using a polyfill.',
					'The “time” input type is not supported in all browsers. Please be sure to test, and consider using a polyfill.',
					'The “week” input type is not supported in all browsers. Please be sure to test, and consider using a polyfill.'
				]
			},
			src: ['public/*.html']
		},

		// call external modules
		exec: {
			'htmlhint': {
				command: 'npm run htmlhint'
			},
			'uglify': {
				command: 'npm run uglify'
			}
		}

	});


	// These plugins provide necessary tasks.
	// load all grunt tasks from package.json dependencies
	require('load-grunt-tasks')(grunt);

	// display the elapsed execution time
	require('time-grunt')(grunt);

	// HTML validation tasks
	grunt.registerTask('validate-html', ['htmllint', 'exec:htmlhint']);

	// Cashmap Javascript distribution task.
	grunt.registerTask('dist-js', ['babel:dist', 'exec:uglify']);

	// Full distribution task
	// clean destination dir, prepare css, prepare js, copy bootstrap files to public folder
	grunt.registerTask('dist', ['clean', 'validate-html', 'dist-js', 'grunt:bootstrap', 'copy:dev']);

	// Default task: full distribution
	grunt.registerTask('default', ['dist']);

};
