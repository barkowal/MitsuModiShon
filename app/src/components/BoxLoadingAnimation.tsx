export function BoxLoadingAnimation() {

  return (
    <div className="relative flex justify-center w-fit h-fit">
      <div className="w-[1ch] h-[1ch] bg-loading-box animate-box-up absolute top-[50%] left-[50%]">
      </div>
      <div className="w-[1ch] h-[1ch] bg-loading-box animate-box-down absolute top-[calc(50%-1ch)] left-[calc(50%-1ch)] ">
      </div>
    </div >
  );

}
