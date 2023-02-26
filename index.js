const TelegramBot = require('node-telegram-bot-api');
const Contract = require('./Contract.js');
require('dotenv').config();

const TOKEN = process.env.BOT_TOKEN;

const bot = new TelegramBot(TOKEN, { polling: true });

let contract = null;
let contractMessageHandler = null;
let intervalId = null;

bot.setMyCommands([
    { command: '/start', description: "Привітання" },
    { command: '/create', description: "Створення контракту" },
    { command: '/enable_mailing', description: "Розсилка поточного прибутку" },
    { command: '/disanable_mailing', description: "Зупинити розсилку" },
    { command: '/print', description: "Надрукувати контракт" },
    { command: '/clear', description: "Очистити контракт" },
]);

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, `Hello ${msg.from.first_name}!`);
});

bot.onText(/\/create/, (msg) => {
    try {
        if (contract != null) {
            contract = null;
        }
        bot.removeListener('message', contractMessageHandler);

        const chatId = msg.chat.id;
        bot.sendMessage(chatId, `Enter the data, for example: 
        BTC USDT 00:00 23000 24000 30 5 long 1000`);

        contractMessageHandler = (msg) => {
            const chatId = msg.chat.id;
            let input = msg.text.split(' ');

            if (input.length === 9) {
                try {
                    const [currency1, currency2, startTime, inPrice, outPrice, sum, shoulder, longOrShort, frequency] = input;
                    contract = new Contract(currency1, currency2, startTime, inPrice, outPrice, sum, shoulder, longOrShort, frequency);
                    bot.sendMessage(chatId, contract.getFromUserInfo());
                } catch (error) {
                    console.log(error.message);
                }
            }
        }
        bot.on('message', contractMessageHandler);
    } catch (error) {
        console.log(error.message);
    }
});

bot.onText(/\/enable_mailing/, (msg) => {
    try {
        if (contract != null) {
            const dateCreate = new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
            intervalId = setInterval(async () => {
                if (contract != null) {
                    const currency1 = contract.couple.currency1;
                    const currency2 = contract.couple.currency2;
                    const exchange = "binance";
                    const realPrice = await contract.calculateRealPrice(currency1, currency2, exchange);
                    contract.price.realPrice = realPrice;

                    contract.calculateTime(dateCreate);

                    contract.calculateRealProfit();

                    bot.sendMessage(msg.chat.id, contract.getCurrentInfo());
                } else {
                    bot.sendMessage(msg.chat.id, 'Data has been cleared! Click on /disanable_mailing');
                }
            }, contract.frequency);
        } else {
            bot.sendMessage(msg.chat.id, 'Create a contract!')
        }
    } catch (error) {
        console.log(error.message);
    }
});

bot.onText(/\/disanable_mailing/, (msg) => {
    try {
        clearInterval(intervalId);
        bot.sendMessage(msg.chat.id, 'The mailing has been stopped.');
    } catch (error) {
        console.log(error.message);
    }
});

bot.onText(/\/clear/, (msg) => {
    try {
        contract = null;
        bot.removeListener('message', contractMessageHandler);
        bot.sendMessage(msg.chat.id, "Cleared.");
    } catch (error) {
        cpnsole.log(error.message);
    }
});

bot.onText(/\/print/, (msg) => {
    try {
        if (contract == null) {
            bot.sendMessage(msg.chat.id, "Contract is empty!");
        } else {
            bot.sendMessage(msg.chat.id, contract.getFromUserInfo());
        }
    } catch (error) {
        console.log(error.message);
    }
});