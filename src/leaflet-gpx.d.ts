declare module 'leaflet-gpx' {
    import * as L from 'leaflet';
    export default class GPX extends L.Layer {
        constructor(gpx: string | Document | Element, options?: any);
    }
}