import type { ServicePackage, ServiceRequest } from "@/types";
import { IMG } from "./images";

export const servicePackages: ServicePackage[] = [
  {
    id: "fumigation-basic",
    name: "Fumigation Basic",
    description: "Huduma ya fumigation kwa shamba lako.",
    serviceType: "Fumigation",
    coverage: "Hadi 1 acre",
    price: 50000,
    duration: "Saa 2 – 3",
    includes: [
      "Dawa ya fumigation yenye ubora",
      "Kifaa cha kupulizia",
      "Kazi ya fumigation nzima",
      "Ripoti ya huduma",
    ],
    benefits: [
      "Linda mazao yako dhidi ya wadudu na magonjwa",
      "Bei nafuu kwa mashamba madogo",
      "Huduma ya haraka siku moja",
    ],
    requirements: [
      "Shamba lifikelewe na gari au pikipiki",
      "Mkulima yupo shambani wakati wa huduma",
      "Maji ya kusafisha vifaa vinapatikana",
    ],
    serviceArea: "Morogoro, Dodoma na maeneo ya jirani",
  },
  {
    id: "fumigation-standard",
    name: "Fumigation Standard",
    description: "Huduma ya fumigation pamoja na tathmini ya awali ya shamba.",
    serviceType: "Fumigation",
    coverage: "Hadi 3 acres",
    price: 90000,
    duration: "Saa 4 – 5",
    includes: [
      "Tathmini ya awali ya shamba",
      "Dawa ya fumigation yenye ubora",
      "Kifaa cha kupulizia cha kisasa",
      "Kazi ya fumigation nzima",
      "Ripoti ya huduma na mapendekezo",
    ],
    benefits: [
      "Utambuzi wa tatizo kabla ya matibabu",
      "Kinga endelevu dhidi ya wadudu na magonjwa",
      "Ushauri wa msingi baada ya huduma",
    ],
    requirements: [
      "Shamba lifikelewe na gari au pikipiki",
      "Mkulima yupo shambani wakati wa tathmini",
      "Maji ya kutosha yanapatikana shambani",
    ],
    serviceArea: "Morogoro, Dodoma, Iringa na maeneo ya jirani",
    featured: true,
    image: IMG.spraying,
  },
  {
    id: "fumigation-premium",
    name: "Fumigation Premium",
    description: "Huduma kamili ya fumigation pamoja na ushauri wa kitaalamu.",
    serviceType: "Fumigation",
    coverage: "Hadi 5 acres",
    price: 150000,
    duration: "Siku 1 nzima",
    includes: [
      "Tathmini ya kina ya shamba na mazao",
      "Dawa maalum kwa tatizo lako",
      "Fumigation ya hatua nne",
      "Ushauri wa kitaalamu wa bure",
      "Ufuatiliaji wa siku 14",
      "Ripoti kamili ya shamba",
    ],
    benefits: [
      "Huduma kamili kutoka tathmini hadi ufuatiliaji",
      "Mtaalamu anayefuatilia maendeleo ya shamba lako",
      "Mapendekezo ya mbolea na mazao bora",
    ],
    requirements: [
      "Shamba lifikelewe na gari",
      "Mkulima yupo shambani wakati wa tathmini",
      "Ruhusa ya kuingia shambani",
    ],
    serviceArea: "Morogoro, Dodoma, Iringa, Mbeya na maeneo ya jirani",
    image: IMG.farmer,
  },
  {
    id: "soil-analysis",
    name: "Uchambuzi wa Udongo",
    description: "Uchambuzi wa udongo ili kujua mbolea na mazao bora kwa shamba lako.",
    serviceType: "Uchambuzi wa Udongo",
    coverage: "Vipimo 3 vya udongo",
    price: 40000,
    duration: "Siku 3 – 5",
    includes: [
      "Kukusanya vipimo vya udongo",
      "Uchambuzi maabara",
      "Ripoti ya pH na virutubisho",
      "Mapendekezo ya mbolea na mazao",
    ],
    benefits: [
      "Ongeza tija kwa kutumia mbolea sahihi",
      "Okoa gharama ya mbolea isiyo ya lazima",
      "Chagua mazao yanayofaa udongo wako",
    ],
    requirements: [
      "Vipimo 3 hadi 5 vya udongo kutoka maeneo tofauti",
      "Taarifa ya mazao yaliyolimwa awali",
    ],
    serviceArea: "Morogoro, Dodoma na maeneo ya jirani",
    image: IMG.soil,
  },
];

export const initialServiceRequests: ServiceRequest[] = [
  {
    id: "AGR-000118",
    packageId: "fumigation-premium",
    packageName: "Fumigation Premium",
    price: 150000,
    status: "imekamilika",
    createdAt: "12 Septemba 2026",
    preferredDate: "18 Septemba 2026",
    location: "Morogoro",
    farmLocation: "Kilosa",
    farmSize: "3 acres",
    cropType: "Nyanya",
    notes: "Yalikuwa na wadudu wa mmea wa nyanya.",
  },
  {
    id: "AGR-000123",
    packageId: "fumigation-standard",
    packageName: "Fumigation Standard",
    price: 90000,
    status: "inasubiri",
    createdAt: "2 Octoba 2026",
    preferredDate: "10 Octoba 2026",
    location: "Dodoma",
    farmLocation: "Chamwino",
    farmSize: "2 acres",
    cropType: "Mahindi",
    notes: "",
  },
];

export const findPackage = (id?: string) =>
  servicePackages.find((pkg) => pkg.id === id);
