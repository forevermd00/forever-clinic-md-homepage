import { SectionLayout } from '@/components/common/SectionLayout';
import { cn } from '@/lib/utils/cn';

interface LocationSectionProps {
  locale?: string;
}

function LocationSection({ locale: _locale }: LocationSectionProps) {
  return (
    <SectionLayout title="오시는 길" background="ivory">
      <div className={cn('flex flex-col gap-8', 'lg:flex-row')}>
        {/* Map placeholder */}
        <div className="flex h-[380px] flex-1 items-center justify-center rounded-[12px] bg-neutral-200">
          <span className="text-[15px] text-neutral-500">지도 영역</span>
        </div>

        {/* Clinic info */}
        <div className="flex flex-1 flex-col gap-6">
          <div>
            <h3 className="text-forever-charcoal text-[18px] font-bold">
              주소
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-neutral-600">
              서울특별시 중구 명동길 74 5층
              <br />
              (명동역 6번 출구 도보 2분)
            </p>
          </div>

          <div>
            <p className="text-[15px] text-neutral-600">TEL 02-XXX-XXXX</p>
          </div>

          <div>
            <h3 className="text-forever-charcoal text-[18px] font-bold">
              진료 시간
            </h3>
            <ul className="mt-2 flex flex-col gap-1 text-[15px] text-neutral-600">
              <li>월–금 10:00 – 19:00</li>
              <li>토요일 10:00 – 16:00</li>
              <li>일·공휴일 휴진</li>
              <li>점심시간 13:00 – 14:00</li>
            </ul>
          </div>

          <div>
            <h3 className="text-forever-charcoal text-[18px] font-bold">
              교통편
            </h3>
            <ul className="mt-2 flex flex-col gap-1 text-[15px] text-neutral-600">
              <li>
                <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-[#00a651] text-[11px] font-bold text-white">
                  2
                </span>
                2호선 을지로입구역 5번 출구 도보 5분
              </li>
              <li>
                <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-[#eb6f0d] text-[11px] font-bold text-white">
                  4
                </span>
                4호선 명동역 6번 출구 도보 2분
              </li>
            </ul>
          </div>
        </div>
      </div>
    </SectionLayout>
  );
}

export { LocationSection, type LocationSectionProps };
