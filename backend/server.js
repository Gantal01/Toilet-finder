const express = require('express');
const cors = require('cors');
const  pool = require('./db');


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());


app.get('/api/toilets', async(req, res) =>{
    try{
        const result = await pool.query(`SELECT osm_id, name, amenity, ST_X(way::geometry) AS lon, ST_Y(way::geometry) AS lat FROM planet_osm_point WHERE amenity = 'toilets'`)
        res.json(result.rows);
    }catch (err){
        console.error('DB error', err);
        res.status(500).send('DAtabase error');
    }
    
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})