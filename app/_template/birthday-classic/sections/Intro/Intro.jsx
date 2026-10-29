import WordAnimation from "@/app/components/WordAnimation/WordAnimation";
import { introContent } from "@/app/lib/content";
import "./intro.scss";

export default function Intro({ content }) {
  return (
    <div className="container">
      <div className="intro-box">
        <WordAnimation
          value={content?.message ?? introContent.message}
          centre={true}
        />
      </div>
    </div>
  );
}
