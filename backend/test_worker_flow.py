import requests
import json
import time

BASE_URL = "http://localhost:8000"

def run_tests():
    print("Starting worker flow tests...")

    # 1. Register Worker
    worker_data = {
        "full_name": "Test Worker",
        "mobile_number": "0987654321",
        "password": "password123",
        "account_type": "WORKER"
    }
    res = requests.post(f"{BASE_URL}/api/auth/register", json=worker_data)
    assert res.status_code == 200, res.text
    worker_id = res.json()["user_id"]
    print("Worker registered.")

    # 2. Login Worker
    res = requests.post(f"{BASE_URL}/api/auth/login", json={"mobile_number": "0987654321", "password": "password123"})
    assert res.status_code == 200, res.text
    worker_token = res.json()["access_token"]
    print("Worker logged in.")

    # 3. Update Worker Profile
    profile_data = {
        "home_city": "Mumbai",
        "age": 30,
        "years_of_experience": 5,
        "hourly_rate": 500,
        "short_description": "Expert plumber"
    }
    headers = {"Authorization": f"Bearer {worker_token}"}
    res = requests.put(f"{BASE_URL}/api/workers/me", json=profile_data, headers=headers)
    assert res.status_code == 200, res.text
    print("Worker profile updated.")

    # 4. Submit Verification
    files = {
        "file": ("test_doc.png", b"fake file content", "image/png")
    }
    data = {
        "document_type": "AADHAAR"
    }
    res = requests.post(f"{BASE_URL}/api/v1/verification/upload", data=data, files=files, headers=headers)
    assert res.status_code == 200, res.text
    request_id = res.json()["request_id"]
    print("Verification submitted.")

    # 5. Register Admin
    admin_data = {
        "full_name": "Admin User",
        "mobile_number": "1111111111",
        "password": "admin",
        "account_type": "ADMIN"
    }
    res = requests.post(f"{BASE_URL}/api/auth/register", json=admin_data)
    
    # 6. Login Admin
    res = requests.post(f"{BASE_URL}/api/auth/login", json={"mobile_number": "1111111111", "password": "admin"})
    admin_token = res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 7. Get Pending Verifications
    res = requests.get(f"{BASE_URL}/api/v1/admin/verification/queue", headers=admin_headers)
    assert res.status_code == 200, res.text
    verifications = res.json()
    assert len(verifications) > 0
    print("Admin fetched verifications.")

    # 8. Reject Verification
    res = requests.patch(f"{BASE_URL}/api/v1/admin/verification/{request_id}/review?status=REJECTED&reason=Blurry+Document", headers=admin_headers)
    assert res.status_code == 200, res.text
    print("Admin rejected verification.")

    # 9. Check Worker Status
    res = requests.get(f"{BASE_URL}/api/workers/me", headers=headers)
    assert res.json()["verification_status"] == "REJECTED"
    print("Worker status is REJECTED.")

    print("ALL TESTS PASSED")

if __name__ == "__main__":
    run_tests()
