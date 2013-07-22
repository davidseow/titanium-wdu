var gallery = Alloy.createCollection('gallery');

function bootstrap() {
    gallery.syncFetch();
}

/**
 * RENDER FUNCTIONS
 */
function render() {
   renderSlides();

   // open window
   $.index.open();
}

function renderSlides() {
    for (var i = 0; i < Alloy.CFG.carousel.max_slides; i++) {
        renderSlide(gallery.at(i));
    }
}

function renderSlide(slide) {
    if(!slide) {
        return false;
    }

    var controller = Alloy.createController('slide'),
        view = controller.getViews();

    view.slideImage.image = slide.get('url');
    view.slideCaption.text = slide.get('title');

    $.carousel.addView(view.slide);
}


/**
 * EVENTS
 */
function bindEvents() {
    gallery.on("gallery:synced", function() {
        render();
    });
}


/**
 * ON LOAD
 */
bootstrap();
render();
bindEvents();