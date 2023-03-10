import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '<img src = https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSE25s7zOhAJ0JBsHZuHqqTRD18EPz04q_ylg&usqp=CAU>';
  }
}
