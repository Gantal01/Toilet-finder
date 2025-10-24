import * as L from 'leaflet';

declare module 'leaflet'{
    interface markercluster{      
        getChild(): number;
        getAllChild(): L.Marker;     
    }

    interface MarkerClusterGroupOptions{
        iconCreateFunction?:(cluster: MarkerCluster) => L.Icon | L.DivIcon;
    }

    function markerClusterGroup(options:MarkerClusterGroupOptions): L.MarkerClusterGroup; 
}