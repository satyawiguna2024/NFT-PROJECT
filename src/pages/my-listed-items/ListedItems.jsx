export default function ListedItems() {
  return (
    <>
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-4 gap-3 mt-8">
          {/* cards */}
          {[1].map((_, i) => (
            <div key={i} className="border border-gray-400 rounded-md">
              <div
                className="relative size-full h-80 bg-cover object-cover bg-center flex flex-col justify-end items-center rounded-b-none"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/flagged/photo-1558706379-e9698f05d675?q=80&w=1646&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                }}
              >
                <div className="w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent text-center">
                  {/* title */}
                  <h3 className="text-xl text-gray-200 font-semibold drop-shadow-lg">Dove</h3>
                  {/* description */}
                  <p className="text-lg text-gray-200 font-medium drop-shadow-lg pb-3">Majestic and Blue</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
