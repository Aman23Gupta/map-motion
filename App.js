import React, { Component } from 'react';
import MapView, {PROVIDER_GOOGLE, Marker, Polyline} from 'react-native-maps';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import haversine from 'haversine';

const LATITUDE_DELTA = 0.009;
const LONGITUDE_DELTA = 0.009;
const LATITUDE = 18.7934829;
const LONGITUDE = 98.9867401;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: LATITUDE,
      longitude: LONGITUDE,
      error: null,
      routeCoordinates: [],
      distanceTravelled: 0,
      prevLatLng: { } // contain live distance
    };
  }

  componentDidMount() {
    this.getCurrentLocation();
    this.watchLocation();
  }

  watchLocation = () => {
    navigator.geolocation.watchPosition(
      (position) => {
        //console.log(position);
        const { latitude, longitude } = position.coords;
        const { routeCoordinates, distanceTravelled } = this.state;
        const newCoordinate = { latitude, longitude };
        this.setState({ 
          latitude, 
          longitude,
          routeCoordinates: [...routeCoordinates, newCoordinate],
          distanceTravelled: distanceTravelled + this.calcDistance(newCoordinate),
          prevLatLng: newCoordinate
        });
        console.log(this.state.prevLatLng);
      },
      (error) => {
        console.log(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
        distanceFilter: 10
      }
    );
  }

  getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(position);
        const { latitude, longitude } = position.coords;
        this.setState({
          latitude,
          longitude,
          error: null
        });
      },
      (error) => {
        this.setState({error: error.message})
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000
      }
    );
  }

  calcDistance = (newLatLng) => {
    const {prevLatLng} = this.state;
    return haversine(prevLatLng, newLatLng)||0;
  }

  getMapRegion = () => ({
    latitude: this.state.latitude,
    longitude: this.state.longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA
  });

  render() {
    return (
      <View style={styles.container}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={{ ...StyleSheet.absoluteFillObject }}
          region={this.getMapRegion()}
        >
          <Polyline 
            coordinates={this.state.routeCoordinates}
            strokeWidth={5}
            strokeColor='blue'
          />
          <Marker coordinate={this.getMapRegion()}>
            <Ionicons name="ios-car" style={{fontSize: 30, color: 'green' }} />
          </Marker>
        </MapView>
        <View style={styles.distanceContainer}>
          <Text>{parseFloat(this.state.distanceTravelled).toFixed(2)} km</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: 'flex-end'
  },
  distanceContainer: {
    flexDirection: "row",
    marginVertical: 20,
    backgroundColor: "transparent"
  }
});
 export default App;