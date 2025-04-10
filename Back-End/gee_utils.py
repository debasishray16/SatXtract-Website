import ee

# Initialize Earth Engine
try:
    ee.Initialize()
except Exception as e:
    ee.Authenticate()
    ee.Initialize()

def get_map_url(image, vis_params):
    """Generate a map URL from an EE image."""
    map_id = image.getMapId(vis_params)
    return f"https://earthengine.googleapis.com/map/{map_id['mapid']}/{{z}}/{{x}}/{{y}}?token={map_id['token']}"

def fetch_map_data(latitude, longitude, zoom, start_date, end_date):
    """Fetch Normal, LSE, LST, and NDVI maps."""
    start_date_ee = ee.Date(start_date)
    end_date_ee = ee.Date(end_date)

    # Normal Map (Sentinel-2 RGB)
    sentinel = (ee.ImageCollection("COPERNICUS/S2")
                .filterBounds(ee.Geometry.Point(longitude, latitude))
                .filterDate(start_date_ee, end_date_ee)
                .median())

    normal_map_url = get_map_url(sentinel, {'bands': ['B4', 'B3', 'B2'], 'min': 0, 'max': 3000})

    # LSE Map (MODIS)
    lse = (ee.ImageCollection("MODIS/006/MOD11A2")
           .filterBounds(ee.Geometry.Point(longitude, latitude))
           .filterDate(start_date_ee, end_date_ee)
           .median())

    lse_map_url = get_map_url(lse, {'bands': ['LST_Day_1km'], 'min': 13000, 'max': 16500, 'palette': ['blue', 'green', 'red']})

    # LST Map (MODIS)
    lst = (ee.ImageCollection("MODIS/006/MOD11A2")
           .filterBounds(ee.Geometry.Point(longitude, latitude))
           .filterDate(start_date_ee, end_date_ee)
           .select('LST_Day_1km')
           .median())

    lst_map_url = get_map_url(lst, {'min': 13000, 'max': 16500, 'palette': ['blue', 'yellow', 'red']})

    # NDVI Map (Sentinel-2)
    ndvi = sentinel.normalizedDifference(['B8', 'B4'])
    ndvi_map_url = get_map_url(ndvi, {'min': -1, 'max': 1, 'palette': ['blue', 'white', 'green']})

    return {
        "normal_map": normal_map_url,
        "lse_map": lse_map_url,
        "lst_map": lst_map_url,
        "ndvi_map": ndvi_map_url
    }
