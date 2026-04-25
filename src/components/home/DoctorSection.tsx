const DOCTORS = [
  {
    name: '김포에버 원장',
    specialty: '리프팅 · 피부케어 전문',
    bio: '서울대학교 의과대학 졸업\n피부과 전문의 15년 경력',
  },
  {
    name: '이포에버 원장',
    specialty: '토닝 · 색소 전문',
    bio: '연세대학교 의과대학 졸업\n레이저 치료 전문의 12년 경력',
  },
  {
    name: '박포에버 원장',
    specialty: '보톡스 · 필러 전문',
    bio: '고려대학교 의과대학 졸업\n성형외과 전문의 10년 경력',
  },
  {
    name: '최포에버 원장',
    specialty: '스킨케어 · 재생 전문',
    bio: '서울대학교 의과대학 졸업\n피부과 전문의 8년 경력',
  },
];

export function DoctorSection() {
  return (
    <section className="flex flex-col items-center gap-8 bg-[#faf8f5] px-4 py-16 md:px-[120px]">
      {/* Header */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-[12px] font-medium tracking-[1.8px] text-[#d4c8bd]">
          OUR DOCTORS
        </span>
        <h2 className="text-[28px] font-bold">의료진 소개</h2>
      </div>

      {/* Doctor cards */}
      <div className="flex w-full flex-wrap justify-center gap-6">
        {DOCTORS.map((doctor) => (
          <div
            key={doctor.name}
            className="min-w-[282px] flex-1 overflow-hidden rounded-[8px] bg-white"
          >
            {/* Photo placeholder */}
            <div className="h-[220px] bg-[#efe5d9]" />
            {/* Content */}
            <div className="flex flex-col gap-2 p-5">
              <h3 className="text-[18px] font-bold">{doctor.name}</h3>
              <span className="text-[13px] font-medium text-[#d4c8bd]">
                {doctor.specialty}
              </span>
              <p className="text-[13px] whitespace-pre-line text-[#808080]">
                {doctor.bio}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
