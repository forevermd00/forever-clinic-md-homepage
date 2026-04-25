const INFO_ROWS = [
  {
    label: '주소',
    value: '서울특별시 중구 명동길 74 5층',
  },
  {
    label: '지하철',
    value:
      '4호선 명동역 6번 출구 도보 2분\n2호선 을지로입구역 5번 출구 도보 5분',
  },
  {
    label: '진료시간',
    value: '월–금 10:00 – 19:00\n토요일 10:00 – 16:00\n일·공휴일 휴진',
  },
  {
    label: '전화',
    value: '02-XXX-XXXX',
  },
];

export function LocationSection() {
  return (
    <section className="flex min-h-[100dvh] flex-col justify-center bg-[#faf8f5] py-16">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-12 px-5 md:flex-row md:px-10 lg:px-12">
        {/* Map placeholder */}
        <div className="flex h-[360px] flex-1 items-center justify-center rounded-[12px] bg-[#efe5d9]">
          <span className="text-center text-[14px] whitespace-pre-line text-[#808080]">
            {'지도 영역\n(Google Maps / Naver Maps)'}
          </span>
        </div>

        {/* Info */}
        <div className="flex h-auto flex-1 flex-col gap-6 md:h-[360px]">
          <h2 className="text-[24px] font-bold">오시는 길</h2>

          {INFO_ROWS.map((row) => (
            <div key={row.label} className="flex gap-3">
              {/* Icon circle */}
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#efe5d9]">
                <span className="text-[11px] text-[#706263]">
                  {row.label.charAt(0)}
                </span>
              </div>
              {/* Content */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[12px] font-medium text-[#d4c8bd]">
                  {row.label}
                </span>
                <p className="text-[14px] leading-[1.5] whitespace-pre-line text-[#2b2b2b]">
                  {row.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
