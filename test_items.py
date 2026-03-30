import requests

def test_items():
    try:
        response = requests.get("http://localhost:5555/items")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            items = response.json()
            print(f"Number of items: {len(items)}")
            if len(items) > 0:
                print("First item:", items[0])
            else:
                print("No items found.")
        else:
            print("Error:", response.text)
    except Exception as e:
        print("Error:", str(e))

if __name__ == "__main__":
    test_items()
