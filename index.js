const r = require('request-promise-native')
const cheerio = require('cheerio')
const Chance = require('chance')
const chance = new Chance()
const Discord = require('discord.js');
const fs = require('fs');
const unparsed = fs.readFileSync('./profile.json')
const profile = JSON.parse(unparsed)
console.log(profile);

class Gen {
    constructor(profile) {
        this.profile = profile
    }

    async start() {
        await this.getFormkey()
        await this.createAccount()
        await this.sendWebhook()
    }

    async getFormkey() {
        try {
            const resp = await r.get('https://www.consortium.co.uk/customer/account/create/', {simple: false})
            const $ = cheerio.load(resp)
            this.formKey = $('input[name="form_key"]').val()
        } catch (error) {
            console.log(error)
            await this.getFormkey()
        }
    }

    async createAccount() {
        this.fullname = chance.name().split(' ')
        try {
            const options = {
                simple: false,
                form: {
                    success_url: '',
                    error_url: '',
                    form_key: this.formKey,
                    firstname: this.fullname[0],
                    lastname: this.fullname[1],
                    email: `${this.fullname[0]}.${this.fullname[1]}@${this.profile.catchall}`,
                    password: this.profile.password,
                    confirmation: this.profile.password,
                }
            }
    
            await r.post('https://www.consortium.co.uk/customer/account/createpost/', options)
        } catch (error) {
            console.log(error)
            await this.createAccount()
        }
    }

    async sendWebhook() {
        const embed = new Discord.MessageEmbed()
            .setTitle('Successfully Generated Consortium Account')
            .addField('Name', `${this.fullname[0]} ${this.fullname[1]}`, true)
            .addField('Email', `${this.fullname[0]}.${this.fullname[1]}@${this.profile.catchall}`, true)
            .addField('Password', `||${this.profile.password}||`, true)
            .addField('Formatted', `||${this.fullname[0]}.${this.fullname[1]}@${this.profile.catchall}:${this.profile.password}||`)
            .setColor('#52ff00')
        webhook.send({
            embeds: [embed]
        })
    }
}

const webhook = new Discord.WebhookClient(profile.webhookUrl.split('/')[5], profile.webhookUrl.split('/')[6])

let gens = []

for (let i = 0; i < profile.amount; i++) {
    gens.push(new Gen(profile))
}

async function check() {
    await Promise.all(gens.map(async gen => {
        await gen.start()
        Promise.resolve()
    }))
}

check()