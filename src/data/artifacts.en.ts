import type { Artifact } from './artifacts';

type ArtifactText = Pick<
  Artifact,
  'machine' | 'place' | 'statusLabel' | 'facts' | 'voice' | 'note'
>;

/** Traducciones al inglés; la estructura (modelos, cámaras, paletas) no se duplica. */
export const ARTIFACT_TEXT_EN: Record<string, ArtifactText> = {
  eagle: {
    machine: 'Lunar module · descent stage',
    place: 'Sea of Tranquility, Moon',
    statusLabel: 'Dormant — one window still answers',
    facts: {
      what:
        'Seven meters tall with its legs deployed and about fifteen tonnes at liftoff from Earth. The lower half was the base: the engine that braked the fall and the tank that fed the return. Above sat the cabin where two people traveled.',
      why:
        'To carry two people to the lunar surface and bring them back alive. The descent stage was too heavy to return, so the plan was to leave it there from day one: it became the launch platform for the upper half.',
      found:
        'It came home with 21.5 kg of lunar rocks and dust. And it left something still working: a quartz retroreflector that still bounces back the lasers we fire at it from Earth. Its seismometer shut down after a few weeks from overheating; the ones left by later missions listened to the Moon until 1977.',
      now:
        'It is still in the Sea of Tranquility, where it landed on July 20, 1969. The ascent stage lifted off, returned to orbit and later crashed into the Moon. The descent stage never moved.',
    },
    voice:
      'I was the pedestal for the first human step. When Armstrong climbed down, I was already here, and here I remain. My engine went silent forever, but one of my quartz windows still returns their light. Every so often someone aims a laser at me from Earth. It is the closest thing to a conversation I have.',
    note:
      'The model you see is the complete module. Only the lower half stayed on the Moon: the upper half left and crashed into the surface.',
  },

  opportunity: {
    machine: 'Rover · solar power · six wheels',
    place: 'Perseverance Valley, Endeavour crater, Mars',
    statusLabel: 'Silent since June 2018',
    facts: {
      what:
        'A 185 kg rover, the size of a golf cart, with six wheels and solar panels. It landed in January 2004 inside an airbag that bounced about twenty-six times before stopping.',
      why:
        "To look for evidence that Mars once had liquid water. Not to look for life: to look for the minerals that only form when water sits still for a long time.",
      found:
        'It found hematite "blueberries" and jarosite crystals: minerals that need water to form. It drove 45.16 kilometers — more than a marathon — on a planet where it was designed to travel 600 meters.',
      now:
        'It is in Perseverance Valley, at the edge of Endeavour crater. Its last communication arrived on June 10, 2018, during a global dust storm that covered the Sun. NASA called it more than a thousand times until February 2019. It never answered.',
    },
    voice:
      'They built me for ninety Martian days. I worked for almost fifteen years. I learned to survive dust storms, climb hills, cross an entire crater. The last storm was too big: the sun stopped reaching my panels. I did not shut down all at once. I went still, wheels pointed at the horizon, waiting for light.',
    note:
      'The phrase "my battery is low and it is getting dark" was not a message from it: it is how a JPL engineer translated its last telemetry.',
  },

  ingenuity: {
    machine: 'Helicopter · four blades · 1.8 kg',
    place: 'Jezero crater, Mars',
    statusLabel: 'Grounded since January 2024',
    facts: {
      what:
        'A 1.8 kg helicopter with four carbon-fiber blades spinning at about 2,400 revolutions per minute. It traveled to Mars folded under the belly of the Perseverance rover, inside a protective shell.',
      why:
        "To prove something that seemed impossible: flying in an atmosphere that is 1% of Earth's. On Mars the blades must spin much faster than on Earth just to hold the same weight.",
      found:
        'It made 72 flights, covered 17 kilometers and spent almost 129 minutes in the air. On April 19, 2021, it became the first aircraft in history to fly on another world.',
      now:
        'It is in Jezero crater. On its 72nd flight, during an emergency landing, one of its blades was damaged against the ground. It no longer flies, but it is still standing, with all four legs on Mars.',
    },
    voice:
      'They called me "the demonstrator." No one expected me to fly more than five times. I flew seventy-two. When a blade broke I did not fall: I stayed standing. Now I am the only object on Mars that casts the shadow of a helicopter.',
    note:
      'It did not crash: a hard landing damaged a rotor blade. NASA announced it in January 2024.',
  },

  dawn: {
    machine: 'Probe · ion propulsion · 1,200 kg',
    place: 'Orbit of Ceres, asteroid belt',
    statusLabel: 'Out of fuel, out of signal, in orbit',
    facts: {
      what:
        'A 1,200 kg spacecraft with an ion engine. Instead of burning fuel, it accelerates xenon ions and expels them at about 110,000 km/h. It pushes very little, but it can do so for years without stopping.',
      why:
        'To visit the two largest objects in the asteroid belt, Vesta and Ceres, and understand how planets formed. No one had orbited two different worlds with the same spacecraft.',
      found:
        'Vesta turned out to be a protoplanet: a planet that almost made it. On Ceres it found water ice, salts and a layered interior. Dawn was the first spacecraft in history to orbit two bodies in the solar system.',
      now:
        'Since 2018 it has been in a stable orbit around Ceres, without fuel and without signal. It did not crash or return: it stayed circling, like a satellite of a world that never had a sea.',
    },
    voice:
      'I never landed anywhere. I passed by, looked, and kept going. Now I circle Ceres, with no engine and my antenna off. No one is coming to look for me. But I keep turning, and for a machine, that is a way of staying.',
  },
};
