export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0D0D0D' }}>
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-[3px] border-[#1E1E1E]" />
          <div className="absolute inset-0 rounded-full border-[3px] border-t-[#FF6600] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-2 rounded-full border-[2px] border-t-transparent border-r-[#FFB700]/50 border-b-transparent border-l-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.75s' }} />
        </div>
        <p className="text-[#555] text-sm font-medium tracking-wider uppercase">Loading</p>
      </div>
    </div>
  );
}
