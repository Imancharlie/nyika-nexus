import type { LearningArticle, LearningCategory } from "@/types";
import { IMG } from "./images";

export const learningCategories: LearningCategory[] = [
  { id: "kilimo-mazao", name: "Kilimo cha Mazao", emoji: "🌱" },
  { id: "ufugaji", name: "Ufugaji", emoji: "🐄" },
  { id: "magonjwa", name: "Magonjwa ya Mimea", emoji: "🌿" },
  { id: "wadudu", name: "Wadudu", emoji: "🐛" },
  { id: "umwagiliaji", name: "Umwagiliaji", emoji: "💧" },
  { id: "mbegu", name: "Mbegu", emoji: "🌾" },
  { id: "mbolea", name: "Mbolea", emoji: "🧪" },
  { id: "teknolojia", name: "Teknolojia za Kilimo", emoji: "🚜" },
  { id: "biashara", name: "Biashara ya Kilimo", emoji: "💼" },
];

export const learningArticles: LearningArticle[] = [
  {
    id: "magonjwa-ya-nyanya",
    title: "Magonjwa ya Nyanya",
    categoryId: "magonjwa",
    description:
      "Tambua magonjwa makuu ya nyanya, dalili zake na hatua za kuchukua mapema.",
    readTime: 8,
    image: IMG.tomatoes,
    author: "Dkt. Amina Juma",
    sections: [
      {
        title: "Utangulizi",
        body: "Nyanya ni mmojawapo wa mazao muhimu kwa wakulima wa Tanzania, lakini hupata magonjwa yanayoweza kupoteza mavuno yote ikiwa hayatachukuliwa hatua mapema. Kujua dalili za awali ndiyo ufunguo wa kupata mavuno mazuri.",
      },
      {
        title: "Vileua vya kawaida",
        body: "Vileua vya ndege (early blight) vinaonekana kama madoa ya kahawia yenye mistari mitatu juu ya majani ya chini. Vileua vya kuchucha (late blight) vinasababisha madoa meusi mawilimbili yanayong'ara haraka na kuenea kwa unyevu wa juu.",
      },
      {
        title: "Vimelea na wadudu",
        body: "Kutokwa kwa majani kunayoanza kuwaka ni dalili ya virusi ya dalili ya majani (leaf curl virus), inayosambazwa na nzi mwekundu. Ukiona majani yanayofumba na kunyoosha, toa mmea husika mara moja.",
      },
      {
        title: "Ushauri wa mtaalamu",
        body: "Mzunguko wa mazao ni muhimu. Usilime nyanya mahali pale ulilima miaka iliyopita. Pande mbegu za aina zinazostahimili magonjwa na hakikisha unatenganisha mmea mgonjwa mapema.",
      },
    ],
    actions: [
      "Ondoa na choma mmea mgonjwa mbali na shamba",
      "Punguza unyevu usiku kwenye majani kwa kupanda kwa nafasi sahihi",
      "Tumia dawa ya kinga kabla ya magonjwa kuenea",
      "Badilisha mazao kila baada ya mavuno mawili",
    ],
    expertTip:
      "Tuma picha ya mmea wako kwa mtaalamu wa AGRIMIKA kupitia ukurasa wa Ushauri ili upate utambuzi wa haraka bila gharama ya kwanza.",
    relatedIds: ["kuzuia-wadudu-kabla-ya-kuathiri", "matumizi-sahihi-ya-mbolea"],
  },
  {
    id: "kupanda-mahindi-sahihi",
    title: "Kupanda Mahindi Kwa Njia Sahihi",
    categoryId: "kilimo-mazao",
    description:
      "Hatua kwa hatua za kupanda mahindi ili kupata mavuno mazuri na kinga dhidi ya wadudu.",
    readTime: 6,
    image: IMG.maize,
    author: "Bw. Emmanuel Lyimo",
    sections: [
      {
        title: "Utangulizi",
        body: "Mazao mazuri huanza na mbegu nzuri na maandalizi mazuri ya shamba. Kabla ya kupanda, chambua udongo na hakikisha pH yake iko kati ya 5.8 na 6.8.",
      },
      {
        title: "Kuchagua mbegu na wakati",
        body: "Chagua mbegu za aina fupi kwa msimu wa mvua na aina ndefu kwa msimu wa kiangazi. Panda baada ya mvua ya kwanza ya msimu, kwa kiasi cha kilo 25 hadi 30 kwa acre.",
      },
      {
        title: "Nafasi na mbolea ya kwanza",
        body: "Weka nafasi sentimita 75 kati ya mstari na sentimita 30 kati ya mmea. Weka mbolea ya kuanzia (DAP) wakati wa kupanda ili mizizi ipate virutubisho mapema.",
      },
    ],
    actions: [
      "Chambua udongo kabla ya msimu wa mvua",
      "Tumia mbegu za kisasa zinazostahimili ugonjwa wa mabaka",
      "Panda kwa kiasi cha kilo 25 hadi 30 kwa acre",
      "Wekeza mbolea ya kuanzia wakati wa kupanda",
    ],
    expertTip:
      "Mahindi hufaa zaidi pale alipolimwa awali. Kikoa cha Kilosa na Chamwino vina utabiri mzuri wa mavuno kwa kupanda Oktoba.",
    relatedIds: ["matumizi-sahihi-ya-mbolea", "kuchagua-mbegu-bora"],
  },
  {
    id: "matumizi-sahihi-ya-mbolea",
    title: "Matumizi Sahihi ya Mbolea",
    categoryId: "mbolea",
    description:
      "Jinsi ya kupima udongo na kuchagua kiasi sahihi cha mbolea bila kupoteza fedha.",
    readTime: 5,
    image: IMG.soil,
    author: "Bw. Emmanuel Lyimo",
    sections: [
      {
        title: "Kwa nini kupima udongo?",
        body: "Wakulima wengi hupiga mbolea bila kujima udongo wao unahitaji nini. Hii huongeza gharama na kuharibu mazingira. Kipimo cha udongo cha Sh. 40,000 kinaweza kuokoa mara nne gharama hiyo kwa msimu.",
      },
      {
        title: "Kiasi sahihi",
        body: "Kwa nyanya, kipimo kinachopendekezwa ni kilo 40 za DAP na kilo 30 za CAN kwa acre, ugawanyo: nusu wakati wa kupanda na nusu wakati wa kuongeza shina. Kwa mahindi: kilo 50 za DAP kwa acre.",
      },
      {
        title: "Makosa ya kawaida",
        body: "Kutumia mbolea nyingi mapema huchelewesha ukuaji wa mizizi. Mbolea ikiwekwa karibu na shina inaweza kuua mmea. Fuata maelekezo ya ripoti ya udongo.",
      },
    ],
    actions: [
      "Pima udongo kabla ya msimu",
      "Gawanya mbolea katika hatua mbili za matumizi",
      "Weke mbolea sentimita 10 kutoka shina",
      "Andika kiasi ulichotumia kila msimu",
    ],
    expertTip:
      "Omba huduma ya Uchambuzi wa Udongo kupitia AGRIMIKA ili upate mapendekezo maalum ya mbolea kwa shamba lako.",
    relatedIds: ["kupanda-mahindi-sahihi", "kuchagua-mbegu-bora"],
  },
  {
    id: "mbinu-za-umwagiliaji",
    title: "Mbinu za Umwagiliaji Rasilimali",
    categoryId: "umwagiliaji",
    description:
      "Okoa maji na ongeza tija kwa kutumia mbinu sahihi za umwagiliaji kwa nyanya na mboga.",
    readTime: 7,
    image: IMG.irrigation,
    author: "Bi. Zawadi Mnyika",
    sections: [
      {
        title: "Umwagiliaji wa matone",
        body: "Mfumo wa matone hutoa maji moja kwa moja kwenye mizizi. Hupunguza matumizi ya maji kwa hadi 60% ikilinganishwa na kuparaza kwa mwaka mzima, na hupunguza magonjwa ya majani kwa sababu majani hukaa mikavu.",
      },
      {
        title: "Kupanga rasilimali",
        body: "Andika ratiba ya umwagiliaji kulingana na msimu: nyanya zinahitaji lita 2 hadi 3 kwa mmea kila siku katika msimu wa makavu, na nusu yake wakati wa msimu wa mvua.",
      },
      {
        title: "Kukagua mfumo",
        body: "Siku za jumatatu, kagua mabomba na matone. Mviringo mmoja uliofungwa unaweza kupoteza maji kwa wiki nzima bila kugundulika.",
      },
    ],
    actions: [
      "Anza na mfumo wa matone kwa eneo dogo la majaribio",
      "Kagua mabomba kila wiki",
      "Kusanya maji ya mvua kwa matumizi ya ziada",
      "Weka ratiba maandishi ya umwagiliaji",
    ],
    expertTip:
      "Ushauri: weka vali kwenye kila kistooni cha umwagiliaji ili kudhibiti kila eneo kwa pekee.",
    relatedIds: ["teknolojia-ya-kilimo-dijitali", "magonjwa-ya-nyanya"],
  },
  {
    id: "kuzuia-wadudu-kabla-ya-kuathiri",
    title: "Kuzuia Wadudu Kabla ya Kuathiri",
    categoryId: "wadudu",
    description:
      "Njia za asili na za kisasa za kuzuia wadudu kabla hawajaleta hasara shambani.",
    readTime: 4,
    image: IMG.spraying,
    author: "Dkt. Grace Mushi",
    sections: [
      {
        title: "Kinga bora kuliko matibabu",
        body: "Kulima shamba safi, kutenganisha mmea mgonjwa na kutumia mazao mseto hupunguza uhitaji wa dawa kwa nusu. Wadudu huingia shambani kutokana na magonjwa na mimea isiyokuwa na afya.",
      },
      {
        title: "Mazao mseto na mizizi ya mimea",
        body: "Kupanda pamoja na nyasi za kulima (kama beans kati ya mahindi) huvutia wadudu wanaotafuta mmea mmoja tu na hupunguza uharibifu. Mimea ya kupanda kama sukuma wiki hutumia wadudu wa nyuki kama mtego.",
      },
      {
        title: "Lini kupulizia?",
        body: "Pulizia asubuhi jioni wakati wadudu wapo juu ya majani na hewa iko tulivu. Epuka kupulizia wakati wa jua kali au wakati wa upepo mkali.",
      },
    ],
    actions: [
      "Safisha mashamba ya mazao yaliyovunwa",
      "Tumia mazao mseto badala ya mmea mmoja",
      "Pulizia asubuhi au jioni",
      "Tengeneza mtego wa nyuki kwa mazao ya karibu",
    ],
    expertTip:
      "Ukiwa na shaka, tuma picha ya tundu au mmea kwa mtaalamu wa AGRIMIKA kabla ya kununua dawa yoyote.",
    relatedIds: ["magonjwa-ya-nyanya", "kupanda-mahindi-sahihi"],
  },
  {
    id: "kuchagua-mbegu-bora",
    title: "Kuchagua Mbegu Bora",
    categoryId: "mbegu",
    description:
      "Vipimo muhimu vya kuchagua mbegu zinazostahimili hali ya hewa na magonjwa ya eneo lako.",
    readTime: 5,
    image: IMG.crops,
    author: "Bw. Joseph Komba",
    sections: [
      {
        title: "Mbegu asili au za kisasa?",
        body: "Mbegu za kisasa hutoa mavuno makubwa na kustahimili magonjwa, lakini hazitumiki tena msimu unaofuata. Mbegu za asili zinahifadhiwa na kustahimisha ukame, lakini hutoa mavuno ya chini. Mchanganyiko wa mbili ndio bora.",
      },
      {
        title: "Kuhifadhi mbegu",
        body: "Hifadhi mbegu kwenye chupa ya kioo yenye kifuniko, mahali pa giza na kavu. Mbegu za mahindi hushika uwezo wa kupanda kwa miaka miwili ikiwa hazijapoa.",
      },
      {
        title: "Kununua mbegu",
        body: "Nunua daima kwenye maduka yaliyoidhinishwa na kupitia alama ya muda wa kuisha. Kila mfuko una tarehe ya kuharibika — kuandika humaliza.",
      },
    ],
    actions: [
      "Nunua mbegu kwenye maduka yaliyoidhinishwa",
      "Angalia tarehe ya kuisha kwenye kifurushi",
      "Hifadhi mbegu kwenye chupa yenye kifuniko",
      "Jaribu aina mbili kwenye eneo dogo la majaribio",
    ],
    relatedIds: ["kupanda-mahindi-sahihi", "matumizi-sahihi-ya-mbolea"],
  },
  {
    id: "biashara-ya-mazao-sokoni",
    title: "Kuuza Mazao Sokoni: Mwongozo",
    categoryId: "biashara",
    description:
      "Jinsi ya kupata bei bora, kuhifadhi mazao na kufanya mazagazo bila kudanganyika.",
    readTime: 9,
    image: IMG.harvest,
    author: "Neema Mushi",
    sections: [
      {
        title: "Kujua bei ya soko",
        body: "Kabla ya kupeleka mazao, angalia bei ya soko la karibu kwa siku tatu mfululizo. Bei hubadilika sana kulingana na muda wa siku — kupeleka siku ya Jumatatu mara nyingi hupata bei bora kuliko Ijumaa.",
      },
      {
        title: "Kuhifadhi ili kupata bei",
        body: "Nyanya na viazi vinaweza kuhifadhiwa kwa wiki 2 katika kisanduku cha kivuli chenye hewa. Wakati huo bei inapanda unauza kwa faida zaidi. Epuka kuhifadhi kwenye mkeka wa plastiki — huchelewesha uharibifu.",
      },
      {
        title: "Kufanya mazagazo",
        body: "Kagua kila gunia kabla ya kulipwa. Andika mazagazo yote. Kama bei inaonekana ya chini sana, piga simu kwa wakulima wenzako wa eneo lile kabla ya kukubali.",
      },
    ],
    actions: [
      "Fuata bei ya soko kwa siku tatu kabla ya kupeleka",
      "Hifadhi mazao mahali pa kivuli na hewa",
      "Kagua gunia kabla ya kulipwa",
      "Andika mazagazo yote ya muda mmoja",
    ],
    expertTip:
      "Ungana na kikundi cha wakulima wa eneo lako. Kuuza pamoja hupunguza gharama ya usafiri na kuongeza nguvu ya bei.",
    relatedIds: ["magonjwa-ya-nyanya", "matumizi-sahihi-ya-mbolea"],
  },
  {
    id: "ufugaji-wa-kuku-kwa-nafasi-ndogo",
    title: "Ufugaji wa Kuku Kwa Nafasi Ndogo",
    categoryId: "ufugaji",
    description:
      "Anza ufugaji wa kuku mayai kwenye eneo dogo la nyumbani na upate mapato ya kila siku.",
    readTime: 6,
    image: IMG.garden,
    author: "Bw. Joseph Komba",
    sections: [
      {
        title: "Kuanzia na kiasi gani?",
        body: "Kwa nafasi ya mita 100 za mraba unaweza kufuga kuku 10 hadi 15. Anza na kuku 5 wa mayai, jifunze mzunguko wa chakula na magonjwa, kisha ongeza taratibu.",
      },
      {
        title: "Chakula na maji",
        body: "Chakula kinachukua hadi 70% ya gharama. Kuchanganya chakula mwenyewe (mahindi, samaki, kunde) hupunguza gharama kwa theluthi. Maji mapya kila siku ni lazima.",
      },
      {
        title: "Afya ya kuku",
        body: "Safisha kabati mara moja kwa wiki na toa kuku kila siku asubuhi. Kuku 10 wanahitaji nafasi ya mita 4 za mraba ya nje ili kupunguza mgonjwa.",
      },
    ],
    actions: [
      "Anza na kuku 5 wa mayai",
      "Tengeneza chakula mwenyewe kwa kuchanganya",
      "Safisha kabati kila wiki",
      "Andika idadi ya mayai kila siku",
    ],
    expertTip:
      "Ufungaji wa kuku ni fursa nzuri ya mikopo midogo — angalia fursa za Mtaji kwenye ukurasa wa Mikopo.",
    relatedIds: ["biashara-ya-mazao-sokoni", "teknolojia-ya-kilimo-dijitali"],
  },
  {
    id: "teknolojia-ya-kilimo-dijitali",
    title: "Teknolojia za Kilimo Dijitali",
    categoryId: "teknolojia",
    description:
      "Tumia simu yako kuangalia hali ya hewa, bei za soko na ushauri wa wataalamu.",
    readTime: 5,
    image: IMG.tractor,
    author: "Bi. Zawadi Mnyika",
    sections: [
      {
        title: "Simu yako ni kifaa cha kilimo",
        body: "Simu ya kawaida inaweza kutumika kupata taarifa za hali ya hewa, bei za mazao na ushauri wa mtaalamu. Hakuna haja ya kompyuta wala mafunzo maalum.",
      },
      {
        title: "Ratiba kulingana na hali ya hewa",
        body: "Panga upandaji na matibabu kulingana na utabiri wa mvua. Kupanda siku chache kabla ya mvua huokoa umwagiliaaji na hupunguza magonjwa ya kuvimba kwa unyevu.",
      },
      {
        title: "Muunganisho wa huduma",
        body: "Maombi kama AGRIMIKA huunganisha huduma, wataalamu na elimu mahali pamoja. Omba huduma, pata ushauri na jifunze bila kuondoka nyumbani.",
      },
    ],
    actions: [
      "Angalia utabiri wa hali ya hewa kabla ya kupanda",
      "Hifadhi namba za wataalamu unaowafuata",
      "Tumia maombi ya miliki kupata huduma za haraka",
      "Andika kumbukumbu za shamba kwenye daftari lako la simu",
    ],
    expertTip:
      "AGRIMIKA inakuunganisha na wataalamu halisi wa kilimo. Wasiliana nao kwa ushauri wa haraka kupitia ukurasa wa Ushauri.",
    relatedIds: ["mbinu-za-umwagiliaji", "biashara-ya-mazao-sokoni"],
  },
];

export const findArticle = (id?: string) =>
  learningArticles.find((article) => article.id === id);

export const categoryName = (id: string) =>
  learningCategories.find((category) => category.id === id)?.name ?? id;

export const categoryEmoji = (id: string) =>
  learningCategories.find((category) => category.id === id)?.emoji ?? "🌱";
