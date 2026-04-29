import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'ecoamz42',
  dataset: 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

function ls(ko, en, zh, ja) {
  return { _type: 'localizedString', ko, en, zh, ja };
}

let keyCounter = 0;
function k() {
  return `figma-${++keyCounter}`;
}

// ════════════════════════════════════════════════════════════════════════════
// 1. HeroContent
// ════════════════════════════════════════════════════════════════════════════
async function updateHero() {
  console.log('\n── 1. HeroContent ──');

  const patch = client.patch('forever-myeongdong-hero')
    .set({
      mainTitle: ls(
        '정교하게 설계된\n신뢰의 프리미엄',
        'Precisely Designed\nPremium of Trust',
        '精心设计的\n信赖之高端',
        '精密に設計された\n信頼のプレミアム'
      ),
      mainSubtitle: ls(
        'Smart-Boutique 포지셔닝 - 포에버 의원 명동점',
        'Smart-Boutique Positioning - Forever Clinic Myeongdong',
        'Smart-Boutique定位 - 永恒诊所明洞店',
        'Smart-Boutiqueポジショニング - フォーエバークリニック明洞'
      ),
      pageHeroes: [
        {
          _type: 'object',
          _key: k(),
          pageKey: 'before-after',
          title: ls('Before & After', 'Before & After', 'Before & After', 'Before & After'),
          subtitle: ls(
            '포에버 명동의 시술 결과를 확인해보세요',
            'See the treatment results at Forever Myeongdong',
            '查看永恒明洞的诊疗效果',
            'フォーエバー明洞の施術結果をご確認ください'
          ),
        },
        {
          _type: 'object',
          _key: k(),
          pageKey: 'treatments',
          title: ls('시술 안내', 'Treatments', '诊疗项目', '施術案内'),
          subtitle: ls(
            '당신에게 맞는 최적의 시술을 찾아보세요',
            'Find the optimal treatment for you',
            '寻找最适合您的诊疗项目',
            'あなたに合った最適な施術を見つけてください'
          ),
        },
        {
          _type: 'object',
          _key: k(),
          pageKey: 'brand',
          title: ls(
            '정교하게 설계된\n신뢰의 프리미엄',
            'Precisely Designed\nPremium of Trust',
            '精心设计的\n信赖之高端',
            '精密に設計された\n信頼のプレミアム'
          ),
          subtitle: ls(
            'Smart-Boutique 포지셔닝 - 포에버 의원 명동점',
            'Smart-Boutique Positioning - Forever Clinic Myeongdong',
            'Smart-Boutique定位 - 永恒诊所明洞店',
            'Smart-Boutiqueポジショニング - フォーエバークリニック明洞'
          ),
        },
        {
          _type: 'object',
          _key: k(),
          pageKey: 'promotions',
          title: ls('이벤트 & 프로모션', 'Events & Promotions', '活动 & 优惠', 'イベント & プロモーション'),
          subtitle: ls(
            '지금 진행 중인 특별한 혜택을 만나보세요',
            'Discover special offers available now',
            '了解正在进行的特别优惠',
            '現在開催中の特別な特典をご覧ください'
          ),
        },
        {
          _type: 'object',
          _key: k(),
          pageKey: 'press',
          title: ls('보도자료', 'Press', '新闻报道', 'プレスリリース'),
          subtitle: ls(
            '포에버 클리닉의 최신 소식을 전합니다',
            'The latest news from Forever Clinic',
            '传递永恒诊所的最新消息',
            'フォーエバークリニックの最新ニュースをお届けします'
          ),
        },
        {
          _type: 'object',
          _key: k(),
          pageKey: 'video',
          title: ls('영상 콘텐츠', 'Video Content', '视频内容', '動画コンテンツ'),
          subtitle: ls(
            '시술 과정과 후기 영상을 확인해보세요',
            'Watch treatment procedures and review videos',
            '查看诊疗过程和评价视频',
            '施術の過程とレビュー動画をご確認ください'
          ),
        },
        {
          _type: 'object',
          _key: k(),
          pageKey: 'blog',
          title: ls('블로그', 'Blog', '博客', 'ブログ'),
          subtitle: ls(
            '피부 관리 팁과 시술 정보를 공유합니다',
            'Sharing skincare tips and treatment information',
            '分享皮肤管理技巧和诊疗信息',
            'スキンケアのコツと施術情報を共有します'
          ),
        },
        {
          _type: 'object',
          _key: k(),
          pageKey: 'notice',
          title: ls('공지사항', 'Notice', '公告', 'お知らせ'),
          subtitle: ls(
            '포에버 클리닉의 공지사항을 확인해주세요',
            'Please check Forever Clinic notices',
            '请查看永恒诊所的公告',
            'フォーエバークリニックのお知らせをご確認ください'
          ),
        },
        {
          _type: 'object',
          _key: k(),
          pageKey: 'estimate',
          title: ls('나의 견적', 'My Estimate', '我的报价', '私の見積もり'),
          subtitle: ls(
            '관심 시술을 담아 견적을 확인해보세요',
            'Add your desired treatments and check the estimate',
            '添加感兴趣的项目查看报价',
            '気になる施術を追加して見積もりを確認してください'
          ),
        },
        {
          _type: 'object',
          _key: k(),
          pageKey: 'contact',
          title: ls('예약 및 상담', 'Reservation & Consultation', '预约及咨询', '予約・相談'),
          subtitle: ls(
            '궁금하신 점이 있으시면 편하게 문의해 주세요',
            'Feel free to contact us with any questions',
            '如有疑问请随时联系我们',
            'ご不明な点がございましたらお気軽にお問い合わせください'
          ),
        },
      ],
    });

  const result = await patch.commit();
  console.log('  [OK] HeroContent updated');
  return result;
}

// ════════════════════════════════════════════════════════════════════════════
// 2. StatsStrip
// ════════════════════════════════════════════════════════════════════════════
async function updateStats() {
  console.log('\n── 2. StatsStrip ──');

  const result = await client.patch('forever-myeongdong-stats')
    .set({
      items: [
        {
          _type: 'object',
          _key: k(),
          value: ls('15+', '15+', '15+', '15+'),
          label: ls('전문 의료진', 'Expert Physicians', '专业医疗团队', '専門医療チーム'),
        },
        {
          _type: 'object',
          _key: k(),
          value: ls('30,000+', '30,000+', '30,000+', '30,000+'),
          label: ls('누적 시술 건', 'Cumulative Cases', '累计诊疗案例', '累計施術件数'),
        },
        {
          _type: 'object',
          _key: k(),
          value: ls('98%', '98%', '98%', '98%'),
          label: ls('고객 만족도', 'Client Satisfaction', '客户满意度', '顧客満足度'),
        },
        {
          _type: 'object',
          _key: k(),
          value: ls('10+', '10+', '10+', '10+'),
          label: ls('보유 장비', 'Medical Equipment', '医疗设备', '保有機器'),
        },
      ],
    })
    .commit();

  console.log('  [OK] StatsStrip updated');
  return result;
}

// ════════════════════════════════════════════════════════════════════════════
// 3. BrandPhilosophy
// ════════════════════════════════════════════════════════════════════════════
async function updateBrand() {
  console.log('\n── 3. BrandPhilosophy ──');

  const result = await client.patch('forever-myeongdong-brand')
    .set({
      slogan: ls(
        'Smart-Boutique 철학',
        'Smart-Boutique Philosophy',
        'Smart-Boutique 理念',
        'Smart-Boutique 哲学'
      ),
      values: [
        {
          _type: 'object',
          _key: 'honesty',
          title: ls('정직', 'Honesty', '诚实', '正直'),
          description: ls(
            '투명한 시술 정보 공개와 정량 기준 준수로\n환자와의 신뢰를 구축합니다',
            'Building trust with patients through transparent\ntreatment information and quantitative standards',
            '通过透明的诊疗信息公开和遵守定量标准\n建立与患者的信任',
            '透明な施術情報の公開と定量基準の遵守で\n患者様との信頼を構築します'
          ),
        },
        {
          _type: 'object',
          _key: 'precision',
          title: ls('정교', 'Precision', '精密', '精巧'),
          description: ls(
            '시간 엄수, 오차 없는 시술, 체계적 안내로\n완벽한 결과를 설계합니다',
            'Designing perfect results through punctuality,\nerror-free procedures, and systematic guidance',
            '通过准时、零误差诊疗和系统化引导\n设计完美的效果',
            '時間厳守、誤差のない施術、体系的な案内で\n完璧な結果を設計します'
          ),
        },
        {
          _type: 'object',
          _key: 'expertise',
          title: ls('전문', 'Expertise', '专业', '専門'),
          description: ls(
            '의사가 직접 참여하는 1:1 페이셜 디자인으로\n맞춤 시술을 제공합니다',
            'Providing customized treatments through\n1:1 facial design with direct physician involvement',
            '医生亲自参与的1:1面部设计\n提供定制化诊疗',
            '医師が直接参加する1:1フェイシャルデザインで\nオーダーメイド施術を提供します'
          ),
        },
        {
          _type: 'object',
          _key: 'dignity',
          title: ls('존엄', 'Dignity', '尊严', '尊厳'),
          description: ls(
            '프라이빗 공간과 전담 컨시어지 서비스로\n품격 있는 경험을 선사합니다',
            'Delivering a dignified experience through\nprivate spaces and dedicated concierge service',
            '通过私密空间和专属礼宾服务\n提供高品质的体验',
            'プライベート空間と専属コンシェルジュサービスで\n品格ある体験をお届けします'
          ),
        },
      ],
    })
    .commit();

  console.log('  [OK] BrandPhilosophy updated');
  return result;
}

// ════════════════════════════════════════════════════════════════════════════
// 4. ClinicInfo
// ════════════════════════════════════════════════════════════════════════════
async function updateClinicInfo() {
  console.log('\n── 4. ClinicInfo ──');

  const result = await client.patch('forever-myeongdong-clinic-info')
    .set({
      address: ls(
        '서울특별시 중구 명동길 14, 포에버빌딩 3층',
        '3F, Forever Bldg., 14 Myeongdong-gil, Jung-gu, Seoul',
        '首尔特别市中区明洞路14号 永恒大厦3层',
        'ソウル特別市中区明洞ギル14、フォーエバービル3階'
      ),
      phone: '02-XXX-XXXX',
      email: 'contact@forever-clinic.kr',
      walkingGuide: ls(
        '4호선 명동역 6번 출구 도보 3분',
        '3 min walk from Exit 6, Myeongdong Stn. (Line 4)',
        '4号线明洞站6号出口步行3分钟',
        '4号線明洞駅6番出口から徒歩3分'
      ),
      closedDayNotice: ls(
        '일·공휴일 휴진',
        'Closed on Sundays & Holidays',
        '周日及公休日休诊',
        '日曜・祝日休診'
      ),
      businessHours: [
        {
          _type: 'businessHours',
          _key: k(),
          day: ls('월~금', 'Mon-Fri', '周一~周五', '月~金'),
          open: '10:00',
          close: '19:00',
        },
        {
          _type: 'businessHours',
          _key: k(),
          day: ls('토', 'Sat', '周六', '土'),
          open: '10:00',
          close: '16:00',
        },
      ],
    })
    .commit();

  console.log('  [OK] ClinicInfo updated');
  return result;
}

// ════════════════════════════════════════════════════════════════════════════
// 5. Treatments - update category taglines
// ════════════════════════════════════════════════════════════════════════════
async function updateTreatments() {
  console.log('\n── 5. Treatments (taglines) ──');

  // Query all treatments grouped by category to update taglines
  const categoryTaglines = {
    lifting: ls(
      '처진 피부를 끌어올려 자연스러운 V라인과 탄력을 되찾아 드립니다',
      'Lifting sagging skin to restore a natural V-line and elasticity',
      '提拉松弛的皮肤，恢复自然的V形轮廓和弹性',
      'たるんだ肌を引き上げ、自然なVラインと弾力を取り戻します'
    ),
    skincare: ls(
      '건강한 피부 본연의 광채를 되살리는 맞춤 케어 프로그램',
      'Customized care program that restores the natural radiance of healthy skin',
      '恢复健康肌肤本来光彩的定制护理方案',
      '健やかな肌本来の輝きを蘇らせるオーダーメイドケアプログラム'
    ),
    toning: ls(
      '깨끗하고 균일한 피부톤으로 맑은 인상을 완성합니다',
      'Achieving a clear impression with clean and even skin tone',
      '以清洁均匀的肤色打造清透印象',
      'クリーンで均一な肌トーンで澄んだ印象を完成させます'
    ),
    'botox-filler': ls(
      '자연스러운 볼륨과 라인으로 본연의 아름다움을 살립니다',
      'Enhancing natural beauty with natural volume and contours',
      '以自然的丰盈和线条展现本来的美丽',
      '自然なボリュームとラインで本来の美しさを引き出します'
    ),
  };

  // Get all treatment IDs by category
  const treatments = await client.fetch(`*[_type == "treatment"]{_id, category}`);
  let count = 0;

  for (const t of treatments) {
    const tagline = categoryTaglines[t.category];
    if (tagline) {
      await client.patch(t._id).set({ tagline }).commit();
      console.log(`  [OK] ${t._id} tagline updated`);
      count++;
    }
  }

  console.log(`  Total: ${count} treatments updated`);
}

// ════════════════════════════════════════════════════════════════════════════
// 6. Promotions
// ════════════════════════════════════════════════════════════════════════════
async function updatePromotions() {
  console.log('\n── 6. Promotions ──');

  await client.patch('promotion-1')
    .set({
      title: ls(
        '봄맞이 리프팅 프로모션',
        'Spring Lifting Promotion',
        '春季提拉优惠活动',
        '春のリフティングプロモーション'
      ),
      description: {
        _type: 'localizedText',
        ko: [{ _type: 'block', _key: k(), style: 'normal', children: [{ _type: 'span', _key: k(), text: '울쎄라 + 써마지 패키지 30% 할인', marks: [] }], markDefs: [] }],
        en: [{ _type: 'block', _key: k(), style: 'normal', children: [{ _type: 'span', _key: k(), text: 'Ultherapy + Thermage package 30% off', marks: [] }], markDefs: [] }],
        zh: [{ _type: 'block', _key: k(), style: 'normal', children: [{ _type: 'span', _key: k(), text: '超声刀 + 热玛吉套餐7折优惠', marks: [] }], markDefs: [] }],
        ja: [{ _type: 'block', _key: k(), style: 'normal', children: [{ _type: 'span', _key: k(), text: 'ウルセラ + サーマジパッケージ30%割引', marks: [] }], markDefs: [] }],
      },
    })
    .commit();
  console.log('  [OK] promotion-1 updated');

  await client.patch('promotion-2')
    .set({
      title: ls(
        '신규 고객 보톡스 패키지',
        'New Customer Botox Package',
        '新客户肉毒素套餐',
        '新規顧客ボトックスパッケージ'
      ),
      description: {
        _type: 'localizedText',
        ko: [{ _type: 'block', _key: k(), style: 'normal', children: [{ _type: 'span', _key: k(), text: '처음 방문 시 보톡스 50% 특가', marks: [] }], markDefs: [] }],
        en: [{ _type: 'block', _key: k(), style: 'normal', children: [{ _type: 'span', _key: k(), text: '50% off Botox on your first visit', marks: [] }], markDefs: [] }],
        zh: [{ _type: 'block', _key: k(), style: 'normal', children: [{ _type: 'span', _key: k(), text: '首次来访肉毒素半价特惠', marks: [] }], markDefs: [] }],
        ja: [{ _type: 'block', _key: k(), style: 'normal', children: [{ _type: 'span', _key: k(), text: '初回ご来院時ボトックス50%特価', marks: [] }], markDefs: [] }],
      },
    })
    .commit();
  console.log('  [OK] promotion-2 updated');

  await client.patch('promotion-3')
    .set({
      title: ls(
        '피부관리 세트 할인',
        'Skincare Set Discount',
        '皮肤管理套装优惠',
        'スキンケアセット割引'
      ),
      description: {
        _type: 'localizedText',
        ko: [{ _type: 'block', _key: k(), style: 'normal', children: [{ _type: 'span', _key: k(), text: '스킨부스터 + 엑소좀 패키지', marks: [] }], markDefs: [] }],
        en: [{ _type: 'block', _key: k(), style: 'normal', children: [{ _type: 'span', _key: k(), text: 'Skin Booster + Exosome Package', marks: [] }], markDefs: [] }],
        zh: [{ _type: 'block', _key: k(), style: 'normal', children: [{ _type: 'span', _key: k(), text: '水光针 + 外泌体套餐', marks: [] }], markDefs: [] }],
        ja: [{ _type: 'block', _key: k(), style: 'normal', children: [{ _type: 'span', _key: k(), text: 'スキンブースター + エクソソームパッケージ', marks: [] }], markDefs: [] }],
      },
    })
    .commit();
  console.log('  [OK] promotion-3 updated');
}

// ════════════════════════════════════════════════════════════════════════════
// 7. QuickEntry tab labels (i18n - not Sanity, printed as reminder)
// ════════════════════════════════════════════════════════════════════════════
function printQuickEntryReminder() {
  console.log('\n── 7. QuickEntry tab labels ──');
  console.log('  QuickEntry tab labels are in src/messages/*.json (i18n), not Sanity.');
  console.log('  Checking if they already match Figma text...');
}

// ════════════════════════════════════════════════════════════════════════════
// Run all updates
// ════════════════════════════════════════════════════════════════════════════
async function main() {
  console.log('=== Figma Text Update Script ===');
  console.log('Target: Sanity project ecoamz42 / dataset: production\n');

  try {
    await updateHero();
    await updateStats();
    await updateBrand();
    await updateClinicInfo();
    await updateTreatments();
    await updatePromotions();
    printQuickEntryReminder();

    console.log('\n=== All Sanity updates complete ===');
  } catch (err) {
    console.error('\nFatal error:', err);
    process.exit(1);
  }
}

main();
