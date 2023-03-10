import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { config } from 'dotenv';
config();

export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor() {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/kakao/redirect',
      scope: ['account_email', 'profile_nickname', 'profile_image'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    // console.log('accessToken' + accessToken);
    // console.log('refreshToken' + refreshToken);
    // console.log('프로필', profile);
    // console.log(profile._json.kakao_account.email);
    return {
      name: profile.displayName,
      email: profile._json.kakao_account.email,
      profile_image: profile._json,
    };
  }
}
