// This db file contains:
// Actions required on an offering, such as CRUD

// Importing other libs I need to use
const uuid = require('uuid/v4');

const offersDB = {
    init(pool){
        this.pool = pool;
    },
    addAnOffer(listing_id, offer_user_id, offer_price){
        return new Promise((resolve, reject) =>{
            const offer_id = uuid();
            this.pool.query(`
            INSERT INTO OFFERS
            (offer_id, listing_id, offer_user_id, offer_price, status, deleted)
            VALUES
            (?, ?, ?, ?, ?, ?)
            `, [offer_id, listing_id, offer_user_id, offer_price, 0, 0], function(err, data){
                if(err){
                    reject(err);
                }
                else{
                    resolve(data);
                }
            });
        });
    },
    getOffersForAListing(listing_id){
        return new Promise((resolve, reject) => {
            this.pool.query(`
            SELECT u.username AS offer_user_username, o.offer_id, o.listing_id, o.offer_user_id, o.offer_price, o.status, o.created_timestamp, o.last_modified_timestamp FROM
            OFFERS o LEFT JOIN USERS u ON o.offer_user_id = u.user_id
            WHERE ((o.listing_id = ?) AND (o.deleted = 0))
            `, [listing_id], function(err, data){
                if(err){
                    reject(err);
                }
                else{
                    resolve(data);
                }
            });
        });
    },
    checkUserPlacedOffer(listing_id, offer_user_id){
        return new Promise((resolve, reject) =>{
            this.pool.query(`
           SELECT * FROM OFFERS
           WHERE ((listing_id = ?) AND (offer_user_id = ?)) 
            `, [listing_id, offer_user_id], function(err, data){
                if(err){
                    reject(err);
                }
                else if(data.length === 0){
                    // If he has never placed the offer before
                    resolve(false);
                }
                else{
                    // He has placed an offer before
                    resolve(true);
                }
            });
        });
    }
};

module.exports = offersDB;