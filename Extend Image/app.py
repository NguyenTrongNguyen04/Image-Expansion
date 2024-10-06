from flask import Flask, request, jsonify, render_template
from gradio_client import Client, handle_file
import os
import tempfile
import shutil
from PIL import Image  # Thêm thư viện Pillow để chuyển đổi định dạng ảnh

app = Flask(__name__)

# Tạo thư mục lưu ảnh đã mở rộng
output_folder = os.path.join(app.root_path, 'static', 'images')
os.makedirs(output_folder, exist_ok=True)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/expand-image', methods=['POST'])
def expand_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    # Lấy file ảnh từ Front-End
    image = request.files['image']

    # Tạo một file tạm thời
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
        file_path = temp_file.name  # Đường dẫn tạm thời
        image.save(file_path)  # Lưu ảnh vào file tạm thời

    try:
        # Gọi API Gradio để mở rộng hình ảnh
        client = Client("fffiloni/diffusers-image-outpaint")
        result = client.predict(
            image=handle_file(file_path),
            width=720,
            height=720,
            overlap_percentage=10,
            num_inference_steps=8,
            resize_option="Full",
            custom_resize_percentage=50,
            prompt_input="Expand the image",
            alignment="Middle",
            overlap_left=True,
            overlap_right=True,
            overlap_top=True,
            overlap_bottom=True,
            api_name="/infer"
        )
        print("Gradio API result:", result)  # In kết quả từ API Gradio ra terminal để kiểm tra

        # Chuyển đổi định dạng ảnh từ WEBP sang PNG
        expanded_image_url_list = []
        for img_path in result:  # Giả sử result trả về là danh sách các đường dẫn
            filename = os.path.basename(img_path).replace('.webp', '.png')  # Đổi tên file thành .png
            dest_path = os.path.join(output_folder, filename)
            
            # Chuyển đổi ảnh từ WEBP sang PNG bằng Pillow
            with Image.open(img_path) as img:
                img.save(dest_path, format="PNG")
            
            expanded_image_url_list.append(f'/static/images/{filename}')  # Tạo URL để hiển thị ảnh

        # Trả về danh sách đường dẫn ảnh đã chuyển đổi sang PNG
        return jsonify({'result': expanded_image_url_list})

    except Exception as e:
        print(f"Error: {e}")  # In lỗi nếu có
        return jsonify({"error": f"Processing failed: {str(e)}"}), 500

    finally:
        # Xóa file tạm sau khi xử lý
        if os.path.exists(file_path):
            os.remove(file_path)

if __name__ == '__main__':
    app.run(debug=True)
