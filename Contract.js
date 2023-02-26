require('dotenv').config();
class Contract {
	constructor(currency1, currency2, startTime, inPrice, outPrice, sum, shoulder, longOrShort, frequency) {
		this.couple = {
			currency1: currency1.trim().toUpperCase(),
			currency2: currency2.trim().toUpperCase()
		};
		this.time = {
			startTime: startTime,
			passedTime: ''
		};
		this.price = {
			inPrice: inPrice,
			outPrice: outPrice,
			realPrice: 0
		};
		this.rate = {
			sum: sum,
			shoulder: shoulder,
			longOrShort: longOrShort.trim().toLowerCase()
		};
		this.profit = {
			userCurrency: 0,
			userPercentage: 0,
			realPercentage: 0,
			realCurrency: 0
		};
		this.frequency = frequency;
		this.calculateUserProfit();
	}

	getFromUserInfo() {
		return (
`#${this.couple.currency1}|${this.couple.currency2}
⌚️ Creation time: ${this.time.startTime} ${new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
📥 Admission price: ${this.price.inPrice} | 📤Expected price: ${this.price.outPrice}
💰 Rate: ${this.rate.sum} USDT | x${this.rate.shoulder} | ${this.rate.longOrShort}
🎯 Expected Profit: ${this.profit.userPercentage.toFixed(2)} % ≈ ${this.profit.userCurrency.toFixed(2)} ${this.couple.currency2}`);
	}

	getCurrentInfo() {
		return (
`⏳ Time has passed: ${this.time.passedTime}
📊 Сurrent price: ${this.price.realPrice}
💵 Current Profit: ${this.profit.realPercentage.toFixed(2)} % ≈ ${this.profit.realCurrency.toFixed(2)} ${this.couple.currency2}
#${this.couple.currency1}`);
	}

	calculateUserProfit() {
		if (this.rate.longOrShort == "long") {
			this.profit.userPercentage = ((this.price.outPrice - this.price.inPrice) * 100 / this.price.inPrice) * this.rate.shoulder;
			this.profit.userCurrency = (((this.price.outPrice - this.price.inPrice) * 100 / this.price.inPrice) * this.rate.shoulder) / 100 * parseInt(this.rate.sum);
		} else {
			this.profit.userPercentage = ((this.price.inPrice - this.price.outPrice) * 100 / this.price.inPrice) * this.rate.shoulder;
			this.profit.userCurrency = (((this.price.inPrice - this.price.outPrice) * 100 / this.price.inPrice) * this.rate.shoulder) / 100 * parseInt(this.rate.sum);
		}
	}

	calculateRealProfit() {
		if (this.rate.longOrShort == "long") {
			this.profit.realPercentage = ((this.price.realPrice - this.price.inPrice) * 100 / this.price.inPrice) * this.rate.shoulder;
			this.profit.realCurrency = (((this.price.realPrice - this.price.inPrice) * 100 / this.price.inPrice) * this.rate.shoulder) / 100 * parseInt(this.rate.sum);
		} else {
			this.profit.realPercentage = ((this.price.inPrice - this.price.realPrice) * 100 / this.price.inPrice) * this.rate.shoulder;
			this.profit.realCurrency = (((this.price.inPrice - this.price.realPrice) * 100 / this.price.inPrice) * this.rate.shoulder) / 100 * parseInt(this.rate.sum);
		}
	}

	calculateTime(dateCreate) {
		const now = new Date();

		const startTime = new Date(`${dateCreate} ${this.time.startTime}`);
		const diff = (now - startTime);

		const diffDays = Math.floor(diff / 1000 / 60 / 60 / 24);
		const diffHours = Math.floor((diff / 1000 / 60 / 60) % 24);
		const diffMinutes = Math.floor((diff / 1000 / 60) % 60);

		if (diffHours < 1) {
			this.time.passedTime = `${diffMinutes}m`;
		} else if (diffDays < 1) {
			this.time.passedTime = `${diffHours}h ${diffMinutes}m`;
		} else {
			this.time.passedTime = `${diffDays}d ${diffHours}h ${diffMinutes}m`;
		}
	}

	calculateRealPrice = async (currency1, currency2, exchange) =>{
		const myInit = {
			headers: {
				authorization: "Apikey " + process.env.CRYPTO_TOKEN
			},
		};

		const response = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${currency1}&tsyms=${currency2}&e=${exchange}`, myInit);
		const json = await response.json();
		return json[currency2];
	}
}

module.exports = Contract;
