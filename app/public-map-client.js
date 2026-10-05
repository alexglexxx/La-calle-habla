"use client";

import dynamic from "next/dynamic";

const PublicMap = dynamic(() => import("./public-map"), {
  ssr: false
});

export default function PublicMapClient(props) {
  return <PublicMap {...props} />;
}
