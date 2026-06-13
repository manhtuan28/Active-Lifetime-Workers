# 🚀 MAS All-in-One Activation Tool

> **Microsoft Activation Scripts v3.11** + **IDM Activation** + **WinRAR Activation** — Tất cả trong một script duy nhất.

Bản tùy chỉnh của [Microsoft Activation Scripts (MAS)](https://massgrave.dev) với giao diện tiếng Việt không dấu, tích hợp thêm kích hoạt IDM và WinRAR bản quyền vĩnh viễn.

---

## ⚡ Cài đặt nhanh

Mở **PowerShell (Admin)** và chạy:

```powershell
irm https://get.tuancute.com | iex
```

Script sẽ tự động tải, hiển thị giao diện loading và khởi chạy menu với quyền Administrator.

---

## 📋 Menu chính

```
         Phuong thuc kich hoat:

             [1] HWID                - Windows
             [2] Ohook               - Office
             [3] TSforge             - Windows / Office / ESU
             [4] Online KMS          - Windows / Office
             __________________________________________________

             [5] Kiem tra trang thai kich hoat
             [6] Doi phien ban Windows
             [7] Doi phien ban Office
             __________________________________________________

             [8] Active IDM Lifetime
             [9] Active WinRAR Lifetime
             __________________________________________________

             [T] Xu ly su co
             [E] Bo sung
             [H] Tro giup
             [0] Thoat
```

---

## 🔑 Phương thức kích hoạt

### Windows & Office

| Phương thức | Hỗ trợ | Thời hạn | Ghi chú |
|---|---|---|---|
| **HWID** | Windows 10/11 | Vĩnh viễn | Digital License gắn với phần cứng |
| **Ohook** | Office 2016–2024, M365 | Vĩnh viễn | Hook hàm kiểm tra license, offline |
| **TSforge** | Windows 7+, Office 2010+, ESU | Vĩnh viễn | Mạnh nhất, ghi trực tiếp vào hệ thống |
| **Online KMS** | Windows 8+, Office 2010+ | 180 ngày | Tự gia hạn, cần Internet |

### IDM Activation `[8]`

Kích hoạt **Internet Download Manager** bản quyền vĩnh viễn:
- Tự động tải tài nguyên kích hoạt từ `software.tuancute.com`
- Phát hiện đường dẫn cài đặt IDM từ registry
- Cập nhật file thực thi + đăng ký license
- Tùy chỉnh tên đăng ký (mặc định: Coporton WorkStation)

### WinRAR Activation `[9]`

Tải, cài đặt và kích hoạt **WinRAR** bản quyền vĩnh viễn:

| Tùy chọn | Mô tả |
|---|---|
| **[1]** Tai va cai dat | Tự detect phiên bản mới nhất từ rarlab.com, tải & cài silent |
| **[2]** Kich hoat ban quyen | Ghi `rarreg.key` (Everyone - General Public License) |
| **[3]** Tu dong | All-in-one: tải + cài + kích hoạt |
| **[4]** Go ban quyen | Xóa `rarreg.key`, trở về trial 40 ngày |
| **[5]** Go cai dat | Gỡ cài đặt hoàn toàn |

Tính năng:
- Tự động detect phiên bản WinRAR đã cài (x64/x32)
- Hiển thị trạng thái bản quyền hiện tại
- Tải từ server chính (rarlab.com) với fallback sang mirror (win-rar.com)
- Cài đặt im lặng (silent install)

---

## 🛠 Công cụ tích hợp

| Phím | Công cụ | Mô tả |
|---|---|---|
| `[5]` | Kiểm tra trạng thái | Xem chi tiết kích hoạt Windows & Office |
| `[6]` | Đổi phiên bản Windows | Chuyển đổi Home ↔ Pro ↔ Enterprise... |
| `[7]` | Đổi phiên bản Office | Chuyển đổi phiên bản Microsoft Office |
| `[T]` | Khắc phục sự cố | Sửa lỗi kích hoạt, DISM, SFC |
| `[E]` | Extras | Xuất $OEM$ folder, tải Windows/Office chính hãng |

---

## ⌨️ Tham số dòng lệnh

Chạy trực tiếp không cần menu (chế độ tự động):

```
/HWID                 - Kích hoạt Windows bằng HWID
/Ohook                - Kích hoạt Office bằng Ohook
/Z-Windows            - TSforge: Kích hoạt Windows
/Z-Office             - TSforge: Kích hoạt Office
/Z-ESU                - TSforge: Kích hoạt ESU
/Z-WindowsESUOffice   - TSforge: Tất cả
/K-Windows            - KMS: Kích hoạt Windows
/K-Office             - KMS: Kích hoạt Office
/K-WindowsOffice      - KMS: Kích hoạt cả hai
```

---

## 📁 Cấu trúc dự án

```
├── MAS_AIO.cmd          # Script chính (19K+ dòng) - Batch/CMD
├── MAS_worker.js        # Cloudflare Worker cho get.tuancute.com
```

---

## 🌐 Hạ tầng Cloudflare Workers

### `get.tuancute.com` → MAS_worker.js

| Request | Response |
|---|---|
| `irm get.tuancute.com \| iex` | PowerShell loader → tải MAS_AIO.cmd → chạy với Admin |
| `GET /cmd` | Proxy MAS_AIO.cmd từ `software.tuancute.com` (UTF-8, CRLF) |
| Trình duyệt | Trang HTML hướng dẫn đầy đủ bằng tiếng Việt |

### `idm.tuancute.com` → cloudflarework.bat

| Request | Response |
|---|---|
| `irm idm.tuancute.com \| iex` | PowerShell loader → tải batch → chạy với Admin |
| `GET /batch` | IDM activation batch script |
| Trình duyệt | Trang HTML hướng dẫn IDM |

---

## 💻 Yêu cầu hệ thống

- **OS:** Windows 7 / 8 / 8.1 / 10 / 11 / Server 2008 R2+
- **Office:** Office 2010 / 2013 / 2016 / 2019 / 2021 / 2024 / M365
- **PowerShell:** 3.0+ (có sẵn từ Windows 8+)
- **Quyền:** Administrator
- **Kết nối:** Cần Internet để tải script (một số phương thức hoạt động offline sau đó)

---

## 🇻🇳 Việt hóa

Toàn bộ giao diện MAS_AIO.cmd đã được Việt hóa bằng tiếng Việt không dấu:
- Menu chính, menu phụ
- Thông báo lỗi, cảnh báo, thành công
- Hướng dẫn, mô tả tính năng
- Prompt nhập liệu

> **Không dịch:** Tên lệnh, biến, registry paths, URLs, tên kỹ thuật (HWID, Ohook, TSforge, KMS, ClipSVC, SPP...), tên file, thương hiệu.

---

## 📝 Ghi chú

- MAS_AIO.cmd dựa trên [Microsoft Activation Scripts v3.11](https://massgrave.dev) by massgrave.dev
- WinRAR activation sử dụng key `Everyone - General Public License` (tương tự [oneclickwinrar](https://github.com/neuralpain/oneclickwinrar))
- IDM activation bằng phương pháp patch file + registry
- File encoding: UTF-8 no BOM, CRLF line endings (bắt buộc cho CMD label resolution)

---

## ⚠️ Disclaimer

Công cụ này chỉ dành cho mục đích học tập và nghiên cứu. Nếu thấy hữu ích, hãy ủng hộ các nhà phát triển bằng cách mua bản quyền chính thức:
- Windows & Office: [microsoft.com](https://www.microsoft.com)
- IDM: [internetdownloadmanager.com](https://www.internetdownloadmanager.com)
- WinRAR: [win-rar.com](https://www.win-rar.com)

---

<p align="center">
  <b>Tuancute28</b> &bull; <a href="https://tuancute.com">tuancute.com</a> &bull; <a href="https://get.tuancute.com">get.tuancute.com</a> &bull; <a href="https://idm.tuancute.com">idm.tuancute.com</a>
</p>
