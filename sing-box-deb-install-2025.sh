#!/bin/bash

set -e -o pipefail

ARCH_RAW=$(uname -m)
case "${ARCH_RAW}" in
    'x86_64')    ARCH='amd64';;
    'x86' | 'i686' | 'i386')     ARCH='386';;
    'aarch64' | 'arm64') ARCH='arm64';;
    'armv7l')   ARCH='armv7';;
    's390x')    ARCH='s390x';;
    *)          echo "Unsupported architecture: ${ARCH_RAW}"; exit 1;;
esac
echo  "当前设备架构 ${ARCH_RAW}"

# 获取最新版本
LATEST_VERSION=$(curl -s "https://api.github.com/repos/SagerNet/sing-box/releases?per_page=1&page=0" \
    | grep tag_name \
    | cut -d ":" -f2 \
    | sed 's/\"//g;s/\,//g;s/\ //g;s/v//')

# 你想安装的版本
INSTALL_VERSION="1.11.0"

echo "最新版本: ${LATEST_VERSION}"
echo "你想安装的版本: ${INSTALL_VERSION}"

# 提供用户选择
read -p "是否安装版本 ${INSTALL_VERSION}？（y/n）: " choice
if [[ "$choice" == "y" || "$choice" == "Y" ]]; then
    VERSION="${INSTALL_VERSION}"
else
    echo "安装已取消"
    exit 0
fi

echo "即将安装版本: ${VERSION}"

# 下载指定版本的 .deb 包
curl -Lo sing-box.deb "https://github.com/SagerNet/sing-box/releases/download/v${VERSION}/sing-box_${VERSION}_linux_${ARCH}.deb"
echo "${VERSION} 下载完成, 开始安装"

# 安装 sing-box
sudo dpkg -i sing-box.deb

echo "安装完成, 清理安装包"

# 删除安装包
rm sing-box.deb

# 重启 sing-box 服务
systemctl daemon-reload
systemctl restart sing-box
echo "重启服务完成"
