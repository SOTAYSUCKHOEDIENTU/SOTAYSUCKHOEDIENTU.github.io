// 1. CẤU HÌNH KẾT NỐI ĐÁM MÂY SUPABASE
const SUPABASE_URL = "https://dimfsbnaopsipujmivhs.supabase.co";
// Bạn hãy xóa chữ tiếng Việt bên dưới và dán mã sb_publishable_SpJ... bạn vừa copy ở Bước 1 vào giữa hai dấu nháy:
const SUPABASE_KEY = "sb_publishable_SpJ-bY2WXZpInsMN7xeAfQ__jWxSn_y"; 

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
let myModal;

// Tự động chạy ngay khi thiết bị tải xong trang web
document.addEventListener("DOMContentLoaded", () => {
    const modalEl = document.querySelector('.modal');
    if (modalEl) myModal = new bootstrap.Modal(modalEl);
    
    fetchData(); // Lấy dữ liệu từ Supabase về hiển thị
    
    const formEl = document.querySelector('form');
    if (formEl) {
        formEl.addEventListener('submit', handleFormSubmit);
    }
});

// 2. LỆNH ĐỌC DỮ LIỆU TỪ SUPABASE ĐỔ VÀO BẢNG
async function fetchData() {
    const { data, error } = await _supabase.from('doi_tuong').select('*');
    if (error) {
        console.error("Lỗi kết nối database Supabase:", error.message);
        return;
    }
    renderTable(data);
    updateStats(data);
}

// Hàm vẽ bảng danh sách (Khớp 100% giao diện hiển thị trên điện thoại của bạn)
function renderTable(data) {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;
    tbody.innerHTML = "";
    
    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted py-4">Không tìm thấy đối tượng phù hợp / Database trống</td></tr>`;
        return;
    }

    data.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td><img src="${item.anh || 'https://placeholder.com'}" style="width:50px;height:50px;object-fit:cover;border-radius:5px;" alt="Ảnh"></td>
                <td class="fw-bold">${item.ho_va_ten || ''}</td>
                <td>${item.nam_sinh || ''}</td>
                <td>${item.gioi_tinh || ''}</td>
                <td>${item.ngay_nhap || ''}</td>
                <td><span class="badge bg-info text-dark">${item.dang_o || ''}</span></td>
                <td><span class="badge bg-success">${item.trang_thai || ''}</span></td>
                <td>${item.thuoc_theo_doi || 'Không có'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-warning me-1" onclick="openEditModal(${JSON.stringify(item).replace(/"/g, '&quot;')})"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteData('${item.id}')"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

// Cập nhật số liệu thống kê
function updateStats(data) {
    const txtTong = document.getElementById('stat-tong') || document.querySelector('[id*="tong"]');
    if (txtTong) txtTong.innerText = data.length;
}
// 3. LỆNH TỰ DÒ Ô NHẬP LIỆU VÀ LƯU LÊN SUPABASE KHI BẤM NÚT
async function handleFormSubmit(e) {
    e.preventDefault();

    const findValue = (keywords) => {
        for (let kw of keywords) {
            let el = document.querySelector(`[id*="${kw}" i]`) || document.querySelector(`[name*="${kw}" i]`);
            if (el) return el.value;
        }
        return '';
    };

    const id = document.getElementById('editId')?.value || document.querySelector('[type="hidden"]')?.value;

    const payload = {
        ho_va_ten: findValue(['ten', 'name', 'ho_ten']),
        nam_sinh: findValue(['sinh', 'nam', 'year']),
        gioi_tinh: findValue(['tinh', 'sex', 'gender']),
        ngay_nhap: findValue(['nhap', 'date', 'ngay']),
        dang_o: findValue(['o', 'khu', 'room', 'vi_tri']),
        trang_thai: findValue(['thai', 'status', 'suc_khoe']),
        thuoc_theo_doi: findValue(['thuoc', 'medicine']),
        anh: findValue(['anh', 'img', 'url', 'avatar']) || null
    };

    let resultError = null;
    if (id) {
        const { error } = await _supabase.from('doi_tuong').update(payload).eq('id', id);
        resultError = error;
    } else {
        const { error } = await _supabase.from('doi_tuong').insert([payload]);
        resultError = error;
    }

    if (resultError) {
        alert("Lỗi không thể lưu lên đám mây: " + resultError.message);
    } else {
        alert("🎉 Tuyệt vời! Đã lưu dữ liệu lên Supabase thành công vĩnh viễn!");
        if (myModal) myModal.hide();
        fetchData();
    }
}

// Lệnh xóa hồ sơ
async function deleteData(id) {
    if (confirm("Bạn có chắc chắn muốn xóa hồ sơ đối tượng này?")) {
        const { error } = await _supabase.from('doi_tuong').delete().eq('id', id);
        if (error) alert("Lỗi xóa: " + error.message);
        else fetchData();
    }
}

function openEditModal(item) {
    let hiddenId = document.getElementById('editId') || document.querySelector('[type="hidden"]');
    if (hiddenId) hiddenId.value = item.id;
    if (myModal) myModal.show();
}
