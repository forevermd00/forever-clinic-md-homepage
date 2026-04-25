export function HeroSection() {
  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center overflow-hidden bg-[#c4b7a9]">
      {/* Background image */}
      <img
        src="/images/home/hero-1.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content — centered */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <h1 className="text-[32px] leading-[1.3] font-bold text-white md:text-[40px] md:leading-[52px] lg:text-[48px] lg:leading-[62px]">
          정교하게 설계된
          <br />
          신뢰의 프리미엄
        </h1>
        <p className="mt-4 text-[16px] text-white/90 md:text-[18px]">
          Smart-Boutique 포지셔닝 — 포에버 의원 명동점
        </p>
      </div>
    </section>
  );
}
