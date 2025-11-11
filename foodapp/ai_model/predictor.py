import tensorflow as tf
import numpy as np
from PIL import Image

def predict_food_quantity(image_path):
    # Placeholder ML model logic (later replace with real CNN)
    image = Image.open(image_path).resize((224, 224))
    dummy_prediction = np.random.uniform(1, 10)  # simulate servings
    return round(dummy_prediction, 2)

def check_freshness(image_path):
    # Placeholder freshness model (can later use color analysis)
    image = Image.open(image_path).convert('RGB')
    np_img = np.array(image)
    avg_brightness = np.mean(np_img)
    freshness_score = 100 - (255 - avg_brightness) / 2.55
    return round(freshness_score, 2)
