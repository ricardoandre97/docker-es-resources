/** 
 * @projectDescription JsFlickrGallery - Simple JavaScript Flickr gallery, 
 * http://petejank.github.io/js-flickr-gallery/
 * 
 * @version 1.24
 * @author   Peter Jankowski http://likeadev.com
 * @license  MIT license.
 */ 
;(function ( $, window, document, undefined ) {
    'use strict';

    // "Constants"
    var FORMAT = 'json',
        SEARCH_API_METHOD = 'flickr.photos.search',
        SETS_API_METHOD = 'flickr.photosets.getPhotos',
        API_KEY = '62525ee8c8d131d708d33d61f29434b6',
        // Tag attributes
        DATA_TAGS_ATTR = 'data-tags',
        DATA_USER_ID_ATTR = 'data-user-id',
        DATA_SET_ID_ATTR = 'data-set-id',
        DATA_PER_PAGE_ATTR = 'data-per-page',
        DATA_GALLERY_ID_ATTR = 'data-gallery-id',
        DATA_TOGGLE_ATTR = 'jsfg',
        // Minor stuff
        RESPONSIVE_WIDTH = 767,
        FLICKR_REQUEST_TIMEOUT = 10000,
        // Generated modal window stuff
        GEN_HEADER_CONTAINER_CLASS = 'modal-header',
        GEN_TITLE_TAG = 'h3',
        GEN_BODY_CONTAINER_CLASS = 'modal-body',
        GEN_IMAGE_CONTAINER_CLASS = 'modal-image',
        GEN_FOOTER_CONTAINER_CLASS = 'modal-footer'
      ;
    
    // Plugin name declaration
    var pluginName = 'jsFlickrGallery', 
        defaults = {
            'fetchImages' : true,
            'animation' : 'fade',
            'animationSpeed' : 250,
            'preload' : { // false to disable
                'range' : 2
            }, 
            'structure' : { 
                'ulClass' : '.thumbnails',
                'liClass' : '.span1',
                'aClass' : '.thumbnail'
            },
            'modal' : { // false to disable
                'generate' : true,
                'id' : 'jsfg-modal',
                'title' : '.' + GEN_HEADER_CONTAINER_CLASS + ' ' + GEN_TITLE_TAG,
                'imageContainerClass' : '.' + GEN_IMAGE_CONTAINER_CLASS,
                'onContainerNext' : true,
                'imageFadeTime' : 250,
                'prevClass' : '.btn.modal-prev',
                'nextClass' : '.btn.modal-next',
                'prevText' : 'Previous image',
                'nextText' : 'Next image',
                'offsetWidth' : 100,
                'offsetHeight' : 200
            },
            'pagination' : { // false to disable
                'generate' : true,
                'containerClass' : '.pagination',
                'prevClass' : '.btn.pagination-prev',
                'nextClass' : '.btn.pagination-next',
                'prevText' : 'Previous page',
                'nextText' : 'Next page'
            },
            'loader' : { // false to disable
                'animation' : true,
                'loaderClass' : '.jsfg-loader',
                'text' : 'Loading',
                'interval' : 200,
                'mark' : '.',
                'markClass': '.animation-marks',
                'maxMarks' : 3
            },
            'url' : {
                'per_page' : 30,
                'tag_mode' : 'all'
            },
            'error' : {
                'text' : 'No photos found',
                'tagClass' : 'error'
            },
            'imageSizes' : {
                'small' : 's', // small (up to 75 x 75)
                'medium_100' : 't', // medium (up to 100 x 75)
                'medium' : 'q', // medium (up to 150 x 150)
                'medium_640' : 'z', // medium (up to 620 x 640)
                'large' : 'b', // large (up to 1024 in any of two dimensions)
                'original' : 'o' // original image size
            },
            'apiUrl' : 'https://api.flickr.com/services/rest/?jsoncallback=?',
            'setDefaultSize' : function() {
                this.thumbnailSize = this.imageSizes.medium;
                this.imageSize = this.imageSizes.large;   
            }
        };
    
    /**
     * Plugin constructor
     *
     * @param Object element
     * @param Object options
     * @return Plugin
     * @constructor
     */
    function Plugin( element, options ) {
        this.element = element;
        // Select this DOM element with jQuery - for future use
        this.$element = $( element );
        // Merge passed options with defaults
        this.options = $.extend( true, {}, defaults, options );
        
        // Set contexts for pagination and modal
        this.paginationContext = this.options.pagination && this.options.pagination.generate ? this.element : document;

        if ( !this.options.thumbnailSize && !this.options.imageSize ) { 
            this.options.setDefaultSize();
        }
        
        // Assign gallery instance id
        this.galleryId = this.element.id || Math.random().toString( 36 );
        // Starting page value
        this.page = 1;
        
        this.init();
    }
    
    // Define Plugin init method
    Plugin.prototype = {
        
        /**
         * Creates gallery structure for the node
         * 
         * @return void
         * @method
         * @memberOf Plugin
         */
        init : function() {
            if ( this.options.fetchImages ) {
                // Add gallery loader if available
                if ( this.options.loader ) {
                    this.loaderInterval = this._createLoader(this.element);
                }
                
                this.createGallery(); // async, rest of the init code will be shot before this
            } else {
                // Assign anchors selector to local instance
                this.anchors = this._getAnchors();
            }
            
            if ( this.options.pagination && this.options.fetchImages ) {
                if ( this.options.pagination.generate ) {
                    this._createPagination();
                }
                
                this._bindPaginationEvents();
            }
            
            if ( this.options.modal ) {
                if ( this.options.modal.generate ) {
                    this._createModal();
                }
                
                this._bindModalEvents();
            }
            
        },
                
        /**
         * Get JSON image data using JSONP from flickr and create an gallery instance.
         * Does NOT clear the container content but appends to it
         * 
         * @param Integer page Starting pagination page
         * @return Plugin
         * @method
         * @memberOf Plugin
         */
        createGallery : function( page ) {
            // Assign constants to url options
            this.options.url.format = FORMAT;
            this.options.url.api_key = API_KEY;
            
            this.options.url.photoset_id = this.$element.attr( DATA_SET_ID_ATTR ) || this.options.url.photoset_id;
            if ( this.options.url.photoset_id ) {
              // Fetch data for certain photo set
              this.options.url.method = SETS_API_METHOD;
              delete this.options.url.tag_mode;
            } else {
              // Fetch photos by tags/user_id criteria
              this.options.url.method = SEARCH_API_METHOD;  
              delete this.options.url.photoset_id;
                          
              // Tags are mandatory when fetching photos from Flickr
              this.options.url.tags = this.$element.attr( DATA_TAGS_ATTR ) || this.options.url.tags;
              // Check if only certain user's photos should be fetched
              this.options.url.user_id = this.$element.attr( DATA_USER_ID_ATTR ) || this.options.url.user_id;
              if ( !this.options.url.user_id ) {
                  delete this.options.url.user_id;
              }
            }

            // Set displayed page
            this.options.url.page = this.page = page || this.page;
            
            // How many photos should be fetched?
            this.options.url.per_page = this.$element.attr( DATA_PER_PAGE_ATTR ) || this.options.url.per_page;

            // Get images using ajax and display them on success
            this._getPhotos();

            return this;
        },
                
        /**
         * Hide gallery items and remove them
         * 
         * @param Integer page
         * @return Plugin
         * @method
         * @memberOf Plugin
         */
        clearGallery : function( page ) {
            var $galleryEl = $( this.options.structure.ulClass, this.element ),
                self = this
              ;
         
            switch( this.options.animation ) 
            {
                case 'fade':
                    $galleryEl.fadeOut( this.options.animationSpeed, _replaceWithLoader );
                    break;
                case 'show':
                    $galleryEl.hide( this.options.animationSpeed, _replaceWithLoader );
                    break;
                case false:
                    $galleryEl.hide( 0 , _replaceWithLoader );
            }
            
            /**
             * Replace gallery content with loader
             *
             * @return void
             * @internal
             * @memberOf Plugin
             */
            function _replaceWithLoader() {
                if ( self.options.loader ) {
                    self.loaderInterval = self._createLoader( self.element );
                }
                
                // Init creation of new gallery if page is present
                if ( page ) {
                  self.createGallery(page);
                }
                
                $galleryEl.remove();
            }
            
            return this;
        },
                
        /**
         * Check if current page is the last page of the gallery
         *
         * @return boolean
         * @method
         * @memberOf Plugin
         */
        isLastPage : function() {
            return ( !this.anchors || this.anchors.length < this.options.url.per_page ) ? true : false;
        },
                
        /**
         * Display next page of the gallery
         * 
         * @return Plugin | boolean False when current page is last one
         * @method
         * @memberOf Plugin
         */
        nextPage : function() {
            if ( !this.isLastPage() ) {
                return this.clearGallery( this.page + 1 );
            } else {
                return false;
            }
        },
                
        /**
         * Display previous page of the gallery
         * 
         * @return Plugin | boolean False when page < 1
         * @method
         * @memberOf Plugin
         */
        prevPage : function() {
           if ( this.page > 1 ) {
               return this.clearGallery( this.page - 1 );
           } else {
               return false;
           }
        },
                
        /**
         * Display previous gallery image in modal window
         * 
         * @return Plugin
         * @method
         * @memberOf Plugin
         */
        prevImage : function() {
            this.index -= 1;
            if (this.index < 0) {
                this.index = this.anchors.length - 1;
            }
            
            return this._loadImage( false );
        },
                
        /**
         * Diplay next gallery image in modal window
         * 
         * @return Plugin
         * @method
         * @memberOf Plugin
         */
        nextImage : function() {
            this.index += 1;
            if ( this.index > this.anchors.length - 1 ) {
                this.index = 0;
            }

            return this._loadImage( false );
        },
        
        /**
         * Fetch photos from Flickr
         * 
         * @return Plugin
         * @private
         * @memberOf Plugin
         */
        _getPhotos : function( ) {
            var self = this;
            $.ajax({
                type: 'GET',
                url: self.options.apiUrl,
                data: self.options.url,
                dataType: 'jsonp',
                timeout: FLICKR_REQUEST_TIMEOUT
            }).done(function( data ) {
                // Once data is returned, create gallery instance
                self._renderGalleryContent( data.photos || data.photoset );
            }).always(function( data, textStatus ) {
                // Try again
                if (textStatus === 'timeout') {
                    self._getPhotos();    
                }
            });
        },
        
        /**
         * Create and render gallery instance. Not for public consumption
         * 
         * @param Object photos
         * @return Plugin
         * @private
         * @method
         * @memberOf Plugin
         */
        _renderGalleryContent : function( photos ) {
            var self = this, 
                $images, 
                $ul, 
                listItems = '', 
                loadedImg = 0, 
                link, 
                title,
                error,
                liClassNoDots = this._replaceDots( self.options.structure.liClass ),
                aClassNoDots = this._replaceDots( self.options.structure.aClass )                                                   
              ;
                
            // Check if there's more than one gallery item returned
            if ( photos.photo.length > 0 ) {
                // Gallery is hidden by default for image loading purposes
                $ul = $( '<ul ' + 'class="' + this._replaceDots( self.options.structure.ulClass ) + 
                                    '" style="display: none">' );

                for ( var i = 0; i < photos.photo.length; i++ ) {
                    link = 'https://farm' + photos.photo[ i ].farm + 
                            '.static.flickr.com/' + photos.photo[ i ].server + '/' + photos.photo[ i ].id + '_' + 
                            photos.photo[i].secret + '_';
                    title = this._htmlEscape( photos.photo[ i ].title );
                    listItems += 
                        '<li ' + 'class="' + liClassNoDots + '">' + 
                            '<a rel="colorbox" href="' + link + self.options.imageSize + '.jpg" title="' + title + 
                                '" class="' + aClassNoDots + ' colorbox cboxElement" target="_blank">' + '<img alt="' + title + '" src="' + link + self.options.thumbnailSize + '.jpg"/>' + '</a>' + '</li>';
                }
                // Append thumbnails
                self.element.insertBefore( $ul.append( listItems )[0], self.element.firstChild);
                
                $images = $ul.find( 'img' );
                // Error handling
                $images.on( 'error', function() {
                    var $this = $( this ), 
                        src = $this.attr( 'src' );
                        
                    $this.attr( 'src', null ).attr( 'src', src );
                });
                // Attach load listener for thumbnails
                $images.on('load', function() {
                    loadedImg++;
                    if ( loadedImg === photos.photo.length ) {
                        // All images loaded, remove loader and display gallery content
                        self._removeLoader( self.element );
                        // Check for entry animation switch
                        switch( self.options.animation ) 
                        {
                            case 'fade':
                                $ul.fadeIn( self.options.animationSpeed );
                                break;
                            case 'show':
                                $ul.show( self.options.animationSpeed );
                                break;
                            case false:
                                $ul.show();
                        }
                        // Remove event listener
                        $images.off( 'load' ).off( 'error' );
                        // Assign anchors selector to local instance
                        self.anchors = self._getAnchors();
                        // Toggle pagination
                        self._togglePagination();
                    }
                });
            } else {
                error = document.createElement('span');
                error.className = self.options.error.tagClass;
                error.innerHTML = self.options.error.text;
                
                // Display error message..
                self.element.insertBefore( error, self.element.firstChild );
                // ..and remove loader
                self._removeLoader( self.element )._togglePagination();
            }
            
            return self;
        },
                
        /**
         * Generate pagination buttons (when pagination -> generated is true). 
         * Not for public consumption
         *
         * @return Plugin
         * @private
         * @method
         * @memberOf Plugin
         */
        _createPagination : function() {
            var pagination = '', 
                prev = $( this.options.pagination.prevClass, this.paginationContext )[0],
                next = $( this.options.pagination.nextClass, this.paginationContext )[0]
              ;
                                                                                         
            if ( !prev && !next && this.options.pagination.generate ) {
                pagination += '<div class="' + this._replaceDots( this.options.pagination.containerClass ) + '">' +
                                '<button ' + 'class="' +
                                    this._replaceDots( this.options.pagination.prevClass ) + '" ' +
                                    'title="' + this.options.pagination.prevText + '" ' + 
                                    'disabled="disabled"><img src="images/arrow_left.svg"></button>' +
                                '<button ' + 'class="' +
                                    this._replaceDots( this.options.pagination.nextClass ) + '" ' + 
                                    'title="' + this.options.pagination.nextText + '" ' + 
                                    'disabled="disabled"><img src="images/arrow_right.svg"></button>' + 
                              '</div>';
                this.element.appendChild( $( pagination )[0] );
            }            
            
            return this;
        },
                
        /**
         * Bind modal pagination control events. Not for public consumption
         * 
         * @return Plugin
         * @private
         * @memberOf Plugin
         */
        _bindPaginationEvents : function() {
            var self = this, 
                $prev = $( this.options.pagination.prevClass, this.paginationContext ), 
                $next = $( this.options.pagination.nextClass, this.paginationContext )
              ;
              
            // Previous page action
            $prev.click(function() {
                if ( !$prev.is( ':disabled' ) ) {
                    $next.attr( 'disabled', 'disabled' );
                    $prev.attr( 'disabled', 'disabled' );
                    self.prevPage();
                }
            });

            // Next page action
            $next.click(function() {
                if ( !$next.is( ':disabled' ) ) {
                    $prev.attr( 'disabled' , 'disabled' );
                    $next.attr( 'disabled', 'disabled' );
                    self.nextPage();
                }
            });
        },
                
        /**
         * Toggles pagination buttons based on current page number. Not for public consumption
         *
         * @return Plugin
         * @private
         * @method
         * @memberOf Plugin
         */
        _togglePagination : function() {
            var $prev = $( this.options.pagination.prevClass, this.paginationContext ),
                $next = $( this.options.pagination.nextClass, this.paginationContext );
            
            if ( this.page !== 1 ) {
                $prev.removeAttr( 'disabled' );
            } else {
                $prev.attr( 'disabled', 'disabled' );
            }
            
            if ( !this.isLastPage() ) {
                $next.removeAttr( 'disabled' );
            } else {
                $next.attr( 'disabled', 'disabled' );
            }
            
            return this;
        },
                
        /**
         * Bind modal event listeners and generate modal markup if required. Not for public consumption
         *
         * @return Plugin
         * @private
         * @method
         * @memberOf Plugin
         */
        _createModal : function() {
            // Check if modal structure is already available
            var header, 
                body, 
                footer,
                modal
              ;
                                
            if ( !document.getElementById( this.options.modal.id ) ) {
                header = '<div class="' + GEN_HEADER_CONTAINER_CLASS + '">' +
                            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">' +
                            '&times;</button>' +
                            '<' + GEN_TITLE_TAG + '></' + GEN_TITLE_TAG + '>' +
                         '</div>';
                body = '<div class="' + GEN_BODY_CONTAINER_CLASS + '">' + 
                            '<div class="' + GEN_IMAGE_CONTAINER_CLASS + '"></div>' + 
                       '</div>';
                footer = '<div class="' + GEN_FOOTER_CONTAINER_CLASS + '">' +
                            '<button title="' + this.options.modal.prevText + 
                                '" class="' + this._replaceDots( this.options.modal.prevClass ) + 
                                '">&laquo;</button>' +
                            '<button title="' + this.options.modal.nextText + 
                                '" class="' + this._replaceDots( this.options.modal.nextClass ) + 
                                '">&raquo;</button>' +
                         '</div>';   

                // Append modal to body   
                modal = document.createElement( 'div' );
                modal.id = this.options.modal.id;
                modal.className = 'modal jsfg-modal hide fade';
                modal.innerHTML = header + body + footer;
              
                document.body.appendChild( modal );
            }
            
            return this;
        },
                
        /**
         * Bind modal events to thumbnails and modal paging buttons
         * 
         * @return Plugin
         * @private
         * @method
         * @memberOf Plugin
         */
        _bindModalEvents : function() {
            var self = this, 
                next = this.options.modal.onContainerNext ? this.options.modal.nextClass + ', ' + 
                       this.options.modal.imageContainerClass : this.options.modal.nextClass, 
                $modal = $( '#' + self.options.modal.id ), 
                context = '#' + this.options.modal.id
              ;
              
            // Bind on thumbnail click event
            // this.$element.on( 'click', this.options.structure.aClass, function( event ) {
            //     var i;
                
            //     event.preventDefault();
                
            //     // Assign gallery id to modal window
            //     $modal.attr( DATA_GALLERY_ID_ATTR, self.galleryId );     
            //     // Also assign index to plugin instance
                
            //     for ( i = 0; i < self.anchors.length; i++ ) {
            //         if (self.anchors[ i ] === this) {
            //             self.index = i;
            //         }
            //     }
                 
            //     self._loadImage( true );
            // });
            
            // Next image in modal
            $( next, context ).click(function( event ) {
                event.preventDefault();
                // Check if this click listener should be triggered
                if ( $modal.attr( DATA_GALLERY_ID_ATTR ) === self.galleryId ) {
                    self.nextImage();
                }
            });

            // Previous image in modal
            $( this.options.modal.prevClass, context ).click(function( event ) {
                event.preventDefault();
                // Check if this click listener should be triggered
                if ( $modal.attr( DATA_GALLERY_ID_ATTR ) === self.galleryId ) {
                    self.prevImage();
                }
            });       
            
            return this;
        },
                
        /**
         * Load image in modal based on current index value stored in Plugin instance. Not for public consumption
         * 
         * @param boolean showModal Should modal be displayed?
         * @return Plugin
         * @private
         * @method
         * @memberOf Plugin
         */
        _loadImage : function( showModal ) {
            var self = this, 
                $modal = $( '#' + this.options.modal.id ), 
                $modalTitle = $( this.options.modal.title, $modal ), 
                imageIndex = self.index, 
                $imageAnchor = $( this.anchors[ this.index ] ), 
                $image = $( '<img/>' ), 
                $imageContainer = $( this.options.modal.imageContainerClass, $modal ),
                $window = $( window )
              ;

            // Hide image container content
            $imageContainer.children().hide();
            
            // Set modal window title
            $modalTitle.text( $imageAnchor.attr( 'title' ) );
            // Show modal window if requested
            if ( showModal ) {
                $modal.modal( 'show' );
            }
            
            // Error handling
            $image.on( 'error', function() {
                $image.prop( 'src', null ).prop( 'src', $imageAnchor.attr( 'href' ) );
            });
            
            // Wait for image to load
            $image.on( 'load', function() {
                // Check if image is already loading
                if ( self.index === imageIndex ) {
                    // Clear all image container children BESIDE added image
                    $imageContainer.children().remove();
                    // Disable loader
                    self._removeLoader( $imageContainer[ 0 ] );
                    
                    // Resize image to fit box
                    $image = self._resizeToFit( $image, $window );
                    $modalTitle.width( $image.prop( 'width' ) );
            
                    // Resize image container to it's content
                    $imageContainer.height( $image.prop( 'height' ) ).width( $image.prop( 'width' ) );
                    
                    // Append image to image container
                    $image.appendTo( $imageContainer );
                    
                    // If not responsive - center on both axes
                    if ( $window.width() > RESPONSIVE_WIDTH ) {
                        $modal.css( 'top', '' );
                        ( $.support.transition ? $modal.animate : $modal.css ).call( $modal.stop(), {
                            'margin-left' : -$modal.outerWidth() / 2,
                            'margin-top' : -$modal.outerHeight() / 2
                        });
                    } else {
                        // ..center on y axis
                        $modal.css({
                            'top': ( $window.height() - $modal.outerHeight() ) / 2,
                            'margin-left' : '',
                            'margin-top' : ''
                        });
                    }
                    // Fade image in and center modal
                    $image.fadeIn( self.options.modal.imageFadeTime );
                    // Cache near images
                    if ( self.options.preload ) {
                        self._preloadImages();
                    }
                }
                
                $image.off( 'load' ).off( 'error' );
            });
            
            $image.prop( 'src', $imageAnchor.attr( 'href' ) ).attr( 'alt', $imageAnchor.attr( 'title' ) );
            if ( !$image[ 0 ].complete ) {
                // Display loader
                this.loaderInterval = this._createLoader( $imageContainer[ 0 ] );
            } 
            
            return this;
        },
                
        /**
         * Image preload mechanism. Not for public consumption
         * 
         * @return Plugin
         * @private
         * @method
         * @memberOf Plugin
         */
        _preloadImages : function() {
            // + 1 cause we need to skip current index
            var maxIndex = this.index + this.options.preload.range + 1, 
                minIndex = this.index - this.options.preload.range, 
                anchor, 
                i,
                tempI
              ;
              
            // Cap values
            maxIndex = maxIndex > this.anchors.length ? maxIndex - this.anchors.length : maxIndex;
            minIndex = minIndex > maxIndex ? minIndex - this.anchors.length : minIndex ;
            
            for ( i = minIndex; i < maxIndex; i++ ) {
                tempI = i < 0 ? this.anchors.length + i : i;
                
                anchor = this.anchors[ tempI ];
                if ( anchor && tempI !== this.index ) {
                    $( document.createElement( 'img' ) ).attr( 'src', anchor.href || $( anchor ).attr( 'href' ) );
                }
            }
            
            return this;
        },
                
        /**
         * Resize image to fit screen. Not for public consumption
         *
         * @param Object $image 
         * @param Object $element
         * @return Object
         * @private
         * @method
         * @memberOf Plugin
         */
        _resizeToFit : function( $image, $element ) {
            var scale = 1, 
                maxWidth, 
                maxHeight,
                imgWidth = $image.prop( 'width' ),
                imgHeight = $image.prop( 'height' )
              ;
              
            // Scale image to fit page
            maxWidth = $element.width() - this.options.modal.offsetWidth;
            maxHeight = $element.height() - this.options.modal.offsetHeight;
            if ( imgWidth > maxWidth || imgHeight > maxHeight ) {
                scale = Math.min( maxWidth / imgWidth, maxHeight / imgHeight );
            } 

            $image.prop( 'width', imgWidth * scale ).prop( 'height', imgHeight * scale );
            
            return $image;
        },
                
        /**
         * Display loading message and create animation interval for marks if required. Not for public 
         * consumption
         * 
         * @param Object $element
         * @return Object | boolean interval or true when animation disabled
         * @private
         * @method
         * @memberOf Plugin
         */
        _createLoader : function( element ) {
            var loaderMarks = document.createElement('span'),
                loaderContainer = document.createElement('p'),
                options = this.options
              ;
            
            loaderContainer.appendChild( document.createTextNode( options.loader.text ) );
            
            loaderContainer.className = this._replaceDots( options.loader.loaderClass );
            
            loaderMarks.className = this._replaceDots( options.loader.markClass );
            // Add loader node to gallery container
            element.insertBefore( loaderContainer.appendChild( loaderMarks ).parentNode, element.firstChild );

            if (options.loader.animation) {
                return setInterval(function() {
                    if ( loaderMarks.innerHTML.length <= options.loader.maxMarks ) {
                        loaderMarks.innerHTML += options.loader.mark;
                    } else {
                        loaderMarks.innerHTML = '';
                    }
                }, options.loader.interval );
            } else {
                return true;
            }
        },
                
        /**
         * Returns all links to images in gallery as an array
         * 
         * @return Array
         * @private
         * @method
         * @memberOf Plugin
         */
        _getAnchors : function() {
            return $( this.options.structure.aClass, this.element ).get();
        },        
        
        /**
         * Remove loader instance. Not for public consumption
         * 
         * @param Object $element
         * @return Plugin
         * @private
         * @method
         * @memberOf Plugin
         */
        _removeLoader : function( element ) {
            var loader = $( this.options.loader.loaderClass, element )[ 0 ];
            
            if ( this.loaderInterval && loader ) {
                element.removeChild( loader );
                clearInterval( this.loaderInterval );
            }
            
            return this;
        },
                
        /**
         * Escape special html characters. Not for public consumption
         * 
         * @return string str
         * @private
         * @method
         * @memberOf Plugin
         */
        _htmlEscape : function( str ) {
            return str
                    .replace( /&/g, '&amp;' )
                    .replace( /"/g, '&quot;' )
                    .replace( /'/g, '&#39;' )
                    .replace( /</g, '&lt;' )
                    .replace( />/g, '&gt;' );
        },
                
        /**
         * Replaces dots with whitespaces
         * 
         * @param string str
         * @private
         * @method
         * @return string
         */
        _replaceDots : function( str ) {
            return str.replace(/\./g, ' ');
        }
    };
    
    // Attach plugin to jQuery function pool
    $.fn[ pluginName ] = function ( options ) {
        return this.each( function () {
            if ( !$.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
            }
        });
    };

    // Automatically attach jsFlickrGallery 
    $(function () {
        $( '[data-toggle="' + DATA_TOGGLE_ATTR + '"]' ).jsFlickrGallery();
    });
    
})( jQuery, window, document );