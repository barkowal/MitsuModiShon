import { useEffect } from "react";
import { editorEventBus } from "./editor/utils/EditorEvents";

function HomePage() {

  //TODO delete later
  useEffect(() => {
    editorEventBus.showAllListeners();
  });

  return (
    <>
      <div className="flex justify-center items-center text-4xl h-full w-full text-center">
        <div>
          <h1> MITSUMODISHON</h1>
          <p className="text-xl"> Simple 3d modelling and animation web application.</p>
        </div>
      </div >
    </>
  );
}

export default HomePage;
