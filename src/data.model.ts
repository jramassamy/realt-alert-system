export interface RealTProperty {
  fullName: string;
  shortName: string;
  symbol: string;
  tokenPrice: number;
  currency: string;
  ethereumContract: string;
  xDaiContract: string;
}

export class SwapCatData {
  offerToken: string;
  buyerToken: string;
  price: number;
  availableBalance: number;
  ratio: number;
  constructor(result) {
    this.buyerToken = this.convertBuyerToken(result[1]);
    if (this.buyerToken === 'USDC')
      this.price = result[3] / 1000000;
    if (this.buyerToken === 'WXDAI')
      this.price = result[3] / 1000000000000000000;
    this.availableBalance = result[4] / 1000000000000000000;
    this.offerToken = result[0];
  }

  setRatio(realT_tokenPrice: number) {
    this.ratio = ((+this.price - realT_tokenPrice) / realT_tokenPrice) * 100;
  }

  convertBuyerToken(buyerToken: string) {
    if (buyerToken === '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83')
      buyerToken = 'USDC';
    if (buyerToken === '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d')
      buyerToken = 'WXDAI';
    return buyerToken;
  }
}