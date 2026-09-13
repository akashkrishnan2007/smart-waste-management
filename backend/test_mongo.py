"""Test MongoDB connection with different TLS configurations."""
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
mongo_uri = os.getenv("MONGO_URI")

print(f"Testing MongoDB connection...")
print(f"URI: {mongo_uri}")

# Test with different TLS configurations
test_configs = [
    {
        "name": "Default (from URI)",
        "params": {}
    },
    {
        "name": "tlsAllowInvalidCertificates=True",
        "params": {"tlsAllowInvalidCertificates": True}
    },
    {
        "name": "tlsInsecure=True",
        "params": {"tlsInsecure": True}
    },
    {
        "name": "tls=True, tlsAllowInvalidCertificates=True",
        "params": {"tls": True, "tlsAllowInvalidCertificates": True}
    },
]

for config in test_configs:
    print(f"\n{'='*60}")
    print(f"Testing: {config['name']}")
    print(f"{'='*60}")
    try:
        client = MongoClient(
            mongo_uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=10000,
            **config['params']
        )
        client.admin.command('ping')
        print(f"SUCCESS with {config['name']}")
        client.close()
        break
    except Exception as e:
        print(f"FAILED: {e}")
else:
    print("\n" + "="*60)
    print("All connection attempts failed.")
    print("="*60)
    print("\nPossible solutions:")
    print("1. Check MongoDB Atlas IP whitelist")
    print("2. Verify username/password in .env")
    print("3. Check if cluster is active in MongoDB Atlas")
    print("4. Try upgrading pymongo: pip install --upgrade pymongo")
    print("5. Check network/firewall settings")