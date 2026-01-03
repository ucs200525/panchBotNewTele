from flask import Flask, jsonify, render_template
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/fetch_muhurat', methods=['GET'])
def fetch_muhurat():
    url = "https://www.drikpanchang.com/muhurat/panchaka-rahita-muhurat.html?geoname-id=1264527&date=23/11/2024"
    response = requests.get(url)
    response.raise_for_status()

    soup = BeautifulSoup(response.content, "html.parser")
    table_container = soup.find("div", class_="dpMuhurtaTable")
    rows = table_container.find_all("div", class_="dpMuhurtaRow")

    muhurat_data = []
    for row in rows:
        muhurta_name = row.find("div", class_="dpMuhurtaName").get_text(strip=True)
        muhurta_time = row.find("div", class_="dpMuhurtaTime").get_text(strip=True)
        category = muhurta_name.split(" - ")[1] if " - " in muhurta_name else ""
        name = muhurta_name.split(" - ")[0]
        muhurat_data.append({"muhurat": name, "category": category, "time": muhurta_time})

    return jsonify(muhurat_data)

if __name__ == '__main__':
    app.run(debug=True)
