/*
 * ==============================================================================
 * SmartBelt — Industrial Conveyor Monitoring ESP32 Firmware (Arduino Sketch)
 * ==============================================================================
 * 
 * Target Board : ESP32 Dev Module / ESP32-WROOM-32
 * Framework    : Arduino C++
 * Dependencies : ArduinoJson (^6.21.3), WiFi, HTTPClient
 * 
 * Features:
 *  - Dual Mode: Hardware Real Sensor Reads vs Realistic Dynamic Simulation Mode
 *  - Non-blocking telemetry loop with interval timing
 *  - Wi-Fi liveness auto-reconnect logic
 *  - Configurable HTTP REST JSON payload with X-Device-Token authorization header
 * ==============================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ==============================================================================
// 1. CONFIGURATION & CONFIGURABLE FLAGS
// ==============================================================================

// Set SIMULATION_MODE to true when physical sensors are disconnected/testing.
// Set SIMULATION_MODE to false when physical sensors are wired to GPIO pins.
#define SIMULATION_MODE true

// Wi-Fi Access Point Credentials
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// FastAPI Public Backend Ingestion URL (Use PC local IP, e.g. http://192.168.1.100:8005)
const char* serverUrl     = "http://192.168.1.100:8005";

// Device Credentials (Generated from SmartBelt Dashboard -> "Connect ESP32" Modal)
const char* DEVICE_ID     = "ESP32_A82F91";
const char* DEVICE_TOKEN  = "token_sec_995c735d4fa5427aa34177d61eb6ba92";

// Telemetry Transmission Interval (milliseconds)
const unsigned long TELEMETRY_INTERVAL_MS = 2000;
unsigned long lastTelemetryTime = 0;

// Dynamic simulation variables (gradual realistic variation)
float simTemp      = 45.2f;
float simVib       = 0.32f;
float simLoad      = 68.4f;
float simSpeed     = 1.45f;
float simCurrent   = 2.80f;
float simAngleTime = 0.0f;

// ==============================================================================
// 2. SETUP INITIALIZATION
// ==============================================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("========================================");
  Serial.println(" SMARTBELT CONVEYOR MONITORING ESP32");
  Serial.println("========================================");

  #if SIMULATION_MODE
    Serial.println("Mode         : [SIMULATED DEMO MODE]");
  #else
    Serial.println("Mode         : [REAL PHYSICAL SENSORS]");
  #endif

  initWiFi();
}

// ==============================================================================
// 3. MAIN EXECUTION LOOP
// ==============================================================================
void loop() {
  // Ensure Wi-Fi connection is maintained
  if (WiFi.status() != WL_CONNECTED) {
    static unsigned long lastReconnectAttempt = 0;
    if (millis() - lastReconnectAttempt > 5000) {
      lastReconnectAttempt = millis();
      Serial.println("[Wi-Fi] Warning: Connection lost. Attempting background reconnect...");
      WiFi.reconnect();
    }
  }

  unsigned long currentMillis = millis();
  if (currentMillis - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryTime = currentMillis;

    float temp = 0.0f, vib = 0.0f, load = 0.0f, speed = 0.0f, current = 0.0f;

    // Read sensor values (simulation or physical hardware)
    readSensors(temp, vib, load, speed, current);

    // Print values to Serial Monitor
    Serial.println();
    Serial.println("========================================");
    Serial.println(" SMARTBELT CONVEYOR MONITORING ESP32");
    Serial.println("========================================");

    if (WiFi.status() == WL_CONNECTED) {
      Serial.print("WiFi Status  : Connected (");
      Serial.print(WiFi.localIP());
      Serial.println(")");
    } else {
      Serial.println("WiFi Status  : DISCONNECTED (Offline)");
    }

    #if SIMULATION_MODE
      Serial.println("Sensor Mode  : [SIMULATED]");
    #else
      Serial.println("Sensor Mode  : [REAL SENSOR]");
    #endif

    Serial.println();
    Serial.print("Temperature  : "); Serial.print(temp, 1); Serial.println(" °C");
    Serial.print("Vibration    : "); Serial.print(vib, 2); Serial.println(" mm/s");
    Serial.print("Load Weight  : "); Serial.print(load, 1); Serial.println(" kg");
    Serial.print("Belt Speed   : "); Serial.print(speed, 2); Serial.println(" m/s");
    Serial.print("Motor Current: "); Serial.print(current, 1); Serial.println(" A");

    // Transmit telemetry payload to backend API
    sendDataToBackend(temp, vib, load, speed, current);

    Serial.println("----------------------------------------");
  }
}

// ==============================================================================
// 4. WI-FI INITIALIZATION
// ==============================================================================
void initWiFi() {
  Serial.print("WiFi Network : Connecting to ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 15) {
    delay(400);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.print("WiFi Status  : Connected successfully! IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println();
    Serial.println("WiFi Status  : Connection timeout. Continuing in offline mode...");
  }
}

// ==============================================================================
// 5. SENSOR ARCHITECTURE & READINGS
// ==============================================================================
void readSensors(float &temp, float &vib, float &load, float &speed, float &current) {
  #if SIMULATION_MODE
    updateSimulationValues(temp, vib, load, speed, current);
  #else
    temp    = readTemperature();
    vib     = readVibration();
    load    = readLoad();
    speed   = readBeltSpeed();
    current = readMotorCurrent();
  #endif
}

// Realistic simulation generator (gradually changing physical dynamics)
void updateSimulationValues(float &temp, float &vib, float &load, float &speed, float &current) {
  simAngleTime += 0.15f;

  // Temperature drifts with thermal inertia around 45.2°C ± 1.5°C
  simTemp += (sin(simAngleTime * 0.2f) * 0.12f) + (random(-10, 10) / 100.0f);
  simTemp = max(38.0f, min(65.0f, simTemp));

  // Vibration oscillates realistically around 0.32 mm/s
  simVib = 0.32f + (sin(simAngleTime * 0.8f) * 0.08f) + (random(-5, 5) / 100.0f);
  simVib = max(0.10f, min(3.50f, simVib));

  // Load varies smoothly with ore payload conveyor weight around 68.4 kg
  simLoad = 68.4f + (cos(simAngleTime * 0.3f) * 3.2f) + (random(-15, 15) / 10.0f);
  simLoad = max(20.0f, min(120.0f, simLoad));

  // Belt speed fluctuates slightly around nominal 1.45 m/s
  simSpeed = 1.45f + (sin(simAngleTime * 0.1f) * 0.03f);

  // Motor current responds to load variations around 2.8 A
  simCurrent = 2.80f + (simLoad - 68.4f) * 0.02f + (random(-5, 5) / 10.0f);
  simCurrent = max(1.0f, min(8.0f, simCurrent));

  temp    = simTemp;
  vib     = simVib;
  load    = simLoad;
  speed   = simSpeed;
  current = simCurrent;
}

// ------------------------------------------------------------------------------
// PHYSICAL SENSOR READ FUNCTIONS (REPLACE WITH YOUR HARDWARE LIBRARY CALLS)
// ------------------------------------------------------------------------------

float readTemperature() {
  // TODO: Insert DS18B20 1-Wire or Thermocouple hardware read call
  return 45.2f;
}

float readVibration() {
  // TODO: Insert MPU6050 Accelerometer RMS calculation
  return 0.32f;
}

float readLoad() {
  // TODO: Insert Load Cell / HX711 strain gauge read call
  return 68.4f;
}

float readBeltSpeed() {
  // TODO: Insert Optical Tachometer / Hall Effect pulse counter speed calculation
  return 1.45f;
}

float readMotorCurrent() {
  // TODO: Insert ACS712 / SCT-013 current sensor ADC reading
  return 2.8f;
}

// ==============================================================================
// 6. BACKEND COMMUNICATION (HTTP POST REST API)
// ==============================================================================
void sendDataToBackend(float temp, float vib, float load, float speed, float current) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Sending data to backend...");
    Serial.println("HTTP Status  : Skipped (Wi-Fi Offline)");
    return;
  }

  // Construct Ingestion Endpoint URL
  String endpointUrl = String(serverUrl) + "/api/devices/" + String(DEVICE_ID) + "/sensor-data";

  // Build JSON Payload
  StaticJsonDocument<256> doc;
  doc["deviceId"]     = DEVICE_ID;
  doc["temperature"]  = round(temp * 10.0f) / 10.0f;
  doc["vibration"]    = round(vib * 100.0f) / 100.0f;
  doc["load"]         = round(load * 10.0f) / 10.0f;
  doc["beltSpeed"]    = round(speed * 100.0f) / 100.0f;
  doc["motorCurrent"] = round(current * 10.0f) / 10.0f;
  doc["rpm"]          = 1450;
  doc["tracking"]     = 1.2;
  doc["tension"]      = 142;
  doc["timestamp"]    = millis() / 1000;

  String jsonString;
  serializeJson(doc, jsonString);

  Serial.println();
  Serial.println("Sending data to backend...");

  HTTPClient http;
  http.begin(endpointUrl);
  http.setTimeout(3000); // 3-second non-blocking HTTP timeout
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Token", DEVICE_TOKEN);

  int httpResponseCode = http.POST(jsonString);

  if (httpResponseCode > 0) {
    Serial.print("HTTP Status  : ");
    Serial.print(httpResponseCode);
    if (httpResponseCode == 200 || httpResponseCode == 201) {
      Serial.println(" (OK - Telemetry Ingested)");
    } else {
      Serial.println(" (Server Warning)");
    }
  } else {
    Serial.print("HTTP Status  : Error (Code ");
    Serial.print(httpResponseCode);
    Serial.println(" - Backend Unreachable)");
  }

  http.end();
}
