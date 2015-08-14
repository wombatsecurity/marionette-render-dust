/**
 * This requires that the user passes in their instance of Marionette and dust, so there are no true dependencies for the package
 * @param Marionette
 * @param dust
 */
module.exports = function(Marionette, dust) {
	//override Marionette's render function
	Marionette.Renderer.render = function (template, data) {
		//if no template is passed in, throw an error
		if ( !template ) {
			throw new Marionette.Error({
				name: 'TemplateNotFoundError',
				message: 'Cannot render the template since its false, null or undefined.'
			});
		}

		//hold a blank html variable to return
		var html = "";

		//hold a callback function for both options below to utilize
		var callback = function( err, out ) {
			if ( err ) {
				if ( console && console.error ) {
					console.error('Dust render error: ' + err);
				}
			} else {
				html = out;
			}
		};

		//if the template is a function, call the function with the passed in data
		if( typeof template === 'function' ) {
			template( data, callback );
		}

		//if the function is a string, let the dust.render function handle it
		else {
			dust.render( template, data, callback );
		}

		//return the html
		return html;
	};
};