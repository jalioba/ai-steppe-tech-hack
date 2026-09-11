import requests

BASE_URL = 'http://127.0.0.1:8000/api'

def test_endpoints():
    print("Testing Registration...")
    reg_data = {
        'username': 'almas_lead',
        'email': 'almas@steppe.kz',
        'password': 'SecurePassword2026',
        'fullName': 'Алмас Касымов (Руководитель)'
    }
    r = requests.post(f"{BASE_URL}/auth/register/", json=reg_data)
    print(f"Register status: {r.status_code}")
    print(f"Register response: {r.json()}")
    assert r.status_code == 201, "Registration failed"

    print("\nTesting Login...")
    login_data = {
        'username': 'almas_lead',
        'password': 'SecurePassword2026'
    }
    r = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
    print(f"Login status: {r.status_code}")
    print(f"Login response: {r.json()}")
    assert r.status_code == 200, "Login failed"

    print("\nTesting Action Items Creation...")
    task_data = {
        'title': 'Проверить интеграцию WhisperX с аудиопотоком',
        'assignee': 'Алмас Касымов',
        'deadline': '2026-09-18',
        'priority': 'high',
        'status': 'pending'
    }
    r = requests.post(f"{BASE_URL}/action-items/", json=task_data)
    print(f"Action item create status: {r.status_code}")
    print(f"Action item response: {r.json()}")
    assert r.status_code == 201, "Action item creation failed"

    print("\nTesting Meetings GET...")
    r = requests.get(f"{BASE_URL}/meetings/")
    print(f"Meetings GET status: {r.status_code}")
    print(f"Meetings count: {len(r.json())}")

    print("\nTesting Action Items GET...")
    r = requests.get(f"{BASE_URL}/action-items/")
    print(f"Action Items count: {len(r.json())}")

    print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY!")

if __name__ == '__main__':
    test_endpoints()
