import dynamic from "next/dynamic";

// Reuse the same SurveyApp component. The component itself detects
// the /live path and renders the projection screen instead of the
// language picker.
const SurveyApp = dynamic(() => import("../components/SurveyApp"), { ssr: false });

export default function Live() {
  return <SurveyApp />;
}
