export default function MediaLoading() {
  return (
    <section className="bg-[#faf8f5] px-5 py-12 md:px-10 lg:px-[120px] lg:py-16">
      <div className="mx-auto flex max-w-[var(--container-max)] flex-col items-center gap-6">
        <div className="h-5 w-32 animate-pulse rounded bg-[#efe5d9]" />
        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="overflow-hidden rounded-[8px] bg-white">
              <div className="h-[200px] animate-pulse bg-[#efe5d9]" />
              <div className="flex flex-col gap-2 p-4">
                <div className="h-3 w-20 animate-pulse rounded bg-[#efe5d9]" />
                <div className="h-4 w-full animate-pulse rounded bg-[#efe5d9]" />
                <div className="h-3 w-3/4 animate-pulse rounded bg-[#efe5d9]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
