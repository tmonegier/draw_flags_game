import { Injectable } from '@angular/core';

export interface Country {
  name: string;
  code: string;
  ratio: string;    // height:width, e.g. "2:3"
  svgFile: string;  // filename in /flags/, e.g. "ireland.svg"
}

export type Difficulty = 'easy' | 'medium' | 'hard';

// Flags drawable with the available tools: rectangular bands and/or a Nordic/centered cross.
// Ratio format: height:width (Wikipedia convention).
const COUNTRIES: Record<Difficulty, Country[]> = {
  easy: [
    { name: 'France',      code: 'fr', ratio: '2:3',   svgFile: 'france.svg'      },
    { name: 'Ireland',     code: 'ie', ratio: '1:2',   svgFile: 'ireland.svg'     },
    { name: 'Netherlands', code: 'nl', ratio: '2:3',   svgFile: 'netherlands.svg' },
    { name: 'Belgium',     code: 'be', ratio: '13:15', svgFile: 'belgium.svg'     },
    { name: 'Austria',     code: 'at', ratio: '2:3',   svgFile: 'austria.svg'     },
    { name: 'Romania',     code: 'ro', ratio: '2:3',   svgFile: 'romania.svg'     },
    { name: 'Latvia',      code: 'lv', ratio: '1:2',   svgFile: 'latvia.svg'      },
    { name: 'Estonia',     code: 'ee', ratio: '7:11',  svgFile: 'estonia.svg'     },
    { name: 'Monaco',      code: 'mc', ratio: '4:5',   svgFile: 'monaco.svg'      },
    { name: 'Spain',       code: 'es', ratio: '2:3',   svgFile: 'spain.svg'       },
    { name: 'Argentina',   code: 'ar', ratio: '5:8',   svgFile: 'argentina.svg'   },
    { name: 'Russia',      code: 'ru', ratio: '2:3',   svgFile: 'russia.svg'      },
  ],
  medium: [
    { name: 'Armenia',      code: 'am', ratio: '1:2', svgFile: 'armenia.svg'      },
    { name: 'Bulgaria',     code: 'bg', ratio: '3:5', svgFile: 'bulgaria.svg'     },
    { name: 'Guinea',       code: 'gn', ratio: '2:3', svgFile: 'guinea.svg'       },
    { name: 'Mali',         code: 'ml', ratio: '2:3', svgFile: 'mali.svg'         },
    { name: 'Chad',         code: 'td', ratio: '2:3', svgFile: 'chad.svg'         },
    { name: 'Nigeria',      code: 'ng', ratio: '1:2', svgFile: 'nigeria.svg'      },
    { name: 'Luxembourg',   code: 'lu', ratio: '3:5', svgFile: 'luxembourg.svg'   },
    { name: 'Sierra Leone', code: 'sl', ratio: '2:3', svgFile: 'sierra_leone.svg' },
    { name: 'Yemen',        code: 'ye', ratio: '1:2', svgFile: 'yemen.svg'        },
    { name: 'Peru',         code: 'pe', ratio: '2:3', svgFile: 'peru.svg'         },
    { name: 'Serbia',       code: 'rs', ratio: '2:3',   svgFile: 'serbia.svg'      },
    { name: 'Haiti',        code: 'ht', ratio: '3:5',   svgFile: 'haiti.svg'       },
    { name: 'Costa Rica',   code: 'cr', ratio: '3:5',   svgFile: 'costa_rica.svg'  },
    { name: 'Denmark',      code: 'dk', ratio: '28:37', svgFile: 'denmark.svg'     },
    { name: 'Sweden',       code: 'se', ratio: '5:8',   svgFile: 'sweden.svg'      },
    { name: 'Finland',      code: 'fi', ratio: '11:18', svgFile: 'finland.svg'     },
  ],
  hard: [
    { name: 'Gabon',                code: 'ga', ratio: '3:4',   svgFile: 'gabon.svg'                },
    { name: 'The Gambia',           code: 'gm', ratio: '2:3',   svgFile: 'the_gambia.svg'           },
    { name: 'Benin',                code: 'bj', ratio: '2:3',   svgFile: 'benin.svg'                },
    { name: 'Botswana',             code: 'bw', ratio: '2:3',   svgFile: 'botswana.svg'             },
    { name: 'United Arab Emirates', code: 'ae', ratio: '1:2',   svgFile: 'united_arab_emirates.svg' },
    { name: 'Madagascar',           code: 'mg', ratio: '2:3',   svgFile: 'madagascar.svg'           },
    { name: 'Andorra',              code: 'ad', ratio: '7:10',  svgFile: 'andorra.svg'              },
    { name: 'Guatemala',            code: 'gt', ratio: '5:8',   svgFile: 'guatemala.svg'            },
    { name: 'Norway',               code: 'no', ratio: '8:11',  svgFile: 'norway.svg'               },
    { name: 'Iceland',              code: 'is', ratio: '18:25', svgFile: 'iceland.svg'              },
    { name: 'Switzerland',          code: 'ch', ratio: '1:1',   svgFile: 'switzerland.svg'          },
    { name: 'Greece',               code: 'gr', ratio: '2:3',   svgFile: 'greece.svg'               },
  ],
};

@Injectable({ providedIn: 'root' })
export class CountryService {
  getCountries(difficulty: Difficulty): Country[] {
    return [...COUNTRIES[difficulty]];
  }

  shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}
