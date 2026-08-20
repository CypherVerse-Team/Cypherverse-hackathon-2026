import requests

BASE_URL = "http://localhost:8000"

def run_tests():
    print("Starting booking flow tests...")

    # 1. Register Worker
    worker_data = {
        "full_name": "Booking Worker",
        "mobile_number": "7777777777",
        "password": "password123",
        "account_type": "WORKER"
    }
    requests.post(f"{BASE_URL}/api/auth/register", json=worker_data)
    res = requests.post(f"{BASE_URL}/api/auth/login", json={"mobile_number": "7777777777", "password": "password123"})
    worker_token = res.json()["access_token"]
    worker_id = res.json()["user"]["user_id"]

    # Set worker availability
    requests.put(f"{BASE_URL}/api/workers/me", json={"hourly_rate": 500}, headers={"Authorization": f"Bearer {worker_token}"})

    # 2. Register Customer
    customer_data = {
        "full_name": "Test Customer",
        "mobile_number": "8888888888",
        "password": "password123",
        "account_type": "CUSTOMER"
    }
    requests.post(f"{BASE_URL}/api/auth/register", json=customer_data)
    res = requests.post(f"{BASE_URL}/api/auth/login", json={"mobile_number": "8888888888", "password": "password123"})
    customer_token = res.json()["access_token"]
    customer_headers = {"Authorization": f"Bearer {customer_token}"}
    
    print("Users registered.")

    # 3. Create Booking (Customer)
    booking_payload = {
        "worker_id": worker_id,
        "scheduled_date": "2026-10-15T10:00:00Z",
        "agreed_amount": 500,
        "service_address_id": "123 Test St, Pune"
    }
    res = requests.post(f"{BASE_URL}/api/bookings/", json=booking_payload, headers=customer_headers)
    assert res.status_code == 200, res.text
    booking_id = res.json()["booking_id"]
    print(f"Booking created: {booking_id}")

    # 4. Check Customer Bookings
    res = requests.get(f"{BASE_URL}/api/bookings/me", headers=customer_headers)
    assert res.status_code == 200, res.text
    assert len(res.json()) >= 1
    assert res.json()[0]["booking_status"] == "PENDING"
    print("Customer can see pending booking.")

    # 5. Check Worker Bookings
    worker_headers = {"Authorization": f"Bearer {worker_token}"}
    res = requests.get(f"{BASE_URL}/api/bookings/me", headers=worker_headers)
    assert res.status_code == 200, res.text
    assert len(res.json()) >= 1
    assert res.json()[0]["booking_status"] == "PENDING"
    print("Worker can see pending booking.")

    # 6. Worker Accepts Booking
    res = requests.patch(f"{BASE_URL}/api/bookings/{booking_id}/status?status=ACCEPTED", headers=worker_headers)
    assert res.status_code == 200, res.text
    assert res.json()["booking_status"] == "ACCEPTED"
    print("Worker accepted booking.")

    print("ALL TESTS PASSED")

if __name__ == "__main__":
    run_tests()
