/*
 * ==============================================================================
 * SmartBelt — ESP32 Industrial IoT Firmware Template
 * ==============================================================================
 * 
 * Hardware: ESP32-WROOM-32 (or ESP32-S3)
 * Communications: Wi-Fi (IEEE 802.11 b/g/n) -> HTTP POST JSON API
 * Target Backend: FastAPI Ingestion Endpoint (/api/devices/{DEVICE_ID}/sensor-data)
 * Authentication: Custom X-Device-Token Header
 * 
 * Instructions:
 * 1. Update WIFI_SSID and WIFI_PASSWORD for your local Wi-Fi network.
 * 2. Update BACKEND_URL with your FastAPI server IP/hostname (e.g. "http://192.168.1.100:8005").
 * 3. Update DEVICE_ID and DEVICE_TOKEN with the credentials generated in the SmartBelt Dashboard.
 * 4. Wire physical sensors (MPU6050, DS18B20, Tachometer/Encoder, Current Sensor) to ESP32 pins.
 * 5. Replace placeholder functions readTemperature(), readVibration(), readRPM(), readCurrent() with your physical pin reads.
 * ==============================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// --- USER CONFIGURATION ---
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// FastAPI Public Backend Base URL (Do not use localhost when running on physical ESP32, use your local IP)
const char* BACKEND_URL   = "http://192.168.1.100:8005";

// Device Credentials (Generated from SmartBelt "Connect ESP32" Modal)
const char* DEVICE_ID     = "ESP32_A82F91";
const char* DEVICE_TOKEN  = "token_sec_984f1a23b5c6";

// Sampling & Telemetry Interval (milliseconds)
const unsigned long TELEMETRY_INTERVAL_MS = 2000;
unsigned long lastTelemetryTime = 0;

// --- HARDWARE SENSOR READ FUNCTIONS (PLACEHOLDERS) ---

// TODO: Replace with physical DS18B20 1-Wire temperature sensor pin reading
float readTemperature() {
  // Placeholder simulated sensor reading (Range: 38.0°C – 65.0°C)
  float baseTemp = 42.5;
  float randomNoise = (random(-10, 15) / 10.0);
  return baseTemp + randomNoise;
}

// TODO: Replace with physical MPU6050 I2C accelerometer RMS vibration calculation (mm/s)
float readVibration() {
  // Placeholder simulated sensor reading (Range: 1.2 mm/s – 4.5 mm/s)
  float baseVib = 1.8;
  float randomNoise = (random(-3, 5) / 10.0);
  return max(0.5f, baseVib + randomNoise);
}

// TODO: Replace with physical IR Tachometer / Hall Effect pulse counter for RPM
float readRPM() {
  // Placeholder simulated sensor reading (Nominal: 1450 RPM)
  int randomNoise = random(-15, 15);
  return 1450.0 + randomNoise;
}

// TODO: Replace with physical ACS712 / SCT-013 Current Transducer ADC reading (Amperes)
float readCurrent() {
  // Placeholder simulated sensor reading (Nominal: 3.8 A)
  float randomNoise = (random(-2, 3) / 10.0);
  return 3.8 + randomNoise;
}

// --- SETUP INITIALIZATION ---
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("=================================================");
  Serial.println("   SmartBelt ESP32 IoT Node Initializing         ");
  Serial.println("=================================================");

  Serial.print("[Wi-Fi] Connecting to network: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.print("[Wi-Fi] Connected successfully! IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println();
    Serial.println("[Wi-Fi] Connection failed! Retrying in loop...");
  }
}

// --- MAIN LOOP ---
void loop() {
  // Ensure Wi-Fi stays connected
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[Wi-Fi] Reconnecting...");
    WiFi.disconnect();
    WiFi.reconnect();
    delay(3000);
    return;
  }

  unsigned long currentMillis = millis();
  if (currentMillis - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryTime = currentMillis;
    sendSensorDataPayload();
  }
}

// --- TRANSMIT SENSOR TELEMETRY VIA HTTP POST ---
void sendSensorDataPayload() {
  // 1. Read values from hardware sensors
  float temperature = readTemperature();
  float vibration   = readVibration();
  float rpm         = readRPM();
  float current     = readCurrent();

  // 2. Format JSON Payload
  StaticJsonDocument<256> doc;
  doc["temperature"] = temperature;
  doc["vibration"]   = vibration;
  doc["rpm"]         = rpm;
  doc["current"]     = current;
  doc["tracking"]    = 1.2; // Optional tracking offset
  doc["tension"]     = 142; // Optional belt tension

  String jsonString;
  serializeJson(doc, jsonString);

  // 3. Construct Ingestion Endpoint URL
  String endpointUrl = String(BACKEND_URL) + "/api/devices/" + String(DEVICE_ID) + "/sensor-data";

  Serial.print("[HTTP POST] Sending payload to ");
  Serial-[#159A9C]println(endpointUrl);
  Serial.println(jsonString);

  HTTPClient http;
  http.begin(endpointUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Token", DEVICE_TOKEN); // Secure Token Header Authentication

  int httpResponseCode = http.POST(jsonString);

  if (httpResponseCode > 0) {
    String responseString = http.getString();
    Serial.print("[HTTP Success] Status Code: ");
    Serial.println(httpResponseCode);
    Serial.print("[Response] ");
    Serial.println(responseString);
  } else {
    Serial.print("[HTTP Error] Ingestion Failed. Code: ");
    Serial.println(httpResponseCode);
  }

  http.end();
}
