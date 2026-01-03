import { H5P } from "h5p-standalone";
import React, { useEffect, useRef } from "react";

if (!H5P.isEmpty) {
  H5P.isEmpty = function (value) {
    return value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim().length === 0) ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0);
  };
}

function PlayH5p({ h5pJsonPath }) {
  const h5pContainer = useRef(null);

  useEffect(() => {
    const el = h5pContainer.current;

    if (typeof window !== 'undefined' && window.H5P && !window.H5P.isEmpty) {
      window.H5P.isEmpty = function (value) {
        return value === undefined ||
          value === null ||
          (typeof value === 'string' && value.trim().length === 0) ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'object' && Object.keys(value).length === 0);
      };
    }

    const options = {
      h5pJsonPath,
      frameJs: "/assets/frame.bundle.js",
      frameCss: "/assets/h5p.css"
    };

    new H5P(el, options)
      .then((res) => {
      })
      .catch((e) => {
        console.log("Err: ", e);
      });

    return () => {

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
