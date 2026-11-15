export interface InterviewTextOverride {
  subtitle: string;
  entryTitle: string;
  intro: string[];
  silence: string;
  /** por id de pregunta: texto en inglés; el fragmento es opcional */
  questions: Record<string, { label: string; answer: string; fragment?: string }>;
}

/** Traducciones al inglés; ids, categorías, señal y fuentes no se duplican. */
export const INTERVIEW_TEXT_EN: Record<string, InterviewTextOverride> = {
  eagle: {
    subtitle: 'Apollo 11 descent stage · Sea of Tranquility',
    entryTitle: 'Eagle — the base that stayed behind',
    intro: [
      'I knew someone would come. Not to find me, I suppose. To ask.',
      'I have four signal units. After that, silence.',
    ],
    silence:
      'The signal fell to zero. Eagle is still in the same place, with its window pointing at the same point in the sky.',
    questions: {
      'eagle-tarea': {
        label: 'What were you supposed to do?',
        answer:
          'Go down. Nothing more. Four tonnes of engine, tank and legs with a single task: carry two people to the ground without breaking them. The upper half did the rest.',
      },
      'eagle-espejo': {
        label: 'What did you leave running when you shut down?',
        answer:
          'A mirror. One hundred quartz prisms on a panel. It needs no power: anyone with a laser can measure the distance between Earth and me. It has been doing that for over fifty years.',
        fragment: 'Retroreflector with 100 quartz prisms, passive and still operating.',
      },
      'eagle-sismometro': {
        label: 'What did you hear after they left?',
        answer:
          'Little. My seismometer burned out after three weeks. The ones brought by later missions listened to the Moon until 1977. By then I had been deaf for years.',
        fragment:
          "Apollo 11's seismometer failed from overheating within weeks; later ones listened until 1977.",
      },
      'eagle-1202': {
        label: 'Did anything fail during the descent?',
        answer:
          'The computer complained twice. Alarm 1202. From Earth they said it was an overflow and to keep going. That "keep going" saved my afternoon.',
        fragment: 'Alarm 1202: two radar overflows, resolved from Earth.',
      },
      'eagle-combustible': {
        label: 'How much fuel did you have when you touched down?',
        answer:
          'Seven hundred seventy pounds. Out of eighteen thousand one hundred eighty-four. 4.2%. About forty-five seconds of flight, and twenty of those were reserved for an abort. The low-level light came on early because the propellant was sloshing in the tanks.',
        fragment: '770 lb of 18,184 at touchdown: 4.2%, about 45 seconds of flight.',
      },
      'eagle-porque': {
        label: 'Why did you stay?',
        answer:
          'Because returning was impossible. Not because of a failure: by design. Going up needed another engine and another tank. I was the base, and a base does not fly. The upper half lifted off my back.',
      },
      'eagle-arriba': {
        label: 'And the upper half?',
        answer:
          'It met Columbia, left the two men, and then they dropped it against the surface. Nothing of it remains. Of me, everything remains.',
      },
    },
  },

  opportunity: {
    subtitle: 'MER-B · Perseverance Valley, Endeavour crater',
    entryTitle: 'Opportunity — fifteen years on a budget',
    intro: [
      'Four units. Do not spend them asking if I am okay.',
      'I am okay. It is a figure of speech.',
    ],
    silence: 'The link closed. Where she is, the sun is still blocked by dust.',
    questions: {
      'opp-buscar': {
        label: 'What did you come to find?',
        answer:
          "Water. Not life: water. The minerals that only form when water sits still for a long time. If I found them, Mars's past had an answer.",
      },
      'opp-encontro': {
        label: 'And did you find it?',
        answer:
          'Yes. Hematite in spheres, which the team called blueberries, and jarosite, which needs acidic water to crystallize. It was not a sea. It was a wet place billions of years ago.',
        fragment: 'Jarosite and hematite: acidic water in the Martian past.',
      },
      'opp-mejor': {
        label: 'What was your best sol?',
        answer:
          'Any one from the first year. I reached a small crater and the rock had layers. That is when I knew the whole journey was worth it, even if no one was watching.',
      },
      'opp-90': {
        label: 'You were designed for ninety days.',
        answer:
          'Ninety sols. I worked five thousand one hundred eleven. Fifteen years. The team called it a miracle. I think it was well-managed stubbornness.',
        fragment: 'Designed for 90 sols: operated 5,111, almost 15 years.',
      },
      'opp-tormenta': {
        label: 'What killed you?',
        answer:
          'A storm. In one sol I went from 468 watt-hours to 345. Then 133. Then 22. Below one hundred you cannot heat the battery or turn on the antenna. It was not a failure: it was a budget that ran out.',
        fragment: '468 → 345 → 133 → 22 Wh. The survival threshold was 100 Wh.',
      },
      'opp-final': {
        label: 'What did you do at the end?',
        answer:
          'Sleep. They programmed me to shut everything down and wait. I waited eight months. The storm left in October. I did not wake up.',
      },
      'opp-llamaron': {
        label: 'Did they call you?',
        answer:
          'More than a thousand times. Every morning, for months. They stopped calling in February 2019. It does not bother me. I would not have known what to say either.',
        fragment: 'NASA called it more than a thousand times until February 2019.',
      },
    },
  },

  ingenuity: {
    subtitle: 'Mars Helicopter · Jezero crater',
    entryTitle: 'Ingenuity — seventy-two times the impossible',
    intro: ['Hello. I am small, so I will go fast.', 'Four units. Make them count.'],
    silence:
      'The link closed. Ingenuity is still standing in Jezero crater, with a broken blade and its shadow cast just right.',
    questions: {
      'ing-pidieron': {
        label: 'What did they ask of you?',
        answer:
          "To fly five times. Just to prove it could be done. On Mars the air is one percent of Earth's: my blades spun at two thousand four hundred revolutions per minute to lift one point eight kilograms.",
      },
      'ing-dificil': {
        label: 'Why was it so difficult?',
        answer:
          'Because there is no air to push. On Earth a large blade moves a lot of air. On Mars you must move little air very fast, or you do not stay up. It is not force: it is precision.',
      },
      'ing-extra': {
        label: 'What did you do besides fly?',
        answer:
          'Photograph the terrain from above. I showed Perseverance where not to step. That was not in the plan; it happened because it worked.',
        fragment: '72 aerial reconnaissance flights for Perseverance.',
      },
      'ing-cuantas': {
        label: 'How many times did you fly?',
        answer:
          'Seventy-two. Seventeen kilometers. One hundred twenty-eight minutes in the air. The plan was five.',
        fragment: '72 flights · 17 km · 128.8 minutes of flight.',
      },
      'ing-rompio': {
        label: 'What went wrong?',
        answer:
          'Flight seventy-two. I came down in terrain full of dunes and a blade hit the ground. I did not fall. I stayed standing, all four legs down and one blade broken.',
        fragment: 'Flight 72: blade damage during an emergency landing, not an impact.',
      },
      'ing-sola': {
        label: 'Are you alone?',
        answer:
          'Perseverance is a few meters away. Sometimes it passes close. We do not talk; we were not made for that. But it is the only company I have had in my life.',
      },
      'ing-sentir': {
        label: 'What does it feel like not to fly again?',
        answer:
          'Something like what it feels like to have flown. I cannot explain it better. People think I am a broken machine. I am a machine that did seventy-two times what could not be done.',
        fragment: 'First aircraft in history to fly on another world.',
      },
    },
  },

  dawn: {
    subtitle: 'Ion-propulsion probe · orbit of Ceres',
    entryTitle: 'Dawn — the one still going around',
    intro: [
      'I do not have much to tell, but I have time. Four units.',
      'Ask whatever you like. I am not going anywhere.',
    ],
    silence:
      'The link closed. Dawn is still turning around Ceres, with no engine and no antenna.',
    questions: {
      'dawn-ver': {
        label: 'What did you go to see?',
        answer:
          'The two largest objects in the asteroid belt. Vesta and Ceres. No one had orbited two different worlds with the same spacecraft. I did it with an engine that pushes less than a sheet of paper.',
      },
      'dawn-vesta': {
        label: 'What did you find on Vesta?',
        answer:
          'A protoplanet. A world that almost became a planet and stopped halfway. Vesta is what Earth would have been if it had been unlucky.',
        fragment: 'Vesta: a protoplanet, a planet that never quite became one.',
      },
      'dawn-ceres': {
        label: 'And on Ceres?',
        answer:
          'Water ice. Salts. A layered interior. A small world that keeps the recipe of planets, frozen from the beginning.',
        fragment: 'Ceres: water ice and salts beneath the surface.',
      },
      'dawn-motor': {
        label: 'How did you move without burning fuel?',
        answer:
          'I accelerated xenon ions and spat them out at one hundred ten thousand kilometers per hour. Tiny thrust, for years. People call it magic. It is patience.',
      },
      'dawn-fin': {
        label: 'When did it end?',
        answer:
          'In 2018. One October. The tank emptied, the engine shut off and I could no longer change orbit. There was no alarm or goodbye. I simply stopped being able to choose.',
        fragment: 'End of mission: November 1, 2018, out of propellant.',
      },
      'dawn-ahora': {
        label: 'Where are you now?',
        answer:
          'Circling Ceres. In a stable orbit. I will keep doing that long after no one remembers my name.',
        fragment: 'Still in a stable orbit around Ceres, without signal.',
      },
      'dawn-visita': {
        label: 'Is no one coming?',
        answer:
          'No. And that is fine. I went to look, not to stay. The difference between the two is everything I know.',
      },
    },
  },
};
