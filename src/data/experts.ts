import type { Expert } from "@/types";
import { avatar } from "./images";

export const experts: Expert[] = [
  {
    id: "amina-juma",
    name: "Dkt. Amina Juma",
    title: "Mtaalamu wa magonjwa ya mimea",
    specialties: ["Magonjwa ya mimea", "Nyanya", "Mboga"],
    experience: "Miaka 12 ya uzoefu",
    location: "Morogoro",
    availability: "Inapatikana leo",
    phone: "+255 754 123 456",
    bio: "Daktari wa kilimo aliyejikita katika utafiti wa magonjwa ya mazao ya mboga. Amesaidia zaidi ya wakulima 2,000 katika kanda ya kati.",
    avatar: avatar("Amina"),
  },
  {
    id: "emmanuel-lyimo",
    name: "Bw. Emmanuel Lyimo",
    title: "Mtaalamu wa udongo na mbolea",
    specialties: ["Uchambuzi wa udongo", "Mbolea", "Mahindi"],
    experience: "Miaka 9 ya uzoefu",
    location: "Dodoma",
    availability: "Inapatikana kesho",
    phone: "+255 762 345 678",
    bio: "Mtaalamu wa udongo anayehudumia wakulima wadogo na wa kati. Huendesha vipimo vya udongo na kutoa mapendekezo ya mbolea.",
    avatar: avatar("Emmanuel"),
  },
  {
    id: "grace-mushi",
    name: "Dkt. Grace Mushi",
    title: "Mtaalamu wa wadudu na fumigation",
    specialties: ["Wadudu", "Fumigation", "Kinga ya mazao"],
    experience: "Miaka 15 ya uzoefu",
    location: "Mbeya",
    availability: "Inapatikana sasa",
    phone: "+255 755 987 654",
    bio: "Mtaalamu mkuu wa fumigation Mika Venture. Anaongoza timu ya fumigation na mafunzo ya wakulima kuhusu kinga ya wadudu.",
    avatar: avatar("Grace"),
  },
  {
    id: "joseph-komba",
    name: "Bw. Joseph Komba",
    title: "Mtaalamu wa ufugaji",
    specialties: ["Ufugaji wa kuku", "Mifugo midogo", "Chakula cha mifugo"],
    experience: "Miaka 7 ya uzoefu",
    location: "Arusha",
    availability: "Inapatikana Jumatatu",
    phone: "+255 784 555 121",
    bio: "Mshauri wa ufugaji anayehudumia vikundi vya wakulima na ufugaji wa kwa nafasi ndogo nyumbani.",
    avatar: avatar("Joseph"),
  },
  {
    id: "zawadi-mnyika",
    name: "Bi. Zawadi Mnyika",
    title: "Mtaalamu wa umwagiliaji na teknolojia",
    specialties: ["Umwagiliaaji", "Mifumo ya matone", "Teknolojia"],
    experience: "Miaka 6 ya uzoefu",
    location: "Iringa",
    availability: "Inapatikana leo",
    phone: "+255 713 222 334",
    bio: "Mhandisi wa umwagiliaji anayesaidia wakulima kujenga mifumo nafuu ya umwagiliaji wa matone.",
    avatar: avatar("Zawadi"),
  },
];

export const findExpert = (id?: string) =>
  experts.find((expert) => expert.id === id);
