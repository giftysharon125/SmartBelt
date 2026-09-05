/*
 * ==============================================================================
 * SmartBelt — ESP32 Industrial IoT Firmware Template (PlatformIO / C++)
 * ==============================================================================
 * 
 * Hardware: ESP32-WROOM-32 (or ESP32-S3)
 * Communications: Wi-Fi (IEEE 802.11 b/g/n) -> HTTP POST JSON API
 * Target Backend: FastAPI Ingestion Endpoint (/api/devices/{DEVICE_ID}/sensor-data)
 * Authentication: Custom X-Device-Token Header
 * ==============================================================================
 */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Forward declarations for C++
void sendSensorDataPayload();

// --- USER CONFIGURATION ---
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// FastAPI Public Backend Base URL (Use your machine's local IP, e.g. http://192.168.1.100:8005)
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
  float baseTemp = 42.5;
  float randomNoise = (random(-10, 15) / 10.0);
  return baseTemp + randomNoise;
}

// TODO: Replace with physical MPU6050 I2C accelerometer RMS vibration calculation (mm/s)
float readVibration() {
  float baseVib = 1.8;
  float randomNoise = (random(-3, 5) / 10.0);
  return max(0.5f, baseVib + randomNoise);
}

// TODO: Replace with physical IR Tachometer / Hall Effect pulse counter for RPM
float readRPM() {
  int randomNoise = random(-15, 15);
  return 1450.0 + randomNoise;
}

// TODO: Replace with physical ACS712 / SCT-013 Current Transducer ADC reading (Amperes)
float readCurrent() {
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
  float temperature = readTemperature();
  float vibration   = readVibration();
  float rpm         = readRPM();
  float current     = readCurrent();

  StaticJsonDocument<256> doc;
  doc["temperature"] = temperature;
  doc["vibration"]   = vibration;
  doc["rpm"]         = rpm;
  doc["current"]     = current;
  doc["tracking"]    = 1.2;
  doc["tension"]     = 142;

  String jsonString;
  serializeJson(doc, jsonString);

  String endpointUrl = String(BACKEND_URL) + "/api/devices/" + String(DEVICE_ID) + "/sensor-data";

  Serial.print("[HTTP POST] Sending payload to ");
  Serial.println(endpointUrl);
  Serial.println(jsonString);

  HTTPClient http;
  http.begin(endpointUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Token", DEVICE_TOKEN);

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
