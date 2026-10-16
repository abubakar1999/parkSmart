
import { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

const parkingSpots = [
  {
    id: '1',
    name: 'Secure Home Parking',
    area: 'Gulberg, Lahore',
    price: 100,
    distance: '0.5 km away',
    type: 'Covered parking',
    latitude: 31.5204,
    longitude: 74.3587,
  },
  {
    id: '2',
    name: 'City Center Parking',
    area: 'Main Boulevard, Lahore',
    price: 150,
    distance: '1.2 km away',
    type: 'Open parking',
    latitude: 31.5105,
    longitude: 74.3441,
  },
  {
    id: '3',
    name: 'Private Driveway',
    area: 'Model Town, Lahore',
    price: 80,
    distance: '2 km away',
    type: 'Car parking',
    latitude: 31.4839,
    longitude: 74.3264,
  },
];

const mapHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport"
    content="width=device-width, initial-scale=1, maximum-scale=1">

  <link rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

  <style>
    html, body, #map {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <div id="map"></div>

  <script>
    const map = L.map('map').setView([31.5204, 74.3587], 13);

    L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }
    ).addTo(map);

    const spots = ${JSON.stringify(parkingSpots)};
    const markers = {};

    spots.forEach(spot => {
      markers[spot.id] = L.marker([
        spot.latitude,
        spot.longitude
      ]).addTo(map);

      markers[spot.id].bindPopup(
        '<b>' + spot.name + '</b><br>' +
        spot.area + '<br>Rs ' + spot.price + ' / hour'
      );
    });
  </script>
</body>
</html>
`;

export default function HomeScreen() {
  const mapRef = useRef<WebView>(null);
  const [searchText, setSearchText] = useState('');

  const filteredSpots = parkingSpots.filter((spot) => {
    const query = searchText.trim().toLowerCase();

    return (
      spot.name.toLowerCase().includes(query) ||
      spot.area.toLowerCase().includes(query) ||
      spot.type.toLowerCase().includes(query)
    );
  });

  const focusParkingSpot = (spot: (typeof parkingSpots)[number]) => {
    mapRef.current?.injectJavaScript(`
      map.setView([${spot.latitude}, ${spot.longitude}], 17);
      markers['${spot.id}'].openPopup();
      true;
    `);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.logo}>
            PARK<Text style={styles.accent}>FINDER</Text>
          </Text>
          <Text style={styles.tagline}>YOUR CITY. YOUR SPACE.</Text>
        </View>

        <Text style={styles.heading}>Park smarter.</Text>
        <Text style={styles.subtitle}>
          Find your perfect parking spot.
        </Text>

        <TextInput
          style={styles.search}
          placeholder="Search city, area or landmark..."
          placeholderTextColor="#64748B"
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="words"
          clearButtonMode="while-editing"
        />

        <View style={styles.map}>
          <WebView
            ref={mapRef}
            source={{ html: mapHTML }}
            style={styles.webMap}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={['*']}
            mixedContentMode="compatibility"
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby parking</Text>
          <Text style={styles.count}>
            {filteredSpots.length}{' '}
            {filteredSpots.length === 1 ? 'space' : 'spaces'}
          </Text>
        </View>

        {filteredSpots.map((spot) => (
          <Pressable
            key={spot.id}
            style={styles.card}
            onPress={() => focusParkingSpot(spot)}
          >
            <View style={styles.carBox}>
              <Text style={styles.carEmoji}>🚘</Text>
            </View>

            <View style={styles.details}>
              <Text style={styles.name}>{spot.name}</Text>
              <Text style={styles.area}>{spot.area}</Text>
              <Text style={styles.meta}>
                {spot.type} · {spot.distance}
              </Text>
            </View>

            <View style={styles.priceBox}>
              <Text style={styles.price}>Rs {spot.price}</Text>
              <Text style={styles.hour}>/ hour</Text>
            </View>
          </Pressable>
        ))}

        {filteredSpots.length === 0 && (
          <Text style={styles.emptyMessage}>
            No parking found. Try another area.
          </Text>
        )}

        <Pressable
          style={styles.ownerButton}
          onPress={() =>
            alert('Parking owner registration is coming next!')
          }
        >
          <Text style={styles.ownerButtonText}>
            + List your parking space
          </Text>
        </Pressable>

        <Text style={styles.footer}>
          ParkFinder · Less searching, easier parking.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 12,
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 24,
  },
  logo: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1,
  },
  accent: {
    color: '#0D9488',
  },
  tagline: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 5,
    letterSpacing: 2,
  },
  heading: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0F172A',
    paddingHorizontal: 22,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 6,
    marginBottom: 20,
    paddingHorizontal: 22,
  },
  search: {
    height: 54,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#0F172A',
  },
  map: {
    height: 260,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#CCFBF1',
  },
  webMap: {
    flex: 1,
    backgroundColor: '#CCFBF1',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginTop: 26,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  count: {
    color: '#64748B',
    fontSize: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  carBox: {
    width: 44,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carEmoji: {
    fontSize: 23,
  },
  details: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  area: {
    fontSize: 11,
    color: '#475569',
    marginTop: 4,
  },
  meta: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 5,
  },
  priceBox: {
    alignItems: 'flex-end',
    marginLeft: 4,
  },
  price: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0D9488',
  },
  hour: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 3,
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#64748B',
    marginHorizontal: 20,
    marginVertical: 24,
    fontSize: 14,
  },
  ownerButton: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: '#0D9488',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  ownerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  footer: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 11,
    marginTop: 20,
    marginBottom: 30,
  },
});
