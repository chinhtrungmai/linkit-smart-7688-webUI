<p align="center">
  <img src="docs/img/logo.png" height="100px" width="auto" algt="Lumi Logo"/>
</p>


## Lumi web UI

Web cấu hình cho Home Controller, sử dụng để config network, timezone, root pasword, run mode, server address, update firmware.

### Hướng dẫn build

- Tải source.

```bash
$ git clone https://github.com/hoangvhh/linkit-smart-7688-webUI
```

- Cài npm
```bash
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
```

- Install dependency, node-libs-browser
```bash
cd linkit-smart-7688-webUI
npm i
npm i node-libs-browser
```

- Chạy debug
  - Chạy trực tiếp app với npm trên máy tính, connect đến mạch HC đang chạy, không cần build thành package cài vào HC
  - Yêu cầu:
    - Có HC đang chạy trong cùng mạng LAN
    - HC có hostname là mylinkit, kiểm tra bằng cách ssh vào HC (hoặc dùng minicom) và thực hiện lệnh sau
    ```bash
    cat /etc/config/system
    ```
    option hostname phải là mylinkit
  - Lệnh chạy debug
    ```bash
    npm run watch
    ```
  - Mở chrome với option --disable-web-security
    ```bash
    google-chrome --args --user-data-dir="/tmp/chrome_dev_session" --disable-web-security
    ```
  - Truy cập trang [http://127.0.0.1:8081/app](http://127.0.0.1:8081/app)


* Build release

  Build app release với lệnh
    ```bash
    npm run start
    ```
  Sau khi build hoàn tất, output được tạo ra trong thư mục [build](app/build)

### Update web package trong firmware HC

Firmware openwrt mặc định sử dụng webpack tại https://github.com/MediaTek-Labs/linkit-smart-7688-webUI

Để chuyển sang sử dụng webpack của Lumi, thực hiện push project lên github, và link webpack khi build firmware đến git reposity mới

Hiện đang để webpack project tại https://github.com/hoangvhh/linkit-smart-7688-webUI, bao gồm 2 branch: master cho Việt Nam và india cho Ấn Độ.

- Sau khi sửa và build lại hoàn tất, push thay đổi lên git reposity.
- Sửa lại webpack source khi build firmware trong file [openwrt location]/feeds/linkit/mtk-linkit-webui/Makefile
  - PKG_SOURCE_URL link đến git reposity mới
  - PKG_SOURCE_VERSION ứng với brach, hoặc commit
    ```cmake
    PKG_SOURCE_PROTO:=git
    PKG_SOURCE_URL:=https://github.com/hoangvhh/linkit-smart-7688-webUI
    PKG_SOURCE_SUBDIR:=$(PKG_NAME)-$(PKG_VERSION)
    PKG_SOURCE_VERSION:=india
    PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION)-$(PKG_SOURCE_VERSION).tar.gz
    ```


