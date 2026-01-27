export type BuildingType = {
    code: string; // ISO 3166-1 alpha-2
    name: string;
    icon: string;
};

export type UsageDestination = {
  code: string;
  name: string;
};

export type EnergyUsageType = {
  code: string;
  name: string;
  description:string
};

export type CadastralCategory = {
  code: string;
  name: string;
  description: string;
  group: "A" | "B" | "C" | "D" | "E" | "F";
};



export const buildingType: BuildingType[] = [
    {
        code: "APARTMENT",
        name: "Appartamento",
        icon: "apartment",
    },
    {
        code: "DETACHED_HOUSE",
        name: "Casa indipendente",
        icon: "home",
    },
    {
        code: "SEMI_DETACHED",
        name: "Casa bifamiliare",
        icon: "home-split",
    },
    {
        code: "TERRACED",
        name: "Casa a schiera",
        icon: "rows",
    },
    {
        code: "CONDOMINIUM",
        name: "Condominio",
        icon: "building",
    },
    {
        code: "FARMHOUSE",
        name: "Casa rurale / Cascina",
        icon: "farm",
    },
];

const buildingTypeMap = Object.fromEntries(
  buildingType.map(bt => [bt.code, bt])
) as Record<string, BuildingType>;
export const getBuildingType = (code?: string) =>
  code ? buildingTypeMap[code] : undefined;


export const usageDestination: UsageDestination[] = [
  {
    code: "MAIN_RESIDENCE",
    name: "Abitazione principale",
  },
  {
    code: "SECOND_HOME",
    name: "Seconda casa",
  },
  {
    code: "RENTAL",
    name: "Locazione / Affitto",
  },
  {
    code: "OFFICE",
    name: "Ufficio",
  },
  {
    code: "COMMERCIAL",
    name: "Commerciale",
  },
  {
    code: "WAREHOUSE",
    name: "Magazzino / Deposito",
  },
];

const usageDestinationMap = Object.fromEntries(
  usageDestination.map(ud => [ud.code, ud])
) as Record<string, UsageDestination>;
export const getUsageDestination = (code?: string) =>
  code ? usageDestinationMap[code] : undefined;


export const energyUsageType: EnergyUsageType[] = [
  {
    code: "E1_RESIDENTIAL",
    name: "E.1 – Residenziale",
    description:
      "Edifici adibiti a residenza o assimilabili: abitazioni, condomini, case singole, residenze collettive.",
  },
  {
    code: "E2_OFFICE",
    name: "E.2 – Uffici e assimilabili",
    description:
      "Edifici destinati a uffici pubblici o privati, studi professionali e attività amministrative.",
  },
  {
    code: "E3_HEALTHCARE",
    name: "E.3 – Ospedali, cliniche e case di cura",
    description:
      "Strutture sanitarie pubbliche o private: ospedali, cliniche, case di cura e assimilabili.",
  },
  {
    code: "E4_RECREATIONAL",
    name: "E.4 – Attività ricreative e culturali",
    description:
      "Edifici destinati ad attività ricreative, associative, culturali o di culto: cinema, teatri, musei, luoghi di culto.",
  },
  {
    code: "E5_COMMERCIAL",
    name: "E.5 – Attività commerciali",
    description:
      "Edifici adibiti ad attività commerciali e assimilabili: negozi, supermercati, ristoranti, bar.",
  },
  {
    code: "E6_SPORTS",
    name: "E.6 – Attività sportive",
    description:
      "Edifici per attività sportive: palestre, piscine, centri sportivi, spogliatoi.",
  },
  {
    code: "E7_EDUCATIONAL",
    name: "E.7 – Attività scolastiche",
    description:
      "Edifici destinati all’istruzione e formazione: scuole di ogni ordine e grado, università.",
  },
  {
    code: "E8_INDUSTRIAL",
    name: "E.8 – Attività industriali e artigianali",
    description:
      "Edifici destinati ad attività produttive industriali e artigianali, capannoni e laboratori.",
  },
  {
    code: "E9_OTHER",
    name: "E.9 – Altri edifici",
    description:
      "Edifici non classificabili nelle categorie precedenti o con destinazioni d’uso particolari.",
  },
];

const energyUsageTypeMap = Object.fromEntries(
  energyUsageType.map(ud => [ud.code, ud])
) as Record<string, EnergyUsageType>;
export const getEnergyUsageType = (code?: string) =>
  code ? energyUsageTypeMap[code] : undefined;


export const cadastralCategories: CadastralCategory[] = [
  // =====================
  // GRUPPO A – Abitazioni
  // =====================
  {
    code: "A/1",
    name: "Abitazione di tipo signorile",
    description: "Unità immobiliari con finiture di pregio e caratteristiche superiori alla media.",
    group: "A",
  },
  {
    code: "A/2",
    name: "Abitazione civile",
    description: "Abitazioni con caratteristiche costruttive e di finitura ordinarie.",
    group: "A",
  },
  {
    code: "A/3",
    name: "Abitazione economica",
    description: "Abitazioni con finiture semplici e servizi essenziali.",
    group: "A",
  },
  {
    code: "A/4",
    name: "Abitazione popolare",
    description: "Abitazioni con caratteristiche costruttive molto modeste.",
    group: "A",
  },
  {
    code: "A/5",
    name: "Abitazione ultrapopolare",
    description: "Abitazioni di bassissimo livello qualitativo (oggi non più attribuibile).",
    group: "A",
  },
  {
    code: "A/6",
    name: "Abitazione rurale",
    description: "Abitazioni legate all’attività agricola.",
    group: "A",
  },
  {
    code: "A/7",
    name: "Villini",
    description: "Abitazioni unifamiliari o bifamiliari con area di pertinenza.",
    group: "A",
  },
  {
    code: "A/8",
    name: "Ville",
    description: "Abitazioni di pregio con parco o giardino e caratteristiche di lusso.",
    group: "A",
  },
  {
    code: "A/9",
    name: "Castelli e palazzi storici",
    description: "Immobili di rilevante valore storico o artistico.",
    group: "A",
  },
  {
    code: "A/10",
    name: "Uffici e studi privati",
    description: "Unità immobiliari destinate ad attività professionali.",
    group: "A",
  },
  {
    code: "A/11",
    name: "Abitazioni tipiche dei luoghi",
    description: "Abitazioni con caratteristiche costruttive tradizionali locali.",
    group: "A",
  },

  // =====================
  // GRUPPO B – Collettivi
  // =====================
  {
    code: "B/1",
    name: "Collegi, convitti, educandati",
    description: "Strutture destinate all’istruzione e all’alloggio collettivo.",
    group: "B",
  },
  {
    code: "B/2",
    name: "Case di cura e ospedali",
    description: "Strutture sanitarie senza fine di lucro.",
    group: "B",
  },
  {
    code: "B/3",
    name: "Carceri e riformatori",
    description: "Edifici destinati alla detenzione.",
    group: "B",
  },
  {
    code: "B/4",
    name: "Uffici pubblici",
    description: "Edifici destinati a funzioni amministrative pubbliche.",
    group: "B",
  },
  {
    code: "B/5",
    name: "Scuole e laboratori scientifici",
    description: "Edifici destinati all’istruzione.",
    group: "B",
  },
  {
    code: "B/6",
    name: "Biblioteche, musei, pinacoteche",
    description: "Edifici destinati alla cultura.",
    group: "B",
  },
  {
    code: "B/7",
    name: "Cappelle e oratori",
    description: "Luoghi di culto non destinati all’esercizio pubblico.",
    group: "B",
  },
  {
    code: "B/8",
    name: "Magazzini sotterranei",
    description: "Locali di deposito interrati.",
    group: "B",
  },

  // =====================
  // GRUPPO C – Pertinenze
  // =====================
  {
    code: "C/1",
    name: "Negozi e botteghe",
    description: "Locali destinati ad attività commerciali.",
    group: "C",
  },
  {
    code: "C/2",
    name: "Magazzini e locali di deposito",
    description: "Cantine, soffitte, depositi.",
    group: "C",
  },
  {
    code: "C/3",
    name: "Laboratori per arti e mestieri",
    description: "Laboratori artigianali.",
    group: "C",
  },
  {
    code: "C/4",
    name: "Fabbricati per esercizi sportivi",
    description: "Palestre e strutture sportive private.",
    group: "C",
  },
  {
    code: "C/5",
    name: "Stabilimenti balneari",
    description: "Stabilimenti termali o balneari.",
    group: "C",
  },
  {
    code: "C/6",
    name: "Autorimesse e posti auto",
    description: "Garage, box, posti auto.",
    group: "C",
  },
  {
    code: "C/7",
    name: "Tettoie chiuse o aperte",
    description: "Tettoie e strutture accessorie.",
    group: "C",
  },

  // =====================
  // GRUPPO D – Speciali
  // =====================
  {
    code: "D/1",
    name: "Opifici",
    description: "Immobili industriali per la produzione.",
    group: "D",
  },
  {
    code: "D/2",
    name: "Alberghi e pensioni",
    description: "Strutture ricettive.",
    group: "D",
  },
  {
    code: "D/3",
    name: "Teatri e cinema",
    description: "Immobili per spettacolo e intrattenimento.",
    group: "D",
  },
  {
    code: "D/4",
    name: "Case di cura con fine di lucro",
    description: "Strutture sanitarie private.",
    group: "D",
  },
  {
    code: "D/5",
    name: "Istituti di credito",
    description: "Banche e assicurazioni.",
    group: "D",
  },
  {
    code: "D/6",
    name: "Fabbricati sportivi",
    description: "Stadi e grandi impianti sportivi.",
    group: "D",
  },
  {
    code: "D/7",
    name: "Fabbricati industriali",
    description: "Immobili industriali non classificabili altrove.",
    group: "D",
  },
  {
    code: "D/8",
    name: "Fabbricati commerciali",
    description: "Centri commerciali e grandi superfici di vendita.",
    group: "D",
  },
  {
    code: "D/9",
    name: "Edifici galleggianti",
    description: "Costruzioni galleggianti o sospese.",
    group: "D",
  },
  {
    code: "D/10",
    name: "Fabbricati rurali strumentali",
    description: "Fabbricati agricoli strumentali.",
    group: "D",
  },

  // =====================
  // GRUPPO E – Pubblici
  // =====================
  {
    code: "E/1",
    name: "Stazioni di trasporto",
    description: "Stazioni ferroviarie, porti, aeroporti.",
    group: "E",
  },
  {
    code: "E/2",
    name: "Ponti e gallerie",
    description: "Infrastrutture di trasporto.",
    group: "E",
  },
  {
    code: "E/3",
    name: "Costruzioni speciali pubbliche",
    description: "Immobili pubblici speciali.",
    group: "E",
  },

  // =====================
  // GRUPPO F – Senza rendita
  // =====================
  {
    code: "F/1",
    name: "Area urbana",
    description: "Area edificabile senza costruzioni.",
    group: "F",
  },
  {
    code: "F/2",
    name: "Unità collabenti",
    description: "Fabbricati in stato di rovina.",
    group: "F",
  },
  {
    code: "F/3",
    name: "Unità in corso di costruzione",
    description: "Fabbricati non ancora ultimati.",
    group: "F",
  },
  {
    code: "F/4",
    name: "Unità in corso di definizione",
    description: "Fabbricati in fase di accatastamento.",
    group: "F",
  },
  {
    code: "F/5",
    name: "Lastrico solare",
    description: "Copertura praticabile.",
    group: "F",
  },
];




const cadastralCategoriesMap = Object.fromEntries(
  cadastralCategories.map(ud => [ud.code, ud])
) as Record<string, CadastralCategory>;
export const getCadastralCategoriese = (code?: string) =>
  code ? cadastralCategoriesMap[code] : undefined;

