
import EnvelopeIntro from "@/app/_template/birthday-classic/sections/EnvelopeIntro/EnvelopeIntro";
import FinalPhotograph from "@/app/_template/birthday-classic/sections/FinalPhotograph/FinalPhotograph";
import Hero from "@/app/_template/birthday-classic/sections/Hero/Hero";
import Intro from "@/app/_template/birthday-classic/sections/Intro/Intro";
import MemoryWall from "@/app/_template/birthday-classic/sections/MemoryWall/MemoryWall";
import Wishes from "@/app/_template/birthday-classic/sections/Wishes/Wishes";
import birthdayClassicSections from "@/app/_template/birthday-classic/sections";

const sectionComponents = {
  hero: Hero,
  intro: Intro,
  memories: MemoryWall,
  wishes: Wishes,
  envelope: EnvelopeIntro,
  "final-photograph": FinalPhotograph,
};

export default function BirthdayClassic({
  content,
  sections = birthdayClassicSections,
  isPreview = false,
}) {
  const orderedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <>
      {orderedSections.map((section) => {
        if (!section.visible) return null;

        const SectionComponent = sectionComponents[section.id];

        if (!SectionComponent) return null;

        if (section.id === "wishes") {
          const guestbook = content?.guestbook;
          const hasWishes = Boolean(guestbook?.wishes?.length);
          const guestbookIsOpen = guestbook?.status === "OPEN";

          if (!hasWishes && !guestbookIsOpen) return null;
        }

        const sectionContent =
          section.id === "memories"
            ? { memories: content?.memories }
            : section.id === "wishes"
              ? { guestbook: content?.guestbook }
              : section.id === "final-photograph"
                ? content?.finalPhotograph
                : content?.[section.id];

        return (
          <SectionComponent
            key={section.id}
            content={sectionContent}
            isPreview={isPreview}
          />
        );
      })}
    </>
  );
}
