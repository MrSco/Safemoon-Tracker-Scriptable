let widgetParams = (args.widgetParameter || '').split('|')
const settings = {
  BSCSCAN_API_KEY: widgetParams[0] || 'C524VST55HHQZN4A614DZB515D8P1PW86X', // WAP default bscscan account api key
  WALLET_ADDRESS: widgetParams[1] || '0x8c128dba2cb66399341aa877315be1054be75da8', // top safemoon holder default wallet address
  CONTRACT_ADDRESS: widgetParams[2] || '0x8076c74c5e3f5852037f31ff0093eeb8c8add8d3', // SAFEMOON default contract address
  TOKEN_DECIMALS: widgetParams[3] || 9, //SAFEMOON default decimals
  BSCSCAN_API_URL: 'https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress={0}&address={1}&tag=latest&apikey={2}',
  BSCSCAN_URL: 'https://bscscan.com/token/',
  CHART_API_URL: 'https://quickchart.io/chart?',
  CHART_URL: 'https://poocoin.app/tokens/',
  DEFAULT_TOKEN_IMG: 'https://raw.githubusercontent.com/MrSco/Safemoon-Tracker-Scriptable/main/bsc-logo.png',
  COIN_GECKO_API_URL: 'https://api.coingecko.com/api/v3/coins/binance-smart-chain/contract/{0}',
  CHART_WIDTH: 300,
  CHART_HEIGHT: 50,
};
const decimalFactor = "0.".padEnd(settings.TOKEN_DECIMALS, 0) + "01";

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
  let balance = tokenInfo.balance
  let walletBalance = tokenInfo.walletBalance
  let price = tokenInfo.last
  let percentChange = tokenInfo.percentChange
  //console.log(tokenInfo)
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
  //let largerFont = Font.title1()
  const largeNameStack = leftContainerStack.addStack()
  //const largeName = largeNameStack.addText(tokenInfo.tokenName)
  //largeName.font = largerFont
  //largeName.textColor = new Color('#ffffff')
  // CHART IMAGE
  //largeNameStack.addSpacer(50)
  const chartUrl = encodeURI(await GetCoinGeckoChartURL(percentChange));
  //console.log(chartUrl);
  const chartImgReq = new Request(chartUrl)
  const chartImage = largeNameStack.addImage(await chartImgReq.loadImage())
  chartImage.imageSize = new Size(settings.CHART_WIDTH, settings.CHART_HEIGHT-15)
  chartImage.url = settings.CHART_URL + settings.CONTRACT_ADDRESS

  // TOKEN IMAGE
  const tokenImgUrl = tokenInfo.tokenImgUrl ? tokenInfo.tokenImgUrl : settings.DEFAULT_TOKEN_IMG
  const imgReq = new Request(tokenInfo.tokenImgUrl)
  const tokenImg = await imgReq.loadImage()
  const headerImageStack = rightContainerStack.addStack()
  let tokenImage = headerImageStack.addImage(tokenImg)
  tokenImage.imageSize = new Size(40, 40)
  tokenImage.url = tokenInfo.homepage
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
  const smallPercent = smallPriceStack.addText((changeIsUp ? ' ▲' : ' ▼') + ' (' + percentChange + '%) 24hr')
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

async function getBSCPrice() {
  let ticker = {};
  let coinGeckoApiUrl = settings.COIN_GECKO_API_URL.replace('{0}', settings.CONTRACT_ADDRESS);
  let requestUrl = coinGeckoApiUrl;
  try {
    let request = new Request(requestUrl)
    request.method = 'get';
    ticker = await request.loadJSON()
    //console.log(ticker);
  } catch (e) {
    console.log(e)
  }
  return ticker;
}

async function getKline() {
  let kline = {};
  let coinGeckoApiUrl = settings.COIN_GECKO_API_URL.replace('{0}', settings.CONTRACT_ADDRESS);
  let to = parseInt(Date.now()/1000)
  let from = to-(3600*1) // 1 hour ago
  let requestUrl = `${coinGeckoApiUrl}/market_chart/range?vs_currency=usd&from=${from}&to=${to}`
  try {
    let request = new Request(requestUrl)
    request.method = 'get';
    kline = await request.loadJSON()
    //console.log(kline);
  } catch (e) {
    console.log(e)
  }
  return kline;
}

async function getBSCWallet(contract, walletAddress) {
  let wallet = {}
  let requestUrl = settings.BSCSCAN_API_URL
    .replace('{0}', contract)
    .replace('{1}', walletAddress)
    .replace('{2}', settings.BSCSCAN_API_KEY);
  try {
    let request = new Request(requestUrl)
    request.method = "get";
    wallet = await request.loadJSON()
    //console.log(wallet)
  } catch (e) {
       console.log(e)
  }
  return wallet
}

async function getBalance() {
  let wallet = await getBSCWallet(settings.CONTRACT_ADDRESS, settings.WALLET_ADDRESS)  
  let ticker = await getBSCPrice()
  let currentPrice = parseFloat(ticker?.market_data?.current_price.usd || 0)
  let tokenBalance = (wallet?.result || 0)
  let walletBalance = (tokenBalance*decimalFactor).toFixed(2)
  let balance = {
      tokenName: ticker.name,
      balance: (walletBalance * currentPrice).toFixed(2),
      last: currentPrice.toFixed(numberOfDecimals(currentPrice)),
      tokenImgUrl: ticker?.image?.small,
      walletBalance: walletBalance,
      homepage: ticker?.links?.homepage[0] || ticker?.links?.homepage[1] || ticker?.links?.homepage[2] || '',
      percentChange: (ticker?.market_data?.price_change_percentage_24h || 0).toFixed(2)
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


async function GetCoinGeckoChartURL(percentChange) {
  let kline = await getKline();
  let data = kline.prices
  let x = [];
  let y = [];
  let baseline = [];
  let min = 0
  let max = 0;
  for (var i=0; i<data.length; i++) {
    var p = data[i];
    var d = new Date(parseInt(p[0])).toLocaleDateString("en-US");
    var t = new Date(parseInt(p[0])).toLocaleTimeString("en-US");
    x.push(d+' '+t);
    y.push(parseFloat(p[1]));
    baseline.push(parseFloat(data[0][1]));
  }
  min = Math.min(...y)
  max = Math.max(...y)

  let chartJson = {
      "type": "line",
      "data":
      {
      "labels": "",
      "datasets": [
          {
          "borderColor": "",
          "data": "",
          "fill": 0
          },
          {
          "backgroundColor": "transparent",
          "borderWidth": 3,
          "borderDash": [1, 10],
          "borderColor": "lightgray",
          "data": ""
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
          "display": 0
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
              "min": "",
              "max": ""
          }
          }]
      }
      }
  };
  chartJson.data.labels = x
  chartJson.data.datasets[0].borderColor = percentChange > 0 ? 'green' : 'red'
  chartJson.data.datasets[0].data = y
  chartJson.data.datasets[1].data = baseline
  chartJson.options.scales.yAxes[0].ticks.min = min
  chartJson.options.scales.yAxes[0].ticks.max = max
  let chartUrl = settings.CHART_API_URL + `w=${settings.CHART_WIDTH}&h=${settings.CHART_HEIGHT}&c=` + JSON.stringify(chartJson)
  return chartUrl
}

function numberOfDecimals(num) {
  let d = 10;
  if (num > .001)
    d = 6
  if (num > .1)
    d = 3
  if (num > 1)
    d = 2
  return d
};
