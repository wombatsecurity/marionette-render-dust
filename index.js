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
		let html = "";

		// call dust.render
		dust.render( template, data, function( err, out ) {
			if ( err ) {
				if ( console && console.error ) {
					console.error( 'Dust render error: ' + err );
				}
			} else {
				html = out;
			}
		} );

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
