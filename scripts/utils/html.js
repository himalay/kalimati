const htmlParser = require('node-html-parser')

function parseHTML(date, headers, htmlString) {
  const { avgPrices, commodities } = parseHtmlString(htmlString)
  const row = new Array(headers.length)
  row[0] = date
  for (const [i, commodity] of commodities.entries()) {
    const index = headers.indexOf(commodity)
    row[index] = avgPrices[i]
  }

  return row.join(',')
}

function parseHtmlString(htmlString) {
  const document = htmlParser.parse(htmlString)
  const commodities = [...document.querySelectorAll('td:first-child')].map((x) => toEnglish(x.textContent.trim()))
  const avgPrices = [...document.querySelectorAll('td:nth-child(5)')].map(
    (x) =>
      +x.textContent
        .trim()
        .split('')
        .map((y) => toEnglish(y))
        .join(''),
  )

  return { avgPrices, commodities }
}

function toEnglish(str) {
  const unicodeMap = {
    'गोलभेडा ठूलो(नेपाली)': 'Tomato Big(Nepali)',
    'गोलभेडा सानो(लोकल)': 'Tomato Small(Local)',
    'आलु रातो': 'Potato Red',
    'प्याज सुकेको (भारतीय)': 'Onion Dry (Indian)',
    'गाजर(लोकल)': 'Carrot(Local)',
    'बन्दा(लोकल)': 'Cabbage(Local)',
    'काउली स्थानिय': 'Cauli Local',
    'मूला रातो': 'Raddish Red',
    'मूला सेतो(लोकल)': 'Raddish White(Local)',
    'भन्टा लाम्चो': 'Brinjal Long',
    'भन्टा डल्लो': 'Brinjal Round',
    'बोडी(तने)': 'Cow pea(Long)',
    मटरकोशा: 'Green Peas',
    'घिउ सिमी(लोकल)': 'French Bean(Local)',
    'तितो करेला': 'Bitter Gourd',
    लौका: 'Bottle Gourd',
    'परवर(लोकल)': 'Pointed Gourd(Local)',
    घिरौला: 'Smooth Gourd',
    'फर्सी पाकेको': 'Pumpkin',
    'फर्सी हरियो(लाम्चो)': 'Squash(Long)',
    सलगम: 'Turnip',
    भिण्डी: 'Okara',
    सखरखण्ड: 'Sweet Potato',
    बरेला: 'Barela',
    स्कूस: 'Christophine',
    'रायो साग': 'Brd Leaf Mustard',
    'पालूगो साग': 'Spinach Leaf',
    'चमसूरको साग': 'Cress Leaf',
    'तोरीको साग': 'Mustard Leaf',
    'मेथीको साग': 'Fenugreek Leaf',
    'प्याज हरियो': 'Onion Green',
    बकूला: 'Bakula',
    'च्याउ(कन्य)': 'Mushroom(Kanya)',
    कुरीलो: 'Asparagus',
    न्यूरो: 'Neuro',
    ब्रोकाउली: 'Brocauli',
    चुकुन्दर: 'Sugarbeet',
    सजिवन: 'Drumstick',
    कोइरालो: 'Bauhania flower',
    'जिरीको साग': 'Lettuce',
    'ग्याठ कोबी': 'Knolkhol',
    सेलरी: 'Celery',
    पार्सले: 'Parseley',
    'सौफको साग': 'Fennel Leaf',
    पुदीना: 'Mint',
    'गान्टे मूला': 'Turnip A',
    इमली: 'Tamarind',
    तामा: 'Bamboo Shoot',
    तोफु: 'Tofu',
    'स्याउ(झोले)': 'Apple(Jholey)',
    केरा: 'Banana',
    कागती: 'Lime',
    अनार: 'Pomegranate',
    'आँप(मालदह)': 'Mango(Maldah)',
    'अंगुर(हरियो)': 'Grapes(Green)',
    'सुन्तला(नेपाली)': 'Orange(Nepali)',
    'तरबुजा(हरियो)': 'Water Melon(Green)',
    मौसम: 'Sweet Orange',
    'भुई कटहर': 'Pineapple',
    'काक्रो(लोकल)': 'Cucumber(Local)',
    'रुख कटहर': 'Jack Fruit',
    'मेवा(नेपाली)': 'Papaya(Nepali)',
    उखु: 'Sugarcane',
    अदुवा: 'Ginger',
    'खु्र्सानी सुकेको': 'Chilli Dry',
    'खु्र्सानी हरियो': 'Chilli Green',
    'भेडे खु्र्सानी': 'Capsicum',
    'लसुन हरियो': 'Garlic Green',
    'हरियो धनिया': 'Coriander Green',
    'लसुन सुकेको चाइनिज': 'Garlic Dry Chinese',
    'लसुन सुकेको नेपाली': 'Garlic Dry Nepali',
    'माछा ताजा': 'Fish Fresh',
    'आलु सेतो': 'Potato White',
    'नासपाती(लोकल)': 'Pear(Local)',
    'रातो बन्दा': 'Red Cabbbage',
    'काउली तराई': 'Cauli Terai',
    पिंडालू: 'Arum',
    गुन्दुक: 'Gundruk',
    'छ्यापी सुकेको': 'Clive Dry',
    'छ्यापी हरियो': 'Clive Green',
    चिचिण्डो: 'Snake Gourd',
    चाक्सी: 'Sweet Lime',
    किनु: 'Kinnow',
    झिगूनी: 'Sponge Gourd',
    भटमासकोशा: 'Soyabean Green',
    'लीच्ची(लोकल)': 'Litchi(Local)',
    'हरियो मकै': 'Maize',
    अम्बा: 'Guava',
    लप्सी: 'Mombin',
    निबुवा: 'Lemon',
    'टाटे सिमी': 'Sword Bean',
    तरुल: 'Yam',
    जुनार: 'Mandarin',
    'स्ट्रबेरी भुईऐसेलु': 'Strawberry',
    खरबुजा: 'Musk Melon',
    'गोलभेडा सानो(टनेल)': 'Tomato Small(Tunnel)',
    'आलु रातो(भारतीय)': 'Potato Red(Indian)',
    'च्याउ(डल्ले)': 'Mushroom(Button)',
    'स्याउ(फूजी)': 'Apple(Fuji)',
    'काक्रो(हाइब्रीड)': 'Cucumber(Hybrid)',
    'खुर्सानी हरियो(बुलेट)': 'Chilli Green(Bullet)',
    'खुर्सानी हरियो(माछे)': 'Chilli Green(Machhe)',
    'खुर्सानी हरियो(अकबरे)': 'Chilli Green(Akbare)',
    'ताजा माछा(रहु)': 'Fish Fresh(Rahu)',
    'ताजा माछा(बचुवा)': 'Fish Fresh(Bachuwa)',
    'ताजा माछा(छडी)': 'Fish Fresh(Chhadi)',
    'ताजा माछा(मुंगरी)': 'Fish Fresh(Mungari)',
    'सेतो मूला(हाइब्रीड)': 'Raddish White(Hybrid)',
    'मकै बोडी': 'Cowpea(Short)',
    'घिउ सिमी(हाइब्रीड)': 'French Bean(Hybrid)',
    'घिउ सिमी(राजमा)': 'French Bean(Rajma)',
    'हरियो फर्सी(डल्लो)': 'Squash(Round)',
    'आँप(दसहरी)': 'Mango(Dushari)',
    'तरबुजा(पाटे)': 'Water Melon(Dotted)',
    'मेवा(भारतीय)': 'Papaya(Indian)',
    'लीच्ची(भारतीय)': 'Litchi(Indian)',
    'बन्दा(नरिवल)': 'Cabbage',
    'आलु रातो(मुडे)': 'Potato Red(Mude)',
    'ठूलो गोलभेडा(भारतीय)': 'Tomato Big(Indian)',
    'नासपाती(चाइनिज)': 'Pear(Chinese)',
    'गोलभेडा सानो(भारतीय)': 'Tomato Small(Indian)',
    'सुन्तला(भारतीय)': 'Orange(Indian)',
    'गाजर(तराई)': 'Carrot(Terai)',
    'गोलभेडा सानो(तराई)': 'Tomato Small(Terai)',
    'सुकेको प्याज (चाइनिज)': 'Onion Dry (Chinese)',
    'बन्दा(तराई)': 'Cabbage(Terai)',
    'स्थानीय काउली(ज्यापु)': 'Cauli Local(Jyapu)',
    'परवर(तराई)': 'Pointed Gourd(Terai)',
    'अंगुर(कालो)': 'Grapes(Black)',
    किवि: 'Kiwi',
    'आँप(कलकत्ते)': 'Mango(Calcutte)',
    'आँप(चोसा)': 'Mango(Chousa)',
    '०': 0,
    '१': 1,
    '२': 2,
    '३': 3,
    '४': 4,
    '५': 5,
    '६': 6,
    '७': 7,
    '८': 8,
    '९': 9,
  }

  const result = unicodeMap[str]

  return result === undefined ? str : result
}

module.exports = {
  parseHTML,
  parseHtmlString,
  toEnglish,
}
