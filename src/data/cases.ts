import moto01After from "../assets/motoSeat/finishedSeatStaging.webp";
import moto01Before from "../assets/motoSeat/case01-before-cracked.webp";
import moto02After from "../assets/motoSeat/case02-sport-after.webp";
import moto02Before from "../assets/motoSeat/case02-before-cracked.webp";
import moto03After from "../assets/motoSeat/case03-cafe-after.webp";
import moto03Before from "../assets/motoSeat/case03-before-cracked.webp";
import moto04After from "../assets/motoSeat/case04-cruiser-after.webp";
import moto04Before from "../assets/motoSeat/case04-before-cracked.webp";
import moto05After from "../assets/motoSeat/case06-enduro-after.webp";
import moto05Before from "../assets/motoSeat/case06-before-cracked.webp";
import scooter01After from "../assets/motoSeat/case05-scooter-after.webp";
import scooter01Before from "../assets/motoSeat/case05-before-cracked.webp";
import atv01After from "../assets/motoSeat/case07-atv-after.webp";
import atv01Before from "../assets/motoSeat/case07-before-cracked.webp";
import scooter02Before from "../assets/cases/generated/scooter-02-before.webp";
import scooter02After from "../assets/cases/generated/scooter-02-after.webp";
import scooter03Before from "../assets/cases/generated/scooter-03-before.webp";
import scooter03After from "../assets/cases/generated/scooter-03-after.webp";
import scooter04Before from "../assets/cases/generated/scooter-04-before.webp";
import scooter04After from "../assets/cases/generated/scooter-04-after.webp";
import scooter05Before from "../assets/cases/generated/scooter-05-before.webp";
import scooter05After from "../assets/cases/generated/scooter-05-after.webp";
import atv02Before from "../assets/cases/generated/atv-02-before.webp";
import atv02After from "../assets/cases/generated/atv-02-after.webp";
import atv03Before from "../assets/cases/generated/atv-03-before.webp";
import atv03After from "../assets/cases/generated/atv-03-after.webp";
import atv04Before from "../assets/cases/generated/atv-04-before.webp";
import atv04After from "../assets/cases/generated/atv-04-after.webp";
import atv05Before from "../assets/cases/generated/atv-05-before.webp";
import atv05After from "../assets/cases/generated/atv-05-after.webp";
import buggy01Before from "../assets/cases/generated/buggy-01-before.webp";
import buggy01After from "../assets/cases/generated/buggy-01-after.webp";
import buggy02Before from "../assets/cases/generated/buggy-02-before.webp";
import buggy02After from "../assets/cases/generated/buggy-02-after.webp";
import buggy03Before from "../assets/cases/generated/buggy-03-before.webp";
import buggy03After from "../assets/cases/generated/buggy-03-after.webp";
import buggy04Before from "../assets/cases/generated/buggy-04-before.webp";
import buggy04After from "../assets/cases/generated/buggy-04-after.webp";
import buggy05Before from "../assets/cases/generated/buggy-05-before.webp";
import buggy05After from "../assets/cases/generated/buggy-05-after.webp";
import pitbike02Before from "../assets/cases/generated/pitbike-02-before.png";
import pitbike02After from "../assets/cases/generated/pitbike-02-after.png";
import pitbike03Before from "../assets/cases/generated/pitbike-03-before.png";
import pitbike03After from "../assets/cases/generated/pitbike-03-after.png";
import pitbike04Before from "../assets/cases/generated/pitbike-04-before.png";
import pitbike04After from "../assets/cases/generated/pitbike-04-after.png";
import pitbike05Before from "../assets/cases/generated/pitbike-05-before.png";
import pitbike05After from "../assets/cases/generated/pitbike-05-after.png";
import enduro02Before from "../assets/cases/generated/enduro-02-before.png";
import enduro02After from "../assets/cases/generated/enduro-02-after.png";
import enduro03Before from "../assets/cases/generated/enduro-03-before.png";
import enduro03After from "../assets/cases/generated/enduro-03-after.png";
import enduro04Before from "../assets/cases/generated/enduro-04-before.png";
import enduro04After from "../assets/cases/generated/enduro-04-after.png";
import enduro05Before from "../assets/cases/generated/enduro-05-before.png";
import enduro05After from "../assets/cases/generated/enduro-05-after.png";
import choppery02Before from "../assets/cases/generated/choppery-02-before.png";
import choppery02After from "../assets/cases/generated/choppery-02-after.png";
import choppery03Before from "../assets/cases/generated/choppery-03-before.png";
import choppery03After from "../assets/cases/generated/choppery-03-after.png";
import choppery04Before from "../assets/cases/generated/choppery-04-before.png";
import choppery04After from "../assets/cases/generated/choppery-04-after.png";
import choppery05Before from "../assets/cases/generated/choppery-05-before.png";
import choppery05After from "../assets/cases/generated/choppery-05-after.png";
import mototurizm02Before from "../assets/cases/generated/mototurizm-02-before.png";
import mototurizm02After from "../assets/cases/generated/mototurizm-02-after.png";
import mototurizm03Before from "../assets/cases/generated/mototurizm-03-before.png";
import mototurizm03After from "../assets/cases/generated/mototurizm-03-after.png";
import mototurizm04Before from "../assets/cases/generated/mototurizm-04-before.png";
import mototurizm04After from "../assets/cases/generated/mototurizm-04-after.png";
import mototurizm05Before from "../assets/cases/generated/mototurizm-05-before.png";
import mototurizm05After from "../assets/cases/generated/mototurizm-05-after.png";

export const caseStudies = [
  {
    id: "motocikly-01", vehicle: "motocikly", featured: true, before: moto01Before, after: moto01After,
    title: "Две фактуры и контрастная строчка",
    text: "До: растрескавшаяся обивка и повреждённый боковой шов. После: гладкие боковины, цепкая центральная вставка и аккуратная контрастная отстрочка.",
    tags: "МОТОЦИКЛ · ДВУХФАКТУРНАЯ ОБИВКА",
  },
  {
    id: "motocikly-02", vehicle: "motocikly", featured: true, before: moto02Before, after: moto02After,
    title: "Спортбайк: микрозамша и красная строчка",
    text: "До: потёртая посадочная зона и повреждённые боковины. После: тёмная цепкая поверхность, восстановленная форма и красный шов по контуру.",
    tags: "СПОРТБАЙК · МИКРОЗАМША",
  },
  {
    id: "motocikly-03", vehicle: "motocikly", before: moto03Before, after: moto03After,
    title: "Кафе-рейсер: ребристая посадочная зона",
    text: "До: сухое покрытие с трещинами и просевшая центральная часть. После: спокойный коричневый оттенок и классическая поперечная прострочка.",
    tags: "КАФЕ-РЕЙСЕР · РЕБРИСТАЯ ФАКТУРА",
  },
  {
    id: "motocikly-04", vehicle: "motocikly", before: moto04Before, after: moto04After,
    title: "Круизер: обновлённое двухуровневое седло",
    text: "До: разрыв на изгибе и потеря формы пассажирской секции. После: ровные зоны, матовая обивка и подчёркнутый поясничный упор.",
    tags: "КРУИЗЕР · ДВУХУРОВНЕВОЕ СЕДЛО",
  },
  {
    id: "motocikly-05", vehicle: "motocikly", before: moto05Before, after: moto05After,
    title: "Эндуро: цепкая поверхность для активной езды",
    text: "До: потёртая до основы поверхность и надорванные края. После: поперечные рёбра, плотные боковины и усиленные швы.",
    tags: "ЭНДУРО · ЦЕПКАЯ ФАКТУРА",
  },
  {
    id: "pitbajki-01", vehicle: "pitbajki", before: moto02Before, after: moto02After,
    title: "Питбайк: цепкая центральная вставка",
    text: "До: потёртая посадочная зона и повреждённые боковины. После: плотная фактура по центру, восстановленный профиль и контрастная строчка.",
    tags: "ПИТБАЙК · ЦЕПКАЯ ФАКТУРА",
  },
  {
    id: "enduro-01", vehicle: "enduro", before: moto05Before, after: moto05After,
    title: "Эндуро: усиленные края и поперечные рёбра",
    text: "До: покрытие протёрлось до основы, края надорвались. После: цепкая посадочная зона, плотные боковины и аккуратные усиленные швы.",
    tags: "ЭНДУРО · УСИЛЕННЫЕ ШВЫ",
  },
  {
    id: "choppery-01", vehicle: "choppery", before: moto04Before, after: moto04After,
    title: "Круизер: двухуровневое седло",
    text: "До: разрыв на изгибе и потеря формы пассажирской секции. После: ровные зоны, матовая обивка и подчёркнутый поясничный упор.",
    tags: "КРУИЗЕР · ДВУХУРОВНЕВОЕ СЕДЛО",
  },
  {
    id: "mototurizm-01", vehicle: "mototurizm", before: moto01Before, after: moto01After,
    title: "Туринг: две фактуры для долгой поездки",
    text: "До: растрескавшаяся обивка и повреждённый боковой шов. После: гладкие боковины, цепкая центральная вставка и аккуратная контрастная отстрочка.",
    tags: "ТУРИНГ · ДВЕ ФАКТУРЫ",
  },
  {
    id: "pitbajki-02", vehicle: "pitbajki", before: pitbike02Before, after: pitbike02After,
    title: "Питбайк: восстановленный нос сиденья",
    text: "До: трещины, выцветание и открывшийся шов. После: графитовая обивка, оранжевая центральная вставка и плотная двойная строчка.",
    tags: "ПИТБАЙК · ОРАНЖЕВАЯ ВСТАВКА",
  },
  {
    id: "pitbajki-03", vehicle: "pitbajki", before: pitbike03Before, after: pitbike03After,
    title: "Питбайк: усиленный передний край",
    text: "До: порванный нос и потёртые боковины после тренировок. После: чёрная техническая обивка, красная вставка и усиленная кромка.",
    tags: "ПИТБАЙК · УСИЛЕННЫЙ НОС",
  },
  {
    id: "pitbajki-04", vehicle: "pitbajki", before: pitbike04Before, after: pitbike04After,
    title: "Питбайк: восстановленная форма",
    text: "До: просевшая пена, складки и следы грязи. После: ровный профиль, чёрная фактура и оливковые боковые панели.",
    tags: "ПИТБАЙК · НОВАЯ ФОРМА",
  },
  {
    id: "pitbajki-05", vehicle: "pitbajki", before: pitbike05Before, after: pitbike05After,
    title: "Питбайк: защита краёв и швов",
    text: "До: разошедшийся шов и истёртые углы. После: матовый чехол, синий акцент и аккуратно защищённые края.",
    tags: "ПИТБАЙК · ЗАЩИЩЁННЫЕ КРАЯ",
  },
  {
    id: "enduro-02", vehicle: "enduro", before: enduro02Before, after: enduro02After,
    title: "Эндуро: усиленный задний край",
    text: "До: грязь, глубокие трещины и изношенная задняя кромка. После: графитовый чехол, оливковая вставка и усиленный шов.",
    tags: "ЭНДУРО · ЗАДНЯЯ КРОМКА",
  },
  {
    id: "enduro-03", vehicle: "enduro", before: enduro03Before, after: enduro03After,
    title: "Эндуро: цепкая вставка у бака",
    text: "До: разрыв бокового шва и открывшийся наполнитель. После: матовая чёрная обивка, синяя посадочная зона и аккуратный кант.",
    tags: "ЭНДУРО · ЦЕПКАЯ ВСТАВКА",
  },
  {
    id: "enduro-04", vehicle: "enduro", before: enduro04Before, after: enduro04After,
    title: "Эндуро: восстановленная поддержка",
    text: "До: растянутая обивка и просевшая посадочная часть. После: ровная форма, графитовая фактура и тёмно-зелёная ребристая вставка.",
    tags: "ЭНДУРО · ПОДДЕРЖКА",
  },
  {
    id: "enduro-05", vehicle: "enduro", before: enduro05Before, after: enduro05After,
    title: "Эндуро: новый чехол после активного сезона",
    text: "До: выгоревший нос, грязь и разрывы. После: износостойкая чёрная поверхность, оранжевый кант и двойная строчка.",
    tags: "ЭНДУРО · ИЗНОСОСТОЙКАЯ ОБИВКА",
  },
  {
    id: "choppery-02", vehicle: "choppery", before: choppery02Before, after: choppery02After,
    title: "Круизер: водительская и пассажирская зоны",
    text: "До: треснувший чехол и разошедшийся кант. После: чёрная обивка, бордовая вставка и аккуратная красная окантовка.",
    tags: "КРУИЗЕР · БОРДОВАЯ ВСТАВКА",
  },
  {
    id: "choppery-03", vehicle: "choppery", before: choppery03Before, after: choppery03After,
    title: "Круизер: восстановленная спинка",
    text: "До: просевшая подушка и повреждённый край спинки. После: поддерживающее седло, коричневая вставка и чистый контурный кант.",
    tags: "КРУИЗЕР · СПИНКА ПАССАЖИРА",
  },
  {
    id: "choppery-04", vehicle: "choppery", before: choppery04Before, after: choppery04After,
    title: "Круизер: ромбовидная прострочка",
    text: "До: выцветшее покрытие, складки и потёртые боковины. После: глубокий чёрный цвет, ромбовидная строчка и восстановленная форма.",
    tags: "КРУИЗЕР · РОМБОВИДНАЯ СТРОЧКА",
  },
  {
    id: "choppery-05", vehicle: "choppery", before: choppery05Before, after: choppery05After,
    title: "Круизер: обновление пассажирской секции",
    text: "До: разрыв на пассажирской части и потёртые панели. После: графитовое седло, тёмно-красные вставки и ровные швы.",
    tags: "КРУИЗЕР · ПАССАЖИРСКАЯ СЕКЦИЯ",
  },
  {
    id: "mototurizm-02", vehicle: "mototurizm", before: mototurizm02Before, after: mototurizm02After,
    title: "Туринг: восстановленная водительская зона",
    text: "До: трещины, просевшая пена и потеря поддержки. После: графитовая обивка, перфорированная бирюзовая вставка и ровный профиль.",
    tags: "ТУРИНГ · ПОДДЕРЖКА ВОДИТЕЛЯ",
  },
  {
    id: "mototurizm-03", vehicle: "mototurizm", before: mototurizm03Before, after: mototurizm03After,
    title: "Туринг: новая пассажирская зона",
    text: "До: разошедшийся шов и потёртые края. После: чёрная техническая обивка, сине-серая вставка и двойная строчка.",
    tags: "ТУРИНГ · ПАССАЖИРСКАЯ ЗОНА",
  },
  {
    id: "mototurizm-04", vehicle: "mototurizm", before: mototurizm04Before, after: mototurizm04After,
    title: "Туринг: защита от поездок и погоды",
    text: "До: следы воды, растянутая обивка и просевшая посадка. После: плотный графитовый чехол, бирюзовая поясничная вставка и контурные швы.",
    tags: "ТУРИНГ · ГРАФИТ И БИРЮЗА",
  },
  {
    id: "mototurizm-05", vehicle: "mototurizm", before: mototurizm05Before, after: mototurizm05After,
    title: "Туринг: обновление сиденья с подогревом",
    text: "До: трещины и разрыв заднего края. После: чёрная обивка, тёмно-синяя вставка, перфорация и аккуратный кант.",
    tags: "ТУРИНГ · ПЕРФОРАЦИЯ",
  },
  {
    id: "skutery-01", vehicle: "skutery", featured: true, before: scooter01Before, after: scooter01After,
    title: "Синяя обивка со светлым кантом",
    text: "До: выгоревшее покрытие с сеткой трещин и изношенный кант. После: глубокий синий цвет, ровная поверхность и светлая окантовка.",
    tags: "СКУТЕР · СВЕТЛЫЙ КАНТ",
  },
  {
    id: "skutery-02", vehicle: "skutery", before: scooter02Before, after: scooter02After,
    title: "Городской скутер: графит и глубокий бирюзовый",
    text: "До: разошедшийся центральный шов, выцветание и следы влаги. После: цепкая графитовая верхняя часть, бирюзовые боковины и светлый кант.",
    tags: "СКУТЕР · ДВУХЦВЕТНАЯ ОБИВКА",
  },
  {
    id: "skutery-03", vehicle: "skutery", featured: true, before: scooter03Before, after: scooter03After,
    title: "Максискутер: перфорация и светлый шов",
    text: "До: трещины в водительской зоне и разрыв пассажирской секции. После: перфорированная центральная вставка, восстановленный профиль и двойная строчка.",
    tags: "МАКСИСКУТЕР · ПЕРФОРАЦИЯ",
  },
  {
    id: "skutery-04", vehicle: "skutery", before: scooter04Before, after: scooter04After,
    title: "Винтажный скутер: коньячный оттенок",
    text: "До: пересохший коричневый винил, мелкие трещины и потёртая окантовка. После: тёплая фактура, кремовый кант и восстановленный ремень.",
    tags: "СКУТЕР · ВИНТАЖНОЕ ОФОРМЛЕНИЕ",
  },
  {
    id: "skutery-05", vehicle: "skutery", before: scooter05Before, after: scooter05After,
    title: "Рабочий скутер: практичная ребристая обивка",
    text: "До: истёртая посадочная зона, мокрые следы и разорванный задний угол. После: матовый графитовый винил и низкие поперечные рёбра.",
    tags: "СКУТЕР · УСИЛЕННЫЕ ШВЫ",
  },
  {
    id: "kvadrocikly-01", vehicle: "kvadrocikly", featured: true, before: atv01Before, after: atv01After,
    title: "Фигурная строчка и спокойный чёрный",
    text: "До: пересохшее покрытие, разрывы боковин и следы активной эксплуатации. После: матовая обивка, восстановленные края и строчка по форме зон.",
    tags: "КВАДРОЦИКЛ · ФИГУРНАЯ СТРОЧКА",
  },
  {
    id: "kvadrocikly-02", vehicle: "kvadrocikly", before: atv02Before, after: atv02After,
    title: "Спортивное сиденье: чёрный и оливковый",
    text: "До: грязь, глубокие боковые потёртости и порванный задний край. После: цепкий чёрный верх и защищённые оливковые боковины.",
    tags: "КВАДРОЦИКЛ · ЦЕПКАЯ ПОВЕРХНОСТЬ",
  },
  {
    id: "kvadrocikly-03", vehicle: "kvadrocikly", featured: true, before: atv03Before, after: atv03After,
    title: "Двухместное сиденье с усиленными зонами",
    text: "До: большие трещины, следы влаги и продавленный передний участок. После: две выделенные посадочные зоны, плотный чехол и двойные швы.",
    tags: "КВАДРОЦИКЛ · ДВЕ ПОСАДОЧНЫЕ ЗОНЫ",
  },
  {
    id: "kvadrocikly-04", vehicle: "kvadrocikly", before: atv04Before, after: atv04After,
    title: "Компактное сиденье в оливковом цвете",
    text: "До: выгоревший винил, плотная сетка трещин и прокол у переднего края. После: цельная фактурная поверхность и защищённые чёрные боковины.",
    tags: "КВАДРОЦИКЛ · КОМПАКТНОЕ СИДЕНЬЕ",
  },
  {
    id: "kvadrocikly-05", vehicle: "kvadrocikly", before: atv05Before, after: atv05After,
    title: "Туринговое сиденье: две фактуры",
    text: "До: гладкие истёртые зоны, разрыв на ступени и повреждённый кант. После: коричневые цепкие вставки, поперечные рёбра и чёрные боковины.",
    tags: "КВАДРОЦИКЛ · ТУРИСТИЧЕСКАЯ ПОСАДКА",
  },
  {
    id: "baggi-01", vehicle: "baggi", featured: true, before: buggy01Before, after: buggy01After,
    title: "Кресло багги: графит и оранжевая строчка",
    text: "До: протёртая боковина, пыль и растянутые центральные панели. После: матовые боковины, цепкая середина и контрастная строчка.",
    tags: "БАГГИ · КОВШООБРАЗНОЕ КРЕСЛО",
  },
  {
    id: "baggi-02", vehicle: "baggi", before: buggy02Before, after: buggy02After,
    title: "Чёрное кресло с оливковой вставкой",
    text: "До: разорванный входной валик, трещины и потёртые центральные панели. После: восстановленные боковины, оливковая фактура и рыжая строчка.",
    tags: "БАГГИ · ЦЕПКАЯ ЦЕНТРАЛЬНАЯ ЗОНА",
  },
  {
    id: "baggi-03", vehicle: "baggi", featured: true, before: buggy03Before, after: buggy03After,
    title: "Двухместная лавка с ромбами",
    text: "До: продавленные посадочные зоны и затёртые внешние углы. После: чёрная рамка, тёплые вставки и ромбовидная прострочка спинки.",
    tags: "БАГГИ · ДВУХМЕСТНАЯ ЛАВКА",
  },
  {
    id: "baggi-04", vehicle: "baggi", before: buggy04Before, after: buggy04After,
    title: "Спортивное кресло в чёрном и бордовом",
    text: "До: выцветшая красная середина, треснувший кант и разрыв нижней боковины. После: бордовая цепкая вставка и обновлённые чёрные валики.",
    tags: "БАГГИ · БОРДОВАЯ ВСТАВКА",
  },
  {
    id: "baggi-05", vehicle: "baggi", before: buggy05Before, after: buggy05After,
    title: "Премиальное кресло с коньячной перфорацией",
    text: "До: растрескавшиеся светлые панели, грязь и повреждённый нижний шов. После: перфорированная коньячная середина и гладкие чёрные боковины.",
    tags: "БАГГИ · ПЕРФОРИРОВАННАЯ ВСТАВКА",
  },
];
