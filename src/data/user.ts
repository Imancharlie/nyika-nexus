import type { Consultation } from "@/types";
import { avatar } from "./images";

export const currentUser = {
  name: "Juma Hassan",
  location: "Morogoro",
  bio: "Mkulima wa nyanya na mahindi.",
  phone: "+255 712 345 678",
  avatar: avatar("JumaHassan"),
};

export const initialConsultations: Consultation[] = [
  {
    id: "ush-001",
    problem:
      "Majani ya nyanya yangu yameanza kuyeyuka na kuwa na madoa ya njano chini. Nimekuwa nikipulizia dawa ya wadudu lakini haibadiliki.",
    cropType: "Nyanya",
    createdAt: "siku 2 zilizopita",
    status: "inajibiwa",
    expertName: "Dkt. Amina Juma",
    reply:
      "Kulingana na maelezo yako, inaonekana ni jangwani la kuchucha (late blight). Ondoa majani yaliyoathirika, punguza unyevu wa majani, na tumia dawa inayolingana na fomulation ya shamba lako. Wasiliana nami kwa picha zaidi.",
  },
];

export const cropTypes = [
  "Mahindi",
  "Nyanya",
  "Mpunga",
  "Viazi",
  "Maharage",
  "Korosho",
  "Alizeti",
  "Mazao mengine",
];
