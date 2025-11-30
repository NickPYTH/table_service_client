export let host: string = `${document.location.protocol.slice(0, -1)}://${document.location.host.split(':')[0]}`

if (document.location.host.split(':')[1]) {
    if (document.location.host.split(':')[1] !== '3000')
        host += ':' + document.location.host.split(':')[1]
    else
        host += ':8000'
} else
    host += ''

//export const wsHost = 'wss://sco1-vapp-09.sgp.ru';
//export const wsHost = 'wss://test-vapp-03.sgp.ru';
export const wsHost = 'ws://localhost:8000';

export const COLUMN_KEYS:any = {
    "1": 'A',
    "2": 'B',
    "3": 'C',
    "4": 'D',
    "5": 'E',
    "6": 'F',
    "7": 'G',
    "8": 'H',
    "9": 'I',
    "10": 'J',
    "11": 'K',
    "12": 'L',
    "13": 'M',
    "14": 'N',
    "15": 'O',
    "16": 'P',
    "17": 'Q',
    "18": 'R',
    "19": 'S',
    "20": 'T',
    "21": 'U',
    "22": 'V',
    "23": 'W',
    "24": 'X',
    "25": 'Y',
    "26": 'Z',
    "27": 'AA',
    "28": 'BB',
    "29": 'CC',
    "30": 'DD',
    "31": 'EE',
    "32": 'FF',
    "33": 'GG',
    "34": 'HH',
    "35": 'II',
    "36": 'JJ',
    "37": 'KK',
    "38": 'LL',
    "39": 'MM',
    "40": 'NN',
    "41": 'OO',
    "42": 'PP',
    "43": 'QQ',
    "44": 'RR',
    "45": 'SS',
    "46": 'TT',
    "47": 'UU',
    "48": 'VV',
    "49": 'WW',
    "50": 'XX',
    "51": 'YY',
    "52": 'ZZ',
};
