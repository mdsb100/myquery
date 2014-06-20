define( 'hash/cssColors',
  /**
   * @pubilc
   * @module hash/cssColors
   * @property {String} aliceblue              - '#F0F8FF'
   * @property {String} antiquewhite           - '#FAEBD7'
   * @property {String} aqua                   - '#00FFFF'
   * @property {String} aquamarine             - '#7FFFD4'
   * @property {String} azure                  - '#F0FFFF'
   * @property {String} beige                  - '#F5F5DC'
   * @property {String} bisque                 - '#FFE4C4'
   * @property {String} black                  - '#000000'
   * @property {String} blanchedalmond         - '#FFEBCD'
   * @property {String} blue                   - '#0000FF'
   * @property {String} blueviolet             - '#8A2BE2'
   * @property {String} brown                  - '#A52A2A'
   * @property {String} burlywood              - '#DEB887'
   * @property {String} cadetblue              - '#5F9EA0'
   * @property {String} chartreuse             - '#7FFF00'
   * @property {String} chocolate              - '#D2691E'
   * @property {String} coral                  - '#FF7F50'
   * @property {String} cornflowerblue         - '#6495ED'
   * @property {String} cornsilk               - '#FFF8DC'
   * @property {String} crimson                - '#DC143C'
   * @property {String} cyan                   - '#00FFFF'
   * @property {String} darkblue               - '#00008B'
   * @property {String} darkcyan               - '#008B8B'
   * @property {String} darkgoldenrod          - '#B8860B'
   * @property {String} darkgray               - '#A9A9A9'
   * @property {String} darkgrey               - '#A9A9A9'
   * @property {String} darkgreen              - '#006400'
   * @property {String} darkkhaki              - '#BDB76B'
   * @property {String} darkmagenta            - '#8B008B'
   * @property {String} darkolivegreen         - '#556B2F'
   * @property {String} darkorange             - '#FF8C00'
   * @property {String} darkorchid             - '#9932CC'
   * @property {String} darkred                - '#8B0000'
   * @property {String} darksalmon             - '#E9967A'
   * @property {String} darkseagreen           - '#8FBC8F'
   * @property {String} darkslateblue          - '#483D8B'
   * @property {String} darkslategray          - '#2F4F4F'
   * @property {String} darkslategrey          - '#2F4F4F'
   * @property {String} darkturquoise          - '#00CED1'
   * @property {String} darkviolet             - '#9400D3'
   * @property {String} deeppink               - '#FF1493'
   * @property {String} deepskyblue            - '#00BFFF'
   * @property {String} dimgray                - '#696969'
   * @property {String} dimgrey                - '#696969'
   * @property {String} dodgerblue             - '#1E90FF'
   * @property {String} firebrick              - '#B22222'
   * @property {String} floralwhite            - '#FFFAF0'
   * @property {String} forestgreen            - '#228B22'
   * @property {String} fuchsia                - '#FF00FF'
   * @property {String} gainsboro              - '#DCDCDC'
   * @property {String} ghostwhite             - '#F8F8FF'
   * @property {String} gold                   - '#FFD700'
   * @property {String} goldenrod              - '#DAA520'
   * @property {String} gray                   - '#808080'
   * @property {String} grey                   - '#808080'
   * @property {String} green                  - '#008000'
   * @property {String} greenyellow            - '#ADFF2F'
   * @property {String} honeydew               - '#F0FFF0'
   * @property {String} hotpink                - '#FF69B4'
   * @property {String} indianred              - '#CD5C5C'
   * @property {String} indigo                 - '#4B0082'
   * @property {String} ivory                  - '#FFFFF0'
   * @property {String} khaki                  - '#F0E68C'
   * @property {String} lavender               - '#E6E6FA'
   * @property {String} lavenderblush          - '#FFF0F5'
   * @property {String} lawngreen              - '#7CFC00'
   * @property {String} lemonchiffon           - '#FFFACD'
   * @property {String} lightblue              - '#ADD8E6'
   * @property {String} lightcoral             - '#F08080'
   * @property {String} lightcyan              - '#E0FFFF'
   * @property {String} lightgoldenrodyellow   - '#FAFAD2'
   * @property {String} lightgray              - '#D3D3D3'
   * @property {String} lightgrey              - '#D3D3D3'
   * @property {String} lightgreen             - '#90EE90'
   * @property {String} lightpink              - '#FFB6C1'
   * @property {String} lightsalmon            - '#FFA07A'
   * @property {String} lightseagreen          - '#20B2AA'
   * @property {String} lightskyblue           - '#87CEFA'
   * @property {String} lightslategray         - '#778899'
   * @property {String} lightslategrey         - '#778899'
   * @property {String} lightsteelblue         - '#B0C4DE'
   * @property {String} lightyellow            - '#FFFFE0'
   * @property {String} lime                   - '#00FF00'
   * @property {String} limegreen              - '#32CD32'
   * @property {String} linen                  - '#FAF0E6'
   * @property {String} magenta                - '#FF00FF'
   * @property {String} maroon                 - '#800000'
   * @property {String} mediumaquamarine       - '#66CDAA'
   * @property {String} mediumblue             - '#0000CD'
   * @property {String} mediumorchid           - '#BA55D3'
   * @property {String} mediumpurple           - '#9370D8'
   * @property {String} mediumseagreen         - '#3CB371'
   * @property {String} mediumslateblue        - '#7B68EE'
   * @property {String} mediumspringgreen      - '#00FA9A'
   * @property {String} mediumturquoise        - '#48D1CC'
   * @property {String} mediumvioletred        - '#C71585'
   * @property {String} midnightblue           - '#191970'
   * @property {String} mintcream              - '#F5FFFA'
   * @property {String} mistyrose              - '#FFE4E1'
   * @property {String} moccasin               - '#FFE4B5'
   * @property {String} navajowhite            - '#FFDEAD'
   * @property {String} navy                   - '#000080'
   * @property {String} oldlace                - '#FDF5E6'
   * @property {String} olive                  - '#808000'
   * @property {String} olivedrab              - '#6B8E23'
   * @property {String} orange                 - '#FFA500'
   * @property {String} orangered              - '#FF4500'
   * @property {String} orchid                 - '#DA70D6'
   * @property {String} palegoldenrod          - '#EEE8AA'
   * @property {String} palegreen              - '#98FB98'
   * @property {String} paleturquoise          - '#AFEEEE'
   * @property {String} palevioletred          - '#D87093'
   * @property {String} papayawhip             - '#FFEFD5'
   * @property {String} peachpuff              - '#FFDAB9'
   * @property {String} peru                   - '#CD853F'
   * @property {String} pink                   - '#FFC0CB'
   * @property {String} plum                   - '#DDA0DD'
   * @property {String} powderblue             - '#B0E0E6'
   * @property {String} purple                 - '#800080'
   * @property {String} red                    - '#FF0000'
   * @property {String} rosybrown              - '#BC8F8F'
   * @property {String} royalblue              - '#4169E1'
   * @property {String} saddlebrown            - '#8B4513'
   * @property {String} salmon                 - '#FA8072'
   * @property {String} sandybrown             - '#F4A460'
   * @property {String} seagreen               - '#2E8B57'
   * @property {String} seashell               - '#FFF5EE'
   * @property {String} sienna                 - '#A0522D'
   * @property {String} silver                 - '#C0C0C0'
   * @property {String} skyblue                - '#87CEEB'
   * @property {String} slateblue              - '#6A5ACD'
   * @property {String} slategray              - '#708090'
   * @property {String} slategrey              - '#708090'
   * @property {String} snow                   - '#FFFAFA'
   * @property {String} springgreen            - '#00FF7F'
   * @property {String} transparent            - 'rgba(0,00,0)',
   * @property {String} steelblue              - '#4682B4'
   * @property {String} tan                    - '#D2B48C'
   * @property {String} teal                   - '#008080'
   * @property {String} thistle                - '#D8BFD8'
   * @property {String} tomato                 - '#FF6347'
   * @property {String} turquoise              - '#40E0D0'
   * @property {String} violet                 - '#EE82EE'
   * @property {String} wheat                  - '#F5DEB3'
   * @property {String} white                  - '#FFFFFF'
   * @property {String} whitesmoke             - '#F5F5F5'
   * @property {String} yellow                 - '#FFFF00'
   * @property {String} yellowgreen            - '#9ACD32'
   */
  {
    aliceblue: '#F0F8FF',
    antiquewhite: '#FAEBD7',
    aqua: '#00FFFF',
    aquamarine: '#7FFFD4',
    azure: '#F0FFFF',
    beige: '#F5F5DC',
    bisque: '#FFE4C4',
    black: '#000000',
    blanchedalmond: '#FFEBCD',
    blue: '#0000FF',
    blueviolet: '#8A2BE2',
    brown: '#A52A2A',
    burlywood: '#DEB887',
    cadetblue: '#5F9EA0',
    chartreuse: '#7FFF00',
    chocolate: '#D2691E',
    coral: '#FF7F50',
    cornflowerblue: '#6495ED',
    cornsilk: '#FFF8DC',
    crimson: '#DC143C',
    cyan: '#00FFFF',
    darkblue: '#00008B',
    darkcyan: '#008B8B',
    darkgoldenrod: '#B8860B',
    darkgray: '#A9A9A9',
    darkgrey: '#A9A9A9',
    darkgreen: '#006400',
    darkkhaki: '#BDB76B',
    darkmagenta: '#8B008B',
    darkolivegreen: '#556B2F',
    darkorange: '#FF8C00',
    darkorchid: '#9932CC',
    darkred: '#8B0000',
    darksalmon: '#E9967A',
    darkseagreen: '#8FBC8F',
    darkslateblue: '#483D8B',
    darkslategray: '#2F4F4F',
    darkslategrey: '#2F4F4F',
    darkturquoise: '#00CED1',
    darkviolet: '#9400D3',
    deeppink: '#FF1493',
    deepskyblue: '#00BFFF',
    dimgray: '#696969',
    dimgrey: '#696969',
    dodgerblue: '#1E90FF',
    firebrick: '#B22222',
    floralwhite: '#FFFAF0',
    forestgreen: '#228B22',
    fuchsia: '#FF00FF',
    gainsboro: '#DCDCDC',
    ghostwhite: '#F8F8FF',
    gold: '#FFD700',
    goldenrod: '#DAA520',
    gray: '#808080',
    grey: '#808080',
    green: '#008000',
    greenyellow: '#ADFF2F',
    honeydew: '#F0FFF0',
    hotpink: '#FF69B4',
    indianred: '#CD5C5C',
    indigo: '#4B0082',
    ivory: '#FFFFF0',
    khaki: '#F0E68C',
    lavender: '#E6E6FA',
    lavenderblush: '#FFF0F5',
    lawngreen: '#7CFC00',
    lemonchiffon: '#FFFACD',
    lightblue: '#ADD8E6',
    lightcoral: '#F08080',
    lightcyan: '#E0FFFF',
    lightgoldenrodyellow: '#FAFAD2',
    lightgray: '#D3D3D3',
    lightgrey: '#D3D3D3',
    lightgreen: '#90EE90',
    lightpink: '#FFB6C1',
    lightsalmon: '#FFA07A',
    lightseagreen: '#20B2AA',
    lightskyblue: '#87CEFA',
    lightslategray: '#778899',
    lightslategrey: '#778899',
    lightsteelblue: '#B0C4DE',
    lightyellow: '#FFFFE0',
    lime: '#00FF00',
    limegreen: '#32CD32',
    linen: '#FAF0E6',
    magenta: '#FF00FF',
    maroon: '#800000',
    mediumaquamarine: '#66CDAA',
    mediumblue: '#0000CD',
    mediumorchid: '#BA55D3',
    mediumpurple: '#9370D8',
    mediumseagreen: '#3CB371',
    mediumslateblue: '#7B68EE',
    mediumspringgreen: '#00FA9A',
    mediumturquoise: '#48D1CC',
    mediumvioletred: '#C71585',
    midnightblue: '#191970',
    mintcream: '#F5FFFA',
    mistyrose: '#FFE4E1',
    moccasin: '#FFE4B5',
    navajowhite: '#FFDEAD',
    navy: '#000080',
    oldlace: '#FDF5E6',
    olive: '#808000',
    olivedrab: '#6B8E23',
    orange: '#FFA500',
    orangered: '#FF4500',
    orchid: '#DA70D6',
    palegoldenrod: '#EEE8AA',
    palegreen: '#98FB98',
    paleturquoise: '#AFEEEE',
    palevioletred: '#D87093',
    papayawhip: '#FFEFD5',
    peachpuff: '#FFDAB9',
    peru: '#CD853F',
    pink: '#FFC0CB',
    plum: '#DDA0DD',
    powderblue: '#B0E0E6',
    purple: '#800080',
    red: '#FF0000',
    rosybrown: '#BC8F8F',
    royalblue: '#4169E1',
    saddlebrown: '#8B4513',
    salmon: '#FA8072',
    sandybrown: '#F4A460',
    seagreen: '#2E8B57',
    seashell: '#FFF5EE',
    sienna: '#A0522D',
    silver: '#C0C0C0',
    skyblue: '#87CEEB',
    slateblue: '#6A5ACD',
    slategray: '#708090',
    slategrey: '#708090',
    snow: '#FFFAFA',
    springgreen: '#00FF7F',
    transparent: 'rgba(0,0,0,0)',
    steelblue: '#4682B4',
    tan: '#D2B48C',
    teal: '#008080',
    thistle: '#D8BFD8',
    tomato: '#FF6347',
    turquoise: '#40E0D0',
    violet: '#EE82EE',
    wheat: '#F5DEB3',
    white: '#FFFFFF',
    whitesmoke: '#F5F5F5',
    yellow: '#FFFF00',
    yellowgreen: '#9ACD32'
  } );