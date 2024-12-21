const GOOGLE_MAPS_APIKEY = 'AIzaSyCR6m47owJG21hUsWuE3FbMR0sJS1NMO_Q';
export const fetchNearestRoad = async userLocation => {
  const {latitude, longitude} = userLocation;
  const url = `https://roads.googleapis.com/v1/snapToRoads?path=${latitude},${longitude}&key=${GOOGLE_MAPS_APIKEY}`;
  try {
    const response = await fetch(url);
    const json = await response.json();
    console.log('walkable distabce', json);
    if (json.snappedPoints && json.snappedPoints.length) {
      const nearestPoint = json.snappedPoints[0];
      console.log('Nearest Road Point:', nearestPoint);
      return nearestPoint; // This is the snapped point on the road
    }
  } catch (error) {
    console.error('Error fetching nearest road: ', error);
  }
};
export const calculateRegion = (userLocation, destinationLocation) => {
  const lat1 = userLocation.latitude;
  const lon1 = userLocation.longitude;
  const lat2 = destinationLocation.latitude;
  const lon2 = destinationLocation.longitude;

  const latMid = (lat1 + lat2) / 2;
  const lonMid = (lon1 + lon2) / 2;

  const latDelta = Math.abs(lat1 - lat2) * 1.5; // Adjust multiplier for better view
  const lonDelta = Math.abs(lon1 - lon2) * 1.5;

  return {
    latitude: latMid,
    longitude: lonMid,
    latitudeDelta: latDelta,
    longitudeDelta: lonDelta,
  };
};
