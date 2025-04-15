from gee_utils import fetch_map_uhi

# Sample coordinates and dates for testing
latitude = 28.6139   # New Delhi
longitude = 77.2090
zoom = 10
start_date = '2023-01-01'
end_date = '2023-01-31'

# Call the function
result = fetch_map_uhi(latitude, longitude, zoom, start_date, end_date)

# Print the URLs returned
print("GEE Map URLs:")
for key, url in result.items():
    print(f"{key}: {url}")
