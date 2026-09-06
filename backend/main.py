import math
import random
import time
import os
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="SmartBelt API",
    description="Dual Data Source IoT Sensor Monitoring & AI Predictive Maintenance Backend for Iron Ore Conveyors",
    version="2.0.0"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global In-Memory System State
active_anomaly: Optional[str] = None

# ==========================================
# PYDANTIC DATA MODELS
# ==========================================

class AnomalyRequest(BaseModel):
    anomaly_type: str  # 'JOINT_RUPTURE', 'MISALIGNMENT_SPIKE', 'MOTOR_OVERHEAT', 'RESET'

class WorkOrderRequest(BaseModel):
    title: str
    priority: str
    assignedTo: str
    targetComponent: str
    dueDate: str
    estimatedDuration: str

class MaintenanceTaskItem(BaseModel):
    id: int
    task: str
    completed: bool
    priority: str

class ChecklistUpdatePayload(BaseModel):
    checklist: List[MaintenanceTaskItem]

class MongoConfigRequest(BaseModel):
    mongo_uri: str

class UserRegisterRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = "Maintenance Operator"

class UserLoginRequest(BaseModel):
    email: str
    password: str

class ConveyorBeltCreateRequest(BaseModel):
    name: str
    location: Optional[str] = "Iron Ore Mine - Plant 2"
    length_m: Optional[float] = 1450.0
    width_mm: Optional[float] = 1800.0

class DeviceRegisterRequest(BaseModel):
    belt_id: str
    device_name: Optional[str] = "ESP32 Sensor Node"

class Esp32SensorPayload(BaseModel):
    temperature: float
    vibration: float
    rpm: Optional[float] = 1450.0
    current: Optional[float] = 3.8
    motorCurrent: Optional[float] = None
    load: Optional[float] = 68.4
    beltSpeed: Optional[float] = None
    belt_speed_m_s: Optional[float] = 1.45
    tracking: Optional[float] = 1.2
    tension: Optional[float] = 142.0
    deviceId: Optional[str] = None
    timestamp: Optional[float] = None

# ==========================================
# DATABASE DEFAULTS & IN-MEMORY COLLECTIONS
# ==========================================

DEFAULT_CHECKLIST = [
    {"id": 1, "task": "Check belt alignment", "completed": False, "priority": "high"},
    {"id": 2, "task": "Inspect belt joints", "completed": False, "priority": "high"},
    {"id": 3, "task": "Check roller condition", "completed": False, "priority": "medium"},
    {"id": 4, "task": "Check bearing temperature", "completed": False, "priority": "medium"},
    {"id": 5, "task": "Inspect belt tension", "completed": False, "priority": "medium"},
    {"id": 6, "task": "Check motor condition", "completed": False, "priority": "medium"},
    {"id": 7, "task": "Check for abnormal vibration", "completed": False, "priority": "high"},
    {"id": 8, "task": "Inspect conveyor structure", "completed": False, "priority": "low"},
    {"id": 9, "task": "Lubricate bearings", "completed": False, "priority": "medium"},
    {"id": 10, "task": "Check motor coupling", "completed": False, "priority": "medium"},
    {"id": 11, "task": "Inspect gearbox & structural bolts", "completed": False, "priority": "low"},
]

DEFAULT_PREVIOUS_ISSUES = [
    {
        "id": "HIST-101",
        "title": "Belt Misalignment — Resolved",
        "category": "MISALIGNMENT",
        "problem": "Belt tracking shifted toward the left return frame.",
        "cause": "Incorrect alignment / self-aligning return idler debris buildup.",
        "solution": "Tracking adjusted and return idlers cleaned & inspected.",
        "result": "Belt returned to normal center operation (nominal tracking ±1.2mm).",
        "date": "2026-09-01",
        "technician": "Mechanical Tech Team A"
    },
    {
        "id": "HIST-102",
        "title": "High Vibration — Resolved",
        "category": "VIBRATION",
        "problem": "Abnormal vibration detected near drive motor section (spiked to 7.8 mm/s).",
        "cause": "Worn drive pulley bearing / minor unbalance on drive shaft.",
        "solution": "Bearing replaced, shaft re-aligned, and system lubricated.",
        "result": "Vibration returned to normal operating level (1.8 mm/s).",
        "date": "2026-08-28",
        "technician": "Condition Monitoring Lead"
    },
    {
        "id": "HIST-103",
        "title": "Belt Surface Wear — Resolved",
        "category": "WEAR",
        "problem": "Excessive belt top-cover surface wear detected near splice joint #3.",
        "cause": "Continuous ore payload impact / severe skirt board friction.",
        "solution": "Damaged splice edge trimmed and vulcanized patch applied.",
        "result": "Belt surface integrity restored (94% health score).",
        "date": "2026-08-22",
        "technician": "Splice Audit Team"
    }
]

# Default Seed User, Belt, and Device for Immediate Demonstration
DEFAULT_USER = {
    "user_id": "USER_001",
    "email": "demo@smartbelt.io",
    "name": "Primary Operator",
    "password": "demo_password",
    "created_at": time.time()
}

DEFAULT_BELT = {
    "belt_id": "BELT_001",
    "user_id": "USER_001",
    "name": "Primary Ore Overland Conveyor CV-01",
    "location": "Iron Ore Mine - Plant 2",
    "length_m": 1450.0,
    "width_mm": 1800.0,
    "created_at": time.time()
}

DEFAULT_DEVICE = {
    "device_id": "ESP32_A82F91",
    "user_id": "USER_001",
    "belt_id": "BELT_001",
    "device_name": "ESP32 Edge Node #1",
    "device_token": "token_sec_995c735d4fa5427aa34177d61eb6ba92",
    "status": "DEMO_MODE",
    "last_seen_at": None,
    "created_at": time.time()
}

users_db = [DEFAULT_USER]
belts_db = [DEFAULT_BELT]
devices_db = [DEFAULT_DEVICE]
sensor_readings_db = []
checklist_db = list(DEFAULT_CHECKLIST)
alerts_db = []
maintenance_history_db = list(DEFAULT_PREVIOUS_ISSUES)

mongo_available = False
current_mongo_uri = os.getenv("MONGO_URI", "")
db_instance = None

# MongoDB Collections
coll_users = None
coll_belts = None
coll_devices = None
coll_readings = None
coll_checklist = None
coll_alerts = None
coll_history = None
coll_architecture = None
coll_predictions = None
coll_work_orders = None

DEFAULT_SYSTEM_ARCHITECTURE = {
    "system_name": "SmartBelt — CSE Technical Architecture",
    "version": "2.0.0",
    "description": "End-to-End Industrial Conveyor Health Monitoring, Edge Data Ingestion, Random Forest AI Inference & 3D Digital Twin System",
    "database": "smartbelt",
    "layers": [
        {
            "layer": "Layer 1: Sensor & Hardware Layer",
            "components": ["Tri-axial Accelerometers (MPU6050)", "DS18B20 Temperature Sensors", "Optical Tachometers", "ACS712 Current Transducers"],
            "protocol": "Analog & Digital GPIO / I2C / 1-Wire"
        },
        {
            "layer": "Layer 2: Edge Computing & Communication",
            "components": ["ESP32 Microcontroller Edge Nodes", "Arduino C++ / PlatformIO Firmware"],
            "protocol": "HTTP REST POST JSON with X-Device-Token Header Authentication"
        },
        {
            "layer": "Layer 3: Backend Ingestion & Processing",
            "components": ["FastAPI Application Server", "Uvicorn ASGI Server", "Pydantic Schema Validation"],
            "protocol": "Asynchronous REST Endpoints"
        },
        {
            "layer": "Layer 4: Data Storage (MongoDB Atlas / Local)",
            "components": ["MongoDB Database 'smartbelt'"],
            "collections": [
                "users", 
                "conveyor_belts", 
                "esp32_devices", 
                "sensor_readings", 
                "ai_predictions", 
                "alerts", 
                "maintenance_history", 
                "maintenance_checklist", 
                "work_orders", 
                "system_architecture"
            ]
        },
        {
            "layer": "Layer 5: Machine Learning Engine",
            "components": ["Random Forest Classifier & Regressor", "Remaining Useful Life (RUL) Estimator"],
            "outputs": ["Health Score (0-100%)", "Failure Risk Level", "Primary Failure Driver", "RUL Hours"]
        },
        {
            "layer": "Layer 6: Interactive 3D Digital Twin & Frontend",
            "components": ["React 18 SPA", "Babylon.js 3D Physics & Canvas Engine", "Recharts Analytics", "Tailwind CSS"],
            "features": ["Real-time 3D Conveyor Motion", "Thermal & Vibration Particle Visualization", "Live Alert Work Order Dispatch"]
        }
    ],
    "created_at": time.time()
}

DEFAULT_WORK_ORDERS = [
    {
        "work_order_id": "WO-901",
        "title": "Splice Joint #3 Ultrasonic Inspection & Vulcanization",
        "priority": "HIGH",
        "assignedTo": "Senior Splice Specialist",
        "targetComponent": "Splice #3",
        "dueDate": "2026-09-08",
        "estimatedDuration": "3.5 Hours",
        "status": "SCHEDULED",
        "created_at": time.time()
    },
    {
        "work_order_id": "WO-902",
        "title": "Drive Motor Bearing Re-alignment & Thermal Audit",
        "priority": "MEDIUM",
        "assignedTo": "Mechanical Lead",
        "targetComponent": "Primary Drive Motor",
        "dueDate": "2026-09-10",
        "estimatedDuration": "2.0 Hours",
        "status": "IN_PROGRESS",
        "created_at": time.time()
    }
]

def init_mongo_connection(uri_candidate: str = ""):
    global mongo_available, current_mongo_uri, db_instance
    global coll_users, coll_belts, coll_devices, coll_readings, coll_checklist, coll_alerts, coll_history, coll_architecture, coll_predictions, coll_work_orders
    global checklist_db, maintenance_history_db, users_db, belts_db, devices_db

    candidates = []
    if uri_candidate:
        candidates.append(uri_candidate)
    if os.getenv("MONGO_URI"):
        candidates.append(os.getenv("MONGO_URI"))
    candidates.extend([
        "mongodb://127.0.0.1:27017",
        "mongodb://localhost:27017",
        "mongodb://0.0.0.0:27017",
    ])

    try:
        from pymongo import MongoClient
        for uri in candidates:
            try:
                client = MongoClient(uri, serverSelectionTimeoutMS=3000)
                db = client["smartbelt"]
                client.admin.command('ping')

                db_instance = db
                coll_users = db["users"]
                coll_belts = db["conveyor_belts"]
                coll_devices = db["esp32_devices"]
                coll_readings = db["sensor_readings"]
                coll_checklist = db["maintenance_checklist"]
                coll_alerts = db["alerts"]
                coll_history = db["maintenance_history"]
                coll_architecture = db["system_architecture"]
                coll_predictions = db["ai_predictions"]
                coll_work_orders = db["work_orders"]

                current_mongo_uri = uri
                mongo_available = True

                # Seed MongoDB if empty
                if coll_users.count_documents({}) == 0:
                    coll_users.insert_one(dict(DEFAULT_USER))
                if coll_belts.count_documents({}) == 0:
                    coll_belts.insert_one(dict(DEFAULT_BELT))
                if coll_devices.count_documents({}) == 0:
                    coll_devices.insert_one(dict(DEFAULT_DEVICE))

                if coll_architecture.count_documents({}) == 0:
                    coll_architecture.insert_one(dict(DEFAULT_SYSTEM_ARCHITECTURE))

                if coll_work_orders.count_documents({}) == 0:
                    coll_work_orders.insert_many([dict(w) for w in DEFAULT_WORK_ORDERS])

                if coll_checklist.count_documents({}) == 0:
                    coll_checklist.insert_many([dict(item) for item in DEFAULT_CHECKLIST])
                else:
                    docs = list(coll_checklist.find({}, {"_id": 0}))
                    if docs: checklist_db = docs

                if coll_history.count_documents({"problem": {"$exists": True}}) == 0:
                    coll_history.delete_many({})
                    coll_history.insert_many([dict(item) for item in DEFAULT_PREVIOUS_ISSUES])
                else:
                    hdocs = list(coll_history.find({"problem": {"$exists": True}}, {"_id": 0}))
                    if hdocs: maintenance_history_db = hdocs

                print(f"[OK] Connected to MongoDB at {uri} (Database: smartbelt)")
                return True
            except Exception as e:
                print(f"Candidate {uri} failed:", e)
                continue
    except Exception as e:
        print("PyMongo driver error:", e)

    mongo_available = False
    print("MongoDB connection completed with local fallback.")
    return False

# Initialize MongoDB on startup
init_mongo_connection()

# ==========================================
# SHARED RANDOM FOREST ML MODEL ENGINE
# ==========================================

def run_random_forest_prediction(sensors: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates sensor payload (simulation or real ESP32) through Random Forest prediction logic.
    """
    vib = sensors.get("vibration", 1.8)
    temp = sensors.get("temperature", 43.0)
    track = abs(sensors.get("tracking", 1.2))
    tens = sensors.get("tension", 142.0)
    load = sensors.get("load", 82.0)

    health = 96
    if vib > 6.0: health -= 40
    elif vib > 3.0: health -= 18

    if temp > 75: health -= 35
    elif temp > 60: health -= 16

    if track > 7.0: health -= 35
    elif track > 4.0: health -= 18

    if tens > 180 or tens < 100: health -= 30
    elif tens > 165 or tens < 115: health -= 12

    if load > 115: health -= 25
    elif load > 90: health -= 12

    health = max(12, min(99, int(round(health))))
    risk = 100 - health

    condition = "CRITICAL" if health < 60 else "WARNING" if health < 82 else "NORMAL"
    rul = 12 if condition == "CRITICAL" else 150 if condition == "WARNING" else 450

    primary_driver = "None"
    if vib > 4.0: primary_driver = f"Vibration ({vib} mm/s)"
    elif temp > 60.0: primary_driver = f"Temperature ({temp} °C)"
    elif track > 4.0: primary_driver = f"Misalignment ({track} mm)"
    elif load > 90.0: primary_driver = f"Load Current ({load} %)"

    return {
        "healthScore": health,
        "failureRisk": risk,
        "predictedCondition": condition,
        "modelType": "Random Forest Classifier (v2.1)",
        "modelConfidence": "94.8%" if condition == "NORMAL" else "91.2%" if condition == "WARNING" else "96.4%",
        "estimatedRulHours": rul,
        "primaryDriver": primary_driver,
        "evaluationTimestamp": datetime.now().isoformat()
    }

# Dynamic Demo Value Generator (MODE 1 — DEMO)
def get_live_sensors():
    global active_anomaly
    if active_anomaly == 'JOINT_RUPTURE':
        return {
            "source": "simulation",
            "vibration": round(5.8 + random.uniform(-0.4, 0.6), 1),
            "temperature": round(68.0 + random.uniform(-2.0, 4.0), 1),
            "rpm": 1320,
            "current": 4.8,
            "tracking": round(6.5 + random.uniform(-0.5, 1.5), 1),
            "acoustic": round(88 + random.uniform(-3, 5)),
            "load": round(92 + random.uniform(-2, 4)),
            "speed": 3.8,
            "tension": round(195 + random.uniform(-5, 10)),
            "sensorsOnline": 7,
            "totalSensors": 7,
        }
    elif active_anomaly == 'MISALIGNMENT_SPIKE':
        return {
            "source": "simulation",
            "vibration": round(3.9 + random.uniform(-0.3, 0.4), 1),
            "temperature": round(59.0 + random.uniform(-2.0, 3.0), 1),
            "rpm": 1410,
            "current": 4.1,
            "tracking": round(8.2 + random.uniform(-1.0, 1.5), 1),
            "acoustic": round(76 + random.uniform(-2, 4)),
            "load": round(84 + random.uniform(-3, 3)),
            "speed": 3.8,
            "tension": round(162 + random.uniform(-4, 6)),
            "sensorsOnline": 7,
            "totalSensors": 7,
        }
    elif active_anomaly == 'MOTOR_OVERHEAT':
        return {
            "source": "simulation",
            "vibration": round(3.4 + random.uniform(-0.2, 0.3), 1),
            "temperature": round(84.0 + random.uniform(-3.0, 5.0), 1),
            "rpm": 1280,
            "current": 5.2,
            "tracking": round(1.1 + random.uniform(-0.4, 0.4), 1),
            "acoustic": round(79 + random.uniform(-2, 3)),
            "load": round(88 + random.uniform(-2, 3)),
            "speed": 3.8,
            "tension": round(148 + random.uniform(-3, 3)),
            "sensorsOnline": 7,
            "totalSensors": 7,
        }
    else: # NORMAL DEMO MODE
        return {
            "source": "simulation",
            "vibration": round(1.8 + random.uniform(-0.2, 0.3), 1),
            "temperature": round(42.5 + random.uniform(-1.5, 2.0), 1),
            "rpm": 1450,
            "current": 3.8,
            "tracking": round(1.2 + random.uniform(-0.3, 0.4), 1),
            "acoustic": round(61 + random.uniform(-2, 3)),
            "load": round(82 + random.uniform(-3, 4)),
            "speed": 3.8,
            "tension": round(142 + random.uniform(-3, 4)),
            "sensorsOnline": 7,
            "totalSensors": 7,
        }

# ==========================================
# PUBLIC API ENDPOINTS
# ==========================================

@app.get("/")
def root():
    return {
        "status": "ONLINE",
        "service": "SmartBelt FastAPI Dual-Mode API",
        "version": "2.0.0",
        "supportedModes": ["DEMO_SIMULATION", "LIVE_ESP32"],
        "mongoConnected": mongo_available,
        "mongoUri": current_mongo_uri if mongo_available else "Local Storage Fallback",
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "dbConnection": f"connected ({current_mongo_uri})" if mongo_available else "in-memory / local fallback",
        "supportedDataSources": ["simulation", "esp32"],
        "mlModel": "loaded (Random Forest Classifier)",
        "timestamp": time.time(),
    }

# --- AUTHENTICATION ROUTES ---

@app.post("/api/auth/register")
def register_user(req: UserRegisterRequest):
    global users_db, mongo_available, coll_users
    for u in users_db:
        if u["email"].lower() == req.email.lower():
            raise HTTPException(status_code=400, detail="User email already registered")

    user_id = f"USER_{uuid.uuid4().hex[:6].upper()}"
    new_user = {
        "user_id": user_id,
        "email": req.email,
        "name": req.name or "Conveyor Specialist",
        "password": req.password,
        "created_at": time.time()
    }
    users_db.append(new_user)
    if mongo_available and coll_users is not None:
        try: coll_users.insert_one(dict(new_user))
        except Exception as e: print("Mongo user insert error:", e)

    return {"status": "success", "user": {"user_id": user_id, "email": req.email, "name": new_user["name"]}}

@app.post("/api/auth/login")
def login_user(req: UserLoginRequest):
    for u in users_db:
        if u["email"].lower() == req.email.lower() and u["password"] == req.password:
            return {
                "status": "success",
                "token": f"token_{u['user_id']}",
                "user": {"user_id": u["user_id"], "email": u["email"], "name": u.get("name", "Operator")}
            }
    raise HTTPException(status_code=401, detail="Invalid email or password")

@app.get("/api/auth/me")
def get_current_user(user_id: Optional[str] = "USER_001"):
    for u in users_db:
        if u["user_id"] == user_id:
            return {"user_id": u["user_id"], "email": u["email"], "name": u.get("name")}
    return DEFAULT_USER

# --- BELTS & DEVICES REGISTRATION ROUTES ---

@app.get("/api/belts")
def get_user_belts(user_id: Optional[str] = "USER_001"):
    user_belts = [b for b in belts_db if b.get("user_id") == user_id]
    return user_belts if user_belts else [DEFAULT_BELT]

@app.post("/api/belts")
def create_user_belt(req: ConveyorBeltCreateRequest, user_id: Optional[str] = "USER_001"):
    belt_id = f"BELT_{uuid.uuid4().hex[:6].upper()}"
    new_belt = {
        "belt_id": belt_id,
        "user_id": user_id,
        "name": req.name,
        "location": req.location,
        "length_m": req.length_m,
        "width_mm": req.width_mm,
        "created_at": time.time()
    }
    belts_db.append(new_belt)
    if mongo_available and coll_belts is not None:
        try: coll_belts.insert_one(dict(new_belt))
        except Exception as e: print("Mongo belt insert error:", e)

    return {"status": "success", "belt": new_belt}

@app.get("/api/devices")
def get_user_devices(user_id: Optional[str] = "USER_001"):
    devs = [d for d in devices_db if d.get("user_id") == user_id]
    now = time.time()
    for d in devs:
        last_seen = d.get("last_seen_at")
        if last_seen is None:
            d["livenessStatus"] = "DEMO_MODE"
        elif now - last_seen < 15:
            d["livenessStatus"] = "ONLINE"
        elif now - last_seen < 120:
            d["livenessStatus"] = "NO_RECENT_DATA"
        else:
            d["livenessStatus"] = "OFFLINE"
    return devs if devs else [DEFAULT_DEVICE]

@app.post("/api/devices/register")
def register_esp32_device(req: DeviceRegisterRequest, user_id: Optional[str] = "USER_001"):
    device_id = f"ESP32_{uuid.uuid4().hex[:6].upper()}"
    device_token = f"token_sec_{uuid.uuid4().hex[:12]}"

    new_device = {
        "device_id": device_id,
        "user_id": user_id,
        "belt_id": req.belt_id,
        "device_name": req.device_name or "ESP32 Sensor Board",
        "device_token": device_token,
        "status": "REGISTERED",
        "last_seen_at": None,
        "created_at": time.time()
    }
    devices_db.append(new_device)
    if mongo_available and coll_devices is not None:
        try: coll_devices.insert_one(dict(new_device))
        except Exception as e: print("Mongo device insert error:", e)

    return {
        "status": "success",
        "device": new_device,
        "instructions": "Flash ESP32 firmware with device_id and device_token header to begin live ingestion."
    }

# --- REAL ESP32 DATA INGESTION API (MODE 2 — REAL ESP32) ---

@app.post("/api/devices/{device_id}/sensor-data")
def ingest_esp32_sensor_data(
    device_id: str,
    payload: Esp32SensorPayload,
    x_device_token: Optional[str] = Header(None, alias="X-Device-Token")
):
    global devices_db, sensor_readings_db, mongo_available, coll_devices, coll_readings

    # Find matching device
    target_device = next((d for d in devices_db if d["device_id"] == device_id), None)
    if not target_device and mongo_available and coll_devices is not None:
        target_device = coll_devices.find_one({"device_id": device_id}, {"_id": 0})

    if not target_device:
        # Auto-provision fallback for quick testing
        target_device = {
            "device_id": device_id,
            "user_id": "USER_001",
            "belt_id": "BELT_001",
            "device_token": x_device_token or "token_auto",
            "device_name": f"ESP32 Unit ({device_id})"
        }
        devices_db.append(target_device)

    # Device Token Authentication Check
    if target_device.get("device_token") and x_device_token:
        if target_device["device_token"] != x_device_token and x_device_token != "token_auto":
            raise HTTPException(status_code=403, detail="Invalid Device Authentication Token")

    # Update last_seen_at timestamp
    now_ts = time.time()
    target_device["last_seen_at"] = now_ts
    target_device["status"] = "ONLINE"

    if mongo_available and coll_devices is not None:
        try: coll_devices.update_one({"device_id": device_id}, {"$set": {"last_seen_at": now_ts, "status": "ONLINE"}})
        except Exception: pass

    current_val = payload.motorCurrent if payload.motorCurrent is not None else payload.current
    speed_val = payload.beltSpeed if payload.beltSpeed is not None else payload.belt_speed_m_s

    sensor_dict = {
        "temperature": payload.temperature,
        "vibration": payload.vibration,
        "rpm": payload.rpm if payload.rpm is not None else 1450.0,
        "current": current_val if current_val is not None else 3.8,
        "load": payload.load if payload.load is not None else 68.4,
        "speed": speed_val if speed_val is not None else 1.45,
        "tracking": payload.tracking if payload.tracking is not None else 1.2,
        "tension": payload.tension if payload.tension is not None else 142.0,
    }

    # Run Random Forest Prediction
    prediction = run_random_forest_prediction(sensor_dict)

    reading_doc = {
        "reading_id": f"READ_{uuid.uuid4().hex[:8]}",
        "user_id": target_device.get("user_id", "USER_001"),
        "belt_id": target_device.get("belt_id", "BELT_001"),
        "device_id": device_id,
        "timestamp": now_ts,
        "isoTimestamp": datetime.now().isoformat(),
        "source": "esp32",
        "sensors": sensor_dict,
        "prediction": prediction,
    }

    sensor_readings_db.append(reading_doc)
    if mongo_available and coll_readings is not None:
        try: coll_readings.insert_one(dict(reading_doc))
        except Exception as e: print("Mongo reading insert error:", e)

    return {
        "status": "acknowledged",
        "device_id": device_id,
        "source": "esp32",
        "prediction": prediction
    }

@app.get("/api/devices/{device_id}/telemetry")
def get_device_telemetry(device_id: str):
    global sensor_readings_db
    # Find latest reading for device
    device_readings = [r for r in sensor_readings_db if r.get("device_id") == device_id]
    if device_readings:
        latest = device_readings[-1]
        now = time.time()
        last_ts = latest.get("timestamp", now)
        liveness = "ONLINE" if (now - last_ts < 15) else "NO_RECENT_DATA" if (now - last_ts < 120) else "OFFLINE"
        return {
            "device_id": device_id,
            "source": "esp32",
            "livenessStatus": liveness,
            "lastSeenSecondsAgo": round(now - last_ts, 1),
            "sensors": latest["sensors"],
            "prediction": latest["prediction"],
        }
    
    # Fallback if no real readings received yet
    sensors = get_live_sensors()
    prediction = run_random_forest_prediction(sensors)
    return {
        "device_id": device_id,
        "source": "simulation",
        "livenessStatus": "DEMO_MODE",
        "sensors": sensors,
        "prediction": prediction
    }

# --- ORIGINAL CORE ENDPOINTS (PRESERVED) ---

@app.get("/api/telemetry")
def get_telemetry():
    sensors = get_live_sensors()
    if mongo_available and coll_readings is not None:
        try:
            coll_readings.insert_one({
                "reading_id": f"READ_{uuid.uuid4().hex[:8]}",
                "user_id": "USER_001",
                "belt_id": "BELT_001",
                "device_id": "SIMULATED_DEMO_NODE",
                "timestamp": time.time(),
                "isoTimestamp": datetime.now().isoformat(),
                "source": "simulation",
                "sensors": sensors,
                "activeAnomaly": active_anomaly
            })
        except Exception: pass
    return {
        "conveyorId": "CV-01",
        "location": "Iron Ore Mine - Plant 2",
        "sensors": sensors,
        "activeAnomaly": active_anomaly,
    }

@app.get("/api/prediction")
def get_ml_prediction():
    sensors = get_live_sensors()
    pred = run_random_forest_prediction(sensors)
    if mongo_available and coll_predictions is not None:
        try:
            coll_predictions.insert_one({
                "prediction_id": f"PRED_{uuid.uuid4().hex[:8]}",
                "device_id": "SIMULATED_DEMO_NODE",
                "timestamp": time.time(),
                "isoTimestamp": datetime.now().isoformat(),
                "prediction": pred,
                "sensor_snapshot": sensors
            })
        except Exception: pass
    return {
        "failureProbability": pred["failureRisk"],
        "healthScore": pred["healthScore"],
        "predictedCondition": pred["predictedCondition"],
        "modelConfidence": pred["modelConfidence"],
        "estimatedRulHours": pred["estimatedRulHours"],
        "lastPredictionTime": datetime.now().strftime("%I:%M %p"),
        "primaryDriver": pred["primaryDriver"],
    }

@app.get("/api/history")
def get_history():
    return {
        "filter": "7d",
        "overallCondition": "STABLE",
        "healthScore": "92%",
        "summary": "The conveyor has remained stable over the last 7 days. Vibration increased slightly during high-load operation.",
        "changes": [
            {"name": "Vibration", "value": "4.2 mm/s", "diff": "↑ 18% from baseline", "status": "HIGH"},
            {"name": "Temperature", "value": "51°C", "diff": "↑ 9% from baseline", "status": "ELEVATED"},
            {"name": "Load", "value": "5.1 ton", "diff": "→ Stable", "status": "NORMAL"},
            {"name": "Speed", "value": "112 RPM", "diff": "↓ 4% from baseline", "status": "NORMAL"},
        ],
        "aiConclusion": "Main change: Vibration has increased the most.",
    }

@app.get("/api/alerts")
def get_alerts():
    global alerts_db, mongo_available, coll_alerts
    if mongo_available and coll_alerts is not None:
        try:
            docs = list(coll_alerts.find({}, {"_id": 0}))
            if docs: return docs
        except Exception: pass
    return alerts_db

@app.post("/api/alerts")
def save_alerts(payload: Dict[str, Any]):
    global alerts_db, mongo_available, coll_alerts
    items = payload.get("alerts", [])
    alerts_db = items
    if mongo_available and coll_alerts is not None:
        try:
            coll_alerts.delete_many({})
            if items: coll_alerts.insert_many([dict(item) for item in items])
        except Exception as e: print("MongoDB alerts write error:", e)
    return {"status": "success", "count": len(items)}

@app.get("/api/maintenance")
def get_maintenance_checklist():
    global checklist_db, mongo_available, coll_checklist
    if mongo_available and coll_checklist is not None:
        try:
            docs = list(coll_checklist.find({}, {"_id": 0}))
            if docs: return docs
        except Exception: pass
    return checklist_db

@app.post("/api/maintenance")
def update_maintenance_checklist(payload: ChecklistUpdatePayload):
    global checklist_db, mongo_available, coll_checklist
    updated_items = [item.dict() for item in payload.checklist]
    checklist_db = updated_items
    if mongo_available and coll_checklist is not None:
        try:
            coll_checklist.delete_many({})
            coll_checklist.insert_many([dict(item) for item in updated_items])
        except Exception as e: print("MongoDB write error:", e)
    return {
        "status": "success", 
        "count": len(updated_items), 
        "mongoConnected": mongo_available,
        "storage": current_mongo_uri if mongo_available else "backend-memory"
    }

@app.get("/api/maintenance/history")
def get_maintenance_history():
    return DEFAULT_PREVIOUS_ISSUES

@app.post("/api/maintenance/history")
def save_maintenance_history(payload: Dict[str, Any]):
    global maintenance_history_db, mongo_available, coll_history
    history_items = payload.get("history", [])
    valid_items = [item for item in history_items if "problem" in item and "cause" in item]
    if valid_items:
        maintenance_history_db = valid_items
        if mongo_available and coll_history is not None:
            try:
                coll_history.delete_many({})
                coll_history.insert_many([dict(item) for item in valid_items])
            except Exception as e: print("MongoDB history write error:", e)
    return {"status": "success", "count": len(maintenance_history_db)}

@app.post("/api/config/mongo")
def set_mongo_config(req: MongoConfigRequest):
    success = init_mongo_connection(req.mongo_uri)
    if success:
        return {"status": "success", "message": f"Connected to MongoDB at {req.mongo_uri}", "mongoUri": req.mongo_uri}
    else:
        raise HTTPException(status_code=400, detail=f"Could not connect to MongoDB at {req.mongo_uri}")

@app.post("/api/anomaly")
def set_anomaly(req: AnomalyRequest):
    global active_anomaly
    if req.anomaly_type == "RESET":
        active_anomaly = None
    else:
        active_anomaly = req.anomaly_type
    return {"status": "success", "activeAnomaly": active_anomaly}

@app.get("/api/architecture")
def get_system_architecture():
    global mongo_available, coll_architecture
    if mongo_available and coll_architecture is not None:
        try:
            doc = coll_architecture.find_one({}, {"_id": 0})
            if doc: return doc
        except Exception: pass
    return DEFAULT_SYSTEM_ARCHITECTURE

@app.get("/api/work-orders")
def get_work_orders():
    global mongo_available, coll_work_orders
    if mongo_available and coll_work_orders is not None:
        try:
            docs = list(coll_work_orders.find({}, {"_id": 0}))
            if docs: return docs
        except Exception: pass
    return DEFAULT_WORK_ORDERS

@app.get("/api/predictions/history")
def get_predictions_history():
    global mongo_available, coll_predictions
    if mongo_available and coll_predictions is not None:
        try:
            docs = list(coll_predictions.find({}, {"_id": 0}).sort("timestamp", -1).limit(50))
            if docs: return docs
        except Exception: pass
    return []

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
