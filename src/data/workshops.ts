export type Workshop = {
  lat: number;
  lng: number;
  title: string;
  metro?: string;
  phone: string;
  instructionUri: string;
};

// Coordinates and addresses are kept in sync with the attached Dynamic Map plugin.
export const workshops: Workshop[] = [
  { lat: 60.056973, lng: 30.317007, title: "пр. Просвещения, д.20", metro: "Пр. Просвещения", phone: "+7 (812) 242-99-45", instructionUri: "/lenremont-na-prosvescheniya.htm" },
  { lat: 59.844347, lng: 30.246817, title: "пр. Ветеранов, д.9", metro: "Пр. Ветеранов", phone: "+7 (812) 242-99-45", instructionUri: "/lenremont-na-veteranov.htm" },
  { lat: 59.903787, lng: 30.484052, title: "пр. Большевиков, д.25", metro: "Ул. Дыбенко", phone: "+7 (812) 242-99-45", instructionUri: "/lenremont-na-dybenko.htm" },
  { lat: 60.011022, lng: 30.244612, title: "пр. Авиаконструкторов, д.4", metro: "Комендантский пр.", phone: "+7 (812) 242-99-45", instructionUri: "/lenremont-na-aviakonstruktorov.htm" },
  { lat: 59.951836, lng: 30.2142, title: "ул. Кораблестроителей, д.30", metro: "Приморская", phone: "+7 (812) 242-99-45", instructionUri: "/lenremont-na-primorskoj.htm" },
  { lat: 60.015354, lng: 30.389052, title: "пр. Науки, д.8, к.1", metro: "Академическая", phone: "+7 (812) 242-99-45", instructionUri: "/lenremont-na-akademicheskoj.htm" },
  { lat: 60.042213, lng: 30.337844, title: "пр. Луначарского, д.56, к.1", metro: "Озерки, м. Пр. Просвещения", phone: "+7 (812) 242-99-45", instructionUri: "/lenremont-na-lunacharskogo.htm" },
  { lat: 59.855937, lng: 30.223199, title: "пр. Маршала Жукова, д.35, к.3", metro: "Автово", phone: "+7 (812) 665-21-19", instructionUri: "/lenremont-metro-avtovo.htm" },
  { lat: 59.891664, lng: 30.405857, title: "пр. Елизарова, д.36", metro: "Елизаровская", phone: "+7 (812) 242-99-45", instructionUri: "/lenremont-na-elizarovskoj.htm" },
  { lat: 59.87436, lng: 30.386843, title: "ул. Белы Куна, д.20, к.1", metro: "Международная", phone: "+7 (812) 242-99-45", instructionUri: "/lenremont-na-mezhdunarodnoj.htm" },
  { lat: 60.005244, lng: 30.291126, title: "пр. Испытателей, д.11, к.1", metro: "Пионерская", phone: "+7 (812) 242-99-45", instructionUri: "/lenremont-na-pionerskoj.htm" },
  { lat: 60.036083, lng: 30.410818, title: "ул. Ушинского, д.25, к.1", metro: "Гражданский пр.", phone: "+7 (812) 242-99-45", instructionUri: "/lenremont-na-ushinskogo.htm" },
  { lat: 59.834138, lng: 30.357838, title: "ул. Звёздная, д.5, к.1 (вход с улицы)", metro: "Звёздная", phone: "+7 (812) 242-99-45", instructionUri: "/lenremont-na-zvezdnoj.htm" },
  { lat: 59.86138, lng: 30.315542, title: "ул. Фрунзе, д.3", metro: "Парк Победы, м. Московская", phone: "+7 (812) 242-99-45", instructionUri: "/lenremont-na-moskovskoy.htm" },
  { lat: 59.923662, lng: 30.452906, title: "пр. Пятилеток, д.14, к.1", metro: "Пр. Большевиков", phone: "+7 (812) 242-99-45", instructionUri: "/lenremont-na-pyatiltetok.htm" },
  { lat: 59.968519, lng: 30.368152, title: "ул. Минеральная, д.13Ц", metro: "Выборгская", phone: "+7 (812) 242-99-45", instructionUri: "/lenremont-na-vyborgskoj.htm" },
  { lat: 59.946304, lng: 30.496196, title: "пр. Косыгина, д.28, к.1", metro: "Ладожская", phone: "+7 (812) 242-99-45", instructionUri: "/lenremont-na-kosygina.htm" },
  { lat: 59.864065, lng: 30.334992, title: "пр. Юрия Гагарина, д.15", metro: "Парк Победы", phone: "+7 (812) 242-99-45", instructionUri: "/lenremont-na-prospekte-yuriya-gagarina.htm" },
  { lat: 59.852677, lng: 30.32678, title: "пр. Московский, 212, Дом Советов, 1 этаж, кабинет 1130, вход у кафе Авантаж", metro: "Московская", phone: "+7 (812) 242-99-45", instructionUri: "/lenremont-na-prospekt-moskovskij-212-dom-sovetov.htm" },
  { lat: 59.904118, lng: 30.333959, title: "ул. Киевская, д.32В", metro: "Фрунзенская", phone: "+7 (812) 242-99-45", instructionUri: "/lenremont-na-frunzenskoy.htm" },
  { lat: 59.832059, lng: 30.386943, title: "ул. Ярослава Гашека, д.4, к.1", metro: "Купчино", phone: "+7 (812) 242-99-45", instructionUri: "/lenremont-na-yaroslava-gasheka.htm" },
  { lat: 59.746356, lng: 30.609375, title: "ст. ЖД Колпино, ул. Тверская, д.1/13", phone: "+7 (812) 242-99-45", instructionUri: "/lenremont-na-tverskoj.htm" },
  { lat: 60.002099, lng: 30.328561, title: "пр. Энгельса, д.19", metro: "Удельная", phone: "+7 (812) 501-93-90", instructionUri: "/lenremont-na-engelsa.htm" },
  { lat: 59.87169, lng: 30.679786, title: "Промзона Мягловская, Всеволожский муниципальный район, Ленинградская область, Круговая улица, д. 47", phone: "+7 (812) 242-99-45", instructionUri: "https://www.lenremont.ru/lenremont-promzona-myaglovskaya-vsevolozhskij-municipalnyj-rajon.htm" },
  { lat: 59.878667, lng: 30.322117, title: "ул. Решетникова, д.3", metro: "Электросила", phone: "+7 (812) 242-99-45", instructionUri: "https://www.lenremont.ru/lenremont-na-reshetnikova.htm" },
];
