let widgetParams = (args.widgetParameter || '').split('|')
let friendlyName = 'SafeMoon'
const settings = {
  BSCSCAN_API_KEY: widgetParams[0] || 'C524VST55HHQZN4A614DZB515D8P1PW86X', // WAP bscscan account api key
  WALLET_ADDRESS: widgetParams[1] || '0x8c128dba2cb66399341aa877315be1054be75da8',
  WIDGET_URL: 'https://safemoon.net',
  LOGO_URL: 'https://safemoon.net/img/174x174.png',
  FRIENDLY_NAME: friendlyName,
  CURRENCY_PAIR: (friendlyName).toUpperCase() + '_USDT',
  CONTRACT_ADDRESS: '0x8076c74c5e3f5852037f31ff0093eeb8c8add8d3',
  TICKER_API_URL: 'https://data.gateio.life/api2/1/ticker',
  KLINE_API_URL: 'https://data.gateapi.io/api2/1/candlestick2/{0}?group_sec=60&range_hour=1',
  BSCSCAN_API_URL: 'https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress={0}&address={1}&tag=latest&apikey={2}',
  CHART_API_URL: 'https://quickchart.io/chart?w=300&h=50&c=',
  CHART_URL: 'https://poocoin.app/tokens/',
  PRICE_FACTOR: 0.000000001
};
const imgReq = new Request(settings.LOGO_URL)
const tokenImg = await imgReq.loadImage()
// ************************************
// execute widget
let widget = await createWidget()
if (config.runsInWidget) {
  Script.setWidget(widget)
} else {
  widget.presentMedium()
}
Script.complete()
// ************************************
async function createWidget() {
  // declare widget
  let w = new ListWidget()
  // call async request to fetch wallet amount
  let tokenInfo = await getBalance()
  let balance = tokenInfo['balance']
  let walletBalance = tokenInfo['walletBalance'].toFixed(4)
  let price = tokenInfo['last']
  let percentChange = tokenInfo['percentChange']
  //background color
  w.backgroundColor = new Color('#000000')
  // **************************************
  // MAIN CONTAINER
  let mainContainerStack = w.addStack()
  // TOP CONTAINER
  let leftContainerStack = mainContainerStack.addStack()
  leftContainerStack.layoutVertically()
  leftContainerStack.size = new Size(275, 150)
  // TOP RIGHT STACK
  let rightContainerStack = mainContainerStack.addStack()
  rightContainerStack.size = new Size(40, 140)
  rightContainerStack.bottomAlignContent()
  // TOP LEFT STACK:
  // **************************************
  // Larger Name
  let largerFont = Font.title1()
  const largeNameStack = leftContainerStack.addStack()
  //const largeName = largeNameStack.addText(settings.FRIENDLY_NAME)
  //largeName.font = largerFont
  //largeName.textColor = new Color('#ffffff')
  // CHART IMAGE
  //largeNameStack.addSpacer(50)
  const chartUrl = encodeURI(await getChartUrl(percentChange));
  const chartImgReq = new Request(chartUrl)
  const chartImage = largeNameStack.addImage(await chartImgReq.loadImage())
  chartImage.imageSize = new Size(300, 35)
  chartImage.url = settings.CHART_URL + settings.CONTRACT_ADDRESS
  // TOKEN IMAGE
  const headerImageStack = rightContainerStack.addStack()
  let tokenImage = headerImageStack.addImage(tokenImg)
  tokenImage.imageSize = new Size(40, 40)
  tokenImage.url = settings.WIDGET_URL
  // Large Wallet Bal
  let largeFont = Font.title2()
  const largeBalanceStack = leftContainerStack.addStack()
  let formattedBalance = formatNumber(walletBalance.toString().split('.')[0]) + '.' + walletBalance.toString().split('.')[1]
  const largeBalance = largeBalanceStack.addText(formattedBalance)
  largeBalance.font = largeFont
  largeBalance.textColor = new Color('#ffffff')
  // BOTTOM LEFT STACK:
  // **************************************
  // Small Price
  let smallFont = Font.body()
  const smallPriceStack = leftContainerStack.addStack()
  const smallPrice = smallPriceStack.addText('@ ' + (price).toString())
  smallPrice.font = smallFont
  smallPrice.textColor = new Color('#ffffff')
  // Small Bal
  const smallBalanceStack = leftContainerStack.addStack()
  const smallBalance = smallBalanceStack.addText('$' + formatNumber(balance))
  smallBalance.font = Font.title2()
  smallBalance.textColor = new Color('#ffffff')
  // Small Percent
  let changeIsUp = percentChange > 0
  percentChange = (percentChange * (changeIsUp ? 1 : -1)).toString()
  const smallPercent = smallPriceStack.addText((changeIsUp ? ' ▲' : ' ▼') + ' (' + percentChange + '%)')
  smallPercent.font = smallFont
  smallPercent.textColor = (changeIsUp ? Color.green() : Color.red()) 
  let now = Date.now()   
  // Smaller last update
  const smallUpdated = leftContainerStack.addText('Updated: ' + formatDate(new Date(now)))
  smallUpdated.font = Font.caption2()
  smallUpdated.textColor = Color.gray()
  // **************************************
  //refresh widget automatically
  let nextRefresh = now + 1000
  w.refreshAfterDate = new Date(nextRefresh)
  showGradientBackground(w)
  return w
}
function showGradientBackground(widget) {
  let gradient = new LinearGradient()
  gradient.colors = [new Color('#0a0a0a'), new Color('#141414'), new Color('#1f1f1f')]
  gradient.locations = [0,0.8,1]
  widget.backgroundGradient = gradient
}

async function getBSCPrice(pair) {
  let ticker = {};
  let requestUrl = settings.TICKER_API_URL + '/' + pair;
  try {
    let request = new Request(requestUrl)
    request.method = 'get';
    ticker = await request.loadJSON()
  } catch (e) {
    console.log(e)
  }
  return ticker;
}

async function getKline(pair) {
  let kline = {};
  let requestUrl = settings.KLINE_API_URL.replace('{0}', pair);
  try {
    let request = new Request(requestUrl)
    request.method = 'get';
    kline = await request.loadJSON()
  } catch (e) {
    console.log(e)
  }
  return kline;
}

async function getBSCWallet(contract, walletAddress) {
  let requestUrl = settings.BSCSCAN_API_URL
    .replace('{0}', contract)
    .replace('{1}', walletAddress)
    .replace('{2}', settings.BSCSCAN_API_KEY);
  let walletBalance = 0;
  try {
    let request = new Request(requestUrl)
    request.method = "get";
    let response = await request.loadJSON()
    walletBalance = parseFloat(response['result']) * settings.PRICE_FACTOR
  } catch (e) {
       console.log(e)
  }
  return walletBalance
}

async function getBalance() {
  let walletBalance = await getBSCWallet(settings.CONTRACT_ADDRESS, settings.WALLET_ADDRESS)
  let ticker = await getBSCPrice(settings.CURRENCY_PAIR)
  let balance = {
      balance: (walletBalance * ticker['last']).toFixed(2),
      last: ticker['last'],
      walletBalance: walletBalance,
      percentChange: ticker['percentChange']
    }
  return balance
}

function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

function formatDate(date) {
  const dF = new DateFormatter()
  dF.dateFormat = 'MM/dd/yy h:mm:ss a'
  return dF.string(date)
}

async function getChartUrl(percentChange) {
  let kline = await getKline(settings.CURRENCY_PAIR);
  let x = [];
  let y = [];
  let baseline = [];
  let min = 0
  let max = 0;
  for (var i=0; i<kline.data.length; i++) {
    var p = kline.data[i];
    var d = new Date(parseInt(p[0])).toLocaleDateString("en-US");
    var t = new Date(parseInt(p[0])).toLocaleTimeString("en-US");
    x.push(d+' '+t);
    y.push(parseFloat(p[5]));
    baseline.push(parseFloat(kline.data[0][5]));
  }
  min = Math.min(...y)
  max = Math.max(...y)
  let chartObj = {
    "type": "line",
    "data":
    {
      "labels": x,
      "datasets": [
        {
          "borderColor": percentChange > 0 ? 'green' : 'red',
          "data": y,
          "fill": 0
        },
        {
          backgroundColor: 'transparent',
          "borderWidth": 3,
          "borderDash": [1, 10],
          "borderColor": "lightgray",
          "data": baseline
        }
      ]
    },
    "options":
    {
      "responsive": 1,
      "title":
      {
        "display": 0
      },
      "legend":
      {
          "display": 0
      },
      "elements":
      {
        "point":
        {
          "radius": 0
        }
      },
      "scales":
      {
        "xAxes": [
        {
        "scaleLabel": {
          "display": 0,
        },
        "gridLines": {
          "display": 0
        },
        "ticks":
          {
            "display": 0
          }
        }],
        "yAxes": [
        {
          "display": 0,
          "ticks":
          {          
            "min": min,
            "max": max
          }
        }]
      }
    }
  }
  let chartUrl = settings.CHART_API_URL + JSON.stringify(chartObj)
  return chartUrl
}
