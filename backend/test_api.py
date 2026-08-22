import requests
import time

BASE_URL = "http://localhost:8000"

def run_tests():
    print("Starting tests...")
    
    # 1. Register Customer
    print("1. Register Customer")
    res = requests.post(f"{BASE_URL}/api/auth/register", json={
        "full_name": "Test Customer",
        "mobile_number": "1234567890",
        "account_type": "CUSTOMER",
        "password": "password123"
    })
    print(res.status_code, res.text)
    assert res.status_code == 200
    customer_data = res.json()
    customer_id = customer_data["user_id"]

    # 2. Register Worker
    print("2. Register Worker")
    res = requests.post(f"{BASE_URL}/api/auth/register", json={
        "full_name": "Test Worker",
        "mobile_number": "0987654321",
        "account_type": "WORKER",
        "password": "password123"
    })
    print(res.status_code, res.text)
    assert res.status_code == 200
    worker_data = res.json()
    worker_id = worker_data["user_id"]

    # 3. Login Customer
    print("3. Login Customer")
    res = requests.post(f"{BASE_URL}/api/auth/login", json={
        "mobile_number": "1234567890",
        "password": "password123"
    })
    print(res.status_code, res.text)
    assert res.status_code == 200
    customer_token = res.json()["access_token"]

    # 4. Login Worker
    print("4. Login Worker")
    res = requests.post(f"{BASE_URL}/api/auth/login", json={
        "mobile_number": "0987654321",
        "password": "password123"
    })
    print(res.status_code, res.text)
    assert res.status_code == 200
    worker_token = res.json()["access_token"]

    # 5. Get Workers
    print("5. Get Workers")
    res = requests.get(f"{BASE_URL}/api/workers/")
    print(res.status_code, res.text)
    assert res.status_code == 200

    # 6. Update Worker Availability
    print("6. Update Worker Availability")
    res = requests.patch(f"{BASE_URL}/api/workers/{worker_id}/availability?status=AVAILABLE_NOW")
    print(res.status_code, res.text)
    assert res.status_code == 200

    # 7. Get Worker Profile
    print("7. Get Worker Profile")
    res = requests.get(f"{BASE_URL}/api/workers/{worker_id}/profile")
    print(res.status_code, res.text)
    assert res.status_code == 200
    
    # 8. Create Booking
    print("8. Create Booking")
    res = requests.post(f"{BASE_URL}/api/v1/bookings/", json={
        "worker_id": worker_id,
        "scheduled_date": "2026-08-25T10:00:00",
        "agreed_amount": 500,
        "currency": "INR",
        "service_address_id": "test_address_123"
    }, headers={"Authorization": f"Bearer {customer_token}"})
    print(res.status_code, res.text)
    assert res.status_code == 200
    booking_id = res.json()["booking_id"]

    # 9. Get Customer Bookings
    print("9. Get Customer Bookings")
    res = requests.get(f"{BASE_URL}/api/v1/bookings/me", headers={"Authorization": f"Bearer {customer_token}"})
    print(res.status_code, res.text)
    assert res.status_code == 200

    # 10. Update Booking Status
    print("10. Update Booking Status")
    res = requests.patch(f"{BASE_URL}/api/v1/bookings/{booking_id}/status?status=ACCEPTED", headers={"Authorization": f"Bearer {worker_token}"})
    print(res.status_code, res.text)
    assert res.status_code == 200

    print("ALL TESTS PASSED")

if __name__ == "__main__":
    run_tests()
