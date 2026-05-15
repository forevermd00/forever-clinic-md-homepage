import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const client = createClient({
  projectId: 'ecoamz42',
  dataset: 'production',
  apiVersion: '2026-05-14',
  token: 'sk9Vbbb1TLlbUEALuo70BPZcsIcYhkMmML7wJTHuHyvqROtkqhphtTdQe6lK477WXdPm6MV8Apj7bVU4O7jeQRmKDWPwTXG8Taeceteroa7outuexceWdTYkjwjhFTRNS6TiyY2obolGq8TRHu9B1pV0Y1JyFD4oldAVRrvkgNX3sNYypeTJ',
  useCdn: false,
});

const builder = imageUrlBuilder(client);

const doc = await client.fetch(
  `*[_type == "brandPhilosophy" && _id == "forever-myeongdong-brand"][0] {
    slogan, subtitle,
    values[] { _key, title, description, image }
  }`
);

console.log('slogan.ko:', doc?.slogan?.ko);
console.log('subtitle.ko:', doc?.subtitle?.ko);
console.log('\nvalues:');
doc?.values?.forEach((v, i) => {
  const url = v.image ? builder.image(v.image).width(400).url() : null;
  console.log(`  ${i+1}. title.ko="${v.title?.ko}" image=${v.image?._type ?? 'null'} ref=${v.image?.asset?._ref?.slice(0,30) ?? 'none'}`);
  console.log(`     url: ${url ?? '(없음)'}`);
});
