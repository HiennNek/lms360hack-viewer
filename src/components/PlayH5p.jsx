import { H5P } from "h5p-standalone";
import React, { useEffect, useRef } from "react";

function PlayH5p({ h5pJsonPath }) {
  const h5pContainer = useRef(null);

  useEffect(() => {
    const el = h5pContainer.current;
    const options = {
      h5pJsonPath,
      frameJs: "/assets/frame.bundle.js",
      frameCss: "/assets/h5p.css"
    };

    // Initialize H5P on mount
    new H5P(el, options)
      .then((res) => {
        // console.log(res);
      })
      .catch((e) => {
        console.log("Err: ", e);
      });

    // Cleanup on unmount
    return () => {
      // H5P standalone doesn't seem to expose a clean destroy method on the instance 
      // ensuring we don't leak or crash.
      // Simply clearing the container innerHTML might be enough to prevent React warnings
      // but `h5p-standalone` might leave global listeners.
      if (el) {
        el.innerHTML = "";
      }
    };
  }, [h5pJsonPath]);

  return (
    <>
      <div ref={h5pContainer}></div>
    </>
  );
}

export default PlayH5p;
