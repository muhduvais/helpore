
export interface IConfigService {
  getZegoAppId(): number;
  getZegoAppSign(): string;
}

export class ConfigService implements IConfigService {
  private _zegoAppId: number;
  private _zegoAppSign: string;

  constructor() {
    this._zegoAppId = parseInt(import.meta.env.VITE_ZEGO_APP_ID || '0');
    this._zegoAppSign = import.meta.env.VITE_ZEGO_APP_SIGN || '';
  }

  getZegoAppId(): number {
    return this._zegoAppId;
  }

  getZegoAppSign(): string {
    return this._zegoAppSign;
  }
}