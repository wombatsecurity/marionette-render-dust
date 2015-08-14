'use strict';

var Marionette = require('backbone.marionette');
var dust = require('dustjs-linkedin');

require("../index")(Marionette, dust);

var render = Marionette.Renderer.render;

var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');

var chai = require('chai');
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
chai.use(sinonChai);
var expect = chai.expect;
var sandbox;

describe('marionette-dust-render', function() {

	var outputDir = path.resolve(__dirname, './output');
	var outputFile = 'pack_to_test.js';
	var outputPath = path.join(outputDir, outputFile);


	// Remove test file before each test
	beforeEach( function( done ) {
		sandbox = sinon.sandbox.create();

		rimraf( outputPath, function( err ) {
			if (err) { return done( err ); }
			else { return done(); }
		} );
	} );

	afterEach(function(){
		sandbox.restore();
	});

	// Remove output directory after all tests are done
	after( function( done ) {
		rimraf( outputDir, function( err ) {
			if (err) { return done( err ); }
			else { return done(); }
		} );
	} );

	describe("Passing an incorrect template", function(){
		it("like a null value should throw an error", function(){
			expect(function(){
				render(null, {});
			}).to.throw(Marionette.Error);
		});

		it("like an empty string should throw an error", function(){
			expect(function(){
				render("", {});
			}).to.throw(Marionette.Error);
		});

		it("like an undefined value should throw an error", function(){
			expect(function(){
				render();
			}).to.throw(Marionette.Error);
		});
	});

	describe("Passing a correct template", function(){
		describe("as a function", function(){
			it("should not throw an error", function(){
				expect(function(){
					render(function(){}, {});
				}).to.not.throw();
			});

			it("should call the function to render the template", function(){
				var o = { f: function(){ } };
				sandbox.spy(o, "f");
				render(o.f, {});
				expect( o.f).to.have.been.called;
			});
		});

		describe("as a string", function(){
			it("should not throw an error", function(){
				expect(function(){
					render("<div></div>", {});
				}).to.not.throw();
			});

			it("should call dust's render function", function(){
				sandbox.spy(dust, "render");
				render("<div></div>", {});
				expect( dust.render ).to.have.been.called;
			});

		});
	});

});
