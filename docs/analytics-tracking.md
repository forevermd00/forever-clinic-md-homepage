# GA4 트래킹 ID 규칙 (단일 기준점)

포에버 명동 홈페이지의 GA4 이벤트 식별 규칙. 모든 추적 코드는 이 문서를 따른다.
구현: `src/lib/analytics/`, `src/components/analytics/AnalyticsTracker.tsx`.

## 1. 데이터 모델 — 한 클릭을 3차원으로 식별

| 질문                 | 차원         | 출처                                                                         |
| -------------------- | ------------ | ---------------------------------------------------------------------------- |
| **어떤 페이지에서?** | `page_path`  | GA4 자동(page_location/page_title) + 모든 이벤트에 `page_path` 파라미터 첨부 |
| **어떤 섹션에서?**   | `ga_section` | 클릭한 요소의 가장 가까운 `data-ga-section`에서 자동 첨부                    |
| **어떤 버튼을?**     | `ga_id`      | 아래 ID 규칙                                                                 |

→ 세 차원이 독립이므로 GA4 탐색에서 페이지 × 섹션 × 버튼으로 자유롭게 교차 분석 가능.

## 2. ga_id 포맷 — `{section}.{element}`

- 소문자, 세그먼트 내부는 kebab-case, **섹션과 엘리먼트 구분자는 점(`.`) 하나**
- 첫 `.` 기준으로 `[section, element]` 분리 가능해야 함 → **element 안에는 `.` 금지**(`-`만)
- 동적 항목은 element 끝에 `-{key}`. **key는 언어무관 안정값**(slug / id / locale / 경로). **화면 텍스트(라벨)에서 생성 금지.**

예)

```
header.reservation-cta
header.nav-treatments
floating-cta.messenger-kakaotalk
home-hero.cta-reservation
home-quick-entry.card-lifting
home-signature.card-{slug}
contact-form.submit
treatment-card.link-{slug}
estimate-cart.remove-{id}
auth-login.submit
```

## 3. section 레지스트리 (고정 — `ga_id` 접두사 = `data-ga-section` 값)

**글로벌(전 페이지 공통):** `header` · `footer` · `floating-cta` · `user-menu` · `cart`
**홈:** `home-hero` · `home-quick-entry` · `home-signature` · `home-ba-preview` · `home-press` · `home-promo` · `home-location` · `home-doctor` · `home-stats` · `home-brand-philosophy` · `home-event-popup`
**예약 폼(홈·/contact 공용):** `contact-form`
**시술:** `treatments-tab` · `treatment-card` · `treatment-option` · `treatment-faq` · `treatment-detail`
**견적:** `estimate-cart` · `estimate-summary`
**브랜드:** `brand-equipment` · `brand-gallery` · `brand-doctor` · `brand-doctor-modal` · `brand-section-nav`
**전후사진:** `ba-grid` · `ba-card` · `ba-lock` · `ba-detail`
**미디어:** `media-nav` · `media-press` · `media-article` · `media-notice` · `media-video` · `media-card`
**인증/계정:** `auth-login` · `auth-signup` · `auth-reset` · `account`
**공통 UI(여러 페이지 재사용):** `ui-pagination` · `ui-filter-tabs` · `ui-toast` · `ui-modal` · `ui-cta-banner` · `ui-base-card` · `ui-copy-address`
**오류:** `error-notfound`

## 4. element 명명 관례

| 유형           | 패턴                                               | 예                            |
| -------------- | -------------------------------------------------- | ----------------------------- |
| 대표 동작      | `submit` `toggle` `close` `prev` `next` `more`     | `contact-form.submit`         |
| CTA            | `cta-{목적}`                                       | `home-hero.cta-reservation`   |
| 네비/링크      | `nav-{path}` `link-{path}`                         | `header.nav-brand`            |
| 탭/카드/항목   | `tab-{key}` `card-{key}` `item-{key}`              | `treatments-tab.tab-{slug}`   |
| 수량/조작      | `qty-plus-{id}` `qty-minus-{id}` `remove-{id}`     | `estimate-cart.remove-{id}`   |
| 채널/지도/전화 | `messenger-{platform}` `open-map-{provider}` `tel` | `floating-cta.messenger-line` |

## 5. section_view 규칙

- `data-ga-section="{레지스트리 값}"`을 섹션 래퍼에 부여.
- 화면에 **50% 이상 노출되면 `section_view` 1회** 발화 (페이지당). `ga_section` = 그 값.
- 스크롤 깊이(`scroll_depth` 25/50/75/100%)와 병행 — "어디까지/무엇을 봤나" 정밀 측정.

## 6. 신규 요소 추가 시 (개발자)

1. 속한 섹션의 래퍼에 `data-ga-section="{section}"`이 있는지 확인(없으면 추가).
2. 인터랙티브 요소에 `data-ga-id="{section}.{element}"` 부여.
3. 특수 이벤트는 `data-ga-event="messenger_click"` 등, 추가 파라미터는 `data-ga-{key}="..."`(자동 `ga_{key}` 전송).
4. **명시적 부여 안 해도** 트래커가 `{section-or-routeScope}.{...}` 형태로 안정 폴백 생성(언어무관). 단 명시 권장.

## 7. 이벤트 목록

`page_view`(자동·유입출처 포함) · `button_click` · `messenger_click` · `tel_click` · `email_click` · `outbound_click` · `form_submit` · `scroll_depth` · `section_view`
공통 파라미터: `ga_id` · `ga_section` · `page_path` · `link_text` · `link_url`

## 8. GA4 콘솔 — 맞춤 측정기준 등록(필수, 소급 불가)

`ga_id`(버튼ID) · `ga_section`(섹션) · `percent`(스크롤) · `link_text` · `link_url` · `ga_platform` · `phone_number` 를 이벤트 범위 맞춤 측정기준으로 등록해야 리포트에서 분해 가능.
