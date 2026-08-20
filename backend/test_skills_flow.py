import requests

BASE_URL = "http://localhost:8000"

def run_tests():
    print("Starting skills flow tests...")

    # 1. Fetch categories
    res = requests.get(f"{BASE_URL}/api/categories")
    assert res.status_code == 200, res.text
    categories = res.json()
    assert len(categories) > 0
    cat_id_1 = categories[0]["profession_id"]
    cat_id_2 = categories[1]["profession_id"]
    print("Categories fetched successfully.")

    # 2. Register Worker
    worker_data = {
        "full_name": "Skilled Worker",
        "mobile_number": "0000000001",
        "password": "password123",
        "account_type": "WORKER"
    }
    res = requests.post(f"{BASE_URL}/api/auth/register", json=worker_data)
    
    # 3. Login Worker
    res = requests.post(f"{BASE_URL}/api/auth/login", json={"mobile_number": "0000000001", "password": "password123"})
    assert res.status_code == 200, res.text
    worker_token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {worker_token}"}
    
    # 4. Update Profile
    profile_data = {
        "home_city": "Pune",
        "hourly_rate": 600
    }
    res = requests.put(f"{BASE_URL}/api/workers/me", json=profile_data, headers=headers)
    assert res.status_code == 200, res.text
    
    # 4b. Update Availability
    worker_id = res.json()["user_id"]
    res = requests.patch(f"{BASE_URL}/api/workers/{worker_id}/availability?status=AVAILABLE_NOW", headers=headers)
    assert res.status_code == 200, res.text

    # 5. Assign Skills
    skills_payload = [
        {"profession_id": cat_id_1, "is_primary_skill": True},
        {"profession_id": cat_id_2, "is_primary_skill": False}
    ]
    res = requests.put(f"{BASE_URL}/api/workers/me/skills", json=skills_payload, headers=headers)
    assert res.status_code == 200, res.text
    print("Worker skills updated.")

    # 6. Verify Skills on Profile Fetch
    res = requests.get(f"{BASE_URL}/api/workers/me", headers=headers)
    assert res.status_code == 200, res.text
    me_data = res.json()
    assert len(me_data["worker_profile"]["skills"]) == 2
    print("Worker profile has correct skills.")

    # 7. Test Customer Search (Filter by Category)
    res = requests.get(f"{BASE_URL}/api/workers?category_id={cat_id_1}")
    assert res.status_code == 200, res.text
    workers = res.json()
    found = any(w["user_id"] == me_data["user_id"] for w in workers)
    assert found, "Worker not found in category search"
    print("Customer search by category works.")
    
    # 8. Test Search by Availability & City
    res = requests.get(f"{BASE_URL}/api/workers?city=Pune&availability=AVAILABLE_NOW")
    assert res.status_code == 200, res.text
    workers = res.json()
    found = any(w["user_id"] == me_data["user_id"] for w in workers)
    assert found, "Worker not found in city/availability search"
    print("Customer search by city and availability works.")

    print("ALL TESTS PASSED")

if __name__ == "__main__":
    run_tests()
