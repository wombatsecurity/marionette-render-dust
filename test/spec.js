'use strict';

// for whatever reason, Backbone.$ wasn't getting set, so I set it manually
var $ = require( 'jquery' );
var Backbone = require( 'backbone' );
Backbone.$ = $;

var Marionette = require( 'backbone.marionette' );
var dust = require( 'dustjs-linkedin' );

var fs = require( 'fs' );
var path = require( 'path' );
var rimraf = require( 'rimraf' );

var chai = require( 'chai' );
var sinon = require( "sinon" );
var sinonChai = require( "sinon-chai" );

// set up test stuff
dust.config.whitespace = true;
chai.use( sinonChai );
var expect = chai.expect;

// load/require fixtures
const dustfile = fs.readFileSync( path.join( __dirname, './fixtures/test.dust' ), 'utf8' ),
	context = require( './fixtures/data.json' ),
	output = fs.readFileSync( path.join( __dirname, './fixtures/output.html' ), 'utf8' );

// compile & register template
const compiled = dust.compile( dustfile, 'test' ),
	template = dust.loadSource( compiled );

// Define a function that we will use to set up the Renderer
function setUpRendering( options ) {
	// delete the cached version of the index page
	delete require.cache[require.resolve( '../index' )];

	// require the main index file of the package
	var renderer;
	if ( options ) {
		renderer = require( "../index" )( Marionette, dust, options );
	} else {
		renderer = require( "../index" )( Marionette, dust );
	}

	// return the new render method
	return renderer;
}

// set up some fixtures used in the tests
var html = "<div>Some html</div>";
var renderFn = function ( data, callback ) {
	callback( null, html );
};

// define our specification
describe( 'marionette-dust-render', function () {
	var render, sandbox;
	var outputDir = path.resolve( __dirname, './output' );
	var outputFile = 'pack_to_test.js';
	var outputPath = path.join( outputDir, outputFile );


	// Remove test file before each test
	beforeEach( function ( done ) {
		sandbox = sinon.sandbox.create();

		rimraf( outputPath, function ( err ) {
			if ( err ) {
				return done( err );
			} else {
				return done();
			}
		} );
	} );

	afterEach( function () {
		sandbox.restore();
	} );

	// Remove output directory after all tests are done
	after( function ( done ) {
		rimraf( outputDir, function ( err ) {
			if ( err ) {
				return done( err );
			} else {
				return done();
			}
		} );
	} );

	describe( "Passing an incorrect template", function () {
		before( function () {
			render = setUpRendering();
		} );

		it( "like a null value should throw an error", function () {
			expect( function () {
				render( null, {} );
			} ).to.throw( Marionette.Error );
		} );

		it( "like an empty string should throw an error", function () {
			expect( function () {
				render( "", {} );
			} ).to.throw( Marionette.Error );
		} );

		it( "like an undefined value should throw an error", function () {
			expect( function () {
				render();
			} ).to.throw( Marionette.Error );
		} );
	} );

	describe( "Passing a correct template", function () {
		before( function () {
			render = setUpRendering();
		} );

		describe( "as a function", function () {
			it( "should not throw an error", function () {
				expect( function () {
					render( template, context );
				} ).to.not.throw();
			} );

			it( "should correctly render the template", function () {
				var ret = render( template, context );
				expect( ret ).to.equal( output );
			} );
		} );

		describe( "as a string", function () {
			it( "should not throw an error", function () {
				expect( function () {
					render( "test", context );
				} ).to.not.throw();
			} );

			it( "should correctly render the template", function () {
				var ret = render( 'test', context );
				expect( ret ).to.equal( output );
			} );

		} );
	} );


	describe( "Passing a post-processor function", function () {
		var options = {
			postProcessor: function ( html ) {
				return html + " and changes";
			}
		},
			spy;

		beforeEach( function () {
			spy = sandbox.spy( options, 'postProcessor' );
			render = setUpRendering( options );
		} );

		it( "should not throw an error", function () {
			expect( function () {
				render( template, context );
			} ).to.not.throw();
		} );

		it( "should call the function with the appropriate parameters", function () {
			var ret = render( template, context );
			expect( options.postProcessor ).to.have.been.calledWith( output, context );
		} );

		it(
			"should allow you to alter what gets returned from the render function",
			function () {
				var ret = render( template, context );
				expect( ret ).not.to.equal( output );
				expect( ret ).to.equal( output + " and changes" );
			} );
	} );

	describe( "Passing multiple post-processor functions", function () {
		beforeEach( function () {
			render = setUpRendering( {
				postProcessors: [function ( html ) {
					return html + " and changes";
				}, function ( html, data ) {
					return html + " " + data.person;
				}]
			} );
		} );

		it( "should not throw an error", function () {
			expect( function () {
				render( template, context );
			} ).to.not.throw();
		} );

		it( "should apply the post-processors in order", function () {
			var ret = render( template, context );
			expect( ret ).not.to.equal( output );
			expect( ret ).to.equal( output + " and changes you" );
		} );
	} );

	describe( "The renderer.addPostProcessor() method", function () {
		var first = function ( html, data ) {
			return html + " first";
		},
			second = function ( html, data ) {
				return html + " second";
			},
			foo = function ( html, data ) {
				return html + " " + data.person;
			};

		beforeEach( function () {
			render = setUpRendering();
		} );

		it( "should add post-processors in order", function () {
			render.addPostProcessor( first );
			expect( render( template, context ) ).to.equal( output + " first" );
			render.addPostProcessor( second );
			expect( render( template, context ) ).to.equal( output + " first second" );
		} );


		it(
			"should add a post-processor in the right position if index is provided",
			function () {
				render.addPostProcessor( first );
				render.addPostProcessor( foo );
				render.addPostProcessor( second, 1 );

				expect( render( template, context ) ).to.equal( output +
					" first second you" );
			} );
	} );

	describe( "the renderer.removePostProcessor() method", function () {
		var one = function ( html ) {
			return html + " and changes";
		},
			two = function ( html, data ) {
				return html + " " + data.person;
			}

		beforeEach( function () {
			render = setUpRendering( {
				postProcessors: [one, two]
			} );
		} );

		it( "removes the specified post-processor", function () {
			render.removePostProcessor( one );
			expect( render( template, context ) ).to.equal( output + " you" );
			render.removePostProcessor( two );
			expect( render( template, context ) ).to.equal( output );
		} );

	} );

} );
