
export interface IConfigService {
  getZegoAppId(): number;
  getZegoAppSign(): string;
}

export class ConfigService implements IConfigService {
  private zegoAppId: number;
  private zegoAppSign: string;

  constructor() {
    this.zegoAppId = parseInt(import.meta.env.VITE_ZEGO_APP_ID || '0');
    this.zegoAppSign = import.meta.env.VITE_ZEGO_APP_SIGN || '';
  }

  getZegoAppId(): number {
    return this.zegoAppId;
  }

  getZegoAppSign(): string {
    return this.zegoAppSign;
  }
}