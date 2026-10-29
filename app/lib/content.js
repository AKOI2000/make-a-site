// Safe starter content for the first reusable template.
// Personal messages and photographs from the original website have been removed.
export const envelope = {
  recipient: "To someone special",
  hint: "scroll to open",
  heading: "A little letter for you",
  greeting: "Dear someone special,",
  paragraphs: [
    "I wanted to make something just for you, a small reminder of how much you mean to me. I hope today brings you reasons to smile and moments you will want to remember.",
    "Thank you for being part of my life. I am grateful for the memories we have made and excited for all the good moments still ahead. You deserve to feel celebrated today and always.",
  ],
  closing: "With love, always.",
  signature: "Someone who cares about you",
};

export const introContent = {
  message: "Some people make life brighter simply by being themselves. This little gift celebrates who you are, the moments worth remembering, and all the beautiful things still to come.",
};

export const cards = [
  { id: "wish-1", url: "/wish-1.jpeg", name: "Your name here", relation: "A note from someone special", message: "Write a heartfelt message here. Share a favourite memory, a wish for the year ahead, or something you want this person to know." },
  { id: "wish-2", url: "/wish-2.jpeg", name: "Your name here", relation: "A note from someone special", message: "Every good memory has a story. Add your own message here and make this gift personal." },
  { id: "wish-3", url: "/wish-3.jpeg", name: "Your name here", relation: "A note from someone special", message: "Wishing you joy, laughter, and beautiful moments in the year ahead. Replace this text with your own words." },
];

export const memories = [
  { imagelink: "/memory-1.jpeg", imageAlt: "Decorative memory placeholder", caption: "A favourite memory" },
  { imagelink: "/memory-2.jpeg", imageAlt: "Decorative memory placeholder", caption: "A moment worth keeping" },
  { imagelink: "/memory-3.jpeg", imageAlt: "Decorative memory placeholder", caption: "One for the memory book" },
  { imagelink: "/memory-4.jpeg", imageAlt: "Decorative memory placeholder", caption: "More lovely moments" },
];

export const finalPhotograph = {
  image: "/final-photograph.jpeg",
  line1: "Happy Birthday, {name}!",
  line2: "We love you more than words can say.",
  hint: "press and hold",
};


export const defaultBirthdayContent = {
  intro: introContent,
  memories,
  wishes: cards,
  envelope,
  finalPhotograph,
};