import cv2
import numpy as np
import tensorflow as tf

CONFIDENCE_THRESHOLD = 0.5
IOU_THRESHOLD = 0.5

model = tf.lite.Interpreter(model_path="app/models/yolov5.tflite")
model.allocate_tensors()

def apply_nms(
    bboxes: list[float, float, float, float],
    confidences: list[float],
    confidence_threshold: float = 0.5,
    iou_threshold: float = 0.5
    ) -> list[int]:
    """Apply non-maximum suppression to bounding boxes."""
    indices = cv2.dnn.NMSBoxes(bboxes, confidences, confidence_threshold, iou_threshold)
    return indices.flatten().tolist() if len(indices) > 0 else []

def convert_bbox(bboxes: list[float, float, float, float], img_widht: int, img_height: int) -> list[int, int, int, int]:
    """Convert bounding box coordinates from center_x, center_y, width, height to x1, y1, x2, y2."""
    boxes = []
    for box in bboxes:
            center_x = int(box[0] * img_widht)
            center_y = int(box[1] * img_height)
            width = int(box[2] * img_height)
            height = int(box[3] * img_height)

            min_x = int(center_x - width/2)
            min_y = int(center_y - height/2)
            max_x = int(center_x + width/2)
            max_y = int(center_y + height/2)

            min_x /= img_widht
            min_y /= img_height
            max_x /= img_widht
            max_y /= img_height
            
            boxes.append([min_x, min_y, max_x, max_y])
    return boxes

def preprocess_image(image: np.ndarray, target_size: tuple[int, int] = (320, 320)):
    """Preprocess an image for object detection."""
    image_resized = cv2.resize(image, target_size)
    normalized_image = np.array([image_resized], dtype=np.float32) / 255.0
    return normalized_image
    

def run_inference(image: np.ndarray, original_image: np.ndarray) -> tuple[list, list, list]:
    """Run inference on an image."""
    input_details = model.get_input_details()
    output_details = model.get_output_details()
    img_height, img_width = original_image.shape[:2]
    
    model.set_tensor(input_details[0]['index'], image)
    model.invoke()
    
    output = model.get_tensor(output_details[0]['index'])
    
    bboxes = []
    confidences = []
    class_ids = []
    
    for detection in output[0]:
        center_x, center_y, width, height, confidence = detection[0:5]
        if confidence > CONFIDENCE_THRESHOLD:  
            bboxes.append([center_x, center_y, width, height])
            confidences.append(float(confidence))
            class_ids.append(np.argmax(detection[5:]))
    
    bboxes = convert_bbox(bboxes, img_width, img_height)
    indices = apply_nms(bboxes, confidences, CONFIDENCE_THRESHOLD, IOU_THRESHOLD)
    
    # Prepare the final results with boxes and labels
    final_bboxes = []
    final_class_ids = []
    final_confidences = []
    for i in indices:
        final_bboxes.append(bboxes[i])
        final_class_ids.append(class_ids[i])
        final_confidences.append(confidences[i])

    return final_bboxes, final_class_ids, final_confidences
