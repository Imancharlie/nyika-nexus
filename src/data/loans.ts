import type { Loan } from "@/types";

export const loans: Loan[] = [
  {
    id: "tadb-kilimo",
    institution: "Tanzania Agricultural Development Bank (TADB)",
    loanType: "Mkopo wa Kilimo",
    amount: "TZS 500,000 – 50,000,000",
    requirements: [
      "Usajili halali wa kikundi au kampuni",
      "Ramani ya shamba au mpango wa kilimo",
      "Rekodi ya mazao au mapato ya miezi 6",
      "Mdhamini mmoja",
    ],
    repayment: "Kuwa lango la mavuno, hadi miaka 3",
    howToApply:
      "Wasilisha maombi kupitia mataifa ya TADB au kwa mtandao wao wa maombi ya kidijitali.",
    cta: "omba",
  },
  {
    id: "crdb-agri",
    institution: "CRDB Bank",
    loanType: "Kilimo Biashara Loan",
    amount: "TZS 1,000,000 – 100,000,000",
    requirements: [
      "Kitambulisho cha NIDA",
      "Akaunti ya CRDB",
      "Uthibitisho wa shamba au mkataba wa ununuzi",
      "Dhamana ya mali au mdhamini",
    ],
    repayment: "Kila mwezi au kwa mavuno, hadi miaka 5",
    howToApply: "Tuma *150# au tembelea tawi lolote la CRDB na uchukue fomu.",
    cta: "omba",
  },
  {
    id: "nmb-kilimo",
    institution: "NMB Bank",
    loanType: "NMB Kilimo",
    amount: "TZS 500,000 – 30,000,000",
    requirements: [
      "Kitambulisho cha NIDA",
      "Akaunti ya NMB (au ufanusi wa kufungua)",
      "Mpango wa kilimo rahisi",
    ],
    repayment: "Kwa vipindi vya mavuno, hadi miaka 3",
    howToApply: "Simu kwa NMB *150# au tembelea taji la benki lako la karibu.",
    cta: "jifunze",
  },
  {
    id: "mikopo-mdogo",
    institution: "Vikundi vya Wadau wa Kilimo",
    loanType: "Mkopo Mdogo wa Kifurushi",
    amount: "TZS 100,000 – 2,000,000",
    requirements: [
      "Uanachama wa kikundi cha wakulima",
      "Hakuna haja ya dhamana ya mali",
      "Mkataba wa kulipa baada ya mavuno",
    ],
    repayment: "Baada ya mavuno, hadi miezi 6",
    howToApply:
      "Jiunge na kikundi cha wakulima kilichosajiliwa na omba kupitia kiongozi wa kikundi.",
    cta: "jifunze",
  },
];
