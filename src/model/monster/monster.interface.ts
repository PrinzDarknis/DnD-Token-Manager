export interface Monster {
  link: string;
  source: string;
  name: string;

  imgLink?: string;

  type?: string;
  size?: string;
  alignment?: string;

  armorClass?: string;
  armorClassValue?: number;
  hitPoints?: {
    average: number;
    d4: number;
    d6: number;
    d8: number;
    d10: number;
    d12: number;
    d20: number;
    modifier: number;
  };
  speed?: string;

  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;

  damageVulnerabilities?: string;
  damageResistances?: string;
  damageImmunities?: string;
  conditionImmunities?: string;
  senses?: string;
  savingThrows?: [
    {
      name: string;
      value: number;
    },
  ];
  skills?: [
    {
      name: string;
      value: number;
    },
  ];
  languages?: string;
  challengeRating?: string;

  traits?: [
    {
      name: string;
      description: string;
    },
  ];
  actions?: [
    {
      name: string;
      description: string;
    },
  ];
  legendaryAction?: {
    description: string;
    actions: [
      {
        name?: string;
        description: string;
      },
    ];
  };
  mysticAction?: {
    description: string;
    actions: [
      {
        name?: string;
        description: string;
      },
    ];
  };
  lairAction?: {
    description: string;
    actions: [
      {
        name?: string;
        description: string;
      },
    ];
  };

  psionics?: {
    charges: number;
    recharge: string;
    fracture: string;
  };
}
