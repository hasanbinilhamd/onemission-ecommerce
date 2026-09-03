/**
 * Journal — static editorial content for the movement archive.
 *
 * This is a clean local data structure so content can later be replaced by a
 * CMS without redesigning the page. No backend, no database.
 *
 * Imagery constraint: all human imagery in Journal is full-silhouette
 * composition — no visible human faces or eyes. Object/atmosphere imagery
 * contains no people at all.
 */

export const JOURNAL_CATEGORIES = ['PEOPLE', 'COMMUNITY', 'PHILOSOPHY', 'JOURNEY'] as const;

export type JournalCategory = (typeof JOURNAL_CATEGORIES)[number];

export interface JournalStory {
  id: string;
  category: JournalCategory;
  title: string;
  description: string;
  image: string;
  alt: string;
  date: string;
  readMinutes: number;
  featured?: boolean;
  body: readonly string[];
}

export const JOURNAL_STORIES: readonly JournalStory[] = [
  {
    id: 'mission-001-100-athletes',
    category: 'JOURNEY',
    title: '100 Athletes. One Purpose.',
    description:
      "Mission 001 is the movement's first public goal: one hundred Muslim athletes, training, competing, and representing their values — one community at a time.",
    image: '/images/journal/journal-featured.jpg',
    alt: 'Silhouettes of Muslim athletes in a huddle on a pitch at dawn.',
    date: 'August 2026',
    readMinutes: 5,
    featured: true,
    body: [
      "Mission 001 is the movement's first public goal: one hundred Muslim athletes — training, competing, and representing their values in every arena they enter. Not a number for its own sake, but a way to make the movement visible, one person at a time.",
      'It begins where every movement begins: with the people who show up. Runners before Fajr, footballers on borrowed pitches, calisthenics athletes on public bars, santri between classes. This page will follow their stories — and ours — as the mission moves forward.',
    ],
  },
  {
    id: 'running-before-sunrise',
    category: 'PEOPLE',
    title: 'Running Before Sunrise',
    description:
      'For one runner in Bandung, the first kilometers of the day begin before Fajr — a quiet rhythm of discipline and prayer.',
    image: '/images/journal/journal-athlete.jpg',
    alt: 'Silhouette of a runner on an empty road at dawn.',
    date: 'July 2026',
    readMinutes: 3,
    body: [
      'The city is still dark when he laces up. Before the first prayer of the day, before traffic, before the noise — a short loop through empty streets, breath steady, footsteps even.',
      'It is not about speed. It is about showing up every single morning, and carrying that same consistency into everything that follows. That is the athlete One Mission is built for.',
    ],
  },
  {
    id: 'every-touch-with-purpose',
    category: 'PEOPLE',
    title: 'Every Touch With Purpose',
    description:
      'Muslim footballers across the city are reclaiming the pitch — training with intention, playing with identity.',
    image: '/images/mission/mission-football.jpg',
    alt: 'Silhouette of a Muslim football player on a pitch at dusk.',
    date: 'June 2026',
    readMinutes: 3,
    body: [
      'Football has always been more than a game in this city. For a growing number of players, it is a place where identity is not left at the sideline — it is worn on the sleeve, and in the way they play.',
      'Training with intention means treating every touch as an act of discipline. The pitch becomes a classroom, and every session a chance to represent something larger than the score.',
    ],
  },
  {
    id: 'the-santri-who-trains-at-dawn',
    category: 'PEOPLE',
    title: 'The Santri Who Trains At Dawn',
    description:
      'Between classes and Quran study, sport is becoming a daily anchor for young santri.',
    image: '/images/journal/journal-santri.jpg',
    alt: 'Silhouettes of santri walking across a pesantren courtyard at dusk.',
    date: 'May 2026',
    readMinutes: 3,
    body: [
      'Life inside a pesantren follows its own clock. Study begins early, and the day is full. But before the first lesson, a growing group of santri has made space for movement — a short run, a set of push-ups, a stretch.',
      'The goal is not to become athletes. The goal is a body that can serve: strong enough to study long hours, disciplined enough to pray on time, and present enough to help the people around them.',
    ],
  },
  {
    id: 'eleven-brothers-one-team',
    category: 'COMMUNITY',
    title: 'Eleven Brothers, One Team',
    description:
      'A Muslim football community that began with borrowed balls now trains together every week.',
    image: '/images/journal/journal-community.jpg',
    alt: 'Silhouettes of a football team in a huddle at dusk.',
    date: 'July 2026',
    readMinutes: 4,
    body: [
      "Every community starts small. This one started with a group of friends, a borrowed ball, and a patch of grass that nobody else was using on Friday afternoons.",
      'Now they train together every week. New players arrive through word of mouth, and the rule is simple: everyone is welcome, everyone defends, everyone shares the ball. The team is the message.',
    ],
  },
  {
    id: 'the-open-bar-movement',
    category: 'COMMUNITY',
    title: 'The Open Bar Movement',
    description:
      'Calisthenics parks are becoming gathering points — where strength training meets brotherhood.',
    image: '/images/mission/mission-calisthenics.jpg',
    alt: 'Silhouette of a calisthenics athlete on a pull-up bar at night.',
    date: 'June 2026',
    readMinutes: 4,
    body: [
      'You do not need a membership to build strength. A bar in a public park is enough. That simple fact is drawing more and more young Muslims to calisthenics — not as a solo pursuit, but as a shared one.',
      'At the parks, training happens in pairs and groups. Someone holds the bar, someone counts the reps, someone encourages from the side. Strength, it turns out, is a community activity.',
    ],
  },
  {
    id: 'pesantren-after-class',
    category: 'COMMUNITY',
    title: 'Pesantren, After Class',
    description:
      "When the lesson ends, the field begins. Sports programs inside pesantren are taking shape.",
    image: '/images/mission/mission-pesantren.jpg',
    alt: 'Silhouette of a santri holding a soccer ball on a field at dusk.',
    date: 'May 2026',
    readMinutes: 4,
    body: [
      "The classroom is only half of a santri's day. In the hours after study, the field is where energy, discipline, and friendship meet — and where sports programs inside pesantren are quietly taking shape.",
      'The vision is simple: every pesantren with a patch of grass deserves a ball, a pair of shoes, and a teacher who believes that a strong body supports a strong student.',
    ],
  },
  {
    id: 'modesty-is-a-performance-layer',
    category: 'PHILOSOPHY',
    title: 'Modesty Is a Performance Layer',
    description:
      'What we wear to move is not a compromise — it is part of how we perform.',
    image: '/images/journal/journal-philosophy.jpg',
    alt: 'Folded sportswear, a prayer mat, and training shoes beside a window.',
    date: 'August 2026',
    readMinutes: 3,
    body: [
      'Modesty is often talked about as a limitation. In practice, it is a design brief. Coverage that moves with the body, fabric that breathes, silhouettes that work in any setting — that is performance without compromise.',
      'One Mission exists to make that brief real: sportswear built for athletes who want to train, compete, and represent — without leaving their values in the locker room.',
    ],
  },
  {
    id: 'calm-power',
    category: 'PHILOSOPHY',
    title: 'Calm Power',
    description:
      'Strength does not need to be loud. The movement is built on a simple idea: move quietly, build consistently.',
    image: '/images/journal/journal-dawn.jpg',
    alt: 'A mosque dome silhouetted against the dawn sky.',
    date: 'August 2026',
    readMinutes: 3,
    body: [
      'The loudest person in the room is rarely the strongest. One Mission moves in the opposite direction: calm power — the steady confidence of someone who has done the work, day after day, without announcing it.',
      'It is a philosophy that fits the people this movement is built for. Quiet routines. Consistent training. Faith carried naturally. Results that speak without shouting.',
    ],
  },
  {
    id: 'what-we-built-this-month',
    category: 'JOURNEY',
    title: 'What We Built This Month',
    description:
      "A short, honest log of the movement's work: product drops, community sessions, and the small steps between them.",
    image: '/images/journal/journal-gear.jpg',
    alt: 'Football and training gear on a bench at the edge of a pitch.',
    date: 'August 2026',
    readMinutes: 4,
    body: [
      "Accountability begins with a habit of recording. This is the movement's monthly log — a plain record of what was built, what was shipped, and what is still in progress.",
      'This month: new performance pieces arrived at the warehouse, community training sessions continued in Bandung, and the first conversations about pesantren sports programs began. Small steps, written down.',
    ],
  },
  {
    id: 'where-your-votes-are-taking-us',
    category: 'JOURNEY',
    title: 'Where Your Votes Are Taking Us',
    description:
      'The community voted. Pesantren leads with 48 percent. Here is how we are preparing to move.',
    image: '/images/journal/journal-track.jpg',
    alt: 'An empty running track at sunrise.',
    date: 'August 2026',
    readMinutes: 4,
    body: [
      'You voted. 48 percent of the community chose Pesantren as the next mission — sportswear and sports facilities for santri. Muslim Football followed with 31 percent, Calisthenics with 13, and Youth Development with 8.',
      'The vote is a compass, not a finish line. Preparation is now underway: understanding what pesantren actually need, where to start, and how the community can move together. When the mission begins, this page will be the record of it.',
    ],
  },
] as const;

export const JOURNAL_FEATURED_STORY: JournalStory =
  JOURNAL_STORIES.find((story) => story.featured) ?? JOURNAL_STORIES[0];

export const JOURNAL_COLLECTION_STORIES: readonly JournalStory[] = JOURNAL_STORIES.filter(
  (story) => !story.featured,
);

export function getJournalStoryById(id: string): JournalStory | undefined {
  return JOURNAL_STORIES.find((story) => story.id === id);
}
