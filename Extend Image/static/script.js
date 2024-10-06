const selectImage = document.querySelector('.select-image');  // Nút chọn hoặc mở rộng hình ảnh
const inputFile = document.querySelector('#file');  // Input file để người dùng chọn hình ảnh
const imgArea = document.querySelector('.img-area');  // Khu vực hiển thị hình ảnh hoặc kết quả
const actionButtons = document.getElementById('action-buttons');  // Khu vực chứa các nút "Xem" và "Tải"
let imageUploaded = false;  // Cờ để kiểm tra xem người dùng đã tải ảnh lên chưa

selectImage.addEventListener('click', function () {
    if (!imageUploaded) {  // Nếu chưa có ảnh nào được tải lên
        inputFile.click();  // Mở cửa sổ để chọn ảnh
    } else {
        const image = inputFile.files[0];  // Lấy file ảnh đã chọn từ input
        const formData = new FormData();
        formData.append('image', image);  // Thêm file ảnh vào FormData

        selectImage.textContent = "Đang xử lý...";  // Hiển thị cho người dùng rằng hệ thống đang xử lý hình ảnh

        fetch('/expand-image', {
            method: 'POST',
            body: formData  // Gửi FormData chứa file ảnh
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Server response wasn't OK");
            }
            return response.json();  // Chuyển phản hồi thành JSON
        })
        .then(data => {
            if (data.result) {
                const imgUrl = data.result[0];  // Lấy đường dẫn của ảnh mở rộng

                // Hiển thị các nút "Xem hình ảnh" và "Tải hình ảnh"
                actionButtons.style.display = 'block';

                // Nút "Xem hình ảnh"
                document.getElementById('view-image').addEventListener('click', function () {
                    const expandedImg = document.createElement('img');
                    expandedImg.src = imgUrl;  // Đường dẫn tới ảnh mở rộng (PNG)
                    expandedImg.style.maxWidth = "100%";  // Đảm bảo ảnh hiển thị đầy đủ
                    expandedImg.style.height = "auto";  // Giữ tỉ lệ ảnh
                    imgArea.innerHTML = '';  // Xóa nội dung cũ
                    imgArea.appendChild(expandedImg);  // Thêm ảnh vào khu vực hiển thị
                });

                // Nút "Tải hình ảnh"
                document.getElementById('download-image').addEventListener('click', function () {
                    const a = document.createElement('a');
                    a.href = imgUrl;  // Đường dẫn tới ảnh PNG đã chuyển đổi
                    a.download = imgUrl.split('/').pop();  // Thiết lập tên tệp để tải về
                    a.click();  // Giả lập nhấn chuột vào liên kết
                });

                selectImage.textContent = "Mở rộng thành công!";
            } else {
                console.error("Error:", data.error);
                selectImage.textContent = "Xử lý thất bại!";
            }
        })
        .catch(error => {
            console.error('Error:', error);
            selectImage.textContent = "Xử lý thất bại!";
        });
    }
});

inputFile.addEventListener('change', function () {
    const image = this.files[0];
    if (image.size < 2000000) {
        const reader = new FileReader();
        reader.onload = () => {
            const allImg = imgArea.querySelectorAll('img');
            allImg.forEach(item => item.remove());  // Xóa ảnh cũ đi

            const imgUrl = reader.result;
            const img = document.createElement('img');
            img.src = imgUrl;  // Hiển thị ảnh mới đã chọn
            imgArea.appendChild(img);
            imgArea.classList.add('active');
            imgArea.dataset.img = image.name;

            selectImage.textContent = "Mở rộng Hình Ảnh";  // Đổi nút từ "Chọn Hình ảnh" sang "Mở rộng Hình Ảnh"
            imageUploaded = true;  // Cập nhật trạng thái cho biết đã có ảnh được tải lên
        };
        reader.readAsDataURL(image);  // Đọc file ảnh dưới dạng URL để hiển thị
    } else {
        alert("Kích thước ảnh lớn hơn 2MB");  // Báo lỗi nếu ảnh quá lớn
    }
});
