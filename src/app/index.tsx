
import { useRef, useState } from 'react';
import {
  Alert,
  Image,
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
    address: 'Gulberg, Lahore, Punjab, Pakistan',
    price: 100,
    distance: '0.5 km away',
    type: 'Covered parking',
    spacesAvailable: 4,
    latitude: 31.5204,
    longitude: 74.3587,
    photo:
      'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=1000',
    description:
      'A convenient residential parking option with covered protection for your vehicle.',
  },
  {
    id: '2',
    name: 'City Center Parking',
    area: 'Main Boulevard, Lahore',
    address: 'Main Boulevard, Lahore, Punjab, Pakistan',
    price: 150,
    distance: '1.2 km away',
    type: 'Open parking',
    spacesAvailable: 8,
    latitude: 31.5105,
    longitude: 74.3441,
    photo:
      'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1000',
    description:
      'An open parking option close to the main boulevard and nearby businesses.',
  },
  {
    id: '3',
    name: 'Private Driveway',
    area: 'Model Town, Lahore',
    address: 'Model Town, Lahore, Punjab, Pakistan',
    price: 80,
    distance: '2 km away',
    type: 'Car parking',
    spacesAvailable: 2,
    latitude: 31.4839,
    longitude: 74.3264,
    photo:
      'https://images.unsplash.com/photo-1486006920555-c77dcf18193b?w=1000',
    description:
      'An affordable private driveway parking option in Model Town.',
  },
];

const timeSlots = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM',
];

const durations = [1, 2, 3, 4, 5, 6, 8];

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

    .leaflet-popup-content {
      font-family: Arial, sans-serif;
      line-height: 1.6;
    }

    .open-details {
      background: #0D9488;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 12px;
      margin-top: 5px;
      font-weight: bold;
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
      const marker = L.marker([
        spot.latitude,
        spot.longitude
      ]).addTo(map);

      markers[spot.id] = marker;

      marker.bindPopup(
        '<b>' + spot.name + '</b><br>' +
        spot.area + '<br>' +
        'Rs ' + spot.price + ' / hour<br>' +
        '<button class="open-details" ' +
        'onclick="selectParking(\\'' + spot.id + '\\')">' +
        'View details</button>'
      );

      marker.on('click', () => {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: 'selectSpot',
            id: spot.id
          })
        );
      });
    });

    function selectParking(id) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'selectSpot',
          id: id
        })
      );
    }

    function focusSpot(id, latitude, longitude) {
      map.setView([latitude, longitude], 17);
      markers[id].openPopup();
    }
  </script>
</body>
</html>
`;

type ParkingSpot = (typeof parkingSpots)[number];

export default function HomeScreen() {
  const mapRef = useRef<WebView>(null);

  const [searchText, setSearchText] = useState('');
  const [selectedSpot, setSelectedSpot] =
    useState<ParkingSpot | null>(null);

  const [arrivalDay, setArrivalDay] = useState('Today');
  const [arrivalTime, setArrivalTime] = useState('10:00 AM');
  const [duration, setDuration] = useState(1);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const filteredSpots = parkingSpots.filter((spot) => {
    const query = searchText.trim().toLowerCase();

    return (
      spot.name.toLowerCase().includes(query) ||
      spot.area.toLowerCase().includes(query) ||
      spot.type.toLowerCase().includes(query)
    );
  });

  const totalPrice = selectedSpot
    ? selectedSpot.price * duration
    : 0;

  const selectSpot = (spot: ParkingSpot) => {
    setSelectedSpot(spot);
    setArrivalDay('Today');
    setArrivalTime('10:00 AM');
    setDuration(1);
    setBookingConfirmed(false);

    mapRef.current?.injectJavaScript(`
      focusSpot(
        '${spot.id}',
        ${spot.latitude},
        ${spot.longitude}
      );
      true;
    `);
  };

  const goHome = () => {
    setSelectedSpot(null);
    setBookingConfirmed(false);
  };

  const bookParking = () => {
    if (!selectedSpot) {
      return;
    }

    Alert.alert(
      'Confirm your booking',
      'Book ' +
        selectedSpot.name +
        ' for ' +
        duration +
        (duration === 1 ? ' hour' : ' hours') +
        ' at Rs ' +
        totalPrice +
        '?',
      [
        {
          text: 'Go back',
          style: 'cancel',
        },
        {
          text: 'Confirm booking',
          onPress: () => setBookingConfirmed(true),
        },
      ],
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.logo}>
        PARK<Text style={styles.accent}>FINDER</Text>
      </Text>
      <Text style={styles.tagline}>YOUR CITY. YOUR SPACE.</Text>
    </View>
  );

  if (selectedSpot && bookingConfirmed) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

        <ScrollView contentContainerStyle={styles.confirmationPage}>
          <View style={styles.successIcon}>
            <Text style={styles.successEmoji}>✓</Text>
          </View>

          <Text style={styles.confirmationTitle}>
            Booking confirmed!
          </Text>

          <Text style={styles.confirmationSubtitle}>
            Your demo booking has been created successfully.
          </Text>

          <View style={styles.confirmationCard}>
            <Image
              source={{ uri: selectedSpot.photo }}
              style={styles.confirmationImage}
            />

            <Text style={styles.nameLarge}>
              {selectedSpot.name}
            </Text>

            <Text style={styles.area}>
              {selectedSpot.address}
            </Text>

            <View style={styles.separator} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Arrival</Text>
              <Text style={styles.summaryValue}>
                {arrivalDay} · {arrivalTime}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>
                {duration} {duration === 1 ? 'hour' : 'hours'}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Price per hour</Text>
              <Text style={styles.summaryValue}>
                Rs {selectedSpot.price}
              </Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total amount</Text>
              <Text style={styles.totalPrice}>
                Rs {totalPrice}
              </Text>
            </View>
          </View>

          <View style={styles.demoNotice}>
            <Text style={styles.demoNoticeText}>
              Demo only: this reservation is stored in the current
              screen state. No real parking space has been reserved
              and no payment has been taken.
            </Text>
          </View>

          <Pressable style={styles.primaryButton} onPress={goHome}>
            <Text style={styles.primaryButtonText}>
              Back to ParkFinder
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  if (selectedSpot) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.detailsTopBar}>
            <Pressable style={styles.backButton} onPress={goHome}>
              <Text style={styles.backButtonText}>‹ Back to map</Text>
            </Pressable>
            {renderHeader()}
          </View>

          <Image
            source={{ uri: selectedSpot.photo }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          <View style={styles.detailsContent}>
            <View style={styles.titleRow}>
              <View style={styles.titleContent}>
                <Text style={styles.detailsTitle}>
                  {selectedSpot.name}
                </Text>
                <Text style={styles.address}>
                  📍 {selectedSpot.address}
                </Text>
              </View>

              <View style={styles.detailsPriceBox}>
                <Text style={styles.detailsPrice}>
                  Rs {selectedSpot.price}
                </Text>
                <Text style={styles.hour}>per hour</Text>
              </View>
            </View>

            <View style={styles.badgeRow}>
              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeText}>
                  🚗 {selectedSpot.type}
                </Text>
              </View>

              <View style={styles.availableBadge}>
                <Text style={styles.availableText}>
                  {selectedSpot.spacesAvailable} demo spaces
                </Text>
              </View>
            </View>

            <Text style={styles.description}>
              {selectedSpot.description}
            </Text>

            <View style={styles.separator} />

            <Text style={styles.sectionTitle}>
              Book your parking
            </Text>

            <Text style={styles.fieldLabel}>Arrival date</Text>

            <View style={styles.optionRow}>
              {['Today', 'Tomorrow'].map((day) => (
                <Pressable
                  key={day}
                  onPress={() => setArrivalDay(day)}
                  style={[
                    styles.optionButton,
                    arrivalDay === day && styles.optionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      arrivalDay === day && styles.optionTextSelected,
                    ]}
                  >
                    {day}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Arrival time</Text>

            <View style={styles.timeGrid}>
              {timeSlots.map((time) => (
                <Pressable
                  key={time}
                  onPress={() => setArrivalTime(time)}
                  style={[
                    styles.timeButton,
                    arrivalTime === time && styles.optionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.timeText,
                      arrivalTime === time && styles.optionTextSelected,
                    ]}
                  >
                    {time}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Parking duration</Text>

            <View style={styles.optionRow}>
              {durations.map((hours) => (
                <Pressable
                  key={hours}
                  onPress={() => setDuration(hours)}
                  style={[
                    styles.durationButton,
                    duration === hours && styles.optionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      duration === hours && styles.optionTextSelected,
                    ]}
                  >
                    {hours}h
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.priceSummary}>
              <Text style={styles.summaryLabel}>
                Rs {selectedSpot.price} × {duration}{' '}
                {duration === 1 ? 'hour' : 'hours'}
              </Text>

              <Text style={styles.totalPrice}>
                Rs {totalPrice}
              </Text>
            </View>

            <Pressable
              style={styles.primaryButton}
              onPress={bookParking}
            >
              <Text style={styles.primaryButtonText}>
                Book Now · Rs {totalPrice}
              </Text>
            </Pressable>

            <Text style={styles.bookingDisclaimer}>
              Sample prices and availability only. No payment is
              required in this demo.
            </Text>

            <Pressable style={styles.secondaryButton} onPress={goHome}>
              <Text style={styles.secondaryButtonText}>
                Choose another parking spot
              </Text>
            </Pressable>
          </View>

          <Text style={styles.footer}>
            ParkFinder · Less searching, easier parking.
          </Text>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderHeader()}

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
            onMessage={(event) => {
              try {
                const message = JSON.parse(event.nativeEvent.data);

                if (message.type === 'selectSpot') {
                  const spot = parkingSpots.find(
                    (item) => item.id === String(message.id),
                  );

                  if (spot) {
                    setSelectedSpot(spot);
                    setArrivalDay('Today');
                    setArrivalTime('10:00 AM');
                    setDuration(1);
                    setBookingConfirmed(false);
                  }
                }
              } catch {
                // Ignore messages that are not valid JSON.
              }
            }}
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
            onPress={() => selectSpot(spot)}
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
            Alert.alert(
              'Coming soon',
              'Parking owner registration will be added in a future update.',
            )
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
  detailsTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 12,
  },
  backButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#0D9488',
    fontSize: 13,
    fontWeight: '800',
  },
  heroImage: {
    width: '100%',
    height: 230,
    backgroundColor: '#E2E8F0',
  },
  detailsContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleContent: {
    flex: 1,
    marginRight: 10,
  },
  detailsTitle: {
    fontSize: 23,
    fontWeight: '900',
    color: '#0F172A',
  },
  address: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 7,
    lineHeight: 18,
  },
  detailsPriceBox: {
    alignItems: 'flex-end',
    paddingTop: 3,
  },
  detailsPrice: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0D9488',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 18,
  },
  infoBadge: {
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  infoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  availableBadge: {
    backgroundColor: '#CCFBF1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  availableText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F766E',
  },
  description: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 21,
    marginTop: 18,
  },
  separator: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    marginTop: 18,
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    minWidth: 100,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  optionSelected: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  optionText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },
  optionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeButton: {
    width: '31%',
    minHeight: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
  },
  timeText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '700',
  },
  durationButton: {
    minWidth: 42,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
  },
  priceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0D9488',
  },
  primaryButton: {
    backgroundColor: '#0D9488',
    paddingVertical: 17,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  bookingDisclaimer: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 12,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 14,
  },
  secondaryButtonText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '800',
  },
  confirmationPage: {
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 40,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  successEmoji: {
    color: '#0F766E',
    fontSize: 38,
    fontWeight: '900',
  },
  confirmationTitle: {
    textAlign: 'center',
    fontSize: 25,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 18,
  },
  confirmationSubtitle: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    marginTop: 8,
    marginBottom: 24,
  },
  confirmationCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
  },
  confirmationImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
  },
  nameLarge: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginVertical: 7,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'right',
    flexShrink: 1,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  demoNotice: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
  },
  demoNoticeText: {
    fontSize: 11,
    lineHeight: 18,
    color: '#92400E',
  },
});
