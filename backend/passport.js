const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./db.js');
require('dotenv').config({path: 'secret.env'});


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
},

async (asccesToken, refreshToken, profile, done) => {
    try{
       

        const email = profile.emails[0].value;
        const name = profile.displayName;
        const googleId = profile.id;


        let result = await pool.query("SELECT * FROM users WHERE email = $1",[email]);

        let user;

        if(result.rows.length == 0){

            const insertResult = await pool.query(
                `INSERT INTO users (google_id, name, email, role)
                VALUES ($1, $2, $3, $4)
                RETURNING *`,
        [googleId, name, email, 'user']
        );
            
        user = insertResult.rows[0];


        }else{
            user = result.rows[0];
        }

        done(null, user);
    }catch (err){
        done(err, null);
    }
}));

module.exports = passport;