// This file contains controllers pertaining to:
// Anything that has to do with offers such as the CRUD of listings

// Importing dataAccess object to interface with the DB
const dataAccess = require('../../db/index');

const offerAPIController = {
    init(app){
        // Adding a listing
        app.post('/api/offer/:listing_id', function(req, res){
            new Promise((resolve) => {
                resolve(
                    dataAccess.listing.checkIfUserListing(req.params.listing_id, req.user.user_id)
                    .catch(
                        function(err){
                            console.log(err);
                            res.status(500).send({
                                'Error': 'MySQL_ERR',
                                'error_code': err.code
                            });
                            throw 'MySQL_ERR';
                        }
                    )
                );
            })
            .then(
                function(user_listing_own){
                    return new Promise((resolve, reject) =>{
                        if(user_listing_own){
                            // If the user owns the listing
                            const err = new Error('Its the user listing he is trying to offer on');
                            err.code = 'CANNOT_OFFER_OWN_LISTING';
                            reject(err);
                        }
                        else{
                            // If he is not the owner, let him add the offer
                            resolve(true);
                        }
                    })
                    .catch(
                        function(err){
                            console.log(err);
                            res.status(401).send({
                                'Error': 'You cannot add this offer',
                                'error_code': err.code
                            });
                            throw err.code;
                        }
                    );
                }
            )
            .then(
                function(){
                    // If he is able to add an offer, check if he has already made an offer
                    return dataAccess.offer.checkUserPlacedOffer(req.params.listing_id, req.user.user_id)
                    .catch(
                        function(err){
                            console.log(err);
                            res.status(500).send({
                                'Error': 'MySQL_ERR',
                                'error_code': err.code
                            });
                            throw 'MySQL_ERR';
                        }
                    );
                }
            )
            .then(
                function(user_offer_placed){
                    return new Promise((resolve, reject) => {
                        if(user_offer_placed){
                            // If the user has already placed an offer, send an error
                            const err = new Error('Already has an offer');
                            err.code = 'OFFER_PLACED_ALR';
                            reject(err);
                        }
                        else{
                            // If he has not placed an offer before, create the offer
                            resolve(true);
                        }
                    })
                    .catch(
                        function(err){
                            console.log(err);
                            res.status(401).send({
                                'Error': err,
                                'error_code': err.code
                            });
                            throw err.code;
                        }
                    );
                }
            )
            .then(
                function(){
                    return dataAccess.offer.addAnOffer(req.params.listing_id, req.user.user_id, req.body.offer_price)
                    .catch(
                        function(err){
                            console.log(err);
                            res.status(500).send({
                                'Error': 'MySQL_ERR',
                                'error_code': err.code
                            });
                            throw 'MySQL_ERR';
                        }
                    );
                }
            )
            .then(
                function(){
                    // If adding the offer was successful
                    res.status(200).send({
                        'Result': 'Offer was successfully added'
                    });
                }
            )
            .catch(
                function(err){
                    // Final catch for all errors
                    console.log('Final catch err: ' + err);
                }
            );
        });
        app.get('/api/offer/:listing_id', function(req, res){
            new Promise((resolve) => {
                resolve(
                    dataAccess.offer.getOffersForAListing(req.params.listing_id)
                    .catch(
                        function(err){
                            console.log(err);
                            res.status(500).send({
                                'Error': 'MySQL_ERR',
                                'error_code': err.code
                            });
                            throw 'MySQL_ERR';
                        }
                    )
                );
            })
            .then(
                function(offers){
                    // if the query for the offers was successful
                    res.status(200).send({
                        'offers': offers
                    });
                }
            )
            .catch(
                function(err){
                    // Final catch for all errors
                    console.log('Final catch err: ' + err);
                }
            );
        });
    }
};

module.exports = offerAPIController;