export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 grid grid-cols-2 gap-0.5">
          <div className="bg-neutral-900 rounded-tl-md"></div>
          <div className="bg-neutral-400 rounded-tr-md"></div>
          <div className="bg-neutral-600 rounded-bl-md"></div>
          <div className="bg-neutral-200 rounded-br-md"></div>
        </div>
      </div>
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">
          Senetgah
        </h1>
      </div>
    </div>
  );
}
