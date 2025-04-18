import requests
import sys

def test_health_endpoint():
    """Test that the health endpoint is working"""
    try:
        response = requests.get("http://localhost:5001/api/health")
        if response.status_code == 200:
            print("✅ Health check successful")
            return True
        else:
            print(f"❌ Health check failed with status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - Flask server may not be running")
        return False

def test_verification_endpoint():
    """Test the verification endpoint with a simple file upload"""
    try:
        # Create a simple test file
        with open("test_license.txt", "w") as f:
            f.write("This is a test license file.")
        
        # Create form data
        data = {
            "name": "Test Doctor",
            "email": "test@example.com",
            "specialization": "Test Specialty",
            "phone": "1234567890"
        }
        
        # Create files
        files = {
            "license": ("test_license.txt", open("test_license.txt", "rb"), "text/plain"),
            "degree": ("test_license.txt", open("test_license.txt", "rb"), "text/plain"),
            "profile_photo": ("test_license.txt", open("test_license.txt", "rb"), "text/plain")
        }
        
        # Send request
        response = requests.post("http://localhost:5001/api/verify-doctor", data=data, files=files)
        
        # Close file handles
        for f in files.values():
            f[1].close()
        
        if response.status_code == 200:
            print("✅ Verification endpoint test successful")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"❌ Verification endpoint test failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - Flask server may not be running")
        return False
    except Exception as e:
        print(f"❌ Error testing verification endpoint: {str(e)}")
        return False

if __name__ == "__main__":
    print("Testing Flask verification service...")
    health_check = test_health_endpoint()
    
    if health_check:
        verification_test = test_verification_endpoint()
        
        if health_check and verification_test:
            print("\n✅ All tests passed! Flask service is running correctly.")
            sys.exit(0)
        else:
            print("\n❌ Some tests failed. Check the logs above for details.")
            sys.exit(1)
    else:
        print("\n❌ Health check failed. Make sure the Flask service is running.")
        sys.exit(1)