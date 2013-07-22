var Alloy = require('alloy');

exports.definition = {
    config: {
        columns: {
            "id": "text",
            "owner": "text",
            "url": "text",
            "title": "text"
        },
        adapter: {
            type: "sql",
            collection_name: "gallery"
        }
    },
    extendModel: function(Model) {
        _.extend(Model.prototype, {
            // extended functions and properties go here
        });

        return Model;
    },
    extendCollection: function(Collection) {
        _.extend(Collection.prototype, {

            /**
             * Flickr request
             */
            url : function() {
                Ti.API.info(JSON.stringify(Alloy.CFG.flickr.endpoint + '?method=' + Alloy.CFG.flickr.method + '&photoset_id=' + Alloy.CFG.flickr.photoset_id + '&api_key=' + Alloy.CFG.flickr.apikey + '&format=json&nojsoncallback=1', undefined, 2));
                return Alloy.CFG.flickr.endpoint + '?method=' + Alloy.CFG.flickr.method + '&photoset_id=' + Alloy.CFG.flickr.photoset_id + '&api_key=' + Alloy.CFG.flickr.apikey + '&format=json&nojsoncallback=1';
            },

            /**
             * Load model from server and save to SQLite
             */
            syncFetch : function() {
                try {
                    var gallery = this;

                    // fetch from db
                    gallery.fetch();

                    // tmp: clear collection
                    gallery.reset();

                    //exit if gallery is not empty
                    if(!gallery.isEmpty()) return false;

                    var client = Ti.Network.createHTTPClient( {
                        onload : function() {
                            var results = JSON.parse(this.responseText);

                            var getUrl = function(obj) {
                                return 'http://farm' + obj.farm + '.staticflickr.com/' + obj.server + '/' + obj.id + '_' + obj.secret + '.jpg';
                            };

                            _.each(results.photoset.photo, function(photo) {
                                // Ti.API.warn(JSON.stringify(photo, undefined, 2));

                                var model = Alloy.createModel('gallery', {
                                    "id": Titanium.Platform.createUUID(),
                                    "url": getUrl(photo),
                                    "title": photo.title
                                });

                                // Ti.API.warn(JSON.stringify(model, undefined, 2));

                                // save model to db
                                model.save();

                                // insert to collection
                                gallery.add(model);
                            });

                            gallery.trigger('gallery:synced', gallery);
                        },
                        onerror: function(ex) {
                            Ti.API.warn(JSON.stringify(ex, undefined, 2));
                        },
                        timeout: Alloy.CFG.sync.timeout
                    });

                    client.open("GET", gallery.url());
                    client.send();

                } catch(ex) {
                    Ti.API.warn(JSON.stringify(ex, undefined, 2));
                }
            }
        });

        return Collection;
    }
};