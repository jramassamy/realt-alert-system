import { Controller, Get, HttpService } from '@nestjs/common';
import { RealTProperty, SwapCatData } from './data.model';
import { MailService } from './mail/mail.service';
import { RealtService } from './realt/realt.service';
const Web3 = require("web3");

@Controller()
export class AppController {

  swapCatContract: any;
  swapCatLastId: number = 1194;
  currentProperty: RealTProperty = null;
  showCheck = false;
  i = 0;
  counterLog = 0;
  constructor(private mailService: MailService, private realtService: RealtService) {
    this.initSwapCatWorker();
  }

  initSwapCatWorker() {
    const provider = process.env.CUSTOM_PROVIDER;
    const web3 = new Web3(new Web3.providers.HttpProvider(provider));
    const abi = require("../abi.json");
    const swapCatAddress = "0xB18713Ac02Fc2090c0447e539524a5c76f327a3b";
    this.swapCatContract = new web3.eth.Contract(abi, swapCatAddress);
    console.log('\nstart checkSwapCatLatestOffer\n');
    setInterval(() => {
      this.checkSwapCatLatestOffer();
    }, 60 * 1000);
  }

  checkSwapCatLatestOffer() {
    try {
      this.swapCatContract.methods.getoffercount().call(
        (err, count) => {
          if (err) {
            console.log('error checkSwapCatLatestOffer', err);
            return;
          }
          else {
            console.log('***current count', count, ' - check number -', ++this.i, '***');
            if (count !== this.swapCatLastId) { // if different than previous fetch
              this.retrieveOffer(+count);  // transform to number for strict check
            } else {
              // console.log('***no new offer available, id', this.swapCatLastId, '***\n');
            }
          }
        }
      );
      return;
    }
    catch (e) {
      console.log('***last offer is finished, id', this.swapCatLastId, '***\n');
    }
  }

  retrieveOffer(count: number) {
    this.swapCatLastId = count;
    this.swapCatContract.methods.showoffer(count).call(
      (err, offerRawData) => {
        if (err) {
          console.log('error retrieveOffer', err);
          return;
        } else {
          let swapCatData = this.parseRealT_Token(offerRawData);
          if (swapCatData) {
            const conditionsChecked = this.checkConditionsBeforeEmail(swapCatData);
            if (conditionsChecked) {
              this.sendEmail(swapCatData);
            }
          }
        }
      });
  }

  parseRealT_Token(offerRawData): SwapCatData {
    let swapCatData = new SwapCatData(offerRawData);
    let verifiedToken = this.checkOfferedTokenValidity(swapCatData.offerToken);
    if (verifiedToken) {
      console.log('\ncurrent Property for sale', this.currentProperty.shortName, 'price in USDC', this.currentProperty.tokenPrice, '\n');
      return swapCatData;
    }
    return null;
  }

  checkOfferedTokenValidity(offerToken: string) {
    for (const property of this.realtService.realtProperties) {
      if (property.ethereumContract === offerToken) { // offerToken xDai address === ethereumContract Address of RealT property (same on xDai)
        this.currentProperty = property;
        return true;
      }
    }
    return false;
  }


  checkConditionsBeforeEmail(swapCatData: SwapCatData) {
    swapCatData.setRatio(this.currentProperty.tokenPrice); // calculate % ratio before check
    if (swapCatData.ratio <= 3 && swapCatData.availableBalance >= 1) { // price on swapcat === 3% or less
      return true;
    }
    return false;
  }

  sendEmail(swapCatData: SwapCatData) {
    const url = `https://swap.cat/offer.htm?o=${this.swapCatLastId}&c=100`;
    this.mailService.sendAlert(this.currentProperty, swapCatData, url);
  }

}
