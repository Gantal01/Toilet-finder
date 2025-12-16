const express = require('express');
const cors = require('cors');
const  pool = require('./db');
const fetch = require('node-fetch')
const passport = require('./passport')
const authRoutes = require('./auth');
const e = require('express');
require('dotenv').config({path: 'secret.env'});


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use(('/auth'), authRoutes);


app.get('/users', async(req, res) => {
    const result = await pool.query(
        `SELECT * FROM users_old`
    );

    try{
        res.json(result.rows);
    }catch(err){
        console.error("Database error:", err);
    }
    
});


app.get('/toilets', async(req, res) =>{
    const result = await pool.query(`SELECT 
        toilet_id,
        osm_id,     
        ST_X(location::geometry) AS lon,    
        ST_Y(location::geometry) AS lat
      FROM toilets
      WHERE osm_id IS NOT NULL OR approved = true;`);

        try{
            
            res.json(result.rows);
        }catch (err){
            console.error('DB error', err);
            res.status(500).send('DAtabase error');
        }
    
});

app.get('/toilets/:id', async(req, res) =>{
    const {id} = req.params;
    try{
    const result = await pool.query(`
        SELECT
        toilet_id,
        osm_id, 
        name,
        operator,
        access, 
        opening_hours,
        wheelchair,
        fee,
        ST_X(location::geometry) AS lon,    
        ST_Y(location::geometry) AS lat
      FROM toilets
      WHERE toilet_id = $1 AND (osm_id IS NOT NULL OR approved = true);
        `, [id]
    );

    if (result.rows.length === 0){
        return res.status(404).json({ message: 'Toilet not found'});
    }

        res.json(result.rows[0]);
    }   catch (err){
        console.error('DB error', err);
        res.status(500).send('Database error');
    }   


});

app.post('/route', async (req, res) => {
    const {start, end, profile} = req.body;

    try{
        const url = `http://localhost:17777/brouter?lonlats=${start.lng},${start.lat}|${end.lng},${end.lat}&format=gpx&profile=${profile}`;
        const response = await fetch(url);
        const gpxText = await response.text();
        res.send(gpxText);
    }catch (err){
        res.status(500).json({error:'Route fetch failed'})
    }

})


app.get('/profil/:id', async(req, res) => {
    const {id} = req.params;
    try{
        const result = await pool.query(`
            SELECT 
            user_id,
            google_id,
            name,
            role,
            email,
            nickname
            FROM users
            WHERE user_id = $1;
            `, [id]
        );

        if(result.rows.length === 0){
            return res.status(404).json({message: 'User not found'})
        }

        res.json(result.rows[0]);
    }catch(err){
        res.status(500).json({error:'Database error'})
    }

});

app.get('/rating/:toilet_id', async(req, res) => {
    const {toilet_id} = req.params;
    try{
        const result = await pool.query(`
            SELECT
            r.toilet_id,
            r.value,
            r.description,
            r.creation_time,
            COALESCE(u.nickname, u.name) AS user_name
            FROM ratings r
            JOIN users u ON u.user_id = r.user_id
            WHERE r.toilet_id = $1
            ORDER BY r.creation_time DESC;`, [toilet_id]
        );

        res.json(result.rows);
        
    }catch(err){
        res.status(500).json({error: 'Database error'});
    }
});


app.get('/rating/average/:toilet_id', async(req, res) => {
    const {toilet_id} = req.params;
    try{
        const result = await pool.query(`
            SELECT
            COUNT(*)::int AS count,
            COALESCE(ROUND(AVG(value)::numeric, 1), 0) AS average
            FROM ratings
            WHERE toilet_id = $1;`, [toilet_id]
        );

        res.json(result.rows[0]);
        
    }catch(err){
        res.status(500).json({error: 'Database error'});
    }
});

app.post('/rating', passport.authenticate('jwt', {session: false}), async(req, res) => {
    const { toilet_id, value, description } = req.body;
    const user_id = req.user.user_id;

    if (!toilet_id || !value || value < 1 || value > 5) {
      return res.status(400).json({ message: 'Invalid rating data' });
    }

    try{
        const result = await pool.query(`
            INSERT INTO ratings (user_id, toilet_id, value, description)
            VALUES ($1, $2, $3, $4)
            RETURNING rating_id, toilet_id, value, description, creation_time;
            `, [user_id, toilet_id, value, description]
        );

        res.status(201).json(result.rows[0]);
    }catch(err){
        if(err.code === '23505'){
            return res.status(409).json({message: 'Already rated'});
        }

        console.error('Database error', err);
        res.status(500).json({message: 'Database error'});

    }

});


app.put('/users/:id/nickname', passport.authenticate('jwt', {session: false}),async(req, res) => {
    const userID = Number(req.params.id);
    const {nickname} = req.body;

    if(req.user.user_id !== userID && req.user.role !== 'admin'){
        return res.status(403).json({message: 'Not valid role'});
    }

    if(!nickname || nickname.length < 3){
        return res.status(403).json({message: 'Not valid nickname'});
    }

    try{
        const result = await pool.query(`
            UPDATE users
            SET nickname = $1
            WHERE user_id = $2
            RETURNING user_id, name, email, nickname, role;`, [nickname, userID]
        );

        res.json(result.rows[0]);
    }catch (err){
        console.error('Database error', err);
        res.status(500).json({message: 'Database error'});
    }


})

app.put('/users/:id/nickname/remove', passport.authenticate('jwt', {session: false}),async(req, res) => {
    const userID = Number(req.params.id);

    if(req.user.user_id !== userID && req.user.role !== 'admin'){
        return res.status(403).json({message: 'Not valid role'});
    }


    try{
        const result = await pool.query(`
            UPDATE users
            SET nickname = NULL
            WHERE user_id = $1
            RETURNING user_id, name, email, nickname, role;`, [userID]
        );

        res.json(result.rows[0]);
    }catch (err){
        console.error('Database error', err);
        res.status(500).json({message: 'Database error'});
    }


})


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});