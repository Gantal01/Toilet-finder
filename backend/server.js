const express = require('express');
const cors = require('cors');
const  pool = require('./db');
const fetch = require('node-fetch')


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());


app.get('/toilets', async(req, res) =>{
    const result = await pool.query(`SELECT 
        osm_id,        
        ST_X(way::geometry) AS lon,    
        ST_Y(way::geometry) AS lat
      FROM planet_osm_point
      WHERE amenity = 'toilets';`);

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
        osm_id, 
        name, 
        amenity, 
        tags->'fee' AS fee,
        tags->'operator' AS operator,
        tags->'opening_hours' AS opening_hours,
        tags->'wheelchair' AS wheelchair,
        ST_X(way::geometry) AS lon,    
        ST_Y(way::geometry) AS lat
      FROM planet_osm_point
      WHERE osm_id = $1;
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




app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});