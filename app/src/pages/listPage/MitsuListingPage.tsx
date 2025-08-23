import { MitsuObjectsListing } from "./MitsuObjectsListing";
import { useAuth } from "@/hooks/auth/useAuth";
import { useState } from "react";
import { MitsuUsersObjectsListing } from "./MitsuUsersObjectsListing";

const PUBLIC_OBJECTS3D_URL = "/api/v1/objects3D/public";
const USERS_OBJECTS3D_URL = "/api/v1/objects3D/private";

export default function MitsuListingPage() {
  const auth = useAuth();
  const [isPublicList, setIsPublicList] = useState(true);

  return (<>
    <div className="w-full h-full">

      <div className="w-full h-fit py-2 bg-primary-foreground ">

        <div className="flex font-bold justify-center items-center h-full space-x-10">
          <div
            onClick={() => { setIsPublicList(true); }}
            className="text-center px-4 py-2 cursor-pointer hover:bg-primary/10 rounded transition duration-300"
          >
            <p className="w-xs select-none ">
              Public
            </p>
          </div>
          {
            auth?.userName ?
              <div
                onClick={() => { setIsPublicList(false); }}
                className="text-center px-4 py-2 cursor-pointer hover:bg-primary/10 rounded transition duration-300"
              >
                <p className="w-xs select-none ">
                  My Objects
                </p>
              </div> : null
          }
        </div>

      </div >

      <div className="w-full h-10/12">
        {isPublicList ?
          <MitsuObjectsListing url={PUBLIC_OBJECTS3D_URL} />
          :
          <MitsuUsersObjectsListing url={USERS_OBJECTS3D_URL} />
        }
      </div>

    </div>
  </>);

}
