# Nyilvános illemhely kereső webalkalmazás

Nyilvános mosdókat kereső webalkalmazás Magyarország területén.
 
## Funkciók
 
- **Térkép alapú böngészés** – Leaflet.js megjelenítő, MarkerCluster csoportosítással
- **Szűrés** – ingyenesség, kerekesszékes hozzáférhetőség szerint
- **Útvonaltervezés** – BRouter integrációval
- **Helyszín keresés** – Nominatim API-val
- **Felhasználói értékelések** – bejelentkezett felhasználók értékelhetik a mosdókat
- **Módosítási javaslatok** – felhasználók küldhetnek helyesbítési javaslatot
- **Admin felület** – javaslatok moderálása, új helyszínek jóváhagyása
- **Google OAuth bejelentkezés** – social login támogatás

## Technológiai stack
 
|  | Technológia |
|---|---|
| Frontend | Angular 17, Angular Material, Leaflet.js |
| Backend | Node.js, Express |
| Adatbázis | PostgreSQL + PostGIS |
| Útvonaltervezés | BRouter |
| Helyszín keresés | Nominatim |
| OSM adat import | osm2pgsql |
| Autentikáció | JWT, Google OAuth |
 
## Telepítés és futtatás
 
### Előfeltételek
- Angular (v17+) 
- Node.js (v18+)
- PostgreSQL + PostGIS bővítmény
- BRouter (útvonaltervezéshez)
### 1. Függőségek telepítése
 
```bash
# Gyökérkönyvtárban
npm install --legacy-peer-deps
 
# Backend
cd backend && npm install
```
### 2. Adatbázis beállítása
 
Szükséges PostgreSQL adatbázis létrehozása, majd az OSM adatok importálása osm2pgsql segítségével:
 
```bash
osm2pgsql -d osm_hungary --create --slim <osm_fájl.pbf>
```
 
> **Megjegyzés:** A szükséges `.pbf` fájl nincs mellékelve.
 
Az adatbázis kapcsolati adatait a `backend/db.js` fájlban kell beállítani.
 
### 3. Környezeti változók
 
`.env` fájl létrehozása szükséges a `backend/` mappában:
 
```env
GOOGLE_CLIENT_ID=<google_client_id>
GOOGLE_CLIENT_SECRET=<google_client_secret>
JWT_SECRET=<titkos_kulcs>
```
 
A Google Client ID és Secret a [Google Cloud Console](https://console.cloud.google.com/)-ból szerezhető be.
 
### 4. Alkalmazás indítása
 
```bash
npm start
```
 
Ez egyszerre indítja el a frontendet és a backendet `concurrently` segítségével.
 
Az alkalmazás alapértelmezés szerint a `http://localhost:4200` címen érhető el.
