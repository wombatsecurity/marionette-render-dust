var ProcessorStack = require( './lib/processorstack' );

/**
 * This requires that the user passes in their instance of Marionette and dust, so there are no true dependencies for the package
 */
module.exports = function( Marionette, dust, options ) {

	// Create a ProcessorStack
	var postProcessors = new ProcessorStack( options ? ( options.postProcessors ||
		options.postProcessor ) : null );

	// Override Marionette's render function
	var renderer = Marionette.Renderer.render = function renderer( template, data ) {
		// if no template is passed in, throw an error
		if ( !template ) {
			throw new Marionette.Error( {
				name: 'TemplateNotFoundError',
				message: 'Cannot render the template since it\'s false, null or undefined.'
			} );
		}

		// hold a blank html variable to return
		var html = "";

		// hold a callback function for both options below to utilize
		var callback = function( err, out ) {
			if ( err ) {
				if ( console && console.error ) {
					console.error( 'Dust render error: ' + err );
				}
			} else {
				html = out;
			}
		};

		// if the template is a function, call the function with the passed in data
		if ( typeof template === 'function' ) {
			template( data, callback );
		}

		// if the template is a string, let the dust.render function handle it
		else {
			dust.render( template, data, callback );
		}

		// post-process & return the html
		return postProcessors.process( html, data );
	};

	// Attach some methods to the renderer for dealing with the post-processors
	renderer.addPostProcessor = function( processor, index ) {
		postProcessors.add( processor, index );
	};
	renderer.removePostProcessor = function( processor ) {
		postProcessors.remove( processor );
	}

	// Return the render method
	return renderer;
};
