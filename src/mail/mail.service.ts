import { MailerService } from '@nestjs-modules/mailer';
import { HttpService, Injectable } from '@nestjs/common';
import { first } from 'rxjs/operators'
import { RealTProperty, SwapCatData } from '../data.model';

@Injectable()
export class MailService {

    mailingList: string[] = [];
    constructor(private mailerService: MailerService, private httpService: HttpService) {
        this.updateEmails();
        setInterval(() => {
            this.updateEmails();
        }, 60 * 60 * 1000);
    }

    public async sendAlert(property: RealTProperty, swapCatData: SwapCatData, url: string) {
        try {
            const text = this.initText(swapCatData.ratio);
            const price = `${swapCatData.price} in ${swapCatData.buyerToken}`;
            const fullNameRealTParsed = property.fullName.toLocaleLowerCase().replace(/,/g, '').replace(/\s/g, '-');
            const urlRealT = `https://realt.co/product/${fullNameRealTParsed}/`;
            let signRatio = '';
            if (swapCatData.ratio > 0)
                signRatio = '+'
            const subject = `Nouveau Bien en vente - ${fullNameRealTParsed} | ${signRatio}${swapCatData.ratio.toFixed(2)}%`;
            console.log(subject);
            const result = await this.mailerService.sendMail({
                from: '"RealT Marketplace Alert" <realt-marketplace-alert@outlook.fr>', // override default from
                to: process.env.email,
                bcc: this.mailingList,
                subject: subject,
                template: `./alert`,
                context: {
                    realtProperty: property.shortName,
                    price: price,
                    textRatio: text,
                    initialPrice: property.tokenPrice,
                    urlSwapCat: url,
                    urlRealT: urlRealT,
                    quantity: swapCatData.availableBalance
                }
            });
            if (result) {
                console.log('email sended');
            }
        } catch (e) {
            console.log(e);
        }
    }

    initText(ratio: number): string {
        let typeRatio = '';
        if (ratio > 0) {
            typeRatio = ' augmenté de ' + ratio.toFixed(2) + '% ';
        } if (ratio < 0) {
            typeRatio = ' diminué de ' + ratio.toFixed(2) + '% ';
        } if (ratio === 0) {
            typeRatio = ' similaire ';
        }
        const textRatio = 'Prix' + typeRatio + 'par rapport au prix initial.';
        return textRatio;
    }

    async updateEmails() {
        const url = process.env.JSON_EMAIL_LIST_URL;
        try {
            console.log('new fetch updateEmails');
            this.httpService.get<any>(url).
                pipe(first())
                .subscribe(
                    (mailListObject: any) => {
                        if (mailListObject) {
                            this.mailingList = mailListObject.data.mail;
                            if (this.mailingList?.length)
                                console.log('last e-mail, update', this.mailingList[this.mailingList.length - 1]);
                        }
                    },
                    (error) => {
                        console.log('update mail subscription error', error);
                    }
                );
        } catch (e) {
            console.log('update mails catch', e);
        }
    }

}
