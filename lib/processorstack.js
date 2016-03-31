// A class to hold a bunch of functions (processors) in a stack data structure
function ProcessorStack( initial_processors ) {
    // set up stack
    this.stack = [];

    // add initial processors to stack
    if ( initial_processors ) {
        if ( Array.isArray( initial_processors ) ) {
            for ( var i = 0; i < initial_processors.length; i++ ) {
                this.stack.push( initial_processors[ i ] );
            }
        } else {
            this.stack.push( initial_processors );
        }
    }
}

// Add a new processor to the stack
ProcessorStack.prototype.add = function( processor, index ) {
    if ( index === undefined ) {
        index = this.stack.length;
    }

    this.stack.splice( index, 0, processor );
};

// Remove a processor from the stack
ProcessorStack.prototype.remove = function( processor ) {
    var index = this.stack.indexOf( processor );
    if ( index > -1 ) {
        this.stack.splice( index, 1 );
    }
};

// Apply the stack of processors to an initial value (memo), passing the "extra"
// along to each processor unchanged.
ProcessorStack.prototype.process = function( memo, extra, index ) {
    if ( index === undefined ) {
        index = 0;
    }

    if ( index == this.stack.length ) {
        return memo;
    } else {
        return this.process( this.stack[ index ]( memo, extra ), extra,
            index +
            1 );
    }
};

module.exports = ProcessorStack;
