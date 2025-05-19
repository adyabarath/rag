from flask import Flask
from flask_pymongo import PyMongo
import os

app = Flask(__name__)
app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/navy")
mongo = PyMongo(app)

@app.route("/check-db")
def check_db_connection():
    try:
        # Attempt to fetch collection names
        collections = mongo.db.list_collection_names()
        return f"✅ MongoDB connected successfully! Collections: {collections}"
    except Exception as e:
        return f"❌ Failed to connect to MongoDB: {str(e)}"

if __name__ == "__main__":
    app.run(debug=True)
