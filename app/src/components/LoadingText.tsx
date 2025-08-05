type Props = {
  LoadingText?: string;
  TextClassname?: string;
}
export function LoadingText({ LoadingText = "Loading", TextClassname = "" }: Props) {
  return (
    <div className="flex items-center">
      <span className={`${TextClassname}`}>{LoadingText}</span>
      <div className="flex justify-center">
        <span className={`${TextClassname} animate-fade-fully`}>.</span>
        <span className={`${TextClassname} animate-fade-fully delay-200`}>.</span>
        <span className={`${TextClassname} animate-fade-fully delay-400`} >.</span >
      </div >
    </div >
  );
}
