const { type, name } = $arguments;
const compatible_outbound = {
  tag: 'COMPATIBLE',
  type: 'block',
};

let compatible;
let config = JSON.parse($files[0]);
let proxies = await produceArtifact({
  name,
  type: /^1$|col/i.test(type) ? 'collection' : 'subscription',
  platform: 'sing-box',
  produceType: 'internal',
});

// console.log(config.outbounds);

config.outbounds.map(i => {
  if ("outbounds" in i &&
      i.outbounds.includes("{all}")
      ) {
    const allValues = ["jp", "tw", "sg", "us", "dual-stack"]; // 模拟所有节点
    i.outbounds = i.outbounds.filter(item => item != "{all}" );
    i.outbounds.push(...allValues); // 替换 {all} 为具体的节点
    
    const p = getTags(proxies, i.filter[0].keywords[0]);
    if (i.filter[0].action == "include") {
      i.outbounds.push(...p);
    } else if (i.filter[0].action == "exclude") {
      i.outbounds.push(...(getTags(proxies).filter(item => !p.includes(item))));
    }
    delete i.filter;
  } else if ("outbounds" in i && i.outbounds.includes("{all}") && !("filter" in i)) {
    i.outbounds = i.outbounds.filter(item => item != "{all}");
    i.outbounds.push(...getTags(proxies));
  }
});

config.outbounds.push(...proxies);

config.outbounds.forEach(outbound => {
  if (Array.isArray(outbound.outbounds) && outbound.outbounds.length === 0) {
    if (!compatible) {
      config.outbounds.push(compatible_outbound);
      compatible = true;
    }
    outbound.outbounds.push(compatible_outbound.tag);
  }
});

$content = JSON.stringify(config, null, 2);

function getTags(proxies, regex) {
  if (regex) {
    regex = new RegExp(regex);
  }
  return (regex ? proxies.filter(p => regex.test(p.tag)) : proxies).map(p => p.tag);
}
