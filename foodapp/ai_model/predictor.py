import numpy as np
from PIL import Image

def predict_food_quantity(image_path):
    """
    Placeholder AI logic to predict quantity (servings)
    You can replace this later with TensorFlow model.
    """
    image = Image.open(image_path).resize((224, 224))
    dummy_prediction = np.random.uniform(1, 10)  # Random between 1–10 servings
    return round(dummy_prediction, 2)


def check_freshness(image_path):
    """
    Placeholder freshness logic (based on brightness)
    You can replace this with CNN-based freshness detection later.
    """
    image = Image.open(image_path).convert('RGB')
    np_img = np.array(image)
    avg_brightness = np.mean(np_img)
    freshness_score = 100 - (255 - avg_brightness) / 2.55  # scaled 0–100
    return round(freshness_score, 2)
