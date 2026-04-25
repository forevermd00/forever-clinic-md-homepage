export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100dvh-4rem)] w-full overflow-hidden bg-[#c4b7a9]">
      {/* Background image */}
      <img
        src="/images/home/hero-1.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
        <h1 className="text-[48px] leading-[62px] font-bold whitespace-pre-line text-white">
          {'정교하게 설계된\n신뢰의 프리미엄'}
        </h1>
        <p className="mt-4 text-[18px] text-white/90">
          Smart-Boutique 포지셔닝 — 포에버 의원 명동점
        </p>
      </div>
    </section>
  );
}
