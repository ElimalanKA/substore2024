const fs = require('fs');
const https = require('https');
const querystring = require('querystring');

// 解析 URL 参数
function getArgumentsFromURL(url) {
  const hashIndex = url.indexOf('#');
  if (hashIndex === -1) {
    return {};
  }
  const queryString = url.substring(hashIndex + 1);
  return querystring.parse(queryString);
}

// 下载文件内容
function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to load file: ${url} - Status: ${res.statusCode}`));
      }
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// 生成配置文件
async function generateConfig(templateUrl, outputFile, args) {
  try {
    // 下载模板
    console.log('Downloading template...');
    const templateContent = await downloadFile(templateUrl);
    const template = JSON.parse(templateContent);

    // 动态修改配置
    console.log(`Modifying template for name: ${args.name}`);
    template.outbounds.forEach((outbound) => {
      if (outbound.tag === 'proxy') {
        outbound.name = args.name || '默认节点';
      }
    });

    // 保存生成的配置文件
    console.log('Saving configuration...');
    fs.writeFileSync(outputFile, JSON.stringify(template, null, 2));
    console.log(`Configuration generated: ${outputFile}`);
  } catch (error) {
    console.error('Error generating configuration:', error);
  }
}

// 主函数
(async () => {
  // GitHub URL 示例
  const scriptUrl = process.env.SCRIPT_URL || 'https://raw.githubusercontent.com/ElimalanKA/substore2024/refs/heads/main/substore-subscribe.js#name=全部节点';
  const args = getArgumentsFromURL(scriptUrl);
  const templateUrl = 'https://raw.githubusercontent.com/ElimalanKA/substore2024/refs/heads/main/substore-config-template.json';
  const outputFile = './sing-box-config.json';

  console.log(`Starting config generation for: ${args.name || '未提供名称'}`);
  await generateConfig(templateUrl, outputFile, args);
})();
