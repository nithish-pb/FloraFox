import tensorflow as tf

try:
    model = tf.keras.models.load_model("user/ai/model")
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ Model load error: {e}")
