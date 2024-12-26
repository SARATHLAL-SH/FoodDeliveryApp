import React, {useEffect, useState, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Button,
  Animated,
  Image,
  Alert,
} from 'react-native';
import MapView, {
  Marker,
  Polyline,
  AnimatedRegion,
  Callout,
} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Geolocation from '@react-native-community/geolocation';
import polyline from '@mapbox/polyline';
import haversine from 'haversine';
import {calculateRegion} from '../helper/helper';
import {useNavigation} from '@react-navigation/native';
// import {REACT_APP_MAP_URL} from '@env'

const GOOGLE_MAPS_APIKEY = 'AIzaSyCR6m47owJG21hUsWuE3FbMR0sJS1NMO_Q';
// console.log("map aPi", REACT_APP_MAP_URL);

const MapScreen = ({route}) => {
  const ARROW_ICON = require('../assets/images/bike.png');
  const {latitude: destinationLat, longitude: destinationLng} = route.params;
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [previousLocation, setPreviousLocation] = useState(null);
  const [distanceTravelled, setDistanceTravelled] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [isJourneyStarted, setIsJourneyStarted] = useState(false);
  const [arrowRotation, setArrowRotation] = useState(0);
  const [mode, setMode] = useState('DRIVING');
  const [distance, setDistance] = useState(0);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const animatedValue = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation();
  const userAnimatedLocation = useRef(
    new AnimatedRegion({
      latitude: userLocation?.latitude || 37.78825,
      longitude: userLocation?.longitude || -122.4324,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }),
  ).current;

  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setUserLocation({latitude, longitude});
        const distance = haversine(
          {latitude, longitude},
          {latitude: destinationLat, longitude: destinationLng},
          {unit: 'km'},
        );
        console.log('distance', distance);
        setDistance(distance);
        if (latitude) {
          fetchRoute(
            {latitude, longitude},
            {latitude: destinationLat, longitude: destinationLng},
          );
        }
      },
      error => {
        console.error('Error getting location:', error.message);
        reject(error);
      },
      {enableHighAccuracy: true, distanceFilter: 10},
    );
  }, []);
  useEffect(() => {
    if (isJourneyStarted) {
      mapRef.current?.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        },
        1000,
      );
    }
  }, [isJourneyStarted]);
  const calculateBearing = (start, end) => {
    console.log('start', start, 'end', end);
    const startLat = (Math.PI * start?.latitude) / 180;
    const startLng = (Math.PI * start?.longitude) / 180;
    const endLat = (Math.PI * end.latitude) / 180;
    const endLng = (Math.PI * end.longitude) / 180;

    const dLng = endLng - startLng;

    const x = Math.sin(dLng) * Math.cos(endLat);
    const y =
      Math.cos(startLat) * Math.sin(endLat) -
      Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

    const bearing = (Math.atan2(x, y) * 180) / Math.PI;
    return (bearing + 360) % 360; // Ensure the value is between 0 and 360
  };
  const fetchRoute = async (origin, destination) => {
    console.log('destination', destination);
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=driving&key=${GOOGLE_MAPS_APIKEY}`;
    try {
      const response = await fetch(url);
      const json = await response.json();

      // Validate the response structure
      const routes = json.routes;
      if (!routes || routes.length === 0) {
        throw new Error('No routes found');
      }

      const legs = routes[0]?.legs;
      if (!legs || legs.length === 0) {
        throw new Error('No legs found in route');
      }

      const steps = legs[0]?.steps;
      if (!steps || steps.length === 0) {
        throw new Error('No steps found in leg');
      }

      // Decode detailed route
      const detailedRoute = steps.flatMap(step => {
        const points = step.polyline?.points;
        if (!points) return []; // Skip steps without polyline
        return polyline.decode(points).map(([latitude, longitude]) => ({
          latitude,
          longitude,
        }));
      });

      // Update route coordinates
      setRouteCoordinates(detailedRoute);
    } catch (error) {
      console.error('Error fetching route: ', error.message || error);
      Alert.alert(error.message);
    }
  };
  // Start tracking user location
  const startJourney = () => {
    setIsJourneyStarted(true);

    Geolocation.watchPosition(
      position => {
        const {latitude, longitude, speed: currentSpeed} = position.coords;
        setSpeed(currentSpeed);
        // Update user location
        setUserLocation({
          latitude,
          longitude,
        });

        userAnimatedLocation
          .timing({
            latitude,
            longitude,
            duration: 1000, // 1 second animation
            useNativeDriver: false,
          })
          .start();

        const distance = haversine(
          {latitude, longitude},
          {latitude: destinationLat, longitude: destinationLng},
          {unit: 'km'},
        );

        setDistance(distance);

        // Set previous location for next distance calculation
        setPreviousLocation({latitude, longitude});
        // Fetch new route (if needed)
        fetchRoute(
          {latitude, longitude},
          {latitude: destinationLat, longitude: destinationLng},
        );

        mapRef.current?.animateCamera({
          center: {latitude, longitude},
          heading: arrowRotation, // Rotate the map based on the user's bearing
          pitch: 60, // Optional: Add a tilted 3D effect
          zoom: 17, // Optional: Zoom level for better navigation
        });

        // Append new coordinates to the polyline
        setCoordinates(prevCoordinates => {
          const newCoordinates = [...prevCoordinates, {latitude, longitude}];

          // Calculate distance traveled or bearing only if there are at least 2 points
          if (newCoordinates.length > 1) {
            const lastCoordinate = coordinates[coordinates.length - 1];
            const newBearing = calculateBearing(lastCoordinate, {
              latitude,
              longitude,
            });
            setArrowRotation(newBearing);
          }

          return newCoordinates; // Update state
        });

        // Update speed
        setSpeed(currentSpeed ? (currentSpeed * 3.6).toFixed(2) : 0); // Convert m/s to km/h
      },
      error => console.error(error.message),
      {
        enableHighAccuracy: true,
        distanceFilter: 1, // Update every 5 meters
        interval: 1000, // Update every 3 seconds
      },
    );
  };
  useEffect(() => {
    if (isJourneyStarted) {
      startJourney();
    }
  }, [coordinates, isJourneyStarted]);
  return (
    <View style={styles.container}>
      {userLocation ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={calculateRegion(userLocation, {
            latitude: destinationLat,
            longitude: destinationLng,
          })}
          showsUserLocation={true}
          followsUserLocation={true}>
          {/* Destination Marker */}
          <Marker
            coordinate={userLocation}
            anchor={{x: 0.5, y: 0.5}}
            flat
            rotation={arrowRotation}
            image={ARROW_ICON}></Marker>

          <Marker
            coordinate={{latitude: destinationLat, longitude: destinationLng}}
            title="Delivery Location"
          />
          {/* Directions Polyline */}
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={5}
            strokeColor="blue"
          />
        </MapView>
      ) : (
        <Text style={styles.fetchText}>Fetching user location...</Text>
      )}

      <View style={styles.bottomPanel}>
        <Text style={styles.infoText}>Speed: {speed} km/h</Text>
        <Text style={styles.infoText}>
          Distance: {distance.toFixed(2) || 'Calculating'} km
        </Text>
        {isJourneyStarted ? (
          <Button
            title="Confirm Order"
            onPress={() => {
              navigation.navigate('Confirm Order');
            }}
          />
        ) : (
          <Button title="Start Journey" onPress={startJourney} />
        )}
      </View>
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {flex: 1},
  map: {flex: 1},
  arrow: {
    width: 40, // Customize the size of the arrow
    height: 40,
    resizeMode: 'contain',
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(73, 127, 190, 0.7)',
    borderRadius: 8,
    padding: 15,
    elevation: 5,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  fetchText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 50,
    color: 'red',
  },
});
