const express = require("express");
const cors = require("cors");
const pool = require("./db");
const fetch = require("node-fetch");
const passport = require("./passport");
const authRoutes = require("./auth");
const e = require("express");
require("dotenv").config({ path: "secret.env" });

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use("/auth", authRoutes);

app.get("/users", async (req, res) => {
  const result = await pool.query(`SELECT * FROM users`);

  try {
    res.json(result.rows);
  } catch (err) {
    console.error("Database error:", err);
  }
});

app.get("/toilets", async (req, res) => {
  const result = await pool.query(`SELECT 
        toilet_id,
        osm_id,     
        ST_X(location::geometry) AS lon,    
        ST_Y(location::geometry) AS lat
      FROM toilets
      WHERE osm_id IS NOT NULL OR approved = true;`);

  try {
    res.json(result.rows);
  } catch (err) {
    console.error("DB error", err);
    res.status(500).send("DAtabase error");
  }
});

app.get("/toilets/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
        SELECT
        toilet_id,
        osm_id, 
        name,
        operator,
        access, 
        opening_hours,
        wheelchair,
        fee,
        added_by,
        approved_by,
        hstore_to_json(extra_info) AS extra_info,
        ST_X(location::geometry) AS lon,    
        ST_Y(location::geometry) AS lat
      FROM toilets
      WHERE toilet_id = $1 AND (osm_id IS NOT NULL OR approved = true);
        `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Toilet not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB error", err);
    res.status(500).send("Database error");
  }
});

app.post("/route", async (req, res) => {
  const { start, end, profile } = req.body;
  console.log("ROUTE BODY:", req.body);

  try {
    const url = `http://localhost:17777/brouter?lonlats=${start.lng},${start.lat}|${end.lng},${end.lat}&format=gpx&profile=${profile}`;
    const response = await fetch(url);
    const gpxText = await response.text();
    res.send(gpxText);
  } catch (err) {
    res.status(500).json({ error: "Route fetch failed" });
  }
});

app.get("/profil/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
            SELECT 
            user_id,
            google_id,
            name,
            role,
            email,
            nickname
            FROM users
            WHERE user_id = $1;
            `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/rating/:toilet_id", async (req, res) => {
  const { toilet_id } = req.params;
  try {
    const result = await pool.query(
      `
            SELECT
            r.rating_id,
            r.toilet_id,
            r.value,
            r.description,
            r.creation_time,
            COALESCE(u.nickname, u.name) AS user_name
            FROM ratings r
            JOIN users u ON u.user_id = r.user_id
            WHERE r.toilet_id = $1
            ORDER BY r.creation_time DESC;`,
      [toilet_id],
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/rating/average/:toilet_id", async (req, res) => {
  const { toilet_id } = req.params;
  try {
    const result = await pool.query(
      `
            SELECT
            COUNT(*)::int AS count,
            COALESCE(ROUND(AVG(value)::numeric, 1), 0) AS average
            FROM ratings
            WHERE toilet_id = $1;`,
      [toilet_id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.post(
  "/rating",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { toilet_id, value, description } = req.body;
    const user_id = req.user.user_id;

    if (!toilet_id || !value || value < 1 || value > 5) {
      return res.status(400).json({ message: "Invalid rating data" });
    }

    try {
      const result = await pool.query(
        `
            INSERT INTO ratings (user_id, toilet_id, value, description)
            VALUES ($1, $2, $3, $4)
            RETURNING rating_id, toilet_id, value, description, creation_time;
            `,
        [user_id, toilet_id, value, description],
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      if (err.code === "23505") {
        return res.status(409).json({ message: "Already rated" });
      }

      console.error("Database error", err);
      res.status(500).json({ message: "Database error" });
    }
  },
);

app.put(
  "/users/:id/nickname",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const userID = Number(req.params.id);
    const { nickname } = req.body;

    if (req.user.user_id !== userID && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not valid role" });
    }

    if (!nickname || nickname.length < 3) {
      return res.status(403).json({ message: "Not valid nickname" });
    }

    const exist = await pool.query(
      `SELECT 1 FROM users WHERE nickname = $1 AND user_id <> $2`,
      [nickname.trim(), userID],
    );

    if (exist.rowCount > 0) {
      return res.status(409).json({ message: "Nickname is already taken!" });
    }

    try {
      const result = await pool.query(
        `
            UPDATE users
            SET nickname = $1
            WHERE user_id = $2
            RETURNING user_id, name, email, nickname, role;`,
        [nickname, userID],
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Database error", err);
      res.status(500).json({ message: "Database error" });
    }
  },
);

app.put(
  "/users/:id/nickname/remove",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const userID = Number(req.params.id);

    if (req.user.user_id !== userID && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not valid role" });
    }

    try {
      const result = await pool.query(
        `
            UPDATE users
            SET nickname = NULL
            WHERE user_id = $1
            RETURNING user_id, name, email, nickname, role;`,
        [userID],
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Database error", err);
      res.status(500).json({ message: "Database error" });
    }
  },
);

app.get("/toilet/nearest", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ message: "Missig lat or lon" });
  }

  try {
    const result = await pool.query(
      `
      SELECT
      toilet_id,
      osm_id,
      name,
      ST_X(location::geometry) AS lon,
      ST_Y(location::geometry) AS lat,
      ST_DISTANCE(location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS distance
      FROM toilets
      WHERE osm_id IS NOT NULL OR approved = true
      ORDER BY ST_Distance(location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography)
      LIMIT 1;
      `,
      [lon, lat],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database error", err);
    res.status(500).json({ message: "Database error" });
  }
});

app.get(
  "/ratings/:user_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user_id = Number(req.params.user_id);

    if (req.user.user_id !== user_id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    try {
      const result = await pool.query(
        `      
      SELECT
      r.rating_id,
      r.toilet_id,
      r.value,
      r.description,
      r.creation_time,
      t.name AS toilet_name,
      t.osm_id
      FROM ratings r
      JOIN toilets t ON t.toilet_id = r.toilet_id
      WHERE user_id = $1
      ORDER BY creation_time DESC;
      `,
        [user_id],
      );

      res.json(result.rows);
    } catch (err) {
      console.error("Database error", err);
      res.status(500).json({ message: "Database error" });
    }
  },
);

app.delete(
  "/rating/:rating_id/delete",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const userID = req.user.user_id;
    const isAdmin = req.user.role;
    const ratingID = Number(req.params.rating_id);

    try {
      const result = await pool.query(
        `
        DELETE FROM ratings
        WHERE rating_id = $1
        AND (user_id = $2 OR $3 = 'admin')
        RETURNING rating_id;
      
      `,
        [ratingID, userID, isAdmin],
      );

      if (result.rowCount === 0) {
        return res.status(403).json({ message: "Not authorized" });
      }

      res.json({ message: "Siekres törlés" });
    } catch (err) {
      console.error("Databse error", err);
      res.status(500).json({ message: "Database error" });
    }
  },
);

app.put(
  "/rating/:rating_id/update",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const ratingID = Number(req.params.rating_id);
    const { value, description } = req.body;
    const userID = req.user.user_id;
    const isAdmin = req.user.role;

    try {
      const result = await pool.query(
        `
            UPDATE ratings
            SET value = $1, 
            description = $2
            WHERE rating_id = $3
            AND (user_id = $4 OR $5 = 'admin')
            RETURNING *`,
        [value, description, ratingID, userID, isAdmin],
      );

      if (result.rowCount === 0) {
        return res.status(403).json({ message: "Not authorized" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Database error", err);
      res.status(500).json({ message: "Database error" });
    }
  },
);

app.post(
  "/toilets/add",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user_id = req.user.user_id;

    const {
      name,
      operator,
      access,
      lat,
      lon,
      opening_hours,
      fee,
      wheelchair,
      extra_info,
    } = req.body;

    const latNum = Number(lat);
    const lonNum = Number(lon);

    if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
      return res.status(400).json({ message: "Lat/lon out of range" });
    }

    let extraInfoJson = null;

    if (
      extra_info &&
      typeof extra_info === "object" &&
      !Array.isArray(extra_info)
    ) {
      const cleaned = {};
      for (const [k, v] of Object.entries(extra_info)) {
        if (typeof k !== "string") continue;
        if (typeof v !== "string") continue;
        const key = k.trim();
        const val = v.trim();
        if (!key || !val) continue;
        cleaned[key] = val;
      }
      extraInfoJson = Object.keys(cleaned).length
        ? JSON.stringify(cleaned)
        : null;
    }

    try {
      const result = await pool.query(
        `
        INSERT INTO toilets (
          name,
          operator,
          access,
          approved,
          location,
          opening_hours,
          approved_by,
          added_by,
          fee,
          wheelchair,
          osm_id,
          extra_info
        )
        VALUES (
          $1,
          $2,
          $3,
          false,
          ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography,
          $6,
          NULL,
          $7,
          $8,
          $9,
          NULL,
          CASE
           WHEN $10::jsonb IS NULL THEN NULL
      ELSE (
        SELECT hstore(array_agg(key), array_agg(value))
        FROM jsonb_each_text($10::jsonb)
      )
          END
        )
        RETURNING
          toilet_id,
          name,
          operator,
          access,
          approved,
          added_by,
          opening_hours,
          fee,
          wheelchair,
          osm_id,
          hstore_to_json(extra_info) AS extra_info,
          ST_X(location::geometry) AS lon,
          ST_Y(location::geometry) AS lat;
        `,
        [
          name.trim(),
          operator ?? null,
          access ?? null,
          lonNum,
          latNum,
          opening_hours ?? null,
          user_id,
          fee ?? null,
          wheelchair ?? null,
          extraInfoJson,
        ],
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Database error", err);
      res.status(500).json({ message: "Database error" });
    }
  },
);

app.get("/newToilet", async (req, res) => {
  try {
    const result = await pool.query(`SELECT 
        toilet_id,
        osm_id,     
        ST_X(location::geometry) AS lon,    
        ST_Y(location::geometry) AS lat
      FROM toilets
      WHERE osm_id IS NULL AND approved = false;`);

    res.json(result.rows);
  } catch (err) {
    console.error("DB error", err);
    res.status(500).send("Database error");
  }
});

app.get("/newToilets/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
        SELECT
        toilet_id,
        osm_id, 
        name,
        operator,
        access, 
        opening_hours,
        wheelchair,
        fee,
        hstore_to_json(extra_info) AS extra_info,
        ST_X(location::geometry) AS lon,    
        ST_Y(location::geometry) AS lat
      FROM toilets
      WHERE toilet_id = $1;
        `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Toilet not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB error", err);
    res.status(500).send("Database error");
  }
});

app.put(
  "/toilet/:toilet_id/approve",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const toiletID = Number(req.params.toilet_id);
    const userID = req.user.user_id;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    try {
      const result = await pool.query(
        `
            UPDATE toilets
            SET approved = true,
            approved_by = $2 
            WHERE toilet_id = $1
            RETURNING toilet_id, approved, approved_by`,
        [toiletID, userID],
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Toilet not found" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Database error", err);
      res.status(500).json({ message: "Database error" });
    }
  },
);

app.post(
  "/suggestion",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { toilet_id, suggestion } = req.body;
    const user_id = req.user.user_id;

    try {
      const result = await pool.query(
        `
            INSERT INTO suggestions (user_id, toilet_id, description)
            VALUES ($1, $2, $3)
            RETURNING suggestion_id, toilet_id, description, creation_time;
            `,
        [user_id, toilet_id, suggestion],
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Database error", err);
      res.status(500).json({ message: "Database error" });
    }
  },
);

app.get("/suggestions", async (req, res) => {
  try {
    const result = await pool.query(`SELECT 
        toilet_id,
        user_id,     
        suggestion_id,
        description,
        creation_time,
        status
      FROM suggestions
      WHERE status = 'pending';
      `);

    res.json(result.rows);
  } catch (err) {
    console.error("DB error", err);
    res.status(500).send("Database error");
  }
});

app.patch(
  "/toiletsUpdate/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user_id = req.user.user_id;
    const toilet_id = Number(req.params.id);

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const {
      name,
      operator,
      access,
      opening_hours,
      fee,
      wheelchair,
      extra_info,
    } = req.body;

    let extraInfoJson = null;

    if (
      extra_info &&
      typeof extra_info === "object" &&
      !Array.isArray(extra_info)
    ) {
      const cleaned = {};
      for (const [k, v] of Object.entries(extra_info)) {
        if (typeof k !== "string") continue;
        if (typeof v !== "string") continue;
        const key = k.trim();
        const val = v.trim();
        if (!key || !val) continue;
        cleaned[key] = val;
      }
      extraInfoJson = Object.keys(cleaned).length
        ? JSON.stringify(cleaned)
        : null;
    }

    try {
      const result = await pool.query(
        `
        UPDATE toilets
        SET
          name = $1,
          operator = $2,
          access = $3,
          opening_hours = $4,
          fee = $5,
          wheelchair = $6,
          extra_info = CASE
            WHEN $7::jsonb IS NULL THEN NULL
            ELSE (
              SELECT hstore(array_agg(key), array_agg(value))
              FROM jsonb_each_text($7::jsonb)
            )
          END
        WHERE toilet_id = $8
        RETURNING
          toilet_id,
          name,
          operator,
          access,
          approved,
          added_by,
          opening_hours,
          fee,
          wheelchair,
          osm_id,
          hstore_to_json(extra_info) AS extra_info,
          ST_X(location::geometry) AS lon,
          ST_Y(location::geometry) AS lat;
        `,
        [
          (name ?? "").trim(),
          operator ?? null,
          access ?? null,
          opening_hours ?? null,
          fee ?? null,
          wheelchair ?? null,
          extraInfoJson,
          toilet_id,
        ],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Not found" });
      }
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Database error", err);
      res.status(500).json({
        message: "Database error",
        detail: err.message,
        code: err.code,
      });
    }
  },
);

app.post(
  "/suggestion/:id/resolve",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const suggestion_id = Number(req.params.id);
    const user_id = req.user.user_id;
    const { status } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (status !== "approved" && status !== "rejected") {
      return res.status(400).json({ message: "Invalid status" });
    }

    try {
      const result = await pool.query(
        `
            UPDATE suggestions SET
            status = $1,
            handled_by = $2,
            handled_at = NOW()
            WHERE suggestion_id = $3
            RETURNING *;
            `,
        [status, user_id, suggestion_id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Not found" });
      }
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Database error", err);
      res.status(500).json({ message: "Database error" });
    }
  },
);

app.delete(
  "/toilet/:toilet_id/delete",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const isAdmin = req.user.role;
    const toiletID = Number(req.params.toilet_id);

    try {
      const result = await pool.query(
        `
        DELETE FROM toilets
        WHERE toilet_id = $1
        AND ($2 = 'admin')
        RETURNING toilet_id;
      
      `,
        [toiletID, isAdmin],
      );

      if (result.rowCount === 0) {
        return res.status(403).json({ message: "Not authorized" });
      }

      res.json({ message: "Siekres törlés" });
    } catch (err) {
      console.error("Databse error", err);
      res.status(500).json({ message: "Database error" });
    }
  },
);

app.put(
  "/toilet/:toilet_id/reject",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const toiletID = Number(req.params.toilet_id);
    const userID = req.user.user_id;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    try {
      const result = await pool.query(
        `
            UPDATE toilets
            SET approved = false,
            approved_by = $2 
            WHERE toilet_id = $1
            RETURNING toilet_id, approved, approved_by`,
        [toiletID, userID],
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Toilet not found" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Database error", err);
      res.status(500).json({ message: "Database error" });
    }
  },
);

app.get("/geocode", async (req, res) => {
  try {
    const q = String(req.query.q ?? "").trim();
    if (!q) return res.json(null);

    const url =
      `https://nominatim.openstreetmap.org/search?` +
      `format=jsonv2&addressdetails=0&limit=1&countrycodes=hu&q=${encodeURIComponent(q)}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "HolVanMosdo",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return res.status(502).json(null);
    }

    const data = await response.json();
    const firstRes = data?.[0];
    if (!firstRes) {
      return res.json(null);
    }

    res.json({ lat: Number(firstRes.lat), lon: Number(firstRes.lon) });
  } catch (err) {
    res.status(500).json(null);
  }
});

app.patch(
  "/user/me/delete",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const userID = req.user.user_id;

    try {
      const result = await pool.query(
        `
      UPDATE users
      SET is_deleted = true,
      deleted_at = NOW(),
      deleted_by = $1
      WHERE user_id = $1 AND is_deleted = false
      RETURNING user_id, is_deleted, deleted_at, deleted_by`,
        [userID],
      );

      if (result.rowCount === 0) {
        return res
          .status(404)
          .json({ message: "Already deleted or not found" });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error("Database error", err);
      res.status(500).json({ message: "Database error" });
    }
  },
);

app.patch(
  "/user/:id/delete",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const userID = Number(req.params.id);

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (userID === req.user.user_id) {
      return res
        .status(400)
        .json({ message: "Use /user/me/delete for self delete" });
    }

    const adminId = req.user.user_id;

    try {
      const result = await pool.query(
        `
      UPDATE users
      SET is_deleted = true,
      deleted_at = NOW(),
      deleted_by = $2
      WHERE user_id = $1 AND is_deleted = false
      RETURNING user_id, is_deleted, deleted_at, deleted_by`,
        [userID, adminId],
      );

      if (result.rowCount === 0) {
        return res
          .status(404)
          .json({ message: "Already deleted or not found" });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error("Database error", err);
      res.status(500).json({ message: "Database error" });
    }
  },
);

app.get("/user/me", (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({ message: info?.message ?? "UNATHUROZED" });
    }

    res.json(user);
  })(req, res, next);
});

app.get(
  "/admin/toiletquery",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const q = (req.query.q ?? "").toString().trim();
    try {
      const result = await pool.query(
        `SELECT 
      toilet_id,
      osm_id,
      name,
      operator,
      access,
      approved  
      FROM toilets
      WHERE (osm_id IS NOT NULL OR approved = true)
        AND (
          $1 = '' OR
          name ILIKE '%' || $1 || '%' OR
          operator ILIKE '%' || $1 || '%' OR
          access ILIKE '%' || $1 || '%' OR
          toilet_id::text ILIKE '%' || $1 || '%'
        )
      ORDER BY toilet_id DESC;
      ;`,
        [q],
      );

      res.json(result.rows);
    } catch (err) {
      console.error("DB error", err);
      res.status(500).send("DAtabase error");
    }
  },
);

app.get(
  "/admin/userquery",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const q = (req.query.q ?? "").toString().trim();
    try {
      const result = await pool.query(
        `SELECT 
      user_id,
      name,
      email,
      role,
      nickname,
      google_id 
      FROM users
      WHERE is_deleted = false
        AND (
          $1 = '' OR
          name ILIKE '%' || $1 || '%' OR
          email ILIKE '%' || $1 || '%' OR
          role ILIKE '%' || $1 || '%' OR
          nickname ILIKE '%' || $1 || '%' OR
          user_id::text ILIKE '%' || $1 || '%' OR
          google_id::text ILIKE '%' || $1 || '%'
        )
      ORDER BY user_id DESC;
      ;`,
        [q],
      );

      res.json(result.rows);
    } catch (err) {
      console.error("DB error", err);
      res.status(500).send("DAtabase error");
    }
  },
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
