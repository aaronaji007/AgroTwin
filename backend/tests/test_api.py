import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.services.digital_twin_engine import DigitalTwinEngine

class TestAgroTwinAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_root_and_health(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "OPERATIONAL")

        health_res = self.client.get("/api/health")
        self.assertEqual(health_res.status_code, 200)
        self.assertEqual(health_res.json()["status"], "HEALTHY")

    def test_list_bins(self):
        res = self.client.get("/api/bins")
        self.assertEqual(res.status_code, 200)
        bins = res.json()
        self.assertGreaterEqual(len(bins), 5)
        
        bin_names = [b["name"] for b in bins]
        self.assertIn("Cold Room Alpha", bin_names)
        self.assertIn("Ripening Chamber Beta", bin_names)

    def test_get_single_bin(self):
        res = self.client.get("/api/bins/BIN-01")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["id"], "BIN-01")
        self.assertEqual(data["produce_name"], "Honeycrisp Apples")
        self.assertIn("telemetry", data)
        self.assertIn("thresholds", data)

    def test_bin_history(self):
        res = self.client.get("/api/bins/BIN-01/history?range=24h")
        self.assertEqual(res.status_code, 200)
        history = res.json()
        self.assertIsInstance(history, list)
        self.assertGreater(len(history), 0)
        first_pt = history[0]
        self.assertIn("temperature", first_pt)
        self.assertIn("humidity", first_pt)
        self.assertIn("ethylene_ppm", first_pt)
        self.assertIn("sli", first_pt)

    def test_list_batches(self):
        res = self.client.get("/api/batches")
        self.assertEqual(res.status_code, 200)
        batches = res.json()
        self.assertGreaterEqual(len(batches), 5)
        self.assertEqual(batches[0]["commodity"], "Honeycrisp Apples")

    def test_telemetry_ingestion(self):
        payload = {
            "bin_id": "BIN-01",
            "temperature": 2.1,
            "humidity": 91.5,
            "ethylene_ppm": 0.09,
            "co2_ppm": 520.0
        }
        res = self.client.post("/api/telemetry", json=payload)
        self.assertEqual(res.status_code, 200)
        updated = res.json()
        self.assertEqual(updated["id"], "BIN-01")
        self.assertAlmostEqual(updated["telemetry"]["temperature"], 2.1, places=1)
        self.assertAlmostEqual(updated["telemetry"]["humidity"], 91.5, places=1)

    def test_update_thresholds(self):
        new_th = {
            "min_temp": 1.0,
            "max_temp": 4.0,
            "min_humidity": 85.0,
            "max_humidity": 95.0,
            "max_ethylene": 0.20
        }
        res = self.client.put("/api/bins/BIN-01/thresholds", json=new_th)
        self.assertEqual(res.status_code, 200)
        bin_data = res.json()
        self.assertEqual(bin_data["thresholds"]["min_temp"], 1.0)
        self.assertEqual(bin_data["thresholds"]["max_ethylene"], 0.20)

    def test_simulate_event(self):
        res = self.client.post("/api/bins/BIN-02/simulate-event", json={"event_type": "DOOR_OPEN"})
        self.assertEqual(res.status_code, 200)
        bin_data = res.json()
        # Verify alert was raised
        alerts_res = self.client.get("/api/alerts")
        alerts = alerts_res.json()
        self.assertTrue(any("door" in a["message"].lower() or "seal" in a["message"].lower() for a in alerts))

    def test_sli_digital_twin_simulation(self):
        req = {
            "commodity": "Honeycrisp Apples",
            "initial_sli": 95.0,
            "temperature": 5.0, # warmer than optimal
            "humidity": 80.0,    # drier than optimal
            "ethylene_ppm": 0.35, # elevated ethylene
            "projection_days": 14,
            "batch_value_usd": 30000.0
        }
        res = self.client.post("/api/simulate/sli", json=req)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("trajectory", data)
        self.assertEqual(len(data["trajectory"]), 15) # Day 0 to 14
        self.assertLess(data["shelf_life_delta_days"], 0) # decay was accelerated
        self.assertLess(data["estimated_economic_impact_usd"], 0)

    def test_alerts_and_acknowledgment(self):
        res = self.client.get("/api/alerts")
        self.assertEqual(res.status_code, 200)
        alerts = res.json()
        self.assertGreater(len(alerts), 0)
        
        target_alert = alerts[0]
        ack_res = self.client.post(f"/api/alerts/{target_alert['id']}/acknowledge")
        self.assertEqual(ack_res.status_code, 200)
        self.assertTrue(ack_res.json()["acknowledged"])

    def test_system_summary(self):
        res = self.client.get("/api/summary")
        self.assertEqual(res.status_code, 200)
        summary = res.json()
        self.assertIn("total_bins", summary)
        self.assertIn("active_bins", summary)
        self.assertIn("avg_temperature", summary)
        self.assertIn("avg_sli", summary)
        self.assertIn("total_inventory_value_usd", summary)

if __name__ == "__main__":
    unittest.main()
