import dynamic from "next/dynamic";
const SurveyApp = dynamic(() => import("../components/SurveyApp"), { ssr: false });
export default function Home() {
  return <SurveyApp />;
}
