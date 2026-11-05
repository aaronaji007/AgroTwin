/**
 * =========================================================================
 * AgroTwin-Share: ESP32 IoT Microcontroller Sensor Node Firmware
 * =========================================================================
 * 
 * Hardware Sensor Bill of Materials (BOM):
 * 1. ESP32 DevKit V1 (Wi-Fi 2.4GHz + Dual Core Xtensa 240MHz)
 * 2. DHT11 / DHT22 Sensor (Temperature & Relative Humidity) -> Pin GPIO 4
 * 3. MQ-135 / MQ-2 Gas Sensor (Ethylene, VOC, CO2 detection) -> Pin GPIO 32 (ADC1_CH4)
 * 4. HC-SR04 Ultrasonic Distance Sensor (Produce Fill Depth) -> Trig: GPIO 5, Echo: GPIO 18
 * 
 * Target Ingestion Endpoint:
 * POST http://<SERVER_IP>:8000/api/telemetry/esp32
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// ---------------------------------------------------------------------------
// 1. NETWORK & BACKEND CONFIGURATION
// ---------------------------------------------------------------------------
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Replace with your backend computer's LAN IP (or Vercel / cloud URL)
const char* BACKEND_URL   = "http://192.168.1.100:8000/api/telemetry/esp32";
const char* DEVICE_ID     = "ESP32-NODE-01";
const char* TARGET_BIN_ID = "BIN-01"; // Assign to "BIN-01" (Cold Room Alpha)

// ---------------------------------------------------------------------------
// 2. PIN ASSIGNMENTS
// ---------------------------------------------------------------------------
#define DHT_PIN          4     // 1-Wire Digital Data
#define DHT_TYPE         DHT11 // Set to DHT11 (or DHT22)
#define GAS_ANALOG_PIN   32    // ADC1 Pin for MQ-135 analog voltage
#define ULTRASONIC_TRIG  5     // HC-SR04 Trigger Pin
#define ULTRASONIC_ECHO  18    // HC-SR04 Echo Pin
#define STATUS_LED       2     // On-board blue status LED

// Chamber dimension constant (Ceiling height in cm)
const float CHAMBER_MAX_HEIGHT_CM = 200.0;

DHT dht(DHT_PIN, DHT_TYPE);

// ---------------------------------------------------------------------------
// 3. SENSOR READING ROUTINES
// ---------------------------------------------------------------------------
float readUltrasonicDistanceCm() {
  digitalWrite(ULTRASONIC_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(ULTRASONIC_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(ULTRASONIC_TRIG, LOW);

  long durationUs = pulseIn(ULTRASONIC_ECHO, HIGH, 30000); // 30ms timeout (~5m)
  if (durationUs <= 0) return 45.0; // fallback default
  
  // Speed of sound: 343 m/s = 0.0343 cm/us -> distance = (duration * 0.0343) / 2
  float distanceCm = (durationUs * 0.0343) / 2.0;
  return distanceCm;
}

float calculateFillPercentage(float distanceCm) {
  // If chamber is 200cm tall and distance is 40cm, produce stack is 160cm (80% fill)
  float produceHeight = CHAMBER_MAX_HEIGHT_CM - distanceCm;
  float fillPct = (produceHeight / CHAMBER_MAX_HEIGHT_CM) * 100.0;
  if (fillPct < 0.0) fillPct = 0.0;
  if (fillPct > 100.0) fillPct = 100.0;
  return fillPct;
}

// ---------------------------------------------------------------------------
// 4. SETUP
// ---------------------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(STATUS_LED, OUTPUT);
  pinMode(ULTRASONIC_TRIG, OUTPUT);
  pinMode(ULTRASONIC_ECHO, INPUT);

  Serial.println("\n==============================================");
  Serial.println("  AgroTwin-Share: ESP32 Sensor Node Booting   ");
  Serial.println("==============================================");

  dht.begin();
  
  // Connect to Wi-Fi
  Serial.printf("Connecting to Wi-Fi SSID: %s\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 25) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[Wi-Fi Connected!]");
    Serial.printf("IP Address: %s | RSSI: %d dBm\n", WiFi.localIP().toString().c_str(), WiFi.RSSI());
    digitalWrite(STATUS_LED, HIGH);
  } else {
    Serial.println("\n[Wi-Fi Connection Failed - Will retry during loop]");
  }
}

// ---------------------------------------------------------------------------
// 5. MAIN TRANSMISSION LOOP (1 TRANSMISSION EVERY 2.5 SECONDS)
// ---------------------------------------------------------------------------
void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Reconnecting to Wi-Fi...");
    WiFi.reconnect();
    delay(2000);
    return;
  }

  // 1. Read DHT11
  float tempC = dht.readTemperature();
  float rhPct = dht.readHumidity();

  if (isnan(tempC) || isnan(rhPct)) {
    Serial.println("Warning: DHT11 reading failure, applying safe fallback");
    tempC = 2.0;
    rhPct = 90.0;
  }

  // 2. Read MQ-135 Gas Sensor
  int rawGasAdc = analogRead(GAS_ANALOG_PIN); // 0 - 4095
  // Calibrated transfer function: 0-4095 ADC -> ~0.01 - 2.50 ppm ethylene equivalent
  float gasPpm = (rawGasAdc / 4095.0) * 2.50;

  // 3. Read Ultrasonic HC-SR04
  float distanceCm = readUltrasonicDistanceCm();
  float fillPct = calculateFillPercentage(distanceCm);

  int rssiDbm = WiFi.RSSI();
  unsigned long uptimeSeconds = millis() / 1000;

  // 4. Construct JSON Payload
  StaticJsonDocument<512> doc;
  doc["device_id"]              = DEVICE_ID;
  doc["bin_id"]                 = TARGET_BIN_ID;
  doc["dht11_temp"]             = serialized(String(tempC, 2));
  doc["dht11_humidity"]         = serialized(String(rhPct, 1));
  doc["gas_raw"]                = rawGasAdc;
  doc["gas_ppm"]                = serialized(String(gasPpm, 3));
  doc["ultrasonic_distance_cm"] = serialized(String(distanceCm, 1));
  doc["fill_level_pct"]         = serialized(String(fillPct, 1));
  doc["rssi_dbm"]               = rssiDbm;
  doc["uptime_s"]               = uptimeSeconds;

  String jsonString;
  serializeJson(doc, jsonString);

  Serial.println("\n--> Transmitting Telemetry Packet to AgroTwin:");
  Serial.println(jsonString);

  // 5. Send HTTP POST
  HTTPClient http;
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "application/json");

  int httpResponseCode = http.POST(jsonString);

  if (httpResponseCode > 0) {
    Serial.printf("<-- HTTP %d OK! Telemetry ingested into Digital Twin.\n", httpResponseCode);
    // Blink LED to indicate successful transmission
    digitalWrite(STATUS_LED, LOW);
    delay(50);
    digitalWrite(STATUS_LED, HIGH);
  } else {
    Serial.printf("<-- Transmission Error: %s\n", http.errorToString(httpResponseCode).c_str());
  }

  http.end();

  // Sleep 2.5 seconds between ingestion cycles
  delay(2500);
}
