import { Controller, Get } from '@nestjs/common';

@Controller('test')
export class TestController {
  @Get()
  getTestMessage(): string {
    return 'This is a test endpoint!';
  }
}
